# Evidência — Task #L3-8 — Busca por título no browser

**Parent item pai:** #L3 — Busca por título
**Data:** 2026-10-07

## Resumo
Verificação da busca no browser: URL só muda depois de parar de digitar, uma entrada de histórico, grid antigo com opacidade reduzida e `aria-busy` durante a troca (sem skeleton), selects desabilitados com hint, "Limpar busca" e sincronização por voltar e avançar.

## Tasks de execução realizadas
- [x] 8.2 Busca por título

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `e2e/listagem-filmes.spec.ts` | criado | Casos de busca: debounce, Enter, busca sobre filtro ativo, sem resultado, voltar e avançar, URL direta com `from`, busca superada por outro filtro |

## Decisões técnicas
D14 (gênero e ordenação não se aplicam à busca por título), D25 e D26.

## Resultado
Com `q` preenchido, gênero e ordenação ficam desabilitados e saem da URL; a linha "N resultados para “…”" aparece. QA: E2E 38 passed e 0 skipped (desktop e mobile); layout verde nos gates, com o finding baixo do `h1` em aberto. Capturas `busca` e `sem-resultado` em desktop e mobile na evidência da task L3-5.

![busca desktop](../layout/desktop-busca.png)
![busca mobile](../layout/mobile-busca.png)

## Observações
Os casos exploratórios em `next dev` com `CATALOGO_CACHE_COMPONENTS=1` abrindo `/?q=matrix` estão resumidos na task L2-8 (8.7).
