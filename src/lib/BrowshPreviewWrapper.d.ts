/**
 * Type definitions for BrowshPreviewWrapper
 */

declare module './BrowshPreviewWrapper' {
  /**
   * Options for the Browsh preview wrapper
   */
  export interface BrowshPreviewOptions {
    /** Whether to enable JavaScript (default: true) */
    javascript?: boolean;
    /** Whether to load images (default: true) */
    images?: boolean;
    /** Whether to follow redirects (default: true) */
    followRedirects?: boolean;
    /** User agent string to use (default: auto-detected) */
    userAgent?: string;
    /** Viewport width in pixels (default: 1280) */
    viewportWidth?: number;
    /** Viewport height in pixels (default: 800) */
    viewportHeight?: number;
    /** Whether to emulate a mobile device (default: false) */
    mobile?: boolean;
    /** Whether to enable cookies (default: true) */
    cookies?: boolean;
    /** Whether to ignore HTTPS errors (default: false) */
    ignoreHTTPSErrors?: boolean;
    /** Timeout in milliseconds (default: 30000) */
    timeout?: number;
    /** Custom headers to send with each request */
    headers?: Record<string, string>;
  }

  /**
   * Result of a render operation
   */
  export interface RenderResult {
    /** The rendered output as a string */
    output: string;
    /** The URL that was rendered */
    url: string;
    /** The title of the page, if available */
    title?: string;
    /** The status code of the response */
    status: number;
    /** The content type of the response */
    contentType: string;
    /** The size of the rendered output in bytes */
    size: number;
    /** The time taken to render in milliseconds */
    renderTime: number;
    /** Any errors that occurred during rendering */
    errors: Error[];
    /** The raw response headers */
    headers: Record<string, string>;
  }

  /**
   * A wrapper around Browsh for rendering web pages as text/ASCII
   */
  export default class BrowshPreviewWrapper {
    /**
     * Create a new Browsh preview wrapper
     * @param options Options for the wrapper
     */
    constructor(options?: BrowshPreviewOptions);

    /**
     * Initialize the wrapper (must be called before other methods)
     */
    initialize(): Promise<void>;

    /**
     * Render a URL to ASCII text
     * @param url The URL to render
     * @param options Optional render options
     */
    renderURL(url: string, options?: Partial<BrowshPreviewOptions>): Promise<RenderResult>;

    /**
     * Render HTML content to ASCII text
     * @param html The HTML content to render
     * @param options Optional render options
     */
    renderHTML(html: string, options?: Partial<BrowshPreviewOptions>): Promise<RenderResult>;

    /**
     * Render a file to ASCII text
     * @param filePath Path to the file to render
     * @param options Optional render options
     */
    renderFile(filePath: string, options?: Partial<BrowshPreviewOptions>): Promise<RenderResult>;

    /**
     * Close the wrapper and clean up resources
     */
    close(): Promise<void>;

    /**
     * Render content to ASCII (internal method)
     * @private
     */
    private renderToASCII(content: string, options?: Partial<BrowshPreviewOptions>): Promise<RenderResult>;

    /**
     * Get the current browser version
     */
    getBrowserVersion(): Promise<string>;

    /**
     * Take a screenshot of the current page
     * @param path Path to save the screenshot to (optional)
     */
    screenshot(path?: string): Promise<Buffer>;

    /**
     * Get the page title
     */
    getTitle(): Promise<string>;

    /**
     * Get the page URL
     */
    getURL(): Promise<string>;

    /**
     * Get the page content as text
     */
    getTextContent(): Promise<string>;

    /**
     * Get the page content as HTML
     */
    getHTMLContent(): Promise<string>;
  }
}
