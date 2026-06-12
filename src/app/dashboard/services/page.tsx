import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ServicesManager, { type ClinicService } from "./ServicesManager";

export default async function ServicesPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!ctx.office) redirect("/dashboard");
  if (!["clinic", "law"].includes(ctx.office.kind)) redirect("/dashboard");

  const supabase = await createClient();
  const { data } = await supabase
    .from("clinic_services")
    .select("id, name, price, duration_min, active, sort")
    .eq("office_id", ctx.office.id)
    .order("sort");

  return <ServicesManager officeId={ctx.office.id} initial={(data as ClinicService[]) ?? []} kind={ctx.office.kind} />;
}
