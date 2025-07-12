/**
 * Test the simple incremental Yoga layout concept
 */

import { 
  shouldRecalculateLayout, 
  demonstrateIncrementalLayout, 
  testIncrementalConcept 
} from './src/lib/simple-yoga-incremental.js';

console.log('🧪 Testing Simple Yoga Incremental Layout\n');

// Run the basic tests
testIncrementalConcept();

console.log('\n📊 Running full demonstration...\n');

// Run the full demonstration
await demonstrateIncrementalLayout();

console.log('\n✅ Incremental layout concept verified!');