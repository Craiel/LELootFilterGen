#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * HTML Skill Data Parser
 * 
 * Parses the manually downloaded HTML file from Last Epoch Tools
 * to extract skill categorization from the navigation panel.
 */
class HTMLSkillParser {
  constructor() {
    this.htmlFile = path.join(__dirname, '..', 'WebData', 'SkillOverview.html');
    this.skillDataFile = path.join(__dirname, '..', 'WebData', 'SkillData.json');
    this.outputDir = path.join(__dirname, '..', 'Data');
    this.logger = console;
    this.scrapedSkillData = null;
    this.globalTags = new Set(); // Track all unique tags
  }

  /**
   * Load scraped skill data for integration
   */
  async loadScrapedSkillData() {
    if (await fs.pathExists(this.skillDataFile)) {
      this.logger.log('📄 Loading scraped SkillData.json...');
      const skillData = await fs.readJson(this.skillDataFile);
      this.scrapedSkillData = new Map();
      
      // Create lookup map by skill name (navText)
      if (skillData.items) {
        for (const item of skillData.items) {
          if (item.navText && item.navText !== 'Changelog') {
            this.scrapedSkillData.set(item.navText, item);
          }
        }
      }
      
      this.logger.log(`📊 Loaded ${this.scrapedSkillData.size} scraped skill entries for integration`);
    } else {
      this.logger.log('⚠️ SkillData.json not found - parsing without scraped data integration');
    }
  }

  /**
   * Parse the HTML file and extract all skill sections
   */
  async parseSkills() {
    if (!await fs.pathExists(this.htmlFile)) {
      throw new Error(`HTML file not found: ${this.htmlFile}`);
    }

    // Load scraped data first
    await this.loadScrapedSkillData();

    this.logger.log('📄 Loading SkillOverview HTML file...');
    const htmlContent = await fs.readFile(this.htmlFile, 'utf8');
    
    this.logger.log('🔍 Parsing HTML structure...');
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Find the navigation panel
    const navPanel = document.querySelector('.navigation-panel-inner');
    if (!navPanel) {
      throw new Error('Navigation panel not found in HTML');
    }

    this.logger.log('📊 Parsing all skill sections...');

    const results = {
      parsedSections: [],
      totalSkills: 0
    };

    // Expected class names
    const expectedClasses = ['Primalist', 'Mage', 'Sentinel', 'Acolyte', 'Rogue'];
    
    // Find all marker headers (these represent different sections)
    const markerHeaders = navPanel.querySelectorAll('.marker-header');
    
    for (const header of markerHeaders) {
      const sectionName = header.textContent.trim();
      if (!sectionName) continue;

      this.logger.log(`🔍 Processing section: ${sectionName}`);
      
      const isClass = expectedClasses.includes(sectionName);
      let sectionData;

      if (isClass) {
        sectionData = await this.parseClassSection(header, sectionName, navPanel);
      } else {
        sectionData = await this.parseOtherSection(header, sectionName, navPanel);
      }

      if (sectionData && (sectionData.skills?.length > 0 || sectionData.masteries?.length > 0)) {
        results.parsedSections.push({
          name: sectionName,
          type: isClass ? 'class' : 'other',
          data: sectionData
        });
        
        // Count skills safely
        if (isClass && sectionData.masteries && Array.isArray(sectionData.masteries)) {
          results.totalSkills += sectionData.masteries.reduce((sum, mastery) => sum + (mastery.skills?.length || 0), 0);
        } else if (!isClass && sectionData.skills && Array.isArray(sectionData.skills)) {
          results.totalSkills += sectionData.skills.length;
        }
      }
    }

    this.logger.log(`✅ Parsed ${results.parsedSections.length} sections with ${results.totalSkills} total skills`);

    return results;
  }


  /**
   * Parse a class section to extract masteries and skills with proper hierarchy
   */
  async parseClassSection(headerElement, className, navPanel) {
    const classData = {
      name: className,
      masteries: []
    };

    // Find the marker-item to get the category
    const markerItem = headerElement.querySelector('.marker-item');
    const expectedCategory = markerItem ? markerItem.getAttribute('category') : null;
    
    if (!expectedCategory) {
      this.logger.log(`⚠️  No category found for class ${className}`);
      return classData;
    }

    // Find the corresponding nav-block for this class
    const allNavBlocks = navPanel.querySelectorAll('.nav-block');
    let classNavBlock = null;
    
    for (const navBlock of allNavBlocks) {
      const blockCategory = navBlock.getAttribute('category');
      if (blockCategory === expectedCategory) {
        classNavBlock = navBlock;
        break;
      }
    }

    if (!classNavBlock) {
      this.logger.log(`⚠️  No nav-block found for class ${className}`);
      return classData;
    }

    // Extract all skills from the nav-block
    const allSkills = this.extractSkillsFromNavBlock(classNavBlock);
    
    // Filter out "Passive Tree" skills as they're not actual skills
    const actualSkills = allSkills.filter(skill => skill.name !== 'Passive Tree');
    
    if (actualSkills.length > 0) {
      // Group skills by mastery using domain knowledge
      const masteryGroups = this.groupSkillsByMastery(className, actualSkills);
      
      for (const [masteryName, skills] of Object.entries(masteryGroups)) {
        if (skills.length > 0) {
          classData.masteries.push({
            name: masteryName,
            skills: skills
          });
        }
      }
    }

    this.logger.log(`   📚 ${className}: Found ${classData.masteries?.length || 0} masteries with ${classData.masteries?.reduce((sum, m) => sum + m.skills.length, 0) || 0} total skills`);
    
    // Log mastery breakdown
    if (classData.masteries) {
      for (const mastery of classData.masteries) {
        this.logger.log(`      - ${mastery.name}: ${mastery.skills?.length || 0} skills`);
      }
    }

    return classData;
  }

  /**
   * Parse a non-class section to extract skills
   */
  async parseOtherSection(headerElement, sectionName, navPanel) {
    const sectionData = {
      name: sectionName,
      skills: []
    };

    // Find the marker-item to get the category
    const markerItem = headerElement.querySelector('.marker-item');
    const expectedCategory = markerItem ? markerItem.getAttribute('category') : null;
    
    if (!expectedCategory) {
      this.logger.log(`⚠️  No category found for section ${sectionName}`);
      return sectionData;
    }

    // Find the corresponding nav-block for this section
    const allNavBlocks = navPanel.querySelectorAll('.nav-block');
    let sectionNavBlock = null;
    
    for (const navBlock of allNavBlocks) {
      const blockCategory = navBlock.getAttribute('category');
      if (blockCategory === expectedCategory) {
        sectionNavBlock = navBlock;
        break;
      }
    }

    if (!sectionNavBlock) {
      this.logger.log(`⚠️  No nav-block found for section ${sectionName}`);
      return sectionData;
    }

    // Extract all skills from this section
    const skills = this.extractSkillsFromNavBlock(sectionNavBlock);
    sectionData.skills = skills;

    this.logger.log(`   📄 ${sectionName}: Found ${skills.length} skills`);

    return sectionData;
  }



  /**
   * Group skills by mastery using domain knowledge
   */
  groupSkillsByMastery(className, skills) {
    const masteryGroups = {};
    
    // Define mastery skill mappings based on Last Epoch game knowledge
    const masteryMappings = {
      'Primalist': {
        'Base Class': ['Evade', 'Gathering Storm', 'Fury Leap', 'Summon Thorn Totem', 'Swipe', 'Tempest Strike', 'Maelstrom', 'Upheaval', 'Eterra\'s Blessing', 'Warcry'],
        'Beastmaster': ['Summon Wolf', 'Summon Storm Crows', 'Serpent Strike', 'Summon Bear', 'Summon Scorpion', 'Summon Frenzy Totem', 'Summon Sabertooth', 'Summon Raptor'],
        'Shaman': ['Tornado', 'Earthquake', 'Avalanche', 'Summon Storm Totem'],
        'Druid': ['Spriggan Form', 'Summon Spriggan', 'Swarmblade Form', 'Entangling Roots', 'Werebear Form']
      },
      'Mage': {
        'Base Class': ['Evade', 'Mana Strike', 'Focus', 'Flame Ward', 'Teleport', 'Enchant Weapon'],
        'Sorcerer': ['Fireball', 'Meteor', 'Nova', 'Lightning Blast', 'Static Orb', 'Fire Runebolt', 'Volcanic Orb'],
        'Runemaster': ['Runic Invocation', 'Glyph of Dominion', 'Static Spell', 'Surge'],
        'Spellblade': ['Flame Reave', 'Flame Rush', 'Firebrand', 'Shatter Strike', 'Frost Claw'],
        'Other': ['Arcane Ascendance', 'Black Hole', 'Disintegrate', 'Frost Wall', 'Glacier', 'Ice Barrage', 'Snap Freeze']
      },
      'Sentinel': {
        'Base Class': ['Evade', 'Lunge', 'Healing Hands', 'Rebuke', 'Shield Bash', 'Shield Rush', 'Shield Throw'],
        'Paladin': ['Holy Aura', 'Judgement', 'Ring of Shields', 'Sigils of Hope', 'Smite'],
        'Forge Guard': ['Forge Strike', 'Hammer Throw', 'Manifest Armor', 'Smelter\'s Wrath'],
        'Void Knight': ['Abyssal Echoes', 'Anomaly', 'Devouring Orb', 'Erasing Strike', 'Void Cleave', 'Volatile Reversal'],
        'Other': ['Javelin', 'Multistrike', 'Rive', 'Vengeance', 'Warpath']
      },
      'Acolyte': {
        'Base Class': ['Evade', 'Harvest', 'Marrow Shards', 'Sacrifice', 'Transplant'],
        'Necromancer': ['Summon Skeleton', 'Summon Mage', 'Summon Bone Golem', 'Bone Curse', 'Assemble Abomination', 'Summon Volatile Zombie'],
        'Lich': ['Soul Feast', 'Drain Life', 'Death Seal', 'Reaper Form', 'Ghostflame'],
        'Warlock': ['Chaos Bolts', 'Chthonic Fissure', 'Infernal Shade', 'Profane Veil'],
        'Other': ['Aura of Decay', 'Dread Shade', 'Flay', 'Hungering Souls', 'Rip Blood', 'Spirit Plague', 'Summon Wraith', 'Wandering Spirits']
      },
      'Rogue': {
        'Base Class': ['Evade', 'Puncture', 'Shift', 'Smoke Bomb', 'Decoy'],
        'Bladedancer': ['Dancing Strikes', 'Flurry', 'Lethal Mirage', 'Synchronized Strikes', 'Umbral Blades'],
        'Marksman': ['Multishot', 'Detonating Arrow', 'Explosive Trap', 'Hail of Arrows', 'Net', 'Summon Ballista'],
        'Falconer': ['Falconry', 'Aerial Assault', 'Dive Bomb'],
        'Other': ['Acid Flask', 'Cinder Strike', 'Dark Quiver', 'Heartseeker', 'Shadow Cascade', 'Shurikens']
      }
    };

    const classMapping = masteryMappings[className];
    if (!classMapping) {
      // Fallback to single group if no mapping exists
      masteryGroups[`${className} Skills`] = skills;
      return masteryGroups;
    }

    // Initialize mastery groups
    for (const masteryName of Object.keys(classMapping)) {
      masteryGroups[masteryName] = [];
    }
    
    // Add unmapped skills group
    masteryGroups['Other'] = [];

    // Categorize each skill
    for (const skill of skills) {
      let categorized = false;
      
      for (const [masteryName, masterySkills] of Object.entries(classMapping)) {
        if (masterySkills.some(mappedSkill => skill.name.includes(mappedSkill) || mappedSkill.includes(skill.name))) {
          masteryGroups[masteryName].push(skill);
          categorized = true;
          break;
        }
      }
      
      if (!categorized) {
        masteryGroups['Other'].push(skill);
      }
    }

    // Remove empty groups
    for (const masteryName of Object.keys(masteryGroups)) {
      if (masteryGroups[masteryName].length === 0) {
        delete masteryGroups[masteryName];
      }
    }

    return masteryGroups;
  }

  /**
   * Extract skills from a nav-block element
   */
  extractSkillsFromNavBlock(navBlock) {
    const skills = [];
    
    // Look for section-item nav-item links in the nav-block
    const skillLinks = navBlock.querySelectorAll('.section-item.nav-item');
    
    for (const link of skillLinks) {
      const markerItem = link.querySelector('.marker-item');
      if (markerItem) {
        let skillName = markerItem.textContent.trim();
        
        // Clean up skill name (remove icon text if present)
        if (markerItem.classList.contains('with-icon')) {
          // For with-icon elements, the text is usually after the icon div
          // Get all text nodes and join them
          const walker = markerItem.ownerDocument.createTreeWalker(
            markerItem,
            markerItem.ownerDocument.defaultView.NodeFilter.SHOW_TEXT,
            null,
            false
          );
          
          const textParts = [];
          let node;
          while (node = walker.nextNode()) {
            const text = node.nodeValue.trim();
            if (text && text.length > 0) {
              textParts.push(text);
            }
          }
          
          if (textParts.length > 0) {
            skillName = textParts.join(' ').trim();
          }
        }
        
        if (skillName && skillName.length > 0) {
          const skillData = {
            name: skillName,
            section: link.getAttribute('section') || ''
          };
          
          // Integrate scraped data if available
          if (this.scrapedSkillData && this.scrapedSkillData.has(skillName)) {
            const scrapedInfo = this.scrapedSkillData.get(skillName);
            const extractedSkillData = this.extractSkillGameData(scrapedInfo);
            Object.assign(skillData, extractedSkillData);
          }
          
          skills.push(skillData);
        }
      }
    }
    
    return skills;
  }

  /**
   * Extract relevant game data from scraped skill information
   */
  extractSkillGameData(scrapedInfo) {
    const skillData = {};
    
    // Add description
    if (scrapedInfo.description) {
      skillData.description = scrapedInfo.description;
    }

    // Extract skill stats from HTML if available
    if (scrapedInfo.rawHtml) {
      const htmlData = this.parseSkillHtml(scrapedInfo.rawHtml);
      Object.assign(skillData, htmlData);
    }

    // Note: Removed lists processing as requested - focusing on structured HTML parsing instead

    return skillData;
  }

  /**
   * Parse skill HTML to extract key game statistics
   */
  parseSkillHtml(rawHtml) {
    const skillData = {};
    
    try {
      const dom = new JSDOM(rawHtml);
      const doc = dom.window.document;

      // Extract basic stats
      this.extractBasicStats(doc, rawHtml, skillData);
      
      // Extract structured data blocks
      this.extractStructuredBlocks(doc, skillData);
      
      // Extract tags and add to global tracking
      this.extractAndTrackTags(doc, skillData);

      // Extract additional info sections
      this.extractAdditionalInfo(doc, skillData);

    } catch (error) {
      console.warn(`Failed to parse HTML for skill: ${error.message}`);
    }

    return skillData;
  }

  /**
   * Extract basic stats like mana cost, cooldown, etc.
   */
  extractBasicStats(doc, rawHtml, skillData) {
    // Mana cost
    const manaCostMatch = rawHtml.match(/Mana Cost:\s*<[^>]*><[^>]*>(\d+)<\/[^>]*><\/[^>]*>/);
    if (manaCostMatch) {
      skillData.manaCost = parseInt(manaCostMatch[1]);
    }

    // Cooldown
    const cooldownMatch = rawHtml.match(/Cooldown:\s*<[^>]*><[^>]*>([^<]+)<\/[^>]*><\/[^>]*>/);
    if (cooldownMatch) {
      skillData.cooldown = cooldownMatch[1].trim();
    }

    // Base Speed
    const baseSpeedMatch = rawHtml.match(/Base Speed:\s*<[^>]*><[^>]*>([^<]+)<\/[^>]*><\/[^>]*>/);
    if (baseSpeedMatch) {
      skillData.baseSpeed = baseSpeedMatch[1].trim();
    }

    // Use Delay and Duration
    const useDelayMatch = rawHtml.match(/Use Delay:\s*<[^>]*><[^>]*>([^<]+)<\/[^>]*><\/[^>]*>/);
    if (useDelayMatch) {
      skillData.useDelay = useDelayMatch[1].trim();
    }

    const useDurationMatch = rawHtml.match(/Use Duration:\s*<[^>]*><[^>]*>([^<]+)<\/[^>]*><\/[^>]*>/);
    if (useDurationMatch) {
      skillData.useDuration = useDurationMatch[1].trim();
    }

    // Critical stats
    const critChanceMatch = rawHtml.match(/Critical Chance:\s*<[^>]*>([^<]+)<\/[^>]*>/);
    if (critChanceMatch) {
      skillData.criticalChance = critChanceMatch[1].trim();
    }

    const critMultMatch = rawHtml.match(/Critical Multiplier:\s*<[^>]*>([^<]+)<\/[^>]*>/);
    if (critMultMatch) {
      skillData.criticalMultiplier = critMultMatch[1].trim();
    }
  }

  /**
   * Extract structured data blocks (Scaling, Summon, Base Damage, etc.)
   */
  extractStructuredBlocks(doc, skillData) {
    const abilityParams = doc.querySelectorAll('.ability-params');
    
    for (const param of abilityParams) {
      const text = param.textContent.trim();
      
      // Base Damage section
      if (text.includes('Base Damage:')) {
        skillData.baseDamage = this.extractBaseDamageInfo(param);
      }
      
      // Scaling section
      if (text.includes('Scaling:')) {
        skillData.scaling = this.extractScalingInfo(param);
      }
      
      // Summon section
      if (text.includes('Summon:')) {
        skillData.summon = this.extractSummonInfo(param);
      }
      
      // Combo skills section
      if (text.includes('Combo skills:')) {
        skillData.comboSkills = this.extractComboSkillsInfo(param);
      }
      
      // Trigger section
      if (text.includes('Trigger on hit:') || text.includes('Trigger on')) {
        skillData.triggers = this.extractTriggersInfo(param);
      }
    }
  }

  /**
   * Extract Base Damage information
   */
  extractBaseDamageInfo(param) {
    const damageInfo = {};
    const text = param.textContent;
    
    // Extract damage amount and type
    const damageMatch = text.match(/(\d+)\s+(\w+)/);
    if (damageMatch) {
      damageInfo.amount = parseInt(damageMatch[1]);
      damageInfo.type = damageMatch[2];
    }
    
    return damageInfo;
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
   * Extract Summon information
   */
  extractSummonInfo(param) {
    const summon = {};
    
    // Extract summon count and type
    const countMatch = param.textContent.match(/(\d+) x/);
    if (countMatch) {
      summon.count = parseInt(countMatch[1]);
    }
    
    const entityLink = param.querySelector('.entity-link');
    if (entityLink) {
      summon.type = entityLink.textContent.trim();
    }
    
    const limitMatch = param.textContent.match(/Summon limit:\s*(\d+)/);
    if (limitMatch) {
      summon.limit = parseInt(limitMatch[1]);
    }
    
    return summon;
  }

  /**
   * Extract Combo Skills information
   */
  extractComboSkillsInfo(param) {
    const comboSkills = [];
    const skillLinks = param.querySelectorAll('.ability-link');
    
    for (const link of skillLinks) {
      comboSkills.push(link.textContent.trim());
    }
    
    return comboSkills;
  }

  /**
   * Extract Triggers information
   */
  extractTriggersInfo(param) {
    const triggers = [];
    const triggerLinks = param.querySelectorAll('.ability-link');
    
    for (const link of triggerLinks) {
      triggers.push(link.textContent.trim());
    }
    
    return triggers;
  }

  /**
   * Extract and track all tags globally
   */
  extractAndTrackTags(doc, skillData) {
    // Scaling Tags
    const scalingTagsEl = doc.querySelector('.ability-params:has(.ability-tags)');
    if (scalingTagsEl) {
      const tags = [];
      const tagElements = scalingTagsEl.querySelectorAll('.ability-tag');
      for (const tagEl of tagElements) {
        const tag = tagEl.textContent.trim();
        tags.push(tag);
        this.globalTags.add(tag); // Add to global tracking
      }
      if (tags.length > 0) {
        skillData.tags = tags;
      }
    }

    // Minion Tags (for minion-related skills)
    const minionTagsSection = doc.querySelector('.ability-params');
    if (minionTagsSection && minionTagsSection.textContent.includes('Minion Tags:')) {
      const minionTags = [];
      const minionTagElements = minionTagsSection.querySelectorAll('.ability-tag');
      for (const tagEl of minionTagElements) {
        const tag = tagEl.textContent.trim();
        minionTags.push(tag);
        this.globalTags.add(tag); // Add to global tracking
      }
      if (minionTags.length > 0) {
        skillData.minionTags = minionTags;
      }
    }
  }

  /**
   * Extract additional information sections
   */
  extractAdditionalInfo(doc, skillData) {
    // Alt-text for additional descriptions
    const altTextEl = doc.querySelector('.ability-alt-text');
    if (altTextEl) {
      skillData.additionalInfo = altTextEl.textContent.trim();
    }

    // Source class/level requirement
    const sourceClassEl = doc.querySelector('.ability-source-class');
    if (sourceClassEl) {
      skillData.source = sourceClassEl.textContent.trim();
    }
  }

  /**
   * Extract skill names from an element, excluding certain child elements
   */
  extractSkillsFromElement(element, excludeSelectors = []) {
    const skills = [];
    
    // Create a clone to avoid modifying the original
    const elementClone = element.cloneNode(true);
    
    // Remove excluded child elements
    if (excludeSelectors.length > 0) {
      const excludeElements = elementClone.querySelectorAll(excludeSelectors.join(', '));
      for (const excludeElement of excludeElements) {
        excludeElement.remove();
      }
    }
    
    // Look for section-item nav-item links (the primary skill elements)
    const skillLinks = elementClone.querySelectorAll('.section-item.nav-item');
    for (const link of skillLinks) {
      const markerItem = link.querySelector('.marker-item');
      if (markerItem) {
        const skillName = this.extractTextFromMarkerItem(markerItem);
        if (skillName) {
          skills.push({
            name: skillName,
            link: link.getAttribute('href') || '',
            section: link.getAttribute('section') || ''
          });
        }
      }
    }
    
    // If no section-item links found, look for other link types
    if (skills.length === 0) {
      const links = elementClone.querySelectorAll('a');
      for (const link of links) {
        const skillName = link.textContent.trim();
        if (skillName && skillName.length > 2) { // Avoid very short non-skill text
          skills.push({
            name: skillName,
            link: link.getAttribute('href') || ''
          });
        }
      }
    }
    
    return skills;
  }

  /**
   * Extract clean text from a marker-item element
   */
  extractTextFromMarkerItem(markerItem) {
    let skillName = markerItem.textContent.trim();
    
    // Clean up skill name (remove icon text if present)
    if (markerItem.classList.contains('with-icon')) {
      // For with-icon elements, the text is usually after the icon div
      // Get all text nodes and join them
      const walker = markerItem.ownerDocument.createTreeWalker(
        markerItem,
        markerItem.ownerDocument.defaultView.NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      const textParts = [];
      let node;
      while (node = walker.nextNode()) {
        const text = node.nodeValue.trim();
        if (text && text.length > 0) {
          textParts.push(text);
        }
      }
      
      if (textParts.length > 0) {
        skillName = textParts.join(' ').trim();
      }
    }
    
    return skillName && skillName.length > 0 ? skillName : null;
  }

  /**
   * Check if text represents a new major section
   */
  isNewMajorSection(text) {
    const majorSectionIndicators = [
      'Primalist', 'Mage', 'Sentinel', 'Acolyte', 'Rogue',
      'Skills', 'Abilities', 'Passives', 'Categories'
    ];
    
    return majorSectionIndicators.some(indicator => text.includes(indicator));
  }

  /**
   * Check if an element could represent a mastery
   */
  couldBeMastery(element, text) {
    // Masteries are usually sub-headers or emphasized text
    const tagName = element.tagName.toLowerCase();
    
    return (
      (tagName === 'h3' || tagName === 'h4' || tagName === 'h5') &&
      text.length > 0 &&
      text.length < 50 && // Reasonable length for a mastery name
      !this.isNewMajorSection(text)
    );
  }

  /**
   * Save parsed data as separate JSON files for each section
   */
  async saveData(results) {
    await fs.ensureDir(this.outputDir);
    
    const savedFiles = [];
    const summary = {
      parseDate: new Date().toISOString(),
      totalSections: results.parsedSections.length,
      totalSkills: results.totalSkills,
      sections: []
    };

    // Save each section as a separate JSON file
    for (const section of results.parsedSections) {
      // Create safe filename from section name
      const safeFileName = section.name.toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      
      const fileName = `skills_${safeFileName}.json`;
      const filePath = path.join(this.outputDir, fileName);
      
      // Add metadata to the section data
      const fileData = {
        sectionName: section.name,
        sectionType: section.type,
        parseDate: new Date().toISOString(),
        ...section.data
      };

      await fs.writeJson(filePath, fileData, { spaces: 2 });
      savedFiles.push(fileName);

      // Add to summary
      const sectionSummary = {
        name: section.name,
        type: section.type,
        fileName: fileName
      };

      if (section.type === 'class' && section.data.masteries && Array.isArray(section.data.masteries)) {
        sectionSummary.masteryCount = section.data.masteries.length;
        sectionSummary.skillCount = section.data.masteries.reduce((sum, mastery) => sum + (mastery.skills?.length || 0), 0);
        sectionSummary.masteries = section.data.masteries.map(mastery => ({
          name: mastery.name,
          skillCount: mastery.skills?.length || 0
        }));
      } else if (section.data.skills) {
        sectionSummary.skillCount = section.data.skills.length;
      } else {
        sectionSummary.skillCount = 0;
      }

      summary.sections.push(sectionSummary);

      this.logger.log(`✅ Saved ${section.name} skills to ${fileName} (${sectionSummary.skillCount} skills)`);
    }

    this.logger.log(`📁 Created ${savedFiles.length} skill section files`);

    return summary;
  }

  /**
   * Get collected global tags
   */
  getGlobalTags() {
    return Array.from(this.globalTags).sort();
  }

  /**
   * Main parsing method
   */
  async parse() {
    try {
      this.logger.log('🚀 Starting HTML skill parsing...');
      
      const results = await this.parseSkills();
      const summary = await this.saveData(results);
      
      this.logger.log('\n🎉 HTML skill parsing complete!');
      return summary;
      
    } catch (error) {
      this.logger.error('❌ HTML skill parsing failed:', error.message);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  try {
    const parser = new HTMLSkillParser();
    await parser.parse();
  } catch (error) {
    console.error('\n💥 Skill parsing failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { HTMLSkillParser };