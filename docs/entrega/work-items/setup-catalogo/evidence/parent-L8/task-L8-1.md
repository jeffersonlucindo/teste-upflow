# Evidência — Task #L8-1 — README esqueleto

**Parent item pai:** #L8 — README com instruções de execução, decisões técnicas e trade-offs
**Data:** 2026-10-07

## Resumo
O README do template foi reescrito com o que já dá para documentar: como rodar, scripts, flags, estrutura e as decisões técnicas do setup. Uma nota de estado no topo deixa claro que as funcionalidades do catálogo chegam nos changes seguintes.

## Tasks de execução realizadas
- [x] 4.2 README esqueleto

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `README.md` | alterado | Seis seções: Como rodar, Scripts, Flags, Estrutura, Decisões técnicas e trade-offs, Melhorias futuras |

## Decisões técnicas
- Um parágrafo por decisão, com a alternativa e o trade-off.
- O README trata só do código: não explica o fluxo de trabalho nem cita `.work/` ou o ferramental local.

## Resultado
A seção de decisões tem 13 parágrafos, correspondentes a D1 a D7, D9 a D11, D33, D34 e D40, sem os ids. As instruções foram seguidas em uma cópia limpa dos arquivos versionáveis: `npm ci`, cópia de `.env.example` para `.env.local`, `npm run check` e `npm run build` passaram.

## Observações
"Melhorias futuras" está vazia de propósito e será preenchida no change `readme-entrega`. A pedido, a seção "Processo" prevista na decisão 14 do design foi retirada. O parágrafo da D5 registra que a CLI gera o loader do Turbopack e que ele foi trocado pelo PostCSS.
