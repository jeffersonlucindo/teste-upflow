# Evidência — Task #L1-5 — Verificação com a API real

**Parent item pai:** #L1 — Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via variável de ambiente, .env.example
**Data:** 2026-10-07

## Resumo
A sonda `scripts/tmdb-probe.mjs` fez chamadas reais ao TMDB (ids 603, 20000 e 500000) e resolveu as três pendências de verificação. `translations` via `append_to_response` foi confirmado, sem fallback. O `include_video_language` proposto (`pt,en,null`) descartava os vídeos pt-BR, e o valor foi trocado para `pt-BR,pt,en,null`. A página 501 respondeu HTTP 400, e não o 422 esperado; o clamp protege nos dois casos.

## Tasks de execução realizadas
- [x] 5.1 Sonda `scripts/tmdb-probe.mjs`
- [x] 5.2 D18 — `translations` via `append_to_response`
- [x] 5.3 D19 — `include_video_language`
- [x] 5.4 D17 — erro acima da página 500
- [x] 5.5 Registrar resultados e alinhar fixtures

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `scripts/tmdb-probe.mjs` | criado | Sonda ESM sem dependências: lê `TMDB_API_READ_TOKEN` e `TMDB_LANGUAGE`, aceita um id, faz as três chamadas e imprime um resumo sem o token; sai com 1 nomeando a variável se ela faltar |
| `.work/changes/archive/2026-10-07-tmdb-client/probe-output.txt` | criado | Saída real das execuções para 603, 20000 e 500000 e da checagem complementar de `include_video_language` |
| `.work/changes/archive/2026-10-07-tmdb-client/design.md` | alterado | Decisão 13 com a tabela "Resultado das verificações" preenchida; decisão 7 com o valor adotado |
| `.work/design/decisoes.md` | alterado | D17, D18 e D19 sem "pendente de verificação" e tabela de pendências com o resultado |
| `src/lib/tmdb/client.ts` | alterado | `VIDEO_LANGUAGES` passou de `pt,en,null` para `pt-BR,pt,en,null` |

## Decisões técnicas
- D18, confirmado em 2026-10-07: com `append_to_response=translations` a resposta traz `translations.translations` com `data.overview`. No 603, 51 idiomas (47 com texto). Nos ids 20000 e 500000 o `overview` pt-BR vem vazio e a tradução en-US existe com texto. Uma chamada, sem fallback.
- D19: na checagem complementar em `/movie/{id}/videos?language=pt-BR`, o valor `pt` sozinho casa só com pt-PT (603: nenhum vídeo; 598 e 27205: 1 pt-PT), e `pt,en,null` trazia en-US e pt-PT sem os pt-BR. Com `pt-BR,pt,en,null` vêm os três. A troca foi aprovada pelo usuário e a prioridade de `pickTrailer` (oficial, depois `pt`, depois `en`, depois o mais recente) não muda, pois pt-BR e pt-PT têm `iso_639_1 = "pt"`.
- D17: a página 501 respondeu HTTP 400, `Invalid page: Pages start at 1 and max at 500. They are expected to be an integer.`, e não 422. Nada no código muda: o clamp de `params.ts` impede a chamada, e 400 já cai em `unavailable`.

## Resultado
Trecho da saída real (`probe-output.txt`, sem token). Sonda com o valor adotado de `include_video_language`:

| Id | Vídeos com `pt-BR,pt,en,null` | Vídeos sem o parâmetro | Sinopse pt-BR | Idiomas de tradução (com texto) | Página 501 |
|----|------|------|------|------|------|
| 603 | 31 (en-US 29, pt-BR 2) | 2 (pt-BR) | 495 caracteres | 51 (47) | HTTP 400 |
| 20000 | 1 (en-US) | 0 | vazia | 12 (10) | HTTP 400 |
| 500000 | 0 | 0 | vazia | 1 (1, só en-US) | HTTP 400 |

Checagem complementar, vídeos por idioma e país em `/movie/{id}/videos` (ids 603, 598 e 27205):

| Valor de `include_video_language` | 603 | 598 | 27205 |
|---|---|---|---|
| (ausente) | pt-BR 2 | pt-BR 3 | pt-BR 2 |
| `pt,en,null` | en-US 29 | en-US 11, pt-PT 1 | en-US 27, pt-PT 1 |
| `pt-BR,pt,en,null` | en-US 29, pt-BR 2 | en-US 11, pt-BR 3, pt-PT 1 | en-US 27, pt-BR 2, pt-PT 1 |

Todas as chamadas devolveram HTTP 200, exceto a página 501 (HTTP 400).

## Observações
- Falha achada só pela verificação real: com o valor proposto, o trailer pt-BR sumia da resposta. Foi o finding de QA que levou à troca do valor.
- A sonda e a checagem complementar exigem `.env.local` com token válido e rede. O token não aparece na saída nem neste documento.

E2E e layout: `not-applicable` (o change não toca `src/app/**` nem `src/components/**`; não há tela, então não há screenshots a copiar).

QA (`.work/changes/archive/2026-10-07-tmdb-client/.devflow.yaml > qa`): 2 iterações, 8 findings resolvidos, `functional: pass` (`npm run check` com 95 testes em 8 arquivos e `npm run build` verdes), status `advisory-only`, com dois advisory baixos em aberto, ambos de `README.md`: a linha `@source not "../../.work"` já existe em develop e está fora do diff deste change; o diff da árvore mistura trechos de Playwright/E2E do ferramental, que ficam fora dos commits deste change.
