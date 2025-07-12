#!/usr/bin/env node

/**
 * Working CLI - bypasses the broken DI system and uses our simple commands
 */

import { program } from 'commander';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Import our working commands
import { simpleInit } from './simple-init.js';
import { simpleAdd } from './simple-add.js';
import { simpleTheme } from './simple-theme.js';
import { simpleBuild } from './simple-build.js';
import { simplePreview } from './simple-preview.js';
import { simpleExport } from './simple-export.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(
  readFileSync(join(__dirname, 'package.json'), 'utf8')
);

// Configure CLI
program
  .name('submitit')
  .description('🧘 Transform deliverable packaging into a polished, intentional ritual')
  .version(packageJson.version);

// Init command
program
  .command('init')
  .description('Initialize a new submitit project')
  .argument('<name>', 'Project name')
  .option('-t, --theme <theme>', 'Set initial theme', 'default')
  .action(async (name, options) => {
    await simpleInit(name, options);
  });

// Add command  
program
  .command('add')
  .description('Add content to your project')
  .argument('<files...>', 'Files to add')
  .option('--role <role>', 'Content role (hero, bio, resume, etc.)')
  .action(async (files, options) => {
    await simpleAdd(files, options);
  });

// Theme command
program
  .command('theme')
  .description('Set project theme')
  .argument('<theme>', 'Theme name (default, neon, crt, academic, noir, brutalist, modern)')
  .option('-p, --preview', 'Show theme preview')
  .action(async (theme, options) => {
    await simpleTheme(theme, options);
  });

// Build command
program
  .command('build')
  .description('Build your project')
  .action(async () => {
    await simpleBuild();
  });

// Preview command
program
  .command('preview')
  .description('Preview your project')
  .option('-p, --port <port>', 'Port number', '3000')
  .action(async (options) => {
    await simplePreview({ port: parseInt(options.port) });
  });

// Export command
program
  .command('export')
  .description('Export your project as a packaged deliverable')
  .option('-n, --name <name>', 'Custom export name')
  .action(async (options) => {
    await simpleExport(options);
  });

// List themes command
program
  .command('themes')
  .description('List available themes')
  .action(() => {
    console.log(chalk.green('🎨 Available themes:'));
    const themes = ['default', 'neon', 'crt', 'academic', 'noir', 'brutalist', 'modern'];
    themes.forEach(theme => {
      console.log(chalk.cyan(`  ${theme}`));
    });
  });

// Demo command (shows what the tool can do)
program
  .command('demo')
  .description('Run a quick demo of submitit features')
  .action(async () => {
    console.log(chalk.green('🚀 Submitit Demo'));
    console.log(chalk.white('This will create a demo project and show all features:'));
    console.log('');
    
    // Create demo project
    console.log(chalk.blue('1. Creating demo project...'));
    await simpleInit('submitit-demo');
    
    console.log(chalk.blue('2. Switching to neon theme...'));
    process.chdir('submitit-demo');
    await simpleTheme('neon');
    
    console.log(chalk.blue('3. Building project...'));
    await simpleBuild();
    
    console.log(chalk.blue('4. Exporting project...'));
    await simpleExport({ name: 'demo-export' });
    
    console.log(chalk.green('\n✅ Demo complete!'));
    console.log(chalk.yellow('📁 Check the submitit-demo/ directory'));
    console.log(chalk.yellow('🌐 Run: cd submitit-demo && submitit preview'));
  });

// Error handling
program.configureOutput({
  writeErr: (str) => process.stdout.write(chalk.red(str))
});

program.exitOverride();

try {
  program.parse();
} catch (err) {
  if (err.code === 'commander.help') {
    process.exit(0);
  }
  console.error(chalk.red('Error:'), err.message);
  process.exit(1);
}