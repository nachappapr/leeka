-- ============================================================
-- AP-8: Tenant tables — customers, items, invoices,
--        invoice_line_items, payments, invoice_sequences,
--        invoice_events, message_log, notifications,
--        reminder_rules
-- All tables ship with RLS + explicit policies.
-- ============================================================

-- ------------------------------------------------------------
-- 1. customers
-- ------------------------------------------------------------
create table public.customers (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  name            text not null,
  phone           text,
  email           text,
  gstin           text,
  state_code      text,
  city            text,
  billing_address text,
  notes           text,
  opening_balance integer not null default 0,
  created_at      timestamptz default now()
);
create index on public.customers (business_id);

-- RLS
alter table public.customers enable row level security;

create policy "tenant: owner read"   on public.customers for select to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner insert" on public.customers for insert to authenticated
  with check ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner update" on public.customers for update to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner delete" on public.customers for delete to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "anon deny" on public.customers as restrictive to anon using (false);

-- Grants
grant select, insert, update, delete on public.customers to authenticated;
revoke select, insert, update, delete, truncate, trigger, references on public.customers from anon;

-- ------------------------------------------------------------
-- 2. items (saved catalogue)
-- ------------------------------------------------------------
create table public.items (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null references public.businesses(id) on delete cascade,
  name             text not null,
  hsn_sac          text,
  unit             text default 'pcs',
  default_price    integer,
  default_gst_rate numeric(5,2),
  created_at       timestamptz default now()
);
create index on public.items (business_id);

-- RLS
alter table public.items enable row level security;

create policy "tenant: owner read"   on public.items for select to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner insert" on public.items for insert to authenticated
  with check ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner update" on public.items for update to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner delete" on public.items for delete to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "anon deny" on public.items as restrictive to anon using (false);

-- Grants
grant select, insert, update, delete on public.items to authenticated;
revoke select, insert, update, delete, truncate, trigger, references on public.items from anon;

-- ------------------------------------------------------------
-- 3. invoice_status enum
-- ------------------------------------------------------------
create type public.invoice_status as enum
  ('draft', 'sent', 'viewed', 'partial', 'pending', 'paid', 'overdue', 'cancelled');

-- ------------------------------------------------------------
-- 4. invoices
-- ------------------------------------------------------------
create table public.invoices (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  customer_id     uuid references public.customers(id),
  number          text,
  status          public.invoice_status not null default 'draft',
  issue_date      date not null default current_date,
  due_date        date,
  place_of_supply text,
  is_interstate   boolean not null default false,
  gst_enabled     boolean not null default true,
  subtotal        integer not null default 0,
  discount        integer not null default 0,
  cgst            integer not null default 0,
  sgst            integer not null default 0,
  igst            integer not null default 0,
  tax_total       integer not null default 0,
  round_off       integer not null default 0,
  total           integer not null default 0,
  amount_paid     integer not null default 0,
  notes           text,
  terms           text,
  pdf_url         text,
  public_token    text unique,
  sent_at         timestamptz,
  viewed_at       timestamptz,
  paid_at         timestamptz,
  created_by      uuid references public.profiles(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique (business_id, number)
);
create index on public.invoices (business_id, status, issue_date desc);
create index on public.invoices (business_id, customer_id);

-- RLS
alter table public.invoices enable row level security;

create policy "tenant: owner read"   on public.invoices for select to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner insert" on public.invoices for insert to authenticated
  with check ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner update" on public.invoices for update to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner delete" on public.invoices for delete to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "anon deny" on public.invoices as restrictive to anon using (false);

-- Grants
grant select, insert, update, delete on public.invoices to authenticated;
revoke select, insert, update, delete, truncate, trigger, references on public.invoices from anon;

-- ------------------------------------------------------------
-- 5. invoice_line_items
-- ------------------------------------------------------------
create table public.invoice_line_items (
  id            uuid primary key default gen_random_uuid(),
  invoice_id    uuid not null references public.invoices(id) on delete cascade,
  position      int not null default 0,
  name          text not null,
  hsn_sac       text,
  qty           numeric(12,3) not null default 1,
  unit_price    integer not null default 0,
  discount      integer not null default 0,
  gst_rate      numeric(5,2) not null default 0,
  line_subtotal integer not null default 0,
  line_tax      integer not null default 0,
  line_total    integer not null default 0
);
create index on public.invoice_line_items (invoice_id);

-- RLS (no direct business_id — join through invoices)
alter table public.invoice_line_items enable row level security;

create policy "tenant: owner read"   on public.invoice_line_items for select to authenticated
  using   ( invoice_id in (
      select id from public.invoices
      where business_id in (
        select business_id from public.business_members where user_id = auth.uid()
      )
    )
  );
create policy "tenant: owner insert" on public.invoice_line_items for insert to authenticated
  with check ( invoice_id in (
      select id from public.invoices
      where business_id in (
        select business_id from public.business_members where user_id = auth.uid()
      )
    )
  );
create policy "tenant: owner update" on public.invoice_line_items for update to authenticated
  using   ( invoice_id in (
      select id from public.invoices
      where business_id in (
        select business_id from public.business_members where user_id = auth.uid()
      )
    )
  );
create policy "tenant: owner delete" on public.invoice_line_items for delete to authenticated
  using   ( invoice_id in (
      select id from public.invoices
      where business_id in (
        select business_id from public.business_members where user_id = auth.uid()
      )
    )
  );
create policy "anon deny" on public.invoice_line_items as restrictive to anon using (false);

-- Grants
grant select, insert, update, delete on public.invoice_line_items to authenticated;
revoke select, insert, update, delete, truncate, trigger, references on public.invoice_line_items from anon;

-- ------------------------------------------------------------
-- 6. payments
-- ------------------------------------------------------------
create table public.payments (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses(id) on delete cascade,
  invoice_id   uuid not null references public.invoices(id) on delete cascade,
  amount       integer not null,
  method       text not null default 'upi',
  reference    text,
  provider_ref text,
  paid_at      timestamptz default now(),
  recorded_by  uuid references public.profiles(id),
  note         text
);
create index on public.payments (invoice_id);

-- RLS
alter table public.payments enable row level security;

create policy "tenant: owner read"   on public.payments for select to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner insert" on public.payments for insert to authenticated
  with check ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner update" on public.payments for update to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner delete" on public.payments for delete to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "anon deny" on public.payments as restrictive to anon using (false);

-- Grants
grant select, insert, update, delete on public.payments to authenticated;
revoke select, insert, update, delete, truncate, trigger, references on public.payments from anon;

-- ------------------------------------------------------------
-- 7. invoice_sequences
-- ------------------------------------------------------------
create table public.invoice_sequences (
  business_id uuid references public.businesses(id) on delete cascade,
  fy          text not null,
  last_number int not null default 0,
  primary key (business_id, fy)
);

-- RLS
alter table public.invoice_sequences enable row level security;

create policy "tenant: owner read"   on public.invoice_sequences for select to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner insert" on public.invoice_sequences for insert to authenticated
  with check ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner update" on public.invoice_sequences for update to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner delete" on public.invoice_sequences for delete to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "anon deny" on public.invoice_sequences as restrictive to anon using (false);

-- Grants
grant select, insert, update, delete on public.invoice_sequences to authenticated;
revoke select, insert, update, delete, truncate, trigger, references on public.invoice_sequences from anon;

-- ------------------------------------------------------------
-- 8. invoice_events
-- ------------------------------------------------------------
create table public.invoice_events (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  invoice_id  uuid references public.invoices(id) on delete cascade,
  type        text not null,
  channel     text,
  meta        jsonb default '{}',
  created_at  timestamptz default now()
);
create index on public.invoice_events (business_id, created_at desc);

-- RLS
alter table public.invoice_events enable row level security;

create policy "tenant: owner read"   on public.invoice_events for select to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner insert" on public.invoice_events for insert to authenticated
  with check ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner update" on public.invoice_events for update to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner delete" on public.invoice_events for delete to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "anon deny" on public.invoice_events as restrictive to anon using (false);

-- Grants
grant select, insert, update, delete on public.invoice_events to authenticated;
revoke select, insert, update, delete, truncate, trigger, references on public.invoice_events from anon;

-- ------------------------------------------------------------
-- 9. message_log
-- ------------------------------------------------------------
create table public.message_log (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  invoice_id      uuid references public.invoices(id) on delete cascade,
  channel         text not null,
  provider_msg_id text,
  status          text not null default 'queued',
  error           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- RLS
alter table public.message_log enable row level security;

create policy "tenant: owner read"   on public.message_log for select to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner insert" on public.message_log for insert to authenticated
  with check ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner update" on public.message_log for update to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner delete" on public.message_log for delete to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "anon deny" on public.message_log as restrictive to anon using (false);

-- Grants
grant select, insert, update, delete on public.message_log to authenticated;
revoke select, insert, update, delete, truncate, trigger, references on public.message_log from anon;

-- ------------------------------------------------------------
-- 10. notifications
-- ------------------------------------------------------------
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id     uuid references public.profiles(id),
  type        text not null,
  title       text,
  body        text,
  link        text,
  read        boolean not null default false,
  created_at  timestamptz default now()
);

-- RLS
alter table public.notifications enable row level security;

-- Tenant-scoped read (any member of the business)
create policy "tenant: owner read"   on public.notifications for select to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
-- User-scoped self-access (user sees only their own notifications)
create policy "user: self read"      on public.notifications for select to authenticated
  using   ( user_id = auth.uid() );
create policy "tenant: owner insert" on public.notifications for insert to authenticated
  with check ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner update" on public.notifications for update to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner delete" on public.notifications for delete to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "anon deny" on public.notifications as restrictive to anon using (false);

-- Grants
grant select, insert, update, delete on public.notifications to authenticated;
revoke select, insert, update, delete, truncate, trigger, references on public.notifications from anon;

-- ------------------------------------------------------------
-- 11. reminder_rules
-- ------------------------------------------------------------
create table public.reminder_rules (
  business_id  uuid primary key references public.businesses(id) on delete cascade,
  enabled      boolean not null default false,
  offsets_days int[] not null default '{0,3,7}',
  channel      text not null default 'whatsapp'
);

-- RLS
alter table public.reminder_rules enable row level security;

create policy "tenant: owner read"   on public.reminder_rules for select to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner insert" on public.reminder_rules for insert to authenticated
  with check ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner update" on public.reminder_rules for update to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "tenant: owner delete" on public.reminder_rules for delete to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = auth.uid()) );
create policy "anon deny" on public.reminder_rules as restrictive to anon using (false);

-- Grants
grant select, insert, update, delete on public.reminder_rules to authenticated;
revoke select, insert, update, delete, truncate, trigger, references on public.reminder_rules from anon;
