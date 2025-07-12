#!/bin/bash

# submitit Installation Script
# This script installs submitit and its dependencies

set -e

echo "🚀 Installing submitit..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/en/download/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ "$MAJOR_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 18+."
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Make CLI executable
echo "🔧 Setting up CLI..."
chmod +x src/cli.js

# Create global symlink (optional)
if [ "$1" = "--global" ]; then
    echo "🌍 Creating global symlink..."
    npm link
    echo "✅ submitit is now available globally!"
else
    echo "💡 To use submitit globally, run: npm link"
fi

# Install optional dependencies
echo "🔧 Installing optional dependencies..."

# Check if Browsh is available for ASCII preview
if command -v browsh &> /dev/null; then
    echo "✅ Browsh is available for ASCII preview"
else
    echo "⚠️  Browsh not found. Install it for ASCII preview support:"
    echo "   Visit: https://www.brow.sh/downloads/"
fi

# Check if Astro CLI is available
if command -v astro &> /dev/null; then
    echo "✅ Astro CLI is available"
else
    echo "📦 Installing Astro CLI..."
    npm install -g astro
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "🚀 Quick start:"
echo "  submitit init my-project"
echo "  cd my-project"
echo "  submitit add file1.pdf file2.jpg"
echo "  submitit preview"
echo "  submitit export"
echo ""
echo "📚 Documentation: https://github.com/cameronbrooks/submitit"
echo "🐛 Issues: https://github.com/cameronbrooks/submitit/issues"
echo ""
echo "✨ Happy submitting!"