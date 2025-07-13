import { test, expect, beforeAll, afterAll } from '@jest/globals';
import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);
const TEST_DIR = join(process.cwd(), 'test-staging');

// Helper function to create test files
async function createTestFiles() {
  await mkdir(TEST_DIR, { recursive: true });
  
  // Create some test files
  const testFiles = [
    { name: 'document.pdf', content: 'PDF content' },
    { name: 'report.docx', content: 'Word document content' },
    { name: 'data.json', content: JSON.stringify({ key: 'value' }) },
    { name: 'script.js', content: 'console.log("Hello, world!");' },
    { name: 'large_file.bin', content: Buffer.alloc(15 * 1024 * 1024) } // 15MB file
  ];
  
  for (const file of testFiles) {
    await writeFile(join(TEST_DIR, file.name), file.content);
  }
}

describe('File Staging Module', () => {
  beforeAll(async () => {
    // Create test directory and files
    await createTestFiles();
  });

  afterAll(async () => {
    // Clean up test directory
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  test('stage command should be registered', async () => {
    // Test that the stage command is registered and shows help
    const { stdout } = await execAsync('node src/cli.js stage --help');
    expect(stdout).toContain('Stage files for submission');
  });

  test('should validate file extensions', async () => {
    try {
      await execAsync(`node src/cli.js stage ${TEST_DIR} --extensions pdf,docx`);
      // The command should fail because we're not in interactive mode
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error.message).toContain('No files to stage');
    }
  });

  test('should respect max file size', async () => {
    try {
      await execAsync(`node src/cli.js stage ${TEST_DIR} --max-size 5`);
      // The command should fail because we have a 15MB file
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error.message).toContain('File too large');
    }
  });
});
