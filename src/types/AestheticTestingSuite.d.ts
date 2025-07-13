declare module '../lib/AestheticTestingSuite' {
  export interface AestheticIssue {
    category: string;
    priority: string;
    issue: string;
    suggestion: string;
  }

  export interface AestheticTestResult {
    passed: boolean;
    score: number;
    maxScore: number;
    feedback: string[];
    issues: AestheticIssue[];
  }

  export interface AestheticTestOptions {
    strictMode?: boolean;
    visualDebug?: boolean;
    performanceMetrics?: boolean;
  }

  export default class AestheticTestingSuite {
    constructor(options?: AestheticTestOptions);
    
    // Core testing methods
    testColorContrast(component: any): AestheticTestResult;
    testTypography(component: any): AestheticTestResult;
    testLayout(component: any): AestheticTestResult;
    testVisualHierarchy(component: any): AestheticTestResult;
    testConsistency(components: any[]): AestheticTestResult;
    testResponsiveness(component: any, sizes: Array<{width: number, height: number}>): AestheticTestResult;
    
    // Content generation methods
    generateCreativePortfolio(): string;
    generateInteractiveDashboard(): string;
    generateContentShowcase(): string;
    generateCelebrationDisplay(): string;
    generateDocumentation(): string;
    generateResearchPresentation(): string;
    generateDataAnalysis(): string;
    generateTechnicalReport(): string;
    generateDefaultContent(): string;
    
    // Utility methods
    generateVisualRepresentations(): void;
    logTestResult(result: AestheticTestResult): void;
    formatIssues(issues: AestheticIssue[]): string[];
    
    // Configuration
    setOptions(options: AestheticTestOptions): void;
    resetOptions(): void;
  }
}
