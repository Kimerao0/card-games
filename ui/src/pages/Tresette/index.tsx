import { type FC, useMemo } from 'react';
import { Box, Button, Card, CardContent, Divider, Typography } from '@mui/material';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import RetroImg from '@/assets/cards/napoletane/retro.jpg';
import { CARDS_IMAGES } from '@/constants/cardsData';

const SHOWCASE_CARD_IDS = [10, 20, 30, 40, 1, 11, 21, 31];

const RULES = [
  {
    title: 'Obiettivo',
    text: 'Il Tresette si gioca in 4 giocatori divisi in 2 coppie. Vince la coppia che raggiunge per prima 31 punti (o il punteggio concordato) sommando i risultati di più mani.',
  },
  {
    title: 'Distribuzione',
    text: 'Vengono distribuite 10 carte a testa da un mazzo napoletano da 40 carte. Nessuna carta viene lasciata scoperta: tutte le 40 carte sono in mano ai giocatori.',
  },
  {
    title: 'Il gioco',
    text: 'Il giocatore di mano guida con una carta; gli altri devono seguire il seme se lo possiedono. Chi gioca la carta più alta del seme di apertura aggiudica la presa e guida nella manche successiva.',
  },
  {
    title: 'Gerarchia delle carte',
    text: 'L\'ordine di valore (dal più alto al più basso) è: 3, 2, Asso, Re, Cavallo, Fante, 7, 6, 5, 4. I punti sono: Asso (1), 3 (1/3), 2 (1/3), Figure (1/3 ciascuna).',
  },
  {
    title: 'I segnali',
    text: 'La comunicazione tra compagni avviene tramite segnali convenzionali: bussare (picchiare sul tavolo), strisciare, volo o controvolo. Ogni segnale comunica informazioni sulla propria mano al compagno.',
  },
  {
    title: 'Punteggio',
    text: 'Al termine di ogni mano si contano i punti nelle prese: ogni Asso vale 1 punto, ogni 3, 2 o figura vale 1/3 di punto. Il totale per mano è 10 punti e 2/3. Si gioca a partite fino a 31 punti.',
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

export const Tresette: FC = () => {
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
              Tresette
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', textShadow: '1px 2px 4px rgba(0,0,0,0.4)', fontWeight: 400, maxWidth: 560 }}>
              Il re dei giochi di carte italiani. Gioca a coppie, comunica con i segnali e conquista il maggior numero di punti con prese strategiche.
            </Typography>
          </TitleBlock>
        </HeroSection>

        {/* Come giocare */}
        <RulesCard elevation={8}>
          <CardContent sx={{ py: 4, px: { xs: 3, sm: 5 } }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color: '#b71c1c', mb: 3, textAlign: 'center' }}>
              Come giocare
            </Typography>
            <Divider sx={{ mb: 3, borderColor: '#ffcdd2' }} />

            <RulesGrid>
              {RULES.map((rule) => (
                <RuleItem key={rule.title}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#c62828', mb: 0.5 }}>
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
          <Button variant="contained" size="large" sx={actionButtonSx('#c62828', '#b71c1c')}>
            Crea partita
          </Button>
          <Button variant="outlined" size="large" sx={outlinedButtonSx}>
            Unisciti ad una partita
          </Button>
        </Box>
      </ContentLayer>
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
  background: 'linear-gradient(160deg, #3a1a1a 0%, #5a2d2d 30%, #431b1b 70%, #280d0d 100%)',
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
  background: '#fce4ec',
  borderLeft: '4px solid #ef9a9a',
});
