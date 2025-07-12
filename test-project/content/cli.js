#!/usr/bin/env node

import { program } from 'commander';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { SimpleInkApp } from './components/SimpleInkApp.js';
import { initProject } from './commands/init.js';
import { addContent } from './commands/add.js';
import { preview } from './commands/preview.js';
import { exportProject } from './commands/export.js';
import { workplates } from './commands/workplates.js';
import { postcard } from './commands/postcard.js';
import { setTheme } from './commands/theme.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8')
);

program
  .name('submitit')
  .description('🧘 Transform deliverable packaging into a polished, intentional ritual')
  .version(packageJson.version);

// Initialize a new project
program
  .command('init')
  .description('Initialize a new submitit project')
  .argument('<name>', 'Project name')
  .option('-t, --theme <theme>', 'Set initial theme', 'default')
  .action(async (name, options) => {
    await initProject(name, options);
  });

// Add content to project
program
  .command('add')
  .description('Add content to your project')
  .argument('<files...>', 'Files to add')
  .option('--as <type>', 'Content type (gallery, document, about, etc.)')
  .option('--role <role>', 'Content role (hero, bio, resume, etc.)')
  .action(async (files, options) => {
    await addContent(files, options);
  });

// Set project theme
program
  .command('theme')
  .description('Set project theme')
  .argument('<theme>', 'Theme name (noir, academic, brutalist, modern)')
  .action(async (theme) => {
    await setTheme(theme);
  });

// Preview project
program
  .command('preview')
  .description('Preview your project')
  .option('--ascii', 'Use ASCII preview mode (browsh)')
  .option('--port <port>', 'Preview port', '4321')
  .action(async (options) => {
    await preview(options);
  });

// Export project
program
  .command('export')
  .description('Export your project as a packaged deliverable')
  .option('-o, --output <path>', 'Output path')
  .option('--format <format>', 'Output format (zip, tar, rar, iso, 7z)', 'zip')
  .option('--name <pattern>', 'Custom naming pattern (e.g., "{name}_{date}", "delivery_{name}_{theme}")')
  .action(async (options) => {
    await exportProject(options);
  });

// Work Plates - Interactive canvas
program
  .command('workplates')
  .description('Launch interactive Work Plates canvas')
  .action(async (options) => {
    await workplates(options);
  });

// Post Card - Generate deliverable
program
  .command('postcard')
  .description('Generate a polished post card deliverable')
  .option('-o, --output <path>', 'Output directory')
  .option('--format <format>', 'Output format (html, png, pdf)', 'html')
  .option('--compact', 'Generate compact size (400x250px)')
  .option('--all', 'Generate all variations')
  .action(async (options) => {
    await postcard(options);
  });

// Interactive mode (default)
program
  .command('interactive', { isDefault: true })
  .description('Launch interactive mode')
  .action(async () => {
    // Import and render the Ink app
    const { render } = await import('ink');
    const { default: React } = await import('react');
    
    render(React.createElement(SimpleInkApp));
  });

// Error handling
program.exitOverride();

try {
  await program.parseAsync(process.argv);
} catch (error) {
  if (error.code === 'commander.helpDisplayed') {
    process.exit(0);
  } else if (error.code === 'commander.unknownCommand') {
    console.error('❌ Unknown command. Run "submitit --help" for usage.');
    process.exit(1);
  } else {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}