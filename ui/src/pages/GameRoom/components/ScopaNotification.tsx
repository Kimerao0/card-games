import { type FC } from 'react';
import { Box, Typography, styled } from '@mui/material';

interface ScopaNotificationProps {
  readonly playerName: string;
}

export const ScopaNotification: FC<ScopaNotificationProps> = ({ playerName }) => {
  return (
    <ScopaNotificationOverlay>
      <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
        SCOPA!
      </Typography>
      <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mt: 0.5 }}>
        {playerName}
      </Typography>
    </ScopaNotificationOverlay>
  );
};

const ScopaNotificationOverlay = styled(Box)({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 1200,
  backgroundColor: 'rgba(46, 125, 50, 0.92)',
  borderRadius: '16px',
  padding: '24px 48px',
  textAlign: 'center',
  pointerEvents: 'none',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
});
