import { type FC } from 'react';
import { Card, CardContent, Divider, Typography } from '@mui/material';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

export interface RuleItem {
  readonly title: string;
  readonly text: string;
}

interface RulesCardTheme {
  readonly headingColor: string;
  readonly dividerColor: string;
  readonly titleColor: string;
  readonly itemBackground: string;
  readonly itemBorderColor: string;
}

interface RulesCardProps {
  readonly rules: RuleItem[];
  readonly theme: RulesCardTheme;
}

export const RulesCard: FC<RulesCardProps> = ({ rules, theme }) => {
  return (
    <StyledRulesCard elevation={8}>
      <CardContent sx={{ py: 4, px: { xs: 3, sm: 5 } }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color: theme.headingColor, mb: 3, textAlign: 'center' }}>
          Come giocare
        </Typography>
        <Divider sx={{ mb: 3, borderColor: theme.dividerColor }} />

        <RulesGrid>
          {rules.map((rule) => (
            <RuleItemWrapper key={rule.title} $background={theme.itemBackground} $borderColor={theme.itemBorderColor}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.titleColor, mb: 0.5 }}>
                {rule.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                {rule.text}
              </Typography>
            </RuleItemWrapper>
          ))}
        </RulesGrid>
      </CardContent>
    </StyledRulesCard>
  );
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StyledRulesCard = styled(Card)({
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

const RuleItemWrapper = styled('div')<{ $background: string; $borderColor: string }>(({ $background, $borderColor }) => ({
  padding: '16px 20px',
  borderRadius: '10px',
  background: $background,
  borderLeft: `4px solid ${$borderColor}`,
}));
