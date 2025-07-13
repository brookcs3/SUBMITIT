# ✨ submitit

> Transform deliverable packaging into a polished, intentional ritual

`submitit` is a CLI tool that elevates the mundane task of packaging deliverables into a designed, aligned, precise, and presented submission. It transforms simple file zipping into a meaningful ceremony that showcases your work with intention and style.

## 🎯 Features

- **🧘 Yoga Layout Engine**: Intelligent spatial arrangement using Facebook's Yoga flexbox engine
- **📁 File Staging Module**: Interactive file selection, preview, and validation before submission
- **🖋 Interactive CLI**: Beautiful terminal interface built with Ink and React
- **⛩️ Astro Web Previews**: Generate stunning web presentations of your deliverables
- **🥷 Ninja File Operations**: Fast, reliable file processing and packaging
- **🎨 Multiple Themes**: Choose from noir, academic, brutalist, modern, and more
- **📦 Smart Packaging**: Intelligent compression with progress tracking
- **🖼️ ASCII Preview**: Terminal-based preview using Browsh
- **📊 Rich Metadata**: Comprehensive project information and manifests
- **🔍 File Validation**: Automatic validation of file types, sizes, and naming conventions

## 🚀 Quick Start

### Installation

```bash
npm install -g submitit
```

### Usage

```bash
# Initialize a new project
submitit init my-portfolio

# Navigate to project directory
cd my-portfolio

# Add files to your project
submitit add resume.pdf headshot.jpg about.md --as portfolio

# Set a theme
submitit theme noir

# Preview your project
submitit preview

# Export your deliverable
submitit export
```

## 📚 Commands

### `submitit init <name>`
Initialize a new submitit project with the specified name.

**Options:**
- `-t, --theme <theme>` - Set initial theme (default: 'default')

### `submitit stage [path]`

Interactively stage files for submission with preview and validation.

```bash
# Stage files in current directory
submitit stage

# Stage files in specific directory
submitit stage ./submission/

# Customize file size and extensions
submitit stage --max-size 20 --extensions pdf,docx,txt
```

### `submitit add <files...>`
Add files to your project with optional content typing and role assignment.

```bash
# Basic usage
submitit add resume.pdf

# Multiple files with type and role
submitit add project/*.pdf --as document --role report

# Add all files in a directory
submitit add images/ --recursive --as gallery
```

### `submitit theme <theme>`
Set the project theme.

**Available themes:**
- `default` - Clean, simple styling
- `noir` - Dark, sophisticated styling
- `academic` - Professional academic layout
- `brutalist` - Bold, geometric design
- `modern` - Clean, minimalist design

### `submitit preview`
Preview your project in a web browser or terminal.

**Options:**
- `--ascii` - Use ASCII preview mode (requires Browsh)
- `--port <port>` - Set preview port (default: 4321)

### `submitit export`
Export your project as a packaged deliverable.

**Options:**
- `-o, --output <path>` - Output directory
- `--format <format>` - Output format (zip, tar)

### `submitit` (Interactive Mode)
Launch the interactive CLI interface for full project management.

## 🎨 Themes

### Default
Clean, simple styling with good contrast and system typography.

### Noir
Dark, sophisticated styling with high contrast and serif typography. Perfect for creative portfolios and dramatic presentations.

### Academic
Professional layout suitable for academic work, research papers, and formal submissions.

### Brutalist
Bold, geometric design with strong typography and high-contrast colors. Makes a statement.

### Modern
Clean, minimalist design with subtle animations and gradient accents.

## 🏗️ Architecture

submitit is built on a layered architecture that creates a "gradient of meaning":

```
⛩ ASTRO     →  Vision • Output • Presence
🧘 YOGA      →  Structure • Alignment • Interpretation  
🖋 INK       →  Dialogue • Interaction • Ritual
🥷 NINJA     →  Action • Assembly • Delivery
```

### Components

- **Astro**: Web presentation layer for beautiful previews
- **Yoga**: Layout engine for intelligent spatial arrangement
- **Ink**: Interactive CLI interface with React components
- **Ninja**: File operations, packaging, and delivery

## 📁 Project Structure

```
my-project/
├── content/              # Your project files
├── output/               # Generated packages
├── astro/                # Generated preview sites
├── submitit.config.json  # Project configuration
├── layout.json           # Layout specification
└── manifest.json         # Export metadata
```

## 🔧 Configuration

Projects are configured through `submitit.config.json`:

```json
{
  "name": "my-portfolio",
  "theme": "noir",
  "created": "2025-07-10T...",
  "layout": {
    "type": "column",
    "children": [...]
  },
  "files": [...],
  "metadata": {
    "title": "My Portfolio",
    "description": "A showcase of my work",
    "author": "Your Name"
  }
}
```

## 🎯 Use Cases

### Student Portfolios
```bash
submitit init final-project
submitit add designs/*.png --as gallery
submitit add presentation.pdf --as document
submitit add bio.md --as about
submitit theme academic
submitit export
```

### Press Kits
```bash
submitit init company-presskit
submitit add logo.png --role hero
submitit add press-release.pdf --as document
submitit add photos/*.jpg --as gallery
submitit theme modern
submitit export
```

### Creative Submissions
```bash
submitit init art-submission
submitit add artwork/*.jpg --as gallery
submitit add statement.md --as about
submitit add cv.pdf --as document
submitit theme brutalist
submitit export
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
git clone https://github.com/cameronbrooks/submitit.git
cd submitit
npm install
```

### Development Commands
```bash
npm run dev        # Run in development mode
npm run build      # Build Astro components
npm run test       # Run tests
npm run lint       # Lint code
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to the main branch.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/cameronbrooks/submitit)
- [Issue Tracker](https://github.com/cameronbrooks/submitit/issues)
- [Documentation](https://submitit.dev/docs)

---

*Transform your deliverables into intentional presentations with submitit* ✨