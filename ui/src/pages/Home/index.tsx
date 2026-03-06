import { type FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { CARDS_IMAGES } from '@/constants/cardsData';
import RetroImg from '@/assets/cards/napoletane/retro.jpg';

const SHOWCASE_CARD_IDS = [1, 11, 21, 31, 10, 20, 30, 40];

const shuffleArray = (arr: number[]): number[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const Home: FC = () => {
  const navigate = useNavigate();

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

      {/* Main content */}
      <ContentLayer>
        {/* Hero section */}
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
              Giochi di carte
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', textShadow: '1px 2px 4px rgba(0,0,0,0.4)', fontWeight: 400, maxWidth: 560 }}>
              Gioca online ai grandi classici dei giochi di carte italiani. Crea una partita, invita i tuoi amici e sfidali!
            </Typography>
          </TitleBlock>
        </HeroSection>

        {/* Game selection cards */}
        <GamesRow>
          <GameCard elevation={8}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 3, px: 4 }}>
              <CardIconRow>
                {[1, 11, 21, 31].map((id) => (
                  <MiniCard key={id} style={{ backgroundImage: `url(${CARDS_IMAGES[id]})` }} />
                ))}
              </CardIconRow>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1b5e20' }}>
                Scopone Scientifico
              </Typography>
              <Chip label="4 giocatori" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 500 }} />
              <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', lineHeight: 1.6 }}>
                Il classico gioco di strategia a coppie. Tutte le 40 carte distribuite, nessuna lasciata al caso. Cattura le carte dal tavolo e fai
                &ldquo;scopone&rdquo;!
              </Typography>
              <Button variant="contained" size="large" onClick={() => navigate('/giochi/scopone-scientifico')} sx={gameButtonSx('#2e7d32', '#1b5e20')}>
                Gioca a Scopone
              </Button>
            </CardContent>
          </GameCard>

          <GameCard elevation={8}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 3, px: 4 }}>
              <CardIconRow>
                {[10, 20, 30, 40].map((id) => (
                  <MiniCard key={id} style={{ backgroundImage: `url(${CARDS_IMAGES[id]})` }} />
                ))}
              </CardIconRow>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#b71c1c' }}>
                Tresette
              </Typography>
              <Chip label="4 giocatori" size="small" sx={{ bgcolor: '#fce4ec', color: '#c62828', fontWeight: 500 }} />
              <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', lineHeight: 1.6 }}>
                Il re dei giochi di carte italiani. Gioca a coppie, comunica con i segnali e conquista il maggior numero di punti con prese strategiche.
              </Typography>
              <Button variant="contained" size="large" onClick={() => navigate('/giochi/tresette')} sx={gameButtonSx('#c62828', '#b71c1c')}>
                Gioca a Tresette
              </Button>
            </CardContent>
          </GameCard>
        </GamesRow>

        {/* Footer tagline */}
        <Box sx={{ textAlign: 'center', pb: 4 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
            Multiplayer in tempo reale &middot; Mazzo Napoletane da 40 carte &middot; Partite a 4 giocatori
          </Typography>
        </Box>
      </ContentLayer>
    </PageWrapper>
  );
};

const gameButtonSx = (main: string, dark: string) => ({
  mt: 1,
  px: 4,
  py: 1.2,
  bgcolor: main,
  fontWeight: 600,
  fontSize: '1rem',
  borderRadius: 2,
  textTransform: 'none' as const,
  '&:hover': { bgcolor: dark, transform: 'translateY(-2px)', boxShadow: 6 },
  transition: 'all 0.2s ease',
});

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

const GamesRow = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  gap: '32px',
  justifyContent: 'center',
  flexWrap: 'wrap',
  maxWidth: '900px',
  width: '100%',
  animation: `${fadeIn} 0.6s ease 0.2s both`,
});

const GameCard = styled(Card)({
  flex: '1 1 360px',
  maxWidth: '420px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.97)',
  backdropFilter: 'blur(10px)',
  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
  },
});

const CardIconRow = styled('div')({
  display: 'flex',
  gap: '6px',
  justifyContent: 'center',
});

const MiniCard = styled('div')({
  width: '44px',
  height: '66px',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: '5px',
  boxShadow: '1px 2px 6px rgba(0,0,0,0.2)',
  border: '1px solid rgba(0,0,0,0.08)',
});
