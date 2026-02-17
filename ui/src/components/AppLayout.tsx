import { type FC } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { AppHeader } from '@/components/AppHeader';

export const AppLayout: FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <AppHeader />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', maxHeight: '100vh' }}>
        <Outlet />
      </Box>
    </Box>
  );
};
