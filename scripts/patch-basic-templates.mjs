// One-off: restrict the live `basic` plan to the editorial template only.
// Merges "templates":["editorial"] into the existing caps JSON so other caps
// stay intact. Safe to re-run.
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

const { data: plan, error: readErr } = await supabase
  .from("plans")
  .select("code, caps")
  .eq("code", "basic")
  .maybeSingle();

if (readErr) {
  console.error("read failed:", readErr.message);
  process.exit(1);
}
if (!plan) {
  console.log("no basic plan row in DB (fallback plans are used) — nothing to patch.");
  process.exit(0);
}

const caps = { ...(plan.caps || {}), templates: ["editorial"] };
const { error: writeErr } = await supabase
  .from("plans")
  .update({ caps, updated_at: new Date().toISOString() })
  .eq("code", "basic");

if (writeErr) {
  console.error("update failed:", writeErr.message);
  process.exit(1);
}
console.log("basic plan caps updated:", JSON.stringify(caps));
