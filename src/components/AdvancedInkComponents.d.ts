import React from 'react';

declare module './AdvancedInkComponents' {
  // Base component props
  interface BaseComponentProps {
    children?: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
    testID?: string;
  }

  // ResponsiveLayout component
  export interface ResponsiveLayoutProps extends BaseComponentProps {
    direction?: 'row' | 'column';
    justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
    align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    gap?: number | string;
    padding?: number | string;
    margin?: number | string;
    width?: number | string;
    height?: number | string;
    flex?: number;
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: number | string;
    overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  }

  // AnimatedProgressBar component
  export interface AnimatedProgressBarProps extends BaseComponentProps {
    progress: number;
    color?: string;
    backgroundColor?: string;
    height?: number | string;
    width?: number | string;
    borderRadius?: number | string;
    showPercentage?: boolean;
    percentagePosition?: 'inside' | 'outside' | 'none';
    animationDuration?: number;
    animationType?: 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | string;
    onAnimationComplete?: () => void;
  }

  // AnimatedSpinner component
  export interface AnimatedSpinnerProps extends BaseComponentProps {
    size?: number | 'small' | 'medium' | 'large';
    color?: string;
    speed?: number;
    label?: string;
    labelPosition?: 'top' | 'right' | 'bottom' | 'left';
  }

  // AnimatedTypewriter component
  export interface AnimatedTypewriterProps extends BaseComponentProps {
    text: string | string[];
    speed?: number;
    deleteSpeed?: number;
    delay?: number;
    cursor?: string;
    cursorStyle?: any;
    onTypingStart?: () => void;
    onTypingEnd?: () => void;
    onDeletingStart?: () => void;
    onDeletingEnd?: () => void;
  }

  // ResponsiveCard component
  export interface ResponsiveCardProps extends BaseComponentProps {
    title?: string | React.ReactNode;
    subtitle?: string | React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    border?: boolean;
    borderColor?: string;
    borderRadius?: number | string;
    shadow?: boolean | number;
    hoverEffect?: boolean;
    onPress?: () => void;
    padding?: number | string;
    margin?: number | string;
    width?: number | string;
    height?: number | string;
    backgroundColor?: string;
  }

  // AnimatedMenu component
  export interface AnimatedMenuProps extends BaseComponentProps {
    items: Array<{
      label: string;
      value: any;
      icon?: React.ReactNode;
      disabled?: boolean;
    }>;
    onSelect: (item: any) => void;
    selectedValue?: any;
    animationType?: 'fade' | 'slide' | 'bounce' | 'zoom' | 'flip';
    animationDuration?: number;
    itemHeight?: number;
    maxHeight?: number | string;
    width?: number | string;
    itemStyle?: any;
    selectedItemStyle?: any;
    containerStyle?: any;
  }

  // Export the components
  export const ResponsiveLayout: React.FC<ResponsiveLayoutProps>;
  export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps>;
  export const AnimatedSpinner: React.FC<AnimatedSpinnerProps>;
  export const AnimatedTypewriter: React.FC<AnimatedTypewriterProps>;
  export const ResponsiveCard: React.FC<ResponsiveCardProps>;
  export const AnimatedMenu: React.FC<AnimatedMenuProps>;
  
  // Hooks
  export function useResponsiveTerminal(): {
    width: number;
    height: number;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    orientation: 'portrait' | 'landscape';
  };
  
  export function useAnimation(initialValue?: any, config?: any): [any, (toValue: any) => void];
  
  // Default export for the module
  const AdvancedInkComponents: {
    ResponsiveLayout: typeof ResponsiveLayout;
    AnimatedProgressBar: typeof AnimatedProgressBar;
    AnimatedSpinner: typeof AnimatedSpinner;
    AnimatedTypewriter: typeof AnimatedTypewriter;
    ResponsiveCard: typeof ResponsiveCard;
    AnimatedMenu: typeof AnimatedMenu;
    useResponsiveTerminal: typeof useResponsiveTerminal;
    useAnimation: typeof useAnimation;
  };
  
  export default AdvancedInkComponents;
}
