import { FileMetadata, DirectoryStructure } from '../types';

export interface UseFileOperationsReturn {
  loadDirectory: (path: string) => Promise<DirectoryStructure | null>;
  addFiles: (files: string[], targetDir: string) => Promise<FileMetadata[]>;
  removeFile: (path: string) => Promise<boolean>;
  createDirectory: (path: string, name: string) => Promise<boolean>;
  rename: (oldPath: string, newName: string) => Promise<boolean>;
  move: (sourcePath: string, targetPath: string) => Promise<boolean>;
  copy: (sourcePath: string, targetPath: string) => Promise<boolean>;
  exists: (path: string) => Promise<boolean>;
  getStats: (path: string) => Promise<import('fs').Stats | null>;
}

declare const useFileOperations: () => UseFileOperationsReturn;

export default useFileOperations;
