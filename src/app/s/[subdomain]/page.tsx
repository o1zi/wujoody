import type { Metadata } from "next";
import Script from "next/script";
import { createClient } from "@/lib/supabase/server";
import { mergeContent } from "@/lib/site-content";
import { tenantUrl } from "@/lib/urls";
import SiteView from "@/components/site/SiteView";
import NotLive from "@/components/site/NotLive";

type Params = Promise<{ subdomain: string }>;

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

  return { office, content: mergeContent(row?.content) };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { subdomain } = await params;
  const data = await loadOffice(subdomain);
  if (!data) return { title: "موقع غير موجود", robots: { index: false, follow: false } };

  const url = tenantUrl(data.office.slug);
  const title = `${data.content.brand.ar} · ${data.office.name}`;
  const description = data.content.hero.subtitle;
  const logo = data.content.brand.logo;
  const indexable = data.office.status === "active";

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
  if (data.office.status !== "active") {
    return <NotLive variant={data.office.status} slug={subdomain} name={data.office.name} />;
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/site-template/site.css" />
      <SiteView content={data.content} slug={data.office.slug} />
      <Script src="/site-template/scroll-engine.js" strategy="afterInteractive" />
    </>
  );
}
