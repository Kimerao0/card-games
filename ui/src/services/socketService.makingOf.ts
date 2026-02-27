import { Socket } from 'socket.io-client';
import type { IGameDetailsDto, IGameStateDto } from '@/dtos/Game';

// Tipi "evento → payload"
type TGamePlayerJoinedHandler = (payload: IGameDetailsDto) => void;
type TGameStartedHandler = () => void;
type TGameStateUpdatedHandler = (state: IGameStateDto) => void;
type TGameDeletedHandler = () => void;

/**
 * Singleton della socket.
 *
 * Perché:
 * - vogliamo UNA SOLA connessione websocket per sessione utente
 * - evitare doppie connessioni = evitare doppi eventi
 *
 * Perché prima non serviva:
 * - con HTTP polling non esisteva una connessione persistente
 */

let socket: Socket | null = null;

export const SOCKET_URL = 'http://localhost:3000';

/*
    TODO Creiamo la funzione connectSocket che prende come argomento il token e ritorna un type Socket:
    * - vogliamo una sola connessione per sessione utente
    * - evitiamo duplicazioni di eventi e doppie callback
 
    se socket esiste ed è conessa ritorniamo la socket, altrimenti socket = io(SOCKET_URL, {
        auth: { token },
    }); 
*/

/*
    TODO Creiamo la funzione disconnectSocket 
    * - su logout o fine sessione vogliamo chiudere la connessione
    * - e non lasciare listener appesi
    
    se la socket esiste chiamiamo il motodo disconnect e settiamo la socket a null
*/

/*
    TODO Creiamo la funzione joinGameRoom che prende come argomento un gameId e ritorna void
   * - iscrive il socket alla room "game:<id>"
   * - il server risponde con snapshot immediato via game:state-updated
    
    se la socket esiste chiamiamo il motodo emit con l'evento 'game:join-room' e il {gameId}
*/
/*
    TODO Creiamo la funzione leaveGameRoom che prende come argomento un gameId e ritorna void
   * - cleanup esplicito quando si esce dalla GameRoom
   * - evita di ricevere eventi di una partita non più vista
    
    se la socket esiste chiamiamo il motodo emit con l'evento 'game:leave-room' e il {gameId}
*/

/**
 * Helper generico per registrare listener con unsubscribe.
 *
 * Perché serve:
 * - evitare memory leak nei componenti React
 * - ogni on(...) ritorna una funzione di cleanup
 *
 * Pattern tipico in React:
 *
 * useEffect(() => {
 *   const unsubscribe = onGameStateUpdated(...)
 *   return unsubscribe;
 * }, []);
 */
