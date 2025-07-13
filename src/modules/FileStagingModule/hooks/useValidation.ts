import { useState, useCallback } from 'react';
import * as path from 'path';
import { DirectoryStructure } from '../types';

// Default validation rules
const DEFAULT_RULES = {
  // Maximum file size in bytes (10MB)
  maxFileSize: 10 * 1024 * 1024,
  // Maximum total size in bytes (100MB)
  maxTotalSize: 100 * 1024 * 1024,
  // Maximum depth of directories
  maxDepth: 10,
  // Maximum number of files
  maxFiles: 1000,
  // Allowed file extensions (empty means all are allowed)
  allowedExtensions: [] as string[],
  // Blocked file extensions
  blockedExtensions: [
    // Executables
    'exe', 'dll', 'bat', 'cmd', 'sh', 'bin',
    // System files
    'sys', 'dylib', 'so', 'a', 'lib', 'o', 'obj',
    // Archives (might want to handle these specially)
    'zip', 'tar', 'gz', 'bz2', 'xz', '7z', 'rar',
  ],
  // Required files (relative to root)
  requiredFiles: [
    'README.md',
    'package.json',
  ],
};

export const useValidation = () => {
  const [validationState, setValidationState] = useState({
    errors: [] as string[],
    warnings: [] as string[],
    fileValidations: new Map<string, { status: 'valid' | 'warning' | 'error'; messages: string[] }>(),
    isValid: true,
  });

  const validateFile = useCallback((filePath: string, stats: { size: number }): { status: 'valid' | 'warning' | 'error'; messages: string[] } => {
    const messages: string[] = [];
    const ext = path.extname(filePath).toLowerCase().slice(1);
    
    // Check file extension
    if (DEFAULT_RULES.blockedExtensions.includes(ext)) {
      messages.push(`File type '${ext}' is not allowed.`);
    }
    
    // Check file size
    if (stats.size > DEFAULT_RULES.maxFileSize) {
      messages.push(`File exceeds maximum size of ${DEFAULT_RULES.maxFileSize / (1024 * 1024)}MB.`);
    }
    
    // Determine validation status
    let status: 'valid' | 'warning' | 'error' = 'valid';
    if (messages.some(m => m.includes('not allowed') || m.includes('exceeds'))) {
      status = 'error';
    } else if (messages.length > 0) {
      status = 'warning';
    }
    
    return { status, messages };
  }, []);

  const validateDirectoryStructure = useCallback((structure: DirectoryStructure): { errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fileValidations = new Map<string, { status: 'valid' | 'warning' | 'error'; messages: string[] }>();
    
    const traverse = (node: DirectoryStructure, currentDepth: number, currentPath: string[]) => {
      const nodePath = path.join(...currentPath, node.name);
      
      // Check directory depth
      if (currentDepth > DEFAULT_RULES.maxDepth) {
        errors.push(`Directory '${nodePath}' exceeds maximum depth of ${DEFAULT_RULES.maxDepth}.`);
        return;
      }
      
      // Process files
      if (node.children) {
        // Check total files count
        if (node.children.length > DEFAULT_RULES.maxFiles) {
          errors.push(`Directory '${nodePath}' contains too many files (max ${DEFAULT_RULES.maxFiles}).`);
          return;
        }
        
        for (const child of node.children) {
          if (child.type === 'file' && child.metadata) {
            const validation = validateFile(child.path || '', { size: child.metadata.size });
            fileValidations.set(child.path || '', validation);
            
            if (validation.status === 'error') {
              errors.push(...validation.messages.map(m => `[${child.path}]: ${m}`));
            } else if (validation.status === 'warning') {
              warnings.push(...validation.messages.map(m => `[${child.path}]: ${m}`));
            }
          } else if (child.type === 'directory' && child.children) {
            traverse(child, currentDepth + 1, [...currentPath, node.name]);
          }
        }
      }
    };
    
    // Start traversal from root
    traverse(structure, 0, []);
    
    // Check for required files
    const checkRequiredFiles = (node: DirectoryStructure, currentPath: string[] = []) => {
      const nodePath = path.join(...currentPath, node.name);
      
      if (node.type === 'file') {
        const relPath = path.relative(structure.name || '', nodePath);
        const requiredIndex = DEFAULT_RULES.requiredFiles.indexOf(relPath);
        if (requiredIndex !== -1) {
          DEFAULT_RULES.requiredFiles.splice(requiredIndex, 1);
        }
      }
      
      if (node.children) {
        for (const child of node.children) {
          checkRequiredFiles(child, [...currentPath, node.name]);
        }
      }
    };
    
    checkRequiredFiles(structure);
    
    // Add errors for missing required files
    if (DEFAULT_RULES.requiredFiles.length > 0) {
      errors.push(
        `Missing required files: ${DEFAULT_RULES.requiredFiles.join(', ')}`
      );
    }
    
    return { errors, warnings };
  }, [validateFile]);

  const validateFiles = useCallback((structure: DirectoryStructure) => {
    const { errors, warnings } = validateDirectoryStructure(structure);
    
    setValidationState({
      errors,
      warnings,
      isValid: errors.length === 0,
      fileValidations: new Map(), // This would be populated in a real implementation
    });
    
    return {
      errors,
      warnings,
      isValid: errors.length === 0,
    };
  }, [validateDirectoryStructure]);

  return {
    validateFiles,
    validationState,
  };
};
