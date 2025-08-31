#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * HTML Item Data Parser
 * 
 * Parses the manually downloaded HTML file from Last Epoch Tools
 * to extract unique item information and subtypes.
 */
class HTMLItemParser {
  constructor() {
    this.htmlFile = path.join(__dirname, '..', 'WebData', 'ItemList.html');
    this.outputDir = path.join(__dirname, '..', '..', 'filter-generator', 'Data');
    this.analyticsFile = path.join(__dirname, '..', 'Overrides', 'analytics_unique_items_data.json');
    this.logger = console;
  }

  /**
   * Parse the HTML file and extract item data
   */
  async parseItems() {
    if (!await fs.pathExists(this.htmlFile)) {
      throw new Error(`HTML file not found: ${this.htmlFile}`);
    }

    this.logger.log('📄 Loading HTML file...');
    const htmlContent = await fs.readFile(this.htmlFile, 'utf8');
    
    this.logger.log('🔍 Parsing HTML structure...');
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Find all item cards
    const itemCards = document.querySelectorAll('.item-card');
    this.logger.log(`📊 Found ${itemCards.length} item cards`);

    const uniqueItems = [];
    const subtypes = new Set();

    for (const card of itemCards) {
      try {
        const item = this.parseItemCard(card);
        if (item) {
          uniqueItems.push(item);
          
          // Extract subtype information from item type
          if (item.baseType) {
            subtypes.add(item.baseType.toLowerCase());
          }
        }
      } catch (error) {
        this.logger.warn(`⚠️  Failed to parse item card: ${error.message}`);
      }
    }

    this.logger.log(`✅ Parsed ${uniqueItems.length} unique items`);
    this.logger.log(`📊 Found ${subtypes.size} unique base types`);

    return {
      uniqueItems,
      subtypes: Array.from(subtypes).sort()
    };
  }

  /**
   * Parse individual item card
   */
  parseItemCard(card) {
    // Get item name
    const nameElement = card.querySelector('.item-name');
    if (!nameElement) return null;

    const itemName = nameElement.textContent.trim();
    const itemId = nameElement.getAttribute('item-id');
    
    // Get item type information
    const typeElement = card.querySelector('.item-type');
    if (!typeElement) return null;

    const typeText = typeElement.innerHTML; // Use innerHTML to preserve structure
    const lines = typeText.split('<br>').map(line => line.trim()).filter(line => line);
    
    let category = '';
    let baseType = '';
    let rarity = 'Unique'; // Default since this is unique items page
    
    if (lines.length >= 2) {
      category = lines[0]; // e.g., "Helmet"
      
      // Parse the second line like "Unique <a>Gladiator Helmet</a>"
      const secondLine = lines[1];
      const rarityMatch = secondLine.match(/^(Unique|Set)\s/);
      if (rarityMatch) {
        rarity = rarityMatch[1];
        
        // Extract base type from the link text or remaining text
        const linkMatch = secondLine.match(/>([^<]+)</);
        if (linkMatch) {
          baseType = linkMatch[1];
        } else {
          // Fallback: remove the rarity prefix
          baseType = secondLine.replace(/^(Unique|Set)\s+/, '');
        }
      }
    }

    // Get modifiers
    const modifiers = [];
    const modElements = card.querySelectorAll('.item-mod-unique');
    
    for (const modElement of modElements) {
      let modText = modElement.textContent.trim();
      
      // Clean up modifier text
      modText = modText.replace(/\s+/g, ' ');
      modText = modText.replace(/\n/g, ' ');
      
      if (modText) {
        modifiers.push(modText);
      }
    }

    // Get implicits
    const implicits = [];
    let currentSection = null;
    
    const allMods = card.querySelectorAll('.implicits-title, .modifiers-title, .item-mod-unique');
    for (const element of allMods) {
      if (element.classList.contains('implicits-title')) {
        currentSection = 'implicits';
      } else if (element.classList.contains('modifiers-title')) {
        currentSection = 'modifiers';
      } else if (element.classList.contains('item-mod-unique') && currentSection === 'implicits') {
        let implicitText = element.textContent.trim();
        implicitText = implicitText.replace(/\s+/g, ' ');
        if (implicitText) {
          implicits.push(implicitText);
        }
      }
    }

    // Get level requirement
    let levelRequirement = 1;
    const levelElement = card.querySelector('.item-req');
    if (levelElement) {
      const levelMatch = levelElement.textContent.match(/Requires Level:\s*(\d+)/);
      if (levelMatch) {
        levelRequirement = parseInt(levelMatch[1]);
      }
    }

    // Get class requirement
    let classRequirement = null;
    const classElement = card.querySelector('.item-req2');
    if (classElement) {
      const classMatch = classElement.textContent.match(/Requires Class:\s*(.+)/);
      if (classMatch) {
        classRequirement = classMatch[1].trim();
      }
    }

    // Get lore text
    let lore = '';
    const loreElement = card.querySelector('.item-lore');
    if (loreElement) {
      lore = loreElement.textContent.trim();
    }

    // Get rarity information from "Obtained from" sections
    let dropRarity = null;
    const droppedFromElements = card.querySelectorAll('.dropped-from');
    
    for (const droppedFromElement of droppedFromElements) {
      // Look for Random Drop entries with rarity information
      const randomDrops = droppedFromElement.querySelectorAll('.random-drop');
      
      for (const randomDrop of randomDrops) {
        // Find the parent li element to get the full context
        const listItem = randomDrop.closest('li');
        if (listItem) {
          // Look for drop-chance span with rarity info
          const dropChanceElement = listItem.querySelector('.drop-chance');
          if (dropChanceElement) {
            const fullText = dropChanceElement.textContent.trim();
            if (fullText && fullText !== 'Random Drop') {
              // Extract only the rarity part, excluding "Reroll Chance" and other info
              const rarityMatch = fullText.match(/^(Extremely rare|Very rare|Rare|Uncommon|Common)/i);
              if (rarityMatch) {
                dropRarity = rarityMatch[1];
                break; // Use the first rarity we find
              }
            }
          }
        }
      }
      
      if (dropRarity) break; // Stop searching once we find a rarity
    }

    return {
      id: itemId || this.generateId(itemName),
      name: itemName,
      category: category,
      baseType: baseType,
      levelRequirement: levelRequirement,
      classRequirement: classRequirement,
      implicits: implicits,
      modifiers: modifiers,
      lore: lore,
      dropRarity: dropRarity
    };
  }

  /**
   * Generate a simple ID for items without one
   */
  generateId(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 20);
  }

  /**
   * Load enriched analytics data
   */
  async loadAnalyticsData() {
    if (!await fs.pathExists(this.analyticsFile)) {
      this.logger.warn('⚠️  No analytics file found, proceeding without enriched data');
      return {};
    }
    
    this.logger.log('📊 Loading enriched analytics data...');
    const analytics = await fs.readJson(this.analyticsFile);
    this.logger.log(`✅ Loaded analytics for ${Object.keys(analytics).length} items`);
    return analytics;
  }

  /**
   * Save parsed data to files
   */
  async saveData(data) {
    await fs.ensureDir(this.outputDir);
    
    // Load analytics data to enrich items
    const analyticsData = await this.loadAnalyticsData();
    
    // Save unique items
    const uniqueItemsDir = path.join(this.outputDir, 'UniqueItems');
    await fs.ensureDir(uniqueItemsDir);
    
    this.logger.log('💾 Saving unique items with enriched analytics...');
    
    let enrichedCount = 0;
    for (const item of data.uniqueItems) {
      // Add analytics data if available
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
      
      const fileName = `${item.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.json`;
      const filePath = path.join(uniqueItemsDir, fileName);
      
      await fs.writeJson(filePath, item, { spaces: 2 });
    }
    
    this.logger.log(`📊 Enriched ${enrichedCount} items with analytics data`);

    // Save subtypes list
    const subtypesFile = path.join(this.outputDir, 'html_subtypes.json');
    await fs.writeJson(subtypesFile, data.subtypes, { spaces: 2 });

    // Create analytics indexes for efficient querying
    await this.createAnalyticsIndexes(data.uniqueItems, analyticsData);

    // Save summary
    const summary = {
      parseDate: new Date().toISOString(),
      totalUniqueItems: data.uniqueItems.length,
      totalSubtypes: data.subtypes.length,
      enrichedItems: enrichedCount,
      categories: [...new Set(data.uniqueItems.map(item => item.category))].sort()
    };

    const summaryFile = path.join(this.outputDir, 'html_parse_summary.json');
    await fs.writeJson(summaryFile, summary, { spaces: 2 });

    this.logger.log(`✅ Saved ${data.uniqueItems.length} unique items to ${uniqueItemsDir}`);
    this.logger.log(`✅ Saved ${data.subtypes.length} subtypes to ${subtypesFile}`);
    this.logger.log(`📊 Parse summary saved to ${summaryFile}`);

    return summary;
  }

  /**
   * Create analytics indexes for efficient querying
   */
  async createAnalyticsIndexes(uniqueItems, analyticsData) {
    this.logger.log('🔍 Creating analytics indexes...');
    
    const indexesDir = path.join(this.outputDir, 'indexes');
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
    
    // Build indexes
    for (const item of uniqueItems) {
      const analytics = analyticsData[item.name];
      if (!analytics) continue;
      
      const itemRef = {
        name: item.name,
        category: item.category,
        levelRequirement: item.levelRequirement,
        classRequirement: item.classRequirement,
        dropRarity: item.dropRarity
      };
      
      // Build archetype index
      for (const archetype of analytics.buildArchetypes) {
        if (!indexes.buildArchetypes[archetype]) indexes.buildArchetypes[archetype] = [];
        indexes.buildArchetypes[archetype].push(itemRef);
      }
      
      // Skill synergy index
      for (const skill of analytics.skillSynergies) {
        if (!indexes.skillSynergies[skill]) indexes.skillSynergies[skill] = [];
        indexes.skillSynergies[skill].push(itemRef);
      }
      
      // Damage type index
      for (const damageType of analytics.damageTypes) {
        if (!indexes.damageTypes[damageType]) indexes.damageTypes[damageType] = [];
        indexes.damageTypes[damageType].push(itemRef);
      }
      
      // Defensive mechanism index
      for (const mechanism of analytics.defensiveMechanisms) {
        if (!indexes.defensiveMechanisms[mechanism]) indexes.defensiveMechanisms[mechanism] = [];
        indexes.defensiveMechanisms[mechanism].push(itemRef);
      }
      
      // Build enabler index
      for (const enabler of analytics.buildEnablers) {
        if (!indexes.buildEnablers[enabler]) indexes.buildEnablers[enabler] = [];
        indexes.buildEnablers[enabler].push(itemRef);
      }
      
      // Power level index
      const powerLevel = analytics.powerLevel;
      if (!indexes.powerLevels[powerLevel]) indexes.powerLevels[powerLevel] = [];
      indexes.powerLevels[powerLevel].push(itemRef);
      
      // Build tag index
      for (const tag of analytics.buildTags) {
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
    
    const analyticsSummaryFile = path.join(this.outputDir, 'analytics_summary.json');
    await fs.writeJson(analyticsSummaryFile, analyticsSummary, { spaces: 2 });
    
    this.logger.log(`📊 Created ${Object.keys(indexes).length} analytics indexes`);
    this.logger.log(`🔍 Analytics summary saved to analytics_summary.json`);
  }

  /**
   * Main parsing method
   */
  async parse() {
    try {
      this.logger.log('🚀 Starting HTML item parsing...');
      
      const data = await this.parseItems();
      const summary = await this.saveData(data);
      
      this.logger.log('\n📊 HTML Parsing Summary:');
      this.logger.log(`   Unique Items: ${summary.totalUniqueItems}`);
      this.logger.log(`   Base Types: ${summary.totalSubtypes}`);
      this.logger.log(`   Categories: ${summary.categories.join(', ')}`);
      this.logger.log(`   Source: manual_html`);
      
      this.logger.log('\n🎉 HTML parsing complete!');
      return summary;
      
    } catch (error) {
      this.logger.error('❌ HTML parsing failed:', error.message);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  try {
    const parser = new HTMLItemParser();
    await parser.parse();
  } catch (error) {
    console.error('\n💥 Parsing failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { HTMLItemParser };