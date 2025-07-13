/**
 * Type definitions for AdvancedTerminalDetector
 */

declare module './AdvancedTerminalDetector' {
  /** Terminal dimensions interface */
  export interface TerminalDimensions {
    /** Number of columns */
    columns: number;
    /** Number of rows */
    rows: number;
  }

  /** Terminal capabilities interface */
  export interface TerminalCapabilities {
    /** Whether the terminal supports 256 colors */
    supports256Colors: boolean;
    /** Whether the terminal supports true color */
    supportsTrueColor: boolean;
    /** Whether the terminal supports Unicode */
    unicode: boolean;
    /** Whether the terminal supports hyperlinks */
    hyperlinks: boolean;
    /** Whether the terminal supports images */
    images: boolean;
    /** Whether the terminal supports mouse events */
    mouse: boolean;
    /** Whether the terminal supports clipboard access */
    clipboard: boolean;
    /** Terminal performance metrics */
    performance: {
      /** Average render time in ms */
      renderTime: number;
      /** Frame rate in FPS */
      frameRate: number;
    };
  }

  /** Terminal detection options */
  export interface TerminalDetectionOptions {
    /** Whether to enable capability detection */
    enableCapabilityDetection?: boolean;
    /** Whether to enable real-time monitoring */
    enableRealTimeMonitoring?: boolean;
    /** Detection interval in milliseconds */
    detectionInterval?: number;
  }

  /**
   * Detects and provides information about the terminal environment
   */
  export default class AdvancedTerminalDetector {
    /** Current terminal dimensions */
    currentDimensions: TerminalDimensions;
    /** Detected terminal capabilities */
    terminalCapabilities: TerminalCapabilities;
    /** Detection options */
    options: TerminalDetectionOptions;

    /**
     * Create a new terminal detector instance
     * @param options Detection options
     */
    constructor(options?: TerminalDetectionOptions);

    /**
     * Initialize the detector
     */
    initialize(): Promise<void>;

    /**
     * Perform initial detection of terminal capabilities
     */
    performInitialDetection(): Promise<{
      dimensions: TerminalDimensions;
      capabilities: TerminalCapabilities;
    }>;

    /**
     * Start real-time monitoring of terminal changes
     */
    startRealtimeMonitoring(): void;

    /**
     * Stop real-time monitoring
     */
    stopRealtimeMonitoring(): void;

    /**
     * Detect terminal capabilities and environment
     */
    detect(): Promise<{
      /** Terminal type/name */
      terminal: string;
      /** Terminal dimensions */
      dimensions: TerminalDimensions;
      /** Whether the terminal is a TTY */
      isTTY: boolean;
      /** Terminal features */
      features: TerminalCapabilities;
    }>;

    /**
     * Detect terminal dimensions
     */
    detectDimensions(): TerminalDimensions;

    /**
     * Categorize terminal dimensions
     */
    categorizeDimensions(width: number, height: number): string;

    /**
     * Get terminal breakpoint
     */
    getBreakpoint(width: number, height: number): string;

    /**
     * Calculate terminal density
     */
    calculateDensity(width: number, height: number): number;

    /**
     * Calculate terminal efficiency
     */
    calculateEfficiency(width: number, height: number): number;

    /**
     * Detect terminal capabilities
     */
    detectCapabilities(): Promise<TerminalCapabilities>;

    /**
     * Detect color support
     */
    detectColorSupport(): Promise<{
      supports256Colors: boolean;
      supportsTrueColor: boolean;
    }>;

    /**
     * Detect Unicode support
     */
    detectUnicodeSupport(): Promise<boolean>;

    /**
     * Detect mouse support
     */
    detectMouseSupport(): Promise<boolean>;

    /**
     * Detect clipboard support
     */
    detectClipboardSupport(): Promise<boolean>;

    /**
     * Detect notification support
     */
    detectNotificationSupport(): Promise<boolean>;

    /**
     * Detect font support
     */
    detectFontSupport(): Promise<boolean>;

    /**
     * Detect performance capabilities
     */
    detectPerformanceCapabilities(): Promise<{
      renderTime: number;
      frameRate: number;
    }>;

    /**
     * Detect terminal environment
     */
    detectEnvironment(): Promise<{
      isCI: boolean;
      isDocker: boolean;
      isWSL: boolean;
      isSSH: boolean;
      isRoot: boolean;
    }>;

    /**
     * Calculate capability score
     */
    calculateCapabilityScore(capabilities: TerminalCapabilities): number;

    /**
     * Get capability tier
     */
    getCapabilityTier(score: number): string;

    /**
     * Get adaptive scaling
     */
    getAdaptiveScaling(targetLayout: any): any;

    /**
     * Get layout scaling
     */
    getLayoutScaling(dims: TerminalDimensions, targetLayout: any): any;

    /**
     * Get typography scaling
     */
    getTypographyScaling(dims: TerminalDimensions, caps: TerminalCapabilities): any;

    /**
     * Get spacing scaling
     */
    getSpacingScaling(dims: TerminalDimensions): any;

    /**
     * Get interaction scaling
     */
    getInteractionScaling(caps: TerminalCapabilities): any;

    /**
     * Get performance scaling
     */
    getPerformanceScaling(caps: TerminalCapabilities): any;

    /**
     * Get accessibility scaling
     */
    getAccessibilityScaling(caps: TerminalCapabilities): any;

    /**
     * Calculate overall scaling
     */
    calculateOverallScaling(scaling: any): any;

    /**
     * Get scaling recommendation
     */
    getScalingRecommendation(scaling: any): any;

    /**
     * Get layout recommendation
     */
    getLayoutRecommendation(dims: TerminalDimensions, targetLayout: any): any;

    /**
     * Get default scaling
     */
    getDefaultScaling(): any;

    /**
     * Handle terminal resize event
     */
    handleResizeEvent(): void;

    /**
     * Process terminal resize
     */
    processResize(): Promise<void>;

    /**
     * Log an error message
     */
    logError(message: string, error?: Error): void;

    /**
     * Get a human-readable report of terminal capabilities
     */
    getTerminalReport(): Promise<string>;

    /**
     * Check if the terminal supports a specific feature
     * @param feature Feature to check (e.g., 'unicode', 'colors', 'hyperlinks')
     */
    supports(feature: string): Promise<boolean>;

    /**
     * Get the terminal type/name
     */
    getTerminalType(): Promise<string>;

    /**
     * Get the terminal dimensions
     */
    getDimensions(): TerminalDimensions;

    /**
     * Check if the terminal supports a specific number of colors
     * @param count Number of colors to check for (16, 256, or 16777216)
     */
    supportsColors(count: 16 | 256 | 16777216): Promise<boolean>;
  }
}
