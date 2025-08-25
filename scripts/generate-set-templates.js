#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

/**
 * Generate set item template XML files for in-game testing
 * Creates template files with individual set item rules for identification
 * Uses analysis from MasterTemplate1.xml to identify set items
 */

const SETS_PER_FILE = 70; // Maximum 75 rules per file - strict Last Epoch constraint
const OUTPUT_DIR = path.join(__dirname, '..', 'TemplateFilters', 'sets');

// Color codes for different template files (for visual distinction in-game)
// Reference: TemplateFilters/Colors.xml - see nameOverride for color names
const COLORS = [
  8,  // Pink (different from unique templates)
  9,  // Hot Pink
  11, // Light Purple
  15, // Aqua
  14, // Cyan
  13, // Light Blue
  2,  // Lime
  4,  // Light Orange
  6,  // Light Red
  17, // Dark Green
];

// Sound IDs (optional - reference: TemplateFilters/Sounds.xml)
// 0: Default, 1: None, 2: Shing, 3: Shaker, 4: Zap, 5: Drum
// 6: Begin, 7: Fight, 8: Discovery, 9: Inspiration, 10: Anvil

// Beam IDs (optional - reference: TemplateFilters/MapIcon_LootBeam.xml)  
// 0: Default, 1: None, 2: Rare, 3: Unique, 4: Set, 5: Legendary
// 6: Key, 7: Exalted, 8: Golden, 9: Obsidian

function generateSetTemplateForIds(setIds, fileIndex, color) {
  const startId = setIds[0];
  const endId = setIds[setIds.length - 1];
  const fileName = `SetTemplate_${String(startId).padStart(3, '0')}-${String(endId).padStart(3, '0')}.xml`;
  
  let xml = `<?xml version="1.0" encoding="utf-8"?>
<ItemFilter xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
    <name>Set Template ${String(startId).padStart(3, '0')}-${String(endId).padStart(3, '0')}</name>
    <filterIcon>0</filterIcon>
    <filterIconColor>0</filterIconColor>
    <description>Template for identifying set item IDs (${setIds.length} items)</description>
    <lastModifiedInVersion>1.3.0.4</lastModifiedInVersion>
    <lootFilterVersion>5</lootFilterVersion>
    <rules>`;

  const totalRules = setIds.length;
  let ruleIndex = 0;
  
  for (const setId of setIds) {
    xml += `
        <Rule>
            <type>SHOW</type>
            <conditions>
                <Condition i:type="UniqueModifiersCondition">
                    <Uniques>
                        <UniqueId>${setId}</UniqueId>
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
            <nameOverride>Set ID: ${setId}</nameOverride>
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

async function loadSetIds() {
  const analysisPath = path.join(__dirname, '..', 'Data', 'unique-set-analysis.json');
  
  if (await fs.pathExists(analysisPath)) {
    const analysis = await fs.readJson(analysisPath);
    return analysis.setIds;
  }
  
  // Fallback: run analysis if file doesn't exist
  console.log('⚠️  Analysis file not found, running analysis...');
  const { analyzeUniqueSetStructure } = require('./analyze-unique-set-structure');
  const analysis = await analyzeUniqueSetStructure();
  return analysis.setIds;
}

async function generateAllTemplates(options = {}) {
  const { force = false } = options;
  
  // Load set item IDs from analysis
  const setIds = await loadSetIds();
  console.log(`📋 Loaded ${setIds.length} set item IDs`);
  
  // Safety check: prevent accidental regeneration of manually edited templates
  if (!force && await fs.pathExists(OUTPUT_DIR)) {
    const existingFiles = await fs.readdir(OUTPUT_DIR);
    const templateFiles = existingFiles.filter(f => f.startsWith('SetTemplate_') && f.endsWith('.xml'));
    
    if (templateFiles.length > 0) {
      console.log(`⚠️  WARNING: Found ${templateFiles.length} existing set template files.`);
      console.log(`   These templates may have been manually edited with set item names.`);
      console.log(`   Regeneration will OVERWRITE all manual edits!`);
      console.log(`\n   To regenerate anyway, use: node scripts/generate-set-templates.js --force`);
      console.log(`   Or call generateAllTemplates({ force: true }) programmatically.`);
      return { skipped: true, reason: 'Templates exist and force=false' };
    }
  }
  
  await fs.ensureDir(OUTPUT_DIR);
  
  console.log(`🔄 Generating set item templates for ${setIds.length} set items...`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  
  let fileIndex = 0;
  const generatedFiles = [];
  
  // Since we only have 47 set items, we can fit them all in one file
  // But we'll still chunk them to stay consistent with the pattern
  for (let i = 0; i < setIds.length; i += SETS_PER_FILE) {
    const chunkIds = setIds.slice(i, Math.min(i + SETS_PER_FILE, setIds.length));
    const startId = chunkIds[0];
    const endId = chunkIds[chunkIds.length - 1];
    const color = COLORS[fileIndex % COLORS.length];
    
    const { fileName, xml } = generateSetTemplateForIds(chunkIds, fileIndex, color);
    const filePath = path.join(OUTPUT_DIR, fileName);
    
    await fs.writeFile(filePath, xml);
    generatedFiles.push({
      fileName,
      range: `${startId}-${endId}`,
      count: chunkIds.length,
      color,
      ids: chunkIds
    });
    
    console.log(`✅ Generated ${fileName} (${chunkIds.length} set items: ${startId}...${endId})`);
    fileIndex++;
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total set items: ${setIds.length}`);
  console.log(`   Files generated: ${generatedFiles.length}`);
  console.log(`   Max set items per file: ${SETS_PER_FILE} (respecting 75-rule limit)`);
  console.log(`\n🎮 Usage:`);
  console.log(`   1. Load each template file in Last Epoch`);
  console.log(`   2. Test items to see which set items are highlighted`);
  console.log(`   3. Record set item names, set names, and properties`);
  console.log(`   4. Store data in Data/overrides/sets/`);
  
  return generatedFiles;
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  generateAllTemplates({ force }).catch(console.error);
}

module.exports = { generateAllTemplates };