// Enable the interactive 3D (Revit/GLB) viewer on the live plans: Pro + Premium
// on, Basic off. Merges into existing caps so other flags are preserved.
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

const want = { basic: false, pro: true, premium: true };
const { data: plans } = await supabase.from("plans").select("code, caps");
for (const p of plans || []) {
  if (!(p.code in want)) continue;
  const caps = { ...(p.caps || {}), models3d: want[p.code] };
  const { error } = await supabase.from("plans").update({ caps, updated_at: new Date().toISOString() }).eq("code", p.code);
  console.log(p.code, error ? `FAILED: ${error.message}` : `models3d=${want[p.code]} ✓`);
}
