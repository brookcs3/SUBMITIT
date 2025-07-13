// Type definitions for AdvancedTerminalDetector
declare module '../lib/AdvancedTerminalDetector' {
  interface TerminalCapabilities {
    colors: {
      depth: number;
      trueColor: boolean;
      supports256: boolean;
      supports16: boolean;
      monochrome: boolean;
      score: number;
    };
    unicode: {
      level: number;
      basicSupport: boolean;
      extendedSupport: boolean;
      fullSupport: boolean;
      testChars: string[];
      score: number;
    };
    screen: {
      width: number;
      height: number;
      ratio: number;
      score: number;
    };
    performance: {
      renderTime: number;
      fps: number;
      score: number;
    };
    features: {
      images: boolean;
      animations: boolean;
      audio: boolean;
      input: boolean;
      score: number;
    };
    compatibility: {
      browser: string;
      node: string;
      electron: string;
      score: number;
    };
    timestamp: number;
    score: number;
    tier: string;
  }

  interface TerminalLayout {
    factor: number;
    columns: number;
    rows: number;
    breakpoint: string;
    category: string;
    recommendation: string;
  }

  interface TerminalRecommendations {
    layout: TerminalLayout;
    typography: {
      charWidth: number;
      lineHeight: number;
      symbolSupport: Record<string, boolean>;
      fontTier: string;
      recommendation: string;
    };
    spacing: {
      horizontal: number;
      vertical: number;
      recommendation: string;
    };
    interaction: {
      clickable: boolean;
      hover: boolean;
      recommendation: string;
    };
    performance: {
      renderTime: number;
      recommendation: string;
    };
    accessibility: {
      contrast: number;
      recommendation: string;
    };
    overall: {
      score: number;
      tier: string;
      recommendation: string;
    };
  }

  interface TerminalDetectionResult {
    capabilities: TerminalCapabilities;
    recommendations: TerminalRecommendations;
  }

  class AdvancedTerminalDetector {
    static detect(): Promise<TerminalDetectionResult>;
    static getCapabilities(): TerminalCapabilities;
    static getRecommendations(capabilities: TerminalCapabilities): TerminalRecommendations;
    static getLayoutScore(dims: { width: number; height: number }, targetLayout?: string): number;
    static getTerminalType(score: number): string;
    
    private static detectionHistory: Array<{
      timestamp: number;
      capabilities: TerminalCapabilities;
      recommendations: TerminalRecommendations;
    }>;
  }

  export default AdvancedTerminalDetector;
}
