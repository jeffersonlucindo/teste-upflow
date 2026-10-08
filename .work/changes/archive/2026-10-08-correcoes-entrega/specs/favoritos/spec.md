## Requisitos MODIFICADOS

### Requisito: Dados inválidos no armazenamento não quebram a tela
O sistema DEVE manter `/favoritos` funcionando quando um item gravado tem `posterPath` fora do formato de caminho de imagem do TMDB (`/arquivo.ext`).

#### Cenário: Caminho de pôster adulterado
- QUANDO o `localStorage` tem um favorito válido com `posterPath` igual a `"/../../etc.jpg"`
- ENTÃO `/favoritos` lista o filme com o placeholder de pôster
- E a tela de erro não aparece
- E a próxima gravação salva o item com `posterPath` nulo

#### Cenário: Caminho de pôster legítimo
- QUANDO o favorito tem um `posterPath` devolvido pela API
- ENTÃO o pôster é exibido como antes
