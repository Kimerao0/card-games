import { type FC } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import RetroImg from '@/assets/cards/napoletane/retro.jpg';

interface GamePageBackgroundProps {
  readonly scatteredCardIds: number[];
}

export const GamePageBackground: FC<GamePageBackgroundProps> = ({ scatteredCardIds }) => {
  return (
    <ScatteredCardsLayer>
      {scatteredCardIds.map((cardId, index) => {
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
  );
};

const cardFadeIn = keyframes`
  from { opacity: 0; transform: scale(0.8) rotate(0deg); }
  to { opacity: 0.12; }
`;

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
