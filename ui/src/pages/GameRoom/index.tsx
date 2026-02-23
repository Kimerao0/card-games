import { type FC } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, styled } from '@mui/material';
import { Playroom } from '@/pages/Playroom';
import { useGameRoomState } from './components/useGameRoomState';
import { WaitingRoom } from './components/WaitingRoom';
import { ScoreOverlay } from './components/ScoreOverlay';
import { ScopaNotification } from './components/ScopaNotification';

export const GameRoom: FC = () => {
  const { id: gameId } = useParams<{ id: string }>();
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
      <CenteredWrapper>
        <CircularProgress />
      </CenteredWrapper>
    );
  }

  if (isError || !game) {
    return (
      <CenteredWrapper>
        <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
          Partita non trovata.
        </Typography>
        <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'underline' }}>
          Torna alla home
        </Link>
      </CenteredWrapper>
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
      <CenteredWrapper>
        <CircularProgress sx={{ color: '#4caf50', mb: 2 }} />
        <Typography sx={{ color: '#fff' }}>Calcolo punteggio...</Typography>
      </CenteredWrapper>
    );
  }

  if (game.status === 'Ready') {
    if (isLoadingHand) {
      return (
        <CenteredWrapper>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography sx={{ color: '#fff' }}>Caricamento carte...</Typography>
        </CenteredWrapper>
      );
    }
    if (!game.isUserInGame) {
      return (
        <CenteredWrapper>
          <Typography sx={{ color: '#fff' }}>Non sei un partecipante di questa partita.</Typography>
        </CenteredWrapper>
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

    // Hands empty — endgame imminent; show score if available, else loading
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
      <CenteredWrapper>
        <CircularProgress sx={{ color: '#4caf50', mb: 2 }} />
        <Typography sx={{ color: '#fff' }}>Calcolo punteggio...</Typography>
      </CenteredWrapper>
    );
  }

  return (
    <CenteredWrapper>
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
        Partita in corso.
      </Typography>
      <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'underline' }}>
        Torna alla home
      </Link>
    </CenteredWrapper>
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

const CenteredWrapper = styled(RoomBackground)({});
