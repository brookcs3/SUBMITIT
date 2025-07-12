/**
 * Celebration Animation System
 * 
 * Advanced celebration animations using chalk-animation with contextual success messages,
 * achievement detection, and sophisticated visual feedback for user accomplishments.
 */

import { EventEmitter } from 'events';
import chalk from 'chalk';

export class CelebrationAnimationSystem extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      enableAnimations: true,
      enableContextualMessages: true,
      enableAchievementDetection: true,
      enablePersonalizedMessages: true,
      enableSoundEffects: false, // ASCII sound effects
      animationDuration: 3000, // 3 seconds
      enableRaritySystem: true,
      enableCelebrationHistory: true,
      maxHistorySize: 100,
      ...options
    };
    
    // Celebration state
    this.celebrationHistory = [];
    this.achievements = new Map();
    this.celebrationStats = {
      totalCelebrations: 0,
      byType: new Map(),
      byRarity: new Map()
    };
    
    // Animation patterns
    this.animationPatterns = new Map();
    this.celebrationTypes = new Map();
    this.rarityLevels = new Map();
    
    this.initialize();
  }
  
  initialize() {
    console.log(chalk.blue('🎉 Initializing Celebration Animation System...'));
    
    this.setupAnimationPatterns();
    this.setupCelebrationTypes();
    this.setupRarityLevels();
    this.setupAchievements();
    
    console.log(chalk.green('✅ Celebration animation system initialized'));
    this.emit('celebration-system-ready');
  }
  
  setupAnimationPatterns() {
    // Fireworks pattern
    this.animationPatterns.set('fireworks', {
      name: 'Fireworks',
      frames: [
        '        ✨\n      ✨  ✨\n    ✨  🎆  ✨\n      ✨  ✨\n        ✨',
        '      🎆\n    ✨  ✨  ✨\n  ✨  ✨🎆✨  ✨\n    ✨  ✨  ✨\n      🎆',
        '    🎆  🎆\n  ✨✨  ✨✨\n✨  🎆✨🎆  ✨\n  ✨✨  ✨✨\n    🎆  🎆',
        '  🎆✨🎆✨🎆\n✨✨✨✨✨✨✨\n🎆✨🎆✨🎆✨🎆\n✨✨✨✨✨✨✨\n  🎆✨🎆✨🎆'
      ],
      duration: 800
    });
    
    // Sparkles pattern
    this.animationPatterns.set('sparkles', {
      name: 'Sparkles',
      frames: [
        '  ✨    ✨  \n    ✨    \n✨    ✨  \n    ✨    \n  ✨    ✨',
        '    ✨  ✨\n  ✨    ✨\n    ✨    \n✨    ✨  \n  ✨  ✨  ',
        '✨  ✨  ✨\n  ✨  ✨  \n    ✨    \n  ✨  ✨  \n✨  ✨  ✨',
        '  ✨✨✨  \n✨  ✨  ✨\n✨✨✨✨✨\n✨  ✨  ✨\n  ✨✨✨  '
      ],
      duration: 600
    });
    
    // Confetti pattern
    this.animationPatterns.set('confetti', {
      name: 'Confetti',
      frames: [
        '🎊      🎊\n  🎊  🎊  \n    🎊    \n🎊  🎊  🎊\n      🎊  ',
        '  🎊🎊🎊  \n🎊      🎊\n  🎊🎊🎊  \n🎊      🎊\n  🎊🎊🎊  ',
        '🎊🎊    🎊\n  🎊🎊🎊  \n🎊🎊🎊🎊🎊\n  🎊🎊🎊  \n🎊    🎊🎊',
        '🎊🎊🎊🎊🎊\n🎊🎊🎊🎊🎊\n🎊🎊🎊🎊🎊\n🎊🎊🎊🎊🎊\n🎊🎊🎊🎊🎊'
      ],
      duration: 1000
    });
    
    // Trophy pattern
    this.animationPatterns.set('trophy', {
      name: 'Trophy',
      frames: [
        '    🏆    \n   ✨✨✨   \n  ✨   ✨  \n ✨     ✨ \n✨       ✨',
        '  🏆🏆🏆  \n ✨✨✨✨✨ \n✨  🏆  ✨\n ✨✨✨✨✨ \n  🏆🏆🏆  ',
        '🏆🏆🏆🏆🏆\n✨✨🏆✨✨\n✨🏆🏆🏆✨\n✨✨🏆✨✨\n🏆🏆🏆🏆🏆',
        '✨🏆✨🏆✨\n🏆✨🏆✨🏆\n✨🏆🏆🏆✨\n🏆✨🏆✨🏆\n✨🏆✨🏆✨'
      ],
      duration: 1200
    });
    
    // Rainbow pattern
    this.animationPatterns.set('rainbow', {
      name: 'Rainbow',
      frames: [
        chalk.red('🌈') + '        ' + chalk.red('🌈'),
        '  ' + chalk.yellow('🌈') + '    ' + chalk.yellow('🌈') + '  ',
        '    ' + chalk.green('🌈🌈🌈') + '    ',
        '  ' + chalk.blue('🌈🌈🌈🌈🌈') + '  ',
        chalk.magenta('🌈🌈🌈🌈🌈🌈🌈')
      ],
      duration: 500
    });
  }
  
  setupCelebrationTypes() {
    this.celebrationTypes.set('project-created', {
      name: 'Project Created',
      messages: [
        'Amazing! Your new project is ready to shine! ✨',
        'Project created with style! Time to make magic happen! 🎭',
        'A new creative journey begins! Welcome aboard! 🚀',
        'Your digital canvas awaits! Let the creativity flow! 🎨'
      ],
      animations: ['sparkles', 'confetti'],
      rarity: 'common',
      achievements: ['first-project', 'project-creator']
    });
    
    this.celebrationTypes.set('file-validated', {
      name: 'File Validated',
      messages: [
        'Perfect! All files validated successfully! 💎',
        'Quality check passed with flying colors! 🌟',
        'Your files are pristine and ready! ✨',
        'Validation complete - everything looks fantastic! 🎯'
      ],
      animations: ['sparkles'],
      rarity: 'common',
      achievements: ['quality-keeper', 'perfectionist']
    });
    
    this.celebrationTypes.set('export-completed', {
      name: 'Export Completed',
      messages: [
        'Export completed flawlessly! Your masterpiece is ready! 🎭',
        'Package created with precision and care! 📦',
        'Your creation is now ready to share with the world! 🌍',
        'Export successful - time to showcase your work! 🌟'
      ],
      animations: ['fireworks', 'trophy'],
      rarity: 'uncommon',
      achievements: ['exporter', 'deliverer']
    });
    
    this.celebrationTypes.set('milestone-reached', {
      name: 'Milestone Reached',
      messages: [
        'Incredible milestone achieved! You\'re on fire! 🔥',
        'Outstanding progress! Keep up the amazing work! 🚀',
        'Milestone conquered! Your dedication is inspiring! 💪',
        'Remarkable achievement unlocked! Celebrate this moment! 🎊'
      ],
      animations: ['fireworks', 'trophy', 'rainbow'],
      rarity: 'rare',
      achievements: ['milestone-master', 'achiever']
    });
    
    this.celebrationTypes.set('perfect-score', {
      name: 'Perfect Score',
      messages: [
        'PERFECT SCORE! Absolutely flawless execution! 👑',
        'Perfection achieved! You\'ve mastered this craft! 🏆',
        'Impeccable work! This is what excellence looks like! ⭐',
        'Perfect execution! You\'ve reached the pinnacle! 🎯'
      ],
      animations: ['trophy', 'rainbow', 'fireworks'],
      rarity: 'legendary',
      achievements: ['perfectionist', 'master', 'legend']
    });
    
    this.celebrationTypes.set('first-share', {
      name: 'First Share',
      messages: [
        'First share completed! Welcome to the sharing community! 🤝',
        'Sharing is caring! Your first file is now public! 🌐',
        'Great job on your first share! The world can see your work! ✨',
        'Sharing milestone achieved! Keep spreading the creativity! 🎨'
      ],
      animations: ['confetti', 'sparkles'],
      rarity: 'uncommon',
      achievements: ['sharer', 'community-member']
    });
  }
  
  setupRarityLevels() {
    this.rarityLevels.set('common', {
      name: 'Common',
      color: chalk.green,
      prefix: '✨',
      probability: 0.7,
      animationIntensity: 'low'
    });
    
    this.rarityLevels.set('uncommon', {
      name: 'Uncommon',
      color: chalk.blue,
      prefix: '🌟',
      probability: 0.2,
      animationIntensity: 'medium'
    });
    
    this.rarityLevels.set('rare', {
      name: 'Rare',
      color: chalk.magenta,
      prefix: '💎',
      probability: 0.07,
      animationIntensity: 'high'
    });
    
    this.rarityLevels.set('epic', {
      name: 'Epic',
      color: chalk.yellow,
      prefix: '🔥',
      probability: 0.025,
      animationIntensity: 'very-high'
    });
    
    this.rarityLevels.set('legendary', {
      name: 'Legendary',
      color: chalk.red,
      prefix: '👑',
      probability: 0.005,
      animationIntensity: 'maximum'
    });
  }
  
  setupAchievements() {
    this.achievements.set('first-project', {
      name: 'First Steps',
      description: 'Created your first project',
      icon: '🌱',
      rarity: 'common'
    });
    
    this.achievements.set('project-creator', {
      name: 'Creator',
      description: 'Created 5 projects',
      icon: '🎨',
      rarity: 'uncommon',
      threshold: 5
    });
    
    this.achievements.set('quality-keeper', {
      name: 'Quality Keeper',
      description: 'Validated 10 files successfully',
      icon: '💎',
      rarity: 'uncommon',
      threshold: 10
    });
    
    this.achievements.set('perfectionist', {
      name: 'Perfectionist',
      description: 'Achieved perfect validation score',
      icon: '⭐',
      rarity: 'rare'
    });
    
    this.achievements.set('sharer', {
      name: 'Sharer',
      description: 'Shared your first file',
      icon: '🤝',
      rarity: 'common'
    });
    
    this.achievements.set('master', {
      name: 'Master Creator',
      description: 'Completed 50 perfect operations',
      icon: '🏆',
      rarity: 'epic',
      threshold: 50
    });
    
    this.achievements.set('legend', {
      name: 'Legend',
      description: 'Achieved legendary status',
      icon: '👑',
      rarity: 'legendary',
      threshold: 100
    });
  }
  
  // === CORE CELEBRATION METHODS ===
  
  async celebrate(type, context = {}) {
    if (!this.options.enableAnimations) {
      return this.showSimpleCelebration(type, context);
    }
    
    const celebrationType = this.celebrationTypes.get(type);
    if (!celebrationType) {
      return this.showGenericCelebration(context);
    }
    
    try {
      // Determine rarity
      const rarity = this.determineRarity(celebrationType, context);
      
      // Generate personalized message
      const message = this.generatePersonalizedMessage(celebrationType, context);
      
      // Select animation
      const animation = this.selectAnimation(celebrationType, rarity);
      
      // Check for achievements
      const achievements = await this.checkAchievements(type, context);
      
      // Create celebration display
      const celebration = {
        type,
        rarity,
        message,
        animation,
        achievements,
        timestamp: Date.now()
      };
      
      // Display celebration
      await this.displayCelebration(celebration);
      
      // Record celebration
      this.recordCelebration(celebration);
      
      this.emit('celebration-completed', celebration);
      return celebration;
      
    } catch (error) {
      console.error(chalk.red('❌ Celebration failed:'), error.message);
      return this.showSimpleCelebration(type, context);
    }
  }
  
  determineRarity(celebrationType, context) {
    let baseRarity = celebrationType.rarity;
    
    // Context-based rarity modifiers
    if (context.isFirstTime) {
      baseRarity = this.upgradeRarity(baseRarity);
    }
    
    if (context.perfectScore) {
      baseRarity = this.upgradeRarity(baseRarity, 2);
    }
    
    if (context.milestone) {
      baseRarity = this.upgradeRarity(baseRarity);
    }
    
    // Random rarity upgrade chance
    const rarityLevel = this.rarityLevels.get(baseRarity);
    if (rarityLevel && Math.random() < 0.1) { // 10% chance
      baseRarity = this.upgradeRarity(baseRarity);
    }
    
    return baseRarity;
  }
  
  upgradeRarity(currentRarity, levels = 1) {
    const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const currentIndex = rarities.indexOf(currentRarity);
    const newIndex = Math.min(currentIndex + levels, rarities.length - 1);
    return rarities[newIndex];
  }
  
  generatePersonalizedMessage(celebrationType, context) {
    const messages = celebrationType.messages;
    let selectedMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Personalize based on context
    if (context.projectName) {
      selectedMessage = selectedMessage.replace(/your project/gi, `"${context.projectName}"`);
    }
    
    if (context.fileCount) {
      selectedMessage += ` (${context.fileCount} files processed)`;
    }
    
    if (context.duration) {
      const seconds = (context.duration / 1000).toFixed(1);
      selectedMessage += ` Completed in ${seconds}s!`;
    }
    
    return selectedMessage;
  }
  
  selectAnimation(celebrationType, rarity) {
    const availableAnimations = celebrationType.animations;
    const rarityLevel = this.rarityLevels.get(rarity);
    
    // Select animation based on rarity
    let animationName;
    if (rarityLevel.animationIntensity === 'maximum') {
      animationName = 'fireworks'; // Most spectacular
    } else if (rarityLevel.animationIntensity === 'very-high') {
      animationName = 'trophy';
    } else if (rarityLevel.animationIntensity === 'high') {
      animationName = 'rainbow';
    } else {
      animationName = availableAnimations[Math.floor(Math.random() * availableAnimations.length)];
    }
    
    return this.animationPatterns.get(animationName) || this.animationPatterns.get('sparkles');
  }
  
  async checkAchievements(type, context) {
    const earnedAchievements = [];
    
    for (const [achievementId, achievement] of this.achievements) {
      if (this.shouldEarnAchievement(achievementId, achievement, type, context)) {
        earnedAchievements.push(achievement);
      }
    }
    
    return earnedAchievements;
  }
  
  shouldEarnAchievement(achievementId, achievement, type, context) {
    // Check if already earned
    if (context.earnedAchievements && context.earnedAchievements.includes(achievementId)) {
      return false;
    }
    
    // Type-specific achievement logic
    switch (achievementId) {
      case 'first-project':
        return type === 'project-created' && context.isFirstTime;
        
      case 'perfectionist':
        return context.perfectScore === true;
        
      case 'sharer':
        return type === 'first-share';
        
      case 'quality-keeper':
        return type === 'file-validated' && (context.validationCount || 0) >= 10;
        
      default:
        return false;
    }
  }
  
  // === DISPLAY METHODS ===
  
  async displayCelebration(celebration) {
    const rarityLevel = this.rarityLevels.get(celebration.rarity);
    const colorFn = rarityLevel.color;
    
    // Clear screen area for animation
    console.log('\n'.repeat(3));
    
    // Display rarity and type
    console.log(colorFn('═'.repeat(60)));
    console.log(colorFn(`${rarityLevel.prefix} ${celebration.rarity.toUpperCase()} CELEBRATION ${rarityLevel.prefix}`));
    console.log(colorFn('═'.repeat(60)));
    
    // Display animation
    await this.playAnimation(celebration.animation, rarityLevel);
    
    // Display message
    console.log('\n' + colorFn(celebration.message));
    
    // Display achievements
    if (celebration.achievements.length > 0) {
      console.log('\n' + chalk.yellow('🏆 ACHIEVEMENTS UNLOCKED:'));
      celebration.achievements.forEach(achievement => {
        console.log(`${achievement.icon} ${achievement.name}: ${achievement.description}`);
      });
    }
    
    // Sound effect (ASCII)
    if (this.options.enableSoundEffects) {
      this.playASCIISoundEffect(celebration.rarity);
    }
    
    console.log('\n' + colorFn('═'.repeat(60)));
    
    // Brief pause for effect
    await this.sleep(1000);
  }
  
  async playAnimation(animation, rarityLevel) {
    const frames = animation.frames;
    const frameDuration = animation.duration / frames.length;
    const repetitions = this.getAnimationRepetitions(rarityLevel.animationIntensity);
    
    for (let rep = 0; rep < repetitions; rep++) {
      for (const frame of frames) {
        // Move cursor up to overwrite previous frame
        if (rep > 0 || frames.indexOf(frame) > 0) {
          process.stdout.write('\x1B[5A'); // Move up 5 lines
        }
        
        // Display frame
        console.log(rarityLevel.color(frame));
        
        // Wait for next frame
        await this.sleep(frameDuration);
      }
    }
  }
  
  getAnimationRepetitions(intensity) {
    switch (intensity) {
      case 'low': return 1;
      case 'medium': return 2;
      case 'high': return 3;
      case 'very-high': return 4;
      case 'maximum': return 5;
      default: return 1;
    }
  }
  
  playASCIISoundEffect(rarity) {
    const effects = {
      common: '♪ ♫ ♪',
      uncommon: '♪♫♪ ♫♪♫ ♪♫♪',
      rare: '🎵 ♪♫♪♫♪ 🎵',
      epic: '🎶 ♪♫♪♫♪♫♪ 🎶',
      legendary: '🎼 ♪♫♪♫♪♫♪♫♪ 🎼'
    };
    
    console.log('\n' + chalk.cyan(effects[rarity] || effects.common));
  }
  
  showSimpleCelebration(type, context) {
    const celebrationType = this.celebrationTypes.get(type);
    const message = celebrationType ? 
      celebrationType.messages[0] : 
      'Operation completed successfully! 🎉';
    
    console.log('\n' + chalk.green('🎉 ' + message));
    
    return {
      type,
      rarity: 'common',
      message,
      simple: true,
      timestamp: Date.now()
    };
  }
  
  showGenericCelebration(context) {
    const messages = [
      'Great job! Operation completed successfully! 🌟',
      'Excellent work! Everything went perfectly! ✨',
      'Success! Your task has been completed! 🎯',
      'Well done! Mission accomplished! 🚀'
    ];
    
    const message = messages[Math.floor(Math.random() * messages.length)];
    console.log('\n' + chalk.green(message));
    
    return {
      type: 'generic',
      rarity: 'common',
      message,
      generic: true,
      timestamp: Date.now()
    };
  }
  
  // === UTILITY METHODS ===
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  recordCelebration(celebration) {
    this.celebrationHistory.push({
      type: celebration.type,
      rarity: celebration.rarity,
      timestamp: celebration.timestamp,
      achievementsCount: celebration.achievements.length
    });
    
    // Update statistics
    this.celebrationStats.totalCelebrations++;
    
    const typeCount = this.celebrationStats.byType.get(celebration.type) || 0;
    this.celebrationStats.byType.set(celebration.type, typeCount + 1);
    
    const rarityCount = this.celebrationStats.byRarity.get(celebration.rarity) || 0;
    this.celebrationStats.byRarity.set(celebration.rarity, rarityCount + 1);
    
    // Keep history limited
    if (this.celebrationHistory.length > this.options.maxHistorySize) {
      this.celebrationHistory = this.celebrationHistory.slice(-this.options.maxHistorySize);
    }
  }
  
  // === PUBLIC API ===
  
  getCelebrationStats() {
    return {
      total: this.celebrationStats.totalCelebrations,
      byType: Object.fromEntries(this.celebrationStats.byType),
      byRarity: Object.fromEntries(this.celebrationStats.byRarity),
      historySize: this.celebrationHistory.length,
      animationsEnabled: this.options.enableAnimations
    };
  }
  
  getCelebrationHistory(limit = 10) {
    return this.celebrationHistory.slice(-limit);
  }
  
  getAvailableCelebrationTypes() {
    return Array.from(this.celebrationTypes.keys());
  }
  
  printCelebrationReport() {
    const stats = this.getCelebrationStats();
    
    console.log(chalk.blue('\n🎉 Celebration Animation System Report'));
    console.log(chalk.blue('======================================'));
    
    console.log(chalk.cyan('\n📊 Celebration Statistics:'));
    console.log(`Total Celebrations: ${stats.total}`);
    console.log(`Animations Enabled: ${stats.animationsEnabled ? 'Yes' : 'No'}`);
    console.log(`History Size: ${stats.historySize}`);
    
    if (Object.keys(stats.byType).length > 0) {
      console.log(chalk.cyan('\n🎭 Celebration Types:'));
      Object.entries(stats.byType)
        .sort(([, a], [, b]) => b - a)
        .forEach(([type, count]) => {
          const typeInfo = this.celebrationTypes.get(type);
          console.log(`  ${typeInfo ? typeInfo.name : type}: ${count}`);
        });
    }
    
    if (Object.keys(stats.byRarity).length > 0) {
      console.log(chalk.cyan('\n💎 Rarity Distribution:'));
      Object.entries(stats.byRarity)
        .sort(([, a], [, b]) => b - a)
        .forEach(([rarity, count]) => {
          const rarityInfo = this.rarityLevels.get(rarity);
          const icon = rarityInfo ? rarityInfo.prefix : '✨';
          console.log(`  ${icon} ${rarity}: ${count}`);
        });
    }
    
    console.log(chalk.green('\n✅ Celebration report complete'));
  }
  
  dispose() {
    console.log(chalk.yellow('🧹 Disposing Celebration Animation System...'));
    
    this.celebrationHistory = [];
    this.celebrationStats = {
      totalCelebrations: 0,
      byType: new Map(),
      byRarity: new Map()
    };
    this.removeAllListeners();
    
    console.log(chalk.green('✅ Celebration system disposed'));
  }
}

export default CelebrationAnimationSystem;