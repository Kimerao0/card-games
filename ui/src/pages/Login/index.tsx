// src/pages/Login.tsx
import { type FC, type SyntheticEvent, useMemo, useState } from 'react';
import { Alert, Box, Button, Container, Tab, Tabs, TextField, Typography } from '@mui/material';
import { Navigate, useLocation, useNavigate, type Location as RouterLocation } from 'react-router-dom';

import { useAppSelector } from '@/store/hooks';
import { selectAuthInitialized, selectIsAuthenticated } from '@/store/slices/authSlice';
import { useLoginMutation, useRegisterMutation } from '@/store/api/authApi';

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
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography aria-busy="true" aria-live="polite">
          Caricamento...
        </Typography>
      </Container>
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
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Carte Italiane
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Accedi" />
          <Tab label="Registrati" />
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

          <TextField label="Email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required autoComplete="email" fullWidth />
          <TextField
            label="Password"
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
            autoComplete="current-password"
            fullWidth
          />

          <Button type="submit" variant="contained" size="large" disabled={isSubmitDisabled}>
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
          <TextField label="Nome" type="text" value={registerName} onChange={(e) => setRegisterName(e.target.value)} required autoComplete="name" fullWidth />
          <TextField
            label="Password"
            type="password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            required
            autoComplete="new-password"
            fullWidth
          />

          <Button type="submit" variant="contained" size="large" disabled={isSubmitDisabled}>
            {isRegisterLoading ? 'Registrazione in corso...' : 'Registrati'}
          </Button>
        </Box>
      )}
    </Container>
  );
};
