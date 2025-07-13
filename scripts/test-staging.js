#!/usr/bin/env node

/**
 * Test script for the File Staging Module
 * This script creates a test directory with sample files and runs the stage command
 */

import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const TEST_DIR = join(process.cwd(), 'test-staging-dir');

// Sample files to create
const SAMPLE_FILES = [
  { name: 'document.pdf', content: 'PDF document content' },
  { name: 'report.docx', content: 'Word document content' },
  { name: 'data.json', content: JSON.stringify({ key: 'value', array: [1, 2, 3] }) },
  { name: 'script.js', content: 'console.log("Hello, world!");' },
  { name: 'README.md', content: '# Test Project\n\nThis is a test project for the File Staging Module.' },
  { name: 'config.yaml', content: 'database:\n  host: localhost\n  port: 5432\n  name: test_db' },
  { name: 'large_file.bin', content: Buffer.alloc(5 * 1024 * 1024) } // 5MB file
];

async function setupTestEnvironment() {
  console.log('Setting up test environment...');
  
  try {
    // Create test directory
    await mkdir(TEST_DIR, { recursive: true });
    console.log(`Created test directory: ${TEST_DIR}`);
    
    // Create sample files
    for (const file of SAMPLE_FILES) {
      const filePath = join(TEST_DIR, file.name);
      await writeFile(filePath, file.content);
      console.log(`Created test file: ${filePath}`);
    }
    
    console.log('Test environment setup complete!');
    return true;
  } catch (error) {
    console.error('Error setting up test environment:', error);
    return false;
  }
}

async function runStageCommand() {
  console.log('\nRunning stage command...');
  console.log('----------------------------------------');
  
  try {
    // Run the stage command with a 10MB file size limit and common document extensions
    const command = `node src/cli.js stage ${TEST_DIR} --max-size 10 --extensions pdf,docx,md,json,js,yaml,yml`;
    console.log(`Executing: ${command}`);
    
    const { stdout, stderr } = await execAsync(command, { stdio: 'inherit' });
    
    if (stderr) {
      console.error('Error:', stderr);
    }
    
    console.log('Stage command completed');
    return true;
  } catch (error) {
    console.error('Error running stage command:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('=== File Staging Module Test ===');
  
  // Set up test environment
  const setupSuccess = await setupTestEnvironment();
  if (!setupSuccess) {
    console.error('Failed to set up test environment');
    process.exit(1);
  }
  
  // Run the stage command
  const stageSuccess = await runStageCommand();
  
  console.log('\nTest completed!');
  console.log(`Test directory: ${TEST_DIR}`);
  console.log('You can inspect the test files and run the stage command manually:');
  console.log(`  cd ${process.cwd()}`);
  console.log(`  node src/cli.js stage ${TEST_DIR}`);
  
  process.exit(stageSuccess ? 0 : 1);
}

// Run the main function
main().catch(console.error);
