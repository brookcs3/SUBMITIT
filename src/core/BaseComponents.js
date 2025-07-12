/**
 * Base Components - Foundation for all UI components with testable elements
 */
import React from 'react';
import { Box, Text } from 'ink';
import { getCurrentTheme } from '../ui/theme.js';
import { globalErrorHandler } from './ErrorHandler.js';

/**
 * Base component factory with error boundaries and testing support
 */
export function createBaseComponent(componentName, renderFunction, defaultProps = {}) {
  const Component = (props) => {
    const mergedProps = { ...defaultProps, ...props };
    const theme = getCurrentTheme(mergedProps.theme || 'neon');
    
    try {
      return renderFunction(mergedProps, theme);
    } catch (error) {
      globalErrorHandler.handle(error, `render-${componentName}`);
      
      // Error boundary - render fallback UI
      return React.createElement(Box, {
        borderStyle: 'single',
        borderColor: theme.error,
        padding: 1
      }, [
        React.createElement(Text, {
          key: 'error-title',
          color: theme.error,
          bold: true
        }, `⚠ ${componentName} Error`),
        React.createElement(Text, {
          key: 'error-message',
          color: theme.text
        }, error.message)
      ]);
    }
  };
  
  // Add component metadata for testing
  Component.displayName = componentName;
  Component.defaultProps = defaultProps;
  Component.isBaseComponent = true;
  
  return Component;
}

/**
 * Create a testable text component
 */
export const createText = createBaseComponent(
  'SubmititText',
  (props, theme) => {
    return React.createElement(Text, {
      color: props.color || theme.text,
      bold: props.bold || false,
      italic: props.italic || false,
      underline: props.underline || false,
      strikethrough: props.strikethrough || false,
      backgroundColor: props.backgroundColor,
      ...props.inkProps
    }, props.children || props.text || '');
  },
  {
    color: null,
    bold: false,
    text: '',
    theme: 'neon'
  }
);

/**
 * Create a testable box component
 */
export const createBox = createBaseComponent(
  'SubmititBox',
  (props, theme) => {
    return React.createElement(Box, {
      flexDirection: props.flexDirection || 'column',
      width: props.width,
      height: props.height,
      padding: props.padding,
      paddingX: props.paddingX,
      paddingY: props.paddingY,
      margin: props.margin,
      marginX: props.marginX, 
      marginY: props.marginY,
      borderStyle: props.borderStyle,
      borderColor: props.borderColor || theme.border,
      justifyContent: props.justifyContent,
      alignItems: props.alignItems,
      flexGrow: props.flexGrow,
      flexShrink: props.flexShrink,
      flexWrap: props.flexWrap,
      gap: props.gap,
      ...props.inkProps
    }, props.children);
  },
  {
    flexDirection: 'column',
    theme: 'neon'
  }
);

/**
 * Create a themed button component
 */
export const createButton = createBaseComponent(
  'SubmititButton',
  (props, theme) => {
    const isSelected = props.selected || props.focused || false;
    const borderColor = isSelected ? theme.accent : theme.border;
    const textColor = isSelected ? theme.accent : theme.text;
    
    return React.createElement(Box, {
      borderStyle: 'single',
      borderColor,
      padding: 1,
      marginX: 1
    }, 
      React.createElement(Text, {
        color: textColor,
        bold: isSelected
      }, props.label || props.children || 'Button')
    );
  },
  {
    label: 'Button',
    selected: false,
    theme: 'neon'
  }
);

/**
 * Create a status indicator component
 */
export const createStatusIndicator = createBaseComponent(
  'SubmititStatusIndicator',
  (props, theme) => {
    const statusColors = {
      success: theme.success,
      warning: theme.warning,
      error: theme.error,
      info: theme.text,
      loading: theme.accent
    };
    
    const statusSymbols = {
      success: '✓',
      warning: '⚠',
      error: '✗',
      info: 'ℹ',
      loading: '●'
    };
    
    const status = props.status || 'info';
    const color = statusColors[status] || theme.text;
    const symbol = statusSymbols[status] || '○';
    
    return React.createElement(Box, {
      flexDirection: 'row',
      alignItems: 'center'
    }, [
      React.createElement(Text, {
        key: 'symbol',
        color
      }, symbol),
      React.createElement(Text, {
        key: 'message',
        color,
        marginLeft: 1
      }, props.message || '')
    ]);
  },
  {
    status: 'info',
    message: '',
    theme: 'neon'
  }
);

/**
 * Create a progress bar component
 */
export const createProgressBar = createBaseComponent(
  'SubmititProgressBar',
  (props, theme) => {
    const percentage = Math.max(0, Math.min(100, props.percentage || 0));
    const width = props.width || 40;
    const filledWidth = Math.round((percentage / 100) * width);
    
    const filledBar = '█'.repeat(filledWidth);
    const emptyBar = '░'.repeat(width - filledWidth);
    const progressBar = filledBar + emptyBar;
    
    return React.createElement(Box, {
      flexDirection: 'column'
    }, [
      React.createElement(Text, {
        key: 'bar',
        color: theme.accent
      }, progressBar),
      React.createElement(Text, {
        key: 'percentage',
        color: theme.text
      }, `${percentage}%`)
    ]);
  },
  {
    percentage: 0,
    width: 40,
    theme: 'neon'
  }
);

/**
 * Create a list component
 */
export const createList = createBaseComponent(
  'SubmititList',
  (props, theme) => {
    const items = props.items || [];
    const selectedIndex = props.selectedIndex || 0;
    
    return React.createElement(Box, {
      flexDirection: 'column'
    }, items.map((item, index) => {
      const isSelected = index === selectedIndex;
      const prefix = props.showBullets ? '• ' : '';
      
      return React.createElement(Text, {
        key: index,
        color: isSelected ? theme.accent : theme.text,
        bold: isSelected,
        backgroundColor: isSelected ? theme.bg : undefined
      }, `${prefix}${item}`);
    }));
  },
  {
    items: [],
    selectedIndex: 0,
    showBullets: false,
    theme: 'neon'
  }
);

/**
 * Component registry for testing and debugging
 */
export const componentRegistry = {
  Text: createText,
  Box: createBox,
  Button: createButton,
  StatusIndicator: createStatusIndicator,
  ProgressBar: createProgressBar,
  List: createList
};

/**
 * Get component by name
 */
export function getComponent(name) {
  return componentRegistry[name];
}

/**
 * List all available components
 */
export function listComponents() {
  return Object.keys(componentRegistry);
}

/**
 * Validate component props against defaults
 */
export function validateProps(componentName, props) {
  const Component = componentRegistry[componentName];
  if (!Component || !Component.defaultProps) {
    return { valid: false, errors: [`Unknown component: ${componentName}`] };
  }
  
  const errors = [];
  const requiredProps = Object.keys(Component.defaultProps);
  
  // Check for unknown props (optional validation)
  if (props.__strict) {
    Object.keys(props).forEach(prop => {
      if (prop !== '__strict' && !requiredProps.includes(prop)) {
        errors.push(`Unknown prop: ${prop}`);
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
    componentName,
    props
  };
}

export default {
  createBaseComponent,
  createText,
  createBox,
  createButton,
  createStatusIndicator,
  createProgressBar,
  createList,
  componentRegistry,
  getComponent,
  listComponents,
  validateProps
};