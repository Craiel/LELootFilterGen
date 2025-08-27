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
    this.outputDir = path.join(__dirname, '..', 'Data');
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

    return {
      id: itemId || this.generateId(itemName),
      name: itemName,
      category: category,
      baseType: baseType,
      levelRequirement: levelRequirement,
      classRequirement: classRequirement,
      implicits: implicits,
      modifiers: modifiers,
      lore: lore
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
   * Save parsed data to files
   */
  async saveData(data) {
    await fs.ensureDir(this.outputDir);
    
    // Save unique items
    const uniqueItemsDir = path.join(this.outputDir, 'UniqueItems');
    await fs.ensureDir(uniqueItemsDir);
    
    this.logger.log('💾 Saving unique items...');
    
    for (const item of data.uniqueItems) {
      const fileName = `${item.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.json`;
      const filePath = path.join(uniqueItemsDir, fileName);
      
      await fs.writeJson(filePath, item, { spaces: 2 });
    }

    // Save subtypes list
    const subtypesFile = path.join(this.outputDir, 'html_subtypes.json');
    await fs.writeJson(subtypesFile, data.subtypes, { spaces: 2 });

    // Save summary
    const summary = {
      parseDate: new Date().toISOString(),
      totalUniqueItems: data.uniqueItems.length,
      totalSubtypes: data.subtypes.length,
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