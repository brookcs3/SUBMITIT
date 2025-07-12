#!/usr/bin/env node

import { program } from 'commander';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { configureServices } from './config/serviceRegistration.js';
import chalk from 'chalk';

// Command implementations (updated to use DI container)
import { createInitCommand } from './commands/init.js';
import { createAddCommand } from './commands/add.js';
import { createPreviewCommand } from './commands/preview.js';
import { createExportCommand } from './commands/export.js';
import { createWorkplatesCommand } from './commands/workplates.js';
import { createPostcardCommand } from './commands/postcard.js';
import { createThemeCommand } from './commands/theme.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8')
);

// Global DI container
let container = null;
let isInitialized = false;

/**
 * Initialize the DI container and services
 */
async function initializeContainer() {
  if (isInitialized) return container;
  
  try {
    console.log(chalk.blue('🏗️  Initializing submitit services...'));
    
    container = configureServices({
      enableLifecycleManagement: true,
      enableDependencyValidation: true,
      enableCircularDependencyDetection: true,
      strictMode: process.env.NODE_ENV !== 'test'
    });
    
    await container.initialize();
    isInitialized = true;
    
    console.log(chalk.green('✅ Services initialized successfully'));
    return container;
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to initialize services:'), error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Shutdown the container gracefully
 */
async function shutdownContainer() {
  if (container && isInitialized) {
    try {
      console.log(chalk.yellow('🔄 Shutting down services...'));
      await container.shutdown();
      console.log(chalk.green('✅ Services shutdown complete'));
    } catch (error) {
      console.error(chalk.red('❌ Error during shutdown:'), error.message);
    }
  }
}

/**
 * Wrapper for command actions that ensures container initialization
 */
function withContainer(commandFactory) {
  return async (...args) => {
    const container = await initializeContainer();
    const command = commandFactory(container);
    return await command(...args);
  };
}

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
  .action(withContainer(createInitCommand));

// Add content to project
program
  .command('add')
  .description('Add content to your project')
  .argument('<files...>', 'Files to add')
  .option('--as <type>', 'Content type (gallery, document, about, etc.)')
  .option('--role <role>', 'Content role (hero, bio, resume, etc.)')
  .action(withContainer(createAddCommand));

// Set project theme
program
  .command('theme')
  .description('Set project theme')
  .argument('<theme>', 'Theme name (noir, academic, brutalist, modern)')
  .action(withContainer(createThemeCommand));

// Preview project
program
  .command('preview')
  .description('Preview your project')
  .option('--ascii', 'Use ASCII preview mode (browsh)')
  .option('--port <port>', 'Preview port', '4321')
  .option('--theme <theme>', 'Preview with specific theme')
  .option('--interactive', 'Enable interactive theme switching')
  .action(withContainer(createPreviewCommand));

// Export project
program
  .command('export')
  .description('Export your project as a packaged deliverable')
  .option('-o, --output <path>', 'Output path')
  .option('--format <format>', 'Output format (zip, tar, rar, iso, 7z)', 'zip')
  .option('--name <pattern>', 'Custom naming pattern (e.g., "{name}_{date}", "delivery_{name}_{theme}")')
  .option('--streaming', 'Use streaming export for large projects')
  .action(withContainer(createExportCommand));

// Work Plates - Interactive canvas
program
  .command('workplates')
  .description('Launch interactive Work Plates canvas')
  .option('--enhanced', 'Enable enhanced UI features')
  .option('--debug-layout', 'Show Yoga layout debug information')
  .action(withContainer(createWorkplatesCommand));

// Post Card - Generate deliverable
program
  .command('postcard')
  .description('Generate a polished post card deliverable')
  .option('-o, --output <path>', 'Output directory')
  .option('--format <format>', 'Output format (html, png, pdf)', 'html')
  .option('--compact', 'Generate compact size (400x250px)')
  .option('--all', 'Generate all variations')
  .option('--theme <theme>', 'Use specific theme for postcard')
  .action(withContainer(createPostcardCommand));

// Interactive mode (default)
program
  .command('interactive', { isDefault: true })
  .description('Launch interactive mode')
  .option('--enhanced', 'Use enhanced UI with animations')
  .action(async (options) => {
    await initializeContainer();
    
    if (options.enhanced) {
      console.log(chalk.blue('🎼 Enhanced mode coming soon! For now, enjoy the advanced components demo:'));
      console.log(chalk.cyan('Run: submitit demo\n'));
      return;
    }
    
    try {
      // Import and render the Ink app with DI container context
      const { render } = await import('ink');
      const { default: React } = await import('react');
      const { SimpleInkApp } = await import('./components/SimpleInkApp.js');
      
      // Create app with container context
      const app = React.createElement(SimpleInkApp, { container });
      
      console.log(chalk.blue('🚀 Starting submitit interactive mode...'));
      console.log(chalk.gray('Press Ctrl+C to exit\n'));
      
      render(app);
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to start interactive mode:'), error.message);
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Advanced components demo
program
  .command('demo')
  .description('Launch advanced components demo')
  .option('--stats', 'Show container statistics')
  .action(async (options) => {
    console.log(chalk.blue('🎼 Starting submitit Advanced Components Demo...\n'));
    console.log(chalk.gray('Watch the components animate and respond in real-time...\n'));
    
    const container = await initializeContainer();
    
    if (options.stats) {
      console.log(chalk.cyan('📊 Container Statistics:'));
      container.printStatus();
      console.log('');
    }
    
    // Import the working basic demo
    const { execSync } = await import('child_process');
    try {
      execSync('node basic-demo.js', { stdio: 'inherit', cwd: process.cwd() });
    } catch (error) {
      console.error(chalk.red('❌ Demo failed:'), error.message);
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
    }
  });

// Status command - show container and service status
program
  .command('status')
  .description('Show submitit service status and statistics')
  .action(async () => {
    const container = await initializeContainer();
    
    console.log(chalk.blue('\n📊 Submitit Service Status'));
    console.log(chalk.blue('=========================='));
    
    container.printStatus();
    
    const stats = container.getStats();
    const dependencyGraph = container.getDependencyGraph();
    
    console.log(chalk.cyan('\n🔗 Service Dependencies:'));
    Object.entries(dependencyGraph).forEach(([service, deps]) => {
      console.log(`  ${service} → ${deps.join(', ') || 'none'}`);
    });
    
    console.log(chalk.green('\n✅ All services operational'));
  });

// Error handling
program.exitOverride();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n🔄 Received shutdown signal...'));
  await shutdownContainer();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log(chalk.yellow('\n🔄 Received termination signal...'));
  await shutdownContainer();
  process.exit(0);
});

process.on('uncaughtException', async (error) => {
  console.error(chalk.red('\n💥 Uncaught exception:'), error.message);
  if (process.env.DEBUG) {
    console.error(error.stack);
  }
  await shutdownContainer();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error(chalk.red('\n💥 Unhandled rejection at:'), promise, chalk.red('reason:'), reason);
  if (process.env.DEBUG) {
    console.error(reason.stack);
  }
  await shutdownContainer();
  process.exit(1);
});

// Main execution
try {
  await program.parseAsync(process.argv);
} catch (error) {
  if (error.code === 'commander.helpDisplayed') {
    process.exit(0);
  } else if (error.code === 'commander.unknownCommand') {
    console.error(chalk.red('❌ Unknown command. Run "submitit --help" for usage.'));
    await shutdownContainer();
    process.exit(1);
  } else {
    console.error(chalk.red('❌ Error:'), error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    await shutdownContainer();
    process.exit(1);
  }
} finally {
  // Ensure cleanup on normal exit
  if (isInitialized) {
    await shutdownContainer();
  }
}