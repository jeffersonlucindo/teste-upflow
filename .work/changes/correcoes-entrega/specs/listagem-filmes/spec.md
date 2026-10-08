## Requisitos MODIFICADOS

### Requisito: Última ação vence entre busca e filtros
O sistema DEVE aplicar o filtro escolhido quando o usuário troca gênero ou ordenação com uma busca digitada e ainda não enviada, descartando o texto pendente.

#### Cenário: Gênero escolhido antes de a busca ser enviada
- QUANDO o usuário digita no campo de busca e, antes de 350 ms, escolhe um gênero
- ENTÃO a URL passa a ter `genre` e não tem `q`
- E o campo de busca fica vazio
- E nenhuma navegação de busca acontece depois

#### Cenário: Busca enviada sem filtro em seguida
- QUANDO o usuário digita e espera 350 ms sem tocar nos selects
- ENTÃO a URL passa a ter `q`, sem `genre` nem `sort`

### Requisito: Gênero desconhecido na URL
O sistema DEVE tratar um `genre` que não está na lista de gêneros do TMDB como ausência de filtro.

#### Cenário: Id de gênero inexistente
- QUANDO a página é aberta em `/?genre=999999`
- ENTÃO a lista mostra os filmes populares
- E o select "Gênero" mostra "Todos"
- E os links da paginação não levam `genre`

## Requisitos ADICIONADOS

### Requisito: Título da listagem reflete a busca
O sistema DEVE mostrar no `h1` da listagem "Resultados da busca" quando há `q` e "Filmes populares" quando não há.

#### Cenário: Busca ativa
- QUANDO a página é aberta em `/?q=matrix`
- ENTÃO o `h1` é "Resultados da busca"

### Requisito: Paginação indica carregamento
O sistema DEVE indicar, no link de paginação clicado, que a página seguinte está carregando, até ela chegar.

#### Cenário: Clique em "Próxima"
- QUANDO o usuário clica em "Próxima" e a resposta ainda não chegou
- ENTÃO o link mostra um indicador de carregamento
- E um texto equivalente fica disponível para leitor de tela
