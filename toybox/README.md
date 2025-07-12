# 🧰 Toybox

Beautiful terminal tools and effects for submitit.

## Tools

### Terminal Text Effects (TTE)
Beautiful animations for CLI output using `terminaltexteffects`.

```bash
# Install TTE
pip install terminaltexteffects

# Use in submitit
node toybox/terminal-effects.js submit
node toybox/terminal-effects.js workplates  
node toybox/terminal-effects.js export
node toybox/terminal-effects.js yoga

# Custom effects
node toybox/terminal-effects.js slide "Hello World"
node toybox/terminal-effects.js matrix "Calculating layout..."
node toybox/terminal-effects.js decrypt "Loading project..."
node toybox/terminal-effects.js fireworks "Export complete!"

# List all effects
node toybox/terminal-effects.js list
```

### Effects Available
- `slide` - Text slides in from side
- `wipe` - Text wipes across screen  
- `decrypt` - Matrix-style decryption
- `matrix` - Green matrix rain
- `rain` - Falling character rain
- `fireworks` - Celebration fireworks
- `stars` - Twinkling stars
- `wave` - Wave motion
- `beams` - Light beams
- `orbittingvolley` - Orbiting projectiles
- `middleout` - Text appears from center

## Integration with Submitit

The TerminalEffects class can be imported and used in any submitit component:

```javascript
import { TerminalEffects } from '../toybox/terminal-effects.js';

const effects = new TerminalEffects();
await effects.submitAnimation();
await effects.workPlatesIntro();
await effects.exportComplete();
```

## Future Toybox Tools

- ASCII art generators
- Progress bar animations
- Sound effects (if terminal supports)
- Color palette tools
- Terminal dimension detection
- Custom font rendering
- Terminal recording/playback