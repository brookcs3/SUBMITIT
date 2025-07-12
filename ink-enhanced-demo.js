#!/usr/bin/env node

/**
 * Enhanced Ink Demo - Showing what Ink can REALLY do
 */

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp, Newline, Spacer } from 'ink';
import Spinner from 'ink-spinner';
import chalk from 'chalk';

function EnhancedDemo() {
  const [activePane, setActivePane] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState('neon');
  const [showStats, setShowStats] = useState(false);
  const { exit } = useApp();

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Simulate progress
  useEffect(() => {
    if (progress < 100) {
      const timer = setTimeout(() => setProgress(p => Math.min(p + 5, 100)), 100);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  // Handle keyboard input
  useInput((input, key) => {
    if (input === 'q') {
      exit();
    }
    if (key.leftArrow) {
      setActivePane(p => (p - 1 + 4) % 4);
    }
    if (key.rightArrow) {
      setActivePane(p => (p + 1) % 4);
    }
    if (input === 't') {
      setSelectedTheme(t => t === 'neon' ? 'crt' : 'neon');
    }
    if (input === 's') {
      setShowStats(!showStats);
    }
  });

  const themes = {
    neon: {
      primary: '#8fbfff',
      secondary: '#6aa9ff',
      accent: '#ff6b9d',
      text: '#ffffff',
      border: 'single'
    },
    crt: {
      primary: '#35ff6d',
      secondary: '#00ff41',
      accent: '#ffff00',
      text: '#00ff00',
      border: 'double'
    }
  };

  const theme = themes[selectedTheme];

  if (loading) {
    return React.createElement(Box, {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: 20
    },
      React.createElement(Box, { marginBottom: 1 },
        React.createElement(Text, { color: theme.primary },
          React.createElement(Spinner, { type: 'dots' }),
          ' Initializing SUBMITIT Enhanced Demo...'
        )
      ),
      React.createElement(ProgressBar, { percent: progress, theme: theme })
    );
  }

  const panes = [
    { title: '🎨 Themes', content: 'Theme Selection & Preview' },
    { title: '📁 Files', content: 'File Management System' },
    { title: '🧘 Layout', content: 'Yoga Layout Engine' },
    { title: '🚀 Build', content: 'Ninja Build System' }
  ];

  return React.createElement(Box, {
    flexDirection: 'column',
    height: '100%'
  },
    // Header
    React.createElement(Box, {
      borderStyle: theme.border,
      borderColor: theme.primary,
      paddingX: 2,
      marginBottom: 1
    },
      React.createElement(Text, { bold: true, color: theme.primary },
        '⚡ SUBMITIT ENHANCED DEMO ⚡'
      ),
      React.createElement(Spacer),
      React.createElement(Text, { color: theme.secondary },
        `Theme: ${selectedTheme.toUpperCase()}`
      )
    ),

    // Main Content Area
    React.createElement(Box, { flexGrow: 1 },
      // 2x2 Grid
      React.createElement(Box, { flexDirection: 'row', height: '100%' },
        // Left Column
        React.createElement(Box, { flexDirection: 'column', width: '50%' },
          React.createElement(WorkPlate, {
            pane: panes[0],
            active: activePane === 0,
            theme: theme,
            content: React.createElement(ThemePanel, { theme: theme, selectedTheme: selectedTheme })
          }),
          React.createElement(WorkPlate, {
            pane: panes[2],
            active: activePane === 2,
            theme: theme,
            content: React.createElement(LayoutPanel, { theme: theme })
          })
        ),
        // Right Column
        React.createElement(Box, { flexDirection: 'column', width: '50%' },
          React.createElement(WorkPlate, {
            pane: panes[1],
            active: activePane === 1,
            theme: theme,
            content: React.createElement(FilesPanel, { theme: theme })
          }),
          React.createElement(WorkPlate, {
            pane: panes[3],
            active: activePane === 3,
            theme: theme,
            content: React.createElement(BuildPanel, { theme: theme })
          })
        )
      )
    ),

    // Stats Panel (toggle with 's')
    showStats && React.createElement(StatsPanel, { theme: theme }),

    // Footer
    React.createElement(Box, {
      borderStyle: 'single',
      borderColor: theme.secondary,
      paddingX: 1,
      marginTop: 1
    },
      React.createElement(Text, { color: theme.text },
        '← → Navigate | t: Theme | s: Stats | q: Quit'
      )
    )
  );
}

// Individual Work Plate Component
function WorkPlate({ pane, active, theme, content }) {
  return React.createElement(Box, {
    borderStyle: active ? 'double' : 'single',
    borderColor: active ? theme.accent : theme.secondary,
    flexGrow: 1,
    margin: 0.5,
    padding: 1,
    flexDirection: 'column'
  },
    React.createElement(Text, {
      bold: true,
      color: active ? theme.accent : theme.primary
    }, pane.title),
    React.createElement(Box, { marginTop: 1 }, content)
  );
}

// Theme Panel
function ThemePanel({ theme, selectedTheme }) {
  const themes = ['neon', 'crt', 'brutalist', 'academic'];
  
  return React.createElement(Box, { flexDirection: 'column' },
    themes.map(t => 
      React.createElement(Box, { key: t, marginY: 0.5 },
        React.createElement(Text, { 
          color: t === selectedTheme ? theme.accent : theme.text,
          bold: t === selectedTheme
        }, 
          `${t === selectedTheme ? '▶ ' : '  '}${t.toUpperCase()}`
        )
      )
    )
  );
}

// Files Panel
function FilesPanel({ theme }) {
  const files = [
    { name: 'hero.md', size: '2.3KB', role: '🌟' },
    { name: 'bio.md', size: '4.1KB', role: '👤' },
    { name: 'projects.md', size: '12.8KB', role: '🛠️' },
    { name: 'gallery/', size: '245KB', role: '🖼️' }
  ];

  return React.createElement(Box, { flexDirection: 'column' },
    files.map(file =>
      React.createElement(Box, { key: file.name, marginY: 0.25 },
        React.createElement(Text, { color: theme.text },
          `${file.role} ${file.name}`
        ),
        React.createElement(Text, { color: theme.secondary },
          ` (${file.size})`
        )
      )
    )
  );
}

// Layout Panel
function LayoutPanel({ theme }) {
  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Text, { color: theme.primary }, 'Flexbox Layout:'),
    React.createElement(Box, { 
      borderStyle: 'single', 
      borderColor: theme.secondary,
      marginTop: 1,
      padding: 1
    },
      React.createElement(Box, { flexDirection: 'row' },
        React.createElement(Box, { 
          width: 10, 
          height: 3,
          borderStyle: 'single',
          borderColor: theme.text,
          marginRight: 1
        },
          React.createElement(Text, { color: theme.text }, 'Box 1')
        ),
        React.createElement(Box, { 
          width: 10, 
          height: 3,
          borderStyle: 'single',
          borderColor: theme.text
        },
          React.createElement(Text, { color: theme.text }, 'Box 2')
        )
      )
    ),
    React.createElement(Text, { 
      color: theme.secondary,
      marginTop: 1 
    }, 'Calculated with Yoga')
  );
}

// Build Panel
function BuildPanel({ theme }) {
  const [building, setBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);

  useEffect(() => {
    if (building && buildProgress < 100) {
      const timer = setTimeout(() => {
        setBuildProgress(p => Math.min(p + 10, 100));
      }, 200);
      return () => clearTimeout(timer);
    } else if (buildProgress >= 100) {
      setBuilding(false);
      setBuildProgress(0);
    }
  }, [building, buildProgress]);

  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Text, { color: theme.primary }, 'Ninja Build System'),
    React.createElement(Box, { marginTop: 1 },
      building ? 
        React.createElement(Box, { flexDirection: 'column' },
          React.createElement(Text, { color: theme.accent },
            React.createElement(Spinner, { type: 'dots' }),
            ' Building...'
          ),
          React.createElement(ProgressBar, { 
            percent: buildProgress, 
            theme: theme,
            width: 20
          })
        ) :
        React.createElement(Box, { flexDirection: 'column' },
          React.createElement(Text, { color: theme.text }, '✓ Ready to build'),
          React.createElement(Text, { 
            color: theme.secondary,
            marginTop: 1
          }, 'Press "b" to build')
        )
    )
  );
}

// Progress Bar Component
function ProgressBar({ percent, theme, width = 30 }) {
  const filled = Math.floor((percent / 100) * width);
  const empty = width - filled;

  return React.createElement(Box, null,
    React.createElement(Text, { color: theme.accent },
      '█'.repeat(filled)
    ),
    React.createElement(Text, { color: theme.secondary },
      '░'.repeat(empty)
    ),
    React.createElement(Text, { color: theme.text },
      ` ${percent}%`
    )
  );
}

// Stats Panel
function StatsPanel({ theme }) {
  return React.createElement(Box, {
    borderStyle: 'single',
    borderColor: theme.secondary,
    padding: 1,
    marginTop: 1
  },
    React.createElement(Box, { flexDirection: 'row', gap: 2 },
      React.createElement(Box, null,
        React.createElement(Text, { color: theme.primary }, 'Memory: '),
        React.createElement(Text, { color: theme.accent }, '42.3 MB')
      ),
      React.createElement(Box, null,
        React.createElement(Text, { color: theme.primary }, 'Cache: '),
        React.createElement(Text, { color: theme.accent }, '92.5%')
      ),
      React.createElement(Box, null,
        React.createElement(Text, { color: theme.primary }, 'Files: '),
        React.createElement(Text, { color: theme.accent }, '98')
      ),
      React.createElement(Box, null,
        React.createElement(Text, { color: theme.primary }, 'Layouts: '),
        React.createElement(Text, { color: theme.accent }, '3,381 lines')
      )
    )
  );
}

// Render the app
console.log(chalk.cyan('\n🚀 Launching SUBMITIT Enhanced Demo...\n'));
const { waitUntilExit } = render(React.createElement(EnhancedDemo));
waitUntilExit();