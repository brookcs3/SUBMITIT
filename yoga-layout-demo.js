#!/usr/bin/env node

/**
 * Yoga Layout Demo - Showing actual Yoga flexbox calculations
 * with visual representation using Ink's constraints
 */

import React, { useState, useEffect } from 'react';
import { render, Box, Text, Spacer } from 'ink';
import { loadYoga } from 'yoga-layout/load';
import chalk from 'chalk';

// Load Yoga once
let Yoga = null;
const initYoga = async () => {
  if (!Yoga) {
    Yoga = await loadYoga();
  }
  return Yoga;
};

function YogaLayoutDemo() {
  const [currentDemo, setCurrentDemo] = useState(0);
  const [yogaCalculations, setYogaCalculations] = useState(null);
  const [yogaReady, setYogaReady] = useState(false);

  // Initialize Yoga
  useEffect(() => {
    initYoga().then(() => setYogaReady(true));
  }, []);

  // Rotate through demos
  useEffect(() => {
    if (yogaReady) {
      const timer = setInterval(() => {
        setCurrentDemo(d => (d + 1) % 4);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [yogaReady]);

  // Calculate layouts when demo changes
  useEffect(() => {
    if (yogaReady) {
      const calculations = performYogaCalculations(currentDemo);
      setYogaCalculations(calculations);
    }
  }, [currentDemo, yogaReady]);

  function performYogaCalculations(demoIndex) {
    const demos = [
      flexRowDemo,
      gridDemo,
      centerAlignDemo,
      complexLayoutDemo
    ];
    
    return demos[demoIndex]();
  }

  function flexRowDemo() {
    const root = Yoga.Node.create();
    root.setWidth(60);
    root.setHeight(10);
    root.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
    root.setPadding(Yoga.EDGE_ALL, 1);

    const child1 = Yoga.Node.create();
    child1.setFlexGrow(1);
    child1.setMargin(Yoga.EDGE_RIGHT, 1);
    root.insertChild(child1, 0);

    const child2 = Yoga.Node.create();
    child2.setFlexGrow(2);
    child2.setMargin(Yoga.EDGE_HORIZONTAL, 1);
    root.insertChild(child2, 1);

    const child3 = Yoga.Node.create();
    child3.setFlexGrow(1);
    child3.setMargin(Yoga.EDGE_LEFT, 1);
    root.insertChild(child3, 2);

    root.calculateLayout(60, 10, Yoga.DIRECTION_LTR);

    const result = {
      name: 'Flex Row (1:2:1 ratio)',
      description: 'Three boxes with flexGrow 1, 2, and 1',
      calculations: [
        {
          label: 'Root',
          width: root.getComputedWidth(),
          height: root.getComputedHeight(),
          padding: root.getComputedPadding(Yoga.EDGE_ALL)
        },
        {
          label: 'Box 1 (flex: 1)',
          width: child1.getComputedWidth(),
          height: child1.getComputedHeight(),
          left: child1.getComputedLeft(),
          color: 'cyan'
        },
        {
          label: 'Box 2 (flex: 2)',
          width: child2.getComputedWidth(),
          height: child2.getComputedHeight(),
          left: child2.getComputedLeft(),
          color: 'green'
        },
        {
          label: 'Box 3 (flex: 1)',
          width: child3.getComputedWidth(),
          height: child3.getComputedHeight(),
          left: child3.getComputedLeft(),
          color: 'yellow'
        }
      ],
      visual: {
        boxes: [
          { flex: 1, color: 'cyan', label: '1' },
          { flex: 2, color: 'green', label: '2' },
          { flex: 1, color: 'yellow', label: '1' }
        ]
      }
    };

    // Clean up
    child1.free();
    child2.free();
    child3.free();
    root.free();
    
    return result;
  }

  function gridDemo() {
    const root = Yoga.Node.create();
    root.setWidth(60);
    root.setHeight(12);
    root.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
    root.setFlexWrap(Yoga.WRAP_WRAP);
    root.setPadding(Yoga.EDGE_ALL, 1);

    const boxes = [];
    for (let i = 0; i < 4; i++) {
      const child = Yoga.Node.create();
      child.setWidth(28);
      child.setHeight(5);
      child.setMargin(Yoga.EDGE_ALL, 0.5);
      root.insertChild(child, i);
      boxes.push(child);
    }

    root.calculateLayout(60, 12, Yoga.DIRECTION_LTR);

    const result = {
      name: '2x2 Grid Layout',
      description: 'Four boxes with fixed dimensions, wrapped',
      calculations: boxes.map((box, i) => ({
        label: `Box ${i + 1}`,
        width: box.getComputedWidth(),
        height: box.getComputedHeight(),
        left: box.getComputedLeft(),
        top: box.getComputedTop(),
        color: ['cyan', 'green', 'yellow', 'magenta'][i]
      })),
      visual: {
        grid: true,
        boxes: [
          { color: 'cyan', label: '1' },
          { color: 'green', label: '2' },
          { color: 'yellow', label: '3' },
          { color: 'magenta', label: '4' }
        ]
      }
    };

    // Clean up
    boxes.forEach(box => box.free());
    root.free();
    
    return result;
  }

  function centerAlignDemo() {
    const root = Yoga.Node.create();
    root.setWidth(60);
    root.setHeight(10);
    root.setJustifyContent(Yoga.JUSTIFY_CENTER);
    root.setAlignItems(Yoga.ALIGN_CENTER);

    const child = Yoga.Node.create();
    child.setWidth(20);
    child.setHeight(4);
    root.insertChild(child, 0);

    root.calculateLayout(60, 10, Yoga.DIRECTION_LTR);

    const result = {
      name: 'Center Alignment',
      description: 'Box centered using justifyContent and alignItems',
      calculations: [
        {
          label: 'Centered Box',
          width: child.getComputedWidth(),
          height: child.getComputedHeight(),
          left: child.getComputedLeft(),
          top: child.getComputedTop(),
          color: 'green'
        }
      ],
      visual: {
        center: true,
        box: { color: 'green', label: 'CENTER' }
      }
    };

    child.free();
    root.free();
    return result;
  }

  function complexLayoutDemo() {
    const root = Yoga.Node.create();
    root.setWidth(60);
    root.setHeight(12);
    root.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);
    root.setPadding(Yoga.EDGE_ALL, 1);

    // Header
    const header = Yoga.Node.create();
    header.setHeight(2);
    header.setMarginBottom(1);
    root.insertChild(header, 0);

    // Main (with sidebar)
    const main = Yoga.Node.create();
    main.setFlexGrow(1);
    main.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
    root.insertChild(main, 1);

    const sidebar = Yoga.Node.create();
    sidebar.setWidth(15);
    sidebar.setMarginRight(1);
    main.insertChild(sidebar, 0);

    const content = Yoga.Node.create();
    content.setFlexGrow(1);
    main.insertChild(content, 1);

    // Footer
    const footer = Yoga.Node.create();
    footer.setHeight(2);
    footer.setMarginTop(1);
    root.insertChild(footer, 2);

    root.calculateLayout(60, 12, Yoga.DIRECTION_LTR);

    const result = {
      name: 'App Layout',
      description: 'Header, Sidebar, Content, Footer',
      calculations: [
        {
          label: 'Header',
          width: header.getComputedWidth(),
          height: header.getComputedHeight(),
          color: 'cyan'
        },
        {
          label: 'Sidebar',
          width: sidebar.getComputedWidth(),
          height: main.getComputedHeight(),
          color: 'yellow'
        },
        {
          label: 'Content',
          width: content.getComputedWidth(),
          height: main.getComputedHeight(),
          color: 'green'
        },
        {
          label: 'Footer',
          width: footer.getComputedWidth(),
          height: footer.getComputedHeight(),
          color: 'magenta'
        }
      ],
      visual: {
        app: true
      }
    };

    // Clean up
    sidebar.free();
    content.free();
    main.free();
    header.free();
    footer.free();
    root.free();
    
    return result;
  }

  if (!yogaReady) {
    return React.createElement(Text, { color: 'cyan' }, 'Loading Yoga Layout Engine...');
  }

  if (!yogaCalculations) {
    return React.createElement(Text, { color: 'cyan' }, 'Initializing Yoga calculations...');
  }

  return React.createElement(Box, { flexDirection: 'column' },
    // Header
    React.createElement(Box, { 
      borderStyle: 'double',
      borderColor: 'cyan',
      paddingX: 2,
      marginBottom: 1
    },
      React.createElement(Text, { bold: true, color: 'cyan' },
        '🧘 YOGA LAYOUT ENGINE - REAL CALCULATIONS'
      )
    ),

    // Demo Info
    React.createElement(Box, { flexDirection: 'column', marginBottom: 1 },
      React.createElement(Text, { color: 'green', bold: true },
        `Demo: ${yogaCalculations.name}`
      ),
      React.createElement(Text, { color: 'gray' },
        yogaCalculations.description
      )
    ),

    // Visual Representation
    React.createElement(Box, { marginBottom: 1 },
      React.createElement(VisualLayout, { data: yogaCalculations })
    ),

    // Calculated Values
    React.createElement(Box, { 
      borderStyle: 'single',
      borderColor: 'gray',
      padding: 1,
      flexDirection: 'column'
    },
      React.createElement(Text, { color: 'yellow', bold: true },
        'Yoga Calculated Values:'
      ),
      ...yogaCalculations.calculations.map((calc, i) =>
        React.createElement(Text, { key: i, color: calc.color || 'white' },
          `${calc.label}: width=${Math.round(calc.width)}, height=${Math.round(calc.height)}${
            calc.left !== undefined ? `, x=${Math.round(calc.left)}` : ''
          }${calc.top !== undefined ? `, y=${Math.round(calc.top)}` : ''}`
        )
      )
    ),

    // Footer
    React.createElement(Box, { marginTop: 1 },
      React.createElement(Text, { color: 'gray' },
        'Using yoga-layout for real flexbox calculations. Next demo in 4s...'
      )
    )
  );
}

// Visual representation component
function VisualLayout({ data }) {
  const { visual } = data;

  if (visual.boxes) {
    // Flex row visualization
    return React.createElement(Box, {
      borderStyle: 'single',
      borderColor: 'white',
      height: 6,
      padding: 1
    },
      ...visual.boxes.map((box, i) =>
        React.createElement(Box, {
          key: i,
          borderStyle: 'single',
          borderColor: box.color,
          flexGrow: box.flex || 1,
          height: 4,
          alignItems: 'center',
          justifyContent: 'center',
          marginX: i > 0 ? 1 : 0
        },
          React.createElement(Text, { color: box.color, bold: true },
            box.label
          )
        )
      )
    );
  }

  if (visual.grid) {
    // Grid visualization
    return React.createElement(Box, {
      borderStyle: 'single',
      borderColor: 'white',
      flexDirection: 'column',
      padding: 1
    },
      React.createElement(Box, { flexDirection: 'row' },
        React.createElement(Box, {
          borderStyle: 'single',
          borderColor: visual.boxes[0].color,
          width: 28,
          height: 3,
          alignItems: 'center',
          justifyContent: 'center'
        },
          React.createElement(Text, { color: visual.boxes[0].color }, '1')
        ),
        React.createElement(Box, {
          borderStyle: 'single',
          borderColor: visual.boxes[1].color,
          width: 28,
          height: 3,
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 1
        },
          React.createElement(Text, { color: visual.boxes[1].color }, '2')
        )
      ),
      React.createElement(Box, { flexDirection: 'row', marginTop: 1 },
        React.createElement(Box, {
          borderStyle: 'single',
          borderColor: visual.boxes[2].color,
          width: 28,
          height: 3,
          alignItems: 'center',
          justifyContent: 'center'
        },
          React.createElement(Text, { color: visual.boxes[2].color }, '3')
        ),
        React.createElement(Box, {
          borderStyle: 'single',
          borderColor: visual.boxes[3].color,
          width: 28,
          height: 3,
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 1
        },
          React.createElement(Text, { color: visual.boxes[3].color }, '4')
        )
      )
    );
  }

  if (visual.center) {
    // Center visualization
    return React.createElement(Box, {
      borderStyle: 'single',
      borderColor: 'white',
      width: 60,
      height: 8,
      alignItems: 'center',
      justifyContent: 'center'
    },
      React.createElement(Box, {
        borderStyle: 'double',
        borderColor: visual.box.color,
        padding: 1
      },
        React.createElement(Text, { color: visual.box.color, bold: true },
          visual.box.label
        )
      )
    );
  }

  if (visual.app) {
    // App layout visualization
    return React.createElement(Box, {
      borderStyle: 'single',
      borderColor: 'white',
      flexDirection: 'column',
      height: 12,
      padding: 1
    },
      // Header
      React.createElement(Box, {
        borderStyle: 'single',
        borderColor: 'cyan',
        height: 2,
        alignItems: 'center',
        justifyContent: 'center'
      },
        React.createElement(Text, { color: 'cyan' }, 'Header')
      ),
      // Main area
      React.createElement(Box, { flexDirection: 'row', flexGrow: 1, marginY: 1 },
        React.createElement(Box, {
          borderStyle: 'single',
          borderColor: 'yellow',
          width: 15,
          alignItems: 'center',
          justifyContent: 'center'
        },
          React.createElement(Text, { color: 'yellow' }, 'Sidebar')
        ),
        React.createElement(Box, {
          borderStyle: 'single',
          borderColor: 'green',
          flexGrow: 1,
          marginLeft: 1,
          alignItems: 'center',
          justifyContent: 'center'
        },
          React.createElement(Text, { color: 'green' }, 'Content')
        )
      ),
      // Footer
      React.createElement(Box, {
        borderStyle: 'single',
        borderColor: 'magenta',
        height: 2,
        alignItems: 'center',
        justifyContent: 'center'
      },
        React.createElement(Text, { color: 'magenta' }, 'Footer')
      )
    );
  }

  return null;
}

console.log(chalk.cyan('\n🧘 Starting Yoga Layout Engine Demo...\n'));
console.log(chalk.gray('This demo shows REAL Yoga flexbox calculations, not simulations.\n'));
const { waitUntilExit } = render(React.createElement(YogaLayoutDemo));
waitUntilExit();