#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { JSDOM } = require('jsdom');
const paths = require('../config/paths');

/**
 * HTML Set Data Parser
 * 
 * Parses the manually downloaded HTML file from Last Epoch Tools
 * to extract set item information.
 */
class HTMLSetParser {
  constructor() {
    this.htmlFile = paths.HTML_FILES.sets;
    this.outputDir = paths.DATA_DIR;
    this.logger = console;
  }

  /**
   * Parse the HTML file and extract set data
   */
  async parseSetItems() {
    if (!await fs.pathExists(this.htmlFile)) {
      throw new Error(`HTML file not found: ${this.htmlFile}`);
    }

    this.logger.log('📄 Loading Sets HTML file...');
    const htmlContent = await fs.readFile(this.htmlFile, 'utf8');
    
    this.logger.log('🔍 Parsing HTML structure...');
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Find all set item cards
    const setItemCards = document.querySelectorAll('.item-card.item-itemset');
    this.logger.log(`📊 Found ${setItemCards.length} set item cards`);

    const setItems = [];

    for (const card of setItemCards) {
      try {
        const item = this.parseSetItemCard(card);
        if (item) {
          setItems.push(item);
        }
      } catch (error) {
        this.logger.warn(`⚠️  Failed to parse set item card: ${error.message}`);
      }
    }

    this.logger.log(`✅ Parsed ${setItems.length} set items`);

    return {
      setItems
    };
  }

  /**
   * Parse individual set item card
   */
  parseSetItemCard(card) {
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
    let setName = '';
    
    if (lines.length >= 2) {
      category = lines[0]; // e.g., "Helmet"
      
      // Parse the second line like "Set <a>Gladiator Helmet</a>"
      const secondLine = lines[1];
      const setMatch = secondLine.match(/^Set\s/);
      if (setMatch) {
        // Extract base type from the link text or remaining text
        const linkMatch = secondLine.match(/>([^<]+)</);
        if (linkMatch) {
          baseType = linkMatch[1];
        } else {
          // Fallback: remove the set prefix
          baseType = secondLine.replace(/^Set\s+/, '');
        }
      }
    }

    // Get set name from the set info section
    const setInfoElement = card.querySelector('.item-set-info');
    if (setInfoElement) {
      const setNameElement = setInfoElement.querySelector('.item-set-name');
      if (setNameElement) {
        setName = setNameElement.textContent.trim();
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

    // Get set bonuses
    const setBonuses = [];
    const setBonusElements = card.querySelectorAll('.item-set-bonus');
    for (const bonusElement of setBonusElements) {
      const bonusText = bonusElement.textContent.trim();
      if (bonusText) {
        setBonuses.push(bonusText);
      }
    }

    return {
      id: itemId || this.generateId(itemName),
      name: itemName,
      category: category,
      baseType: baseType,
      setName: setName,
      levelRequirement: levelRequirement,
      classRequirement: classRequirement,
      implicits: implicits,
      modifiers: modifiers,
      setBonuses: setBonuses,
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
    
    // Save set items
    const setItemsDir = path.join(this.outputDir, 'SetItems');
    await fs.ensureDir(setItemsDir);
    
    this.logger.log('💾 Saving set items...');
    
    for (const item of data.setItems) {
      const fileName = `${item.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.json`;
      const filePath = path.join(setItemsDir, fileName);
      
      await fs.writeJson(filePath, item, { spaces: 2 });
    }

    // Save summary
    const summary = {
      parseDate: new Date().toISOString(),
      totalSetItems: data.setItems.length,
      categories: [...new Set(data.setItems.map(item => item.category))].sort(),
      setNames: [...new Set(data.setItems.map(item => item.setName).filter(Boolean))].sort()
    };

    const summaryFile = path.join(this.outputDir, 'html_sets_parse_summary.json');
    await fs.writeJson(summaryFile, summary, { spaces: 2 });

    this.logger.log(`✅ Saved ${data.setItems.length} set items to ${setItemsDir}`);
    this.logger.log(`📊 Parse summary saved to ${summaryFile}`);

    return summary;
  }

  /**
   * Main parsing method
   */
  async parse() {
    try {
      this.logger.log('🚀 Starting HTML set parsing...');
      
      const data = await this.parseSetItems();
      const summary = await this.saveData(data);
      
      this.logger.log('\n📊 HTML Set Parsing Summary:');
      this.logger.log(`   Set Items: ${summary.totalSetItems}`);
      this.logger.log(`   Categories: ${summary.categories.join(', ')}`);
      this.logger.log(`   Set Names: ${summary.setNames.join(', ')}`);
      
      this.logger.log('\n🎉 HTML set parsing complete!');
      return summary;
      
    } catch (error) {
      this.logger.error('❌ HTML set parsing failed:', error.message);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  try {
    const parser = new HTMLSetParser();
    await parser.parse();
  } catch (error) {
    console.error('\n💥 Set parsing failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { HTMLSetParser };