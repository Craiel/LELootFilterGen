const fs = require('fs-extra');
const path = require('path');

/**
 * Comprehensive data manager for loading and accessing all database files
 * Replaces the old database-loader with enhanced functionality
 */
class DataManager {
    constructor(dataPath = null) {
        this.dataPath = dataPath || path.join(__dirname, '../../Data');
        this.cache = new Map();
        this.loaded = false;
    }

    /**
     * Load all data from the Data folder with comprehensive validation
     */
    async loadAll() {
        if (this.loaded) return;

        console.log('📂 Loading comprehensive database...');
        const startTime = Date.now();

        try {
            // Load core files
            await this.loadCoreFiles();
            
            // Load prefixes and suffixes
            await this.loadAffixData();
            
            // Load skill data
            await this.loadSkillData();
            
            // Load indexes
            await this.loadIndexes();
            
            // Load additional data
            await this.loadAdditionalData();
            
            this.loaded = true;
            const loadTime = Date.now() - startTime;
            console.log(`✅ Database loaded successfully (${loadTime}ms)`);
            
            // Validate data integrity
            await this.validateDataIntegrity();
            
        } catch (error) {
            console.error('❌ Failed to load database:', error.message);
            throw error;
        }
    }

    /**
     * Load core database files
     */
    async loadCoreFiles() {
        const coreFiles = [
            'database-index.json',
            'database-version.json',
            'colors-sounds-beams.json',
            'item-affixes.json',
            'unique-items-overview.json',
            'set-data.json',
            'ailments.json',
            'monsters.json',
            'global-tags.json',
            'idol-affixes.json'
        ];

        for (const filename of coreFiles) {
            const filePath = path.join(this.dataPath, filename);
            if (await fs.pathExists(filePath)) {
                try {
                    const data = await fs.readJson(filePath);
                    this.cache.set(filename, data);
                } catch (error) {
                    console.warn(`⚠️  Failed to load ${filename}: ${error.message}`);
                }
            } else {
                console.warn(`⚠️  Core file missing: ${filename}`);
            }
        }
    }

    /**
     * Load all prefix and suffix affix data
     */
    async loadAffixData() {
        const prefixesPath = path.join(this.dataPath, 'Prefixes');
        const suffixesPath = path.join(this.dataPath, 'Suffixes');
        
        const prefixes = await this.loadDirectoryData(prefixesPath);
        const suffixes = await this.loadDirectoryData(suffixesPath);
        
        this.cache.set('prefixes', prefixes);
        this.cache.set('suffixes', suffixes);
        this.cache.set('all-affixes', { ...prefixes, ...suffixes });
    }

    /**
     * Load all skill data files
     */
    async loadSkillData() {
        const skillsPath = path.join(this.dataPath, 'Skills');
        const skills = await this.loadDirectoryData(skillsPath);
        this.cache.set('skills', skills);
    }

    /**
     * Load index files for fast lookups
     */
    async loadIndexes() {
        const indexesPath = path.join(this.dataPath, 'indexes');
        if (await fs.pathExists(indexesPath)) {
            const indexes = await this.loadDirectoryData(indexesPath);
            this.cache.set('indexes', indexes);
        }
    }

    /**
     * Load additional data files
     */
    async loadAdditionalData() {
        // Load any validation or build logs
        const buildLogPath = path.join(this.dataPath, 'build.log');
        if (await fs.pathExists(buildLogPath)) {
            const buildLog = await fs.readFile(buildLogPath, 'utf8');
            this.cache.set('build.log', buildLog);
        }

        const validationReportPath = path.join(this.dataPath, 'validation-report.txt');
        if (await fs.pathExists(validationReportPath)) {
            const validationReport = await fs.readFile(validationReportPath, 'utf8');
            this.cache.set('validation-report.txt', validationReport);
        }
    }

    /**
     * Load all JSON files from a directory
     */
    async loadDirectoryData(dirPath) {
        const data = {};
        
        if (!await fs.pathExists(dirPath)) {
            return data;
        }

        const files = await fs.readdir(dirPath);
        
        for (const filename of files) {
            if (filename.endsWith('.json')) {
                const filePath = path.join(dirPath, filename);
                try {
                    const fileData = await fs.readJson(filePath);
                    const key = path.basename(filename, '.json');
                    data[key] = fileData;
                } catch (error) {
                    console.warn(`⚠️  Failed to load ${filename}: ${error.message}`);
                }
            }
        }
        
        return data;
    }

    /**
     * Validate data integrity after loading
     */
    async validateDataIntegrity() {
        const warnings = [];
        
        // Check for required data
        const required = ['database-index.json', 'colors-sounds-beams.json', 'item-affixes.json'];
        for (const filename of required) {
            if (!this.cache.has(filename)) {
                warnings.push(`Missing required file: ${filename}`);
            }
        }

        // Validate colors, sounds, and beams data
        const visualData = this.get('colors-sounds-beams.json');
        if (visualData) {
            if (!visualData.colors || !visualData.sounds || !visualData.beams) {
                warnings.push('Invalid visual data structure in colors-sounds-beams.json');
            }
        }

        // Validate indexes if they exist
        const indexes = this.get('indexes');
        if (indexes && indexes['id-lookup']) {
            const idLookup = indexes['id-lookup'];
            if (!idLookup.affixes) {
                warnings.push('Missing affixes in id-lookup index');
            }
        }

        if (warnings.length > 0) {
            console.log('⚠️  Data validation warnings:');
            warnings.forEach(warning => console.log(`   - ${warning}`));
        } else {
            console.log('✅ Data integrity validation passed');
        }
    }

    /**
     * Get cached data by key
     */
    get(key) {
        if (!this.loaded) {
            throw new Error('DataManager not loaded. Call loadAll() first.');
        }
        return this.cache.get(key);
    }

    /**
     * Check if data exists for a key
     */
    has(key) {
        return this.cache.has(key);
    }

    /**
     * Get all affix data (combined prefixes and suffixes)
     */
    getAllAffixes() {
        return this.get('all-affixes') || {};
    }

    /**
     * Get affix data by ID
     */
    getAffixById(id) {
        const indexes = this.get('indexes');
        if (indexes && indexes['id-lookup'] && indexes['id-lookup'].affixes) {
            return indexes['id-lookup'].affixes[id.toString()] || null;
        }
        return null;
    }

    /**
     * Get affix by name (fuzzy matching)
     */
    getAffixByName(name) {
        const indexes = this.get('indexes');
        if (indexes && indexes['id-lookup'] && indexes['id-lookup'].affixes) {
            const affixes = indexes['id-lookup'].affixes;
            
            // Exact match first
            for (const [id, data] of Object.entries(affixes)) {
                if (data.name && data.name.toLowerCase() === name.toLowerCase()) {
                    return { id: parseInt(id), ...data };
                }
            }
            
            // Partial match
            for (const [id, data] of Object.entries(affixes)) {
                if (data.name && data.name.toLowerCase().includes(name.toLowerCase())) {
                    return { id: parseInt(id), ...data };
                }
            }
        }
        return null;
    }

    /**
     * Get visual effects data (colors, sounds, beams)
     */
    getVisualEffects() {
        return this.get('colors-sounds-beams.json') || {};
    }

    /**
     * Get color ID by name
     */
    getColorId(colorName) {
        const visualData = this.getVisualEffects();
        if (visualData.colors) {
            for (const [id, name] of Object.entries(visualData.colors)) {
                if (name.toLowerCase() === colorName.toLowerCase()) {
                    return parseInt(id);
                }
            }
        }
        return 0; // Default to White
    }

    /**
     * Get sound ID by name
     */
    getSoundId(soundName) {
        const visualData = this.getVisualEffects();
        if (visualData.sounds) {
            for (const [id, name] of Object.entries(visualData.sounds)) {
                if (name.toLowerCase() === soundName.toLowerCase()) {
                    return parseInt(id);
                }
            }
        }
        return 1; // Default to None
    }

    /**
     * Get beam ID by name
     */
    getBeamId(beamName) {
        const visualData = this.getVisualEffects();
        if (visualData.beams) {
            for (const [id, name] of Object.entries(visualData.beams)) {
                if (name.toLowerCase() === beamName.toLowerCase()) {
                    return parseInt(id);
                }
            }
        }
        return 1; // Default to None
    }

    /**
     * Get skill data by name
     */
    getSkillByName(skillName) {
        const skills = this.get('skills');
        if (!skills) return null;

        // Search across all skill files
        for (const [className, classData] of Object.entries(skills)) {
            // Handle different skill data structures
            let skillsToSearch = [];
            
            if (Array.isArray(classData)) {
                // Simple array structure
                skillsToSearch = classData;
            } else if (classData.masteries && Array.isArray(classData.masteries)) {
                // Nested mastery structure
                for (const mastery of classData.masteries) {
                    if (mastery.skills && Array.isArray(mastery.skills)) {
                        skillsToSearch.push(...mastery.skills.map(skill => ({
                            ...skill,
                            mastery: mastery.name
                        })));
                    }
                }
            } else if (classData.skills && Array.isArray(classData.skills)) {
                // Direct skills property
                skillsToSearch = classData.skills;
            }
            
            const skill = skillsToSearch.find(s => 
                s.name && s.name.toLowerCase() === skillName.toLowerCase()
            );
            
            if (skill) {
                return { ...skill, class: className };
            }
        }
        return null;
    }

    /**
     * Get unique item data by name
     */
    getUniqueByName(itemName) {
        const uniques = this.get('unique-items-overview.json');
        if (!uniques || !Array.isArray(uniques)) return null;

        return uniques.find(item => 
            item.name && item.name.toLowerCase() === itemName.toLowerCase()
        ) || null;
    }

    /**
     * Get database statistics
     */
    getStats() {
        if (!this.loaded) return null;

        const stats = {
            loaded: true,
            cacheSize: this.cache.size,
            files: Array.from(this.cache.keys()),
            affixCount: 0,
            skillCount: 0,
            uniqueCount: 0
        };

        // Count affixes
        const allAffixes = this.getAllAffixes();
        stats.affixCount = Object.keys(allAffixes).length;

        // Count skills
        const skills = this.get('skills');
        if (skills) {
            for (const classData of Object.values(skills)) {
                if (Array.isArray(classData)) {
                    stats.skillCount += classData.length;
                } else if (classData.masteries && Array.isArray(classData.masteries)) {
                    for (const mastery of classData.masteries) {
                        if (mastery.skills && Array.isArray(mastery.skills)) {
                            stats.skillCount += mastery.skills.length;
                        }
                    }
                } else if (classData.skills && Array.isArray(classData.skills)) {
                    stats.skillCount += classData.skills.length;
                }
            }
        }

        // Count uniques
        const uniques = this.get('unique-items-overview.json');
        if (Array.isArray(uniques)) {
            stats.uniqueCount = uniques.length;
        }

        return stats;
    }

    /**
     * Clear cache and reset loaded state
     */
    reset() {
        this.cache.clear();
        this.loaded = false;
    }
}

module.exports = DataManager;