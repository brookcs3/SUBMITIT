#!/usr/bin/env node

/**
 * Real functionality test - NOT a mock test
 * Tests the actual end-to-end workflow that users would experience
 */

import { simpleInit } from './simple-init.js';
import { simpleAdd } from './simple-add.js';
import { simpleTheme } from './simple-theme.js';
import { simpleBuild } from './simple-build.js';
import { simpleYogaLayout } from './simple-yoga.js';
import { readFile, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

async function testRealFunctionality() {
  const testProject = 'real-test-project';
  
  console.log(chalk.green('🧪 Testing REAL functionality (not mocks)...'));
  
  try {
    // Clean up any existing test project
    try {
      await rm(testProject, { recursive: true, force: true });
    } catch {}
    
    // 1. Test init command
    console.log(chalk.yellow('\n1️⃣ Testing init command...'));
    await simpleInit(testProject);
    
    // Verify project was created
    const configPath = join(testProject, 'submitit.config.json');
    const config = JSON.parse(await readFile(configPath, 'utf8'));
    
    if (config.name !== testProject) {
      throw new Error('Init failed: config.name incorrect');
    }
    if (config.files.length !== 3) {
      throw new Error('Init failed: starter files not created');
    }
    console.log(chalk.green('✅ Init command works'));
    
    // 2. Test add command
    console.log(chalk.yellow('\n2️⃣ Testing add command...'));
    
    // Create a test file to add
    const testFile = 'contact.md';
    await writeFile(testFile, '# Contact Me\n\nemail@example.com\n');
    
    process.chdir(testProject);
    await simpleAdd([`../${testFile}`]);
    
    // Verify file was added
    const updatedConfig = JSON.parse(await readFile('submitit.config.json', 'utf8'));
    if (updatedConfig.files.length !== 4) {
      throw new Error('Add failed: file not added to config');
    }
    
    const addedFile = await readFile(`content/${testFile}`, 'utf8');
    if (!addedFile.includes('Contact Me')) {
      throw new Error('Add failed: file content not copied');
    }
    console.log(chalk.green('✅ Add command works'));
    
    // 3. Test theme command
    console.log(chalk.yellow('\n3️⃣ Testing theme command...'));
    await simpleTheme('neon');
    
    const themedConfig = JSON.parse(await readFile('submitit.config.json', 'utf8'));
    if (themedConfig.theme !== 'neon') {
      throw new Error('Theme failed: config not updated');
    }
    console.log(chalk.green('✅ Theme command works'));
    
    // 4. Test build command
    console.log(chalk.yellow('\n4️⃣ Testing build command...'));
    await simpleBuild();
    
    // Verify HTML was generated
    const htmlPath = join('output', 'index.html');
    const html = await readFile(htmlPath, 'utf8');
    
    if (!html.includes('<!DOCTYPE html>')) {
      throw new Error('Build failed: invalid HTML generated');
    }
    if (!html.includes('background: #0d1117')) {
      throw new Error('Build failed: neon theme not applied');
    }
    if (!html.includes('Contact Me')) {
      throw new Error('Build failed: added content not included');
    }
    console.log(chalk.green('✅ Build command works'));
    
    // 5. Test Yoga layout
    console.log(chalk.yellow('\n5️⃣ Testing Yoga layout...'));
    process.chdir('..');
    const layout = simpleYogaLayout();
    
    if (!layout.root || layout.root.width !== 300) {
      throw new Error('Yoga failed: layout calculation incorrect');
    }
    console.log(chalk.green('✅ Yoga layout works'));
    
    // 6. Test file operations work without DI container
    console.log(chalk.yellow('\n6️⃣ Testing file operations...'));
    const testData = { test: 'data', timestamp: Date.now() };
    await writeFile('test-file.json', JSON.stringify(testData));
    const readData = JSON.parse(await readFile('test-file.json', 'utf8'));
    
    if (readData.test !== 'data') {
      throw new Error('File operations failed: data not preserved');
    }
    console.log(chalk.green('✅ File operations work'));
    
    // Clean up
    await rm('test-file.json');
    await rm(testFile);
    await rm(testProject, { recursive: true });
    
    console.log(chalk.green('\n🎉 ALL REAL FUNCTIONALITY TESTS PASSED!'));
    console.log(chalk.cyan('📋 Summary:'));
    console.log(chalk.white('  ✅ Project initialization'));
    console.log(chalk.white('  ✅ File addition'));
    console.log(chalk.white('  ✅ Theme switching'));
    console.log(chalk.white('  ✅ HTML generation'));
    console.log(chalk.white('  ✅ Yoga layout calculation'));
    console.log(chalk.white('  ✅ File I/O operations'));
    
    console.log(chalk.green('\n🚀 The CLI actually works!'));
    
  } catch (error) {
    console.error(chalk.red('❌ Real functionality test failed:'), error.message);
    process.exit(1);
  }
}

testRealFunctionality();