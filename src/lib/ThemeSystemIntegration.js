/**
 * Theme System Integration
 * 
 * Seamlessly integrates the SophisticatedThemeSystem with DynamicAstroGenerator
 * and PreviewManager, providing a unified theming experience for submitit.
 */

import { SophisticatedThemeSystem } from './SophisticatedThemeSystem.js';
import { DynamicAstroGenerator } from './DynamicAstroGenerator.js';
import { PreviewManager } from './PreviewManager.js';
import { getLazyModule, isModuleAvailable } from '../config/lazyModules.js';
import { EventEmitter } from 'events';
import chalk from 'chalk';
import { join } from 'path';
import { writeFile, readFile, mkdir } from 'fs/promises';

export class ThemeSystemIntegration extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      enablePreviewMode: true,
      enableThemeCustomization: true,
      enableRealTimePreview: true,
      cacheThemes: true,
      defaultTheme: 'modern',
      ...options
    };
    
    this.themeSystem = null;
    this.astroGenerator = null;
    this.previewManager = null;
    
    this.activePreview = null;
    this.themeCustomizations = new Map();
    this.previewHistory = [];
  }

  // === INITIALIZATION ===

  /**
   * Initialize the integrated theme system
   */
  async initialize() {
    console.log(chalk.blue('🎨 Initializing integrated theme system...'));
    
    try {
      // Initialize core components
      this.themeSystem = new SophisticatedThemeSystem(this.options);
      this.astroGenerator = new DynamicAstroGenerator(this.options);
      this.previewManager = new PreviewManager();
      
      // Set up event handlers
      this.setupEventHandlers();
      
      // Load user customizations
      await this.loadUserCustomizations();
      
      console.log(chalk.green('✅ Theme system integration initialized'));
      this.emit('initialized');
      
      return true;
    } catch (error) {
      console.error(chalk.red('❌ Failed to initialize theme system:'), error.message);
      throw error;
    }
  }

  /**
   * Set up event handlers for component communication
   */
  setupEventHandlers() {
    // Theme system events
    this.themeSystem.on('theme-registered', (data) => {
      this.emit('theme-available', data);
    });
    
    // Preview events
    this.previewManager.on?.('preview-ready', (data) => {
      this.emit('preview-ready', data);
    });
    
    // Real-time updates
    if (this.options.enableRealTimePreview) {
      this.on('customization-changed', async (data) => {
        await this.updatePreviewInRealTime(data);
      });
    }
  }

  // === THEME MANAGEMENT ===

  /**
   * Get all available themes with metadata
   */
  async getAvailableThemes() {
    if (!this.themeSystem) {
      await this.initialize();
    }
    
    const themes = this.themeSystem.getAvailableThemes();
    
    // Add usage statistics and user ratings
    return themes.map(theme => ({
      ...theme,
      usage: this.getThemeUsageStats(theme.id),
      customizations: this.themeCustomizations.has(theme.id),
      lastUsed: this.getThemeLastUsed(theme.id)
    }));
  }

  /**
   * Get theme with applied customizations
   */
  async getThemeWithCustomizations(themeId, customizations = {}) {
    if (!this.themeSystem) {
      await this.initialize();
    }
    
    // Merge with saved customizations
    const savedCustomizations = this.themeCustomizations.get(themeId) || {};
    const mergedCustomizations = { ...savedCustomizations, ...customizations };
    
    return this.themeSystem.getTheme(themeId, mergedCustomizations);
  }

  /**
   * Save theme customizations for future use
   */
  async saveThemeCustomizations(themeId, customizations) {
    this.themeCustomizations.set(themeId, customizations);
    
    // Persist to disk
    await this.saveUserCustomizations();
    
    this.emit('customization-saved', { themeId, customizations });
    
    // Update active preview if it's using this theme
    if (this.activePreview?.theme?.id === themeId) {
      this.emit('customization-changed', { themeId, customizations });
    }
  }

  // === PREVIEW GENERATION ===

  /**
   * Generate comprehensive themed preview
   */
  async generateThemedPreview(config, options = {}) {
    console.log(chalk.blue('🚀 Generating comprehensive themed preview...'));
    
    if (!this.themeSystem) {
      await this.initialize();
    }
    
    const startTime = Date.now();
    
    try {
      // Prepare enhanced configuration
      const enhancedConfig = await this.prepareEnhancedConfig(config, options);
      
      // Generate preview with sophisticated theming
      const previewResult = await this.themeSystem.generateThemedPreview(
        enhancedConfig,
        options
      );
      
      // Add integration-specific enhancements
      const integratedResult = await this.addIntegrationEnhancements(
        previewResult,
        options
      );
      
      // Store active preview reference
      this.activePreview = integratedResult;
      this.previewHistory.push({
        ...integratedResult,
        generatedAt: new Date().toISOString(),
        duration: Date.now() - startTime
      });
      
      const duration = Date.now() - startTime;
      console.log(chalk.green(`✅ Themed preview generated in ${duration}ms`));
      
      this.emit('preview-generated', integratedResult);
      
      return integratedResult;
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to generate themed preview:'), error.message);
      throw error;
    }
  }

  /**
   * Start interactive preview with theme switching
   */
  async startInteractivePreview(config, options = {}) {
    console.log(chalk.blue('🎭 Starting interactive themed preview...'));
    
    // Generate base preview
    const previewResult = await this.generateThemedPreview(config, options);
    
    // Add interactive features
    const interactiveFeatures = await this.addInteractiveFeatures(
      previewResult,
      options
    );
    
    console.log(chalk.green('🎯 Interactive preview ready'));
    console.log(chalk.cyan(`   Theme: ${previewResult.theme.name}`));
    console.log(chalk.cyan(`   URL: ${previewResult.url}`));
    console.log(chalk.cyan(`   Features: Theme switching, Real-time customization`));
    
    if (options.openBrowser !== false) {
      await this.openInBrowser(previewResult.url);
    }
    
    return {
      ...previewResult,
      interactive: true,
      features: interactiveFeatures
    };
  }

  /**
   * Switch theme in active preview
   */
  async switchTheme(newThemeId, customizations = {}) {
    if (!this.activePreview) {
      throw new Error('No active preview to switch theme');
    }
    
    console.log(chalk.blue(`🔄 Switching to theme: ${newThemeId}`));
    
    // Get new theme
    const newTheme = await this.getThemeWithCustomizations(newThemeId, customizations);
    
    // Update active preview configuration
    const updatedConfig = {
      ...this.activePreview.config,
      theme: newTheme
    };
    
    // Regenerate preview with new theme
    const newPreview = await this.generateThemedPreview(updatedConfig, {
      reusePort: this.activePreview.port,
      hotReload: true
    });
    
    console.log(chalk.green(`✅ Theme switched to: ${newTheme.name}`));
    
    return newPreview;
  }

  // === REAL-TIME CUSTOMIZATION ===

  /**
   * Update preview in real-time as customizations change
   */
  async updatePreviewInRealTime(data) {
    if (!this.activePreview || !this.options.enableRealTimePreview) {
      return;
    }
    
    try {
      // Apply customizations to current theme
      const updatedTheme = await this.getThemeWithCustomizations(
        data.themeId,
        data.customizations
      );
      
      // Generate updated CSS
      const updatedCSS = await this.generateUpdatedCSS(updatedTheme);
      
      // Hot-reload CSS in browser
      await this.hotReloadCSS(updatedCSS);
      
      this.emit('preview-updated', { theme: updatedTheme });
      
    } catch (error) {
      console.warn(chalk.yellow('Warning: Real-time update failed:'), error.message);
    }
  }

  /**
   * Create theme customization interface
   */
  async createCustomizationInterface(themeId) {
    const theme = await this.getThemeWithCustomizations(themeId);
    
    return {
      themeId,
      themeName: theme.name,
      customizations: {
        colors: this.createColorCustomizationInterface(theme.colors),
        typography: this.createTypographyCustomizationInterface(theme.typography),
        layout: this.createLayoutCustomizationInterface(theme.layout),
        features: this.createFeatureToggleInterface(theme.features)
      },
      presets: this.getThemePresets(themeId),
      actions: {
        preview: (customizations) => this.previewCustomizations(themeId, customizations),
        save: (customizations) => this.saveThemeCustomizations(themeId, customizations),
        reset: () => this.resetThemeCustomizations(themeId),
        export: () => this.exportThemeCustomizations(themeId)
      }
    };
  }

  // === INTEGRATION ENHANCEMENTS ===

  /**
   * Prepare enhanced configuration with integration features
   */
  async prepareEnhancedConfig(config, options) {
    const enhancedConfig = {
      ...config,
      integration: {
        enableHotReload: this.options.enableRealTimePreview,
        enableThemeSwitching: this.options.enableThemeCustomization,
        enableResponsivePreview: true,
        enableAccessibility: true
      },
      metadata: {
        ...config.metadata,
        generatedBy: 'submitit-theme-integration',
        version: '2.0.0',
        features: [
          'sophisticated-theming',
          'real-time-customization',
          'interactive-preview',
          'responsive-design'
        ]
      }
    };
    
    // Add layout enhancements
    if (config.layout) {
      enhancedConfig.layout = await this.enhanceLayoutWithIntegration(
        config.layout,
        options
      );
    }
    
    return enhancedConfig;
  }

  /**
   * Add integration-specific enhancements to preview result
   */
  async addIntegrationEnhancements(previewResult, options) {
    const enhanced = {
      ...previewResult,
      integration: {
        themeSystem: true,
        customizationAPI: this.createCustomizationAPI(previewResult),
        previewControls: this.createPreviewControls(previewResult),
        shortcuts: this.createKeyboardShortcuts(previewResult)
      }
    };
    
    // Add theme switching endpoint
    if (this.options.enableThemeCustomization) {
      enhanced.themeAPI = {
        switch: (themeId) => this.switchTheme(themeId),
        customize: (customizations) => this.updatePreviewInRealTime({
          themeId: previewResult.theme.id,
          customizations
        }),
        getThemes: () => this.getAvailableThemes()
      };
    }
    
    return enhanced;
  }

  /**
   * Add interactive features to preview
   */
  async addInteractiveFeatures(previewResult, options) {
    const features = {
      themeSwitch: {
        enabled: this.options.enableThemeCustomization,
        themes: await this.getAvailableThemes(),
        current: previewResult.theme.id
      },
      realTimeCustomization: {
        enabled: this.options.enableRealTimePreview,
        interface: await this.createCustomizationInterface(previewResult.theme.id)
      },
      responsivePreview: {
        enabled: true,
        breakpoints: ['mobile', 'tablet', 'desktop', 'wide'],
        current: 'desktop'
      },
      accessibility: {
        enabled: true,
        features: ['screen-reader', 'high-contrast', 'focus-indicators']
      }
    };
    
    // Inject interactive controls into preview
    await this.injectInteractiveControls(previewResult, features);
    
    return features;
  }

  // === UTILITY METHODS ===

  /**
   * Load user customizations from storage
   */
  async loadUserCustomizations() {
    try {
      const customizationsPath = join(process.cwd(), '.submitit', 'theme-customizations.json');
      const content = await readFile(customizationsPath, 'utf-8');
      const data = JSON.parse(content);
      
      Object.entries(data).forEach(([themeId, customizations]) => {
        this.themeCustomizations.set(themeId, customizations);
      });
      
      console.log(chalk.gray(`Loaded customizations for ${Object.keys(data).length} themes`));
    } catch (error) {
      // No customizations file exists yet
    }
  }

  /**
   * Save user customizations to storage
   */
  async saveUserCustomizations() {
    try {
      const customizationsDir = join(process.cwd(), '.submitit');
      await mkdir(customizationsDir, { recursive: true });
      
      const data = Object.fromEntries(this.themeCustomizations);
      const customizationsPath = join(customizationsDir, 'theme-customizations.json');
      
      await writeFile(customizationsPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn(chalk.yellow('Warning: Could not save customizations:'), error.message);
    }
  }

  /**
   * Get theme usage statistics
   */
  getThemeUsageStats(themeId) {
    const usage = this.previewHistory.filter(preview => 
      preview.theme.id === themeId
    );
    
    return {
      usageCount: usage.length,
      averageDuration: usage.reduce((acc, p) => acc + (p.duration || 0), 0) / usage.length || 0,
      lastUsed: usage.length > 0 ? usage[usage.length - 1].generatedAt : null
    };
  }

  /**
   * Get when theme was last used
   */
  getThemeLastUsed(themeId) {
    const usage = this.previewHistory
      .filter(preview => preview.theme.id === themeId)
      .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
    
    return usage.length > 0 ? usage[0].generatedAt : null;
  }

  /**
   * Create customization interfaces for different aspects
   */
  createColorCustomizationInterface(colors) {
    return Object.entries(colors).map(([key, value]) => ({
      property: key,
      value,
      type: 'color',
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    }));
  }

  createTypographyCustomizationInterface(typography) {
    return Object.entries(typography).map(([key, value]) => ({
      property: key,
      value,
      type: key.includes('Font') ? 'font-family' : 'select',
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      options: key.includes('Font') ? this.getFontOptions() : this.getTypographyOptions(key)
    }));
  }

  createLayoutCustomizationInterface(layout) {
    return Object.entries(layout).map(([key, value]) => ({
      property: key,
      value,
      type: key.includes('Width') ? 'dimension' : 'spacing',
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    }));
  }

  createFeatureToggleInterface(features) {
    return Object.entries(features).map(([key, value]) => ({
      property: key,
      value,
      type: 'boolean',
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    }));
  }

  // Placeholder implementations for interface creation
  createCustomizationAPI() { return {}; }
  createPreviewControls() { return {}; }
  createKeyboardShortcuts() { return {}; }
  injectInteractiveControls() { return Promise.resolve(); }
  generateUpdatedCSS() { return Promise.resolve(''); }
  hotReloadCSS() { return Promise.resolve(); }
  enhanceLayoutWithIntegration(layout) { return Promise.resolve(layout); }
  openInBrowser() { return Promise.resolve(); }
  getFontOptions() { return []; }
  getTypographyOptions() { return []; }
  getThemePresets() { return []; }
  previewCustomizations() { return Promise.resolve(); }
  resetThemeCustomizations() { return Promise.resolve(); }
  exportThemeCustomizations() { return Promise.resolve(); }
}

// === FACTORY FUNCTIONS ===

/**
 * Create integrated theme system
 */
export function createIntegratedThemeSystem(options = {}) {
  return new ThemeSystemIntegration(options);
}

/**
 * Generate themed preview with full integration
 */
export async function generateIntegratedPreview(config, options = {}) {
  const integration = new ThemeSystemIntegration();
  await integration.initialize();
  
  return integration.generateThemedPreview(config, options);
}

/**
 * Start interactive theme preview
 */
export async function startInteractiveThemePreview(config, options = {}) {
  const integration = new ThemeSystemIntegration();
  await integration.initialize();
  
  return integration.startInteractivePreview(config, options);
}

export default ThemeSystemIntegration;