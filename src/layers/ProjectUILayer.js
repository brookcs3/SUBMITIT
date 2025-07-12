/**
 * Project UI Layer
 * 
 * This is the Facade of our temple - how the sacred experience is presented to the user.
 * Every interaction should feel intentional, every feedback should guide the user
 * through their journey with grace, wisdom, and ceremonial beauty.
 */

import { AbstractUILayer } from '../core/AbstractLayers.js';
import { UIManager } from '../ui/UIManager.js';
import { NoMoreSecretsIntegration } from '../lib/NoMoreSecretsIntegration.js';
import chalk from 'chalk';

export class ProjectUILayer extends AbstractUILayer {
  constructor(context) {
    super(context);
    this.uiManager = new UIManager(context);
    this.nmsIntegration = new NoMoreSecretsIntegration();
    this.terminalCapabilities = null;
    this.currentTheme = 'modern';
    this.celebrationHistory = [];
  }

  // === SACRED INITIALIZATION ===

  async establishPresence() {
    try {
      this.logger.debug('Establishing UI presence');
      
      // Initialize UI manager
      await this.uiManager.initialize();
      
      // Detect terminal capabilities
      await this.detectTerminalCapabilities();
      
      // Initialize NMS integration
      await this.nmsIntegration.checkAvailability();
      
      // Set up ceremonial theme
      await this.initializeCeremonialTheme();
      
      this.logger.info('UI presence established', {
        terminalCapabilities: this.terminalCapabilities,
        nmsAvailable: this.nmsIntegration.isAvailable,
        theme: this.currentTheme
      });
      
    } catch (error) {
      this.logger.error('Failed to establish UI presence', error);
      throw error;
    }
  }

  async calibrateExperience() {
    try {
      this.logger.debug('Calibrating user experience');
      
      // Calibrate UI manager for optimal experience
      await this.uiManager.calibrateForEnvironment({
        capabilities: this.terminalCapabilities,
        theme: this.currentTheme,
        emotionalState: this.emotionalState
      });
      
      // Show welcome ceremony
      await this.showWelcomeCeremony();
      
      this.logger.info('User experience calibrated');
      
    } catch (error) {
      this.logger.error('Failed to calibrate user experience', error);
      throw error;
    }
  }

  // === SACRED RITUAL PHASES ===

  async renderPhase(phase, message, options = {}) {
    try {
      const phaseRendering = {
        phase,
        message,
        timestamp: Date.now(),
        emotionalState: this.emotionalState,
        options
      };
      
      // Use UI manager for standard rendering
      await this.uiManager.showRitualPhase(phase, message, {
        ...options,
        emotionalState: this.emotionalState
      });
      
      // Add ceremonial enhancement based on phase
      switch (phase) {
        case 'preparation':
          await this.renderPreparationPhase(message, options);
          break;
        case 'creation':
          await this.renderCreationPhase(message, options);
          break;
        case 'manifestation':
          await this.renderManifestationPhase(message, options);
          break;
        case 'celebration':
          await this.renderCelebrationPhase(message, options);
          break;
        case 'transcendence':
          await this.renderTranscendencePhase(message, options);
          break;
        case 'reflection':
          await this.renderReflectionPhase(message, options);
          break;
      }
      
      return phaseRendering;
      
    } catch (error) {
      this.logger.error(`Failed to render phase: ${phase}`, error);
      // Graceful degradation
      console.log(chalk.gray(`[${phase.toUpperCase()}] ${message}`));
    }
  }

  async renderPreparationPhase(message, options) {
    // Show preparation with focused energy
    console.log(chalk.blue('🧘 ') + chalk.blue.bold('PREPARATION'));
    console.log(chalk.blue('   ') + chalk.cyan(message));
    
    if (options.details) {
      console.log(chalk.blue('   ') + chalk.gray(options.details));
    }
    
    // Add breathing space
    await this.pauseForReflection(500);
  }

  async renderCreationPhase(message, options) {
    // Show creation with engaged energy
    console.log(chalk.green('⚡ ') + chalk.green.bold('CREATION'));
    console.log(chalk.green('   ') + chalk.greenBright(message));
    
    if (options.progress) {
      await this.showProgress(options.progress.message, options.progress.percentage);
    }
    
    await this.pauseForReflection(300);
  }

  async renderManifestationPhase(message, options) {
    // Show manifestation with excited energy
    console.log(chalk.magenta('✨ ') + chalk.magenta.bold('MANIFESTATION'));
    console.log(chalk.magenta('   ') + chalk.magentaBright(message));
    
    if (options.preview) {
      await this.showPreviewHint(options.preview);
    }
    
    await this.pauseForReflection(400);
  }

  async renderCelebrationPhase(message, options) {
    // Show celebration with joyful energy
    console.log(chalk.yellow('🎉 ') + chalk.yellow.bold('CELEBRATION'));
    console.log(chalk.yellow('   ') + chalk.yellowBright(message));
    
    if (options.achievement) {
      await this.showAchievement(options.achievement);
    }
    
    await this.pauseForReflection(800);
  }

  async renderTranscendencePhase(message, options) {
    // Show transcendence with accomplished energy
    console.log(chalk.cyan('🚀 ') + chalk.cyan.bold('TRANSCENDENCE'));
    console.log(chalk.cyan('   ') + chalk.cyanBright(message));
    
    if (options.manifestData) {
      await this.showDramaticReveal(options.manifestData);
    }
    
    await this.pauseForReflection(1000);
  }

  async renderReflectionPhase(message, options) {
    // Show reflection with contemplative energy
    console.log(chalk.gray('🤔 ') + chalk.gray.bold('REFLECTION'));
    console.log(chalk.gray('   ') + chalk.white(message));
    
    if (options.lesson) {
      console.log(chalk.gray('   ') + chalk.italic(options.lesson));
    }
    
    await this.pauseForReflection(600);
  }

  // === PROGRESS VISUALIZATION ===

  async renderProgress(progressData) {
    try {
      const { message, progress, emotionalState, phase } = progressData;
      
      // Use UI manager for progress rendering
      await this.uiManager.showProgress({
        message,
        progress,
        emotionalState,
        phase,
        animated: this.terminalCapabilities.supportsAnimation,
        themed: true
      });
      
      // Add ceremonial enhancement
      if (progress && typeof progress === 'number') {
        await this.showProgressCeremony(progress, message);
      }
      
    } catch (error) {
      this.logger.error('Failed to render progress', error);
      // Graceful degradation
      const percentage = typeof progressData.progress === 'number' ? 
        ` (${progressData.progress}%)` : '';
      console.log(chalk.gray(`⏳ ${progressData.message}${percentage}`));
    }
  }

  async showProgressCeremony(progress, message) {
    // Show progress with ceremonial flair
    const progressBar = this.createProgressBar(progress);
    const progressPhase = this.determineProgressPhase(progress);
    
    console.log(chalk.gray('   ') + progressBar + chalk.gray(` ${progress}%`));
    
    // Add phase-specific encouragement
    if (progressPhase === 'beginning' && progress <= 25) {
      console.log(chalk.gray('   ') + chalk.italic('The journey begins...'));
    } else if (progressPhase === 'middle' && progress > 25 && progress <= 75) {
      console.log(chalk.gray('   ') + chalk.italic('Transformation in progress...'));
    } else if (progressPhase === 'completion' && progress > 75) {
      console.log(chalk.gray('   ') + chalk.italic('Approaching transcendence...'));
    }
  }

  // === CELEBRATION RITUALS ===

  async renderCelebration(celebrationContext) {
    try {
      const { achievement, emotionalState, journey } = celebrationContext;
      
      // Record celebration
      this.celebrationHistory.push({
        achievement,
        timestamp: Date.now(),
        emotionalState,
        journeyLength: journey.length
      });
      
      // Show celebration ceremony
      await this.showCelebrationCeremony(achievement);
      
      // Use NMS for dramatic reveal if available
      if (this.nmsIntegration.isAvailable && achievement.dramatic) {
        await this.showDramaticCelebration(achievement);
      } else {
        await this.showStandardCelebration(achievement);
      }
      
    } catch (error) {
      this.logger.error('Failed to render celebration', error);
      // Graceful degradation
      console.log(chalk.yellow(`🎉 ${celebrationContext.achievement.type} achieved!`));
    }
  }

  async showCelebrationCeremony(achievement) {
    // Show celebration header
    console.log();
    console.log(chalk.yellow('🎊'.repeat(50)));
    console.log(chalk.yellow.bold('                  CELEBRATION CEREMONY'));
    console.log(chalk.yellow('🎊'.repeat(50)));
    console.log();
    
    // Show achievement details
    console.log(chalk.green(`🏆 Achievement: ${achievement.type}`));
    if (achievement.description) {
      console.log(chalk.green(`📝 Description: ${achievement.description}`));
    }
    if (achievement.quality) {
      console.log(chalk.green(`⭐ Quality: ${achievement.quality}`));
    }
    
    console.log();
    await this.pauseForReflection(1000);
  }

  async showDramaticCelebration(achievement) {
    // Use NMS for dramatic reveal
    const celebrationData = {
      achievement: achievement.type,
      progress: achievement.progress || '100%',
      quality: achievement.quality || 'Excellent'
    };
    
    try {
      await this.nmsIntegration.revealCelebration(celebrationData);
    } catch (error) {
      this.logger.warn('NMS celebration failed, using standard celebration', error);
      await this.showStandardCelebration(achievement);
    }
  }

  async showStandardCelebration(achievement) {
    // Standard celebration without NMS
    console.log(chalk.rainbow('🎉 ') + chalk.bold.green(achievement.type) + chalk.rainbow(' 🎉'));
    console.log(chalk.green(`   ${achievement.description || 'Task completed successfully!'}`));
    
    if (achievement.stats) {
      console.log();
      Object.entries(achievement.stats).forEach(([key, value]) => {
        console.log(chalk.cyan(`   ${key}: ${value}`));
      });
    }
    
    console.log();
    console.log(chalk.italic.gray('   Well done! The ceremony is complete.'));
    console.log();
  }

  async showDramaticReveal(manifestData) {
    // Use NMS for dramatic manifest reveal
    if (this.nmsIntegration.isAvailable) {
      try {
        await this.nmsIntegration.revealManifest(manifestData);
        return;
      } catch (error) {
        this.logger.warn('NMS reveal failed, using standard reveal', error);
      }
    }
    
    // Fallback to standard reveal
    await this.showStandardReveal(manifestData);
  }

  async showStandardReveal(manifestData) {
    console.log();
    console.log(chalk.cyan('═'.repeat(60)));
    console.log(chalk.cyan.bold('                    PROJECT MANIFEST'));
    console.log(chalk.cyan('═'.repeat(60)));
    console.log();
    
    console.log(chalk.green(`📦 Project: ${manifestData.project}`));
    console.log(chalk.green(`📅 Exported: ${manifestData.exported}`));
    console.log(chalk.green(`📍 Package: ${manifestData.packagePath}`));
    console.log(chalk.green(`💾 Size: ${manifestData.packageSize}`));
    
    if (manifestData.files && manifestData.files.length > 0) {
      console.log();
      console.log(chalk.yellow('📁 Files Included:'));
      manifestData.files.forEach(file => {
        const icon = this.getFileIcon(file.type);
        console.log(chalk.gray(`   ${icon} ${file.name} (${file.size}) [${file.role}]`));
      });
    }
    
    console.log();
    console.log(chalk.cyan('═'.repeat(60)));
    console.log(chalk.cyan.bold('                  MANIFEST COMPLETE'));
    console.log(chalk.cyan('═'.repeat(60)));
    console.log();
  }

  // === EMOTIONAL STATE MANAGEMENT ===

  async handleEmotionalTransition(from, to, phase) {
    try {
      this.logger.debug(`Emotional transition: ${from} → ${to} (${phase})`);
      
      // Show transition ceremony
      await this.showEmotionalTransition(from, to, phase);
      
      // Update UI manager with new emotional state
      await this.uiManager.updateEmotionalState(to, {
        fromState: from,
        phase,
        transition: true
      });
      
      // Apply theme adjustments based on emotional state
      await this.adjustThemeForEmotionalState(to);
      
    } catch (error) {
      this.logger.error('Failed to handle emotional transition', error);
    }
  }

  async showEmotionalTransition(from, to, phase) {
    const transitionMessage = this.getTransitionMessage(from, to, phase);
    if (transitionMessage) {
      console.log(chalk.gray(`   ${transitionMessage}`));
      await this.pauseForReflection(200);
    }
  }

  getTransitionMessage(from, to, phase) {
    const transitions = {
      'neutral_focused': 'Centering attention...',
      'focused_engaged': 'Channeling energy...',
      'engaged_excited': 'Building momentum...',
      'excited_joyful': 'Embracing success...',
      'joyful_accomplished': 'Achieving mastery...',
      'accomplished_contemplative': 'Reflecting on journey...'
    };
    
    const key = `${from}_${to}`;
    return transitions[key] || null;
  }

  // === UTILITY METHODS ===

  async detectTerminalCapabilities() {
    this.terminalCapabilities = {
      supportsColor: process.stdout.isTTY && process.env.TERM !== 'dumb',
      supportsUnicode: process.env.LANG?.includes('UTF') || process.env.LC_ALL?.includes('UTF'),
      supportsAnimation: process.stdout.isTTY && !process.env.CI,
      width: process.stdout.columns || 80,
      height: process.stdout.rows || 24,
      isInteractive: process.stdout.isTTY && process.stdin.isTTY
    };
  }

  async initializeCeremonialTheme() {
    // Initialize theme based on environment
    const themes = {
      modern: {
        primary: chalk.blue,
        secondary: chalk.cyan,
        accent: chalk.magenta,
        success: chalk.green,
        warning: chalk.yellow,
        error: chalk.red,
        muted: chalk.gray
      },
      elegant: {
        primary: chalk.cyan,
        secondary: chalk.blue,
        accent: chalk.yellow,
        success: chalk.green,
        warning: chalk.orange,
        error: chalk.red,
        muted: chalk.gray
      }
    };
    
    this.currentTheme = themes[this.currentTheme] || themes.modern;
  }

  async adjustThemeForEmotionalState(emotionalState) {
    // Adjust theme colors based on emotional state
    const emotionalColors = {
      neutral: chalk.gray,
      focused: chalk.blue,
      engaged: chalk.green,
      excited: chalk.magenta,
      joyful: chalk.yellow,
      accomplished: chalk.cyan,
      contemplative: chalk.gray
    };
    
    this.currentTheme.emotional = emotionalColors[emotionalState] || chalk.gray;
  }

  createProgressBar(progress) {
    const width = 30;
    const filled = Math.floor((progress / 100) * width);
    const empty = width - filled;
    
    return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  }

  determineProgressPhase(progress) {
    if (progress <= 25) return 'beginning';
    if (progress <= 75) return 'middle';
    return 'completion';
  }

  getFileIcon(type) {
    const icons = {
      'document': '📄',
      'image': '🖼️',
      'text': '📝',
      'audio': '🎵',
      'video': '🎬',
      'archive': '🗂️',
      'code': '💻'
    };
    return icons[type] || '📎';
  }

  async showWelcomeCeremony() {
    console.log();
    console.log(chalk.cyan('🏛️  ') + chalk.cyan.bold('Welcome to the SUBMITIT Temple'));
    console.log(chalk.cyan('    ') + chalk.gray('Where deliverables become ceremonies'));
    console.log();
    await this.pauseForReflection(800);
  }

  async showAchievement(achievement) {
    console.log(chalk.green(`🏆 ${achievement.name}: ${achievement.description}`));
    if (achievement.points) {
      console.log(chalk.green(`   Points earned: ${achievement.points}`));
    }
  }

  async showPreviewHint(preview) {
    console.log(chalk.magenta(`   Preview available at: ${preview.url}`));
    console.log(chalk.magenta(`   Theme: ${preview.theme}`));
  }

  async pauseForReflection(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // === GRACEFUL ERROR HANDLING ===

  async showGracefulError(error, context) {
    console.log();
    console.log(chalk.red('⚠️  ') + chalk.red.bold('Sacred Process Interrupted'));
    console.log(chalk.red('    ') + chalk.white(error.message));
    
    if (context.suggestions) {
      console.log();
      console.log(chalk.yellow('💡 Suggestions:'));
      context.suggestions.forEach(suggestion => {
        console.log(chalk.yellow(`   • ${suggestion}`));
      });
    }
    
    console.log();
    console.log(chalk.gray('   The temple remains. The ceremony can be resumed.'));
    console.log();
  }

  // === HEALTH CHECK ===

  async healthCheck() {
    try {
      const uiManagerHealth = this.uiManager ? await this.uiManager.getHealthStatus() : null;
      const nmsAvailable = this.nmsIntegration ? this.nmsIntegration.isAvailable : false;
      
      return {
        status: 'healthy',
        details: {
          uiManager: uiManagerHealth,
          nmsAvailable,
          terminalCapabilities: this.terminalCapabilities,
          currentTheme: this.currentTheme,
          emotionalState: this.emotionalState,
          celebrationHistory: this.celebrationHistory.length
        }
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  // === CLEANUP ===

  async cleanup() {
    try {
      // Clear celebration history
      this.celebrationHistory = [];
      
      // Reset emotional state
      this.emotionalState = 'neutral';
      
      // Clean up UI manager
      if (this.uiManager && typeof this.uiManager.cleanup === 'function') {
        await this.uiManager.cleanup();
      }
      
      this.logger.info('Project UI layer cleanup completed');
    } catch (error) {
      this.logger.error('Project UI layer cleanup failed', error);
    }
  }
}