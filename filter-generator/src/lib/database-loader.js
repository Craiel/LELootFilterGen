/**
 * Database Loader for New Structured Database Format
 * 
 * Provides efficient access to the structured database files and indexes
 */

const fs = require('fs-extra');
const path = require('path');

class DatabaseLoader {
  constructor(dataDir = null) {
    this.dataDir = dataDir || path.join(__dirname, '../../../filter-generator/Data');
    this.cache = new Map();
    this.indexes = null;
  }

  /**
   * Check if the database structure exists
   */
  async exists() {
    const requiredPaths = [
      path.join(this.dataDir, 'database-index.json'),
      path.join(this.dataDir, 'Prefixes'),
      path.join(this.dataDir, 'Suffixes')
    ];

    for (const requiredPath of requiredPaths) {
      if (!await fs.pathExists(requiredPath)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Load database indexes for fast lookups
   */
  async loadIndexes() {
    if (this.indexes) {
      return this.indexes;
    }

    const indexesDir = path.join(this.dataDir, 'indexes');
    this.indexes = {};

    // Load ID lookup index
    const idLookupPath = path.join(indexesDir, 'id-lookup.json');
    if (await fs.pathExists(idLookupPath)) {
      this.indexes.idLookup = JSON.parse(await fs.readFile(idLookupPath, 'utf8'));
    }

    // Load tags index
    const tagsIndexPath = path.join(indexesDir, 'tags-index.json');
    if (await fs.pathExists(tagsIndexPath)) {
      this.indexes.tags = JSON.parse(await fs.readFile(tagsIndexPath, 'utf8'));
    }

    // Load mechanics index
    const mechanicsIndexPath = path.join(indexesDir, 'mechanics-index.json');
    if (await fs.pathExists(mechanicsIndexPath)) {
      this.indexes.mechanics = JSON.parse(await fs.readFile(mechanicsIndexPath, 'utf8'));
    }

    return this.indexes;
  }

  /**
   * Get database metadata and version info
   */
  async getMetadata() {
    const cacheKey = 'metadata';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const databaseIndexPath = path.join(this.dataDir, 'database-index.json');
    const versionPath = path.join(this.dataDir, 'database-version.json');

    let metadata = {
      counts: {},
      gameVersion: 'unknown',
      buildDate: Date.now()
    };

    // Load database index
    if (await fs.pathExists(databaseIndexPath)) {
      const databaseIndex = JSON.parse(await fs.readFile(databaseIndexPath, 'utf8'));
      metadata.counts = databaseIndex;
    }

    // Load version info
    if (await fs.pathExists(versionPath)) {
      const versionInfo = JSON.parse(await fs.readFile(versionPath, 'utf8'));
      metadata.gameVersion = versionInfo.gameVersion;
      metadata.buildDate = versionInfo.buildDate;
    }

    this.cache.set(cacheKey, metadata);
    return metadata;
  }

  /**
   * Get an affix by ID (using indexes for fast lookup)
   */
  async getAffixById(affixId) {
    await this.loadIndexes();
    
    if (this.indexes.idLookup && this.indexes.idLookup.affixes) {
      const affixData = this.indexes.idLookup.affixes[affixId.toString()];
      if (affixData) {
        return affixData;
      }
    }

    // Fallback: search through individual files
    return await this.findAffixInFiles(affixId);
  }

  /**
   * Find affix by searching through individual files (fallback method)
   */
  async findAffixInFiles(affixId) {
    const prefixesDir = path.join(this.dataDir, 'Prefixes');
    const suffixesDir = path.join(this.dataDir, 'Suffixes');

    for (const dir of [prefixesDir, suffixesDir]) {
      if (!await fs.pathExists(dir)) continue;

      const files = await fs.readdir(dir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(dir, file);
        const affixData = JSON.parse(await fs.readFile(filePath, 'utf8'));
        
        if (affixData.id && affixData.id.toString() === affixId.toString()) {
          return affixData;
        }
      }
    }

    return null;
  }

  /**
   * Get all affixes with a specific tag
   */
  async getAffixesByTag(tagName) {
    await this.loadIndexes();
    
    if (this.indexes.tags && this.indexes.tags.byTag && this.indexes.tags.byTag[tagName]) {
      return this.indexes.tags.byTag[tagName].affixes || [];
    }

    return [];
  }

  /**
   * Get skills for a specific class
   */
  async getSkillsByClass(className) {
    const cacheKey = `skills_${className}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const skillsDir = path.join(this.dataDir, 'Skills');
    const skillFile = path.join(skillsDir, `${className.toLowerCase()}.json`);

    if (!await fs.pathExists(skillFile)) {
      return [];
    }

    const skillData = JSON.parse(await fs.readFile(skillFile, 'utf8'));
    this.cache.set(cacheKey, skillData);
    return skillData;
  }

  /**
   * Get all available skills
   */
  async getAllSkills() {
    const cacheKey = 'all_skills';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const skillsDir = path.join(this.dataDir, 'Skills');
    if (!await fs.pathExists(skillsDir)) {
      return {};
    }

    const allSkills = {};
    const files = await fs.readdir(skillsDir);
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const className = file.replace('.json', '');
      const skillFile = path.join(skillsDir, file);
      allSkills[className] = JSON.parse(await fs.readFile(skillFile, 'utf8'));
    }

    this.cache.set(cacheKey, allSkills);
    return allSkills;
  }

  /**
   * Get reference data (colors, sounds, beams)
   */
  async getReferenceData() {
    const cacheKey = 'reference_data';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const referenceFile = path.join(this.dataDir, 'colors-sounds-beams.json');
    if (!await fs.pathExists(referenceFile)) {
      return { colors: {}, sounds: {}, beams: {} };
    }

    const referenceData = JSON.parse(await fs.readFile(referenceFile, 'utf8'));
    this.cache.set(cacheKey, referenceData);
    return referenceData;
  }

  /**
   * Get unique items overview
   */
  async getUniqueItems() {
    const cacheKey = 'unique_items';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const uniquesFile = path.join(this.dataDir, 'unique-items-overview.json');
    if (!await fs.pathExists(uniquesFile)) {
      return [];
    }

    const uniqueItems = JSON.parse(await fs.readFile(uniquesFile, 'utf8'));
    this.cache.set(cacheKey, uniqueItems);
    return uniqueItems;
  }

  /**
   * Get set data
   */
  async getSetData() {
    const cacheKey = 'set_data';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const setFile = path.join(this.dataDir, 'set-data.json');
    if (!await fs.pathExists(setFile)) {
      return [];
    }

    const setData = JSON.parse(await fs.readFile(setFile, 'utf8'));
    this.cache.set(cacheKey, setData);
    return setData;
  }

  /**
   * Search affixes by name (partial match)
   */
  async searchAffixesByName(searchTerm) {
    const results = [];
    const prefixesDir = path.join(this.dataDir, 'Prefixes');
    const suffixesDir = path.join(this.dataDir, 'Suffixes');

    for (const dir of [prefixesDir, suffixesDir]) {
      if (!await fs.pathExists(dir)) continue;

      const files = await fs.readdir(dir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(dir, file);
        const affixData = JSON.parse(await fs.readFile(filePath, 'utf8'));
        
        if (affixData.name && affixData.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push(affixData);
        }
      }
    }

    return results;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.indexes = null;
  }

  /**
   * Get validation report
   */
  async getValidationReport() {
    const reportFile = path.join(this.dataDir, 'validation-report.txt');
    if (!await fs.pathExists(reportFile)) {
      return 'No validation report found';
    }

    return await fs.readFile(reportFile, 'utf8');
  }
}

module.exports = { DatabaseLoader };