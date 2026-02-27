import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * ✅ NUOVO:
 * Importiamo JwtModule e ConfigModule/ConfigService perché ora c'è un WebSocketGateway
 * (GameGateway) che deve verificare il JWT durante l'handshake.
 *
 * PRIMA (HTTP-only):
 * - Il JWT veniva validato dal global JwtAuthGuard (Passport) ad ogni request HTTP.
 * - GamesModule non aveva bisogno di JwtService perché nessun codice "dentro games"
 *   doveva verificare token manualmente: lo facevano i guard globali.
 *
 * ADESSO (WS + socket.io):
 * - Il handshake socket.io NON passa dal JwtAuthGuard delle route HTTP.
 * - Quindi dobbiamo avere JwtService disponibile nel contesto del modulo che contiene
 *   il gateway, per poter fare `jwtService.verifyAsync(token)` in handleConnection.
 */

import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { ScoponeRulesService } from './scopone-rules.service';
import { GameDealingService } from './game-dealing.service';
import { Game } from './game.entity';
import { UsersModule } from '../users/users.module';
import { GameParticipant } from 'src/games/game-player.entity';
import { GameGateway } from 'src/games/game.gateway';

/**
 * ✅ NUOVO:
 * Il GameGateway è il componente WebSocket che:
 * - autentica il socket nel handshake (JWT)
 * - gestisce join/leave delle room per partita
 * - emette eventi realtime (player-joined, started, state-updated, deleted)
 *
 * PRIMA:
 * - non esisteva alcun gateway / provider realtime.
 */

@Module({
  imports: [
    /**
     * INVARIATO (già c'era prima):
     * Questo forFeature serve a TypeORM per registrare i repository nel DI container
     * del modulo (es. Repository<Game>, Repository<GameParticipant>).
     *
     * PERCHÉ CI SERVE ANCHE ADESSO:
     * - oltre a GamesService, ora anche GameGateway inietta Repository<Game>
     *   per costruire la snapshot iniziale dello stato (getGameStateSnapshot).
     *
     * COSA CAMBIA RISPETTO A PRIMA:
     * - prima lo usava "solo" GamesService / controller; ora lo usa anche il gateway.
     * - quindi è ancora più importante che Game sia incluso qui.
     */
    TypeOrmModule.forFeature([Game, GameParticipant]),

    /**
     * INVARIATO:
     * UsersModule è usato da GamesService (join, players, ecc.).
     * Nessun cambiamento qui.
     */
    UsersModule,

    /**
     * ✅ NUOVO:
     * ConfigModule serve per ottenere ConfigService e leggere JWT_SECRET / JWT_EXPIRES_IN.
     *
     * PRIMA:
     * - GamesModule non aveva bisogno del ConfigService, perché non configurava JWT.
     * - La configurazione JWT stava in AuthModule ed era usata
     *   solo per le route HTTP protette dal JwtAuthGuard.
     *
     * ADESSO:
     * - GameGateway deve verificare token durante il handshake
     * - quindi dobbiamo avere accesso a JWT_SECRET anche qui
     *
     * Nota:
     * - Se nel tuo AppModule hai ConfigModule.forRoot({ isGlobal: true }),
     *   questa import è "ridondante" ma non rompe niente.
     * - Se NON è globale, questa import è necessaria.
     */
    ConfigModule,

    /**
     * ✅ NUOVO:
     * JwtModule.registerAsync crea e registra JwtService nel DI container di GamesModule.
     *
     * PERCHÉ registerAsync:
     * - ci permette di leggere env/config in runtime (JWT_SECRET, JWT_EXPIRES_IN)
     * - è la modalità "standard Nest" per configurare JwtService
     *
     * PRIMA:
     * - JwtService esisteva già, ma tipicamente dentro AuthModule,
     *   perché serviva per firmare token nel login/register e per la strategy HTTP.
     * - GamesModule non lo importava e non lo usava.
     *
     * ADESSO:
     * - vogliamo JwtService disponibile anche per GameGateway (nel GamesModule),
     *   così possiamo fare verifyAsync(token) nel handshake.
     *
     * WORKSHOP NOTE:
     * - stiamo duplicando "una configurazione JWT" nel GamesModule per semplicità.
     * - In produzione spesso preferiresti esportare JwtModule da AuthModule e importare
     *   AuthModule qui (così la config JWT sta in un solo posto).
     */
    JwtModule.registerAsync({
      /**
       * ✅ NUOVO:
       * imports + inject servono per far arrivare ConfigService dentro useFactory.
       */
      imports: [ConfigModule],
      inject: [ConfigService],

      /**
       * ✅ NUOVO:
       * useFactory produce la config del JwtModule.
       *
       * - secret: deve essere lo stesso usato per firmare i token in AuthService
       * - expiresIn: non è strettamente necessario per *verificare* token,
       *   ma lo teniamo coerente e utile se in futuro il gateway firma qualcosa
       *   (oppure per consistenza della config).
       *
       * PRIMA:
       * - questa logica era "da qualche parte" nel setup auth.
       *
       * ADESSO:
       * - ci serve in games per validare token via JwtService.
       */
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');

        if (!secret) {
          throw new Error('Missing JWT_SECRET');
        }

        return { secret };
      },
    }),
  ],

  controllers: [GamesController],

  providers: [
    GamesService,
    ScoponeRulesService,
    GameDealingService,

    /**
     * ✅ NUOVO:
     * Registriamo GameGateway come provider così Nest lo istanzia.
     *
     * PRIMA:
     * - non esisteva alcun provider realtime.
     *
     * ADESSO:
     * - senza questa riga, il gateway non parte e non riceve connessioni socket.io.
     * - inoltre Nest non può fare DI di JwtService/Repository<Game> dentro il gateway.
     */
    GameGateway,
  ],
})
export class GamesModule {}
