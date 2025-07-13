declare module '../lib/BrowshPreviewWrapper' {
  export interface BrowshPreviewOptions {
    width?: number;
    height?: number;
    timeout?: number;
    debug?: boolean;
    userAgent?: string;
    viewportWidth?: number;
    viewportHeight?: number;
    deviceScaleFactor?: number;
    isMobile?: boolean;
    hasTouch?: boolean;
    isLandscape?: boolean;
  }

  export interface RenderOptions {
    format?: 'ansi' | 'html' | 'screenshot';
    fullPage?: boolean;
    quality?: number;
    encoding?: 'binary' | 'base64';
  }

  export interface RenderResult {
    data: string | Buffer;
    metadata: {
      width: number;
      height: number;
      format: string;
      url: string;
      timestamp: number;
    };
  }

  export default class BrowshPreviewWrapper {
    constructor(options?: BrowshPreviewOptions);

    // Core methods
    initialize(): Promise<void>;
    close(): Promise<void>;
    navigateTo(url: string, options?: { timeout?: number; waitUntil?: string }): Promise<void>;
    
    // Rendering methods
    renderToASCII(options?: RenderOptions): Promise<string>;
    renderToHTML(options?: RenderOptions): Promise<string>;
    renderToImage(options?: RenderOptions & { format: 'jpeg' | 'png' }): Promise<Buffer>;
    
    // Page interaction
    evaluate<T>(pageFunction: (...args: any[]) => T, ...args: any[]): Promise<T>;
    screenshot(options?: RenderOptions & { path?: string }): Promise<Buffer | string>;
    
    // Utility methods
    setViewport(options: { width: number; height: number }): Promise<void>;
    setUserAgent(userAgent: string): Promise<void>;
    getContent(): Promise<string>;
    
    // Error handling
    onError(handler: (error: Error) => void): void;
  }
}
