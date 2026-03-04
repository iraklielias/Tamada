-- Toast version history table
CREATE TABLE public.toast_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feast_toast_id uuid NOT NULL REFERENCES public.feast_toasts(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  body_ka text NOT NULL,
  body_en text,
  source_type text NOT NULL DEFAULT 'ai',
  user_instructions text,
  style_overrides jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_toast_versions_feast_toast ON public.toast_versions(feast_toast_id, version_number DESC);

ALTER TABLE public.toast_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "toast_versions_select" ON public.toast_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.feast_toasts ft
      JOIN public.feasts f ON f.id = ft.feast_id
      WHERE ft.id = toast_versions.feast_toast_id
        AND (f.host_id = auth.uid() OR public.is_feast_collaborator(f.id, auth.uid()))
    )
  );

CREATE POLICY "toast_versions_insert" ON public.toast_versions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.feast_toasts ft
      JOIN public.feasts f ON f.id = ft.feast_id
      WHERE ft.id = toast_versions.feast_toast_id
        AND f.host_id = auth.uid()
    )
  );

CREATE POLICY "toast_versions_delete" ON public.toast_versions
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.feast_toasts ft
      JOIN public.feasts f ON f.id = ft.feast_id
      WHERE ft.id = toast_versions.feast_toast_id
        AND f.host_id = auth.uid()
    )
  );