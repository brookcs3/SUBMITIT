#!/usr/bin/env node

/**
 * Portfolio Example
 * 
 * This example demonstrates how to use submitit to create a student portfolio
 * with different types of content and a professional theme.
 */

import { ProjectManager } from '../src/lib/ProjectManager.js';
import { YogaLayoutEngine } from '../src/lib/YogaLayoutEngine.js';
import { PreviewManager } from '../src/lib/PreviewManager.js';
import { PackageManager } from '../src/lib/PackageManager.js';
import chalk from 'chalk';

async function createPortfolioExample() {
  console.log(chalk.green('📚 Creating portfolio example...'));
  
  const projectManager = new ProjectManager();
  const layoutEngine = new YogaLayoutEngine();
  
  try {
    // Create a new project
    const project = await projectManager.createProject('student-portfolio', {
      theme: 'academic'
    });
    
    // Simulate adding files
    const mockFiles = [
      {
        name: 'profile-photo.jpg',
        type: 'image',
        role: 'hero',
        size: '2.1MB',
        added: new Date().toISOString()
      },
      {
        name: 'resume.pdf',
        type: 'document',
        role: 'document',
        size: '512KB',
        added: new Date().toISOString()
      },
      {
        name: 'about-me.md',
        type: 'text',
        role: 'about',
        size: '4KB',
        added: new Date().toISOString()
      },
      {
        name: 'project-1.jpg',
        type: 'image',
        role: 'gallery',
        size: '1.8MB',
        added: new Date().toISOString()
      },
      {
        name: 'project-2.jpg',
        type: 'image',
        role: 'gallery',
        size: '1.6MB',
        added: new Date().toISOString()
      },
      {
        name: 'demo-video.mp4',
        type: 'video',
        role: 'media',
        size: '12.4MB',
        added: new Date().toISOString()
      }
    ];
    
    // Add files to project
    project.files = mockFiles;
    
    // Generate layout using Yoga
    console.log(chalk.yellow('🧘 Generating layout with Yoga...'));
    const layout = layoutEngine.generateLayout(mockFiles, 800, 1000);
    
    // Update project with layout
    project.layout = layout;
    
    // Save project
    await projectManager.saveProject();
    
    console.log(chalk.green('✅ Portfolio example created successfully!'));
    console.log(chalk.cyan('📊 Project Stats:'));
    console.log(chalk.white(`  - Name: ${project.name}`));
    console.log(chalk.white(`  - Theme: ${project.theme}`));
    console.log(chalk.white(`  - Files: ${project.files.length}`));
    console.log(chalk.white(`  - Layout: ${layout.children.length} elements`));
    
    // Display layout information
    console.log(chalk.cyan('\n📐 Layout Information:'));
    layout.children.forEach((item, index) => {
      console.log(chalk.white(`  [${index + 1}] ${item.name}`));
      console.log(chalk.gray(`      Position: (${item.x}, ${item.y})`));
      console.log(chalk.gray(`      Size: ${item.width}x${item.height}`));
      console.log(chalk.gray(`      Type: ${item.type} (${item.role})`));
    });
    
    // Validate layout
    const isValid = layoutEngine.validateLayout(layout);
    console.log(chalk.green(`\n✅ Layout validation: ${isValid ? 'PASSED' : 'FAILED'}`));
    
    // Generate CSS
    console.log(chalk.yellow('\n🎨 Generating CSS...'));
    const css = layoutEngine.exportToCss(layout);
    console.log(chalk.green('✅ CSS generated successfully!'));
    
    // Display theme information
    console.log(chalk.cyan('\n🎨 Theme Configuration:'));
    const theme = project.themeConfig || {
      name: 'Academic',
      description: 'Professional layout suitable for academic work',
      colors: ['#2c3e50', '#34495e', '#7f8c8d'],
      typography: 'serif'
    };
    
    console.log(chalk.white(`  - Name: ${theme.name}`));
    console.log(chalk.white(`  - Description: ${theme.description}`));
    console.log(chalk.white(`  - Colors: ${theme.colors.join(', ')}`));
    console.log(chalk.white(`  - Typography: ${theme.typography}`));
    
    console.log(chalk.green('\n🎉 Example completed successfully!'));
    console.log(chalk.yellow('💡 Next steps:'));
    console.log(chalk.white('  1. cd student-portfolio'));
    console.log(chalk.white('  2. submitit preview'));
    console.log(chalk.white('  3. submitit export'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error creating example:'), error.message);
    process.exit(1);
  }
}

// Run the example
createPortfolioExample();