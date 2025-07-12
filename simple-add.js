#!/usr/bin/env node

/**
 * Simple add command that actually works
 * No DI container, no complex role detection, just copy files
 */

import { copyFile, readFile, writeFile } from 'fs/promises';
import { join, basename, extname } from 'path';
import chalk from 'chalk';

export async function simpleAdd(files, options = {}) {
  try {
    console.log(chalk.green('📁 Adding files...'));
    
    // Check if we're in a submitit project
    const configPath = join(process.cwd(), 'submitit.config.json');
    let config;
    
    try {
      const configData = await readFile(configPath, 'utf8');
      config = JSON.parse(configData);
    } catch (error) {
      console.error(chalk.red('❌ Not in a submitit project. Run submitit init first.'));
      process.exit(1);
    }
    
    // Add each file
    for (const file of files) {
      const filename = basename(file);
      const destPath = join(process.cwd(), 'content', filename);
      
      try {
        await copyFile(file, destPath);
        
        // Simple role detection based on filename
        let role = options.role || detectRole(filename);
        let type = detectType(filename);
        
        // Add to config
        config.files.push({
          name: filename,
          type: type,
          role: role
        });
        
        console.log(chalk.green(`✅ Added ${filename} (${role})`));
        
      } catch (error) {
        console.error(chalk.red(`❌ Failed to add ${filename}:`, error.message));
      }
    }
    
    // Save updated config
    await writeFile(configPath, JSON.stringify(config, null, 2));
    
    console.log(chalk.cyan(`📋 Added ${files.length} files to project`));
    
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error.message);
    process.exit(1);
  }
}

function detectRole(filename) {
  const name = filename.toLowerCase();
  
  if (name.includes('hero') || name.includes('main') || name.includes('index')) return 'hero';
  if (name.includes('bio') || name.includes('about') || name.includes('me')) return 'bio';
  if (name.includes('project') || name.includes('work') || name.includes('portfolio')) return 'projects';
  if (name.includes('contact') || name.includes('reach')) return 'contact';
  if (name.includes('resume') || name.includes('cv')) return 'resume';
  if (name.includes('gallery') || name.includes('image') || name.includes('photo')) return 'gallery';
  
  return 'content';
}

function detectType(filename) {
  const ext = extname(filename).toLowerCase();
  
  if (['.md', '.markdown'].includes(ext)) return 'markdown';
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return 'image';
  if (['.pdf'].includes(ext)) return 'document';
  if (['.html', '.htm'].includes(ext)) return 'html';
  if (['.txt'].includes(ext)) return 'text';
  
  return 'file';
}

// If run directly
if (process.argv.length > 2) {
  const files = process.argv.slice(2);
  simpleAdd(files);
}