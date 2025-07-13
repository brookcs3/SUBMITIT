import React from 'react';
import { 
  ResponsiveLayout, 
  AnimatedProgressBar, 
  AnimatedSpinner, 
  AnimatedTypewriter, 
  ResponsiveCard, 
  AnimatedMenu,
  useResponsiveTerminal,
  useAnimation
} from './AdvancedInkComponents';

declare module './AdvancedInkDemo' {
  // Props for the AdvancedInkDemo component
  export interface AdvancedInkDemoProps {
    /**
     * Title to display at the top of the demo
     */
    title?: string;
    
    /**
     * Subtitle to display below the title
     */
    subtitle?: string;
    
    /**
     * Whether to show the progress bar demo
     * @default true
     */
    showProgressBar?: boolean;
    
    /**
     * Whether to show the spinner demo
     * @default true
     */
    showSpinner?: boolean;
    
    /**
     * Whether to show the typewriter demo
     * @default true
     */
    showTypewriter?: boolean;
    
    /**
     * Whether to show the responsive layout demo
     * @default true
     */
    showResponsiveLayout?: boolean;
    
    /**
     * Custom styles for the demo container
     */
    style?: React.CSSProperties;
    
    /**
     * Callback when the demo is closed
     */
    onClose?: () => void;
  }

  /**
   * A demo component showcasing various advanced Ink components
   */
  const AdvancedInkDemo: React.FC<AdvancedInkDemoProps>;
  
  export default AdvancedInkDemo;
}
