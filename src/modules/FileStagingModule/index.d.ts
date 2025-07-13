// Type definitions for the File Staging Module
declare module '../modules/FileStagingModule/FileStagingModule' {
  import { ReactNode } from 'react';
  
  export interface FileMetadata {
    name: string;
    path: string;
    size: number;
    type: string;
    lastModified: number;
  }

  export interface DirectoryStructure {
    path: string;
    name: string;
    type: 'directory' | 'file';
    children?: DirectoryStructure[];
    metadata?: FileMetadata;
  }

  export interface ValidationState {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    info: string[];
  }

  export interface FileStagingModuleProps {
    initialPath?: string;
    maxFileSize?: number;
    allowedExtensions?: string[];
    onValidationChange?: (validation: ValidationState) => void;
    onFilesChange?: (files: FileMetadata[]) => void;
    theme?: any; // Replace with proper theme type if available
  }

  const FileStagingModule: React.FC<FileStagingModuleProps>;
  
  export default FileStagingModule;
}
