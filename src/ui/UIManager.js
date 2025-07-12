/**
 * UI Manager
 * 
 * This manages the emotional and ceremonial aspects of the submitit interface,
 * creating meaningful moments that transform mundane CLI interactions into rituals.
 */

import chalk from 'chalk';
import chalkAnimation from 'chalk-animation';
import { setTimeout } from 'timers/promises';

export class UIManager {
  constructor(options = {}) {
    this.options = options;
    this.colorMode = options.colorMode || 'full';
    this.animations = options.animations !== false;
    this.logger = options.logger;
    this.currentPhase = null;
    this.emotionalState = 'neutral';
    this.messageQueue = [];
    this.isProcessing = false;
  }

  // === CEREMONIAL PHASES ===

  showRitualPhase(phase, message) {
    this.currentPhase = phase;
    
    const phaseConfig = this.getPhaseConfig(phase);
    this.emotionalState = phaseConfig.emotion;
    
    if (this.animations) {
      this.showAnimatedPhase(phase, message, phaseConfig);
    } else {
      this.showStaticPhase(phase, message, phaseConfig);
    }
  }

  getPhaseConfig(phase) {
    const configs = {
      'preparation': {
        emotion: 'focused',
        color: 'yellow',
        icon: '🧘',
        animation: 'pulse',
        duration: 1500
      },
      'creation': {
        emotion: 'engaged',
        color: 'blue',
        icon: '✨',
        animation: 'rainbow',
        duration: 2000
      },
      'celebration': {
        emotion: 'joyful',
        color: 'green',
        icon: '🎉',
        animation: 'neon',
        duration: 3000
      }
    };
    
    return configs[phase] || {
      emotion: 'neutral',
      color: 'white',
      icon: '•',
      animation: 'pulse',
      duration: 1000
    };
  }

  async showAnimatedPhase(phase, message, config) {
    console.log(); // Breathing space
    
    const fullMessage = `${config.icon} ${message}`;
    
    if (chalkAnimation[config.animation]) {
      const animation = chalkAnimation[config.animation](fullMessage);
      await setTimeout(config.duration);
      animation.stop();
    } else {
      console.log(chalk[config.color](fullMessage));
    }
    
    console.log(); // Breathing space
  }

  showStaticPhase(phase, message, config) {
    console.log(); // Breathing space
    console.log(chalk[config.color](`${config.icon} ${message}`));
    console.log(); // Breathing space
  }

  // === PROGRESS VISUALIZATION ===

  showProgress(message, options = {}) {
    const progressConfig = this.getProgressConfig();
    
    if (options.spinner !== false && this.animations) {
      // This would integrate with ora or similar
      console.log(chalk[progressConfig.color](`${progressConfig.icon} ${message}`));
    } else {
      console.log(chalk[progressConfig.color](`${progressConfig.icon} ${message}`));
    }
  }

  getProgressConfig() {
    const configs = {
      'focused': { color: 'yellow', icon: '⚡' },
      'engaged': { color: 'blue', icon: '🔄' },
      'joyful': { color: 'green', icon: '✨' },
      'neutral': { color: 'white', icon: '•' }
    };
    
    return configs[this.emotionalState] || configs.neutral;
  }

  // === CONTEXTUAL MESSAGING ===

  showSuccess(messages, options = {}) {
    const successConfig = {
      color: 'green',
      icon: '✅',
      emotion: 'accomplished'
    };
    
    this.emotionalState = successConfig.emotion;
    
    if (Array.isArray(messages)) {
      messages.forEach(msg => {
        if (msg === '') {
          console.log();
        } else {
          console.log(chalk[successConfig.color](msg));
        }
      });
    } else {
      console.log(chalk[successConfig.color](`${successConfig.icon} ${messages}`));
    }
  }

  showWarning(message, options = {}) {
    const warningConfig = {
      color: 'yellow',
      icon: '⚠️',
      emotion: 'cautious'
    };
    
    console.log(chalk[warningConfig.color](`${warningConfig.icon} ${message}`));
  }

  showError(message, options = {}) {
    const errorConfig = {
      color: 'red',
      icon: '❌',
      emotion: 'concerned'
    };
    
    this.emotionalState = errorConfig.emotion;
    console.log(chalk[errorConfig.color](`${errorConfig.icon} ${message}`));
  }

  // === CELEBRATION SYSTEM ===

  async showCelebration(messages, options = {}) {
    this.emotionalState = 'triumphant';
    
    if (this.animations) {
      await this.showAnimatedCelebration(messages, options);
    } else {
      await this.showStaticCelebration(messages, options);
    }
  }

  async showAnimatedCelebration(messages, options = {}) {
    // Rainbow animation for celebration
    if (Array.isArray(messages)) {
      for (const message of messages) {
        if (message === '') {
          console.log();
        } else if (message.includes('COMPLETE')) {
          // Special treatment for completion messages
          const animation = chalkAnimation.rainbow(message);
          await setTimeout(2000);
          animation.stop();
        } else {
          console.log(chalk.green(message));
          await setTimeout(100); // Brief pause between lines
        }
      }
    } else {
      const animation = chalkAnimation.rainbow(messages);
      await setTimeout(2000);
      animation.stop();
    }
  }

  async showStaticCelebration(messages, options = {}) {
    if (Array.isArray(messages)) {
      messages.forEach(msg => {
        if (msg === '') {
          console.log();
        } else {
          console.log(chalk.green(msg));
        }
      });
    } else {
      console.log(chalk.green(messages));
    }
  }

  // === EMOTIONAL STATE MANAGEMENT ===

  setEmotionalState(state) {
    this.emotionalState = state;
    this.logger?.debug(`Emotional state changed to: ${state}`);
  }

  getEmotionalState() {
    return this.emotionalState;
  }

  // Contextual messages based on emotional state
  getContextualMessage(baseMessage, context = {}) {
    const stateModifiers = {
      'focused': (msg) => `🎯 ${msg}`,
      'engaged': (msg) => `⚡ ${msg}`,
      'joyful': (msg) => `🌟 ${msg}`,
      'accomplished': (msg) => `🏆 ${msg}`,
      'triumphant': (msg) => `🎉 ${msg}`,
      'cautious': (msg) => `💭 ${msg}`,
      'concerned': (msg) => `🔍 ${msg}`,
      'neutral': (msg) => msg
    };
    
    const modifier = stateModifiers[this.emotionalState] || stateModifiers.neutral;
    return modifier(baseMessage);
  }

  // === ACCESSIBILITY FEATURES ===

  showAccessibleMessage(message, options = {}) {
    // Screen reader friendly output
    if (options.screenReader) {
      console.log(message); // Plain text for screen readers
    } else {
      // Visual enhancement for sighted users
      console.log(this.enhanceMessage(message, options));
    }
  }

  enhanceMessage(message, options = {}) {
    if (this.colorMode === 'none') {
      return message;
    }
    
    const enhancement = options.enhancement || 'default';
    const enhancers = {
      'default': (msg) => chalk.white(msg),
      'success': (msg) => chalk.green(msg),
      'warning': (msg) => chalk.yellow(msg),
      'error': (msg) => chalk.red(msg),
      'info': (msg) => chalk.blue(msg),
      'highlight': (msg) => chalk.cyan(msg)
    };
    
    return enhancers[enhancement](message);
  }

  // === RESPONSIVE BEHAVIOR ===

  adaptToTerminal() {
    const terminalWidth = process.stdout.columns || 80;
    const terminalHeight = process.stdout.rows || 24;
    
    // Adjust output based on terminal size
    if (terminalWidth < 60) {
      // Narrow terminal - simplify output
      this.animations = false;
      this.options.compact = true;
    } else if (terminalWidth > 120) {
      // Wide terminal - enhance output
      this.options.enhanced = true;
    }
    
    return {
      width: terminalWidth,
      height: terminalHeight,
      isNarrow: terminalWidth < 60,
      isWide: terminalWidth > 120
    };
  }

  // === PROGRESS SEQUENCES ===

  async showProgressSequence(steps, options = {}) {
    const terminalInfo = this.adaptToTerminal();
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const isLast = i === steps.length - 1;
      
      // Show step with progress indicator
      const progressIndicator = terminalInfo.isNarrow ? 
        `[${i + 1}/${steps.length}]` : 
        this.createProgressBar(i + 1, steps.length);
      
      this.showProgress(`${progressIndicator} ${step.message}`);
      
      // Execute step if it has an action
      if (step.action && typeof step.action === 'function') {
        await step.action();
      }
      
      // Brief pause between steps for readability
      if (!isLast) {
        await setTimeout(options.stepDelay || 500);
      }
    }
  }

  createProgressBar(current, total, width = 20) {
    const progress = Math.round((current / total) * width);
    const bar = '█'.repeat(progress) + '░'.repeat(width - progress);
    const percentage = Math.round((current / total) * 100);
    
    return `${bar} ${percentage}%`;
  }

  // === THEME INTEGRATION ===

  applyTheme(theme) {
    const themeConfigs = {
      'noir': {
        primary: 'white',
        secondary: 'gray',
        accent: 'yellow',
        background: 'black'
      },
      'academic': {
        primary: 'blue',
        secondary: 'gray',
        accent: 'green',
        background: 'white'
      },
      'brutalist': {
        primary: 'red',
        secondary: 'black',
        accent: 'yellow',
        background: 'white'
      },
      'modern': {
        primary: 'cyan',
        secondary: 'gray',
        accent: 'magenta',
        background: 'black'
      }
    };
    
    this.themeConfig = themeConfigs[theme] || themeConfigs.modern;
  }

  // === MESSAGING QUEUE ===

  queueMessage(message, type = 'info', options = {}) {
    this.messageQueue.push({
      message,
      type,
      options,
      timestamp: Date.now()
    });
    
    if (!this.isProcessing) {
      this.processMessageQueue();
    }
  }

  async processMessageQueue() {
    this.isProcessing = true;
    
    while (this.messageQueue.length > 0) {
      const { message, type, options } = this.messageQueue.shift();
      
      switch (type) {
        case 'success':
          this.showSuccess(message, options);
          break;
        case 'warning':
          this.showWarning(message, options);
          break;
        case 'error':
          this.showError(message, options);
          break;
        case 'progress':
          this.showProgress(message, options);
          break;
        default:
          console.log(message);
      }
      
      // Brief pause between queued messages
      await setTimeout(100);
    }
    
    this.isProcessing = false;
  }

  // === UTILITY METHODS ===

  clearScreen() {
    if (this.options.clearScreen !== false) {
      console.clear();
    }
  }

  showSeparator(character = '─', width = 50) {
    console.log(chalk.gray(character.repeat(width)));
  }

  showTitle(title, options = {}) {
    const terminalInfo = this.adaptToTerminal();
    const width = Math.min(terminalInfo.width - 4, 80);
    
    console.log();
    console.log(chalk.bold(title.padStart((width + title.length) / 2)));
    console.log(chalk.gray('─'.repeat(width)));
    console.log();
  }
}