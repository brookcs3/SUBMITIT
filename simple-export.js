#!/usr/bin/env node

/**
 * Simple export command that actually works
 * Generate a zip file with the built project
 */

import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join, basename } from 'path';
import { createWriteStream } from 'fs';
import archiver from 'archiver';
import chalk from 'chalk';

export async function simpleExport(options = {}) {
  try {
    console.log(chalk.green('📦 Exporting project...'));
    
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
    
    // Check if build exists
    try {
      await stat(join(process.cwd(), 'output', 'index.html'));
    } catch (error) {
      console.error(chalk.red('❌ No build found. Run build command first.'));
      process.exit(1);
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputName = options.name || `${config.name}_${timestamp}`;
    const outputPath = join(process.cwd(), 'output', `${outputName}.zip`);
    
    console.log(chalk.blue('📁 Creating archive...'));
    
    // Create archive
    const output = createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    return new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log(chalk.green('✅ Export complete!'));
        console.log(chalk.cyan(`📦 Archive: ${outputPath}`));
        console.log(chalk.cyan(`📊 Size: ${formatBytes(archive.pointer())}`));
        console.log(chalk.cyan(`🎨 Theme: ${config.theme}`));
        console.log(chalk.cyan(`📄 Files: ${config.files.length}`));
        
        resolve({
          path: outputPath,
          size: archive.pointer(),
          files: config.files.length
        });
      });
      
      archive.on('error', reject);
      
      archive.pipe(output);
      
      // Add the built website
      archive.directory('output/', false);
      
      // Add source content
      archive.directory('content/', 'source/');
      
      // Add config
      archive.file('submitit.config.json', { name: 'project-config.json' });
      
      // Add manifest
      const manifest = {
        project: config.name,
        theme: config.theme,
        exported: new Date().toISOString(),
        files: config.files,
        exportedBy: 'submitit-cli',
        version: '1.0.0'
      };
      
      archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });
      
      console.log(chalk.yellow('📝 Adding files to archive...'));
      archive.finalize();
    });
    
  } catch (error) {
    console.error(chalk.red('❌ Export error:'), error.message);
    process.exit(1);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// If run directly
if (process.argv[2] === 'export') {
  simpleExport({ name: process.argv[3] });
}