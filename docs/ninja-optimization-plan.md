# Ninja Build System Integration & Optimization Plan

## Understanding Incremental Builds

### What Are Incremental Builds?

Incremental builds are a core concept of the Ninja build system that enables massive performance improvements by only rebuilding what has actually changed, rather than rebuilding everything from scratch.

**Key Principles:**
1. **Dependency Tracking**: Ninja tracks which files depend on which other files
2. **Timestamp Analysis**: Only rebuild if source is newer than target
3. **Hash-based Detection**: Use content hashes to detect actual changes
4. **Minimal Rebuilds**: Rebuild only the minimum necessary components
5. **Parallel Execution**: Execute independent builds simultaneously

**Example:**
```bash
# Traditional build: Rebuilds everything (slow)
rebuild_everything()

# Incremental build: Only rebuilds changed components (fast)
if (layout_changed) rebuild_layout();
if (theme_changed) rebuild_theme();
if (content_changed) rebuild_content();
```

### How Ninja Achieves Speed

1. **Dependency Graphs**: Ninja builds a directed acyclic graph (DAG) of dependencies
2. **Smart Scheduling**: Executes builds in optimal order with maximum parallelism
3. **Minimal I/O**: Only reads/writes files that actually need updating
4. **Memory Efficiency**: Keeps build state in memory for fast subsequent builds

## Applying Incremental Builds to Submitit

### Current Challenge

Our layout engine and file processing currently rebuilds everything when any change occurs:

```javascript
// CURRENT: Full rebuild approach (inefficient)
async function generatePreview(project) {
  // Always rebuilds everything
  const layout = await layoutEngine.calculateLayout(project.files);
  const theme = await themeSystem.generateTheme(project.theme);
  const preview = await previewSystem.render(layout, theme);
  return preview;
}
```

### Solution: Ninja-Inspired Incremental System

#### Step 1: Implement Dependency Tracking

```javascript
/**
 * Ninja-Inspired Incremental Build System
 * Tracks dependencies and rebuilds only what changed
 */
class IncrementalBuildSystem {
  constructor() {
    this.dependencyGraph = new Map(); // File -> [dependencies]
    this.buildCache = new Map();      // File -> {hash, timestamp, result}
    this.buildQueue = new Set();      // Files needing rebuild
  }

  // Track that fileA depends on fileB
  addDependency(fileA, fileB) {
    if (!this.dependencyGraph.has(fileA)) {
      this.dependencyGraph.set(fileA, new Set());
    }
    this.dependencyGraph.get(fileA).add(fileB);
  }

  // Check if file needs rebuilding
  needsRebuild(filePath, contentHash) {
    const cached = this.buildCache.get(filePath);
    if (!cached) return true; // Never built
    
    // Check if content changed
    if (cached.hash !== contentHash) return true;
    
    // Check if dependencies changed
    const dependencies = this.dependencyGraph.get(filePath) || new Set();
    for (const dep of dependencies) {
      if (this.needsRebuild(dep)) return true;
    }
    
    return false;
  }
}
```

#### Step 2: Layout Engine Integration

```javascript
/**
 * Incremental Layout Engine
 * Only recalculates changed layouts
 */
class IncrementalLayoutEngine extends EnhancedYogaLayoutEngine {
  constructor(options = {}) {
    super(options);
    this.buildSystem = new IncrementalBuildSystem();
    this.layoutCache = new Map(); // Cache calculated layouts
  }

  async calculateIncrementalLayout(files, options = {}) {
    const results = new Map();
    const changedFiles = new Set();

    // 1. Detect changes
    for (const file of files) {
      const contentHash = await this.calculateFileHash(file);
      const layoutId = this.generateLayoutId(file, options);
      
      if (this.buildSystem.needsRebuild(layoutId, contentHash)) {
        changedFiles.add(file);
        this.buildSystem.buildQueue.add(layoutId);
      } else {
        // Use cached result
        results.set(file, this.layoutCache.get(layoutId));
      }
    }

    // 2. Build dependency graph
    this.updateLayoutDependencies(files);

    // 3. Execute incremental builds
    await this.executeIncrementalBuilds(changedFiles, options, results);

    return results;
  }

  updateLayoutDependencies(files) {
    // Track layout dependencies
    for (const file of files) {
      const layoutId = this.generateLayoutId(file);
      
      // Layout depends on file content
      this.buildSystem.addDependency(layoutId, file.path);
      
      // Layout depends on theme
      this.buildSystem.addDependency(layoutId, 'theme-config');
      
      // Layout depends on screen dimensions
      this.buildSystem.addDependency(layoutId, 'terminal-dimensions');
      
      // Layout depends on other files for relative positioning
      for (const otherFile of files) {
        if (otherFile !== file && this.filesAreRelated(file, otherFile)) {
          this.buildSystem.addDependency(layoutId, otherFile.path);
        }
      }
    }
  }

  async executeIncrementalBuilds(changedFiles, options, results) {
    // Group files by dependency level for optimal build order
    const buildGroups = this.createBuildGroups(changedFiles);
    
    for (const group of buildGroups) {
      // Execute builds in parallel within each group
      const buildPromises = group.map(file => this.buildSingleLayout(file, options));
      const groupResults = await Promise.all(buildPromises);
      
      // Update results and cache
      for (let i = 0; i < group.length; i++) {
        const file = group[i];
        const result = groupResults[i];
        const layoutId = this.generateLayoutId(file, options);
        
        results.set(file, result);
        this.layoutCache.set(layoutId, result);
        this.buildSystem.buildCache.set(layoutId, {
          hash: await this.calculateFileHash(file),
          timestamp: Date.now(),
          result
        });
      }
    }
  }
}
```

#### Step 3: File Processing Integration

```javascript
/**
 * Incremental File Processing System
 * Only processes changed files
 */
class IncrementalFileProcessor {
  constructor() {
    this.buildSystem = new IncrementalBuildSystem();
    this.processingCache = new Map();
    this.watchedFiles = new Map(); // File -> watcher
  }

  async processFilesIncremental(files) {
    const results = new Map();
    const processingQueue = [];

    // 1. Detect changes and build queue
    for (const file of files) {
      const fileHash = await this.calculateFileHash(file.path);
      const processId = `process-${file.path}`;
      
      if (this.buildSystem.needsRebuild(processId, fileHash)) {
        processingQueue.push({
          file,
          processId,
          hash: fileHash,
          dependencies: await this.getFileDependencies(file)
        });
      } else {
        // Use cached result
        results.set(file.path, this.processingCache.get(processId));
      }
    }

    // 2. Execute incremental processing
    const processedResults = await this.executeIncrementalProcessing(processingQueue);
    
    // 3. Merge with cached results
    for (const [filePath, result] of processedResults) {
      results.set(filePath, result);
    }

    return results;
  }

  async executeIncrementalProcessing(queue) {
    // Sort by dependencies (topological sort)
    const sortedQueue = this.topologicalSort(queue);
    const results = new Map();
    
    // Process in optimal order with parallelization where possible
    const batches = this.createProcessingBatches(sortedQueue);
    
    for (const batch of batches) {
      const batchPromises = batch.map(async (item) => {
        const result = await this.processFile(item.file);
        
        // Update cache
        this.processingCache.set(item.processId, result);
        this.buildSystem.buildCache.set(item.processId, {
          hash: item.hash,
          timestamp: Date.now(),
          result
        });
        
        return [item.file.path, result];
      });
      
      const batchResults = await Promise.all(batchPromises);
      for (const [filePath, result] of batchResults) {
        results.set(filePath, result);
      }
    }
    
    return results;
  }
}
```

#### Step 4: Preview System Integration

```javascript
/**
 * Incremental Preview Generation
 * Only regenerates changed preview components
 */
class IncrementalPreviewSystem {
  constructor() {
    this.buildSystem = new IncrementalBuildSystem();
    this.previewCache = new Map();
    this.componentDependencies = new Map();
  }

  async generateIncrementalPreview(project, options = {}) {
    const previewComponents = new Map();
    const rebuildQueue = [];

    // 1. Analyze what components need rebuilding
    const components = this.identifyPreviewComponents(project);
    
    for (const component of components) {
      const componentHash = await this.calculateComponentHash(component, project);
      const componentId = this.generateComponentId(component, options);
      
      if (this.buildSystem.needsRebuild(componentId, componentHash)) {
        rebuildQueue.push({ component, componentId, hash: componentHash });
      } else {
        // Use cached component
        previewComponents.set(component, this.previewCache.get(componentId));
      }
    }

    // 2. Execute incremental rebuilds
    const rebuiltComponents = await this.rebuildComponents(rebuildQueue, project, options);
    
    // 3. Compose final preview
    for (const [component, result] of rebuiltComponents) {
      previewComponents.set(component, result);
    }

    // 4. Assemble final preview if any component changed
    if (rebuildQueue.length > 0) {
      return await this.assemblePreview(previewComponents, project, options);
    } else {
      // Return cached full preview
      return this.previewCache.get(this.generatePreviewId(project, options));
    }
  }

  identifyPreviewComponents(project) {
    // Break preview into independently cacheable components
    return [
      'header',      // Project title and metadata
      'file-list',   // List of files
      'layout',      // Yoga layout calculation
      'theme',       // Theme application
      'content',     // File content rendering
      'footer'       // Statistics and summary
    ];
  }

  async rebuildComponents(rebuildQueue, project, options) {
    const results = new Map();
    
    // Group components by build dependencies
    const buildOrder = this.determineBuildOrder(rebuildQueue);
    
    for (const batch of buildOrder) {
      const batchPromises = batch.map(async (item) => {
        const result = await this.buildComponent(item.component, project, options);
        
        // Cache the result
        this.previewCache.set(item.componentId, result);
        this.buildSystem.buildCache.set(item.componentId, {
          hash: item.hash,
          timestamp: Date.now(),
          result
        });
        
        return [item.component, result];
      });
      
      const batchResults = await Promise.all(batchPromises);
      for (const [component, result] of batchResults) {
        results.set(component, result);
      }
    }
    
    return results;
  }
}
```

## Implementation Steps

### Step 1: Core Infrastructure (Week 1)
```javascript
// Implement foundational incremental build system
class SubmititIncrementalEngine {
  constructor() {
    this.dependencyTracker = new DependencyTracker();
    this.buildCache = new BuildCache();
    this.hashCalculator = new ContentHashCalculator();
    this.buildScheduler = new BuildScheduler();
  }
}
```

**Tasks:**
- [ ] Implement dependency tracking system
- [ ] Create content hash calculation utilities
- [ ] Build caching infrastructure
- [ ] Develop build scheduling algorithm

### Step 2: Layout Engine Integration (Week 2)
```javascript
// Integrate incremental builds with Yoga layout engine
class YogaIncrementalEngine extends IncrementalBuildSystem {
  async calculateLayoutIncremental(files, options) {
    // Implementation from above
  }
}
```

**Tasks:**
- [ ] Integrate incremental system with Yoga layout engine
- [ ] Implement layout dependency tracking
- [ ] Create layout result caching
- [ ] Optimize layout calculation batching

### Step 3: File Processing Integration (Week 3)
```javascript
// Apply incremental concepts to file processing
class SmartFileHandlerIncremental extends SmartFileHandlerSimple {
  async processFilesWithIncrementalBuilds(files) {
    // Implementation from above
  }
}
```

**Tasks:**
- [ ] Integrate file processing with incremental builds
- [ ] Implement file dependency detection
- [ ] Create processing result caching
- [ ] Optimize file processing pipelines

### Step 4: Preview System Integration (Week 4)
```javascript
// Apply incremental builds to preview generation
class PreviewManagerIncremental extends PreviewManager {
  async generatePreviewIncremental(project, options) {
    // Implementation from above
  }
}
```

**Tasks:**
- [ ] Integrate preview system with incremental builds
- [ ] Implement preview component dependency tracking
- [ ] Create preview result caching
- [ ] Optimize preview composition

### Step 5: Performance Optimization (Week 5)
```javascript
// Optimize the entire incremental build pipeline
class IncrementalPerformanceOptimizer {
  optimizeBuildPipeline() {
    // Advanced optimization techniques
  }
}
```

**Tasks:**
- [ ] Profile and optimize build performance
- [ ] Implement advanced caching strategies
- [ ] Optimize memory usage
- [ ] Fine-tune parallel execution

## Expected Performance Improvements

### Before Incremental Builds
```
Project with 50 files:
- Full rebuild: ~2000ms
- Preview generation: ~800ms
- Layout calculation: ~500ms
- Theme application: ~300ms
Total: ~3600ms (3.6 seconds)
```

### After Incremental Builds
```
Project with 50 files (1 file changed):
- Incremental rebuild: ~50ms
- Preview generation: ~20ms
- Layout calculation: ~10ms
- Theme application: ~5ms
Total: ~85ms (0.085 seconds)

Performance improvement: 42x faster
```

### Scaling Benefits
```
Traditional approach: O(n) - linear with project size
Incremental approach: O(changes) - scales with changes, not size

For large projects (1000+ files):
- Traditional: 10-60 seconds
- Incremental: 50-200ms (when few files change)
```

## Key Success Metrics

1. **Build Speed**: 95% reduction in rebuild time for small changes
2. **Memory Efficiency**: 50% reduction in memory usage through smart caching
3. **Scalability**: Handle 1000+ file projects with sub-200ms update times
4. **Reliability**: 100% correctness in dependency tracking and cache invalidation

This Ninja-inspired incremental build system will transform submitit from a traditional "rebuild everything" approach to an intelligent, high-performance system that scales gracefully with project size while providing near-instant feedback for iterative development.