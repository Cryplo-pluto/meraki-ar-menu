import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Box, CheckCircle2, LogOut, Ruler, UploadCloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadNormalizedGlb } from "@/lib/glb-normalize.functions";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin — AR Model Uploads | Meraki Cafe" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

const MAX_GLB_BYTES = 25 * 1024 * 1024;

type ItemRow = {
  id: string;
  name: string;
  category: string;
  glb_url: string | null;
  size_class_id: string | null;
};

type SizeClassRow = {
  id: string;
  name: string;
  dimensions_label: string;
  width_cm: number | null;
  reference_glb_url: string;
};

type UploadResult = {
  url: string;
  scaleFactor: number;
  footprintMeters: number;
  targetName: string;
  targetWidthCm: number;
};

function AdminPage() {
  // undefined = still resolving; null = signed out.
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(undefined);
      return;
    }
    let cancelled = false;
    supabase
      .from("user_roles")
      .select("role")
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setIsAdmin(Boolean(data));
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  return (
    <div className="container-page py-16">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Meraki admin</p>
        <h1 className="mt-2 text-4xl md:text-5xl">AR model uploads</h1>
        <p className="mt-4 text-muted-foreground">
          Models are normalized to their real serving size at upload and locked to that size in AR —
          guests can't pinch-resize them, so what they place on the table is what arrives.
        </p>
      </header>

      <div className="mx-auto mt-12 max-w-2xl">
        {session === undefined ? (
          <p className="text-center text-sm text-muted-foreground">Checking session…</p>
        ) : !session ? (
          <SignInForm />
        ) : isAdmin === undefined ? (
          <p className="text-center text-sm text-muted-foreground">Checking permissions…</p>
        ) : !isAdmin ? (
          <NotAdmin email={session.user.email ?? ""} />
        ) : (
          <UploadPanel />
        )}
      </div>
    </div>
  );
}

function SignInForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
    if (signInError) {
      setStatus("error");
      setError(signInError.message);
    }
    // On success the auth listener re-renders the page — nothing to do here.
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-border bg-card p-6 warm-shadow"
    >
      <h2 className="text-xl">Staff sign in</h2>
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
        />
      </div>
      {status === "error" && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="min-h-11 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-60"
      >
        {status === "sending" ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

function NotAdmin({ email }: { email: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center warm-shadow">
      <p className="text-sm text-muted-foreground">
        Signed in as <span className="font-medium text-foreground">{email}</span>, but this account
        doesn't have the admin role. Ask the site owner to grant it in Supabase (user_roles table).
      </p>
      <button
        type="button"
        onClick={() => void supabase.auth.signOut()}
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-muted"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Sign out
      </button>
    </div>
  );
}

function UploadPanel() {
  const [items, setItems] = useState<ItemRow[]>([]);
  const [sizeClasses, setSizeClasses] = useState<SizeClassRow[]>([]);
  const [loadError, setLoadError] = useState("");

  // Target: "item:<id>" or "class:<id>".
  const [target, setTarget] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0); // reset the file input after upload
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<UploadResult | null>(null);

  const refresh = useCallback(async () => {
    const [itemsRes, classesRes] = await Promise.all([
      supabase
        .from("menu_items")
        .select("id,name,category,glb_url,size_class_id")
        .order("category")
        .order("sort_order"),
      supabase
        .from("size_classes")
        .select("id,name,dimensions_label,width_cm,reference_glb_url")
        .order("name"),
    ]);
    if (itemsRes.error || classesRes.error) {
      setLoadError((itemsRes.error ?? classesRes.error)!.message);
      return;
    }
    setItems(itemsRes.data ?? []);
    setSizeClasses(classesRes.data ?? []);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const [kind, targetId] = target ? (target.split(":") as ["item" | "class", string]) : ["", ""];
  const targetItem = kind === "item" ? items.find((i) => i.id === targetId) : undefined;
  const targetClass =
    kind === "class"
      ? sizeClasses.find((c) => c.id === targetId)
      : sizeClasses.find((c) => c.id === targetItem?.size_class_id);

  function onTargetChange(value: string) {
    setTarget(value);
    setResult(null);
    setError("");
    // Prefill the real-world width from the size class so the normalizer
    // has an accurate target without retyping it each time.
    const [k, id] = value.split(":") as ["item" | "class", string];
    const cls =
      k === "class"
        ? sizeClasses.find((c) => c.id === id)
        : sizeClasses.find((c) => c.id === items.find((i) => i.id === id)?.size_class_id);
    setWidthCm(cls?.width_cm != null ? String(cls.width_cm) : "");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file || !kind || !targetId) return;
    const width = Number(widthCm);
    if (!(width > 0 && width <= 200)) {
      setError("Width must be between 1 and 200 cm.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".glb")) {
      setError("Only .glb files are supported (export as GLB from Meshy/Tripo/Polycam).");
      return;
    }
    if (file.size > MAX_GLB_BYTES) {
      setError("File is over the 25MB limit — re-export with lower texture resolution.");
      return;
    }

    setBusy(true);
    setError("");
    setResult(null);
    try {
      const base64 = await fileToBase64(file);
      const uploaded = await uploadNormalizedGlb({
        data: { base64, fileName: file.name, targetWidthCm: width },
      });

      const update =
        kind === "item"
          ? await supabase.from("menu_items").update({ glb_url: uploaded.url }).eq("id", targetId)
          : await supabase
              .from("size_classes")
              .update({ reference_glb_url: uploaded.url })
              .eq("id", targetId);
      if (update.error) throw new Error(update.error.message);

      setResult({
        ...uploaded,
        targetName: kind === "item" ? (targetItem?.name ?? "") : (targetClass?.name ?? ""),
        targetWidthCm: width,
      });
      setFile(null);
      setFileKey((k) => k + 1);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-border bg-card p-6 warm-shadow"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Upload a dish model</h2>
          <button
            type="button"
            onClick={() => void supabase.auth.signOut()}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>

        {loadError && <p className="text-sm text-destructive">{loadError}</p>}

        <div>
          <label htmlFor="target" className="block text-sm font-medium">
            Attach to
          </label>
          <select
            id="target"
            required
            value={target}
            onChange={(e) => onTargetChange(e.target.value)}
            className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="" disabled>
              Choose a menu item or size class…
            </option>
            <optgroup label="Menu items (model for one specific dish)">
              {items.map((i) => (
                <option key={i.id} value={`item:${i.id}`}>
                  {i.name} — {i.category}
                  {i.glb_url ? " (has own model)" : ""}
                </option>
              ))}
            </optgroup>
            <optgroup label="Size classes (fallback model for every dish of this size)">
              {sizeClasses.map((c) => (
                <option key={c.id} value={`class:${c.id}`}>
                  {c.name} — {c.dimensions_label}
                </option>
              ))}
            </optgroup>
          </select>
          {targetItem && targetClass && !targetItem.glb_url && (
            <p className="mt-1 text-xs text-muted-foreground">
              Currently inherits the "{targetClass.name}" size-class model.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="glb" className="block text-sm font-medium">
            GLB file
          </label>
          <input
            key={fileKey}
            id="glb"
            type="file"
            accept=".glb,model/gltf-binary"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2 file:mr-3 file:rounded-full file:border-0 file:bg-muted file:px-4 file:py-1.5 file:text-sm file:font-semibold"
          />
        </div>

        <div>
          <label htmlFor="width" className="inline-flex items-center gap-1.5 text-sm font-medium">
            <Ruler className="h-4 w-4 text-accent" aria-hidden="true" />
            Real width of the served dish (cm)
          </label>
          <input
            id="width"
            type="number"
            required
            min={1}
            max={200}
            step="0.5"
            value={widthCm}
            onChange={(e) => setWidthCm(e.target.value)}
            className="mt-1 w-full min-h-11 rounded-md border border-input bg-background px-3 py-2"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Measure the widest side of the real plate/glass. The model is rescaled to exactly this
            width, and AR shows it at that size no matter which table it's placed on.
          </p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={busy || !target || !file}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-60"
        >
          <UploadCloud className="h-4 w-4" aria-hidden="true" />
          {busy ? "Normalizing & uploading…" : "Upload at true size"}
        </button>
      </form>

      {result && (
        <div className="rounded-2xl border border-border bg-card p-6 warm-shadow">
          <p className="inline-flex items-center gap-2 font-semibold text-foreground">
            <CheckCircle2 className="h-5 w-5 text-accent" aria-hidden="true" />
            Model live for {result.targetName}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Source model measured {(result.footprintMeters * 100).toFixed(1)}cm across and was
            scaled ×{result.scaleFactor.toFixed(3)} to {result.targetWidthCm}cm. Open the dish on
            your phone and tap "View in AR" to check it on a real table.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <Box className="h-4 w-4 text-accent" aria-hidden="true" />
          Model status
        </p>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-4">
              <span>
                {i.name} <span className="text-xs">({i.category})</span>
              </span>
              <span className={i.glb_url ? "text-accent" : ""}>
                {i.glb_url
                  ? "own model"
                  : (sizeClasses.find((c) => c.id === i.size_class_id)?.name ?? "no model")}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          Leave USDZ alone: iPhones convert the normalized GLB on-device, which keeps iOS and
          Android at the identical true size.
        </p>
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.slice(dataUrl.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}
