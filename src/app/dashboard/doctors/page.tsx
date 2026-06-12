import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import DoctorsManager, { type ClinicDoctor } from "./DoctorsManager";

export default async function DoctorsPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!ctx.office) redirect("/dashboard");
  if (!["clinic", "law"].includes(ctx.office.kind)) redirect("/dashboard");

  const supabase = await createClient();
  const { data } = await supabase
    .from("clinic_doctors")
    .select("id, name, specialty, image, active, sort")
    .eq("office_id", ctx.office.id)
    .order("sort");

  return <DoctorsManager officeId={ctx.office.id} initial={(data as ClinicDoctor[]) ?? []} kind={ctx.office.kind} />;
}
