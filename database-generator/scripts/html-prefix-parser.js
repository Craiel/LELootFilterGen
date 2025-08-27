#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * HTML Prefix Data Parser
 * 
 * Parses the manually downloaded HTML file from Last Epoch Tools
 * to extract prefix affix information.
 */
class HTMLPrefixParser {
  constructor() {
    this.htmlFile = path.join(__dirname, '..', 'WebData', 'Prefixes.html');
    this.outputDir = path.join(__dirname, '..', 'Data');
    this.logger = console;
  }

  /**
   * Parse the HTML file and extract prefix data
   */
  async parsePrefixes() {
    if (!await fs.pathExists(this.htmlFile)) {
      throw new Error(`HTML file not found: ${this.htmlFile}`);
    }

    this.logger.log('📄 Loading Prefixes HTML file...');
    const htmlContent = await fs.readFile(this.htmlFile, 'utf8');
    
    this.logger.log('🔍 Parsing HTML structure...');
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Find all affix cards - could be .affix-card, .item-card, or similar
    const affixCards = document.querySelectorAll('.affix-card, .item-card, .prefix-card');
    this.logger.log(`📊 Found ${affixCards.length} prefix cards`);

    const prefixes = [];

    for (const card of affixCards) {
      try {
        const affix = this.parsePrefixCard(card);
        if (affix) {
          prefixes.push(affix);
        }
      } catch (error) {
        this.logger.warn(`⚠️  Failed to parse prefix card: ${error.message}`);
      }
    }

    this.logger.log(`✅ Parsed ${prefixes.length} prefixes`);

    return {
      prefixes
    };
  }

  /**
   * Parse individual prefix card
   */
  parsePrefixCard(card) {
    // Get affix name - could be in various elements
    let affixName = '';
    const nameSelectors = ['.affix-name', '.item-name', '.prefix-name', 'h3', 'h4'];
    
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
      type: 'prefix',
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
    
    // Save prefixes
    const prefixesDir = path.join(this.outputDir, 'Prefixes');
    await fs.ensureDir(prefixesDir);
    
    this.logger.log('💾 Saving prefixes...');
    
    for (const prefix of data.prefixes) {
      const fileName = `${prefix.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.json`;
      const filePath = path.join(prefixesDir, fileName);
      
      await fs.writeJson(filePath, prefix, { spaces: 2 });
    }

    // Save summary
    const summary = {
      parseDate: new Date().toISOString(),
      totalPrefixes: data.prefixes.length,
      idolPrefixes: data.prefixes.filter(p => p.isIdolAffix).length,
      itemPrefixes: data.prefixes.filter(p => !p.isIdolAffix).length,
      tieredPrefixes: data.prefixes.filter(p => p.tier !== null).length
    };

    const summaryFile = path.join(this.outputDir, 'html_prefixes_parse_summary.json');
    await fs.writeJson(summaryFile, summary, { spaces: 2 });

    this.logger.log(`✅ Saved ${data.prefixes.length} prefixes to ${prefixesDir}`);
    this.logger.log(`📊 Parse summary saved to ${summaryFile}`);

    return summary;
  }

  /**
   * Main parsing method
   */
  async parse() {
    try {
      this.logger.log('🚀 Starting HTML prefix parsing...');
      
      const data = await this.parsePrefixes();
      const summary = await this.saveData(data);
      
      this.logger.log('\n📊 HTML Prefix Parsing Summary:');
      this.logger.log(`   Total Prefixes: ${summary.totalPrefixes}`);
      this.logger.log(`   Idol Prefixes: ${summary.idolPrefixes}`);
      this.logger.log(`   Item Prefixes: ${summary.itemPrefixes}`);
      this.logger.log(`   Tiered Prefixes: ${summary.tieredPrefixes}`);
      
      this.logger.log('\n🎉 HTML prefix parsing complete!');
      return summary;
      
    } catch (error) {
      this.logger.error('❌ HTML prefix parsing failed:', error.message);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  try {
    const parser = new HTMLPrefixParser();
    await parser.parse();
  } catch (error) {
    console.error('\n💥 Prefix parsing failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { HTMLPrefixParser };