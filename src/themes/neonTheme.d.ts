import { Theme } from 'ink';

declare const neonTheme: Theme & {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    highlight: string;
    text: string;
    background: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    disabled: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    fontWeight: {
      light: number;
      regular: number;
      medium: number;
      bold: number;
      black: number;
    };
  };
};

export default neonTheme;
