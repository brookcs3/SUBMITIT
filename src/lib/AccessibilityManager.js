/**
 * Accessibility Manager for Terminal Applications
 * 
 * Provides screen reader compatibility, semantic markup concepts for terminal UIs,
 * and accessibility patterns that work within CLI environments.
 * 
 * This manager enhances Ink components with screen reader support, focus management,
 * and semantic announcements for better accessibility.
 */

import { EventEmitter } from 'events';
import chalk from 'chalk';

export class AccessibilityManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      announceChanges: true,
      verboseMode: false,
      highContrast: false,
      screenReaderMode: false,
      ...options
    };
    
    // Focus management
    this.focusHistory = [];
    this.currentFocus = null;
    this.focusableElements = new Map();
    
    // Announcement queue for screen readers
    this.announcementQueue = [];
    this.isAnnouncing = false;
    
    // Semantic element registry
    this.semanticElements = new Map();
    this.landmarks = new Map();
    
    // Initialize accessibility features
    this.setupAccessibilityHooks();
  }

  // === SEMANTIC MARKUP FOR TERMINAL ===

  /**
   * Register a semantic element with accessibility properties
   */
  registerElement(id, element) {
    this.semanticElements.set(id, {
      ...element,
      registeredAt: Date.now(),
      interactions: 0
    });
    
    if (element.role === 'landmark') {
      this.landmarks.set(id, element);
    }
    
    this.emit('element-registered', { id, element });
  }

  /**
   * Create accessible label for terminal elements
   */
  createAccessibleLabel(text, options = {}) {
    const {
      role = 'text',
      level = null,
      describedBy = null,
      interactive = false,
      state = null
    } = options;
    
    let label = text;
    
    // Add role context
    if (role === 'heading') {
      label = `Heading${level ? ` level ${level}` : ''}: ${text}`;
    } else if (role === 'button') {
      label = `Button: ${text}`;
    } else if (role === 'menu') {
      label = `Menu: ${text}`;
    } else if (role === 'status') {
      label = `Status: ${text}`;
    } else if (role === 'alert') {
      label = `Alert: ${text}`;
    }
    
    // Add state information
    if (state) {
      if (state.selected) label += ' (selected)';
      if (state.expanded) label += ' (expanded)';
      if (state.collapsed) label += ' (collapsed)';
      if (state.loading) label += ' (loading)';
      if (state.error) label += ' (error)';
    }
    
    // Add interaction hints
    if (interactive) {
      label += ' (interactive)';
    }
    
    return label;
  }

  /**
   * Announce text to screen readers
   */
  announce(message, priority = 'normal') {
    if (!this.options.announceChanges) return;
    
    const announcement = {
      message,
      priority, // 'urgent', 'normal', 'low'
      timestamp: Date.now(),
      type: 'announcement'
    };
    
    if (priority === 'urgent') {
      this.announcementQueue.unshift(announcement);
    } else {
      this.announcementQueue.push(announcement);
    }
    
    this.processAnnouncements();
  }

  /**
   * Process announcement queue
   */
  async processAnnouncements() {
    if (this.isAnnouncing || this.announcementQueue.length === 0) return;
    
    this.isAnnouncing = true;
    
    while (this.announcementQueue.length > 0) {
      const announcement = this.announcementQueue.shift();
      
      // In a real implementation, this would interface with screen reader APIs
      // For now, we'll use console output with special formatting
      if (this.options.screenReaderMode) {
        console.log(`[SCREEN-READER] ${announcement.message}`);
      }
      
      this.emit('announcement', announcement);
      
      // Small delay between announcements
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isAnnouncing = false;
  }

  // === FOCUS MANAGEMENT ===

  /**
   * Set focus to an element
   */
  setFocus(elementId, element) {
    if (this.currentFocus) {
      this.focusHistory.push(this.currentFocus);
    }
    
    this.currentFocus = { elementId, element, timestamp: Date.now() };
    this.emit('focus-changed', this.currentFocus);
    
    // Announce focus change
    if (element.label) {
      this.announce(`Focused on ${element.label}`, 'normal');
    }
  }

  /**
   * Move focus to previous element
   */
  focusPrevious() {
    if (this.focusHistory.length > 0) {
      const previous = this.focusHistory.pop();
      this.currentFocus = previous;
      this.emit('focus-changed', this.currentFocus);
      
      if (previous.element.label) {
        this.announce(`Focused on ${previous.element.label}`, 'normal');
      }
    }
  }

  /**
   * Get current focus information
   */
  getCurrentFocus() {
    return this.currentFocus;
  }

  // === NAVIGATION HELPERS ===

  /**
   * Create navigation instructions
   */
  createNavigationInstructions(context = 'general') {
    const instructions = {
      general: [
        'Use arrow keys to navigate',
        'Press Enter to select',
        'Press Escape to go back',
        'Press Tab to move between sections'
      ],
      menu: [
        'Use Up/Down arrows to navigate menu items',
        'Press Enter to select an item',
        'Press Escape to close menu'
      ],
      form: [
        'Use Tab to move between fields',
        'Use arrow keys within selection fields',
        'Press Enter to submit',
        'Press Escape to cancel'
      ],
      fileExplorer: [
        'Use Up/Down arrows to navigate files',
        'Press Enter to select or expand folders',
        'Press Space to mark files',
        'Press Escape to go back'
      ]
    };
    
    return instructions[context] || instructions.general;
  }

  /**
   * Announce navigation context
   */
  announceNavigation(context, additionalInfo = '') {
    const instructions = this.createNavigationInstructions(context);
    const message = `Navigation help for ${context}: ${instructions.join(', ')}. ${additionalInfo}`;
    this.announce(message, 'low');
  }

  // === HIGH CONTRAST AND VISUAL AIDS ===

  /**
   * Apply high contrast styling
   */
  getHighContrastStyle(element, state = {}) {
    if (!this.options.highContrast) return {};
    
    const styles = {
      normal: { color: 'white', backgroundColor: 'black' },
      focused: { color: 'black', backgroundColor: 'white' },
      selected: { color: 'yellow', backgroundColor: 'blue' },
      error: { color: 'white', backgroundColor: 'red' },
      success: { color: 'black', backgroundColor: 'green' },
      warning: { color: 'black', backgroundColor: 'yellow' }
    };
    
    if (state.focused) return styles.focused;
    if (state.selected) return styles.selected;
    if (state.error) return styles.error;
    if (state.success) return styles.success;
    if (state.warning) return styles.warning;
    
    return styles.normal;
  }

  /**
   * Create visual focus indicator
   */
  createFocusIndicator(isFocused = false) {
    if (!isFocused) return '';
    
    if (this.options.highContrast) {
      return '>>> ';
    }
    
    return '▶ ';
  }

  // === STATUS ANNOUNCEMENTS ===

  /**
   * Announce status changes
   */
  announceStatus(status, context = '') {
    const statusMessages = {
      loading: `Loading${context ? ` ${context}` : ''}...`,
      success: `Successfully completed${context ? ` ${context}` : ''}`,
      error: `Error occurred${context ? ` in ${context}` : ''}`,
      progress: `Progress update${context ? ` for ${context}` : ''}`,
      complete: `Task completed${context ? `: ${context}` : ''}`
    };
    
    const message = statusMessages[status] || `Status: ${status}`;
    this.announce(message, status === 'error' ? 'urgent' : 'normal');
  }

  /**
   * Announce progress updates
   */
  announceProgress(progress, total, operation = '') {
    const percentage = Math.round((progress / total) * 100);
    const message = `Progress: ${percentage}% complete${operation ? ` for ${operation}` : ''}`;
    this.announce(message, 'low');
  }

  // === KEYBOARD SHORTCUTS ===

  /**
   * Register accessibility keyboard shortcuts
   */
  setupAccessibilityHooks() {
    // These would be implemented with actual keyboard event handlers
    // For now, we'll define the patterns
    
    this.keyboardShortcuts = {
      'ctrl+h': () => this.showAccessibilityHelp(),
      'ctrl+shift+a': () => this.toggleAnnouncements(),
      'ctrl+shift+c': () => this.toggleHighContrast(),
      'ctrl+shift+n': () => this.announceNavigationHelp(),
      'alt+1': () => this.jumpToLandmark('main'),
      'alt+2': () => this.jumpToLandmark('navigation'),
      'alt+3': () => this.jumpToLandmark('sidebar'),
      'alt+4': () => this.jumpToLandmark('footer')
    };
  }

  /**
   * Show accessibility help
   */
  showAccessibilityHelp() {
    const help = [
      'Submitit Accessibility Features:',
      '',
      'Navigation:',
      '• Arrow keys: Navigate within sections',
      '• Tab: Move between sections',
      '• Enter: Select/activate',
      '• Escape: Go back/cancel',
      '',
      'Shortcuts:',
      '• Ctrl+H: Show this help',
      '• Ctrl+Shift+A: Toggle announcements',
      '• Ctrl+Shift+C: Toggle high contrast',
      '• Ctrl+Shift+N: Navigation help',
      '• Alt+1-4: Jump to landmarks',
      '',
      'Screen Reader: All elements have semantic labels and state information'
    ];
    
    return help.join('\n');
  }

  /**
   * Toggle announcements
   */
  toggleAnnouncements() {
    this.options.announceChanges = !this.options.announceChanges;
    this.announce(`Announcements ${this.options.announceChanges ? 'enabled' : 'disabled'}`, 'normal');
  }

  /**
   * Toggle high contrast mode
   */
  toggleHighContrast() {
    this.options.highContrast = !this.options.highContrast;
    this.announce(`High contrast mode ${this.options.highContrast ? 'enabled' : 'disabled'}`, 'normal');
    this.emit('contrast-changed', this.options.highContrast);
  }

  /**
   * Jump to landmark
   */
  jumpToLandmark(landmarkId) {
    const landmark = this.landmarks.get(landmarkId);
    if (landmark) {
      this.setFocus(landmarkId, landmark);
      this.announce(`Jumped to ${landmark.label || landmarkId}`, 'normal');
    } else {
      this.announce(`Landmark ${landmarkId} not found`, 'normal');
    }
  }

  // === ERROR AND SUCCESS PATTERNS ===

  /**
   * Announce errors with context
   */
  announceError(error, context = '', suggestions = []) {
    let message = `Error: ${error}`;
    if (context) message += ` in ${context}`;
    
    this.announce(message, 'urgent');
    
    if (suggestions.length > 0) {
      const suggestionsText = `Suggestions: ${suggestions.join(', ')}`;
      this.announce(suggestionsText, 'normal');
    }
  }

  /**
   * Announce success with celebration
   */
  announceSuccess(message, details = '') {
    this.announce(`Success: ${message}`, 'normal');
    if (details) {
      this.announce(details, 'low');
    }
  }

  // === VALIDATION HELPERS ===

  /**
   * Create accessible validation messages
   */
  createValidationMessage(field, result) {
    if (result.isValid) {
      return `${field} is valid`;
    }
    
    let message = `${field} validation failed: ${result.error}`;
    if (result.suggestions && result.suggestions.length > 0) {
      message += `. Suggestions: ${result.suggestions.join(', ')}`;
    }
    
    return message;
  }

  // === UTILITIES ===

  /**
   * Check if accessibility features are enabled
   */
  isAccessibilityEnabled() {
    return this.options.announceChanges || this.options.screenReaderMode || this.options.highContrast;
  }

  /**
   * Get accessibility statistics
   */
  getAccessibilityStats() {
    return {
      elementsRegistered: this.semanticElements.size,
      landmarksRegistered: this.landmarks.size,
      announcementsMade: this.announcementQueue.length,
      focusChanges: this.focusHistory.length,
      featuresEnabled: {
        announcements: this.options.announceChanges,
        screenReader: this.options.screenReaderMode,
        highContrast: this.options.highContrast,
        verboseMode: this.options.verboseMode
      }
    };
  }
}

// === ACCESSIBILITY HOOK FOR INK COMPONENTS ===

/**
 * Hook for adding accessibility to Ink components
 */
export const useAccessibility = (elementId, options = {}) => {
  const accessibilityManager = new AccessibilityManager();
  
  const registerElement = (element) => {
    accessibilityManager.registerElement(elementId, {
      ...element,
      ...options
    });
  };
  
  const announce = (message, priority = 'normal') => {
    accessibilityManager.announce(message, priority);
  };
  
  const setFocus = (element) => {
    accessibilityManager.setFocus(elementId, element);
  };
  
  const createLabel = (text, labelOptions = {}) => {
    return accessibilityManager.createAccessibleLabel(text, {
      ...options,
      ...labelOptions
    });
  };
  
  return {
    registerElement,
    announce,
    setFocus,
    createLabel,
    manager: accessibilityManager
  };
};

// === ACCESSIBLE COMPONENT WRAPPERS ===

/**
 * Enhanced Text component with accessibility
 */
export const AccessibleText = ({ 
  children, 
  role = 'text',
  level = null,
  announce = false,
  ...props 
}) => {
  const { createLabel, announce: announceText } = useAccessibility('text', { role, level });
  
  const accessibleText = createLabel(children, { role, level });
  
  if (announce) {
    announceText(accessibleText, 'low');
  }
  
  return React.createElement(Text, props, children);
};

/**
 * Enhanced Box component with landmark support
 */
export const AccessibleBox = ({ 
  children, 
  role = 'region',
  label = '',
  landmark = false,
  ...props 
}) => {
  const { registerElement } = useAccessibility('box', { role, label, landmark });
  
  React.useEffect(() => {
    registerElement({
      role: landmark ? 'landmark' : role,
      label,
      type: 'container'
    });
  }, [role, label, landmark]);
  
  return React.createElement(Box, props, children);
};

// Export the main class and utilities
export default AccessibilityManager;