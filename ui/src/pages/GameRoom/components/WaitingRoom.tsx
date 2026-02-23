import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { Box, CircularProgress, Typography, styled } from '@mui/material';

interface WaitingRoomProps {
  readonly playersCount: number;
  readonly maxPlayers: number;
  readonly gameId: string;
}

export const WaitingRoom: FC<WaitingRoomProps> = ({ playersCount, maxPlayers, gameId }) => {
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

const RoomBackground = styled(Box)({
  width: '100vw',
  height: '100vh',
  backgroundColor: '#1a3a1a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
});

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
