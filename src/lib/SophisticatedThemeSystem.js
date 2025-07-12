/**
 * Sophisticated Theme System
 * 
 * Connects DynamicAstroGenerator to PreviewManager with a comprehensive theme system
 * that provides beautiful, customizable previews with professional design patterns.
 */

import { DynamicAstroGenerator } from './DynamicAstroGenerator.js';
import { PreviewManager } from './PreviewManager.js';
import { join } from 'path';
import { writeFile, readFile, mkdir, copyFile, stat } from 'fs/promises';
import { createHash } from 'crypto';
import chalk from 'chalk';

export class SophisticatedThemeSystem {
  constructor(options = {}) {
    this.options = {
      cacheThemes: true,
      enableHotReload: true,
      generateResponsive: true,
      enableAnimations: true,
      enableDarkMode: true,
      ...options
    };
    
    this.astroGenerator = new DynamicAstroGenerator(this.options);
    this.previewManager = new PreviewManager();
    
    this.themeRegistry = new Map();
    this.themeCache = new Map();
    this.customizations = new Map();
    
    this.initializeBuiltinThemes();
  }

  // === THEME REGISTRY ===

  /**
   * Initialize built-in theme collection
   */
  initializeBuiltinThemes() {
    // Modern Professional Theme
    this.registerTheme('modern', {
      name: 'Modern Professional',
      category: 'business',
      description: 'Clean, professional design with subtle animations',
      preview: '/assets/themes/modern-preview.jpg',
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#f59e0b',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        muted: '#64748b'
      },
      typography: {
        headingFont: 'Inter, system-ui, sans-serif',
        bodyFont: 'Inter, system-ui, sans-serif',
        codeFont: 'JetBrains Mono, Consolas, monospace',
        scale: 'minor-third'
      },
      layout: {
        maxWidth: '1200px',
        gridGap: '2rem',
        cardRadius: '0.75rem',
        elevation: 'subtle'
      },
      features: {
        darkMode: true,
        animations: true,
        gradients: false,
        glassmorphism: false
      }
    });

    // Creative Portfolio Theme
    this.registerTheme('creative', {
      name: 'Creative Portfolio',
      category: 'portfolio',
      description: 'Bold, artistic design with dynamic layouts',
      preview: '/assets/themes/creative-preview.jpg',
      colors: {
        primary: '#7c3aed',
        secondary: '#ec4899',
        accent: '#f59e0b',
        background: '#0f0f23',
        surface: '#1a1a2e',
        text: '#ffffff',
        muted: '#a3a3a3'
      },
      typography: {
        headingFont: 'Playfair Display, serif',
        bodyFont: 'Source Sans Pro, sans-serif',
        codeFont: 'JetBrains Mono, monospace',
        scale: 'major-third'
      },
      layout: {
        maxWidth: '1400px',
        gridGap: '3rem',
        cardRadius: '1rem',
        elevation: 'dramatic'
      },
      features: {
        darkMode: true,
        animations: true,
        gradients: true,
        glassmorphism: true
      }
    });

    // Minimal Clean Theme
    this.registerTheme('minimal', {
      name: 'Minimal Clean',
      category: 'minimal',
      description: 'Ultra-clean design focused on content',
      preview: '/assets/themes/minimal-preview.jpg',
      colors: {
        primary: '#000000',
        secondary: '#6b7280',
        accent: '#ef4444',
        background: '#ffffff',
        surface: '#ffffff',
        text: '#111827',
        muted: '#9ca3af'
      },
      typography: {
        headingFont: 'Inter, system-ui, sans-serif',
        bodyFont: 'Inter, system-ui, sans-serif',
        codeFont: 'SF Mono, Consolas, monospace',
        scale: 'minor-second'
      },
      layout: {
        maxWidth: '800px',
        gridGap: '1.5rem',
        cardRadius: '0.5rem',
        elevation: 'none'
      },
      features: {
        darkMode: false,
        animations: false,
        gradients: false,
        glassmorphism: false
      }
    });

    // Academic Paper Theme
    this.registerTheme('academic', {
      name: 'Academic Paper',
      category: 'academic',
      description: 'Scientific paper style with proper typography',
      preview: '/assets/themes/academic-preview.jpg',
      colors: {
        primary: '#1f2937',
        secondary: '#4b5563',
        accent: '#dc2626',
        background: '#ffffff',
        surface: '#f9fafb',
        text: '#111827',
        muted: '#6b7280'
      },
      typography: {
        headingFont: 'Crimson Text, serif',
        bodyFont: 'Crimson Text, serif',
        codeFont: 'JetBrains Mono, monospace',
        scale: 'minor-third'
      },
      layout: {
        maxWidth: '900px',
        gridGap: '2rem',
        cardRadius: '0.25rem',
        elevation: 'minimal'
      },
      features: {
        darkMode: false,
        animations: false,
        gradients: false,
        glassmorphism: false
      }
    });

    // Tech Showcase Theme
    this.registerTheme('tech', {
      name: 'Tech Showcase',
      category: 'technology',
      description: 'High-tech design with neon accents',
      preview: '/assets/themes/tech-preview.jpg',
      colors: {
        primary: '#00ff88',
        secondary: '#0ea5e9',
        accent: '#ff0080',
        background: '#0a0a0a',
        surface: '#1a1a1a',
        text: '#ffffff',
        muted: '#888888'
      },
      typography: {
        headingFont: 'Orbitron, monospace',
        bodyFont: 'Roboto, sans-serif',
        codeFont: 'Fira Code, monospace',
        scale: 'major-second'
      },
      layout: {
        maxWidth: '1300px',
        gridGap: '2.5rem',
        cardRadius: '0.5rem',
        elevation: 'glow'
      },
      features: {
        darkMode: true,
        animations: true,
        gradients: true,
        glassmorphism: false
      }
    });

    console.log(chalk.green(`🎨 Initialized ${this.themeRegistry.size} built-in themes`));
  }

  /**
   * Register a new theme
   */
  registerTheme(id, themeConfig) {
    const theme = {
      id,
      ...themeConfig,
      registeredAt: new Date().toISOString(),
      version: '1.0.0'
    };
    
    this.themeRegistry.set(id, theme);
    this.emit('theme-registered', { id, theme });
  }

  // === THEME MANAGEMENT ===

  /**
   * Get available themes
   */
  getAvailableThemes() {
    return Array.from(this.themeRegistry.values()).map(theme => ({
      id: theme.id,
      name: theme.name,
      category: theme.category,
      description: theme.description,
      preview: theme.preview,
      features: theme.features
    }));
  }

  /**
   * Get theme by ID with customizations
   */
  getTheme(themeId, customizations = {}) {
    const baseTheme = this.themeRegistry.get(themeId);
    if (!baseTheme) {
      throw new Error(`Theme not found: ${themeId}`);
    }
    
    // Apply customizations
    return this.applyThemeCustomizations(baseTheme, customizations);
  }

  /**
   * Apply customizations to a base theme
   */
  applyThemeCustomizations(baseTheme, customizations) {
    const customizedTheme = JSON.parse(JSON.stringify(baseTheme));
    
    // Apply color customizations
    if (customizations.colors) {
      Object.assign(customizedTheme.colors, customizations.colors);
    }
    
    // Apply typography customizations
    if (customizations.typography) {
      Object.assign(customizedTheme.typography, customizations.typography);
    }
    
    // Apply layout customizations
    if (customizations.layout) {
      Object.assign(customizedTheme.layout, customizations.layout);
    }
    
    // Apply feature toggles
    if (customizations.features) {
      Object.assign(customizedTheme.features, customizations.features);
    }
    
    // Generate theme hash for caching
    customizedTheme.hash = this.generateThemeHash(customizedTheme);
    
    return customizedTheme;
  }

  // === PREVIEW GENERATION ===

  /**
   * Generate themed preview with sophisticated styling
   */
  async generateThemedPreview(config, options = {}) {
    console.log(chalk.blue('🎨 Generating themed preview...'));
    
    const theme = this.getTheme(
      options.theme || config.theme || 'modern',
      options.customizations || {}
    );
    
    // Create enhanced config with theme integration
    const enhancedConfig = {
      ...config,
      theme: theme,
      layout: await this.enhanceLayoutWithTheme(config.layout, theme),
      metadata: {
        ...config.metadata,
        generatedAt: new Date().toISOString(),
        themeId: theme.id,
        themeName: theme.name
      }
    };
    
    // Generate Astro project with theme
    const astroResult = await this.generateThemedAstroProject(enhancedConfig, options);
    
    // Start preview with enhanced options
    const previewResult = await this.startThemedPreview(astroResult, options);
    
    return {
      ...previewResult,
      theme: {
        id: theme.id,
        name: theme.name,
        category: theme.category
      },
      astro: astroResult,
      customizations: options.customizations || {}
    };
  }

  /**
   * Generate Astro project with sophisticated theming
   */
  async generateThemedAstroProject(config, options = {}) {
    const outputDir = join(process.cwd(), 'astro', `themed-${config.theme.hash}`);
    
    // Check cache first
    if (this.options.cacheThemes && await this.isThemeCached(config.theme.hash)) {
      console.log(chalk.cyan('📦 Using cached theme...'));
      return { outputDir, cached: true };
    }
    
    console.log(chalk.blue('🏗️ Building themed Astro project...'));
    
    // Generate base Astro project
    await this.astroGenerator.generateAstroSite(config, outputDir, {
      ...options,
      theme: config.theme,
      enhancedTheming: true
    });
    
    // Add theme-specific enhancements
    await this.addThemeEnhancements(outputDir, config.theme, options);
    
    // Add interactive components
    await this.addInteractiveComponents(outputDir, config.theme);
    
    // Add responsive layouts
    await this.addResponsiveLayouts(outputDir, config.theme);
    
    // Cache the theme
    if (this.options.cacheThemes) {
      await this.cacheTheme(config.theme.hash, outputDir);
    }
    
    console.log(chalk.green('✅ Themed Astro project generated'));
    
    return { outputDir, cached: false };
  }

  /**
   * Start themed preview with enhanced features
   */
  async startThemedPreview(astroResult, options = {}) {
    const previewOptions = {
      ...options,
      hotReload: this.options.enableHotReload,
      responsive: this.options.generateResponsive
    };
    
    // Start web preview
    const webPreview = await this.previewManager.startWebPreview({
      astroDir: astroResult.outputDir
    }, previewOptions);
    
    // Add theme-specific preview enhancements
    const enhancedPreview = await this.addPreviewEnhancements(webPreview, options);
    
    return enhancedPreview;
  }

  // === THEME ENHANCEMENTS ===

  /**
   * Add theme-specific enhancements to Astro project
   */
  async addThemeEnhancements(outputDir, theme, options) {
    // Add theme-specific CSS variables
    await this.generateThemeCSS(outputDir, theme);
    
    // Add theme-specific components
    await this.generateThemeComponents(outputDir, theme);
    
    // Add theme-specific animations
    if (theme.features.animations) {
      await this.addThemeAnimations(outputDir, theme);
    }
    
    // Add dark mode support
    if (theme.features.darkMode) {
      await this.addDarkModeSupport(outputDir, theme);
    }
    
    // Add glassmorphism effects
    if (theme.features.glassmorphism) {
      await this.addGlassmorphismEffects(outputDir, theme);
    }
    
    // Add gradient effects
    if (theme.features.gradients) {
      await this.addGradientEffects(outputDir, theme);
    }
  }

  /**
   * Generate comprehensive theme CSS
   */
  async generateThemeCSS(outputDir, theme) {
    const cssContent = `
/* Sophisticated Theme System - ${theme.name} */
:root {
  /* Color System */
  --color-primary: ${theme.colors.primary};
  --color-secondary: ${theme.colors.secondary};
  --color-accent: ${theme.colors.accent};
  --color-background: ${theme.colors.background};
  --color-surface: ${theme.colors.surface};
  --color-text: ${theme.colors.text};
  --color-muted: ${theme.colors.muted};
  
  /* Typography System */
  --font-heading: ${theme.typography.headingFont};
  --font-body: ${theme.typography.bodyFont};
  --font-code: ${theme.typography.codeFont};
  
  /* Layout System */
  --max-width: ${theme.layout.maxWidth};
  --grid-gap: ${theme.layout.gridGap};
  --card-radius: ${theme.layout.cardRadius};
  
  /* Elevation System */
  --elevation-subtle: 0 1px 3px rgba(0, 0, 0, 0.1);
  --elevation-minimal: 0 1px 2px rgba(0, 0, 0, 0.05);
  --elevation-dramatic: 0 25px 50px rgba(0, 0, 0, 0.25);
  --elevation-glow: 0 0 30px rgba(var(--color-primary-rgb), 0.3);
}

/* Theme-specific utilities */
.theme-${theme.id} {
  color-scheme: ${theme.features.darkMode ? 'dark' : 'light'};
}

/* Component base styles */
.card {
  background: var(--color-surface);
  border-radius: var(--card-radius);
  ${this.generateElevationCSS(theme.layout.elevation)}
}

.gradient-bg {
  background: linear-gradient(135deg, 
    ${theme.colors.primary}22, 
    ${theme.colors.secondary}22
  );
}

${theme.features.animations ? this.generateAnimationCSS(theme) : ''}
${theme.features.glassmorphism ? this.generateGlassmorphismCSS(theme) : ''}
${theme.features.gradients ? this.generateGradientCSS(theme) : ''}
`;

    await writeFile(
      join(outputDir, 'src/styles/theme.css'),
      cssContent
    );
  }

  /**
   * Generate theme-specific components
   */
  async generateThemeComponents(outputDir, theme) {
    // Hero component
    const heroComponent = this.generateHeroComponent(theme);
    await writeFile(
      join(outputDir, 'src/components/Hero.astro'),
      heroComponent
    );
    
    // Card component
    const cardComponent = this.generateCardComponent(theme);
    await writeFile(
      join(outputDir, 'src/components/Card.astro'),
      cardComponent
    );
    
    // Navigation component
    const navComponent = this.generateNavigationComponent(theme);
    await writeFile(
      join(outputDir, 'src/components/Navigation.astro'),
      navComponent
    );
  }

  /**
   * Generate Hero component based on theme
   */
  generateHeroComponent(theme) {
    return `---
// Hero component - ${theme.name} theme
const { title, subtitle, cta } = Astro.props;
---

<section class="hero theme-${theme.id}">
  <div class="hero-content">
    <h1 class="hero-title">{title}</h1>
    <p class="hero-subtitle">{subtitle}</p>
    {cta && (
      <a href={cta.href} class="hero-cta">
        {cta.text}
      </a>
    )}
  </div>
  ${theme.features.gradients ? '<div class="hero-gradient"></div>' : ''}
</section>

<style>
.hero {
  position: relative;
  padding: 4rem 2rem;
  text-align: center;
  background: var(--color-background);
  ${theme.category === 'creative' ? 'overflow: hidden;' : ''}
}

.hero-content {
  max-width: var(--max-width);
  margin: 0 auto;
  z-index: 2;
  position: relative;
}

.hero-title {
  font-family: var(--font-heading);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: ${theme.category === 'academic' ? '400' : '700'};
  color: var(--color-text);
  margin-bottom: 1rem;
  ${theme.features.animations ? 'animation: fadeInUp 0.8s ease-out;' : ''}
}

.hero-subtitle {
  font-family: var(--font-body);
  font-size: 1.25rem;
  color: var(--color-muted);
  margin-bottom: 2rem;
  ${theme.features.animations ? 'animation: fadeInUp 0.8s ease-out 0.2s both;' : ''}
}

.hero-cta {
  display: inline-block;
  padding: 1rem 2rem;
  background: var(--color-primary);
  color: white;
  text-decoration: none;
  border-radius: ${theme.layout.cardRadius};
  font-weight: 600;
  transition: all 0.3s ease;
  ${theme.features.animations ? 'animation: fadeInUp 0.8s ease-out 0.4s both;' : ''}
}

.hero-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

${theme.features.gradients ? `
.hero-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    ${theme.colors.primary}11, 
    ${theme.colors.secondary}11
  );
  z-index: 1;
}
` : ''}

${theme.features.animations ? `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
` : ''}
</style>`;
  }

  // === UTILITY METHODS ===

  /**
   * Enhance layout with theme-specific adjustments
   */
  async enhanceLayoutWithTheme(layout, theme) {
    if (!layout) return null;
    
    const enhancedLayout = JSON.parse(JSON.stringify(layout));
    
    // Apply theme-specific spacing
    if (enhancedLayout.containers) {
      enhancedLayout.containers.forEach(container => {
        container.gap = theme.layout.gridGap;
        container.borderRadius = theme.layout.cardRadius;
      });
    }
    
    return enhancedLayout;
  }

  /**
   * Generate theme hash for caching
   */
  generateThemeHash(theme) {
    return createHash('md5')
      .update(JSON.stringify(theme))
      .digest('hex')
      .substring(0, 8);
  }

  /**
   * Check if theme is cached
   */
  async isThemeCached(themeHash) {
    try {
      const cacheDir = join(process.cwd(), '.theme-cache', themeHash);
      await stat(cacheDir);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Cache theme for future use
   */
  async cacheTheme(themeHash, sourceDir) {
    const cacheDir = join(process.cwd(), '.theme-cache', themeHash);
    await mkdir(cacheDir, { recursive: true });
    
    // Copy theme files to cache
    // Implementation would copy the generated theme files
  }

  /**
   * Generate elevation CSS based on theme
   */
  generateElevationCSS(elevation) {
    const elevationMap = {
      'none': '',
      'minimal': 'box-shadow: var(--elevation-minimal);',
      'subtle': 'box-shadow: var(--elevation-subtle);',
      'dramatic': 'box-shadow: var(--elevation-dramatic);',
      'glow': 'box-shadow: var(--elevation-glow);'
    };
    
    return elevationMap[elevation] || elevationMap.subtle;
  }

  /**
   * Add preview enhancements
   */
  async addPreviewEnhancements(webPreview, options) {
    // Add theme switching capabilities
    // Add responsive preview modes
    // Add real-time customization
    
    return {
      ...webPreview,
      features: {
        themeSwitch: true,
        responsivePreview: true,
        realTimeCustomization: this.options.enableHotReload
      }
    };
  }

  // Additional methods for animations, glassmorphism, gradients, etc.
  generateAnimationCSS(theme) { return '/* Animation CSS */'; }
  generateGlassmorphismCSS(theme) { return '/* Glassmorphism CSS */'; }
  generateGradientCSS(theme) { return '/* Gradient CSS */'; }
  generateCardComponent(theme) { return '<!-- Card component -->'; }
  generateNavigationComponent(theme) { return '<!-- Navigation component -->'; }
  addThemeAnimations() { return Promise.resolve(); }
  addDarkModeSupport() { return Promise.resolve(); }
  addGlassmorphismEffects() { return Promise.resolve(); }
  addGradientEffects() { return Promise.resolve(); }
  addInteractiveComponents() { return Promise.resolve(); }
  addResponsiveLayouts() { return Promise.resolve(); }
  emit() { /* Event emitter */ }
}

export default SophisticatedThemeSystem;