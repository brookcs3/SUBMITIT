// DISABLED: This file contains JSX syntax that crashes Node.js
// TODO: Convert JSX to React.createElement or compile with Babel
console.log('⚠️  JSX component disabled - needs conversion');
export default function DisabledComponent() {
  return null;
}

/* ORIGINAL CODE (commented out to prevent crashes):
/**
 * Accessible Ink Components
 * 
 * Enhanced versions of the AdvancedInkComponents with full accessibility support.
 * These components integrate with the AccessibilityManager to provide screen reader
 * compatibility, semantic markup, and keyboard navigation.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import AccessibilityManager, { useAccessibility } from '../lib/AccessibilityManager.js';
import { 
  useResponsiveTerminal, 
  useAnimation,
  AnimatedProgressBar,
  AnimatedSpinner,
  AnimatedTypewriter 
} from './AdvancedInkComponents.js';

// Global accessibility manager instance
const globalAccessibilityManager = new AccessibilityManager({
  announceChanges: true,
  screenReaderMode: process.env.SCREEN_READER === 'true',
  highContrast: process.env.HIGH_CONTRAST === 'true'
});

// === ACCESSIBLE MENU COMPONENT ===

export const AccessibleMenu = ({ 
  items = [], 
  onSelect = () => {},
  title = 'Menu',
  showIcons = true,
  id = 'menu'
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const { createLabel, announce, setFocus } = useAccessibility(id, { 
    role: 'menu', 
    label: title 
  });

  // Register menu with accessibility manager
  useEffect(() => {
    globalAccessibilityManager.registerElement(id, {
      role: 'menu',
      label: title,
      type: 'interactive',
      itemCount: items.length
    });
    
    announce(`Menu opened: ${title}. ${items.length} items available.`, 'normal');
    globalAccessibilityManager.announceNavigation('menu', 
      `Currently on item 1 of ${items.length}: ${items[0]?.label || items[0]}`);
  }, [items.length, title]);

  // Handle keyboard navigation
  useInput((input, key) => {
    if (!isActive) return;

    if (key.upArrow) {
      const newIndex = selectedIndex > 0 ? selectedIndex - 1 : items.length - 1;
      setSelectedIndex(newIndex);
      
      const item = items[newIndex];
      const itemLabel = item?.label || item;
      announce(`Item ${newIndex + 1} of ${items.length}: ${itemLabel}`, 'normal');
      
      setFocus({
        label: createLabel(itemLabel, { role: 'menuitem', state: { selected: true } }),
        index: newIndex
      });
      
    } else if (key.downArrow) {
      const newIndex = selectedIndex < items.length - 1 ? selectedIndex + 1 : 0;
      setSelectedIndex(newIndex);
      
      const item = items[newIndex];
      const itemLabel = item?.label || item;
      announce(`Item ${newIndex + 1} of ${items.length}: ${itemLabel}`, 'normal');
      
      setFocus({
        label: createLabel(itemLabel, { role: 'menuitem', state: { selected: true } }),
        index: newIndex
      });
      
    } else if (key.return) {
      const selectedItem = items[selectedIndex];
      const itemLabel = selectedItem?.label || selectedItem;
      
      announce(`Selected: ${itemLabel}`, 'normal');
      onSelect(selectedItem, selectedIndex);
      
    } else if (key.escape) {
      announce('Menu closed', 'normal');
      setIsActive(false);
      
    } else if (input === '?') {
      globalAccessibilityManager.announceNavigation('menu');
    }
  });

  // Auto-activate menu when mounted
  useEffect(() => {
    setIsActive(true);
  }, []);

  const getFocusIndicator = (index) => {
    return globalAccessibilityManager.createFocusIndicator(index === selectedIndex);
  };

  const getHighContrastStyle = (index) => {
    return globalAccessibilityManager.getHighContrastStyle('menuitem', {
      focused: index === selectedIndex,
      selected: index === selectedIndex
    });
  };

  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Text bold color="cyan" marginBottom={1}>
        {createLabel(title, { role: 'heading', level: 2 })}
      </Text>
      
      <Box flexDirection="column">
        {items.map((item, index) => {
          const itemLabel = item?.label || item;
          const isFocused = index === selectedIndex;
          const focusIndicator = getFocusIndicator(index);
          const style = getHighContrastStyle(index);
          
          return (
            <Box key={index} marginBottom={index < items.length - 1 ? 1 : 0}>
              <Text 
                color={isFocused ? 'cyan' : 'white'}
                inverse={isFocused}
                bold={isFocused}
                {...style}
              >
                {focusIndicator}{itemLabel}
              </Text>
              {isFocused && (
                <Text color="gray" dimColor marginLeft={2}>
                  (Press Enter to select, ? for help)
                </Text>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// === ACCESSIBLE PROGRESS COMPONENT ===

export const AccessibleProgress = ({ 
  progress = 0, 
  label = '',
  description = '',
  showPercentage = true,
  announceProgress = true,
  id = 'progress'
}) => {
  const [lastAnnouncedProgress, setLastAnnouncedProgress] = useState(0);
  const { createLabel, announce } = useAccessibility(id, { 
    role: 'progressbar',
    label: label || 'Progress'
  });

  // Register progress bar
  useEffect(() => {
    globalAccessibilityManager.registerElement(id, {
      role: 'progressbar',
      label: label || 'Progress',
      type: 'status',
      value: progress,
      max: 100
    });
  }, [progress, label]);

  // Announce progress changes
  useEffect(() => {
    if (announceProgress && Math.abs(progress - lastAnnouncedProgress) >= 10) {
      globalAccessibilityManager.announceProgress(progress, 100, label);
      setLastAnnouncedProgress(progress);
    }
    
    if (progress >= 100 && lastAnnouncedProgress < 100) {
      announce(`${label || 'Task'} completed successfully`, 'normal');
    }
  }, [progress, lastAnnouncedProgress, announceProgress, label]);

  const progressLabel = createLabel(
    `${label || 'Progress'}: ${Math.round(progress)}%`,
    { role: 'status' }
  );

  return (
    <Box flexDirection="column">
      {label && (
        <Text color="gray" marginBottom={1}>
          {progressLabel}
        </Text>
      )}
      
      <AnimatedProgressBar 
        progress={progress / 100}
        showPercentage={showPercentage}
        color="green"
        width={40}
      />
      
      {description && (
        <Text color="gray" dimColor marginTop={1}>
          {description}
        </Text>
      )}
    </Box>
  );
};

// === ACCESSIBLE FILE EXPLORER ===

export const AccessibleFileExplorer = ({ 
  files = [], 
  onFileSelect = () => {},
  title = 'File Explorer',
  id = 'fileExplorer'
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedDirs, setExpandedDirs] = useState(new Set());
  const { createLabel, announce, setFocus } = useAccessibility(id, { 
    role: 'tree',
    label: title 
  });

  // Register file explorer
  useEffect(() => {
    globalAccessibilityManager.registerElement(id, {
      role: 'tree',
      label: title,
      type: 'interactive',
      itemCount: files.length
    });
    
    announce(`File explorer opened: ${title}. ${files.length} items available.`, 'normal');
    globalAccessibilityManager.announceNavigation('fileExplorer');
  }, [files.length, title]);

  const getFileDescription = (file) => {
    let description = file.name;
    
    if (file.type === 'directory') {
      const isExpanded = expandedDirs.has(file.path);
      description += ` (folder${isExpanded ? ', expanded' : ', collapsed'})`;
    } else {
      description += ` (file, ${file.size || 'unknown size'})`;
    }
    
    return description;
  };

  const getFileIcon = (file) => {
    if (file.type === 'directory') {
      return expandedDirs.has(file.path) ? '📂' : '📁';
    }
    
    const iconMap = {
      '.js': '🟨', '.ts': '🟦', '.json': '🟧', '.md': '📝',
      '.css': '🎨', '.html': '🌐', '.jpg': '🖼️', '.png': '🖼️',
      '.pdf': '📄', '.txt': '📄', '.zip': '📦'
    };
    
    const ext = file.path.split('.').pop()?.toLowerCase();
    return iconMap[`.${ext}`] || '📄';
  };

  // Handle keyboard navigation
  useInput((input, key) => {
    if (key.upArrow) {
      const newIndex = selectedIndex > 0 ? selectedIndex - 1 : files.length - 1;
      setSelectedIndex(newIndex);
      
      const file = files[newIndex];
      const description = getFileDescription(file);
      announce(`Item ${newIndex + 1} of ${files.length}: ${description}`, 'normal');
      
    } else if (key.downArrow) {
      const newIndex = selectedIndex < files.length - 1 ? selectedIndex + 1 : 0;
      setSelectedIndex(newIndex);
      
      const file = files[newIndex];
      const description = getFileDescription(file);
      announce(`Item ${newIndex + 1} of ${files.length}: ${description}`, 'normal');
      
    } else if (key.return) {
      const selectedFile = files[selectedIndex];
      
      if (selectedFile.type === 'directory') {
        const isExpanded = expandedDirs.has(selectedFile.path);
        setExpandedDirs(prev => {
          const newSet = new Set(prev);
          if (isExpanded) {
            newSet.delete(selectedFile.path);
            announce(`Collapsed folder: ${selectedFile.name}`, 'normal');
          } else {
            newSet.add(selectedFile.path);
            announce(`Expanded folder: ${selectedFile.name}`, 'normal');
          }
          return newSet;
        });
      } else {
        announce(`Selected file: ${selectedFile.name}`, 'normal');
        onFileSelect(selectedFile);
      }
      
    } else if (input === '?') {
      globalAccessibilityManager.announceNavigation('fileExplorer');
    }
  });

  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Text bold color="cyan" marginBottom={1}>
        {createLabel(title, { role: 'heading', level: 2 })}
      </Text>
      
      <Box flexDirection="column">
        {files.map((file, index) => {
          const isFocused = index === selectedIndex;
          const icon = getFileIcon(file);
          const description = getFileDescription(file);
          const focusIndicator = globalAccessibilityManager.createFocusIndicator(isFocused);
          
          return (
            <Box key={index} marginBottom={index < files.length - 1 ? 1 : 0}>
              <Text marginRight={1}>{icon}</Text>
              <Text 
                color={isFocused ? 'cyan' : 'white'}
                inverse={isFocused}
                bold={isFocused}
              >
                {focusIndicator}{file.name}
              </Text>
              {isFocused && (
                <Text color="gray" dimColor marginLeft={2}>
                  ({file.type === 'directory' ? 'Enter to expand/collapse' : 'Enter to select'})
                </Text>
              )}
            </Box>
          );
        })}
      </Box>
      
      <Text color="gray" dimColor marginTop={1}>
        Use arrow keys to navigate, Enter to select, ? for help
      </Text>
    </Box>
  );
};

// === ACCESSIBLE STATUS PANEL ===

export const AccessibleStatusPanel = ({ 
  status = 'idle', 
  message = '', 
  details = [],
  progress = null,
  id = 'statusPanel'
}) => {
  const { createLabel, announce } = useAccessibility(id, { 
    role: 'status',
    label: 'Status Panel'
  });

  // Register status panel
  useEffect(() => {
    globalAccessibilityManager.registerElement(id, {
      role: 'status',
      label: 'Status Panel',
      type: 'status',
      status: status,
      message: message
    });
  }, [status, message]);

  // Announce status changes
  useEffect(() => {
    if (message) {
      const statusLabel = createLabel(message, { role: 'status' });
      
      if (status === 'error') {
        globalAccessibilityManager.announceError(message, '', details);
      } else if (status === 'success') {
        globalAccessibilityManager.announceSuccess(message, details.join(', '));
      } else {
        globalAccessibilityManager.announceStatus(status, message);
      }
    }
  }, [status, message, details]);

  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return { color: 'cyan', icon: '⠋', variant: 'info' };
      case 'success':
        return { color: 'green', icon: '✅', variant: 'success' };
      case 'error':
        return { color: 'red', icon: '❌', variant: 'error' };
      case 'warning':
        return { color: 'yellow', icon: '⚠️', variant: 'warning' };
      default:
        return { color: 'gray', icon: '●', variant: 'default' };
    }
  };

  const config = getStatusConfig();
  const statusLabel = createLabel(message, { role: 'alert' });

  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Box marginBottom={1}>
        <Box marginRight={1}>
          {status === 'loading' ? (
            <AnimatedSpinner color={config.color} />
          ) : (
            <Text color={config.color}>{config.icon}</Text>
          )}
        </Box>
        <Text bold color={config.color}>
          {statusLabel}
        </Text>
      </Box>
      
      {progress !== null && (
        <Box marginBottom={1}>
          <AccessibleProgress 
            progress={progress} 
            label="Operation progress"
            announceProgress={true}
          />
        </Box>
      )}
      
      {details.length > 0 && (
        <Box flexDirection="column">
          <Text color="gray" dimColor marginBottom={1}>Details:</Text>
          {details.map((detail, index) => (
            <Text key={index} color="gray" dimColor>
              • {detail}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
};

// === ACCESSIBLE FORM COMPONENTS ===

export const AccessibleInput = ({ 
  value = '',
  onChange = () => {},
  placeholder = '',
  label = '',
  required = false,
  error = null,
  id = 'input'
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { createLabel, announce } = useAccessibility(id, { 
    role: 'textbox',
    label: label || placeholder
  });

  // Register input
  useEffect(() => {
    globalAccessibilityManager.registerElement(id, {
      role: 'textbox',
      label: label || placeholder,
      type: 'input',
      required: required,
      hasError: !!error
    });
  }, [label, placeholder, required, error]);

  // Announce validation errors
  useEffect(() => {
    if (error) {
      const validationMessage = globalAccessibilityManager.createValidationMessage(
        label || 'Field',
        { isValid: false, error: error }
      );
      announce(validationMessage, 'urgent');
    }
  }, [error, label]);

  const inputLabel = createLabel(
    label || placeholder,
    { 
      role: 'textbox',
      state: { required, error: !!error },
      interactive: true
    }
  );

  return (
    <Box flexDirection="column">
      {label && (
        <Text color="gray" marginBottom={1}>
          {inputLabel}
          {required && <Text color="red"> *</Text>}
        </Text>
      )}
      
      <Box borderStyle="single" paddingX={1}>
        <Text color={isFocused ? 'cyan' : 'white'}>
          {value || placeholder}
          {isFocused && <Text color="cyan">|</Text>}
        </Text>
      </Box>
      
      {error && (
        <Text color="red" marginTop={1}>
          Error: {error}
        </Text>
      )}
    </Box>
  );
};

// === ACCESSIBILITY HELP COMPONENT ===

export const AccessibilityHelp = ({ visible = false, onClose = () => {} }) => {
  const { announce } = useAccessibility('help', { role: 'dialog', label: 'Accessibility Help' });

  useInput((input, key) => {
    if (key.escape && visible) {
      announce('Help closed', 'normal');
      onClose();
    }
  });

  useEffect(() => {
    if (visible) {
      announce('Accessibility help opened. Press Escape to close.', 'normal');
    }
  }, [visible]);

  if (!visible) return null;

  const helpText = globalAccessibilityManager.showAccessibilityHelp();

  return (
    <Box flexDirection="column" borderStyle="double" padding={2}>
      <Text bold color="cyan" marginBottom={2}>
        Accessibility Help
      </Text>
      
      <Box flexDirection="column">
        {helpText.split('\n').map((line, index) => (
          <Text key={index} color={line.startsWith('•') ? 'white' : 'gray'}>
            {line}
          </Text>
        ))}
      </Box>
      
      <Text color="gray" dimColor marginTop={2}>
        Press Escape to close this help
      </Text>
    </Box>
  );
};

// Export all accessible components
export {
  globalAccessibilityManager,
  AccessibilityManager
};

// Export enhanced components as default
export default {
  AccessibleMenu,
  AccessibleProgress,
  AccessibleFileExplorer,
  AccessibleStatusPanel,
  AccessibleInput,
  AccessibilityHelp,
  globalAccessibilityManager
};
*/