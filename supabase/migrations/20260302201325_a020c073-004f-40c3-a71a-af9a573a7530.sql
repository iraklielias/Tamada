
-- Create a security definer function to check collaborator status without triggering RLS
CREATE OR REPLACE FUNCTION public.is_feast_collaborator(p_feast_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.feast_collaborators
    WHERE feast_id = p_feast_id AND user_id = p_user_id
  )
$$;

-- Create a security definer function to check feast host
CREATE OR REPLACE FUNCTION public.is_feast_host(p_feast_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.feasts
    WHERE id = p_feast_id AND host_id = p_user_id
  )
$$;

-- Fix feasts_select: use security definer function instead of subquery on feast_collaborators
DROP POLICY IF EXISTS "feasts_select" ON public.feasts;
CREATE POLICY "feasts_select" ON public.feasts
  FOR SELECT TO authenticated
  USING (host_id = auth.uid() OR public.is_feast_collaborator(id, auth.uid()));

-- Fix collaborators policies to use security definer instead of subquery on feasts
DROP POLICY IF EXISTS "collaborators_select" ON public.feast_collaborators;
CREATE POLICY "collaborators_select" ON public.feast_collaborators
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_feast_host(feast_id, auth.uid()));

DROP POLICY IF EXISTS "collaborators_insert" ON public.feast_collaborators;
CREATE POLICY "collaborators_insert" ON public.feast_collaborators
  FOR INSERT TO authenticated
  WITH CHECK (public.is_feast_host(feast_id, auth.uid()));

DROP POLICY IF EXISTS "collaborators_delete" ON public.feast_collaborators;
CREATE POLICY "collaborators_delete" ON public.feast_collaborators
  FOR DELETE TO authenticated
  USING (public.is_feast_host(feast_id, auth.uid()));

-- Fix feast_guests policies
DROP POLICY IF EXISTS "feast_guests_select" ON public.feast_guests;
CREATE POLICY "feast_guests_select" ON public.feast_guests
  FOR SELECT TO authenticated
  USING (public.is_feast_host(feast_id, auth.uid()) OR public.is_feast_collaborator(feast_id, auth.uid()));

DROP POLICY IF EXISTS "feast_guests_insert" ON public.feast_guests;
CREATE POLICY "feast_guests_insert" ON public.feast_guests
  FOR INSERT TO authenticated
  WITH CHECK (public.is_feast_host(feast_id, auth.uid()));

DROP POLICY IF EXISTS "feast_guests_update" ON public.feast_guests;
CREATE POLICY "feast_guests_update" ON public.feast_guests
  FOR UPDATE TO authenticated
  USING (public.is_feast_host(feast_id, auth.uid()));

DROP POLICY IF EXISTS "feast_guests_delete" ON public.feast_guests;
CREATE POLICY "feast_guests_delete" ON public.feast_guests
  FOR DELETE TO authenticated
  USING (public.is_feast_host(feast_id, auth.uid()));

DROP POLICY IF EXISTS "collaborators_update_guests" ON public.feast_guests;
CREATE POLICY "collaborators_update_guests" ON public.feast_guests
  FOR UPDATE TO authenticated
  USING (public.is_feast_collaborator(feast_id, auth.uid()));

-- Fix feast_toasts policies
DROP POLICY IF EXISTS "feast_toasts_select" ON public.feast_toasts;
CREATE POLICY "feast_toasts_select" ON public.feast_toasts
  FOR SELECT TO authenticated
  USING (public.is_feast_host(feast_id, auth.uid()) OR public.is_feast_collaborator(feast_id, auth.uid()));

DROP POLICY IF EXISTS "feast_toasts_insert" ON public.feast_toasts;
CREATE POLICY "feast_toasts_insert" ON public.feast_toasts
  FOR INSERT TO authenticated
  WITH CHECK (public.is_feast_host(feast_id, auth.uid()));

DROP POLICY IF EXISTS "feast_toasts_update" ON public.feast_toasts;
CREATE POLICY "feast_toasts_update" ON public.feast_toasts
  FOR UPDATE TO authenticated
  USING (public.is_feast_host(feast_id, auth.uid()));

DROP POLICY IF EXISTS "feast_toasts_delete" ON public.feast_toasts;
CREATE POLICY "feast_toasts_delete" ON public.feast_toasts
  FOR DELETE TO authenticated
  USING (public.is_feast_host(feast_id, auth.uid()));

DROP POLICY IF EXISTS "collaborators_update_toasts" ON public.feast_toasts;
CREATE POLICY "collaborators_update_toasts" ON public.feast_toasts
  FOR UPDATE TO authenticated
  USING (public.is_feast_collaborator(feast_id, auth.uid()));
