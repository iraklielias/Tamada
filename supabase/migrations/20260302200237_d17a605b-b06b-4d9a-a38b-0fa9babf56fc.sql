-- Enable realtime for feast-related tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.feasts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feast_toasts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feast_guests;

-- Allow collaborators to also insert guests (for alaverdi assignment)
CREATE POLICY "collaborators_update_guests"
ON public.feast_guests
FOR UPDATE
USING (
  feast_id IN (
    SELECT feast_id FROM public.feast_collaborators WHERE user_id = auth.uid()
  )
);

-- Allow collaborators to update feast_toasts (for alaverdi assignment)
CREATE POLICY "collaborators_update_toasts"
ON public.feast_toasts
FOR UPDATE
USING (
  feast_id IN (
    SELECT feast_id FROM public.feast_collaborators WHERE user_id = auth.uid()
  )
);

-- Allow any authenticated user to insert themselves as collaborator (via share code join)
CREATE POLICY "collaborators_self_insert"
ON public.feast_collaborators
FOR INSERT
WITH CHECK (user_id = auth.uid());
