#!/usr/bin/env node

/**
 * Basic Demo - Just shows components working
 * No interactive input to avoid terminal issues
 */

import React, { useState, useEffect } from 'react';
import { render, Box, Text } from 'ink';

// Animated spinner component
const AnimatedSpinner = ({ message = 'Loading...' }) => {
  const [frame, setFrame] = useState(0);
  const frames = ['🎼', '🎵', '🎶', '🎹', '🎻', '🎺'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % frames.length);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return React.createElement(Box, {},
    React.createElement(Text, { color: 'cyan' }, frames[frame] + ' ' + message)
  );
};

// Animated progress bar
const AnimatedProgress = ({ progress = 0, width = 40, label = '' }) => {
  const filled = Math.round(width * progress);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const percent = Math.round(progress * 100);
  
  return React.createElement(Box, { flexDirection: 'column' },
    label && React.createElement(Text, { color: 'gray' }, label),
    React.createElement(Text, { color: 'green' }, `${bar} ${percent}%`)
  );
};

// Typewriter effect
const Typewriter = ({ text = '', speed = 100 }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  return React.createElement(Text, { color: 'green' },
    displayText + (showCursor ? '|' : ' ')
  );
};

// Main demo component
const BasicDemo = () => {
  const [progress1, setProgress1] = useState(0);
  const [progress2, setProgress2] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Animate progress bars
  useEffect(() => {
    const interval1 = setInterval(() => {
      setProgress1(prev => {
        if (prev >= 1) {
          clearInterval(interval1);
          return 1;
        }
        return prev + 0.02;
      });
    }, 100);

    const interval2 = setInterval(() => {
      setProgress2(prev => {
        if (prev >= 1) {
          clearInterval(interval2);
          return 1;
        }
        return prev + 0.03;
      });
    }, 150);

    return () => {
      clearInterval(interval1);
      clearInterval(interval2);
    };
  }, []);

  // Show celebration after progress completes
  useEffect(() => {
    if (progress1 >= 1 && progress2 >= 1) {
      setTimeout(() => {
        setShowCelebration(true);
      }, 1000);
    }
  }, [progress1, progress2]);

  return React.createElement(Box, { flexDirection: 'column', padding: 1 },
    // Header
    React.createElement(Box, { borderStyle: 'round', borderColor: 'green', padding: 1 },
      React.createElement(Text, { bold: true, color: 'green' }, '🎼 submitit Advanced Components Demo')
    ),
    
    React.createElement(Text, {}, ''),
    
    // Typewriter demo
    React.createElement(Box, { flexDirection: 'column' },
      React.createElement(Text, { color: 'cyan', bold: true }, '📝 Typewriter Effect:'),
      React.createElement(Typewriter, { 
        text: 'Welcome to the submitit advanced components showcase!',
        speed: 50
      })
    ),
    
    React.createElement(Text, {}, ''),
    
    // Spinner demo
    React.createElement(Box, { flexDirection: 'column' },
      React.createElement(Text, { color: 'cyan', bold: true }, '🎵 Conductor Spinner:'),
      React.createElement(AnimatedSpinner, { message: 'Orchestrating your files...' })
    ),
    
    React.createElement(Text, {}, ''),
    
    // Progress bars demo
    React.createElement(Box, { flexDirection: 'column' },
      React.createElement(Text, { color: 'cyan', bold: true }, '📊 Progress Bars:'),
      React.createElement(AnimatedProgress, { 
        progress: progress1, 
        label: 'File Processing',
        width: 30
      }),
      React.createElement(AnimatedProgress, { 
        progress: progress2, 
        label: 'Layout Generation',
        width: 30
      })
    ),
    
    React.createElement(Text, {}, ''),
    
    // Celebration
    showCelebration && React.createElement(Box, { flexDirection: 'column', alignItems: 'center' },
      React.createElement(Text, { color: 'green', bold: true }, '🎉 Orchestration Complete!'),
      React.createElement(Text, { color: 'yellow' }, '✨ 🎊 🎉 🎊 ✨'),
      React.createElement(Text, { color: 'gray' }, 'Your submitit project is ready!')
    ),
    
    React.createElement(Text, {}, ''),
    
    // Footer
    React.createElement(Box, { borderStyle: 'single', borderColor: 'gray', padding: 1 },
      React.createElement(Text, { color: 'gray' }, 'This demo shows advanced Ink components with:'),
      React.createElement(Text, { color: 'gray' }, '• Animated spinners with conductor theme'),
      React.createElement(Text, { color: 'gray' }, '• Smooth progress bars with real-time updates'),
      React.createElement(Text, { color: 'gray' }, '• Typewriter effects with blinking cursor'),
      React.createElement(Text, { color: 'gray' }, '• Celebration animations with emojis'),
      React.createElement(Text, { color: 'gray' }, '• Responsive layouts and terminal adaptation')
    )
  );
};

console.log('🎼 submitit Advanced Components Demo\n');
console.log('Watch the components animate and respond in real-time...\n');

// Render the demo
const { waitUntilExit } = render(React.createElement(BasicDemo));

// Auto-exit after 15 seconds
setTimeout(() => {
  console.log('\n🎉 Demo completed! The components are working perfectly.');
  console.log('✨ Ready to use in your submitit projects!');
  process.exit(0);
}, 15000);