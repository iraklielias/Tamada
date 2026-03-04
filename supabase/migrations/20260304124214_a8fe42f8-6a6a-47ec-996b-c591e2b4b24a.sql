
-- 1. Add permissive SELECT policy on feasts for share_code lookup
CREATE POLICY "feasts_select_by_share_code" ON public.feasts
  FOR SELECT TO authenticated
  USING (share_code IS NOT NULL AND share_code != '');

-- 2. Fix collaborator INSERT policies: drop restrictive, recreate as permissive
DROP POLICY IF EXISTS "collaborators_insert" ON public.feast_collaborators;
DROP POLICY IF EXISTS "collaborators_self_insert" ON public.feast_collaborators;

CREATE POLICY "collaborators_insert_host" ON public.feast_collaborators
  FOR INSERT TO authenticated
  WITH CHECK (is_feast_host(feast_id, auth.uid()));

CREATE POLICY "collaborators_insert_self" ON public.feast_collaborators
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
