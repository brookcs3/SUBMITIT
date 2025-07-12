#!/usr/bin/env node

/**
 * Test the Ninja SmartFileHandler to prove it actually works
 */

import { SmartFileHandler } from './src/ninja/SmartFileHandler.js';
import { join } from 'path';
import chalk from 'chalk';

async function testNinjaBuild() {
  console.log(chalk.green('🥷 Testing Ninja Smart File Handler...'));
  
  try {
    const ninja = new SmartFileHandler('.submitit/ninja-cache');
    await ninja.initialize();
    
    console.log(chalk.blue('📋 Initialized Ninja cache system'));
    
    // Test file processing in our project
    const testDir = './workflow-test/content';
    const files = ['hero.md', 'bio.md', 'projects.md'];
    
    console.log(chalk.yellow('🔍 Processing files with Ninja-style caching...'));
    
    for (const file of files) {
      const filePath = join(testDir, file);
      
      // Check if file needs processing
      const needsProcessing = await ninja.needsProcessing(filePath);
      console.log(chalk.cyan(`📄 ${file}: ${needsProcessing ? 'PROCESS' : 'CACHED'}`));
      
      if (needsProcessing) {
        // Simulate processing
        const result = await ninja.processFile(filePath, async (path) => {
          // Simulate some work
          await new Promise(resolve => setTimeout(resolve, 10));
          return { processed: true, timestamp: Date.now() };
        });
        
        console.log(chalk.green(`✅ Processed ${file}`));
      } else {
        console.log(chalk.gray(`⚡ Cache hit for ${file}`));
      }
    }
    
    // Show metrics
    const metrics = ninja.getMetrics();
    console.log(chalk.white('\n📊 Ninja Build Metrics:'));
    console.log(chalk.white(`Files processed: ${metrics.filesProcessed}`));
    console.log(chalk.white(`Cache hits: ${metrics.cacheHits}`));
    console.log(chalk.white(`Cache misses: ${metrics.cacheMisses}`));
    console.log(chalk.white(`Cache hit rate: ${((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(1)}%`));
    
    console.log(chalk.green('\n🎉 Ninja Smart File Handler test complete!'));
    
  } catch (error) {
    console.error(chalk.red('❌ Ninja test failed:'), error.message);
    console.log(chalk.yellow('💡 This might be because the SmartFileHandler has dependencies on the broken DI system'));
  }
}

testNinjaBuild();