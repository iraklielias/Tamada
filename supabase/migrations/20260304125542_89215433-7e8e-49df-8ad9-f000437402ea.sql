
-- Enable realtime on feast sub-tables (feasts already enabled)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'feast_toasts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.feast_toasts;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'feast_guests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.feast_guests;
  END IF;
END $$;
