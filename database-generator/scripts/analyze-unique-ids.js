#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

/**
 * Analyze unique item IDs from MasterTemplate1.xml to determine range and count
 */

const MASTER_TEMPLATE_PATH = path.join(__dirname, '..', 'TemplateFilters', 'MasterTemplate1.xml');

async function analyzeUniqueIds() {
  try {
    const content = await fs.readFile(MASTER_TEMPLATE_PATH, 'utf8');
    
    // Extract all UniqueId values using regex
    const uniqueIdMatches = content.match(/<UniqueId>(\d+)<\/UniqueId>/g);
    
    if (!uniqueIdMatches) {
      console.log('No UniqueId entries found in MasterTemplate1.xml');
      return;
    }
    
    // Extract numeric IDs and sort them
    const uniqueIds = uniqueIdMatches
      .map(match => parseInt(match.match(/\d+/)[0]))
      .sort((a, b) => a - b);
    
    // Remove duplicates
    const uniqueSet = [...new Set(uniqueIds)];
    
    console.log(`📊 Unique Item ID Analysis:`);
    console.log(`   Total occurrences: ${uniqueIds.length}`);
    console.log(`   Unique IDs found: ${uniqueSet.length}`);
    console.log(`   ID range: ${uniqueSet[0]} - ${uniqueSet[uniqueSet.length - 1]}`);
    
    // Check for gaps in the sequence
    const gaps = [];
    for (let i = 1; i < uniqueSet.length; i++) {
      const prev = uniqueSet[i - 1];
      const current = uniqueSet[i];
      if (current - prev > 1) {
        for (let missing = prev + 1; missing < current; missing++) {
          gaps.push(missing);
        }
      }
    }
    
    if (gaps.length > 0) {
      console.log(`   Gaps in sequence: ${gaps.length} missing IDs`);
      console.log(`   Missing IDs: ${gaps.slice(0, 20).join(', ')}${gaps.length > 20 ? '...' : ''}`);
    } else {
      console.log(`   Sequence is continuous from ${uniqueSet[0]} to ${uniqueSet[uniqueSet.length - 1]}`);
    }
    
    // Show frequency of each ID (to identify which are used multiple times)
    const frequency = {};
    uniqueIds.forEach(id => {
      frequency[id] = (frequency[id] || 0) + 1;
    });
    
    const duplicated = Object.entries(frequency)
      .filter(([id, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]);
    
    if (duplicated.length > 0) {
      console.log(`   Duplicated IDs: ${duplicated.length}`);
      console.log(`   Most frequent: ${duplicated.slice(0, 5).map(([id, count]) => `${id}(${count}x)`).join(', ')}`);
    }
    
    return {
      totalOccurrences: uniqueIds.length,
      uniqueCount: uniqueSet.length,
      minId: uniqueSet[0],
      maxId: uniqueSet[uniqueSet.length - 1],
      allIds: uniqueSet,
      gaps,
      frequency
    };
    
  } catch (error) {
    console.error('Error analyzing unique IDs:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  analyzeUniqueIds().catch(console.error);
}

module.exports = { analyzeUniqueIds };