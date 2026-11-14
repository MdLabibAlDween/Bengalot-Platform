-- Bengalot academic storefront — fresh schema
-- Applied after a full reset of the previous project on 8 November 2026.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  city text,
  avatar_hue integer not null default 24,
  role text not null default 'customer' check (role in ('customer', 'staff', 'admin', 'owner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_bn text,
  tagline text,
  description text,
  icon text not null default 'spark',
  art_key text not null default 'notion',
  theme jsonb not null default '{}'::jsonb,
  sort integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sku text unique,
  title text not null,
  title_bn text,
  subtitle text not null,
  description text not null,
  category_id uuid references public.categories (id) on delete set null,
  category_slug text not null,
  type text not null check (type in ('digital', 'physical', 'bundle')),
  format text not null,
  price integer not null check (price >= 0),
  compare_at integer,
  stock integer not null default 0,
  badge text,
  art_key text not null,
  palette jsonb not null default '["#0E7C7B", "#F6D365"]'::jsonb,
  includes text[] not null default '{}',
  requirements text[] not null default '{}',
  specs jsonb not null default '[]'::jsonb,
  preview jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}',
  featured boolean not null default false,
  is_published boolean not null default true,
  sort integer not null default 0,
  rating numeric(2,1) not null default 4.9,
  review_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  eyebrow text not null,
  title text not null,
  description text not null,
  cta_label text not null,
  cta_href text not null default '/shop',
  art_key text not null default 'semester',
  theme jsonb not null default '{}'::jsonb,
  sort integer not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references auth.users (id) on delete set null,
  customer_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  district text not null default 'Faridpur',
  notes text,
  subtotal integer not null,
  delivery_fee integer not null default 0,
  discount integer not null default 0,
  total integer not null,
  payment_method text not null default 'cod',
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  status text not null default 'processing' check (status in ('processing', 'packed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  title text not null,
  slug text not null,
  type text not null,
  format text not null,
  unit_price integer not null,
  quantity integer not null check (quantity > 0),
  line_total integer not null,
  created_at timestamptz not null default now()
);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  order_id uuid references public.orders (id) on delete set null,
  title text not null,
  access_label text not null default 'Open resource',
  access_url text,
  granted_at timestamptz not null default now(),
  last_accessed_at timestamptz,
  unique (user_id, product_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete cascade,
  author text not null,
  city text,
  rating integer not null check (rating between 1 and 5),
  body text not null,
  is_approved boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'footer',
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  is_public boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.admin_audit (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  actor_email text,
  action text not null,
  entity text not null,
  entity_id text,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

create index products_category_idx on public.products (category_slug);
create index products_featured_idx on public.products (featured, sort);
create index orders_user_idx on public.orders (user_id, created_at desc);
create index entitlements_user_idx on public.entitlements (user_id);
create index reviews_product_idx on public.reviews (product_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at before update on public.products
for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders
for each row execute function public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger promotions_updated_at before update on public.promotions
for each row execute function public.set_updated_at();

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('staff', 'admin', 'owner')
  );
$$;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.promotions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.entitlements enable row level security;
alter table public.reviews enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_audit enable row level security;

create policy "profiles read own or staff" on public.profiles
for select using (id = auth.uid() or public.is_staff());
create policy "profiles update own" on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());

create policy "categories public read" on public.categories
for select using (is_published or public.is_staff());
create policy "products public read" on public.products
for select using (is_published or public.is_staff());
create policy "promotions public read" on public.promotions
for select using (is_active or public.is_staff());
create policy "reviews public read" on public.reviews
for select using (is_approved or public.is_staff());
create policy "settings public read" on public.site_settings
for select using (is_public or public.is_staff());

create policy "orders own read" on public.orders
for select using (user_id = auth.uid() or public.is_staff());
create policy "order items own read" on public.order_items
for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff()))
);
create policy "entitlements own read" on public.entitlements
for select using (user_id = auth.uid() or public.is_staff());

create policy "newsletter public insert" on public.newsletter_subscribers
for insert with check (email <> '');
create policy "contact public insert" on public.contact_messages
for insert with check (name <> '' and email <> '' and message <> '');

create policy "staff write categories" on public.categories
for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write products" on public.products
for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write promotions" on public.promotions
for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write settings" on public.site_settings
for all using (public.is_staff()) with check (public.is_staff());
create policy "staff read audit" on public.admin_audit
for select using (public.is_staff());

grant usage on schema public to anon, authenticated, service_role;
grant select on public.categories, public.products, public.promotions, public.reviews, public.site_settings to anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, city, avatar_hue) on public.profiles to authenticated;
grant select on public.orders, public.order_items, public.entitlements to authenticated;
grant insert on public.newsletter_subscribers, public.contact_messages to anon, authenticated;
grant all on all tables in schema public to service_role;

-- ---------------------------------------------------------------------------
-- Seed: categories
-- ---------------------------------------------------------------------------

insert into public.categories (slug, name, name_bn, tagline, description, icon, art_key, theme, sort)
values
  ('notion-templates', 'Notion Templates', 'নোশন টেমপ্লেট', 'A calmer place for everything.', 'Ready-to-duplicate workspaces for study, planning and independent work.', 'layout', 'notion', '{"from":"#0B4F4A","to":"#0E7C7B","ink":"#F7F2E7","accent":"#F6D365"}', 1),
  ('study-cards', 'Study Cards', 'স্টাডি কার্ড', 'Turn rereading into recall.', 'Printed flashcard decks for focused recall, revision and everyday learning.', 'cards', 'cards', '{"from":"#F2C14E","to":"#F6D365","ink":"#132A2A","accent":"#E05A3F"}', 2),
  ('printable-planners', 'Printable Planners', 'প্রিন্টেবল প্ল্যানার', 'Paper for a clearer week.', 'Print-at-home planners and revision sheets with room to think.', 'calendar', 'planner', '{"from":"#CFC6E6","to":"#E8E2F3","ink":"#2E2A45","accent":"#0E7C7B"}', 3),
  ('focus-productivity', 'Focus & Productivity', 'ফোকাস ও প্রোডাক্টিভিটি', 'Protect the hour you have.', 'Guides, timers and small tools for calmer deep work.', 'timer', 'timer', '{"from":"#F0755A","to":"#F6A77A","ink":"#2B1B17","accent":"#F6D365"}', 4),
  ('bundles', 'Bundles', 'বান্ডেল', 'A whole system, together.', 'Complete study systems, thoughtfully priced.', 'stack', 'bundle', '{"from":"#16243A","to":"#28425C","ink":"#F7F2E7","accent":"#F6D365"}', 5);

-- ---------------------------------------------------------------------------
-- Seed: products
-- ---------------------------------------------------------------------------

insert into public.products
  (slug, sku, title, title_bn, subtitle, description, category_id, category_slug, type, format, price, compare_at, stock, badge, art_key, palette, includes, requirements, specs, preview, tags, featured, sort, rating, review_count)
values
(
  'notion-student-os', 'BG-NOTION-OS', 'Notion Student OS', 'নোশন স্টুডেন্ট ওএস',
  'One calm workspace for classes, assignments, revision and deadlines.',
  'A complete student workspace built around the way a real semester works. Every course, reading, assignment and exam has a home, and the daily dashboard shows only what needs your attention today.',
  (select id from public.categories where slug = 'notion-templates'), 'notion-templates', 'digital', 'Notion template', 1490, 1990, 0, 'Bestseller', 'notion', '["#0B4F4A","#0E7C7B","#F6D365"]',
  array['Course dashboard','Assignment tracker','Revision planner','Exam countdown','Reading log','Weekly review page'],
  array['A free Notion account','Notion web or desktop app'],
  '[{"label":"Pages","value":"18 linked pages"},{"label":"Works with","value":"Notion free plan"},{"label":"Access","value":"Instant duplicate link"},{"label":"Updates","value":"Free minor updates"}]',
  '{"kind":"notion","modules":[{"title":"Today","meta":"3 focused tasks"},{"title":"Semester 4","meta":"6 courses · 14 weeks"},{"title":"Revision queue","meta":"12 topics due"},{"title":"Weekly review","meta":"Sunday · 25 min"}]}',
  array['notion','students','semester','dashboard'], true, 1, 4.9, 184
),
(
  'notion-freelance-os', 'BG-NOTION-FREE', 'Notion Freelance OS', 'নোশন ফ্রিল্যান্স ওএস',
  'A simple client, project and invoice tracker for independent work.',
  'A lightweight operating system for freelancers and solo professionals. Track leads, active projects, deliverables, invoices and follow-ups without turning your workspace into a second job.',
  (select id from public.categories where slug = 'notion-templates'), 'notion-templates', 'digital', 'Notion template', 1990, null, 0, 'New', 'notion', '["#243B53","#3E6B89","#F6D365"]',
  array['Client CRM','Project board','Proposal checklist','Invoice tracker','Weekly pipeline review'],
  array['A free Notion account'],
  '[{"label":"Pages","value":"14 linked pages"},{"label":"Works with","value":"Notion free plan"},{"label":"Access","value":"Instant duplicate link"},{"label":"Updates","value":"Free minor updates"}]',
  '{"kind":"notion","modules":[{"title":"Pipeline","meta":"6 live leads"},{"title":"Projects","meta":"4 in progress"},{"title":"Invoices","meta":"2 awaiting payment"},{"title":"This week","meta":"12.5 billable hrs"}]}',
  array['notion','freelance','clients','business'], true, 2, 4.8, 63
),
(
  'exam-focus-planner', 'BG-PLAN-EXAM', 'Exam Focus Planner', 'পরীক্ষার ফোকাস প্ল্যানার',
  'A printable six-week revision planner with daily focus blocks and weekly reviews.',
  'A printable planner for the weeks that matter most. Break each subject into small topics, plan focused study blocks, and review what actually moved forward every week.',
  (select id from public.categories where slug = 'printable-planners'), 'printable-planners', 'digital', 'PDF planner · A4 + Letter', 690, 890, 0, 'Save 22%', 'planner', '["#2A6F97","#8ECAE6","#F6D365"]',
  array['6-week overview','Daily focus page','Subject breakdown','Revision tracker','Weekly review sheet'],
  array['A4 or US Letter printer','A PDF reader'],
  '[{"label":"Format","value":"A4 + US Letter PDF"},{"label":"Pages","value":"24 printable pages"},{"label":"Access","value":"Instant download"},{"label":"Printing","value":"Home or print shop"}]',
  '{"kind":"planner","spread":"Week 03","subjects":["Biology","Chemistry","Math","English"]}',
  array['planner','exam','revision','printable'], true, 3, 4.9, 121
),
(
  'weekly-study-planner', 'BG-PLAN-WEEK', 'Weekly Study Planner', 'সাপ্তাহিক স্টাডি প্ল্যানার',
  'A clean one-page weekly plan for classes, deep work and rest.',
  'A one-page printable planner designed for students who want a realistic plan, not an impossible one. Includes class blocks, deep-work slots, a small task list and a place to protect your rest.',
  (select id from public.categories where slug = 'printable-planners'), 'printable-planners', 'digital', 'PDF planner · A4 + Letter', 490, null, 0, null, 'planner', '["#3A5A40","#A3B18A","#F6D365"]',
  array['Weekly overview','Deep-work blocks','Class timetable','Priority list','Rest reminder'],
  array['A4 or US Letter printer','A PDF reader'],
  '[{"label":"Format","value":"A4 + US Letter PDF"},{"label":"Pages","value":"6 printable pages"},{"label":"Access","value":"Instant download"},{"label":"Printing","value":"Home or print shop"}]',
  '{"kind":"planner","spread":"Week 12","subjects":["Classes","Deep work","Reading","Rest"]}',
  array['planner','weekly','printable','reset'], false, 4, 4.7, 46
),
(
  'english-vocabulary-cards', 'BG-CARD-ENG', 'English Vocabulary Cards', 'ইংরেজি ভোকাবুলারি কার্ড',
  '120 printed cards for building everyday English vocabulary.',
  'A boxed deck of 120 vocabulary cards made for Bangladeshi learners. Each card gives a clear word, a simple meaning, a natural example sentence and a pronunciation hint — sized for quick daily review at home or on the move.',
  (select id from public.categories where slug = 'study-cards'), 'study-cards', 'physical', 'Boxed card deck · 120 cards', 890, 1090, 48, 'Bestseller', 'cards', '["#E05A3F","#F0755A","#F6D365"]',
  array['120 FSC-certified cards','6 topic dividers','Quick-start guide','Sturdy storage box'],
  array['No special tools required'],
  '[{"label":"Cards","value":"120 · durable stock"},{"label":"Size","value":"88 × 126 mm"},{"label":"Finish","value":"Soft-touch matte"},{"label":"Delivery","value":"Ships in 2–4 days"}]',
  '{"kind":"flashcards","cards":[{"front":"serendipity","hint":"/ˌser.ənˈdɪp.ə.ti/","back":"Finding something good without looking for it.","example":"A happy serendipity brought me to that little bookshop."},{"front":"deliberate","hint":"/dɪˈlɪb.ər.ət/","back":"Done consciously and intentionally.","example":"She made a deliberate choice to study before sunrise."},{"front":"momentum","hint":"/məˈmen.təm/","back":"The force that keeps something moving forward.","example":"One small win gave the whole week momentum."}]}',
  array['flashcards','english','vocabulary','physical'], true, 5, 4.9, 203
),
(
  'ict-basics-cards', 'BG-CARD-ICT', 'ICT Basics Cards', 'আইসিটি বেসিকস কার্ড',
  '90 printed cards covering practical ICT terms for school and college.',
  'A compact revision deck for ICT fundamentals. Each card pairs a term with a plain-language definition and a short example, so revision stays active instead of turning into rereading.',
  (select id from public.categories where slug = 'study-cards'), 'study-cards', 'physical', 'Boxed card deck · 90 cards', 990, null, 36, 'New', 'cards', '["#264653","#2A9D8F","#E9C46A"]',
  array['90 FSC-certified cards','5 topic dividers','Quick-start guide','Storage box'],
  array['No special tools required'],
  '[{"label":"Cards","value":"90 · durable stock"},{"label":"Size","value":"88 × 126 mm"},{"label":"Finish","value":"Soft-touch matte"},{"label":"Delivery","value":"Ships in 2–4 days"}]',
  '{"kind":"flashcards","cards":[{"front":"Bandwidth","hint":"Networking","back":"The maximum amount of data that can travel through a connection at one time.","example":"The video call lagged because the bandwidth was shared."},{"front":"Cache","hint":"Computing","back":"A small, fast store of data kept close at hand to speed things up.","example":"Clearing the cache made the website load correctly."},{"front":"Protocol","hint":"Networking","back":"A shared set of rules that lets devices communicate.","example":"HTTPS is the protocol used for secure web pages."}]}',
  array['flashcards','ict','revision','physical'], false, 6, 4.8, 71
),
(
  'deep-work-study-guide', 'BG-GUIDE-DEEP', 'Deep Work Study Guide', 'ডিপ ওয়ার্ক স্টাডি গাইড',
  'A short, practical guide to building a distraction-light study routine.',
  'A compact guide for students who can sit down to study but keep losing the thread. Learn how to prepare a session, choose one clear target, protect your attention and finish with a short review that makes the next session easier.',
  (select id from public.categories where slug = 'focus-productivity'), 'focus-productivity', 'digital', 'PDF guide + worksheets', 590, null, 0, null, 'guide', '["#2B2D42","#4A4E69","#EF8354"]',
  array['32-page illustrated guide','Session planning worksheet','Distraction audit','Weekly review template'],
  array['A PDF reader','A printer is optional'],
  '[{"label":"Format","value":"PDF + printable worksheets"},{"label":"Pages","value":"32 pages"},{"label":"Read time","value":"About 45 minutes"},{"label":"Access","value":"Instant download"}]',
  '{"kind":"guide","chapters":["Before the session","One clear target","Protecting attention","The ten-minute review"],"quote":"Focus is not a personality trait. It is a room you learn to prepare."}',
  array['focus','guide','habits','digital'], true, 7, 4.9, 98
),
(
  'bengalot-focus-timer', 'BG-FOCUS-TIMER', 'Bengalot Focus Timer', 'বেঙ্গলট ফোকাস টাইমার',
  'A quiet 60-minute timer with a soft finish and a physical start dial.',
  'A screen-free focus timer for study sessions. Turn the dial to the time you want, keep your phone out of the room, and let the soft chime mark the end of one honest block.',
  (select id from public.categories where slug = 'focus-productivity'), 'focus-productivity', 'physical', 'Physical timer · 60 minutes', 1590, 1890, 22, 'Limited run', 'timer', '["#3D405B","#6D597A","#F2CC8F"]',
  array['One focus timer','Quick-start card','One-year warranty card','Recycled gift box'],
  array['One AA battery (included)'],
  '[{"label":"Timer","value":"60 minutes, silent dial"},{"label":"Finish","value":"Ceramic-feel matte"},{"label":"Size","value":"90 × 90 × 45 mm"},{"label":"Delivery","value":"Ships in 2–4 days"}]',
  '{"kind":"timer","timer":"25:00","marks":["5","15","25","45"]}',
  array['timer','focus','physical','desk'], false, 8, 4.8, 54
),
(
  'student-starter-bundle', 'BG-BUNDLE-START', 'Student Starter Bundle', 'স্টুডেন্ট স্টার্টার বান্ডেল',
  'The Student OS, Exam Focus Planner and Deep Work guide — together.',
  'A complete starting point for a calmer semester. Set up your Notion workspace, plan the next six weeks on paper, and use the deep-work guide to protect the time you have.',
  (select id from public.categories where slug = 'bundles'), 'bundles', 'bundle', 'Digital bundle · 3 resources', 2290, 2770, 0, 'Save 17%', 'bundle', '["#E05A3F","#0E7C7B","#F6D365"]',
  array['Notion Student OS','Exam Focus Planner PDF','Deep Work Study Guide PDF','All future minor updates'],
  array['A free Notion account','A PDF reader','A printer is optional'],
  '[{"label":"Includes","value":"3 complete resources"},{"label":"Saving","value":"৳480 vs buying separately"},{"label":"Access","value":"Instant, all at once"},{"label":"Updates","value":"Free minor updates"}]',
  '{"kind":"bundle","items":["Notion Student OS","Exam Focus Planner","Deep Work Guide"]}',
  array['bundle','students','semester','value'], true, 9, 5.0, 67
),
(
  'admission-prep-kit', 'BG-BUNDLE-ADM', 'Admission Prep Kit', 'অ্যাডমিশন প্রেপ কিট',
  'A focused preparation system for admission tests and university applications.',
  'A structured kit for the admission season: a weekly plan, a revision tracker, a mistake log and a short guide to building a sustainable test-prep routine.',
  (select id from public.categories where slug = 'bundles'), 'bundles', 'bundle', 'Digital bundle · 5 resources', 2490, null, 0, null, 'bundle', '["#6D597A","#B56576","#F6D365"]',
  array['Admission preparation planner','Revision tracker','Mistake log','Test-day checklist','Focus guide'],
  array['A PDF reader','A printer is optional'],
  '[{"label":"Includes","value":"5 printable resources"},{"label":"Saving","value":"৳640 vs buying separately"},{"label":"Access","value":"Instant download"},{"label":"Best for","value":"Admission season"}]',
  '{"kind":"bundle","items":["Admission Planner","Revision Tracker","Mistake Log","Focus Guide"]}',
  array['bundle','admission','exam','prep'], false, 10, 4.8, 39
);

update public.products set featured = true where slug in ('notion-student-os','english-vocabulary-cards','student-starter-bundle','exam-focus-planner');

-- ---------------------------------------------------------------------------
-- Seed: promotions (all editable in admin)
-- ---------------------------------------------------------------------------

insert into public.promotions (eyebrow, title, description, cta_label, cta_href, art_key, theme, sort, is_active)
values
  ('The semester reset', 'A quieter way to begin again.', 'Pair the Notion Student OS with the Exam Focus Planner and give the next six weeks a shape you can actually keep.', 'Build your semester', '/product/student-starter-bundle', 'semester', '{"surface":"#123F3B","ink":"#F7F2E7","accent":"#F6D365","from":"#123F3B","to":"#0E7C7B"}', 1, true),
  ('Small cards, big recall', 'Better questions. Better remembering.', 'Two hundred printed prompts made for the fifteen minutes between classes. Active recall, without the screen.', 'Explore study cards', '/shop/study-cards', 'cards', '{"surface":"#F0755A","ink":"#2B1B17","accent":"#F6D365","from":"#F0755A","to":"#F6A77A"}', 2, true),
  ('One honest hour', 'Make room for the work that matters.', 'The Bengalot Focus Timer removes the phone from the equation and marks one clear block of attention.', 'Meet the focus timer', '/product/bengalot-focus-timer', 'timer', '{"surface":"#DDD4EC","ink":"#2E2A45","accent":"#0E7C7B","from":"#DDD4EC","to":"#F1ECF8"}', 3, false);

-- ---------------------------------------------------------------------------
-- Seed: reviews
-- ---------------------------------------------------------------------------

insert into public.reviews (product_id, author, city, rating, body)
values
  ((select id from public.products where slug = 'notion-student-os'), 'Nadia R.', 'Dhaka', 5, 'I stopped keeping five different lists. The daily page is the first thing I open after breakfast.'),
  ((select id from public.products where slug = 'english-vocabulary-cards'), 'Tanvir H.', 'Chattogram', 5, 'The paper feels beautiful and the examples sound like real life. I keep ten cards in my bag for the bus.'),
  ((select id from public.products where slug = 'exam-focus-planner'), 'Ayesha K.', 'Sylhet', 5, 'Six weeks was exactly the container I needed. The weekly review page is the quiet hero.'),
  ((select id from public.products where slug = 'deep-work-study-guide'), 'Mahin S.', 'Rajshahi', 4, 'Short, honest and practical. The ten-minute review has changed how I start the next session.'),
  ((select id from public.products where slug = 'bengalot-focus-timer'), 'Farhan A.', 'Dhaka', 5, 'No screen, no notifications. My phone stays in another room now. It is a small object with a big effect.'),
  ((select id from public.products where slug = 'student-starter-bundle'), 'Nusrat J.', 'Khulna', 5, 'The whole system fits together. I bought it before exams and I am still using it this semester.');

-- ---------------------------------------------------------------------------
-- Seed: public settings
-- ---------------------------------------------------------------------------

insert into public.site_settings (key, value)
values
  ('store', '{"name":"Bengalot","slogan":"Bring a lot to learning.","announcement":"Free delivery over ৳2,000 · Digital access after payment","whatsapp":"01341739202","supportEmail":"support@bengalot.com","city":"Saltha, Faridpur","deliveryInside":70,"deliveryOutside":130,"freeDeliveryThreshold":2000,"currency":"BDT"}'),
  ('announcements', '["New: the Semester Reset bundle is here","Cash on delivery across Bangladesh","Digital resources open instantly in your library"]');

-- Staff write policies are intentionally not applied to newsletter/contact so
-- a public insert can never be widened into a read.

revoke all on function public.set_updated_at() from public;
