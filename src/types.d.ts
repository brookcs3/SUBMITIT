/**
 * Type definitions for Submitit CLI
 */

declare module '../types' {
  export interface FileInfo {
    path: string;
    name: string;
    size: number;
    type: string;
    lastModified?: number;
  }

  export interface ProjectConfig {
    name: string;
    version: string;
    paths: {
      content: string;
      output: string;
      templates: string;
    };
  }

  export interface ProcessingResult {
    success: boolean;
    type?: string;
    message?: string;
    file?: string;
  }

  export interface LayoutResult {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export interface AddOptions {
    preview?: boolean;
    open?: boolean;
    verbose?: boolean;
    debug?: boolean;
    role?: string;
  }
}

export {};
