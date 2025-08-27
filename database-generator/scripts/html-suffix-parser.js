#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * HTML Suffix Data Parser
 * 
 * Parses the manually downloaded HTML file from Last Epoch Tools
 * to extract suffix affix information.
 */
class HTMLSuffixParser {
  constructor() {
    this.htmlFile = path.join(__dirname, '..', 'WebData', 'Suffixes.html');
    this.outputDir = path.join(__dirname, '..', '..', 'filter-generator', 'Data');
    this.logger = console;
  }

  /**
   * Parse the HTML file and extract suffix data
   */
  async parseSuffixes() {
    if (!await fs.pathExists(this.htmlFile)) {
      throw new Error(`HTML file not found: ${this.htmlFile}`);
    }

    this.logger.log('📄 Loading Suffixes HTML file...');
    const htmlContent = await fs.readFile(this.htmlFile, 'utf8');
    
    this.logger.log('🔍 Parsing HTML structure...');
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Find all affix cards - could be .affix-card, .item-card, or similar
    const affixCards = document.querySelectorAll('.affix-card, .item-card, .suffix-card');
    this.logger.log(`📊 Found ${affixCards.length} suffix cards`);

    const suffixes = [];

    for (const card of affixCards) {
      try {
        const affix = this.parseSuffixCard(card);
        if (affix) {
          suffixes.push(affix);
        }
      } catch (error) {
        this.logger.warn(`⚠️  Failed to parse suffix card: ${error.message}`);
      }
    }

    this.logger.log(`✅ Parsed ${suffixes.length} suffixes`);

    return {
      suffixes
    };
  }

  /**
   * Parse individual suffix card
   */
  parseSuffixCard(card) {
    // Get affix name - could be in various elements
    let affixName = '';
    const nameSelectors = ['.affix-name', '.item-name', '.suffix-name', 'h3', 'h4'];
    
    for (const selector of nameSelectors) {
      const nameElement = card.querySelector(selector);
      if (nameElement) {
        affixName = nameElement.textContent.trim();
        break;
      }
    }
    
    if (!affixName) return null;

    // Get affix ID if available
    const affixId = card.getAttribute('affix-id') || 
                   card.getAttribute('data-affix-id') || 
                   card.getAttribute('id');

    // Get affix description/effect
    let description = '';
    const descSelectors = ['.affix-description', '.affix-effect', '.item-mod', '.description'];
    
    for (const selector of descSelectors) {
      const descElement = card.querySelector(selector);
      if (descElement) {
        description = descElement.textContent.trim();
        break;
      }
    }

    // Get tier information if available
    let tier = null;
    const tierSelectors = ['.affix-tier', '.tier', '.affix-level'];
    
    for (const selector of tierSelectors) {
      const tierElement = card.querySelector(selector);
      if (tierElement) {
        const tierMatch = tierElement.textContent.match(/(\d+)/);
        if (tierMatch) {
          tier = parseInt(tierMatch[1]);
        }
        break;
      }
    }

    // Get applicable item types
    const itemTypes = [];
    const itemTypeSelectors = ['.affix-item-types', '.applicable-types', '.item-types'];
    
    for (const selector of itemTypeSelectors) {
      const typeElement = card.querySelector(selector);
      if (typeElement) {
        const types = typeElement.textContent.split(',').map(t => t.trim()).filter(t => t);
        itemTypes.push(...types);
        break;
      }
    }

    // Get minimum and maximum values if available
    let minValue = null;
    let maxValue = null;
    
    const valueMatch = description.match(/(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)/);
    if (valueMatch) {
      minValue = parseFloat(valueMatch[1]);
      maxValue = parseFloat(valueMatch[2]);
    }

    return {
      id: affixId || this.generateId(affixName),
      name: affixName,
      description: description,
      type: 'suffix',
      tier: tier,
      itemTypes: itemTypes,
      minValue: minValue,
      maxValue: maxValue,
      isIdolAffix: this.isLikelyIdolAffix(affixName, description)
    };
  }

  /**
   * Determine if an affix is likely for idols
   */
  isLikelyIdolAffix(name, description) {
    const idolKeywords = ['idol', 'blessing', 'passive', 'summon', 'minion', 'companion'];
    const searchText = `${name} ${description}`.toLowerCase();
    
    return idolKeywords.some(keyword => searchText.includes(keyword));
  }

  /**
   * Generate a simple ID for affixes without one
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
    
    // Save suffixes
    const suffixesDir = path.join(this.outputDir, 'Suffixes');
    await fs.ensureDir(suffixesDir);
    
    this.logger.log('💾 Saving suffixes...');
    
    for (const suffix of data.suffixes) {
      const fileName = `${suffix.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.json`;
      const filePath = path.join(suffixesDir, fileName);
      
      await fs.writeJson(filePath, suffix, { spaces: 2 });
    }

    this.logger.log(`✅ Saved ${data.suffixes.length} suffixes to ${suffixesDir}`);

    return {
      totalSuffixes: data.suffixes.length,
      idolSuffixes: data.suffixes.filter(s => s.isIdolAffix).length,
      itemSuffixes: data.suffixes.filter(s => !s.isIdolAffix).length
    };
  }

  /**
   * Main parsing method
   */
  async parse() {
    try {
      this.logger.log('🚀 Starting HTML suffix parsing...');
      
      const data = await this.parseSuffixes();
      const summary = await this.saveData(data);
      
      this.logger.log('\n📊 HTML Suffix Parsing Summary:');
      this.logger.log(`   Total Suffixes: ${summary.totalSuffixes}`);
      this.logger.log(`   Idol Suffixes: ${summary.idolSuffixes}`);
      this.logger.log(`   Item Suffixes: ${summary.itemSuffixes}`);
      
      this.logger.log('\n🎉 HTML suffix parsing complete!');
      return summary;
      
    } catch (error) {
      this.logger.error('❌ HTML suffix parsing failed:', error.message);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  try {
    const parser = new HTMLSuffixParser();
    await parser.parse();
  } catch (error) {
    console.error('\n💥 Suffix parsing failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { HTMLSuffixParser };