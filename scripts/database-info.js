#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

/**
 * Database Information Script
 * 
 * Shows statistics and information about the current game database
 */

const DATA_DIR = path.join(__dirname, '..', 'Data');
const DATABASE_FILE = path.join(DATA_DIR, 'game-database.json');
const VERSION_FILE = path.join(DATA_DIR, 'database-version.json');

async function showDatabaseInfo() {
  try {
    // Check if database exists
    if (!await fs.pathExists(DATABASE_FILE)) {
      console.log('❌ No database found. Run `npm run build-database` first.');
      return;
    }
    
    // Load database
    const database = await fs.readJson(DATABASE_FILE);
    const versionInfo = await fs.pathExists(VERSION_FILE) ? await fs.readJson(VERSION_FILE) : null;
    
    console.log('📊 Last Epoch Game Database Information\n');
    
    // Meta information
    console.log('🏷️  Meta Information:');
    console.log(`   Game Version: ${database.meta.version}`);
    console.log(`   Build Date: ${new Date(database.meta.buildDate).toLocaleString()}`);
    console.log(`   Generator: ${database.meta.generator} v${database.meta.generatorVersion}`);
    
    if (versionInfo) {
      console.log(`   Template Files Processed: ${versionInfo.templateCount}`);
    }
    
    // Reference data
    console.log('\n🎨 Reference Data:');
    console.log(`   Colors: ${Object.keys(database.reference.colors).length}`);
    console.log(`   Sounds: ${Object.keys(database.reference.sounds).length}`);
    console.log(`   Loot Beams: ${Object.keys(database.reference.beams).length}`);
    
    // Game data statistics
    console.log('\n🎮 Game Data:');
    const affixCount = Object.keys(database.game.affixes).length;
    const uniqueCount = Object.keys(database.game.uniques).length;
    const setCount = Object.keys(database.game.sets).length;
    
    console.log(`   Total Affixes: ${affixCount}`);
    console.log(`   Total Unique Items: ${uniqueCount}`);
    console.log(`   Total Set Items: ${setCount}`);
    console.log(`   Total Game Objects: ${affixCount + uniqueCount + setCount}`);
    
    // Data completion analysis
    console.log('\n📈 Data Completion:');
    
    const affixCompletion = calculateCompletion(database.game.affixes);
    const uniqueCompletion = calculateCompletion(database.game.uniques);
    const setCompletion = calculateCompletion(database.game.sets);
    
    console.log(`   Affixes: ${affixCompletion.completed}/${affixCompletion.total} (${affixCompletion.percentage}%)`);
    console.log(`   Unique Items: ${uniqueCompletion.completed}/${uniqueCompletion.total} (${uniqueCompletion.percentage}%)`);
    console.log(`   Set Items: ${setCompletion.completed}/${setCompletion.total} (${setCompletion.percentage}%)`);
    
    const overallCompletion = Math.round(
      ((affixCompletion.completed + uniqueCompletion.completed + setCompletion.completed) / 
       (affixCompletion.total + uniqueCompletion.total + setCompletion.total)) * 100
    );
    
    console.log(`   Overall: ${overallCompletion}%`);
    
    // Statistics
    if (database.statistics) {
      console.log('\n📋 Build Statistics:');
      console.log(`   Files Processed: ${database.statistics.parsedFiles || 'N/A'}`);
      
      if (database.statistics.errors && database.statistics.errors.length > 0) {
        console.log(`   Errors: ${database.statistics.errors.length}`);
        database.statistics.errors.slice(0, 3).forEach(error => {
          console.log(`     • ${error}`);
        });
        if (database.statistics.errors.length > 3) {
          console.log(`     ... and ${database.statistics.errors.length - 3} more`);
        }
      } else {
        console.log('   Errors: None');
      }
    }
    
    // Show sample data ranges
    console.log('\n🔍 Sample Data Ranges:');
    showDataRange('Affixes', database.game.affixes);
    showDataRange('Unique Items', database.game.uniques);  
    showDataRange('Set Items', database.game.sets);
    
  } catch (error) {
    console.error('❌ Error reading database:', error.message);
    process.exit(1);
  }
}

function calculateCompletion(dataObject) {
  const entries = Object.values(dataObject);
  const total = entries.length;
  const completed = entries.filter(entry => entry.discovered && entry.name).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { total, completed, percentage };
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