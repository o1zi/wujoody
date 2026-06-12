import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppointmentsBoard, { type Appointment } from "./AppointmentsBoard";

export default async function AppointmentsPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!ctx.office) redirect("/dashboard");
  if (!["clinic", "law"].includes(ctx.office.kind)) redirect("/dashboard");

  const supabase = await createClient();
  // Show recent + all upcoming (last 14 days onward), soonest first.
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - 14);
  const since = sinceDate.toISOString();
  const { data } = await supabase
    .from("appointments")
    .select("id, patient_name, patient_phone, service_name, starts_at, duration_min, status, note")
    .eq("office_id", ctx.office.id)
    .gte("starts_at", since)
    .order("starts_at", { ascending: true })
    .limit(300);

  return <AppointmentsBoard officeId={ctx.office.id} initial={(data as Appointment[]) ?? []} kind={ctx.office.kind} />;
}
