import * as React from 'react';
import { useInput, Box, Text } from 'ink';
import { useState, useEffect } from 'react';
import { FileExplorer } from './components/FileExplorer.js';
import { PreviewPanel } from './components/PreviewPanel.js';
import { ValidationPanel } from './components/ValidationPanel.js';
import type { 
  FileMetadata, 
  DirectoryStructure, 
  ValidationRule,
  ValidationState,
  FileOperations
} from './types.js';
import { useFileOperations } from './hooks/useFileOperations.js';
import { useValidation } from './hooks/useValidation.js';
import { usePreview } from './hooks/usePreview.js';
import { neonTheme } from '../../themes/neonTheme.js';

interface FileStagingModuleProps {
  initialPath?: string;
  onComplete?: (selectedFiles: FileMetadata[]) => void;
  onCancel?: () => void;
  theme?: typeof neonTheme;
}

interface FileStagingState {
  currentPath: string;
  selectedFiles: FileMetadata[];
  directoryStructure: DirectoryStructure | null;
  previewContent: string;
  validationResults: ValidationState[];
  activePanel: 'fileExplorer' | 'preview' | 'validation';
  isLoading: boolean;
  error: string | null;
}

const FileStagingModule: React.FC<FileStagingModuleProps> = ({
  initialPath = process.cwd(),
  onComplete = () => {},
  onCancel = () => {},
  theme = neonTheme,
}) => {
  const [currentPath, setCurrentPath] = useState(initialPath || process.cwd());
  const [selectedFiles, setSelectedFiles] = useState<FileMetadata[]>([]);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [validationResults, setValidationResults] = useState<ValidationState[]>([]);
  const [directoryStructure, setDirectoryStructure] = useState<DirectoryStructure | null>(null);
  const [activePanel, setActivePanel] = useState<'fileExplorer' | 'preview' | 'validation'>('fileExplorer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileOperations: FileOperations = useFileOperations();
  const { validateFiles } = useValidation();
  const { generatePreview } = usePreview();

  useEffect(() => {
    const loadStructure = async () => {
      setIsLoading(true);
      try {
        const structure = await fileOperations.loadDirectory(currentPath);
        setDirectoryStructure(structure);
        setError(null);
      } catch (err) {
        setError(`Failed to load directory: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadStructure();
  }, [currentPath, fileOperations.loadDirectory]);

  const handleFileSelect = (file: FileMetadata) => {
    setSelectedFiles(prev => {
      const isSelected = prev.some(f => f.path === file.path);
      return isSelected
        ? prev.filter(f => f.path !== file.path)
        : [...prev, file];
    });

    if (file.type === 'file') {
      generatePreview(file.path).catch(console.error);
    }
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    setSelectedFiles([]);
  };

  const handleFilePreview = async (file: FileMetadata) => {
    try {
      // Use the file operations hook to read file content
      const content = await fileOperations.readFile(file.path);
      setPreviewContent(content);
      setActivePanel('preview');
    } catch (err) {
      setError(`Failed to load file preview: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleValidation = async () => {
    if (selectedFiles.length === 0) {
      setError('No files selected for validation');
      return;
    }

    setIsLoading(true);
    try {
      const results = await validateFiles(selectedFiles);
      setValidationResults(results);
      setActivePanel('validation');
      setError(null);
    } catch (err) {
      setError(`Validation failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      setError('No files selected for submission');
      return;
    }

    setIsLoading(true);
    try {
      const results = await validateFiles(selectedFiles);
      const isValid = results.every(result => result.errors.length === 0);
      
      if (isValid) {
        onComplete(selectedFiles);
      } else {
        setValidationResults(results);
        setActivePanel('validation');
      }
    } catch (err) {
      setError(`Validation failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  useInput((_input, key) => {
    if (key.escape) {
      onCancel?.();
    } else if (key.return) {
      handleSubmit();
    }
  });

  if (!directoryStructure) {
    return <Text>Loading directory...</Text>;
  }



  return (
    <Box flexDirection="column" borderStyle="round" borderColor={theme.colors.primary} padding={1}>
      <Text bold color={theme.colors.primary}>
        File Staging Module
      </Text>

      {error && (
        <Text color={theme.colors.error}>
          Error: {error}
        </Text>
      )}

      {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        <Box flexDirection="row" height={20}>
          {/* File Explorer Panel */}
<FileExplorer
            structure={directoryStructure || { name: currentPath, type: 'directory', children: [] }}
            onSelect={handleFileSelect}
            onNavigate={handleNavigate}
            selectedPath={selectedFiles[0]?.path}
            onPreview={handleFilePreview}
            theme={{
              colors: {
                primary: 'blue',
                accent: 'cyan',
                highlight: 'yellow',
                border: 'gray',
                text: 'white',
                background: 'black',
                error: 'red',
                warning: 'yellow',
                success: 'green',
                info: 'blue'
              }
            }}
          />

          {/* Preview/Validation Panel */}
          {activePanel === 'preview' && previewContent && (
            <PreviewPanel
              content={previewContent}
              onBack={() => setActivePanel('fileExplorer')}
              theme={theme}
            />
          )}

          {activePanel === 'validation' && (
            <ValidationPanel
              results={validationResults}
              onBack={() => setActivePanel('fileExplorer')}
              theme={theme}
            />
          )}
        </Box>
      )}

      {/* Status Bar */}
      <Box marginTop={1}>
        <Text>
          {selectedFiles.length} file(s) selected | Press Enter to submit | ESC to cancel
        </Text>
      </Box>
    </Box>
  );
};

export default FileStagingModule;
