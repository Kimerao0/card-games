# STEP 3 — Update GamesModule (wiring completo)

## Obiettivo

Rendere funzionante questo costruttore nel gateway:

```ts
public constructor(
  private readonly jwtService: JwtService,
  @InjectRepository(Game) private readonly gamesRepository: Repository<Game>,
) {}
```

Per farlo, `GamesModule` deve:

- Importare `JwtModule` (così `JwtService` esiste)
- Importare `TypeOrmModule.forFeature([Game])` (così esiste `Repository<Game>`)
- Registrare `GameGateway` in `providers`

---

## 3.1 — Modifica `api/src/games/games.module.ts`

Ecco una versione completa tipica (adatta alla tua struttura descritta nel CLAUDE.md). Tu dovrai solo verificare gli import già presenti e non duplicarli.

---

## 3.2 — Perché questa versione funziona

- `TypeOrmModule.forFeature([Game, GameParticipant])` crea i provider: `Repository<Game>` e `Repository<GameParticipant>`
- `JwtModule.registerAsync(...)` crea `JwtService`
- `GameGateway` è in `providers`, quindi Nest lo costruisce e gli inietta le dipendenze

---

## 3.3 — Se stai già usando una config tipizzata (opzionale)

Dal CLAUDE.md vedo che hai `TypedConfigService` e `auth.config.ts`. Se vuoi essere coerente (ma non è obbligatorio per workshop), al posto di `ConfigService` puoi fare:

```ts
inject: [TypedConfigService];
```

e leggere `typedConfigService.auth.jwt.secret` / ecc.

Per ora la versione sopra (`ConfigService` + env keys) è la più rapida.

---

## 3.4 — Controllo compilazione

Ora che `GameGateway` è nel modulo, build e start devono essere puliti:

```bash
cd api
yarn build
yarn start:dev
```

**Se vedi errori tipici:**

- `"Nest can't resolve dependencies of GameGateway (JwtService?)"` → `JwtModule` non è davvero nel contesto, o `ConfigModule` non risolve le env
- `"Nest can't resolve dependencies of GameGateway (Repository<Game>?)"` → manca `TypeOrmModule.forFeature([Game])` nello stesso modulo del gateway, oppure import sbagliato di `Game`

---

## 3.5 — Mini test manuale (workshop-friendly)

Anche senza client UI pronto, puoi verificare che il server non crashi all'avvio (già è un ottimo segnale).

Per testare davvero il websocket ti servirà lo step 4 (IoAdapter nel main) e lo step 6/7 (socket.io-client), ma intanto questo step ti assicura che:

- Il gateway viene creato
- Le dipendenze sono risolte

---

## Output dello Step 3 (Definition of Done)

Lo step 3 è completato quando:

- [ ] `GamesModule` importa `TypeOrmModule.forFeature([Game, GameParticipant])`
- [ ] `GamesModule` importa `JwtModule.registerAsync(...)`
- [ ] `GamesModule` ha `GameGateway` in `providers`
- [ ] `yarn build` e `yarn start:dev` non falliscono per DI / provider resolution
