/**
 * Visual Theme Editor
 * 
 * Advanced interactive theme editor with real-time preview, color picker,
 * typography controls, and custom theme creation capabilities.
 */

import { EventEmitter } from 'events';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import chalk from 'chalk';

export class VisualThemeEditor extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      enableInteractiveEditor: true,
      enableRealTimePreview: true,
      enableColorPicker: true,
      enableTypographyControls: true,
      enableCustomThemes: true,
      enableThemeValidation: true,
      enableThemeSharing: true,
      themesDirectory: './themes',
      previewWidth: 80,
      previewHeight: 24,
      autoSave: true,
      autoSaveInterval: 5000, // 5 seconds
      ...options
    };
    
    // Editor state
    this.isInitialized = false;
    this.currentTheme = null;
    this.themeHistory = [];
    this.unsavedChanges = false;
    this.editorMode = 'visual'; // visual, code, preview
    
    // Theme components
    this.themeComponents = new Map();
    this.colorPalettes = new Map();
    this.typographyPresets = new Map();
    this.layoutTemplates = new Map();
    
    // Editor tools
    this.colorPicker = null;
    this.typographyPanel = null;
    this.previewCanvas = null;
    this.codeEditor = null;
    
    // Theme validation
    this.themeValidators = new Map();
    this.validationRules = new Map();
    
    // Performance tracking
    this.editorStats = {
      themesCreated: 0,
      themesModified: 0,
      previewsGenerated: 0,
      averageEditTime: 0,
      colorsUsed: new Set(),
      fontsUsed: new Set()
    };
    
    this.initialize();
  }
  
  // === INITIALIZATION ===
  
  async initialize() {
    console.log(chalk.blue('🎨 Initializing Visual Theme Editor...'));
    
    try {
      // Set up theme components
      await this.setupThemeComponents();
      
      // Initialize color palettes
      this.setupColorPalettes();
      
      // Initialize typography presets
      this.setupTypographyPresets();
      
      // Initialize layout templates
      this.setupLayoutTemplates();
      
      // Set up validation rules
      this.setupValidationRules();
      
      // Create themes directory
      await this.createThemesDirectory();
      
      // Initialize editor tools
      await this.initializeEditorTools();
      
      this.isInitialized = true;
      console.log(chalk.green('✅ Visual theme editor initialized'));
      this.emit('editor-ready');
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to initialize theme editor:'), error.message);
      throw error;
    }
  }
  
  async setupThemeComponents() {
    // Base theme structure
    this.themeComponents.set('colors', {
      name: 'Colors',
      description: 'Color palette and schemes',
      properties: {
        primary: { type: 'color', default: '#3498db', description: 'Primary brand color' },
        secondary: { type: 'color', default: '#2ecc71', description: 'Secondary accent color' },
        background: { type: 'color', default: '#ffffff', description: 'Background color' },
        surface: { type: 'color', default: '#f8f9fa', description: 'Surface/card background' },
        text: { type: 'color', default: '#2c3e50', description: 'Primary text color' },
        textSecondary: { type: 'color', default: '#7f8c8d', description: 'Secondary text color' },
        border: { type: 'color', default: '#e9ecef', description: 'Border color' },
        error: { type: 'color', default: '#e74c3c', description: 'Error/danger color' },
        warning: { type: 'color', default: '#f39c12', description: 'Warning color' },
        success: { type: 'color', default: '#27ae60', description: 'Success color' },
        info: { type: 'color', default: '#3498db', description: 'Info color' }
      },
      editor: this.createColorEditor.bind(this)
    });
    
    this.themeComponents.set('typography', {
      name: 'Typography',
      description: 'Fonts, sizes, and text styling',
      properties: {
        fontFamily: { type: 'font', default: 'system-ui, sans-serif', description: 'Primary font family' },
        fontFamilyMono: { type: 'font', default: 'Monaco, Consolas, monospace', description: 'Monospace font family' },
        fontSize: { type: 'size', default: '14px', description: 'Base font size' },
        fontWeight: { type: 'weight', default: '400', description: 'Base font weight' },
        lineHeight: { type: 'number', default: 1.5, description: 'Base line height' },
        letterSpacing: { type: 'size', default: '0px', description: 'Letter spacing' },
        headingFont: { type: 'font', default: 'inherit', description: 'Heading font family' },
        headingWeight: { type: 'weight', default: '600', description: 'Heading font weight' }
      },
      editor: this.createTypographyEditor.bind(this)
    });
    
    this.themeComponents.set('spacing', {
      name: 'Spacing',
      description: 'Margins, padding, and layout spacing',
      properties: {
        spaceUnit: { type: 'size', default: '8px', description: 'Base spacing unit' },
        spaceXs: { type: 'size', default: '4px', description: 'Extra small spacing' },
        spaceSm: { type: 'size', default: '8px', description: 'Small spacing' },
        spaceMd: { type: 'size', default: '16px', description: 'Medium spacing' },
        spaceLg: { type: 'size', default: '24px', description: 'Large spacing' },
        spaceXl: { type: 'size', default: '32px', description: 'Extra large spacing' },
        spaceXxl: { type: 'size', default: '48px', description: 'Extra extra large spacing' }
      },
      editor: this.createSpacingEditor.bind(this)
    });
    
    this.themeComponents.set('borders', {
      name: 'Borders & Shadows',
      description: 'Border radius, width, and shadow effects',
      properties: {
        borderRadius: { type: 'size', default: '4px', description: 'Base border radius' },
        borderRadiusSm: { type: 'size', default: '2px', description: 'Small border radius' },
        borderRadiusLg: { type: 'size', default: '8px', description: 'Large border radius' },
        borderWidth: { type: 'size', default: '1px', description: 'Base border width' },
        shadowSm: { type: 'shadow', default: '0 1px 3px rgba(0,0,0,0.1)', description: 'Small shadow' },
        shadowMd: { type: 'shadow', default: '0 4px 6px rgba(0,0,0,0.1)', description: 'Medium shadow' },
        shadowLg: { type: 'shadow', default: '0 10px 15px rgba(0,0,0,0.1)', description: 'Large shadow' }
      },
      editor: this.createBordersEditor.bind(this)
    });
    
    this.themeComponents.set('animations', {
      name: 'Animations & Transitions',
      description: 'Animation durations and easing functions',
      properties: {
        transitionDuration: { type: 'duration', default: '0.2s', description: 'Base transition duration' },
        transitionEasing: { type: 'easing', default: 'ease-in-out', description: 'Transition easing function' },
        animationDuration: { type: 'duration', default: '0.5s', description: 'Animation duration' },
        animationEasing: { type: 'easing', default: 'ease-out', description: 'Animation easing function' }
      },
      editor: this.createAnimationsEditor.bind(this)
    });
  }
  
  setupColorPalettes() {
    // Material Design palette
    this.colorPalettes.set('material', {
      name: 'Material Design',
      description: 'Google Material Design color palette',
      colors: {
        red: ['#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336', '#e53935', '#d32f2f', '#c62828', '#b71c1c'],
        blue: ['#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3', '#1e88e5', '#1976d2', '#1565c0', '#0d47a1'],
        green: ['#e8f5e8', '#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a', '#4caf50', '#43a047', '#388e3c', '#2e7d32', '#1b5e20'],
        purple: ['#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0', '#8e24aa', '#7b1fa2', '#6a1b9a', '#4a148c']
      }
    });
    
    // Tailwind CSS palette
    this.colorPalettes.set('tailwind', {
      name: 'Tailwind CSS',
      description: 'Tailwind CSS default color palette',
      colors: {
        slate: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a'],
        blue: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
        emerald: ['#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b'],
        violet: ['#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95']
      }
    });
    
    // Monochrome palette
    this.colorPalettes.set('monochrome', {
      name: 'Monochrome',
      description: 'Grayscale and monochrome colors',
      colors: {
        gray: ['#ffffff', '#f7f7f7', '#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040', '#262626', '#171717'],
        warmGray: ['#fafaf9', '#f5f5f4', '#e7e5e4', '#d6d3d1', '#a8a29e', '#78716c', '#57534e', '#44403c', '#292524', '#1c1917'],
        coolGray: ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827']
      }
    });
  }
  
  setupTypographyPresets() {
    this.typographyPresets.set('modern', {
      name: 'Modern',
      description: 'Clean, modern typography',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontFamilyMono: 'JetBrains Mono, Monaco, Consolas, monospace',
      fontWeights: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
      },
      fontSizes: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px'
      }
    });
    
    this.typographyPresets.set('classic', {
      name: 'Classic',
      description: 'Traditional, readable typography',
      fontFamily: 'Georgia, Times, serif',
      fontFamilyMono: 'Courier New, monospace',
      fontWeights: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
      },
      fontSizes: {
        xs: '13px',
        sm: '15px',
        base: '17px',
        lg: '19px',
        xl: '21px',
        '2xl': '25px',
        '3xl': '31px',
        '4xl': '37px'
      }
    });
    
    this.typographyPresets.set('technical', {
      name: 'Technical',
      description: 'Code-friendly, technical typography',
      fontFamily: 'SF Mono, Monaco, Consolas, monospace',
      fontFamilyMono: 'SF Mono, Monaco, Consolas, monospace',
      fontWeights: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
      },
      fontSizes: {
        xs: '11px',
        sm: '13px',
        base: '15px',
        lg: '17px',
        xl: '19px',
        '2xl': '23px',
        '3xl': '29px',
        '4xl': '35px'
      }
    });
  }
  
  setupLayoutTemplates() {
    this.layoutTemplates.set('card', {
      name: 'Card Layout',
      description: 'Card-based layout with shadows',
      template: {
        backgroundColor: '{{colors.surface}}',
        border: '{{borders.borderWidth}} solid {{colors.border}}',
        borderRadius: '{{borders.borderRadius}}',
        boxShadow: '{{borders.shadowMd}}',
        padding: '{{spacing.spaceMd}}'
      }
    });
    
    this.layoutTemplates.set('hero', {
      name: 'Hero Section',
      description: 'Large hero section layout',
      template: {
        backgroundColor: '{{colors.primary}}',
        color: '{{colors.background}}',
        padding: '{{spacing.spaceXxl}} {{spacing.spaceLg}}',
        textAlign: 'center',
        fontSize: '{{typography.fontSize}}',
        fontWeight: '{{typography.headingWeight}}'
      }
    });
    
    this.layoutTemplates.set('sidebar', {
      name: 'Sidebar',
      description: 'Navigation sidebar layout',
      template: {
        backgroundColor: '{{colors.surface}}',
        borderRight: '{{borders.borderWidth}} solid {{colors.border}}',
        padding: '{{spacing.spaceMd}}',
        width: '250px',
        height: '100vh'
      }
    });
  }
  
  setupValidationRules() {
    // Color contrast validation
    this.validationRules.set('contrast', {
      name: 'Color Contrast',
      description: 'Ensures adequate color contrast for accessibility',
      validate: this.validateColorContrast.bind(this),
      severity: 'warning'
    });
    
    // Font size validation
    this.validationRules.set('font-size', {
      name: 'Font Size',
      description: 'Ensures readable font sizes',
      validate: this.validateFontSize.bind(this),
      severity: 'error'
    });
    
    // Color harmony validation
    this.validationRules.set('color-harmony', {
      name: 'Color Harmony',
      description: 'Checks for pleasing color combinations',
      validate: this.validateColorHarmony.bind(this),
      severity: 'info'
    });
  }
  
  async createThemesDirectory() {
    try {
      await mkdir(this.options.themesDirectory, { recursive: true });
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Could not create themes directory:', error.message));
    }
  }
  
  async initializeEditorTools() {
    // Initialize color picker
    this.colorPicker = {
      currentColor: '#000000',
      format: 'hex', // hex, rgb, hsl
      palette: 'material',
      history: []
    };
    
    // Initialize typography panel
    this.typographyPanel = {
      currentFont: 'system-ui',
      fontSize: 16,
      fontWeight: 400,
      lineHeight: 1.5,
      preview: 'The quick brown fox jumps over the lazy dog.'
    };
    
    // Initialize preview canvas
    this.previewCanvas = {
      width: this.options.previewWidth,
      height: this.options.previewHeight,
      content: '',
      styles: new Map()
    };
  }
  
  // === THEME CREATION AND EDITING ===
  
  async createNewTheme(name, baseTheme = null) {
    console.log(chalk.blue(`🎨 Creating new theme: ${name}`));
    
    const newTheme = {
      name,
      description: `Custom theme: ${name}`,
      version: '1.0.0',
      author: 'Theme Editor',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      baseTheme,
      components: {}
    };
    
    // Initialize with default values or base theme
    if (baseTheme) {
      const base = await this.loadTheme(baseTheme);
      newTheme.components = JSON.parse(JSON.stringify(base.components));
    } else {
      // Initialize with default values
      for (const [componentName, component] of this.themeComponents) {
        newTheme.components[componentName] = {};
        for (const [propName, propConfig] of Object.entries(component.properties)) {
          newTheme.components[componentName][propName] = propConfig.default;
        }
      }
    }
    
    this.currentTheme = newTheme;
    this.unsavedChanges = true;
    this.editorStats.themesCreated++;
    
    console.log(chalk.green(`✅ New theme "${name}" created`));
    this.emit('theme-created', newTheme);
    
    return newTheme;
  }
  
  async loadTheme(themeName) {
    console.log(chalk.blue(`📂 Loading theme: ${themeName}`));
    
    try {
      const themePath = join(this.options.themesDirectory, `${themeName}.json`);
      const themeData = await readFile(themePath, 'utf8');
      const theme = JSON.parse(themeData);
      
      this.currentTheme = theme;
      this.unsavedChanges = false;
      
      console.log(chalk.green(`✅ Theme "${themeName}" loaded`));
      this.emit('theme-loaded', theme);
      
      return theme;
      
    } catch (error) {
      console.error(chalk.red(`❌ Failed to load theme "${themeName}":`, error.message));
      throw new Error(`Could not load theme: ${error.message}`);
    }
  }
  
  async saveTheme(theme = this.currentTheme) {
    if (!theme) {
      throw new Error('No theme to save');
    }
    
    console.log(chalk.blue(`💾 Saving theme: ${theme.name}`));
    
    try {
      // Update modification time
      theme.modifiedAt = Date.now();
      
      // Validate theme before saving
      const validation = await this.validateTheme(theme);
      if (validation.errors.length > 0) {
        console.warn(chalk.yellow('⚠️  Theme has validation errors:'));
        validation.errors.forEach(error => {
          console.warn(chalk.yellow(`  - ${error.message}`));
        });
      }
      
      const themePath = join(this.options.themesDirectory, `${theme.name}.json`);
      await writeFile(themePath, JSON.stringify(theme, null, 2), 'utf8');
      
      this.unsavedChanges = false;
      this.editorStats.themesModified++;
      
      console.log(chalk.green(`✅ Theme "${theme.name}" saved`));
      this.emit('theme-saved', theme);
      
      return themePath;
      
    } catch (error) {
      console.error(chalk.red(`❌ Failed to save theme:`, error.message));
      throw new Error(`Could not save theme: ${error.message}`);
    }
  }
  
  updateThemeProperty(componentName, propertyName, value) {
    if (!this.currentTheme) {
      throw new Error('No theme loaded');
    }
    
    if (!this.currentTheme.components[componentName]) {
      this.currentTheme.components[componentName] = {};
    }
    
    const oldValue = this.currentTheme.components[componentName][propertyName];
    this.currentTheme.components[componentName][propertyName] = value;
    
    this.unsavedChanges = true;
    this.currentTheme.modifiedAt = Date.now();
    
    // Add to history for undo functionality
    this.themeHistory.push({
      action: 'update',
      componentName,
      propertyName,
      oldValue,
      newValue: value,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (this.themeHistory.length > 100) {
      this.themeHistory = this.themeHistory.slice(-100);
    }
    
    // Auto-save if enabled
    if (this.options.autoSave) {
      this.scheduleAutoSave();
    }
    
    // Update preview
    this.updatePreview();
    
    this.emit('theme-updated', {
      componentName,
      propertyName,
      value,
      theme: this.currentTheme
    });
    
    console.log(chalk.cyan(`🔄 Updated ${componentName}.${propertyName} = ${value}`));
  }
  
  scheduleAutoSave() {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    
    this.autoSaveTimeout = setTimeout(async () => {
      if (this.unsavedChanges && this.currentTheme) {
        try {
          await this.saveTheme();
          console.log(chalk.green('💾 Auto-saved theme'));
        } catch (error) {
          console.warn(chalk.yellow('⚠️  Auto-save failed:', error.message));
        }
      }
    }, this.options.autoSaveInterval);
  }
  
  // === VISUAL EDITOR COMPONENTS ===
  
  createColorEditor(componentName, properties) {
    const colorEditor = {
      component: componentName,
      properties,
      currentColor: null,
      previewElement: null,
      
      render: () => {
        const colors = [];
        
        // Header
        colors.push(chalk.blue(`\n🎨 ${componentName.toUpperCase()} COLORS`));
        colors.push(chalk.blue('═'.repeat(40)));
        
        // Color properties
        for (const [propName, propConfig] of Object.entries(properties)) {
          const currentValue = this.currentTheme?.components[componentName]?.[propName] || propConfig.default;
          const colorBar = this.renderColorBar(currentValue);
          
          colors.push(`\n${propName.padEnd(15)} ${colorBar} ${currentValue}`);
          colors.push(`  ${chalk.gray(propConfig.description)}`);
        }
        
        // Color palette suggestions
        colors.push('\n\n🎯 Suggested Palettes:');
        for (const [paletteName, palette] of this.colorPalettes) {
          colors.push(`  ${paletteName}: ${palette.description}`);
        }
        
        return colors.join('\n');
      },
      
      update: (propertyName, value) => {
        this.updateThemeProperty(componentName, propertyName, value);
      }
    };
    
    return colorEditor;
  }
  
  createTypographyEditor(componentName, properties) {
    const typographyEditor = {
      component: componentName,
      properties,
      
      render: () => {
        const typography = [];
        
        // Header
        typography.push(chalk.blue(`\n📝 ${componentName.toUpperCase()} TYPOGRAPHY`));
        typography.push(chalk.blue('═'.repeat(40)));
        
        // Typography properties
        for (const [propName, propConfig] of Object.entries(properties)) {
          const currentValue = this.currentTheme?.components[componentName]?.[propName] || propConfig.default;
          
          typography.push(`\n${propName.padEnd(15)} ${currentValue}`);
          typography.push(`  ${chalk.gray(propConfig.description)}`);
        }
        
        // Typography preview
        typography.push('\n\n📖 Preview:');
        const previewText = this.renderTypographyPreview();
        typography.push(previewText);
        
        // Typography presets
        typography.push('\n\n🎯 Available Presets:');
        for (const [presetName, preset] of this.typographyPresets) {
          typography.push(`  ${presetName}: ${preset.description}`);
        }
        
        return typography.join('\n');
      },
      
      update: (propertyName, value) => {
        this.updateThemeProperty(componentName, propertyName, value);
      }
    };
    
    return typographyEditor;
  }
  
  createSpacingEditor(componentName, properties) {
    const spacingEditor = {
      component: componentName,
      properties,
      
      render: () => {
        const spacing = [];
        
        // Header
        spacing.push(chalk.blue(`\n📏 ${componentName.toUpperCase()} SPACING`));
        spacing.push(chalk.blue('═'.repeat(40)));
        
        // Spacing properties with visual representation
        for (const [propName, propConfig] of Object.entries(properties)) {
          const currentValue = this.currentTheme?.components[componentName]?.[propName] || propConfig.default;
          const spacingBar = this.renderSpacingBar(currentValue);
          
          spacing.push(`\n${propName.padEnd(15)} ${spacingBar} ${currentValue}`);
          spacing.push(`  ${chalk.gray(propConfig.description)}`);
        }
        
        return spacing.join('\n');
      },
      
      update: (propertyName, value) => {
        this.updateThemeProperty(componentName, propertyName, value);
      }
    };
    
    return spacingEditor;
  }
  
  createBordersEditor(componentName, properties) {
    const bordersEditor = {
      component: componentName,
      properties,
      
      render: () => {
        const borders = [];
        
        // Header
        borders.push(chalk.blue(`\n🔲 ${componentName.toUpperCase()} BORDERS & SHADOWS`));
        borders.push(chalk.blue('═'.repeat(40)));
        
        // Border and shadow properties
        for (const [propName, propConfig] of Object.entries(properties)) {
          const currentValue = this.currentTheme?.components[componentName]?.[propName] || propConfig.default;
          
          borders.push(`\n${propName.padEnd(20)} ${currentValue}`);
          borders.push(`  ${chalk.gray(propConfig.description)}`);
        }
        
        return borders.join('\n');
      },
      
      update: (propertyName, value) => {
        this.updateThemeProperty(componentName, propertyName, value);
      }
    };
    
    return bordersEditor;
  }
  
  createAnimationsEditor(componentName, properties) {
    const animationsEditor = {
      component: componentName,
      properties,
      
      render: () => {
        const animations = [];
        
        // Header
        animations.push(chalk.blue(`\n✨ ${componentName.toUpperCase()} ANIMATIONS`));
        animations.push(chalk.blue('═'.repeat(40)));
        
        // Animation properties
        for (const [propName, propConfig] of Object.entries(properties)) {
          const currentValue = this.currentTheme?.components[componentName]?.[propName] || propConfig.default;
          
          animations.push(`\n${propName.padEnd(20)} ${currentValue}`);
          animations.push(`  ${chalk.gray(propConfig.description)}`);
        }
        
        return animations.join('\n');
      },
      
      update: (propertyName, value) => {
        this.updateThemeProperty(componentName, propertyName, value);
      }
    };
    
    return animationsEditor;
  }
  
  // === PREVIEW GENERATION ===
  
  async updatePreview() {
    if (!this.currentTheme || !this.options.enableRealTimePreview) {
      return;
    }
    
    try {
      const preview = await this.generatePreview(this.currentTheme);
      this.previewCanvas.content = preview;
      this.editorStats.previewsGenerated++;
      
      this.emit('preview-updated', preview);
      
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Preview generation failed:', error.message));
    }
  }
  
  async generatePreview(theme) {
    const preview = [];
    const colors = theme.components.colors || {};
    const typography = theme.components.typography || {};
    const spacing = theme.components.spacing || {};
    
    // Preview header
    preview.push(chalk.hex(colors.primary || '#3498db')('╔' + '═'.repeat(this.options.previewWidth - 2) + '╗'));
    preview.push(chalk.hex(colors.primary || '#3498db')('║') + 
                chalk.hex(colors.background || '#ffffff').bgHex(colors.primary || '#3498db')(`${theme.name} Theme Preview`.padStart(Math.floor((this.options.previewWidth - 2 + theme.name.length + 14) / 2)).padEnd(this.options.previewWidth - 2)) + 
                chalk.hex(colors.primary || '#3498db')('║'));
    preview.push(chalk.hex(colors.primary || '#3498db')('╚' + '═'.repeat(this.options.previewWidth - 2) + '╝'));
    
    // Color palette preview
    preview.push('\n' + chalk.hex(colors.text || '#2c3e50')('🎨 Color Palette:'));
    const colorBar = Object.entries(colors).slice(0, 8).map(([name, color]) => {
      return chalk.hex(color)('██');
    }).join(' ');
    preview.push('  ' + colorBar);
    
    // Typography preview
    preview.push('\n' + chalk.hex(colors.text || '#2c3e50')('📝 Typography:'));
    preview.push('  ' + chalk.hex(colors.text || '#2c3e50')('The quick brown fox jumps over the lazy dog.'));
    preview.push('  ' + chalk.hex(colors.textSecondary || '#7f8c8d')('Font: ' + (typography.fontFamily || 'system-ui')));
    
    // Layout example
    preview.push('\n' + chalk.hex(colors.text || '#2c3e50')('📋 Layout Example:'));
    const cardBg = colors.surface || '#f8f9fa';
    const cardBorder = colors.border || '#e9ecef';
    
    // Simulate a card layout
    preview.push('  ┌' + '─'.repeat(30) + '┐');
    preview.push('  │' + chalk.hex(colors.text || '#2c3e50')(' Card Title').padEnd(30) + '│');
    preview.push('  │' + chalk.hex(colors.textSecondary || '#7f8c8d')(' Subtitle text').padEnd(30) + '│');
    preview.push('  │' + ' '.repeat(30) + '│');
    preview.push('  │' + chalk.hex(colors.primary || '#3498db')(' [Primary Button]').padEnd(30) + '│');
    preview.push('  └' + '─'.repeat(30) + '┘');
    
    return preview.join('\n');
  }
  
  // === RENDERING UTILITIES ===
  
  renderColorBar(color) {
    try {
      // Create a color bar using the color
      return chalk.hex(color)('██████');
    } catch (error) {
      // Fallback for invalid colors
      return chalk.gray('██████');
    }
  }
  
  renderSpacingBar(spacing) {
    // Convert spacing to a visual representation
    const numericValue = parseInt(spacing) || 0;
    const scaledValue = Math.min(Math.max(Math.floor(numericValue / 4), 1), 20);
    return '│' + '─'.repeat(scaledValue) + '│';
  }
  
  renderTypographyPreview() {
    if (!this.currentTheme) return 'No theme loaded';
    
    const typography = this.currentTheme.components.typography || {};
    const colors = this.currentTheme.components.colors || {};
    
    const preview = [];
    
    // Heading example
    preview.push(chalk.hex(colors.text || '#2c3e50').bold('Heading Example'));
    
    // Body text example
    preview.push(chalk.hex(colors.text || '#2c3e50')('This is body text that shows how the typography looks.'));
    
    // Secondary text
    preview.push(chalk.hex(colors.textSecondary || '#7f8c8d')('Secondary text in a lighter color.'));
    
    // Monospace example
    preview.push(chalk.hex(colors.text || '#2c3e50')('Code example: ') + chalk.gray('const theme = "awesome";'));
    
    return preview.join('\n  ');
  }
  
  // === THEME VALIDATION ===
  
  async validateTheme(theme) {
    const validation = {
      valid: true,
      errors: [],
      warnings: [],
      info: []
    };
    
    // Run all validation rules
    for (const [ruleName, rule] of this.validationRules) {
      try {
        const result = await rule.validate(theme);
        
        if (result.issues && result.issues.length > 0) {
          result.issues.forEach(issue => {
            const entry = {
              rule: ruleName,
              message: issue.message,
              severity: rule.severity,
              component: issue.component,
              property: issue.property
            };
            
            switch (rule.severity) {
              case 'error':
                validation.errors.push(entry);
                validation.valid = false;
                break;
              case 'warning':
                validation.warnings.push(entry);
                break;
              case 'info':
                validation.info.push(entry);
                break;
            }
          });
        }
        
      } catch (error) {
        validation.errors.push({
          rule: ruleName,
          message: `Validation rule failed: ${error.message}`,
          severity: 'error'
        });
        validation.valid = false;
      }
    }
    
    return validation;
  }
  
  async validateColorContrast(theme) {
    const issues = [];
    const colors = theme.components.colors || {};
    
    // Check text on background contrast
    if (colors.text && colors.background) {
      const contrast = this.calculateContrastRatio(colors.text, colors.background);
      if (contrast < 4.5) {
        issues.push({
          message: `Low contrast ratio (${contrast.toFixed(2)}) between text and background`,
          component: 'colors',
          property: 'text'
        });
      }
    }
    
    // Check secondary text contrast
    if (colors.textSecondary && colors.background) {
      const contrast = this.calculateContrastRatio(colors.textSecondary, colors.background);
      if (contrast < 3.0) {
        issues.push({
          message: `Low contrast ratio (${contrast.toFixed(2)}) for secondary text`,
          component: 'colors',
          property: 'textSecondary'
        });
      }
    }
    
    return { issues };
  }
  
  async validateFontSize(theme) {
    const issues = [];
    const typography = theme.components.typography || {};
    
    // Check base font size
    if (typography.fontSize) {
      const size = parseInt(typography.fontSize);
      if (size < 12) {
        issues.push({
          message: 'Font size too small for accessibility (minimum 12px recommended)',
          component: 'typography',
          property: 'fontSize'
        });
      }
    }
    
    return { issues };
  }
  
  async validateColorHarmony(theme) {
    const issues = [];
    const colors = theme.components.colors || {};
    
    // Check if primary and secondary colors work well together
    if (colors.primary && colors.secondary) {
      const harmony = this.checkColorHarmony(colors.primary, colors.secondary);
      if (!harmony.harmonious) {
        issues.push({
          message: 'Primary and secondary colors may not be harmonious',
          component: 'colors',
          property: 'secondary'
        });
      }
    }
    
    return { issues };
  }
  
  // === COLOR UTILITIES ===
  
  calculateContrastRatio(color1, color2) {
    // Simplified contrast calculation
    // In a real implementation, you'd use proper color space calculations
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 1;
    
    const l1 = this.relativeLuminance(rgb1);
    const l2 = this.relativeLuminance(rgb2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }
  
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  relativeLuminance(rgb) {
    const { r, g, b } = rgb;
    const rs = r / 255;
    const gs = g / 255;
    const bs = b / 255;
    
    const adjustedR = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
    const adjustedG = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
    const adjustedB = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
    
    return 0.2126 * adjustedR + 0.7152 * adjustedG + 0.0722 * adjustedB;
  }
  
  checkColorHarmony(color1, color2) {
    // Simplified harmony check
    // In a real implementation, you'd check for complementary, analogous, etc.
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return { harmonious: false };
    
    // Simple hue difference check
    const hue1 = this.rgbToHsl(rgb1).h;
    const hue2 = this.rgbToHsl(rgb2).h;
    const hueDiff = Math.abs(hue1 - hue2);
    
    // Colors are harmonious if they're complementary (180°) or analogous (<60°)
    const harmonious = hueDiff < 60 || Math.abs(hueDiff - 180) < 30;
    
    return { harmonious, hueDifference: hueDiff };
  }
  
  rgbToHsl(rgb) {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return { h: h * 360, s: s * 100, l: l * 100 };
  }
  
  // === INTERACTIVE EDITOR INTERFACE ===
  
  async startInteractiveEditor() {
    if (!this.options.enableInteractiveEditor) {
      throw new Error('Interactive editor is disabled');
    }
    
    console.log(chalk.blue('🎨 Starting Interactive Theme Editor...'));
    console.log(chalk.cyan('Use the following commands:'));
    console.log(chalk.cyan('  create <name> - Create new theme'));
    console.log(chalk.cyan('  load <name> - Load existing theme'));
    console.log(chalk.cyan('  edit <component> - Edit theme component'));
    console.log(chalk.cyan('  preview - Show current theme preview'));
    console.log(chalk.cyan('  save - Save current theme'));
    console.log(chalk.cyan('  validate - Validate current theme'));
    console.log(chalk.cyan('  export - Export theme for use'));
    console.log(chalk.cyan('  quit - Exit editor'));
    
    this.editorMode = 'interactive';
    this.emit('editor-started');
  }
  
  async processEditorCommand(command, args = []) {
    switch (command.toLowerCase()) {
      case 'create':
        if (!args[0]) throw new Error('Theme name required');
        return await this.createNewTheme(args[0], args[1]);
        
      case 'load':
        if (!args[0]) throw new Error('Theme name required');
        return await this.loadTheme(args[0]);
        
      case 'edit':
        if (!args[0]) throw new Error('Component name required');
        return this.editComponent(args[0]);
        
      case 'preview':
        return await this.generatePreview(this.currentTheme);
        
      case 'save':
        return await this.saveTheme();
        
      case 'validate':
        return await this.validateTheme(this.currentTheme);
        
      case 'export':
        return await this.exportTheme(this.currentTheme, args[0]);
        
      case 'list':
        return this.listThemes();
        
      case 'help':
        return this.showHelp();
        
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }
  
  editComponent(componentName) {
    const component = this.themeComponents.get(componentName);
    if (!component) {
      throw new Error(`Unknown component: ${componentName}`);
    }
    
    const editor = component.editor(componentName, component.properties);
    return editor.render();
  }
  
  // === THEME EXPORT ===
  
  async exportTheme(theme, format = 'css') {
    console.log(chalk.blue(`📤 Exporting theme "${theme.name}" as ${format.toUpperCase()}...`));
    
    let exportContent;
    let fileExtension;
    
    switch (format.toLowerCase()) {
      case 'css':
        exportContent = this.generateCSSExport(theme);
        fileExtension = 'css';
        break;
        
      case 'scss':
        exportContent = this.generateSCSSExport(theme);
        fileExtension = 'scss';
        break;
        
      case 'js':
        exportContent = this.generateJSExport(theme);
        fileExtension = 'js';
        break;
        
      case 'json':
        exportContent = JSON.stringify(theme, null, 2);
        fileExtension = 'json';
        break;
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
    
    const exportPath = join(this.options.themesDirectory, `${theme.name}.${fileExtension}`);
    await writeFile(exportPath, exportContent, 'utf8');
    
    console.log(chalk.green(`✅ Theme exported to: ${exportPath}`));
    this.emit('theme-exported', { theme, format, path: exportPath });
    
    return exportPath;
  }
  
  generateCSSExport(theme) {
    const css = [];
    
    css.push(`/* ${theme.name} Theme */`);
    css.push(`/* Generated by Visual Theme Editor */`);
    css.push(`/* Version: ${theme.version} */`);
    css.push('');
    css.push(':root {');
    
    // Generate CSS custom properties
    for (const [componentName, componentData] of Object.entries(theme.components)) {
      css.push(`  /* ${componentName} */`);
      
      for (const [propertyName, value] of Object.entries(componentData)) {
        const cssVarName = `--${componentName}-${propertyName.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        css.push(`  ${cssVarName}: ${value};`);
      }
      
      css.push('');
    }
    
    css.push('}');
    
    // Add utility classes
    css.push('');
    css.push('/* Utility Classes */');
    css.push('.theme-primary { color: var(--colors-primary); }');
    css.push('.theme-secondary { color: var(--colors-secondary); }');
    css.push('.theme-bg-primary { background-color: var(--colors-primary); }');
    css.push('.theme-bg-secondary { background-color: var(--colors-secondary); }');
    css.push('.theme-text { color: var(--colors-text); }');
    css.push('.theme-text-secondary { color: var(--colors-text-secondary); }');
    
    return css.join('\n');
  }
  
  generateSCSSExport(theme) {
    const scss = [];
    
    scss.push(`// ${theme.name} Theme`);
    scss.push(`// Generated by Visual Theme Editor`);
    scss.push(`// Version: ${theme.version}`);
    scss.push('');
    
    // Generate SCSS variables
    for (const [componentName, componentData] of Object.entries(theme.components)) {
      scss.push(`// ${componentName}`);
      
      for (const [propertyName, value] of Object.entries(componentData)) {
        const scssVarName = `$${componentName}-${propertyName.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        scss.push(`${scssVarName}: ${value};`);
      }
      
      scss.push('');
    }
    
    // Add mixins
    scss.push('// Mixins');
    scss.push('@mixin theme-card {');
    scss.push('  background-color: $colors-surface;');
    scss.push('  border: $borders-border-width solid $colors-border;');
    scss.push('  border-radius: $borders-border-radius;');
    scss.push('  box-shadow: $borders-shadow-md;');
    scss.push('  padding: $spacing-space-md;');
    scss.push('}');
    
    return scss.join('\n');
  }
  
  generateJSExport(theme) {
    const js = [];
    
    js.push(`// ${theme.name} Theme`);
    js.push(`// Generated by Visual Theme Editor`);
    js.push(`// Version: ${theme.version}`);
    js.push('');
    js.push(`export const ${theme.name.replace(/[^a-zA-Z0-9]/g, '')}Theme = ${JSON.stringify(theme.components, null, 2)};`);
    js.push('');
    js.push(`export default ${theme.name.replace(/[^a-zA-Z0-9]/g, '')}Theme;`);
    
    return js.join('\n');
  }
  
  // === PUBLIC API ===
  
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  getThemeComponents() {
    return Array.from(this.themeComponents.keys());
  }
  
  getColorPalettes() {
    return Array.from(this.colorPalettes.keys());
  }
  
  getTypographyPresets() {
    return Array.from(this.typographyPresets.keys());
  }
  
  getEditorStats() {
    return {
      ...this.editorStats,
      currentTheme: this.currentTheme?.name || null,
      unsavedChanges: this.unsavedChanges,
      historySize: this.themeHistory.length
    };
  }
  
  listThemes() {
    // This would scan the themes directory and return available themes
    return [
      { name: 'default', description: 'Default theme' },
      { name: 'dark', description: 'Dark mode theme' },
      { name: 'minimal', description: 'Minimal clean theme' }
    ];
  }
  
  showHelp() {
    return `
Visual Theme Editor Help
========================

Commands:
  create <name> [base]  - Create new theme (optionally from base)
  load <name>          - Load existing theme
  edit <component>     - Edit theme component (colors, typography, spacing, etc.)
  preview             - Show current theme preview
  save                - Save current theme
  validate            - Validate current theme
  export [format]     - Export theme (css, scss, js, json)
  list                - List available themes
  help                - Show this help

Components:
  colors      - Color palette and schemes
  typography  - Fonts, sizes, and text styling
  spacing     - Margins, padding, and layout spacing
  borders     - Border radius, width, and shadow effects
  animations  - Animation durations and easing functions

Example:
  create myTheme
  edit colors
  save
  export css
`;
  }
  
  printEditorReport() {
    const stats = this.getEditorStats();
    
    console.log(chalk.blue('\n🎨 Visual Theme Editor Report'));
    console.log(chalk.blue('==============================='));
    
    console.log(chalk.cyan('\n📊 Editor Statistics:'));
    console.log(`Current Theme: ${stats.currentTheme || 'None'}`);
    console.log(`Unsaved Changes: ${stats.unsavedChanges ? 'Yes' : 'No'}`);
    console.log(`Themes Created: ${stats.themesCreated}`);
    console.log(`Themes Modified: ${stats.themesModified}`);
    console.log(`Previews Generated: ${stats.previewsGenerated}`);
    console.log(`History Size: ${stats.historySize} actions`);
    
    console.log(chalk.cyan('\n🧩 Available Components:'));
    this.getThemeComponents().forEach(component => {
      const info = this.themeComponents.get(component);
      console.log(`  ${component}: ${info.description}`);
    });
    
    console.log(chalk.cyan('\n🎯 Color Palettes:'));
    this.getColorPalettes().forEach(palette => {
      const info = this.colorPalettes.get(palette);
      console.log(`  ${palette}: ${info.description}`);
    });
    
    console.log(chalk.cyan('\n📝 Typography Presets:'));
    this.getTypographyPresets().forEach(preset => {
      const info = this.typographyPresets.get(preset);
      console.log(`  ${preset}: ${info.description}`);
    });
    
    console.log(chalk.green('\n✅ Theme editor report complete'));
  }
  
  // === CLEANUP ===
  
  dispose() {
    console.log(chalk.yellow('🧹 Disposing Visual Theme Editor...'));
    
    // Clear auto-save timeout
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    
    // Clear state
    this.currentTheme = null;
    this.themeHistory = [];
    this.themeComponents.clear();
    this.colorPalettes.clear();
    this.typographyPresets.clear();
    this.layoutTemplates.clear();
    this.removeAllListeners();
    
    console.log(chalk.green('✅ Theme editor disposed'));
  }
}

export default VisualThemeEditor;