# File Staging Module

## Overview
The File Staging Module is a core component of the Submitit CLI that provides an interactive interface for selecting, previewing, and validating files before submission. It offers a user-friendly way to ensure all required files are included and meet submission requirements.

## Features

- **Interactive File Browser**: Navigate through directories and select files for submission
- **File Previews**: View contents of text-based files directly in the terminal
- **Validation**: Automatic validation of file types, sizes, and naming conventions
- **Neon-UI Integration**: Consistent with Submitit's retro-futuristic terminal aesthetic
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Real-time Feedback**: Immediate validation and status updates

## Architecture

The module is built using:

- **React/Ink**: For building interactive CLI interfaces
- **TypeScript**: For type safety and better developer experience
- **Yoga/Flexbox**: For layout management
- **File System API**: For file operations

### Core Components

1. **FileExplorer**: Displays directory contents and handles navigation
2. **PreviewPanel**: Shows file previews with syntax highlighting
3. **ValidationPanel**: Displays validation errors and warnings
4. **StatusBar**: Shows current status and available actions

### Hooks

- **useFileOperations**: Handles file system operations
- **useValidation**: Manages file validation rules
- **usePreview**: Generates file previews

## Usage

### CLI Command

```bash
# Basic usage
submitit stage

# Specify directory
submitit stage ./path/to/directory

# Customize file size and extensions
submitit stage --max-size 20 --extensions pdf,docx,txt

# Recursive directory scanning
submitit stage --recursive
```

### Options

- `--max-size <size>`: Maximum file size in MB (default: 10)
- `--extensions <list>`: Comma-separated list of allowed file extensions
- `--recursive`: Include files in subdirectories
- `--no-validate`: Skip validation (not recommended)

## Validation Rules

The module enforces the following validation rules:

1. **File Size**: Files must be under the specified maximum size
2. **Extensions**: Only files with allowed extensions can be selected
3. **Naming**: Filenames must match the pattern `[a-zA-Z0-9\-_\.]+\.\w+`
4. **Required Files**: Certain files (e.g., `README.md`) can be marked as required

## Testing

Run the test suite with:

```bash
npm run test:staging
```

Or run the interactive test script:

```bash
node scripts/test-staging.js
```

## Error Handling

The module provides clear error messages for:
- Permission denied errors
- File not found errors
- Validation failures
- Maximum file size exceeded
- Unsupported file types

## Accessibility

- Full keyboard navigation
- Screen reader support
- High contrast mode
- Clear visual feedback

## Performance

- Lazy loading of file previews
- Caching of file metadata
- Efficient directory scanning
- Background validation

## Dependencies

- `ink`: React for CLIs
- `react`: UI library
- `yoga-layout`: Flexbox layout engine
- `chalk`: Terminal styling
- `fs-extra`: File system operations
- `fast-glob`: File pattern matching

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

MIT
