# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SUBMITIT is a CLI tool for packaging and presenting project deliverables. Built using:
- **Astro** (^5.11.0) - Web framework for generating static preview sites
- **Yoga** (^3.2.1) - Meta's flexbox layout engine for terminal UI calculations  
- **Ink** (^6.0.1) - React-based framework for building CLI interfaces
- **Ninja** - Google's build system (cloned directly into `/ninja/` directory)

The project also includes vcpkg package manager cloned into `/vcpkg/`.

## Current Status

**⚠️ IMPORTANT: Despite having 98 JavaScript files with extensive implementations, the only working code is `demo.js` which just prints mock output using chalk.**

The `demo.js` file:
- Uses only `chalk` for colored console output
- Creates sample markdown files
- Shows simulated build progress and themes
- Does NOT use any of the Ink, Yoga, Ninja, or Astro implementations

## Development Commands

### Core Development
- `npm run dev` - Run the CLI in development mode
- `npm run demo` - Launch advanced components demo 
- `npm run build` - Build Astro components for web previews
- `npm run test` - Run tests using Node.js built-in test runner
- `npm run lint` - ESLint code checking
- `npm run format` - Prettier code formatting

### CLI Commands
- `node src/cli.js <command>` - Main CLI entry point
- `node simple-cli.js demo` - Alternative simple demo
- `submitit-demo` - Binary for demonstration mode

### Testing Single Components
- Individual test files can be run with `node --test <test-file>`
- Custom test framework located in `src/testing/TestFramework.js`
- Tests are organized in `tests/` and `src/tests/` directories

## Architecture & Design Patterns

### Technology Stack Integration
The project contains **98 JavaScript files** in `/src/` with extensive implementations:

#### Ink Components (42+ imports across 33 files)
- **UI Components**: `src/ui/App.js`, `src/ui/workPlate.js`, `src/ui/Window.js`, `src/ui/Desktop.js`
- **Component Library**: `src/components/AdvancedInkDemo.js`, `EnhancedInkApp.js`, `SimpleInkApp.js`, `WorkPlatesApp.js`
- **Interactive Elements**: `StatusBar.js`, `FileList.js`, `Banner.js`, `PreviewPanel.js`
- **Animations**: `src/ui/components/AnimatedProgress.js` with Spinner, Gradient, BigText
- **Testing Support**: Ink Testing Library integration in `src/testing/`

#### Yoga Layout Engine (205+ references across 32 files)
- **Core Engine**: `src/lib/EnhancedYogaLayoutEngine.js` - Main layout engine with 3,381 lines
- **Memory Optimization**: `src/lib/YogaMemoryOptimizer.js` - Advanced memory management
- **Config Optimizer**: `src/lib/YogaConfigOptimizer.js` - Deep configuration analysis
- **Incremental Diffing**: `src/ninja/IncrementalYogaDiffing.js` - Only recalculates changed nodes
- **Layout Variants**: `YogaIncrementalLayout.js`, `YogaLayoutEngine.js`, `simple-yoga-incremental.js`

#### Ninja Build Integration
- **Incremental Engine**: `src/lib/NinjaIncrementalEngine.js`
- **Smart File Handler**: `src/lib/SmartFileHandler.js` with Ninja-based change detection
- **Build Command**: `src/commands/build.js` - Full Ninja integration with build graphs

#### Astro Integration
- **Dynamic Generator**: `src/lib/DynamicAstroGenerator.js` - 743 lines for preview generation
- **Preview Manager**: `src/lib/PreviewManager.js` - Astro server management
- **Static Site Output**: `/astro/` directory for generated content

### Dependency Injection Architecture
The entire application is built around a sophisticated DI container (`src/lib/DIContainer.js`) providing:
- **Service lifecycle management** (singleton, transient, scoped)
- **Circular dependency detection** with error reporting
- **Testing support** with comprehensive mocking/stubbing
- **Graceful initialization/shutdown** for all services

### Service Categories
**Infrastructure**: `errorHandler`, `lazyLoader`, `accessibilityManager`
**File Processing**: `fileValidator`, `smartFileHandler`, `packageManager`, `streamingPackageManager`  
**Layout & Design**: `layoutEngine`, `themeSystem`, `astroGenerator`, `themeIntegration`
**Advanced Features**: `hotReloadSystem`, `browshWrapper`, `shareCliIntegration`, `celebrationSystem`

### Command Pattern
All CLI commands are factory functions that receive the DI container:
```javascript
export function createAddCommand(container) {
  return async (files, options) => {
    const submitit = await container.resolve('submitit');
    return await submitit.addContent(files, options);
  };
}
```

## Key Modules & Responsibilities

### Core Services (`src/core/`)
- **ProjectManager.js**: Central project coordination, file scanning, intelligent role inference
- **ErrorHandler.js**: Comprehensive error handling with user-friendly messages and recovery suggestions
- **PackageManager.js**: Multi-format export (zip, tar, rar, 7z, iso) with streaming support

### Layout System (`src/lib/EnhancedYogaLayoutEngine.js`)
- **Incremental diffing** for performance optimization
- **Memory management** with profiling and cleanup
- **Terminal detection** with adaptive scaling
- **Content-based invalidation** using hash comparison

### File Processing (`src/ninja/SmartFileHandler.js`)
- **Ninja-based incremental builds** with change detection
- **Dependency tracking** for smart cache invalidation
- **Batch operations** for efficiency
- **Streaming support** for large files

### Theme System (`src/lib/SophisticatedThemeSystem.js`)
- **Hot reloading** during development
- **Visual theme editor** with real-time preview
- **Professional themes**: noir, academic, brutalist, modern
- **Component-based styling** with validation

### Preview System (`src/lib/PreviewManager.js`)
- **Web previews** via Astro dynamic generation
- **ASCII previews** via Browsh terminal browser integration
- **Hot reload** with file watching
- **Multi-modal output** (web, terminal, static)

## Configuration Patterns

### Project Configuration (`submitit.config.json`)
```json
{
  "name": "project-name",
  "theme": "noir", 
  "layout": { "type": "column", "children": [...] },
  "files": [...],
  "metadata": { "title": "...", "author": "..." }
}
```

### Service Registration (`src/config/serviceRegistration.js`)
Central configuration for all DI services with lifecycle management and dependency validation.

### Lazy Loading (`src/config/lazyModules.js`)
Dynamic import configuration for performance optimization of heavy dependencies.

## Testing Strategy

### Custom Test Framework (`src/testing/TestFramework.js`)
- **Ink component testing** with ink-testing-library integration
- **Easy mocking** with automatic cleanup
- **TDD-focused** design for rapid component development

### DI Testing (`src/testing/DITestUtils.js`)
- **Service mocking** through container
- **Test scopes** for isolated testing
- **Mock lifecycle** management

### Test Organization
- **Unit tests**: Individual component testing
- **Integration tests**: Service interaction testing  
- **Performance tests**: Layout engine optimization validation

## Memory & Performance Optimizations

### Incremental Processing
- **Content-based change detection** using SHA-256 hashing
- **Dependency-aware invalidation** for minimal recomputation
- **Batch processing** with parallel operation support
- **Smart caching** with LRU eviction policies

### Layout Performance
- **Yoga node reuse** and memory profiling
- **Terminal-aware responsive design** with breakpoint optimization
- **Configuration optimization** per rendering context
- **Performance metrics** and monitoring

### File Handling
- **Streaming operations** for large files (>100MB)
- **Memory-efficient exports** with progressive compression
- **Smart file role detection** without full content reading

## Extension Points & Customization

### Theme Development
- JSON-based theme definitions in `src/themes/`
- Component-based styling with validation
- Hot-reloadable development workflow
- Visual theme editor for real-time customization

### Export Formats
Multiple archive formats with streaming support and custom naming patterns.

### Service Integration
- File sharing platforms (multiple providers)
- Error analytics and reporting  
- Achievement tracking with celebration animations
- Accessibility features and inclusive design

## Known Issues & Workarounds

### JSX Compatibility
Some UI components contain JSX syntax that may cause import errors. Use the non-JSX alternatives in `src/components/` when available.

### Dependency Resolution
The DI container performs circular dependency detection. If initialization fails, check `src/config/serviceRegistration.js` for proper service ordering.

### Memory Management
For large projects (>1000 files), enable streaming mode in export operations and monitor memory usage with the built-in profiling tools.

## Node.js Requirements

- **Node.js 18+** required for ES modules and modern features
- **ES modules only** - no CommonJS support
- **Type**: "module" in package.json enforces ES module usage