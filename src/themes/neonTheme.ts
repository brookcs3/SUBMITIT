/**
 * Neon UI Theme for Submitit
 * 
 * A retro-futuristic color scheme optimized for terminal display
 * with high contrast and vibrant colors that work well in both
 * light and dark terminal themes.
 */

export const neonTheme = {
  colors: {
    // Primary colors
    primary: '#00f0ff',    // Bright cyan - primary action color
    primaryDark: '#008c9e', // Darker cyan for hover states
    primaryLight: '#7ff7ff', // Lighter cyan for highlights
    
    // Accent colors
    accent: '#ff00ff',     // Magenta - for important UI elements
    accentDark: '#b200b2',  // Darker magenta
    accentLight: '#ff7fff', // Lighter magenta
    
    // Background colors
    background: '#0a0a14',  // Very dark blue-black
    surface: '#12121e',     // Slightly lighter than background
    surfaceHighlight: '#1e1e2e', // For selected/hovered items
    
    // Text colors
    text: '#e0e0e0',       // Light gray for primary text
    textSecondary: '#a0a0b0', // Slightly muted for secondary text
    textDisabled: '#606070', // For disabled controls
    
    // Status colors
    success: '#00ff9d',    // Bright green for success states
    warning: '#ffcc00',    // Yellow for warnings
    error: '#ff3d71',      // Bright red for errors
    info: '#00b8ff',       // Light blue for informational messages
    
    // UI element colors
    border: '#2a2a3a',     // Subtle borders
    divider: '#1e1e2e',    // Dividers between sections
    highlight: '#3a3a4a',  // Highlight color for selected items
    
    // Special effects
    glow: '0 0 8px',      // For glow effects (use with primary/accent colors)
  },
  
  // Typography
  typography: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700,
    },
  },
  
  // Spacing
  spacing: {
    xs: 1,    // 4px
    sm: 2,    // 8px
    md: 3,    // 12px
    lg: 4,    // 16px
    xl: 6,    // 24px
    xxl: 8,   // 32px
  },
  
  // Border radius
  borderRadius: {
    sm: 1,    // 4px
    md: 2,    // 8px
    lg: 3,    // 12px
    full: 999, // For pill-shaped elements
  },
  
  // Shadows (for terminals that support it)
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0 2px 4px rgba(0, 0, 0, 0.2)',
    lg: '0 4px 8px rgba(0, 0, 0, 0.3)',
  },
  
  // Animation
  animation: {
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
  },
  
  // Z-index layers
  zIndex: {
    dropdown: 1000,
    modal: 2000,
    tooltip: 3000,
  },
} as const;

// Type exports for better type safety
export type NeonTheme = typeof neonTheme;
export type NeonColor = keyof NeonTheme['colors'];

// Helper function to get a color with optional opacity
export const colorWithOpacity = (color: NeonColor, opacity: number): string => {
  // Simple implementation - in a real app, you might want to convert hex to rgba
  return `${neonTheme.colors[color]}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};

// Helper function to apply a glow effect
export const glowEffect = (color: NeonColor = 'primary', size: 'sm' | 'md' | 'lg' = 'md'): string => {
  const glowSize = {
    sm: '2px',
    md: '4px',
    lg: '8px',
  }[size];
  
  return `0 0 ${glowSize} ${neonTheme.colors[color]}`;
};

// Helper function to get a gradient
export const gradient = (startColor: NeonColor, endColor: NeonColor, angle: number = 90): string => {
  return `linear-gradient(${angle}deg, ${neonTheme.colors[startColor]}, ${neonTheme.colors[endColor]})`;
};
