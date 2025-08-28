#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

/**
 * Database Information Script
 * 
 * Shows statistics and information about the current game database
 */

const DATA_DIR = path.join(__dirname, '..', '..', 'filter-generator', 'Data');
const DATABASE_INDEX_FILE = path.join(DATA_DIR, 'database-index.json');
const VERSION_FILE = path.join(DATA_DIR, 'database-version.json');
const PREFIXES_DIR = path.join(DATA_DIR, 'Prefixes');
const SUFFIXES_DIR = path.join(DATA_DIR, 'Suffixes');
const SKILLS_DIR = path.join(DATA_DIR, 'Skills');

async function showDatabaseInfo() {
  try {
    // Check if new database structure exists
    if (!await fs.pathExists(DATABASE_INDEX_FILE) || 
        !await fs.pathExists(PREFIXES_DIR) || 
        !await fs.pathExists(SUFFIXES_DIR)) {
      console.log('❌ No database found. Run `npm run build` first.');
      return;
    }
    
    // Load database index and version info
    const databaseIndex = JSON.parse(await fs.readFile(DATABASE_INDEX_FILE, 'utf8'));
    let versionInfo = { gameVersion: 'unknown', buildDate: Date.now() };
    
    if (await fs.pathExists(VERSION_FILE)) {
      versionInfo = JSON.parse(await fs.readFile(VERSION_FILE, 'utf8'));
    }
    
    // Count actual files in directories
    const prefixFiles = await fs.readdir(PREFIXES_DIR).then(files => files.filter(f => f.endsWith('.json')));
    const suffixFiles = await fs.readdir(SUFFIXES_DIR).then(files => files.filter(f => f.endsWith('.json')));
    
    // Count skills
    let skillCount = 0;
    if (await fs.pathExists(SKILLS_DIR)) {
      const skillFiles = await fs.readdir(SKILLS_DIR).then(files => files.filter(f => f.endsWith('.json')));
      for (const file of skillFiles) {
        const skillData = JSON.parse(await fs.readFile(path.join(SKILLS_DIR, file), 'utf8'));
        skillCount += Array.isArray(skillData) ? skillData.length : Object.keys(skillData).length;
      }
    }
    
    // Load reference data if available
    const colorsFile = path.join(DATA_DIR, 'colors-sounds-beams.json');
    let referenceData = { colors: {}, sounds: {}, beams: {} };
    if (await fs.pathExists(colorsFile)) {
      referenceData = JSON.parse(await fs.readFile(colorsFile, 'utf8'));
    }
    
    console.log('📊 Last Epoch Game Database Information\n');
    
    // Meta information
    console.log('🏷️  Meta Information:');
    console.log(`   Game Version: ${versionInfo.gameVersion}`);
    console.log(`   Build Date: ${new Date(versionInfo.buildDate).toLocaleString()}`);
    console.log(`   Database Format: Structured Files (v2.0)`);
    
    // File counts
    console.log('\n📈 Database Statistics:');
    console.log(`   Prefix Affixes: ${prefixFiles.length} files`);
    console.log(`   Suffix Affixes: ${suffixFiles.length} files`);
    console.log(`   Total Affixes: ${prefixFiles.length + suffixFiles.length}`);
    console.log(`   Skills: ${skillCount} total`);
    console.log(`   Unique Items: ${databaseIndex.uniqueItems || 0}`);
    console.log(`   Set Items: ${databaseIndex.setItems || 0}`);
    
    // Index information
    console.log('\n⚡ Index Files:');
    const indexDir = path.join(DATA_DIR, 'indexes');
    if (await fs.pathExists(indexDir)) {
      const indexFiles = await fs.readdir(indexDir).then(files => files.filter(f => f.endsWith('.json')));
      console.log(`   Available Indexes: ${indexFiles.length}`);
      for (const file of indexFiles) {
        console.log(`   - ${file}`);
      }
    } else {
      console.log('   No index files found');
    }
    
    // Reference data
    console.log('\n🎨 Reference Data:');
    console.log(`   Colors: ${Object.keys(referenceData.colors || {}).length}`);
    console.log(`   Sounds: ${Object.keys(referenceData.sounds || {}).length}`);
    console.log(`   Loot Beams: ${Object.keys(referenceData.beams || {}).length}`);
    
    // Additional files
    console.log('\n📄 Additional Data Files:');
    const additionalFiles = ['ailments.json', 'monsters.json', 'global-tags.json', 'idol-affixes.json', 'item-affixes.json', 'set-data.json', 'unique-items-overview.json'];
    for (const file of additionalFiles) {
      const exists = await fs.pathExists(path.join(DATA_DIR, file));
      console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    }
    
  } catch (error) {
    console.error('❌ Error reading database:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  showDatabaseInfo().catch(console.error);
}

module.exports = { showDatabaseInfo };