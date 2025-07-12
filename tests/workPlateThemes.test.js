/**
 * Work Plate Theme Snapshot Tests
 */
import React from 'react';
import { render } from 'ink-testing-library';
import createWorkPlate from '../src/ui/workPlate.js';

describe('Work Plate Themes', () => {
  const testContent = 'Sample content\nfor testing\ntheme rendering';
  
  test('NOIR theme snapshot', () => {
    const { lastFrame } = render(
      createWorkPlate({
        title: 'Noir Plate',
        content: testContent,
        theme: 'noir',
        isActive: false
      })
    );
    
    expect(lastFrame()).toMatchSnapshot();
    
    // Verify noir characteristics
    expect(lastFrame()).toContain('Noir Plate');
    expect(lastFrame()).toContain('Sample content');
  });
  
  test('EXPRESSIVE theme snapshot', () => {
    const { lastFrame } = render(
      createWorkPlate({
        title: 'Express Plate',
        content: testContent,
        theme: 'expressive',
        isActive: true
      })
    );
    
    expect(lastFrame()).toMatchSnapshot();
    
    // Verify expressive characteristics  
    expect(lastFrame()).toContain('Express Plate');
    expect(lastFrame()).toContain('●'); // Active indicator
  });
  
  test('ACADEMIC theme snapshot', () => {
    const { lastFrame } = render(
      createWorkPlate({
        title: 'Academic Plate',
        content: testContent,
        theme: 'academic',
        isActive: false
      })
    );
    
    expect(lastFrame()).toMatchSnapshot();
    
    // Verify academic characteristics
    expect(lastFrame()).toContain('Academic Plate');
    expect(lastFrame()).toContain('○'); // Inactive indicator
  });
  
  test('Theme switching works correctly', () => {
    const themes = ['default', 'noir', 'expressive', 'academic'];
    
    themes.forEach(theme => {
      const { lastFrame } = render(
        createWorkPlate({
          title: `${theme} Theme`,
          content: 'Theme test content',
          theme: theme,
          isActive: false
        })
      );
      
      expect(lastFrame()).toContain(`${theme} Theme`);
      expect(lastFrame()).toContain('Theme test content');
    });
  });
  
  test('Active state changes border color', () => {
    // Inactive plate
    const { lastFrame: inactiveFrame } = render(
      createWorkPlate({
        title: 'Test Plate',
        content: 'Test content',
        theme: 'default',
        isActive: false
      })
    );
    
    // Active plate
    const { lastFrame: activeFrame } = render(
      createWorkPlate({
        title: 'Test Plate',
        content: 'Test content',
        theme: 'default',
        isActive: true
      })
    );
    
    // Frames should be different due to border color change
    expect(activeFrame()).not.toBe(inactiveFrame());
    expect(activeFrame()).toContain('●');
    expect(inactiveFrame()).toContain('○');
  });
});