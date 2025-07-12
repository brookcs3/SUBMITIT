#!/usr/bin/env node

import { readFile, writeFile, rename } from 'fs/promises';
import { join } from 'path';
import { globby } from 'globby';
import chalk from 'chalk';

/**
 * Architecture Metaphor Restyle Script
 * Transforms generic naming to meaningful construction metaphors
 */

const RENAMES = {
  // Core components (Phase 1)
  files: {
    'SmartFileHandler.js': 'FileArchitect.js',
    'SmartFileHandlerSimple.js': 'FileDraftsperson.js',
    'ProjectManager.js': 'ProjectForeman.js',
    'PackageManager.js': 'DeliveryContractor.js',
    'PreviewManager.js': 'DesignShowroom.js',
    'FileValidator.js': 'QualityInspector.js',
    'DynamicAstroGenerator.js': 'ArchitecturalRenderer.js',
    'PostCardGenerator.js': 'PortfolioDesigner.js',
    'StreamingFileOperations.js': 'PipelineForeman.js'
  },
  
  classes: {
    'SmartFileHandler': 'FileArchitect',
    'SmartFileHandlerSimple': 'FileDraftsperson', 
    'ProjectManager': 'ProjectForeman',
    'PackageManager': 'DeliveryContractor',
    'PreviewManager': 'DesignShowroom',
    'FileValidator': 'QualityInspector',
    'DynamicAstroGenerator': 'ArchitecturalRenderer',
    'PostCardGenerator': 'PortfolioDesigner',
    'StreamingFileOperations': 'PipelineForeman'
  },

  methods: {
    // FileArchitect
    'processFiles': 'designFileArrangement',
    'getPerformanceStats': 'getProjectMetrics',
    'setBatchSize': 'adjustWorkforceSize',
    'clearCache': 'clearDraftingTable',
    'processFile': 'designFileStructure',
    'addDependency': 'addStructuralDependency',
    
    // ProjectForeman
    'addFiles': 'commissionWork',
    'validateProject': 'inspectConstruction', 
    'updateLayout': 'reviseBlueprints',
    'saveProject': 'archiveProject',
    'loadProject': 'loadBlueprints',
    'createProject': 'startConstruction',
    
    // DeliveryContractor
    'exportProject': 'packageDeliverable',
    'createZipPackage': 'createShippingContainer',
    'generateManifest': 'createDeliveryReceipt',
    'createTarPackage': 'createArchiveContainer',
    
    // DesignShowroom
    'startWebPreview': 'openShowroom',
    'startAsciiPreview': 'displayShowroomSketch',
    'generateAstroProject': 'buildShowroomDisplay',
    
    // QualityInspector
    'validateFile': 'inspectFileIntegrity',
    'checkSecurity': 'auditSafety',
    'validateStructure': 'inspectStructuralIntegrity'
  }
};

async function main() {
  console.log(chalk.green('🏗️ Starting Architecture Metaphor Restyle...'));
  
  try {
    // Phase 1: Rename files
    await renameFiles();
    
    // Phase 2: Update imports and references  
    await updateReferences();
    
    // Phase 3: Update method names and documentation
    await updateMethodNames();
    
    console.log(chalk.green('✅ Restyle completed successfully!'));
    console.log(chalk.cyan('📋 Summary:'));
    console.log(chalk.cyan(`   • ${Object.keys(RENAMES.files).length} files renamed`));
    console.log(chalk.cyan(`   • ${Object.keys(RENAMES.classes).length} classes renamed`));
    console.log(chalk.cyan(`   • ${Object.keys(RENAMES.methods).length} methods renamed`));
    
  } catch (error) {
    console.error(chalk.red('❌ Restyle failed:'), error.message);
    process.exit(1);
  }
}

async function renameFiles() {
  console.log(chalk.blue('📁 Renaming files...'));
  
  const srcDir = 'src';
  
  for (const [oldName, newName] of Object.entries(RENAMES.files)) {
    const files = await globby([`${srcDir}/**/${oldName}`]);
    
    for (const file of files) {
      const newPath = file.replace(oldName, newName);
      await rename(file, newPath);
      console.log(chalk.gray(`   ${oldName} → ${newName}`));
    }
  }
}

async function updateReferences() {
  console.log(chalk.blue('🔗 Updating imports and references...'));
  
  const files = await globby(['src/**/*.js', 'src/**/*.jsx']);
  
  for (const file of files) {
    let content = await readFile(file, 'utf8');
    let modified = false;
    
    // Update file imports
    for (const [oldName, newName] of Object.entries(RENAMES.files)) {
      const oldImport = oldName.replace('.js', '');
      const newImport = newName.replace('.js', '');
      
      if (content.includes(oldImport)) {
        content = content.replace(new RegExp(oldImport, 'g'), newImport);
        modified = true;
      }
    }
    
    // Update class references
    for (const [oldClass, newClass] of Object.entries(RENAMES.classes)) {
      if (content.includes(oldClass)) {
        // Update class names but preserve method names for now
        content = content.replace(
          new RegExp(`\\b${oldClass}\\b`, 'g'), 
          newClass
        );
        modified = true;
      }
    }
    
    if (modified) {
      await writeFile(file, content);
      console.log(chalk.gray(`   Updated references in ${file}`));
    }
  }
}

async function updateMethodNames() {
  console.log(chalk.blue('🔧 Updating method names...'));
  
  const files = await globby(['src/**/*.js', 'src/**/*.jsx']);
  
  for (const file of files) {
    let content = await readFile(file, 'utf8');
    let modified = false;
    
    // Update method definitions and calls
    for (const [oldMethod, newMethod] of Object.entries(RENAMES.methods)) {
      // Match method definitions: methodName(
      const defPattern = new RegExp(`\\b${oldMethod}\\s*\\(`, 'g');
      if (defPattern.test(content)) {
        content = content.replace(defPattern, `${newMethod}(`);
        modified = true;
      }
      
      // Match method calls: .methodName(
      const callPattern = new RegExp(`\\.${oldMethod}\\s*\\(`, 'g');
      if (callPattern.test(content)) {
        content = content.replace(callPattern, `.${newMethod}(`);
        modified = true;
      }
      
      // Match async method calls: await methodName(
      const asyncPattern = new RegExp(`await\\s+${oldMethod}\\s*\\(`, 'g');
      if (asyncPattern.test(content)) {
        content = content.replace(asyncPattern, `await ${newMethod}(`);
        modified = true;
      }
    }
    
    if (modified) {
      await writeFile(file, content);
      console.log(chalk.gray(`   Updated methods in ${file}`));
    }
  }
}

// Helper function to update documentation
async function updateDocumentation() {
  console.log(chalk.blue('📚 Updating documentation...'));
  
  const docFiles = await globby(['README.md', 'docs/**/*.md']);
  
  for (const file of docFiles) {
    let content = await readFile(file, 'utf8');
    let modified = false;
    
    // Update class references in documentation
    for (const [oldClass, newClass] of Object.entries(RENAMES.classes)) {
      if (content.includes(oldClass)) {
        content = content.replace(new RegExp(oldClass, 'g'), newClass);
        modified = true;
      }
    }
    
    if (modified) {
      await writeFile(file, content);
      console.log(chalk.gray(`   Updated documentation in ${file}`));
    }
  }
}

// Run the restyle
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}