import { ComponentType, ReactNode } from 'react';

declare module 'ink' {
  export interface TextProps {
    children?: ReactNode;
    color?: string;
    backgroundColor?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    inverse?: boolean;
    dimColor?: boolean;
    wrap?: 'truncate' | 'truncate-start' | 'truncate-middle' | 'truncate';
  }

  export interface BoxProps {
    children?: ReactNode;
    width?: number | string;
    height?: number | string;
    minWidth?: number | string;
    minHeight?: number | string;
    flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: number | string;
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    padding?: number;
    paddingX?: number;
    paddingY?: number;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    margin?: number;
    marginX?: number;
    marginY?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    borderStyle?: 'single' | 'double' | 'round' | 'bold' | 'singleDouble' | 'doubleSingle' | 'classic' | 'arrow';
    borderColor?: string;
    borderTop?: boolean;
    borderBottom?: boolean;
    borderLeft?: boolean;
    borderRight?: boolean;
    borderTopStyle?: 'single' | 'double' | 'round' | 'bold' | 'singleDouble' | 'doubleSingle' | 'classic' | 'arrow';
    borderBottomStyle?: 'single' | 'double' | 'round' | 'bold' | 'singleDouble' | 'doubleSingle' | 'classic' | 'arrow';
    borderLeftStyle?: 'single' | 'double' | 'round' | 'bold' | 'singleDouble' | 'doubleSingle' | 'classic' | 'arrow';
    borderRightStyle?: 'single' | 'double' | 'round' | 'bold' | 'singleDouble' | 'doubleSingle' | 'classic' | 'arrow';
    borderTopColor?: string;
    borderBottomColor?: string;
    borderLeftColor?: string;
    borderRightColor?: string;
  }

  export interface UseFocusOptions {
    autoFocus?: boolean;
    isActive?: boolean;
  }

  export interface UseFocusReturn {
    isFocused: boolean;
    focus: () => void;
    blur: () => void;
  }

  export const Text: ComponentType<TextProps>;
  export const Box: ComponentType<BoxProps>;
  export const useInput: (handler: (input: string, key: {
    upArrow: boolean;
    downArrow: boolean;
    leftArrow: boolean;
    rightArrow: boolean;
    pageDown: boolean;
    pageUp: boolean;
    return: boolean;
    escape: boolean;
    ctrl: boolean;
    shift: boolean;
    meta: boolean;
    tab: boolean;
    backspace: boolean;
    delete: boolean;
  }) => void, options?: { isActive?: boolean }) => void;
  
  export const useFocus: (options?: UseFocusOptions) => UseFocusReturn;
  
  // Add other Ink components as needed
}
