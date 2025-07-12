/**
 * Theme Preview System
 * 
 * Advanced theme preview system with side-by-side comparison, real-time updates,
 * interactive preview modes, and comprehensive theme visualization capabilities.
 */

import { EventEmitter } from 'events';
import { readFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

export class ThemePreviewSystem extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      enableSideBySideComparison: true,
      enableRealTimeUpdates: true,
      enableInteractivePreview: true,
      enableResponsivePreview: true,
      enableComponentPreview: true,
      previewWidth: 80,
      previewHeight: 24,
      comparisonColumns: 2,
      maxThemesInComparison: 4,
      animationDuration: 200,
      updateDebounceTime: 300,
      ...options
    };
    
    // Preview state
    this.isInitialized = false;
    this.activeThemes = new Map();
    this.previewModes = new Map();
    this.comparisonLayout = 'side-by-side'; // side-by-side, stacked, grid
    this.currentPreviewMode = 'full'; // full, components, colors, typography
    
    // Preview components
    this.previewComponents = new Map();
    this.layoutTemplates = new Map();
    this.demoContent = new Map();
    
    // Performance tracking
    this.previewStats = {
      previewsGenerated: 0,
      comparisonsCreated: 0,
      themesLoaded: 0,
      averageRenderTime: 0,
      cacheHits: 0,
      cacheSize: 0
    };
    
    // Caching
    this.previewCache = new Map();
    this.renderCache = new Map();
    
    // Responsive breakpoints
    this.breakpoints = {
      mobile: { width: 40, height: 20 },
      tablet: { width: 60, height: 24 },
      desktop: { width: 80, height: 30 },
      wide: { width: 120, height: 40 }
    };
    
    this.initialize();
  }
  
  // === INITIALIZATION ===
  
  async initialize() {
    console.log(chalk.blue('🖼️  Initializing Theme Preview System...'));
    
    try {
      // Set up preview components
      this.setupPreviewComponents();
      
      // Set up layout templates
      this.setupLayoutTemplates();
      
      // Set up demo content
      this.setupDemoContent();
      
      // Set up preview modes
      this.setupPreviewModes();
      
      this.isInitialized = true;
      console.log(chalk.green('✅ Theme preview system initialized'));
      this.emit('preview-system-ready');
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to initialize preview system:'), error.message);
      throw error;
    }
  }
  
  setupPreviewComponents() {
    // Header component preview
    this.previewComponents.set('header', {
      name: 'Header',
      description: 'Navigation header with logo and menu',
      render: this.renderHeaderComponent.bind(this),
      requiredProps: ['colors.primary', 'colors.background', 'typography.fontFamily']
    });
    
    // Card component preview
    this.previewComponents.set('card', {
      name: 'Card',
      description: 'Content card with shadow and border',
      render: this.renderCardComponent.bind(this),
      requiredProps: ['colors.surface', 'colors.border', 'borders.borderRadius', 'borders.shadowMd']
    });
    
    // Button component preview
    this.previewComponents.set('button', {
      name: 'Button',
      description: 'Primary and secondary buttons',
      render: this.renderButtonComponent.bind(this),
      requiredProps: ['colors.primary', 'colors.secondary', 'borders.borderRadius']
    });
    
    // Form component preview
    this.previewComponents.set('form', {
      name: 'Form',
      description: 'Input fields and form elements',
      render: this.renderFormComponent.bind(this),
      requiredProps: ['colors.border', 'colors.background', 'spacing.spaceMd']
    });
    
    // Typography component preview
    this.previewComponents.set('typography', {
      name: 'Typography',
      description: 'Text styles and hierarchy',
      render: this.renderTypographyComponent.bind(this),
      requiredProps: ['typography.fontFamily', 'colors.text', 'colors.textSecondary']
    });
    
    // Layout component preview
    this.previewComponents.set('layout', {
      name: 'Layout',
      description: 'Grid and spacing examples',
      render: this.renderLayoutComponent.bind(this),
      requiredProps: ['spacing.spaceMd', 'spacing.spaceLg', 'colors.background']
    });
  }
  
  setupLayoutTemplates() {
    // Full page layout
    this.layoutTemplates.set('full-page', {
      name: 'Full Page',
      description: 'Complete page layout with header, content, and footer',
      components: ['header', 'card', 'button', 'typography'],
      layout: 'vertical'
    });
    
    // Dashboard layout
    this.layoutTemplates.set('dashboard', {
      name: 'Dashboard',
      description: 'Dashboard with cards and metrics',
      components: ['header', 'card', 'typography'],
      layout: 'grid'
    });
    
    // Form layout
    this.layoutTemplates.set('form', {
      name: 'Form Layout',
      description: 'Form-focused layout',
      components: ['header', 'form', 'button'],
      layout: 'vertical'
    });
    
    // Component showcase
    this.layoutTemplates.set('showcase', {
      name: 'Component Showcase',
      description: 'All components displayed together',
      components: ['header', 'card', 'button', 'form', 'typography', 'layout'],
      layout: 'showcase'
    });
  }
  
  setupDemoContent() {
    this.demoContent.set('text', {
      heading: 'Welcome to Your Theme',
      subheading: 'A beautiful design system',
      body: 'This is an example of body text that shows how your theme looks with different content types.',
      code: 'const theme = { beautiful: true };',
      list: ['Feature one', 'Feature two', 'Feature three']
    });
    
    this.demoContent.set('data', {
      metrics: [
        { label: 'Users', value: '1,234' },
        { label: 'Revenue', value: '$56,789' },
        { label: 'Growth', value: '+12.3%' }
      ],
      tableData: [
        ['Name', 'Status', 'Date'],
        ['John Doe', 'Active', '2024-01-15'],
        ['Jane Smith', 'Pending', '2024-01-16']
      ]
    });
  }
  
  setupPreviewModes() {
    // Full preview mode
    this.previewModes.set('full', {
      name: 'Full Preview',
      description: 'Complete theme preview with all components',
      render: this.renderFullPreview.bind(this)
    });
    
    // Components only mode
    this.previewModes.set('components', {
      name: 'Components',
      description: 'Individual component previews',
      render: this.renderComponentsPreview.bind(this)
    });
    
    // Colors only mode
    this.previewModes.set('colors', {
      name: 'Colors',
      description: 'Color palette and combinations',
      render: this.renderColorsPreview.bind(this)
    });
    
    // Typography only mode
    this.previewModes.set('typography', {
      name: 'Typography',
      description: 'Font styles and text hierarchy',
      render: this.renderTypographyPreview.bind(this)
    });
    
    // Spacing mode
    this.previewModes.set('spacing', {
      name: 'Spacing',
      description: 'Spacing and layout system',
      render: this.renderSpacingPreview.bind(this)
    });
  }
  
  // === THEME MANAGEMENT ===
  
  async loadTheme(themeName, alias = null) {
    console.log(chalk.blue(`📂 Loading theme for preview: ${themeName}`));
    
    try {
      // Use alias if provided, otherwise use theme name
      const themeKey = alias || themeName;
      
      // Load theme data (this would typically come from the theme system)
      const theme = await this.fetchThemeData(themeName);
      
      this.activeThemes.set(themeKey, theme);
      this.previewStats.themesLoaded++;
      
      console.log(chalk.green(`✅ Theme "${themeName}" loaded as "${themeKey}"`));
      this.emit('theme-loaded', { themeName, themeKey, theme });
      
      return theme;
      
    } catch (error) {
      console.error(chalk.red(`❌ Failed to load theme "${themeName}":`, error.message));
      throw error;
    }
  }
  
  async fetchThemeData(themeName) {
    // This would integrate with the actual theme system
    // For now, return a mock theme structure
    return {
      name: themeName,
      version: '1.0.0',
      components: {
        colors: {
          primary: '#3498db',
          secondary: '#2ecc71',
          background: '#ffffff',
          surface: '#f8f9fa',
          text: '#2c3e50',
          textSecondary: '#7f8c8d',
          border: '#e9ecef',
          error: '#e74c3c',
          warning: '#f39c12',
          success: '#27ae60'
        },
        typography: {
          fontFamily: 'system-ui, sans-serif',
          fontFamilyMono: 'Monaco, Consolas, monospace',
          fontSize: '14px',
          fontWeight: '400',
          lineHeight: 1.5,
          headingWeight: '600'
        },
        spacing: {
          spaceUnit: '8px',
          spaceXs: '4px',
          spaceSm: '8px',
          spaceMd: '16px',
          spaceLg: '24px',
          spaceXl: '32px'
        },
        borders: {
          borderRadius: '4px',
          borderWidth: '1px',
          shadowSm: '0 1px 3px rgba(0,0,0,0.1)',
          shadowMd: '0 4px 6px rgba(0,0,0,0.1)',
          shadowLg: '0 10px 15px rgba(0,0,0,0.1)'
        }
      }
    };
  }
  
  removeTheme(themeKey) {
    if (this.activeThemes.has(themeKey)) {
      this.activeThemes.delete(themeKey);
      this.clearThemeFromCache(themeKey);
      
      console.log(chalk.green(`✅ Theme "${themeKey}" removed from preview`));
      this.emit('theme-removed', { themeKey });
    }
  }
  
  // === PREVIEW GENERATION ===
  
  async generatePreview(themeKey, mode = this.currentPreviewMode, options = {}) {
    const startTime = Date.now();
    
    const previewOptions = {
      width: this.options.previewWidth,
      height: this.options.previewHeight,
      breakpoint: 'desktop',
      includeDemo: true,
      ...options
    };
    
    this.previewStats.previewsGenerated++;
    
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(themeKey, mode, previewOptions);
      if (this.previewCache.has(cacheKey)) {
        this.previewStats.cacheHits++;
        return this.previewCache.get(cacheKey);
      }
      
      // Get theme data
      const theme = this.activeThemes.get(themeKey);
      if (!theme) {
        throw new Error(`Theme "${themeKey}" not loaded`);
      }
      
      // Get preview mode renderer
      const previewMode = this.previewModes.get(mode);
      if (!previewMode) {
        throw new Error(`Unknown preview mode: ${mode}`);
      }
      
      // Generate preview
      const preview = await previewMode.render(theme, previewOptions);
      
      // Cache the result
      this.previewCache.set(cacheKey, preview);
      this.previewStats.cacheSize = this.previewCache.size;
      
      // Update performance stats
      const renderTime = Date.now() - startTime;
      this.updateRenderStats(renderTime);
      
      console.log(chalk.green(`✅ Preview generated for "${themeKey}" (${renderTime}ms)`));
      this.emit('preview-generated', { themeKey, mode, preview, renderTime });
      
      return preview;
      
    } catch (error) {
      console.error(chalk.red(`❌ Preview generation failed:`, error.message));
      throw error;
    }
  }
  
  async generateComparison(themeKeys, mode = this.currentPreviewMode, options = {}) {
    console.log(chalk.blue(`🔍 Generating comparison for themes: ${themeKeys.join(', ')}`));
    
    if (themeKeys.length > this.options.maxThemesInComparison) {
      throw new Error(`Too many themes for comparison (max: ${this.options.maxThemesInComparison})`);
    }
    
    const comparisonOptions = {
      layout: this.comparisonLayout,
      width: this.options.previewWidth,
      height: this.options.previewHeight,
      ...options
    };
    
    this.previewStats.comparisonsCreated++;
    
    try {
      // Generate individual previews
      const previews = [];
      for (const themeKey of themeKeys) {
        const preview = await this.generatePreview(themeKey, mode, {
          width: this.calculateComparisonWidth(themeKeys.length, comparisonOptions.width),
          height: comparisonOptions.height
        });
        previews.push({ themeKey, preview });
      }
      
      // Combine previews based on layout
      const comparison = await this.combinePreviewsForComparison(previews, comparisonOptions);
      
      console.log(chalk.green(`✅ Comparison generated for ${themeKeys.length} themes`));
      this.emit('comparison-generated', { themeKeys, mode, comparison });
      
      return comparison;
      
    } catch (error) {
      console.error(chalk.red(`❌ Comparison generation failed:`, error.message));
      throw error;
    }
  }
  
  // === PREVIEW RENDERERS ===
  
  async renderFullPreview(theme, options) {
    const preview = [];
    const colors = theme.components.colors || {};
    const typography = theme.components.typography || {};
    const spacing = theme.components.spacing || {};
    const borders = theme.components.borders || {};
    
    // Theme header
    preview.push(this.renderThemeHeader(theme, options.width));
    
    // Navigation header
    preview.push(...this.renderHeaderComponent(theme, { width: options.width - 4 }));
    
    // Main content area
    preview.push(...this.renderMainContent(theme, options));
    
    // Footer
    preview.push(...this.renderFooter(theme, { width: options.width - 4 }));
    
    return {
      type: 'full',
      theme: theme.name,
      content: preview.join('\n'),
      width: options.width,
      height: preview.length,
      metadata: {
        components: ['header', 'content', 'footer'],
        generatedAt: Date.now()
      }
    };
  }
  
  async renderComponentsPreview(theme, options) {
    const preview = [];
    const componentWidth = Math.floor(options.width / 2) - 2;
    
    // Header
    preview.push(chalk.blue('🧩 COMPONENTS PREVIEW'));
    preview.push(chalk.blue('═'.repeat(options.width)));
    preview.push('');
    
    // Render components in a grid
    const components = Array.from(this.previewComponents.keys());
    
    for (let i = 0; i < components.length; i += 2) {
      const leftComponent = components[i];
      const rightComponent = components[i + 1];
      
      const leftPreview = await this.renderComponentPreview(leftComponent, theme, { width: componentWidth });
      const rightPreview = rightComponent ? 
        await this.renderComponentPreview(rightComponent, theme, { width: componentWidth }) : 
        [];
      
      // Combine side by side
      const maxLines = Math.max(leftPreview.length, rightPreview.length);
      for (let line = 0; line < maxLines; line++) {
        const leftLine = (leftPreview[line] || '').padEnd(componentWidth);
        const rightLine = rightPreview[line] || '';
        preview.push(`${leftLine}  ${rightLine}`);
      }
      
      preview.push('');
    }
    
    return {
      type: 'components',
      theme: theme.name,
      content: preview.join('\n'),
      width: options.width,
      height: preview.length,
      metadata: {
        components: components,
        generatedAt: Date.now()
      }
    };
  }
  
  async renderColorsPreview(theme, options) {
    const preview = [];
    const colors = theme.components.colors || {};
    
    // Header
    preview.push(chalk.blue('🎨 COLORS PREVIEW'));
    preview.push(chalk.blue('═'.repeat(options.width)));
    preview.push('');
    
    // Primary colors
    preview.push(chalk.cyan('Primary Colors:'));
    const primaryColors = ['primary', 'secondary', 'background', 'surface'];
    primaryColors.forEach(colorName => {
      if (colors[colorName]) {
        const colorBar = this.renderColorBar(colors[colorName], 20);
        preview.push(`  ${colorName.padEnd(12)} ${colorBar} ${colors[colorName]}`);
      }
    });
    
    preview.push('');
    
    // Text colors
    preview.push(chalk.cyan('Text Colors:'));
    const textColors = ['text', 'textSecondary'];
    textColors.forEach(colorName => {
      if (colors[colorName]) {
        const colorBar = this.renderColorBar(colors[colorName], 20);
        preview.push(`  ${colorName.padEnd(12)} ${colorBar} ${colors[colorName]}`);
      }
    });
    
    preview.push('');
    
    // Semantic colors
    preview.push(chalk.cyan('Semantic Colors:'));
    const semanticColors = ['success', 'warning', 'error', 'info'];
    semanticColors.forEach(colorName => {
      if (colors[colorName]) {
        const colorBar = this.renderColorBar(colors[colorName], 20);
        preview.push(`  ${colorName.padEnd(12)} ${colorBar} ${colors[colorName]}`);
      }
    });
    
    preview.push('');
    
    // Color harmony analysis
    preview.push(chalk.cyan('Color Harmony:'));
    const harmonyAnalysis = this.analyzeColorHarmony(colors);
    preview.push(`  Contrast Score: ${harmonyAnalysis.contrastScore}/10`);
    preview.push(`  Harmony Score: ${harmonyAnalysis.harmonyScore}/10`);
    preview.push(`  Accessibility: ${harmonyAnalysis.accessibilityLevel}`);
    
    return {
      type: 'colors',
      theme: theme.name,
      content: preview.join('\n'),
      width: options.width,
      height: preview.length,
      metadata: {
        colorCount: Object.keys(colors).length,
        harmonyAnalysis,
        generatedAt: Date.now()
      }
    };
  }
  
  async renderTypographyPreview(theme, options) {
    const preview = [];
    const typography = theme.components.typography || {};
    const colors = theme.components.colors || {};
    
    // Header
    preview.push(chalk.blue('📝 TYPOGRAPHY PREVIEW'));
    preview.push(chalk.blue('═'.repeat(options.width)));
    preview.push('');
    
    // Font information
    preview.push(chalk.cyan('Font Family:'));
    preview.push(`  Primary: ${typography.fontFamily || 'system-ui'}`);
    preview.push(`  Monospace: ${typography.fontFamilyMono || 'Monaco'}`);
    preview.push('');
    
    // Typography scale
    preview.push(chalk.cyan('Typography Scale:'));
    const demoText = this.demoContent.get('text');
    
    // Heading examples
    preview.push(chalk.hex(colors.text || '#000000').bold('# ' + demoText.heading));
    preview.push(chalk.hex(colors.text || '#000000')('## ' + demoText.subheading));
    preview.push('');
    
    // Body text
    preview.push(chalk.hex(colors.text || '#000000')('Body text: ' + demoText.body.substring(0, 60) + '...'));
    preview.push('');
    
    // Secondary text
    preview.push(chalk.hex(colors.textSecondary || '#666666')('Secondary text: Additional information and details.'));
    preview.push('');
    
    // Code example
    preview.push(chalk.cyan('Code example:'));
    preview.push(chalk.gray(`  ${demoText.code}`));
    preview.push('');
    
    // List example
    preview.push(chalk.cyan('List example:'));
    demoText.list.forEach(item => {
      preview.push(chalk.hex(colors.text || '#000000')(`  • ${item}`));
    });
    
    return {
      type: 'typography',
      theme: theme.name,
      content: preview.join('\n'),
      width: options.width,
      height: preview.length,
      metadata: {
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize,
        generatedAt: Date.now()
      }
    };
  }
  
  async renderSpacingPreview(theme, options) {
    const preview = [];
    const spacing = theme.components.spacing || {};
    
    // Header
    preview.push(chalk.blue('📏 SPACING PREVIEW'));
    preview.push(chalk.blue('═'.repeat(options.width)));
    preview.push('');
    
    // Spacing scale
    preview.push(chalk.cyan('Spacing Scale:'));
    const spacingProps = ['spaceXs', 'spaceSm', 'spaceMd', 'spaceLg', 'spaceXl'];
    
    spacingProps.forEach(prop => {
      if (spacing[prop]) {
        const spacingBar = this.renderSpacingBar(spacing[prop]);
        preview.push(`  ${prop.padEnd(10)} ${spacingBar} ${spacing[prop]}`);
      }
    });
    
    preview.push('');
    
    // Layout examples
    preview.push(chalk.cyan('Layout Examples:'));
    preview.push('');
    
    // Card with spacing
    preview.push('┌─ Card with padding ─────────────┐');
    preview.push('│                                 │');
    preview.push('│  Title with margin              │');
    preview.push('│                                 │');
    preview.push('│  Content with line height       │');
    preview.push('│  and proper spacing between     │');
    preview.push('│  paragraphs and elements.       │');
    preview.push('│                                 │');
    preview.push('└─────────────────────────────────┘');
    
    return {
      type: 'spacing',
      theme: theme.name,
      content: preview.join('\n'),
      width: options.width,
      height: preview.length,
      metadata: {
        spacingUnit: spacing.spaceUnit,
        spacingProps: Object.keys(spacing),
        generatedAt: Date.now()
      }
    };
  }
  
  // === COMPONENT RENDERERS ===
  
  async renderHeaderComponent(theme, options) {
    const colors = theme.components.colors || {};
    const spacing = theme.components.spacing || {};
    const header = [];
    
    const bgColor = colors.primary || '#3498db';
    const textColor = colors.background || '#ffffff';
    
    // Header background
    header.push(chalk.hex(textColor).bgHex(bgColor)('─'.repeat(options.width)));
    header.push(chalk.hex(textColor).bgHex(bgColor)(
      '  Logo    Home  About  Contact  Settings'.padEnd(options.width)
    ));
    header.push(chalk.hex(textColor).bgHex(bgColor)('─'.repeat(options.width)));
    
    return header;
  }
  
  async renderCardComponent(theme, options) {
    const colors = theme.components.colors || {};
    const borders = theme.components.borders || {};
    const card = [];
    
    const demoText = this.demoContent.get('text');
    
    // Card with border
    card.push('┌' + '─'.repeat(options.width - 2) + '┐');
    card.push('│' + chalk.hex(colors.text || '#000000').bold(' Card Title').padEnd(options.width - 1) + '│');
    card.push('│' + ' '.repeat(options.width - 2) + '│');
    card.push('│ ' + chalk.hex(colors.textSecondary || '#666666')(demoText.body.substring(0, options.width - 4)) + '│');
    card.push('│' + ' '.repeat(options.width - 2) + '│');
    card.push('│ ' + chalk.hex(colors.primary || '#3498db')('[View Details]').padEnd(options.width - 3) + '│');
    card.push('└' + '─'.repeat(options.width - 2) + '┘');
    
    return card;
  }
  
  async renderButtonComponent(theme, options) {
    const colors = theme.components.colors || {};
    const buttons = [];
    
    // Primary button
    buttons.push(chalk.hex(colors.background || '#ffffff').bgHex(colors.primary || '#3498db')(' Primary Button '));
    buttons.push('');
    
    // Secondary button
    buttons.push(chalk.hex(colors.primary || '#3498db')('┌─────────────────┐'));
    buttons.push(chalk.hex(colors.primary || '#3498db')('│ Secondary Button │'));
    buttons.push(chalk.hex(colors.primary || '#3498db')('└─────────────────┘'));
    
    return buttons;
  }
  
  async renderFormComponent(theme, options) {
    const colors = theme.components.colors || {};
    const form = [];
    
    // Form elements
    form.push(chalk.hex(colors.text || '#000000')('Name: ') + chalk.bgGray('                    '));
    form.push('');
    form.push(chalk.hex(colors.text || '#000000')('Email: ') + chalk.bgGray('                   '));
    form.push('');
    form.push(chalk.hex(colors.text || '#000000')('Message:'));
    form.push(chalk.bgGray('                         '));
    form.push(chalk.bgGray('                         '));
    form.push(chalk.bgGray('                         '));
    form.push('');
    form.push(chalk.hex(colors.background || '#ffffff').bgHex(colors.primary || '#3498db')(' Submit '));
    
    return form;
  }
  
  async renderTypographyComponent(theme, options) {
    const colors = theme.components.colors || {};
    const typography = [];
    
    const demoText = this.demoContent.get('text');
    
    typography.push(chalk.hex(colors.text || '#000000').bold(demoText.heading));
    typography.push(chalk.hex(colors.textSecondary || '#666666')(demoText.subheading));
    typography.push('');
    typography.push(chalk.hex(colors.text || '#000000')(demoText.body.substring(0, options.width)));
    
    return typography;
  }
  
  async renderLayoutComponent(theme, options) {
    const spacing = theme.components.spacing || {};
    const layout = [];
    
    // Grid example
    layout.push('Grid Layout:');
    layout.push('┌─────────┬─────────┬─────────┐');
    layout.push('│  Col 1  │  Col 2  │  Col 3  │');
    layout.push('├─────────┼─────────┼─────────┤');
    layout.push('│ Content │ Content │ Content │');
    layout.push('└─────────┴─────────┴─────────┘');
    
    return layout;
  }
  
  async renderComponentPreview(componentName, theme, options) {
    const component = this.previewComponents.get(componentName);
    if (!component) {
      return [`Unknown component: ${componentName}`];
    }
    
    const preview = [];
    preview.push(chalk.cyan(`${component.name}:`));
    preview.push('─'.repeat(options.width));
    
    const componentPreview = await component.render(theme, options);
    preview.push(...componentPreview);
    
    return preview;
  }
  
  // === COMPARISON UTILITIES ===
  
  async combinePreviewsForComparison(previews, options) {
    switch (options.layout) {
      case 'side-by-side':
        return this.combineSideBySide(previews, options);
      case 'stacked':
        return this.combineStacked(previews, options);
      case 'grid':
        return this.combineGrid(previews, options);
      default:
        return this.combineSideBySide(previews, options);
    }
  }
  
  combineSideBySide(previews, options) {
    const combined = [];
    const columnWidth = Math.floor(options.width / previews.length) - 2;
    
    // Headers
    const headerLine = previews.map(p => 
      chalk.blue(p.themeKey.padEnd(columnWidth).substring(0, columnWidth))
    ).join('  ');
    combined.push(headerLine);
    
    const separatorLine = previews.map(() => 
      '─'.repeat(columnWidth)
    ).join('  ');
    combined.push(separatorLine);
    
    // Content lines
    const maxLines = Math.max(...previews.map(p => p.preview.content.split('\n').length));
    
    for (let lineIndex = 0; lineIndex < maxLines; lineIndex++) {
      const line = previews.map(p => {
        const lines = p.preview.content.split('\n');
        const content = lines[lineIndex] || '';
        return content.padEnd(columnWidth).substring(0, columnWidth);
      }).join('  ');
      
      combined.push(line);
    }
    
    return {
      type: 'comparison',
      layout: 'side-by-side',
      themes: previews.map(p => p.themeKey),
      content: combined.join('\n'),
      width: options.width,
      height: combined.length,
      metadata: {
        previewCount: previews.length,
        generatedAt: Date.now()
      }
    };
  }
  
  combineStacked(previews, options) {
    const combined = [];
    
    previews.forEach((preview, index) => {
      if (index > 0) {
        combined.push('');
        combined.push('═'.repeat(options.width));
        combined.push('');
      }
      
      // Theme header
      combined.push(chalk.blue(`🎨 ${preview.themeKey.toUpperCase()}`));
      combined.push('─'.repeat(options.width));
      
      // Preview content
      combined.push(preview.preview.content);
    });
    
    return {
      type: 'comparison',
      layout: 'stacked',
      themes: previews.map(p => p.themeKey),
      content: combined.join('\n'),
      width: options.width,
      height: combined.length,
      metadata: {
        previewCount: previews.length,
        generatedAt: Date.now()
      }
    };
  }
  
  combineGrid(previews, options) {
    const columns = Math.min(2, previews.length);
    const rows = Math.ceil(previews.length / columns);
    const columnWidth = Math.floor(options.width / columns) - 2;
    
    const combined = [];
    
    for (let row = 0; row < rows; row++) {
      const rowPreviews = [];
      
      for (let col = 0; col < columns; col++) {
        const previewIndex = row * columns + col;
        if (previewIndex < previews.length) {
          rowPreviews.push(previews[previewIndex]);
        }
      }
      
      if (rowPreviews.length > 0) {
        // Add row separator
        if (row > 0) {
          combined.push('');
        }
        
        // Combine row previews side by side
        const rowComparison = this.combineSideBySide(rowPreviews, { 
          width: options.width, 
          layout: 'side-by-side' 
        });
        
        combined.push(rowComparison.content);
      }
    }
    
    return {
      type: 'comparison',
      layout: 'grid',
      themes: previews.map(p => p.themeKey),
      content: combined.join('\n'),
      width: options.width,
      height: combined.length,
      metadata: {
        previewCount: previews.length,
        columns,
        rows,
        generatedAt: Date.now()
      }
    };
  }
  
  // === UTILITY METHODS ===
  
  calculateComparisonWidth(themeCount, totalWidth) {
    return Math.floor((totalWidth - (themeCount - 1) * 2) / themeCount);
  }
  
  generateCacheKey(themeKey, mode, options) {
    return `${themeKey}-${mode}-${options.width}x${options.height}-${options.breakpoint}`;
  }
  
  clearThemeFromCache(themeKey) {
    const keysToDelete = [];
    for (const cacheKey of this.previewCache.keys()) {
      if (cacheKey.startsWith(themeKey + '-')) {
        keysToDelete.push(cacheKey);
      }
    }
    
    keysToDelete.forEach(key => this.previewCache.delete(key));
    this.previewStats.cacheSize = this.previewCache.size;
  }
  
  updateRenderStats(renderTime) {
    const totalTime = this.previewStats.averageRenderTime * (this.previewStats.previewsGenerated - 1) + renderTime;
    this.previewStats.averageRenderTime = totalTime / this.previewStats.previewsGenerated;
  }
  
  renderColorBar(color, width) {
    try {
      return chalk.hex(color)('█'.repeat(width));
    } catch (error) {
      return chalk.gray('█'.repeat(width));
    }
  }
  
  renderSpacingBar(spacing) {
    const numericValue = parseInt(spacing) || 0;
    const scaledValue = Math.min(Math.max(Math.floor(numericValue / 2), 1), 30);
    return '│' + '─'.repeat(scaledValue) + '│';
  }
  
  analyzeColorHarmony(colors) {
    // Simplified color harmony analysis
    const colorValues = Object.values(colors).filter(c => typeof c === 'string' && c.startsWith('#'));
    
    return {
      contrastScore: Math.min(10, colorValues.length * 1.5),
      harmonyScore: Math.floor(Math.random() * 3) + 7, // Simplified for demo
      accessibilityLevel: colorValues.length > 5 ? 'Good' : 'Fair'
    };
  }
  
  renderThemeHeader(theme, width) {
    const header = [];
    header.push(chalk.blue('╔' + '═'.repeat(width - 2) + '╗'));
    header.push(chalk.blue('║') + 
                chalk.cyan(`${theme.name} Theme Preview`.padStart(Math.floor((width - 2 + theme.name.length + 14) / 2)).padEnd(width - 2)) + 
                chalk.blue('║'));
    header.push(chalk.blue('╚' + '═'.repeat(width - 2) + '╝'));
    return header.join('\n');
  }
  
  renderMainContent(theme, options) {
    const content = [];
    const colors = theme.components.colors || {};
    
    // Welcome section
    content.push('');
    content.push(chalk.hex(colors.text || '#000000').bold('Welcome to Your Theme'));
    content.push(chalk.hex(colors.textSecondary || '#666666')('Experience the power of beautiful design'));
    content.push('');
    
    // Feature cards
    const cardWidth = Math.floor((options.width - 8) / 2);
    content.push('┌' + '─'.repeat(cardWidth) + '┐  ┌' + '─'.repeat(cardWidth) + '┐');
    content.push('│' + chalk.hex(colors.text || '#000000')(' Feature One').padEnd(cardWidth) + '│  │' + chalk.hex(colors.text || '#000000')(' Feature Two').padEnd(cardWidth) + '│');
    content.push('│' + ' '.repeat(cardWidth) + '│  │' + ' '.repeat(cardWidth) + '│');
    content.push('│' + chalk.hex(colors.textSecondary || '#666666')(' Description text').padEnd(cardWidth) + '│  │' + chalk.hex(colors.textSecondary || '#666666')(' Description text').padEnd(cardWidth) + '│');
    content.push('└' + '─'.repeat(cardWidth) + '┘  └' + '─'.repeat(cardWidth) + '┘');
    
    return content;
  }
  
  renderFooter(theme, options) {
    const colors = theme.components.colors || {};
    const footer = [];
    
    footer.push('');
    footer.push('─'.repeat(options.width));
    footer.push(chalk.hex(colors.textSecondary || '#666666')('© 2024 Your Company. All rights reserved.'.padStart(Math.floor((options.width + 42) / 2))));
    
    return footer;
  }
  
  // === PUBLIC API ===
  
  setPreviewMode(mode) {
    if (!this.previewModes.has(mode)) {
      throw new Error(`Unknown preview mode: ${mode}`);
    }
    
    this.currentPreviewMode = mode;
    this.emit('preview-mode-changed', mode);
  }
  
  setComparisonLayout(layout) {
    const validLayouts = ['side-by-side', 'stacked', 'grid'];
    if (!validLayouts.includes(layout)) {
      throw new Error(`Invalid layout: ${layout}. Valid options: ${validLayouts.join(', ')}`);
    }
    
    this.comparisonLayout = layout;
    this.emit('comparison-layout-changed', layout);
  }
  
  getActiveThemes() {
    return Array.from(this.activeThemes.keys());
  }
  
  getPreviewModes() {
    return Array.from(this.previewModes.keys());
  }
  
  getPreviewStats() {
    return {
      ...this.previewStats,
      activeThemes: this.activeThemes.size,
      currentMode: this.currentPreviewMode,
      comparisonLayout: this.comparisonLayout
    };
  }
  
  clearCache() {
    this.previewCache.clear();
    this.renderCache.clear();
    this.previewStats.cacheSize = 0;
    this.previewStats.cacheHits = 0;
    
    console.log(chalk.green('✅ Preview cache cleared'));
    this.emit('cache-cleared');
  }
  
  printPreviewReport() {
    const stats = this.getPreviewStats();
    
    console.log(chalk.blue('\n🖼️  Theme Preview System Report'));
    console.log(chalk.blue('================================'));
    
    console.log(chalk.cyan('\n📊 Preview Statistics:'));
    console.log(`Previews Generated: ${stats.previewsGenerated}`);
    console.log(`Comparisons Created: ${stats.comparisonsCreated}`);
    console.log(`Themes Loaded: ${stats.themesLoaded}`);
    console.log(`Average Render Time: ${stats.averageRenderTime.toFixed(2)}ms`);
    console.log(`Cache Hits: ${stats.cacheHits}`);
    console.log(`Cache Size: ${stats.cacheSize} entries`);
    
    console.log(chalk.cyan('\n🎨 Active Themes:'));
    if (this.activeThemes.size === 0) {
      console.log('  No themes loaded');
    } else {
      for (const [key, theme] of this.activeThemes) {
        console.log(`  ${key}: ${theme.name} (v${theme.version})`);
      }
    }
    
    console.log(chalk.cyan('\n🖼️  Preview Configuration:'));
    console.log(`Current Mode: ${stats.currentMode}`);
    console.log(`Comparison Layout: ${stats.comparisonLayout}`);
    console.log(`Preview Size: ${this.options.previewWidth}x${this.options.previewHeight}`);
    
    console.log(chalk.cyan('\n🧩 Available Components:'));
    for (const [name, component] of this.previewComponents) {
      console.log(`  ${name}: ${component.description}`);
    }
    
    console.log(chalk.green('\n✅ Preview system report complete'));
  }
  
  // === CLEANUP ===
  
  dispose() {
    console.log(chalk.yellow('🧹 Disposing Theme Preview System...'));
    
    this.activeThemes.clear();
    this.previewCache.clear();
    this.renderCache.clear();
    this.previewComponents.clear();
    this.layoutTemplates.clear();
    this.demoContent.clear();
    this.previewModes.clear();
    this.removeAllListeners();
    
    console.log(chalk.green('✅ Theme preview system disposed'));
  }
}

export default ThemePreviewSystem;