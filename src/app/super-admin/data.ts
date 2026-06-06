import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type OfficeRow = {
  id: string;
  name: string;
  slug: string;
  status: string; // active | pending | suspended
  createdAt: string;
  ownerEmail: string;
  ownerName: string;
  ownerPhone: string;
  plan: string | null;
  subStatus: string | null;
  startsAt: string | null;
  endsAt: string | null;
  amount: number | null;
  daysLeft: number | null;
  expired: boolean;
  expiringSoon: boolean; // active sub ending within 14 days
};

export type AdminData = {
  rows: OfficeRow[];
  metrics: {
    total: number;
    activeOffices: number;
    pending: number;
    suspended: number;
    activeSubs: number;
    arr: number; // annual recurring revenue (sum of active annual amounts)
    mrr: number; // arr / 12
    totalCollected: number; // lifetime sum of all subscription amounts
    expiringSoon: number;
    expired: number;
    newThisMonth: number;
  };
  planCounts: Record<string, number>; // active subs per plan code
};

export async function loadAdminData(): Promise<AdminData> {
  const admin = createAdminClient();
  const [{ data: offices }, { data: profiles }, { data: subs }] = await Promise.all([
    admin.from("offices").select("id, name, slug, status, owner_id, created_at").order("created_at", { ascending: false }),
    admin.from("profiles").select("id, email, full_name, phone"),
    admin
      .from("subscriptions")
      .select("office_id, plan, status, amount, currency, starts_at, ends_at, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const ownerById = new Map((profiles ?? []).map((p) => [p.id as string, p]));
  const latestSub = new Map<string, NonNullable<typeof subs>[number]>();
  (subs ?? []).forEach((s) => {
    if (s.office_id && !latestSub.has(s.office_id)) latestSub.set(s.office_id, s);
  });

  const now = Date.now();
  const rows: OfficeRow[] = (offices ?? []).map((o) => {
    const owner = ownerById.get(o.owner_id);
    const sub = latestSub.get(o.id);
    const endsAt = sub?.ends_at ?? null;
    const daysLeft = endsAt ? Math.ceil((new Date(endsAt).getTime() - now) / 86400000) : null;
    const expired = daysLeft !== null && daysLeft <= 0;
    const expiringSoon = sub?.status === "active" && daysLeft !== null && daysLeft > 0 && daysLeft <= 14;
    return {
      id: o.id,
      name: o.name,
      slug: o.slug,
      status: o.status,
      createdAt: o.created_at,
      ownerEmail: (owner?.email as string) ?? "",
      ownerName: (owner?.full_name as string) ?? "",
      ownerPhone: (owner?.phone as string) ?? "",
      plan: sub?.plan ?? null,
      subStatus: sub?.status ?? null,
      startsAt: sub?.starts_at ?? null,
      endsAt,
      amount: sub?.amount != null ? Number(sub.amount) : null,
      daysLeft,
      expired,
      expiringSoon,
    };
  });

  const activeSubRows = rows.filter((r) => r.subStatus === "active" && !r.expired);
  const arr = activeSubRows.reduce((s, r) => s + (r.amount || 0), 0);
  const totalCollected = (subs ?? []).reduce((s, x) => s + (x.amount != null ? Number(x.amount) : 0), 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const planCounts: Record<string, number> = {};
  for (const r of activeSubRows) if (r.plan) planCounts[r.plan] = (planCounts[r.plan] || 0) + 1;

  return {
    rows,
    metrics: {
      total: rows.length,
      activeOffices: rows.filter((r) => r.status === "active").length,
      pending: rows.filter((r) => r.status === "pending").length,
      suspended: rows.filter((r) => r.status === "suspended").length,
      activeSubs: activeSubRows.length,
      arr,
      mrr: Math.round(arr / 12),
      totalCollected,
      expiringSoon: rows.filter((r) => r.expiringSoon).length,
      expired: rows.filter((r) => r.expired).length,
      newThisMonth: rows.filter((r) => new Date(r.createdAt) >= startOfMonth).length,
    },
    planCounts,
  };
}
