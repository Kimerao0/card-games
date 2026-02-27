STEP 2 — Create GameGateway (socket.io)
Obiettivo dello step

Creare un gateway NestJS che:

accetta connessioni socket.io solo se il JWT è valido

permette ai client di iscriversi a una room per partita (game:<gameId>)

invia subito al client la snapshot dello stato (game:state-updated) quando entra nella room

espone metodi “helper” (emitGameStateUpdated, emitGameStarted, …) che chiamerai dallo GamesService nello step 5
