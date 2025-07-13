import { useState, useCallback } from 'react';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FileMetadata } from '../types';

// Maximum file size to attempt to load for preview (in bytes)
const MAX_PREVIEW_SIZE = 1024 * 1024; // 1MB

// File types that can be previewed as text
const TEXT_FILE_TYPES = [
  // Code files
  'js', 'jsx', 'ts', 'tsx', 'jsx', 'mjs', 'cjs',
  'html', 'css', 'scss', 'sass', 'less', 'json',
  'md', 'markdown', 'txt', 'text', 'log', 'yaml', 'yml',
  'xml', 'svg', 'csv', 'tsv', 'ini', 'toml', 'env',
  'gitignore', 'dockerignore', 'editorconfig', 'babelrc',
  'eslintrc', 'prettierrc', 'browserslistrc'
];

// File types that should be treated as binary (no preview)
const BINARY_FILE_TYPES = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'zip', 'tar', 'gz', 'bz2', '7z', 'rar', 'dmg', 'pkg',
  'exe', 'dll', 'so', 'dylib', 'o', 'obj', 'lib', 'a'
];

export const usePreview = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generatePreview = useCallback(async (file: FileMetadata): Promise<string | object | null> => {
    if (!file.path) return null;
    
    const ext = path.extname(file.path).toLowerCase().slice(1);
    
    // Don't attempt to preview binary files
    if (BINARY_FILE_TYPES.includes(ext)) {
      return 'Binary file - no preview available';
    }
    
    // For large files, only attempt to preview if they're text files
    if (file.size > MAX_PREVIEW_SIZE && !TEXT_FILE_TYPES.includes(ext)) {
      return 'File too large for preview';
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Handle text-based previews
      if (TEXT_FILE_TYPES.includes(ext)) {
        const content = await fs.readFile(file.path, 'utf-8');
        
        // For very large text files, only show the first 1000 lines
        const lines = content.split('\n');
        if (lines.length > 1000) {
          return `File is large. Showing first 1000 of ${lines.length} lines.\n\n` + 
                 lines.slice(0, 1000).join('\n') + 
                 '\n\n[Preview truncated...]';
        }
        
        return content;
      }
      
      // Special handling for package.json
      if (path.basename(file.path) === 'package.json') {
        try {
          const content = await fs.readFile(file.path, 'utf-8');
          const pkg = JSON.parse(content);
          
          // Return a simplified view of package.json
          return {
            name: pkg.name,
            version: pkg.version,
            description: pkg.description,
            scripts: pkg.scripts ? Object.keys(pkg.scripts) : [],
            dependencies: pkg.dependencies ? Object.keys(pkg.dependencies) : [],
            devDependencies: pkg.devDependencies ? Object.keys(pkg.devDependencies) : [],
          };
        } catch (err) {
          console.error('Error parsing package.json:', err);
          return 'Error parsing package.json';
        }
      }
      
      // Special handling for README files
      if (file.name.toLowerCase().startsWith('readme')) {
        try {
          return await fs.readFile(file.path, 'utf-8');
        } catch (err) {
          console.error('Error reading README:', err);
          return 'Error reading README file';
        }
      }
      
      // Default: no preview available
      return 'No preview available for this file type';
      
    } catch (err) {
      console.error('Error generating preview:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return 'Error generating preview';
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generatePreview,
    isLoading,
    error,
  };
};
