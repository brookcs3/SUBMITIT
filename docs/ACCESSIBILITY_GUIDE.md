# Submitit Accessibility Guide

## Overview

Submitit includes comprehensive accessibility features to ensure the CLI is usable by everyone, including users with visual impairments who rely on screen readers.

## Accessibility Features

### 🎯 Screen Reader Compatibility
- **Semantic markup**: All interactive elements have proper roles and labels
- **Status announcements**: Important changes are announced to screen readers
- **Progress narration**: Long operations provide audio progress updates
- **Error descriptions**: Validation errors include context and suggestions

### ⌨️ Keyboard Navigation
- **Arrow keys**: Navigate within sections and menus
- **Tab**: Move between major sections and form fields
- **Enter**: Select/activate items
- **Escape**: Go back or cancel operations
- **Space**: Mark/select items in lists

### 🎨 Visual Accessibility
- **High contrast mode**: Enhanced visibility for low vision users
- **Focus indicators**: Clear visual indicators for keyboard navigation
- **Consistent patterns**: Predictable interface behavior
- **Scalable text**: Respects terminal font size settings

### 🔊 Audio Feedback
- **Status announcements**: Real-time updates on operations
- **Error alerts**: Immediate notification of problems
- **Success confirmations**: Celebration of completed tasks
- **Navigation hints**: Contextual help for current interface

## Getting Started

### Enabling Accessibility Features

Set environment variables to enable accessibility features:

```bash
# Enable screen reader mode
export SCREEN_READER=true

# Enable high contrast mode
export HIGH_CONTRAST=true

# Start submitit with accessibility features
npm run dev
```

### Keyboard Shortcuts

#### Global Shortcuts
- `Ctrl+H`: Show accessibility help
- `Ctrl+Shift+A`: Toggle announcements
- `Ctrl+Shift+C`: Toggle high contrast mode
- `Ctrl+Shift+N`: Get navigation help for current context
- `?`: Show context-specific help

#### Landmark Navigation
- `Alt+1`: Jump to main content area
- `Alt+2`: Jump to navigation menu
- `Alt+3`: Jump to sidebar/file explorer
- `Alt+4`: Jump to status/footer area

### Screen Reader Usage

#### NVDA (Windows)
1. Start NVDA
2. Open terminal with submitit
3. Use arrow keys to navigate
4. NVDA will automatically read element labels and states

#### JAWS (Windows)
1. Start JAWS
2. Open command prompt or terminal
3. Launch submitit
4. Use standard JAWS navigation commands
5. Use virtual cursor for reviewing content

#### VoiceOver (macOS)
1. Enable VoiceOver (Cmd+F5)
2. Open Terminal app
3. Start submitit
4. Use VoiceOver navigation (Control+Option+Arrow keys)
5. Use VO+Space to interact with elements

#### Orca (Linux)
1. Start Orca
2. Open terminal application
3. Launch submitit
4. Use Orca's terminal reading features
5. Navigate with arrow keys and Orca commands

## Interface Components

### Menu Navigation
```
Menu: File Operations (3 items)
▶ Add Files (interactive)
  Preview Project
  Export Package

Navigation: Use Up/Down arrows, Enter to select, Escape to cancel
```

**Screen reader announces**: "Menu opened: File Operations. 3 items available. Currently on item 1 of 3: Add Files"

### File Explorer
```
📁 Project Files (folder, collapsed)
📄 README.md (file, 2.5KB)
🟨 script.js (file, 15.2KB)
📦 package.json (file, 1.8KB)
```

**Screen reader announces**: "File explorer opened: Project Files. 4 items available. Item 1 of 4: Project Files folder, collapsed"

### Progress Indicators
```
Building Project: 67% ████████████████░░░░░░░░
Status: Analyzing file structure...
Progress: 67% complete for Building Project
```

**Screen reader announces**: "Progress: 67% complete for Building Project. Status: Analyzing file structure"

### Status Messages
```
✅ Success: Project exported successfully
Details:
• 15 files processed
• Archive created: project.zip (2.4MB)
• Export completed in 3.2 seconds
```

**Screen reader announces**: "Success: Project exported successfully. Details: 15 files processed, Archive created: project.zip 2.4MB, Export completed in 3.2 seconds"

## Developer Guide

### Using Accessible Components

Replace standard Ink components with accessible versions:

```javascript
// Instead of regular Menu
import { AccessibleMenu } from '../components/AccessibleInkComponents.js';

const MyMenu = () => (
  <AccessibleMenu
    title="Main Menu"
    items={[
      { label: 'Add Files', action: 'add' },
      { label: 'Preview', action: 'preview' },
      { label: 'Export', action: 'export' }
    ]}
    onSelect={(item) => handleMenuSelect(item)}
  />
);
```

### Adding Accessibility to Custom Components

```javascript
import { useAccessibility } from '../lib/AccessibilityManager.js';

const MyComponent = ({ title, items }) => {
  const { createLabel, announce, setFocus } = useAccessibility('myComponent', {
    role: 'region',
    label: title
  });

  useEffect(() => {
    // Register component with accessibility manager
    announce(`${title} loaded with ${items.length} items`, 'normal');
  }, [items.length]);

  const handleItemSelect = (item) => {
    announce(`Selected: ${item.name}`, 'normal');
    // Handle selection
  };

  return (
    <Box>
      <Text>{createLabel(title, { role: 'heading', level: 2 })}</Text>
      {items.map((item, index) => (
        <Text key={index}>{item.name}</Text>
      ))}
    </Box>
  );
};
```

### Accessibility Manager API

```javascript
import AccessibilityManager from '../lib/AccessibilityManager.js';

const manager = new AccessibilityManager({
  announceChanges: true,
  screenReaderMode: true,
  highContrast: false
});

// Register semantic elements
manager.registerElement('navbar', {
  role: 'navigation',
  label: 'Main Navigation',
  type: 'landmark'
});

// Make announcements
manager.announce('File uploaded successfully', 'normal');
manager.announceError('Invalid file format', 'file upload', ['Use .zip or .tar format']);
manager.announceSuccess('Export completed', '25 files packaged');

// Progress updates
manager.announceProgress(75, 100, 'file processing');

// Focus management
manager.setFocus('menu-item-2', { label: 'Export Project', index: 2 });
```

## Testing Accessibility

### Automated Testing

Use the built-in accessibility validation:

```bash
# Run accessibility tests
npm run test:accessibility

# Check for accessibility issues
npm run audit:accessibility
```

### Manual Testing

#### Without Screen Reader
1. Navigate using only keyboard (no mouse)
2. Check focus indicators are visible
3. Verify all interactive elements are reachable
4. Test with high contrast mode enabled

#### With Screen Reader
1. Enable screen reader before starting submitit
2. Navigate through all interface sections
3. Verify announcements are clear and helpful
4. Test error scenarios and recovery

### Screen Reader Test Checklist

- [ ] All interactive elements have proper labels
- [ ] Status changes are announced appropriately
- [ ] Error messages include context and suggestions
- [ ] Progress updates are narrated clearly
- [ ] Menu navigation is logical and predictable
- [ ] Form fields have proper labels and validation
- [ ] Keyboard shortcuts work as documented
- [ ] Help system is accessible and comprehensive

## Common Issues and Solutions

### Screen Reader Not Announcing Changes
**Problem**: Status updates aren't being read
**Solution**: 
1. Check that `SCREEN_READER=true` is set
2. Verify screen reader is properly configured for terminal apps
3. Try toggling announcements with `Ctrl+Shift+A`

### Navigation Confusion
**Problem**: User gets lost in interface
**Solution**:
1. Use landmark navigation (`Alt+1-4`)
2. Press `?` for context-specific help
3. Press `Ctrl+Shift+N` for navigation guidance

### Focus Not Visible
**Problem**: Can't see which element is selected
**Solution**:
1. Enable high contrast mode (`Ctrl+Shift+C`)
2. Check terminal color settings
3. Verify font size is appropriate

### Keyboard Shortcuts Not Working
**Problem**: Accessibility shortcuts don't respond
**Solution**:
1. Check for conflicting terminal shortcuts
2. Verify focus is on submitit interface
3. Try using alternative navigation (arrow keys)

## Best Practices

### For Users
- Learn the keyboard shortcuts for faster navigation
- Use context help (`?`) when unsure about available actions
- Enable high contrast mode for better visibility
- Take advantage of status announcements for long operations

### For Developers
- Always provide meaningful labels for interactive elements
- Include context in error messages and suggestions for resolution
- Test with screen readers during development
- Follow semantic markup principles even in terminal interfaces
- Announce important state changes to users

## Resources

### Screen Reader Software
- [NVDA](https://www.nvaccess.org/) (Windows, Free)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Windows, Commercial)
- [VoiceOver](https://www.apple.com/accessibility/vision/) (macOS, Built-in)
- [Orca](https://wiki.gnome.org/Projects/Orca) (Linux, Free)

### Accessibility Guidelines
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Section 508](https://www.section508.gov/)
- [A11y Project](https://www.a11yproject.com/)

### Terminal Accessibility
- [Terminal Accessibility Best Practices](https://www.accessibility-developer-guide.com/)
- [Screen Reader Testing Guide](https://webaim.org/articles/screenreader_testing/)

---

*Submitit is committed to providing an accessible experience for all users. If you encounter accessibility issues, please [report them](https://github.com/submitit/submitit/issues) so we can improve.*