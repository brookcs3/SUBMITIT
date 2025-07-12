/**
 * Ninja-style Progress Bar with Chalk Colors
 */
import chalk from 'chalk';

export function buildProgressBar() {
  let current = 0;
  let total = 0;
  let status = 'idle';
  
  return {
    start(totalFiles) {
      total = totalFiles;
      current = 0;
      status = 'building';
      this.render();
    },
    
    update(currentFile, type = 'building') {
      current = currentFile;
      status = type;
      this.render();
    },
    
    complete() {
      current = total;
      status = 'complete';
      this.render();
      console.log('');
    },
    
    error() {
      status = 'error';
      this.render();
      console.log('');
    },
    
    render() {
      const percentage = Math.round((current / total) * 100);
      const barWidth = 30;
      const filledWidth = Math.round((percentage / 100) * barWidth);
      
      // Color-coded status
      let statusColor, statusSymbol;
      switch (status) {
        case 'building':
          statusColor = chalk.yellow;
          statusSymbol = '●';
          break;
        case 'cached':
          statusColor = chalk.green;
          statusSymbol = '✓';
          break;
        case 'complete':
          statusColor = chalk.green;
          statusSymbol = '✅';
          break;
        case 'error':
          statusColor = chalk.red;
          statusSymbol = '✗';
          break;
        default:
          statusColor = chalk.white;
          statusSymbol = '○';
      }
      
      // Progress bar
      const progressBar = '█'.repeat(filledWidth) + '░'.repeat(barWidth - filledWidth);
      
      // Ninja-style output
      const output = [
        statusColor(`[${current}/${total}]`),
        statusColor(statusSymbol),
        progressBar,
        statusColor(`${percentage}%`)
      ].join(' ');
      
      process.stdout.write(`\r${output}`);
    }
  };
}

// Usage in engine
export function trackFileProgress(engine, progressBar) {
  engine.on('file-processing', (file, type) => {
    progressBar.update(file.index, type);
  });
}