import { type FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import RetroImg from '@/assets/cards/napoletane/retro.jpg';
import { CARDS_IMAGES } from '@/constants/cardsData';
import { useCreateGameMutation, useJoinGameMutation, useListGamesQuery } from '@/store/api/gamesApi';

const SHOWCASE_CARD_IDS = [1, 11, 21, 31, 10, 20, 30, 40];

const RULES = [
  {
    title: 'Obiettivo',
    text: 'Lo Scopone Scientifico si gioca in 4 giocatori divisi in 2 coppie. Vince la coppia che accumula più punti catturando carte preziose dal tavolo.',
  },
  {
    title: 'Distribuzione',
    text: 'Tutte e 40 le carte del mazzo napoletano vengono distribuite: 10 carte a testa. Nessuna carta viene lasciata inizialmente sul tavolo.',
  },
  {
    title: 'Il gioco',
    text: 'A turno ogni giocatore gioca una carta dalla propria mano. Se la carta pareggia il valore di una o più carte sul tavolo, le cattura. Altrimenti la carta rimane sul tavolo.',
  },
  {
    title: 'Catture multiple',
    text: 'È possibile catturare più carte sommando i loro valori. Ad esempio, un 7 può catturare un 3 e un 4 oppure un 7 singolo.',
  },
  {
    title: 'Lo Scopone',
    text: 'Se un giocatore cattura tutte le carte presenti sul tavolo fa "scopa" (o "scopone"). Ogni scopa vale un punto bonus aggiuntivo.',
  },
  {
    title: 'Punteggio',
    text: 'Al termine della mano si contano i punti: carte catturate (chi ne ha di più), settebello (7 di denari), denari (chi ne ha di più), primiera (combinazione di punteggi per seme) e scope.',
  },
];

const shuffleArray = (arr: number[]): number[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const ScoponeScientifico: FC = () => {
  const navigate = useNavigate();
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  const [createGame, { isLoading: isCreating }] = useCreateGameMutation();
  const { data: games, isLoading: isLoadingGames } = useListGamesQuery(undefined, { skip: !joinDialogOpen });
  const [joinGame, { isLoading: isJoining }] = useJoinGameMutation();

  const joinableGames = games?.filter((g) => !g.isUserInGame && g.playersCount < g.maxPlayers) ?? [];

  const handleCreateGame = async (): Promise<void> => {
    try {
      await createGame().unwrap();
    } catch (_err) {
      // Error surfaces via RTK Query hook state
    }
  };

  const handleJoinGame = async (gameId: string): Promise<void> => {
    try {
      await joinGame(gameId).unwrap();
      setJoinDialogOpen(false);
      navigate('/dev');
    } catch (_err) {
      // Error surfaces via RTK Query hook state
    }
  };

  const scatteredCards = useMemo(() => {
    const allIds = Array.from({ length: 40 }, (_, i) => i + 1);
    return shuffleArray(allIds).slice(0, 14);
  }, []);

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
                animationDelay: `${index * 0.12}s`,
              }}
            />
          );
        })}
      </ScatteredCardsLayer>

      <ContentLayer>
        {/* Hero */}
        <HeroSection>
          <FanWrapper>
            {SHOWCASE_CARD_IDS.map((cardId, index) => {
              const totalCards = SHOWCASE_CARD_IDS.length;
              const angleStep = 8;
              const angle = (index - (totalCards - 1) / 2) * angleStep;
              const yOffset = Math.abs(index - (totalCards - 1) / 2) * 6;
              return (
                <FanCard
                  key={cardId}
                  style={{
                    backgroundImage: `url(${CARDS_IMAGES[cardId]})`,
                    transform: `rotate(${angle}deg) translateY(${yOffset}px)`,
                    zIndex: index < totalCards / 2 ? index : totalCards - index,
                    animationDelay: `${0.3 + index * 0.08}s`,
                  }}
                />
              );
            })}
          </FanWrapper>

          <TitleBlock>
            <Typography variant="h2" component="h1" sx={{ fontWeight: 700, color: '#fff', textShadow: '2px 3px 6px rgba(0,0,0,0.5)', mb: 1 }}>
              Scopone Scientifico
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', textShadow: '1px 2px 4px rgba(0,0,0,0.4)', fontWeight: 400, maxWidth: 560 }}>
              Il classico gioco di strategia a coppie con tutte le 40 carte. Cattura, calcola, vinci.
            </Typography>
          </TitleBlock>
        </HeroSection>

        {/* Come giocare */}
        <RulesCard elevation={8}>
          <CardContent sx={{ py: 4, px: { xs: 3, sm: 5 } }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color: '#1b5e20', mb: 3, textAlign: 'center' }}>
              Come giocare
            </Typography>
            <Divider sx={{ mb: 3, borderColor: '#c8e6c9' }} />

            <RulesGrid>
              {RULES.map((rule) => (
                <RuleItem key={rule.title}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2e7d32', mb: 0.5 }}>
                    {rule.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {rule.text}
                  </Typography>
                </RuleItem>
              ))}
            </RulesGrid>
          </CardContent>
        </RulesCard>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', pb: 4 }}>
          <Button variant="contained" size="large" sx={actionButtonSx('#2e7d32', '#1b5e20')} onClick={handleCreateGame} disabled={isCreating}>
            {isCreating ? <CircularProgress size={20} color="inherit" /> : 'Crea partita'}
          </Button>
          <Button variant="outlined" size="large" sx={outlinedButtonSx} onClick={() => setJoinDialogOpen(true)}>
            Unisciti ad una partita
          </Button>
        </Box>
      </ContentLayer>

      <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Partite disponibili</DialogTitle>
        <DialogContent>
          {isLoadingGames ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : joinableGames.length === 0 ? (
            <Alert severity="info">Nessuna partita disponibile al momento.</Alert>
          ) : (
            <List disablePadding>
              {joinableGames.map((game) => (
                <ListItemButton key={game.id} disabled={isJoining} onClick={() => handleJoinGame(game.id)}>
                  <ListItemText primary={`Partita #${game.id.slice(-6).toUpperCase()}`} secondary={`${game.playersCount}/${game.maxPlayers} giocatori`} />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
};

const actionButtonSx = (main: string, dark: string) => ({
  px: 5,
  py: 1.5,
  bgcolor: main,
  fontWeight: 600,
  fontSize: '1rem',
  borderRadius: 2,
  textTransform: 'none' as const,
  '&:hover': { bgcolor: dark, transform: 'translateY(-2px)', boxShadow: 6 },
  transition: 'all 0.2s ease',
});

const outlinedButtonSx = {
  px: 5,
  py: 1.5,
  fontWeight: 600,
  fontSize: '1rem',
  borderRadius: 2,
  textTransform: 'none' as const,
  color: '#fff',
  borderColor: 'rgba(255,255,255,0.6)',
  '&:hover': {
    borderColor: '#fff',
    bgcolor: 'rgba(255,255,255,0.1)',
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.2s ease',
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const cardFadeIn = keyframes`
  from { opacity: 0; transform: scale(0.8) rotate(0deg); }
  to { opacity: 0.12; }
`;

const fanCardIn = keyframes`
  from { opacity: 0; transform: translateY(40px) scale(0.7); }
  to { opacity: 1; }
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
  gap: '40px',
  padding: '40px 24px 24px',
});

const HeroSection = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '24px',
  animation: `${fadeIn} 0.6s ease`,
});

const FanWrapper = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-end',
  height: '170px',
  gap: '0px',
  marginBottom: '8px',
});

const FanCard = styled('div')({
  width: '80px',
  height: '120px',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: '8px',
  boxShadow: '2px 4px 16px rgba(0,0,0,0.4)',
  border: '2px solid rgba(255,255,255,0.15)',
  flexShrink: 0,
  marginLeft: '-18px',
  transformOrigin: 'bottom center',
  opacity: 0,
  animation: `${fanCardIn} 0.5s ease forwards`,
  '&:first-of-type': {
    marginLeft: 0,
  },
});

const TitleBlock = styled('div')({
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const RulesCard = styled(Card)({
  width: '100%',
  maxWidth: '860px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.97)',
  backdropFilter: 'blur(10px)',
  animation: `${fadeIn} 0.6s ease 0.2s both`,
});

const RulesGrid = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
  gap: '24px',
});

const RuleItem = styled('div')({
  padding: '16px 20px',
  borderRadius: '10px',
  background: '#f1f8e9',
  borderLeft: '4px solid #66bb6a',
});
