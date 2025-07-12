import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { Select, Badge, Spinner } from '@inkjs/ui';
import { 
  AccessibleMenu, 
  AccessibleFileExplorer, 
  AccessibleStatusPanel,
  AccessibilityHelp,
  globalAccessibilityManager 
} from './AccessibleInkComponents.js';

export const WorkPlatesApp = () => {
  const [currentView, setCurrentView] = useState('welcome');
  const [workPlates, setWorkPlates] = useState([]);
  const [selectedPlate, setSelectedPlate] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('workspace');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [dragMode, setDragMode] = useState(false);
  const [showAccessibilityHelp, setShowAccessibilityHelp] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: '', details: [] });
  const { exit } = useApp();

  // Initialize accessibility
  React.useEffect(() => {
    globalAccessibilityManager.registerElement('workplates', {
      role: 'application',
      label: 'Submitit Work Plates',
      type: 'landmark'
    });
    
    globalAccessibilityManager.announce('Submitit Work Plates loaded. Press H for help, or Enter to begin.', 'normal');
  }, []);

  useInput((input, key) => {
    // Accessibility help
    if (input === 'h' || input === 'H') {
      setShowAccessibilityHelp(!showAccessibilityHelp);
      return;
    }

    if (key.ctrl && key.name === 'c' || input === 'q') {
      globalAccessibilityManager.announce('Exiting Submitit Work Plates', 'normal');
      exit();
      return;
    }

    // Accessibility shortcuts
    if (key.ctrl && key.shift && input === 'a') {
      globalAccessibilityManager.toggleAnnouncements();
      return;
    }

    if (key.ctrl && key.shift && input === 'c') {
      globalAccessibilityManager.toggleHighContrast();
      return;
    }

    if (key.ctrl && key.shift && input === 'n') {
      globalAccessibilityManager.announceNavigation(currentView);
      return;
    }

    if (input === '?') {
      globalAccessibilityManager.announceNavigation(currentView);
      return;
    }

    // Global shortcuts with announcements
    if (input === 't') {
      // Tab switching
      const tabs = ['workspace', 'explorer', 'settings'];
      const currentIndex = tabs.indexOf(activeTab);
      const nextIndex = (currentIndex + 1) % tabs.length;
      const newTab = tabs[nextIndex];
      setActiveTab(newTab);
      globalAccessibilityManager.announce(`Switched to ${newTab} tab`, 'normal');
      return;
    }

    if (input === 's') {
      // Toggle sidebar
      const newState = !sidebarVisible;
      setSidebarVisible(newState);
      globalAccessibilityManager.announce(`Sidebar ${newState ? 'opened' : 'closed'}`, 'normal');
      return;
    }

    if (input === 'd') {
      // Toggle drag mode
      const newMode = !dragMode;
      setDragMode(newMode);
      globalAccessibilityManager.announce(`Drag mode ${newMode ? 'enabled' : 'disabled'}`, 'normal');
      return;
    }

    if (input === 'n' && activeTab === 'workspace') {
      globalAccessibilityManager.announce('Creating new work plate...', 'normal');
      createNewWorkPlate();
    }
    if (input === 'p' && activeTab === 'workspace') {
      globalAccessibilityManager.announce('Generating post card...', 'normal');
      generatePostCard();
    }

    switch (currentView) {
      case 'welcome':
        if (key.return) {
          setCurrentView('workspace');
        }
        break;
      case 'workspace':
        handleWorkspaceInput(input, key);
        break;
    }
  });

  const handleWorkspaceInput = (input, key) => {
    if (key.upArrow) {
      setSelectedPlate(prev => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedPlate(prev => Math.min(workPlates.length, prev + 1));
    } else if (key.return) {
      if (selectedPlate === workPlates.length) {
        createNewWorkPlate();
      } else {
        // Open selected work plate
        console.log('Opening work plate:', selectedPlate);
      }
    }
  };

  const createNewWorkPlate = () => {
    setStatus({ type: 'loading', message: 'Creating new work plate...', details: [] });
    
    const plateNames = ['Documents', 'Images', 'Code Files', 'Assets', 'Archive', 'Media'];
    const sampleFiles = [
      ['report.pdf', 'notes.txt', 'presentation.pptx'],
      ['hero.jpg', 'logo.png', 'banner.svg'],
      ['main.js', 'styles.css', 'index.html'],
      ['icon.ico', 'font.ttf', 'data.json'],
      ['backup.zip', 'old_files.tar.gz'],
      ['video.mp4', 'audio.mp3', 'soundtrack.wav']
    ];
    
    const plateName = plateNames[workPlates.length % plateNames.length] || `Work Plate ${workPlates.length + 1}`;
    const files = Math.random() > 0.5 ? sampleFiles[workPlates.length % sampleFiles.length] || [] : [];
    
    const newPlate = {
      id: Date.now(),
      name: plateName,
      files: files,
      layout: 'grid',
      created: new Date().toISOString()
    };
    
    setWorkPlates(prev => [...prev, newPlate]);
    
    setStatus({ 
      type: 'success', 
      message: `Work plate "${plateName}" created successfully`, 
      details: [`${files.length} files included`, `Total plates: ${workPlates.length + 1}`] 
    });
    
    globalAccessibilityManager.announceSuccess(
      `Work plate "${plateName}" created`, 
      `${files.length} files included. Total plates: ${workPlates.length + 1}`
    );
  };

  const generatePostCard = async () => {
    setIsLoading(true);
    setStatus({ type: 'loading', message: 'Generating post card...', details: ['Processing layouts', 'Rendering preview', 'Finalizing design'] });
    
    // Simulate post card generation with progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 20;
      if (progress <= 100) {
        globalAccessibilityManager.announceProgress(progress, 100, 'post card generation');
      }
    }, 400);
    
    setTimeout(() => {
      clearInterval(progressInterval);
      setIsLoading(false);
      setStatus({ 
        type: 'success', 
        message: 'Post card generated successfully!', 
        details: ['Design optimized for print', 'High resolution output ready', 'Preview available in showroom'] 
      });
      
      globalAccessibilityManager.announceSuccess(
        'Post card generated successfully',
        'Design optimized for print. High resolution output ready. Preview available in showroom.'
      );
    }, 2000);
  };

  const renderWelcome = () => React.createElement(Box, { flexDirection: "column", padding: 2 },
    React.createElement(Box, { borderStyle: "double", borderColor: "magenta", padding: 1 },
      React.createElement(Text, { color: "magenta", bold: true }, "🎨 SUBMITIT WORK PLATES"),
      React.createElement(Text, { color: "gray" }, "Interactive workspace for file organization")
    ),
    React.createElement(Box, { marginTop: 2 },
      React.createElement(Text, { color: "cyan" }, "Features:"),
      React.createElement(Text, null, "• Click terminal background to open work frames"),
      React.createElement(Text, null, "• Drag & drop files into work plates"),
      React.createElement(Text, null, "• Visual arrangement using Yoga layout"),
      React.createElement(Text, null, "• Generate polished post card deliverables")
    ),
    React.createElement(Box, { marginTop: 2 },
      React.createElement(Text, { color: "yellow" }, "Press Enter to open workspace...")
    )
  );

  const renderWorkspace = () => React.createElement(Box, { flexDirection: "column", height: "100%" },
    // Header with window controls (inspired by Darkmatter)
    React.createElement(Box, { 
      borderStyle: "single", 
      borderColor: "cyan",
      paddingX: 2,
      paddingY: 1,
      marginBottom: 1
    },
      React.createElement(Box, { flexDirection: "row", justifyContent: "space-between" },
        React.createElement(Box, { flexDirection: "row", gap: 1 },
          React.createElement(Text, { color: "red" }, "●"),
          React.createElement(Text, { color: "yellow" }, "●"),
          React.createElement(Text, { color: "green" }, "●"),
          React.createElement(Text, { color: "cyan", marginLeft: 2 }, "Submitit Work Plates")
        ),
        React.createElement(Text, { color: "gray" }, dragMode ? "DRAG MODE" : "NORMAL")
      )
    ),

    // Tab bar (inspired by VS Code)
    React.createElement(Box, { borderStyle: "single", borderColor: "gray", paddingX: 1 },
      React.createElement(Box, { flexDirection: "row" },
        ['workspace', 'explorer', 'settings'].map(tab => 
          React.createElement(Box, { 
            key: tab,
            paddingX: 2,
            paddingY: 0,
            backgroundColor: activeTab === tab ? 'blue' : undefined,
            marginRight: 1
          },
            React.createElement(Text, { 
              color: activeTab === tab ? 'white' : 'gray',
              bold: activeTab === tab
            }, tab.charAt(0).toUpperCase() + tab.slice(1))
          )
        )
      )
    ),

    // Main content area with sidebar
    React.createElement(Box, { flexDirection: "row", flexGrow: 1 },
      // Main content
      React.createElement(Box, { flexDirection: "column", flexGrow: 1, paddingX: 2 },
        activeTab === 'workspace' && renderWorkspaceTab(),
        activeTab === 'explorer' && renderExplorerTab(),
        activeTab === 'settings' && renderSettingsTab()
      ),

      // Sidebar (inspired by Darkmatter CMS panel)
      sidebarVisible && React.createElement(Box, { 
        borderStyle: "single", 
        borderColor: "gray",
        width: 24,
        flexDirection: "column",
        paddingX: 1,
        paddingY: 1
      },
        React.createElement(Text, { color: "cyan", bold: true }, "Properties"),
        React.createElement(Box, { marginTop: 1 },
          workPlates.length > 0 && workPlates[selectedPlate] ? 
            renderPlateProperties(workPlates[selectedPlate]) :
            React.createElement(Text, { color: "gray", italic: true }, "No plate selected")
        )
      )
    ),

    // Status bar with enhanced info
    React.createElement(Box, { 
      borderStyle: "single", 
      borderColor: "gray",
      paddingX: 2,
      paddingY: 0,
      marginTop: 1
    },
      React.createElement(Box, { flexDirection: "row", justifyContent: "space-between" },
        React.createElement(Text, { color: "gray" }, 
          `t:tabs • s:sidebar • d:drag • n:new • p:export • q:quit`
        ),
        React.createElement(Box, { flexDirection: "row", gap: 2 },
          React.createElement(Text, { color: "gray" }, `Plates: ${workPlates.length}`),
          isLoading ? 
            React.createElement(Spinner, null) :
            React.createElement(Text, { color: "green" }, "●")
        )
      )
    )
  );

  const renderWorkspaceTab = () => React.createElement(Box, { flexDirection: "column" },
    React.createElement(Text, { color: "cyan", marginBottom: 1 }, "Work Plates Canvas"),
    
    // Work plates grid with drag indicators
    React.createElement(Box, { flexDirection: "row", gap: 2, flexWrap: "wrap" },
      ...workPlates.map((plate, index) => 
        React.createElement(Box, { 
          key: plate.id, 
          borderStyle: "round", 
          borderColor: index === selectedPlate ? 'cyan' : (dragMode ? 'yellow' : 'gray'),
          padding: 1,
          minWidth: 16,
          minHeight: 6,
          marginBottom: 1
        },
          React.createElement(Text, { 
            color: index === selectedPlate ? "cyan" : "white",
            bold: index === selectedPlate
          }, plate.name),
          React.createElement(Box, { flexDirection: "column", marginTop: 1 },
            plate.files.slice(0, 2).map((file, fileIndex) => 
              React.createElement(Text, { key: fileIndex, color: "gray" }, 
                `${dragMode ? '≡ ' : ''}${file.substring(0, 12)}`
              )
            ),
            plate.files.length === 0 && 
              React.createElement(Text, { color: "gray", italic: true }, 
                dragMode ? "drop here" : "empty"
              )
          ),
          plate.files.length > 2 && 
            React.createElement(Text, { color: "blue", marginTop: 1 }, `+${plate.files.length - 2}`),
        )
      ),
      
      // Add new plate area
      React.createElement(Box, { 
        borderStyle: "single", 
        borderColor: "gray",
        padding: 1,
        minWidth: 16,
        minHeight: 6
      },
        React.createElement(Text, { color: "gray" }, "+ New Plate"),
        React.createElement(Text, { color: "gray", marginTop: 2 }, "press 'n'")
      )
    )
  );

  const renderExplorerTab = () => {
    const projectFiles = [
      { name: 'content', type: 'directory', path: './content', size: '5 items' },
      { name: 'output', type: 'directory', path: './output', size: '3 items' },
      { name: 'submitit.config.json', type: 'file', path: './submitit.config.json', size: '1.2KB' },
      { name: 'layout.json', type: 'file', path: './layout.json', size: '0.8KB' },
      { name: 'package.json', type: 'file', path: './package.json', size: '2.1KB' },
      { name: 'README.md', type: 'file', path: './README.md', size: '4.3KB' }
    ];

    return React.createElement(AccessibleFileExplorer, {
      files: projectFiles,
      title: "Project File Explorer",
      onFileSelect: (file) => {
        globalAccessibilityManager.announce(`File selected: ${file.name}`, 'normal');
        setStatus({
          type: 'success',
          message: `Selected: ${file.name}`,
          details: [`Type: ${file.type}`, `Size: ${file.size}`]
        });
      },
      id: 'project-explorer'
    });
  };

  const renderSettingsTab = () => React.createElement(Box, { flexDirection: "column" },
    React.createElement(Text, { color: "cyan", marginBottom: 1 }, "Settings"),
    React.createElement(Text, { color: "gray" }, "Theme: minimal"),
    React.createElement(Text, { color: "gray" }, `Drag Mode: ${dragMode ? 'ON' : 'OFF'}`),
    React.createElement(Text, { color: "gray" }, `Sidebar: ${sidebarVisible ? 'ON' : 'OFF'}`),
    React.createElement(Box, { marginTop: 2 },
      React.createElement(Text, { color: "yellow" }, "Press 'd' to toggle drag mode"),
      React.createElement(Text, { color: "yellow" }, "Press 's' to toggle sidebar")
    )
  );

  const renderPlateProperties = (plate) => React.createElement(Box, { flexDirection: "column" },
    React.createElement(Text, { color: "white", bold: true }, plate.name),
    React.createElement(Text, { color: "gray" }, `Files: ${plate.files.length}`),
    React.createElement(Text, { color: "gray" }, `Layout: ${plate.layout}`),
    React.createElement(Text, { color: "gray" }, `Created: ${new Date(plate.created).toLocaleDateString()}`),
    React.createElement(Box, { marginTop: 2 },
      React.createElement(Text, { color: "blue" }, "File List:"),
      ...plate.files.slice(0, 3).map((file, index) => 
        React.createElement(Text, { key: index, color: "gray" }, `• ${file}`)
      )
    )
  );

  const currentElement = () => {
    switch (currentView) {
      case 'welcome':
        return renderWelcome();
      case 'workspace':
        return renderWorkspace();
      default:
        return renderWelcome();
    }
  };

  return React.createElement(Box, { flexDirection: "column", height: "100%" },
    // Main interface
    currentElement(),
    
    // Accessibility help overlay
    showAccessibilityHelp && React.createElement(AccessibilityHelp, {
      visible: showAccessibilityHelp,
      onClose: () => setShowAccessibilityHelp(false)
    }),
    
    // Status panel with accessibility
    (status.type !== 'idle' || isLoading) && React.createElement(Box, { 
      position: "absolute", 
      bottom: 0, 
      left: 0, 
      right: 0 
    },
      React.createElement(AccessibleStatusPanel, {
        status: isLoading ? 'loading' : status.type,
        message: isLoading ? 'Processing...' : status.message,
        details: status.details,
        progress: isLoading ? null : (status.type === 'loading' ? 50 : null),
        id: 'main-status'
      })
    )
  );
};