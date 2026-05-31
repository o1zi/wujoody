import { NextResponse, type NextRequest } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanCaps } from "@/lib/plans-server";

export const runtime = "nodejs";

const MODEL = "claude-haiku-4-5-20251001";

export async function POST(request: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.office) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Gate by plan (Premium).
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
  if (!caps.aiContent) return NextResponse.json({ error: "feature not in plan" }, { status: 403 });

  // Enforce the monthly usage quota per office.
  const limit = caps.aiMonthlyLimit ?? 0;
  const period = new Date().toISOString().slice(0, 7); // YYYY-MM
  const adminDb = createAdminClient();
  const { data: usageRow } = await adminDb
    .from("ai_usage")
    .select("count")
    .eq("office_id", ctx.office.id)
    .eq("period", period)
    .maybeSingle();
  const used = usageRow?.count ?? 0;
  if (used >= limit) {
    return NextResponse.json(
      { error: "monthly limit reached", limit, remaining: 0 },
      { status: 429 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI not configured" }, { status: 503 });

  let body: { name?: string; specialty?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const name = (body.name || ctx.office.name || "مكتب هندسي").slice(0, 120);
  const specialty = (body.specialty || "استشارات هندسية متكاملة").slice(0, 200);

  const prompt =
    `اكتب محتوى تسويقياً عربياً احترافياً لموقع مكتب هندسي.\n` +
    `اسم المكتب: ${name}\nالتخصص/النشاط: ${specialty}\n\n` +
    `أعد JSON فقط (بدون أي نص خارج JSON) بهذا الشكل بالضبط:\n` +
    `{"aboutLead":"جملة افتتاحية قوية (سطر واحد)","aboutBody":"فقرة تعريفية 2-3 جمل","services":[{"title":"اسم خدمة","desc":"وصف موجز"}]}\n` +
    `اجعل services من 6 خدمات مناسبة للتخصص. النصوص عربية فصيحة وموجزة وبدون مبالغة.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return NextResponse.json({ error: "ai request failed" }, { status: 502 });
    const data = await res.json();
    const textOut: string = data?.content?.[0]?.text ?? "";
    const match = textOut.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "bad ai output" }, { status: 502 });
    const parsed = JSON.parse(match[0]);

    // Count this successful generation against the monthly quota.
    await adminDb
      .from("ai_usage")
      .upsert({ office_id: ctx.office.id, period, count: used + 1 }, { onConflict: "office_id,period" });

    return NextResponse.json({
      aboutLead: String(parsed.aboutLead || ""),
      aboutBody: String(parsed.aboutBody || ""),
      services: Array.isArray(parsed.services)
        ? parsed.services.slice(0, 9).map((s: { title?: string; desc?: string }) => ({ title: String(s.title || ""), desc: String(s.desc || "") }))
        : [],
      limit,
      remaining: Math.max(0, limit - (used + 1)),
    });
  } catch {
    return NextResponse.json({ error: "ai error" }, { status: 500 });
  }
}
