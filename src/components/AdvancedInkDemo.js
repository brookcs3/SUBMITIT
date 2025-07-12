// DISABLED: This file contains JSX syntax that crashes Node.js
// TODO: Convert JSX to React.createElement or compile with Babel
console.log('⚠️  JSX component disabled - needs conversion');
export default function DisabledComponent() {
  return null;
}

/* ORIGINAL CODE (commented out to prevent crashes):
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';

const { createElement: h } = React;
import {
  AnimatedProgressBar,
  AnimatedSpinner,
  AnimatedTypewriter,
  ResponsiveCard,
  AnimatedMenu,
  AnimatedStatusPanel,
  ResponsiveLayout,
  AnimatedCelebration,
  AnimatedFileExplorer,
  useResponsiveTerminal,
  useAnimation
} from './AdvancedInkComponents.js';

/**
 * Demo Application showcasing Advanced Ink Components
 * 
 * This interactive demo demonstrates all the advanced components
 * with animations, transitions, and responsive behavior.
 */

const AdvancedInkDemo = () => {
  const { exit } = useApp();
  const { dimensions, breakpoint } = useResponsiveTerminal();
  const [currentDemo, setCurrentDemo] = useState('menu');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Demo states
  const [showCelebration, setShowCelebration] = useState(false);
  const [fileExplorerFiles] = useState([
    { name: 'src', type: 'directory', path: '/src' },
    { name: 'components', type: 'directory', path: '/src/components' },
    { name: 'main.js', type: 'file', path: '/src/main.js' },
    { name: 'config.json', type: 'file', path: '/config.json' },
    { name: 'README.md', type: 'file', path: '/README.md' },
    { name: 'package.json', type: 'file', path: '/package.json' },
    { name: 'styles.css', type: 'file', path: '/styles.css' },
    { name: 'image.png', type: 'file', path: '/image.png' }
  ]);

  const menuItems = [
    { label: '🎼 Progress Bars Demo', value: 'progress' },
    { label: '🎵 Spinners Demo', value: 'spinners' },
    { label: '📝 Typewriter Demo', value: 'typewriter' },
    { label: '📋 Status Panel Demo', value: 'status' },
    { label: '📁 File Explorer Demo', value: 'explorer' },
    { label: '🎉 Celebration Demo', value: 'celebration' },
    { label: '📊 Layout Demo', value: 'layout' },
    { label: '🔧 Terminal Info', value: 'terminal' },
    { label: '🚪 Exit Demo', value: 'exit' }
  ];

  // Auto-progress simulation
  useEffect(() => {
    if (currentDemo === 'progress') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 1) {
            clearInterval(interval);
            return 1;
          }
          return prev + 0.02;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [currentDemo]);

  // Handle menu selection
  const handleMenuSelect = (item) => {
    if (item.value === 'exit') {
      exit();
      return;
    }

    if (item.value === 'celebration') {
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        setCurrentDemo('menu');
      }, 4000);
      return;
    }

    if (item.value === 'status') {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentDemo('menu');
      }, 3000);
      return;
    }

    setCurrentDemo(item.value);
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    // For demo purposes, just show a message
    setTimeout(() => {
      setCurrentDemo('menu');
    }, 1000);
  };

  // Global input handling
  useInput((input, key) => {
    if (key.escape || input === 'q') {
      if (currentDemo !== 'menu') {
        setCurrentDemo('menu');
      } else {
        exit();
      }
    }
  });

  // Render current demo
  const renderDemo = () => {
    switch (currentDemo) {
      case 'menu':
        return (
          <AnimatedMenu 
            items={menuItems}
            onSelect={handleMenuSelect}
            title="🎼 Advanced Ink Components Demo"
          />
        );

      case 'progress':
        return (
          <ResponsiveLayout layout="column" gap={2}>
            <ResponsiveCard title="🎼 Progress Bars Demo" variant="info">
              <Box flexDirection="column">
                <Text color="gray" dimColor>Different styles and animations:</Text>
                <Box marginTop={1} marginBottom={1}>
                  <AnimatedProgressBar 
                    progress={progress} 
                    label="Blocks Style"
                    style="blocks"
                    color="green"
                  />
                </Box>
                <Box marginBottom={1}>
                  <AnimatedProgressBar 
                    progress={progress * 0.8} 
                    label="Bars Style"
                    style="bars"
                    color="cyan"
                  />
                </Box>
                <Box marginBottom={1}>
                  <AnimatedProgressBar 
                    progress={progress * 0.6} 
                    label="Dots Style"
                    style="dots"
                    color="magenta"
                  />
                </Box>
                <Box marginBottom={1}>
                  <AnimatedProgressBar 
                    progress={progress * 0.4} 
                    label="Arrows Style"
                    style="arrows"
                    color="yellow"
                  />
                </Box>
                <Text color="gray" dimColor>Press ESC to return to menu</Text>
              </Box>
            </ResponsiveCard>
          </ResponsiveLayout>
        );

      case 'spinners':
        return (
          <ResponsiveLayout layout="column" gap={2}>
            <ResponsiveCard title="🎵 Spinners Demo" variant="info">
              <Box flexDirection="column">
                <Text color="gray" dimColor>Different spinner styles:</Text>
                <Box marginTop={1} marginBottom={1}>
                  <AnimatedSpinner style="dots" message="Loading dots..." />
                </Box>
                <Box marginBottom={1}>
                  <AnimatedSpinner style="line" message="Loading line..." color="cyan" />
                </Box>
                <Box marginBottom={1}>
                  <AnimatedSpinner style="arrows" message="Loading arrows..." color="magenta" />
                </Box>
                <Box marginBottom={1}>
                  <AnimatedSpinner style="pulse" message="Loading pulse..." color="yellow" />
                </Box>
                <Box marginBottom={1}>
                  <AnimatedSpinner style="conductor" message="Orchestrating..." color="green" />
                </Box>
                <Text color="gray" dimColor>Press ESC to return to menu</Text>
              </Box>
            </ResponsiveCard>
          </ResponsiveLayout>
        );

      case 'typewriter':
        return (
          <ResponsiveLayout layout="column" gap={2}>
            <ResponsiveCard title="📝 Typewriter Demo" variant="success">
              <Box flexDirection="column">
                <Text color="gray" dimColor>Animated typewriter effects:</Text>
                <Box marginTop={1} marginBottom={1}>
                  <AnimatedTypewriter 
                    text="🎼 Welcome to the Advanced Ink Components Demo!"
                    speed={50}
                    color="green"
                  />
                </Box>
                <Box marginBottom={1}>
                  <AnimatedTypewriter 
                    text="✨ This demonstrates smooth typewriter animation with cursor blinking."
                    speed={30}
                    color="cyan"
                  />
                </Box>
                <Box marginBottom={1}>
                  <AnimatedTypewriter 
                    text="🚀 Perfect for dynamic content and engaging user experiences."
                    speed={40}
                    color="magenta"
                  />
                </Box>
                <Text color="gray" dimColor>Press ESC to return to menu</Text>
              </Box>
            </ResponsiveCard>
          </ResponsiveLayout>
        );

      case 'status':
        return (
          <ResponsiveLayout layout="column" gap={2}>
            <AnimatedStatusPanel 
              status={isProcessing ? 'processing' : 'success'}
              message={isProcessing ? 'Orchestrating files...' : 'Orchestration complete!'}
              details={[
                'Smart file analysis',
                'Dependency mapping',
                'Layout optimization',
                'Content validation'
              ]}
              progress={isProcessing ? null : 1}
            />
            <ResponsiveCard variant="info">
              <Text color="gray" dimColor>Press ESC to return to menu</Text>
            </ResponsiveCard>
          </ResponsiveLayout>
        );

      case 'explorer':
        return (
          <ResponsiveLayout layout="column" gap={2}>
            <AnimatedFileExplorer 
              files={fileExplorerFiles}
              onFileSelect={handleFileSelect}
              title="📁 Interactive File Explorer"
            />
            <ResponsiveCard variant="info">
              <Text color="gray" dimColor>Use arrow keys to navigate, Enter to select, ESC to return</Text>
            </ResponsiveCard>
          </ResponsiveLayout>
        );

      case 'layout':
        return (
          <ResponsiveLayout layout="auto" gap={2}>
            <ResponsiveCard title="📊 Layout Demo" variant="info">
              <Box flexDirection="column">
                <Text color="gray" dimColor>Responsive layout adaptation:</Text>
                <Text color="cyan">Breakpoint: {breakpoint}</Text>
                <Text color="cyan">Dimensions: {dimensions.width}x{dimensions.height}</Text>
                <Text color="gray" dimColor>Resize your terminal to see changes!</Text>
              </Box>
            </ResponsiveCard>
            <ResponsiveCard title="🎯 Card 2" variant="success">
              <Text>This card adapts to screen size</Text>
            </ResponsiveCard>
            <ResponsiveCard title="🔧 Card 3" variant="warning">
              <Text>Layout automatically adjusts</Text>
            </ResponsiveCard>
          </ResponsiveLayout>
        );

      case 'terminal':
        return (
          <ResponsiveLayout layout="column" gap={2}>
            <ResponsiveCard title="🔧 Terminal Information" variant="info">
              <Box flexDirection="column">
                <Text color="cyan">Terminal Dimensions: {dimensions.width} x {dimensions.height}</Text>
                <Text color="cyan">Current Breakpoint: {breakpoint}</Text>
                <Text color="gray" dimColor>Supported breakpoints:</Text>
                <Text color="gray" dimColor>• narrow: &lt; 80 columns</Text>
                <Text color="gray" dimColor>• standard: 80-119 columns</Text>
                <Text color="gray" dimColor>• wide: 120-159 columns</Text>
                <Text color="gray" dimColor>• ultrawide: 160+ columns</Text>
              </Box>
            </ResponsiveCard>
            <ResponsiveCard variant="warning">
              <Text color="gray" dimColor>Press ESC to return to menu</Text>
            </ResponsiveCard>
          </ResponsiveLayout>
        );

      default:
        return (
          <ResponsiveCard title="🎼 Advanced Ink Components" variant="info">
            <Text>Unknown demo: {currentDemo}</Text>
          </ResponsiveCard>
        );
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <ResponsiveCard title="🎼 submitit Advanced Components" variant="success">
          <Box flexDirection="column">
            <Text color="green">Interactive demo of advanced terminal UI components</Text>
            <Text color="gray" dimColor>Use arrow keys to navigate, Enter to select, ESC to go back</Text>
          </Box>
        </ResponsiveCard>
      </Box>

      {showCelebration ? (
        <AnimatedCelebration 
          message="🎉 Celebration Component Demo!"
          onComplete={() => setShowCelebration(false)}
        />
      ) : (
        renderDemo()
      )}

      <Box marginTop={1}>
        <Text color="gray" dimColor>
          Terminal: {dimensions.width}x{dimensions.height} • Breakpoint: {breakpoint} • Press 'q' to quit
        </Text>
      </Box>
    </Box>
  );
};

export default AdvancedInkDemo;
*/