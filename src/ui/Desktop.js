/**
 * Retro-futuristic Desktop Interface - Non-JSX Node.js compatible  
 */
import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import createWindow from './Window.js';
import createIconPlate from './IconPlate.js';
import useDragController from '../hooks/useDragController.js';
import { getCurrentTheme } from './theme.js';
import chalk from 'chalk';

export function createDesktop({ theme = 'neon', debugLayout = false }) {
  const currentTheme = getCurrentTheme(theme);
  
  const [plates, setPlates] = useState([
    {
      id: 'project',
      title: 'Project Overview',
      content: 'Welcome to Submitit\nYour retro-futuristic project dashboard',
      icon: 'folder',
      w: 45,
      h: 12
    },
    {
      id: 'files',
      title: 'File Explorer', 
      content: 'bio.md\nprojects.md\ncontact.md\nstyles.css',
      icon: 'file',
      w: 45,
      h: 12
    },
    {
      id: 'build',
      title: 'Build Status',
      content: '[2/3] Processing files...\n✓ Ninja cache hit: bio.md\n● Building: projects.md',
      icon: 'code',
      w: 45,
      h: 12
    },
    {
      id: 'output',
      title: 'Output Preview',
      content: 'Ready for export\n✓ All validations passed\n→ submitit export --format zip',
      icon: 'zip',
      w: 45,
      h: 12
    }
  ]);

  const { focus, dragIdx, isDragging } = useDragController(plates.length);

  // Handle plate movement
  useEffect(() => {
    const handlePlateMove = ({ from, to }) => {
      if (from !== to) {
        const newPlates = [...plates];
        [newPlates[from], newPlates[to]] = [newPlates[to], newPlates[from]];
        setPlates(newPlates);
        
        if (debugLayout) {
          console.log(`[debug] Moved plate from ${from} to ${to}`);
        }
      }
    };

    process.on('plateMoved', handlePlateMove);
    return () => process.off('plateMoved', handlePlateMove);
  }, [plates, debugLayout]);

  // Debug layout tree
  useEffect(() => {
    if (debugLayout) {
      console.log('\n🔍 Yoga Layout Debug Tree:');
      console.log('Root: flexDirection=column, width=100%, height=100%');
      console.log('├── Header: height=3, justifyContent=center');
      console.log('└── Grid: flexDirection=row, flexWrap=wrap');
      plates.forEach((plate, i) => {
        console.log(`    ${i === plates.length - 1 ? '└──' : '├──'} Plate[${i}]: ${plate.title} (${plate.w}x${plate.h})`);
      });
    }
  }, [debugLayout, plates]);

  return React.createElement(Box, {
    flexDirection: 'column',
    height: '100%'
  }, [
    // Neon header bar
    React.createElement(Box, {
      key: 'header',
      justifyContent: 'center',
      height: 3,
      borderStyle: 'single',
      borderColor: currentTheme.accent
    },
      React.createElement(Text, {
        bold: true,
        color: currentTheme.accent,
        backgroundColor: currentTheme.bg
      }, '✧ SUBMITIT RETRO DESKTOP ✧')
    ),

    // 2x2 Grid of Work Plates  
    React.createElement(Box, {
      key: 'grid',
      flexDirection: 'row',
      flexWrap: 'wrap',
      flexGrow: 1
    }, plates.map((plate, index) =>
      React.createElement(Box, {
        key: plate.id,
        width: '50%',
        height: '50%',
        padding: 1
      },
        createWindow({
          title: plate.title,
          width: plate.w,
          height: plate.h,
          focused: index === focus,
          dragged: index === dragIdx,
          theme,
          children: React.createElement(Box, {
            flexDirection: 'column'
          }, [
            React.createElement(Box, {
              key: 'icon-header',
              marginBottom: 1
            }, 
              createIconPlate({
                type: plate.icon,
                label: '',
                iconStyle: 'single',
                theme
              })
            ),
            React.createElement(Text, {
              key: 'content',
              color: currentTheme.text
            }, plate.content)
          ])
        })
      )
    )),

    // Status bar with controls
    React.createElement(Box, {
      key: 'status',
      justifyContent: 'space-between',
      borderStyle: 'single',
      borderColor: currentTheme.border,
      paddingX: 1
    }, [
      React.createElement(Text, {
        key: 'controls',
        color: currentTheme.text
      }, isDragging ? 
        chalk.hex(currentTheme.warning)('DRAG MODE: Use ←→ arrows, Enter to drop') :
        'Tab: focus • Space: pick up • ←→: move • Enter: drop'
      ),
      React.createElement(Text, {
        key: 'focus-indicator', 
        color: currentTheme.accent
      }, `Focus: ${focus + 1}/${plates.length}${isDragging ? ' (dragging)' : ''}`)
    ])
  ]);
}

export default createDesktop;