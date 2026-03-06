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
    origin: ['http://localhost:5173', 'http://192.168.1.96:5173'],
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
    try {
      const token = this.extractToken(client);
      const payload = await this.jwtService.verifyAsync<{ sub: string; email: string }>(token);

      client.data.userId = payload.sub;
      client.data.email = payload.email;
    } catch {
      // Handshake non valido → disconnetti subito
      client.disconnect(true);
    }
  }

  public async handleDisconnect(_client: Socket): Promise<void> {
    // no-op: socket.io rimuove automaticamente il socket dalle rooms
  }

  @SubscribeMessage('game:join-room')
  public async handleJoinRoom(@MessageBody() payload: TJoinRoomPayload, @ConnectedSocket() client: Socket): Promise<void> {
    const { gameId } = payload ?? {};

    if (!gameId || typeof gameId !== 'string') {
      throw new WsException('Invalid payload: gameId is required');
    }

    const room = this.getGameRoomName(gameId);
    await client.join(room);

    // Snapshot immediato: al join mando lo stato corrente al solo client che entra.
    // (Workshop-only: niente authz su join-room)
    const stateDto = await this.getGameStateSnapshot(gameId);

    client.emit('game:state-updated', stateDto);
  }

  @SubscribeMessage('game:leave-room')
  public async handleLeaveRoom(@MessageBody() payload: TJoinRoomPayload, @ConnectedSocket() client: Socket): Promise<void> {
    const { gameId } = payload ?? {};

    if (!gameId || typeof gameId !== 'string') {
      throw new WsException('Invalid payload: gameId is required');
    }

    const room = this.getGameRoomName(gameId);
    await client.leave(room);
  }

  // ====== Emit helpers (called by GamesService in Step 5) ======

  public emitPlayerJoined(gameId: string, payload: GameDetailsDto): void {
    this.server.to(this.getGameRoomName(gameId)).emit('game:player-joined', payload);
  }

  public emitGameStarted(gameId: string): void {
    this.server.to(this.getGameRoomName(gameId)).emit('game:started');
  }

  public emitGameStateUpdated(gameId: string, state: GameStateDto): void {
    this.server.to(this.getGameRoomName(gameId)).emit('game:state-updated', state);
  }

  public emitGameDeleted(gameId: string): void {
    this.server.to(this.getGameRoomName(gameId)).emit('game:deleted');
  }

  // ====== Internal helpers ======

  private extractToken(client: Socket): string {
    // socket.io client will connect with: io(url, { auth: { token } })
    const token = client.handshake?.auth?.token;

    if (!token || typeof token !== 'string') {
      throw new WsException('Missing auth token');
    }

    return token;
  }

  private getGameRoomName(gameId: string): string {
    return `game:${gameId}`;
  }

  private async getGameStateSnapshot(gameId: string): Promise<GameStateDto> {
    // Nota: carichiamo la game entity e mappiamo i campi 1:1 sul DTO.
    // È semplice e “workshop-friendly”.
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
}
