"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { savePost, deletePost } from "./actions";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  cover: string | null;
  published: boolean;
  created_at: string;
};

const empty = { id: "", slug: "", title: "", excerpt: "", body: "", cover: null as string | null, published: false };
const input = "w-full rounded-lg glass-panel-2 px-3 py-2 text-sm outline-none focus:border-accent";

export default function BlogManager({ officeId, posts, siteUrl }: { officeId: string; posts: Post[]; siteUrl: string | null }) {
  const [editing, setEditing] = useState<typeof empty | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);

  function openNew() {
    setEditing({ ...empty });
    setMsg(null);
  }
  function openEdit(p: Post) {
    setEditing({ id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt || "", body: p.body || "", cover: p.cover, published: p.published });
    setMsg(null);
  }

  async function uploadCover(file: File) {
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const key = `${officeId}/blog/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("site-media").upload(key, file, { upsert: true });
    setUploading(false);
    if (error) {
      setMsg({ kind: "err", text: "تعذّر رفع الصورة." });
      return;
    }
    const { data } = supabase.storage.from("site-media").getPublicUrl(key);
    setEditing((e) => (e ? { ...e, cover: data.publicUrl } : e));
  }

  function save(publish: boolean) {
    if (!editing) return;
    start(async () => {
      const r = await savePost({ ...editing, published: publish });
      if (r.ok) {
        setMsg({ kind: "ok", text: "تم الحفظ." });
        setEditing(null);
      } else setMsg({ kind: "err", text: r.error || "تعذّر الحفظ." });
    });
  }
  function remove(id: string) {
    start(async () => {
      await deletePost(id);
    });
  }

  if (editing) {
    return (
      <div className="mt-6 rounded-2xl glass-panel p-6">
        <h2 className="text-lg font-semibold">{editing.id ? "تعديل مقال" : "مقال جديد"}</h2>
        {msg && <div className={`mt-3 rounded-lg px-3 py-2 text-sm ${msg.kind === "ok" ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>{msg.text}</div>}
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs text-muted">العنوان</span>
            <input className={input} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-muted">الرابط اللطيف (اختياري — يُولّد من العنوان)</span>
            <input className={input} dir="ltr" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="my-article" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-muted">مقتطف قصير</span>
            <textarea rows={2} className={input} value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-muted">المحتوى</span>
            <textarea rows={10} className={input} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
          </label>
          <div className="flex items-center gap-3">
            <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg glass-panel-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {editing.cover ? <img src={editing.cover} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <div className="flex-1">
              <span className="mb-1 block text-xs text-muted">صورة الغلاف</span>
              <input type="file" accept="image/*" disabled={uploading} className="block w-full text-xs text-muted file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-foreground" onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])} />
            </div>
            {editing.cover && <button type="button" className="text-xs text-red-400" onClick={() => setEditing({ ...editing, cover: null })}>إزالة</button>}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={() => save(true)} disabled={pending} className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-[#0b0d10] hover:bg-accent-soft disabled:opacity-60">{pending ? "…" : "نشر"}</button>
          <button onClick={() => save(false)} disabled={pending} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-2">حفظ كمسودة</button>
          <button onClick={() => setEditing(null)} className="rounded-lg border border-border px-4 py-2 text-sm text-muted">إلغاء</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <button onClick={openNew} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-[#0b0d10] hover:bg-accent-soft">+ مقال جديد</button>
        {siteUrl && <a href={`${siteUrl}/blog`} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">عرض المدوّنة ↗</a>}
      </div>
      {msg && <div className={`mt-3 rounded-lg px-3 py-2 text-sm ${msg.kind === "ok" ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>{msg.text}</div>}

      <div className="mt-5 space-y-3">
        {posts.length === 0 && <div className="rounded-2xl glass-panel p-10 text-center text-muted">لا توجد مقالات بعد. أنشئ أول مقال.</div>}
        {posts.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{p.title}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${p.published ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>{p.published ? "منشور" : "مسودة"}</span>
              </div>
              <div className="mono mt-1 text-xs text-muted" dir="ltr">/{p.slug}</div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => openEdit(p)} className="rounded-md border border-border px-3 py-1 text-xs hover:bg-surface-2">تعديل</button>
              <button onClick={() => remove(p.id)} disabled={pending} className="rounded-md border border-border px-3 py-1 text-xs text-red-400 hover:bg-surface-2">حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
