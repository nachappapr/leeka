-- ============================================================
-- AP-8 fix: RLS initplan + multiple permissive policies + missing FK indexes
-- All auth.uid() calls wrapped in (select auth.uid()) per Supabase advisor.
-- notifications SELECT policies merged into one combined policy.
-- Missing FK indexes added for invoice_events.invoice_id,
--   invoices.created_by, message_log.business_id+invoice_id,
--   notifications.business_id+user_id, payments.business_id+recorded_by.
-- ============================================================

-- ------------------------------------------------------------
-- 1. customers — drop + recreate policies with (select auth.uid())
-- ------------------------------------------------------------
drop policy "tenant: owner read"   on public.customers;
drop policy "tenant: owner insert" on public.customers;
drop policy "tenant: owner update" on public.customers;
drop policy "tenant: owner delete" on public.customers;

create policy "tenant: owner read"   on public.customers for select to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner insert" on public.customers for insert to authenticated
  with check ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner update" on public.customers for update to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner delete" on public.customers for delete to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );

-- ------------------------------------------------------------
-- 2. items
-- ------------------------------------------------------------
drop policy "tenant: owner read"   on public.items;
drop policy "tenant: owner insert" on public.items;
drop policy "tenant: owner update" on public.items;
drop policy "tenant: owner delete" on public.items;

create policy "tenant: owner read"   on public.items for select to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner insert" on public.items for insert to authenticated
  with check ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner update" on public.items for update to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner delete" on public.items for delete to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );

-- ------------------------------------------------------------
-- 3. invoices
-- ------------------------------------------------------------
drop policy "tenant: owner read"   on public.invoices;
drop policy "tenant: owner insert" on public.invoices;
drop policy "tenant: owner update" on public.invoices;
drop policy "tenant: owner delete" on public.invoices;

create policy "tenant: owner read"   on public.invoices for select to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner insert" on public.invoices for insert to authenticated
  with check ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner update" on public.invoices for update to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner delete" on public.invoices for delete to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );

-- ------------------------------------------------------------
-- 4. invoice_line_items
-- ------------------------------------------------------------
drop policy "tenant: owner read"   on public.invoice_line_items;
drop policy "tenant: owner insert" on public.invoice_line_items;
drop policy "tenant: owner update" on public.invoice_line_items;
drop policy "tenant: owner delete" on public.invoice_line_items;

create policy "tenant: owner read"   on public.invoice_line_items for select to authenticated
  using   ( invoice_id in (
      select id from public.invoices
      where business_id in (
        select business_id from public.business_members where user_id = (select auth.uid())
      )
    )
  );
create policy "tenant: owner insert" on public.invoice_line_items for insert to authenticated
  with check ( invoice_id in (
      select id from public.invoices
      where business_id in (
        select business_id from public.business_members where user_id = (select auth.uid())
      )
    )
  );
create policy "tenant: owner update" on public.invoice_line_items for update to authenticated
  using   ( invoice_id in (
      select id from public.invoices
      where business_id in (
        select business_id from public.business_members where user_id = (select auth.uid())
      )
    )
  );
create policy "tenant: owner delete" on public.invoice_line_items for delete to authenticated
  using   ( invoice_id in (
      select id from public.invoices
      where business_id in (
        select business_id from public.business_members where user_id = (select auth.uid())
      )
    )
  );

-- ------------------------------------------------------------
-- 5. payments
-- ------------------------------------------------------------
drop policy "tenant: owner read"   on public.payments;
drop policy "tenant: owner insert" on public.payments;
drop policy "tenant: owner update" on public.payments;
drop policy "tenant: owner delete" on public.payments;

create policy "tenant: owner read"   on public.payments for select to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner insert" on public.payments for insert to authenticated
  with check ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner update" on public.payments for update to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner delete" on public.payments for delete to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );

-- ------------------------------------------------------------
-- 6. invoice_sequences
-- ------------------------------------------------------------
drop policy "tenant: owner read"   on public.invoice_sequences;
drop policy "tenant: owner insert" on public.invoice_sequences;
drop policy "tenant: owner update" on public.invoice_sequences;
drop policy "tenant: owner delete" on public.invoice_sequences;

create policy "tenant: owner read"   on public.invoice_sequences for select to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner insert" on public.invoice_sequences for insert to authenticated
  with check ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner update" on public.invoice_sequences for update to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner delete" on public.invoice_sequences for delete to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );

-- ------------------------------------------------------------
-- 7. invoice_events
-- ------------------------------------------------------------
drop policy "tenant: owner read"   on public.invoice_events;
drop policy "tenant: owner insert" on public.invoice_events;
drop policy "tenant: owner update" on public.invoice_events;
drop policy "tenant: owner delete" on public.invoice_events;

create policy "tenant: owner read"   on public.invoice_events for select to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner insert" on public.invoice_events for insert to authenticated
  with check ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner update" on public.invoice_events for update to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner delete" on public.invoice_events for delete to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );

-- ------------------------------------------------------------
-- 8. message_log
-- ------------------------------------------------------------
drop policy "tenant: owner read"   on public.message_log;
drop policy "tenant: owner insert" on public.message_log;
drop policy "tenant: owner update" on public.message_log;
drop policy "tenant: owner delete" on public.message_log;

create policy "tenant: owner read"   on public.message_log for select to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner insert" on public.message_log for insert to authenticated
  with check ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner update" on public.message_log for update to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner delete" on public.message_log for delete to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );

-- ------------------------------------------------------------
-- 9. notifications — drop both SELECT policies, recreate merged
-- ------------------------------------------------------------
drop policy "tenant: owner read" on public.notifications;
drop policy "user: self read"    on public.notifications;
drop policy "tenant: owner insert" on public.notifications;
drop policy "tenant: owner update" on public.notifications;
drop policy "tenant: owner delete" on public.notifications;

-- Merged SELECT: tenant members OR the addressee
create policy "tenant or self: read" on public.notifications for select to authenticated
  using   (
    business_id in (select business_id from public.business_members where user_id = (select auth.uid()))
    or user_id = (select auth.uid())
  );
create policy "tenant: owner insert" on public.notifications for insert to authenticated
  with check ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
-- Self-access: recipient can mark their own notification read; tenant members can update any notification in the business
create policy "tenant or self: update" on public.notifications for update to authenticated
  using   (
    business_id in (select business_id from public.business_members where user_id = (select auth.uid()))
    or user_id = (select auth.uid())
  );
create policy "tenant: owner delete" on public.notifications for delete to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );

-- ------------------------------------------------------------
-- 10. reminder_rules
-- ------------------------------------------------------------
drop policy "tenant: owner read"   on public.reminder_rules;
drop policy "tenant: owner insert" on public.reminder_rules;
drop policy "tenant: owner update" on public.reminder_rules;
drop policy "tenant: owner delete" on public.reminder_rules;

create policy "tenant: owner read"   on public.reminder_rules for select to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner insert" on public.reminder_rules for insert to authenticated
  with check ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner update" on public.reminder_rules for update to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner delete" on public.reminder_rules for delete to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );

-- ------------------------------------------------------------
-- 11. Missing FK indexes flagged by get_advisors
-- ------------------------------------------------------------
-- invoice_events.invoice_id (already has business_id composite, but invoice_id FK is unindexed)
create index if not exists invoice_events_invoice_id_idx
  on public.invoice_events (invoice_id);

-- invoices.created_by (FK to profiles, low-cardinality admin column but advisor flags it)
create index if not exists invoices_created_by_idx
  on public.invoices (created_by);

-- message_log: both FKs unindexed
create index if not exists message_log_business_id_idx
  on public.message_log (business_id);
create index if not exists message_log_invoice_id_idx
  on public.message_log (invoice_id);

-- notifications: both FKs unindexed
create index if not exists notifications_business_id_idx
  on public.notifications (business_id);
create index if not exists notifications_user_id_idx
  on public.notifications (user_id);

-- payments: business_id and recorded_by FKs unindexed
-- (invoice_id already has an index from the spec)
create index if not exists payments_business_id_idx
  on public.payments (business_id);
create index if not exists payments_recorded_by_idx
  on public.payments (recorded_by);
