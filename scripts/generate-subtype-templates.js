#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

/**
 * Subtype Template Generator
 * 
 * Generates template XML files for subtypes, organized by equipment category
 * to avoid creating one XML file per item type.
 */
class SubtypeTemplateGenerator {
  constructor() {
    this.logger = new GeneratorLogger();
    this.templateDir = path.join(__dirname, '..', 'TemplateFilters', 'subtypes');
    
    // Group equipment types respecting the 75-rule limit per XML file
    // Each template file must have ≤ 75 rules total
    this.equipmentGroups = {
      'subtypes_001_075': {
        name: 'Subtypes 1-75',
        idRanges: [
          { start: 1, end: 75, type: 'MIXED', name: 'Subtype' }
        ]
      },
      'subtypes_076_150': {
        name: 'Subtypes 76-150', 
        idRanges: [
          { start: 76, end: 150, type: 'MIXED', name: 'Subtype' }
        ]
      },
      'subtypes_151_225': {
        name: 'Subtypes 151-225',
        idRanges: [
          { start: 151, end: 225, type: 'MIXED', name: 'Subtype' }
        ]
      },
      'subtypes_226_300': {
        name: 'Subtypes 226-300',
        idRanges: [
          { start: 226, end: 300, type: 'MIXED', name: 'Subtype' }
        ]
      },
      'subtypes_301_375': {
        name: 'Subtypes 301-375',
        idRanges: [
          { start: 301, end: 375, type: 'MIXED', name: 'Subtype' }
        ]
      },
      'subtypes_376_450': {
        name: 'Subtypes 376-450',
        idRanges: [
          { start: 376, end: 450, type: 'MIXED', name: 'Subtype' }
        ]
      },
      'subtypes_451_525': {
        name: 'Subtypes 451-525',
        idRanges: [
          { start: 451, end: 525, type: 'MIXED', name: 'Subtype' }
        ]
      },
      'subtypes_526_600': {
        name: 'Subtypes 526-600',
        idRanges: [
          { start: 526, end: 600, type: 'MIXED', name: 'Subtype' }
        ]
      },
      'subtypes_601_675': {
        name: 'Subtypes 601-675',
        idRanges: [
          { start: 601, end: 675, type: 'MIXED', name: 'Subtype' }
        ]
      },
      'subtypes_676_750': {
        name: 'Subtypes 676-750',
        idRanges: [
          { start: 676, end: 750, type: 'MIXED', name: 'Subtype' }
        ]
      },
      'subtypes_751_825': {
        name: 'Subtypes 751-825',
        idRanges: [
          { start: 751, end: 825, type: 'MIXED', name: 'Subtype' }
        ]
      },
      'subtypes_826_900': {
        name: 'Subtypes 826-900',
        idRanges: [
          { start: 826, end: 900, type: 'MIXED', name: 'Subtype' }
        ]
      }
    };
    
    // Maximum rules per XML file (Last Epoch constraint)
    this.MAX_RULES_PER_FILE = 75;
  }
  
  /**
   * Generate all subtype template files
   */
  async generateAll(options = {}) {
    const { force = false } = options;
    
    await this.logger.start();
    this.logger.info('🏗️ Generating subtype template files...');
    
    try {
      // Ensure template directory exists
      await fs.ensureDir(this.templateDir);
      
      let generatedFiles = 0;
      let skippedFiles = 0;
      
      // Generate one template file per equipment group
      for (const [groupKey, group] of Object.entries(this.equipmentGroups)) {
        const fileName = `SubtypeTemplate_${groupKey}.xml`;
        const filePath = path.join(this.templateDir, fileName);
        
        if (!force && await fs.pathExists(filePath)) {
          this.logger.info(`⏭️ Skipping existing template: ${fileName}`);
          skippedFiles++;
          continue;
        }
        
        await this.generateGroupTemplate(filePath, group);
        generatedFiles++;
        this.logger.info(`✅ Generated: ${fileName}`);
        console.log(`✅ Generated: ${fileName}`);
      }
      
      // Generate summary
      console.log(`\n📊 Generation Summary:`);
      console.log(`   Generated: ${generatedFiles} files`);
      console.log(`   Skipped: ${skippedFiles} files`);
      console.log(`   Total Groups: ${Object.keys(this.equipmentGroups).length}`);
      console.log(`   Rules per file: Maximum ${this.MAX_RULES_PER_FILE} (Last Epoch constraint)`);
      console.log(`   Total subtype IDs covered: ${Object.keys(this.equipmentGroups).length * this.MAX_RULES_PER_FILE}`);
      
      if (generatedFiles > 0) {
        console.log(`\n💡 Next steps:`);
        console.log(`   1. Run database build to parse new templates`);
        console.log(`   2. Check Data/database-summary.txt for subtype counts`);
        console.log(`\n⚠️  Important: Each template respects the 75-rule limit for Last Epoch`);
      }
      
      this.logger.info(`Generation complete: ${generatedFiles} generated, ${skippedFiles} skipped`);
      await this.logger.finish();
      
      return { generated: generatedFiles, skipped: skippedFiles };
      
    } catch (error) {
      this.logger.error('Generation failed:', error);
      console.error('❌ Generation failed:', error.message);
      throw error;
    }
  }
  
  /**
   * Generate template file for an equipment group
   */
  async generateGroupTemplate(filePath, group) {
    const rules = [];
    
    // Generate rules for each ID range in the group
    for (const range of group.idRanges) {
      for (let id = range.start; id <= range.end; id++) {
        rules.push(this.generateSubtypeRule(id, range.type, range.name));
        
        // Safety check: ensure we never exceed the 75-rule limit
        if (rules.length >= this.MAX_RULES_PER_FILE) {
          this.logger.warn(`Reached maximum rules limit (${this.MAX_RULES_PER_FILE}) for ${group.name}`);
          break;
        }
      }
      
      // Break outer loop if we hit the limit
      if (rules.length >= this.MAX_RULES_PER_FILE) {
        break;
      }
    }
    
    // Validate rule count
    if (rules.length > this.MAX_RULES_PER_FILE) {
      throw new Error(`Template ${group.name} exceeds maximum rules: ${rules.length} > ${this.MAX_RULES_PER_FILE}`);
    }
    
    this.logger.info(`Generated ${rules.length} rules for ${group.name} (within ${this.MAX_RULES_PER_FILE} limit)`);
    
    // Create the complete XML template
    const xmlContent = this.generateXmlTemplate(group.name, rules);
    
    await fs.writeFile(filePath, xmlContent, 'utf8');
  }
  
  /**
   * Generate individual subtype rule
   */
  generateSubtypeRule(id, equipmentType, typeName) {
    return `        <Rule>
            <type>SHOW</type>
            <conditions>
                <Condition i:type="SubTypeCondition">
                    <subTypes>
                        <int>${id}</int>
                    </subTypes>
                </Condition>
            </conditions>
            <isEnabled>true</isEnabled>
            <levelDependent_deprecated>false</levelDependent_deprecated>
            <minLvl_deprecated>0</minLvl_deprecated>
            <maxLvl_deprecated>0</maxLvl_deprecated>
            <emphasized>false</emphasized>
            <nameOverride>${typeName} Subtype ID: ${id}</nameOverride>
            <SoundId>0</SoundId>
            <BeamId>0</BeamId>
            <Order>0</Order>
        </Rule>`;
  }
  
  /**
   * Generate complete XML template
   */
  generateXmlTemplate(groupName, rules) {
    const rulesXml = rules.join('\n');
    
    return `<?xml version="1.0" encoding="utf-8"?>
<ItemFilter xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
    <name>${groupName} Template</name>
    <filterIcon>0</filterIcon>
    <filterIconColor>0</filterIconColor>
    <description>Subtype template for ${groupName.toLowerCase()}. Contains ${rules.length}/${this.MAX_RULES_PER_FILE} rules. Generated automatically - do not edit manually.</description>
    <lastModifiedInVersion>1.3.0.4</lastModifiedInVersion>
    <lootFilterVersion>5</lootFilterVersion>
    <rules>
${rulesXml}
    </rules>
</ItemFilter>`;
  }
}

/**
 * Generation Logger
 */
class GeneratorLogger {
  constructor() {
    this.logFile = path.join(__dirname, '..', 'Data', 'subtype-generation.log');
    this.logs = [];
  }

  async start() {
    this.logs = [`Subtype template generation started: ${new Date().toISOString()}`];
  }

  info(message) {
    const logEntry = `INFO: ${new Date().toISOString()} - ${message}`;
    this.logs.push(logEntry);
  }

  warn(message) {
    const logEntry = `WARN: ${new Date().toISOString()} - ${message}`;
    this.logs.push(logEntry);
  }

  error(message, error = null) {
    const logEntry = `ERROR: ${new Date().toISOString()} - ${message}`;
    if (error && error.stack) {
      this.logs.push(logEntry);
      this.logs.push(`STACK: ${error.stack}`);
    } else {
      this.logs.push(logEntry);
    }
  }

  async finish() {
    this.logs.push(`Subtype template generation finished: ${new Date().toISOString()}`);
    await fs.ensureDir(path.dirname(this.logFile));
    await fs.writeFile(this.logFile, this.logs.join('\n') + '\n');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  
  try {
    const generator = new SubtypeTemplateGenerator();
    const result = await generator.generateAll({ force });
    
    console.log('\n🎉 Subtype template generation complete!');
    
  } catch (error) {
    console.error('\n💥 Generation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { SubtypeTemplateGenerator };