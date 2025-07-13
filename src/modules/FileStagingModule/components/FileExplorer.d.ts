import { FileMetadata, DirectoryStructure } from '../types';

interface FileExplorerProps {
  structure: DirectoryStructure;
  onSelect: (file: FileMetadata) => void;
  onAddFiles?: (files: string[]) => void;
  onRemoveFile?: (path: string) => void;
  selectedPath?: string;
  onToggleDirectory?: (path: string, isExpanded: boolean) => void;
  searchQuery?: string;
  showHiddenFiles?: boolean;
  validationRules?: Array<{
    id: string;
    name: string;
    description: string;
    validate: (file: FileMetadata) => string | null;
  }>;
}

declare const FileExplorer: React.FC<FileExplorerProps>;

export default FileExplorer;
