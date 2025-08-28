#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

/**
 * Index Generation Script
 * 
 * Generates optimized indexes for fast data access:
 * - ID-based lookup index (O(1) lookups)
 * - Tag-based filtering indexes
 * - Game mechanics indexes
 * - Master index file
 */

const DATA_DIR = path.join(__dirname, '..', '..', 'filter-generator', 'Data');
const INDEXES_DIR = path.join(DATA_DIR, 'indexes');
// Specialized database files
const IDOL_AFFIXES_FILE = path.join(DATA_DIR, 'idol-affixes.json');
const ITEM_AFFIXES_FILE = path.join(DATA_DIR, 'item-affixes.json');
const UNIQUE_ITEMS_OVERVIEW_FILE = path.join(DATA_DIR, 'unique-items-overview.json');
const SET_DATA_FILE = path.join(DATA_DIR, 'set-data.json');
const COLORS_SOUNDS_BEAMS_FILE = path.join(DATA_DIR, 'colors-sounds-beams.json');
const GLOBAL_TAGS_FILE = path.join(DATA_DIR, 'global-tags.json');
const UNIQUE_ITEMS_DIR = path.join(DATA_DIR, 'UniqueItems');
const SKILLS_DIR = path.join(DATA_DIR, 'Skills');
const AILMENTS_FILE = path.join(DATA_DIR, 'ailments.json');
const MONSTERS_FILE = path.join(DATA_DIR, 'monsters.json');

class IndexGenerator {
  constructor() {
    this.data = {
      affixes: new Map(),
      uniques: new Map(), 
      sets: new Map(),
      skills: new Map(),
      ailments: new Map(),
      monsters: new Map(),
      colors: {},
      sounds: {},
      beams: {},
      globalTags: []
    };
    
    this.indexes = {
      idLookup: {},
      tagIndex: { byTag: {}, combinedTags: {} },
      mechanicsIndex: { byMechanic: {}, affixToMechanics: {}, mechanicHierarchy: {} },
      masterIndex: {}
    };
  }

  /**
   * Main generation process
   */
  async generate() {
    console.log('🔍 Generating database indexes...');
    console.log(`📁 Data directory: ${DATA_DIR}`);
    console.log(`📁 Indexes directory: ${INDEXES_DIR}`);
    
    // Ensure indexes directory exists
    await fs.ensureDir(INDEXES_DIR);
    
    try {
      console.log('\n📚 Loading database data...');
      await this.loadDatabaseData();
      
      console.log('🔍 Loading detailed unique items data...');
      await this.loadDetailedUniqueItems();
      
      console.log('🎯 Loading skills...');
      await this.loadSkills();
      
      console.log('🩹 Loading ailments...');  
      await this.loadAilments();
      
      console.log('👹 Loading monsters...');
      await this.loadMonsters();
      
      console.log('\n🏗️  Generating ID lookup index...');
      await this.generateIdLookupIndex();
      
      console.log('🏷️  Generating tag-based indexes...');
      await this.generateTagIndexes();
      
      console.log('⚙️  Generating game mechanics indexes...');
      await this.generateMechanicsIndexes();
      
      console.log('📋 Generating master index...');
      await this.generateMasterIndex();
      
      console.log('\n✅ Index generation completed successfully!');
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Index generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Load database data from specialized JSON files
   */
  async loadDatabaseData() {
    let totalLoaded = 0;
    
    // Load idol affixes
    if (await fs.pathExists(IDOL_AFFIXES_FILE)) {
      const idolData = await fs.readJson(IDOL_AFFIXES_FILE);
      for (let i = 0; i < idolData.affixes.length; i++) {
        const affix = idolData.affixes[i];
        // Generate a unique ID if one doesn't exist
        const affixId = affix.id || `idol_affix_${i}`;
        this.data.affixes.set(affixId, { ...affix, id: affixId, type: 'affix', isIdolAffix: true });
        totalLoaded++;
      }
    }
    
    // Load item affixes
    if (await fs.pathExists(ITEM_AFFIXES_FILE)) {
      const itemData = await fs.readJson(ITEM_AFFIXES_FILE);
      for (let i = 0; i < itemData.affixes.length; i++) {
        const affix = itemData.affixes[i];
        // Generate a unique ID if one doesn't exist
        const affixId = affix.id || `item_affix_${i}`;
        this.data.affixes.set(affixId, { ...affix, id: affixId, type: 'affix', isIdolAffix: false });
        totalLoaded++;
      }
    }
    
    // Load unique items overview
    if (await fs.pathExists(UNIQUE_ITEMS_OVERVIEW_FILE)) {
      const uniqueData = await fs.readJson(UNIQUE_ITEMS_OVERVIEW_FILE);
      for (let i = 0; i < (uniqueData.uniques || []).length; i++) {
        const unique = uniqueData.uniques[i];
        // Generate a unique ID if one doesn't exist (use name as fallback)
        const uniqueId = unique.id || unique.name || `unique_${i}`;
        this.data.uniques.set(uniqueId, { ...unique, id: uniqueId, type: 'unique' });
        totalLoaded++;
      }
    }
    
    // Load set data
    if (await fs.pathExists(SET_DATA_FILE)) {
      const setData = await fs.readJson(SET_DATA_FILE);
      for (let i = 0; i < (setData.sets || []).length; i++) {
        const set = setData.sets[i];
        // Generate a unique ID if one doesn't exist (use name as fallback)
        const setId = set.id || set.name || `set_${i}`;
        this.data.sets.set(setId, { ...set, id: setId, type: 'set' });
        totalLoaded++;
      }
    }
    
    // Load colors, sounds, beams
    if (await fs.pathExists(COLORS_SOUNDS_BEAMS_FILE)) {
      const refData = await fs.readJson(COLORS_SOUNDS_BEAMS_FILE);
      this.data.colors = refData.colors;
      this.data.sounds = refData.sounds;
      this.data.beams = refData.beams;
    }
    
    // Load global tags
    if (await fs.pathExists(GLOBAL_TAGS_FILE)) {
      const tagsData = await fs.readJson(GLOBAL_TAGS_FILE);
      this.data.globalTags = tagsData.globalTags;
    }
    
    console.log(`   ✅ Loaded ${this.data.affixes.size} affixes, ${this.data.uniques.size} uniques, and ${this.data.sets.size} sets`);
  }


  /**
   * Load detailed unique items data (if needed for indexing)
   */
  async loadDetailedUniqueItems() {
    // This loads full details from individual files if needed for detailed indexing
    // The overview data loaded in loadDatabaseData() has basic info for most use cases
    const files = await fs.readdir(UNIQUE_ITEMS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    for (const file of jsonFiles) {
      const filePath = path.join(UNIQUE_ITEMS_DIR, file);
      const data = await fs.readJson(filePath);
      // Enhance existing overview data with detailed data
      if (this.data.uniques.has(data.id)) {
        const existing = this.data.uniques.get(data.id);
        this.data.uniques.set(data.id, { ...existing, ...data, type: 'unique' });
      }
    }
    
    console.log(`   ✅ Enhanced ${this.data.uniques.size} unique items with detailed data`);
  }

  /**
   * Load all skills
   */
  async loadSkills() {
    const files = await fs.readdir(SKILLS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    for (const file of jsonFiles) {
      const filePath = path.join(SKILLS_DIR, file);
      const data = await fs.readJson(filePath);
      
      // Process skills within masteries
      if (data.masteries) {
        data.masteries.forEach(mastery => {
          if (mastery.skills) {
            mastery.skills.forEach(skill => {
              // Generate skill ID from name and class
              const skillId = `${data.name.toLowerCase()}_${skill.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
              skill.class = data.name;
              skill.mastery = mastery.name;
              this.data.skills.set(skillId, skill);
            });
          }
        });
      }
    }
    
    console.log(`   ✅ Loaded ${this.data.skills.size} skills`);
  }

  /**
   * Load ailments
   */
  async loadAilments() {
    if (await fs.pathExists(AILMENTS_FILE)) {
      const data = await fs.readJson(AILMENTS_FILE);
      if (data.ailments) {
        data.ailments.forEach(ailment => {
          this.data.ailments.set(ailment.name.toLowerCase().replace(/[^a-z0-9]/g, '_'), ailment);
        });
      }
      console.log(`   ✅ Loaded ${this.data.ailments.size} ailments`);
    } else {
      console.log('   ⚠️  Ailments file not found, skipping');
    }
  }

  /**
   * Load monsters
   */
  async loadMonsters() {
    if (await fs.pathExists(MONSTERS_FILE)) {
      const data = await fs.readJson(MONSTERS_FILE);
      if (data.monsters) {
        data.monsters.forEach(monster => {
          this.data.monsters.set(monster.name.toLowerCase().replace(/[^a-z0-9]/g, '_'), monster);
        });
      }
      console.log(`   ✅ Loaded ${this.data.monsters.size} monsters`);
    } else {
      console.log('   ⚠️  Monsters file not found, skipping');
    }
  }

  /**
   * Generate lightweight ID-based lookup index for O(1) access
   * Only includes essential metadata: id, name, type, and key identifiers
   */
  async generateIdLookupIndex() {
    this.indexes.idLookup = {
      affixes: {},
      uniques: {},
      sets: {},
      skills: {},
      ailments: {},
      monsters: {}
    };
    
    // Affixes: only id, name, type, isIdolAffix
    for (const [id, data] of this.data.affixes) {
      this.indexes.idLookup.affixes[id] = {
        id: data.id,
        name: data.name,
        type: data.type,
        isIdolAffix: data.isIdolAffix
      };
    }
    
    // Uniques: only id, name, type, baseType, category, classRequirement
    for (const [id, data] of this.data.uniques) {
      this.indexes.idLookup.uniques[id] = {
        id: data.id,
        name: data.name,
        type: data.type,
        baseType: data.baseType,
        category: data.category,
        classRequirement: data.classRequirement
      };
    }
    
    // Sets: only id, name, type
    for (const [id, data] of this.data.sets) {
      this.indexes.idLookup.sets[id] = {
        id: data.id,
        name: data.name,
        type: data.type
      };
    }
    
    // Skills: only id, name, type, class
    for (const [id, data] of this.data.skills) {
      this.indexes.idLookup.skills[id] = {
        id: data.id,
        name: data.name,
        type: data.type,
        class: data.class || data.mastery
      };
    }
    
    // Ailments: only id, name, type, category
    for (const [id, data] of this.data.ailments) {
      this.indexes.idLookup.ailments[id] = {
        id: data.id,
        name: data.name,
        type: data.type,
        category: data.category
      };
    }
    
    // Monsters: only id, name, type, minionType
    for (const [id, data] of this.data.monsters) {
      this.indexes.idLookup.monsters[id] = {
        id: data.id,
        name: data.name,
        type: data.type,
        minionType: data.type
      };
    }
    
    // Save to file
    await fs.writeJson(path.join(INDEXES_DIR, 'id-lookup.json'), this.indexes.idLookup, { spaces: 2 });
    console.log(`   ✅ Generated ID lookup index`);
  }

  /**
   * Generate tag-based filtering indexes
   */
  async generateTagIndexes() {
    const tagIndex = { byTag: {}, combinedTags: {} };
    
    // Process skills (they have tags)
    for (const [skillId, skill] of this.data.skills) {
      if (skill.tags && Array.isArray(skill.tags)) {
        skill.tags.forEach(tag => {
          if (!tagIndex.byTag[tag]) {
            tagIndex.byTag[tag] = { affixes: [], uniques: [], skills: [], ailments: [], monsters: [] };
          }
          tagIndex.byTag[tag].skills.push(skillId);
        });
      }
    }
    
    // Process ailments (they have tags)
    for (const [ailmentId, ailment] of this.data.ailments) {
      if (ailment.tags && Array.isArray(ailment.tags)) {
        ailment.tags.forEach(tag => {
          if (!tagIndex.byTag[tag]) {
            tagIndex.byTag[tag] = { affixes: [], uniques: [], skills: [], ailments: [], monsters: [] };
          }
          tagIndex.byTag[tag].ailments.push(ailmentId);
        });
      }
    }
    
    // TODO: Add affix tags once they're implemented
    // TODO: Add unique item tags once they're implemented
    // TODO: Add set item tags once they're implemented
    // TODO: Add monster tags once they're implemented
    
    this.indexes.tagIndex = tagIndex;
    await fs.writeJson(path.join(INDEXES_DIR, 'tags-index.json'), tagIndex, { spaces: 2 });
    console.log(`   ✅ Generated tag index with ${Object.keys(tagIndex.byTag).length} tags`);
  }

  /**
   * Generate game mechanics relationships index
   */
  async generateMechanicsIndexes() {
    const mechanicsIndex = { 
      byMechanic: {},
      affixToMechanics: {},
      mechanicHierarchy: {}
    };
    
    // Basic mechanic hierarchy based on globalTags
    const mechanicHierarchies = {
      'Fire': { parent: 'Elemental', children: ['Fire'] },
      'Cold': { parent: 'Elemental', children: ['Cold'] },  
      'Lightning': { parent: 'Elemental', children: ['Lightning'] },
      'Physical': { parent: null, children: ['Physical'] },
      'Void': { parent: null, children: ['Void'] },
      'Necrotic': { parent: null, children: ['Necrotic'] },
      'Poison': { parent: 'Damage Over Time', children: ['Poison'] }
    };
    
    mechanicsIndex.mechanicHierarchy = mechanicHierarchies;
    
    // TODO: Analyze affix names to determine what mechanics they affect
    // TODO: Create byMechanic mappings
    // TODO: Create affixToMechanics mappings
    
    this.indexes.mechanicsIndex = mechanicsIndex;
    await fs.writeJson(path.join(INDEXES_DIR, 'mechanics-index.json'), mechanicsIndex, { spaces: 2 });
    console.log(`   ✅ Generated mechanics index`);
  }

  /**
   * Generate master index with metadata
   */
  async generateMasterIndex() {
    const masterIndex = {
      version: this.data.version,
      buildDate: new Date().toISOString(),
      originalBuildDate: this.data.buildDate,
      stats: {
        affixes: this.data.affixes.size,
        uniques: this.data.uniques.size,
        sets: this.data.sets.size,
        skills: this.data.skills.size,
        ailments: this.data.ailments.size,
        monsters: this.data.monsters.size,
        totalItems: this.data.affixes.size + this.data.uniques.size + this.data.sets.size,
        indexedTags: Object.keys(this.indexes.tagIndex.byTag).length
      },
      indexFiles: {
        idLookup: 'indexes/id-lookup.json',
        tagIndex: 'indexes/tags-index.json', 
        mechanicsIndex: 'indexes/mechanics-index.json'
      },
      globalTags: this.data.globalTags,
      colors: this.data.colors,
      sounds: this.data.sounds,
      beams: this.data.beams
    };
    
    this.indexes.masterIndex = masterIndex;
    await fs.writeJson(path.join(DATA_DIR, 'database-index.json'), masterIndex, { spaces: 2 });
    console.log(`   ✅ Generated master index`);
  }

  /**
   * Print generation summary
   */
  printSummary() {
    const stats = this.indexes.masterIndex.stats;
    
    console.log('\n📊 Index Generation Summary:');
    console.log(`   Database Version: ${this.data.version}`);
    console.log(`   Total Indexed Items: ${stats.totalItems}`);
    console.log(`   - Affixes: ${stats.affixes}`);
    console.log(`   - Unique Items: ${stats.uniques}`);
    console.log(`   - Set Items: ${stats.sets}`);
    console.log(`   - Skills: ${stats.skills}`);
    console.log(`   - Ailments: ${stats.ailments}`);
    console.log(`   - Monsters: ${stats.monsters}`);
    console.log(`   Tagged Categories: ${stats.indexedTags}`);
    console.log('');
    console.log('📁 Generated Files:');
    console.log(`   ${path.join(INDEXES_DIR, 'id-lookup.json')}`);
    console.log(`   ${path.join(INDEXES_DIR, 'tags-index.json')}`);
    console.log(`   ${path.join(INDEXES_DIR, 'mechanics-index.json')}`);
    console.log(`   ${path.join(DATA_DIR, 'database-index.json')}`);
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new IndexGenerator();
  generator.generate().catch(error => {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  });
}

module.exports = IndexGenerator;