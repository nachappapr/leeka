-- Revoke anon EXECUTE on the new 7-arg create_business overload.
-- The function has an auth guard (auth.uid() IS NULL → NOT_AUTHENTICATED exception),
-- but anon should never call it. Keeping the grant only on authenticated.
REVOKE EXECUTE ON FUNCTION public.create_business(text, text, text, text, text, text, text) FROM anon;
