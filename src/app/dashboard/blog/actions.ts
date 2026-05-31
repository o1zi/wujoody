"use server";

import { revalidatePath } from "next/cache";
import { getSessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getPlanCaps } from "@/lib/plans-server";

function slugify(raw: string): string {
  return (raw || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

type PostInput = {
  id?: string;
  slug?: string;
  title: string;
  excerpt?: string;
  body?: string;
  cover?: string | null;
  published: boolean;
};

async function assertBlogOffice() {
  const ctx = await getSessionContext();
  if (!ctx?.office) throw new Error("no office");
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
  if (!caps.blog) throw new Error("blog not in plan");
  return { officeId: ctx.office.id, supabase };
}

export async function savePost(input: PostInput): Promise<{ ok: boolean; error?: string }> {
  const { officeId, supabase } = await assertBlogOffice();
  const title = (input.title || "").trim().slice(0, 200);
  if (!title) return { ok: false, error: "أدخل عنوان المقال." };
  const slug = slugify(input.slug || title);
  if (!slug) return { ok: false, error: "تعذّر توليد رابط لطيف. أدخل عنواناً صالحاً." };

  const row = {
    office_id: officeId,
    slug,
    title,
    excerpt: (input.excerpt || "").trim().slice(0, 300) || null,
    body: (input.body || "").trim().slice(0, 20000) || null,
    cover: input.cover || null,
    published: !!input.published,
    published_at: input.published ? new Date().toISOString() : null,
  };

  let error;
  if (input.id) {
    ({ error } = await supabase.from("posts").update(row).eq("id", input.id).eq("office_id", officeId));
  } else {
    ({ error } = await supabase.from("posts").insert(row));
  }
  if (error) {
    if (error.code === "23505") return { ok: false, error: "يوجد مقال بنفس الرابط (slug). غيّره." };
    return { ok: false, error: error.message };
  }
  revalidatePath("/dashboard/blog");
  return { ok: true };
}

export async function deletePost(id: string): Promise<{ ok: boolean }> {
  const { officeId, supabase } = await assertBlogOffice();
  await supabase.from("posts").delete().eq("id", id).eq("office_id", officeId);
  revalidatePath("/dashboard/blog");
  return { ok: true };
}
