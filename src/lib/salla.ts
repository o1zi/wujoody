import "server-only";
import crypto from "crypto";

// Salla supports two webhook security strategies (Dashboard > Settings > Webhooks):
//  - "Signature": HMAC-SHA256 of the raw body, sent in the `x-salla-signature` header.
//  - "Token":     a static token sent in the `Authorization` header.
// We accept either, compared against SALLA_WEBHOOK_SECRET.
export function verifySallaWebhook(rawBody: string, headers: Headers): boolean {
  const secret = process.env.SALLA_WEBHOOK_SECRET;
  if (!secret || secret === "change-me") return false;

  const signature = headers.get("x-salla-signature");
  if (signature) {
    const digest = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
    } catch {
      return false;
    }
  }

  const auth = headers.get("authorization");
  if (auth) {
    const token = auth.replace(/^Bearer\s+/i, "").trim();
    try {
      return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(secret));
    } catch {
      return false;
    }
  }
  return false;
}

export type SallaEvent = {
  event?: string;
  merchant?: number | string;
  data?: Record<string, unknown> & {
    id?: number | string;
    status?: { slug?: string; name?: string } | string;
    payment?: { status?: string };
    items?: { product_id?: number | string; id?: number | string }[];
    metadata?: Record<string, unknown>;
  };
};

// Did this event represent a successful/paid order?
export function isPaidEvent(evt: SallaEvent): boolean {
  const e = (evt.event || "").toLowerCase();
  const data = evt.data || {};
  const statusSlug =
    typeof data.status === "string"
      ? data.status.toLowerCase()
      : (data.status?.slug || data.status?.name || "").toString().toLowerCase();
  const paymentStatus = (data.payment?.status || "").toString().toLowerCase();

  const paidWords = ["paid", "completed", "payment_pending_done", "delivered", "in_progress"];
  if (e.includes("payment") && (paymentStatus === "paid" || paymentStatus === "captured")) return true;
  if (paidWords.includes(statusSlug)) return true;
  if (paymentStatus === "paid") return true;
  return false;
}

// Extract the first product id from an order's line items.
export function extractProductId(evt: SallaEvent): string | null {
  const items = evt.data?.items;
  if (Array.isArray(items) && items.length > 0) {
    const pid = items[0].product_id ?? items[0].id;
    if (pid != null) return String(pid);
  }
  return null;
}
