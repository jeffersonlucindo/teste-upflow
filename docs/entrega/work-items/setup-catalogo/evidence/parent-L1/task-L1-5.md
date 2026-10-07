# Evidência — Task #L1-5 — Verificação nos dois modos

**Parent item pai:** #L1 — Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via variável de ambiente, .env.example
**Data:** 2026-10-07

## Resumo
O build de produção foi rodado sem segredos e nos dois modos de `cacheComponents`, e o `next dev` foi aberto no browser com a flag ligada. A conferência visual cobriu 1280 px e 390 px.

## Tasks de execução realizadas
- [x] 5.1 Build sem segredos
- [x] 5.2 Build e dev com `CATALOGO_CACHE_COMPONENTS=1`
- [x] 5.3 Conferência visual

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| (nenhum) | — | Tasks só de verificação |

## Decisões técnicas
- D2 e D42: build e `next dev` com a flag ligada são critério do change.
- Pilar 7: build sem token e sem rede.

## Resultado
| Verificação | Resultado |
|---|---|
| `npm run build` sem `.env.local` | verde; `/` e `/favoritos` estáticas; sem warning de `partialPrefetching` |
| `CATALOGO_CACHE_COMPONENTS=1 npm run build` | verde; "Cache Components enabled" e "Partial Prefetching enabled"; rotas estáticas |
| Build só com `.env.local` contendo a flag | verde; flag ligada |
| Valores `1`, `true`, `TRUE`, `True` | ligam as duas opções |
| Ausente, vazio, `yes`, `0` | nenhuma opção declarada |
| `fonts.googleapis`, `fonts.gstatic`, `api.themoviedb.org` em `.next/server/app` | 0 ocorrências |
| `next dev` com a flag, `/` e `/favoritos` | sem dialog, sem insight de blocking-route, sem erro no console |
| Clone limpo: `npm ci`, `npm run check`, `npm run build` | tudo verde |

## Observações
"Sem rede" foi verificado por evidência estática: não há `fetch` nem `next/font/google` em `src/`. A rede não foi desligada fisicamente. O `.env.local` temporário usado no teste foi removido.
