# Catálogo.

Paleta de cores do catálogo de filmes do Teste Técnico Desenvolvedor Frontend (UpFlow). Os valores foram amostrados pixel a pixel das três telas do protótipo — Listagem, Detalhe e Favoritos — e organizados como tokens semânticos.

## Princípios

- **Escuro e quieto.** A interface é quase toda neutra; quem dá cor à tela são os pôsteres dos filmes. Superfícies sobem em claridade para indicar elevação: `bg-base` → `surface-100` → `surface-200`.
- **Um acento só.** `accent` (âmbar) marca o que é primário ou ativo: o botão "Próxima", "Adicionar aos favoritos", o coração favoritado e o ponto do logo. Não use âmbar para decoração.
- **Bordas, não sombras.** O protótipo separa áreas com `border-subtle` e diferença de superfície; não há sombras.

## Mapa de uso

| Elemento | Fundo | Texto / ícone | Borda |
| --- | --- | --- | --- |
| Página, header | `bg-base` | `text-primary` | `border-subtle` (divisor) |
| Link de navegação ativo (Explorar) | `surface-100` | `text-primary` | — |
| Link de navegação inativo | — | `text-muted` | — |
| Badge de contagem (Favoritos 3) | `border-subtle` | `text-primary` | — |
| Input de busca, selects | `surface-100` | `text-primary`; placeholder `text-subtle` | `border-subtle` |
| Label de campo | — | `text-muted` | — |
| Card de filme / placeholder de pôster | `surface-200` | título `text-primary`, meta `text-muted` | — |
| Botão favoritar (sobre pôster) | `bg-overlay` | `text-primary`; ativo `accent` | — |
| Botão primário (Próxima, Adicionar aos favoritos) | `accent` | `on-accent` | — |
| Botão outline (Anterior) | `bg-base` | `text-primary` | `border-strong` |
| Chip de Nota | `surface-200` | `text-primary` | — |
| Sinopse | — | `text-secondary` | — |
| Área do trailer | `surface-100` | `text-muted` | `border-subtle` |
| Foco | — | — | `focus-ring` |

## Acessibilidade

Contraste medido (WCAG 2.1) no tema escuro:

| Par | Razão | Status |
| --- | --- | --- |
| `text-primary` / `bg-base` | 15.8:1 | OK |
| `text-secondary` / `bg-base` | 12.2:1 | OK |
| `text-muted` / `surface-200` | 6.2:1 | OK |
| `on-accent` / `accent` | 10.4:1 | OK |
| `text-subtle` / `surface-200` | 3.1:1 | Abaixo de 4.5:1 — herdado do protótipo |
| `border-strong` / `bg-base` | 1.7:1 | Abaixo de 3:1 para borda de controle — herdado |

Sugestão: para placeholders de input, prefira `text-muted`; mantenha `text-subtle` só no rótulo "Pôster" do placeholder de imagem.

## Marca UpFlow

`upflow-blue` (#1328db) é o azul do documento do teste. Ele não aparece na UI do catálogo e fica disponível apenas para um crédito ou assinatura da empresa (por exemplo, no rodapé), sempre como superfície com texto branco, nunca como cor de texto sobre `bg-base`.

## Usando no código

Os tokens viram CSS custom properties (`var(--accent)`, `var(--surface-200)` …). Em Tailwind v4, mapeie-os no `@theme`:

```css
@theme {
  --color-bg-base: #121316;
  --color-surface-100: #1c1e23;
  --color-surface-200: #23262c;
  --color-border-subtle: #2a2d34;
  --color-text-primary: #ececef;
  --color-text-muted: #a3a6ad;
  --color-accent: #f2b84b;
}
```
