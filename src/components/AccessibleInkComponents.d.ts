import React from 'react';

// Define types for the components
declare module './AccessibleInkComponents' {
  // Base component props
  interface AccessibleComponentProps {
    children?: React.ReactNode;
    role?: string;
    'aria-label'?: string;
    'aria-live'?: 'off' | 'assertive' | 'polite';
    'aria-atomic'?: boolean | 'true' | 'false';
    'aria-busy'?: boolean | 'true' | 'false';
    'aria-controls'?: string;
    'aria-current'?: boolean | 'true' | 'false' | 'page' | 'step' | 'location' | 'date' | 'time';
    'aria-describedby'?: string;
    'aria-details'?: string;
    'aria-disabled'?: boolean | 'true' | 'false';
    'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup';
    'aria-errormessage'?: string;
    'aria-expanded'?: boolean | 'true' | 'false';
    'aria-flowto'?: string;
    'aria-grabbed'?: boolean | 'true' | 'false';
    'aria-haspopup'?: boolean | 'true' | 'false' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
    'aria-hidden'?: boolean | 'true' | 'false';
    'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling';
    'aria-keyshortcuts'?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-level'?: number;
    'aria-modal'?: boolean | 'true' | 'false';
    'aria-multiline'?: boolean | 'true' | 'false';
    'aria-multiselectable'?: boolean | 'true' | 'false';
    'aria-orientation'?: 'horizontal' | 'vertical' | 'undefined';
    'aria-owns'?: string;
    'aria-placeholder'?: string;
    'aria-posinset'?: number;
    'aria-pressed'?: boolean | 'true' | 'false' | 'mixed';
    'aria-readonly'?: boolean | 'true' | 'false';
    'aria-relevant'?: 'additions' | 'additions text' | 'all' | 'removals' | 'text';
    'aria-required'?: boolean | 'true' | 'false';
    'aria-roledescription'?: string;
    'aria-rowcount'?: number;
    'aria-rowindex'?: number;
    'aria-rowspan'?: number;
    'aria-selected'?: boolean | 'true' | 'false' | 'undefined';
    'aria-setsize'?: number;
    'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
    'aria-valuemax'?: number;
    'aria-valuemin'?: number;
    'aria-valuenow'?: number;
    'aria-valuetext'?: string;
    'data-testid'?: string;
    style?: React.CSSProperties;
    className?: string;
  }

  // Button component
  export interface ButtonProps extends AccessibleComponentProps {
    onPress: () => void;
    disabled?: boolean;
    primary?: boolean;
    secondary?: boolean;
    danger?: boolean;
    success?: boolean;
    warning?: boolean;
    info?: boolean;
    light?: boolean;
    dark?: boolean;
    link?: boolean;
    outline?: boolean;
    size?: 'sm' | 'md' | 'lg';
    block?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    accessibilityLabel?: string;
    accessibilityHint?: string;
    accessibilityRole?: 'button' | 'link' | 'menuitem' | 'tab' | 'radio' | 'checkbox';
    accessibilityState?: {
      disabled?: boolean;
      selected?: boolean;
      checked?: boolean | 'mixed';
      busy?: boolean;
      expanded?: boolean;
    };
  }

  // Text component
  export interface TextProps extends AccessibleComponentProps {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    color?: string;
    backgroundColor?: string;
    size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
    align?: 'left' | 'center' | 'right' | 'justify';
    transform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase' | 'full-width' | 'full-size-kana';
    weight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    lineHeight?: number | string;
    letterSpacing?: number | string;
    fontFamily?: string;
    selectable?: boolean;
    numberOfLines?: number;
    ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
    testID?: string;
    onPress?: () => void;
    onLongPress?: () => void;
    onPressIn?: () => void;
    onPressOut?: () => void;
    accessibilityRole?:
      | 'none'
      | 'button'
      | 'link'
      | 'search'
      | 'image'
      | 'keyboardkey'
      | 'text'
      | 'adjustable'
      | 'imagebutton'
      | 'header';
    accessibilityLabel?: string;
    accessibilityHint?: string;
    accessibilityState?: {
      disabled?: boolean;
      selected?: boolean;
      checked?: boolean | 'mixed';
      busy?: boolean;
      expanded?: boolean;
    };
  }

  // Export the components
  export const Button: React.FC<ButtonProps>;
  export const Text: React.FC<TextProps>;
  
  // Add other components as needed...
  
  // Default export for the module
  const AccessibleInkComponents: {
    Button: typeof Button;
    Text: typeof Text;
    // Add other components as needed...
  };
  
  export default AccessibleInkComponents;
}
