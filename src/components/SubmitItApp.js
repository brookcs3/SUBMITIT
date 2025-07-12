// DISABLED: This file contains JSX syntax that crashes Node.js
// TODO: Convert JSX to React.createElement or compile with Babel
console.log('⚠️  JSX component disabled - needs conversion');
export default function DisabledComponent() {
  return null;
}

/* ORIGINAL CODE (commented out to prevent crashes):
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { Select, Spinner, ProgressBar, Badge, Alert } from '@inkjs/ui';
import chalk from 'chalk';

export const SubmitItApp = () => {
  const [currentView, setCurrentView] = useState('welcome');
  const [projectState, setProjectState] = useState({
    name: 'sample-project',
    files: [],
    theme: 'default',
    layout: { type: 'column', children: [] },
    isLoading: false,
    status: 'ready'
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { exit } = useApp();

  useInput((input, key) => {
    if (key.ctrl && key.name === 'c') {
      exit();
      return;
    }

    if (input === 'q') {
      exit();
      return;
    }

    switch (currentView) {
      case 'welcome':
        if (key.return) {
          setCurrentView('main');
        }
        break;
      case 'main':
        if (key.upArrow) {
          setSelectedIndex(prev => Math.max(0, prev - 1));
        } else if (key.downArrow) {
          setSelectedIndex(prev => Math.min(4, prev + 1));
        } else if (key.return) {
          handleMenuAction(selectedIndex);
        }
        break;
      case 'preview':
        if (input === 'b' || key.escape) {
          setCurrentView('main');
        }
        break;
      default:
        break;
    }
  });

  const handleMenuAction = async (index) => {
    const actions = ['add', 'theme', 'preview', 'export', 'exit'];
    const action = actions[index];
    
    switch (action) {
      case 'add':
        setProjectState(prev => ({ ...prev, isLoading: true }));
        // Simulate file addition
        setTimeout(() => {
          setProjectState(prev => ({
            ...prev,
            isLoading: false,
            files: [...prev.files, { name: 'new-file.pdf', type: 'document', size: '1.2MB' }]
          }));
        }, 1000);
        break;
      case 'theme':
        setProjectState(prev => ({ ...prev, theme: prev.theme === 'default' ? 'noir' : 'default' }));
        break;
      case 'preview':
        setCurrentView('preview');
        break;
      case 'export':
        setProjectState(prev => ({ ...prev, isLoading: true }));
        setTimeout(() => {
          setProjectState(prev => ({ ...prev, isLoading: false, status: 'exported' }));
        }, 2000);
        break;
      case 'exit':
        exit();
        break;
    }
  };

  const renderWelcome = () => React.createElement(Box, { flexDirection: "column", padding: 2 },
    React.createElement(Box, { borderStyle: "double", borderColor: "cyan", padding: 1 },
      React.createElement(Text, { color: "cyan", bold: true }, "🎨 SUBMITIT CLI")
    ),
    React.createElement(Box, { marginTop: 2 },
      React.createElement(Text, { color: "gray" }, "Transform your deliverables into polished, intentional submissions.")
    ),
    React.createElement(Box, { marginTop: 2 },
      React.createElement(Text, { color: "yellow" }, "Press Enter to continue...")
    )
  );

  const renderMain = () => {
    const menuItems = [
      { label: '📁 Add Files', value: 'add' },
      { label: '🎨 Set Theme', value: 'theme' },
      { label: '👀 Preview', value: 'preview' },
      { label: '📦 Export', value: 'export' },
      { label: '🚪 Exit', value: 'exit' }
    ];

    return (
      <Box flexDirection="column" padding={2}>
        {/* Header */}
        <Box borderStyle="round" borderColor="cyan" padding={1}>
          <Text color="cyan" bold>
            🎨 SUBMITIT CLI - {projectState.name}
          </Text>
        </Box>

        {/* Main Content */}
        <Box flexDirection="row" marginTop={2}>
          {/* Menu */}
          <Box flexDirection="column" marginRight={4}>
            <Text color="green" bold>Menu</Text>
            <Box marginTop={1}>
              {menuItems.map((item, index) => (
                <Box key={index} marginY={0}>
                  <Text color={index === selectedIndex ? 'yellow' : 'white'}>
                    {index === selectedIndex ? '▶ ' : '  '}
                    {item.label}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Status Panel */}
          <Box flexDirection="column">
            <Text color="blue" bold>Status</Text>
            <Box marginTop={1}>
              <Text>Theme: <Text color="cyan">{projectState.theme}</Text></Text>
              <Text>Files: <Text color="cyan">{projectState.files.length}</Text></Text>
              <Text>Status: <Badge color={projectState.status === 'exported' ? 'green' : 'blue'}>{projectState.status}</Badge></Text>
            </Box>
            
            {projectState.isLoading && (
              <Box marginTop={2}>
                <Spinner label="Processing..." />
              </Box>
            )}

            {/* File List */}
            {projectState.files.length > 0 && (
              <Box marginTop={2}>
                <Text color="yellow" bold>Files:</Text>
                {projectState.files.map((file, index) => (
                  <Box key={index} marginTop={1}>
                    <Text>📄 {file.name} ({file.size})</Text>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* Footer */}
        <Box marginTop={2} borderStyle="single" borderColor="gray" padding={1}>
          <Text color="gray">
            Use ↑↓ arrows to navigate, Enter to select, 'q' to quit
          </Text>
        </Box>
      </Box>
    );
  };

  const renderPreview = () => (
    <Box flexDirection="column" padding={2}>
      <Box borderStyle="round" borderColor="magenta" padding={1}>
        <Text color="magenta" bold>
          🎨 Preview Mode
        </Text>
      </Box>
      
      <Box marginTop={2}>
        <Text color="cyan">Theme: {projectState.theme}</Text>
        <Text color="cyan">Files: {projectState.files.length}</Text>
      </Box>

      <Box marginTop={2} borderStyle="single" padding={2}>
        <Text color="yellow" bold>Layout Preview</Text>
        <Box marginTop={1}>
          {projectState.files.length > 0 ? (
            projectState.files.map((file, index) => (
              <Box key={index} marginTop={1}>
                <Text>▪ {file.name} ({file.type})</Text>
              </Box>
            ))
          ) : (
            <Text color="gray" italic>No files to preview</Text>
          )}
        </Box>
      </Box>

      <Box marginTop={2}>
        <Text color="gray">Press 'b' or ESC to go back</Text>
      </Box>
    </Box>
  );

  switch (currentView) {
    case 'welcome':
      return renderWelcome();
    case 'main':
      return renderMain();
    case 'preview':
      return renderPreview();
    default:
      return renderWelcome();
  }
};
*/