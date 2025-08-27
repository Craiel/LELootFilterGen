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
const DATABASE_FILE = path.join(DATA_DIR, 'game-database.jsonl');
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
      
      console.log('🔍 Loading unique items...');
      await this.loadUniqueItems();
      
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
   * Load main database file (JSONL format)
   */
  async loadDatabaseData() {
    const content = await fs.readFile(DATABASE_FILE, 'utf8');
    const lines = content.split('\n');
    
    let objectCount = 0;
    let inMultiLineObject = false;
    let currentJson = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;
      
      // Check if this line is a complete JSON object (single line)
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          const data = JSON.parse(line);
          this.processDataObject(data, objectCount);
          objectCount++;
        } catch (error) {
          console.warn(`⚠️  Failed to parse single-line JSON: ${error.message}`);
        }
      }
      // Start of multi-line JSON object
      else if (line.startsWith('{') && !line.endsWith('}')) {
        inMultiLineObject = true;
        currentJson = line;
      }
      // End of multi-line JSON object
      else if (inMultiLineObject && line.endsWith('}')) {
        currentJson += line;
        
        try {
          const data = JSON.parse(currentJson);
          this.processDataObject(data, objectCount);
          objectCount++;
        } catch (error) {
          console.warn(`⚠️  Failed to parse multi-line JSON: ${error.message}`);
        }
        
        inMultiLineObject = false;
        currentJson = '';
      }
      // Middle lines of multi-line JSON object
      else if (inMultiLineObject) {
        currentJson += line;
      }
    }
    
    console.log(`   ✅ Loaded ${this.data.affixes.size} affixes and ${this.data.sets.size} sets`);
  }

  processDataObject(data, objectCount) {
    // First object contains metadata
    if (objectCount === 0) {
      this.data.version = data.version;
      this.data.buildDate = data.buildDate;
      this.data.stats = data.stats;
    }
    // Second object contains colors, sounds, beams, globalTags
    else if (objectCount === 1) {
      this.data.colors = data.colors || {};
      this.data.sounds = data.sounds || {};
      this.data.beams = data.beams || {};  
      this.data.globalTags = data.globalTags || [];
    }
    // Subsequent objects contain affixes and sets
    else {
      if (data.affix !== undefined) {
        this.data.affixes.set(data.affix.toString(), data);
      } else if (data.set !== undefined) {
        this.data.sets.set(data.set.toString(), data);
      }
    }
  }

  /**
   * Load all unique items
   */
  async loadUniqueItems() {
    const files = await fs.readdir(UNIQUE_ITEMS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    for (const file of jsonFiles) {
      const filePath = path.join(UNIQUE_ITEMS_DIR, file);
      const data = await fs.readJson(filePath);
      this.data.uniques.set(data.id, data);
    }
    
    console.log(`   ✅ Loaded ${this.data.uniques.size} unique items`);
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
   * Generate ID-based lookup index for O(1) access
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
    
    // Convert Maps to objects for JSON serialization
    for (const [id, data] of this.data.affixes) {
      this.indexes.idLookup.affixes[id] = data;
    }
    
    for (const [id, data] of this.data.uniques) {
      this.indexes.idLookup.uniques[id] = data;
    }
    
    for (const [id, data] of this.data.sets) {
      this.indexes.idLookup.sets[id] = data;
    }
    
    for (const [id, data] of this.data.skills) {
      this.indexes.idLookup.skills[id] = data;
    }
    
    for (const [id, data] of this.data.ailments) {
      this.indexes.idLookup.ailments[id] = data;
    }
    
    for (const [id, data] of this.data.monsters) {
      this.indexes.idLookup.monsters[id] = data;
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