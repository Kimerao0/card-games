import { type FC, type SyntheticEvent, useMemo, useState } from 'react';
import { Box, Paper, Tab, Tabs, Typography } from '@mui/material';
import { Navigate, useLocation, type Location as RouterLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useAppSelector } from '@/store/hooks';
import { selectAuthInitialized, selectIsAuthenticated } from '@/store/slices/authSlice';
import RetroImg from '@/assets/cards/napoletane/retro.jpg';
import { shuffleArray } from '@/utils/shuffleArray';
import { isSafeInternalPath } from './components/loginUtils';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';

type LocationState = {
  from?: RouterLocation;
};

const toFullPath = (loc: RouterLocation): string => `${loc.pathname}${loc.search}${loc.hash}`;

export const Login: FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAuthInitialized = useAppSelector(selectAuthInitialized);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);

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

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleTabChange = (_event: SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };

  return (
    <PageWrapper>
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

          {activeTab === 0 && <LoginForm redirectTo={from} />}
          {activeTab === 1 && <RegisterForm redirectTo={from} />}
        </LoginCard>
      </ContentLayer>
    </PageWrapper>
  );
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
