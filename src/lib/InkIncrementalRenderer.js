// DISABLED: This file contains JSX syntax that crashes Node.js
// TODO: Convert JSX to React.createElement or compile with Babel
console.log('⚠️  JSX component disabled - needs conversion');
export default function DisabledComponent() {
  return null;
}

/* ORIGINAL CODE (commented out to prevent crashes):
/**
 * Ink Incremental Renderer
 * 
 * Prevents full re-renders by using React.memo and selective updates.
 * Applies Ninja's "only rebuild what changed" principle to terminal UI.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { Box, Text } from 'ink';
import { createHash } from 'crypto';

/**
 * Memoized component that only re-renders when props actually change
 */
const MemoizedProjectPanel = React.memo(({ project, onUpdate }) => {
  return (
    <Box flexDirection="column" borderStyle="single" padding={1}>
      <Text bold>{project.name}</Text>
      <Text>Files: {project.fileCount}</Text>
      <Text color={project.status === 'ready' ? 'green' : 'yellow'}>
        Status: {project.status}
      </Text>
    </Box>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if these specific values changed
  return (
    prevProps.project.name === nextProps.project.name &&
    prevProps.project.fileCount === nextProps.project.fileCount &&
    prevProps.project.status === nextProps.project.status
  );
});

/**
 * Memoized file list that only updates changed files
 */
const MemoizedFileList = React.memo(({ files, selectedFile }) => {
  return (
    <Box flexDirection="column">
      {files.map((file, index) => (
        <MemoizedFileItem 
          key={file.path} 
          file={file} 
          isSelected={selectedFile === file.path}
        />
      ))}
    </Box>
  );
}, (prevProps, nextProps) => {
  // Only re-render if file list actually changed
  if (prevProps.files.length !== nextProps.files.length) return false;
  if (prevProps.selectedFile !== nextProps.selectedFile) return false;
  
  // Check if any file contents changed using hashing
  for (let i = 0; i < prevProps.files.length; i++) {
    const prevHash = createHash('md5').update(JSON.stringify(prevProps.files[i])).digest('hex');
    const nextHash = createHash('md5').update(JSON.stringify(nextProps.files[i])).digest('hex');
    if (prevHash !== nextHash) return false;
  }
  
  return true;
});

/**
 * Individual file item with granular memoization
 */
const MemoizedFileItem = React.memo(({ file, isSelected }) => {
  return (
    <Text 
      color={isSelected ? 'blue' : 'white'}
      backgroundColor={isSelected ? 'white' : undefined}
    >
      {file.status === 'modified' ? '● ' : '  '}
      {file.name}
    </Text>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.file.name === nextProps.file.name &&
    prevProps.file.status === nextProps.file.status &&
    prevProps.isSelected === nextProps.isSelected
  );
});

/**
 * Ninja-inspired progress bar with minimal updates
 */
const NinjaProgressBar = React.memo(({ current, total, operation }) => {
  const percentage = Math.round((current / total) * 100);
  const barWidth = 40;
  const filledWidth = Math.round((percentage / 100) * barWidth);
  
  const progressBar = useMemo(() => {
    return '█'.repeat(filledWidth) + '░'.repeat(barWidth - filledWidth);
  }, [filledWidth, barWidth]);

  return (
    <Box flexDirection="column">
      <Text color="cyan">
        [{current}/{total}] {operation}
      </Text>
      <Text>
        {progressBar} {percentage}%
      </Text>
    </Box>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.current === nextProps.current &&
    prevProps.total === nextProps.total &&
    prevProps.operation === nextProps.operation
  );
});

/**
 * Main incremental renderer with selective updates
 */
export const IncrementalSubmititApp = () => {
  const [project, setProject] = useState({
    name: 'My Project',
    fileCount: 0,
    status: 'ready'
  });
  
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [buildProgress, setBuildProgress] = useState({ current: 0, total: 0, operation: '' });

  // Memoized handlers to prevent unnecessary re-renders
  const handleProjectUpdate = useCallback((updates) => {
    setProject(prev => ({ ...prev, ...updates }));
  }, []);

  const handleFileSelect = useCallback((filePath) => {
    setSelectedFile(filePath);
  }, []);

  const handleFileUpdate = useCallback((filePath, updates) => {
    setFiles(prev => prev.map(file => 
      file.path === filePath ? { ...file, ...updates } : file
    ));
  }, []);

  // Memoized sections to prevent cascading re-renders
  const projectSection = useMemo(() => (
    <MemoizedProjectPanel 
      project={project} 
      onUpdate={handleProjectUpdate}
    />
  ), [project, handleProjectUpdate]);

  const filesSection = useMemo(() => (
    <MemoizedFileList 
      files={files} 
      selectedFile={selectedFile}
    />
  ), [files, selectedFile]);

  const progressSection = useMemo(() => (
    buildProgress.total > 0 ? (
      <NinjaProgressBar 
        current={buildProgress.current}
        total={buildProgress.total}
        operation={buildProgress.operation}
      />
    ) : null
  ), [buildProgress]);

  return (
    <Box flexDirection="column" height="100%">
      {/* Project info - only re-renders when project changes */}
      {projectSection}
      
      {/* File list - only re-renders when files change */}
      <Box flexGrow={1}>
        {filesSection}
      </Box>
      
      {/* Progress bar - only re-renders when progress changes */}
      {progressSection}
    </Box>
  );
};

/**
 * Performance monitoring for Ink renders
 */
export class InkRenderProfiler {
  constructor() {
    this.renderCounts = new Map();
    this.renderTimes = new Map();
  }

  trackRender(componentName) {
    const count = this.renderCounts.get(componentName) || 0;
    this.renderCounts.set(componentName, count + 1);
    
    const startTime = process.hrtime.bigint();
    return () => {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      
      const times = this.renderTimes.get(componentName) || [];
      times.push(duration);
      this.renderTimes.set(componentName, times);
    };
  }

  getReport() {
    const report = {};
    for (const [component, count] of this.renderCounts) {
      const times = this.renderTimes.get(component) || [];
      const avgTime = times.length > 0 ? times.reduce((a, b) => a + b) / times.length : 0;
      
      report[component] = {
        renderCount: count,
        averageRenderTime: `${avgTime.toFixed(2)}ms`,
        totalTime: `${times.reduce((a, b) => a + b, 0).toFixed(2)}ms`
      };
    }
    return report;
  }
}

// Example usage showing render optimization
export function demonstrateIncrementalRendering() {
  const profiler = new InkRenderProfiler();
  
  // Simulate component renders
  console.log('=== Without memoization ===');
  for (let i = 0; i < 100; i++) {
    const endRender = profiler.trackRender('ProjectPanel');
    // Simulate render work
    setTimeout(endRender, Math.random() * 10);
  }
  
  console.log('=== With memoization ===');
  for (let i = 0; i < 100; i++) {
    const endRender = profiler.trackRender('MemoizedProjectPanel');
    // Memoized components skip unnecessary renders
    if (i % 10 === 0) { // Only 10% of renders actually execute
      setTimeout(endRender, Math.random() * 10);
    } else {
      endRender(); // Immediate return for cached renders
    }
  }
  
  setTimeout(() => {
    console.log('Render Performance Report:', profiler.getReport());
  }, 1000);
}
*/