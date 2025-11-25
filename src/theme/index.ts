import { ocean, gold, gradients, neutrals, status, borders } from '../design-tokens/colors';
import { shadows, blurs, radii, transitions, glassPresets } from '../design-tokens/effects';
import { typography } from '../design-tokens/typography';

export const theme = {
  colors: { ocean, gold, neutrals, status },
  gradients,
  borders,
  effects: { shadows, blurs, radii, transitions, glassPresets },
  typography,
};

export type ThemeConfig = typeof theme;

export default theme;
