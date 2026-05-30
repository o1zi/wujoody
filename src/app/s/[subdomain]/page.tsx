import type { Metadata } from "next";
import Script from "next/script";
import { createClient } from "@/lib/supabase/server";
import { mergeContent } from "@/lib/site-content";
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
  if (!data) return { title: "موقع غير موجود" };
  return {
    title: `${data.content.brand.ar} · ${data.office.name}`,
    description: data.content.hero.subtitle,
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
      <SiteView content={data.content} />
      <Script src="/site-template/scroll-engine.js" strategy="afterInteractive" />
    </>
  );
}
