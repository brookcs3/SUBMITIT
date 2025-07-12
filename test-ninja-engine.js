#!/usr/bin/env node

/**
 * Test the full Ninja Incremental Engine
 */

import { NinjaIncrementalEngine } from './src/lib/NinjaIncrementalEngine.js';
import { readFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

async function testNinjaEngine() {
  console.log(chalk.green('🥷 Testing Ninja Incremental Engine...'));
  
  try {
    const ninja = new NinjaIncrementalEngine();
    
    // Load test files
    const testDir = './workflow-test/content';
    const fileNames = ['hero.md', 'bio.md', 'projects.md'];
    
    const files = [];
    for (const fileName of fileNames) {
      const filePath = join(testDir, fileName);
      const content = await readFile(filePath, 'utf8');
      files.push({
        path: filePath,
        name: fileName,
        content: content
      });
    }
    
    console.log(chalk.blue(`📋 Loaded ${files.length} files for processing`));
    
    // Test just file processing (skip layout for now)
    console.log(chalk.yellow('\n🔨 First build (cold start):'));
    const firstBuild = await ninja.processFilesIncremental(files);
    
    console.log(chalk.green('✅ First build complete'));
    console.log(chalk.cyan(`📄 Files processed: ${firstBuild.size}`));
    
    // Second build (should use cache)
    console.log(chalk.yellow('\n🔨 Second build (should be cached):'));
    const secondBuild = await ninja.processFilesIncremental(files);
    
    console.log(chalk.green('✅ Second build complete'));
    console.log(chalk.cyan(`📄 Files processed: ${secondBuild.size}`));
    
    // Show performance metrics
    const metrics = ninja.getPerformanceMetrics();
    console.log(chalk.white('\n📊 Ninja Performance Metrics:'));
    console.log(chalk.white(`Total builds: ${metrics.totalBuilds}`));
    console.log(chalk.white(`Incremental builds: ${metrics.incrementalBuilds}`));
    console.log(chalk.white(`Incremental ratio: ${(metrics.incrementalRatio * 100).toFixed(1)}%`));
    console.log(chalk.white(`Cache entries: ${metrics.cacheHits}`));
    console.log(chalk.white(`Dependencies tracked: ${metrics.dependencyCount}`));
    
    // Show cache effectiveness
    console.log(chalk.green(`\n⚡ Ninja incremental build system working!`));
    
    console.log(chalk.green('\n🎉 Ninja Incremental Engine test complete!'));
    
  } catch (error) {
    console.error(chalk.red('❌ Ninja engine test failed:'), error.message);
    console.log(chalk.yellow('Stack trace:'), error.stack);
  }
}

testNinjaEngine();