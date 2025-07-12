#!/usr/bin/env node

/**
 * Simple Demo - No JSX, just React.createElement
 * Shows the advanced components working in a CLI
 */

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';

// Simple components without JSX
const SimpleSpinner = ({ message = 'Loading...' }) => {
  const [frame, setFrame] = useState(0);
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % frames.length);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return React.createElement(Box, {},
    React.createElement(Text, { color: 'cyan' }, frames[frame] + ' ' + message)
  );
};

const SimpleProgress = ({ progress = 0, width = 40 }) => {
  const filled = Math.round(width * progress);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const percent = Math.round(progress * 100);
  
  return React.createElement(Box, {},
    React.createElement(Text, { color: 'green' }, `${bar} ${percent}%`)
  );
};

const SimpleCelebration = ({ message = 'Success!' }) => {
  const [showFireworks, setShowFireworks] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowFireworks(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return React.createElement(Box, { flexDirection: 'column', alignItems: 'center' },
    React.createElement(Text, { color: 'green', bold: true }, message),
    showFireworks && React.createElement(Text, { color: 'yellow' }, '✨ 🎉 🎊 ✨')
  );
};

const SimpleDemo = () => {
  const { exit } = useApp();
  const [currentView, setCurrentView] = useState('menu');
  const [progress, setProgress] = useState(0);
  const [selectedItem, setSelectedItem] = useState(0);

  const menuItems = [
    'Progress Bar Demo',
    'Spinner Demo', 
    'Celebration Demo',
    'Exit'
  ];

  // Auto-progress for progress bar demo
  useEffect(() => {
    if (currentView === 'progress') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 1) {
            clearInterval(interval);
            setTimeout(() => setCurrentView('menu'), 1000);
            return 1;
          }
          return prev + 0.05;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [currentView]);

  // Handle keyboard input
  useInput((input, key) => {
    if (currentView === 'menu') {
      if (key.upArrow) {
        setSelectedItem(prev => prev > 0 ? prev - 1 : menuItems.length - 1);
      } else if (key.downArrow) {
        setSelectedItem(prev => prev < menuItems.length - 1 ? prev + 1 : 0);
      } else if (key.return) {
        const selected = menuItems[selectedItem];
        if (selected === 'Exit') {
          exit();
        } else if (selected === 'Progress Bar Demo') {
          setProgress(0);
          setCurrentView('progress');
        } else if (selected === 'Spinner Demo') {
          setCurrentView('spinner');
          setTimeout(() => setCurrentView('menu'), 3000);
        } else if (selected === 'Celebration Demo') {
          setCurrentView('celebration');
          setTimeout(() => setCurrentView('menu'), 3000);
        }
      }
    } else if (key.escape) {
      setCurrentView('menu');
    }
  });

  // Render different views
  const renderView = () => {
    switch (currentView) {
      case 'menu':
        return React.createElement(Box, { flexDirection: 'column' },
          React.createElement(Text, { bold: true, color: 'green' }, '🎼 submitit Advanced Components Demo'),
          React.createElement(Text, { color: 'gray' }, 'Use arrow keys to navigate, Enter to select'),
          React.createElement(Text, {}, ''),
          ...menuItems.map((item, index) => 
            React.createElement(Text, { 
              key: index,
              color: index === selectedItem ? 'cyan' : 'white',
              inverse: index === selectedItem
            }, `${index === selectedItem ? '▶ ' : '  '}${item}`)
          )
        );

      case 'progress':
        return React.createElement(Box, { flexDirection: 'column' },
          React.createElement(Text, { bold: true, color: 'green' }, '📊 Progress Bar Demo'),
          React.createElement(Text, {}, ''),
          React.createElement(SimpleProgress, { progress }),
          React.createElement(Text, { color: 'gray' }, 'Watch the progress bar fill up!')
        );

      case 'spinner':
        return React.createElement(Box, { flexDirection: 'column' },
          React.createElement(Text, { bold: true, color: 'green' }, '🎵 Spinner Demo'),
          React.createElement(Text, {}, ''),
          React.createElement(SimpleSpinner, { message: 'Orchestrating files...' }),
          React.createElement(Text, { color: 'gray' }, 'Press ESC to return to menu')
        );

      case 'celebration':
        return React.createElement(Box, { flexDirection: 'column' },
          React.createElement(Text, { bold: true, color: 'green' }, '🎉 Celebration Demo'),
          React.createElement(Text, {}, ''),
          React.createElement(SimpleCelebration, { message: 'Export Complete!' }),
          React.createElement(Text, { color: 'gray' }, 'Press ESC to return to menu')
        );

      default:
        return React.createElement(Text, { color: 'red' }, 'Unknown view');
    }
  };

  return React.createElement(Box, { flexDirection: 'column', padding: 1 },
    renderView()
  );
};

console.log('🎼 Starting submitit Advanced Components Demo...\n');

// Render the demo
render(React.createElement(SimpleDemo));