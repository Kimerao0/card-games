import { type FC, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, styled } from '@mui/material';
import { ALL_CARDS } from '@/constants/cardsData';
import type { ICard } from '@/dtos/Card';
import { useGetGameQuery, useGetGameHandQuery, useGetGamePlayersQuery } from '@/store/api/gamesApi';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { Playroom } from '@/pages/Playroom';

interface WaitingRoomProps {
  readonly playersCount: number;
  readonly maxPlayers: number;
  readonly gameId: string;
}

const WaitingRoom: FC<WaitingRoomProps> = ({ playersCount, maxPlayers, gameId }) => {
  return (
    <WaitingWrapper>
      <CircularProgress size={64} sx={{ color: '#4caf50', mb: 3 }} />
      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
        In attesa dei giocatori...
      </Typography>
      <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
        Partita #{gameId.slice(-6).toUpperCase()}
      </Typography>
      <SeatsRow>
        {Array.from({ length: maxPlayers }, (_, i) => (
          <SeatDot key={i} $filled={i < playersCount} />
        ))}
      </SeatsRow>
      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', mt: 2, mb: 3 }}>
        {playersCount}/{maxPlayers} giocatori connessi
      </Typography>
      <Link to="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>
        Torna alla home
      </Link>
    </WaitingWrapper>
  );
};

export const GameRoom: FC = () => {
  const { id: gameId } = useParams<{ id: string }>();
  const currentUser = useAppSelector(selectCurrentUser);
  const [pollingInterval, setPollingInterval] = useState(0);

  const { data: game, isLoading: isLoadingGame, isError } = useGetGameQuery(gameId!, { pollingInterval });

  const isReady = game?.status === 'Ready';

  const { data: handDto, isLoading: isLoadingHand } = useGetGameHandQuery(gameId!, {
    skip: !isReady || !game?.isUserInGame,
  });

  const { data: players } = useGetGamePlayersQuery(gameId!, { skip: !isReady });

  useEffect(() => {
    if (game?.status === 'Created') {
      setPollingInterval(3000);
    } else {
      setPollingInterval(0);
    }
  }, [game?.status]);

  const playerCards: ICard[] = useMemo(() => {
    if (!handDto?.handCardIds) return [];
    return handDto.handCardIds.map((id) => ALL_CARDS[id - 1]);
  }, [handDto]);

  const playerNames = useMemo(() => {
    if (!players || players.length < 2 || !currentUser) return undefined;
    const currentIndex = players.findIndex((p) => p.userId === currentUser.id);
    if (currentIndex === -1) return undefined;
    const total = players.length;
    const getName = (offset: number): string | undefined => players[(currentIndex + offset) % total]?.name;
    return {
      bottom: getName(0),
      right: getName(1),
      top: getName(2),
      left: getName(3),
    };
  }, [players, currentUser]);

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
      return <Playroom cards={playerCards} playerNames={playerNames} />;
    }
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

const WaitingWrapper = styled(RoomBackground)({});

const SeatsRow = styled(Box)({
  display: 'flex',
  gap: '16px',
  margin: '16px 0',
});

const SeatDot = styled(Box)<{ $filled: boolean }>(({ $filled }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  backgroundColor: $filled ? '#4caf50' : 'transparent',
  border: $filled ? '3px solid #4caf50' : '3px solid rgba(255,255,255,0.3)',
  transition: 'all 0.3s ease',
}));
