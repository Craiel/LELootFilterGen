#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * HTML Monster Data Parser
 * 
 * Parses the scraped Monsters.json file to extract monster/minion data
 * for the game database.
 */
class HTMLMonsterParser {
  constructor() {
    this.monsterDataFile = path.join(__dirname, '..', 'WebData', 'Monsters.json');
    this.outputDir = path.join(__dirname, '..', '..', 'filter-generator', 'Data');
    this.logger = console;
    this.globalTags = new Set(); // Track all unique tags
  }

  /**
   * Parse the Monsters.json file and extract monster data
   */
  async parseMonsters() {
    if (!await fs.pathExists(this.monsterDataFile)) {
      throw new Error(`Monsters data file not found: ${this.monsterDataFile}`);
    }

    this.logger.log('📄 Loading Monsters.json file...');
    const monsterData = await fs.readJson(this.monsterDataFile);
    
    if (!monsterData.items || !Array.isArray(monsterData.items)) {
      throw new Error('Invalid monsters data structure');
    }

    this.logger.log(`🔍 Parsing ${monsterData.items.length} monsters...`);

    const monsters = [];
    
    for (const item of monsterData.items) {
      // Skip changelog entries
      if (item.navText === 'Changelog') {
        continue;
      }

      const monster = this.extractMonsterData(item);
      if (monster) {
        monsters.push(monster);
      }
    }

    const results = {
      totalMonsters: monsters.length,
      monsters: monsters
    };

    // Save monsters data
    await this.saveData(results);

    this.logger.log(`✅ Parsed ${monsters.length} monsters`);
    return results;
  }

  /**
   * Extract monster data from scraped item
   */
  extractMonsterData(item) {
    const monster = {
      name: item.navText,
      type: item.type
    };

    // Extract data from HTML if available
    if (item.rawHtml) {
      const htmlData = this.parseMonsterHtml(item.rawHtml);
      Object.assign(monster, htmlData);
    }

    return monster;
  }

  /**
   * Parse monster HTML to extract structured data
   */
  parseMonsterHtml(rawHtml) {
    const monsterData = {};
    
    try {
      const dom = new JSDOM(rawHtml);
      const doc = dom.window.document;

      // Extract basic stats
      this.extractBasicStats(doc, rawHtml, monsterData);
      
      // Extract structured data blocks
      this.extractStructuredBlocks(doc, monsterData);
      
      // Extract tags and add to global tracking
      this.extractAndTrackTags(doc, monsterData);

    } catch (error) {
      console.warn(`Failed to parse HTML for monster: ${error.message}`);
    }

    return monsterData;
  }

  /**
   * Extract basic monster stats
   */
  extractBasicStats(doc, rawHtml, monsterData) {
    // Health
    const healthMatch = rawHtml.match(/Health:\s*<[^>]*><[^>]*>(\d+)<\/[^>]*><\/[^>]*>/);
    if (healthMatch) {
      monsterData.health = parseInt(healthMatch[1]);
    }

    // Health Regeneration
    const regenMatch = rawHtml.match(/Health Regeneration:\s*<[^>]*><[^>]*>([^<]+)<\/[^>]*><\/[^>]*>/);
    if (regenMatch) {
      monsterData.healthRegeneration = regenMatch[1].trim();
    }

    // Threat
    const threatMatch = rawHtml.match(/Threat:\s*<[^>]*><[^>]*>([^<]+)<\/[^>]*><\/[^>]*>/);
    if (threatMatch) {
      monsterData.threat = threatMatch[1].trim();
    }
  }

  /**
   * Extract structured data blocks
   */
  extractStructuredBlocks(doc, monsterData) {
    const entityParams = doc.querySelectorAll('.entity-params');
    
    for (const param of entityParams) {
      const text = param.textContent.trim();
      
      // Stats section
      if (text.includes('Stats:')) {
        monsterData.stats = this.extractStatsInfo(param);
      }
      
      // Scaling section
      if (text.includes('Scaling:')) {
        monsterData.scaling = this.extractScalingInfo(param);
      }
    }
  }

  /**
   * Extract Stats information
   */
  extractStatsInfo(param) {
    const stats = [];
    const buffElements = param.querySelectorAll('.buff');
    
    for (const buff of buffElements) {
      const statText = buff.textContent.trim();
      if (statText) {
        stats.push(statText);
      }
    }
    
    return stats;
  }

  /**
   * Extract Scaling information
   */
  extractScalingInfo(param) {
    const scaling = [];
    
    // Look for attribute scaling sections
    const scalingSections = param.querySelectorAll('.attr-scaling');
    for (const section of scalingSections) {
      const attributeText = section.textContent.trim();
      const nextSibling = section.nextElementSibling;
      
      if (nextSibling && nextSibling.classList.contains('attr-scaling-stats')) {
        const stats = [];
        const statItems = nextSibling.querySelectorAll('li');
        for (const item of statItems) {
          stats.push(item.textContent.trim());
        }
        
        scaling.push({
          attribute: attributeText,
          effects: stats
        });
      }
    }
    
    return scaling;
  }

  /**
   * Extract and track all tags globally
   */
  extractAndTrackTags(doc, monsterData) {
    // Scaling Tags
    const scalingTagsSection = doc.querySelector('.entity-params');
    if (scalingTagsSection && scalingTagsSection.textContent.includes('Scaling Tags:')) {
      const tags = [];
      const tagElements = scalingTagsSection.querySelectorAll('.ability-tag');
      for (const tagEl of tagElements) {
        const tag = tagEl.textContent.trim();
        tags.push(tag);
        this.globalTags.add(tag); // Add to global tracking
      }
      if (tags.length > 0) {
        monsterData.scalingTags = tags;
      }
    }

    // Minion Tags
    const minionTagsSection = doc.querySelector('.entity-params');
    if (minionTagsSection && minionTagsSection.textContent.includes('Minion Tags:')) {
      const tags = [];
      const tagElements = minionTagsSection.querySelectorAll('.ability-tag');
      for (const tagEl of tagElements) {
        const tag = tagEl.textContent.trim();
        tags.push(tag);
        this.globalTags.add(tag); // Add to global tracking
      }
      if (tags.length > 0) {
        monsterData.minionTags = tags;
      }
    }
  }

  /**
   * Save parsed monsters data
   */
  async saveData(results) {
    await fs.ensureDir(this.outputDir);

    const monstersData = {
      type: 'monsters',
      parsedAt: new Date().toISOString(),
      totalCount: results.totalMonsters,
      monsters: results.monsters
    };

    const monstersFile = path.join(this.outputDir, 'monsters.json');
    await fs.writeJson(monstersFile, monstersData, { spaces: 2 });
    this.logger.log(`📁 Saved ${results.totalMonsters} monsters to monsters.json`);
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
  const parser = new HTMLMonsterParser();
  
  parser.parseMonsters()
    .then(() => {
      console.log('🎉 HTML monster parsing complete!');
    })
    .catch((error) => {
      console.error('❌ Monster parsing failed:', error);
      process.exit(1);
    });
}

module.exports = HTMLMonsterParser;