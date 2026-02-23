import { type FC, useState } from 'react';
import { Alert, Box, Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '@/store/api/authApi';
import { extractErrorMessage } from './loginUtils';

interface RegisterFormProps {
  readonly redirectTo: string;
}

export const RegisterForm: FC<RegisterFormProps> = ({ redirectTo }) => {
  const navigate = useNavigate();
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [register, { isLoading, error }] = useRegisterMutation();

  const handleRegister = async (): Promise<void> => {
    try {
      await register({
        email: registerEmail.trim(),
        name: registerName.trim(),
        password: registerPassword,
      }).unwrap();
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
        void handleRegister();
      }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      {error && <Alert severity="error">{extractErrorMessage(error)}</Alert>}

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

      <Button type="submit" variant="contained" size="large" disabled={isLoading} sx={submitButtonSx}>
        {isLoading ? 'Registrazione in corso...' : 'Registrati'}
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
