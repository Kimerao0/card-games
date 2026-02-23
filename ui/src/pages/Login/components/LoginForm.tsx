import { type FC, useState } from 'react';
import { Alert, Box, Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '@/store/api/authApi';
import { extractErrorMessage } from './loginUtils';

interface LoginFormProps {
  readonly redirectTo: string;
}

export const LoginForm: FC<LoginFormProps> = ({ redirectTo }) => {
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [login, { isLoading, error }] = useLoginMutation();

  const handleLogin = async (): Promise<void> => {
    try {
      await login({ email: loginEmail.trim(), password: loginPassword }).unwrap();
      navigate(redirectTo, { replace: true });
    } catch {
      // handled via error
    }
  };

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        void handleLogin();
      }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      {error && <Alert severity="error">{extractErrorMessage(error)}</Alert>}

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

      <Button type="submit" variant="contained" size="large" disabled={isLoading} sx={submitButtonSx}>
        {isLoading ? 'Accesso in corso...' : 'Accedi'}
      </Button>
    </Box>
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
