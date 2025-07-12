#!/usr/bin/env node

/**
 * Yoga Layout Demo - Showing actual Yoga flexbox calculations
 */

import React, { useState, useEffect } from 'react';
import { render, Box, Text } from 'ink';
import yoga from 'yoga-layout-prebuilt';
import chalk from 'chalk';

function YogaLayoutDemo() {
  const [layoutData, setLayoutData] = useState(null);
  const [currentDemo, setCurrentDemo] = useState(0);
  const [calculatedLayouts, setCalculatedLayouts] = useState({});

  // Calculate layouts using actual Yoga
  useEffect(() => {
    const demos = [
      calculateFlexDemo(),
      calculateGridDemo(),
      calculateCenterDemo(),
      calculateComplexDemo()
    ];
    
    setCalculatedLayouts(demos[currentDemo]);
  }, [currentDemo]);

  // Rotate through demos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDemo(d => (d + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  function calculateFlexDemo() {
    const root = yoga.Node.create();
    root.setWidth(60);
    root.setHeight(20);
    root.setFlexDirection(yoga.FLEX_DIRECTION_ROW);
    root.setPadding(yoga.EDGE_ALL, 2);

    const child1 = yoga.Node.create();
    child1.setFlexGrow(1);
    child1.setMargin(yoga.EDGE_RIGHT, 1);
    root.insertChild(child1, 0);

    const child2 = yoga.Node.create();
    child2.setFlexGrow(2);
    child2.setMargin(yoga.EDGE_LEFT, 1);
    root.insertChild(child2, 1);

    root.calculateLayout(60, 20, yoga.DIRECTION_LTR);

    const layout = {
      name: 'Flex Layout (1:2 ratio)',
      root: {
        width: root.getComputedWidth(),
        height: root.getComputedHeight(),
        left: root.getComputedLeft(),
        top: root.getComputedTop()
      },
      children: [
        {
          width: child1.getComputedWidth(),
          height: child1.getComputedHeight(),
          left: child1.getComputedLeft(),
          top: child1.getComputedTop(),
          color: 'cyan',
          label: 'Flex: 1'
        },
        {
          width: child2.getComputedWidth(),
          height: child2.getComputedHeight(),
          left: child2.getComputedLeft(),
          top: child2.getComputedTop(),
          color: 'green',
          label: 'Flex: 2'
        }
      ]
    };

    // Clean up
    root.free();
    
    return layout;
  }

  function calculateGridDemo() {
    const root = yoga.Node.create();
    root.setWidth(60);
    root.setHeight(20);
    root.setFlexDirection(yoga.FLEX_DIRECTION_ROW);
    root.setFlexWrap(yoga.WRAP_WRAP);
    root.setPadding(yoga.EDGE_ALL, 1);

    const boxes = [];
    for (let i = 0; i < 4; i++) {
      const child = yoga.Node.create();
      child.setWidth(28);
      child.setHeight(8);
      child.setMargin(yoga.EDGE_ALL, 1);
      root.insertChild(child, i);
      boxes.push(child);
    }

    root.calculateLayout(60, 20, yoga.DIRECTION_LTR);

    const layout = {
      name: '2x2 Grid Layout',
      root: {
        width: root.getComputedWidth(),
        height: root.getComputedHeight(),
        left: root.getComputedLeft(),
        top: root.getComputedTop()
      },
      children: boxes.map((box, i) => ({
        width: box.getComputedWidth(),
        height: box.getComputedHeight(),
        left: box.getComputedLeft(),
        top: box.getComputedTop(),
        color: ['cyan', 'green', 'yellow', 'magenta'][i],
        label: `Box ${i + 1}`
      }))
    };

    root.free();
    return layout;
  }

  function calculateCenterDemo() {
    const root = yoga.Node.create();
    root.setWidth(60);
    root.setHeight(20);
    root.setJustifyContent(yoga.JUSTIFY_CENTER);
    root.setAlignItems(yoga.ALIGN_CENTER);

    const center = yoga.Node.create();
    center.setWidth(30);
    center.setHeight(10);
    root.insertChild(center, 0);

    root.calculateLayout(60, 20, yoga.DIRECTION_LTR);

    const layout = {
      name: 'Centered Layout',
      root: {
        width: root.getComputedWidth(),
        height: root.getComputedHeight(),
        left: root.getComputedLeft(),
        top: root.getComputedTop()
      },
      children: [{
        width: center.getComputedWidth(),
        height: center.getComputedHeight(),
        left: center.getComputedLeft(),
        top: center.getComputedTop(),
        color: 'green',
        label: 'Centered'
      }]
    };

    root.free();
    return layout;
  }

  function calculateComplexDemo() {
    const root = yoga.Node.create();
    root.setWidth(60);
    root.setHeight(20);
    root.setFlexDirection(yoga.FLEX_DIRECTION_COLUMN);
    root.setPadding(yoga.EDGE_ALL, 1);

    // Header
    const header = yoga.Node.create();
    header.setHeight(3);
    header.setMarginBottom(1);
    root.insertChild(header, 0);

    // Main content with sidebar
    const main = yoga.Node.create();
    main.setFlexGrow(1);
    main.setFlexDirection(yoga.FLEX_DIRECTION_ROW);
    root.insertChild(main, 1);

    const sidebar = yoga.Node.create();
    sidebar.setWidth(15);
    sidebar.setMarginRight(1);
    main.insertChild(sidebar, 0);

    const content = yoga.Node.create();
    content.setFlexGrow(1);
    main.insertChild(content, 1);

    // Footer
    const footer = yoga.Node.create();
    footer.setHeight(3);
    footer.setMarginTop(1);
    root.insertChild(footer, 2);

    root.calculateLayout(60, 20, yoga.DIRECTION_LTR);

    const layout = {
      name: 'Complex App Layout',
      root: {
        width: root.getComputedWidth(),
        height: root.getComputedHeight(),
        left: root.getComputedLeft(),
        top: root.getComputedTop()
      },
      children: [
        {
          width: header.getComputedWidth(),
          height: header.getComputedHeight(),
          left: header.getComputedLeft(),
          top: header.getComputedTop(),
          color: 'cyan',
          label: 'Header'
        },
        {
          width: sidebar.getComputedWidth(),
          height: sidebar.getComputedHeight(),
          left: sidebar.getComputedLeft() + main.getComputedLeft(),
          top: sidebar.getComputedTop() + main.getComputedTop(),
          color: 'yellow',
          label: 'Sidebar'
        },
        {
          width: content.getComputedWidth(),
          height: content.getComputedHeight(),
          left: content.getComputedLeft() + main.getComputedLeft(),
          top: content.getComputedTop() + main.getComputedTop(),
          color: 'green',
          label: 'Content'
        },
        {
          width: footer.getComputedWidth(),
          height: footer.getComputedHeight(),
          left: footer.getComputedLeft(),
          top: footer.getComputedTop(),
          color: 'magenta',
          label: 'Footer'
        }
      ]
    };

    root.free();
    return layout;
  }

  if (!calculatedLayouts.children) {
    return React.createElement(Text, { color: 'cyan' }, 'Calculating Yoga layouts...');
  }

  return React.createElement(Box, { flexDirection: 'column' },
    // Title
    React.createElement(Box, { 
      borderStyle: 'double',
      borderColor: 'cyan',
      paddingX: 2,
      marginBottom: 1
    },
      React.createElement(Text, { bold: true, color: 'cyan' },
        '🧘 YOGA LAYOUT ENGINE DEMO'
      )
    ),

    // Current Demo Name
    React.createElement(Box, { marginBottom: 1 },
      React.createElement(Text, { color: 'green', bold: true },
        `Demo: ${calculatedLayouts.name}`
      )
    ),

    // Visual Layout
    React.createElement(Box, {
      width: calculatedLayouts.root.width,
      height: calculatedLayouts.root.height,
      borderStyle: 'single',
      borderColor: 'white',
      position: 'relative'
    },
      ...calculatedLayouts.children.map((child, i) => 
        React.createElement(Box, {
          key: i,
          position: 'absolute',
          left: child.left,
          top: child.top,
          width: child.width,
          height: child.height,
          borderStyle: 'single',
          borderColor: child.color,
          alignItems: 'center',
          justifyContent: 'center'
        },
          React.createElement(Text, { color: child.color, bold: true },
            child.label
          )
        )
      )
    ),

    // Layout Values
    React.createElement(Box, { marginTop: 1, flexDirection: 'column' },
      React.createElement(Text, { color: 'yellow', bold: true }, 'Calculated Values:'),
      ...calculatedLayouts.children.map((child, i) =>
        React.createElement(Text, { key: i, color: child.color },
          `${child.label}: x=${child.left}, y=${child.top}, w=${child.width}, h=${child.height}`
        )
      )
    ),

    // Info
    React.createElement(Box, { marginTop: 1 },
      React.createElement(Text, { color: 'gray' },
        'This demonstrates real Yoga flexbox calculations. Demo rotates every 3 seconds.'
      )
    )
  );
}

console.log(chalk.cyan('\n🧘 Starting Yoga Layout Engine Demo...\n'));
const { waitUntilExit } = render(React.createElement(YogaLayoutDemo));
waitUntilExit();