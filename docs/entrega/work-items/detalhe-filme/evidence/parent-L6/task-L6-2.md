# Evidência — Task #L6-2 — Funções puras

**Parent item pai:** #L6 — Página de detalhe em /movie/[id]: sinopse (com fallback de idioma), nota, elenco principal e trailer quando houver
**Data:** 2026-10-07

## Resumo
Cinco funções puras e testadas: `parseMovieId` (id inteiro positivo antes do fetch), `backHref` (o `?from=` validado de D39), `formatRuntime` ("2h 16min"), `languageName` (nome do idioma em pt-BR via `Intl.DisplayNames`) e `formatMovieMeta` ("1999 · 2h 16min · Ação, Ficção científica"). Nenhuma importa `server-only`.

## Tasks de execução realizadas
- [x] 2.1 `src/lib/tmdb/parseMovieId.ts` + teste
- [x] 2.2 `src/lib/listing/backHref.ts` + teste (D39)
- [x] 2.3 `src/lib/format/runtime.ts` + teste
- [x] 2.4 `src/lib/format/languageName.ts` + teste
- [x] 2.5 `src/lib/format/movieMeta.ts` + teste

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/lib/tmdb/parseMovieId.ts` | criado | Aceita só `/^[1-9]\d*$/` com `Number.isSafeInteger`; senão `null`; sem import |
| `src/lib/tmdb/parseMovieId.test.ts` | criado | 12 testes: "603", "1" e rejeição de "abc", "0", "-1", "1.5", "0603", " 603", vazio, `undefined` e inteiro fora do seguro |
| `src/lib/listing/backHref.ts` | criado | Primeiro item se array; vazio vira "/"; senão normaliza por `parseListingParams` + `buildListingHref` |
| `src/lib/listing/backHref.test.ts` | criado | 12 testes: normalização, página limitada a 500, filtros inválidos, array, URL externa |
| `src/lib/format/runtime.ts` | criado | `formatRuntime`: "45min", "2h", "2h 16min"; não finito ou `<= 0` vira `null` |
| `src/lib/format/runtime.test.ts` | criado | 12 testes |
| `src/lib/format/languageName.ts` | criado | `Intl.DisplayNames(["pt-BR"], { fallback: "none" })` no módulo; exceção vira `null` |
| `src/lib/format/languageName.test.ts` | criado | 6 testes: "en" → inglês, "ja" → japonês, "xx" e vazio → `null` |
| `src/lib/format/movieMeta.ts` | criado | Junta ano, duração e gêneros por " · ", omitindo o pedaço ausente e o separador |
| `src/lib/format/movieMeta.test.ts` | criado | 5 testes: completo, sem duração, sem data, sem gêneros, tudo ausente |

## Decisões técnicas
Decisões 3, 4 e 5 do `design.md`; D39 (`from` normalizado, nunca uma URL externa), D18 (texto do aviso de idioma) e D43 (testes de funções puras).

## Resultado
`/movie/0603` e `/movie/abc` são rejeitados antes de qualquer chamada ao TMDB; `from=page%3D999` vira `/?page=500` e `from=http://evil.example` vira `/`.

## Observações
`languageName` roda no Node 22 com ICU completo; qualquer exceção devolve `null` e a página mostra o aviso genérico em vez de quebrar.
