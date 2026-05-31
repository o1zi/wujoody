import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function SuperAdminSupport() {
  const admin = createAdminClient();
  const { data: msgs } = await admin
    .from("support_messages")
    .select("office_id, sender, body, read, created_at")
    .order("created_at", { ascending: false })
    .limit(2000);

  const { data: offices } = await admin.from("offices").select("id, name, slug");
  const officeName = new Map((offices ?? []).map((o) => [o.id, o.name as string]));

  // Group: latest message + unread (office-sent, read=false) count per office.
  const threads = new Map<string, { last: string; lastAt: string; unread: number }>();
  for (const m of msgs ?? []) {
    let t = threads.get(m.office_id);
    if (!t) {
      t = { last: m.body, lastAt: m.created_at, unread: 0 };
      threads.set(m.office_id, t);
    }
    if (m.sender === "office" && !m.read) t.unread += 1;
  }

  const list = [...threads.entries()].sort((a, b) => (a[1].lastAt < b[1].lastAt ? 1 : -1));

  return (
    <div>
      <h1 className="text-2xl font-bold">الدعم الفني</h1>
      <p className="mt-1 text-muted">محادثات الدعم مع المكاتب.</p>

      <div className="mt-6 flex flex-col gap-3">
        {list.length === 0 && (
          <div className="glass-panel rounded-2xl p-10 text-center text-muted">لا توجد رسائل دعم بعد.</div>
        )}
        {list.map(([officeId, t]) => (
          <Link
            key={officeId}
            href={`/super-admin/support/${officeId}`}
            className="glass-panel flex items-center justify-between gap-4 rounded-2xl p-4 hover:border-accent"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{officeName.get(officeId) || "مكتب"}</span>
                {t.unread > 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-[#0b0d10]">
                    {t.unread} جديدة
                  </span>
                )}
              </div>
              <div className="mt-1 truncate text-sm text-muted">{t.last}</div>
            </div>
            <div className="mono shrink-0 text-xs text-muted">{new Date(t.lastAt).toLocaleString("ar-SA")}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
