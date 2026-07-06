import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GLTF_MAGIC = 0x46546c67; // "glTF"
const CHUNK_TYPE_JSON = 0x4e4f534a; // "JSON"
const CHUNK_TYPE_BIN = 0x004e4942; // "BIN\0"
const AR_MODELS_BUCKET = "ar-models";

type GlbJson = {
  accessors?: Array<{ min?: number[]; max?: number[] }>;
  meshes?: Array<{ primitives?: Array<{ attributes?: { POSITION?: number } }> }>;
  nodes?: Array<{ name?: string; scale?: number[]; children?: number[] }>;
  scenes?: Array<{ nodes?: number[] }>;
  scene?: number;
};

function parseGlb(bytes: Uint8Array): { json: GlbJson; bin: Uint8Array | null } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.byteLength < 12 || view.getUint32(0, true) !== GLTF_MAGIC) {
    throw new Error("Not a valid GLB file");
  }
  const totalLength = view.getUint32(8, true);
  let offset = 12;
  let json: GlbJson | null = null;
  let bin: Uint8Array | null = null;
  while (offset + 8 <= totalLength) {
    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    const chunkStart = offset + 8;
    const chunkData = bytes.subarray(chunkStart, chunkStart + chunkLength);
    if (chunkType === CHUNK_TYPE_JSON) {
      json = JSON.parse(new TextDecoder("utf-8").decode(chunkData)) as GlbJson;
    } else if (chunkType === CHUNK_TYPE_BIN) {
      bin = chunkData;
    }
    offset = chunkStart + chunkLength;
  }
  if (!json) throw new Error("GLB file has no JSON chunk");
  return { json, bin };
}

function buildGlb(json: GlbJson, bin: Uint8Array | null): Uint8Array {
  const jsonRaw = new TextEncoder().encode(JSON.stringify(json));
  const jsonPad = (4 - (jsonRaw.length % 4)) % 4;
  const jsonBytes = new Uint8Array(jsonRaw.length + jsonPad);
  jsonBytes.set(jsonRaw);
  jsonBytes.fill(0x20, jsonRaw.length);

  const binRaw = bin ?? new Uint8Array(0);
  const binPad = bin ? (4 - (binRaw.length % 4)) % 4 : 0;
  const binBytes = new Uint8Array(binRaw.length + binPad);
  binBytes.set(binRaw);

  const totalLength = 12 + 8 + jsonBytes.length + (bin ? 8 + binBytes.length : 0);
  const out = new Uint8Array(totalLength);
  const view = new DataView(out.buffer);

  view.setUint32(0, GLTF_MAGIC, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, totalLength, true);

  let offset = 12;
  view.setUint32(offset, jsonBytes.length, true);
  view.setUint32(offset + 4, CHUNK_TYPE_JSON, true);
  out.set(jsonBytes, offset + 8);
  offset += 8 + jsonBytes.length;

  if (bin) {
    view.setUint32(offset, binBytes.length, true);
    view.setUint32(offset + 4, CHUNK_TYPE_BIN, true);
    out.set(binBytes, offset + 8);
  }

  return out;
}

/** Combined bounding box across every POSITION accessor referenced by any mesh primitive. */
function computeFootprintMeters(json: GlbJson): number {
  const accessors = json.accessors ?? [];
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  let found = false;

  for (const mesh of json.meshes ?? []) {
    for (const prim of mesh.primitives ?? []) {
      const posIdx = prim.attributes?.POSITION;
      if (posIdx == null) continue;
      const acc = accessors[posIdx];
      if (!acc?.min || !acc?.max) continue;
      found = true;
      for (let i = 0; i < 3; i++) {
        min[i] = Math.min(min[i], acc.min[i]);
        max[i] = Math.max(max[i], acc.max[i]);
      }
    }
  }

  if (!found) throw new Error("GLB has no POSITION accessors with min/max bounds");
  // glTF is Y-up: X/Z form the horizontal footprint.
  return Math.max(max[0] - min[0], max[2] - min[2]);
}

/**
 * Reads the GLB's bounding box and wraps its scene root nodes in a new node
 * scaled so the model's horizontal footprint matches targetWidthCm. Exported
 * standalone (no I/O) so it can be unit tested without a live upload.
 */
export function normalizeGlbScale(
  bytes: Uint8Array,
  targetWidthCm: number,
): { bytes: Uint8Array; scaleFactor: number; footprintMeters: number } {
  const { json, bin } = parseGlb(bytes);
  const footprintMeters = computeFootprintMeters(json);
  if (!(footprintMeters > 0)) throw new Error("GLB bounding box has zero footprint");

  const scaleFactor = targetWidthCm / 100 / footprintMeters;

  const scenes = json.scenes ?? [];
  const scene = scenes[json.scene ?? 0];
  if (!scene?.nodes?.length) throw new Error("GLB has no scene root nodes");

  json.nodes = json.nodes ?? [];
  const wrapperIndex = json.nodes.length;
  json.nodes.push({
    name: "meraki-scale-normalize",
    scale: [scaleFactor, scaleFactor, scaleFactor],
    children: scene.nodes,
  });
  scene.nodes = [wrapperIndex];

  return { bytes: buildGlb(json, bin), scaleFactor, footprintMeters };
}

/**
 * Admin-only: normalize an uploaded GLB to a target real-world width and
 * store it in the ar-models bucket. Caller must hold the 'admin' role
 * (checked against user_roles under RLS, via the request-scoped client from
 * requireSupabaseAuth — never the service-role client).
 */
export const uploadNormalizedGlb = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { base64: string; fileName: string; targetWidthCm: number }) => d)
  .handler(async ({ data, context }) => {
    const { data: roleRow, error: roleError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("role", "admin")
      .maybeSingle();
    if (roleError) throw new Error(roleError.message);
    if (!roleRow) throw new Error("Unauthorized: admin role required");

    if (!data.fileName.toLowerCase().endsWith(".glb")) {
      throw new Error("Only .glb files are supported");
    }
    if (!(data.targetWidthCm > 0 && data.targetWidthCm <= 200)) {
      throw new Error("targetWidthCm must be between 0 and 200");
    }

    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    if (bytes.byteLength > 25 * 1024 * 1024) {
      throw new Error("GLB file too large (25MB limit)");
    }

    const {
      bytes: normalized,
      scaleFactor,
      footprintMeters,
    } = normalizeGlbScale(bytes, data.targetWidthCm);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const safeName = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `hero/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(AR_MODELS_BUCKET)
      .upload(path, normalized, { contentType: "model/gltf-binary", upsert: false });
    if (uploadError) throw new Error(uploadError.message);

    const { data: pub } = supabaseAdmin.storage.from(AR_MODELS_BUCKET).getPublicUrl(path);
    return { url: pub.publicUrl, scaleFactor, footprintMeters };
  });
