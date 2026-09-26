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

-- ลบรีวิว: ปุ่ม "ลบ" ในเว็บใช้ policy นี้ ลบได้เฉพาะแถวที่ user_id ตรงกับคนที่ล็อกอินอยู่
-- ไม่มี policy อื่นที่ให้ลบรีวิวของคนอื่น (บริษัท/คนจ่ายเงิน/Plus ลบหรือซ่อนรีวิวใครไม่ได้)
-- ลบได้ทั้งรีวิวที่รอตรวจและที่เผยแพร่แล้ว — ลบแล้วหายจาก approved_reviews ทันที
-- Deleting: the website's "Delete" button relies on this policy. Only rows whose user_id is the
-- logged-in user can be deleted. No other policy lets anyone delete someone else's review
-- (companies, paying users and Plus can never remove or hide reviews).
-- Works for pending and approved reviews; a deleted review leaves approved_reviews right away.
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

-- =====================================================================
-- 5) รีวิวรุ่นพี่หลังปรึกษา / Mentor reviews after a session
--    1 การจอง = 1 รีวิว (unique user_id + booking_id) แก้/ลบได้เฉพาะของตัวเอง
--    One booking = one review; people can edit/delete only their own.
--    ทุกคนอ่านรีวิวได้ผ่าน view mentor_reviews_public (ไม่มี user_id / booking_id เพื่อไม่ให้โยงกลับหาคนเขียน)
--    Everyone reads reviews through the mentor_reviews_public view (no user_id / booking_id,
--    so reviews can't be traced back to their author).
--    reply = คำตอบจากรุ่นพี่ ใส่ได้เฉพาะแอดมินใน Table Editor / SQL Editor ผู้ใช้เขียนช่องนี้ไม่ได้
--    reply = the mentor's public answer; only admins set it (Table/SQL Editor), users can't write it.
--    รุ่นพี่ตอบรีวิวได้ แต่ลบหรือซ่อนรีวิวไม่ได้ / Mentors may reply but never delete or hide reviews.
-- =====================================================================
create table if not exists public.mentor_reviews (
  id          uuid primary key default gen_random_uuid(),
  mentor_id   text not null check (mentor_id ~ '^[a-z0-9_-]{1,40}$'),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  booking_id  text not null check (char_length(booking_id) between 1 and 80),
  stars       smallint not null check (stars between 1 and 5),
  tags        text[] not null default '{}'
              check (cardinality(tags) <= 6
                     and tags <@ array['direct','kind','real','ontime','resume','recommend']::text[]),
  comment     text check (char_length(comment) <= 300),
  reply       text check (char_length(reply) <= 500),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, booking_id)
);

create index if not exists mentor_reviews_mentor_idx on public.mentor_reviews (mentor_id, created_at desc);

alter table public.mentor_reviews enable row level security;

drop policy if exists "mentor_reviews: read own"   on public.mentor_reviews;
drop policy if exists "mentor_reviews: insert own" on public.mentor_reviews;
drop policy if exists "mentor_reviews: update own" on public.mentor_reviews;
drop policy if exists "mentor_reviews: delete own" on public.mentor_reviews;

-- ตารางจริง: เห็นเฉพาะแถวของตัวเอง (ใช้ตอนแก้/ลบ) / Base table: only your own rows (for edit/delete)
create policy "mentor_reviews: read own" on public.mentor_reviews
  for select to authenticated
  using (user_id = (select auth.uid()));

-- ผู้ใช้ชั่วคราว (anonymous) รีวิวไม่ได้ ต้องผูกอีเมลก่อน / Guests must add an email first
create policy "mentor_reviews: insert own" on public.mentor_reviews
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (select (auth.jwt() ->> 'is_anonymous')::boolean) is not true
  );

create policy "mentor_reviews: update own" on public.mentor_reviews
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "mentor_reviews: delete own" on public.mentor_reviews
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- สิทธิ์รายคอลัมน์: ผู้ใช้เขียน user_id / reply / created_at เองไม่ได้
-- Column privileges: users can't write user_id, reply or created_at themselves.
revoke all on public.mentor_reviews from anon, authenticated;
grant select, delete on public.mentor_reviews to authenticated;
grant insert (mentor_id, booking_id, stars, tags, comment) on public.mentor_reviews to authenticated;
grant update (stars, tags, comment) on public.mentor_reviews to authenticated;

create or replace function public.mentor_reviews_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  -- ผู้ใช้แก้คำตอบของรุ่นพี่ไม่ได้ / users can never change the mentor's reply
  if current_user in ('authenticated', 'anon') then
    new.reply := old.reply;
  end if;
  return new;
end;
$$;

drop trigger if exists mentor_reviews_before_update on public.mentor_reviews;
create trigger mentor_reviews_before_update
  before update on public.mentor_reviews
  for each row execute function public.mentor_reviews_before_update();

-- รีวิวสาธารณะ ทุกคนอ่านได้ (รวมคนที่ไม่ได้ล็อกอิน) / Public reviews, readable by everyone (logged in or not)
-- Supabase linter จะเตือน "Security Definer View" — ตั้งใจแบบนี้ เหมือน approved_reviews
-- The linter flags "Security Definer View"; intended, same as approved_reviews.
create or replace view public.mentor_reviews_public
with (security_invoker = false) as
  select id, mentor_id, stars, tags, comment, reply, created_at
  from public.mentor_reviews;

revoke all on public.mentor_reviews_public from anon, authenticated;
grant select on public.mentor_reviews_public to anon, authenticated;

-- ตอบรีวิวในฐานะรุ่นพี่ (แอดมิน) / Reply as the mentor (admin):
--   update public.mentor_reviews set reply = 'ขอบคุณมากนะ!' where id = '<review id>';

-- =====================================================================
-- 6) พรีเมียม: Maadoo Plus · เหรียญมาดู · ถามรุ่นพี่
--    Premium: Maadoo Plus · Maadoo coins · Ask a mentor
--    ⚠️ เดโม: ยังไม่มีการชำระเงินจริง ผู้ใช้จึง "จ่าย (จำลอง)" แล้วต่ออายุ Plus / เติมเหรียญเองได้
--       ก่อนเปิดรับเงินจริง ต้องย้ายการต่ออายุ plus_until และการเติมเหรียญ (kind = 'topup')
--       ไปทำใน Edge Function / webhook ของผู้ให้บริการชำระเงิน แล้วถอดสิทธิ์ส่วนนั้นจากผู้ใช้
--    ⚠️ Demo: there is no real payment yet, so users "pay (simulated)" and extend Plus / top up
--       coins themselves. Before taking real money, move plus_until renewals and top-ups
--       (kind = 'topup') into an Edge Function / payment webhook and revoke those rights from users.
-- =====================================================================

-- ---------- 6.1 profiles: สถานะ Plus + ยอดเหรียญ / Plus status + coin balance ----------
create table if not exists public.profiles (
  id                  uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  plus_until          timestamptz,
  coins               integer not null default 0 check (coins >= 0),
  free_month_claimed  boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "profiles: read own"   on public.profiles;
drop policy if exists "profiles: insert own" on public.profiles;
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles: insert own" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- ยอดเหรียญ (coins) เขียนเองไม่ได้ มาจาก coin_ledger เท่านั้น / coins can't be written; only coin_ledger changes it
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id) on public.profiles to authenticated;
grant update (plus_until, free_month_claimed) on public.profiles to authenticated;

create or replace function public.profiles_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if current_user in ('authenticated', 'anon') then
    -- Plus ต่อได้ไม่เกิน ~13 เดือนล่วงหน้า และย่อให้สั้นลงเองไม่ได้ / at most ~13 months ahead, never shortened
    if new.plus_until is distinct from old.plus_until then
      if new.plus_until is null or new.plus_until > now() + interval '400 days'
         or (old.plus_until is not null and new.plus_until < old.plus_until) then
        raise exception 'invalid plus_until' using errcode = 'check_violation';
      end if;
    end if;
    -- รับ Plus ฟรีจากภารกิจได้ครั้งเดียว และต้องมีรีวิวบริษัทอย่างน้อย 3 รีวิว
    -- The free Plus month can be claimed once, and needs at least 3 company reviews.
    if old.free_month_claimed and not new.free_month_claimed then
      new.free_month_claimed := true;
    end if;
    if new.free_month_claimed and not old.free_month_claimed
       and (select count(*) from public.reviews r where r.user_id = new.id) < 3 then
      raise exception 'need 3 reviews' using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_before_update on public.profiles;
create trigger profiles_before_update
  before update on public.profiles
  for each row execute function public.profiles_before_update();

-- ---------- 6.2 coin_ledger: ทุกการได้/ใช้เหรียญ / every coin earned or spent ----------
--   kind: mission (ภารกิจ) · review (จากรีวิว รอตรวจก่อน) · topup (เติม) · plus (100/เดือนของ Plus) · spend (ใช้)
--   ref:  กันรับซ้ำ เช่น 'mission:answers:2026-W39', 'plus:2026-09' / prevents double claims
create table if not exists public.coin_ledger (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  delta       integer not null check (delta <> 0 and delta between -5000 and 5000),
  kind        text not null check (kind in ('mission', 'review', 'topup', 'plus', 'spend')),
  ref         text check (char_length(ref) <= 80),
  status      text not null default 'ok' check (status in ('ok', 'pending')),
  created_at  timestamptz not null default now()
);
create unique index if not exists coin_ledger_user_ref_idx on public.coin_ledger (user_id, ref) where ref is not null;
create index if not exists coin_ledger_user_idx on public.coin_ledger (user_id, created_at desc);

alter table public.coin_ledger enable row level security;
drop policy if exists "coin_ledger: read own"   on public.coin_ledger;
drop policy if exists "coin_ledger: insert own" on public.coin_ledger;
create policy "coin_ledger: read own" on public.coin_ledger
  for select to authenticated using (user_id = (select auth.uid()));
create policy "coin_ledger: insert own" on public.coin_ledger
  for insert to authenticated
  with check (user_id = (select auth.uid())
              and (select (auth.jwt() ->> 'is_anonymous')::boolean) is not true);

-- ผู้ใช้เพิ่มรายการได้ แต่แก้/ลบไม่ได้ (สถานะ pending → ok ทำโดยแอดมินหลังตรวจรีวิว)
-- Users can add entries but never edit/delete them (admins flip pending → ok after moderation).
revoke all on public.coin_ledger from anon, authenticated;
grant select on public.coin_ledger to authenticated;
grant insert (delta, kind, ref) on public.coin_ledger to authenticated;

create or replace function public.coin_ledger_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  bal integer;
  month_earned integer;
begin
  -- ยอดเหรียญ = ผลรวมรายการที่ ok ใน coin_ledger (ไม่เก็บยอดแยก จึงไม่มีทางไม่ตรงกัน)
  -- Balance = sum of 'ok' ledger rows (no separately stored balance, so it can't drift)
  perform pg_advisory_xact_lock(hashtext(new.user_id::text));
  select coalesce(sum(delta), 0) into bal from public.coin_ledger where user_id = new.user_id and status = 'ok';
  -- security definer: current_user คือเจ้าของฟังก์ชัน จึงดู role ของผู้เรียกจาก setting แทน
  -- security definer: current_user is the owner here, so read the caller's role from the setting
  if coalesce(current_setting('role', true), 'none') in ('authenticated', 'anon') then
    new.status := case when new.kind = 'review' then 'pending' else 'ok' end;
    if new.kind in ('mission', 'review') then
      if new.delta not in (15, 20, 30, 50) then
        raise exception 'invalid mission reward' using errcode = 'check_violation';
      end if;
      -- เหรียญจากภารกิจรวมไม่เกิน 300/เดือน / mission coins capped at 300 a month
      select coalesce(sum(delta), 0) into month_earned from public.coin_ledger
        where user_id = new.user_id and kind in ('mission', 'review')
          and created_at >= date_trunc('month', now());
      if month_earned + new.delta > 300 then
        raise exception 'monthly mission cap reached' using errcode = 'check_violation';
      end if;
    elsif new.kind = 'topup' then
      if new.delta not in (100, 300, 600) then
        raise exception 'invalid top-up' using errcode = 'check_violation';
      end if;
    elsif new.kind = 'plus' then
      if new.delta <> 100 or new.ref is distinct from 'plus:' || to_char(now(), 'YYYY-MM')
         or not exists (select 1 from public.profiles p where p.id = new.user_id and p.plus_until > now()) then
        raise exception 'invalid plus coins' using errcode = 'check_violation';
      end if;
    elsif new.kind = 'spend' then
      if new.delta >= 0 or bal + new.delta < 0 then
        raise exception 'not enough coins' using errcode = 'check_violation';
      end if;
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function public.coin_ledger_before_insert() from public, anon, authenticated;

drop trigger if exists coin_ledger_before_insert on public.coin_ledger;
create trigger coin_ledger_before_insert
  before insert on public.coin_ledger
  for each row execute function public.coin_ledger_before_insert();
-- รุ่นก่อนเก็บยอดไว้ใน profiles.coins ซึ่งอาจไม่ตรงกับประวัติ เลิกใช้แล้ว
-- Earlier versions stored the balance in profiles.coins, which could drift; no longer used.
drop trigger if exists coin_ledger_after_approve on public.coin_ledger;
drop function if exists public.coin_ledger_after_approve();
comment on column public.profiles.coins is 'deprecated: balance is computed from coin_ledger (see my_coins view)';

-- ยอดเหรียญของฉัน (อ่านได้เฉพาะของตัวเองผ่าน RLS) / My coin balance (own rows only via RLS)
create or replace view public.my_coins
with (security_invoker = true) as
  select coalesce(sum(delta) filter (where status = 'ok'), 0)::integer      as coins,
         coalesce(sum(delta) filter (where status = 'pending'), 0)::integer as pending
  from public.coin_ledger
  where user_id = (select auth.uid());

revoke all on public.my_coins from anon, authenticated;
grant select on public.my_coins to authenticated;

-- ---------- 6.3 questions: ถามรุ่นพี่ (สิทธิ์ Plus) / Ask a mentor (Plus) ----------
--   status: waiting (รอคำตอบ) · answered (ตอบแล้ว) · closed (ปิดแล้ว)
--   counted = ใช้สิทธิ์ไป 1 ครั้ง · refunded = คืนสิทธิ์ (รุ่นพี่ไม่ตอบใน 48 ชม.)
--   ⚠️ เดโม: รุ่นพี่เป็นตัวละครสมมติ คำตอบถูกจำลองในเว็บแล้วบันทึกลง messages ของแถวนี้
--   Demo: mentors are fictional; the site simulates their replies and saves them in messages.
create table if not exists public.questions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  mentor_id         text not null check (mentor_id ~ '^[a-z0-9_-]{1,40}$'),
  status            text not null default 'waiting' check (status in ('waiting', 'answered', 'closed')),
  counted           boolean not null default false,
  refunded          boolean not null default false,
  messages          jsonb not null default '[]'::jsonb
                    check (jsonb_typeof(messages) = 'array' and octet_length(messages::text) <= 20000),
  created_at        timestamptz not null default now(),
  answered_at       timestamptz,
  last_activity_at  timestamptz not null default now(),
  closed_at         timestamptz
);
create index if not exists questions_user_idx on public.questions (user_id, created_at desc);

alter table public.questions enable row level security;
drop policy if exists "questions: read own"   on public.questions;
drop policy if exists "questions: insert own" on public.questions;
drop policy if exists "questions: update own" on public.questions;
create policy "questions: read own" on public.questions
  for select to authenticated using (user_id = (select auth.uid()));
create policy "questions: insert own" on public.questions
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "questions: update own" on public.questions
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

revoke all on public.questions from anon, authenticated;
grant select on public.questions to authenticated;
grant insert (mentor_id, messages) on public.questions to authenticated;
grant update (status, counted, refunded, messages, answered_at, last_activity_at, closed_at) on public.questions to authenticated;

create or replace function public.questions_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  open_n integer;
  used_n integer;
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.status := 'waiting'; new.counted := false; new.refunded := false;
    if not exists (select 1 from public.profiles p where p.id = new.user_id and p.plus_until > now()) then
      raise exception 'plus required' using errcode = 'check_violation';
    end if;
    select count(*) into open_n from public.questions
      where user_id = new.user_id and status in ('waiting', 'answered');
    if open_n >= 2 then
      raise exception 'max 2 open questions' using errcode = 'check_violation';
    end if;
    -- 5 สิทธิ์/เดือน ไม่ทบ: ที่ใช้ไปเดือนนี้ + ที่เปิดค้างอยู่ / 5 a month, no rollover: used this month + open
    select count(*) into used_n from public.questions
      where user_id = new.user_id and counted and closed_at >= date_trunc('month', now());
    if used_n + open_n >= 5 then
      raise exception 'monthly quota used' using errcode = 'check_violation';
    end if;
  else
    -- ปิดแล้วเปิดใหม่ไม่ได้ และใช้สิทธิ์ไปแล้วคืนเองไม่ได้ / closed stays closed, counted can't be undone
    if old.status = 'closed' then
      new.status := 'closed'; new.counted := old.counted; new.refunded := old.refunded; new.closed_at := old.closed_at;
    end if;
    if old.counted then new.counted := true; end if;
    if new.counted and new.refunded then
      raise exception 'counted and refunded' using errcode = 'check_violation';
    end if;
    if new.status = 'closed' and new.closed_at is null then new.closed_at := now(); end if;
  end if;
  return new;
end;
$$;


drop trigger if exists questions_before_write on public.questions;
create trigger questions_before_write
  before insert or update on public.questions
  for each row execute function public.questions_before_write();

-- อนุมัติเหรียญจากรีวิว (หลังรีวิวผ่านการตรวจ) / Approve review coins after moderation:
--   update public.coin_ledger set status = 'ok' where id = '<ledger id>';

-- =====================================================================
-- 7) โปรโมชัน: ผู้บุกเบิก 1,000 คนแรก · ชวนเพื่อน · 50 บริษัทแรก
--    Promotions: first 1,000 pioneers · invite a friend · first 50 companies
-- =====================================================================

-- ---------- 7.1 ผู้บุกเบิก: จำนวนสมาชิกจริง + ลำดับการสมัครของฉัน ----------
--   นับเฉพาะบัญชีที่ไม่ใช่ผู้ใช้ชั่วคราว / counts non-guest accounts only
create or replace function public.pioneer_stats()
returns json
language sql
stable
security definer
set search_path = ''
as $$
  select json_build_object(
    'members', (select count(*) from auth.users u where coalesce(u.is_anonymous, false) = false),
    'rank', (select count(*) from auth.users u, auth.users me
             where me.id = auth.uid() and coalesce(me.is_anonymous, false) = false
               and coalesce(u.is_anonymous, false) = false and u.created_at <= me.created_at)
  );
$$;
revoke execute on function public.pioneer_stats() from public;
grant execute on function public.pioneer_stats() to anon, authenticated;

-- ---------- 7.2 ชวนเพื่อน: โค้ดชวน + ใครชวนใคร / invite codes + who invited whom ----------
alter table public.profiles add column if not exists invite_code text;
alter table public.profiles add column if not exists referred_by uuid references auth.users (id) on delete set null;
create unique index if not exists profiles_invite_code_idx on public.profiles (invite_code);

create or replace function public.profiles_set_invite_code()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.invite_code is null then
    new.invite_code := 'MAADOO-' || upper(substr(md5(new.id::text), 1, 6));
  end if;
  return new;
end;
$$;
drop trigger if exists profiles_set_invite_code on public.profiles;
create trigger profiles_set_invite_code
  before insert on public.profiles
  for each row execute function public.profiles_set_invite_code();
update public.profiles set invite_code = 'MAADOO-' || upper(substr(md5(id::text), 1, 6)) where invite_code is null;

-- เหรียญชวนเพื่อน (kind = 'referral') เพิ่มได้ผ่านฟังก์ชันด้านล่างเท่านั้น
-- Referral coins (kind = 'referral') can only be added through the function below.
alter table public.coin_ledger drop constraint if exists coin_ledger_kind_check;
alter table public.coin_ledger add constraint coin_ledger_kind_check
  check (kind in ('mission', 'review', 'topup', 'plus', 'spend', 'referral'));

create or replace function public.coin_ledger_guard_referral()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.kind = 'referral' and coalesce(current_setting('maadoo.referral', true), '') <> 'on' then
    raise exception 'referral coins only via claim_referral_reward()' using errcode = 'check_violation';
  end if;
  if new.kind = 'referral' then new.status := 'ok'; end if;
  return new;
end;
$$;
drop trigger if exists coin_ledger_guard_referral on public.coin_ledger;
create trigger coin_ledger_guard_referral
  before insert on public.coin_ledger
  for each row execute function public.coin_ledger_guard_referral();

-- ใช้โค้ดของเพื่อน (ครั้งเดียว ห้ามใช้โค้ดตัวเอง) / use a friend's code (once, not your own)
create or replace function public.use_invite_code(code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  inviter uuid;
begin
  if me is null or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'login required' using errcode = 'check_violation';
  end if;
  select id into inviter from public.profiles where invite_code = upper(trim(code));
  if inviter is null then raise exception 'invalid code' using errcode = 'check_violation'; end if;
  if inviter = me then raise exception 'own code' using errcode = 'check_violation'; end if;
  insert into public.profiles (id) values (me) on conflict (id) do nothing;
  update public.profiles set referred_by = inviter where id = me and referred_by is null;
  return found;
end;
$$;

-- เพื่อนเขียนรีวิวแรกแล้ว → ได้คนละ 50 เหรียญ (ครั้งเดียว) / friend's first review → 50 coins each (once)
create or replace function public.claim_referral_reward()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  inviter uuid;
begin
  select referred_by into inviter from public.profiles where id = me;
  if inviter is null then return 0; end if;
  if not exists (select 1 from public.reviews r where r.user_id = me) then return 0; end if;
  if exists (select 1 from public.coin_ledger where user_id = me and ref = 'referral:' || me::text) then return 0; end if;
  perform set_config('maadoo.referral', 'on', true);
  insert into public.coin_ledger (user_id, delta, kind, ref) values (me, 50, 'referral', 'referral:' || me::text);
  insert into public.coin_ledger (user_id, delta, kind, ref) values (inviter, 50, 'referral', 'referral:' || me::text)
    on conflict do nothing;
  perform set_config('maadoo.referral', '', true);
  return 50;
end;
$$;

revoke execute on function public.use_invite_code(text) from public, anon;
revoke execute on function public.claim_referral_reward() from public, anon;
grant execute on function public.use_invite_code(text) to authenticated;
grant execute on function public.claim_referral_reward() to authenticated;

-- ---------- 7.3 แพ็กเกจบริษัท (เดโม) + สิทธิ์ 50 บริษัทแรก / employer plans (demo) + first-50 offer ----------
create table if not exists public.employer_signups (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  company     text not null check (char_length(company) between 1 and 120),
  plan        text not null check (plan in ('starter', 'pro', 'enterprise')),
  early_bird  boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table public.employer_signups enable row level security;
drop policy if exists "employer_signups: read own"   on public.employer_signups;
drop policy if exists "employer_signups: insert own" on public.employer_signups;
create policy "employer_signups: read own" on public.employer_signups
  for select to authenticated using (user_id = (select auth.uid()));
create policy "employer_signups: insert own" on public.employer_signups
  for insert to authenticated
  with check (user_id = (select auth.uid()) and (select (auth.jwt() ->> 'is_anonymous')::boolean) is not true);
revoke all on public.employer_signups from anon, authenticated;
grant select on public.employer_signups to authenticated;
grant insert (company, plan) on public.employer_signups to authenticated;

-- 50 บริษัทแรกที่สมัคร Pro ได้ early_bird (ตั้งค่าโดยระบบ ไม่ใช่ผู้ใช้) / first 50 Pro sign-ups get early_bird
create or replace function public.employer_signups_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext('employer_early_bird'));
  new.early_bird := new.plan = 'pro'
    and (select count(*) from public.employer_signups where early_bird) < 50;
  return new;
end;
$$;
revoke execute on function public.employer_signups_before_insert() from public, anon, authenticated;
drop trigger if exists employer_signups_before_insert on public.employer_signups;
create trigger employer_signups_before_insert
  before insert on public.employer_signups
  for each row execute function public.employer_signups_before_insert();

create or replace function public.early_bird_left()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select greatest(0, 50 - (select count(*) from public.employer_signups where early_bird))::integer;
$$;
revoke execute on function public.early_bird_left() from public;
grant execute on function public.early_bird_left() to anon, authenticated;

-- ให้ผู้ใช้อ่านโค้ดชวน + ใครชวนตัวเองได้ (เขียนเองไม่ได้) / users can read their invite code (not write it)
grant select on public.profiles to authenticated;

-- =====================================================================
-- 8) คุยกับรุ่นพี่จริง ขั้นที่ 1 / Real mentors, step 1
--    admins · mentor_applications · mentors · chat_rooms · messages · chat_reports
--    + Storage bucket แบบ private "chat-files" + Realtime
--    รุ่นพี่ตัวอย่าง (m1–m9) ยังเป็นข้อมูลสมมติในเว็บ ตอบอัตโนมัติเหมือนเดิม
--    Sample mentors (m1–m9) stay fictional in the site and auto-reply as before.
--
--    ใส่ตัวเองเป็นแอดมิน / Make yourself an admin (run once, with your login email):
--      insert into public.admins (user_id)
--      select id from auth.users where email = 'you@example.com'
--      on conflict do nothing;
-- =====================================================================

-- ---------- 8.1 admins ----------
create table if not exists public.admins (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);
alter table public.admins enable row level security;
drop policy if exists "admins: read own" on public.admins;
create policy "admins: read own" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.admins from anon, authenticated;
grant select on public.admins to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------- 8.2 mentor_applications: ใบสมัครรุ่นพี่ / mentor applications ----------
--   สถานะ: pending (รออนุมัติ) · approved (อนุมัติแล้ว) · rejected (ไม่ผ่าน)
--   ผู้สมัครเห็นเฉพาะใบของตัวเอง แอดมินเห็นทุกใบ เปลี่ยนสถานะได้ผ่าน review_mentor_application() เท่านั้น
create table if not exists public.mentor_applications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nickname     text not null check (char_length(btrim(nickname)) between 1 and 30),
  field        text not null check (char_length(btrim(field)) between 2 and 60),
  company      text check (char_length(company) <= 60),
  years        smallint not null check (years between 0 and 50),
  topics       text[] not null
               check (cardinality(topics) between 1 and 5
                      and topics <@ array['intern','resume','salary','switch','rights']::text[]),
  contact      text not null check (char_length(contact) <= 200
                      and (contact ~* '^(https?://)?([a-z]{2,3}\.)?linkedin\.com/\S+$'
                           or contact ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  price        smallint not null check (price between 99 and 249),
  bio          text check (char_length(bio) <= 200),
  rules_ok     boolean not null check (rules_ok),
  age18        boolean not null check (age18),
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note   text check (char_length(admin_note) <= 300),
  created_at   timestamptz not null default now(),
  reviewed_at  timestamptz
);
create index if not exists mentor_applications_user_idx on public.mentor_applications (user_id, created_at desc);
create unique index if not exists mentor_applications_one_pending on public.mentor_applications (user_id) where status = 'pending';

alter table public.mentor_applications enable row level security;
drop policy if exists "mentor_applications: read own or admin" on public.mentor_applications;
drop policy if exists "mentor_applications: insert own" on public.mentor_applications;
create policy "mentor_applications: read own or admin" on public.mentor_applications
  for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "mentor_applications: insert own" on public.mentor_applications
  for insert to authenticated
  with check (user_id = (select auth.uid())
              and (select (auth.jwt() ->> 'is_anonymous')::boolean) is not true);
revoke all on public.mentor_applications from anon, authenticated;
grant select on public.mentor_applications to authenticated;
grant insert (nickname, field, company, years, topics, contact, price, bio, rules_ok, age18)
  on public.mentor_applications to authenticated;

-- ---------- 8.3 mentors: รุ่นพี่จริงที่อนุมัติแล้ว (ชื่อเล่นเท่านั้น) / approved real mentors (nickname only) ----------
create table if not exists public.mentors (
  id           uuid primary key references auth.users (id) on delete cascade,
  nickname     text not null check (char_length(btrim(nickname)) between 1 and 30),
  field        text not null check (char_length(field) <= 60),
  company      text check (char_length(company) <= 60),
  years        smallint not null check (years between 0 and 50),
  topics       text[] not null default '{}',
  price        smallint not null check (price between 99 and 249),
  bio          text check (char_length(bio) <= 200),
  available    boolean not null default true,
  active       boolean not null default true,
  approved_at  timestamptz not null default now()
);
alter table public.mentors enable row level security;
drop policy if exists "mentors: read active" on public.mentors;
drop policy if exists "mentors: update own" on public.mentors;
create policy "mentors: read active" on public.mentors
  for select to anon, authenticated using (active or id = (select auth.uid()));
create policy "mentors: update own" on public.mentors
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke all on public.mentors from anon, authenticated;
grant select on public.mentors to anon, authenticated;
grant update (available) on public.mentors to authenticated;

-- แอดมินอนุมัติ/ปฏิเสธ / admin approves or rejects
create or replace function public.review_mentor_application(app uuid, approve boolean, note text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  a public.mentor_applications;
begin
  if not public.is_admin() then
    raise exception 'admins only' using errcode = 'insufficient_privilege';
  end if;
  select * into a from public.mentor_applications where id = app for update;
  if not found then
    raise exception 'application not found' using errcode = 'no_data_found';
  end if;
  update public.mentor_applications
     set status = case when approve then 'approved' else 'rejected' end,
         admin_note = left(note, 300), reviewed_at = now()
   where id = app;
  if approve then
    insert into public.mentors (id, nickname, field, company, years, topics, price, bio, active, approved_at)
    values (a.user_id, btrim(a.nickname), btrim(a.field), nullif(btrim(coalesce(a.company, '')), ''), a.years,
            a.topics, a.price, a.bio, true, now())
    on conflict (id) do update
      set nickname = excluded.nickname, field = excluded.field, company = excluded.company,
          years = excluded.years, topics = excluded.topics, price = excluded.price,
          bio = excluded.bio, active = true;
  else
    update public.mentors set active = false where id = a.user_id;
  end if;
  return case when approve then 'approved' else 'rejected' end;
end;
$$;
revoke execute on function public.review_mentor_application(uuid, boolean, text) from public, anon;
grant execute on function public.review_mentor_application(uuid, boolean, text) to authenticated;

-- ---------- 8.4 chat_rooms: 1 คำถาม = 1 ห้อง / one question = one room ----------
--   สร้างห้องหลังสร้างแถว questions แล้ว (กติกาถามฟรี 5 คำถาม/เดือน ยังตรวจที่ questions เหมือนเดิม)
--   The room is created after the questions row, so the 5-a-month Plus rule still applies there.
create table if not exists public.chat_rooms (
  id               uuid primary key default gen_random_uuid(),
  question_id      uuid not null unique references public.questions (id) on delete cascade,
  student_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  mentor_id        uuid not null references public.mentors (id) on delete cascade,
  student_name     text not null default '' check (char_length(student_name) <= 30),
  status           text not null default 'waiting' check (status in ('waiting', 'answered', 'closed')),
  created_at       timestamptz not null default now(),
  last_msg_at      timestamptz not null default now(),
  last_sender      uuid,
  last_preview     text not null default '',
  first_reply_at   timestamptz,
  student_read_at  timestamptz not null default now(),
  mentor_read_at   timestamptz not null default 'epoch',
  student_live     boolean not null default false,
  mentor_live      boolean not null default false,
  blocked_by       uuid
);
create index if not exists chat_rooms_student_idx on public.chat_rooms (student_id, last_msg_at desc);
create index if not exists chat_rooms_mentor_idx on public.chat_rooms (mentor_id, last_msg_at desc);

create or replace function public.is_room_member(room uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.chat_rooms r
                 where r.id = room and auth.uid() in (r.student_id, r.mentor_id));
$$;
create or replace function public.chat_can_post(room uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.chat_rooms r
                 where r.id = room and auth.uid() in (r.student_id, r.mentor_id)
                   and r.status <> 'closed' and r.blocked_by is null);
$$;
-- สำหรับ Storage: ชื่อโฟลเดอร์เป็นข้อความ / for Storage: folder names are text
create or replace function public.room_folder_ok(folder text, for_write boolean)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if folder is null or folder !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return false;
  end if;
  if for_write then return public.chat_can_post(folder::uuid); end if;
  return public.is_room_member(folder::uuid)
      or (public.is_admin() and exists (select 1 from public.chat_reports where room_id = folder::uuid));
end;
$$;

alter table public.chat_rooms enable row level security;
drop policy if exists "chat_rooms: members read" on public.chat_rooms;
drop policy if exists "chat_rooms: student creates" on public.chat_rooms;
create policy "chat_rooms: members read" on public.chat_rooms
  for select to authenticated using ((select auth.uid()) in (student_id, mentor_id));
create policy "chat_rooms: student creates" on public.chat_rooms
  for insert to authenticated
  with check (student_id = (select auth.uid())
              and (select (auth.jwt() ->> 'is_anonymous')::boolean) is not true);
revoke all on public.chat_rooms from anon, authenticated;
grant select on public.chat_rooms to authenticated;
grant insert (question_id, mentor_id, student_name) on public.chat_rooms to authenticated;

create or replace function public.chat_rooms_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  q public.questions;
begin
  if current_setting('role', true) not in ('authenticated', 'anon') then
    return new;
  end if;
  select * into q from public.questions where id = new.question_id;
  if not found or q.user_id <> auth.uid() or q.status = 'closed' then
    raise exception 'question not yours or closed' using errcode = 'check_violation';
  end if;
  if q.mentor_id <> new.mentor_id::text then
    raise exception 'mentor mismatch' using errcode = 'check_violation';
  end if;
  if new.mentor_id = auth.uid() then
    raise exception 'cannot ask yourself' using errcode = 'check_violation';
  end if;
  if not exists (select 1 from public.mentors m where m.id = new.mentor_id and m.active and m.available) then
    raise exception 'mentor unavailable' using errcode = 'check_violation';
  end if;
  new.student_id := auth.uid(); new.status := 'waiting'; new.created_at := now();
  new.last_msg_at := now(); new.last_sender := null; new.last_preview := '';
  new.first_reply_at := null; new.student_read_at := now(); new.mentor_read_at := 'epoch';
  new.student_live := false; new.mentor_live := false; new.blocked_by := null;
  new.student_name := left(btrim(coalesce(new.student_name, '')), 30);
  return new;
end;
$$;
revoke execute on function public.chat_rooms_before_insert() from public, anon, authenticated;
drop trigger if exists chat_rooms_before_insert on public.chat_rooms;
create trigger chat_rooms_before_insert
  before insert on public.chat_rooms
  for each row execute function public.chat_rooms_before_insert();

-- สถานะห้องตามคำถาม (ผู้ถามปิดคำถาม → ห้องปิด) / room status follows the question
create or replace function public.questions_sync_room()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    update public.chat_rooms set status = new.status where question_id = new.id;
  end if;
  return new;
end;
$$;
revoke execute on function public.questions_sync_room() from public, anon, authenticated;
drop trigger if exists questions_sync_room on public.questions;
create trigger questions_sync_room
  after update on public.questions
  for each row execute function public.questions_sync_room();

-- อ่านแล้ว / คุยสดแล้ว / บล็อก (อัปเดตห้องได้ผ่านฟังก์ชันเหล่านี้เท่านั้น)
-- read receipts / live call done / block (the only ways to update a room)
create or replace function public.chat_mark_read(room uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.chat_rooms
     set student_read_at = case when student_id = auth.uid() then now() else student_read_at end,
         mentor_read_at  = case when mentor_id  = auth.uid() then now() else mentor_read_at end
   where id = room and auth.uid() in (student_id, mentor_id);
$$;
create or replace function public.chat_confirm_live(room uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.chat_rooms
     set student_live = student_live or student_id = auth.uid(),
         mentor_live  = mentor_live  or mentor_id  = auth.uid()
   where id = room and auth.uid() in (student_id, mentor_id);
$$;
create or replace function public.chat_set_block(room uuid, blocked boolean)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.chat_rooms
     set blocked_by = case when blocked then coalesce(blocked_by, auth.uid())
                           when blocked_by = auth.uid() then null else blocked_by end
   where id = room and auth.uid() in (student_id, mentor_id);
$$;
revoke execute on function public.is_room_member(uuid) from public, anon;
revoke execute on function public.chat_can_post(uuid) from public, anon;
revoke execute on function public.chat_mark_read(uuid) from public, anon;
revoke execute on function public.chat_confirm_live(uuid) from public, anon;
revoke execute on function public.chat_set_block(uuid, boolean) from public, anon;
grant execute on function public.is_room_member(uuid) to authenticated;
grant execute on function public.chat_can_post(uuid) to authenticated;
grant execute on function public.chat_mark_read(uuid) to authenticated;
grant execute on function public.chat_confirm_live(uuid) to authenticated;
grant execute on function public.chat_set_block(uuid, boolean) to authenticated;

-- ---------- 8.5 chat_reports: รายงานห้องแชท (แอดมินอ่านได้) / chat reports (admins can read) ----------
create table if not exists public.chat_reports (
  id           uuid primary key default gen_random_uuid(),
  room_id      uuid not null references public.chat_rooms (id) on delete cascade,
  reporter_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  message_id   uuid,
  reason       text not null check (reason in ('spam', 'harass', 'scam', 'contact', 'other')),
  note         text check (char_length(note) <= 300),
  created_at   timestamptz not null default now()
);
alter table public.chat_reports enable row level security;
drop policy if exists "chat_reports: read own or admin" on public.chat_reports;
drop policy if exists "chat_reports: members insert" on public.chat_reports;
create policy "chat_reports: read own or admin" on public.chat_reports
  for select to authenticated using (reporter_id = (select auth.uid()) or (select public.is_admin()));
create policy "chat_reports: members insert" on public.chat_reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()) and public.is_room_member(room_id));
revoke all on public.chat_reports from anon, authenticated;
grant select on public.chat_reports to authenticated;
grant insert (room_id, message_id, reason, note) on public.chat_reports to authenticated;
revoke execute on function public.room_folder_ok(text, boolean) from public, anon;
grant execute on function public.room_folder_ok(text, boolean) to authenticated;

-- ---------- 8.6 messages: ข้อความในห้อง (อ่าน/เขียนได้เฉพาะ 2 คนในห้อง) / room messages (the two members only) ----------
--   เบอร์โทร / LINE ID / อีเมล / ลิงก์ติดต่อ ถูกแทนที่ด้วย [hidden] ตอนบันทึก จนกว่าทั้งสองฝั่งยืนยันว่าคุยสดครั้งแรกแล้ว
--   Phone numbers, LINE IDs, emails and contact links are replaced with [hidden] on save
--   until both sides confirm their first live call. The original text is never stored.
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references public.chat_rooms (id) on delete cascade,
  sender_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body        text not null default '' check (char_length(body) <= 2000),
  file_path   text check (char_length(file_path) <= 300),
  file_name   text check (char_length(file_name) <= 120),
  file_type   text check (file_type in ('image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf')),
  file_size   integer check (file_size between 1 and 5242880),
  masked      boolean not null default false,
  created_at  timestamptz not null default now(),
  check (char_length(btrim(body)) > 0 or file_path is not null)
);
create index if not exists messages_room_idx on public.messages (room_id, created_at);

alter table public.messages enable row level security;
drop policy if exists "messages: members read" on public.messages;
drop policy if exists "messages: members send" on public.messages;
create policy "messages: members read" on public.messages
  for select to authenticated
  using (public.is_room_member(room_id)
         or ((select public.is_admin()) and exists (select 1 from public.chat_reports cr where cr.room_id = messages.room_id)));
create policy "messages: members send" on public.messages
  for insert to authenticated
  with check (sender_id = (select auth.uid()) and public.chat_can_post(room_id));
revoke all on public.messages from anon, authenticated;
grant select on public.messages to authenticated;
grant insert (room_id, body, file_path, file_name, file_type, file_size) on public.messages to authenticated;

create or replace function public.mask_contacts(t text)
returns text
language sql
immutable
set search_path = ''
as $$
  select regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(coalesce(t, ''),
    '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', '[hidden]', 'g'),
    '(https?://|www\.)\S+|\m[A-Za-z0-9-]+\.(com|net|org|me|co|th|io|ly|gl|gg|link)(/\S*)?', '[hidden]', 'gi'),
    '(line|ไลน์|ig|ไอจี|instagram|facebook|fb|เฟส|telegram|discord|tel|โทร)\s*(id)?\s*[:：]?\s*@?[A-Za-z0-9._-]{3,}', '[hidden]', 'gi'),
    '@[A-Za-z0-9._-]{3,}', '[hidden]', 'g'),
    '\+?\d([-. ]?\d){8,11}', '[hidden]', 'g');
$$;

create or replace function public.messages_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.chat_rooms;
  m text;
begin
  select * into r from public.chat_rooms where id = new.room_id;
  new.created_at := now();
  if current_setting('role', true) in ('authenticated', 'anon') then
    new.sender_id := auth.uid();
  end if;
  if new.file_path is not null and new.file_path not like new.room_id::text || '/%' then
    raise exception 'file must be in the room folder' using errcode = 'check_violation';
  end if;
  new.body := btrim(coalesce(new.body, ''));
  if not (r.student_live and r.mentor_live) then
    m := public.mask_contacts(new.body);
    new.masked := m is distinct from new.body;
    new.body := m;
  else
    new.masked := false;
  end if;
  return new;
end;
$$;
revoke execute on function public.messages_before_insert() from public, anon, authenticated;
drop trigger if exists messages_before_insert on public.messages;
create trigger messages_before_insert
  before insert on public.messages
  for each row execute function public.messages_before_insert();

-- ข้อความใหม่ → อัปเดตห้อง และถ้ารุ่นพี่ตอบครั้งแรก คำถามเป็น "ตอบแล้ว"
-- New message → update the room; a mentor's first reply marks the question answered.
create or replace function public.messages_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.chat_rooms;
  from_mentor boolean;
begin
  select * into r from public.chat_rooms where id = new.room_id;
  from_mentor := new.sender_id = r.mentor_id;
  update public.chat_rooms
     set last_msg_at = new.created_at, last_sender = new.sender_id,
         last_preview = left(case when new.body <> '' then new.body else coalesce(new.file_name, '📎') end, 80),
         first_reply_at = case when from_mentor then coalesce(first_reply_at, new.created_at) else first_reply_at end,
         student_read_at = case when not from_mentor then new.created_at else student_read_at end,
         mentor_read_at  = case when from_mentor then new.created_at else mentor_read_at end
   where id = r.id;
  update public.questions
     set last_activity_at = new.created_at,
         status = case when from_mentor and status = 'waiting' then 'answered' else status end,
         answered_at = case when from_mentor then coalesce(answered_at, new.created_at) else answered_at end
   where id = r.question_id and status <> 'closed';
  return new;
end;
$$;
revoke execute on function public.messages_after_insert() from public, anon, authenticated;
drop trigger if exists messages_after_insert on public.messages;
create trigger messages_after_insert
  after insert on public.messages
  for each row execute function public.messages_after_insert();

-- รีวิวรุ่นพี่จริงได้หลังคุยจบในห้องแชทเท่านั้น (1 ห้อง = 1 รีวิว, booking_id = id ห้อง)
-- Real mentors can only be reviewed after a closed chat (1 room = 1 review, booking_id = room id).
create or replace function public.mentor_reviews_real_check()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.mentors where id::text = new.mentor_id)
     and not exists (select 1 from public.chat_rooms r
                     where r.id::text = new.booking_id and r.student_id = new.user_id
                       and r.mentor_id::text = new.mentor_id and r.status = 'closed') then
    raise exception 'real mentor review needs a closed chat' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;
revoke execute on function public.mentor_reviews_real_check() from public, anon, authenticated;
drop trigger if exists mentor_reviews_real_check on public.mentor_reviews;
create trigger mentor_reviews_real_check
  before insert on public.mentor_reviews
  for each row execute function public.mentor_reviews_real_check();

-- ---------- 8.7 Storage: bucket แบบ private ไม่เกิน 5MB เปิดได้เฉพาะคนในห้อง ----------
--   ไฟล์อยู่ที่ chat-files/<room id>/<ชื่อไฟล์> / files live at chat-files/<room id>/<file>
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chat-files', 'chat-files', false, 5242880,
        array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "chat-files: room members read" on storage.objects;
drop policy if exists "chat-files: room members upload" on storage.objects;
create policy "chat-files: room members read" on storage.objects
  for select to authenticated
  using (bucket_id = 'chat-files' and public.room_folder_ok((storage.foldername(name))[1], false));
create policy "chat-files: room members upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'chat-files' and public.room_folder_ok((storage.foldername(name))[1], true));

-- ---------- 8.8 Realtime: ข้อความใหม่ + อ่านแล้ว ขึ้นทันที / new messages and read receipts arrive live ----------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables
                   where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages') then
      alter publication supabase_realtime add table public.messages;
    end if;
    if not exists (select 1 from pg_publication_tables
                   where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_rooms') then
      alter publication supabase_realtime add table public.chat_rooms;
    end if;
  end if;
end;
$$;

-- ให้ Data API (PostgREST) โหลดรายชื่อตาราง/view ใหม่ทันที
-- Make the Data API (PostgREST) pick up new tables/views right away.
notify pgrst, 'reload schema';
