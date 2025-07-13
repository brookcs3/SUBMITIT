import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useFocus } from 'ink';
import { FileExplorer } from './components/FileExplorer';
import { PreviewPanel } from './components/PreviewPanel';
import { ValidationPanel } from './components/ValidationPanel';
import { FileMetadata, DirectoryStructure } from './types';
import { useFileOperations } from './hooks/useFileOperations';
import { useValidation } from './hooks/useValidation';
import { usePreview } from './hooks/usePreview';
import { neonTheme } from '../../themes/neonTheme';

interface FileStagingModuleProps {
  initialPath?: string;
  onValidationChange?: (isValid: boolean) => void;
  onSubmit?: (files: FileMetadata[]) => void;
}

export const FileStagingModule: React.FC<FileStagingModuleProps> = ({
  initialPath = process.cwd(),
  onValidationChange,
  onSubmit,
}) => {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
  const [fileStructure, setFileStructure] = useState<DirectoryStructure | null>(null);
  
  const { isFocused } = useFocus();
  const { loadDirectory, addFiles, removeFile } = useFileOperations();
  const { validateFiles, validationState } = useValidation();
  const { generatePreview } = usePreview();

  // Load initial directory
  useEffect(() => {
    const loadInitialDirectory = async () => {
      const structure = await loadDirectory(currentPath);
      setFileStructure(structure);
      
      // Initial validation
      if (structure) {
        validateFiles(structure);
      }
    };

    loadInitialDirectory();
  }, [currentPath]);

  // Update parent component on validation changes
  useEffect(() => {
    if (validationState) {
      const isValid = !validationState.errors.length;
      onValidationChange?.(isValid);
    }
  }, [validationState]);

  const handleFileSelect = async (file: FileMetadata) => {
    setSelectedFile(file);
    // Generate preview for the selected file
    const preview = await generatePreview(file);
    setSelectedFile(prev => prev ? { ...prev, preview } : null);
  };

  const handleAddFiles = async (files: string[]) => {
    const newFiles = await addFiles(files, currentPath);
    // Update file structure and revalidate
    if (newFiles.length > 0 && fileStructure) {
      const updatedStructure = { ...fileStructure };
      // Add new files to the structure
      // (Implementation depends on your directory structure format)
      setFileStructure(updatedStructure);
      validateFiles(updatedStructure);
    }
  };

  const handleRemoveFile = async (filePath: string) => {
    await removeFile(filePath);
    // Update file structure and revalidate
    if (fileStructure) {
      // Remove file from structure
      // (Implementation depends on your directory structure format)
      validateFiles(fileStructure);
    }
  };

  // Handle keyboard navigation
  useInput((input, key) => {
    if (!isFocused) return;

    if (key.return && selectedFile && onSubmit) {
      // Submit selected files
      // (Implementation depends on how you want to handle submission)
    }
    // Add more keyboard shortcuts as needed
  });

  if (!fileStructure) {
    return <Text>Loading directory...</Text>;
  }

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={neonTheme.colors.primary}>
      <Box>
        <Text bold color={neonTheme.colors.accent}>
          File Staging Area
        </Text>
        <Text> - {currentPath}</Text>
      </Box>
      
      <Box flexDirection="row" height="80%">
        {/* File Explorer Panel */}
        <Box width="40%" borderStyle="single" borderColor={neonTheme.colors.border}>
          <FileExplorer
            structure={fileStructure}
            onSelect={handleFileSelect}
            onAddFiles={handleAddFiles}
            onRemoveFile={handleRemoveFile}
            selectedPath={selectedFile?.path}
          />
        </Box>
        
        {/* Preview Panel */}
        <Box width="40%" borderStyle="single" borderColor={neonTheme.colors.border}>
          <PreviewPanel file={selectedFile} />
        </Box>
        
        {/* Validation Panel */}
        <Box width="20%" borderStyle="single" borderColor={neonTheme.colors.border}>
          <ValidationPanel validation={validationState} />
        </Box>
      </Box>
      
      {/* Status Bar */}
      <Box borderTopStyle="single" borderColor={neonTheme.colors.border}>
        <Text color={neonTheme.colors.highlight}>
          {validationState?.errors.length ? '❌ ' : '✅ '}
          {validationState?.errors.length || 'No'} issues | 
          Press F1 for help | Tab to navigate | Enter to select
        </Text>
      </Box>
    </Box>
  );
};

export default FileStagingModule;
