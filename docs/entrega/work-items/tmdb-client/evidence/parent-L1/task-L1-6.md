# Evidência — Task #L1-6 — Documentação

**Parent item pai:** #L1 — Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via variável de ambiente, .env.example
**Data:** 2026-10-07

## Resumo
O README ganhou o comando da sonda em "Como rodar", a subseção "Segurança do token", uma seção "Dados do TMDB" em "Decisões técnicas e trade-offs" com um parágrafo por decisão do change e a estrutura de `src/lib/tmdb/`. "Melhorias futuras" passou a citar o type guard mínimo nas respostas.

## Tasks de execução realizadas
- [x] 6.1 README: decisões deste change, sonda e segurança do token

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `README.md` | alterado | Comando da sonda, "Segurança do token", "Dados do TMDB" (porta única, discover como populares, cortes de votos e de data, cache por `fetch` com 86 400 s e 3 600 s, erros classificados, limite de 500 páginas, sinopse com fallback, trailer, imagens, sem validação em runtime), árvore de `src/lib/tmdb/` e melhoria futura |
| `.work/design/decisoes.md` | alterado | Resultado das verificações em D17, D18 e D19 |

## Decisões técnicas
- D12: Bearer no header, só no servidor, `server-only`, nunca `NEXT_PUBLIC_`, sem route handler como proxy.
- Os parágrafos de limite de página, sinopse e trailer citam o resultado real da sonda (HTTP 400; `translations` confirmado; `pt-BR,pt,en,null`).
- Regra de `.work/config.yaml`: o README trata só do código.

## Resultado
O README cita `scripts/tmdb-probe.mjs`, `server-only` e os tempos de `revalidate`; não há token de exemplo real.

## Observações
Desvio consciente da task 6.1: o README não cita ids D<n> nem L<n>, por regra de `.work/config.yaml`; as decisões aparecem descritas pelo conteúdo, e não pelo id.

E2E e layout: `not-applicable` (o change não toca `src/app/**` nem `src/components/**`; não há tela, então não há screenshots a copiar).

QA (`.work/changes/tmdb-client/.devflow.yaml > qa`): 2 iterações, 8 findings resolvidos, `functional: pass` (`npm run check` com 95 testes em 8 arquivos e `npm run build` verdes), status `advisory-only`, com dois advisory baixos em aberto, ambos de `README.md`: a linha `@source not "../../.work"` já existe em develop e está fora do diff deste change; o diff da árvore mistura trechos de Playwright/E2E do ferramental, que ficam fora dos commits deste change.
