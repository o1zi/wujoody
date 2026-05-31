import { createClient } from "@/lib/supabase/server";
import { tenantUrl } from "@/lib/urls";

export const dynamic = "force-dynamic";

type Params = Promise<{ subdomain: string }>;

export async function GET(_req: Request, { params }: { params: Params }) {
  const { subdomain } = await params;
  const base = tenantUrl(subdomain);

  const supabase = await createClient();
  const { data: office } = await supabase.from("offices").select("status").eq("slug", subdomain.toLowerCase()).maybeSingle();
  const live = office?.status === "active";

  const body = live
    ? `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n`;

  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
