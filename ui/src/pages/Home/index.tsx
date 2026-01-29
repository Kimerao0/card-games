import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Stack, Typography } from '@mui/material';

export const Home: FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Typography variant="h3" component="h1">
          Benvenuto!
        </Typography>

        <Typography variant="body1">
          Sto creando una piattaforma per giocare online ai grandi classici dei giochi di carte italiani. Scegli un gioco per vedere le regole e poi creare una
          nuova partita multiplayer o unirti a una già esistente.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button variant="contained" size="large" onClick={() => navigate('/giochi/scopone-scientifico')}>
            Scopone scientifico
          </Button>

          <Button variant="outlined" size="large" onClick={() => navigate('/giochi/tresette')}>
            Tresette
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};
