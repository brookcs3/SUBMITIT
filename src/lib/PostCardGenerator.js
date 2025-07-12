import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';
import chalk from 'chalk';

export class PostCardGenerator {
  constructor() {
    this.postCardSize = {
      width: 800,
      height: 500
    };
    this.compactSize = {
      width: 400,
      height: 250
    };
  }

  async generatePostCard(config, layoutData = null, options = {}) {
    const outputDir = options.outputDir || join(process.cwd(), 'postcards');
    const format = options.format || 'html'; // html, png, pdf
    const size = options.compact ? this.compactSize : this.postCardSize;
    
    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true });
    
    const postCardData = {
      config,
      layoutData,
      size,
      generated: new Date().toISOString(),
      format
    };

    switch (format) {
      case 'html':
        return await this.generateHTMLPostCard(postCardData, outputDir);
      case 'png':
        return await this.generateImagePostCard(postCardData, outputDir);
      case 'pdf':
        return await this.generatePDFPostCard(postCardData, outputDir);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  async generateHTMLPostCard(postCardData, outputDir) {
    const { config, layoutData, size } = postCardData;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${config.name}_postcard_${timestamp}.html`;
    const outputPath = join(outputDir, filename);

    const html = this.createPostCardHTML(config, layoutData, size);
    await writeFile(outputPath, html);

    return {
      path: outputPath,
      format: 'html',
      size: Buffer.byteLength(html),
      dimensions: size
    };
  }

  async generateImagePostCard(postCardData, outputDir) {
    // For now, generate HTML and include instructions for screenshot
    const htmlResult = await this.generateHTMLPostCard(postCardData, outputDir);
    
    // Create a simple PNG instruction file
    const instructions = `
# Post Card Image Generation

To generate a PNG image of your post card:

1. Open the HTML file in your browser:
   file://${htmlResult.path}

2. Use browser screenshot tools or:
   - macOS: Cmd+Shift+4 (select area)
   - Windows: Windows+Shift+S
   - Linux: Screenshot tool

3. Or use automated screenshot tools:
   - Puppeteer: const screenshot = await page.screenshot()
   - Playwright: await page.screenshot({ path: 'postcard.png' })

Post card dimensions: ${postCardData.size.width}x${postCardData.size.height}px
`;

    const instructionsPath = join(outputDir, `${postCardData.config.name}_screenshot_instructions.txt`);
    await writeFile(instructionsPath, instructions);

    return {
      path: htmlResult.path,
      instructionsPath,
      format: 'png',
      size: htmlResult.size,
      dimensions: postCardData.size,
      note: 'HTML generated - use browser screenshot for PNG'
    };
  }

  async generatePDFPostCard(postCardData, outputDir) {
    // Similar to PNG - generate HTML with print styles
    const htmlResult = await this.generateHTMLPostCard(postCardData, outputDir);
    
    return {
      path: htmlResult.path,
      format: 'pdf',
      size: htmlResult.size,
      dimensions: postCardData.size,
      note: 'HTML generated - use browser print to PDF'
    };
  }

  createPostCardHTML(config, layoutData, size) {
    const layout = layoutData?.layout;
    const isResponsiveLayout = layout && layout.columns && layout.items;
    const files = config.files || [];

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.name} - Post Card</title>
  <style>
    /* Post Card Styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      width: ${size.width}px;
      height: ${size.height}px;
      margin: 0 auto;
      overflow: hidden;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      font-family: 'Georgia', serif;
      border: 2px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .postcard {
      width: ${size.width}px;
      height: ${size.height}px;
      padding: 20px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 6px;
      margin: 10px;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
      position: relative;
    }
    
    .header {
      text-align: center;
      margin-bottom: 16px;
      flex-shrink: 0;
    }
    
    .title {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
      margin: 0 0 8px 0;
    }
    
    .description {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 8px 0;
    }
    
    .meta {
      font-size: 12px;
      color: #9ca3af;
    }
    
    .yoga-badge {
      font-size: 10px;
      color: #3b82f6;
      margin-top: 4px;
    }
    
    .content {
      flex: 1;
      overflow: auto;
    }
    
    .grid {
      display: grid;
      gap: 8px;
      height: 100%;
    }
    
    .grid-2 { grid-template-columns: 1fr 1fr; }
    .grid-3 { grid-template-columns: 1fr 1fr 1fr; }
    .grid-1 { grid-template-columns: 1fr; }
    
    .file-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 8px;
      font-size: 11px;
      overflow: hidden;
    }
    
    .file-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    
    .file-name {
      font-weight: bold;
      color: #1f2937;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .file-type {
      background: #dbeafe;
      color: #1e40af;
      padding: 2px 6px;
      border-radius: 8px;
      font-size: 9px;
      white-space: nowrap;
    }
    
    .file-meta {
      color: #6b7280;
      font-size: 10px;
      line-height: 1.3;
    }
    
    .visual-weight {
      margin-top: 4px;
    }
    
    .weight-bar {
      width: 100%;
      height: 3px;
      background: #e5e7eb;
      border-radius: 2px;
      overflow: hidden;
    }
    
    .weight-fill {
      height: 100%;
      background: #3b82f6;
      border-radius: 2px;
    }
    
    .footer {
      text-align: center;
      font-size: 10px;
      color: #9ca3af;
      margin-top: 8px;
      flex-shrink: 0;
    }
    
    .watermark {
      position: absolute;
      bottom: 5px;
      right: 10px;
      font-size: 8px;
      color: #d1d5db;
      opacity: 0.7;
    }
    
    /* Compact mode */
    @media (max-width: 450px) {
      body {
        width: 400px;
        height: 250px;
      }
      .postcard {
        width: 400px;
        height: 250px;
        padding: 10px;
        margin: 5px;
      }
      .title { font-size: 18px; }
      .description { font-size: 12px; }
      .meta { font-size: 10px; }
    }
    
    /* Print styles */
    @media print {
      body {
        box-shadow: none;
        border: none;
      }
      .postcard {
        box-shadow: none;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="postcard">
    <div class="header">
      <h1 class="title">${config.metadata?.title || config.name}</h1>
      <p class="description">${config.metadata?.description || 'Created with submitit'}</p>
      <div class="meta">
        ${config.theme} • ${files.length} files${isResponsiveLayout ? ` • ${layout.columns}x${layout.rows} grid` : ''}
      </div>
      ${isResponsiveLayout ? `
        <div class="yoga-badge">
          🧘 Yoga optimized
        </div>
      ` : ''}
    </div>

    <div class="content">
      ${isResponsiveLayout ? this.generateResponsiveGrid(layout) : this.generateSimpleGrid(files)}
    </div>

    <div class="footer">
      Generated with ✨ submitit
    </div>
    
    <div class="watermark">
      ${new Date().toISOString().split('T')[0]}
    </div>
  </div>
</body>
</html>`;
  }

  generateResponsiveGrid(layout) {
    const { columns, items } = layout;
    const gridClass = columns === 1 ? 'grid-1' : columns === 2 ? 'grid-2' : 'grid-3';
    
    return `
      <div class="grid ${gridClass}">
        ${items.map(item => `
          <div class="file-card" style="grid-column: ${item.gridPosition?.column + 1 || 'auto'}; grid-row: ${item.gridPosition?.row + 1 || 'auto'};">
            <div class="file-header">
              <div class="file-name">${item.name}</div>
              <span class="file-type">${item.type}</span>
            </div>
            <div class="file-meta">
              <div>${item.role} • ${item.size}</div>
              ${item.dimensions ? `<div>${item.dimensions.width}×${item.dimensions.height}</div>` : ''}
            </div>
            ${item.visualWeight ? `
              <div class="visual-weight">
                <div class="weight-bar">
                  <div class="weight-fill" style="width: ${item.visualWeight * 100}%"></div>
                </div>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  generateSimpleGrid(files) {
    return `
      <div class="grid grid-2">
        ${files.map(file => `
          <div class="file-card">
            <div class="file-header">
              <div class="file-name">${file.name}</div>
              <span class="file-type">${file.type}</span>
            </div>
            <div class="file-meta">
              <div>${file.role} • ${file.size}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  async generatePostCardVariations(config, layoutData, outputDir) {
    const variations = [];
    
    // Standard HTML post card
    const htmlCard = await this.generatePostCard(config, layoutData, {
      outputDir,
      format: 'html',
      compact: false
    });
    variations.push(htmlCard);
    
    // Compact HTML post card
    const compactCard = await this.generatePostCard(config, layoutData, {
      outputDir,
      format: 'html',
      compact: true
    });
    variations.push(compactCard);
    
    // PNG instructions
    const pngCard = await this.generatePostCard(config, layoutData, {
      outputDir,
      format: 'png',
      compact: false
    });
    variations.push(pngCard);
    
    return variations;
  }
}