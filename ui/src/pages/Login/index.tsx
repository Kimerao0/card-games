// src/pages/Login.tsx
import { type FC, type SyntheticEvent, useMemo, useState } from 'react';
import { Alert, Box, Button, Paper, Tab, Tabs, TextField, Typography } from '@mui/material';
import { Navigate, useLocation, useNavigate, type Location as RouterLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

import { useAppSelector } from '@/store/hooks';
import { selectAuthInitialized, selectIsAuthenticated } from '@/store/slices/authSlice';
import { useLoginMutation, useRegisterMutation } from '@/store/api/authApi';
import RetroImg from '@/assets/cards/napoletane/retro.jpg';

type LocationState = {
  from?: RouterLocation;
};

const isSafeInternalPath = (path: string): boolean => {
  // Allow only app-internal, absolute paths. Prevents open redirects.
  if (!path.startsWith('/')) return false;
  if (path.startsWith('//')) return false;
  return true;
};

const toFullPath = (loc: RouterLocation): string => `${loc.pathname}${loc.search}${loc.hash}`;

const shuffleArray = (arr: number[]): number[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const Login: FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAuthInitialized = useAppSelector(selectAuthInitialized);

  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(() => {
    const state = (location.state ?? null) as LocationState | null;
    const fromLoc = state?.from;
    const candidate = fromLoc ? toFullPath(fromLoc) : '/';
    return isSafeInternalPath(candidate) ? candidate : '/';
  }, [location.state]);

  const scatteredCards = useMemo(() => {
    const allIds = Array.from({ length: 40 }, (_, i) => i + 1);
    return shuffleArray(allIds).slice(0, 12);
  }, []);

  const [activeTab, setActiveTab] = useState(0);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerEmail, setRegisterEmail] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const [login, { isLoading: isLoginLoading, error: loginError }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading, error: registerError }] = useRegisterMutation();

  // If auth is still initializing, avoid bouncing around.
  if (!isAuthInitialized) {
    return (
      <PageWrapper>
        <ContentLayer>
          <Typography aria-busy="true" aria-live="polite" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Caricamento...
          </Typography>
        </ContentLayer>
      </PageWrapper>
    );
  }

  // If already authenticated, send them where they intended to go (or /)
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleTabChange = (_event: SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };

  const extractErrorMessage = (error: unknown): string => {
    // RTK Query commonly returns FetchBaseQueryError or SerializedError.
    // This safely digs out a server "message" while falling back.
    if (error && typeof error === 'object' && 'data' in error) {
      const data = (error as { data: unknown }).data;
      if (data && typeof data === 'object' && 'message' in data) {
        const message = (data as { message: unknown }).message;
        if (typeof message === 'string') return message;
        if (Array.isArray(message)) return message.join(', ');
      }
    }
    return 'Si è verificato un errore. Riprova.';
  };

  const handleLogin = async (): Promise<void> => {
    try {
      await login({ email: loginEmail.trim(), password: loginPassword }).unwrap();
      // Navigate to the originally requested page (safe internal path)
      navigate(from, { replace: true });
      // Refreshing the page after login can help ensure all auth-dependent data is up-to-date, but it's optional.
      window.location.reload();
    } catch {
      // handled via loginError
    }
  };

  const handleRegister = async (): Promise<void> => {
    try {
      await register({
        email: registerEmail.trim(),
        name: registerName.trim(),
        password: registerPassword,
      }).unwrap();
      navigate(from, { replace: true });
    } catch {
      // handled via registerError
    }
  };

  const isSubmitDisabled = (activeTab === 0 && isLoginLoading) || (activeTab === 1 && isRegisterLoading);

  return (
    <PageWrapper>
      {/* Scattered background cards */}
      <ScatteredCardsLayer>
        {scatteredCards.map((cardId, index) => {
          const angle = ((index * 47 + 13) % 360) - 180;
          const xPercent = ((index * 31 + 7) % 90) + 5;
          const yPercent = ((index * 43 + 19) % 80) + 10;
          return (
            <ScatteredCard
              key={cardId}
              style={{
                left: `${xPercent}%`,
                top: `${yPercent}%`,
                transform: `rotate(${angle}deg)`,
                backgroundImage: `url(${RetroImg})`,
                animationDelay: `${index * 0.1}s`,
              }}
            />
          );
        })}
      </ScatteredCardsLayer>

      {/* Main content */}
      <ContentLayer>
        <TitleBlock>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: '#fff', textShadow: '2px 3px 6px rgba(0,0,0,0.5)', mb: 0.5 }}>
            Carte Italiane
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', textShadow: '1px 2px 4px rgba(0,0,0,0.4)' }}>
            Accedi per iniziare a giocare
          </Typography>
        </TitleBlock>

        <LoginCard elevation={12}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} TabIndicatorProps={{ style: { backgroundColor: '#2e7d32' } }}>
              <Tab label="Accedi" sx={{ fontWeight: 600, '&.Mui-selected': { color: '#2e7d32' } }} />
              <Tab label="Registrati" sx={{ fontWeight: 600, '&.Mui-selected': { color: '#2e7d32' } }} />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                void handleLogin();
              }}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              {loginError && <Alert severity="error">{extractErrorMessage(loginError)}</Alert>}

              <TextField
                label="Email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                autoComplete="email"
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                autoComplete="current-password"
                fullWidth
              />

              <Button type="submit" variant="contained" size="large" disabled={isSubmitDisabled} sx={submitButtonSx}>
                {isLoginLoading ? 'Accesso in corso...' : 'Accedi'}
              </Button>
            </Box>
          )}

          {activeTab === 1 && (
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                void handleRegister();
              }}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              {registerError && <Alert severity="error">{extractErrorMessage(registerError)}</Alert>}

              <TextField
                label="Email"
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
                autoComplete="email"
                fullWidth
              />
              <TextField
                label="Nome"
                type="text"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                required
                autoComplete="name"
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
                autoComplete="new-password"
                fullWidth
              />

              <Button type="submit" variant="contained" size="large" disabled={isSubmitDisabled} sx={submitButtonSx}>
                {isRegisterLoading ? 'Registrazione in corso...' : 'Registrati'}
              </Button>
            </Box>
          )}
        </LoginCard>
      </ContentLayer>
    </PageWrapper>
  );
};

const submitButtonSx = {
  mt: 1,
  py: 1.4,
  bgcolor: '#2e7d32',
  fontWeight: 600,
  fontSize: '1rem',
  borderRadius: 2,
  textTransform: 'none' as const,
  '&:hover': { bgcolor: '#1b5e20', transform: 'translateY(-2px)', boxShadow: 6 },
  transition: 'all 0.2s ease',
};

const cardFadeIn = keyframes`
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 0.12; }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageWrapper = styled('div')({
  position: 'relative',
  width: '100%',
  minHeight: '100%',
  background: 'linear-gradient(160deg, #1a3a1a 0%, #2d5a27 30%, #1b4332 70%, #0d2818 100%)',
  overflow: 'hidden',
});

const ScatteredCardsLayer = styled('div')({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  overflow: 'hidden',
});

const ScatteredCard = styled('div')({
  position: 'absolute',
  width: '70px',
  height: '105px',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: '6px',
  opacity: 0,
  animation: `${cardFadeIn} 0.8s ease forwards`,
  boxShadow: '2px 4px 12px rgba(0,0,0,0.3)',
});

const ContentLayer = styled('div')({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100%',
  gap: '28px',
  padding: '48px 24px',
});

const TitleBlock = styled('div')({
  textAlign: 'center',
  animation: `${fadeInUp} 0.5s ease`,
});

const LoginCard = styled(Paper)({
  width: '100%',
  maxWidth: '440px',
  padding: '32px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.97)',
  backdropFilter: 'blur(10px)',
  animation: `${fadeInUp} 0.5s ease 0.15s both`,
});
