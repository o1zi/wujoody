import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { mergeContent } from "@/lib/site-content";
import Editor from "./Editor";

const APP_PROTO = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost").startsWith("https")
  ? "https"
  : "http";

export default async function SiteEditorPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!ctx.office) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface p-8 text-center">
        <h1 className="text-xl font-bold">لا يوجد مكتب مرتبط بحسابك</h1>
        <p className="mt-2 text-muted">تواصل مع الدعم لربط حسابك بمكتب.</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("site_content")
    .select("content")
    .eq("office_id", ctx.office.id)
    .maybeSingle();

  const content = mergeContent(row?.content);
  const siteUrl =
    ctx.office.status === "active"
      ? `${APP_PROTO}://${ctx.office.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
      : null;

  return <Editor officeId={ctx.office.id} initial={content} siteUrl={siteUrl} />;
}
