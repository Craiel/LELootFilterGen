#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

/**
 * Generate unique item template XML files for in-game testing
 * Creates template files with individual unique item rules for identification
 * Uses analysis from MasterTemplate1.xml to separate unique items from set items
 */

const UNIQUES_PER_FILE = 70; // Maximum 75 rules per file - strict Last Epoch constraint
const OUTPUT_DIR = path.join(__dirname, '..', 'TemplateFilters', 'uniques');

// Color codes for different template files (for visual distinction in-game)
// Reference: TemplateFilters/Colors.xml - see nameOverride for color names
const COLORS = [
  12, // Blue
  16, // Green
  5,  // Orange
  10, // Purple
  14, // Cyan
  3,  // Yellow
  7,  // Red
  0,  // White
  8,  // Pink
  13, // Light Blue
  2,  // Lime
  4,  // Light Orange
  6,  // Light Red
  9,  // Hot Pink
  11, // Light Purple
  15, // Aqua
  17, // Dark Green
  1,  // Grey
];

// Sound IDs (optional - reference: TemplateFilters/Sounds.xml)
// 0: Default, 1: None, 2: Shing, 3: Shaker, 4: Zap, 5: Drum
// 6: Begin, 7: Fight, 8: Discovery, 9: Inspiration, 10: Anvil

// Beam IDs (optional - reference: TemplateFilters/MapIcon_LootBeam.xml)  
// 0: Default, 1: None, 2: Rare, 3: Unique, 4: Set, 5: Legendary
// 6: Key, 7: Exalted, 8: Golden, 9: Obsidian

function generateUniqueTemplateForIds(uniqueIds, fileIndex, color) {
  const startId = uniqueIds[0];
  const endId = uniqueIds[uniqueIds.length - 1];
  const fileName = `UniqueTemplate_${String(startId).padStart(3, '0')}-${String(endId).padStart(3, '0')}.xml`;
  
  let xml = `<?xml version="1.0" encoding="utf-8"?>
<ItemFilter xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
    <name>Unique Template ${String(startId).padStart(3, '0')}-${String(endId).padStart(3, '0')}</name>
    <filterIcon>0</filterIcon>
    <filterIconColor>0</filterIconColor>
    <description>Template for identifying unique item IDs (${uniqueIds.length} items, excluding set items)</description>
    <lastModifiedInVersion>1.3.0.4</lastModifiedInVersion>
    <lootFilterVersion>5</lootFilterVersion>
    <rules>`;

  const totalRules = uniqueIds.length;
  let ruleIndex = 0;
  
  for (const uniqueId of uniqueIds) {
    xml += `
        <Rule>
            <type>SHOW</type>
            <conditions>
                <Condition i:type="UniqueModifiersCondition">
                    <Uniques>
                        <UniqueId>${uniqueId}</UniqueId>
                        <Rolls />
                    </Uniques>
                </Condition>
            </conditions>
            <color>${color}</color>
            <isEnabled>true</isEnabled>
            <levelDependent_deprecated>false</levelDependent_deprecated>
            <minLvl_deprecated>0</minLvl_deprecated>
            <maxLvl_deprecated>0</maxLvl_deprecated>
            <emphasized>true</emphasized>
            <nameOverride>Unique ID: ${uniqueId}</nameOverride>
            <SoundId>0</SoundId>
            <BeamId>0</BeamId>
            <Order>${totalRules - 1 - ruleIndex++}</Order>
        </Rule>`;
  }

  xml += `
    </rules>
</ItemFilter>`;

  return { fileName, xml };
}

async function loadUniqueIds() {
  const analysisPath = path.join(__dirname, '..', 'Data', 'unique-set-analysis.json');
  
  if (await fs.pathExists(analysisPath)) {
    const analysis = await fs.readJson(analysisPath);
    return analysis.uniqueIds;
  }
  
  // Fallback: run analysis if file doesn't exist
  console.log('⚠️  Analysis file not found, running analysis...');
  const { analyzeUniqueSetStructure } = require('./analyze-unique-set-structure');
  const analysis = await analyzeUniqueSetStructure();
  return analysis.uniqueIds;
}

async function generateAllTemplates(options = {}) {
  const { force = false } = options;
  
  // Load unique item IDs from analysis
  const uniqueIds = await loadUniqueIds();
  console.log(`📋 Loaded ${uniqueIds.length} unique item IDs (excluding set items)`);
  
  // Safety check: prevent accidental regeneration of manually edited templates
  if (!force && await fs.pathExists(OUTPUT_DIR)) {
    const existingFiles = await fs.readdir(OUTPUT_DIR);
    const templateFiles = existingFiles.filter(f => f.startsWith('UniqueTemplate_') && f.endsWith('.xml'));
    
    if (templateFiles.length > 0) {
      console.log(`⚠️  WARNING: Found ${templateFiles.length} existing unique template files.`);
      console.log(`   These templates may have been manually edited with unique item names.`);
      console.log(`   Regeneration will OVERWRITE all manual edits!`);
      console.log(`\n   To regenerate anyway, use: node scripts/generate-unique-templates.js --force`);
      console.log(`   Or call generateAllTemplates({ force: true }) programmatically.`);
      return { skipped: true, reason: 'Templates exist and force=false' };
    }
  }
  
  await fs.ensureDir(OUTPUT_DIR);
  
  console.log(`🔄 Generating unique item templates for ${uniqueIds.length} unique items...`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  
  let fileIndex = 0;
  const generatedFiles = [];
  
  // Group unique IDs into chunks of UNIQUES_PER_FILE
  for (let i = 0; i < uniqueIds.length; i += UNIQUES_PER_FILE) {
    const chunkIds = uniqueIds.slice(i, Math.min(i + UNIQUES_PER_FILE, uniqueIds.length));
    const startId = chunkIds[0];
    const endId = chunkIds[chunkIds.length - 1];
    const color = COLORS[fileIndex % COLORS.length];
    
    const { fileName, xml } = generateUniqueTemplateForIds(chunkIds, fileIndex, color);
    const filePath = path.join(OUTPUT_DIR, fileName);
    
    await fs.writeFile(filePath, xml);
    generatedFiles.push({
      fileName,
      range: `${startId}-${endId}`,
      count: chunkIds.length,
      color,
      ids: chunkIds
    });
    
    console.log(`✅ Generated ${fileName} (${chunkIds.length} unique items: ${startId}...${endId})`);
    fileIndex++;
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total unique items: ${uniqueIds.length}`);
  console.log(`   Files generated: ${generatedFiles.length}`);
  console.log(`   Max unique items per file: ${UNIQUES_PER_FILE} (respecting 75-rule limit)`);
  console.log(`\n🎮 Usage:`);
  console.log(`   1. Load each template file in Last Epoch`);
  console.log(`   2. Test items to see which unique items are highlighted`);
  console.log(`   3. Record unique item names and properties`);
  console.log(`   4. Store data in Data/overrides/uniques/`);
  
  return generatedFiles;
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  generateAllTemplates({ force }).catch(console.error);
}

module.exports = { generateAllTemplates };