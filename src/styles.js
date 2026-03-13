/**
 * Shared style constants for the Dynamic Pricing Sandbox.
 * Uses design tokens from @jrmst102/shared-config.
 */

import { colors as tokenColors, shadows, radii } from '@jrmst102/shared-config';

const NYU_VIOLET = '#57068c';
const NYU_VIOLET_DARK = '#3f0468';
const NYU_VIOLET_LIGHT = '#d8c6e7';
const NYU_VIOLET_BG = '#f4eff9';

export const colors = {
  primary: NYU_VIOLET,
  primaryDark: NYU_VIOLET_DARK,
  primaryLight: NYU_VIOLET_LIGHT,
  primaryBg: NYU_VIOLET_BG,
  background: tokenColors.neutral[50],
  card: '#ffffff',
  text: tokenColors.neutral[900],
  textSecondary: tokenColors.neutral[600],
  border: tokenColors.neutral[200],
  success: tokenColors.success,
  warning: tokenColors.warning,
  danger: tokenColors.error,
  info: tokenColors.info,
  locked: tokenColors.neutral[500],
};

export const cardStyle = {
  background: colors.card,
  borderRadius: radii.xl,
  boxShadow: shadows.sm,
  padding: 20,
};

export const buttonBase = {
  border: 'none',
  borderRadius: radii.lg,
  padding: '10px 24px',
  fontSize: 13,
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.2s, transform 0.1s',
};

export const primaryButton = {
  ...buttonBase,
  background: colors.primary,
  color: '#fff',
};

export const secondaryButton = {
  ...buttonBase,
  background: tokenColors.neutral[200],
  color: colors.text,
};
