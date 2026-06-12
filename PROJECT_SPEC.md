# منصة وجود — Wujood Platform · Complete Build Specification

> A blueprint for a **multi-tenant, multi-vertical SaaS** that lets small businesses
> (engineering offices, clinics, law firms) self-create a professional Arabic (RTL)
> website on a subdomain, manage it from a dashboard, and capture leads / bookings.
>
> This document is written so a coding agent (e.g. Claude Code) can build a similar
> platform from scratch. It records the stack, every architectural decision, the data
> model, all conventions, the per-vertical anatomy, and the gotchas. Read it top to bottom.

---

## 0. TL;DR — what this product is

- **Who it serves:** an operator (super-admin) sells annual website subscriptions to small
  Saudi businesses. Each business ("office") gets a data-driven site on `slug.rootdomain`.
- **Three verticals today**, all on one codebase via a single `offices.kind` column:
  - `engineering` — هندسية: 10 cinematic design templates, 3D model viewer, cost calculator, projects gallery.
  - `clinic` — عيادات: 5 templates, real appointment-booking engine (doctors / services / working-hours / slots).
  - `law` — محاماة: 2 templates ("هيبة/عدالة"), confidential case-intake, consultation booking (reuses the appointment engine), **legal calculators** (Islamic inheritance + end-of-service gratuity).
- **Self-service:** the office admin edits ALL site content from `/dashboard/site-editor`; the site
  is a single data-driven route reading a per-office JSON blob. No per-office files.
- **Monetization:** annual plans (Basic/Pro/Premium) sold via **bank transfer + WhatsApp receipt**
  (Salla webhook also wired). Site stays offline until the operator manually activates the subscription.
- **Scale at time of writing:** ~172 source files, ~23k LOC TypeScript/React, fully typechecked + linted,
  with a vitest suite (booking slot math, legal calculators, plans, etc.).

---

## 1. Tech stack & versions

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16.2.6** (App Router, TS) | ⚠️ Next 16 has breaking changes — see §2. |
| UI | **React 19.2**, **Tailwind CSS v4** | Tailwind v4 uses `@import "tailwindcss"` + `@theme inline`. |
| Backend | **Supabase** (Postgres + Auth + Storage) | `@supabase/ssr` for cookie-based SSR auth. |
| Payments | **Salla** webhook + manual bank transfer | subscription products map to plan codes. |
| Email | **Resend** (`RESEND_API_KEY`, `EMAIL_FROM`) | wrapped in `lib/email.ts`, no-op if unset. |
| Notifications | **Telegram bot** | instant lead/booking alerts per office. |
| AI | **Anthropic API** (`ANTHROPIC_API_KEY`) | AI content generation for site copy. |
| 3D | **three.js** + model-viewer | engineering Revit/GLB showcase (FBX/OBJ→GLB in-browser). |
| Smooth scroll | **lenis** | used by cinematic engineering templates. |
| Testing | **vitest** | pure-function unit tests under `tests/`. |
| Hosting | **Vercel** | wildcard subdomains need a custom domain (see §4). |

`package.json` scripts: `dev`, `build`, `start`, `lint` (eslint), `test` (vitest run), `test:watch`.

---

## 2. ⚠️ Next.js 16 specifics (do NOT assume Next 14/15 behavior)

- **Middleware is renamed to `proxy`.** The file is `src/proxy.ts` exporting `export async function proxy(request: NextRequest)` and `export const config = { matcher: [...] }`. There is NO `middleware.ts`.
- `params` in pages/route handlers is a **Promise**: `type Params = Promise<{ subdomain: string }>` then `const { subdomain } = await params`.
- `<link rel="stylesheet" href=... precedence="high" />` can be rendered **inside server components** (Next hoists it). Used to load per-template Google Fonts. (ESLint warns `no-page-custom-font` — non-blocking.)
- The repo ships `AGENTS.md` (referenced by `CLAUDE.md`) reminding agents: **read `node_modules/next/dist/docs/` before writing Next code** because APIs differ from training data.
- A subtle ESLint rule in this setup: **`Date.now()` is flagged as impure inside render** (server components). Use `new Date()` + `.setDate(...)` instead. Also `setState` synchronously inside `useEffect` is flagged — call the loader from the event handler instead. And React's "components created during render reset state" rule — define sub-components at module scope, not inside the component body.

---

## 3. Multi-tenancy architecture

Every tenant site is **one data-driven route**: `src/app/s/[subdomain]/page.tsx`. There are NO per-office files.

**Routing (`src/proxy.ts`):**
- Reads `host`, computes the subdomain by stripping `NEXT_PUBLIC_ROOT_DOMAIN`.
- Reserved subdomains (`www, app, api, admin, mail`) and reserved paths (`/site-template`, `/backgrounds`, `/_next`, `/api`, `/auth`) are served by the platform itself.
- A real subdomain rewrites `office.example.com/x` → `/s/office/x` (internal rewrite, URL stays clean).
- The proxy also runs `supabase.auth.getUser()` to refresh the SSR session cookie on every request (required by `@supabase/ssr`).

**`tenantUrl()` / `tenantLabel()` (`src/lib/urls.ts`):** build the public URL.
- Custom domain / localhost → real subdomain `slug.root`.
- `*.vercel.app` (no wildcard subdomains on the free tier) → **path fallback** `root/s/slug`. This is essential: on Vercel preview domains subdomains don't resolve, so the app degrades to a path.

**To make real subdomains work in production you need a custom domain (e.g. `wujood.sa`) with wildcard DNS `*.wujood.sa` pointed at Vercel.**

---

## 4. The vertical system (the core extensibility pattern)

The single most important pattern: **one `offices.kind` column drives everything** — sections, content model, editor, public template, dashboard nav, copy.

`src/lib/vertical.ts` (import-safe, no server deps) is the single source of truth:
```ts
export type Vertical = "engineering" | "clinic" | "law";
export const VERTICALS: Vertical[] = ["engineering", "clinic", "law"];
export const VERTICAL_CONFIG: Record<Vertical, VerticalConfig> = { ... }; // labels, icon, registration copy
export function isVertical(v): v is Vertical
export function verticalConfig(kind): VerticalConfig   // coerces unknown → engineering
export function asVertical(kind): Vertical
```

### How to add a NEW vertical (the recipe, ~8 phases)

This is exactly how `clinic` and `law` were added. Each phase = one clean commit, typecheck + lint + build green.

1. **Foundation (kind):**
   - Add the kind to `vertical.ts` (`Vertical` union, `VERTICALS`, `VERTICAL_CONFIG`, `isVertical`).
   - SQL migration: widen the `offices_kind_check` constraint to include the new value; update the `handle_new_user` trigger's default office name.
   - The registration picker (`/register`) auto-renders the new option (it maps over `VERTICALS`). The register API uses `asVertical(body.kind)` and passes `office_kind` in the auth user metadata.
   - Add `kind` to `Office` type in `lib/auth.ts` (select it in `getSessionContext`).

2. **Content model + sections + editor:**
   - `lib/<vertical>-content.ts`: a `XxxContent` type + `xxxDefaultContent` + `mergeXxxContent(stored)` (deep-merge over defaults so partial edits still render fully). Mirror the shared shape of `theme/seo/media/brand/coordinates/hero/about/contact/visible` so shared machinery is reusable.
   - `lib/sections.ts`: add `XXX_SECTIONS` + extend `sectionsForKind`/`sectionKeysForKind`.
   - `app/dashboard/site-editor/XxxEditor.tsx`: a client editor (reuses the save flow: `supabase.from("site_content").update({ content }).eq("office_id", officeId)`).
   - Branch the editor page (`site-editor/page.tsx`) by `office.kind`.

3. **Public site + template(s):**
   - `components/site/XxxSiteView.tsx`: a **self-contained** server component that injects its own scoped `<style>` (don't depend on Tailwind in the tenant route). Drive the accent via a CSS variable, load Google fonts via `<link precedence="high">`.
   - Add a `view: "<kind>"` branch to the `LoadResult` discriminated union + `loadOffice()` + `generateMetadata()` + render in `s/[subdomain]/page.tsx`.

4. **Operational feature (booking / etc.):** reuse the shared engine where possible (see §8).

5. **Dashboard:** branch the nav in `dashboard/layout.tsx` by kind; reuse shared manager pages (guard them to allow the new kind), swapping wording via `lib/provider-labels.ts`.

6. **Vertical-specific killer feature** (e.g. legal calculators).

7. **super-admin + plans:** add the kind to the offices-table filter + metrics + the overview KPI; add a `<KIND>_PLAN_FEATURES` map + extend `planFeaturesFor`.

> The clinic vertical was built in Phases 0–5; the law vertical in Phases L0–L8 (L7 "client case portal" was descoped). Keeping each phase a green commit made the large build safe.

---

## 5. Data model (Postgres / Supabase)

SQL lives in `supabase/*.sql` and **must be applied manually in the Supabase SQL editor** (no DB password is wired for auto-apply). Apply in dependency order:

```
schema.sql          # core: enums, offices, profiles, subscriptions, site_content, leads, salla_events, RLS, triggers
storage.sql         # site-media storage bucket + policies
plans.sql           # plans table (source of truth for plan values; code has fallbacks)
leads.sql           # leads.kind column etc.
analytics.sql       # page-view / event tracking
settings.sql        # platform settings (payment/bank details, landing content)
support.sql         # support_messages (per-office support threads)
vertical.sql        # adds offices.kind ('engineering'|'clinic') + check + trigger update
clinic-booking.sql  # clinic_services, clinic_doctors, clinic_hours, appointments (+ RLS)
law-vertical.sql    # widens offices_kind_check to include 'law' + trigger default
# setup-all.sql is a convenience bundle of the above.
```

### Core tables (`schema.sql`)
- **`offices`** — `id, owner_id (auth.users), name, slug (unique), status ('pending'|'active'|'suspended'), kind, custom_domain, domain_status, onboarded, telegram_chat_id, telegram_link_token, created_at`.
- **`profiles`** — `id (auth.users), email, phone, full_name, role ('super_admin'|'office_admin'), office_id`.
- **`subscriptions`** — `office_id, plan (code), status ('pending'|'active'|'expired'|'cancelled'), salla_order_id (unique), amount, currency, starts_at, ends_at`.
- **`site_content`** — `office_id (PK), content (jsonb), updated_at`. **This single JSON blob holds the entire editable site** (shape differs per vertical).
- **`leads`** — `office_id, name, contact, message, kind, status ('new'|...), created_at`. Used by contact forms, clinic interim booking, and law case-intake.
- **`salla_events`** — webhook idempotency log.

### Booking tables (`clinic-booking.sql`) — shared by clinic AND law
- **`clinic_services`** — `office_id, name, price, duration_min, active, sort`. (law: "legal services / fees")
- **`clinic_doctors`** — `office_id, name, specialty, image, active, sort`. (law: "lawyers")
- **`clinic_hours`** — `office_id, weekday (0=Sun..6=Sat), is_open, start_min, end_min, slot_min` (PK = office_id+weekday).
- **`appointments`** — `office_id, service_id, doctor_id, service_name, patient_name, patient_phone, starts_at (timestamptz), duration_min, status ('booked'|'confirmed'|'done'|'cancelled'|'noshow'), note`.

### Triggers & helper functions
- `handle_new_user()` (SECURITY DEFINER, on `auth.users` insert): reads `office_slug`, `office_name`, `office_kind`, `phone`, `full_name` from `raw_user_meta_data`; creates the `offices` + `site_content` + `profiles` rows. Default office name depends on kind.
- `current_user_role()`, `is_super_admin()`, `current_office_id()` — SECURITY DEFINER helpers used by RLS to avoid recursion.
- `slug_available(text)` — public RPC for registration.
- `touch_updated_at()` — bumps `site_content.updated_at`.

### Row Level Security (RLS) — the model
- **Public can read ACTIVE offices + their `site_content`** (needed to render tenant sites by slug for anonymous visitors). Owner + super-admin can always read their own.
- **Owners write only their own rows** (`office_id = current_office_id()`).
- **`appointments`** are owner-read/update only; inserts happen via the **service-role key** in the booking API (bypasses RLS) so anonymous visitors never read patient data.
- `clinic_services/doctors/hours` are public-read for active offices (to render the booking widget), owner-write.
- `subscriptions` writes happen via the webhook/admin using the service-role key.

---

## 6. Auth & roles

- `@supabase/ssr` cookie-based sessions; three Supabase clients:
  - `lib/supabase/server.ts` — SSR (reads/writes cookies).
  - `lib/supabase/client.ts` — browser.
  - `lib/supabase/admin.ts` — **service-role** (bypasses RLS; server-only). ⚠️ The service-role key must NEVER ship to the client and must be rotated if leaked.
- `lib/auth.ts`: `getSessionContext()` returns `{ userId, email, profile, office }`. `isAllowedSuperAdmin(email, role)` gates the super-admin area (role === 'super_admin' AND email in `SUPER_ADMIN_EMAILS` allowlist).
- **Registration** (`/register` → `/api/auth/register`): creates the user **already email-confirmed** and signs them straight in (no verification mail). Rate-limited per IP. The site stays offline until the operator activates the subscription, so self-registration is safe.
- The dashboard layout redirects offices whose `status !== 'active'` to `/activate` (a "contact to activate" page).

---

## 7. Content model pattern (how the editable site works)

Each vertical has a content lib (`site-content.ts` engineering, `clinic-content.ts`, `law-content.ts`) exporting:
- a `XxxContent` TS type (sections: `theme, seo, media, brand, coordinates, hero, about, <vertical sections>, stats, process, testimonials, credentials, faq, booking, contact, visible`).
- `xxxDefaultContent` (sensible Arabic placeholder content).
- `mergeXxxContent(stored)` — **deep-merges stored JSON over defaults** so a partially-edited or empty record still renders fully. (Always merge; never trust the stored blob to be complete.)
- Engineering additionally has **clamp functions** (`clampMedia`, `clampTemplate`, `clampModels`) that enforce plan capabilities at render time (a downgraded office can't keep Pro-only media/templates).

The editor (`XxxEditor.tsx`) is a client component using a `deepSet(obj, "a.b.0.c", val)` immutable path setter + small render helpers (`text(label, path)`, `area(...)`, `imageField(...)`, list add/remove). Save = a single `update` on `site_content`.

`lib/sections.ts` defines the section keys per vertical (used for the editor's show/hide toggles and plan section-gating).

---

## 8. The booking engine (clinic + law share it)

Pure, timezone-aware slot math in **`lib/clinic-booking.ts`** (no server deps → unit-tested):
- All clinic times are **Asia/Riyadh (UTC+3, no DST)**. A slot is a minute-of-day; appointments stored as `${date}T${HH:MM}:00+03:00`.
- `computeSlots({ dateISO, hours, bookedCountByMin, capacity, now })` → array of free `"HH:MM"` strings. Hides past slots for today; hides slots at/over capacity; uses `DEFAULT_HOURS` (09:00–22:00, 30-min) when a weekday has no row.
- Helpers: `minToHHMM`, `hhmmToMin`, `weekdayOf`, `riyadhDateISO`, `riyadhMinuteOfDay`, `toRiyadhTimestamp`.

APIs (gate `office.kind in ('clinic','law')`):
- **`GET /api/clinic/availability?slug&date`** — resolves the office (service-role), loads that weekday's hours, capacity = active provider (doctor/lawyer) count, queries that day's non-cancelled appointments, returns only free slot strings (**never exposes patient data** — computed server-side).
- **`POST /api/clinic/book`** — rate-limited, **re-validates the slot is still free** (race-safe) by recomputing availability, inserts the appointment (service-role), then notifies the office instantly (email + Telegram). **No automatic reminders** (deliberately excluded). **No paid consultation** for law (excluded).

Public booking widget: `components/site/ClinicBookingForm.tsx` — choose service/provider + date → fetch slots → pick a chip → submit. Accepts optional `providerLabel`/`providerAnyLabel` props (law passes "المحامي" / "أي محامٍ متاح").

---

## 9. Site templates (the design layer)

### Engineering (10 templates)
`lib/site-templates.ts` registers them: `cinematic, editorial, luxe, heritage, kinetic, aurora, blueprint, deco, concrete, atelier`. Each has a `<View>` + a `<Runtime>` component and an external CSS file in `public/site-template/*.css` (these are elaborate, cinematic, with a scroll engine `scroll-engine.js` + lenis). The tenant page switches on `content.theme.layout` and renders `<XView/> + <XRuntime/>`. Plan caps can lock templates (Basic = editorial only).

### Clinic (5 templates) — selected via `theme.layout`
Each is a **single self-contained server component** with a scoped `<style>` string (no external CSS), accent via `--accent`, font via `theme.font`:
- `ClinicSiteView` (`safa`) — warm cream/green/gold, El Messiri serif. (This one was implemented from a Claude Design HTML handoff — "عيادة صفا" — pixel-faithfully.)
- `ClinicSiteLuxe` (`luxe`) — dark black/gold cinematic, Markazi.
- `ClinicSiteYasmin` (`yasmin`) — soft cream/rose med-spa, organic blob shapes, Reem Kufi.
- `ClinicSiteAurora` (`aurora`) — modern violet/blue gradient + glassmorphism + bento, Cairo.
- `ClinicSiteWaqar` (`waqar`) — navy + coral color-blocked, Almarai.

### Law (2 templates) — `theme.layout` = `hayba` | `adala`
- `LawSiteView` — authoritative navy+gold (maroon variant via `theme.accent`), Markazi serif. Sections: nav, hero w/ "confidentiality seal", about, practice areas, navy stat band, lawyers (from `clinic_doctors`), **legal calculators**, case journey, fees, testimonials, licenses, FAQ, **consultation booking** (slot form) + **confidential case-intake** form, contact, footer.

**Template anatomy convention** (every vertical view): fixed nav → hero → highlights → services/practice-areas → stats band → providers (doctors/lawyers) → process → prices/fees → testimonials → credentials → FAQ → booking/intake → contact/map → footer. All gated by `content.visible.<section>` + data presence. Grids use `repeat(auto-fill, minmax(280px, 360px))` + `justify-content:center` so a SINGLE card never stretches full-width.

**Hard-won CSS gotcha:** a low-effort `:where(.scope) a { color: inherit }` reset is REQUIRED so anchor "buttons" don't get overridden by a higher-specificity `.scope a` rule (that bug once made cream buttons render dark on green). Always use `:where()` (zero specificity) for such resets.

---

## 10. Dashboard

- **Shell** (`dashboard/layout.tsx`): a 282px white sidebar (gradient logo block, "published site" card w/ status pill + tenant URL, icon nav with active highlight via the client `DashboardNav.tsx`), main content area. The nav array branches by `kind` (engineering vs clinic vs law) and gates items by plan caps (`analytics`, `blog`, `domain`, …).
- **Theme:** the WHOLE admin area uses a **light teal "Riwaq" theme** (El Messiri + IBM Plex Sans Arabic). Implemented by **scoping CSS-variable overrides under `.admin-shell`** in `globals.css` — because every page uses semantic tokens (`bg-surface`, `text-accent`, `border-border`, `.glass-panel`), flipping those tokens re-themes ALL admin pages at once. (This was ported from another Claude Design handoff, "Clinic Dashboard".)
- **Pages:** overview, leads CRM (+CSV export), notifications (Telegram connect), analytics (+ send monthly report), site-editor (branches by kind), blog (CMS), domain (custom domain connect), subscription, settings (password), support (ticket thread). Clinic/Law add: appointments board (day-grouped, click status to cycle), doctors/lawyers manager (photo upload), services manager, working-hours editor.
- **Shared managers are kind-aware** via `lib/provider-labels.ts` (e.g. "الأطباء" ↔ "المحامون", "المواعيد" ↔ "الاستشارات").

---

## 11. super-admin (operator console)

`app/super-admin/*` (gated by `isAllowedSuperAdmin`):
- Overview KPIs (total offices split 🏛️/🩺/⚖️, active subs, ARR/MRR, expiring/expired, recent activity feed).
- Offices table (`data.ts` aggregates offices+profiles+subscriptions; `OfficesTable.tsx` has status tabs + a **vertical filter** + search + sort + a النوع column).
- Office detail (activate/suspend, edit, impersonate, view leads).
- Plans editor (DB-backed), Payment/bank details editor, Landing page editor, Support inbox.
- `impersonate` route lets the operator log in as an office for support.

---

## 12. Subscriptions, plans & payments

- **Plans** (`lib/plans.ts`): a `PlanCaps` type (booleans + `sections[]` + `templates[]` + AI limits). DB `plans` table is the source of truth; `FALLBACK_PLANS` in code is used if the table is empty. `normalizePlan(row)` maps DB → typed `Plan`. Three tiers: Basic (990), Pro (1990), Premium (3490) SAR/yr.
- **Vertical-tailored marketing copy:** `CLINIC_PLAN_FEATURES`, `LAW_PLAN_FEATURES` + `planFeaturesFor(kind, plan)` swap the displayed bullets (pricing/caps stay shared).
- **Payment flow:** the subscription page shows bank-transfer details + 3 plan cards. The CTA opens a **prefilled WhatsApp message** carrying the office identity + chosen plan. The operator confirms the transfer and **manually activates** the subscription in super-admin. (Salla webhook at `/api/salla/webhook` also matches a paying customer by email → activates.)
- `lib/subscription.ts` `siteLiveState(officeStatus, sub)` closes a site the moment its subscription lapses (status flipped OR term elapsed before the daily cron ran).
- Cron (`vercel.json` + `/api/cron/expire`, `/api/cron/monthly-report`): daily subscription expiry sweep + monthly performance email.

---

## 13. Legal calculators (law vertical's killer feature)

`lib/legal-calculators.ts` (pure, **unit-tested** in `tests/legal-calculators.test.ts`):
- **`endOfService({ wage, years, months, reason })`** — Saudi Labour Law gratuity: half-month wage per year for first 5 years, full month after; resignation reductions (<2y = 0, 2–5y = ⅓, 5–10y = ⅔, ≥10y = full); termination/contract-end = full.
- **`inheritance({ estate, spouse, father, mother, sons, daughters })`** — Islamic فرائض for common cases: spouse fixed share (¼/½ husband, ⅛/¼ wife by presence of children), mother (⅙/⅓), father (⅙ fardh + تعصيب residue), daughters (½ one / ⅔ two+ when no sons), children residue split 2:1, plus **عَوْل** (proportional reduction when shares exceed the estate), **رَدّ** (return of surplus to non-spouse heirs), and **العمريتان** (spouse + both parents, no children). Flagged in the UI as an estimator with a "consult a specialist" disclaimer.
- UI: `components/site/LawCalculators.tsx` — tabbed client component, computes live, CTA to booking.

---

## 14. Notifications, analytics, AI

- **Email** (`lib/email.ts` + Resend) — owner gets new-lead / new-booking / monthly-report emails; `emailLayout()` wraps HTML.
- **Telegram** (`lib/telegram.ts`) — office links a chat via `/dashboard/notifications`; new leads/bookings push instantly. No-op if `TELEGRAM_BOT_TOKEN` unset.
- **Analytics** (`/api/track`, `analytics.sql`, `/dashboard/analytics`) — page views/events per office; monthly report (`lib/report.ts`).
- **AI content** (`/api/ai/generate`, Anthropic) — generates `about` + services copy from the office name + specialty; per-office monthly quota (Premium).

---

## 15. Conventions (match these when extending)

- **Comments + code in English; all UI copy in Arabic (RTL).** Match surrounding comment density and idiom.
- **`dir="rtl"`** on tenant sites + admin; Latin/numeric fields use `dir="ltr"`.
- Semantic theme tokens everywhere in admin (`bg-surface`, `text-muted`, `text-accent`, `border-border`, `.glass-panel`, `.glass-panel-2`) so scoping under `.admin-shell` can re-theme.
- Tenant templates are **self-contained** (own scoped `<style>`), NOT Tailwind-dependent.
- Pure logic (slot math, calculators, plan normalization) lives in `lib/*.ts` with **vitest tests**.
- Every commit: `npx tsc --noEmit` + `npx eslint <changed>` + `npm run build` must be green. Commit per phase with a clear message; the repo auto-pushes to `origin/main`.
- Reuse shared infra across verticals (booking engine, managers, save flow) and branch by `kind`; don't fork.
- Discriminated unions for multi-shape returns (e.g. `LoadResult = { view: 'clinic' | 'law' | 'engineering', ... }`) — gives exhaustive TS narrowing.

---

## 16. Environment variables (Vercel → Settings → Environment Variables)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # server-only, bypasses RLS — never expose, rotate if leaked
NEXT_PUBLIC_ROOT_DOMAIN          # e.g. wujood.sa (or the vercel.app domain for path-fallback)
NEXT_PUBLIC_APP_URL
SUPER_ADMIN_EMAILS               # comma-separated allowlist
ANTHROPIC_API_KEY                # AI content generation
RESEND_API_KEY + EMAIL_FROM      # transactional email
TELEGRAM_BOT_TOKEN + TELEGRAM_BOT_USERNAME
# (Salla webhook token/keys if using Salla)
```
`.env.local` mirrors these locally (NOT committed). If the build works locally but Vercel 404s/errors: check the env vars are set in Vercel, Production Branch = `main`, Root Directory is correct, and the URL spelling.

---

## 17. Build deployment checklist

1. Apply the SQL files in order (§5) in the Supabase SQL editor.
2. Create the `site-media` storage bucket (public) per `storage.sql`.
3. Set all env vars in Vercel; connect the GitHub repo, Production Branch = `main`.
4. Promote one user to super-admin: `update profiles set role='super_admin' where email='you@example.com';` and add the email to `SUPER_ADMIN_EMAILS`.
5. For real subdomains: add a custom domain + wildcard DNS; else the app uses the `/s/slug` path fallback.

---

## 18. Repo map (high-signal files)

```
src/proxy.ts                         # subdomain routing (Next 16 "proxy")
src/app/s/[subdomain]/page.tsx       # the ONE tenant site route — LoadResult union + per-kind dispatch
src/app/layout.tsx, globals.css      # root + theme tokens (+ .admin-shell light theme)
src/lib/vertical.ts                  # the kind registry (extend here to add a vertical)
src/lib/sections.ts                  # per-kind section keys
src/lib/{site,clinic,law}-content.ts # per-kind content models + merge
src/lib/clinic-booking.ts            # timezone-aware slot engine (tested)
src/lib/legal-calculators.ts         # inheritance + end-of-service (tested)
src/lib/plans.ts / plans-server.ts   # plan caps + per-kind feature copy
src/lib/provider-labels.ts           # dashboard wording per kind
src/lib/auth.ts, supabase/*          # session + 3 supabase clients
src/lib/{email,telegram,bank,report,urls,subscription}.ts
src/app/api/clinic/{availability,book}/route.ts   # shared booking APIs (clinic|law)
src/app/api/{leads,track,ai/generate,salla,telegram,cron/*}/route.ts
src/components/site/*SiteView*.tsx    # the templates (engineering 10 + clinic 5 + law)
src/components/site/{ClinicBookingForm,LawIntakeForm,LawCalculators}.tsx
src/app/dashboard/**                  # admin (layout shell + per-feature pages/managers)
src/app/super-admin/**                # operator console
supabase/*.sql                        # apply manually, in order
tests/*.test.ts                       # vitest (booking, calculators, plans, …)
public/site-template/*.css            # engineering template CSS + scroll engine
```

---

## 19. Lessons / gotchas to carry forward

- **One `kind` column + token-scoped theming = cheap verticals.** Branch by kind; don't duplicate pages.
- **Always `mergeContent` over defaults** — never render the raw stored JSON.
- **Compute availability server-side; never expose appointment rows to anon.** Insert via service-role.
- **Re-validate slots on booking** (race condition between availability fetch and submit).
- **`:where()` zero-specificity resets** for anchor color, or buttons break.
- **Single-card grids must not stretch** — `auto-fill` + capped track + centered.
- **Pixel-faithful from a Claude Design HTML handoff works great** — read the `.dc.html` fully, extract the design tokens (palette/fonts/shadows/radii), recreate as a self-contained component driven by real data + the real booking engine (don't copy the prototype's logic).
- **Next 16:** `proxy` not middleware; `params` is a Promise; `Date.now()` flagged in render.
- **Vercel free domain has no wildcard subdomains** — ship the `/s/slug` path fallback.
- **Phase the work**; keep every commit green (tsc + lint + build); auto-push.

— End of specification.
