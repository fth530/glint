export type ColorScheme = typeof light;

const light = {
  bg: '#FFFFFF',
  bgSoft: '#F5F7FA',
  bgCard: '#FFFFFF',
  accent: '#00C853',
  accentLight: 'rgba(0,200,83,0.10)',
  accentMid: 'rgba(0,200,83,0.20)',
  danger: '#FF5252',
  dangerLight: 'rgba(255,82,82,0.10)',
  dangerMid: 'rgba(255,82,82,0.18)',
  text: '#111827',
  textSec: '#6B7280',
  textTer: '#C4C8D0',
  border: 'rgba(0,0,0,0.07)',
  borderMid: 'rgba(0,0,0,0.12)',
  wordText: '#1F2937',
  wordBg: '#FFFFFF',
  wordBorder: 'rgba(0,0,0,0.09)',
  overlay: 'rgba(15,20,30,0.45)',
};

const dark: ColorScheme = {
  bg: '#0F1119',
  bgSoft: '#1A1D2B',
  bgCard: '#1E2133',
  accent: '#00E676',
  accentLight: 'rgba(0,230,118,0.12)',
  accentMid: 'rgba(0,230,118,0.22)',
  danger: '#FF5252',
  dangerLight: 'rgba(255,82,82,0.15)',
  dangerMid: 'rgba(255,82,82,0.25)',
  text: '#F0F2F5',
  textSec: '#9BA3B5',
  textTer: '#4A5068',
  border: 'rgba(255,255,255,0.08)',
  borderMid: 'rgba(255,255,255,0.14)',
  wordText: '#E8ECF2',
  wordBg: '#1E2133',
  wordBorder: 'rgba(255,255,255,0.10)',
  overlay: 'rgba(0,0,0,0.60)',
};

export const themes = { light, dark };

// Default export for backward compat — will be replaced by hook
export default light;
