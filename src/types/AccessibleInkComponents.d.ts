import React from 'react';

declare module '../lib/AccessibleInkComponents' {
  // Base props for all components
  interface BaseComponentProps {
    children?: React.ReactNode;
    style?: React.CSSProperties;
    accessibilityLabel?: string;
    accessibilityRole?: string;
    testID?: string;
    onFocus?: () => void;
    onBlur?: () => void;
    onPress?: () => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    onKeyUp?: (event: React.KeyboardEvent) => void;
  }

  // Text component
  interface TextProps extends BaseComponentProps {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    color?: string;
    backgroundColor?: string;
    fontSize?: number | string;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    lineHeight?: number | string;
    letterSpacing?: number | string;
    textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
    numberOfLines?: number;
    ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
    selectable?: boolean;
    selectionColor?: string;
  }

  // Box component (Container)
  interface BoxProps extends BaseComponentProps {
    flex?: number | boolean;
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    alignContent?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'space-between' | 'space-around';
    position?: 'relative' | 'absolute';
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
    width?: number | string;
    height?: number | string;
    minWidth?: number | string;
    minHeight?: number | string;
    maxWidth?: number | string;
    maxHeight?: number | string;
    margin?: number | string;
    marginVertical?: number | string;
    marginHorizontal?: number | string;
    marginTop?: number | string;
    marginRight?: number | string;
    marginBottom?: number | string;
    marginLeft?: number | string;
    padding?: number | string;
    paddingVertical?: number | string;
    paddingHorizontal?: number | string;
    paddingTop?: number | string;
    paddingRight?: number | string;
    paddingBottom?: number | string;
    paddingLeft?: number | string;
    borderStyle?: 'solid' | 'dotted' | 'dashed';
    borderWidth?: number;
    borderTopWidth?: number;
    borderRightWidth?: number;
    borderBottomWidth?: number;
    borderLeftWidth?: number;
    borderColor?: string;
    borderTopColor?: string;
    borderRightColor?: string;
    borderBottomColor?: string;
    borderLeftColor?: string;
    borderRadius?: number;
    borderTopLeftRadius?: number;
    borderTopRightRadius?: number;
    borderBottomLeftRadius?: number;
    borderBottomRightRadius?: number;
    backgroundColor?: string;
    opacity?: number;
    overflow?: 'visible' | 'hidden' | 'scroll';
    zIndex?: number;
  }

  // Button component
  interface ButtonProps extends BoxProps {
    disabled?: boolean;
    loading?: boolean;
    loadingIndicator?: React.ReactNode;
    onPress?: () => void;
    onPressIn?: () => void;
    onPressOut?: () => void;
    onLongPress?: () => void;
    activeOpacity?: number;
    underlayColor?: string;
  }

  // Input component
  interface InputProps extends BaseComponentProps {
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    placeholderTextColor?: string;
    onChangeText?: (text: string) => void;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    onKeyUp?: (event: React.KeyboardEvent) => void;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
    autoFocus?: boolean;
    editable?: boolean;
    maxLength?: number;
    multiline?: boolean;
    numberOfLines?: number;
    returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
    selectTextOnFocus?: boolean;
    selection?: { start: number; end?: number };
    selectionColor?: string;
    style?: React.CSSProperties;
  }

  // Export components
  export const Text: React.FC<TextProps>;
  export const Box: React.FC<BoxProps>;
  export const Button: React.FC<ButtonProps>;
  export const Input: React.FC<InputProps>;
  
  // Theme provider and hooks
  export interface Theme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      card: string;
      text: string;
      border: string;
      notification: string;
      success: string;
      warning: string;
      error: string;
      disabled: string;
      placeholder: string;
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
  }

  export const ThemeProvider: React.FC<{ theme: Theme; children: React.ReactNode }>;
  export const useTheme: () => Theme;
  export const withTheme: <P extends { theme?: Theme }>(
    Component: React.ComponentType<P>
  ) => React.FC<Omit<P, 'theme'>>;

  // Utility components
  export const Spacer: React.FC<{ size?: number | string }>;
  export const Divider: React.FC<{ color?: string; thickness?: number | string }>;
  export const Icon: React.FC<{ name: string; size?: number; color?: string }>;
}
