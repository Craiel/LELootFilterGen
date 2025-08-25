#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

/**
 * Generate affix template XML files for in-game testing
 * Creates template files with individual affix rules for identification
 */

const AFFIXES_PER_FILE = 70; // Maximum 75 rules per file - strict Last Epoch constraint
const TOTAL_AFFIXES = 946; // IDs 0-945
const OUTPUT_DIR = path.join(__dirname, '..', 'TemplateFilters', 'affixes');

// Color codes for different template files (for visual distinction in-game)
// Reference: TemplateFilters/Colors.xml - see nameOverride for color names
const COLORS = [
  7,  // Red
  3,  // Yellow  
  16, // Green
  12, // Blue
  5,  // Orange
  10, // Purple
  14, // Cyan
  0,  // White
  8,  // Pink
  17, // Dark Green
  13, // Light Blue
  2,  // Lime
  4,  // Light Orange
  6,  // Light Red
  9,  // Hot Pink
  11, // Light Purple
  15, // Aqua
  1,  // Grey
];

// Sound IDs (optional - reference: TemplateFilters/Sounds.xml)
// 0: Default, 1: None, 2: Shing, 3: Shaker, 4: Zap, 5: Drum
// 6: Begin, 7: Fight, 8: Discovery, 9: Inspiration, 10: Anvil

// Beam IDs (optional - reference: TemplateFilters/MapIcon_LootBeam.xml)  
// 0: Default, 1: None, 2: Rare, 3: Unique, 4: Set, 5: Legendary
// 6: Key, 7: Exalted, 8: Golden, 9: Obsidian

function generateAffixTemplate(startId, endId, fileIndex, color) {
  const fileName = `AffixTemplate_${String(startId).padStart(3, '0')}-${String(endId).padStart(3, '0')}.xml`;
  
  let xml = `<?xml version="1.0" encoding="utf-8"?>
<ItemFilter xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
    <name>Affix Template ${String(startId).padStart(3, '0')}-${String(endId).padStart(3, '0')}</name>
    <filterIcon>0</filterIcon>
    <filterIconColor>0</filterIconColor>
    <description>Template for identifying affix IDs ${startId}-${endId}</description>
    <lastModifiedInVersion>1.3.0.4</lastModifiedInVersion>
    <lootFilterVersion>0</lootFilterVersion>
    <rules>`;

  const totalRules = endId - startId + 1;
  let ruleIndex = 0;
  
  for (let affixId = startId; affixId <= endId; affixId++) {
    xml += `
        <Rule>
            <type>SHOW</type>
            <conditions>
                <Condition i:type="AffixCondition">
                    <affixes>
                        <int>${affixId}</int>
                    </affixes>
                    <comparsion>ANY</comparsion>
                    <comparsionValue>0</comparsionValue>
                    <minOnTheSameItem>1</minOnTheSameItem>
                    <combinedComparsion>ANY</combinedComparsion>
                    <combinedComparsionValue>1</combinedComparsionValue>
                    <advanced>false</advanced>
                </Condition>
            </conditions>
            <color>${color}</color>
            <isEnabled>true</isEnabled>
            <levelDependent_deprecated>false</levelDependent_deprecated>
            <minLvl_deprecated>0</minLvl_deprecated>
            <maxLvl_deprecated>0</maxLvl_deprecated>
            <emphasized>true</emphasized>
            <nameOverride>Affix ID: ${affixId}</nameOverride>
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

async function generateAllTemplates(options = {}) {
  const { force = false, confirm = true } = options;
  
  // Safety check: prevent accidental regeneration of manually edited templates
  if (!force && await fs.pathExists(OUTPUT_DIR)) {
    const existingFiles = await fs.readdir(OUTPUT_DIR);
    const templateFiles = existingFiles.filter(f => f.startsWith('AffixTemplate_') && f.endsWith('.xml'));
    
    if (templateFiles.length > 0) {
      console.log(`⚠️  WARNING: Found ${templateFiles.length} existing affix template files.`);
      console.log(`   These templates may have been manually edited with affix names.`);
      console.log(`   Regeneration will OVERWRITE all manual edits!`);
      console.log(`\n   To regenerate anyway, use: node scripts/generate-affix-templates.js --force`);
      console.log(`   Or call generateAllTemplates({ force: true }) programmatically.`);
      return { skipped: true, reason: 'Templates exist and force=false' };
    }
  }
  
  await fs.ensureDir(OUTPUT_DIR);
  
  console.log(`🔄 Generating affix templates for ${TOTAL_AFFIXES} affixes...`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  
  let fileIndex = 0;
  const generatedFiles = [];
  
  for (let startId = 0; startId < TOTAL_AFFIXES; startId += AFFIXES_PER_FILE) {
    const endId = Math.min(startId + AFFIXES_PER_FILE - 1, TOTAL_AFFIXES - 1);
    const color = COLORS[fileIndex % COLORS.length];
    
    const { fileName, xml } = generateAffixTemplate(startId, endId, fileIndex, color);
    const filePath = path.join(OUTPUT_DIR, fileName);
    
    await fs.writeFile(filePath, xml);
    generatedFiles.push({
      fileName,
      range: `${startId}-${endId}`,
      count: endId - startId + 1,
      color
    });
    
    console.log(`✅ Generated ${fileName} (IDs ${startId}-${endId}, ${endId - startId + 1} affixes)`);
    fileIndex++;
  }
  
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total affixes: ${TOTAL_AFFIXES}`);
  console.log(`   Files generated: ${generatedFiles.length}`);
  console.log(`   Affixes per file: ${AFFIXES_PER_FILE} (respecting 75-rule limit)`);
  console.log(`\n🎮 Usage:`);
  console.log(`   1. Load each template file in Last Epoch`);
  console.log(`   2. Test items to see which affixes are highlighted`);
  console.log(`   3. Record affix names and properties`);
  console.log(`   4. Store data in Data/overrides/affixes/`);
  
  return generatedFiles;
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  generateAllTemplates({ force }).catch(console.error);
}

module.exports = { generateAllTemplates };