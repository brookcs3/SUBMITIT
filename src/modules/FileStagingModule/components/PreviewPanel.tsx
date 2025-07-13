import React from 'react';
import { Box, Text } from 'ink';
import { FileMetadata } from '../types';
import { neonTheme } from '../../../themes/neonTheme';

interface PreviewPanelProps {
  file: FileMetadata | null;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ file }) => {
  if (!file) {
    return (
      <Box
        height="100%"
        alignItems="center"
        justifyContent="center"
        borderStyle="single"
        borderColor={neonTheme.colors.border}
      >
        <Text color={neonTheme.colors.muted}>
          Select a file to preview
        </Text>
      </Box>
    );
  }

  const renderPreview = () => {
    if (!file.preview) {
      return (
        <Text color={neonTheme.colors.warning}>
          No preview available for this file type.
        </Text>
      );
    }

    // Basic text preview
    if (typeof file.preview === 'string') {
      return (
        <Text>
          {file.preview}
        </Text>
      );
    }

    // Structured preview (for supported formats)
    return (
      <Box flexDirection="column">
        <Text bold>Preview</Text>
        <Text>{JSON.stringify(file.preview, null, 2)}</Text>
      </Box>
    );
  };

  return (
    <Box flexDirection="column" height="100%">
      {/* Preview Header */}
      <Box
        paddingX={1}
        paddingY={0.5}
        borderStyle="single"
        borderBottom={false}
        borderColor={neonTheme.colors.border}
      >
        <Text bold>Preview: {file.name}</Text>
      </Box>

      {/* Preview Content */}
      <Box
        padding={1}
        flexGrow={1}
        overflow="auto"
        borderStyle="single"
        borderTop={false}
        borderColor={neonTheme.colors.border}
      >
        {renderPreview()}
      </Box>

      {/* File Metadata */}
      <Box
        paddingX={1}
        paddingY={0.5}
        borderStyle="single"
        borderTop={false}
        borderColor={neonTheme.colors.border}
        flexDirection="column"
      >
        <Text><Text bold>Path:</Text> {file.path}</Text>
        <Text><Text bold>Size:</Text> {formatFileSize(file.size)}</Text>
        <Text><Text bold>Type:</Text> {file.type}</Text>
        <Text><Text bold>Modified:</Text> {new Date(file.lastModified).toLocaleString()}</Text>
      </Box>
    </Box>
  );
};

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
