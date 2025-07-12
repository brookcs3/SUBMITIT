/**
 * Theme System for Submitit CLI
 */

export const themes = {
  neon: {
    name: 'neon',
    bg: '#0d1117',
    text: '#8fbfff',
    border: '#6aa9ff', 
    accent: '#4d7dff',
    success: '#39d353',
    warning: '#ffab40',
    error: '#f85149',
    muted: '#7d8590'
  },
  crt: {
    name: 'crt',
    bg: '#00110a',
    text: '#35ff6d',
    border: '#00ff41',
    accent: '#00ff41', 
    success: '#00ff41',
    warning: '#ffff00',
    error: '#ff4444',
    muted: '#4a9960'
  },
  academic: {
    name: 'academic',
    bg: '#1a1a1a',
    text: '#ffffff',
    border: '#333333',
    accent: '#0066cc',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    muted: '#6c757d'
  },
  noir: {
    name: 'noir',
    bg: '#000000',
    text: '#cccccc',
    border: '#444444',
    accent: '#888888',
    success: '#666666',
    warning: '#999999',
    error: '#bbbbbb',
    muted: '#555555'
  }
};

let currentTheme = 'neon';

export function setTheme(themeName) {
  if (themes[themeName]) {
    currentTheme = themeName;
  }
}

export function getCurrentTheme(themeName = null) {
  return themes[themeName || currentTheme] || themes.neon;
}

export function getThemeNames() {
  return Object.keys(themes);
}

export default {
  themes,
  setTheme,
  getCurrentTheme,
  getThemeNames
};