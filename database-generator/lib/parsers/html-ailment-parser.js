#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { JSDOM } = require('jsdom');
const paths = require('../config/paths');

/**
 * HTML Ailment Data Parser
 * 
 * Parses the scraped Ailments.json file to extract ailment data
 * for the game database.
 */
class HTMLAilmentParser {
  constructor() {
    this.ailmentDataFile = paths.JSON_FILES.ailments;
    this.outputDir = paths.DATA_DIR;
    this.logger = console;
    this.globalTags = new Set(); // Track all unique tags
  }

  /**
   * Parse the Ailments.json file and extract ailment data
   */
  async parseAilments() {
    if (!await fs.pathExists(this.ailmentDataFile)) {
      throw new Error(`Ailments data file not found: ${this.ailmentDataFile}`);
    }

    this.logger.log('📄 Loading Ailments.json file...');
    const ailmentData = await fs.readJson(this.ailmentDataFile);
    
    if (!ailmentData.items || !Array.isArray(ailmentData.items)) {
      throw new Error('Invalid ailments data structure');
    }

    this.logger.log(`🔍 Parsing ${ailmentData.items.length} ailments...`);

    const ailments = [];
    
    for (const item of ailmentData.items) {
      // Skip changelog entries
      if (item.navText === 'Changelog') {
        continue;
      }

      const ailment = this.extractAilmentData(item);
      if (ailment) {
        ailments.push(ailment);
      }
    }

    const results = {
      totalAilments: ailments.length,
      ailments: ailments
    };

    // Save ailments data
    await this.saveData(results);

    this.logger.log(`✅ Parsed ${ailments.length} ailments`);
    return results;
  }

  /**
   * Extract ailment data from scraped item
   */
  extractAilmentData(item) {
    const ailment = {
      name: item.navText,
      type: item.type
    };

    // Extract data from HTML if available
    if (item.rawHtml) {
      const htmlData = this.parseAilmentHtml(item.rawHtml);
      Object.assign(ailment, htmlData);
    }

    return ailment;
  }

  /**
   * Parse ailment HTML to extract structured data
   */
  parseAilmentHtml(rawHtml) {
    const ailmentData = {};
    
    try {
      const dom = new JSDOM(rawHtml);
      const doc = dom.window.document;

      // Extract basic info
      this.extractBasicInfo(doc, ailmentData);
      
      // Extract basic stats
      this.extractBasicStats(doc, rawHtml, ailmentData);
      
      // Extract effects
      this.extractEffects(doc, ailmentData);
      
      // Extract tags and add to global tracking
      this.extractAndTrackTags(doc, ailmentData);

    } catch (error) {
      console.warn(`Failed to parse HTML for ailment: ${error.message}`);
    }

    return ailmentData;
  }

  /**
   * Extract basic ailment information
   */
  extractBasicInfo(doc, ailmentData) {
    // Description
    const descEl = doc.querySelector('.ailment-description');
    if (descEl) {
      ailmentData.description = descEl.textContent.trim();
    }

    // Determine if positive or negative ailment
    const containerEl = doc.querySelector('.ailment-bitmap-container');
    if (containerEl) {
      if (containerEl.classList.contains('positive')) {
        ailmentData.category = 'positive';
      } else if (containerEl.classList.contains('negative')) {
        ailmentData.category = 'negative';
      }
    }
  }

  /**
   * Extract basic ailment stats
   */
  extractBasicStats(doc, rawHtml, ailmentData) {
    // Duration
    const durationMatch = rawHtml.match(/Duration:\s*<[^>]*><[^>]*>([^<]+)<\/[^>]*><\/[^>]*>/);
    if (durationMatch) {
      ailmentData.duration = durationMatch[1].trim();
    }

    // Max stacks
    const stacksMatch = rawHtml.match(/Max stacks:\s*<[^>]*>([^<]+)<\/[^>]*>/);
    if (stacksMatch) {
      ailmentData.maxStacks = stacksMatch[1].trim();
    }
  }

  /**
   * Extract ailment effects
   */
  extractEffects(doc, ailmentData) {
    const effectsSection = doc.querySelector('.ailment-param-group');
    if (effectsSection) {
      const effects = [];
      const buffElements = effectsSection.querySelectorAll('.buff');
      
      for (const buff of buffElements) {
        const effectText = buff.textContent.trim();
        if (effectText) {
          effects.push(effectText);
        }
      }
      
      if (effects.length > 0) {
        ailmentData.effects = effects;
      }
    }
  }

  /**
   * Extract and track all tags globally
   */
  extractAndTrackTags(doc, ailmentData) {
    // Ailment Tags
    const tagsSection = doc.querySelector('.ailment-tags');
    if (tagsSection) {
      const tags = [];
      const tagElements = tagsSection.querySelectorAll('.ailment-tag');
      for (const tagEl of tagElements) {
        const tag = tagEl.textContent.trim();
        tags.push(tag);
        this.globalTags.add(tag); // Add to global tracking
      }
      if (tags.length > 0) {
        ailmentData.tags = tags;
      }
    }
  }

  /**
   * Save parsed ailments data
   */
  async saveData(results) {
    await fs.ensureDir(this.outputDir);

    const ailmentsData = {
      type: 'ailments',
      parsedAt: new Date().toISOString(),
      totalCount: results.totalAilments,
      ailments: results.ailments
    };

    const ailmentsFile = path.join(this.outputDir, 'ailments.json');
    await fs.writeJson(ailmentsFile, ailmentsData, { spaces: 2 });
    this.logger.log(`📁 Saved ${results.totalAilments} ailments to ailments.json`);
  }

  /**
   * Get collected global tags
   */
  getGlobalTags() {
    return Array.from(this.globalTags).sort();
  }
}

// If run directly, execute the parser
if (require.main === module) {
  const parser = new HTMLAilmentParser();
  
  parser.parseAilments()
    .then(() => {
      console.log('🎉 HTML ailment parsing complete!');
    })
    .catch((error) => {
      console.error('❌ Ailment parsing failed:', error);
      process.exit(1);
    });
}

module.exports = HTMLAilmentParser;