#!/usr/bin/env node

/**
 * Simple theme command that actually works
 * No sophisticated theme system, just change a value in config.json
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

const THEMES = ['default', 'neon', 'crt', 'academic', 'noir', 'brutalist', 'modern'];

export async function simpleTheme(themeName, options = {}) {
  try {
    console.log(chalk.green('🎨 Setting theme...'));
    
    // Validate theme
    if (!THEMES.includes(themeName)) {
      console.error(chalk.red(`❌ Unknown theme: ${themeName}`));
      console.log(chalk.yellow('Available themes:'));
      THEMES.forEach(theme => console.log(chalk.white(`  - ${theme}`)));
      process.exit(1);
    }
    
    // Read config
    const configPath = join(process.cwd(), 'submitit.config.json');
    let config;
    
    try {
      const configData = await readFile(configPath, 'utf8');
      config = JSON.parse(configData);
    } catch (error) {
      console.error(chalk.red('❌ Not in a submitit project. Run submitit init first.'));
      process.exit(1);
    }
    
    const oldTheme = config.theme;
    config.theme = themeName;
    
    // Save config
    await writeFile(configPath, JSON.stringify(config, null, 2));
    
    console.log(chalk.green('✅ Theme updated!'));
    console.log(chalk.cyan(`📋 Project: ${config.name}`));
    console.log(chalk.cyan(`🎨 Theme: ${oldTheme} → ${themeName}`));
    
    if (options.preview) {
      showThemePreview(themeName);
    } else {
      console.log(chalk.yellow('💡 Run build command to see theme changes'));
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Theme error:'), error.message);
    process.exit(1);
  }
}

function showThemePreview(themeName) {
  console.log(chalk.white(`\n🎨 ${themeName.toUpperCase()} Theme Preview:`));
  
  const previews = {
    default: () => {
      console.log(chalk.blue('┌─────────────────────────┐'));
      console.log(chalk.blue('│') + chalk.black(' Clean & Professional   ') + chalk.blue('│'));
      console.log(chalk.blue('│') + chalk.gray(' System fonts, readable ') + chalk.blue('│'));
      console.log(chalk.blue('└─────────────────────────┘'));
    },
    neon: () => {
      console.log(chalk.hex('#6aa9ff')('┌─────────────────────────┐'));
      console.log(chalk.hex('#6aa9ff')('│') + chalk.hex('#8fbfff')(' Retro-Futuristic Neon  ') + chalk.hex('#6aa9ff')('│'));
      console.log(chalk.hex('#6aa9ff')('│') + chalk.hex('#4d7dff')(' Glowing terminal vibes ') + chalk.hex('#6aa9ff')('│'));
      console.log(chalk.hex('#6aa9ff')('└─────────────────────────┘'));
    },
    crt: () => {
      console.log(chalk.hex('#00ff41')('┌─────────────────────────┐'));
      console.log(chalk.hex('#00ff41')('│') + chalk.hex('#35ff6d')(' Classic Terminal CRT   ') + chalk.hex('#00ff41')('│'));
      console.log(chalk.hex('#00ff41')('│') + chalk.green(' Monospace green glow   ') + chalk.hex('#00ff41')('│'));
      console.log(chalk.hex('#00ff41')('└─────────────────────────┘'));
    },
    academic: () => {
      console.log(chalk.blue('┌─────────────────────────┐'));
      console.log(chalk.blue('│') + chalk.black(' Professional Academic  ') + chalk.blue('│'));
      console.log(chalk.blue('│') + chalk.gray(' Serif fonts, formal    ') + chalk.blue('│'));
      console.log(chalk.blue('└─────────────────────────┘'));
    },
    noir: () => {
      console.log(chalk.white('┌─────────────────────────┐'));
      console.log(chalk.white('│') + chalk.black(' Dark & Sophisticated   ') + chalk.white('│'));
      console.log(chalk.white('│') + chalk.gray(' High contrast, elegant ') + chalk.white('│'));
      console.log(chalk.white('└─────────────────────────┘'));
    },
    brutalist: () => {
      console.log(chalk.red('┌─────────────────────────┐'));
      console.log(chalk.red('│') + chalk.black(' Bold & Geometric       ') + chalk.red('│'));
      console.log(chalk.red('│') + chalk.white(' Strong typography      ') + chalk.red('│'));
      console.log(chalk.red('└─────────────────────────┘'));
    },
    modern: () => {
      console.log(chalk.cyan('┌─────────────────────────┐'));
      console.log(chalk.cyan('│') + chalk.white(' Clean Minimalist       ') + chalk.cyan('│'));
      console.log(chalk.cyan('│') + chalk.gray(' Subtle gradients       ') + chalk.cyan('│'));
      console.log(chalk.cyan('└─────────────────────────┘'));
    }
  };
  
  previews[themeName]();
  console.log('');
}

// If run directly
if (process.argv[2] && THEMES.includes(process.argv[2])) {
  simpleTheme(process.argv[2], { preview: process.argv[3] === '--preview' });
} else if (process.argv[2] === 'list') {
  console.log(chalk.green('🎨 Available themes:'));
  THEMES.forEach(theme => {
    console.log(chalk.cyan(`  ${theme}`));
    showThemePreview(theme);
  });
}