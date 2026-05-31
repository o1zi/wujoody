import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";
import { emailLayout } from "@/lib/email";

type Admin = ReturnType<typeof createAdminClient>;

const NETWORKS: { type: string; label: string; emoji: string }[] = [
  { type: "click_whatsapp", label: "واتساب", emoji: "🟢" },
  { type: "click_tiktok", label: "تيك توك", emoji: "🎵" },
  { type: "click_snapchat", label: "سناب شات", emoji: "👻" },
  { type: "click_instagram", label: "إنستقرام", emoji: "📸" },
  { type: "click_linkedin", label: "لينكدإن", emoji: "💼" },
];

// Builds the 30-day performance report for an office, formatted for both
// Telegram (plain) and email (HTML). Includes a greeting, thanks, totals, and a
// per-button click breakdown.
export async function buildOfficeReport(
  admin: Admin,
  officeId: string,
  officeName: string,
  ownerName?: string,
): Promise<{ subject: string; telegramText: string; emailHtml: string }> {
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const countType = async (type: string): Promise<number> => {
    const { count } = await admin
      .from("site_events")
      .select("id", { count: "exact", head: true })
      .eq("office_id", officeId)
      .eq("type", type)
      .gte("created_at", since);
    return count ?? 0;
  };

  const [views, leads] = await Promise.all([
    countType("view"),
    admin
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("office_id", officeId)
      .gte("created_at", since)
      .then((r: { count: number | null }) => r.count ?? 0),
  ]);

  const clickCounts = await Promise.all(NETWORKS.map((n) => countType(n.type)));
  const totalClicks = clickCounts.reduce((a, b) => a + b, 0);
  const active = NETWORKS.map((n, i) => ({ ...n, c: clickCounts[i] })).filter((n) => n.c > 0);

  const hi = ownerName ? `مرحباً ${ownerName} 👋` : "مرحباً 👋";

  // ----- Telegram (plain text) -----
  const tgLines = [
    hi,
    "شكراً لاستخدامك منصة رِواق 🙏",
    "",
    `📊 تقرير مكتبك الشهري — ${officeName}`,
    "ملخص آخر 30 يوماً:",
    "",
    `👁️ الزيارات: ${views}`,
    `✉️ الرسائل والحجوزات: ${leads}`,
    `🔗 إجمالي نقرات التواصل: ${totalClicks}`,
  ];
  if (active.length) {
    tgLines.push("", "تفصيل النقرات:");
    for (const n of active) tgLines.push(`   ${n.emoji} ${n.label}: ${n.c}`);
  } else {
    tgLines.push("", "لا نقرات تواصل بعد — جرّب إبراز أزرار التواصل في موقعك.");
  }
  tgLines.push("", "نتمنّى لك المزيد من العملاء! 💪");
  const telegramText = tgLines.join("\n");

  // ----- Email (HTML) -----
  const breakdown = active.length
    ? `<br/><br/><b>تفصيل النقرات:</b>` + active.map((n) => `<br/>${n.emoji} ${n.label}: ${n.c}`).join("")
    : `<br/><br/>لا نقرات تواصل بعد — جرّب إبراز أزرار التواصل في موقعك.`;
  const emailHtml = emailLayout(
    "تقرير الأداء الشهري",
    `${hi}<br/>شكراً لاستخدامك منصة رِواق 🙏<br/><br/>` +
      `إليك ملخص آخر 30 يوماً لموقع «${officeName}»:` +
      `<br/><br/>👁️ <b>الزيارات:</b> ${views}` +
      `<br/>✉️ <b>الرسائل والحجوزات:</b> ${leads}` +
      `<br/>🔗 <b>إجمالي نقرات التواصل:</b> ${totalClicks}` +
      breakdown +
      `<br/><br/>نتمنّى لك المزيد من العملاء! راجع التفاصيل من لوحة التحكم.`,
  );

  return { subject: `تقرير مكتبك الشهري — ${officeName}`, telegramText, emailHtml };
}
