-- =====================================================================
-- Maadoo (มาดู) · Supabase setup — step 1: reviews + moderation
-- วิธีใช้ / How to use:
--   เปิด Supabase Dashboard → SQL Editor → วางไฟล์นี้ทั้งไฟล์ → Run
--   Open Supabase Dashboard → SQL Editor → paste this whole file → Run
--   รันซ้ำได้ ไม่ทำให้ข้อมูลหาย / Safe to run again; existing rows are kept.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) ตารางรีวิว / Reviews table
--    รีวิวใหม่เป็น 'pending' เสมอ จะแสดงต่อสาธารณะเมื่อเป็น 'approved'
--    New reviews are always 'pending'; they go public once 'approved'.
-- ---------------------------------------------------------------------
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  company_id  text not null check (company_id ~ '^[a-z0-9_-]{1,40}$'),
  role        text check (char_length(role) <= 80),
  type        text not null default 'emp' check (type in ('emp', 'intern')),
  rating      smallint not null check (rating between 1 and 5),
  mood        smallint not null check (mood between 0 and 2),
  ot          text not null check (ot in ('y', 'p', 'n', 'x')),
  recommend   text not null check (recommend in ('y', 'm', 'n')),
  title       text check (char_length(title) <= 120),
  pros        text check (char_length(pros) <= 1000),
  cons        text check (char_length(cons) <= 1000),
  salary      integer check (salary between 0 and 1000000),
  status      text not null default 'pending' check (status in ('pending', 'approved')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists reviews_status_company_idx on public.reviews (status, company_id);
create index if not exists reviews_user_idx on public.reviews (user_id);

-- ---------------------------------------------------------------------
-- 2) Row Level Security
--    ผู้ใช้เห็น/เพิ่ม/แก้/ลบได้เฉพาะรีวิวของตัวเอง คนที่ไม่ล็อกอินเข้าตารางนี้ไม่ได้เลย
--    Users can only see/add/edit/delete their own reviews; anon has no access.
-- ---------------------------------------------------------------------
alter table public.reviews enable row level security;

drop policy if exists "reviews: read own"   on public.reviews;
drop policy if exists "reviews: insert own" on public.reviews;
drop policy if exists "reviews: update own" on public.reviews;
drop policy if exists "reviews: delete own" on public.reviews;

create policy "reviews: read own" on public.reviews
  for select to authenticated
  using (user_id = (select auth.uid()));

-- ผู้ใช้ชั่วคราว (ลองใช้แบบไม่สมัคร / anonymous sign-in) เพิ่มรีวิวไม่ได้ ต้องผูกอีเมลก่อน
-- Guest users (anonymous sign-ins) can't add reviews until they add an email.
create policy "reviews: insert own" on public.reviews
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'pending'
    and (select (auth.jwt() ->> 'is_anonymous')::boolean) is not true
  );

create policy "reviews: update own" on public.reviews
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "reviews: delete own" on public.reviews
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- 3) ห้ามผู้ใช้เปลี่ยน status / Users can never change status
--    ชั้นที่ 1: สิทธิ์รายคอลัมน์ — ผู้ใช้เขียนได้เฉพาะคอลัมน์เนื้อหา
--               ส่ง status, user_id, company_id เองไม่ได้ (user_id มาจาก auth.uid())
--    Layer 1: column privileges — users may only write content columns;
--             status, user_id and company_id can't be sent (user_id comes from auth.uid()).
-- ---------------------------------------------------------------------
revoke all on public.reviews from anon, authenticated;
grant select, delete on public.reviews to authenticated;
grant insert (company_id, role, type, rating, mood, ot, recommend, title, pros, cons, salary)
  on public.reviews to authenticated;
grant update (role, type, rating, mood, ot, recommend, title, pros, cons, salary)
  on public.reviews to authenticated;

--    ชั้นที่ 2: ถ้าผู้ใช้แก้รีวิว (แม้จะ approved แล้ว) ให้กลับไปเป็น pending เพื่อตรวจใหม่
--    Layer 2: any edit by a user sends the review back to 'pending' for re-moderation.
--    แอดมินที่แก้ผ่าน SQL Editor / Table Editor (role postgres) ไม่โดนกฎนี้
--    Admins editing in the SQL Editor / Table Editor (role postgres) are not affected.
create or replace function public.reviews_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if current_user in ('authenticated', 'anon') then
    new.status := 'pending';
  end if;
  return new;
end;
$$;

drop trigger if exists reviews_before_update on public.reviews;
create trigger reviews_before_update
  before update on public.reviews
  for each row execute function public.reviews_before_update();

-- ---------------------------------------------------------------------
-- 4) รีวิวสาธารณะ / Public reviews
--    view นี้แสดงเฉพาะรีวิว approved และไม่มี user_id กับ salary
--    เพื่อไม่ให้ใครโยงรีวิวกลับไปหาคนเขียน และเงินเดือนใช้ทำสถิติเท่านั้น
--    This view shows approved reviews only, without user_id or salary,
--    so reviews can't be traced back to their author and salaries stay statistical.
--    จงใจให้ view ทำงานด้วยสิทธิ์เจ้าของ (security_invoker = false) เพราะตารางจริงเปิดให้อ่านได้แค่รีวิวของตัวเอง
--    Supabase linter จะเตือน "Security Definer View" — ตั้งใจแบบนี้ เพราะ view กรองแถวและคอลัมน์ไว้แล้ว
--    Intentionally runs with the owner's rights (security_invoker = false), since the table itself
--    only exposes a user's own rows. The Supabase linter will flag "Security Definer View"; that's
--    expected, because the view already filters rows and columns.
-- ---------------------------------------------------------------------
create or replace view public.approved_reviews
with (security_invoker = false) as
  select id, company_id, role, type, rating, mood, title, pros, cons, created_at
  from public.reviews
  where status = 'approved';

revoke all on public.approved_reviews from anon, authenticated;
grant select on public.approved_reviews to anon, authenticated;

-- =====================================================================
-- การตรวจรีวิว / Moderating reviews
--   ดูรีวิวที่รอตรวจ / List pending reviews:
--     select id, company_id, rating, title, pros, cons, created_at
--     from public.reviews where status = 'pending' order by created_at;
--   อนุมัติ / Approve:
--     update public.reviews set status = 'approved' where id = '<review id>';
--   หรือแก้คอลัมน์ status ใน Table Editor / Or edit the status column in the Table Editor.
--
-- ตั้งค่าล็อกอิน / Login settings (Authentication → URL Configuration):
--   Site URL:      https://maadoo.pages.dev
--   Redirect URLs: https://maadoo.pages.dev/**
--                  https://*.maadoo.pages.dev/**   (preview deploys)
--                  http://localhost:*/**           (local testing)
--   Authentication → Sign In / Providers → Email ต้องเปิดอยู่ / must be enabled.
--   ปุ่ม "ลองใช้แบบไม่สมัคร" ต้องเปิด Allow anonymous sign-ins
--   The "Try it without signing up" button needs "Allow anonymous sign-ins" enabled.
--   ถ้ามีคนใช้จริงเยอะ ควรเปิด CAPTCHA (Attack Protection) กันสร้างบัญชีชั่วคราวรัว ๆ
--   With real traffic, turn on CAPTCHA (Attack Protection) to stop mass guest sign-ups.
--
-- ห้ามใส่ service_role key หรือ secret key ในหน้าเว็บ เว็บใช้แค่ publishable key
-- Never put the service_role or secret key in the website; it only uses the publishable key.
-- =====================================================================
