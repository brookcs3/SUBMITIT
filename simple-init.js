#!/usr/bin/env node

/**
 * Simple, fast init command that actually works
 * No DI container, no 3,381 line layout engines, just basic functionality
 */

import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

export async function simpleInit(name, options = {}) {
  const projectPath = join(process.cwd(), name);
  
  try {
    console.log(chalk.green('🚀 Creating submitit project...'));
    
    // Create project directory structure
    await mkdir(projectPath, { recursive: true });
    await mkdir(join(projectPath, 'content'), { recursive: true });
    await mkdir(join(projectPath, 'output'), { recursive: true });
    
    // Create starter files with actual content
    await writeFile(
      join(projectPath, 'content', 'hero.md'),
      `# ${name}\n\nWelcome to your new submitit project! This is your hero section.\n\n## About\n\nThis project was created to showcase your work in a professional, organized way.\n\n## Next Steps\n\n1. Add your content files\n2. Customize your theme\n3. Build and export your project\n`
    );
    
    await writeFile(
      join(projectPath, 'content', 'bio.md'),
      `# About Me\n\nTell your story here. What makes you unique? What are your achievements?\n\n## Skills\n\n- Add your key skills\n- Highlight your expertise\n- Show your value\n\n## Contact\n\nHow can people reach you?\n`
    );
    
    await writeFile(
      join(projectPath, 'content', 'projects.md'),
      `# My Projects\n\n## Project 1\n\nDescription of your first project. What did you build? What technologies did you use?\n\n## Project 2\n\nAnother great project you've worked on.\n\n## Project 3\n\nYour latest and greatest work.\n`
    );
    
    // Create basic config with starter files
    const config = {
      name,
      theme: options.theme || 'default',
      created: new Date().toISOString(),
      files: [
        { name: 'hero.md', type: 'markdown', role: 'hero' },
        { name: 'bio.md', type: 'markdown', role: 'bio' },
        { name: 'projects.md', type: 'markdown', role: 'projects' }
      ]
    };
    
    await writeFile(
      join(projectPath, 'submitit.config.json'),
      JSON.stringify(config, null, 2)
    );
    
    console.log(chalk.green('✅ Project created!'));
    console.log(chalk.cyan(`📁 ${projectPath}`));
    console.log(chalk.yellow('Next: cd ' + name + ' && submitit add <files>'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error.message);
    process.exit(1);
  }
}

// If run directly
if (process.argv[2]) {
  simpleInit(process.argv[2], { theme: process.argv[3] });
}