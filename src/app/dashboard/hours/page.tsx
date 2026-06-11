import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import HoursEditor, { type HourRow } from "./HoursEditor";

export default async function HoursPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!ctx.office) redirect("/dashboard");
  if (ctx.office.kind !== "clinic") redirect("/dashboard");

  const supabase = await createClient();
  const { data } = await supabase
    .from("clinic_hours")
    .select("weekday, is_open, start_min, end_min, slot_min")
    .eq("office_id", ctx.office.id);

  return <HoursEditor officeId={ctx.office.id} initial={(data as HourRow[]) ?? []} />;
}
