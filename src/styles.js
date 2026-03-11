/**
 * Shared style constants for the Dynamic Pricing Sandbox.
 * Design language: light, clean, minimal per spec §5.1.
 */

export const colors = {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  locked: '#94a3b8',
};

export const cardStyle = {
  background: colors.card,
  borderRadius: 14,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
  padding: 20,
};

export const buttonBase = {
  border: 'none',
  borderRadius: 10,
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
  background: '#e2e8f0',
  color: colors.text,
};
