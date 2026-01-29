import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from '@/App.tsx';
import { Provider } from 'react-redux';
import { store } from '@/store/index.ts';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '@/theme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
      </ThemeProvider>
      <App />
    </Provider>
  </StrictMode>
);
