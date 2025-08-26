#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

/**
 * JavaScript Data Parser for Last Epoch Skills
 * Parses structured JavaScript data files instead of HTML
 */
class JsDataParser {
  constructor() {
    this.cacheDir = path.join(__dirname, '..', 'WebData', 'scraped');
    this.outputDir = path.join(__dirname, '..', 'WebData', 'processed');
    this.logger = new ParsingLogger();
  }

  /**
   * Parse unique items from database JavaScript file
   */
  async parseUniqueItemsFromJs() {
    this.logger.info('Starting JavaScript unique items data parsing...');
    
    // Ensure output directory exists
    const uniquesDir = path.join(this.outputDir, 'uniques');
    await fs.ensureDir(uniquesDir);
    
    // Load the item database data
    const itemDbData = await this.loadItemDbData();
    if (!itemDbData) {
      throw new Error('Could not load item database data. Please scrape the JavaScript file first.');
    }
    
    // Extract unique items from the JavaScript object
    const uniqueItems = this.extractUniqueItemsFromData(itemDbData);
    
    this.logger.info(`Extracted ${uniqueItems.length} unique items from JavaScript data`);
    
    const results = [];
    
    for (const uniqueItem of uniqueItems) {
      try {
        // Enhance unique item data with additional processing
        const enhancedUnique = await this.enhanceUniqueItemData(uniqueItem);
        
        // Save individual unique item JSON
        const uniqueFileName = `${uniqueItem.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.json`;
        const uniqueFilePath = path.join(uniquesDir, uniqueFileName);
        await fs.writeJson(uniqueFilePath, enhancedUnique, { spaces: 2 });
        
        results.push(enhancedUnique);
        this.logger.info(`Processed unique item: ${uniqueItem.name}`);
      } catch (error) {
        this.logger.error(`Failed to process unique item ${uniqueItem.name}:`, error);
      }
    }
    
    // Save summary file
    const summaryPath = path.join(uniquesDir, '_uniques_summary.json');
    await fs.writeJson(summaryPath, {
      totalUniques: results.length,
      lastUpdated: new Date().toISOString(),
      dataSource: 'JavaScript extraction',
      uniques: results.map(unique => ({
        id: unique.id,
        name: unique.name,
        baseType: unique.baseType,
        levelRequirement: unique.levelRequirement,
        isLegendary: unique.isLegendary,
        isSetUnique: unique.isSetUnique,
        isFractureUnique: unique.isFractureUnique
      }))
    }, { spaces: 2 });
    
    this.logger.info(`Successfully processed ${results.length} unique items`);
    return results;
  }
  
  /**
   * Parse skills data from JavaScript files
   */
  async parseSkillsFromJs() {
    this.logger.info('Starting JavaScript skills data parsing...');
    
    // Ensure output directory exists
    const skillsDir = path.join(this.outputDir, 'skills');
    await fs.ensureDir(skillsDir);
    
    // Load the skills tree UI data
    const skillTreesData = await this.loadSkillTreesData();
    if (!skillTreesData) {
      throw new Error('Could not load skill trees data. Please scrape the JavaScript files first.');
    }
    
    // Extract skills from the JavaScript object
    const skills = this.extractSkillsFromData(skillTreesData);
    
    this.logger.info(`Extracted ${skills.length} skills from JavaScript data`);
    
    const results = [];
    
    for (const skill of skills) {
      try {
        // Enhance skill data with additional processing
        const enhancedSkill = await this.enhanceSkillData(skill);
        
        // Save individual skill JSON
        const skillFileName = `${skill.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.json`;
        const skillFilePath = path.join(skillsDir, skillFileName);
        await fs.writeJson(skillFilePath, enhancedSkill, { spaces: 2 });
        
        results.push(enhancedSkill);
        this.logger.info(`Processed skill: ${skill.name}`);
      } catch (error) {
        this.logger.error(`Failed to process skill ${skill.name}:`, error);
      }
    }
    
    // Save summary file
    const summaryPath = path.join(skillsDir, '_skills_summary.json');
    await fs.writeJson(summaryPath, {
      totalSkills: results.length,
      lastUpdated: new Date().toISOString(),
      dataSource: 'JavaScript extraction',
      skills: results.map(skill => ({
        id: skill.id,
        name: skill.name,
        class: skill.class,
        nodeCount: skill.nodes ? skill.nodes.length : 0
      }))
    }, { spaces: 2 });
    
    this.logger.info(`Successfully processed ${results.length} skills`);
    return results;
  }
  
  /**
   * Load and parse the item database JavaScript data
   */
  async loadItemDbData() {
    const dbJsFile = path.join(this.cacheDir, 'item_data.json');
    
    if (!await fs.pathExists(dbJsFile)) {
      this.logger.warn('Item database JavaScript data not cached');
      return null;
    }
    
    try {
      const cached = await fs.readJson(dbJsFile);
      let jsContent = cached.data;
      
      // Handle different data formats from scraper
      if (typeof jsContent === 'object' && jsContent.html) {
        jsContent = jsContent.html;
      } else if (typeof jsContent !== 'string') {
        this.logger.warn(`Unexpected jsContent type: ${typeof jsContent}`);
        return null;
      }
      
      // Extract the JavaScript object from the window assignment
      // The format is: window.itemDB={...}
      const startMarker = 'window.itemDB=';
      const startIndex = jsContent.indexOf(startMarker);
      
      if (startIndex === -1) {
        throw new Error('Could not find itemDB data in JavaScript file');
      }
      
      // Extract the JSON object (everything after the = until the end)
      let jsonStr = jsContent.substring(startIndex + startMarker.length);
      
      // Clean up the JSON string more thoroughly
      jsonStr = this.cleanJavaScriptString(jsonStr);
      
      if (!jsonStr || jsonStr.length === 0) {
        throw new Error('Empty JavaScript content after cleanup');
      }
      
      // Try to parse the JavaScript object
      const itemDbData = this.parseJavaScriptObject(jsonStr);
      
      return itemDbData;
      
    } catch (error) {
      this.logger.error(`Failed to parse item database JavaScript data: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Load and parse the skill trees JavaScript data
   */
  async loadSkillTreesData() {
    // Try to load skill data files (there may be multiple)
    const skillDataFiles = ['skill_data_1.json', 'skill_data_2.json'];
    let combinedSkillData = {};
    
    for (const fileName of skillDataFiles) {
      const skillFile = path.join(this.cacheDir, fileName);
      
      if (await fs.pathExists(skillFile)) {
        try {
          const cached = await fs.readJson(skillFile);
          let jsContent = cached.data;
          
          // Handle different data formats from scraper
          if (typeof jsContent === 'object' && jsContent.html) {
            jsContent = jsContent.html;
          } else if (typeof jsContent !== 'string') {
            this.logger.warn(`Unexpected jsContent type in ${fileName}: ${typeof jsContent}`);
            continue;
          }
          
          // Extract skill data - format may vary between files
          // Try multiple common patterns
          const patterns = [
            'window.LESkillTreesUI=',
            'window.skillTrees=',
            'window.skills=',
            'window.SkillData='
          ];
          
          let skillData = null;
          for (const pattern of patterns) {
            const startIndex = jsContent.indexOf(pattern);
            if (startIndex !== -1) {
              let jsonStr = jsContent.substring(startIndex + pattern.length);
              
              // Clean up the JSON string
              jsonStr = this.cleanJavaScriptString(jsonStr);
              
              try {
                skillData = this.parseJavaScriptObject(jsonStr);
                this.logger.info(`Loaded skill data from ${fileName} using pattern: ${pattern}`);
                break;
              } catch (error) {
                this.logger.warn(`Failed to parse skill data with pattern ${pattern}: ${error.message}`);
              }
            }
          }
          
          if (skillData) {
            // Merge skill data from multiple files
            combinedSkillData = { ...combinedSkillData, ...skillData };
          } else {
            this.logger.warn(`No recognizable skill data pattern found in ${fileName}`);
          }
          
        } catch (error) {
          this.logger.error(`Failed to parse skill data from ${fileName}: ${error.message}`);
        }
      }
    }
    
    if (Object.keys(combinedSkillData).length === 0) {
      this.logger.warn('No skill data could be loaded from any skill files');
      return null;
    }
    
    return combinedSkillData;
  }
  
  /**
   * Clean JavaScript string for parsing
   */
  cleanJavaScriptString(jsStr) {
    // Remove line breaks that split properties mid-way
    // This fixes cases where properties like "implicitVal...\nimplicitValue:14" get split
    jsStr = jsStr.replace(/,\s*\n\s*/g, ',');
    jsStr = jsStr.replace(/:\s*\n\s*/g, ':');
    jsStr = jsStr.replace(/\{\s*\n\s*/g, '{');
    jsStr = jsStr.replace(/\[\s*\n\s*/g, '[');
    
    // Remove trailing semicolons
    jsStr = jsStr.replace(/;+\s*$/, '');
    
    // Remove any trailing code after the main object
    // Look for common patterns that indicate end of the main object
    const endMarkers = [
      ';window.',
      '\nwindow.',
      ';var ',
      '\nvar ',
      ';(function',
      '\n(function',
      ';if(',
      '\nif(',
      '</script>',
      '<script>'
    ];
    
    for (const marker of endMarkers) {
      const endIndex = jsStr.indexOf(marker);
      if (endIndex !== -1) {
        jsStr = jsStr.substring(0, endIndex);
        break;
      }
    }
    
    // Trim whitespace
    jsStr = jsStr.trim();
    
    // Additional cleanup for common issues
    // Remove trailing commas before closing braces
    jsStr = jsStr.replace(/,\s*}/g, '}');
    jsStr = jsStr.replace(/,\s*]/g, ']');
    
    return jsStr;
  }
  
  /**
   * Parse JavaScript object notation to a JavaScript object
   * WARNING: Uses eval - only use with trusted data
   */
  parseJavaScriptObject(jsObjectStr) {
    try {
      // First attempt: try as JSON (faster and safer)
      try {
        return JSON.parse(jsObjectStr);
      } catch (jsonError) {
        // Not valid JSON, try JavaScript eval
        this.logger.warn(`JSON parse failed, trying JavaScript eval: ${jsonError.message}`);
      }
      
      // Second attempt: eval as JavaScript
      const safeEval = (code) => {
        return Function('"use strict"; return (' + code + ')')();
      };
      
      return safeEval(jsObjectStr);
      
    } catch (error) {
      // Log the problematic string for debugging (first 500 chars)
      const preview = jsObjectStr.substring(0, 500);
      this.logger.error(`Failed to parse JavaScript object. Preview: ${preview}...`);
      throw new Error(`Failed to parse JavaScript object: ${error.message}`);
    }
  }
  
  /**
   * Extract unique items from the parsed JavaScript data
   */
  extractUniqueItemsFromData(itemDbData) {
    const uniqueItems = [];
    
    // Navigate through the itemDB structure
    // itemDB.itemList.equippable contains the equipment types
    if (!itemDbData.itemList || !itemDbData.itemList.equippable) {
      this.logger.warn('No equippable items found in item database');
      return uniqueItems;
    }
    
    // Iterate through each equipment type
    for (const [equipTypeId, equipType] of Object.entries(itemDbData.itemList.equippable)) {
      if (!equipType.subItems) continue;
      
      // Iterate through each sub-item type
      for (const [subTypeId, subItem] of Object.entries(equipType.subItems)) {
        if (!subItem.uniques || Object.keys(subItem.uniques).length === 0) continue;
        
        // Extract unique items from this sub-item type
        for (const [uniqueId, uniqueData] of Object.entries(subItem.uniques)) {
          try {
            const uniqueItem = {
              id: `${equipTypeId}_${subTypeId}_${uniqueId}`,
              uniqueId: uniqueData.uniqueId,
              name: uniqueData.displayName || 'Unknown',
              baseType: subItem.displayNameKey || `Type_${equipTypeId}_${subTypeId}`,
              equipTypeId: parseInt(equipTypeId),
              subTypeId: parseInt(subTypeId),
              levelRequirement: uniqueData.levelRequirement || 0,
              overrideLevelRequirement: uniqueData.overrideLevelRequirement || 0,
              setId: uniqueData.setId || 0,
              rerollChance: uniqueData.rerollChance || 0,
              noWorldDrops: uniqueData.noWorldDrops || false,
              isFractureUnique: uniqueData.isFractureUnique || false,
              isSetUnique: uniqueData.isSetUnique || false,
              isLegendary: uniqueData.isLegendary || false,
              hideLevelRequirement: uniqueData.hideLevelRequirement || false,
              sprite: uniqueData.sprite || null,
              loreText: uniqueData.loreText || null,
              basicMods: uniqueData.basicMods || [],
              descriptionParts: uniqueData.descriptionParts || [],
              // Include base item information
              baseItemInfo: {
                sprite: subItem.sprite,
                levelRequirement: subItem.levelRequirement,
                cannotDrop: subItem.cannotDrop,
                itemTags: subItem.itemTags,
                implicits: subItem.implicits || [],
                classRequirement: subItem.classRequirement,
                subClassRequirement: subItem.subClassRequirement
              }
            };
            
            uniqueItems.push(uniqueItem);
          } catch (error) {
            this.logger.warn(`Failed to extract unique item ${uniqueId}: ${error.message}`);
          }
        }
      }
    }
    
    return uniqueItems;
  }
  
  /**
   * Extract skills from the parsed JavaScript data
   */
  extractSkillsFromData(skillTreesData) {
    const skills = [];
    
    // Iterate through each skill tree
    for (const [skillId, skillTree] of Object.entries(skillTreesData)) {
      try {
        const skill = {
          id: skillId,
          name: skillTree.name || 'Unknown',
          description: null, // Not available in tree data
          class: this.inferClassFromSkillId(skillId),
          manaCost: null, // Not available in tree data
          cooldown: null, // Not available in tree data
          scalingTags: [], // Not available in tree data
          scalingInfo: [], // Not available in tree data
          rect: skillTree.rect,
          order: skillTree.order,
          inactive: skillTree.inactive,
          nodes: this.extractNodesFromTree(skillTree)
        };
        
        skills.push(skill);
      } catch (error) {
        this.logger.warn(`Failed to extract skill ${skillId}: ${error.message}`);
      }
    }
    
    return skills;
  }
  
  /**
   * Extract nodes from skill tree data
   */
  extractNodesFromTree(skillTree) {
    const nodes = [];
    
    if (skillTree.children && Array.isArray(skillTree.children)) {
      for (const node of skillTree.children) {
        try {
          nodes.push({
            nodeId: node.nodeId || null,
            name: node.name || `Node ${node.nodeId || 'Unknown'}`,
            description: node.description || 'No description available',
            icon: node.icon || null,
            rect: node.rect || null,
            nodeSize: node.nodeSize || 0,
            treeId: node.treeId || null,
            stats: node.stats || 'No stats available'
          });
        } catch (error) {
          this.logger.warn(`Failed to extract node: ${error.message}`);
        }
      }
    }
    
    return nodes;
  }
  
  /**
   * Infer class from skill ID (this is a best guess based on patterns)
   */
  inferClassFromSkillId(skillId) {
    // This is a heuristic approach - we'd need more data to be accurate
    const classHints = {
      'fi': 'Acolyte', // Example patterns, would need to verify
      'en': 'Primalist',
      'fs': 'Sentinel', 
      'wo': 'Primalist',
      'sw': 'Sentinel',
      'tb': 'Sentinel',
      'to': 'Sentinel',
      'ms': 'Mage',
      'fl': 'Mage',
      'me': 'Mage'
    };
    
    const prefix = skillId.substring(0, 2);
    return classHints[prefix] || 'Unknown';
  }
  
  /**
   * Enhance unique item data with additional processing
   */
  async enhanceUniqueItemData(uniqueItem) {
    // Process basic mods to make them more readable
    const processedMods = uniqueItem.basicMods.map(mod => ({
      property: mod.property,
      value: mod.value,
      specialTag: mod.specialTag,
      tags: mod.tags,
      type: mod.type,
      hideStatMod: mod.hideStatMod || false
    }));
    
    // Process description parts
    const processedDescriptions = uniqueItem.descriptionParts.map(desc => ({
      description: desc.description,
      altText: desc.altText,
      setPart: desc.setPart || 0,
      setItemRequirement: desc.setItemRequirement || 0
    }));
    
    return {
      ...uniqueItem,
      basicMods: processedMods,
      descriptionParts: processedDescriptions,
      url: `https://www.lastepochtools.com/items/${uniqueItem.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      lastUpdated: new Date().toISOString()
    };
  }
  
  /**
   * Enhance skill data with additional processing
   */
  async enhanceSkillData(skill) {
    // For now, just return the skill as-is
    // In the future, we could cross-reference with other data sources
    return {
      ...skill,
      url: `https://www.lastepochtools.com/skills/${skill.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Parsing Logger
 */
class ParsingLogger {
  constructor() {
    this.logFile = path.join(__dirname, '..', 'WebData', 'js-parsing.log');
  }
  
  log(level, message, error = null) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [${level.toUpperCase()}] ${message}`;
    
    console.log(logEntry);
    
    // Append to log file
    fs.appendFile(this.logFile, logEntry + '\n').catch(() => {
      // Ignore log file errors
    });
    
    if (error && error.stack) {
      const stackEntry = `${timestamp} [STACK] ${error.stack}`;
      fs.appendFile(this.logFile, stackEntry + '\n').catch(() => {});
    }
  }
  
  info(message) {
    this.log('info', message);
  }
  
  warn(message, error = null) {
    this.log('warn', message, error);
  }
  
  error(message, error = null) {
    this.log('error', message, error);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const parser = new JsDataParser();
  
  try {
    switch (command) {
      case 'skills':
        console.log('🔍 Parsing skills data from JavaScript files...');
        const results = await parser.parseSkillsFromJs();
        console.log(`✅ Successfully parsed ${results.length} skills`);
        console.log(`📁 Output saved to: WebData/processed/skills/`);
        break;
        
      case 'uniques':
        console.log('🔍 Parsing unique items from JavaScript database...');
        const uniqueResults = await parser.parseUniqueItemsFromJs();
        console.log(`✅ Successfully parsed ${uniqueResults.length} unique items`);
        console.log(`📁 Output saved to: WebData/processed/uniques/`);
        break;
        
      default:
        console.log('LELootFilterGen JavaScript Data Parser');
        console.log('');
        console.log('Available commands:');
        console.log('  skills    - Parse skills data from cached JavaScript files');
        console.log('  uniques   - Parse unique items from cached database JavaScript file');
        console.log('');
        console.log('Examples:');
        console.log('  node scripts/js-data-parser.js skills');
        console.log('  node scripts/js-data-parser.js uniques');
    }
    
  } catch (error) {
    console.error('❌ Parser error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { JsDataParser };