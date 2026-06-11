import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mergeContent, clampMedia, clampTemplate, clampModels, type SiteContent } from "@/lib/site-content";
import { mergeClinicContent, type ClinicContent } from "@/lib/clinic-content";
import ClinicSiteView from "@/components/site/ClinicSiteView";
import type { BookingService, BookingDoctor } from "@/components/site/ClinicBookingForm";
import type { PlanCaps } from "@/lib/plans";
import { siteLiveState } from "@/lib/subscription";
import { googleFontsHref } from "@/lib/site-fonts";
import { getPlanCaps } from "@/lib/plans-server";
import { tenantUrl } from "@/lib/urls";
import SiteView from "@/components/site/SiteView";
import EditorialView from "@/components/site/EditorialView";
import LuxeView from "@/components/site/LuxeView";
import HeritageView from "@/components/site/HeritageView";
import KineticView from "@/components/site/KineticView";
import AuroraView from "@/components/site/AuroraView";
import BlueprintView from "@/components/site/BlueprintView";
import DecoView from "@/components/site/DecoView";
import ConcreteView from "@/components/site/ConcreteView";
import AtelierView from "@/components/site/AtelierView";
import NotLive from "@/components/site/NotLive";
import CinematicRuntime from "@/components/site/CinematicRuntime";
import EditorialRuntime from "@/components/site/EditorialRuntime";
import LuxeRuntime from "@/components/site/LuxeRuntime";
import HeritageRuntime from "@/components/site/HeritageRuntime";
import KineticRuntime from "@/components/site/KineticRuntime";
import AuroraRuntime from "@/components/site/AuroraRuntime";
import BlueprintRuntime from "@/components/site/BlueprintRuntime";
import DecoRuntime from "@/components/site/DecoRuntime";
import ConcreteRuntime from "@/components/site/ConcreteRuntime";
import AtelierRuntime from "@/components/site/AtelierRuntime";
import { resolveTemplate } from "@/lib/site-templates";

type Params = Promise<{ subdomain: string }>;

type OfficeRow = { id: string; name: string; slug: string; status: string; kind: string };
type LoadResult =
  | { view: "clinic"; office: OfficeRow; clinic: ClinicContent; services: BookingService[]; doctors: BookingDoctor[]; live: boolean; expired: boolean }
  | { view: "engineering"; office: OfficeRow; content: SiteContent; caps: PlanCaps; live: boolean; expired: boolean };

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

async function loadOffice(slug: string): Promise<LoadResult | null> {
  const supabase = await createClient();
  const { data: office } = await supabase
    .from("offices")
    .select("id, name, slug, status, kind")
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
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Close the site as soon as the subscription lapses — whether its status was
  // flipped to expired/cancelled, OR its term simply elapsed before the daily
  // cron ran. (An active office with no subscription row at all — e.g. a manual
  // comp activation — stays live.)
  const { live, expired } = siteLiveState(office.status, sub);

  // Clinics render a separate, self-contained view from their own content model;
  // plan-based media/template clamps don't apply.
  if (office.kind === "clinic") {
    const clinicContent = mergeClinicContent(row?.content);
    clinicContent.contact.mapQuery = await resolveMapQuery(clinicContent.contact.mapQuery);
    // Operational booking data (tolerant if the booking tables aren't created yet).
    const [{ data: svc }, { data: docs }] = await Promise.all([
      supabase.from("clinic_services").select("id, name").eq("office_id", office.id).eq("active", true).order("sort"),
      supabase.from("clinic_doctors").select("id, name").eq("office_id", office.id).eq("active", true).order("sort"),
    ]);
    const services: BookingService[] = (svc ?? []).map((s) => ({ id: s.id as string, name: s.name as string }));
    const doctors: BookingDoctor[] = (docs ?? []).map((d) => ({ id: d.id as string, name: d.name as string }));
    return { view: "clinic", office, clinic: clinicContent, services, doctors, live, expired };
  }

  const caps = await getPlanCaps(expired ? undefined : sub?.plan);
  const content = clampModels(clampTemplate(clampMedia(mergeContent(row?.content), caps), caps), caps);
  content.contact.mapQuery = await resolveMapQuery(content.contact.mapQuery);
  return { view: "engineering", office, content, live, expired, caps };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { subdomain } = await params;
  const data = await loadOffice(subdomain);
  if (!data) return { title: "موقع غير موجود", robots: { index: false, follow: false } };

  // brand/hero/seo are common to both the engineering and clinic content models.
  const presentation = data.view === "clinic" ? data.clinic : data.content;
  const url = tenantUrl(data.office.slug);
  const title = `${presentation.brand.ar} · ${data.office.name}`;
  const description = presentation.hero.subtitle;
  const logo = presentation.brand.logo;
  const indexable = data.live;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    verification: presentation.seo.googleVerification ? { google: presentation.seo.googleVerification } : undefined,
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

  // Clinic vertical: self-contained medical template.
  if (data.view === "clinic") {
    const clinic: ClinicContent = data.clinic;
    const fontLink = googleFontsHref([clinic.theme.font || "readex"]);
    return (
      <>
        <link rel="stylesheet" href={fontLink} precedence="high" />
        <ClinicSiteView content={clinic} slug={data.office.slug} services={data.services} doctors={data.doctors} />
      </>
    );
  }

  const template = resolveTemplate(data.content.theme.layout);
  const fontLink = googleFontsHref([data.content.theme.font || template.defaultFont]);
  return (
    <>
      <link rel="stylesheet" href={template.stylesheet} precedence="high" />
      <link rel="stylesheet" href={fontLink} precedence="high" />
      {template.id === "editorial" ? (
        <>
          <EditorialView content={data.content} slug={data.office.slug} caps={data.caps} />
          <EditorialRuntime />
        </>
      ) : template.id === "luxe" ? (
        <>
          <LuxeView content={data.content} slug={data.office.slug} caps={data.caps} />
          <LuxeRuntime />
        </>
      ) : template.id === "heritage" ? (
        <>
          <HeritageView content={data.content} slug={data.office.slug} caps={data.caps} />
          <HeritageRuntime />
        </>
      ) : template.id === "kinetic" ? (
        <>
          <KineticView content={data.content} slug={data.office.slug} caps={data.caps} />
          <KineticRuntime />
        </>
      ) : template.id === "aurora" ? (
        <>
          <AuroraView content={data.content} slug={data.office.slug} caps={data.caps} />
          <AuroraRuntime />
        </>
      ) : template.id === "blueprint" ? (
        <>
          <BlueprintView content={data.content} slug={data.office.slug} caps={data.caps} />
          <BlueprintRuntime />
        </>
      ) : template.id === "deco" ? (
        <>
          <DecoView content={data.content} slug={data.office.slug} caps={data.caps} />
          <DecoRuntime />
        </>
      ) : template.id === "concrete" ? (
        <>
          <ConcreteView content={data.content} slug={data.office.slug} caps={data.caps} />
          <ConcreteRuntime />
        </>
      ) : template.id === "atelier" ? (
        <>
          <AtelierView content={data.content} slug={data.office.slug} caps={data.caps} />
          <AtelierRuntime />
        </>
      ) : (
        <>
          <SiteView content={data.content} slug={data.office.slug} caps={data.caps} />
          <CinematicRuntime />
        </>
      )}
    </>
  );
}
