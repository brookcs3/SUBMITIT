/**
 * ASCII-Safe Retro Icons for Terminal UI
 */

// ASCII art icons (3x3 style)
export const asciiIcons = {
  folder: '┌─┐\n│█│\n└─┘',
  file:   '┌─┐\n│░│\n└─┘', 
  image:  '┌╥┐\n│◖│\n└╨┘',
  music:  ' ♪ \n ♪ \n ♪ ',
  code:   '{ }\n <> \n{ }',
  video:  '▟▙\n ▶ \n▜▛',
  zip:    '╔═╗\n║█║\n╚═╝'
};

// Single character fallbacks
export const singleCharIcons = {
  folder: '▣',
  file: '▢', 
  image: '▤',
  music: '♫',
  code: '</>',
  video: '▶',
  zip: '⌾'
};

// Emoji fallbacks
export const emojiIcons = {
  folder: '📁',
  file: '📄',
  image: '🖼️', 
  music: '🎵',
  code: '💻',
  video: '🎬',
  zip: '📦'
};

export const getIcon = (type, style = 'ascii') => {
  switch (style) {
    case 'single': return singleCharIcons[type] || '■';
    case 'emoji': return emojiIcons[type] || '📄';
    case 'ascii':
    default: return asciiIcons[type] || asciiIcons.file;
  }
};