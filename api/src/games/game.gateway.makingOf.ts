import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server, Socket } from 'socket.io';

import { Game } from './game.entity';
import { GameStateDto } from './dtos/game-state.dto';
import { GameDetailsDto } from './dtos/game-details.dto';

type TJoinRoomPayload = {
  gameId: string;
};

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server!: Server;

  public constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
  ) {}

  public async handleConnection(client: Socket): Promise<void> {
    /**
     * PERCHÉ SERVE ADESSO:
     * - Con WebSocket abbiamo una connessione lunga e persistente.
     * - Dobbiamo autenticare quella connessione UNA VOLTA (handshake) e poi poterci fidare
     *   che tutte le subscribe messages provengano da un utente autenticato.
     *
     * PERCHÉ PRIMA NON SERVIVA / COME FUNZIONAVA PRIMA:
     * - Prima non esisteva una connessione persistente: c’erano singole request HTTP.
     * - Ogni request portava l’header Authorization: Bearer <token>.
     * - L’autenticazione la faceva automaticamente il global JwtAuthGuard per-request.
     */

    try {
      // TODO(WS-AUTH): estrarre token dall'handshake --> implementare extractToken()
      // TODO(WS-AUTH): estrarre il payload e verificare JWT (payload deve contenere { sub: string; email: string }) tramite verifyAsync di jwtService
      // TODO(WS-AUTH): salvare info minime nella socket (client.data), (userId e email da payload) utili negli handler successivi
    } catch {
      // Se non autentichiamo, disconnettiamo subito (tramite client.disconnect).
      // Con HTTP sarebbe stato un 401 sulla singola request; qui dobbiamo chiudere la connessione.
      // TODO(DISCONECT):
    }
  }

  @SubscribeMessage('game:join-room')
  public async handleJoinRoom(@MessageBody() payload: TJoinRoomPayload, @ConnectedSocket() client: Socket): Promise<void> {
    /**
     * PERCHÉ SERVE ADESSO:
     * - Con socket.io vogliamo fare broadcast SOLO ai client interessati a quella partita.
     * - Le "rooms" sono il meccanismo standard per raggruppare i socket per gameId.
     * - Appena un client entra nella room, gli mandiamo una SNAPSHOT dello stato:
     *   questo risolve refresh/reconnect/eventi persi (resync immediato).
     *
     * PERCHÉ PRIMA NON SERVIVA / COME FUNZIONAVA PRIMA:
     * - Prima non c’era alcuna "iscrizione": il client non si registrava a niente.
     * - Il resync avveniva naturalmente via HTTP:
     *   - in waiting room: polling di GET /games/:id
     *   - in partita: polling di GET /games/:id/state
     * - Il client otteneva lo stato perché lo chiedeva a intervalli regolari.
     * - Con WS togliamo il polling, quindi dobbiamo "agganciare" il client alla fonte eventi.
     */
    // TODO estraiamo il gameId dal payload
    // TODO(CHECK) se gameId non esiste o non è string throw new WsException('Invalid payload: gameId is required');
    // TODO creiamo la room passando il gameId al metodo getGameRoomName (implementiamolo)
    // TODO facciamo joinare il client alla room che abbiamo creato (async)
    // TODO(SNAPSHOT): fetch stato corrente dal DB tramite getGameStateSnapshot
    // const stateDto = await this.getGameStateSnapshot(gameId);
    // TODO(SNAPSHOT): inviare snapshot al solo client che joina la room tramite client.emit(). Il nome dell'evento sarà game:state-updated
  }

  @SubscribeMessage('game:leave-room')
  public async handleLeaveRoom(@MessageBody() payload: TJoinRoomPayload, @ConnectedSocket() client: Socket): Promise<void> {
    /**
     * PERCHÉ SERVE ADESSO:
     * - Se l’utente naviga via dalla GameRoom ma mantiene il socket aperto (resta loggato),
     *   vogliamo che smetta di ricevere eventi di quella partita.
     * - È un cleanup esplicito: riduce edge case (utente in due game room, ecc.).
     *
     * PERCHÉ PRIMA NON SERVIVA / COME FUNZIONAVA PRIMA:
     * - Prima bastava “smettere di fare polling”: si cancellava il timer / pollingInterval.
     * - Non esistevano subscription server-side, quindi non c’era da “lasciare” nulla.
     */
    // TODO estraiamo il gameId dal payload
    // TODO(CHECK) se gameId non esiste o non è string throw new WsException('Invalid payload: gameId is required');
    // TODO creiamo la room passando il gameId al metodo getGameRoomName
    // TODO usiamo client.leave per lasciare la room
  }

  // ====== Emit helpers (called by GamesService in Step 5) ======

  public emitPlayerJoined(gameId: string, payload: GameDetailsDto): void {
    /**
     * PERCHÉ SERVE ADESSO:
     * - Quando qualcuno fa join HTTP, vogliamo notificare subito tutti i client già dentro la partita.
     * - Evitiamo latenza e richieste ripetute.
     *
     * PERCHÉ PRIMA NON SERVIVA / COME FUNZIONAVA PRIMA:
     * - I client scoprivano il join di un altro giocatore solo alla prossima poll di:
     *   GET /games/:id (playersCount/status).
     */

    // TODO(GameRoom) creiamo la room che vogliamo contattare con getGameRoomName
    const room = this.getGameRoomName(gameId);
    // TODO(EMIT): broadcast "game:player-joined" a tutti in room. Questa è non è più una azione del client, ma del server
    // come comporre l'azione di emit del server:
    // 1) Chi emette l'azione
    // 2) usare .to() per esplicitare chi stiamo contattando
    // 3) .emit() con nome dell'evento e payload
    this.server.to(room).emit('game:player-joined', payload);
  }

  public emitGameStarted(gameId: string): void {
    /**
     * PERCHÉ SERVE ADESSO:
     * - Quando entra il 4° giocatore e la partita passa a Ready, notifichiamo subito.
     * - Il client può reagire: fetch hand + fetch players e partire senza aspettare.
     *
     * PERCHÉ PRIMA NON SERVIVA / COME FUNZIONAVA PRIMA:
     * - Il client vedeva status Ready alla prossima poll di GET /games/:id.
     */
    // TODO(EMIT): broadcast "game:started" a tutti in room
  }

  public emitGameStateUpdated(gameId: string, state: GameStateDto): void {
    /**
     * PERCHÉ SERVE ADESSO:
     * - Questo è l’evento più importante: sostituisce completamente GET /games/:id/state in polling.
     * - Dopo ogni play (HTTP) e dopo commit DB, pushiamo lo stato nuovo a tutti i client.
     *
     * PERCHÉ PRIMA NON SERVIVA / COME FUNZIONAVA PRIMA:
     * - Ogni client polllava periodicamente GET /games/:id/state.
     * - Non c’era alcun push server→client; lo stato si aggiornava "a scatti" col polling.
     *
     * NOTA WORKSHOP:
     * - Questo metodo deve essere chiamato dal service DOPO commit DB (Step 5),
     *   altrimenti rischiamo di broadcastare stati non definitivi.
     */
    // TODO(EMIT): broadcast "game:state-updated" a tutti in room
  }

  public emitGameDeleted(gameId: string): void {
    /**
     * PERCHÉ SERVE ADESSO:
     * - Se il creator cancella la partita, i client dentro la room devono reagire subito:
     *   es. navigate home, mostrare un messaggio, ecc.
     *
     * PERCHÉ PRIMA NON SERVIVA / COME FUNZIONAVA PRIMA:
     * - Il client scopriva la cancellazione perché le request successive fallivano (404)
     *   oppure perché la lista giochi non includeva più quel game.
     */
    // TODO(EMIT): broadcast "game:deleted" a tutti in room
  }

  // ====== Internal helpers ======

  private extractToken(client: Socket): string {
    /**
     * PERCHÉ SERVE ADESSO:
     * - Nel mondo WebSocket dobbiamo decidere "dove sta il token" nel handshake.
     * - socket.io standardizza con client.handshake.auth (impostato dal client con io(..., { auth: { token } })).
     * - Centralizziamo la logica qui per non duplicarla e per avere un errore chiaro se manca.
     *
     * PERCHÉ PRIMA NON SERVIVA / COME FUNZIONAVA PRIMA:
     * - Prima il token era nell’header HTTP Authorization ed era gestito dal guard:
     *   non c’era una nostra funzione di estrazione.
     */
    // TODO(AUTH): implementare estrazione token dall'handshake e quindi dalla property auth
    // TODO(Check) controllare che il token esista e sia di tipo string, altrimenti throw new WsException('Missing auth token');
    // TODO(Return) ritorniamo il token
  }

  private getGameRoomName(gameId: string): string {
    /**
     * PERCHÉ SERVE ADESSO:
     * - Con WS dobbiamo avere una convenzione univoca per la room name: `game:<id>`.
     * - È fondamentale per non emettere su room sbagliate e per tenere il sistema “deterministico”.
     *
     * PERCHÉ PRIMA NON SERVIVA / COME FUNZIONAVA PRIMA:
     * - Prima non c’erano room: i client chiedevano direttamente via endpoint HTTP per gameId.
     */
    // TODO creiamo il game name appendendo a 'game:' il game id
  }

  private async getGameStateSnapshot(gameId: string): Promise<GameStateDto> {
    /**
     * PERCHÉ SERVE ADESSO:
     * - Con WS togliamo il polling, quindi quando il client entra deve ricevere lo stato "subito".
     * - Inoltre, se il client perde eventi (reconnect) deve poter resyncare.
     * - Questo metodo fornisce proprio la snapshot iniziale (o di recupero).
     *
     * PERCHÉ PRIMA NON SERVIVA / COME FUNZIONAVA PRIMA:
     * - Lo "snapshot" era equivalente a fare una GET /games/:id/state:
     *   il client lo faceva automaticamente ad intervalli regolari (polling).
     * - Dopo refresh pagina, il client rifaceva le GET e si riallineava.
     *
     **/
    const game = await this.gamesRepository.findOne({
      where: { id: gameId },
    });

    if (!game) {
      throw new WsException('Game not found');
    }

    // Mapping 1:1 sui campi presenti in GameStateDto (adatta se i nomi differiscono)
    return {
      id: game.id,
      status: game.status,
      gameType: game.gameType,
      startingPlayerIndex: game.startingPlayerIndex,
      currentPlayerIndex: game.currentPlayerIndex,
      tableCardIds: game.tableCardIds ?? [],
      trickCardIds: game.trickCardIds ?? [],
      trickPlayerIds: game.trickPlayerIds ?? [],
      capturedCardIdsByUser: game.capturedCardIdsByUser ?? {},
      scopasByUser: game.scopasByUser ?? {},
      scoreResult: game.scoreResult ?? null, // qui dipende dal tipo del DTO: vedi nota sotto
    };
  }

  public async handleDisconnect(_client: Socket): Promise<void> {
    /**
     * PERCHÉ SERVE ADESSO:
     * - Esiste un concetto di "connessione" che può terminare: qui potremmo
     *   aggiornare presence, log, metriche, cleanup custom, ecc.
     *
     * PERCHÉ PRIMA NON SERVIVA / COME FUNZIONAVA PRIMA:
     * - Con HTTP non c’è un evento di disconnect: il client fa request e finisce lì.
     * - Nessun canale persistente, quindi nulla da "chiudere".
     *
     * Per ora: no-op perché socket.io rimuove automaticamente il socket dalle rooms.
     */
  }
}
