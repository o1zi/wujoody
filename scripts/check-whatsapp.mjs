// Read the live WhatsApp numbers from app_settings (payment + landing).
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data, error } = await supabase.from("app_settings").select("key, value").in("key", ["payment", "landing"]);
if (error) { console.error("read failed:", error.message); process.exit(1); }
for (const row of data || []) {
  if (row.key === "payment") console.log("payment.whatsapp =", JSON.stringify(row.value?.whatsapp ?? null));
  if (row.key === "landing") console.log("landing.contact.whatsapp =", JSON.stringify(row.value?.contact?.whatsapp ?? null));
}
if (!data || data.length === 0) console.log("no payment/landing rows in app_settings (defaults in use).");
