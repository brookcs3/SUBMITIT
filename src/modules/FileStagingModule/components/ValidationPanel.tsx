import React from 'react';
import { Box, Text } from 'ink';
import { ValidationState } from '../types';
import { neonTheme } from '../../../themes/neonTheme';

interface ValidationPanelProps {
  validation: ValidationState;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ validation }) => {
  const { errors, warnings, isValid } = validation;

  const renderIssues = (issues: string[], type: 'error' | 'warning') => {
    if (!issues.length) return null;

    const color = type === 'error' ? neonTheme.colors.error : neonTheme.colors.warning;
    const icon = type === 'error' ? '✖' : '⚠';
    const title = type === 'error' ? 'Errors' : 'Warnings';

    return (
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color={color}>
          {icon} {title} ({issues.length})
        </Text>
        {issues.map((issue, index) => (
          <Text key={index} color={color} wrap="wrap">
            • {issue}
          </Text>
        ))}
      </Box>
    );
  };

  return (
    <Box flexDirection="column" height="100%">
      {/* Validation Header */}
      <Box
        paddingX={1}
        paddingY={0.5}
        borderStyle="single"
        borderBottom={false}
        borderColor={neonTheme.colors.border}
      >
        <Text bold>Validation</Text>
      </Box>

      {/* Validation Content */}
      <Box
        padding={1}
        flexGrow={1}
        overflow="auto"
        borderStyle="single"
        borderTop={false}
        borderColor={neonTheme.colors.border}
        flexDirection="column"
      >
        {isValid ? (
          <Text color={neonTheme.colors.success} bold>
            ✓ All validation checks passed!
          </Text>
        ) : (
          <>
            {renderIssues(errors, 'error')}
            {renderIssues(warnings, 'warning')}
          </>
        )}
      </Box>

      {/* Summary */}
      <Box
        paddingX={1}
        paddingY={0.5}
        borderStyle="single"
        borderTop={false}
        borderColor={neonTheme.colors.border}
        justifyContent="space-between"
      >
        <Text>
          <Text bold>Status: </Text>
          <Text color={isValid ? neonTheme.colors.success : neonTheme.colors.error}>
            {isValid ? 'Valid' : 'Issues Found'}
          </Text>
        </Text>
        <Text>
          <Text color={neonTheme.colors.error}>{errors.length}</Text> /{' '}
          <Text color={neonTheme.colors.warning}>{warnings.length}</Text>
        </Text>
      </Box>
    </Box>
  );
};
