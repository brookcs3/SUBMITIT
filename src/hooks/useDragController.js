/**
 * Drag Controller Hook - Node.js compatible
 */
import { useState } from 'react';
import { useInput } from 'ink';

export function useDragController(totalWindows) {
  const [focus, setFocus] = useState(0);
  const [dragIdx, setDragIdx] = useState(null);

  useInput((input, key) => {
    // Tab to cycle focus
    if (key.tab) {
      setFocus((f) => (f + 1) % totalWindows);
      return;
    }

    // Space to pick up/drop
    if (input === ' ') {
      setDragIdx(dragIdx === null ? focus : null);
      return;
    }

    // Arrow keys to move focus (when dragging)
    if (dragIdx !== null) {
      if (key.leftArrow || key.upArrow) {
        setFocus(Math.max(0, focus - 1));
      } else if (key.rightArrow || key.downArrow) {
        setFocus(Math.min(totalWindows - 1, focus + 1));
      }
    }

    // Enter to drop
    if (key.return && dragIdx !== null) {
      // Emit drop event
      process.emit('plateMoved', { from: dragIdx, to: focus });
      setDragIdx(null);
    }
  });

  return { focus, dragIdx, isDragging: dragIdx !== null };
}

export default useDragController;