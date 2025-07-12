/**
 * Dynamic Astro Generator
 * 
 * This creates beautiful, theme-aware Astro sites that showcase submitit projects
 * with the sophistication of a bespoke portfolio website.
 */

import { writeFile, mkdir, copyFile } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';

export class DynamicAstroGenerator {
  constructor(options = {}) {
    this.options = options;
    this.templateCache = new Map();
    this.componentLibrary = new ComponentLibrary();
    this.themeEngine = new ThemeEngine();
    this.layoutEngine = new AstroLayoutEngine();
  }

  // === MAIN GENERATION PIPELINE ===

  async generateAstroSite(projectConfig, outputDir, options = {}) {
    const generationContext = {
      projectConfig,
      outputDir,
      options,
      theme: this.themeEngine.getTheme(projectConfig.theme || 'modern'),
      layout: projectConfig.layout || await this.generateOptimalLayout(projectConfig),
      timestamp: new Date().toISOString(),
      buildId: this.generateBuildId(projectConfig)
    };

    // Create directory structure
    await this.createDirectoryStructure(outputDir);

    // Generate configuration files
    await this.generateConfigFiles(generationContext);

    // Generate components
    await this.generateComponents(generationContext);

    // Generate layouts
    await this.generateLayouts(generationContext);

    // Generate pages
    await this.generatePages(generationContext);

    // Generate styles
    await this.generateStyles(generationContext);

    // Copy assets
    await this.copyAssets(generationContext);

    // Generate package.json
    await this.generatePackageJson(generationContext);

    return {
      outputDir,
      buildId: generationContext.buildId,
      theme: generationContext.theme.name,
      pages: await this.getGeneratedPages(generationContext),
      components: await this.getGeneratedComponents(generationContext)
    };
  }

  // === DIRECTORY STRUCTURE ===

  async createDirectoryStructure(outputDir) {
    const directories = [
      'src/components',
      'src/layouts',
      'src/pages',
      'src/styles',
      'src/lib',
      'public/assets',
      'public/content'
    ];

    for (const dir of directories) {
      await mkdir(join(outputDir, dir), { recursive: true });
    }
  }

  // === CONFIGURATION FILES ===

  async generateConfigFiles(context) {
    // Astro config
    const astroConfig = this.generateAstroConfig(context);
    await writeFile(
      join(context.outputDir, 'astro.config.mjs'),
      astroConfig
    );

    // Tailwind config
    const tailwindConfig = this.generateTailwindConfig(context);
    await writeFile(
      join(context.outputDir, 'tailwind.config.mjs'),
      tailwindConfig
    );

    // TypeScript config
    const tsConfig = this.generateTsConfig(context);
    await writeFile(
      join(context.outputDir, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );
  }

  generateAstroConfig(context) {
    const { theme, options } = context;
    
    return `
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vue from '@astrojs/vue';

export default defineConfig({
  integrations: [
    tailwind({
      config: {
        theme: {
          extend: ${JSON.stringify(theme.tailwindExtensions, null, 6)}
        }
      }
    }),
    vue()
  ],
  server: {
    port: ${options.port || 4321},
    host: ${options.host ? `"${options.host}"` : 'true'}
  },
  build: {
    assets: 'assets'
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: \`$theme: '${theme.name}';\`
        }
      }
    }
  }
});
`;
  }

  generateTailwindConfig(context) {
    const { theme } = context;
    
    return `
import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: ${JSON.stringify(theme.colors, null, 6)},
      fontFamily: {
        sans: ${JSON.stringify(theme.fonts.sans)},
        serif: ${JSON.stringify(theme.fonts.serif)},
        mono: ${JSON.stringify(theme.fonts.mono)}
      },
      spacing: ${JSON.stringify(theme.spacing, null, 6)},
      borderRadius: ${JSON.stringify(theme.borderRadius, null, 6)},
      boxShadow: ${JSON.stringify(theme.shadows, null, 6)},
      animation: ${JSON.stringify(theme.animations, null, 6)},
      keyframes: ${JSON.stringify(theme.keyframes, null, 6)}
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries')
  ]
};
`;
  }

  generateTsConfig(context) {
    return {
      extends: 'astro/tsconfigs/strict',
      compilerOptions: {
        baseUrl: '.',
        paths: {
          '@/*': ['src/*'],
          '@/components/*': ['src/components/*'],
          '@/layouts/*': ['src/layouts/*'],
          '@/lib/*': ['src/lib/*'],
          '@/styles/*': ['src/styles/*']
        }
      }
    };
  }

  // === COMPONENT GENERATION ===

  async generateComponents(context) {
    const { projectConfig, theme } = context;
    
    // Generate base components
    await this.generateBaseComponents(context);
    
    // Generate content-specific components
    await this.generateContentComponents(context);
    
    // Generate theme-specific components
    await this.generateThemeComponents(context);
    
    // Generate interactive components
    await this.generateInteractiveComponents(context);
  }

  async generateBaseComponents(context) {
    const components = [
      { name: 'Hero', generator: this.generateHeroComponent },
      { name: 'Gallery', generator: this.generateGalleryComponent },
      { name: 'DocumentViewer', generator: this.generateDocumentViewerComponent },
      { name: 'TextContent', generator: this.generateTextContentComponent },
      { name: 'MediaPlayer', generator: this.generateMediaPlayerComponent },
      { name: 'Navigation', generator: this.generateNavigationComponent },
      { name: 'Footer', generator: this.generateFooterComponent }
    ];

    for (const component of components) {
      const componentCode = await component.generator.call(this, context);
      await writeFile(
        join(context.outputDir, 'src/components', `${component.name}.astro`),
        componentCode
      );
    }
  }

  generateHeroComponent(context) {
    const { theme } = context;
    
    return `---
export interface Props {
  title: string;
  subtitle?: string;
  image?: string;
  cta?: {
    text: string;
    href: string;
  };
}

const { title, subtitle, image, cta } = Astro.props;
---

<section class="relative overflow-hidden bg-gradient-to-br from-${theme.colors.primary[50]} to-${theme.colors.primary[100]} dark:from-${theme.colors.primary[900]} dark:to-${theme.colors.primary[800]}">
  <div class="absolute inset-0 bg-grid-${theme.colors.primary[200]} dark:bg-grid-${theme.colors.primary[700]} opacity-20"></div>
  
  <div class="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
    <div class="mx-auto max-w-2xl text-center">
      {image && (
        <div class="mb-8 flex justify-center">
          <div class="relative h-32 w-32 overflow-hidden rounded-full ring-4 ring-${theme.colors.primary[300]} dark:ring-${theme.colors.primary[600]}">
            <img src={image} alt={title} class="h-full w-full object-cover" />
          </div>
        </div>
      )}
      
      <h1 class="text-4xl font-bold tracking-tight text-${theme.colors.primary[900]} dark:text-${theme.colors.primary[50]} sm:text-6xl">
        {title}
      </h1>
      
      {subtitle && (
        <p class="mt-6 text-lg leading-8 text-${theme.colors.primary[600]} dark:text-${theme.colors.primary[300]}">
          {subtitle}
        </p>
      )}
      
      {cta && (
        <div class="mt-10 flex items-center justify-center gap-x-6">
          <a 
            href={cta.href}
            class="rounded-md bg-${theme.colors.accent[600]} px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-${theme.colors.accent[500]} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-${theme.colors.accent[600]} transition-colors"
          >
            {cta.text}
          </a>
        </div>
      )}
    </div>
  </div>
</section>

<style>
  .bg-grid-${theme.colors.primary[200]} {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(${theme.colors.primary[200]} / 0.2)'%3e%3cpath d='m0 .5 32 0M.5 0l0 32'/%3e%3c/svg%3e");
  }
  
  .dark .bg-grid-${theme.colors.primary[700]} {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(${theme.colors.primary[700]} / 0.2)'%3e%3cpath d='m0 .5 32 0M.5 0l0 32'/%3e%3c/svg%3e");
  }
</style>
`;
  }

  generateGalleryComponent(context) {
    const { theme } = context;
    
    return `---
export interface Props {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  columns?: number;
  masonry?: boolean;
}

const { images, columns = 3, masonry = false } = Astro.props;
---

<section class="py-16">
  <div class="mx-auto max-w-7xl px-6 lg:px-8">
    <div class={masonry ? 'columns-1 gap-8 sm:columns-2 lg:columns-3' : \`grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-\${columns}\`}>
      {images.map((image, index) => (
        <div class={masonry ? 'mb-8 break-inside-avoid' : 'group relative overflow-hidden rounded-lg'}>
          <div class="aspect-w-3 aspect-h-4 overflow-hidden rounded-lg bg-${theme.colors.primary[100]} dark:bg-${theme.colors.primary[800]}">
            <img
              src={image.src}
              alt={image.alt}
              class="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          {image.caption && (
            <div class="mt-4">
              <p class="text-sm text-${theme.colors.primary[600]} dark:text-${theme.colors.primary[400]}">
                {image.caption}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
</section>

<script>
  // Add lightbox functionality
  document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.group img');
    
    images.forEach(img => {
      img.addEventListener('click', function() {
        // Basic lightbox implementation
        const lightbox = document.createElement('div');
        lightbox.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 cursor-pointer';
        lightbox.innerHTML = \`
          <div class="relative max-w-4xl max-h-full p-4">
            <img src="\${this.src}" alt="\${this.alt}" class="max-w-full max-h-full object-contain" />
            <button class="absolute top-4 right-4 text-white text-2xl hover:text-gray-300">&times;</button>
          </div>
        \`;
        
        document.body.appendChild(lightbox);
        
        lightbox.addEventListener('click', function() {
          document.body.removeChild(lightbox);
        });
      });
    });
  });
</script>
`;
  }

  generateDocumentViewerComponent(context) {
    const { theme } = context;
    
    return `---
export interface Props {
  src: string;
  title: string;
  type?: 'pdf' | 'doc' | 'image';
  downloadable?: boolean;
}

const { src, title, type = 'pdf', downloadable = true } = Astro.props;
---

<div class="bg-white dark:bg-${theme.colors.primary[900]} shadow-xl rounded-lg overflow-hidden">
  <div class="px-6 py-4 border-b border-${theme.colors.primary[200]} dark:border-${theme.colors.primary[700]}">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-${theme.colors.primary[900]} dark:text-${theme.colors.primary[50]}">
          {title}
        </h3>
        <p class="text-sm text-${theme.colors.primary[600]} dark:text-${theme.colors.primary[400]}">
          {type.toUpperCase()} Document
        </p>
      </div>
      
      {downloadable && (
        <a
          href={src}
          download
          class="inline-flex items-center px-3 py-2 text-sm font-medium text-${theme.colors.accent[600]} hover:text-${theme.colors.accent[500]} transition-colors"
        >
          <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download
        </a>
      )}
    </div>
  </div>
  
  <div class="p-6">
    {type === 'pdf' && (
      <div class="aspect-w-4 aspect-h-3">
        <iframe
          src={src}
          class="w-full h-full border-0 rounded-lg"
          title={title}
        />
      </div>
    )}
    
    {type === 'image' && (
      <div class="text-center">
        <img
          src={src}
          alt={title}
          class="mx-auto max-w-full h-auto rounded-lg shadow-md"
        />
      </div>
    )}
    
    {type === 'doc' && (
      <div class="text-center p-12 bg-${theme.colors.primary[50]} dark:bg-${theme.colors.primary[800]} rounded-lg">
        <svg class="mx-auto h-12 w-12 text-${theme.colors.primary[400]} dark:text-${theme.colors.primary[500]}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-${theme.colors.primary[900]} dark:text-${theme.colors.primary[50]}">
          Document Preview
        </h3>
        <p class="mt-2 text-sm text-${theme.colors.primary[600]} dark:text-${theme.colors.primary[400]}">
          Click download to view the full document
        </p>
      </div>
    )}
  </div>
</div>
`;
  }

  // === LAYOUT GENERATION ===

  async generateLayouts(context) {
    const layouts = [
      { name: 'BaseLayout', generator: this.generateBaseLayout },
      { name: 'PageLayout', generator: this.generatePageLayout },
      { name: 'PortfolioLayout', generator: this.generatePortfolioLayout }
    ];

    for (const layout of layouts) {
      const layoutCode = await layout.generator.call(this, context);
      await writeFile(
        join(context.outputDir, 'src/layouts', `${layout.name}.astro`),
        layoutCode
      );
    }
  }

  generateBaseLayout(context) {
    const { theme, projectConfig } = context;
    
    return `---
export interface Props {
  title: string;
  description?: string;
  image?: string;
  noindex?: boolean;
}

const { title, description, image, noindex = false } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="description" content={description || "${projectConfig.metadata?.description || 'Created with submitit'}"} />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <meta name="generator" content={Astro.generator} />
  
  <title>{title}</title>
  
  <!-- Canonical URL -->
  <link rel="canonical" href={canonicalURL} />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={Astro.url} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description || "${projectConfig.metadata?.description || 'Created with submitit'}"} />
  {image && <meta property="og:image" content={new URL(image, Astro.url)} />}
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={Astro.url} />
  <meta property="twitter:title" content={title} />
  <meta property="twitter:description" content={description || "${projectConfig.metadata?.description || 'Created with submitit'}"} />
  {image && <meta property="twitter:image" content={new URL(image, Astro.url)} />}
  
  <!-- Theme -->
  <meta name="theme-color" content="${theme.colors.primary[600]}" />
  <meta name="color-scheme" content="light dark" />
  
  <!-- Robots -->
  {noindex && <meta name="robots" content="noindex,nofollow" />}
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=${theme.fonts.sans[0].replace(' ', '+')}&family=${theme.fonts.serif[0].replace(' ', '+')}&display=swap" rel="stylesheet" />
  
  <!-- Styles -->
  <style>
    html {
      font-family: ${theme.fonts.sans.join(', ')};
      background-color: ${theme.colors.background};
      color: ${theme.colors.text};
    }
    
    .theme-transition {
      transition: background-color 0.3s ease, color 0.3s ease;
    }
  </style>
</head>

<body class="min-h-screen bg-${theme.colors.background} text-${theme.colors.text} theme-transition">
  <slot />
  
  <!-- Theme toggle script -->
  <script>
    // Theme toggle functionality
    function toggleTheme() {
      const html = document.documentElement;
      const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      html.classList.remove(currentTheme);
      html.classList.add(newTheme);
      
      localStorage.setItem('theme', newTheme);
    }
    
    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    document.documentElement.classList.add(theme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        const theme = e.matches ? 'dark' : 'light';
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
      }
    });
  </script>
  
  <!-- Analytics placeholder -->
  <!-- Generated by submitit -->
  <div class="sr-only">
    <p>This site was generated by <a href="https://github.com/cameronbrooks/submitit">submitit</a></p>
  </div>
</body>
</html>
`;
  }

  // === UTILITY METHODS ===

  generateBuildId(projectConfig) {
    const content = JSON.stringify(projectConfig) + Date.now();
    return createHash('md5').update(content).digest('hex').substring(0, 8);
  }

  async generateOptimalLayout(projectConfig) {
    // Use enhanced layout engine to determine optimal layout
    const layoutEngine = new (await import('./EnhancedYogaLayoutEngine.js')).EnhancedYogaLayoutEngine();
    return await layoutEngine.generateResponsiveLayout(projectConfig.files || []);
  }

  async generatePackageJson(context) {
    const packageJson = {
      name: context.projectConfig.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      version: '1.0.0',
      description: context.projectConfig.metadata?.description || 'Generated with submitit',
      private: true,
      type: 'module',
      scripts: {
        dev: 'astro dev',
        build: 'astro build',
        preview: 'astro preview',
        check: 'astro check'
      },
      dependencies: {
        astro: '^4.13.0',
        '@astrojs/tailwind': '^5.1.0',
        '@astrojs/vue': '^4.0.0',
        tailwindcss: '^3.4.0',
        '@tailwindcss/typography': '^0.5.10',
        '@tailwindcss/aspect-ratio': '^0.4.2',
        '@tailwindcss/container-queries': '^0.1.1',
        vue: '^3.3.0'
      },
      devDependencies: {
        '@types/node': '^20.14.0',
        typescript: '^5.5.0'
      }
    };

    await writeFile(
      join(context.outputDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }

  async getGeneratedPages(context) {
    return ['index.astro']; // Placeholder
  }

  async getGeneratedComponents(context) {
    return ['Hero.astro', 'Gallery.astro', 'DocumentViewer.astro']; // Placeholder
  }

  // Placeholder methods for remaining components
  async generateContentComponents(context) {}
  async generateThemeComponents(context) {}
  async generateInteractiveComponents(context) {}
  async generatePages(context) {}
  async generateStyles(context) {}
  async copyAssets(context) {}
  
  generateTextContentComponent(context) { return '<!-- TextContent component -->'; }
  generateMediaPlayerComponent(context) { return '<!-- MediaPlayer component -->'; }
  generateNavigationComponent(context) { return '<!-- Navigation component -->'; }
  generateFooterComponent(context) { return '<!-- Footer component -->'; }
  generatePageLayout(context) { return '<!-- PageLayout -->'; }
  generatePortfolioLayout(context) { return '<!-- PortfolioLayout -->'; }
}

// === SUPPORTING CLASSES ===

class ComponentLibrary {
  constructor() {
    this.components = new Map();
  }
}

class ThemeEngine {
  constructor() {
    this.themes = new Map();
    this.initializeDefaultThemes();
  }

  initializeDefaultThemes() {
    this.themes.set('modern', {
      name: 'modern',
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e'
        },
        accent: {
          500: '#8b5cf6',
          600: '#7c3aed'
        },
        background: '#ffffff',
        text: '#1f2937'
      },
      fonts: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem'
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '1rem'
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
      },
      animations: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      tailwindExtensions: {}
    });
  }

  getTheme(name) {
    return this.themes.get(name) || this.themes.get('modern');
  }
}

class AstroLayoutEngine {
  constructor() {
    this.layoutStrategies = new Map();
  }
}