#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

/**
 * Database Information Script
 * 
 * Shows statistics and information about the current game database
 */

const DATA_DIR = path.join(__dirname, '..', '..', 'filter-generator', 'Data');
const DATABASE_FILE = path.join(DATA_DIR, 'game-database.jsonl');
const VERSION_FILE = path.join(DATA_DIR, 'database-version.json');

async function showDatabaseInfo() {
  try {
    // Check if database exists
    if (!await fs.pathExists(DATABASE_FILE)) {
      console.log('❌ No database found. Run `npm run build-database` first.');
      return;
    }
    
    // Load database (JSONL format)
    const content = await fs.readFile(DATABASE_FILE, 'utf8');
    const lines = content.trim().split('\n');
    const database = {};
    
    // Parse multi-line JSON objects
    const jsonObjects = [];
    let currentJson = '';
    let braceCount = 0;
    
    for (const line of lines) {
      // Skip comment lines
      if (line.trim().startsWith('//') || line.trim() === '') {
        continue;
      }
      
      currentJson += line + '\n';
      
      // Count braces to determine when object is complete
      for (const char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      
      // When braces are balanced, we have a complete JSON object
      if (braceCount === 0 && currentJson.trim()) {
        try {
          jsonObjects.push(JSON.parse(currentJson.trim()));
          currentJson = '';
        } catch (e) {
          console.error('Error parsing JSON:', e.message);
        }
      }
    }
    
    // First object is metadata
    const metadata = jsonObjects[0];
    // Second object is reference data
    const reference = jsonObjects[1];
    
    // Remaining objects are game data
    const affixes = {};
    const uniques = {};
    const sets = {};
    
    for (let i = 2; i < jsonObjects.length; i++) {
      const obj = jsonObjects[i];
      if (obj.affix !== undefined) {
        affixes[obj.affix] = obj;
      } else if (obj.unique !== undefined) {
        uniques[obj.unique] = obj;
      } else if (obj.set !== undefined) {
        sets[obj.set] = obj;
      }
    }
    
    console.log('📊 Last Epoch Game Database Information\n');
    
    // Meta information
    console.log('🏷️  Meta Information:');
    console.log(`   Game Version: ${metadata.version}`);
    console.log(`   Build Date: ${new Date(metadata.buildDate).toLocaleString()}`);
    
    // Stats from metadata
    console.log('\n📈 Build Statistics:');
    console.log(`   Total Affixes: ${metadata.stats.affixes}`);
    console.log(`   Total Unique Items: ${metadata.stats.uniques}`);
    console.log(`   Total Set Items: ${metadata.stats.sets}`);
    console.log(`   Total Discovered: ${metadata.stats.discovered}`);
    console.log(`   Overrides Applied: ${metadata.stats.overrides}`);
    
    // Reference data
    console.log('\n🎨 Reference Data:');
    console.log(`   Colors: ${Object.keys(reference.colors).length}`);
    console.log(`   Sounds: ${Object.keys(reference.sounds).length}`);
    console.log(`   Loot Beams: ${Object.keys(reference.beams).length}`);
    
    // Show sample data ranges
    console.log('\n🔍 Data Ranges:');
    showDataRange('Affixes', affixes);
    showDataRange('Unique Items', uniques);  
    showDataRange('Set Items', sets);
    
  } catch (error) {
    console.error('❌ Error reading database:', error.message);
    process.exit(1);
  }
}


function showDataRange(label, dataObject) {
  const ids = Object.keys(dataObject).map(Number).sort((a, b) => a - b);
  
  if (ids.length === 0) {
    console.log(`   ${label}: No data`);
    return;
  }
  
  const minId = ids[0];
  const maxId = ids[ids.length - 1];
  const gaps = findGaps(ids);
  
  console.log(`   ${label}: ${minId}-${maxId} (${ids.length} total)`);
  
  if (gaps.length > 0) {
    const gapSummary = gaps.length <= 5 ? gaps.join(', ') : `${gaps.slice(0, 5).join(', ')} ... +${gaps.length - 5} more`;
    console.log(`     Missing IDs: ${gapSummary}`);
  }
}

function findGaps(sortedIds) {
  const gaps = [];
  const min = sortedIds[0];
  const max = sortedIds[sortedIds.length - 1];
  
  for (let i = min; i <= max; i++) {
    if (!sortedIds.includes(i)) {
      gaps.push(i);
    }
  }
  
  return gaps;
}

if (require.main === module) {
  showDatabaseInfo().catch(console.error);
}

module.exports = { showDatabaseInfo };