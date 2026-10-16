-- Move new and existing projects away from Gemini 2.5, which is unavailable
-- to new API users. Safe to run more than once.
alter table public.gemini_config
  alter column gemini_model set default 'gemma-4-31b-it';

update public.gemini_config
set gemini_model = 'gemini-3.8-flash',
    updated_at = now()
where gemini_model is null
   or gemini_model = ''
   or gemini_model like 'models/gemini-%'
   or gemini_model like 'gemini-%';

notify pgrst, 'reload schema';
