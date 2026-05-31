import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mergeContent } from "@/lib/site-content";
import { getPlanCaps } from "@/lib/plans-server";
import AutoPrint from "./AutoPrint";

export const runtime = "nodejs";

type Params = Promise<{ slug: string }>;
type Search = Promise<{ print?: string }>;

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300;400;500;600;700&display=swap');
body{background:#fff !important;color:#15171c !important;font-family:'Readex Pro',system-ui,sans-serif !important;line-height:1.7}
.pf-page{max-width:820px;margin:0 auto;padding:48px 56px}
.pf-head{display:flex;align-items:center;gap:18px;border-bottom:3px solid #C2974E;padding-bottom:22px;margin-bottom:28px}
.pf-head img{height:64px;width:64px;object-fit:contain;border-radius:10px}
.pf-head h1{font-size:30px;font-weight:700;margin:0}
.pf-head .en{font-size:12px;letter-spacing:.28em;color:#C2974E;margin-top:4px}
.pf-tagline{font-size:15px;color:#444;margin:0 0 26px}
.pf h2{font-size:17px;color:#C2974E;margin:24px 0 12px;border-right:3px solid #C2974E;padding-right:10px}
.pf p{font-size:13.5px;color:#33363d;margin:0}
.pf-grid2{display:grid;grid-template-columns:1fr 1fr;gap:0 22px;margin-top:6px}
.pf-svc{font-size:13px;padding:9px 0;border-bottom:1px solid #eee}
.pf-svc b{display:block;color:#15171c}
.pf-svc span{color:#666;font-size:12px}
.pf-stats{display:flex;flex-wrap:wrap;gap:26px;margin:8px 0}
.pf-stat .v{font-size:26px;font-weight:700;color:#C2974E}
.pf-stat .l{font-size:12px;color:#666}
.pf-badges{display:flex;flex-wrap:wrap;gap:10px;margin-top:6px}
.pf-badge{border:1px solid #e3dcc9;background:#faf7ef;border-radius:8px;padding:8px 12px;font-size:12px}
.pf-badge b{color:#C2974E}
.pf-proj{font-size:13px;padding:8px 0;border-bottom:1px solid #eee}
.pf-proj b{color:#15171c}.pf-proj span{color:#888;font-size:11.5px}
.pf-contact{margin-top:10px;font-size:13px;color:#33363d}
.pf-contact span{display:inline-block;margin-left:22px}
@media print{.pf-page{padding:18px 24px}@page{margin:14mm}}
`;

export default async function ProfilePdf({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { slug } = await params;
  const { print } = await searchParams;

  const supabase = await createClient();
  const { data: office } = await supabase
    .from("offices")
    .select("id, name, slug")
    .eq("slug", slug.toLowerCase())
    .maybeSingle();
  if (!office) notFound();

  const admin = createAdminClient();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("plan, status")
    .eq("office_id", office.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const caps = await getPlanCaps(sub?.plan);

  const { data: row } = await supabase.from("site_content").select("content").eq("office_id", office.id).maybeSingle();
  const c = mergeContent(row?.content);

  if (!caps.profilePdf) {
    return (
      <div style={{ maxWidth: 600, margin: "80px auto", padding: 24, textAlign: "center", direction: "rtl" }}>
        <h1 style={{ fontSize: 22 }}>الملف التعريفي PDF</h1>
        <p style={{ color: "#888", marginTop: 12 }}>
          هذه الميزة متاحة في الباقة الاحترافية وبريميوم. رقِّ باقتك لتفعيل توليد ملف المكتب التعريفي.
        </p>
      </div>
    );
  }

  const services = c.services.items.filter((s) => s.title);
  const projects = c.projects.items.filter((p) => p.title);

  return (
    <div className="pf">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      {print === "1" && <AutoPrint />}
      <div className="pf-page">
        <div className="pf-head">
          {c.brand.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.brand.logo} alt={c.brand.ar} />
          ) : null}
          <div>
            <h1>{c.brand.ar || office.name}</h1>
            {c.brand.en ? <div className="en">{c.brand.en}</div> : null}
          </div>
        </div>

        <p className="pf-tagline">{c.hero.subtitle}</p>

        {c.about.body ? (
          <>
            <h2>من نحن</h2>
            <p>{c.about.lead}</p>
            <p style={{ marginTop: 8 }}>{c.about.body}</p>
          </>
        ) : null}

        {services.length > 0 && (
          <>
            <h2>خدماتنا</h2>
            <div className="pf-grid2">
              {services.map((s, i) => (
                <div className="pf-svc" key={i}>
                  <b>{s.title}</b>
                  <span>{s.desc}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {c.stats.length > 0 && (
          <>
            <h2>بالأرقام</h2>
            <div className="pf-stats">
              {c.stats.map((s, i) => (
                <div className="pf-stat" key={i}>
                  <div className="v">{s.value}{s.suffix}</div>
                  <div className="l">{s.label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {caps.badges && c.credentials.badges.length > 0 && (
          <>
            <h2>الاعتمادات</h2>
            <div className="pf-badges">
              {c.credentials.badges.map((b, i) => (
                <div className="pf-badge" key={i}>
                  <b>{b.value}</b> — {b.label}
                </div>
              ))}
            </div>
          </>
        )}

        {projects.length > 0 && (
          <>
            <h2>أبرز المشاريع</h2>
            {projects.map((p, i) => (
              <div className="pf-proj" key={i}>
                <b>{p.title}</b> <span>{p.meta}</span>
              </div>
            ))}
          </>
        )}

        <h2>للتواصل</h2>
        <div className="pf-contact">
          {c.contact.phone ? <span>هاتف: {c.contact.phone}</span> : null}
          {c.contact.email ? <span>بريد: {c.contact.email}</span> : null}
          {c.contact.office ? <span>{c.contact.office}</span> : null}
        </div>
      </div>
    </div>
  );
}
