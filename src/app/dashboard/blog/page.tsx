import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getPlanCaps } from "@/lib/plans-server";
import { tenantUrl } from "@/lib/urls";
import BlogManager from "./BlogManager";

export default async function BlogDashboard() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!ctx.office) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl glass-panel p-8 text-center">
        <h1 className="text-xl font-bold">لا يوجد مكتب مرتبط بحسابك</h1>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("office_id", ctx.office.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const caps = await getPlanCaps(sub?.plan);

  let posts: BlogRow[] = [];
  if (caps.blog) {
    const { data } = await supabase
      .from("posts")
      .select("id, slug, title, excerpt, body, cover, published, created_at")
      .eq("office_id", ctx.office.id)
      .order("created_at", { ascending: false });
    posts = (data ?? []) as BlogRow[];
  }
  const siteUrl = ctx.office.status === "active" ? tenantUrl(ctx.office.slug) : null;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">المدوّنة</h1>
      <p className="mt-1 text-muted">انشر مقالات وأخباراً تجلب لك زيارات من جوجل.</p>

      {!caps.blog ? (
        <div className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 text-sm text-amber-200">
          المدوّنة متاحة في الباقة الاحترافية وبريميوم. رقِّ باقتك لتفعيلها.
        </div>
      ) : (
        <BlogManager officeId={ctx.office.id} posts={posts} siteUrl={siteUrl} />
      )}
    </div>
  );
}

type BlogRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  cover: string | null;
  published: boolean;
  created_at: string;
};
