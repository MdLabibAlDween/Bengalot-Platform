-- Printed planners, not print-at-home PDFs.
-- The planner collection now contains physical products that ship across
-- Bangladesh. Existing planner entitlements are retired because the planner is
-- no longer a digital library resource.

begin;

update public.categories
set
  slug = 'printed-planners',
  name = 'Printed Planners',
  name_bn = 'মুদ্রিত প্ল্যানার',
  tagline = 'Paper, made for the week.',
  description = 'Professionally printed planners and weekly pads, made to be written in.',
  is_published = true
where slug = 'printable-planners';

update public.products
set category_slug = 'printed-planners'
where category_slug = 'printable-planners';

update public.products
set
  subtitle = 'A printed six-week revision planner with daily focus blocks and weekly reviews.',
  description = 'A printed planner for the weeks that matter most. Break each subject into small topics, plan focused study blocks, and review what actually moved forward every week. Printed on warm-white paper and delivered across Bangladesh.',
  type = 'physical',
  format = 'Printed planner · A5',
  price = 690,
  compare_at = 890,
  stock = 64,
  badge = 'Printed edition',
  includes = array[
    'One printed 6-week planner',
    'Subject breakdown pages',
    'Daily focus pages',
    'Revision tracker',
    'Weekly review pages'
  ],
  requirements = array['No special tools required'],
  specs = '[
    {"label":"Format","value":"A5 printed planner"},
    {"label":"Pages","value":"48 pages"},
    {"label":"Paper","value":"100 GSM warm-white"},
    {"label":"Delivery","value":"Ships in 2–4 days"}
  ]'::jsonb,
  tags = array['planner','exam','revision','printed'],
  featured = true
where slug = 'exam-focus-planner';

update public.products
set
  subtitle = 'A printed weekly planner pad for classes, deep work and rest.',
  description = 'A tear-off pad of weekly planning sheets designed for students who want a realistic plan, not an impossible one. Each sheet holds class blocks, deep-work slots, a small priority list and a place to protect your rest. Tear off the week when it is done.',
  type = 'physical',
  format = 'Printed planner pad · 52 sheets',
  price = 490,
  compare_at = null,
  stock = 80,
  badge = 'New',
  includes = array[
    '52 tear-off weekly sheets',
    'Class timetable page',
    'Deep-work blocks',
    'Priority list',
    'Rest reminder'
  ],
  requirements = array['No special tools required'],
  specs = '[
    {"label":"Format","value":"A5 tear-off pad"},
    {"label":"Sheets","value":"52 weekly sheets"},
    {"label":"Paper","value":"100 GSM warm-white"},
    {"label":"Delivery","value":"Ships in 2–4 days"}
  ]'::jsonb,
  tags = array['planner','weekly','printed','reset'],
  featured = false
where slug = 'weekly-study-planner';

update public.products
set
  subtitle = 'Two printed planners and two digital tools for a calmer semester.',
  description = 'A complete starting point for the semester: the printed Exam Focus Planner for the next six weeks, the tear-off weekly pad for the days in between, the Notion Student OS to hold the whole semester, and the Deep Work guide for the sessions that matter.',
  type = 'physical',
  format = 'Printed + digital bundle · 4 resources',
  price = 2290,
  compare_at = 3260,
  stock = 32,
  badge = 'Save 30%',
  includes = array[
    'Printed Exam Focus Planner',
    'Printed Weekly Study Planner',
    'Notion Student OS (digital)',
    'Deep Work Study Guide (digital)'
  ],
  requirements = array['A free Notion account','No special tools required'],
  specs = '[
    {"label":"Includes","value":"4 resources · 2 printed"},
    {"label":"Saving","value":"৳970 vs buying separately"},
    {"label":"Delivery","value":"Ships in 2–4 days"},
    {"label":"Digital access","value":"Added after payment"}
  ]'::jsonb,
  preview = '{"kind":"bundle","items":["Printed Exam Planner","Printed Weekly Planner","Notion Student OS","Deep Work Guide"]}'::jsonb,
  tags = array['bundle','students','semester','printed'],
  featured = true
where slug = 'student-starter-bundle';

update public.products
set
  subtitle = 'A focused digital preparation system for admission tests and university applications.',
  includes = array[
    'Admission preparation workbook',
    'Revision tracker',
    'Mistake log',
    'Test-day checklist',
    'Focus guide'
  ],
  specs = '[
    {"label":"Includes","value":"5 digital resources"},
    {"label":"Saving","value":"৳640 vs buying separately"},
    {"label":"Access","value":"Instant download"},
    {"label":"Best for","value":"Admission season"}
  ]'::jsonb,
  preview = '{"kind":"bundle","items":["Admission Workbook","Revision Tracker","Mistake Log","Focus Guide"]}'::jsonb
where slug = 'admission-prep-kit';

update public.promotions
set description = 'Pair the Notion Student OS with the printed Exam Focus Planner and give the next six weeks a shape you can actually keep.'
where title = 'A quieter way to begin again.';

delete from public.entitlements
where product_id = (select id from public.products where slug = 'exam-focus-planner');

commit;
