import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Target, Gem } from "lucide-react";
import { getSiteSettings, type SiteSettings } from "@/lib/site-settings.functions";
import { Marquee } from "@/components/Marquee";

// Real Meraki product photo (packaging shot from their own Cloudinary
// account) — used next to "Products & Services", same source as the
// cake photos on /cakes.
const PRODUCTS_IMAGE =
  "https://res.cloudinary.com/davidharven/image/upload/v1735821004/IMG_9477_8abb01d59c.jpg";

export const Route = createFileRoute("/about")({
  component: About,
  loader: async (): Promise<{ settings: SiteSettings }> => ({ settings: await getSiteSettings() }),
  head: () => ({
    meta: [
      { title: "About Us — Meraki Cafe Lusaka" },
      {
        name: "description",
        content:
          "Meraki is a wholly Zambian brand founded in 2014 by Chomba Mwansa, now three restaurants, a confectionery business and a food-processing factory in Lusaka.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  errorComponent: ({ error }) => (
    <p className="container-page py-24">Could not load: {error.message}</p>
  ),
  notFoundComponent: () => <p className="container-page py-24">Not found.</p>,
});

const FALLBACK_STORY =
  "Meraki is a wholly Zambian brand that is creating a love mark with local consumers. The business was founded in 2014 by Chomba Mwansa, a former banker who dared to pursue her passion for food by starting a small business out of her home kitchen.\n\nThe brand has since blossomed into three upmarket restaurants, a pioneering confectionery business and a food processing factory from which a wide range of convenience foods are distributed to major supermarkets countrywide.\n\nThese include over 20 various packaged products that range from dry ready to bake cake pre-mixes, frozen desserts and pastries. The business is now venturing into other lines of fresh food value addition and possibly exports. The business currently employs 94 staff, all based in Lusaka, Zambia.\n\nSome of the things that stand out in our business strategy include re-investing in our core competencies, packaging, location, customer diversification and visibility of our ideals. Our aim is to keep our customers happy by delivering simple, fresh and delicious at every interaction.";
const FALLBACK_VISION =
  "To become the best loved food products and services provider in Zambia and the region. From very humble beginnings, we envision to become a great local success story.";
const FALLBACK_MISSION =
  "To create happiness through the creation of food products and services where every stage of the customer's experience is packed with quality and excellence.";
const FALLBACK_VALUES =
  "Innovation, Excellence, Quality, Growth, and Caring for each other and our community.";
const FALLBACK_PRODUCTS_SERVICES =
  "We offer a wide range of handcrafted quality cakes and pastries. Our services include catering for events, takeaway, and dine-in options.";

function About() {
  const { settings } = Route.useLoaderData() as { settings: SiteSettings };
  // story_md already has a row in the live DB with the old "since 2008" copy
  // (pre-dating the corrective migration), so the usual settings-first
  // fallback would keep showing stale text. Use the verified real copy
  // directly until that migration is applied.
  const story = FALLBACK_STORY;
  const vision = settings.vision.trim() || FALLBACK_VISION;
  const mission = settings.mission.trim() || FALLBACK_MISSION;
  const values = settings.values.trim() || FALLBACK_VALUES;
  const productsServices = settings.products_services_md.trim() || FALLBACK_PRODUCTS_SERVICES;

  const pillars = [
    { icon: Eye, title: "Our Vision", body: vision },
    { icon: Target, title: "Our Mission", body: mission },
    { icon: Gem, title: "Core Values", body: `We believe in ${values}` },
  ];

  return (
    <>
      <div className="container-page py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl text-primary md:text-4xl">Our Story</h2>
          {story.split(/\n\n+/).map((p, i) => (
            <p key={i} className="mt-6 whitespace-pre-line leading-relaxed text-foreground/90">
              {p}
            </p>
          ))}
        </div>
      </div>

      <Marquee variant="solid" />

      <div className="container-page py-16">
        <div className="mx-auto max-w-3xl divide-y divide-border">
          {pillars.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-6 py-8 first:pt-0 last:pb-0">
              <Icon
                className="h-10 w-10 shrink-0 text-primary"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <div>
                <h2 className="text-2xl text-primary">{title}</h2>
                <p className="mt-3 leading-relaxed text-foreground/90">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-page py-16">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-card warm-shadow">
          <div className="grid gap-8 p-8 sm:grid-cols-[auto_1fr] sm:items-center sm:p-10">
            <img
              src={PRODUCTS_IMAGE}
              alt=""
              className="mx-auto h-32 w-32 rounded-2xl object-cover sm:mx-0"
            />
            <div className="text-center sm:text-left">
              <h2 className="text-2xl text-primary">Products &amp; Services</h2>
              <p className="mt-3 leading-relaxed text-foreground/90">{productsServices}</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-3xl text-center">
          <Link
            to="/menu"
            className="min-h-11 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110"
          >
            See the menu
          </Link>
        </div>
      </div>
    </>
  );
}
