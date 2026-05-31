import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mergeContent, clampMedia } from "@/lib/site-content";
import { getPlanCaps } from "@/lib/plans-server";
import { tenantUrl } from "@/lib/urls";
import SiteView from "@/components/site/SiteView";
import NotLive from "@/components/site/NotLive";
import CinematicRuntime from "@/components/site/CinematicRuntime";

type Params = Promise<{ subdomain: string }>;

function extractCoords(s: string): string | null {
  let m = s.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return `${m[1]},${m[2]}`;
  m = s.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (m) return `${m[1]},${m[2]}`;
  m = s.match(/\/(?:search|place|dir)\/(-?\d+\.\d+),\+?\s*(-?\d+\.\d+)/);
  if (m) return `${m[1]},${m[2]}`;
  m = s.match(/[?&]q=(-?\d+\.\d+),\+?\s*(-?\d+\.\d+)/);
  if (m) return `${m[1]},${m[2]}`;
  m = s.match(/(-?\d{1,3}\.\d{4,}),\+(-?\d{1,3}\.\d{4,})/);
  if (m) return `${m[1]},${m[2]}`;
  return null;
}

// Turn whatever the office entered into something embeddable:
// coords stay as-is, a plain address stays as-is, and a Google Maps link
// (incl. short maps.app.goo.gl) is resolved to coordinates. Returns "" if not embeddable.
async function resolveMapQuery(q: string): Promise<string> {
  const v = (q || "").trim();
  if (!v) return "";
  if (/^-?\d{1,3}\.\d+\s*,\s*-?\d{1,3}\.\d+$/.test(v)) return v.replace(/\s+/g, "");
  if (/^https?:\/\//i.test(v)) {
    try {
      const res = await fetch(v, {
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 86400 },
      });
      // Coordinates live in the resolved URL (e.g. /maps/search/LAT,+LNG).
      return extractCoords(res.url) ?? "";
    } catch {
      return "";
    }
  }
  return v; // plain address / place name
}

async function loadOffice(slug: string) {
  const supabase = await createClient();
  const { data: office } = await supabase
    .from("offices")
    .select("id, name, slug, status")
    .eq("slug", slug.toLowerCase())
    .maybeSingle();
  if (!office) return null;

  const { data: row } = await supabase
    .from("site_content")
    .select("content")
    .eq("office_id", office.id)
    .maybeSingle();

  // Read the active plan (admin client — subscriptions aren't anon-readable) to
  // enforce background capabilities at render.
  const admin = createAdminClient();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("plan, status, ends_at")
    .eq("office_id", office.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Close the site the moment the subscription lapses (don't wait for the daily cron).
  const expired = !!sub?.ends_at && new Date(sub.ends_at).getTime() <= Date.now();
  const live = office.status === "active" && !expired;

  const caps = await getPlanCaps(sub?.plan);
  const content = clampMedia(mergeContent(row?.content), caps);
  content.contact.mapQuery = await resolveMapQuery(content.contact.mapQuery);
  return { office, content, live, expired };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { subdomain } = await params;
  const data = await loadOffice(subdomain);
  if (!data) return { title: "موقع غير موجود", robots: { index: false, follow: false } };

  const url = tenantUrl(data.office.slug);
  const title = `${data.content.brand.ar} · ${data.office.name}`;
  const description = data.content.hero.subtitle;
  const logo = data.content.brand.logo;
  const indexable = data.live;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    icons: logo ? { icon: logo, apple: logo } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: data.office.name,
      type: "website",
      locale: "ar_SA",
      images: logo ? [{ url: logo }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: logo ? [logo] : undefined,
    },
  };
}

export default async function TenantSite({ params }: { params: Params }) {
  const { subdomain } = await params;
  const data = await loadOffice(subdomain);

  if (!data) return <NotLive variant="missing" slug={subdomain} />;
  if (!data.live) {
    const variant = data.expired ? "expired" : data.office.status === "pending" ? "pending" : "suspended";
    return <NotLive variant={variant} slug={subdomain} name={data.office.name} />;
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/site-template/site.css" precedence="high" />
      <SiteView content={data.content} slug={data.office.slug} />
      <CinematicRuntime />
    </>
  );
}
