-- AP-46 REVISION (addendum): add surrogate primary key to plans.
--
-- The initial plans migration omitted a PK, which triggered the no_primary_key
-- performance advisor finding. A surrogate uuid PK is correct here because the
-- price-change model allows multiple rows with the same code (active + superseded),
-- so code alone cannot be the primary key.
--
-- NOTE: The canonical migration (20260613220000) was also updated to include
-- the id column in the CREATE TABLE statement. This addendum exists as the
-- applied MCP delta; in a fresh apply the canonical migration already wins.

ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY;
