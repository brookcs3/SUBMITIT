import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp, Spacer } from 'ink';
import chalk from 'chalk';
import { ProjectManager } from '../lib/ProjectManager.js';
import { Banner } from './Banner.jsx';
import { FileList } from './FileList.jsx';
import { StatusBar } from './StatusBar.jsx';
import { PreviewPanel } from './PreviewPanel.jsx';

export const SubmitItApp = () => {
  const [currentView, setCurrentView] = useState('welcome');
  const [projectState, setProjectState] = useState({
    name: '',
    files: [],
    theme: 'default',
    layout: null,
    isLoading: false,
    status: 'ready'
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { exit } = useApp();

  const projectManager = new ProjectManager();

  useInput((input, key) => {
    if (key.ctrl && key.name === 'c') {
      exit();
      return;
    }

    switch (currentView) {
      case 'welcome':
        handleWelcomeInput(input, key);
        break;
      case 'main':
        handleMainInput(input, key);
        break;
      case 'preview':
        handlePreviewInput(input, key);
        break;
      default:
        break;
    }
  });

  const handleWelcomeInput = (input, key) => {
    if (key.return) {
      setCurrentView('main');
    }
  };

  const handleMainInput = (input, key) => {
    const menuItems = ['Add Files', 'Set Theme', 'Preview', 'Export', 'Exit'];
    
    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : menuItems.length - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => (prev < menuItems.length - 1 ? prev + 1 : 0));
    } else if (key.return) {
      handleMenuSelection(menuItems[selectedIndex]);
    }
  };

  const handlePreviewInput = (input, key) => {
    if (key.return || input === 'b') {
      setCurrentView('main');
    }
  };

  const handleMenuSelection = async (action) => {
    switch (action) {
      case 'Add Files':
        await handleAddFiles();
        break;
      case 'Set Theme':
        await handleSetTheme();
        break;
      case 'Preview':
        setCurrentView('preview');
        break;
      case 'Export':
        await handleExport();
        break;
      case 'Exit':
        exit();
        break;
      default:
        break;
    }
  };

  const handleAddFiles = async () => {
    setProjectState(prev => ({ ...prev, isLoading: true, status: 'Adding files...' }));
    
    // Simulate file addition process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setProjectState(prev => ({
      ...prev,
      isLoading: false,
      status: 'Files added successfully',
      files: [...prev.files, { name: 'example.pdf', type: 'document', size: '2.4MB' }]
    }));
  };

  const handleSetTheme = async () => {
    setProjectState(prev => ({ ...prev, isLoading: true, status: 'Applying theme...' }));
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setProjectState(prev => ({
      ...prev,
      isLoading: false,
      status: 'Theme applied',
      theme: 'noir'
    }));
  };

  const handleExport = async () => {
    setProjectState(prev => ({ ...prev, isLoading: true, status: 'Exporting project...' }));
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProjectState(prev => ({
      ...prev,
      isLoading: false,
      status: '🎉 Export complete! Your submission is ready.'
    }));
  };

  const renderWelcome = () => (
    <Box flexDirection="column" padding={2}>
      <Banner />
      <Box marginTop={2}>
        <Text color="gray">
          Transform your deliverables into polished, intentional submissions.
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text color="yellow">Press Enter to continue...</Text>
      </Box>
    </Box>
  );

  const renderMain = () => {
    const menuItems = ['Add Files', 'Set Theme', 'Preview', 'Export', 'Exit'];
    
    return (
      <Box flexDirection="column" padding={2}>
        <Banner />
        
        <Box marginTop={2}>
          <Box flexDirection="column" flex={1}>
            <Text bold color="green">📁 Project Menu</Text>
            <Box marginTop={1}>
              {menuItems.map((item, index) => (
                <Box key={item} marginY={0}>
                  <Text color={index === selectedIndex ? 'yellow' : 'white'}>
                    {index === selectedIndex ? '▶ ' : '  '}
                    {item}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
          
          <Box flexDirection="column" flex={1} marginLeft={4}>
            <Text bold color="blue">📊 Project Status</Text>
            <Box marginTop={1}>
              <Text>Theme: {chalk.cyan(projectState.theme)}</Text>
              <Text>Files: {chalk.cyan(projectState.files.length)}</Text>
              <Text>Status: {chalk.green(projectState.status)}</Text>
            </Box>
            
            {projectState.files.length > 0 && (
              <Box marginTop={2}>
                <FileList files={projectState.files} />
              </Box>
            )}
          </Box>
        </Box>
        
        <Box marginTop={2}>
          <StatusBar 
            isLoading={projectState.isLoading}
            status={projectState.status}
          />
        </Box>
      </Box>
    );
  };

  const renderPreview = () => (
    <Box flexDirection="column" padding={2}>
      <Banner />
      
      <Box marginTop={2}>
        <PreviewPanel 
          theme={projectState.theme}
          files={projectState.files}
        />
      </Box>
      
      <Box marginTop={2}>
        <Text color="gray">Press Enter or 'b' to go back...</Text>
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