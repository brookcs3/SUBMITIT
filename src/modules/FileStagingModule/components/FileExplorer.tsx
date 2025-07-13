import React, { useState } from 'react';
import { Box, Text, useFocus, useInput } from 'ink';
import { DirectoryStructure, FileMetadata } from '../types';
import { neonTheme } from '../../../themes/neonTheme';

interface FileExplorerProps {
  structure: DirectoryStructure;
  selectedPath?: string;
  onSelect: (file: FileMetadata) => void;
  onAddFiles?: (files: string[]) => void;
  onRemoveFile?: (path: string) => void;
  depth?: number;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  structure,
  selectedPath,
  onSelect,
  onAddFiles,
  onRemoveFile,
  depth = 0,
}) => {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [focusedPath, setFocusedPath] = useState<string | null>(null);
  const { isFocused } = useFocus();

  const toggleDirectory = (path: string) => {
    setExpandedDirs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const handleSelect = (item: DirectoryStructure, isDirectory: boolean) => {
    if (isDirectory) {
      toggleDirectory(item.path || '');
    } else if (item.metadata) {
      onSelect(item.metadata);
    }
    setFocusedPath(item.path || null);
  };

  // Handle keyboard navigation
  useInput((input, key) => {
    if (!isFocused) return;

    // Navigation logic would go here
    // This is a simplified example
    if (key.return && focusedPath) {
      const item = findItemByPath(structure, focusedPath);
      if (item) {
        handleSelect(item, item.type === 'directory');
      }
    }
  });

  const renderItem = (item: DirectoryStructure, index: number) => {
    const isDirectory = item.type === 'directory';
    const isExpanded = isDirectory && expandedDirs.has(item.path || '');
    const isSelected = selectedPath === item.path;
    const isFocusedItem = focusedPath === item.path;
    
    const indent = '  '.repeat(depth);
    const prefix = isDirectory ? (isExpanded ? '▼' : '▶') : ' ';
    
    return (
      <Box key={item.path || `item-${index}`} flexDirection="column">
        <Box
          onClick={() => handleSelect(item, isDirectory)}
          // @ts-ignore - Ink-specific prop
          focus={isFocusedItem}
        >
          <Text
            color={
              isSelected
                ? neonTheme.colors.highlight
                : isDirectory
                ? neonTheme.colors.accent
                : neonTheme.colors.text
            }
            bold={isSelected}
          >
            {`${indent}${prefix} ${item.name}`}
          </Text>
          {!isDirectory && item.metadata && (
            <Text color={neonTheme.colors.muted}>
              {' '}
              ({formatFileSize(item.metadata.size)})
            </Text>
          )}
        </Box>
        
        {isDirectory && isExpanded && item.children && (
          <Box marginLeft={2}>
            {item.children.map((child, idx) =>
              renderItem(child, idx)
            )}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box flexDirection="column">
      <Box paddingX={1} paddingY={0.5} borderStyle="single" borderBottom={false}>
        <Text bold>Project Files</Text>
      </Box>
      <Box flexDirection="column" padding={1}>
        {structure.children?.map((item, index) => renderItem(item, index))}
      </Box>
    </Box>
  );
};

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Helper function to find an item by path
function findItemByPath(
  structure: DirectoryStructure,
  path: string
): DirectoryStructure | undefined {
  if (structure.path === path) return structure;
  
  if (structure.children) {
    for (const child of structure.children) {
      const found = findItemByPath(child, path);
      if (found) return found;
    }
  }
  
  return undefined;
}
