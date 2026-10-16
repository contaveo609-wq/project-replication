alter table public.gemini_config alter column gemini_model set default 'gemma-4-31b-it';
alter table public.whatsapp_config add column if not exists webhook_url text;
notify pgrst, 'reload schema';