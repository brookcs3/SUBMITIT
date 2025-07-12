#!/usr/bin/env node

import { execa } from 'execa';
import chalk from 'chalk';

/**
 * Terminal Text Effects (TTE) Integration
 * Beautiful animations for CLI output
 */

export class TerminalEffects {
  constructor() {
    this.available = false;
    this.effects = [
      'slide', 'wipe', 'decrypt', 'matrix', 'rain', 'fireworks', 
      'stars', 'wave', 'beams', 'orbittingvolley', 'middleout'
    ];
  }

  async checkAvailability() {
    try {
      await execa('tte', ['--version'], { stdio: 'ignore' });
      this.available = true;
      console.log(chalk.green('✨ Terminal Text Effects (tte) available'));
    } catch (error) {
      this.available = false;
      console.log(chalk.yellow('💡 Install tte for beautiful animations: pip install terminaltexteffects'));
    }
    return this.available;
  }

  async animate(text, effect = 'slide', options = {}) {
    if (!this.available) {
      await this.checkAvailability();
      if (!this.available) {
        console.log(text); // Fallback to plain text
        return;
      }
    }

    try {
      // Run tte with the specified effect
      const args = [effect];
      
      // Add common options
      if (options.speed) args.push('--speed', options.speed);
      if (options.color) args.push('--color', options.color);
      
      const process = execa('tte', args, { 
        input: text,
        stdio: ['pipe', 'inherit', 'inherit']
      });
      
      await process;
    } catch (error) {
      console.log(text); // Fallback to plain text
    }
  }

  async slideText(text, options = {}) {
    return this.animate(text, 'slide', options);
  }

  async matrixEffect(text, options = {}) {
    return this.animate(text, 'matrix', options);
  }

  async decryptEffect(text, options = {}) {
    return this.animate(text, 'decrypt', options);
  }

  async fireworksEffect(text, options = {}) {
    return this.animate(text, 'fireworks', options);
  }

  async waveEffect(text, options = {}) {
    return this.animate(text, 'wave', options);
  }

  // Submitit-specific effects
  async submitAnimation() {
    const submitText = `
╭─────────────────────────────────────╮
│                                     │
│          🧘 SUBMITIT READY          │
│                                     │
│    Transform packaging into         │
│    a polished, intentional ritual   │
│                                     │
╰─────────────────────────────────────╯
`;
    await this.slideText(submitText, { speed: 3, color: 'cyan' });
  }

  async workPlatesIntro() {
    const workPlatesText = `
🎨 WORK PLATES
━━━━━━━━━━━━━━━

Interactive terminal canvas
Visual file organization
Drag & drop workflow
`;
    await this.decryptEffect(workPlatesText, { speed: 2 });
  }

  async exportComplete() {
    const exportText = `
📦 EXPORT COMPLETE
━━━━━━━━━━━━━━━━━━

Your deliverable is ready!
Packaged with precision.
`;
    await this.fireworksEffect(exportText);
  }

  async yogaLayoutAnimation() {
    const yogaText = `
⚡ YOGA LAYOUT ENGINE
━━━━━━━━━━━━━━━━━━━━━

Calculating optimal arrangements...
Flexbox precision for terminal UI
Meta's layout engine powers submitit
`;
    await this.matrixEffect(yogaText, { speed: 1 });
  }

  getRandomEffect() {
    return this.effects[Math.floor(Math.random() * this.effects.length)];
  }

  listEffects() {
    console.log(chalk.cyan('Available TTE Effects:'));
    this.effects.forEach(effect => {
      console.log(chalk.gray(`  • ${effect}`));
    });
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const effects = new TerminalEffects();
  
  const command = process.argv[2];
  const text = process.argv.slice(3).join(' ');
  
  switch (command) {
    case 'submit':
      await effects.submitAnimation();
      break;
    case 'workplates':
      await effects.workPlatesIntro();
      break;
    case 'export':
      await effects.exportComplete();
      break;
    case 'yoga':
      await effects.yogaLayoutAnimation();
      break;
    case 'list':
      effects.listEffects();
      break;
    default:
      if (command && text) {
        await effects.animate(text, command);
      } else {
        console.log(chalk.yellow('Usage: node terminal-effects.js <effect> <text>'));
        console.log(chalk.yellow('   or: node terminal-effects.js <preset>'));
        console.log(chalk.gray('Presets: submit, workplates, export, yoga, list'));
      }
  }
}