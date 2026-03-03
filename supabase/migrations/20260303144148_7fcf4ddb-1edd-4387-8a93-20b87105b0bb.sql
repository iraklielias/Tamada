
-- Fix the collaborators_self_insert policy too (it was from Phase 11)
DROP POLICY IF EXISTS "collaborators_self_insert" ON public.feast_collaborators;
CREATE POLICY "collaborators_self_insert" ON public.feast_collaborators
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
