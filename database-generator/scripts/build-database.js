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
const DATA_DIR = path.join(__dirname, '..', '..', 'filter-generator', 'Data');
const OVERRIDES_DIR = path.join(__dirname, '..', 'Overrides');
const WEB_DATA_DIR = path.join(__dirname, '..', 'WebData');
const VERSION_FILE = path.join(DATA_DIR, 'database-version.json');
const LOG_FILE = path.join(DATA_DIR, 'build.log');
const VALIDATION_REPORT_FILE = path.join(DATA_DIR, 'validation-report.txt');

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
      globalTags: new Set(),
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
      
      console.log('🌐 Processing web data...');
      await this.processWebData();
      
      console.log('🔧 Loading manual overrides...');
      await this.applyManualOverrides();
      
      console.log('🔍 Validating and checking for issues...');
      await this.validateData();
      
      console.log('🏗️  Building final database...');
      await this.buildDatabase();
      
      await this.saveVersionInfo();
      await this.copyClaudeGuide();
      await this.generateIndexes();
      
      await this.printSummary();
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
      // Check if any of the core specialized files exist
      const specializedFiles = [
        path.join(DATA_DIR, 'colors-sounds-beams.json'),
        path.join(DATA_DIR, 'global-tags.json'),
        path.join(DATA_DIR, 'idol-affixes.json'),
        path.join(DATA_DIR, 'item-affixes.json'),
        path.join(DATA_DIR, 'unique-items-overview.json'),
        path.join(DATA_DIR, 'set-data.json')
      ];
      
      const allFilesExist = await Promise.all(
        specializedFiles.map(file => fs.pathExists(file))
      );
      
      if (!allFilesExist.every(exists => exists)) return false;
      
      // Check if template files or overrides are newer than the version file
      const versionStats = await fs.stat(VERSION_FILE);
      const templateTime = await this.getNewestTemplateTime();
      const overrideTime = await this.getNewestOverrideTime();
      
      const newestSourceTime = new Date(Math.max(templateTime.getTime(), overrideTime.getTime()));
      
      return newestSourceTime <= versionStats.mtime;
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
          // Extract subtype information - TEMPORARILY DISABLED
          // TODO: Re-enable when complete subtype data is available
          /*
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
          */
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
   * Process web data if available
   */
  async processWebData() {
    // Check if we have HTML files to process directly
    const htmlFiles = ['ItemList.html', 'Sets.html', 'Prefixes.html', 'Suffixes.html', 'SkillOverview.html'];
    const existingFiles = [];
    
    for (const file of htmlFiles) {
      const filePath = path.join(WEB_DATA_DIR, file);
      if (await fs.pathExists(filePath)) {
        existingFiles.push(file);
      }
    }
    
    if (existingFiles.length === 0) {
      this.logger.info('No HTML files found in WebData - skipping web data processing');
      return;
    }
    
    this.logger.info(`Found ${existingFiles.length} HTML files to process: ${existingFiles.join(', ')}`);
    console.log(`📄 Found ${existingFiles.length} HTML files to process: ${existingFiles.join(', ')}`);
    
    const webDataProcessedDir = path.join(WEB_DATA_DIR, 'processed');
    
    // Check if we have web data to process
    if (!await fs.pathExists(webDataProcessedDir)) {
      this.logger.info('No processed directory found - processing HTML files directly');
    }

    try {
      // Try to parse HTML data from manual download
      await this.parseHtmlData();
      
      // Try to parse set data from HTML
      await this.parseSetData();
      
      // Try to parse affix data from HTML
      await this.parseAffixData();
      
      // Try to parse skill data from HTML
      await this.parseSkillData();
      
      // Try to parse monster data from JSON
      await this.parseMonsterData();
      
      // Try to parse ailment data from JSON  
      await this.parseAilmentData();
    } catch (error) {
      this.logger.warn(`Web data processing failed: ${error.message}`);
      console.log(`⚠️  Web data processing failed: ${error.message}`);
    }
  }

  /**
   * Parse HTML data from manual download (replaced JavaScript parsing)
   */
  async parseHtmlData() {
    const { HTMLItemParser } = require('./html-item-parser.js');
    const parser = new HTMLItemParser();

    try {
      this.logger.info('Starting HTML data parsing from manual download...');
      
      // Parse HTML data with analytics enrichment
      const parsedData = await parser.parseItems();
      
      if (parsedData.uniqueItems && parsedData.uniqueItems.length > 0) {
        this.logger.info(`Parsed ${parsedData.uniqueItems.length} unique items from HTML data`);
        console.log(`✅ Parsed ${parsedData.uniqueItems.length} unique items from HTML data`);
        
        // Enrich items with analytics data before saving
        const enrichedItems = await this.enrichItemsWithAnalytics(parsedData.uniqueItems);
        
        // Save enriched unique items to Data/UniqueItems directory
        await this.saveHtmlUniqueItemsToFiles(enrichedItems);
        
        // Extract subtypes from HTML data - TEMPORARILY DISABLED
        // TODO: Re-enable when complete subtype data is available
        // await this.extractSubtypesFromHtmlData(parsedData.subtypes);
        
        // Integrate HTML data into our game database
        for (const uniqueItem of parsedData.uniqueItems) {
          if (uniqueItem.name) {
            // Find existing template entry by name lookup (ignore HTML ID)
            let templateId = null;
            let existingEntry = null;
            
            // Search for existing entry with matching name
            for (const [id, entry] of this.gameData.uniques) {
              if (entry && typeof entry === 'object' && entry.name === uniqueItem.name) {
                templateId = id;
                existingEntry = entry;
                break;
              }
            }
            
            // If no matching name found, look for unfilled template entries
            if (!templateId) {
              for (const [id, entry] of this.gameData.uniques) {
                if (entry === null || (typeof entry === 'object' && !entry.name)) {
                  // Use first available unfilled template
                  templateId = id;
                  existingEntry = entry;
                  break;
                }
              }
            }
            
            if (templateId !== null) {
              if (!existingEntry || existingEntry === null) {
                // Fill unfilled template with HTML data
                this.gameData.uniques.set(templateId, {
                  id: templateId,
                  name: uniqueItem.name,
                  desc: uniqueItem.lore || '',
                  props: {
                    baseType: uniqueItem.baseType,
                    category: uniqueItem.category,
                    levelRequirement: uniqueItem.levelRequirement,
                    classRequirement: uniqueItem.classRequirement,
                    implicits: uniqueItem.implicits,
                    modifiers: uniqueItem.modifiers,
                    dropRarity: uniqueItem.dropRarity
                  }
                });
              } else if (typeof existingEntry === 'object' && existingEntry.name) {
                // Enhance existing template with additional data
                existingEntry.id = templateId; // Ensure ID is set
                existingEntry.desc = uniqueItem.lore || existingEntry.desc;
                existingEntry.props = {
                  ...existingEntry.props,
                  baseType: uniqueItem.baseType,
                  category: uniqueItem.category,
                  levelRequirement: uniqueItem.levelRequirement,
                  classRequirement: uniqueItem.classRequirement,
                  implicits: uniqueItem.implicits,
                  modifiers: uniqueItem.modifiers,
                  dropRarity: uniqueItem.dropRarity
                };
              }
            } else {
              // No template available - this item wasn't expected in templates
              this.logger.warn(`HTML item "${uniqueItem.name}" has no corresponding template entry - skipping`);
            }
          }
        }
      } else {
        this.logger.info('No unique items found in HTML data');
      }
      
    } catch (error) {
      this.logger.error(`Failed to parse HTML data: ${error.message}`);
      console.log(`❌ HTML parsing failed: ${error.message}`);
    }
    
    /*
    const { JsDataParser } = require('./js-data-parser.js');
    const parser = new JsDataParser();

    // Try to parse item database to extract both unique items AND subtypes
    try {
      const itemDbData = await parser.loadItemDbData();
      
      if (itemDbData) {
        // Extract subtypes from web data - TEMPORARILY DISABLED
        // TODO: Re-enable when complete subtype data is available
        // await this.extractSubtypesFromWebData(itemDbData);
        
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
    */
  }
  
  /**
   * Parse set data from HTML file
   */
  async parseSetData() {
    const { HTMLSetParser } = require('./html-set-parser.js');
    const parser = new HTMLSetParser();

    try {
      this.logger.info('Starting HTML set data parsing...');
      
      // Parse set data
      const parsedData = await parser.parseSetItems();
      
      if (parsedData.setItems && parsedData.setItems.length > 0) {
        this.logger.info(`Parsed ${parsedData.setItems.length} set items from HTML data`);
        console.log(`✅ Parsed ${parsedData.setItems.length} set items from HTML data`);
        
        // Integrate HTML set data into our game database
        for (const setItem of parsedData.setItems) {
          if (setItem.name) {
            // Find existing template entry by name lookup (ignore HTML ID)
            let templateId = null;
            let existingEntry = null;
            
            // Search for existing entry with matching name
            for (const [id, entry] of this.gameData.sets) {
              if (entry && typeof entry === 'object' && entry.name === setItem.name) {
                templateId = id;
                existingEntry = entry;
                break;
              }
            }
            
            // If no matching name found, look for unfilled template entries
            if (!templateId) {
              for (const [id, entry] of this.gameData.sets) {
                if (entry === null || (typeof entry === 'object' && !entry.name)) {
                  // Use first available unfilled template
                  templateId = id;
                  existingEntry = entry;
                  break;
                }
              }
            }
            
            if (templateId !== null) {
              if (!existingEntry || existingEntry === null) {
                // Fill unfilled template with HTML data
                this.gameData.sets.set(templateId, {
                  id: templateId,
                  name: setItem.name,
                  desc: setItem.lore || '',
                  props: {
                    baseType: setItem.baseType,
                    category: setItem.category,
                    setName: setItem.setName,
                    levelRequirement: setItem.levelRequirement,
                    classRequirement: setItem.classRequirement,
                    implicits: setItem.implicits,
                    modifiers: setItem.modifiers,
                    setBonuses: setItem.setBonuses
                  }
                });
              } else if (typeof existingEntry === 'object' && existingEntry.name) {
                // Enhance existing template with additional data
                existingEntry.id = templateId; // Ensure ID is set
                existingEntry.desc = setItem.lore || existingEntry.desc;
                existingEntry.props = {
                  ...existingEntry.props,
                  baseType: setItem.baseType,
                  category: setItem.category,
                  setName: setItem.setName,
                  levelRequirement: setItem.levelRequirement,
                  classRequirement: setItem.classRequirement,
                  implicits: setItem.implicits,
                  modifiers: setItem.modifiers,
                  setBonuses: setItem.setBonuses
                };
              }
            } else {
              // No template available - this item wasn't expected in templates
              this.logger.warn(`HTML set item "${setItem.name}" has no corresponding template entry - skipping`);
            }
          }
        }
      } else {
        this.logger.info('No set items found in HTML data');
      }
      
    } catch (error) {
      this.logger.error(`Failed to parse HTML set data: ${error.message}`);
      console.log(`❌ HTML set parsing failed: ${error.message}`);
    }
  }
  
  /**
   * Parse affix data from HTML files
   */
  async parseAffixData() {
    const { HTMLAffixParser } = require('./html-affix-parser.js');
    
    let totalPrefixes = 0;
    let totalSuffixes = 0;

    try {
      // Parse prefix data
      this.logger.info('Starting HTML prefix data parsing...');
      const prefixParser = new HTMLAffixParser('prefixes');
      const prefixSummary = await prefixParser.parse();
      const prefixData = await prefixParser.parseAffixes();
      
      if (prefixData.prefixes && prefixData.prefixes.length > 0) {
        totalPrefixes = prefixData.prefixes.length;
        this.logger.info(`Parsed ${totalPrefixes} prefixes from HTML data`);
        
        // Integrate prefix data into our game database
        await this.integrateParsedAffixes(prefixData.prefixes, 'prefix');
      }
      
    } catch (error) {
      this.logger.error(`Failed to parse HTML prefix data: ${error.message}`);
      console.log(`❌ HTML prefix parsing failed: ${error.message}`);
    }

    try {
      // Parse suffix data
      this.logger.info('Starting HTML suffix data parsing...');
      const suffixParser = new HTMLAffixParser('suffixes');
      const suffixSummary = await suffixParser.parse();
      const suffixData = await suffixParser.parseAffixes();
      
      if (suffixData.suffixes && suffixData.suffixes.length > 0) {
        totalSuffixes = suffixData.suffixes.length;
        this.logger.info(`Parsed ${totalSuffixes} suffixes from HTML data`);
        
        // Integrate suffix data into our game database
        await this.integrateParsedAffixes(suffixData.suffixes, 'suffix');
      }
      
    } catch (error) {
      this.logger.error(`Failed to parse HTML suffix data: ${error.message}`);
      console.log(`❌ HTML suffix parsing failed: ${error.message}`);
    }
    
    if (totalPrefixes > 0 || totalSuffixes > 0) {
      console.log(`✅ Parsed ${totalPrefixes} prefixes and ${totalSuffixes} suffixes from HTML data`);
    } else {
      this.logger.info('No affix data found in HTML files');
    }
  }
  
  /**
   * Integrate parsed affix data into the game database
   */
  async integrateParsedAffixes(affixes, type) {
    for (const affix of affixes) {
      if (affix.name) {
        // Find existing template entry by name lookup (ignore HTML ID)
        let templateId = null;
        let existingEntry = null;
        
        // Search for existing entry with matching name
        for (const [id, entry] of this.gameData.affixes) {
          if (entry && typeof entry === 'object' && entry.name === affix.name) {
            templateId = id;
            existingEntry = entry;
            break;
          }
        }
        
        // If no matching name found, look for unfilled template entries
        if (!templateId) {
          for (const [id, entry] of this.gameData.affixes) {
            if (entry === null || (typeof entry === 'object' && !entry.name)) {
              // Use first available unfilled template
              templateId = id;
              existingEntry = entry;
              break;
            }
          }
        }
        
        if (templateId !== null) {
          if (!existingEntry || existingEntry === null) {
            // Fill unfilled template with HTML data - only include properties we have reliable data for
            const affixData = {
              id: templateId,
              name: affix.name,
              modificationColumns: affix.modificationColumns || [],
              isIdolAffix: affix.isIdolAffix
            };

            // Only add description if we have content
            if (affix.description && affix.description.trim().length > 0) {
              affixData.desc = affix.description.trim();
            }

            this.gameData.affixes.set(templateId, affixData);
          } else if (typeof existingEntry === 'object' && existingEntry.name) {
            // Enhance existing template with additional data - only include reliable properties
            existingEntry.id = templateId; // Ensure ID is set
            if (affix.description && affix.description.trim().length > 0) {
              existingEntry.desc = affix.description.trim();
            }
            existingEntry.modificationColumns = affix.modificationColumns || existingEntry.modificationColumns || [];
            if (affix.isIdolAffix !== undefined) {
              existingEntry.isIdolAffix = affix.isIdolAffix;
            }
          }
        } else {
          // No template available - this affix wasn't expected in templates
          this.logger.warn(`HTML ${type} "${affix.name}" has no corresponding template entry - skipping`);
        }
      }
    }
  }
  
  /**
   * Parse skill data from HTML file
   */
  async parseSkillData() {
    const { HTMLSkillParser } = require('./html-skill-parser.js');
    const parser = new HTMLSkillParser();

    try {
      this.logger.info('Starting HTML skill data parsing...');
      
      // Parse skill data
      const parsedData = await parser.parseSkills();
      
      if (parsedData) {
        this.logger.info(`Parsed ${parsedData.parsedSections.length} sections with ${parsedData.totalSkills} skills from HTML data`);
        console.log(`✅ Parsed ${parsedData.parsedSections.length} sections with ${parsedData.totalSkills} skills from HTML data`);
        
        // Collect global tags from skill parser
        const skillTags = parser.getGlobalTags();
        if (skillTags && skillTags.length > 0) {
          skillTags.forEach(tag => this.gameData.globalTags.add(tag));
          this.logger.info(`📋 Collected ${skillTags.length} skill tags for global tags list`);
        }
        
        // Save skill data to Data directory (skills are informational, not integrated into main database)
        await this.saveSkillData(parsedData);
        
      } else {
        this.logger.info('No skill data found in HTML');
      }
      
    } catch (error) {
      this.logger.error(`Failed to parse HTML skill data: ${error.message}`);
      console.log(`❌ HTML skill parsing failed: ${error.message}`);
    }
  }
  
  /**
   * Save skill data to dedicated files
   */
  async saveSkillData(skillData) {
    const skillsDir = path.join(DATA_DIR, 'Skills');
    await fs.ensureDir(skillsDir);
    
    // Save individual section files
    for (const section of skillData.parsedSections) {
      const fileName = section.name.toLowerCase().replace(/\s+/g, '_') + '.json';
      const sectionFile = path.join(skillsDir, fileName);
      await fs.writeJson(sectionFile, section.data, { spaces: 2 });
    }
    
    this.logger.info(`Saved ${skillData.parsedSections.length} skill section files to ${skillsDir}`);
  }

  /**
   * Parse monster data from Monsters.json file
   */
  async parseMonsterData() {
    const HTMLMonsterParser = require('./html-monster-parser.js');
    const parser = new HTMLMonsterParser();

    try {
      this.logger.info('Starting monster data parsing...');
      
      // Parse monster data
      const parsedData = await parser.parseMonsters();
      
      if (parsedData) {
        this.logger.info(`Parsed ${parsedData.totalMonsters} monsters from JSON data`);
        console.log(`✅ Parsed ${parsedData.totalMonsters} monsters from JSON data`);
        
        // Collect global tags from monster parser
        const monsterTags = parser.getGlobalTags();
        if (monsterTags && monsterTags.length > 0) {
          monsterTags.forEach(tag => this.gameData.globalTags.add(tag));
          this.logger.info(`📋 Collected ${monsterTags.length} monster tags for global tags list`);
        }
      } else {
        this.logger.info('No monster data found');
      }
      
    } catch (error) {
      this.logger.error(`Failed to parse monster data: ${error.message}`);
      console.log(`❌ Monster parsing failed: ${error.message}`);
    }
  }

  /**
   * Parse ailment data from Ailments.json file
   */
  async parseAilmentData() {
    const HTMLAilmentParser = require('./html-ailment-parser.js');
    const parser = new HTMLAilmentParser();

    try {
      this.logger.info('Starting ailment data parsing...');
      
      // Parse ailment data
      const parsedData = await parser.parseAilments();
      
      if (parsedData) {
        this.logger.info(`Parsed ${parsedData.totalAilments} ailments from JSON data`);
        console.log(`✅ Parsed ${parsedData.totalAilments} ailments from JSON data`);
        
        // Collect global tags from ailment parser
        const ailmentTags = parser.getGlobalTags();
        if (ailmentTags && ailmentTags.length > 0) {
          ailmentTags.forEach(tag => this.gameData.globalTags.add(tag));
          this.logger.info(`📋 Collected ${ailmentTags.length} ailment tags for global tags list`);
        }
      } else {
        this.logger.info('No ailment data found');
      }
      
    } catch (error) {
      this.logger.error(`Failed to parse ailment data: ${error.message}`);
      console.log(`❌ Ailment parsing failed: ${error.message}`);
    }
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
              order: 0
            });
            extractedSubtypes++;
          } else {
            // Enhance existing subtype with web data
            const existing = this.gameData.subtypes.get(subtypeIdNum);
            if (existing && subItem.displayNameKey) {
              existing.webDisplayName = subItem.displayNameKey;
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
        
        const filename = `${cleanName}.json`;
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
    const validationReport = [];
    
    validationReport.push(`Last Epoch Database Validation Report`);
    validationReport.push(`Generated: ${new Date().toISOString()}`);
    validationReport.push(`Game Version: ${this.gameData.version}`);
    validationReport.push('='.repeat(60));
    validationReport.push('');
    
    let totalWarnings = 0;
    let totalErrors = 0;
    let totalDuplicates = 0;
    
    for (const type of allDataTypes) {
      const issues = await this.validator.validateDataSet(type, this.gameData[type]);
      
      if (issues.warnings.length > 0 || issues.errors.length > 0 || issues.duplicates > 0) {
        validationReport.push(`${type.toUpperCase()} VALIDATION ISSUES`);
        validationReport.push('-'.repeat(30));
        
        if (issues.errors.length > 0) {
          validationReport.push(`ERRORS (${issues.errors.length}):`);
          issues.errors.forEach(error => validationReport.push(`  ❌ ${error}`));
          validationReport.push('');
        }
        
        if (issues.warnings.length > 0) {
          validationReport.push(`WARNINGS (${issues.warnings.length}):`);
          issues.warnings.forEach(warning => validationReport.push(`  ⚠️  ${warning}`));
          validationReport.push('');
        }
        
        if (issues.duplicates > 0) {
          validationReport.push(`DUPLICATES: ${issues.duplicates} found`);
          validationReport.push('');
        }
        
        validationReport.push('');
      }
      
      // Still track in statistics for summary
      this.gameData.statistics.warnings.push(...issues.warnings);
      this.gameData.statistics.errors.push(...issues.errors);
      this.gameData.statistics.duplicatesFound += issues.duplicates;
      
      totalWarnings += issues.warnings.length;
      totalErrors += issues.errors.length;
      totalDuplicates += issues.duplicates;
    }
    
    // Add summary
    validationReport.unshift('');
    validationReport.unshift(`Total Issues: ${totalErrors} errors, ${totalWarnings} warnings, ${totalDuplicates} duplicates`);
    validationReport.unshift('SUMMARY');
    validationReport.unshift('-'.repeat(10));
    
    // Write validation report to dedicated file
    await fs.writeFile(VALIDATION_REPORT_FILE, validationReport.join('\n'));
    
    if (totalWarnings > 0 || totalErrors > 0 || totalDuplicates > 0) {
      this.logger.info(`Validation report written to: ${VALIDATION_REPORT_FILE}`);
      console.log(`📋 Validation report written to: ${path.basename(VALIDATION_REPORT_FILE)}`);
    }
  }

  /**
   * Build final database in multiple specialized files for better performance
   */
  async buildDatabase() {
    // Create separate files for different data types
    await this.createColorsReferenceData();
    await this.createGlobalTagsData();
    await this.createAffixData();
    await this.createUniqueItemsOverview();
    await this.createSetData();
  }

  /**
   * Create colors, sounds, and beams reference file
   */
  async createColorsReferenceData() {
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
    
    const referenceData = { colors, sounds, beams };
    const filePath = path.join(DATA_DIR, 'colors-sounds-beams.json');
    await fs.writeJson(filePath, referenceData, { spaces: 2 });
    this.logger.info(`💾 Saved reference data to: ${filePath}`);
  }

  /**
   * Create global tags file
   */
  async createGlobalTagsData() {
    const globalTags = Array.from(this.gameData.globalTags).sort();
    const filePath = path.join(DATA_DIR, 'global-tags.json');
    await fs.writeJson(filePath, { globalTags }, { spaces: 2 });
    this.logger.info(`💾 Saved global tags to: ${filePath}`);
  }

  /**
   * Create separate affix files for idols vs items
   */
  async createAffixData() {
    const idolAffixes = [];
    const itemAffixes = [];
    
    // Sort affixes by ID for consistent output
    const sortedAffixes = Array.from(this.gameData.affixes.values())
      .sort((a, b) => {
        const aId = parseInt(a.id) || 0;
        const bId = parseInt(b.id) || 0;
        return aId - bId;
      });
    
    // Split affixes by type and remove isIdolAffix property
    for (const affix of sortedAffixes) {
      const cleanAffix = { ...affix };
      delete cleanAffix.isIdolAffix; // Remove property since we're splitting by files
      
      if (affix.isIdolAffix) {
        idolAffixes.push(cleanAffix);
      } else {
        itemAffixes.push(cleanAffix);
      }
    }
    
    // Save idol affixes
    const idolFilePath = path.join(DATA_DIR, 'idol-affixes.json');
    await fs.writeJson(idolFilePath, { affixes: idolAffixes }, { spaces: 2 });
    this.logger.info(`💾 Saved ${idolAffixes.length} idol affixes to: ${idolFilePath}`);
    
    // Save item affixes
    const itemFilePath = path.join(DATA_DIR, 'item-affixes.json');
    await fs.writeJson(itemFilePath, { affixes: itemAffixes }, { spaces: 2 });
    this.logger.info(`💾 Saved ${itemAffixes.length} item affixes to: ${itemFilePath}`);
  }

  /**
   * Create unique items overview with minimal data
   */
  async createUniqueItemsOverview() {
    const uniqueItems = [];
    
    // Sort by ID for consistent output
    const sortedUniques = Array.from(this.gameData.uniques.values())
      .sort((a, b) => {
        const aId = parseInt(a.id) || 0;
        const bId = parseInt(b.id) || 0;
        return aId - bId;
      });
    
    // Extract only essential data
    for (const unique of sortedUniques) {
      uniqueItems.push({
        id: unique.id,
        name: unique.name,
        desc: unique.desc || '',
        baseType: unique.props?.baseType || '',
        category: unique.props?.category || '',
        classRequirement: unique.props?.classRequirement || '',
        dropRarity: unique.props?.dropRarity || 'N/A'
      });
    }
    
    const filePath = path.join(DATA_DIR, 'unique-items-overview.json');
    await fs.writeJson(filePath, { uniques: uniqueItems }, { spaces: 2 });
    this.logger.info(`💾 Saved ${uniqueItems.length} unique items overview to: ${filePath}`);
  }

  /**
   * Create set data file
   */
  async createSetData() {
    const sets = [];
    
    // Sort by ID for consistent output
    const sortedSets = Array.from(this.gameData.sets.values())
      .sort((a, b) => {
        const aId = parseInt(a.id) || 0;
        const bId = parseInt(b.id) || 0;
        return aId - bId;
      });
    
    for (const set of sortedSets) {
      sets.push(set);
    }
    
    const filePath = path.join(DATA_DIR, 'set-data.json');
    await fs.writeJson(filePath, { sets }, { spaces: 2 });
    this.logger.info(`💾 Saved ${sets.length} sets to: ${filePath}`);
  }



  /**
   * Save version information
   */
  async saveVersionInfo() {
    const versionInfo = {
      gameVersion: this.gameData.version,
      buildDate: this.gameData.buildDate,
      templateCount: this.gameData.statistics.parsedFiles,
      specializedFiles: ['colors-sounds-beams.json', 'global-tags.json', 'idol-affixes.json', 'item-affixes.json', 'unique-items-overview.json', 'set-data.json'],
      format: 'specialized-json'
    };
    
    await fs.writeJson(VERSION_FILE, versionInfo, { spaces: 2 });
  }

  /**
   * Copy Claude data lookup guide to Data folder
   */
  async copyClaudeGuide() {
    const sourceFile = path.join(__dirname, '..', 'CLAUDE_DATA_LOOKUP.md');
    const destFile = path.join(DATA_DIR, 'CLAUDE_DATA_LOOKUP.md');
    
    try {
      if (await fs.pathExists(sourceFile)) {
        await fs.copy(sourceFile, destFile);
        this.logger.info('📋 Copied Claude data lookup guide to Data folder');
        console.log('📋 Copied Claude data lookup guide to Data folder');
      } else {
        this.logger.warn('⚠️  Claude data lookup guide not found, skipping copy');
      }
    } catch (error) {
      this.logger.warn('⚠️  Failed to copy Claude data lookup guide:', error.message);
    }
  }

  /**
   * Generate database indexes for fast access
   */
  async generateIndexes() {
    try {
      console.log('🔍 Generating database indexes...');
      const IndexGenerator = require('./generate-indexes');
      const generator = new IndexGenerator();
      await generator.generate();
      this.logger.info('🔍 Generated database indexes successfully');
    } catch (error) {
      this.logger.error('❌ Failed to generate indexes:', error.message);
      // Don't fail the entire build if index generation fails
      console.warn('⚠️  Index generation failed but continuing build:', error.message);
    }
  }

  /**
   * Print build summary
   */
  async printSummary() {
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
    
    // Generate analytics indexes
    await this.generateAnalyticsIndexes();
    
    console.log('\n✅ Database build complete!');
    console.log(`📄 Log file: ${LOG_FILE}`);
  }

  /**
   * Generate analytics indexes for efficient querying
   */
  async generateAnalyticsIndexes() {
    const analyticsFile = path.join(OVERRIDES_DIR, 'analytics_unique_items_data.json');
    
    if (!await fs.pathExists(analyticsFile)) {
      this.logger.info('No analytics data available for index generation');
      return;
    }
    
    try {
      this.logger.info('🔍 Creating analytics indexes...');
      console.log('🔍 Creating analytics indexes...');
      
      const analyticsData = await fs.readJson(analyticsFile);
      const indexesDir = path.join(DATA_DIR, 'indexes');
      await fs.ensureDir(indexesDir);
      
      const indexes = {
        buildArchetypes: {},
        skillSynergies: {},
        damageTypes: {},
        defensiveMechanisms: {},
        buildEnablers: {},
        powerLevels: {},
        buildTags: {},
        classRestricted: {}
      };
      
      // Load unique items to get additional metadata
      const uniqueItemsDir = path.join(DATA_DIR, 'UniqueItems');
      const uniqueFiles = await fs.readdir(uniqueItemsDir);
      const uniqueItemsMap = new Map();
      
      for (const file of uniqueFiles.filter(f => f.endsWith('.json'))) {
        try {
          const item = await fs.readJson(path.join(uniqueItemsDir, file));
          if (item.name) uniqueItemsMap.set(item.name, item);
        } catch (error) {
          this.logger.warn(`Failed to read ${file}: ${error.message}`);
        }
      }
      
      // Build indexes
      for (const [itemName, analytics] of Object.entries(analyticsData)) {
        const item = uniqueItemsMap.get(itemName);
        if (!item) continue;
        
        const itemRef = {
          name: item.name,
          category: item.category,
          levelRequirement: item.levelRequirement,
          classRequirement: item.classRequirement,
          dropRarity: item.dropRarity
        };
        
        // Build archetype index
        for (const archetype of analytics.buildArchetypes || []) {
          if (!indexes.buildArchetypes[archetype]) indexes.buildArchetypes[archetype] = [];
          indexes.buildArchetypes[archetype].push(itemRef);
        }
        
        // Skill synergy index
        for (const skill of analytics.skillSynergies || []) {
          if (!indexes.skillSynergies[skill]) indexes.skillSynergies[skill] = [];
          indexes.skillSynergies[skill].push(itemRef);
        }
        
        // Damage type index
        for (const damageType of analytics.damageTypes || []) {
          if (!indexes.damageTypes[damageType]) indexes.damageTypes[damageType] = [];
          indexes.damageTypes[damageType].push(itemRef);
        }
        
        // Defensive mechanism index
        for (const mechanism of analytics.defensiveMechanisms || []) {
          if (!indexes.defensiveMechanisms[mechanism]) indexes.defensiveMechanisms[mechanism] = [];
          indexes.defensiveMechanisms[mechanism].push(itemRef);
        }
        
        // Build enabler index
        for (const enabler of analytics.buildEnablers || []) {
          if (!indexes.buildEnablers[enabler]) indexes.buildEnablers[enabler] = [];
          indexes.buildEnablers[enabler].push(itemRef);
        }
        
        // Power level index
        const powerLevel = analytics.powerLevel;
        if (!indexes.powerLevels[powerLevel]) indexes.powerLevels[powerLevel] = [];
        indexes.powerLevels[powerLevel].push(itemRef);
        
        // Build tag index
        for (const tag of analytics.buildTags || []) {
          if (!indexes.buildTags[tag]) indexes.buildTags[tag] = [];
          indexes.buildTags[tag].push(itemRef);
        }
        
        // Class restricted index
        if (item.classRequirement) {
          if (!indexes.classRestricted[item.classRequirement]) indexes.classRestricted[item.classRequirement] = [];
          indexes.classRestricted[item.classRequirement].push(itemRef);
        }
      }
      
      // Save individual index files
      for (const [indexName, indexData] of Object.entries(indexes)) {
        const indexFile = path.join(indexesDir, `${indexName}.json`);
        await fs.writeJson(indexFile, indexData, { spaces: 2 });
      }
      
      // Create comprehensive analytics summary
      const analyticsSummary = {
        metadata: {
          createdDate: new Date().toISOString(),
          totalItemsAnalyzed: Object.keys(analyticsData).length,
          version: '1.0.0'
        },
        buildArchetypes: Object.keys(indexes.buildArchetypes).map(archetype => ({
          name: archetype,
          itemCount: indexes.buildArchetypes[archetype].length
        })).sort((a, b) => b.itemCount - a.itemCount),
        
        skillSynergies: Object.keys(indexes.skillSynergies).map(skill => ({
          name: skill,
          itemCount: indexes.skillSynergies[skill].length
        })).sort((a, b) => b.itemCount - a.itemCount),
        
        damageTypes: Object.keys(indexes.damageTypes).map(type => ({
          name: type,
          itemCount: indexes.damageTypes[type].length
        })).sort((a, b) => b.itemCount - a.itemCount),
        
        powerDistribution: Object.keys(indexes.powerLevels).map(level => ({
          tier: level,
          itemCount: indexes.powerLevels[level].length
        })),
        
        classDistribution: Object.keys(indexes.classRestricted).map(cls => ({
          class: cls,
          itemCount: indexes.classRestricted[cls].length
        }))
      };
      
      const analyticsSummaryFile = path.join(DATA_DIR, 'analytics_summary.json');
      await fs.writeJson(analyticsSummaryFile, analyticsSummary, { spaces: 2 });
      
      this.logger.info(`📊 Created ${Object.keys(indexes).length} analytics indexes`);
      this.logger.info(`🔍 Analytics summary saved to analytics_summary.json`);
      console.log(`📊 Created ${Object.keys(indexes).length} analytics indexes`);
      console.log(`🔍 Analytics summary saved to analytics_summary.json`);
      
    } catch (error) {
      this.logger.error(`Failed to generate analytics indexes: ${error.message}`);
      console.log(`❌ Failed to generate analytics indexes: ${error.message}`);
    }
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

  /**
   * Enrich items with analytics data
   */
  async enrichItemsWithAnalytics(uniqueItems) {
    const analyticsFile = path.join(OVERRIDES_DIR, 'analytics_unique_items_data.json');
    
    if (!await fs.pathExists(analyticsFile)) {
      this.logger.warn('⚠️  No analytics file found, proceeding without enriched data');
      console.log('⚠️  No analytics file found, proceeding without enriched data');
      return uniqueItems;
    }
    
    try {
      this.logger.info('📊 Loading enriched analytics data...');
      console.log('📊 Loading enriched analytics data...');
      
      const analyticsData = await fs.readJson(analyticsFile);
      this.logger.info(`✅ Loaded analytics for ${Object.keys(analyticsData).length} items`);
      console.log(`✅ Loaded analytics for ${Object.keys(analyticsData).length} items`);
      
      let enrichedCount = 0;
      const enrichedItems = uniqueItems.map(item => {
        const analytics = analyticsData[item.name];
        if (analytics) {
          item.analytics = {
            buildArchetypes: analytics.buildArchetypes || [],
            skillSynergies: analytics.skillSynergies || [],
            damageTypes: analytics.damageTypes || [],
            defensiveMechanisms: analytics.defensiveMechanisms || [],
            buildEnablers: analytics.buildEnablers || [],
            powerLevel: analytics.powerLevel || 'Standard',
            buildTags: analytics.buildTags || []
          };
          enrichedCount++;
        }
        return item;
      });
      
      this.logger.info(`📊 Enriched ${enrichedCount} items with analytics data`);
      console.log(`📊 Enriched ${enrichedCount} items with analytics data`);
      
      return enrichedItems;
      
    } catch (error) {
      this.logger.error(`Failed to load analytics data: ${error.message}`);
      console.log(`❌ Failed to load analytics data: ${error.message}`);
      return uniqueItems;
    }
  }

  /**
   * Save unique items from HTML parsing to files
   */
  async saveHtmlUniqueItemsToFiles(uniqueItems) {
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
        
        const filename = `${cleanName}.json`;
        const filePath = path.join(uniqueItemsDir, filename);
        
        // Remove web-source hash ID and save clean unique item data
        const { id, ...cleanUniqueItem } = uniqueItem;
        await fs.writeJson(filePath, cleanUniqueItem, { spaces: 2 });
        savedCount++;
        
      } catch (error) {
        this.logger.warn(`Failed to save unique item ${uniqueItem.name}: ${error.message}`);
      }
    }
    
    this.logger.info(`Saved ${savedCount} unique items to Data/UniqueItems/`);
    console.log(`✅ Saved ${savedCount} unique items to Data/UniqueItems/`);
  }

  /**
   * Extract subtypes from HTML parsed data
   */
  async extractSubtypesFromHtmlData(subtypes) {
    if (!subtypes || subtypes.length === 0) {
      this.logger.warn('No subtypes found in HTML data');
      return;
    }
    
    let extractedSubtypes = 0;
    
    for (const subtype of subtypes) {
      // Generate a subtype ID (simplified approach)
      const subtypeId = extractedSubtypes + 1000; // Start from 1000 to avoid conflicts
      
      if (!this.gameData.subtypes.has(subtypeId)) {
        this.gameData.subtypes.set(subtypeId, {
          name: subtype
        });
        extractedSubtypes++;
      }
    }
    
    this.logger.info(`✅ Extracted ${extractedSubtypes} individual subtypes from HTML data`);
    console.log(`✅ Extracted ${extractedSubtypes} individual subtypes from HTML data`);
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
            props: override.properties
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