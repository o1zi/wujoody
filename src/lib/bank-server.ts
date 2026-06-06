import "server-only";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_PAYMENT, mergePayment, type PaymentSettings } from "@/lib/bank";

// Reads payment/bank settings from app_settings (key='payment'); falls back to
// env defaults. Cached per request via React cache().
export const getPaymentSettings = cache(async (): Promise<PaymentSettings> => {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("app_settings").select("value").eq("key", "payment").maybeSingle();
    return mergePayment(data?.value);
  } catch {
    return DEFAULT_PAYMENT;
  }
});
