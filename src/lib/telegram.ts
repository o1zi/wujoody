import "server-only";

export function telegramConfigured(): boolean {
  return !!process.env.TELEGRAM_BOT_TOKEN;
}

export function telegramBotUsername(): string {
  return process.env.TELEGRAM_BOT_USERNAME || "";
}

// Send a Telegram message via the platform bot. No-op (returns false) if the
// bot isn't configured or the chat isn't linked.
export async function sendTelegram(chatId: string | null | undefined, text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
