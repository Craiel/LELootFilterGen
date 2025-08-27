#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * HTML Affix Data Parser
 * 
 * Unified parser for both prefix and suffix affix data from Last Epoch Tools.
 * Parses manually downloaded HTML files to extract affix information.
 */
class HTMLAffixParser {
  constructor(type = 'prefixes') {
    this.type = type.toLowerCase();
    this.htmlFile = path.join(__dirname, '..', 'WebData', `${this.type.charAt(0).toUpperCase() + this.type.slice(1)}.html`);
    this.outputDir = path.join(__dirname, '..', '..', 'filter-generator', 'Data');
    this.logger = console;
  }

  /**
   * Parse the HTML file and extract affix data
   */
  async parseAffixes() {
    if (!await fs.pathExists(this.htmlFile)) {
      throw new Error(`HTML file not found: ${this.htmlFile}`);
    }

    this.logger.log(`📄 Loading ${this.type.charAt(0).toUpperCase() + this.type.slice(1)} HTML file...`);
    const htmlContent = await fs.readFile(this.htmlFile, 'utf8');
    
    this.logger.log('🔍 Parsing HTML structure...');
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Find all affix cards - could be .affix-card, .item-card, or similar
    const affixCards = document.querySelectorAll('.affix-card, .item-card, .prefix-card, .suffix-card');
    this.logger.log(`📊 Found ${affixCards.length} ${this.type} cards`);

    const affixes = [];

    for (const card of affixCards) {
      try {
        const affix = this.parseAffixCard(card);
        if (affix) {
          affixes.push(affix);
        }
      } catch (error) {
        this.logger.warn(`⚠️  Failed to parse ${this.type.slice(0, -1)} card: ${error.message}`);
      }
    }

    this.logger.log(`✅ Parsed ${affixes.length} ${this.type}`);

    return {
      [this.type]: affixes
    };
  }

  /**
   * Parse individual affix card
   */
  parseAffixCard(card) {
    // Get affix name - could be in various elements
    let affixName = '';
    const nameSelectors = ['.affix-name', '.item-name', '.prefix-name', '.suffix-name', 'h3', 'h4'];
    
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

    // Get detailed modification columns (the key enhancement)
    const modificationColumns = this.extractModificationColumns(card);

    // Only include properties we have reliable data for
    const result = {
      id: affixId || this.generateId(affixName),
      name: affixName,
      modificationColumns: modificationColumns,
      isIdolAffix: this.isLikelyIdolAffix(affixName, description)
    };

    // Only add description if we actually have content
    if (description && description.trim().length > 0) {
      result.description = description.trim();
    }

    return result;
  }

  /**
   * Extract detailed modification columns from affix card
   * Returns column-based structure with tier names and values for each column
   */
  extractModificationColumns(card) {
    try {
      // Try the new tier-table structure first
      const tierTable = card.querySelector('.tier-table');
      if (tierTable) {
        const result = this.extractFromTierTable(tierTable);
        if (Object.keys(result).length > 0) {
          return result;
        }
      }

      // Fallback: Try to convert old headers/rows format to column format
      const oldFormat = this.extractOldFormat(card);
      if (oldFormat.headers && oldFormat.headers.length > 0) {
        return this.convertToColumnFormat(oldFormat);
      }

      return {};
      
    } catch (error) {
      this.logger.warn(`Failed to extract modification columns: ${error.message}`);
      return {};
    }
  }

  /**
   * Extract from the new tier-table HTML structure
   */
  extractFromTierTable(tierTable) {
    // Find the header row to get column names
    const tierHeader = tierTable.querySelector('.tier-header, .affix.tier-header');
    if (!tierHeader) {
      return {};
    }

    // Extract column headers from tier-header
    const headerElements = tierHeader.querySelectorAll('.affix-tier-range');
    const columnNames = [];
    
    for (const headerElement of headerElements) {
      // Get the text before <br> or <span class="mod-type">
      const headerText = headerElement.childNodes[0]?.textContent?.trim();
      if (headerText) {
        columnNames.push(headerText);
      }
    }

    if (columnNames.length === 0) {
      return {};
    }

    // Initialize the result object with Tier column first
    const result = {
      'Tier': []
    };

    // Initialize other columns
    for (const columnName of columnNames) {
      result[columnName] = [];
    }

    // Extract data from each tier row
    const tierRows = tierTable.querySelectorAll('.affix[tier]');
    
    for (const tierRow of tierRows) {
      // Get tier name
      const tierNameElement = tierRow.querySelector('.affix-tier-name');
      const tierName = tierNameElement?.textContent?.trim();
      
      if (tierName) {
        result['Tier'].push(tierName);
      }

      // Get values for each column
      const valueElements = tierRow.querySelectorAll('.affix-tier-range');
      
      for (let i = 0; i < columnNames.length; i++) {
        const columnName = columnNames[i];
        const valueElement = valueElements[i];
        
        if (valueElement) {
          // Extract mod-value spans or fallback to text content
          const modValues = valueElement.querySelectorAll('.mod-value');
          let value = '';
          
          if (modValues.length === 1) {
            // Single value
            value = modValues[0].textContent.trim();
          } else if (modValues.length === 2) {
            // Range value
            value = `${modValues[0].textContent.trim()} to ${modValues[1].textContent.trim()}`;
          } else {
            // Fallback to text content
            value = valueElement.textContent.trim();
          }
          
          result[columnName].push(value);
        } else {
          // No value for this column in this tier
          result[columnName].push('');
        }
      }
    }

    return result;
  }

  /**
   * Extract using old method for compatibility
   */
  extractOldFormat(card) {
    // Look for mod-type and affix-tier-range patterns
    const modTypeElements = card.querySelectorAll('.mod-type');
    const tierRangeElements = card.querySelectorAll('.affix-tier-range');
    
    const headers = [];
    const rows = [];
    
    // Extract headers
    for (let i = 0; i < Math.min(modTypeElements.length, tierRangeElements.length); i++) {
      const tierRange = tierRangeElements[i];
      if (tierRange) {
        // Get the text before <br> or <span class="mod-type">
        let headerText = tierRange.childNodes[0]?.textContent?.trim();
        if (headerText && !headers.includes(headerText)) {
          headers.push(headerText);
        }
      }
    }

    // Extract values - look for all mod-value elements in the card
    const allModValues = card.querySelectorAll('.mod-value');
    const values = [];
    
    for (const modValue of allModValues) {
      const value = modValue.textContent.trim();
      if (value && value.length > 0) {
        values.push(value);
      }
    }

    // Try to organize values into rows
    if (values.length > 0) {
      for (const value of values) {
        rows.push([value]);
      }
    }

    return { headers, rows };
  }

  /**
   * Convert old headers/rows format to column format
   */
  convertToColumnFormat(oldFormat) {
    const { headers, rows } = oldFormat;
    
    if (!headers || headers.length === 0) {
      return {};
    }

    const result = {};
    
    // Add headers as columns
    for (const header of headers) {
      result[header] = [];
    }

    // If we have rows, try to organize them
    if (rows && rows.length > 0) {
      // For single column case
      if (headers.length === 1) {
        const headerName = headers[0];
        for (const row of rows) {
          if (row && row.length > 0) {
            result[headerName].push(row[0]);
          }
        }
      } else {
        // For multiple columns, try to distribute values evenly
        let valueIndex = 0;
        for (const row of rows) {
          for (let i = 0; i < headers.length && valueIndex < row.length; i++) {
            const headerName = headers[i];
            if (row[valueIndex]) {
              result[headerName].push(row[valueIndex]);
            }
            valueIndex++;
          }
        }
      }
    }

    return result;
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
    
    // Save affixes to individual files
    const affixesDir = path.join(this.outputDir, this.type.charAt(0).toUpperCase() + this.type.slice(1));
    await fs.ensureDir(affixesDir);
    
    this.logger.log(`💾 Saving ${this.type}...`);
    
    const affixes = data[this.type] || [];
    for (const affix of affixes) {
      const fileName = `${affix.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.json`;
      const filePath = path.join(affixesDir, fileName);
      
      await fs.writeJson(filePath, affix, { spaces: 2 });
    }

    this.logger.log(`✅ Saved ${affixes.length} ${this.type} to ${affixesDir}`);

    return {
      [`total${this.type.charAt(0).toUpperCase() + this.type.slice(1)}`]: affixes.length,
      [`idol${this.type.charAt(0).toUpperCase() + this.type.slice(1)}`]: affixes.filter(a => a.isIdolAffix).length,
      [`item${this.type.charAt(0).toUpperCase() + this.type.slice(1)}`]: affixes.filter(a => !a.isIdolAffix).length
    };
  }

  /**
   * Main parsing method
   */
  async parse() {
    try {
      this.logger.log(`🚀 Starting HTML ${this.type} parsing...`);
      
      const data = await this.parseAffixes();
      const summary = await this.saveData(data);
      
      this.logger.log(`\n📊 HTML ${this.type.charAt(0).toUpperCase() + this.type.slice(1)} Parsing Summary:`);
      this.logger.log(`   Total ${this.type.charAt(0).toUpperCase() + this.type.slice(1)}: ${summary[`total${this.type.charAt(0).toUpperCase() + this.type.slice(1)}`]}`);
      this.logger.log(`   Idol ${this.type.charAt(0).toUpperCase() + this.type.slice(1)}: ${summary[`idol${this.type.charAt(0).toUpperCase() + this.type.slice(1)}`]}`);
      this.logger.log(`   Item ${this.type.charAt(0).toUpperCase() + this.type.slice(1)}: ${summary[`item${this.type.charAt(0).toUpperCase() + this.type.slice(1)}`]}`);
      
      this.logger.log(`\n🎉 HTML ${this.type} parsing complete!`);
      return summary;
      
    } catch (error) {
      this.logger.error(`❌ HTML ${this.type} parsing failed:`, error.message);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  try {
    const type = process.argv[2] || 'prefixes';
    if (!['prefixes', 'suffixes'].includes(type.toLowerCase())) {
      console.error('Usage: node html-affix-parser.js [prefixes|suffixes]');
      process.exit(1);
    }
    
    const parser = new HTMLAffixParser(type);
    await parser.parse();
  } catch (error) {
    console.error(`\n💥 ${process.argv[2] || 'Affix'} parsing failed:`, error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { HTMLAffixParser };