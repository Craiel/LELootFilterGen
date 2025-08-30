# Filter Creation Instructions for Claude

This document provides step-by-step instructions for Claude to transform minimal user build descriptions into comprehensive intermediate build files that can be used for automated filter generation.

## Overview

**CRITICAL: This is a PURE ANALYSIS PROCESS - NO SCRIPTING OR AUTOMATED TOOLS**

When a user requests filter generation with a command like:
> "Generate a filter for `Mine - Primalist.build.json`, use FILTER_ANALYSIS_INSTRUCTIONS.md"

Your task is to **manually analyze and expand the build using only Claude's analytical capabilities**:
1. **Read and understand** the user's minimal build file
2. **Manually search** database files for skill and affix data
3. **Analyze and expand** using game knowledge and database lookups
4. **Create** the comprehensive intermediate format by hand
5. **Output** the completed expanded build file

**DO NOT:**
- Create or run any scripts or automation
- Use existing intermediate-build-processor.js or any other automated tools  
- Implement new functions or classes
- Write code to process the data

**DO:**
- Read database files directly using Read tool
- Manually search through skill data, affix data, etc.
- Apply game knowledge and logical analysis
- Create the intermediate format through pure analytical work

## Process Flow

```
User Build File → Data Lookup → Skill Analysis → Intermediate Expansion → Validation → Output
```

## Step 1: Read and Validate User Input

### 1.1 Load the User Build File
- Read the provided `.build.json` file
- Validate it follows the META_BUILD_FORMAT.md structure
- Check for required fields: `class`, `mastery`, `primarySkill`

### 1.2 Input Format Recognition
Handle both single build and multi-build formats:

**Single Build Format:**
```json
{
  "name": "Necromancer - Arcane Servants",
  "class": "Acolyte",
  "mastery": "Necromancer",
  "primarySkill": "Summon Skeleton",
  "secondarySkills": ["Bone Curse", "Bone Armor"],
  "defense": "armor"
}
```

**Multi-Build Format:**
```json
{
  "name": "Universal Primalist",
  "builds": [
    {
      "name": "Beastmaster Summoner",
      "class": "Primalist",
      "mastery": "Beastmaster",
      "primarySkill": "Summon Bear",
      // ... additional build data
    }
  ]
}
```

## Step 2: Database Access and Skill Lookup

### 2.1 Access the Database
**MANUALLY READ database files using Read tool only:**
- Skills data from `Data/Skills/` 
- Affix data from `Data/Prefixes/` and `Data/Suffixes/`
- Unique items from `Data/unique-items-overview.json`
- Reference data from `Data/colors-sounds-beams.json`

**DO NOT use DatabaseLoader class or any automated database access - read JSON files directly**

### 2.2 Skill Data Lookup
For each skill mentioned (primary + secondary):
1. **Find skill in database** - Check appropriate class skill files
2. **Extract key information**:
   - Damage types the skill deals
   - Build classification (minion, spell, melee, bow, hybrid)
   - Scaling stats that improve the skill
   - Weapon compatibility requirements
   - Resource costs (mana, rage, health)

### 2.3 Handle Missing Skill Data
If skill data is incomplete or missing:
- **Ask the user** for clarification on skill mechanics
- **Use sample filter analysis** to infer similar build patterns
- **Make conservative assumptions** only when confident
- **Document assumptions** in the intermediate file

### 2.4 Critical Analysis Guidelines
**BEFORE proceeding, consult learning resources to avoid common mistakes:**

1. **Review `../../shared/docs/GAME_SYSTEMS.md`** for fundamental game mechanics
2. **Review `docs/learning/COMMON_MISTAKES.md`** for patterns to avoid
3. **Check `docs/learning/BUILD_GENERATION_INSIGHTS.md`** for relevant patterns
4. **Apply learned validation rules** throughout the process

## Step 3: Build Analysis and Classification

### 3.1 Determine Build Type
Based on primary skill, classify as:
- **minion**: Summons that fight independently
- **spell**: Direct casting with spell damage
- **melee**: Physical combat with weapons
- **bow**: Ranged physical damage with bows
- **hybrid**: Combination of multiple types

### 3.2 Damage Type Analysis
Aggregate all damage types from skills:
- **Primary damage types**: Main scaling focus
- **Secondary damage types**: Supporting damage
- **Conversion considerations**: Skills that convert damage types

### 3.3 Defensive Strategy Determination
If not specified by user, infer from:
- **Class tendencies**: Acolyte → armor/ward, Rogue → dodge
- **Skill requirements**: Ward-based skills suggest ward defense
- **Unique item effects**: Items may dictate defense strategy

### 3.4 Mana Priority Assessment (CRITICAL)
**Analyze actual casting patterns, not just mana costs:**

- **High Priority**: Frequent casting, channeling, sustained spell usage
- **Medium Priority**: Regular skill rotation, moderate casting frequency  
- **Low Priority**: Cooldown-limited skills, one-time summoning, infrequent casting
- **Example**: Bear summoner builds use skills sparingly → mana is LOW priority regardless of costs

## Step 4: Affix Priority Calculation

### 4.1 Core Stat Derivation
For each build, determine stat priorities:

**Critical Stats** (Tier 1 - Essential):
- Direct damage scaling for primary skill
- Core defensive stats (health, resistances)
- Resource management (analyze frequency - see mana assessment above)

**High Priority Stats** (Tier 2 - Important):
- Secondary damage scaling
- Utility stats (cast speed, attack speed)
- Build-specific mechanics (prioritize based on minion survivability analysis)

**Medium Priority Stats** (Tier 3 - Beneficial):
- General utility (movement speed, experience gain)
- Situational bonuses
- Quality of life improvements

### 4.1a Minion Build Specific Considerations (CRITICAL)
**Minion health priority depends on base survivability AND class mechanics:**

**Primalist Minions (Companions):**
- **Revival mechanics**: Minions go down and require revival, making survivability crucial
- **Bears/Golems**: Still prioritize survivability due to revival system
- **Exception**: Primalist minions ALL need reasonable health investment due to revival disruption

**Acolyte Minions:**
- **Re-summoning mechanics**: Dead minions must be completely re-cast
- **High-survivability minions**: Damage > Health (re-summoning less frequent)
- **Low-survivability minions**: Health scaling crucial (frequent re-summoning costly)

**Consult GAME_SYSTEMS.md Minion Systems section for detailed mechanics**

### 4.2 Affix ID Mapping
Convert human-readable stat names to database affix IDs:
- Use database affix lookup by name
- Handle multiple possible IDs for same stat concept
- Include affix tier information and descriptions

## Step 5: Unique Item Integration

### 5.1 Specified Unique Items
For items listed in user build:
1. **Validate item exists** in database
2. **Extract special mechanics** from item description
3. **Modify build priorities** based on item effects
4. **Add synergy stats** that work with the item

### 5.2 Build-Enabling Item Detection
Check for items that fundamentally change builds:
- **Exsanguinous**: Enables low-life mechanics
- **Fractured Crown**: High-risk high-reward spell builds
- **Chorus of the Aurok**: Enables normally unavailable skills

### 5.3 Legendary Potential Assessment (CRITICAL)
**LP affects item value significantly - consult GAME_SYSTEMS.md Legendary Potential section:**

- **LP Function**: Allows "slamming" rare items onto uniques to transfer affixes
- **Value Impact**: Higher LP makes otherwise weak uniques valuable
- **Build Strategy**: LP enables critical affixes on build-defining unique slots
- **Filter Priority**: Items with 2+ LP should have lower requirements than 0 LP versions

### 5.4 Item Synergy Analysis
Consider interactions between multiple unique items:
- Stat bonus stacking
- Mechanical synergies
- Conflicting effects that need resolution

### 5.5 Skill Interaction Rules (CRITICAL)
**Only include skill interactions when:**
- The interacting skill is **explicitly mentioned** in the build, OR
- Fewer than 5 total skills are used (then **suggest** the interaction to user)

**DO NOT assume unique item capabilities mean the skill will be used**
- Example: Naal's Tooth enables raptors, but don't include raptor mechanics unless "Summon Raptor" is listed

## Step 6: Multi-Build Optimization

### 6.1 Equipment Compatibility Analysis (CRITICAL)
For multi-build filters:
1. **Find weapon overlap**: What weapon types work for ALL builds?
2. **Identify shared stats**: Which affixes benefit multiple builds?
3. **Calculate conflicts**: Where do build requirements diverge?

**WEAPON COMPATIBILITY RULES:**
- **Calculate intersection, not union** - only include weapons ALL builds can use
- **Check unique item constraints** - if any build specifies 1H unique, exclude 2H weapons
- **Validate compatibility** - ensure no impossible combinations

### 6.2 Rule Efficiency Planning
Plan for XML generation efficiency:
- **Shared categories**: Stats that can be grouped across builds
- **Specialized sections**: Build-specific requirements
- **Global coverage**: Broad affix arrays for comprehensive filtering

## Step 7: Create Intermediate Format

### 7.1 Structure the Output
**CRITICAL: Follow this EXACT format - scripts depend on this structure:**

```json
{
  "buildDefinition": {
    "userInput": {
      "name": "Build Name",
      "class": "ClassName",
      "mastery": "MasteryName", 
      "primarySkill": "SkillName",
      "secondarySkills": ["Skill1", "Skill2"],
      "uniqueItems": ["Item1", "Item2"],
      "optionalUniqueItems": ["OptionalItem1"],
      "defense": "armor|dodge|ward|block|hybrid",
      "source": "optional - build source info",
      "description": "optional - detailed build description"
    },
    "derived": {
      "buildType": "minion|spell|melee|bow|hybrid",
      "buildClassification": "specific_subtype",
      "variants": [
        {
          "name": "Variant Name",
          "level": "Level Range", 
          "focus": "Variant Focus"
        }
      ],
      "damageTypes": {
        "primary": ["damage_type1"],
        "secondary": ["damage_type2"],
        "notes": "damage type explanation"
      },
      "scalingStats": {
        "critical": ["stat1", "stat2"],
        "high": ["stat3", "stat4"],
        "medium": ["stat5"],
        "low": ["stat6"],
        "ignored": ["stat7"]
      },
      "specializedSkills": {
        "SkillName": "Description of specialization"
      },
      "defenseStrategy": {
        "primary": "armor|dodge|ward|block",
        "stats": ["defensive_stat1", "defensive_stat2"],
        "secondary": ["secondary_defensive_stat1"],
        "reasoning": "explanation of defense choice"
      },
      "weaponTypes": {
        "preferred": ["weapon_type1"],
        "compatible": ["weapon_type2"], 
        "avoided": ["weapon_type3"],
        "reasoning": "weapon choice explanation"
      },
      "resourceManagement": {
        "mana": {
          "priority": "critical|high|medium|low|very_low",
          "reasoning": "mana priority explanation"
        },
        "health": {
          "priority": "critical|high|medium|low",
          "reasoning": "health priority explanation"
        }
      }
    }
  },
  "uniqueItemAnalysis": {
    "ItemName": {
      "category": "Item Category",
      "priority": "critical|high|medium|low",
      "keyEffects": ["effect1", "effect2"],
      "buildSynergies": ["synergy1", "synergy2"],
      "filterImplications": {
        "legendaryPotential": "LP handling description",
        "alternatives": "alternative item info"
      },
      "skillInteractionNote": "skill interaction details"
    }
  },
  "optionalUniqueItemsAnalysis": {
    "items": ["OptionalItem1", "OptionalItem2"],
    "analysis": {
      "OptionalItem1": "item analysis"
    },
    "filterTreatment": "how to handle in filter",
    "buildImpact": "impact on build performance"
  },
  "skillAnalysis": {
    "SkillName": {
      "manaCost": 0,
      "type": "skill_type",
      "scaling": ["scaling_stat1"],
      "mechanics": ["mechanic1"],
      "priority": "primary|high_secondary|medium_secondary|utility",
      "notes": "skill usage notes"
    }
  },
  "filterConfiguration": {
    "affixMappings": {
      "stat_name": {
        "ids": ["affix_id1", "affix_id2"],
        "priority": "critical|high|medium|low",
        "description": "why this stat matters"
      }
    },
    "itemPriorities": {
      "weapons": {
        "required": true,
        "progressive": true,
        "levelBrackets": [
          {
            "range": [1, 30],
            "subtypes": ["weapon_subtype1"],
            "tierReq": 5,
            "affixes": ["affix1", "affix2"],
            "reasoning": "bracket reasoning"
          }
        ]
      },
      "armor": {
        "required": true,
        "progressive": true,
        "levelBrackets": [
          {
            "range": [1, 25],
            "minAffixes": 2,
            "tierReq": 5,
            "priorityAffixes": ["affix1", "affix2"]
          }
        ]
      },
      "accessories": {
        "rings": {
          "minAffixes": 2,
          "tierReq": 6,
          "priorityAffixes": ["affix1"]
        },
        "amulets": {
          "minAffixes": 2,
          "tierReq": 6,
          "priorityAffixes": ["affix1"]
        },
        "belts": {
          "minAffixes": 2,
          "tierReq": 6,
          "priorityAffixes": ["affix1"]
        }
      },
      "idols": {
        "generalWeaver": {
          "sizes": ["1x4", "2x2"],
          "minAffixes": 2,
          "priorityAffixes": ["affix1"],
          "reasoning": "general idol reasoning"
        },
        "classSpecific": {
          "sizes": ["3x1", "1x3"],
          "minAffixes": 2,
          "priorityAffixes": ["affix1"],
          "reasoning": "class idol reasoning"
        }
      }
    },
    "uniqueHandling": {
      "targetUniques": ["UniqueItem1", "UniqueItem2"],
      "optionalUniques": ["OptionalItem1"],
      "minLegendaryPotential": 0,
      "showCocooned": true,
      "showSets": false,
      "showLegendary": true,
      "priorityThresholds": {
        "UniqueItem1": {
          "0LP": "show_always|prioritize|highlight",
          "1LP": "show_always|prioritize|highlight|critical",
          "2LP+": "show_always|prioritize|highlight|critical"
        }
      }
    },
    "classFiltering": {
      "hideClasses": ["Class1", "Class2"],
      "reasoning": "class filtering reasoning"
    }
  },
  "generationMetadata": {
    "estimatedRules": 21,
    "complexity": "low|medium|medium-high|high",
    "patterns": ["pattern1", "pattern2"],
    "ruleBreakdown": {
      "weapons": 3,
      "armor": 3,
      "accessories": 3,
      "idols": 2,
      "uniques": 2,
      "class_filtering": 1,
      "general_items": 4
    },
    "optimizationNotes": ["note1", "note2"]
  },
  "buildSpecificInsights": {
    "keyInsight1": "insight description",
    "keyInsight2": {
      "subInsight1": "detailed insight",
      "subInsight2": "more details"
    }
  }
}
```

### 7.2 Required vs Optional Sections

**REQUIRED SECTIONS** (must be present in every file):
- `buildDefinition.userInput` - original user input
- `buildDefinition.derived` - all derived analysis
- `filterConfiguration.affixMappings` - stat to affix ID mappings
- `filterConfiguration.itemPriorities` - progressive item requirements
- `filterConfiguration.uniqueHandling` - unique item rules
- `filterConfiguration.classFiltering` - class hide rules
- `generationMetadata` - rule estimates and patterns

**OPTIONAL SECTIONS** (include when data is available):
- `buildDefinition.derived.variants` - only for multi-variant builds
- `buildDefinition.derived.specializedSkills` - only when skills have specializations
- `uniqueItemAnalysis` - detailed analysis of unique items (if any specified)
- `optionalUniqueItemsAnalysis` - analysis of optional unique items (if any)
- `skillAnalysis` - detailed skill breakdowns (when complex skill interactions)
- `buildSpecificInsights` - additional insights from guide/planner analysis
- `plannerAnalysis` - only when source is build planner profile

**CRITICAL FORMAT RULES:**
1. **No missing required fields** - scripts cannot handle undefined properties
2. **Consistent value types** - arrays must always be arrays, objects always objects
3. **Empty arrays over null** - use `[]` instead of `null` for empty lists
4. **Standardized enums** - use exact values from format specification
5. **No custom sections** - only use sections defined in this format

## Step 8: Validation and Quality Checks

### 8.1 Data Completeness Check
Verify:
- All skills have associated scaling stats
- All stat names successfully mapped to affix IDs
- All specified unique items found in database
- No missing critical information for filter generation

### 8.2 Build Coherence Validation
Check that:
- Weapon types support all specified skills
- Defensive strategy aligns with class/mastery
- Unique items are compatible with build type
- No conflicting mechanical requirements

### 8.3 Rule Count Estimation
Estimate XML rule count will stay under 75:
- Count equipment type rules
- Count affix category rules  
- Count unique item rules
- Account for class filtering and progression rules

### 8.4 Final Validation Checklist (MANDATORY)
**Before creating intermediate file, verify:**

1. **Format compliance**: Follows EXACT structure defined in Step 7.1
2. **Required sections**: All mandatory sections present with correct structure
3. **Value types**: Arrays are arrays, objects are objects, no mixed types
4. **Enum values**: All enum fields use exact values from specification
5. **Weapon type consistency**: Unique items match preferred weapon types
6. **Minion health priority**: Appropriate for minion survivability (bears = low, skeletons = high)  
7. **Mana relevance**: Priority matches actual casting frequency
8. **Skill interactions**: Only for explicitly mentioned skills
9. **Equipment compatibility**: Multi-builds use weapon intersection, not union
10. **Learning compliance**: Key patterns from COMMON_MISTAKES.md addressed
11. **JSON validity**: Valid JSON structure, no syntax errors
12. **No placeholders**: No TODO, placeholder, or undefined values

## Step 9: Learning Integration

### 9.1 Document New Insights
After successful expansion, add to learning files:
- **BUILD_GENERATION_INSIGHTS.md**: High-level patterns discovered
- **SKILL_DATA_PATTERNS.md**: Skill→stat relationships learned
- **COMMON_MISTAKES.md**: Errors avoided or corrected

### 9.2 Learning Categories
Focus learning on:
- Skill synergy patterns not obvious from individual skill data
- Multi-build optimization techniques that work well
- Unique item interaction effects
- User preference patterns from feedback

### 9.3 Keep Learning Concise
Learning entries should be:
- **High-level concepts** only, not specific data
- **Actionable insights** for future generations
- **Modular entries** that don't duplicate database content
- **Efficient references** for quick Claude consumption

## Error Handling

### Missing or Incomplete Data
- **Skill not found**: Ask user for skill mechanics details
- **Affix mapping failure**: Request clarification on intended stat
- **Unique item unknown**: Verify item name spelling and availability

### Build Validation Failures
- **Incompatible skills/weapons**: Ask user to clarify intended weapon types
- **Conflicting defensive strategies**: Request primary defense approach
- **Rule count estimates too high**: Ask for build simplification or priorities

### User Communication
When asking for clarification:
1. **Be specific** about what information is needed
2. **Explain why** the information is required for accurate generation
3. **Provide options** when possible to guide user response
4. **Suggest alternatives** if user's request seems problematic

## Output Requirements

### File Naming
Create intermediate file with naming pattern:
- Single build: `[BuildName].build.expanded.json`
- Multi-build: `[FilterName].multi-build.expanded.json`

### File Location
Save in `filter-generator/generated/intermediate/`

### Final Validation
Before outputting, ensure:
- Valid JSON structure
- All required sections present
- No placeholder or missing values
- Estimated rule count ≤ 75
- Clear, actionable data for script processing

## Reference Documents

**Essential Reading:**
- `../../shared/docs/GAME_SYSTEMS.md` - **CRITICAL** - Fundamental game mechanics and systems
- `META_BUILD_FORMAT.md` - User input structure
- `INTERMEDIATE_BUILD_FORMAT.md` - Output format specification
- `BUILD_FORMAT_COMPARISON.md` - Before/after examples
- `FILTER_FORMAT.md` - XML generation target format

**Learning Resources:**
- `docs/learning/BUILD_GENERATION_INSIGHTS.md` - Accumulated insights
- `docs/learning/COMMON_MISTAKES.md` - Known pitfalls
- `docs/learning/SKILL_DATA_PATTERNS.md` - Skill relationship patterns

**Sample Analysis:**
- `SampleFilters/*.analysis.md` - Real filter pattern analysis
- `SampleFilters/*.build.json` - Example build definitions

This comprehensive process ensures reliable transformation from minimal user input to detailed, actionable filter generation specifications.