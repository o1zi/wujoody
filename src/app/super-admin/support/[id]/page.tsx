import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import SupportThread from "@/components/support/SupportThread";
import SupportComposer from "@/components/support/SupportComposer";
import { replySupport } from "../../actions";

type Params = Promise<{ id: string }>;

export default async function SuperAdminSupportThread({ params }: { params: Params }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: office } = await admin.from("offices").select("id, name, slug").eq("id", id).maybeSingle();
  if (!office) notFound();

  // Mark the office's messages as read by support.
  await admin
    .from("support_messages")
    .update({ read: true })
    .eq("office_id", office.id)
    .eq("sender", "office")
    .eq("read", false);

  const { data: messages } = await admin
    .from("support_messages")
    .select("id, sender, body, created_at")
    .eq("office_id", office.id)
    .order("created_at", { ascending: true })
    .limit(500);

  const reply = replySupport.bind(null, office.id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/super-admin/support" className="text-sm text-accent hover:underline">← كل المحادثات</Link>
      <h1 className="mt-1 text-xl font-bold">
        الدعم: {office.name} <span className="mono text-xs text-muted" dir="ltr">/{office.slug}</span>
      </h1>

      <div className="mt-5 glass-panel rounded-2xl p-5">
        <SupportThread messages={messages ?? []} me="admin" />
        <SupportComposer action={reply} placeholder="اكتب ردّك للمكتب…" />
      </div>
    </div>
  );
}
