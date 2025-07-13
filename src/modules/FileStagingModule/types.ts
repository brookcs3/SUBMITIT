/**
 * Type definitions for the File Staging Module
 */

import { Stats } from 'fs';

export interface FileMetadata {
  /** Full path to the file */
  path: string;
  /** File name with extension */
  name: string;
  /** File size in bytes */
  size: number;
  /** File extension without the dot */
  type: string;
  /** Last modified timestamp */
  lastModified: Date;
  /** Generated preview content (text or structured data) */
  preview?: string | object;
  /** Current validation status */
  validationStatus: 'valid' | 'warning' | 'error';
  /** Validation messages */
  validationMessages: string[];
  /** File stats from the file system */
  stats?: Stats;
}

export interface DirectoryStructure {
  /** Name of the file or directory */
  name: string;
  /** Type of the entry */
  type: 'file' | 'directory';
  /** Full path to the entry */
  path?: string;
  /** File metadata (for files) */
  metadata?: FileMetadata;
  /** Child entries (for directories) */
  children?: DirectoryStructure[];
  /** Whether this directory is expanded in the UI */
  isExpanded?: boolean;
}

export interface ValidationRule {
  /** Unique identifier for the rule */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of the rule */
  description: string;
  /** Function that validates a file and returns error messages */
  validate: (file: FileMetadata) => string[];
  /** Severity level */
  severity: 'error' | 'warning' | 'info';
  /** Whether this rule can be overridden */
  canOverride: boolean;
}

export interface ValidationState {
  /** List of error messages */
  errors: string[];
  /** List of warning messages */
  warnings: string[];
  /** List of informational messages */
  infos: string[];
  /** Whether the current state is valid */
  isValid: boolean;
  /** Timestamp of the last validation */
  lastValidated?: Date;
  /** Map of file paths to their validation status */
  fileValidations: Map<
    string,
    {
      status: 'valid' | 'warning' | 'error';
      messages: string[];
    }
  >;
}

export interface FilePreviewProps {
  /** File metadata */
  file: FileMetadata;
  /** Whether the preview is currently loading */
  isLoading?: boolean;
  /** Error message if preview generation failed */
  error?: string | null;
  /** Callback when the preview should be refreshed */
  onRefresh?: () => void;
  /** Maximum height of the preview in lines */
  maxHeight?: number;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Whether to wrap long lines */
  wrapLines?: boolean;
}

export interface FileExplorerProps {
  /** The directory structure to display */
  structure: DirectoryStructure;
  /** Currently selected file path */
  selectedPath?: string;
  /** Callback when a file is selected */
  onSelect: (file: FileMetadata) => void;
  /** Callback when files are added */
  onAddFiles?: (files: string[]) => void;
  /** Callback when a file is removed */
  onRemoveFile?: (path: string) => void;
  /** Callback when a directory is toggled */
  onToggleDirectory?: (path: string, isExpanded: boolean) => void;
  /** Current search query */
  searchQuery?: string;
  /** Whether to show hidden files */
  showHiddenFiles?: boolean;
  /** Custom validation rules */
  validationRules?: ValidationRule[];
}

export interface ValidationPanelProps {
  /** Current validation state */
  validation: ValidationState;
  /** Callback to re-run validation */
  onValidate?: () => void;
  /** Whether to show the validation panel */
  isVisible?: boolean;
  /** Callback when the panel is toggled */
  onToggleVisibility?: (isVisible: boolean) => void;
  /** Custom validation rules */
  validationRules?: ValidationRule[];
  /** Callback when a validation rule is toggled */
  onToggleRule?: (ruleId: string, isEnabled: boolean) => void;
}

export interface FileOperations {
  // File operations
  loadDirectory: (path: string) => Promise<DirectoryStructure | null>;
  addFiles: (files: string[], targetDir: string) => Promise<FileMetadata[]>;
  removeFile: (path: string) => Promise<boolean>;
  createDirectory: (path: string, name: string) => Promise<boolean>;
  rename: (oldPath: string, newName: string) => Promise<boolean>;
  move: (sourcePath: string, targetPath: string) => Promise<boolean>;
  copy: (sourcePath: string, targetPath: string) => Promise<boolean>;
  exists: (path: string) => Promise<boolean>;
  getStats: (path: string) => Promise<Stats | null>;
  
  // File content operations
  readFile: (filePath: string) => Promise<string>;
  
  // State management
  isLoading: boolean;
  error: Error | null;
}
