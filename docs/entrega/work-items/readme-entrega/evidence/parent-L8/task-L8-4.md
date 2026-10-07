# Evidência — Task #L8-4 — Clone limpo

**Parent item pai:** #L8 — README com instruções de execução, decisões técnicas e trade-offs
**Data:** 2026-10-07

## Resumo
O README recém-escrito foi seguido passo a passo num clone limpo em diretório temporário, apagado ao final. Todos os passos funcionaram sem nada que o README não diga.

## Tasks de execução realizadas
- [x] 4.1 Seguir o README num clone limpo

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| (execução) | — | Nenhum arquivo do repositório alterado |

## Decisões técnicas
D4 (`npm ci` com o lockfile versionado) e o critério de pronto de build sem token e sem rede. O clone partiu de `feature/readme-entrega`, que está no mesmo commit de `origin/develop` (`43c126f`), porque o `develop` local estava 44 commits atrás; o README em edição foi copiado por cima.

## Resultado
Node 22.22.2 e npm 10.9.7. `npm ci` em 27 s, sem `UNMET`. Com o `.env.local` preenchido, `npm run dev` respondeu 200 em `/` (20 cards), `/?q=matrix&page=2` (20 cards), `/movie/603` (`h1` "Matrix") e `/favoritos` (`h1` "Meus favoritos"), sem tela de erro. A sonda devolveu status 200, 51 idiomas em `translations` e 31 vídeos (29 en-US e 2 pt-BR). Sem `.env.local`: `npm run build` verde (`/` e `/movie/[id]` dinâmicas, `/favoritos` estática) e `npm run check` verde (31 arquivos, 342 testes).

## Observações
O `npm ci` informa 5 avisos `high` do `npm audit`, todos em `braces`, dependência transitiva de ferramenta de desenvolvimento. Não foi tratado: este change não mexe em dependências. Depois da promoção para `main`, o clone pode ser repetido a partir de `origin/main`.
