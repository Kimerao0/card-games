import { type FC, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, styled } from '@mui/material';

import { Playroom } from '@/pages/Playroom';
import { useGameRoomState } from './components/useGameRoomState';
import { WaitingRoom } from './components/WaitingRoom';
import { ScoreOverlay } from './components/ScoreOverlay';
import { ScopaNotification } from './components/ScopaNotification';

import { useAppDispatch } from '@/store/hooks';
export const GameRoom: FC = () => {
  const { id: gameId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // ---- WebSocket: join/leave room ----
  useEffect(() => {
    // TODO aggiungiamo l'azione joinGameRoom()
    // TODO aggiungiamo sul unmount del componente l'azione leaveGameRoom.
    // Con lo useEffect per eseguire un azione all'onmount del componente
    // bisogna inserirla dentro un "return () => {}"
  }, [gameId]);

  useEffect(() => {
    // ---- WebSocket: subscribe events ----
    // TODO  Registriamo i listener degli eventi socket al mount del componente:
    // “Quando sono visibile, ascolta questi eventi dal socket”

    return () => {
      //“Quando non sono più visibile, smetti di ascoltarli”
    };
  }, [dispatch, navigate]);

  // ---- Existing derived UI state (hook) ----
  const state = useGameRoomState(gameId!);
  const {
    game,
    isLoadingGame,
    isError,
    isLoadingHand,
    players,
    playerCards,
    playerNames,
    isMyTurn,
    currentTurnSeat,
    tableCards,
    capturedCounts,
    scoreResult,
    scopaNotification,
    handlePlay,
  } = state;

  if (isLoadingGame && !game) {
    return (
      <RoomBackground>
        <CircularProgress />
      </RoomBackground>
    );
  }

  if (isError || !game) {
    return (
      <RoomBackground>
        <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
          Partita non trovata.
        </Typography>
        <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'underline' }}>
          Torna alla home
        </Link>
      </RoomBackground>
    );
  }

  if (game.status === 'Created') {
    return <WaitingRoom playersCount={game.playersCount} maxPlayers={game.maxPlayers} gameId={game.id} />;
  }

  if (game.status === 'Scoring') {
    if (scoreResult && players) {
      return (
        <>
          <Playroom
            cards={[]}
            playerNames={playerNames}
            tableCards={tableCards}
            isMyTurn={false}
            capturedMine={capturedCounts.mine}
            capturedPartner={capturedCounts.partner}
            currentTurnSeat={undefined}
          />
          <ScoreOverlay scoreResult={scoreResult} players={players} />
        </>
      );
    }
    return (
      <RoomBackground>
        <CircularProgress sx={{ color: '#4caf50', mb: 2 }} />
        <Typography sx={{ color: '#fff' }}>Calcolo punteggio...</Typography>
      </RoomBackground>
    );
  }

  if (game.status === 'Ready') {
    if (isLoadingHand) {
      return (
        <RoomBackground>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography sx={{ color: '#fff' }}>Caricamento carte...</Typography>
        </RoomBackground>
      );
    }
    if (!game.isUserInGame) {
      return (
        <RoomBackground>
          <Typography sx={{ color: '#fff' }}>Non sei un partecipante di questa partita.</Typography>
        </RoomBackground>
      );
    }
    if (playerCards.length > 0) {
      return (
        <>
          <Playroom
            cards={playerCards}
            playerNames={playerNames}
            tableCards={tableCards}
            isMyTurn={isMyTurn}
            onPlayCard={handlePlay}
            capturedMine={capturedCounts.mine}
            capturedPartner={capturedCounts.partner}
            currentTurnSeat={currentTurnSeat}
          />
          {scopaNotification !== null && <ScopaNotification playerName={scopaNotification} />}
        </>
      );
    }

    if (scoreResult && players) {
      return (
        <>
          <Playroom
            cards={[]}
            playerNames={playerNames}
            tableCards={tableCards}
            isMyTurn={false}
            capturedMine={capturedCounts.mine}
            capturedPartner={capturedCounts.partner}
          />
          <ScoreOverlay scoreResult={scoreResult} players={players} />
        </>
      );
    }

    return (
      <RoomBackground>
        <CircularProgress sx={{ color: '#4caf50', mb: 2 }} />
        <Typography sx={{ color: '#fff' }}>Calcolo punteggio...</Typography>
      </RoomBackground>
    );
  }

  return (
    <RoomBackground>
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
        Partita in corso.
      </Typography>
      <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'underline' }}>
        Torna alla home
      </Link>
    </RoomBackground>
  );
};

const RoomBackground = styled(Box)({
  width: '100vw',
  height: '100vh',
  backgroundColor: '#1a3a1a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
});
