import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mergeContent, type SiteContent } from "@/lib/site-content";
import { getPlanCaps } from "@/lib/plans-server";

export type BlogContext = {
  office: { id: string; name: string; slug: string; status: string };
  content: SiteContent;
  live: boolean;
  blogEnabled: boolean;
};

export async function loadBlogContext(slug: string): Promise<BlogContext | null> {
  const supabase = await createClient();
  const { data: office } = await supabase
    .from("offices")
    .select("id, name, slug, status")
    .eq("slug", slug.toLowerCase())
    .maybeSingle();
  if (!office) return null;

  const admin = createAdminClient();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("plan, status, ends_at")
    .eq("office_id", office.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const expired = !!sub?.ends_at && new Date(sub.ends_at).getTime() <= Date.now();
  const caps = await getPlanCaps(sub?.plan);

  const { data: row } = await supabase.from("site_content").select("content").eq("office_id", office.id).maybeSingle();

  return {
    office,
    content: mergeContent(row?.content),
    live: office.status === "active" && !expired,
    blogEnabled: caps.blog,
  };
}

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  cover: string | null;
  published_at: string | null;
  created_at: string;
};

export async function getPublishedPosts(officeId: string): Promise<Post[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("id, slug, title, excerpt, body, cover, published_at, created_at")
    .eq("office_id", officeId)
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(60);
  return (data ?? []) as Post[];
}

export async function getPublishedPost(officeId: string, slug: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("id, slug, title, excerpt, body, cover, published_at, created_at")
    .eq("office_id", officeId)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return (data as Post) ?? null;
}
