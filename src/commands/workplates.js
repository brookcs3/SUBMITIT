import { readFile } from 'fs/promises';
import { join } from 'path';
import { render } from 'ink';
import React from 'react';
import chalk from 'chalk';
// import App from '../ui/App.js'; // Disabled due to JSX compatibility

export function createWorkplatesCommand(program) {
  program
    .command('workplates')
    .description('Launch interactive Work Plates (4-pane viewer)')
    .option('-d, --debug-layout', 'Enable layout debugging')
    .action((options) => {
      workplates(options);
    });
}

export async function workplates(options) {
  try {
    console.log(chalk.green('🎨 Launching Work Plates...'));
    if (options.debugLayout) {
      console.log(chalk.yellow('🔍 Debug layout mode enabled'));
    }
    
    // Check if we're in a submitit project
    const configPath = join(process.cwd(), 'submitit.config.json');
    let config;
    
    try {
      const configData = await readFile(configPath, 'utf8');
      config = JSON.parse(configData);
    } catch (error) {
      console.warn(chalk.yellow('⚠️ No project config found, using defaults'));
      config = { name: 'Default Project' };
    }
    
    // Launch the interactive Work Plates interface
    console.log(chalk.red('❌ Work Plates temporarily disabled due to JSX compatibility issues'));
    console.log(chalk.yellow('💡 Use `submitit demo` for a working demonstration'));
    return;
    
    // const { waitUntilExit } = render(
    //   React.createElement(App, {
    //     debugLayout: options.debugLayout,
    //     enhanced: options.enhanced,
    //     config: config
    //   })
    // );
    
    // await waitUntilExit();
    
  } catch (error) {
    console.error(chalk.red('❌ Error launching Work Plates:'), error.message);
    process.exit(1);
  }
}

