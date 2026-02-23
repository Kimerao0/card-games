import { type FC } from 'react';
import styled from '@emotion/styled';
import RetroImg from '@/assets/cards/napoletane/retro.jpg';

type TOpponentPosition = 'top' | 'left' | 'right';

interface OpponentSeatProps {
  readonly position: TOpponentPosition;
  readonly playerName?: string;
  readonly isActive: boolean;
  readonly cardCount?: number;
}

export const OpponentSeat: FC<OpponentSeatProps> = ({ position, playerName, isActive, cardCount = 10 }) => {
  if (position === 'top') {
    return (
      <TopSeatWrapper>
        <TopHandWrapper>
          {Array.from({ length: cardCount }).map((_, index) => (
            <div key={`top-${index}`} style={{ backgroundImage: `url(${RetroImg})` }} />
          ))}
        </TopHandWrapper>
        {playerName && <NameLabel $active={isActive}>{playerName}</NameLabel>}
      </TopSeatWrapper>
    );
  }

  return (
    <SideSeatWrapper>
      <VerticalHandWrapper>
        {Array.from({ length: cardCount }).map((_, index) => (
          <div key={`${position}-${index}`} style={{ backgroundImage: `url(${RetroImg})` }} />
        ))}
      </VerticalHandWrapper>
      {playerName && <NameLabel $active={isActive}>{playerName}</NameLabel>}
    </SideSeatWrapper>
  );
};

const CommonDiv = styled('div')({
  display: 'flex',
  margin: '20px',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
});

const FullRow = styled(CommonDiv)({
  position: 'relative',
  width: 'calc(100vw - 40px)',
  height: 'calc(20vh - 40px)',
  flexDirection: 'row',
});

const TopHandWrapper = styled(FullRow)({
  gap: '20px',
  position: 'relative',
  '& > div': {
    width: '3%',
    height: 'auto',
    aspectRatio: '2/3',
    border: '1px solid black',
    borderRadius: '8px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
});

const VerticalHandWrapper = styled(CommonDiv)({
  position: 'relative',
  width: 'calc(20vw - 40px)',
  height: 'calc(60vh - 40px)',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 0,
  '& > div': {
    width: '3vw',
    height: 'auto',
    aspectRatio: '2/3',
    flexShrink: 0,
    border: '1px solid black',
    borderRadius: '8px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transform: 'rotate(90deg)',
    '&:not(:last-child)': {
      marginBottom: 'calc((60vh - 40px - 45vw) / 9)',
    },
  },
});

const NameLabel = styled('span')<{ $active: boolean }>(({ $active }) => ({
  position: 'absolute',
  bottom: 0,
  display: 'block',
  textAlign: 'center',
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '0.8rem',
  fontWeight: 700,
  letterSpacing: '0.03em',
  backgroundColor: $active ? 'rgba(76, 175, 80, 0.55)' : 'rgba(0, 0, 0, 0.35)',
  borderRadius: '10px',
  padding: '2px 10px',
  whiteSpace: 'nowrap',
  userSelect: 'none',
  boxShadow: $active ? '0 0 18px rgba(76, 175, 80, 0.55)' : 'none',
  border: $active ? '1px solid rgba(76, 175, 80, 0.75)' : '1px solid rgba(255,255,255,0.12)',
}));

const TopSeatWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  position: 'relative',
});

const SideSeatWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  position: 'relative',
});
