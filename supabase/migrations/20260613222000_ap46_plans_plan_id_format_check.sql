-- AP-46 REVISION (addendum): enforce Razorpay plan_id format on plans.
--
-- razorpay_plan_id is either NULL (not yet configured) or a real Razorpay plan
-- identifier, which always starts with the literal prefix "plan_". This CHECK
-- makes the "NULL is unambiguous" assumption documented in the plans catalog
-- migration a hard database invariant: a malformed or accidentally-truncated
-- id can never be stored, so the createSubscription action's NULL-vs-configured
-- branch stays trustworthy.

ALTER TABLE public.plans
  ADD CONSTRAINT plans_razorpay_plan_id_format_chk
  CHECK (razorpay_plan_id IS NULL OR razorpay_plan_id LIKE 'plan_%');
