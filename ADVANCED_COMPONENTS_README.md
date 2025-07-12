# Advanced Ink Components

This document describes the advanced terminal UI components created for submitit CLI, featuring animations, transitions, and responsive behavior.

## 🎼 Overview

The Advanced Ink Components system provides sophisticated terminal UI elements that adapt to screen size, include smooth animations, and deliver rich interactive experiences. These components are built on top of Facebook's Ink framework and are designed specifically for the submitit CLI ecosystem.

## 📦 Components Library

### 1. **Responsive Hooks**

#### `useResponsiveTerminal()`
Detects terminal dimensions and calculates responsive breakpoints:
- **narrow**: < 80 columns
- **standard**: 80-119 columns  
- **wide**: 120-159 columns
- **ultrawide**: 160+ columns

```javascript
const { dimensions, breakpoint } = useResponsiveTerminal();
// dimensions: { width: 120, height: 30 }
// breakpoint: 'standard'
```

#### `useAnimation(duration, easing)`
Manages animations with timing and easing functions:
- **Easing**: linear, easeIn, easeOut, easeInOut, bounce
- **Duration**: Configurable in milliseconds

```javascript
const { progress, isActive, start, reset } = useAnimation(1000, 'easeInOut');
```

### 2. **Animated Components**

#### `AnimatedProgressBar`
Smooth progress bar with multiple styles:
- **Styles**: blocks, bars, dots, arrows
- **Colors**: Customizable color schemes
- **Animation**: Smooth transitions between progress states

```javascript
<AnimatedProgressBar 
  progress={0.75} 
  label="Processing files"
  style="blocks"
  color="green"
/>
```

#### `AnimatedSpinner`
Multi-style spinner with customizable animations:
- **Styles**: dots, line, arrows, bounce, pulse, music, conductor
- **Speed**: Configurable frame rate
- **Colors**: Full color palette support

```javascript
<AnimatedSpinner 
  style="conductor" 
  message="Orchestrating files..." 
  color="cyan" 
/>
```

#### `AnimatedTypewriter`
Typewriter effect with cursor blinking:
- **Speed**: Configurable typing speed
- **Cursor**: Customizable cursor character
- **Colors**: Syntax highlighting support

```javascript
<AnimatedTypewriter 
  text="Welcome to submitit!"
  speed={50}
  color="green"
  onComplete={() => console.log('Done!')}
/>
```

### 3. **Responsive Components**

#### `ResponsiveCard`
Adaptive card component with variants:
- **Variants**: default, success, warning, error, info
- **Responsive**: Automatically adjusts to screen size
- **Borders**: Styled borders with color coding

```javascript
<ResponsiveCard title="File Processing" variant="success">
  <Text>Your files are ready!</Text>
</ResponsiveCard>
```

#### `ResponsiveLayout`
Intelligent layout management:
- **Layouts**: column, row, auto (responsive)
- **Breakpoint-aware**: Adapts to terminal size
- **Gap control**: Configurable spacing

```javascript
<ResponsiveLayout layout="auto" gap={2}>
  <ResponsiveCard title="Card 1" />
  <ResponsiveCard title="Card 2" />
</ResponsiveLayout>
```

### 4. **Interactive Components**

#### `AnimatedMenu`
Keyboard-navigable menu with animations:
- **Navigation**: Arrow keys, Enter to select
- **Icons**: Optional icon support
- **Animations**: Smooth selection transitions

```javascript
<AnimatedMenu 
  items={menuItems}
  onSelect={(item) => console.log('Selected:', item)}
  title="Main Menu"
/>
```

#### `AnimatedStatusPanel`
Status display with progress tracking:
- **Status types**: idle, loading, success, error, warning, processing
- **Progress**: Optional progress bar integration
- **Details**: Expandable details list

```javascript
<AnimatedStatusPanel 
  status="processing"
  message="Orchestrating files..."
  progress={0.65}
  details={['Analyzing content', 'Optimizing layout']}
/>
```

#### `AnimatedFileExplorer`
Interactive file browser:
- **Navigation**: Arrow keys, Enter to select
- **File icons**: Automatic icon detection by extension
- **Directory expansion**: Collapsible directory tree

```javascript
<AnimatedFileExplorer 
  files={fileList}
  onFileSelect={(file) => console.log('Selected:', file)}
  title="Project Files"
/>
```

### 5. **Special Effects**

#### `AnimatedCelebration`
Celebration animation with fireworks:
- **Duration**: Configurable animation length
- **Effects**: Animated fireworks and typewriter
- **Completion**: Callback when animation finishes

```javascript
<AnimatedCelebration 
  message="🎉 Export completed!"
  duration={3000}
  onComplete={() => setShowCelebration(false)}
/>
```

## 🎨 Usage Examples

### Basic Progress Display
```javascript
import { AnimatedProgressBar, AnimatedSpinner } from './AdvancedInkComponents.js';

function FileProcessing({ progress, isProcessing }) {
  return (
    <Box flexDirection="column">
      {isProcessing && (
        <AnimatedSpinner 
          style="conductor" 
          message="Orchestrating files..." 
        />
      )}
      <AnimatedProgressBar 
        progress={progress} 
        label="Processing Progress"
        style="blocks"
        color="green"
      />
    </Box>
  );
}
```

### Responsive Interface
```javascript
import { ResponsiveLayout, ResponsiveCard } from './AdvancedInkComponents.js';

function Dashboard() {
  return (
    <ResponsiveLayout layout="auto" gap={2}>
      <ResponsiveCard title="Project Status" variant="success">
        <Text>All systems operational</Text>
      </ResponsiveCard>
      <ResponsiveCard title="File Count" variant="info">
        <Text>23 files processed</Text>
      </ResponsiveCard>
    </ResponsiveLayout>
  );
}
```

### Interactive Menu
```javascript
import { AnimatedMenu } from './AdvancedInkComponents.js';

function MainMenu() {
  const items = [
    { label: '🎨 Create Project', value: 'create' },
    { label: '📁 Open Project', value: 'open' },
    { label: '🚪 Exit', value: 'exit' }
  ];

  return (
    <AnimatedMenu 
      items={items}
      onSelect={(item) => handleMenuSelect(item)}
      title="Main Menu"
    />
  );
}
```

## 🚀 Running the Demo

### Option 1: Standalone Demo
```bash
node demo-advanced-components.js
```

### Option 2: Via CLI
```bash
submitit demo
```

### Option 3: Enhanced Interactive Mode
```bash
submitit interactive --enhanced
```

## 🎯 Features

### Responsive Design
- **Automatic adaptation** to terminal size
- **Breakpoint-based** layout switching
- **Fluid typography** and spacing

### Smooth Animations
- **Easing functions** for natural motion
- **Configurable timing** for different effects
- **Performance optimized** for terminal rendering

### Interactive Elements
- **Keyboard navigation** with arrow keys
- **Selection feedback** with visual cues
- **Context-sensitive help** and instructions

### Accessibility
- **High contrast** color schemes
- **Clear visual hierarchy** with proper spacing
- **Screen reader friendly** text descriptions

## 🔧 Technical Architecture

### Event System
- **Component communication** via EventEmitter
- **Global state management** for animations
- **Cleanup handling** for memory efficiency

### Performance Optimizations
- **Selective re-rendering** with React.memo
- **Animation queuing** to prevent conflicts
- **Memory cleanup** on component unmount

### Browser Compatibility
- **Terminal capabilities** detection
- **Fallback modes** for limited terminals
- **Color depth** adaptation

## 🎼 Integration with submitit

The advanced components are fully integrated with submitit's architecture:

### Conductor Theme
- **Consistent metaphors** throughout the interface
- **Musical terminology** for file orchestration
- **Harmonious color schemes** and animations

### Layout Engine Integration
- **Yoga layout** calculations for responsive design
- **Content-aware** layout adaptations
- **Performance metrics** integration

### File Processing
- **Real-time progress** display during operations
- **Status updates** with contextual information
- **Error handling** with graceful degradation

## 📚 API Reference

### Component Props

#### AnimatedProgressBar
```typescript
interface AnimatedProgressBarProps {
  progress: number;           // 0-1 range
  width?: number;            // Character width
  showPercentage?: boolean;  // Show percentage text
  color?: string;            // Color name
  label?: string;            // Progress label
  style?: 'blocks' | 'bars' | 'dots' | 'arrows';
}
```

#### AnimatedSpinner
```typescript
interface AnimatedSpinnerProps {
  style?: 'dots' | 'line' | 'arrows' | 'bounce' | 'pulse' | 'music' | 'conductor';
  color?: string;            // Color name
  message?: string;          // Loading message
  speed?: number;            // Animation speed in ms
}
```

#### ResponsiveCard
```typescript
interface ResponsiveCardProps {
  title?: string;            // Card title
  children: React.ReactNode; // Card content
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  minWidth?: number;         // Minimum width in characters
  maxWidth?: number;         // Maximum width in characters
}
```

## 🔄 Future Enhancements

### Planned Features
- **Theme system** with multiple color schemes
- **Sound effects** integration (terminal bell)
- **Gesture support** for mouse interactions
- **Performance profiling** tools

### Advanced Animations
- **Particle effects** for celebrations
- **Parallax scrolling** for large content
- **Morphing transitions** between states
- **Physics-based** animations

### Accessibility Improvements
- **Screen reader** announcements
- **High contrast** mode
- **Keyboard shortcuts** customization
- **Voice navigation** support

## 🤝 Contributing

To contribute to the advanced components:

1. **Follow the conductor theme** - Use musical metaphors
2. **Ensure responsive design** - Test on different terminal sizes
3. **Add smooth animations** - Use the provided easing functions
4. **Include accessibility features** - Support keyboard navigation
5. **Write comprehensive tests** - Cover edge cases and performance

## 📄 License

Part of the submitit project - see main project license.