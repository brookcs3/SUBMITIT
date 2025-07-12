/**
 * Retro-futuristic theme constants for neon terminal aesthetics
 */

export const neon = {
  border: '#6aa9ff',
  text: '#8fbfff', 
  accent: '#4d7dff',
  bg: '#0d1117',
  glow: '#4d7dff',
  success: '#00ff88',
  warning: '#ffaa00',
  error: '#ff4444'
};

export const crt = {
  border: '#00ff41',
  text: '#35ff6d',
  accent: '#00ff41', 
  bg: '#00110a',
  glow: '#00ff41',
  success: '#00ff88',
  warning: '#ffaa00',
  error: '#ff4444'
};

export const getCurrentTheme = (themeName: string = 'neon') => {
  switch (themeName) {
    case 'crt': return crt;
    case 'neon':
    default: return neon;
  }
};

export type Theme = typeof neon;