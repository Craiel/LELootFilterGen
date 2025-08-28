# Filter Generation System Implementation Plan

This document outlines the complete implementation plan for automated Last Epoch loot filter generation, broken down into actionable phases with specific tasks, files, and deliverables.

## Overview

The system transforms minimal user build descriptions into comprehensive XML loot filters through a multi-phase process:

```
User Build File → Skill Data Lookup → Intermediate Format → XML Generation → Optimized Filter
```

## PHASE 1: Foundation & Claude Interface

### 1.1 Create Filter Creation Instructions
- [ ] **Create** `docs/FILTER_CREATION_INSTRUCTIONS.md`
  - Reference META_BUILD_FORMAT.md for user input structure
  - Link to INTERMEDIATE_BUILD_FORMAT.md for output format
  - Step-by-step skill data lookup process
  - Unique item integration procedures
  - Multi-build handling guidelines
  - Learning system integration instructions

### 1.2 Learning System Infrastructure
- [ ] **Create** `docs/learning/BUILD_GENERATION_INSIGHTS.md`
  - High-level build pattern insights
  - Skill synergy discoveries
  - Multi-build optimization techniques
- [ ] **Create** `docs/learning/COMMON_MISTAKES.md`
  - Documented generation errors and solutions
  - User feedback integration patterns
- [ ] **Create** `docs/learning/SKILL_DATA_PATTERNS.md`
  - Skill→stat relationship patterns
  - Build type classification insights

### 1.3 Enhanced Database Access
- [ ] **Enhance** `src/lib/database-loader.js`
  - Add `getSkillsByName(skillName)` method
  - Add `getSkillSynergies(skillName)` method  
  - Add `classifyBuildType(primarySkill)` method
  - Add `getAffixesByBuildType(buildType)` method

## PHASE 2: Intermediate Build Processing

### 2.1 Core Intermediate Processor
- [ ] **Create** `src/lib/intermediate-build-processor.js`
  - `expandUserBuild(userInput)` - Main expansion function
  - `lookupSkillData(skillName, database)` - Skill data retrieval
  - `deriveScalingStats(skills, uniqueItems)` - Priority calculation
  - `mapAffixNames(humanNames)` - Name→ID mapping
  - `generateProgressionRules(buildType)` - Level-gated requirements
  - `handleMultiBuild(buildsArray)` - Multi-build optimization

### 2.2 Skill Data Enhancement
- [ ] **Create** detailed skill mapping database structure
  - Map each skill to damage types, scaling stats, weapon compatibility
  - Include build type classification (minion, spell, melee, bow, hybrid)
  - Add synergy information and resource requirements
- [ ] **Integrate** skill data with existing database structure
  - Extend database-loader.js with skill-specific methods
  - Create indexes for efficient skill→affix lookups

### 2.3 Unique Item Integration
- [ ] **Create** `src/lib/unique-item-effects.js`
  - `getItemEffects(uniqueName)` - Retrieve mechanics data
  - `modifyBuildForItem(buildProfile, itemEffects)` - Apply modifications
  - `detectItemSynergies(items)` - Multi-item interactions
- [ ] **Create** unique item mechanics database
  - Build-enabling effects (Exsanguinous, Fractured Crown, etc.)
  - Stat modifications and scaling changes
  - Skill interactions and mechanical alterations

### 2.4 Multi-Build Support
- [ ] **Create** `src/lib/multi-build-analyzer.js`
  - `analyzeEquipmentOverlap(builds)` - Equipment compatibility
  - `calculateStatIntersection(builds)` - Shared stat priorities
  - `optimizeRuleSharing(builds)` - Efficiency optimization
  - `resolveConflicts(builds)` - Handle incompatible requirements

## PHASE 3: XML Filter Generation

### 3.1 Core Filter Generator
- [ ] **Create** `src/lib/filter-generator.js`
  - `generateFilter(intermediateBuild, options)` - Main generation
  - `createProgressiveRules(equipmentType)` - Level-gated rules
  - `optimizeRuleCount(rules)` - Combine for efficiency
  - `applyStrictnessLevel(rules, strictness)` - Modify requirements
  - `addClassFiltering(rules, allowedClasses)` - Class restrictions

### 3.2 Rule Pattern Templates
- [ ] **Create** `src/lib/rule-templates.js` based on sample filter analysis
  - **Global Hide Pattern**: Ultra-strict baseline + exceptions
  - **Progressive Weapons**: Level-gated weapon requirements  
  - **Tier-Based Affixes**: T7+, T6+ quality progression
  - **Multi-Build Hybrid**: Large affix arrays for compatibility
  - **Specialized Categories**: Focused mechanics rules

### 3.3 Valuable Items Integration
- [ ] **Convert** `docs/VALUABLE_UNIQUE_ITEMS.md` to JSON format (within filter-generator/docs/)
- [ ] **Create** `src/lib/valuable-items-processor.js`
  - LP threshold rules for valuable uniques
  - Set item handling and prioritization
  - Weaver's Will value rules
  - Build-specific unique prioritization

### 3.4 Rule Optimization Engine
- [ ] **Create** `src/lib/rule-optimizer.js`
  - Combine similar affix conditions into single rules
  - Use large affix arrays instead of multiple rules
  - Progressive rule consolidation for level ranges
  - Global hide + exceptions for maximum efficiency
  - **Ensure compliance with 75-rule limit**

## PHASE 4: Integration & User Interface

### 4.1 Enhanced CLI Interface
- [ ] **Expand** `src/index.js` with new commands:
  - `generate-intermediate <build.json>` - Create expanded build
  - `generate-from-intermediate <expanded.json>` - XML from intermediate
  - `interactive-build` - Guided build creation
  - `validate-build <build.json>` - Build file validation

### 4.2 Parameter System
- [ ] **Implement** strictness level handling:
  - `semi_strict`: T5+ requirements, accessible progression
  - `strict`: T6+ requirements, standard endgame
  - `very_strict`: T7+ focus, high quality only
  - `ultra_strict`: Minimal volume, premium items only
- [ ] **Add** additional parameters:
  - `levelRange`: leveling, mixed, endgame
  - `multiCharacter`: Enable multi-build optimization
  - `customOverrides`: User-specified modifications

### 4.3 Validation Framework
- [ ] **Create** `src/lib/build-validator.js`
  - Skill name accuracy validation
  - Class/mastery compatibility checks
  - Unique item availability verification
- [ ] **Create** `src/lib/filter-validator.js`
  - Rule count compliance (≤75 rules)
  - XML structure validation
  - Condition logic verification
- [ ] **Create** integration tests in `tests/integration/`

## PHASE 5: Learning & Iteration

### 5.1 Feedback System
- [ ] **Create** feedback collection mechanism
  - Build accuracy assessment
  - Item coverage evaluation
  - Progression suitability review
  - Specific improvement suggestions

### 5.2 Learning Integration
- [ ] **Implement** Claude learning system
  - Feedback review and learning file updates
  - Skill synergy pattern recognition
  - Multi-build optimization improvements
  - Strictness level calibration

### 5.3 Continuous Improvement
- [ ] **Establish** regular review process
  - Template refinement based on successful builds
  - Skill database enhancement
  - Documentation updates from common issues
  - Rule pattern optimization

## Implementation Priority

### Phase 1 (Foundation) - Week 1-2
- Filter creation instructions
- Learning system structure
- Database access enhancement

### Phase 2 (Intermediate Processing) - Week 3-4
- Core build processor
- Skill data integration
- Unique item effects system

### Phase 3 (XML Generation) - Week 5-6
- Filter generator core
- Rule templates from sample analysis
- Optimization engine

### Phase 4 (Integration) - Week 7-8
- CLI enhancements
- Parameter system
- Validation framework

### Phase 5 (Learning) - Ongoing
- Feedback collection
- Iterative improvements
- System optimization

## Project Scope Constraint

**CRITICAL**: All implementation must remain within the `filter-generator` project directory. No changes to parent LELootFilterGen repository structure or database-generator project.

### Path Structure (All Relative to filter-generator/)
```
filter-generator/
├── src/                    # All new source files here
├── docs/                   # All new documentation here  
├── Data/                   # Read-only database files (generated by database-generator)
├── SampleFilters/          # Read-only sample filters for pattern analysis
├── generated/              # Output directory for generated filters
└── tests/                  # All test files here
```

## Key Dependencies

### External Dependencies (Read-Only)
- Database structure (`Data/`) - Generated by database-generator project
- Sample filters (`SampleFilters/`) - For pattern analysis only
- Existing documentation (`docs/`) - Reference for implementation

### Internal Dependencies (Within filter-generator/)
- DatabaseLoader class (`src/lib/database-loader.js`) - Existing
- XML generation utilities - To be created in `src/lib/`
- CLI interface (`src/index.js`) - Existing, to be enhanced
- All new processors, generators, validators - Create in `src/lib/`

## Success Metrics

### Phase 1-2 Success
- [ ] User can input simple build description
- [ ] System expands to comprehensive intermediate format
- [ ] All required data successfully retrieved from database

### Phase 3-4 Success
- [ ] Intermediate format generates valid XML filter
- [ ] Filter stays within 75-rule limit
- [ ] Generated filters match quality of sample filters

### Phase 5 Success
- [ ] System learns from user feedback
- [ ] Generation quality improves over time
- [ ] Common user patterns automated

## Technical Constraints

### Hard Requirements
- **75-rule maximum** for all generated filters
- **XML schema compliance** with Last Epoch format
- **Database compatibility** with existing structure
- **Node.js compatibility** for all components

### Performance Requirements
- Intermediate generation: <30 seconds
- XML generation: <10 seconds  
- Database queries: <5 seconds
- Multi-build processing: <60 seconds

## PHASE 2 COMPLETION STATUS ✅

**COMPLETED COMPONENTS:**
- [x] Enhanced DatabaseLoader with skill-specific methods (generic, database-driven)
- [x] Core Intermediate Build Processor (fully generic, no hardcoded data)
- [x] Unique Item Effects Processor (database-driven analysis)
- [x] Multi-Build Analyzer (compatibility and optimization)
- [x] Learning System Infrastructure (pattern capture)
- [x] Project Rules Documentation (governance framework)

## PHASE 3: XML FILTER GENERATION (CURRENT PRIORITY)

### 3.1 IMMEDIATE: Testing Interface & Claude Integration
- [ ] **Create CLI command for intermediate generation**
  - Expand `src/index.js` with `generate-intermediate <build.json>` command
  - Add file validation and error handling
  - Output to `generated/intermediate/` directory
- [ ] **Test intermediate generation with real examples**
  - Use existing `SampleFilters/*.build.json` files
  - Verify database connectivity and data retrieval
  - Test single-build and multi-build formats
  - Document any missing database schema requirements

### 3.2 Core Filter Generator
- [ ] **Create** `src/lib/filter-generator.js`
  - `generateFilter(intermediateBuild, options)` - Main generation
  - `createProgressiveRules(equipmentType)` - Level-gated rules
  - `optimizeRuleCount(rules)` - Combine for efficiency
  - `applyStrictnessLevel(rules, strictness)` - Modify requirements
  - `addClassFiltering(rules, allowedClasses)` - Class restrictions

### 3.3 Rule Pattern Templates
- [ ] **Create** `src/lib/rule-templates.js` based on sample filter analysis
  - **Global Hide Pattern**: Ultra-strict baseline + exceptions
  - **Progressive Weapons**: Level-gated weapon requirements  
  - **Tier-Based Affixes**: T7+, T6+ quality progression
  - **Multi-Build Hybrid**: Large affix arrays for compatibility
  - **Specialized Categories**: Focused mechanics rules

### 3.4 Valuable Items Integration
- [ ] **Convert** `docs/VALUABLE_UNIQUE_ITEMS.md` to JSON format (within filter-generator/docs/)
- [ ] **Create** `src/lib/valuable-items-processor.js`
  - LP threshold rules for valuable uniques
  - Set item handling and prioritization
  - Weaver's Will value rules
  - Build-specific unique prioritization

### 3.5 Rule Optimization Engine
- [ ] **Create** `src/lib/rule-optimizer.js`
  - Combine similar affix conditions into single rules
  - Use large affix arrays instead of multiple rules
  - Progressive rule consolidation for level ranges
  - Global hide + exceptions for maximum efficiency
  - **Ensure compliance with 75-rule limit**

## PHASE 4: Integration & User Interface (NEXT)

### 4.1 Enhanced CLI Interface
- [ ] **Expand** `src/index.js` with new commands:
  - `generate-from-intermediate <expanded.json>` - XML from intermediate
  - `interactive-build` - Guided build creation
  - `validate-build <build.json>` - Build file validation

### 4.2 Parameter System
- [ ] **Implement** strictness level handling:
  - `semi_strict`: T5+ requirements, accessible progression
  - `strict`: T6+ requirements, standard endgame
  - `very_strict`: T7+ focus, high quality only
  - `ultra_strict`: Minimal volume, premium items only
- [ ] **Add** additional parameters:
  - `levelRange`: leveling, mixed, endgame
  - `multiCharacter`: Enable multi-build optimization
  - `customOverrides`: User-specified modifications

### 4.3 Validation Framework
- [ ] **Create** `src/lib/build-validator.js`
  - Skill name accuracy validation
  - Class/mastery compatibility checks
  - Unique item availability verification
- [ ] **Create** `src/lib/filter-validator.js`
  - Rule count compliance (≤75 rules)
  - XML structure validation
  - Condition logic verification
- [ ] **Create** integration tests in `tests/integration/`

## HOW TO USE THE SYSTEM (CURRENT STATE)

### Step 1: Create a Build File
Create a JSON file following META_BUILD_FORMAT.md:

**Single Build Example** (`my-necromancer.build.json`):
```json
{
  "name": "Necromancer - Bone Spear",
  "class": "Acolyte",
  "mastery": "Necromancer", 
  "primarySkill": "Bone Spear",
  "secondarySkills": ["Bone Curse", "Bone Armor"],
  "defense": "armor"
}
```

**Multi-Build Example** (`dual-primalist.build.json`):
```json
{
  "name": "Primalist Dual Build",
  "builds": [
    {
      "name": "Beastmaster Summoner",
      "class": "Primalist",
      "mastery": "Beastmaster",
      "primarySkill": "Summon Bear"
    },
    {
      "name": "Druid Caster", 
      "class": "Primalist",
      "mastery": "Druid",
      "primarySkill": "Tornado"
    }
  ]
}
```

### Step 2: Analyze Build (Claude Phase 1)
```bash
cd filter-generator
npm run analyze-build my-necromancer.build.json
```

This command provides instructions for manual Claude analysis:
1. Opens a fresh Claude Code session
2. Provides the build file and FILTER_CREATION_INSTRUCTIONS.md
3. Claude manually analyzes using database files
4. Claude creates comprehensive build analysis file

**Output**: `generated/analysis/my-necromancer.analysis.json` (created by Claude)

### Step 3: Review Analysis File
The analysis file contains:
- Complete skill data analysis
- All relevant affix IDs and mappings
- Unique item compatibility analysis
- Multi-build optimization (if applicable)
- Rule count estimates and patterns

### Step 4: Create XML Filter (Claude Phase 2)
```bash
npm run create-filter generated/analysis/my-necromancer.analysis.json --strictness=strict
```

This command provides instructions for Claude XML generation:
1. Opens a fresh Claude Code session
2. Provides analysis file and XML_GENERATION_INSTRUCTIONS.md
3. Claude creates optimized XML filter within 75-rule limit

**Output**: `generated/my-necromancer-strict.xml` (created by Claude)

## CURRENT TESTING PRIORITIES

### Test Database Connectivity
1. **Verify database structure**: Check that all required data files exist
2. **Test skill lookups**: Verify skill data can be found by name
3. **Test affix resolution**: Confirm affix IDs can be retrieved
4. **Test unique item data**: Ensure unique item database is accessible

### Test Intermediate Generation
1. **Single build test**: Use simple Necromancer example
2. **Multi-build test**: Use existing Primalist sample builds
3. **Error handling test**: Try invalid skill names, missing fields
4. **Complex build test**: Build with unique items and secondary skills

### Immediate Development Tasks
1. **Add CLI command for intermediate generation**
2. **Create output directories** (`generated/intermediate/`, `generated/`)
3. **Test with existing sample build files**
4. **Document database schema requirements if any are missing**
5. **Create example build files for testing**

## Success Metrics for Phase 3

### Immediate Testing Success
- [x] CLI command provides Claude analysis instructions
- [ ] Claude successfully generates comprehensive intermediate files
- [ ] Database queries return valid skill and affix data
- [ ] Generated intermediate files contain complete, actionable data
- [ ] Error handling provides clear guidance for invalid inputs

### Filter Generation Success
- [ ] Intermediate format generates valid XML filter
- [ ] Filter stays within 75-rule limit
- [ ] Generated filters match quality expectations from sample analysis
- [ ] Multi-build filters show proper optimization

This plan provides the roadmap for immediate testing and Phase 3 completion, with clear steps for using the system and measuring success.
