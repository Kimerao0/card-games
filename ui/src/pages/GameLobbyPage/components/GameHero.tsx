import { type FC } from 'react';
import { Typography } from '@mui/material';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { CARDS_IMAGES } from '@/constants/cardsData';

interface GameHeroProps {
  readonly showcaseCardIds: number[];
  readonly title: string;
  readonly subtitle: string;
}

export const GameHero: FC<GameHeroProps> = ({ showcaseCardIds, title, subtitle }) => {
  return (
    <HeroSection>
      <FanWrapper>
        {showcaseCardIds.map((cardId, index) => {
          const totalCards = showcaseCardIds.length;
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
          {title}
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', textShadow: '1px 2px 4px rgba(0,0,0,0.4)', fontWeight: 400, maxWidth: 560 }}>
          {subtitle}
        </Typography>
      </TitleBlock>
    </HeroSection>
  );
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fanCardIn = keyframes`
  from { opacity: 0; transform: translateY(40px) scale(0.7); }
  to { opacity: 1; }
`;

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
