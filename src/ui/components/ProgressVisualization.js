import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { AnimatedProgressBar, AnimatedSpinner, AnimatedTypewriter } from '../../components/AdvancedInkComponents.js';

/**
 * Meaningful Progress Visualization with Contextual Messaging and Emotional Feedback
 * Transforms technical operations into human-readable progress stories
 */

// Progress phases with emotional context
const PROGRESS_PHASES = {
  preparation: {
    icon: '🏗️',
    color: 'blue',
    messages: [
      'Setting up construction site...',
      'Laying foundation...',
      'Preparing blueprints...',
      'Organizing materials...'
    ]
  },
  analysis: {
    icon: '🔍',
    color: 'cyan',
    messages: [
      'Analyzing file structure...',
      'Reading architectural plans...',
      'Evaluating materials...',
      'Calculating load requirements...'
    ]
  },
  construction: {
    icon: '⚡',
    color: 'yellow',
    messages: [
      'Building framework...',
      'Assembling components...',
      'Connecting systems...',
      'Installing fixtures...'
    ]
  },
  optimization: {
    icon: '⚙️',
    color: 'magenta',
    messages: [
      'Fine-tuning layout...',
      'Optimizing performance...',
      'Adjusting alignment...',
      'Polishing details...'
    ]
  },
  validation: {
    icon: '🎯',
    color: 'orange',
    messages: [
      'Quality inspection...',
      'Testing structural integrity...',
      'Validating safety standards...',
      'Checking compliance...'
    ]
  },
  completion: {
    icon: '✨',
    color: 'green',
    messages: [
      'Final touches...',
      'Preparing deliverable...',
      'Generating documentation...',
      'Ready for handover...'
    ]
  }
};

// Contextual progress tracker
export const ContextualProgressTracker = ({ 
  currentPhase = 'preparation',
  progress = 0,
  taskContext = {},
  showDetails = true,
  showEmotionalFeedback = true
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const phase = PROGRESS_PHASES[currentPhase] || PROGRESS_PHASES.preparation;

  useEffect(() => {
    const messages = phase.messages;
    const timer = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(timer);
  }, [currentPhase, phase.messages]);

  useEffect(() => {
    setCurrentMessage(phase.messages[messageIndex]);
  }, [messageIndex, phase.messages]);

  useEffect(() => {
    if (progress >= 100 && currentPhase === 'completion') {
      setShowCelebration(true);
    }
  }, [progress, currentPhase]);

  const getEncouragementMessage = () => {
    if (progress < 25) return "Great start! Building momentum...";
    if (progress < 50) return "Excellent progress! Halfway there...";
    if (progress < 75) return "Outstanding work! Almost finished...";
    if (progress < 95) return "Incredible! Final stretch...";
    return "Perfect! Mission accomplished!";
  };

  const getTaskSpecificMessage = () => {
    if (taskContext.type === 'file-processing') {
      return `Processing ${taskContext.currentFile || 'files'}... (${taskContext.filesCompleted || 0}/${taskContext.totalFiles || 0})`;
    }
    if (taskContext.type === 'layout-calculation') {
      return `Calculating layout arrangements... (${taskContext.nodesProcessed || 0} nodes)`;
    }
    if (taskContext.type === 'packaging') {
      return `Creating ${taskContext.format || 'archive'}... (${Math.round(taskContext.size / 1024) || 0}KB)`;
    }
    return currentMessage;
  };

  return React.createElement(Box, { flexDirection: 'column', padding: 1 },
    // Phase header with icon and name
    React.createElement(Box, { flexDirection: 'row', marginBottom: 1 },
      React.createElement(Text, { color: phase.color, bold: true }, 
        `${phase.icon} ${currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}`
      )
    ),

    // Main progress bar
    React.createElement(AnimatedProgressBar, {
      progress: progress,
      color: phase.color,
      width: 40,
      showPercentage: true,
      label: '',
      style: 'blocks'
    }),

    // Current task message
    showDetails && React.createElement(Box, { marginTop: 1, marginBottom: 1 },
      React.createElement(Text, { color: 'gray' }, getTaskSpecificMessage())
    ),

    // Emotional feedback
    showEmotionalFeedback && React.createElement(Box, { marginTop: 1 },
      React.createElement(Text, { color: 'cyan', italic: true }, 
        getEncouragementMessage()
      )
    ),

    // Celebration on completion
    showCelebration && React.createElement(Box, { marginTop: 1 },
      React.createElement(AnimatedTypewriter, {
        text: '🎉 Deliverable crafted with precision! 🎉',
        speed: 80,
        color: 'green'
      })
    )
  );
};

// Multi-step workflow visualizer
export const WorkflowVisualizer = ({ 
  steps = [],
  currentStep = 0,
  showTimeline = true
}) => {
  const [stepProgress, setStepProgress] = useState({});

  useEffect(() => {
    // Simulate step progress
    steps.forEach((step, index) => {
      if (index < currentStep) {
        setStepProgress(prev => ({ ...prev, [index]: 100 }));
      } else if (index === currentStep) {
        setStepProgress(prev => ({ ...prev, [index]: step.progress || 0 }));
      } else {
        setStepProgress(prev => ({ ...prev, [index]: 0 }));
      }
    });
  }, [currentStep, steps]);

  const getStepStatus = (index) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  const getStepIcon = (step, status) => {
    if (status === 'completed') return '✅';
    if (status === 'active') return '⚡';
    return '⏳';
  };

  const getStepColor = (status) => {
    if (status === 'completed') return 'green';
    if (status === 'active') return 'cyan';
    return 'gray';
  };

  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Text, { color: 'cyan', bold: true, marginBottom: 1 }, 
      '🏗️ Construction Timeline'
    ),

    ...steps.map((step, index) => {
      const status = getStepStatus(index);
      const progress = stepProgress[index] || 0;

      return React.createElement(Box, { key: index, flexDirection: 'column', marginBottom: 1 },
        // Step header
        React.createElement(Box, { flexDirection: 'row' },
          React.createElement(Text, { 
            color: getStepColor(status),
            marginRight: 1
          }, getStepIcon(step, status)),
          React.createElement(Text, { 
            color: getStepColor(status),
            bold: status === 'active'
          }, step.name),
          status === 'active' && React.createElement(AnimatedSpinner, {
            style: 'dots',
            color: 'cyan',
            speed: 100
          })
        ),

        // Step progress (only for active step)
        status === 'active' && progress > 0 && React.createElement(Box, { marginLeft: 2, marginTop: 1 },
          React.createElement(AnimatedProgressBar, {
            progress: progress,
            color: 'cyan',
            width: 30,
            showPercentage: false
          })
        ),

        // Step description
        React.createElement(Box, { marginLeft: 2 },
          React.createElement(Text, { color: 'gray', dimColor: true }, 
            step.description || ''
          )
        ),

        // Timeline connector (except last step)
        showTimeline && index < steps.length - 1 && React.createElement(Box, { marginLeft: 1 },
          React.createElement(Text, { color: 'gray' }, '│')
        )
      );
    })
  );
};

// Performance metrics display
export const PerformanceMetrics = ({ 
  metrics = {},
  showTrends = true
}) => {
  const [previousMetrics, setPreviousMetrics] = useState({});
  const [trends, setTrends] = useState({});

  useEffect(() => {
    if (showTrends && Object.keys(previousMetrics).length > 0) {
      const newTrends = {};
      Object.keys(metrics).forEach(key => {
        const current = metrics[key];
        const previous = previousMetrics[key];
        if (typeof current === 'number' && typeof previous === 'number') {
          newTrends[key] = current > previous ? 'up' : current < previous ? 'down' : 'stable';
        }
      });
      setTrends(newTrends);
    }
    setPreviousMetrics(metrics);
  }, [metrics, previousMetrics, showTrends]);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'green';
      case 'down': return 'red';
      case 'stable': return 'yellow';
      default: return 'gray';
    }
  };

  const formatValue = (value) => {
    if (typeof value === 'number') {
      if (value > 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value > 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toString();
    }
    return String(value);
  };

  return React.createElement(Box, { flexDirection: 'column', borderStyle: 'single', padding: 1 },
    React.createElement(Text, { color: 'cyan', bold: true, marginBottom: 1 }, 
      '📊 Performance Metrics'
    ),

    React.createElement(Box, { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
      ...Object.entries(metrics).map(([key, value]) => 
        React.createElement(Box, { key, flexDirection: 'column', minWidth: 12 },
          React.createElement(Text, { color: 'gray', dimColor: true }, 
            key.replace(/([A-Z])/g, ' $1').toUpperCase()
          ),
          React.createElement(Box, { flexDirection: 'row' },
            React.createElement(Text, { color: 'white', bold: true }, 
              formatValue(value)
            ),
            showTrends && trends[key] && React.createElement(Text, { 
              color: getTrendColor(trends[key]),
              marginLeft: 1
            }, getTrendIcon(trends[key]))
          )
        )
      )
    )
  );
};

// Emotional feedback system
export const EmotionalFeedback = ({ 
  mood = 'neutral',
  message = '',
  intensity = 'medium'
}) => {
  const moodConfig = {
    excited: { color: 'yellow', icon: '🎉', prefix: 'Amazing!' },
    happy: { color: 'green', icon: '😊', prefix: 'Great!' },
    focused: { color: 'cyan', icon: '🎯', prefix: 'Focused...' },
    calm: { color: 'blue', icon: '😌', prefix: 'Steady...' },
    neutral: { color: 'gray', icon: '⚡', prefix: 'Working...' },
    concerned: { color: 'yellow', icon: '🤔', prefix: 'Hmm...' },
    determined: { color: 'magenta', icon: '💪', prefix: 'Pushing through!' }
  };

  const config = moodConfig[mood] || moodConfig.neutral;
  const intensityStyle = {
    low: { bold: false, dimColor: true },
    medium: { bold: false, dimColor: false },
    high: { bold: true, dimColor: false }
  };

  return React.createElement(Box, { flexDirection: 'row' },
    React.createElement(Text, { color: config.color }, config.icon),
    React.createElement(Text, { 
      color: config.color,
      marginLeft: 1,
      ...intensityStyle[intensity]
    }, `${config.prefix} ${message}`)
  );
};

// Export all components
export {
  ContextualProgressTracker,
  WorkflowVisualizer,
  PerformanceMetrics,
  EmotionalFeedback,
  PROGRESS_PHASES
};