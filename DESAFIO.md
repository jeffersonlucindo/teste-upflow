# Teste Técnico — Desenvolvedor Frontend (UpFlow, 2026)

> Transcrição do enunciado original em PDF (`Teste Técnico Desenvolvedor Frontend.pdf`,
> UpFlow — Experiências Digitais). As telas do protótipo estão em `.work/design/screens/` (PNG do PDF em `pdf/` e versão HTML navegável); índice em `.work/design/README.md`.

## Contexto

Você vai construir um pequeno catálogo de filmes com React e Next.js, consumindo a API
pública do TMDB. Nele, o usuário poderá navegar pelos filmes populares, buscar, filtrar,
ordenar, ver detalhes e favoritar títulos.

## Setup

- Use o Next.js com App Router e TypeScript;
- Documentação da API: [developer.themoviedb.org](https://developer.themoviedb.org);

## Requisitos Obrigatórios

- Listagem de filmes populares com paginação;
- Busca por título;
- Filtro por gênero;
- Ordenação por popularidade, nota e data de lançamento;
- Página de detalhe em `/movie/[id]`: sinopse, nota, elenco principal e trailer, quando
  houver;
- Favoritos: persistência no client e uma página ou aba que liste os favoritos;

## Protótipo

O protótipo abaixo não precisa ser seguido fielmente, é apenas uma inspiração para guiar a
implementação.

Tema escuro (fundo quase preto, cards em cinza-chumbo), acento âmbar/amarelo nos botões
primários e no coração de favorito. Header fixo com a marca **"Catálogo."** à esquerda e,
à direita, as abas **Explorar** e **Favoritos** (esta com um badge de contagem).

### Tela 1 — Listagem (`.work/design/screens/pdf/listagem.png` · HTML: `.work/design/screens/Main.dc.html`)

- Título **"Filmes populares"**.
- Linha de controles: campo **"Buscar por título"** (placeholder "Digite o nome de um
  filme"), select **"Gênero"** (padrão "Todos") e select **"Ordenar por"** (padrão
  "Popularidade").
- Grade de cards (4 colunas × 2 linhas no desktop). Cada card: pôster, botão de coração no
  canto superior direito (preenchido em âmbar quando favoritado), **título em negrito** e
  linha secundária `Nota [0,0] · [Ano]`.
- Paginação no rodapé: **Anterior** · "Página 1 de [N]" · **Próxima** (botão em destaque).

### Tela 2 — Detalhe `/movie/[id]` (`.work/design/screens/pdf/detalhe.png` · HTML: `.work/design/screens/Detalhe.dc.html`)

- Link **"← Voltar à listagem"**.
- Duas colunas: pôster à esquerda; à direita o **título do filme** em destaque e a linha
  `[Ano] · [Duração] · [Gênero, Gênero]`.
- Chip **"Nota [0,0]"** e botão âmbar **"♡ Adicionar aos favoritos"**.
- Seção **Sinopse** — nota do protótipo: "Se a API não retornar texto em português, exibir
  a versão disponível em outro idioma ou uma mensagem informando a ausência."
- Seção **Elenco principal** — 4 cards com foto, nome do ator e personagem.
- Seção **Trailer** — "Player do trailer, exibido apenas quando houver vídeo disponível."

### Tela 3 — Favoritos (`.work/design/screens/pdf/favoritos.png` · HTML: `.work/design/screens/Favoritos.dc.html`)

- Aba **Favoritos** ativa no header, com badge de contagem.
- Título **"Meus favoritos"** e subtítulo **"Os filmes salvos ficam neste navegador."**
- Grade com os cards favoritados (coração preenchido), mesmo layout da listagem.

## Entrega

- A entrega deverá ser feita por meio do compartilhamento do repositório do projeto
  através dos e-mails **marcos.oliveira@upflow.me** e **mario.morais@upflow.me**;
- A plataforma utilizada para o versionamento do código pode ser escolhida de acordo com a
  preferência do desenvolvedor;
- O projeto deve necessariamente conter um README com instruções claras de como executar a
  aplicação, decisões técnicas e trade-offs;

## Avaliação

- Todo artefato entregue será analisado (código, patterns, organização, …);

## Prazo

- O prazo de entrega é de **5 dias** corridos a contar a partir do recebimento deste
  documento;
