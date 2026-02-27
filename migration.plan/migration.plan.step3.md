# STEP 3 — Update GamesService (emit eventi socket dopo cambi DB)

## Obiettivo dello step

Quando lo stato di una partita cambia a seguito di operazioni HTTP (join/play/delete), il server deve pushare gli aggiornamenti ai client connessi nella room della partita.

**Eventi da emettere:**

- `game:player-joined` dopo un join riuscito
- `game:started` quando il 4° giocatore entra e la partita passa a Ready
- `game:state-updated` dopo play (e opzionalmente anche dopo deal/start)
- `game:deleted` quando la partita viene cancellata

**File coinvolto:** `api/src/games/games.service.ts` [MODIFY]

> Se preferisci isolare mapping dto/state builder, puoi anche aggiungere un helper privato nello stesso file, ma non è obbligatorio.

---

## 3.1 — Iniettare GameGateway nel service

**Modifica costruttore:**

Aggiungi `private readonly gameGateway: GameGateway` tra le dipendenze del service.

**Perché:**

- Il service deve rimanere l'orchestratore che già aggiorna DB/regole
- Il gateway è solo "transport": il service decide **quando** emettere, il gateway **come** emettere

---

## 3.2 — joinGame() emette player-joined e (se necessario) started

**Punto di inserimento:**

Dentro `joinGame()` dopo che hai:

- salvato la partecipazione
- aggiornato `playersCount`
- eventualmente fatto il deal e settato lo stato `Ready`

**Azioni:**

1. Costruisci il `GameDetailsDto` (o quello che già ritorni al client HTTP)
2. Emetti:

```ts
gameGateway.emitPlayerJoined(gameId, detailsDto)
```

3. Se con questo join la partita passa a `Ready` (4° player):

```ts
gameGateway.emitGameStarted(gameId)
```

4. (Consigliato) Se passa a `Ready`, emetti anche uno stato iniziale completo — costruisci `GameStateDto` (snapshot "post-deal") e fai:

```ts
gameGateway.emitGameStateUpdated(gameId, stateDto)
```

**Perché:**

- `player-joined` aggiorna subito la waiting room (`playersCount`)
- `started` fa scattare il client: fetch hand + fetch players
- `state-updated` "post-deal" allinea tutti e rende coerente il flusso (anche se poi il client fetcherà hand separatamente)

---

## 3.3 — playCard() emette sempre state-updated dopo commit

Questo è il pezzo più importante.

**Principio:**

- `POST /games/:id/play` resta HTTP
- Ma appena il DB è aggiornato e il commit è avvenuto, fai broadcast dello stato nuovo

**Pattern consigliato (semplice e sicuro):**

Dentro `playCard()`, fai la transazione come già fai (lock pessimistic, update mano/tavolo/catture/turno, save).

Alla fine della transazione ritorna i dati necessari a costruire `GameStateDto` oppure ritorna direttamente `GameStateDto`.

Esempio concettuale (non necessariamente identico al tuo codice):

```ts
const stateDto = await this.dataSource.transaction(async (manager) => {
  // ... return builtStateDto;
});
```

Fuori dalla transaction:

```ts
this.gameGateway.emitGameStateUpdated(gameId, stateDto);
```

Ritorni 200 OK (come prima).

**Perché:**

- Garantisci che non mandi eventi su stati "non ancora persistiti"
- Tutti i client si aggiornano in real time senza polling

**Nota pratica su `GameStateDto`:**

Se la tua entity ha campi null ma il DTO li vuole non-null, normalizza qui come già fai nel gateway snapshot:

```ts
tableCardIds ?? [], capturedCardIdsByUser ?? {}, // ecc.
```

---

## 3.4 — deleteGame() emette deleted

**Punto di inserimento:**

Quando il creator cancella una partita (`DELETE /games/:id`).

**Azioni:**

```ts
gameGateway.emitGameDeleted(gameId)
```

**Quando emettere:**

- Per workshop va bene anche "subito prima" della delete (così se poi la delete fallisse per qualche ragione sarebbe incoerente, ma nel workshop ok)
- Se vuoi un minimo di robustezza: emetti **dopo** che la delete è andata a buon fine

---

## 3.5 — Utility: builder unico per GameStateDto

Per evitare duplicazione e mismatch (snapshot vs play update), è utile aggiungere in `GamesService` un helper privato:

```ts
private buildGameStateDto(game: Game): GameStateDto
```

Che:

- Fa mapping campi
- Normalizza `null` → `[]` / `{}`

**Perché:**

- Così lo usi sia in `playCard()` sia (opzionalmente) in `joinGame()` quando emetti lo stato post-deal
- Riduci bug "un endpoint manda null, l'altro manda `[]`"

---

## Output dello Step 3 (Definition of Done)

Lo step 3 è completato quando:

- [ ] `GamesService` inietta `GameGateway`
- [ ] Join emette `game:player-joined`
- [ ] Quando la partita diventa `Ready`:
  - [ ] emette `game:started`
  - [ ] (consigliato) emette anche `game:state-updated` con stato iniziale post-deal
- [ ] Play emette `game:state-updated` fuori dalla transazione
- [ ] Delete emette `game:deleted`
- [ ] Nessuna emissione avviene prima del commit della transazione di play
