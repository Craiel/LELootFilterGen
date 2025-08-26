#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { parseStringPromise } = require('xml2js');

/**
 * Enhanced Database Builder Script
 * 
 * Features:
 * - Version tracking with game compatibility
 * - Manual overrides and data corrections
 * - Comprehensive logging and validation
 * - HTML parsing capability (prepared for future use)
 * - Duplicate detection and warnings
 * - Git-friendly, diffable output format
 * - Condensed, efficient database structure
 */

const TEMPLATE_DIR = path.join(__dirname, '..', 'TemplateFilters');
const DATA_DIR = path.join(__dirname, '..', 'Data');
const OVERRIDES_DIR = path.join(__dirname, '..', 'Overrides');
const WEB_DATA_DIR = path.join(__dirname, '..', 'WebData');
const OUTPUT_FILE = path.join(DATA_DIR, 'game-database.jsonl');
const VERSION_FILE = path.join(DATA_DIR, 'database-version.json');
const LOG_FILE = path.join(DATA_DIR, 'build.log');

// Default game version from templates
const DEFAULT_GAME_VERSION = '1.3.0.4';

class DatabaseBuilder {
  constructor() {
    this.gameData = {
      version: DEFAULT_GAME_VERSION,
      buildDate: new Date().toISOString(),
      affixes: new Map(),
      uniques: new Map(), 
      sets: new Map(),
      colors: new Map(),
      sounds: new Map(),
      beams: new Map(),
      subtypes: new Map(),
      statistics: {
        totalAffixes: 0,
        totalUniques: 0,
        totalSets: 0,
        totalSubtypes: 0,
        parsedFiles: 0,
        overridesApplied: 0,
        duplicatesFound: 0,
        warnings: [],
        errors: []
      }
    };
    
    this.idolAffixIds = new Set();
    this.itemAffixIds = new Set();
    
    this.logger = new BuildLogger(LOG_FILE);
    this.validator = new DataValidator(this.logger);
    this.overrideManager = new OverrideManager(OVERRIDES_DIR, this.logger);
  }

  /**
   * Main build process
   */
  async build(options = {}) {
    const { force = false, version = null } = options;
    
    await this.logger.start();
    this.logger.info('🔨 Building Last Epoch game database...');
    this.logger.info(`📁 Template directory: ${TEMPLATE_DIR}`);
    this.logger.info(`💾 Output directory: ${DATA_DIR}`);
    
    // Check if rebuild is needed
    if (!force && await this.shouldSkipBuild()) {
      this.logger.info('⚠️  Database is up-to-date. Use --force to rebuild.');
      console.log('⚠️  Database is up-to-date. Use --force to rebuild.');
      return { skipped: true, reason: 'Database up-to-date' };
    }
    
    // Clean Data folder while preserving overrides
    await this.cleanDataFolder();
    await fs.ensureDir(DATA_DIR);
    
    // Set version if provided
    if (version) {
      this.gameData.version = version;
      this.logger.info(`🏷️  Using game version: ${version}`);
      console.log(`🏷️  Using game version: ${version}`);
    }
    
    try {
      console.log('\n📚 Parsing reference templates...');
      await this.parseReferenceTemplates();
      
      console.log('🏷️  Parsing affix type mappings...');
      await this.parseAffixTypeMappings();
      
      console.log('🗂️  Parsing data templates...');
      await this.parseDataTemplates();
      
      console.log('🌐 Processing scraped web data...');
      await this.processScrapedWebData();
      
      console.log('🔧 Loading manual overrides...');
      await this.applyManualOverrides();
      
      console.log('🔍 Validating and checking for issues...');
      await this.validateData();
      
      console.log('🏗️  Building final database...');
      await this.buildDatabase();
      
      await this.saveVersionInfo();
      
      this.printSummary();
      await this.logger.finish();
      
      return this.gameData.statistics;
      
    } catch (error) {
      this.logger.error('❌ Build failed:', error);
      console.error('❌ Build failed:', error.message);
      this.gameData.statistics.errors.push(error.message);
      throw error;
    }
  }

  /**
   * Check if database rebuild is needed
   */
  async shouldSkipBuild() {
    try {
      const versionInfo = await fs.readJson(VERSION_FILE);
      const dbExists = await fs.pathExists(OUTPUT_FILE);
      
      if (!dbExists) return false;
      
      // Check if template files or overrides are newer than database
      const dbStats = await fs.stat(OUTPUT_FILE);
      const templateTime = await this.getNewestTemplateTime();
      const overrideTime = await this.getNewestOverrideTime();
      
      const newestSourceTime = new Date(Math.max(templateTime.getTime(), overrideTime.getTime()));
      
      return newestSourceTime <= dbStats.mtime;
    } catch {
      return false; // Rebuild if version info is missing or corrupted
    }
  }

  /**
   * Get modification time of newest template file
   */
  async getNewestTemplateTime() {
    let newest = new Date(0);
    
    const scanDir = async (dir) => {
      if (!await fs.pathExists(dir)) return;
      
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await scanDir(fullPath);
        } else if (entry.name.endsWith('.xml')) {
          const stats = await fs.stat(fullPath);
          if (stats.mtime > newest) {
            newest = stats.mtime;
          }
        }
      }
    };
    
    await scanDir(TEMPLATE_DIR);
    return newest;
  }

  /**
   * Get modification time of newest override file
   */
  async getNewestOverrideTime() {
    let newest = new Date(0);
    
    if (!await fs.pathExists(OVERRIDES_DIR)) return newest;
    
    const overrideFiles = ['affixes.json', 'uniques.json', 'sets.json'];
    
    for (const file of overrideFiles) {
      const filePath = path.join(OVERRIDES_DIR, file);
      if (await fs.pathExists(filePath)) {
        const stats = await fs.stat(filePath);
        if (stats.mtime > newest) {
          newest = stats.mtime;
        }
      }
    }
    
    return newest;
  }

  /**
   * Clean Data folder (generated database only)
   */
  async cleanDataFolder() {
    if (!await fs.pathExists(DATA_DIR)) return;
    
    // Remove Data directory completely (overrides are now separate)
    await fs.remove(DATA_DIR);
    this.logger.info('Cleaned Data directory');
    
    // Recreate Data directory
    await fs.ensureDir(DATA_DIR);
  }

  /**
   * Parse reference templates (Colors, Sounds, Beams)
   */
  async parseReferenceTemplates() {
    const referenceFiles = [
      { file: 'Colors.xml', type: 'colors' },
      { file: 'Sounds.xml', type: 'sounds' },
      { file: 'MapIcon_LootBeam.xml', type: 'beams' }
    ];
    
    for (const { file, type } of referenceFiles) {
      const filePath = path.join(TEMPLATE_DIR, file);
      
      if (await fs.pathExists(filePath)) {
        await this.parseReferenceTemplate(filePath, type);
        this.logger.info(`✅ Parsed ${file}`);
        console.log(`✅ Parsed ${file}`);
      } else {
        this.logger.warn(`⚠️  ${file} not found - skipping`);
        console.log(`⚠️  ${file} not found - skipping`);
      }
    }
  }

  /**
   * Parse individual reference template
   */
  async parseReferenceTemplate(filePath, type) {
    try {
      const xmlContent = await fs.readFile(filePath, 'utf8');
      const parsed = await parseStringPromise(xmlContent);
      
      if (!parsed.ItemFilter?.rules?.[0]?.Rule) {
        throw new Error(`Invalid XML structure in ${filePath}`);
      }
      
      const rules = parsed.ItemFilter.rules[0].Rule;
      const dataMap = this.gameData[type];
      
      for (const rule of rules) {
        const nameOverride = rule.nameOverride?.[0];
        let id;
        
        if (type === 'colors') {
          id = parseInt(rule.color?.[0] || 0);
        } else if (type === 'sounds') {
          id = parseInt(rule.SoundId?.[0] || 0);
        } else if (type === 'beams') {
          id = parseInt(rule.BeamId?.[0] || 0);
        }
        
        if (nameOverride && !isNaN(id)) {
          dataMap.set(id, nameOverride);
        }
      }
      
      this.gameData.statistics.parsedFiles++;
      
    } catch (error) {
      const errorMsg = `Error parsing ${filePath}: ${error.message}`;
      this.logger.error(errorMsg);
      console.error(`❌ ${errorMsg}`);
      this.gameData.statistics.errors.push(errorMsg);
    }
  }

  /**
   * Parse affix type mappings from MasterTemplate1.xml
   */
  async parseAffixTypeMappings() {
    const masterTemplatePath = path.join(TEMPLATE_DIR, 'MasterTemplate1.xml');
    
    if (!await fs.pathExists(masterTemplatePath)) {
      this.logger.warn('MasterTemplate1.xml not found - affix type detection will be limited');
      return;
    }
    
    try {
      const xmlContent = await fs.readFile(masterTemplatePath, 'utf8');
      const parsed = await parseStringPromise(xmlContent);
      
      if (!parsed.ItemFilter?.rules?.[0]?.Rule) {
        throw new Error('Invalid XML structure in MasterTemplate1.xml');
      }
      
      const rules = parsed.ItemFilter.rules[0].Rule;
      
      for (const rule of rules) {
        const nameOverride = rule.nameOverride?.[0];
        
        if (nameOverride === 'All Affixes for Idols') {
          // Extract idol affix IDs
          const affixCondition = rule.conditions?.[0]?.Condition?.[0];
          if (affixCondition?.affixes?.[0]?.int) {
            for (const affixIdStr of affixCondition.affixes[0].int) {
              const affixId = parseInt(affixIdStr);
              this.idolAffixIds.add(affixId);
            }
          }
        } else if (nameOverride === 'All Affixes for Items') {
          // Extract item affix IDs
          const affixCondition = rule.conditions?.[0]?.Condition?.[0];
          if (affixCondition?.affixes?.[0]?.int) {
            for (const affixIdStr of affixCondition.affixes[0].int) {
              const affixId = parseInt(affixIdStr);
              this.itemAffixIds.add(affixId);
            }
          }
        } else if (nameOverride && nameOverride.includes('Subtypes')) {
          // Extract subtype information
          const condition = rule.conditions?.[0]?.Condition?.[0];
          
          if (condition?.$?.['i:type'] === 'SubTypeCondition') {
            const equipmentType = condition.type?.[0]?.EquipmentType?.[0];
            const order = parseInt(rule.Order?.[0] || 0);
            
            if (equipmentType) {
              this.gameData.subtypes.set(equipmentType, {
                name: nameOverride,
                displayName: nameOverride.replace('All ', '').replace(' Subtypes', ''),
                equipmentType: equipmentType,
                order: order
              });
              this.gameData.statistics.totalSubtypes++;
            }
          }
        }
      }
      
      this.logger.info(`Loaded ${this.idolAffixIds.size} idol affix IDs, ${this.itemAffixIds.size} item affix IDs, and ${this.gameData.subtypes.size} subtypes`);
      console.log(`✅ Loaded ${this.idolAffixIds.size} idol affix IDs, ${this.itemAffixIds.size} item affix IDs, and ${this.gameData.subtypes.size} subtypes`);
      
    } catch (error) {
      const errorMsg = `Error parsing affix type mappings: ${error.message}`;
      this.logger.error(errorMsg);
      console.error(`❌ ${errorMsg}`);
      this.gameData.statistics.errors.push(errorMsg);
    }
  }

  /**
   * Parse data templates (affixes, uniques, sets)
   */
  async parseDataTemplates() {
    const dataTypes = [
      { dir: 'affixes', type: 'affixes', idPattern: /(?:Affix\s+ID:\s*(\d+)|ID:\s*(\d+))/i },
      { dir: 'uniques', type: 'uniques', idPattern: /(?:Unique\s+ID:\s*(\d+)|ID:\s*(\d+))/i },
      { dir: 'sets', type: 'sets', idPattern: /(?:Set\s+ID:\s*(\d+)|ID:\s*(\d+))/i }
    ];
    
    for (const { dir, type, idPattern } of dataTypes) {
      const dirPath = path.join(TEMPLATE_DIR, dir);
      
      if (await fs.pathExists(dirPath)) {
        await this.parseDataTemplateDir(dirPath, type, idPattern);
        this.logger.info(`✅ Parsed ${dir} templates`);
        console.log(`✅ Parsed ${dir} templates`);
      } else {
        this.logger.warn(`⚠️  ${dir} directory not found - skipping`);
        console.log(`⚠️  ${dir} directory not found - skipping`);
      }
    }
  }

  /**
   * Parse all templates in a data directory
   */
  async parseDataTemplateDir(dirPath, type, idPattern) {
    const files = await fs.readdir(dirPath);
    const xmlFiles = files.filter(f => f.endsWith('.xml'));
    
    for (const file of xmlFiles) {
      const filePath = path.join(dirPath, file);
      await this.parseDataTemplate(filePath, type, idPattern);
    }
  }

  /**
   * Parse individual data template
   */
  async parseDataTemplate(filePath, type, idPattern) {
    try {
      const xmlContent = await fs.readFile(filePath, 'utf8');
      const parsed = await parseStringPromise(xmlContent);
      
      if (!parsed.ItemFilter?.rules?.[0]?.Rule) {
        return; // Skip invalid files
      }
      
      const rules = parsed.ItemFilter.rules[0].Rule;
      const dataMap = this.gameData[type];
      const fileName = path.basename(filePath);
      
      for (const rule of rules) {
        const nameOverride = rule.nameOverride?.[0];
        
        if (nameOverride) {
          const match = nameOverride.match(idPattern);
          
          if (match) {
            // This is an unfilled template with just ID pattern
            const id = parseInt(match[1] || match[2]);
            
            if (dataMap.has(id)) {
              this.logger.warn(`Duplicate ${type} ID ${id} found in ${fileName}`);
              this.gameData.statistics.warnings.push(`Duplicate ${type} ID ${id} in multiple template files`);
            }
            
            // Mark as unfilled template
            if (!dataMap.has(id)) {
              dataMap.set(id, null);
            }
          } else {
            // This is a filled template with actual item name
            let id = null;
            let isIdolAffix = false;
            
            // Extract ID from the rule conditions based on type
            if (type === 'affixes') {
              const affixCondition = rule.conditions?.[0]?.Condition?.[0];
              if (affixCondition?.affixes?.[0]?.int) {
                id = parseInt(affixCondition.affixes[0].int[0]);
              }
            } else if (type === 'uniques' || type === 'sets') {
              const uniqueCondition = rule.conditions?.[0]?.Condition?.[0];
              if (uniqueCondition?.Uniques?.[0]?.UniqueId?.[0]) {
                id = parseInt(uniqueCondition.Uniques[0].UniqueId[0]);
              }
            }
            
            if (id !== null) {
              // Store discovered item data
              const itemData = {
                name: nameOverride
              };
              
              // For affixes, check if this is an idol affix by looking for affix type hints
              if (type === 'affixes') {
                // Check if name suggests it's an idol affix or if we can determine it from context
                isIdolAffix = this.isLikelyIdolAffix(nameOverride, id);
                itemData.isIdolAffix = isIdolAffix;
              }
              
              dataMap.set(id, itemData);
              const affixType = type === 'affixes' && isIdolAffix ? 'idol affix' : type.slice(0, -1);
              this.logger.info(`Discovered ${affixType} ID ${id}: "${nameOverride}" in ${fileName}`);
            }
          }
        }
      }
      
      this.gameData.statistics.parsedFiles++;
      
    } catch (error) {
      const errorMsg = `Error parsing ${filePath}: ${error.message}`;
      this.logger.error(errorMsg);
      console.error(`❌ ${errorMsg}`);
      this.gameData.statistics.errors.push(errorMsg);
    }
  }

  /**
   * Determine if an affix is for idols based on ID and name patterns
   */
  isLikelyIdolAffix(affixName, affixId) {
    // First check the ID mappings from MasterTemplate1.xml
    if (this.idolAffixIds.has(affixId)) {
      return true;
    }
    
    if (this.itemAffixIds.has(affixId)) {
      return false;
    }
    
    // Fallback to heuristics if ID not found in mappings
    const idolKeywords = ['idol', 'blessing', 'passive', 'summon', 'minion', 'companion'];
    const nameForMatch = affixName.toLowerCase();
    
    // Check if the affix name contains idol-specific keywords
    return idolKeywords.some(keyword => nameForMatch.includes(keyword));
  }

  /**
   * Process scraped web data if available
   */
  async processScrapedWebData() {
    const webDataProcessedDir = path.join(WEB_DATA_DIR, 'processed');
    const webDataScrapedDir = path.join(WEB_DATA_DIR, 'scraped');
    
    // Check if we have scraped data to process
    if (!await fs.pathExists(webDataScrapedDir) && !await fs.pathExists(webDataProcessedDir)) {
      this.logger.info('No scraped web data found - skipping web data processing');
      return;
    }

    try {
      // Try to parse any cached JavaScript data
      await this.parseJavaScriptData();
    } catch (error) {
      this.logger.warn(`Web data processing failed: ${error.message}`);
      console.log(`⚠️  Web data processing failed: ${error.message}`);
    }
  }

  /**
   * Parse JavaScript data from scraped sources
   */
  async parseJavaScriptData() {
    const { JsDataParser } = require('./js-data-parser.js');
    const parser = new JsDataParser();

    // Try to parse item database to extract both unique items AND subtypes
    try {
      const itemDbData = await parser.loadItemDbData();
      
      if (itemDbData) {
        // Extract subtypes from web data
        await this.extractSubtypesFromWebData(itemDbData);
        
        // Parse unique items
        const uniqueItems = await parser.parseUniqueItemsFromJs();
        
        if (uniqueItems && uniqueItems.length > 0) {
          this.logger.info(`Parsed ${uniqueItems.length} unique items from web data`);
          console.log(`✅ Parsed ${uniqueItems.length} unique items from web data`);
          
          // Save unique items to Data/UniqueItems directory
          await this.saveUniqueItemsToFiles(uniqueItems);
          
          // Integrate web data into our game database
          for (const uniqueItem of uniqueItems) {
            if (uniqueItem.uniqueId && uniqueItem.name) {
              const existingEntry = this.gameData.uniques.get(uniqueItem.uniqueId);
              
              if (!existingEntry || existingEntry === null) {
                // Add new unique item from web data
                this.gameData.uniques.set(uniqueItem.uniqueId, {
                  name: uniqueItem.name,
                  desc: uniqueItem.loreText,
                  props: {
                    baseType: uniqueItem.baseType,
                    levelRequirement: uniqueItem.levelRequirement,
                    isSetUnique: uniqueItem.isSetUnique,
                    isLegendary: uniqueItem.isLegendary,
                    isFractureUnique: uniqueItem.isFractureUnique
                  },
                  notes: 'Discovered from web data'
                });
              } else if (typeof existingEntry === 'object' && !existingEntry.name) {
                // Enhance existing unfilled template
                existingEntry.name = uniqueItem.name;
                existingEntry.desc = uniqueItem.loreText;
                existingEntry.props = {
                  ...existingEntry.props,
                  baseType: uniqueItem.baseType,
                  levelRequirement: uniqueItem.levelRequirement,
                  isSetUnique: uniqueItem.isSetUnique,
                  isLegendary: uniqueItem.isLegendary,
                  isFractureUnique: uniqueItem.isFractureUnique
                };
                existingEntry.notes = (existingEntry.notes || '') + ' Enhanced with web data';
              }
            }
          }
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to parse item database from web data: ${error.message}`);
    }

    // TODO: Parse skills data when needed
    // const skills = await parser.parseSkillsFromJs();
  }
  
  /**
   * Extract individual subtype IDs from web data
   */
  async extractSubtypesFromWebData(itemDbData) {
    if (!itemDbData.itemList || !itemDbData.itemList.equippable) {
      this.logger.warn('No equippable items found in web data for subtype extraction');
      return;
    }
    
    let extractedSubtypes = 0;
    
    // Iterate through each equipment type
    for (const [equipTypeId, equipType] of Object.entries(itemDbData.itemList.equippable)) {
      if (!equipType.subItems) continue;
      
      const equipTypeName = this.mapEquipTypeIdToName(equipTypeId);
      
      // Extract individual subtype IDs for this equipment type
      for (const [subTypeId, subItem] of Object.entries(equipType.subItems)) {
        const subtypeIdNum = parseInt(subTypeId);
        
        if (!isNaN(subtypeIdNum)) {
          // Check if we already have this subtype from template parsing
          if (!this.gameData.subtypes.has(subtypeIdNum)) {
            this.gameData.subtypes.set(subtypeIdNum, {
              name: subItem.displayNameKey || `Subtype ${subtypeIdNum}`,
              displayName: subItem.displayNameKey?.replace(/^Type_/, '') || `Subtype ${subtypeIdNum}`,
              equipmentType: equipTypeName,
              equipTypeId: parseInt(equipTypeId),
              order: 0,
              notes: 'Extracted from web data'
            });
            extractedSubtypes++;
          } else {
            // Enhance existing subtype with web data
            const existing = this.gameData.subtypes.get(subtypeIdNum);
            if (existing && subItem.displayNameKey) {
              existing.webDisplayName = subItem.displayNameKey;
              existing.notes = (existing.notes || '') + ' Enhanced with web data';
            }
          }
        }
      }
    }
    
    this.logger.info(`Extracted ${extractedSubtypes} individual subtypes from web data`);
    console.log(`✅ Extracted ${extractedSubtypes} individual subtypes from web data`);
    this.gameData.statistics.totalSubtypes += extractedSubtypes;
  }
  
  /**
   * Map equipment type ID to readable name
   */
  mapEquipTypeIdToName(equipTypeId) {
    const typeMapping = {
      '0': 'ONE_HANDED_AXE',
      '1': 'ONE_HANDED_MACE',
      '2': 'ONE_HANDED_SCEPTRE',
      '3': 'ONE_HANDED_SWORD',
      '4': 'WAND',
      '5': 'ONE_HANDED_DAGGER',
      '6': 'TWO_HANDED_AXE',
      '7': 'TWO_HANDED_MACE',
      '8': 'TWO_HANDED_SPEAR',
      '9': 'TWO_HANDED_STAFF',
      '10': 'TWO_HANDED_SWORD',
      '11': 'BOW',
      '12': 'CATALYST',
      '13': 'SHIELD',
      '14': 'QUIVER',
      '15': 'HELMET',
      '16': 'BODY_ARMOR',
      '17': 'BELT',
      '18': 'BOOTS',
      '19': 'GLOVES',
      '20': 'AMULET',
      '21': 'RING',
      '22': 'RELIC'
    };
    
    return typeMapping[equipTypeId] || `UNKNOWN_TYPE_${equipTypeId}`;
  }
  
  /**
   * Save unique items to individual JSON files in Data/UniqueItems
   */
  async saveUniqueItemsToFiles(uniqueItems) {
    const uniqueItemsDir = path.join(DATA_DIR, 'UniqueItems');
    await fs.ensureDir(uniqueItemsDir);
    
    let savedCount = 0;
    
    for (const uniqueItem of uniqueItems) {
      try {
        // Create a clean filename from the item name
        const cleanName = uniqueItem.name
          .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special chars
          .replace(/\s+/g, '_') // Replace spaces with underscores
          .toLowerCase();
        
        const filename = `${cleanName}_${uniqueItem.uniqueId}.json`;
        const filePath = path.join(uniqueItemsDir, filename);
        
        // Extract relevant power-related information
        const relevantData = {
          id: uniqueItem.uniqueId,
          name: uniqueItem.name,
          baseType: uniqueItem.baseType,
          levelRequirement: uniqueItem.levelRequirement,
          isLegendary: uniqueItem.isLegendary,
          isSetUnique: uniqueItem.isSetUnique,
          isFractureUnique: uniqueItem.isFractureUnique,
          setId: uniqueItem.setId,
          loreText: uniqueItem.loreText,
          basicMods: uniqueItem.basicMods,
          descriptionParts: uniqueItem.descriptionParts,
          baseItemInfo: {
            levelRequirement: uniqueItem.baseItemInfo?.levelRequirement,
            itemTags: uniqueItem.baseItemInfo?.itemTags,
            implicits: uniqueItem.baseItemInfo?.implicits,
            classRequirement: uniqueItem.baseItemInfo?.classRequirement
          },
          extractedAt: new Date().toISOString()
        };
        
        await fs.writeJson(filePath, relevantData, { spaces: 2 });
        savedCount++;
        
      } catch (error) {
        this.logger.warn(`Failed to save unique item ${uniqueItem.name}: ${error.message}`);
      }
    }
    
    this.logger.info(`Saved ${savedCount} unique items to Data/UniqueItems/`);
    console.log(`✅ Saved ${savedCount} unique items to Data/UniqueItems/`);
  }

  /**
   * Apply manual overrides from override files
   */
  async applyManualOverrides() {
    const overrideTypes = ['affixes', 'uniques', 'sets'];
    
    for (const type of overrideTypes) {
      const overrideCount = await this.overrideManager.applyOverrides(type, this.gameData[type]);
      this.gameData.statistics.overridesApplied += overrideCount;
      
      if (overrideCount > 0) {
        this.logger.info(`Applied ${overrideCount} overrides for ${type}`);
        console.log(`✅ Applied ${overrideCount} overrides for ${type}`);
      }
    }
  }

  /**
   * Validate data and check for issues
   */
  async validateData() {
    const allDataTypes = ['affixes', 'uniques', 'sets'];
    
    for (const type of allDataTypes) {
      const issues = await this.validator.validateDataSet(type, this.gameData[type]);
      this.gameData.statistics.warnings.push(...issues.warnings);
      this.gameData.statistics.errors.push(...issues.errors);
      this.gameData.statistics.duplicatesFound += issues.duplicates;
    }
  }

  /**
   * Build final database in condensed, git-friendly format
   */
  async buildDatabase() {
    const lines = [];
    
    // Add metadata header (formatted for readability)
    lines.push(JSON.stringify({
      version: this.gameData.version,
      buildDate: this.gameData.buildDate,
      stats: {
        affixes: this.gameData.affixes.size,
        uniques: this.gameData.uniques.size,
        sets: this.gameData.sets.size,
        subtypes: this.gameData.subtypes.size,
        overrides: this.gameData.statistics.overridesApplied,
        discovered: this.countDiscoveredItems()
      }
    }, null, 2));
    
    // Add reference data (formatted for readability)
    const colors = {};
    const sounds = {};
    const beams = {};
    
    for (const [id, name] of this.gameData.colors) {
      colors[id] = name;
    }
    for (const [id, name] of this.gameData.sounds) {
      sounds[id] = name;
    }
    for (const [id, name] of this.gameData.beams) {
      beams[id] = name;
    }
    
    lines.push(JSON.stringify({ colors, sounds, beams }, null, 2));
    
    // Add game data (sorted by ID for consistent diffs)
    const gameDataTypes = [
      { prefix: 'affix', data: this.gameData.affixes, typeName: 'affixes' },
      { prefix: 'unique', data: this.gameData.uniques, typeName: 'uniques' },
      { prefix: 'set', data: this.gameData.sets, typeName: 'sets' },
      { prefix: 'subtype', data: this.gameData.subtypes, typeName: 'subtypes', sortBy: 'order' }
    ];
    
    for (const { prefix, data, typeName, sortBy } of gameDataTypes) {
      let sortedEntries;
      if (sortBy === 'order') {
        // Sort subtypes by order (descending to match game order)
        sortedEntries = Array.from(data.entries()).sort(([,a], [,b]) => (b.order || 0) - (a.order || 0));
      } else {
        // Sort by ID (numeric)
        sortedEntries = Array.from(data.entries()).sort(([a], [b]) => a - b);
      }
      
      // Add section header comment
      lines.push(`// ${typeName.charAt(0).toUpperCase() + typeName.slice(1)} data`);
      
      const discoveredCount = sortedEntries.filter(([, entry]) => entry && typeof entry === 'object' && entry.name).length;
      const missingCount = sortedEntries.filter(([, entry]) => entry === null).length;
      
      lines.push(`// Discovered: ${discoveredCount}, Missing: ${missingCount}, Total: ${sortedEntries.length}`);
      
      for (const [id, entry] of sortedEntries) {
        if (entry === null) {
          // Include missing entries for visibility
          lines.push(JSON.stringify({ [prefix]: id, missing: true }));
        } else if (typeof entry === 'object') {
          // Clean up the entry - remove empty/undefined fields
          const compactEntry = { [prefix]: id };
          if (entry.name) compactEntry.name = entry.name;
          if (entry.desc) compactEntry.desc = entry.desc;
          if (entry.props && Object.keys(entry.props).length > 0) compactEntry.props = entry.props;
          if (entry.notes) compactEntry.notes = entry.notes;
          if (typeName === 'affixes' && entry.isIdolAffix !== undefined) compactEntry.isIdolAffix = entry.isIdolAffix;
          if (typeName === 'subtypes') {
            if (entry.displayName) compactEntry.displayName = entry.displayName;
            if (entry.equipmentType) compactEntry.equipmentType = entry.equipmentType;
            if (entry.order !== undefined) compactEntry.order = entry.order;
          }
          
          lines.push(JSON.stringify(compactEntry));
        }
      }
      
      lines.push(''); // Add blank line between sections
    }
    
    // Write as JSONL (JSON Lines) format for git-friendly diffs
    await fs.writeFile(OUTPUT_FILE, lines.join('\n'));
    
    this.logger.info(`💾 Database saved to: ${OUTPUT_FILE}`);
    console.log(`💾 Database saved to: ${OUTPUT_FILE}`);
    
    // Also save a human-readable summary
    const summaryFile = path.join(DATA_DIR, 'database-summary.txt');
    await this.createSummaryFile(summaryFile);
  }

  /**
   * Create human-readable summary file
   */
  async createSummaryFile(summaryFile) {
    const lines = [
      `Last Epoch Game Database Summary`,
      `Generated: ${new Date(this.gameData.buildDate).toLocaleString()}`,
      `Game Version: ${this.gameData.version}`,
      ``,
      `Data Counts:`,
      `  Affixes: ${this.gameData.affixes.size}`,
      `  Unique Items: ${this.gameData.uniques.size}`,
      `  Set Items: ${this.gameData.sets.size}`,
      `  Subtypes: ${this.gameData.subtypes.size}`,
      `  Colors: ${this.gameData.colors.size}`,
      `  Sounds: ${this.gameData.sounds.size}`,
      `  Beams: ${this.gameData.beams.size}`,
      ``,
      `Build Statistics:`,
      `  Files Processed: ${this.gameData.statistics.parsedFiles}`,
      `  Overrides Applied: ${this.gameData.statistics.overridesApplied}`,
      `  Duplicates Found: ${this.gameData.statistics.duplicatesFound}`,
      `  Warnings: ${this.gameData.statistics.warnings.length}`,
      `  Errors: ${this.gameData.statistics.errors.length}`,
      ``
    ];
    
    if (this.gameData.statistics.warnings.length > 0) {
      lines.push(`Warnings:`);
      this.gameData.statistics.warnings.forEach(warning => {
        lines.push(`  • ${warning}`);
      });
      lines.push(``);
    }
    
    if (this.gameData.statistics.errors.length > 0) {
      lines.push(`Errors:`);
      this.gameData.statistics.errors.forEach(error => {
        lines.push(`  • ${error}`);
      });
    }
    
    await fs.writeFile(summaryFile, lines.join('\n'));
  }

  /**
   * Save version information
   */
  async saveVersionInfo() {
    const versionInfo = {
      gameVersion: this.gameData.version,
      buildDate: this.gameData.buildDate,
      templateCount: this.gameData.statistics.parsedFiles,
      databaseFile: path.basename(OUTPUT_FILE),
      format: 'jsonl'
    };
    
    await fs.writeJson(VERSION_FILE, versionInfo, { spaces: 2 });
  }

  /**
   * Print build summary
   */
  printSummary() {
    const stats = this.gameData.statistics;
    
    console.log('\n📊 Build Summary:');
    console.log(`   Game Version: ${this.gameData.version}`);
    console.log(`   Files Processed: ${stats.parsedFiles}`);
    console.log(`   Total Affixes: ${this.gameData.affixes.size}`);
    console.log(`   Total Uniques: ${this.gameData.uniques.size}`);
    console.log(`   Total Sets: ${this.gameData.sets.size}`);
    console.log(`   Total Subtypes: ${this.gameData.subtypes.size}`);
    console.log(`   Colors: ${this.gameData.colors.size}`);
    console.log(`   Sounds: ${this.gameData.sounds.size}`);
    console.log(`   Beams: ${this.gameData.beams.size}`);
    console.log(`   Overrides Applied: ${stats.overridesApplied}`);
    
    if (stats.warnings.length > 0) {
      console.log(`\n⚠️  Warnings: ${stats.warnings.length}`);
      stats.warnings.slice(0, 3).forEach(warning => console.log(`   • ${warning}`));
      if (stats.warnings.length > 3) {
        console.log(`   ... and ${stats.warnings.length - 3} more (see build.log)`);
      }
    }
    
    if (stats.errors.length > 0) {
      console.log(`\n❌ Errors: ${stats.errors.length}`);
      stats.errors.slice(0, 3).forEach(error => console.log(`   • ${error}`));
      if (stats.errors.length > 3) {
        console.log(`   ... and ${stats.errors.length - 3} more (see build.log)`);
      }
    }
    
    // Calculate completion percentages
    const affixCompletion = this.calculateCompletion(this.gameData.affixes);
    const uniqueCompletion = this.calculateCompletion(this.gameData.uniques);
    const setCompletion = this.calculateCompletion(this.gameData.sets);
    
    console.log('\n📈 Data Completion:');
    console.log(`   Affixes: ${affixCompletion}%`);
    console.log(`   Uniques: ${uniqueCompletion}%`);
    console.log(`   Sets: ${setCompletion}%`);
    
    console.log('\n✅ Database build complete!');
    console.log(`📄 Log file: ${LOG_FILE}`);
  }

  /**
   * Calculate completion percentage for data type
   */
  calculateCompletion(dataMap) {
    if (dataMap.size === 0) return 0;
    
    let discovered = 0;
    for (const [, entry] of dataMap) {
      if (entry && typeof entry === 'object' && entry.name) {
        discovered++;
      }
    }
    
    return Math.round((discovered / dataMap.size) * 100);
  }

  /**
   * Count total discovered items across all types
   */
  countDiscoveredItems() {
    let total = 0;
    const types = ['affixes', 'uniques', 'sets'];
    
    for (const type of types) {
      for (const [, entry] of this.gameData[type]) {
        if (entry && typeof entry === 'object' && entry.name) {
          total++;
        }
      }
    }
    
    return total;
  }
}

/**
 * Build Logger - Comprehensive logging with file output
 */
class BuildLogger {
  constructor(logFile) {
    this.logFile = logFile;
    this.logs = [];
  }

  async start() {
    this.logs = [`Build started: ${new Date().toISOString()}`];
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
    this.logs.push(`Build finished: ${new Date().toISOString()}`);
    await fs.writeFile(this.logFile, this.logs.join('\n') + '\n');
  }
}

/**
 * Data Validator - Checks for duplicates and issues
 */
class DataValidator {
  constructor(logger) {
    this.logger = logger;
  }

  async validateDataSet(type, dataMap) {
    const issues = {
      warnings: [],
      errors: [],
      duplicates: 0
    };

    const nameMap = new Map();

    // Check for duplicate names with different IDs
    for (const [id, data] of dataMap) {
      if (data && typeof data === 'object' && data.name) {
        
        // For affixes, create separate namespaces for idol vs item affixes
        let nameKey = data.name;
        if (type === 'affixes' && data.isIdolAffix !== undefined) {
          nameKey = `${data.name}#${data.isIdolAffix ? 'idol' : 'item'}`;
        }
        
        if (nameMap.has(nameKey)) {
          const existingEntry = nameMap.get(nameKey);
          
          // For affixes, only warn if it's truly a duplicate (same type)
          if (type === 'affixes' && data.isIdolAffix !== undefined) {
            const warning = `Duplicate ${type} name "${data.name}" found for ${data.isIdolAffix ? 'idols' : 'items'}: ID ${existingEntry.id} and ID ${id}`;
            issues.warnings.push(warning);
            issues.duplicates++;
            this.logger.warn(warning);
          } else {
            const warning = `Duplicate ${type} name "${data.name}" found: ID ${existingEntry.id} and ID ${id}`;
            issues.warnings.push(warning);
            issues.duplicates++;
            this.logger.warn(warning);
          }
        } else {
          nameMap.set(nameKey, { id, isIdolAffix: data.isIdolAffix });
        }
      }
    }

    // Check for suspicious patterns
    for (const [id, data] of dataMap) {
      if (data && typeof data === 'object' && data.name) {
        // Check for unclear names
        if (data.name.includes('???') || data.name.includes('Unknown')) {
          const warning = `${type} ID ${id} has unclear name: "${data.name}"`;
          issues.warnings.push(warning);
          this.logger.warn(warning);
        }

        // Skip verification warnings - data is as-is from templates and overrides
      }
    }

    return issues;
  }
}

/**
 * Override Manager - Handles manual data overrides
 */
class OverrideManager {
  constructor(overridesDir, logger) {
    this.overridesDir = overridesDir;
    this.logger = logger;
  }

  async applyOverrides(type, dataMap) {
    const overrideFile = path.join(this.overridesDir, `${type}.json`);
    
    if (!await fs.pathExists(overrideFile)) {
      return 0;
    }

    try {
      const overrideData = await fs.readJson(overrideFile);
      let appliedCount = 0;

      // Apply overrides
      if (overrideData.overrides) {
        for (const [idStr, override] of Object.entries(overrideData.overrides)) {
          const id = parseInt(idStr);
          
          // Store the override data directly
          dataMap.set(id, {
            name: override.name,
            desc: override.description,
            props: override.properties,
            notes: override.notes
          });
          
          appliedCount++;
          this.logger.info(`Applied override for ${type} ID ${id}: "${override.name}"`);
        }
      }

      // Apply corrections
      if (overrideData.corrections) {
        for (const [idStr, correction] of Object.entries(overrideData.corrections)) {
          const id = parseInt(idStr);
          
          if (dataMap.has(id)) {
            const existing = dataMap.get(id) || {};
            if (correction.correctedName) {
              existing.name = correction.correctedName;
              existing.notes = `${correction.explanation} (was: ${correction.originalName})`;
            }
            dataMap.set(id, existing);
            this.logger.info(`Applied correction for ${type} ID ${id}: ${correction.reason}`);
          }
        }
      }

      return appliedCount;

    } catch (error) {
      this.logger.error(`Error loading overrides for ${type}:`, error);
      return 0;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const versionArg = args.find(arg => arg.startsWith('--version='));
  const version = versionArg ? versionArg.split('=')[1] : null;
  
  try {
    const builder = new DatabaseBuilder();
    const result = await builder.build({ force, version });
    
    if (result.skipped) {
      process.exit(0);
    }
    
    console.log('\n🎉 Database successfully built!');
    
  } catch (error) {
    console.error('\n💥 Build failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { DatabaseBuilder };