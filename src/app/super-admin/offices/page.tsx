import { getPlans } from "@/lib/plans-server";
import { loadAdminData } from "../data";
import OfficesTable from "./OfficesTable";

export default async function OfficesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const sp = await searchParams;
  const [data, plans] = await Promise.all([loadAdminData(), getPlans()]);
  const planNames = Object.fromEntries(plans.map((p) => [p.code, p.name]));

  return (
    <div>
      <h1 className="text-2xl font-bold">المكاتب</h1>
      <p className="mt-1 text-sm text-muted">
        {data.rows.length} مكتب · {data.metrics.activeOffices} مُفعّل · {data.metrics.pending} بانتظار التفعيل
      </p>
      <div className="mt-6">
        <OfficesTable rows={data.rows} planNames={planNames} initialTab={sp.tab || "all"} />
      </div>
    </div>
  );
}
