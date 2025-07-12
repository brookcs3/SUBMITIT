/**
 * Aesthetic Testing Suite
 * 
 * Comprehensive testing system for visual design validation, aesthetic coherence,
 * and style-focused integration testing across multiple theme paradigms.
 */

import { EventEmitter } from 'events';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

export class AestheticTestingSuite extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      enableScreenshotGeneration: true,
      enableMetricsCalculation: true,
      enableThemeValidation: true,
      enableAccessibilityTesting: true,
      outputDirectory: './aesthetic-tests',
      testFormats: ['ascii', 'ansi', 'html'],
      ...options
    };
    
    // Test themes and their characteristics
    this.testThemes = new Map();
    this.aestheticMetrics = new Map();
    this.testResults = new Map();
    this.visualRepresentations = new Map();
    
    // Design evaluation criteria
    this.evaluationCriteria = {
      balance: {
        weight: 0.35,
        description: 'How well weighted is the text vs images/visual elements',
        metrics: ['textImageRatio', 'visualHierarchy', 'whiteSpaceDistribution']
      },
      structure: {
        weight: 0.35,
        description: 'How accessible and clearly defined is the overall project',
        metrics: ['informationArchitecture', 'navigationClarity', 'contentOrganization']
      },
      aspiration: {
        weight: 0.30,
        description: 'How compelling and professional is the overall output',
        metrics: ['visualImpact', 'brandCoherence', 'emotionalResonance']
      }
    };
    
    this.initialize();
  }
  
  // === INITIALIZATION ===
  
  async initialize() {
    console.log(chalk.blue('🎨 Initializing Aesthetic Testing Suite...'));
    
    // Setup test themes
    this.setupTestThemes();
    
    // Setup evaluation metrics
    this.setupEvaluationMetrics();
    
    // Create output directory
    await this.createOutputDirectory();
    
    console.log(chalk.green('✅ Aesthetic testing suite initialized'));
    this.emit('testing-suite-ready');
  }
  
  setupTestThemes() {
    // Noir Theme - High contrast, dramatic, professional
    this.testThemes.set('noir', {
      name: 'Noir',
      description: 'High contrast, dramatic, professional aesthetic',
      mood: 'sophisticated',
      emotionalTexture: 'intense',
      components: {
        colors: {
          primary: '#000000',
          secondary: '#ffffff',
          background: '#0a0a0a',
          surface: '#1a1a1a',
          text: '#ffffff',
          textSecondary: '#cccccc',
          border: '#333333',
          accent: '#ff6b6b',
          error: '#ff5757',
          warning: '#feca57',
          success: '#48dbfb'
        },
        typography: {
          fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
          fontFamilyMono: 'JetBrains Mono, Monaco, monospace',
          fontSize: '14px',
          fontWeight: '400',
          lineHeight: 1.6,
          headingWeight: '700'
        },
        spacing: {
          spaceUnit: '8px',
          spaceXs: '4px',
          spaceSm: '8px',
          spaceMd: '16px',
          spaceLg: '24px',
          spaceXl: '32px'
        },
        aesthetics: {
          contrast: 'high',
          brightness: 'low',
          saturation: 'selective',
          visualWeight: 'heavy'
        }
      },
      testCases: ['terminal-output', 'code-display', 'data-visualization', 'error-reporting']
    });
    
    // Expressive Theme - Vibrant, creative, energetic
    this.testThemes.set('expressive', {
      name: 'Expressive',
      description: 'Vibrant, creative, energetic aesthetic',
      mood: 'energetic',
      emotionalTexture: 'dynamic',
      components: {
        colors: {
          primary: '#6c5ce7',
          secondary: '#fd79a8',
          background: '#ffeaa7',
          surface: '#ffffff',
          text: '#2d3436',
          textSecondary: '#636e72',
          border: '#ddd',
          accent: '#00b894',
          error: '#e17055',
          warning: '#fdcb6e',
          success: '#00b894'
        },
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontFamilyMono: 'Fira Code, Monaco, monospace',
          fontSize: '16px',
          fontWeight: '400',
          lineHeight: 1.7,
          headingWeight: '600'
        },
        spacing: {
          spaceUnit: '12px',
          spaceXs: '6px',
          spaceSm: '12px',
          spaceMd: '24px',
          spaceLg: '36px',
          spaceXl: '48px'
        },
        aesthetics: {
          contrast: 'medium',
          brightness: 'high',
          saturation: 'high',
          visualWeight: 'medium'
        }
      },
      testCases: ['creative-portfolio', 'interactive-dashboard', 'content-showcase', 'celebration-display']
    });
    
    // Academic Theme - Clean, readable, structured
    this.testThemes.set('academic', {
      name: 'Academic',
      description: 'Clean, readable, structured aesthetic',
      mood: 'professional',
      emotionalTexture: 'calm',
      components: {
        colors: {
          primary: '#2c3e50',
          secondary: '#3498db',
          background: '#ffffff',
          surface: '#f8f9fa',
          text: '#2c3e50',
          textSecondary: '#7f8c8d',
          border: '#ecf0f1',
          accent: '#e74c3c',
          error: '#e74c3c',
          warning: '#f39c12',
          success: '#27ae60'
        },
        typography: {
          fontFamily: 'Georgia, Times, serif',
          fontFamilyMono: 'Source Code Pro, Monaco, monospace',
          fontSize: '17px',
          fontWeight: '400',
          lineHeight: 1.8,
          headingWeight: '500'
        },
        spacing: {
          spaceUnit: '16px',
          spaceXs: '8px',
          spaceSm: '16px',
          spaceMd: '32px',
          spaceLg: '48px',
          spaceXl: '64px'
        },
        aesthetics: {
          contrast: 'medium',
          brightness: 'medium',
          saturation: 'low',
          visualWeight: 'light'
        }
      },
      testCases: ['documentation', 'research-presentation', 'data-analysis', 'technical-report']
    });
    
    // Minimal Theme - Ultra-clean, focused, elegant
    this.testThemes.set('minimal', {
      name: 'Minimal',
      description: 'Ultra-clean, focused, elegant aesthetic',
      mood: 'serene',
      emotionalTexture: 'refined',
      components: {
        colors: {
          primary: '#000000',
          secondary: '#666666',
          background: '#ffffff',
          surface: '#fafafa',
          text: '#000000',
          textSecondary: '#666666',
          border: '#e5e5e5',
          accent: '#0066cc',
          error: '#cc0000',
          warning: '#cc6600',
          success: '#006600'
        },
        typography: {
          fontFamily: 'SF Pro Display, system-ui, sans-serif',
          fontFamilyMono: 'SF Mono, Monaco, monospace',
          fontSize: '15px',
          fontWeight: '400',
          lineHeight: 1.5,
          headingWeight: '500'
        },
        spacing: {
          spaceUnit: '20px',
          spaceXs: '10px',
          spaceSm: '20px',
          spaceMd: '40px',
          spaceLg: '60px',
          spaceXl: '80px'
        },
        aesthetics: {
          contrast: 'subtle',
          brightness: 'high',
          saturation: 'minimal',
          visualWeight: 'ultra-light'
        }
      },
      testCases: ['product-showcase', 'portfolio', 'clean-interface', 'focus-mode']
    });
    
    // Cyberpunk Theme - Futuristic, neon, high-tech
    this.testThemes.set('cyberpunk', {
      name: 'Cyberpunk',
      description: 'Futuristic, neon, high-tech aesthetic',
      mood: 'futuristic',
      emotionalTexture: 'electric',
      components: {
        colors: {
          primary: '#00ffff',
          secondary: '#ff00ff',
          background: '#0a0a0a',
          surface: '#111111',
          text: '#00ff00',
          textSecondary: '#00cccc',
          border: '#333333',
          accent: '#ffff00',
          error: '#ff0040',
          warning: '#ff8000',
          success: '#00ff80'
        },
        typography: {
          fontFamily: 'Orbitron, Monaco, monospace',
          fontFamilyMono: 'Orbitron, Monaco, monospace',
          fontSize: '14px',
          fontWeight: '400',
          lineHeight: 1.4,
          headingWeight: '700'
        },
        spacing: {
          spaceUnit: '6px',
          spaceXs: '3px',
          spaceSm: '6px',
          spaceMd: '12px',
          spaceLg: '18px',
          spaceXl: '24px'
        },
        aesthetics: {
          contrast: 'extreme',
          brightness: 'variable',
          saturation: 'neon',
          visualWeight: 'intense'
        }
      },
      testCases: ['terminal-hacking', 'data-matrix', 'system-monitoring', 'futuristic-ui']
    });
  }
  
  setupEvaluationMetrics() {
    // Balance metrics
    this.aestheticMetrics.set('textImageRatio', {
      name: 'Text-to-Image Ratio',
      description: 'Optimal balance between textual and visual content',
      calculate: this.calculateTextImageRatio.bind(this),
      idealRange: [0.6, 0.8], // 60-80% text content
      weight: 0.4
    });
    
    this.aestheticMetrics.set('visualHierarchy', {
      name: 'Visual Hierarchy',
      description: 'Clear information hierarchy through visual design',
      calculate: this.calculateVisualHierarchy.bind(this),
      idealRange: [0.7, 1.0], // Strong hierarchy
      weight: 0.3
    });
    
    this.aestheticMetrics.set('whiteSpaceDistribution', {
      name: 'White Space Distribution',
      description: 'Effective use of negative space for clarity',
      calculate: this.calculateWhiteSpaceDistribution.bind(this),
      idealRange: [0.3, 0.5], // 30-50% white space
      weight: 0.3
    });
    
    // Structure metrics
    this.aestheticMetrics.set('informationArchitecture', {
      name: 'Information Architecture',
      description: 'Logical organization and flow of information',
      calculate: this.calculateInformationArchitecture.bind(this),
      idealRange: [0.8, 1.0], // Highly structured
      weight: 0.4
    });
    
    this.aestheticMetrics.set('navigationClarity', {
      name: 'Navigation Clarity',
      description: 'Clear and intuitive navigation patterns',
      calculate: this.calculateNavigationClarity.bind(this),
      idealRange: [0.7, 1.0], // Very clear
      weight: 0.3
    });
    
    this.aestheticMetrics.set('contentOrganization', {
      name: 'Content Organization',
      description: 'Logical grouping and presentation of content',
      calculate: this.calculateContentOrganization.bind(this),
      idealRange: [0.7, 1.0], // Well organized
      weight: 0.3
    });
    
    // Aspiration metrics
    this.aestheticMetrics.set('visualImpact', {
      name: 'Visual Impact',
      description: 'Memorable and engaging visual presentation',
      calculate: this.calculateVisualImpact.bind(this),
      idealRange: [0.6, 0.9], // High impact without overwhelming
      weight: 0.4
    });
    
    this.aestheticMetrics.set('brandCoherence', {
      name: 'Brand Coherence',
      description: 'Consistent visual identity and messaging',
      calculate: this.calculateBrandCoherence.bind(this),
      idealRange: [0.8, 1.0], // Highly coherent
      weight: 0.3
    });
    
    this.aestheticMetrics.set('emotionalResonance', {
      name: 'Emotional Resonance',
      description: 'Appropriate emotional response and connection',
      calculate: this.calculateEmotionalResonance.bind(this),
      idealRange: [0.7, 1.0], // Strong emotional connection
      weight: 0.3
    });
  }
  
  async createOutputDirectory() {
    try {
      await mkdir(this.options.outputDirectory, { recursive: true });
      await mkdir(join(this.options.outputDirectory, 'screenshots'), { recursive: true });
      await mkdir(join(this.options.outputDirectory, 'reports'), { recursive: true });
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Could not create output directories:', error.message));
    }
  }
  
  // === CORE TESTING METHODS ===
  
  async runAestheticTests(themeNames = null) {
    const themesToTest = themeNames || Array.from(this.testThemes.keys());
    const results = new Map();
    
    console.log(chalk.blue(`🧪 Running aesthetic tests for ${themesToTest.length} themes...`));
    
    for (const themeName of themesToTest) {
      console.log(chalk.cyan(`Testing theme: ${themeName}`));
      
      const themeResult = await this.testTheme(themeName);
      results.set(themeName, themeResult);
      
      // Generate visual representations
      await this.generateVisualRepresentations(themeName, themeResult);
      
      console.log(chalk.green(`✅ ${themeName} tested - Score: ${themeResult.overallScore.toFixed(2)}/10`));
    }
    
    // Generate comprehensive report
    const report = await this.generateComprehensiveReport(results);
    
    console.log(chalk.green('✅ All aesthetic tests completed'));
    this.emit('tests-completed', { results, report });
    
    return { results, report };
  }
  
  async testTheme(themeName) {
    const theme = this.testThemes.get(themeName);
    if (!theme) {
      throw new Error(`Theme "${themeName}" not found`);
    }
    
    const testResult = {
      themeName,
      theme,
      testCases: new Map(),
      metrics: new Map(),
      overallScore: 0,
      categoryScores: {},
      recommendations: [],
      timestamp: Date.now()
    };
    
    // Test each test case for this theme
    for (const testCase of theme.testCases) {
      const caseResult = await this.runTestCase(theme, testCase);
      testResult.testCases.set(testCase, caseResult);
    }
    
    // Calculate aesthetic metrics
    for (const [metricName, metric] of this.aestheticMetrics) {
      const score = await metric.calculate(theme, testResult.testCases);
      testResult.metrics.set(metricName, {
        score,
        inRange: score >= metric.idealRange[0] && score <= metric.idealRange[1],
        metric
      });
    }
    
    // Calculate category scores
    testResult.categoryScores = this.calculateCategoryScores(testResult.metrics);
    
    // Calculate overall score
    testResult.overallScore = this.calculateOverallScore(testResult.categoryScores);
    
    // Generate recommendations
    testResult.recommendations = this.generateRecommendations(testResult);
    
    return testResult;
  }
  
  async runTestCase(theme, testCaseName) {
    const testCase = {
      name: testCaseName,
      theme: theme.name,
      renders: new Map(),
      scores: new Map(),
      issues: [],
      timestamp: Date.now()
    };
    
    // Generate renders for each format
    for (const format of this.options.testFormats) {
      try {
        const render = await this.generateRender(theme, testCaseName, format);
        testCase.renders.set(format, render);
        
        // Score this render
        const score = this.scoreRender(render, theme, testCaseName);
        testCase.scores.set(format, score);
        
      } catch (error) {
        testCase.issues.push({
          format,
          error: error.message,
          severity: 'error'
        });
      }
    }
    
    return testCase;
  }
  
  async generateRender(theme, testCaseName, format) {
    const render = {
      format,
      testCase: testCaseName,
      content: '',
      metadata: {
        width: 80,
        height: 24,
        colorDepth: format === 'ansi' ? 256 : 16,
        generated: Date.now()
      }
    };
    
    // Generate content based on test case and theme
    switch (testCaseName) {
      case 'terminal-output':
        render.content = this.generateTerminalOutput(theme, format);
        break;
      case 'code-display':
        render.content = this.generateCodeDisplay(theme, format);
        break;
      case 'data-visualization':
        render.content = this.generateDataVisualization(theme, format);
        break;
      case 'error-reporting':
        render.content = this.generateErrorReporting(theme, format);
        break;
      case 'creative-portfolio':
        render.content = this.generateCreativePortfolio(theme, format);
        break;
      case 'interactive-dashboard':
        render.content = this.generateInteractiveDashboard(theme, format);
        break;
      case 'content-showcase':
        render.content = this.generateContentShowcase(theme, format);
        break;
      case 'celebration-display':
        render.content = this.generateCelebrationDisplay(theme, format);
        break;
      case 'documentation':
        render.content = this.generateDocumentation(theme, format);
        break;
      case 'research-presentation':
        render.content = this.generateResearchPresentation(theme, format);
        break;
      case 'data-analysis':
        render.content = this.generateDataAnalysis(theme, format);
        break;
      case 'technical-report':
        render.content = this.generateTechnicalReport(theme, format);
        break;
      default:
        render.content = this.generateDefaultContent(theme, format);
    }
    
    return render;
  }
  
  // === RENDER GENERATORS ===
  
  generateTerminalOutput(theme, format) {
    const colors = theme.components.colors;
    const typography = theme.components.typography;
    
    const output = [];
    
    // Terminal header
    output.push(this.colorText('┌─ Terminal Session ─────────────────────────────────────────┐', colors.border, format));
    output.push(this.colorText('│', colors.border, format) + 
                this.colorText(' submitit v2.0.0', colors.primary, format) + 
                this.colorText(' '.repeat(47) + '│', colors.border, format));
    output.push(this.colorText('├─────────────────────────────────────────────────────────────┤', colors.border, format));
    
    // Command output
    output.push(this.colorText('│ ', colors.border, format) + 
                this.colorText('$ submitit create my-project', colors.text, format) + 
                this.colorText(' '.repeat(27) + '│', colors.border, format));
    output.push(this.colorText('│ ', colors.border, format) + 
                this.colorText('✅ Project created successfully', colors.success, format) + 
                this.colorText(' '.repeat(27) + '│', colors.border, format));
    output.push(this.colorText('│ ', colors.border, format) + 
                this.colorText('📁 Files: 12 | Size: 2.4MB', colors.textSecondary, format) + 
                this.colorText(' '.repeat(29) + '│', colors.border, format));
    
    // Progress indicators
    output.push(this.colorText('│ ', colors.border, format) + 
                this.colorText('Processing... ', colors.text, format) + 
                this.colorText('████████████████████████ 100%', colors.accent, format) + 
                this.colorText(' │', colors.border, format));
    
    output.push(this.colorText('└─────────────────────────────────────────────────────────────┘', colors.border, format));
    
    return output.join('\n');
  }
  
  generateCodeDisplay(theme, format) {
    const colors = theme.components.colors;
    
    const code = [];
    
    // Code block header
    code.push(this.colorText('// Theme Configuration', colors.textSecondary, format));
    code.push('');
    code.push(this.colorText('const', colors.accent, format) + 
              this.colorText(' theme = {', colors.text, format));
    code.push(this.colorText('  ', colors.text, format) + 
              this.colorText('colors', colors.primary, format) + 
              this.colorText(': {', colors.text, format));
    code.push(this.colorText('    ', colors.text, format) + 
              this.colorText('primary', colors.secondary, format) + 
              this.colorText(': ', colors.text, format) + 
              this.colorText(`'${colors.primary}'`, colors.success, format) + 
              this.colorText(',', colors.text, format));
    code.push(this.colorText('    ', colors.text, format) + 
              this.colorText('background', colors.secondary, format) + 
              this.colorText(': ', colors.text, format) + 
              this.colorText(`'${colors.background}'`, colors.success, format));
    code.push(this.colorText('  },', colors.text, format));
    code.push(this.colorText('  ', colors.text, format) + 
              this.colorText('typography', colors.primary, format) + 
              this.colorText(': {', colors.text, format));
    code.push(this.colorText('    ', colors.text, format) + 
              this.colorText('fontFamily', colors.secondary, format) + 
              this.colorText(': ', colors.text, format) + 
              this.colorText(`'${theme.components.typography.fontFamily}'`, colors.success, format));
    code.push(this.colorText('  }', colors.text, format));
    code.push(this.colorText('};', colors.text, format));
    
    return code.join('\n');
  }
  
  generateDataVisualization(theme, format) {
    const colors = theme.components.colors;
    
    const viz = [];
    
    // Chart header
    viz.push(this.colorText('📊 Project Statistics', colors.primary, format));
    viz.push(this.colorText('─'.repeat(60), colors.border, format));
    viz.push('');
    
    // Bar chart
    viz.push(this.colorText('Files     ', colors.text, format) + 
             this.colorText('████████████████████████', colors.accent, format) + 
             this.colorText(' 24', colors.textSecondary, format));
    viz.push(this.colorText('Images    ', colors.text, format) + 
             this.colorText('████████████', colors.secondary, format) + 
             this.colorText(' 12', colors.textSecondary, format));
    viz.push(this.colorText('Code      ', colors.text, format) + 
             this.colorText('████████', colors.primary, format) + 
             this.colorText(' 8', colors.textSecondary, format));
    viz.push(this.colorText('Docs      ', colors.text, format) + 
             this.colorText('████', colors.success, format) + 
             this.colorText(' 4', colors.textSecondary, format));
    
    viz.push('');
    viz.push(this.colorText('Total Size: 15.7 MB', colors.textSecondary, format));
    
    return viz.join('\n');
  }
  
  generateErrorReporting(theme, format) {
    const colors = theme.components.colors;
    
    const error = [];
    
    // Error header
    error.push(this.colorText('❌ ERROR REPORT', colors.error, format));
    error.push(this.colorText('═'.repeat(50), colors.error, format));
    error.push('');
    
    // Error details
    error.push(this.colorText('File: ', colors.text, format) + 
               this.colorText('project.config.js:42', colors.textSecondary, format));
    error.push(this.colorText('Type: ', colors.text, format) + 
               this.colorText('ValidationError', colors.error, format));
    error.push('');
    error.push(this.colorText('Message:', colors.text, format));
    error.push(this.colorText('  Invalid color format in theme configuration', colors.error, format));
    error.push('');
    error.push(this.colorText('Suggestion:', colors.text, format));
    error.push(this.colorText('  Use hex format: #ffffff instead of white', colors.accent, format));
    error.push('');
    error.push(this.colorText('Stack Trace:', colors.textSecondary, format));
    error.push(this.colorText('  at validateTheme (validator.js:156)', colors.textSecondary, format));
    error.push(this.colorText('  at loadTheme (theme.js:89)', colors.textSecondary, format));
    
    return error.join('\n');
  }
  
  // === METRIC CALCULATORS ===
  
  async calculateTextImageRatio(theme, testCases) {
    // Analyze text vs visual content ratio
    let totalText = 0;
    let totalVisual = 0;
    
    for (const [caseName, caseData] of testCases) {
      for (const [format, render] of caseData.renders) {
        const content = render.content;
        const textChars = content.replace(/[^\w\s]/g, '').length;
        const visualChars = content.replace(/[\w\s]/g, '').length;
        
        totalText += textChars;
        totalVisual += visualChars;
      }
    }
    
    const total = totalText + totalVisual;
    return total > 0 ? totalText / total : 0.5;
  }
  
  async calculateVisualHierarchy(theme, testCases) {
    // Assess visual hierarchy strength
    const colors = theme.components.colors;
    const typography = theme.components.typography;
    
    let hierarchyScore = 0.5; // Base score
    
    // Color contrast analysis
    const primaryBgContrast = this.calculateContrastRatio(colors.primary, colors.background);
    const textBgContrast = this.calculateContrastRatio(colors.text, colors.background);
    
    if (primaryBgContrast > 4.5) hierarchyScore += 0.2;
    if (textBgContrast > 4.5) hierarchyScore += 0.2;
    
    // Typography weight variation
    const hasWeightVariation = typography.headingWeight !== typography.fontWeight;
    if (hasWeightVariation) hierarchyScore += 0.1;
    
    return Math.min(hierarchyScore, 1.0);
  }
  
  async calculateWhiteSpaceDistribution(theme, testCases) {
    // Analyze white space usage
    const spacing = theme.components.spacing;
    
    // Calculate spacing variety
    const spacingValues = Object.values(spacing).map(s => parseInt(s) || 0);
    const spacingRange = Math.max(...spacingValues) - Math.min(...spacingValues);
    const spacingVariety = spacingRange > 20 ? 0.8 : 0.4;
    
    // Aesthetic spacing preferences
    const baseUnit = parseInt(spacing.spaceUnit) || 8;
    const isConsistent = spacingValues.every(v => v % baseUnit === 0);
    const consistencyBonus = isConsistent ? 0.2 : 0;
    
    return Math.min(spacingVariety + consistencyBonus, 1.0);
  }
  
  async calculateInformationArchitecture(theme, testCases) {
    // Assess information organization
    let structureScore = 0.6; // Base score
    
    // Test cases variety indicates good architecture planning
    const testCaseCount = testCases.size;
    if (testCaseCount >= 4) structureScore += 0.2;
    
    // Color semantic consistency
    const colors = theme.components.colors;
    const hasSemanticColors = colors.error && colors.warning && colors.success;
    if (hasSemanticColors) structureScore += 0.2;
    
    return Math.min(structureScore, 1.0);
  }
  
  async calculateNavigationClarity(theme, testCases) {
    // Assess navigation and interaction clarity
    const colors = theme.components.colors;
    
    let clarityScore = 0.5;
    
    // Clear primary/secondary distinction
    const primarySecondaryContrast = this.calculateContrastRatio(colors.primary, colors.secondary);
    if (primarySecondaryContrast > 3.0) clarityScore += 0.3;
    
    // Border definition for interface elements
    if (colors.border) clarityScore += 0.2;
    
    return Math.min(clarityScore, 1.0);
  }
  
  async calculateContentOrganization(theme, testCases) {
    // Assess content organization effectiveness
    const typography = theme.components.typography;
    
    let organizationScore = 0.6;
    
    // Line height for readability
    const lineHeight = typography.lineHeight || 1.4;
    if (lineHeight >= 1.5 && lineHeight <= 1.8) organizationScore += 0.2;
    
    // Font size appropriateness
    const fontSize = parseInt(typography.fontSize) || 14;
    if (fontSize >= 14 && fontSize <= 18) organizationScore += 0.2;
    
    return Math.min(organizationScore, 1.0);
  }
  
  async calculateVisualImpact(theme, testCases) {
    // Assess visual impact and memorability
    const aesthetics = theme.components.aesthetics;
    const colors = theme.components.colors;
    
    let impactScore = 0.3;
    
    // Contrast level impact
    switch (aesthetics.contrast) {
      case 'extreme': impactScore += 0.4; break;
      case 'high': impactScore += 0.3; break;
      case 'medium': impactScore += 0.2; break;
      default: impactScore += 0.1;
    }
    
    // Color saturation impact
    switch (aesthetics.saturation) {
      case 'neon': case 'high': impactScore += 0.2; break;
      case 'medium': impactScore += 0.1; break;
      default: impactScore += 0.05;
    }
    
    // Visual weight impact
    switch (aesthetics.visualWeight) {
      case 'intense': case 'heavy': impactScore += 0.1; break;
      default: impactScore += 0.05;
    }
    
    return Math.min(impactScore, 1.0);
  }
  
  async calculateBrandCoherence(theme, testCases) {
    // Assess brand consistency and coherence
    const colors = theme.components.colors;
    const typography = theme.components.typography;
    
    let coherenceScore = 0.5;
    
    // Monospace consistency for technical themes
    const isMonospace = typography.fontFamily.includes('mono') || 
                       typography.fontFamily.includes('Consolas') ||
                       typography.fontFamily.includes('Monaco');
    
    if (isMonospace && theme.mood === 'sophisticated') coherenceScore += 0.2;
    if (!isMonospace && theme.mood === 'energetic') coherenceScore += 0.2;
    
    // Color palette coherence
    const hasAccent = colors.accent && colors.accent !== colors.primary;
    if (hasAccent) coherenceScore += 0.1;
    
    // Emotional texture alignment
    const textureAlignment = this.assessEmotionalAlignment(theme);
    coherenceScore += textureAlignment * 0.2;
    
    return Math.min(coherenceScore, 1.0);
  }
  
  async calculateEmotionalResonance(theme, testCases) {
    // Assess emotional response appropriateness
    const mood = theme.mood;
    const emotionalTexture = theme.emotionalTexture;
    const aesthetics = theme.components.aesthetics;
    
    let resonanceScore = 0.4;
    
    // Mood-aesthetic alignment
    const alignmentScores = {
      'sophisticated': aesthetics.contrast === 'high' ? 0.3 : 0.1,
      'energetic': aesthetics.saturation === 'high' ? 0.3 : 0.1,
      'professional': aesthetics.visualWeight === 'light' ? 0.3 : 0.1,
      'serene': aesthetics.brightness === 'high' ? 0.3 : 0.1,
      'futuristic': aesthetics.contrast === 'extreme' ? 0.3 : 0.1
    };
    
    resonanceScore += alignmentScores[mood] || 0.1;
    
    // Emotional texture consistency
    if (emotionalTexture === 'intense' && aesthetics.visualWeight === 'heavy') {
      resonanceScore += 0.2;
    }
    if (emotionalTexture === 'calm' && aesthetics.visualWeight === 'light') {
      resonanceScore += 0.2;
    }
    
    return Math.min(resonanceScore, 1.0);
  }
  
  // === SCORING AND ANALYSIS ===
  
  scoreRender(render, theme, testCaseName) {
    const score = {
      overall: 0,
      readability: 0,
      aesthetics: 0,
      functionality: 0,
      issues: []
    };
    
    // Analyze content quality
    const content = render.content;
    const lines = content.split('\n');
    
    // Readability scoring
    score.readability = this.scoreReadability(content, theme);
    
    // Aesthetic scoring
    score.aesthetics = this.scoreAesthetics(content, theme);
    
    // Functionality scoring
    score.functionality = this.scoreFunctionality(content, testCaseName);
    
    // Calculate overall score
    score.overall = (score.readability * 0.4 + score.aesthetics * 0.4 + score.functionality * 0.2);
    
    return score;
  }
  
  scoreReadability(content, theme) {
    let score = 0.5;
    
    // Line length analysis
    const lines = content.split('\n');
    const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
    
    if (avgLineLength >= 40 && avgLineLength <= 80) score += 0.2;
    if (lines.length >= 10 && lines.length <= 30) score += 0.2;
    
    // Content structure
    const hasHeaders = content.includes('─') || content.includes('═');
    if (hasHeaders) score += 0.1;
    
    return Math.min(score, 1.0);
  }
  
  scoreAesthetics(content, theme) {
    let score = 0.5;
    
    // Visual elements presence
    const hasBoxChars = /[┌┐└┘├┤┬┴┼│─]/.test(content);
    const hasEmojis = /[\u{1F300}-\u{1F9FF}]/u.test(content);
    const hasColors = content.includes('\u001b[');
    
    if (hasBoxChars) score += 0.15;
    if (hasEmojis) score += 0.15;
    if (hasColors) score += 0.2;
    
    return Math.min(score, 1.0);
  }
  
  scoreFunctionality(content, testCaseName) {
    let score = 0.5;
    
    // Test case specific functionality
    switch (testCaseName) {
      case 'terminal-output':
        if (content.includes('$') || content.includes('✅')) score += 0.3;
        break;
      case 'code-display':
        if (content.includes('const') || content.includes('function')) score += 0.3;
        break;
      case 'data-visualization':
        if (content.includes('█') || content.includes('📊')) score += 0.3;
        break;
      case 'error-reporting':
        if (content.includes('❌') || content.includes('ERROR')) score += 0.3;
        break;
    }
    
    return Math.min(score, 1.0);
  }
  
  calculateCategoryScores(metrics) {
    const categories = {};
    
    // Calculate scores for each evaluation criteria category
    for (const [categoryName, category] of Object.entries(this.evaluationCriteria)) {
      let categoryScore = 0;
      let totalWeight = 0;
      
      for (const metricName of category.metrics) {
        const metricResult = metrics.get(metricName);
        if (metricResult) {
          const weight = metricResult.metric.weight;
          categoryScore += metricResult.score * weight;
          totalWeight += weight;
        }
      }
      
      categories[categoryName] = totalWeight > 0 ? categoryScore / totalWeight : 0;
    }
    
    return categories;
  }
  
  calculateOverallScore(categoryScores) {
    let overallScore = 0;
    
    for (const [categoryName, categoryScore] of Object.entries(categoryScores)) {
      const categoryWeight = this.evaluationCriteria[categoryName].weight;
      overallScore += categoryScore * categoryWeight;
    }
    
    return overallScore * 10; // Scale to 0-10
  }
  
  generateRecommendations(testResult) {
    const recommendations = [];
    const { metrics, categoryScores } = testResult;
    
    // Balance recommendations
    if (categoryScores.balance < 0.7) {
      const textImageRatio = metrics.get('textImageRatio');
      if (textImageRatio && textImageRatio.score < 0.6) {
        recommendations.push({
          category: 'balance',
          priority: 'high',
          issue: 'Text-to-image ratio too low',
          suggestion: 'Increase textual content or reduce visual complexity'
        });
      }
      
      const whiteSpace = metrics.get('whiteSpaceDistribution');
      if (whiteSpace && whiteSpace.score < 0.3) {
        recommendations.push({
          category: 'balance',
          priority: 'medium',
          issue: 'Insufficient white space',
          suggestion: 'Increase spacing between elements for better visual breathing room'
        });
      }
    }
    
    // Structure recommendations
    if (categoryScores.structure < 0.7) {
      recommendations.push({
        category: 'structure',
        priority: 'high',
        issue: 'Information architecture needs improvement',
        suggestion: 'Implement clearer content hierarchy and navigation patterns'
      });
    }
    
    // Aspiration recommendations
    if (categoryScores.aspiration < 0.6) {
      const visualImpact = metrics.get('visualImpact');
      if (visualImpact && visualImpact.score < 0.6) {
        recommendations.push({
          category: 'aspiration',
          priority: 'medium',
          issue: 'Low visual impact',
          suggestion: 'Enhance visual elements with higher contrast or more distinctive styling'
        });
      }
    }
    
    return recommendations;
  }
  
  // === VISUAL REPRESENTATIONS ===
  
  async generateVisualRepresentations(themeName, testResult) {
    const theme = testResult.theme;
    const representations = new Map();
    
    // ASCII Art representation
    const asciiArt = this.generateThemeASCIIArt(theme);
    representations.set('ascii-art', asciiArt);
    
    // Color palette visualization
    const colorPalette = this.generateColorPaletteVisualization(theme);
    representations.set('color-palette', colorPalette);
    
    // Typography specimen
    const typographySpecimen = this.generateTypographySpecimen(theme);
    representations.set('typography-specimen', typographySpecimen);
    
    // Metrics dashboard
    const metricsDashboard = this.generateMetricsDashboard(testResult);
    representations.set('metrics-dashboard', metricsDashboard);
    
    // Save representations
    for (const [type, content] of representations) {
      const filename = `${themeName}-${type}.txt`;
      const filepath = join(this.options.outputDirectory, 'screenshots', filename);
      await writeFile(filepath, content, 'utf8');
    }
    
    this.visualRepresentations.set(themeName, representations);
    return representations;
  }
  
  generateThemeASCIIArt(theme) {
    const colors = theme.components.colors;
    const art = [];
    
    art.push('╔══════════════════════════════════════════════════════════════════╗');
    art.push(`║                        ${theme.name.toUpperCase()} THEME                         ║`);
    art.push('╠══════════════════════════════════════════════════════════════════╣');
    art.push(`║ Mood: ${theme.mood.padEnd(20)} Texture: ${theme.emotionalTexture.padEnd(20)} ║`);
    art.push('╠══════════════════════════════════════════════════════════════════╣');
    art.push('║                          COLOR PALETTE                          ║');
    art.push('╠══════════════════════════════════════════════════════════════════╣');
    
    const colorEntries = Object.entries(colors).slice(0, 8);
    for (let i = 0; i < colorEntries.length; i += 2) {
      const left = colorEntries[i];
      const right = colorEntries[i + 1];
      
      const leftColor = left ? `${left[0]}: ${left[1]}`.padEnd(30) : ''.padEnd(30);
      const rightColor = right ? `${right[0]}: ${right[1]}`.padEnd(30) : ''.padEnd(30);
      
      art.push(`║ ${leftColor} ${rightColor} ║`);
    }
    
    art.push('╚══════════════════════════════════════════════════════════════════╝');
    
    return art.join('\n');
  }
  
  generateColorPaletteVisualization(theme) {
    const colors = theme.components.colors;
    const palette = [];
    
    palette.push(`🎨 ${theme.name} Color Palette`);
    palette.push('═'.repeat(40));
    palette.push('');
    
    for (const [colorName, colorValue] of Object.entries(colors)) {
      const colorBar = '██████████████████████████████'; // 30 chars
      palette.push(`${colorName.padEnd(15)} ${colorBar} ${colorValue}`);
    }
    
    palette.push('');
    palette.push('Aesthetic Properties:');
    palette.push(`  Contrast: ${theme.components.aesthetics.contrast}`);
    palette.push(`  Brightness: ${theme.components.aesthetics.brightness}`);
    palette.push(`  Saturation: ${theme.components.aesthetics.saturation}`);
    palette.push(`  Visual Weight: ${theme.components.aesthetics.visualWeight}`);
    
    return palette.join('\n');
  }
  
  generateTypographySpecimen(theme) {
    const typography = theme.components.typography;
    const specimen = [];
    
    specimen.push(`📝 ${theme.name} Typography Specimen`);
    specimen.push('═'.repeat(40));
    specimen.push('');
    specimen.push(`Font Family: ${typography.fontFamily}`);
    specimen.push(`Font Size: ${typography.fontSize}`);
    specimen.push(`Line Height: ${typography.lineHeight}`);
    specimen.push('');
    specimen.push('Sample Text:');
    specimen.push('');
    specimen.push('# Main Heading (Weight: ' + typography.headingWeight + ')');
    specimen.push('## Secondary Heading');
    specimen.push('');
    specimen.push('Body text demonstrates the readability and flow of the');
    specimen.push('chosen typography. This sample shows how multiple lines');
    specimen.push('of text appear with the current line height setting.');
    specimen.push('');
    specimen.push('Code example using monospace:');
    specimen.push(`const theme = { font: '${typography.fontFamilyMono}' };`);
    specimen.push('');
    specimen.push('The quick brown fox jumps over the lazy dog.');
    specimen.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    specimen.push('abcdefghijklmnopqrstuvwxyz');
    specimen.push('0123456789 !@#$%^&*()_+-=[]{}|;:,.<>?');
    
    return specimen.join('\n');
  }
  
  generateMetricsDashboard(testResult) {
    const dashboard = [];
    
    dashboard.push(`📊 ${testResult.themeName} Metrics Dashboard`);
    dashboard.push('═'.repeat(50));
    dashboard.push('');
    dashboard.push(`Overall Score: ${testResult.overallScore.toFixed(2)}/10`);
    dashboard.push('');
    
    // Category scores
    dashboard.push('Category Scores:');
    for (const [category, score] of Object.entries(testResult.categoryScores)) {
      const percentage = (score * 100).toFixed(1);
      const bar = '█'.repeat(Math.floor(score * 20));
      const description = this.evaluationCriteria[category].description;
      
      dashboard.push(`  ${category.padEnd(12)} ${bar.padEnd(20)} ${percentage}%`);
      dashboard.push(`    ${description}`);
      dashboard.push('');
    }
    
    // Individual metrics
    dashboard.push('Individual Metrics:');
    for (const [metricName, metricResult] of testResult.metrics) {
      const score = (metricResult.score * 100).toFixed(1);
      const status = metricResult.inRange ? '✅' : '⚠️';
      
      dashboard.push(`  ${status} ${metricName}: ${score}%`);
    }
    
    // Recommendations
    if (testResult.recommendations.length > 0) {
      dashboard.push('');
      dashboard.push('Recommendations:');
      testResult.recommendations.forEach((rec, index) => {
        dashboard.push(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.issue}`);
        dashboard.push(`     → ${rec.suggestion}`);
      });
    }
    
    return dashboard.join('\n');
  }
  
  // === UTILITY METHODS ===
  
  colorText(text, color, format) {
    if (format === 'ansi' && color) {
      // Simple ANSI color approximation
      try {
        return chalk.hex(color)(text);
      } catch {
        return text;
      }
    }
    return text;
  }
  
  calculateContrastRatio(color1, color2) {
    // Simplified contrast calculation
    if (!color1 || !color2) return 1;
    
    try {
      const rgb1 = this.hexToRgb(color1);
      const rgb2 = this.hexToRgb(color2);
      
      if (!rgb1 || !rgb2) return 1;
      
      const l1 = this.luminance(rgb1);
      const l2 = this.luminance(rgb2);
      
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      
      return (lighter + 0.05) / (darker + 0.05);
    } catch {
      return 1;
    }
  }
  
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  luminance(rgb) {
    const { r, g, b } = rgb;
    const rs = r / 255;
    const gs = g / 255;
    const bs = b / 255;
    
    const adjustColor = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    
    return 0.2126 * adjustColor(rs) + 0.7152 * adjustColor(gs) + 0.0722 * adjustColor(bs);
  }
  
  assessEmotionalAlignment(theme) {
    const { mood, emotionalTexture, components } = theme;
    const { aesthetics } = components;
    
    // Simple alignment scoring
    let alignment = 0.5;
    
    if (mood === 'sophisticated' && aesthetics.contrast === 'high') alignment += 0.3;
    if (mood === 'energetic' && aesthetics.saturation === 'high') alignment += 0.3;
    if (emotionalTexture === 'calm' && aesthetics.visualWeight === 'light') alignment += 0.2;
    
    return Math.min(alignment, 1.0);
  }
  
  // === COMPREHENSIVE REPORTING ===
  
  async generateComprehensiveReport(results) {
    const report = {
      summary: this.generateSummary(results),
      themeComparison: this.generateThemeComparison(results),
      recommendations: this.generateGlobalRecommendations(results),
      bestPractices: this.generateBestPractices(results),
      timestamp: Date.now()
    };
    
    // Save comprehensive report
    const reportPath = join(this.options.outputDirectory, 'reports', 'aesthetic-test-report.json');
    await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
    
    // Generate human-readable report
    const readableReport = this.generateReadableReport(report);
    const readablePath = join(this.options.outputDirectory, 'reports', 'aesthetic-test-report.txt');
    await writeFile(readablePath, readableReport, 'utf8');
    
    return report;
  }
  
  generateSummary(results) {
    const themes = Array.from(results.values());
    
    return {
      totalThemes: themes.length,
      averageScore: themes.reduce((sum, t) => sum + t.overallScore, 0) / themes.length,
      highestScore: Math.max(...themes.map(t => t.overallScore)),
      lowestScore: Math.min(...themes.map(t => t.overallScore)),
      bestTheme: themes.reduce((best, current) => 
        current.overallScore > best.overallScore ? current : best
      ).themeName,
      testCaseCoverage: this.calculateTestCaseCoverage(results)
    };
  }
  
  generateThemeComparison(results) {
    const comparison = [];
    
    for (const [themeName, result] of results) {
      comparison.push({
        name: themeName,
        score: result.overallScore,
        mood: result.theme.mood,
        emotionalTexture: result.theme.emotionalTexture,
        strengths: this.identifyStrengths(result),
        weaknesses: this.identifyWeaknesses(result)
      });
    }
    
    return comparison.sort((a, b) => b.score - a.score);
  }
  
  generateGlobalRecommendations(results) {
    const recommendations = [];
    
    // Analyze common issues across themes
    const commonIssues = this.identifyCommonIssues(results);
    
    for (const issue of commonIssues) {
      recommendations.push({
        type: 'global',
        priority: issue.frequency > 0.7 ? 'high' : 'medium',
        issue: issue.description,
        affectedThemes: issue.themes,
        suggestion: issue.solution
      });
    }
    
    return recommendations;
  }
  
  generateBestPractices(results) {
    const practices = [];
    
    // Extract successful patterns
    const topThemes = Array.from(results.values())
      .filter(r => r.overallScore > 7.0)
      .map(r => r.theme);
    
    if (topThemes.length > 0) {
      practices.push({
        category: 'color',
        practice: 'High contrast themes consistently score higher',
        evidence: topThemes.filter(t => t.components.aesthetics.contrast === 'high').length
      });
      
      practices.push({
        category: 'typography',
        practice: 'Appropriate line height improves readability scores',
        evidence: topThemes.filter(t => t.components.typography.lineHeight >= 1.5).length
      });
    }
    
    return practices;
  }
  
  generateReadableReport(report) {
    const readable = [];
    
    readable.push('AESTHETIC TESTING SUITE - COMPREHENSIVE REPORT');
    readable.push('═'.repeat(60));
    readable.push('');
    readable.push(`Generated: ${new Date(report.timestamp).toLocaleString()}`);
    readable.push('');
    
    // Summary
    readable.push('SUMMARY');
    readable.push('─'.repeat(60));
    readable.push(`Themes Tested: ${report.summary.totalThemes}`);
    readable.push(`Average Score: ${report.summary.averageScore.toFixed(2)}/10`);
    readable.push(`Best Theme: ${report.summary.bestTheme} (${report.summary.highestScore.toFixed(2)}/10)`);
    readable.push('');
    
    // Theme comparison
    readable.push('THEME COMPARISON');
    readable.push('─'.repeat(60));
    report.themeComparison.forEach((theme, index) => {
      readable.push(`${index + 1}. ${theme.name} - ${theme.score.toFixed(2)}/10`);
      readable.push(`   Mood: ${theme.mood} | Texture: ${theme.emotionalTexture}`);
      readable.push(`   Strengths: ${theme.strengths.join(', ')}`);
      readable.push(`   Areas for improvement: ${theme.weaknesses.join(', ')}`);
      readable.push('');
    });
    
    // Recommendations
    if (report.recommendations.length > 0) {
      readable.push('GLOBAL RECOMMENDATIONS');
      readable.push('─'.repeat(60));
      report.recommendations.forEach((rec, index) => {
        readable.push(`${index + 1}. [${rec.priority.toUpperCase()}] ${rec.issue}`);
        readable.push(`   Solution: ${rec.suggestion}`);
        readable.push(`   Affects: ${rec.affectedThemes.join(', ')}`);
        readable.push('');
      });
    }
    
    return readable.join('\n');
  }
  
  // === VALIDATION SCRIPT GENERATION ===
  
  async generateValidationScript() {
    const script = `#!/usr/bin/env node

/**
 * Aesthetic Integration Validation Script
 * Auto-generated validation script for theme testing
 */

import { AestheticTestingSuite } from './lib/AestheticTestingSuite.js';

async function validateAestheticIntegration() {
  console.log('🧪 Starting Aesthetic Integration Validation...');
  
  const testSuite = new AestheticTestingSuite({
    enableScreenshotGeneration: true,
    enableMetricsCalculation: true,
    outputDirectory: './test-results'
  });
  
  try {
    // Run comprehensive tests
    const results = await testSuite.runAestheticTests();
    
    // Validation criteria
    const validationCriteria = {
      minimumOverallScore: 6.0,
      minimumThemesPass: 3,
      requiredCategories: ['balance', 'structure', 'aspiration']
    };
    
    // Validate results
    const validation = validateResults(results.results, validationCriteria);
    
    if (validation.passed) {
      console.log('✅ Aesthetic integration validation PASSED');
      process.exit(0);
    } else {
      console.log('❌ Aesthetic integration validation FAILED');
      console.log('Issues:', validation.issues);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Validation failed with error:', error.message);
    process.exit(1);
  }
}

function validateResults(results, criteria) {
  const validation = { passed: true, issues: [] };
  
  // Check minimum scores
  const passedThemes = Array.from(results.values())
    .filter(r => r.overallScore >= criteria.minimumOverallScore);
  
  if (passedThemes.length < criteria.minimumThemesPass) {
    validation.passed = false;
    validation.issues.push(\`Only \${passedThemes.length} themes passed minimum score\`);
  }
  
  // Check category coverage
  for (const theme of passedThemes) {
    for (const category of criteria.requiredCategories) {
      if (!theme.categoryScores[category] || theme.categoryScores[category] < 0.6) {
        validation.passed = false;
        validation.issues.push(\`Theme \${theme.themeName} failed \${category} category\`);
      }
    }
  }
  
  return validation;
}

// Run validation
validateAestheticIntegration();
`;
    
    const scriptPath = join(this.options.outputDirectory, 'validate-aesthetics.js');
    await writeFile(scriptPath, script, 'utf8');
    
    console.log(chalk.green(`✅ Validation script generated: ${scriptPath}`));
    return scriptPath;
  }
  
  // === HELPER METHODS ===
  
  calculateTestCaseCoverage(results) {
    const allTestCases = new Set();
    
    for (const result of results.values()) {
      for (const testCase of result.testCases.keys()) {
        allTestCases.add(testCase);
      }
    }
    
    return Array.from(allTestCases);
  }
  
  identifyStrengths(result) {
    const strengths = [];
    
    for (const [category, score] of Object.entries(result.categoryScores)) {
      if (score > 0.8) {
        strengths.push(category);
      }
    }
    
    return strengths;
  }
  
  identifyWeaknesses(result) {
    const weaknesses = [];
    
    for (const [category, score] of Object.entries(result.categoryScores)) {
      if (score < 0.6) {
        weaknesses.push(category);
      }
    }
    
    return weaknesses;
  }
  
  identifyCommonIssues(results) {
    const issueMap = new Map();
    
    for (const result of results.values()) {
      for (const recommendation of result.recommendations) {
        const key = recommendation.issue;
        
        if (!issueMap.has(key)) {
          issueMap.set(key, {
            description: key,
            themes: [],
            solution: recommendation.suggestion,
            frequency: 0
          });
        }
        
        const issue = issueMap.get(key);
        issue.themes.push(result.themeName);
        issue.frequency = issue.themes.length / results.size;
      }
    }
    
    return Array.from(issueMap.values()).filter(issue => issue.frequency > 0.3);
  }
  
  // === PUBLIC API ===
  
  printTestSuiteReport() {
    console.log(chalk.blue('\n🧪 Aesthetic Testing Suite Report'));
    console.log(chalk.blue('==================================='));
    
    console.log(chalk.cyan('\n🎨 Available Test Themes:'));
    for (const [name, theme] of this.testThemes) {
      console.log(`  ${name}: ${theme.description}`);
      console.log(`    Mood: ${theme.mood} | Texture: ${theme.emotionalTexture}`);
      console.log(`    Test Cases: ${theme.testCases.join(', ')}`);
    }
    
    console.log(chalk.cyan('\n📊 Evaluation Criteria:'));
    for (const [name, criteria] of Object.entries(this.evaluationCriteria)) {
      console.log(`  ${name} (${(criteria.weight * 100).toFixed(0)}%): ${criteria.description}`);
      console.log(`    Metrics: ${criteria.metrics.join(', ')}`);
    }
    
    console.log(chalk.green('\n✅ Testing suite ready for execution'));
  }
  
  dispose() {
    console.log(chalk.yellow('🧹 Disposing Aesthetic Testing Suite...'));
    
    this.testThemes.clear();
    this.aestheticMetrics.clear();
    this.testResults.clear();
    this.visualRepresentations.clear();
    this.removeAllListeners();
    
    console.log(chalk.green('✅ Testing suite disposed'));
  }
}

export default AestheticTestingSuite;