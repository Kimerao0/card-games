import { type FC } from 'react';
import { Box, styled } from '@mui/material';

export const Playroom: FC = () => {
  return (
    <PlayroomWrapper>
      {/* Area di gioco */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 24,
        }}
      >
        Playroom
      </Box>
    </PlayroomWrapper>
  );
};

const PlayroomWrapper = styled(Box)({
  width: '100vw',
  height: '100vh',
  backgroundColor: '#1f7a1f', // verde tavolo
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});
