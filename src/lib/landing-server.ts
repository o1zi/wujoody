import "server-only";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { mergeLanding, type LandingContent } from "@/lib/landing-content";

// Reads landing content from app_settings (key='landing'); falls back to defaults.
export const getLanding = cache(async (): Promise<LandingContent> => {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("app_settings").select("value").eq("key", "landing").maybeSingle();
    return mergeLanding(data?.value);
  } catch {
    return mergeLanding(null);
  }
});
