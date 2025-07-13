import { useState, useCallback } from 'react';
import * as fs from 'fs/promises';
import * as path from 'path';
import { DirectoryStructure, FileMetadata, FileOperations } from '../types.js';

export const useFileOperations = (): FileOperations => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadDirectory = useCallback(async (dirPath: string): Promise<DirectoryStructure | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${dirPath}`);
      }

      const rootName = path.basename(dirPath);
      const rootPath = path.resolve(dirPath);
      
      const readDir = async (currentPath: string, name: string): Promise<DirectoryStructure> => {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        const children: DirectoryStructure[] = [];

        for (const entry of entries) {
          // Skip hidden files and directories
          if (entry.name.startsWith('.')) continue;
          
          const entryPath = path.join(currentPath, entry.name);
          const stats = await fs.stat(entryPath);
          
          if (entry.isDirectory()) {
            const dir = await readDir(entryPath, entry.name);
            children.push(dir);
          } else if (entry.isFile()) {
            children.push({
              name: entry.name,
              type: 'file',
              path: entryPath,
              metadata: {
                path: entryPath,
                name: entry.name,
                size: stats.size,
                type: path.extname(entry.name).slice(1) || 'unknown',
                lastModified: stats.mtime,
                validationStatus: 'valid',
                validationMessages: [],
              },
            });
          }
        }

        return {
          name,
          type: 'directory',
          path: currentPath,
          children: children.sort((a, b) => {
            // Sort directories first, then files, then alphabetically
            if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
            return a.name.localeCompare(b.name);
          }),
        };
      };

      return readDir(rootPath, rootName);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addFiles = useCallback(async (filePaths: string[], targetDir: string): Promise<FileMetadata[]> => {
    setIsLoading(true);
    setError(null);
    const addedFiles: FileMetadata[] = [];

    try {
      // Ensure target directory exists
      await fs.mkdir(targetDir, { recursive: true });

      for (const filePath of filePaths) {
        try {
          const stats = await fs.stat(filePath);
          if (!stats.isFile()) continue;

          const fileName = path.basename(filePath);
          const targetPath = path.join(targetDir, fileName);
          
          // Skip if file already exists in target
          try {
            await fs.access(targetPath);
            continue;
          } catch {
            // File doesn't exist, we can proceed
          }

          // Copy file to target directory
          await fs.copyFile(filePath, targetPath);
          
          // Create file metadata
          const fileMetadata: FileMetadata = {
            path: targetPath,
            name: fileName,
            size: stats.size,
            type: path.extname(filePath).slice(1) || 'unknown',
            lastModified: stats.mtime,
            validationStatus: 'valid',
            validationMessages: [],
          };

          addedFiles.push(fileMetadata);
        } catch (err) {
          console.error(`Error processing file ${filePath}:`, err);
          // Continue with next file
        }
      }

      return addedFiles;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeFile = useCallback(async (filePath: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await fs.unlink(filePath);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createDirectory = useCallback(async (dirPath: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const newDirPath = path.join(dirPath, name);
      await fs.mkdir(newDirPath, { recursive: true });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rename = useCallback(async (oldPath: string, newName: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const dir = path.dirname(oldPath);
      const newPath = path.join(dir, newName);
      await fs.rename(oldPath, newPath);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const move = useCallback(async (sourcePath: string, targetPath: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await fs.rename(sourcePath, targetPath);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const copy = useCallback(async (sourcePath: string, targetPath: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await fs.copyFile(sourcePath, targetPath);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exists = useCallback(async (path: string): Promise<boolean> => {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }, []);

  const getStats = useCallback(async (path: string): Promise<import('fs').Stats | null> => {
    try {
      return await fs.stat(path);
    } catch {
      return null;
    }
  }, []);

  const readFile = useCallback(async (filePath: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    loadDirectory,
    addFiles,
    removeFile,
    createDirectory,
    rename,
    move,
    copy,
    exists,
    getStats,
    readFile,
    isLoading,
    error,
  };
};
