// Set the payment WhatsApp number in app_settings, merging into any existing
// payment row so bank fields are preserved. Mirrors the landing contact number.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const NUMBER = "966506808828";

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

const { data: existing } = await supabase.from("app_settings").select("value").eq("key", "payment").maybeSingle();
const value = { ...(existing?.value || {}), whatsapp: NUMBER };

const { error } = await supabase.from("app_settings").upsert({ key: "payment", value }, { onConflict: "key" });
if (error) { console.error("upsert failed:", error.message); process.exit(1); }
console.log("payment.whatsapp set to", NUMBER, "→", JSON.stringify(value));
