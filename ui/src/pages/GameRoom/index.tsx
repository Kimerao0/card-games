import { type FC, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, styled } from '@mui/material';

import { Playroom } from '@/pages/Playroom';
import { useGameRoomState } from './components/useGameRoomState';
import { WaitingRoom } from './components/WaitingRoom';
import { ScoreOverlay } from './components/ScoreOverlay';
import { ScopaNotification } from './components/ScopaNotification';

import { useAppDispatch } from '@/store/hooks';
import { setGameState, setGameStatus, setPlayersCount } from '@/store/slices/gameSocketSlice';
import { joinGameRoom, leaveGameRoom, onGameDeleted, onGamePlayerJoined, onGameStarted, onGameStateUpdated } from '@/services/socketService';

export const GameRoom: FC = () => {
  const { id: gameId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // ---- WebSocket: join/leave room ----
  useEffect(() => {
    if (!gameId) return;

    joinGameRoom(gameId);

    return () => {
      leaveGameRoom(gameId);
    };
  }, [gameId]);

  // ---- WebSocket: subscribe events ----
  useEffect(() => {
    const unsubState = onGameStateUpdated((state) => {
      dispatch(setGameState(state));
    });

    const unsubStarted = onGameStarted(() => {
      dispatch(setGameStatus('Ready'));
    });

    const unsubPlayerJoined = onGamePlayerJoined((details) => {
      dispatch(setPlayersCount(details.playersCount));
      dispatch(setGameStatus(details.status));
    });

    const unsubDeleted = onGameDeleted(() => {
      navigate('/');
    });

    return () => {
      unsubState();
      unsubStarted();
      unsubPlayerJoined();
      unsubDeleted();
    };
  }, [dispatch, navigate]);

  // ---- Existing derived UI state (hook) ----
  const state = useGameRoomState(gameId!);
  const {
    game,
    effectiveStatus,
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

  if (effectiveStatus === 'Created') {
    return <WaitingRoom playersCount={state.effectivePlayersCount ?? game.playersCount} maxPlayers={game.maxPlayers} gameId={game.id} />;
  }

  if (effectiveStatus === 'Scoring') {
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

  if (effectiveStatus === 'Ready') {
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
