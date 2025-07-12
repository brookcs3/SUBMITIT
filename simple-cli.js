#!/usr/bin/env node

/**
 * Simple Submitit CLI - Working version using our implemented modules
 */
import { program } from 'commander';
import chalk from 'chalk';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Import our implemented modules
import { addContent } from './src/commands/add.js';
import { preview } from './src/commands/preview.js';
import { buildCommand } from './src/commands/build.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(
  await readFile(join(__dirname, 'package.json'), 'utf8')
);

// CLI header
console.log(chalk.hex('#8fbfff').bold('\n╔══════════════════════════════════════╗'));
console.log(chalk.hex('#8fbfff').bold('║        SUBMITIT CLI                  ║'));
console.log(chalk.hex('#8fbfff').bold('║    Retro-Futuristic Portfolio Tool   ║'));
console.log(chalk.hex('#8fbfff').bold('╚══════════════════════════════════════╝'));

program
  .name('submitit')
  .description('🧘 Transform deliverable packaging into a polished, intentional ritual')
  .version(packageJson.version);

// Add content command
program
  .command('add')
  .description('Add content to your project')
  .argument('<files...>', 'Files to add')
  .option('--role <role>', 'Content role (hero, bio, resume, etc.)')
  .option('--preview', 'Generate preview after adding')
  .option('--open', 'Open preview in browser')
  .option('--verbose', 'Show detailed processing info')
  .option('--debug', 'Show debug information')
  .action(async (files, options) => {
    try {
      console.log(chalk.blue('\n🚀 Submitit Add Command\n'));
      await addContent(files, options);
    } catch (error) {
      console.error(chalk.red('❌ Add command failed:'), error.message);
      if (options.debug) console.error(error.stack);
      process.exit(1);
    }
  });

// Preview command
program
  .command('preview')
  .description('Preview your project')
  .option('--ascii', 'Use ASCII preview mode (browsh)')
  .option('--terminal', 'Use terminal preview mode')
  .option('--theme <theme>', 'Preview with specific theme')
  .option('--mode <mode>', 'Layout mode (desktop, mobile, terminal)')
  .option('--open', 'Open preview in browser')
  .option('--debug', 'Show debug information')
  .action(async (options) => {
    try {
      console.log(chalk.blue('\n🎭 Submitit Preview Command\n'));
      await preview(options);
    } catch (error) {
      console.error(chalk.red('❌ Preview command failed:'), error.message);
      if (options.debug) console.error(error.stack);
      process.exit(1);
    }
  });

// Build command
program
  .command('build')
  .description('Build project with incremental optimization')
  .option('-o, --output-dir <dir>', 'Output directory', './dist')
  .option('--streaming', 'Use streaming for large files')
  .option('--compress', 'Compress output files')
  .option('--debug', 'Show debug information')
  .option('--debug-layout', 'Show Yoga layout debug')
  .option('--debug-build', 'Show dependency graph and cache stats')
  .option('--debug-cache', 'Show cache debug information')
  .action(async (options) => {
    try {
      console.log(chalk.blue('\n🏗️ Submitit Build Command\n'));
      await buildCommand(options);
    } catch (error) {
      console.error(chalk.red('❌ Build command failed:'), error.message);
      if (options.debug) console.error(error.stack);
      process.exit(1);
    }
  });

// Demo command
program
  .command('demo')
  .description('Show visual demo of submitit styling')
  .action(async () => {
    try {
      console.log(chalk.blue('\n🎨 Running Submitit Demo\n'));
      const { execSync } = await import('child_process');
      execSync('node demo.js', { stdio: 'inherit' });
    } catch (error) {
      console.error(chalk.red('❌ Demo failed:'), error.message);
      process.exit(1);
    }
  });

// Performance test command
program
  .command('perf-test')
  .description('Run performance tests')
  .option('--save', 'Save results to file')
  .action(async (options) => {
    try {
      console.log(chalk.blue('\n⚡ Running Performance Tests\n'));
      const { default: PerformanceTest } = await import('./src/tests/PerformanceTest.js');
      const test = new PerformanceTest();
      const results = await test.runAll();
      
      if (options.save) {
        await test.saveResults();
      }
      
      console.log(chalk.green('\n🏁 Performance tests completed!'));
    } catch (error) {
      console.error(chalk.red('❌ Performance test failed:'), error.message);
      process.exit(1);
    }
  });

// Layout test command
program
  .command('layout-test')
  .description('Run layout render tests')
  .option('--save', 'Save results to file')
  .action(async (options) => {
    try {
      console.log(chalk.blue('\n🎨 Running Layout Render Tests\n'));
      const { default: LayoutRenderTest } = await import('./src/tests/LayoutRenderTest.js');
      const test = new LayoutRenderTest();
      const results = await test.runAll();
      
      if (options.save) {
        await test.saveResults();
      }
      
      if (results.summary.failed === 0) {
        console.log(chalk.green('\n🏁 All layout tests passed!'));
      } else {
        console.log(chalk.yellow(`\n⚠️ ${results.summary.failed} layout tests failed`));
      }
    } catch (error) {
      console.error(chalk.red('❌ Layout test failed:'), error.message);
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Show project status')
  .action(async () => {
    try {
      console.log(chalk.blue('\n📊 Submitit Status\n'));
      
      // Check if we're in a project
      try {
        const config = JSON.parse(await readFile('submitit.config.json', 'utf8'));
        console.log(chalk.green('✅ In a Submitit project'));
        console.log(chalk.cyan(`📋 Project: ${config.name}`));
        console.log(chalk.cyan(`🎨 Theme: ${config.theme}`));
        console.log(chalk.cyan(`📁 Files: ${config.files?.length || 0}`));
      } catch (error) {
        console.log(chalk.yellow('⚠️ Not in a Submitit project directory'));
        console.log(chalk.gray('💡 Run "submitit-demo init <name>" to create one'));
      }
      
      console.log(chalk.green('\n🔧 Available commands:'));
      console.log(chalk.gray('  add       - Add files with role detection'));
      console.log(chalk.gray('  preview   - Live preview with hot reload'));
      console.log(chalk.gray('  build     - Build with incremental optimization'));
      console.log(chalk.gray('  demo      - Visual styling demonstration'));
      console.log(chalk.gray('  perf-test - Performance benchmarks'));
      console.log(chalk.gray('  layout-test - Layout render validation'));
      
    } catch (error) {
      console.error(chalk.red('❌ Status check failed:'), error.message);
      process.exit(1);
    }
  });

// Init command (simplified version)
program
  .command('init')
  .description('Initialize a new submitit project')
  .argument('<name>', 'Project name')
  .option('-t, --theme <theme>', 'Initial theme', 'neon')
  .action(async (name, options) => {
    try {
      console.log(chalk.blue(`\n🏗️ Creating Submitit project: ${name}\n`));
      
      const { mkdir, writeFile } = await import('fs/promises');
      
      // Create directories
      await mkdir(name, { recursive: true });
      await mkdir(join(name, 'content'), { recursive: true });
      
      // Create config
      const config = {
        name,
        version: "1.0.0",
        theme: options.theme,
        layout: {
          width: 80,
          responsive: true
        },
        files: []
      };
      
      await writeFile(join(name, 'submitit.config.json'), JSON.stringify(config, null, 2));
      
      // Create sample content
      const sampleContent = `---
title: Welcome to ${name}
role: hero
---

# Welcome to ${name}

This is your new Submitit project!

**Features:**
- 🎨 Retro-futuristic themes
- ⚡ Ninja-style incremental builds
- 🎭 Smart role detection
- 🌐 Live preview with hot reload

Ready to add some content? Try:
\`\`\`
submitit add your-file.md
submitit preview
\`\`\``;

      await writeFile(join(name, 'content', 'hero.md'), sampleContent);
      
      console.log(chalk.green('✅ Project created successfully!'));
      console.log(chalk.cyan(`📂 Directory: ${name}`));
      console.log(chalk.cyan(`🎨 Theme: ${options.theme}`));
      console.log(chalk.cyan('📄 Sample content added'));
      
      console.log(chalk.yellow('\n💡 Next steps:'));
      console.log(chalk.gray(`  cd ${name}`));
      console.log(chalk.gray('  submitit-demo preview'));
      
    } catch (error) {
      console.error(chalk.red('❌ Init failed:'), error.message);
      process.exit(1);
    }
  });

// Error handling
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n🔄 Gracefully shutting down...'));
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('\n💥 Uncaught exception:'), error.message);
  process.exit(1);
});

// Parse arguments
try {
  await program.parseAsync(process.argv);
} catch (error) {
  console.error(chalk.red('❌ CLI Error:'), error.message);
  process.exit(1);
}