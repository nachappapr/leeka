-- Drop the orphaned 6-arg overload of create_business (pre-display_name signature).
-- The 7-arg overload (p_name, p_address, p_state_code, p_gstin, p_upi_id,
-- p_business_type, p_display_name) is the only active overload; all call sites
-- pass p_display_name and resolve to it. This drop removes the dead overload and
-- the security-advisor WARN it was generating.
DROP FUNCTION IF EXISTS public.create_business(text, text, text, text, text, text);
