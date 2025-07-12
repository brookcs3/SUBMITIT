/**
 * Layout Render Test - Verify layouts render correctly across different modes and themes
 */
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import PreviewManager from '../core/PreviewManager.js';
import ProjectManager from '../core/ProjectManager.js';
import IncrementalYogaDiffing from '../ninja/IncrementalYogaDiffing.js';

export class LayoutRenderTest {
  constructor() {
    this.testDir = './test-layout-render';
    this.results = {
      testCases: [],
      summary: { passed: 0, failed: 0 }
    };
  }

  /**
   * Run all layout render tests
   */
  async runAll() {
    console.log('🎨 Starting layout render tests...');
    
    try {
      await this.setupTestEnvironment();
      
      // Test different themes
      await this.testThemeRendering();
      
      // Test different layout modes
      await this.testLayoutModes();
      
      // Test role-based layouts
      await this.testRoleBasedLayouts();
      
      // Test responsive layouts
      await this.testResponsiveLayouts();
      
      // Test content variations
      await this.testContentVariations();
      
      this.generateSummary();
      
      console.log('✅ Layout render tests completed');
      return this.results;
      
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Setup test environment
   */
  async setupTestEnvironment() {
    console.log('🔧 Setting up layout test environment...');
    
    await mkdir(this.testDir, { recursive: true });
    await mkdir(join(this.testDir, 'content'), { recursive: true });
    
    // Create test files for different roles
    const testFiles = [
      {
        name: 'hero.md',
        content: `---\ntitle: Welcome\nrole: hero\n---\n\n# Welcome to My Site\n\nThis is the hero content with **bold** text.`,
        role: 'hero'
      },
      {
        name: 'bio.md',
        content: `---\ntitle: About Me\nrole: bio\n---\n\n## About Me\n\nI'm a developer passionate about creating amazing experiences.\n\n- Experience: 5+ years\n- Skills: JavaScript, Node.js, React\n- Location: San Francisco`,
        role: 'bio'
      },
      {
        name: 'projects.md',
        content: `---\ntitle: My Projects\nrole: projects\n---\n\n## Projects\n\n### Project 1\nDescription of project 1\n\n### Project 2\nDescription of project 2`,
        role: 'projects'
      },
      {
        name: 'gallery.md',
        content: `---\ntitle: Gallery\nrole: gallery\n---\n\n## Image Gallery\n\n![Image 1](./images/image1.jpg)\n![Image 2](./images/image2.jpg)`,
        role: 'gallery'
      },
      {
        name: 'contact.md',
        content: `---\ntitle: Contact\nrole: contact\n---\n\n## Get in Touch\n\n- Email: hello@example.com\n- Twitter: @example\n- LinkedIn: /in/example`,
        role: 'contact'
      }
    ];
    
    for (const file of testFiles) {
      await writeFile(join(this.testDir, 'content', file.name), file.content);
    }
    
    console.log(`📁 Created ${testFiles.length} test files`);
  }

  /**
   * Test theme rendering
   */
  async testThemeRendering() {
    console.log('🎨 Testing theme rendering...');
    
    const themes = ['neon', 'crt', 'academic', 'noir'];
    const previewManager = new PreviewManager();
    const projectManager = new ProjectManager();
    
    await previewManager.initialize(this.testDir);
    await projectManager.initializeProject(this.testDir);
    
    const testFiles = Array.from(projectManager.files.values());
    
    for (const theme of themes) {
      const testCase = {
        name: `Theme_${theme}`,
        type: 'theme',
        theme,
        passed: false,
        error: null,
        metadata: {}
      };
      
      try {
        // Generate preview content for theme
        await previewManager.generatePreviewContent(testFiles, {
          theme,
          mode: 'desktop'
        });
        
        // Verify theme-specific content was generated
        const previewCache = previewManager.previewCache.get('content');
        
        if (previewCache && previewCache.theme === theme) {
          testCase.passed = true;
          testCase.metadata = {
            filesProcessed: testFiles.length,
            roles: Object.keys(previewCache.filesByRole).length,
            generatedAt: previewCache.timestamp
          };
        } else {
          testCase.error = 'Theme not properly applied to preview content';
        }
        
      } catch (error) {
        testCase.error = error.message;
      }
      
      this.results.testCases.push(testCase);
      
      if (testCase.passed) {
        console.log(`  ✅ Theme ${theme}: OK`);
        this.results.summary.passed++;
      } else {
        console.log(`  ❌ Theme ${theme}: ${testCase.error}`);
        this.results.summary.failed++;
      }
    }
  }

  /**
   * Test layout modes
   */
  async testLayoutModes() {
    console.log('📱 Testing layout modes...');
    
    const modes = ['desktop', 'mobile', 'terminal'];
    const previewManager = new PreviewManager();
    const projectManager = new ProjectManager();
    
    await previewManager.initialize(this.testDir);
    await projectManager.initializeProject(this.testDir);
    
    const testFiles = Array.from(projectManager.files.values());
    
    for (const mode of modes) {
      const testCase = {
        name: `LayoutMode_${mode}`,
        type: 'layout_mode',
        mode,
        passed: false,
        error: null,
        metadata: {}
      };
      
      try {
        // Test layout mode generation
        const modeResults = await previewManager.testLayoutModes(testFiles);
        
        if (modeResults[mode] && modeResults[mode].success) {
          testCase.passed = true;
          testCase.metadata = {
            generatedAt: modeResults[mode].timestamp,
            filesProcessed: testFiles.length
          };
        } else {
          testCase.error = modeResults[mode]?.error || 'Layout mode generation failed';
        }
        
      } catch (error) {
        testCase.error = error.message;
      }
      
      this.results.testCases.push(testCase);
      
      if (testCase.passed) {
        console.log(`  ✅ Mode ${mode}: OK`);
        this.results.summary.passed++;
      } else {
        console.log(`  ❌ Mode ${mode}: ${testCase.error}`);
        this.results.summary.failed++;
      }
    }
  }

  /**
   * Test role-based layouts
   */
  async testRoleBasedLayouts() {
    console.log('🎭 Testing role-based layouts...');
    
    const previewManager = new PreviewManager();
    const projectManager = new ProjectManager();
    const yogaDiffing = new IncrementalYogaDiffing();
    
    await Promise.all([
      previewManager.initialize(this.testDir),
      projectManager.initializeProject(this.testDir),
      yogaDiffing.initializeEngine()
    ]);
    
    const testFiles = Array.from(projectManager.files.values());
    const roles = [...new Set(testFiles.map(f => f.role))];
    
    for (const role of roles) {
      const testCase = {
        name: `RoleLayout_${role}`,
        type: 'role_layout',
        role,
        passed: false,
        error: null,
        metadata: {}
      };
      
      try {
        const roleFiles = testFiles.filter(f => f.role === role);
        
        // Test Yoga layout calculation for role
        const layoutProps = {
          width: this.getRoleWidth(role),
          height: 'auto',
          padding: this.getRolePadding(role),
          role
        };
        
        const layoutResult = await yogaDiffing.calculateIncrementalLayout(
          `role-test-${role}`,
          layoutProps
        );
        
        if (layoutResult && layoutResult.computed) {
          // Validate layout properties
          const computed = layoutResult.computed;
          const isValidLayout = this.validateLayoutResult(computed, role);
          
          if (isValidLayout) {
            testCase.passed = true;
            testCase.metadata = {
              filesInRole: roleFiles.length,
              layoutWidth: computed.width,
              layoutHeight: computed.height,
              fromCache: layoutResult.fromCache
            };
          } else {
            testCase.error = 'Invalid layout computed values';
          }
        } else {
          testCase.error = 'Layout calculation failed';
        }
        
      } catch (error) {
        testCase.error = error.message;
      }
      
      this.results.testCases.push(testCase);
      
      if (testCase.passed) {
        console.log(`  ✅ Role ${role}: ${testCase.metadata.layoutWidth}x${testCase.metadata.layoutHeight}`);
        this.results.summary.passed++;
      } else {
        console.log(`  ❌ Role ${role}: ${testCase.error}`);
        this.results.summary.failed++;
      }
    }
  }

  /**
   * Test responsive layouts
   */
  async testResponsiveLayouts() {
    console.log('📐 Testing responsive layouts...');
    
    const breakpoints = [
      { name: 'mobile', width: 375 },
      { name: 'tablet', width: 768 },
      { name: 'desktop', width: 1200 },
      { name: 'wide', width: 1600 }
    ];
    
    const yogaDiffing = new IncrementalYogaDiffing();
    await yogaDiffing.initializeEngine();
    
    for (const breakpoint of breakpoints) {
      const testCase = {
        name: `Responsive_${breakpoint.name}`,
        type: 'responsive',
        breakpoint,
        passed: false,
        error: null,
        metadata: {}
      };
      
      try {
        // Test layout at different breakpoints
        const layoutProps = {
          width: breakpoint.width,
          height: 'auto',
          padding: 1,
          flexDirection: 'column',
          responsive: true
        };
        
        const layoutResult = await yogaDiffing.calculateIncrementalLayout(
          `responsive-${breakpoint.name}`,
          layoutProps
        );
        
        if (layoutResult && layoutResult.computed) {
          const computed = layoutResult.computed;
          
          // Verify responsive behavior
          const expectedWidth = breakpoint.width;
          const actualWidth = computed.width;
          
          if (Math.abs(actualWidth - expectedWidth) < 1) {
            testCase.passed = true;
            testCase.metadata = {
              targetWidth: expectedWidth,
              actualWidth: actualWidth,
              heightAdapts: computed.height !== undefined
            };
          } else {
            testCase.error = `Width mismatch: expected ${expectedWidth}, got ${actualWidth}`;
          }
        } else {
          testCase.error = 'Responsive layout calculation failed';
        }
        
      } catch (error) {
        testCase.error = error.message;
      }
      
      this.results.testCases.push(testCase);
      
      if (testCase.passed) {
        console.log(`  ✅ ${breakpoint.name}: ${testCase.metadata.actualWidth}px`);
        this.results.summary.passed++;
      } else {
        console.log(`  ❌ ${breakpoint.name}: ${testCase.error}`);
        this.results.summary.failed++;
      }
    }
  }

  /**
   * Test content variations
   */
  async testContentVariations() {
    console.log('📝 Testing content variations...');
    
    const contentVariations = [
      { name: 'empty', content: '', expectedBehavior: 'graceful_handling' },
      { name: 'minimal', content: 'Hello', expectedBehavior: 'basic_layout' },
      { name: 'markdown', content: '# Title\n\nSome **bold** text with *italics*.', expectedBehavior: 'formatted_content' },
      { name: 'long', content: 'Lorem ipsum '.repeat(200), expectedBehavior: 'text_wrapping' },
      { name: 'special_chars', content: '🚀 Émojis & spéciäl chäracters: <>&"\'', expectedBehavior: 'escape_handling' }
    ];
    
    const previewManager = new PreviewManager();
    await previewManager.initialize(this.testDir);
    
    for (const variation of contentVariations) {
      const testCase = {
        name: `Content_${variation.name}`,
        type: 'content_variation',
        variation: variation.name,
        passed: false,
        error: null,
        metadata: {}
      };
      
      try {
        // Create test file with variation content
        const testFile = {
          path: join(this.testDir, `test-${variation.name}.md`),
          name: `test-${variation.name}.md`,
          content: variation.content,
          role: 'content',
          extension: '.md'
        };
        
        // Test content formatting
        const formattedContent = previewManager.formatFileContent(testFile);
        
        // Validate based on expected behavior
        let isValid = false;
        
        switch (variation.expectedBehavior) {
          case 'graceful_handling':
            isValid = formattedContent.includes('No content') || formattedContent.includes('Binary file');
            break;
          case 'basic_layout':
            isValid = formattedContent.includes(variation.content);
            break;
          case 'formatted_content':
            isValid = formattedContent.includes('<h1>') && formattedContent.includes('<strong>');
            break;
          case 'text_wrapping':
            isValid = formattedContent.length > 0 && formattedContent.includes('Lorem ipsum');
            break;
          case 'escape_handling':
            isValid = formattedContent.includes('&lt;') || formattedContent.includes('🚀');
            break;
        }
        
        if (isValid) {
          testCase.passed = true;
          testCase.metadata = {
            contentLength: variation.content.length,
            formattedLength: formattedContent.length,
            expectedBehavior: variation.expectedBehavior
          };
        } else {
          testCase.error = `Content variation ${variation.name} did not render as expected`;
        }
        
      } catch (error) {
        testCase.error = error.message;
      }
      
      this.results.testCases.push(testCase);
      
      if (testCase.passed) {
        console.log(`  ✅ ${variation.name}: ${variation.expectedBehavior}`);
        this.results.summary.passed++;
      } else {
        console.log(`  ❌ ${variation.name}: ${testCase.error}`);
        this.results.summary.failed++;
      }
    }
  }

  /**
   * Get role-specific width
   */
  getRoleWidth(role) {
    const widths = {
      hero: 100,
      bio: 80,
      resume: 90,
      projects: 85,
      gallery: 100,
      contact: 70,
      content: 80
    };
    return widths[role] || 80;
  }

  /**
   * Get role-specific padding
   */
  getRolePadding(role) {
    const paddings = {
      hero: 2,
      bio: 1,
      resume: 1,
      projects: 1,
      gallery: 0,
      contact: 1,
      content: 1
    };
    return paddings[role] || 1;
  }

  /**
   * Validate layout result
   */
  validateLayoutResult(computed, role) {
    // Basic validation - ensure computed values are reasonable
    if (!computed || typeof computed.width !== 'number') {
      return false;
    }
    
    if (computed.width <= 0 || computed.width > 200) {
      return false;
    }
    
    // Role-specific validation
    const expectedWidth = this.getRoleWidth(role);
    if (Math.abs(computed.width - expectedWidth) > 5) {
      return false;
    }
    
    return true;
  }

  /**
   * Generate test summary
   */
  generateSummary() {
    const total = this.results.summary.passed + this.results.summary.failed;
    const passRate = total > 0 ? (this.results.summary.passed / total) * 100 : 0;
    
    this.results.summary.total = total;
    this.results.summary.passRate = passRate;
    
    console.log('📊 Layout Render Test Summary:');
    console.log(`  Total tests: ${total}`);
    console.log(`  Passed: ${this.results.summary.passed}`);
    console.log(`  Failed: ${this.results.summary.failed}`);
    console.log(`  Pass rate: ${passRate.toFixed(1)}%`);
    
    if (this.results.summary.failed > 0) {
      console.log('❌ Failed tests:');
      this.results.testCases
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
    }
  }

  /**
   * Cleanup test environment
   */
  async cleanup() {
    try {
      await rm(this.testDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Warning: Could not clean up test directory:', error.message);
    }
  }

  /**
   * Save test results
   */
  async saveResults(outputPath = './layout-render-results.json') {
    await writeFile(outputPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Results saved to: ${outputPath}`);
  }
}

export default LayoutRenderTest;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new LayoutRenderTest();
  const results = await test.runAll();
  await test.saveResults();
  
  if (results.summary.failed === 0) {
    console.log('\n🏁 All layout render tests passed!');
    process.exit(0);
  } else {
    console.log('\n💥 Some layout render tests failed!');
    process.exit(1);
  }
}