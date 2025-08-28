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
   * Get all available skills in flattened structure
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
      const classData = JSON.parse(await fs.readFile(skillFile, 'utf8'));
      
      // Parse the nested structure: masteries[].skills[]
      const skillsList = [];
      
      if (classData.masteries && Array.isArray(classData.masteries)) {
        for (const mastery of classData.masteries) {
          if (mastery.skills && Array.isArray(mastery.skills)) {
            for (const skill of mastery.skills) {
              // Add context information to each skill
              skillsList.push({
                ...skill,
                className: classData.name || className,
                masteryName: mastery.name
              });
            }
          }
        }
      }
      
      // Also handle direct skills array (if any files have this structure)
      if (classData.skills && Array.isArray(classData.skills)) {
        for (const skill of classData.skills) {
          skillsList.push({
            ...skill,
            className: classData.name || className,
            masteryName: 'Base Class'
          });
        }
      }
      
      allSkills[className] = skillsList;
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

    const uniqueItemsData = JSON.parse(await fs.readFile(uniquesFile, 'utf8'));
    // Handle the nested structure: { "uniques": [...] }
    const uniqueItems = uniqueItemsData.uniques || uniqueItemsData || [];
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

  /**
   * Get skill by name with fuzzy matching
   * @param {string} skillName - Name of skill to find
   * @returns {Object|null} - Skill data or null if not found
   */
  async getSkillByName(skillName) {
    const allSkills = await this.getAllSkills();
    const normalizedSearchName = skillName.toLowerCase().trim();
    
    // First try exact match
    for (const [className, classSkills] of Object.entries(allSkills)) {
      if (Array.isArray(classSkills)) {
        const exactMatch = classSkills.find(skill => 
          skill.name && skill.name.toLowerCase() === normalizedSearchName
        );
        if (exactMatch) {
          return { ...exactMatch, className };
        }
      }
    }
    
    // Then try partial match
    for (const [className, classSkills] of Object.entries(allSkills)) {
      if (Array.isArray(classSkills)) {
        const partialMatch = classSkills.find(skill => 
          skill.name && skill.name.toLowerCase().includes(normalizedSearchName)
        );
        if (partialMatch) {
          return { ...partialMatch, className };
        }
      }
    }
    
    return null;
  }

  /**
   * Get skill synergies for a given skill
   * @param {string} skillName - Name of skill
   * @returns {Array} - Array of synergistic skills
   */
  async getSkillSynergies(skillName) {
    const skill = await this.getSkillByName(skillName);
    if (!skill) {
      return [];
    }

    // For now, return synergies if they exist in skill data
    // This can be enhanced as skill database grows more detailed
    return skill.synergies || [];
  }

  /**
   * Classify build type based on primary skill
   * @param {string} primarySkill - Name of primary skill
   * @returns {string} - Build type classification
   */
  async classifyBuildType(primarySkill) {
    const skill = await this.getSkillByName(primarySkill);
    if (!skill) {
      return 'unknown';
    }

    // Check if skill data has explicit build type
    if (skill.buildType) {
      return skill.buildType;
    }

    // Check skill tags for classification (database uses tags array)
    if (skill.tags && Array.isArray(skill.tags)) {
      const tags = skill.tags.map(tag => tag.toLowerCase());
      
      if (tags.includes('minion')) {
        return 'minion';
      }
      
      if (tags.includes('spell')) {
        return 'spell';
      }
      
      if (tags.includes('melee')) {
        return 'melee';
      }
      
      if (tags.includes('bow') || tags.includes('ranged')) {
        return 'bow';
      }
    }

    // Check for summon in name (backup for minions)
    const skillNameLower = primarySkill.toLowerCase();
    if (skillNameLower.includes('summon')) {
      return 'minion';
    }
    
    // Check for form skills
    if (skillNameLower.includes('form')) {
      return 'transform';
    }
    
    // Check for aura/blessing skills
    if (skillNameLower.includes('aura') || skillNameLower.includes('blessing')) {
      return 'support';
    }

    // Check base damage type from skill data
    if (skill.baseDamage && skill.baseDamage.type) {
      const damageType = skill.baseDamage.type.toLowerCase();
      if (damageType.includes('physical') || damageType.includes('necrotic') || damageType.includes('critical')) {
        if (skill.tags && skill.tags.some(tag => tag.toLowerCase() === 'spell')) {
          return 'spell';
        } else {
          return 'melee';
        }
      }
    }

    // Default classification
    return 'hybrid';
  }

  /**
   * Get affixes by tags (generic database-driven approach)
   * @param {Array} tags - Array of tag names to search for
   * @returns {Array} - Array of relevant affixes
   */
  async getAffixesByTags(tags) {
    const results = [];
    
    for (const tag of tags) {
      const taggedAffixes = await this.getAffixesByTag(tag);
      results.push(...taggedAffixes);
    }

    // Remove duplicates based on affix ID
    const uniqueAffixes = results.filter((affix, index, array) => 
      array.findIndex(a => a.id === affix.id) === index
    );

    return uniqueAffixes;
  }

  /**
   * Get affixes by name with fuzzy matching (pure database search)
   * @param {string} affixName - Human-readable affix name
   * @returns {Array} - Array of matching affixes with IDs
   */
  async getAffixesByName(affixName) {
    // Use the existing searchAffixesByName method which searches through database files
    return await this.searchAffixesByName(affixName);
  }

  /**
   * Get unique items by search terms (generic approach)
   * @param {Array} searchTerms - Array of terms to search for in item descriptions
   * @param {Array} specifiedItems - Items specifically mentioned by user
   * @returns {Array} - Array of relevant unique items
   */
  async getUniqueItemsBySearch(searchTerms = [], specifiedItems = []) {
    const allUniques = await this.getUniqueItems();
    const relevantItems = [];

    // Add user-specified items (exact match)
    for (const itemName of specifiedItems) {
      const item = allUniques.find(unique => 
        unique.name && unique.name.toLowerCase() === itemName.toLowerCase()
      );
      if (item) {
        relevantItems.push({ ...item, userSpecified: true });
      }
    }

    // Add items matching search terms (if any provided)
    if (searchTerms.length > 0) {
      const searchResults = allUniques.filter(item => {
        if (!item.modifiers && !item.implicits) return false;
        
        const itemText = [
          ...(item.modifiers || []),
          ...(item.implicits || []),
          item.name || ''
        ].join(' ').toLowerCase();
        
        return searchTerms.some(term => itemText.includes(term.toLowerCase()));
      });

      // Add search results not already specified
      for (const item of searchResults.slice(0, 20)) { // Reasonable limit
        if (!relevantItems.some(existing => existing.name === item.name)) {
          relevantItems.push({ ...item, searchMatch: true });
        }
      }
    }

    return relevantItems;
  }

  /**
   * Get skill scaling stats from skill data (pure database-driven)
   * @param {string} skillName - Name of skill
   * @returns {Object} - Object with scaling stats and priorities from database
   */
  async getSkillScalingStats(skillName) {
    const skill = await this.getSkillByName(skillName);
    if (!skill) {
      return { critical: [], high: [], medium: [], tags: [], damageTypes: [], buildType: null };
    }

    // Extract damage types from skill tags and base damage
    const damageTypes = [];
    if (skill.tags && Array.isArray(skill.tags)) {
      const damageTypeMapping = {
        'Physical': 'physical',
        'Fire': 'fire', 
        'Cold': 'cold',
        'Lightning': 'lightning',
        'Necrotic': 'necrotic',
        'Void': 'void',
        'Poison': 'poison'
      };
      
      for (const tag of skill.tags) {
        if (damageTypeMapping[tag]) {
          damageTypes.push(damageTypeMapping[tag]);
        }
      }
    }

    // Check base damage type
    if (skill.baseDamage && skill.baseDamage.type) {
      const baseType = skill.baseDamage.type.toLowerCase();
      for (const damageType of ['physical', 'fire', 'cold', 'lightning', 'necrotic', 'void', 'poison']) {
        if (baseType.includes(damageType) && !damageTypes.includes(damageType)) {
          damageTypes.push(damageType);
        }
      }
    }

    // Classify the build type
    const buildType = await this.classifyBuildType(skillName);

    // Return skill data with derived information
    return {
      critical: skill.scalingStats?.critical || skill.scalingStats?.primary || [],
      high: skill.scalingStats?.high || skill.scalingStats?.secondary || [],
      medium: skill.scalingStats?.medium || skill.scalingStats?.tertiary || [],
      tags: skill.tags || [],
      damageTypes: damageTypes,
      buildType: buildType,
      weaponTypes: skill.weaponTypes || [],
      requirements: skill.requirements || {},
      manaCost: skill.manaCost || 0,
      description: skill.description || '',
      section: skill.section || '',
      className: skill.className,
      masteryName: skill.masteryName
    };
  }

  /**
   * Get all affix data for comprehensive lookups
   * @returns {Array} - All affixes in database
   */
  async getAllAffixes() {
    const cacheKey = 'all_affixes';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const allAffixes = [];
    const prefixesDir = path.join(this.dataDir, 'Prefixes');
    const suffixesDir = path.join(this.dataDir, 'Suffixes');

    for (const dir of [prefixesDir, suffixesDir]) {
      if (!await fs.pathExists(dir)) continue;

      const files = await fs.readdir(dir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(dir, file);
        const affixData = JSON.parse(await fs.readFile(filePath, 'utf8'));
        allAffixes.push(affixData);
      }
    }

    this.cache.set(cacheKey, allAffixes);
    return allAffixes;
  }

  /**
   * Get available affix tags from database
   * @returns {Array} - Array of all available tags
   */
  async getAvailableTags() {
    await this.loadIndexes();
    
    if (this.indexes.tags && this.indexes.tags.byTag) {
      return Object.keys(this.indexes.tags.byTag);
    }

    // Fallback: scan affixes for tags if no index
    const allAffixes = await this.getAllAffixes();
    const tags = new Set();
    
    for (const affix of allAffixes) {
      if (affix.tags) {
        affix.tags.forEach(tag => tags.add(tag));
      }
    }

    return Array.from(tags);
  }
}

module.exports = { DatabaseLoader };