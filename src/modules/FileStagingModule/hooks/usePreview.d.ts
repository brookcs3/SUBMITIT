import { FileMetadata } from '../types';

export interface UsePreviewReturn {
  generatePreview: (file: FileMetadata) => Promise<string | object>;
  clearPreview: (filePath: string) => void;
  getPreview: (filePath: string) => string | object | undefined;
  isLoading: boolean;
  error: Error | null;
}

declare const usePreview: () => UsePreviewReturn;

export default usePreview;
