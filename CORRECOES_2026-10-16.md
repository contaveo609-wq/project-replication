# Correções de integração — 16/10/2026

## O que foi corrigido

- Configurações Gemini antigas são convertidas automaticamente para `gemma-4-31b-it`.
- Novas instalações usam `gemma-4-31b-it` por padrão, com `gemma-4-26b-a4b-it` como alternativa econômica.
- A tela de modelos recomenda Gemma 4 31B para atendimento de alto volume.
- A URL pública do webhook é salva junto com a configuração do WhatsApp.
- O diagnóstico do webhook valida a rota real `/api/webhook/whatsapp` e o token de verificação.
- O POST do webhook agora envia mensagens recebidas ao processador da IA, em vez de apenas registrá-las.
- A deduplicação impede respostas duplicadas quando a Meta repete um evento.

## Implantação

1. Publique esta versão da aplicação.
2. Aplique a migration `supabase/migrations/20261016_000000_gemini_38_and_webhook_fix.sql` no Supabase.
3. No painel administrativo, abra WhatsApp e salve novamente a configuração para persistir a URL pública.
4. No Meta for Developers, use `https://SEU-DOMINIO/api/webhook/whatsapp` e o mesmo token de verificação.
5. Confirme no ambiente do servidor: `GEMINI_API_KEY`, `WHATSAPP_ACCESS_TOKEN` e, recomendado, `WHATSAPP_APP_SECRET`.
6. Execute novamente a página de testes de integração.

## Validação feita

- Build de produção: aprovado.
- Teste da normalização de modelos legados: 5/5 aprovado.
- O lint global continua acusando problemas antigos de formatação e `any` espalhados pelo projeto; eles não impedem o build e não foram reformatados em massa nesta correção.
