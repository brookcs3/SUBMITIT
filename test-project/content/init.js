import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';
import { EnhancedYogaLayoutEngine } from '../lib/EnhancedYogaLayoutEngine.js';

export async function initProject(name, options) {
  const projectPath = join(process.cwd(), name);
  
  try {
    console.log(chalk.green('🧘 Initializing new submitit project...'));
    
    // Create project directory
    await mkdir(projectPath, { recursive: true });
    
    // Create subdirectories
    await mkdir(join(projectPath, 'content'), { recursive: true });
    await mkdir(join(projectPath, 'output'), { recursive: true });
    await mkdir(join(projectPath, 'astro'), { recursive: true });
    
    // Initialize Yoga layout engine
    const layoutEngine = new EnhancedYogaLayoutEngine();
    await layoutEngine.initializeEngine();
    
    // Create project configuration
    const config = {
      name,
      theme: options.theme || 'default',
      created: new Date().toISOString(),
      layout: {
        type: 'column',
        children: []
      },
      files: [],
      metadata: {
        title: name,
        description: `${name} - Created with submitit`,
        author: process.env.USER || 'Unknown'
      }
    };
    
    await writeFile(
      join(projectPath, 'submitit.config.json'),
      JSON.stringify(config, null, 2)
    );
    
    // Create layout file
    await writeFile(
      join(projectPath, 'layout.json'),
      JSON.stringify({ layout: config.layout }, null, 2)
    );
    
    console.log(chalk.green('✅ Project initialized successfully!'));
    console.log(chalk.cyan(`📁 Project created at: ${projectPath}`));
    console.log(chalk.yellow('🎯 Next steps:'));
    console.log(chalk.white('  1. cd ' + name));
    console.log(chalk.white('  2. submitit add <files>'));
    console.log(chalk.white('  3. submitit preview'));
    console.log(chalk.white('  4. submitit export'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error initializing project:'), error.message);
    process.exit(1);
  }
}