/**
 * IconPlate Component - Non-JSX Node.js compatible
 */
import React from 'react';
import { Box, Text } from 'ink';
import chalk from 'chalk';
import { getCurrentTheme } from './theme.js';
import { getIcon } from './icons.js';

export function createIconPlate({
  type = 'file',
  label = 'Unknown',
  iconStyle = 'single',
  theme = 'neon'
}) {
  const currentTheme = getCurrentTheme(theme);
  const icon = getIcon(type, iconStyle);
  
  return React.createElement(Box, {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 4
  }, [
    React.createElement(Text, {
      key: 'icon',
      color: currentTheme.text
    }, icon),
    
    React.createElement(Text, {
      key: 'label',
      color: currentTheme.text
    }, label)
  ]);
}

export default createIconPlate;