-- ============================================================
-- AP-32: notifications-from-invoice_events pipeline
--
-- (a) Add meta jsonb column to notifications for structured
--     render data (customer name, invoice number, amount).
--
-- (b) emit_paid_invoice_event — AFTER UPDATE trigger on invoices.
--     Fires WHEN NEW.status = 'paid' AND OLD.status IS DISTINCT FROM 'paid'.
--     Inserts an invoice_events row of type 'paid' with invoice number + total.
--     SECURITY DEFINER, search_path locked — works regardless of the invoking
--     role's RLS context (direct authenticated UPDATE and DEFINER RPCs alike).
--
-- (c) fan_out_invoice_notification — AFTER INSERT trigger on invoice_events.
--     Fires WHEN NEW.type IN ('viewed','paid','reminder_sent').
--     Looks up owner, invoice number, customer name from businesses/invoices/customers.
--     Deduplicates 'viewed' events (prevents web+WhatsApp+email triple-fire).
--     Maps type → notification type string contract:
--       'viewed'        → 'invoice_viewed'
--       'paid'          → 'invoice_paid'
--       'reminder_sent' → 'reminder_sent'
--     SECURITY DEFINER, search_path locked — inserts into notifications without
--     RLS checks on the invoking role.
--
-- (d) Composite index invoice_events(business_id, type, created_at desc) for
--     AP-31 activity feed type-filtered queries.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- (a) notifications.meta column
-- ────────────────────────────────────────────────────────────
alter table public.notifications
  add column meta jsonb not null default '{}'::jsonb;

-- ────────────────────────────────────────────────────────────
-- (b) Paid-event emission: invoices AFTER UPDATE trigger
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.emit_paid_invoice_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $func$
BEGIN
  -- WHEN clause in CREATE TRIGGER already guards this, but be explicit.
  IF NEW.status = 'paid' AND OLD.status IS DISTINCT FROM 'paid' THEN
    INSERT INTO public.invoice_events (business_id, invoice_id, type, meta)
    VALUES (
      NEW.business_id,
      NEW.id,
      'paid',
      jsonb_build_object(
        'invoice_number', COALESCE(NEW.number, NEW.id::text),
        'total',          NEW.total
      )
    );
  END IF;
  RETURN NEW;
END;
$func$;

-- Grant / revoke: trigger functions must not be callable directly.
REVOKE EXECUTE ON FUNCTION public.emit_paid_invoice_event()
  FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_emit_paid_invoice_event
  AFTER UPDATE ON public.invoices
  FOR EACH ROW
  WHEN (NEW.status = 'paid' AND OLD.status IS DISTINCT FROM 'paid')
  EXECUTE FUNCTION public.emit_paid_invoice_event();

-- ────────────────────────────────────────────────────────────
-- (c) Notification fan-out: invoice_events AFTER INSERT trigger
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.fan_out_invoice_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $func$
DECLARE
  v_owner_id        uuid;
  v_invoice_number  text;
  v_customer_name   text;
  v_total           integer;
  v_notif_type      text;
  v_title           text;
  v_body            text;
  v_link            text;
  v_meta            jsonb;
  v_dedup_link      text;
BEGIN
  -- Skip events with no linked invoice.
  IF NEW.invoice_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Look up owner, invoice number, customer name, and total.
  SELECT
    b.owner_id,
    COALESCE(i.number, i.id::text),
    COALESCE(c.name, 'Unknown customer'),
    i.total
  INTO
    v_owner_id,
    v_invoice_number,
    v_customer_name,
    v_total
  FROM public.businesses b
  JOIN public.invoices  i ON i.id = NEW.invoice_id
  LEFT JOIN public.customers c ON c.id = i.customer_id
  WHERE b.id = NEW.business_id;

  -- Skip if the business has no owner (should not happen, but defensive).
  IF v_owner_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_link := '/invoices/' || NEW.invoice_id::text;

  -- Map event type to notification type string (frontend contract).
  CASE NEW.type
    WHEN 'viewed' THEN
      v_notif_type := 'invoice_viewed';
    WHEN 'paid' THEN
      v_notif_type := 'invoice_paid';
    WHEN 'reminder_sent' THEN
      v_notif_type := 'reminder_sent';
    ELSE
      -- WHEN clause on the trigger should prevent reaching here,
      -- but return cleanly for any future unmatched type.
      RETURN NEW;
  END CASE;

  -- Dedup for 'viewed': skip if any notification already exists for this invoice link
  -- with type 'invoice_viewed'. Prevents web + WhatsApp + email webhooks each inserting
  -- a separate notification for the same view event.
  IF NEW.type = 'viewed' THEN
    PERFORM 1
      FROM public.notifications
     WHERE type = 'invoice_viewed'
       AND link = v_link
     LIMIT 1;
    IF FOUND THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Build body phrase.
  v_title := v_customer_name;
  CASE NEW.type
    WHEN 'viewed' THEN
      v_body := v_customer_name || ' viewed invoice ' || v_invoice_number;
    WHEN 'paid' THEN
      v_body := v_customer_name || ' paid invoice ' || v_invoice_number;
    WHEN 'reminder_sent' THEN
      v_body := v_customer_name || ' was sent a payment reminder for ' || v_invoice_number;
    ELSE
      v_body := v_invoice_number;
  END CASE;

  -- Build meta. For 'paid' include amount from event meta (set by the emit trigger)
  -- falling back to invoices.total. For viewed/reminder_sent omit amount.
  IF NEW.type = 'paid' THEN
    v_meta := jsonb_build_object(
      'customer',        v_customer_name,
      'invoice_number',  v_invoice_number,
      'amount',          COALESCE((NEW.meta->>'total')::integer, v_total)
    );
  ELSE
    v_meta := jsonb_build_object(
      'customer',       v_customer_name,
      'invoice_number', v_invoice_number
    );
  END IF;

  INSERT INTO public.notifications
    (business_id, user_id, type, title, body, link, read, meta)
  VALUES
    (NEW.business_id, v_owner_id, v_notif_type, v_title, v_body, v_link, false, v_meta);

  RETURN NEW;
END;
$func$;

-- Grant / revoke: trigger functions must not be callable directly.
REVOKE EXECUTE ON FUNCTION public.fan_out_invoice_notification()
  FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_fan_out_invoice_notification
  AFTER INSERT ON public.invoice_events
  FOR EACH ROW
  WHEN (NEW.type IN ('viewed', 'paid', 'reminder_sent'))
  EXECUTE FUNCTION public.fan_out_invoice_notification();

-- ────────────────────────────────────────────────────────────
-- (d) Composite index for AP-31 activity feed type-filtered queries
-- ────────────────────────────────────────────────────────────
create index if not exists invoice_events_business_type_created_idx
  on public.invoice_events (business_id, type, created_at desc);
