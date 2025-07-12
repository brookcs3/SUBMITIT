/**
 * Submitit Work Plates App - 2x2 Grid Layout
 */
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import createWorkPlate from './workPlate.js';
import yoga from 'yoga-layout';

export default function App({ debugLayout = false }) {
  const [activeplate, setActivePlate] = useState(0);
  const [plates, setPlates] = useState([
    { title: 'Project Overview', content: 'Welcome to Submitit\nYour project dashboard', theme: 'default' },
    { title: 'Files', content: 'bio.md\nprojects.md\ncontact.md', theme: 'academic' },
    { title: 'Build Status', content: 'Building...\n[2/3] Processing files', theme: 'expressive' },
    { title: 'Output', content: 'Ready for export\n✓ All validations passed', theme: 'noir' }
  ]);

  useInput((input, key) => {
    if (key.leftArrow && activeplate > 0) {
      setActivePlate(activeplate - 1);
    } else if (key.rightArrow && activeplate < 3) {
      setActivePlate(activeplate + 1);
    }
  });

  // Debug Yoga layout tree
  useEffect(() => {
    if (debugLayout) {
      console.log('\n🔍 Yoga Layout Debug:');
      console.log('Root: flexDirection=column, width=100%, height=100%');
      console.log('├── Header: height=3, justifyContent=center');
      console.log('└── Grid: flexDirection=row, flexWrap=wrap');
      console.log('    ├── Plate[0]: width=50%, height=50%');
      console.log('    ├── Plate[1]: width=50%, height=50%');
      console.log('    ├── Plate[2]: width=50%, height=50%');
      console.log('    └── Plate[3]: width=50%, height=50%');
    }
  }, [debugLayout]);

  return React.createElement(Box, { flexDirection: "column", height: "100%" },
    // Top bar
    React.createElement(Box, { 
      justifyContent: "center", 
      height: 3,
      borderStyle: "single",
      borderColor: "cyan"
    },
      React.createElement(Text, { bold: true, color: "cyan", backgroundColor: "black" },
        "Submitit Work Plates"
      )
    ),

    // 2x2 Grid using Yoga layout
    React.createElement(Box, { flexDirection: "row", flexWrap: "wrap", flexGrow: 1 },
      plates.map((plate, index) => 
        React.createElement(Box, { key: index, width: "50%", height: "50%" },
          createWorkPlate({
            title: plate.title,
            content: plate.content,
            theme: plate.theme,
            isActive: index === activeplate,
            width: 35,
            height: 10
          })
        )
      )
    ),

    // Status bar
    React.createElement(Box, { justifyContent: "space-between", borderStyle: "single", borderColor: "gray" },
      React.createElement(Text, { color: "gray" },
        "Use ← → to navigate plates"
      ),
      React.createElement(Text, { color: "gray" },
        `Active: ${activeplate + 1}/4`
      )
    )
  );
}