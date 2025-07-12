import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { Select, Badge } from '@inkjs/ui';

export const SimpleInkApp = () => {
  const [currentView, setCurrentView] = useState('welcome');
  const [projectFiles, setProjectFiles] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { exit } = useApp();

  useInput((input, key) => {
    if (key.ctrl && key.name === 'c' || input === 'q') {
      exit();
      return;
    }

    if (currentView === 'welcome' && key.return) {
      setCurrentView('main');
    }

    if (currentView === 'main') {
      if (key.upArrow) {
        setSelectedIndex(prev => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setSelectedIndex(prev => Math.min(3, prev + 1));
      } else if (key.return) {
        handleMenuAction(selectedIndex);
      }
    }
  });

  const handleMenuAction = (index) => {
    const actions = ['add', 'preview', 'export', 'exit'];
    const action = actions[index];
    
    switch (action) {
      case 'add':
        setProjectFiles(prev => [...prev, { name: `file-${prev.length + 1}.pdf`, type: 'document' }]);
        break;
      case 'preview':
        setCurrentView('preview');
        break;
      case 'export':
        // Export logic here
        break;
      case 'exit':
        exit();
        break;
    }
  };

  if (currentView === 'welcome') {
    return React.createElement(Box, { flexDirection: "column", padding: 2 },
      React.createElement(Box, { borderStyle: "double", borderColor: "cyan", padding: 1 },
        React.createElement(Text, { color: "cyan", bold: true }, "🎨 SUBMITIT CLI")
      ),
      React.createElement(Box, { marginTop: 2 },
        React.createElement(Text, { color: "gray" }, "Transform your deliverables into polished submissions.")
      ),
      React.createElement(Box, { marginTop: 2 },
        React.createElement(Text, { color: "yellow" }, "Press Enter to continue...")
      )
    );
  }

  const menuItems = ['📁 Add Files', '👀 Preview', '📦 Export', '🚪 Exit'];

  return React.createElement(Box, { flexDirection: "column", padding: 2 },
    // Header
    React.createElement(Box, { borderStyle: "round", borderColor: "cyan", padding: 1 },
      React.createElement(Text, { color: "cyan", bold: true }, "🎨 SUBMITIT CLI - Interactive Mode")
    ),
    
    // Main content
    React.createElement(Box, { flexDirection: "row", marginTop: 2 },
      // Menu
      React.createElement(Box, { flexDirection: "column", marginRight: 4 },
        React.createElement(Text, { color: "green", bold: true }, "Menu"),
        React.createElement(Box, { marginTop: 1 },
          ...menuItems.map((item, index) => 
            React.createElement(Box, { key: index, marginY: 0 },
              React.createElement(Text, { color: index === selectedIndex ? 'yellow' : 'white' },
                (index === selectedIndex ? '▶ ' : '  ') + item
              )
            )
          )
        )
      ),
      
      // Status panel
      React.createElement(Box, { flexDirection: "column" },
        React.createElement(Text, { color: "blue", bold: true }, "Status"),
        React.createElement(Box, { marginTop: 1 },
          React.createElement(Text, null, "Files: ", React.createElement(Text, { color: "cyan" }, projectFiles.length)),
          React.createElement(Text, null, "Status: ", React.createElement(Badge, { color: "green" }, "Ready"))
        ),
        
        // File list
        projectFiles.length > 0 && React.createElement(Box, { marginTop: 2 },
          React.createElement(Text, { color: "yellow", bold: true }, "Files:"),
          ...projectFiles.map((file, index) => 
            React.createElement(Box, { key: index, marginTop: 1 },
              React.createElement(Text, null, "📄 " + file.name)
            )
          )
        )
      )
    ),
    
    // Footer
    React.createElement(Box, { marginTop: 2, borderStyle: "single", borderColor: "gray", padding: 1 },
      React.createElement(Text, { color: "gray" }, "Use ↑↓ arrows to navigate, Enter to select, 'q' to quit")
    )
  );
};