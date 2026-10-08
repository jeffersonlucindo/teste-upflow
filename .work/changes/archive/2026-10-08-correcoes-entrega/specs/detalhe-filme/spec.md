## Requisitos MODIFICADOS

### Requisito: Id de filme inválido
O sistema DEVE responder com status HTTP 404 quando o id de `/movie/[id]` não é um inteiro positivo em forma canônica, sem consultar o TMDB.

#### Cenário: Id não numérico
- QUANDO `/movie/abc` é requisitado
- ENTÃO a resposta tem status 404
- E a tela mostra "Página não encontrada" em português, dentro do layout

#### Cenário: Id válido que o TMDB não conhece
- QUANDO `/movie/999999999` é requisitado
- ENTÃO a tela mostra "Filme não encontrado"
- E o status continua 200, porque a resposta já começou a ser transmitida

### Requisito: Sinopse e trailer seguem o idioma configurado
O sistema DEVE considerar "idioma pedido" o valor de `TMDB_LANGUAGE` ao avisar que a sinopse está em outro idioma e ao escolher o trailer.

#### Cenário: Sinopse no idioma pedido
- QUANDO `TMDB_LANGUAGE` é `es-ES` e o filme tem sinopse em espanhol
- ENTÃO a sinopse aparece sem aviso de idioma

#### Cenário: Trailer no idioma pedido
- QUANDO há trailers oficiais em espanhol e em inglês e `TMDB_LANGUAGE` é `es-ES`
- ENTÃO o trailer em espanhol é o escolhido

## Requisitos ADICIONADOS

### Requisito: Página não encontrada em português
O sistema DEVE responder a qualquer rota sem correspondência com status 404 e uma tela em português com link para a listagem.

#### Cenário: Rota inexistente
- QUANDO `/naoexiste` é requisitado
- ENTÃO a resposta tem status 404
- E a tela mostra "Página não encontrada" com a ação "Voltar à listagem"
- E há exatamente um `h1`
