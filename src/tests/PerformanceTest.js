/**
 * Performance Test Suite for Submitit Integrated Systems
 */
import { performance } from 'perf_hooks';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import ProjectManager from '../core/ProjectManager.js';
import SmartFileHandler from '../ninja/SmartFileHandler.js';
import IncrementalYogaDiffing from '../ninja/IncrementalYogaDiffing.js';
import PackageManager from '../core/PackageManager.js';
import PreviewManager from '../core/PreviewManager.js';

export class PerformanceTest {
  constructor() {
    this.testDir = './test-performance';
    this.results = {
      timestamp: new Date().toISOString(),
      testCases: [],
      summary: {}
    };
  }

  /**
   * Run comprehensive performance test suite
   */
  async runAll() {
    console.log('🏃‍♂️ Starting performance test suite...');
    
    try {
      await this.setupTestEnvironment();
      
      // Core system tests
      await this.testProjectManagerPerformance();
      await this.testSmartFileHandlerPerformance();
      await this.testYogaDiffingPerformance();
      await this.testPackageManagerPerformance();
      await this.testPreviewManagerPerformance();
      
      // Integration tests
      await this.testFullPipelinePerformance();
      await this.testConcurrentOperations();
      await this.testMemoryUsage();
      
      // Generate summary
      this.generateSummary();
      
      console.log('✅ Performance test suite completed');
      return this.results;
      
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Setup test environment with sample files
   */
  async setupTestEnvironment() {
    console.log('🔧 Setting up test environment...');
    
    await mkdir(this.testDir, { recursive: true });
    await mkdir(join(this.testDir, 'content'), { recursive: true });
    
    // Create test files of various sizes
    const testFiles = [
      { name: 'hero.md', size: 'small', content: this.generateContent(500) },
      { name: 'bio.md', size: 'medium', content: this.generateContent(2000) },
      { name: 'projects.md', size: 'large', content: this.generateContent(10000) },
      { name: 'gallery.md', size: 'medium', content: this.generateContent(3000) },
      { name: 'contact.md', size: 'small', content: this.generateContent(300) }
    ];
    
    for (let i = 0; i < 20; i++) {
      testFiles.push({
        name: `content-${i}.md`,
        size: 'medium',
        content: this.generateContent(1500 + Math.random() * 1000)
      });
    }
    
    for (const file of testFiles) {
      await writeFile(join(this.testDir, 'content', file.name), file.content);
    }
    
    console.log(`📁 Created ${testFiles.length} test files`);
  }

  /**
   * Test ProjectManager performance
   */
  async testProjectManagerPerformance() {
    console.log('📊 Testing ProjectManager performance...');
    
    const testCase = {
      name: 'ProjectManager',
      operations: [],
      metrics: {}
    };
    
    const projectManager = new ProjectManager();
    
    // Test initialization
    const initStart = performance.now();
    await projectManager.initializeProject(this.testDir);
    const initTime = performance.now() - initStart;
    
    testCase.operations.push({
      operation: 'initialize',
      duration: initTime,
      filesScanned: projectManager.files.size
    });
    
    // Test role inference
    const inferStart = performance.now();
    const fileStats = projectManager.getProjectStats();
    const inferTime = performance.now() - inferStart;
    
    testCase.operations.push({
      operation: 'roleInference',
      duration: inferTime,
      rolesDetected: Object.keys(fileStats.roles).length
    });
    
    // Test constraint validation
    const validationStart = performance.now();
    const violations = projectManager.validateRoleConstraints();
    const validationTime = performance.now() - validationStart;
    
    testCase.operations.push({
      operation: 'constraintValidation',
      duration: validationTime,
      violations: violations.length
    });
    
    testCase.metrics = {
      totalTime: initTime + inferTime + validationTime,
      filesPerSecond: projectManager.files.size / ((initTime + inferTime) / 1000),
      memoryUsage: process.memoryUsage()
    };
    
    this.results.testCases.push(testCase);
    console.log(`  ✅ ProjectManager: ${testCase.metrics.totalTime.toFixed(2)}ms`);
  }

  /**
   * Test SmartFileHandler performance
   */
  async testSmartFileHandlerPerformance() {
    console.log('⚡ Testing SmartFileHandler performance...');
    
    const testCase = {
      name: 'SmartFileHandler',
      operations: [],
      metrics: {}
    };
    
    const smartHandler = new SmartFileHandler(join(this.testDir, '.cache'));
    await smartHandler.initialize();
    
    // Get test files
    const projectManager = new ProjectManager();
    await projectManager.initializeProject(this.testDir);
    const testFiles = Array.from(projectManager.files.values());
    
    const fileProcessor = async (content, filePath) => {
      // Simulate processing work
      await new Promise(resolve => setTimeout(resolve, Math.random() * 5));
      return { processed: true, length: content.length };
    };
    
    // Test first run (cold cache)
    const coldStart = performance.now();
    const coldResult = await smartHandler.processFiles(
      testFiles.map(f => f.path),
      fileProcessor
    );
    const coldTime = performance.now() - coldStart;
    
    testCase.operations.push({
      operation: 'coldProcessing',
      duration: coldTime,
      filesProcessed: coldResult.results.length,
      cacheHits: 0
    });
    
    // Test second run (warm cache)
    const warmStart = performance.now();
    const warmResult = await smartHandler.processFiles(
      testFiles.map(f => f.path),
      fileProcessor
    );
    const warmTime = performance.now() - warmStart;
    
    const metrics = smartHandler.getMetrics();
    
    testCase.operations.push({
      operation: 'warmProcessing',
      duration: warmTime,
      filesProcessed: warmResult.results.length,
      cacheHits: metrics.cacheHits
    });
    
    testCase.metrics = {
      cacheHitRatio: metrics.cacheHitRatio,
      speedupRatio: coldTime / warmTime,
      avgProcessingTime: metrics.averageProcessingTime,
      memoryUsage: process.memoryUsage()
    };
    
    this.results.testCases.push(testCase);
    console.log(`  ⚡ SmartFileHandler: ${testCase.metrics.speedupRatio.toFixed(2)}x speedup`);
  }

  /**
   * Test Yoga diffing performance
   */
  async testYogaDiffingPerformance() {
    console.log('🧘 Testing Yoga diffing performance...');
    
    const testCase = {
      name: 'YogaDiffing',
      operations: [],
      metrics: {}
    };
    
    const yogaDiffing = new IncrementalYogaDiffing();
    await yogaDiffing.initializeEngine();
    
    // Test layout calculations
    const layoutStart = performance.now();
    
    for (let i = 0; i < 50; i++) {
      const layoutProps = {
        width: 80 + Math.random() * 40,
        height: 'auto',
        padding: Math.floor(Math.random() * 5),
        role: ['hero', 'bio', 'projects', 'gallery'][Math.floor(Math.random() * 4)]
      };
      
      await yogaDiffing.calculateIncrementalLayout(
        `test-node-${i}`,
        layoutProps,
        `parent-${Math.floor(i / 5)}`
      );
    }
    
    const layoutTime = performance.now() - layoutStart;
    
    testCase.operations.push({
      operation: 'layoutCalculation',
      duration: layoutTime,
      nodesCalculated: 50
    });
    
    // Test cache performance
    const cacheStart = performance.now();
    
    for (let i = 0; i < 25; i++) {
      // Recalculate same layouts
      const layoutProps = {
        width: 80,
        height: 'auto',
        padding: 1,
        role: 'hero'
      };
      
      await yogaDiffing.calculateIncrementalLayout(
        `test-node-${i}`,
        layoutProps,
        `parent-${Math.floor(i / 5)}`
      );
    }
    
    const cacheTime = performance.now() - cacheStart;
    const metrics = yogaDiffing.getMetrics();
    
    testCase.operations.push({
      operation: 'cacheHits',
      duration: cacheTime,
      cacheHitRatio: metrics.cacheHitRatio
    });
    
    testCase.metrics = {
      layoutsPerSecond: 50 / (layoutTime / 1000),
      cacheEfficiency: metrics.cacheHitRatio,
      memoryUsage: process.memoryUsage()
    };
    
    this.results.testCases.push(testCase);
    console.log(`  🧘 YogaDiffing: ${testCase.metrics.layoutsPerSecond.toFixed(0)} layouts/sec`);
  }

  /**
   * Test PackageManager performance
   */
  async testPackageManagerPerformance() {
    console.log('📦 Testing PackageManager performance...');
    
    const testCase = {
      name: 'PackageManager',
      operations: [],
      metrics: {}
    };
    
    const packageManager = new PackageManager(join(this.testDir, 'dist'));
    const projectManager = new ProjectManager();
    await projectManager.initializeProject(this.testDir);
    
    const config = projectManager.config;
    await packageManager.initialize(config);
    
    const testFiles = Array.from(projectManager.files.values());
    
    // Test export performance
    const exportStart = performance.now();
    const exportResult = await packageManager.exportProject(testFiles, {
      streaming: true,
      generateIndex: true,
      generateSitemap: true
    });
    const exportTime = performance.now() - exportStart;
    
    testCase.operations.push({
      operation: 'export',
      duration: exportTime,
      filesExported: exportResult.files.length,
      assetsProcessed: exportResult.assets.length
    });
    
    // Test streaming vs non-streaming
    await packageManager.clean();
    await packageManager.initialize(config);
    
    const noStreamStart = performance.now();
    await packageManager.exportProject(testFiles, {
      streaming: false,
      generateIndex: false,
      generateSitemap: false
    });
    const noStreamTime = performance.now() - noStreamStart;
    
    testCase.operations.push({
      operation: 'nonStreaming',
      duration: noStreamTime
    });
    
    testCase.metrics = {
      exportRate: testFiles.length / (exportTime / 1000),
      streamingSpeedup: noStreamTime / exportTime,
      totalSize: exportResult.files.reduce((sum, f) => sum + f.size, 0),
      memoryUsage: process.memoryUsage()
    };
    
    this.results.testCases.push(testCase);
    console.log(`  📦 PackageManager: ${testCase.metrics.exportRate.toFixed(1)} files/sec`);
  }

  /**
   * Test PreviewManager performance
   */
  async testPreviewManagerPerformance() {
    console.log('🎭 Testing PreviewManager performance...');
    
    const testCase = {
      name: 'PreviewManager',
      operations: [],
      metrics: {}
    };
    
    const previewManager = new PreviewManager();
    await previewManager.initialize(this.testDir);
    
    const projectManager = new ProjectManager();
    await projectManager.initializeProject(this.testDir);
    const testFiles = Array.from(projectManager.files.values());
    
    // Test preview generation
    const previewStart = performance.now();
    await previewManager.generatePreviewContent(testFiles, {
      theme: 'neon',
      mode: 'desktop'
    });
    const previewTime = performance.now() - previewStart;
    
    testCase.operations.push({
      operation: 'generatePreview',
      duration: previewTime,
      filesProcessed: testFiles.length
    });
    
    // Test layout mode switching
    const modeStart = performance.now();
    const modeResults = await previewManager.testLayoutModes(testFiles);
    const modeTime = performance.now() - modeStart;
    
    testCase.operations.push({
      operation: 'layoutModes',
      duration: modeTime,
      modesGenerated: Object.keys(modeResults).length
    });
    
    testCase.metrics = {
      previewRate: testFiles.length / (previewTime / 1000),
      modeGenerationTime: modeTime / Object.keys(modeResults).length,
      memoryUsage: process.memoryUsage()
    };
    
    this.results.testCases.push(testCase);
    console.log(`  🎭 PreviewManager: ${testCase.metrics.previewRate.toFixed(1)} files/sec`);
  }

  /**
   * Test full pipeline performance
   */
  async testFullPipelinePerformance() {
    console.log('🚀 Testing full pipeline performance...');
    
    const testCase = {
      name: 'FullPipeline',
      operations: [],
      metrics: {}
    };
    
    const pipelineStart = performance.now();
    
    // Initialize all systems
    const projectManager = new ProjectManager();
    const smartHandler = new SmartFileHandler(join(this.testDir, '.cache2'));
    const yogaDiffing = new IncrementalYogaDiffing();
    const packageManager = new PackageManager(join(this.testDir, 'dist2'));
    
    await Promise.all([
      projectManager.initializeProject(this.testDir),
      smartHandler.initialize(),
      yogaDiffing.initializeEngine()
    ]);
    
    await packageManager.initialize(projectManager.config);
    
    const initTime = performance.now() - pipelineStart;
    
    // Process files
    const processStart = performance.now();
    const testFiles = Array.from(projectManager.files.values());
    
    const fileProcessor = async (content) => ({ processed: true });
    await smartHandler.processFiles(testFiles.map(f => f.path), fileProcessor);
    
    // Calculate layouts
    for (const file of testFiles) {
      await yogaDiffing.calculateIncrementalLayout(
        `pipeline-${file.path}`,
        { width: 80, height: 'auto', padding: 1 }
      );
    }
    
    // Export
    await packageManager.exportProject(testFiles, { streaming: true });
    
    const processTime = performance.now() - processStart;
    const totalTime = performance.now() - pipelineStart;
    
    testCase.operations.push({
      operation: 'initialization',
      duration: initTime
    });
    
    testCase.operations.push({
      operation: 'processing',
      duration: processTime,
      filesProcessed: testFiles.length
    });
    
    testCase.metrics = {
      totalTime,
      throughput: testFiles.length / (totalTime / 1000),
      memoryPeak: process.memoryUsage(),
      efficiency: processTime / totalTime
    };
    
    this.results.testCases.push(testCase);
    console.log(`  🚀 Full Pipeline: ${testCase.metrics.throughput.toFixed(1)} files/sec`);
  }

  /**
   * Test concurrent operations
   */
  async testConcurrentOperations() {
    console.log('⚡ Testing concurrent operations...');
    
    const testCase = {
      name: 'ConcurrentOperations',
      operations: [],
      metrics: {}
    };
    
    const concurrentStart = performance.now();
    
    // Run multiple operations concurrently
    const promises = [];
    
    for (let i = 0; i < 5; i++) {
      const projectManager = new ProjectManager();
      promises.push(projectManager.initializeProject(this.testDir));
    }
    
    for (let i = 0; i < 3; i++) {
      const yogaDiffing = new IncrementalYogaDiffing();
      promises.push(yogaDiffing.initializeEngine().then(() => {
        return yogaDiffing.calculateIncrementalLayout(
          `concurrent-${i}`,
          { width: 80, height: 'auto' }
        );
      }));
    }
    
    await Promise.all(promises);
    
    const concurrentTime = performance.now() - concurrentStart;
    
    testCase.operations.push({
      operation: 'concurrent',
      duration: concurrentTime,
      operationsCount: promises.length
    });
    
    testCase.metrics = {
      concurrentTime,
      operationsPerSecond: promises.length / (concurrentTime / 1000),
      memoryUsage: process.memoryUsage()
    };
    
    this.results.testCases.push(testCase);
    console.log(`  ⚡ Concurrent: ${testCase.metrics.operationsPerSecond.toFixed(1)} ops/sec`);
  }

  /**
   * Test memory usage patterns
   */
  async testMemoryUsage() {
    console.log('💾 Testing memory usage...');
    
    const testCase = {
      name: 'MemoryUsage',
      operations: [],
      metrics: {}
    };
    
    const initialMemory = process.memoryUsage();
    
    // Create memory-intensive operations
    const largeFiles = [];
    for (let i = 0; i < 100; i++) {
      largeFiles.push({
        path: `large-${i}.md`,
        content: this.generateContent(50000),
        role: 'content'
      });
    }
    
    const memoryStart = performance.now();
    
    const packageManager = new PackageManager(join(this.testDir, 'memory-test'));
    await packageManager.initialize({ name: 'memory-test', theme: 'neon' });
    
    // Test streaming vs non-streaming memory usage
    const streamingMemoryBefore = process.memoryUsage();
    await packageManager.exportProject(largeFiles, { streaming: true });
    const streamingMemoryAfter = process.memoryUsage();
    
    await packageManager.clean();
    
    const nonStreamingMemoryBefore = process.memoryUsage();
    await packageManager.exportProject(largeFiles, { streaming: false });
    const nonStreamingMemoryAfter = process.memoryUsage();
    
    const memoryTime = performance.now() - memoryStart;
    
    testCase.operations.push({
      operation: 'memoryTest',
      duration: memoryTime,
      streamingMemoryDelta: streamingMemoryAfter.heapUsed - streamingMemoryBefore.heapUsed,
      nonStreamingMemoryDelta: nonStreamingMemoryAfter.heapUsed - nonStreamingMemoryBefore.heapUsed
    });
    
    testCase.metrics = {
      initialMemory,
      streamingEfficiency: testCase.operations[0].streamingMemoryDelta / testCase.operations[0].nonStreamingMemoryDelta,
      memoryPerFile: testCase.operations[0].streamingMemoryDelta / largeFiles.length
    };
    
    this.results.testCases.push(testCase);
    console.log(`  💾 Memory: ${(testCase.metrics.streamingEfficiency * 100).toFixed(1)}% streaming efficiency`);
  }

  /**
   * Generate summary statistics
   */
  generateSummary() {
    const summary = {
      totalTests: this.results.testCases.length,
      totalTime: this.results.testCases.reduce((sum, test) => {
        return sum + test.operations.reduce((opSum, op) => opSum + op.duration, 0);
      }, 0),
      averageMemoryUsage: 0,
      keyMetrics: {}
    };
    
    // Calculate key metrics
    const pipelineTest = this.results.testCases.find(t => t.name === 'FullPipeline');
    if (pipelineTest) {
      summary.keyMetrics.overallThroughput = pipelineTest.metrics.throughput;
    }
    
    const smartHandlerTest = this.results.testCases.find(t => t.name === 'SmartFileHandler');
    if (smartHandlerTest) {
      summary.keyMetrics.cacheSpeedup = smartHandlerTest.metrics.speedupRatio;
    }
    
    const memoryTest = this.results.testCases.find(t => t.name === 'MemoryUsage');
    if (memoryTest) {
      summary.keyMetrics.memoryEfficiency = memoryTest.metrics.streamingEfficiency;
    }
    
    this.results.summary = summary;
    
    console.log('📊 Performance Summary:');
    console.log(`  Total time: ${summary.totalTime.toFixed(2)}ms`);
    console.log(`  Overall throughput: ${summary.keyMetrics.overallThroughput?.toFixed(1) || 'N/A'} files/sec`);
    console.log(`  Cache speedup: ${summary.keyMetrics.cacheSpeedup?.toFixed(2) || 'N/A'}x`);
    console.log(`  Memory efficiency: ${((summary.keyMetrics.memoryEfficiency || 1) * 100).toFixed(1)}%`);
  }

  /**
   * Generate test content
   */
  generateContent(length) {
    const words = ['test', 'content', 'performance', 'markdown', 'file', 'data', 'sample', 'text'];
    let content = '';
    
    while (content.length < length) {
      const word = words[Math.floor(Math.random() * words.length)];
      content += word + ' ';
    }
    
    return content.substring(0, length);
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
   * Save performance results
   */
  async saveResults(outputPath = './performance-results.json') {
    await writeFile(outputPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Results saved to: ${outputPath}`);
  }
}

export default PerformanceTest;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new PerformanceTest();
  const results = await test.runAll();
  await test.saveResults();
  
  console.log('\n🏁 Performance test completed successfully!');
  process.exit(0);
}