# XML Generation Instructions for Claude

This document provides step-by-step instructions for Claude to transform intermediate build files into complete Last Epoch XML loot filters.

## Overview

**CRITICAL: This is a PURE ANALYSIS AND GENERATION PROCESS - NO SCRIPTING OR AUTOMATED TOOLS**

When a user requests XML filter generation with a command like:
> "Generate XML from `my-build.build.expanded.json` using XML_GENERATION_INSTRUCTIONS.md"

Your task is to **manually convert the intermediate format to XML using only Claude's analytical capabilities**:
1. **Read and understand** the intermediate build file structure
2. **Analyze** sample XML filters for patterns and structure
3. **Apply strictness levels** and rule optimization techniques
4. **Generate** complete XML filter following Last Epoch schema
5. **Validate** rule count stays within 75-rule limit

**DO NOT:**
- Create or run any scripts or automation
- Use any automated XML generation tools
- Write code to process the data
- Import or use existing JavaScript modules

**DO:**
- Read intermediate and sample files directly using Read tool
- Manually analyze patterns in existing XML filters
- Apply game knowledge and logical structure
- Create XML through pure analytical work
- Follow Last Epoch XML schema precisely

## Process Flow

```
Intermediate File → Sample Analysis → Rule Planning → XML Structure → Rule Optimization → Final XML
```

## Step 1: Read and Validate Intermediate Input

### 1.1 Load the Intermediate Build File
- Read the provided `.build.expanded.json` file  
- Validate it follows the INTERMEDIATE_BUILD_FORMAT.md structure
- Extract key sections: buildDefinition, filterConfiguration, generationMetadata

### 1.2 Analyze Build Requirements
From the intermediate file, identify:
- **Build type**: minion, spell, melee, bow, hybrid
- **Primary stats**: Critical/high/medium priority affixes
- **Weapon types**: Preferred and avoided weapon categories  
- **Defense strategy**: Armor, ward, dodge, or hybrid approach
- **Unique items**: Priority items and LP thresholds
- **Class filtering**: Which classes to hide/show

## Step 2: Analyze Sample XML Filters

### 2.1 Study Sample Filter Patterns
Read relevant sample XML filters from `SampleFilters/`:
- **Structure patterns**: How rules are organized and grouped
- **Rule syntax**: Exact XML schema and attribute usage
- **Progression patterns**: Level-gated requirements and tiers
- **Optimization techniques**: How to maximize rule efficiency

### 2.2 Identify Applicable Patterns
Based on build type, determine which sample patterns apply:
- **Minion builds**: Look at necromancer and beastmaster samples
- **Spell builds**: Reference caster and elemental samples  
- **Melee builds**: Study weapon-focused filter structures
- **Multi-build**: Examine hybrid and compatibility patterns

## Step 3: Plan Rule Structure

### 3.1 Estimate Rule Count
Before generation, plan rule distribution:
- **Equipment rules**: Weapons, armor, accessories (15-25 rules)
- **Affix rules**: Stat categories and tiers (20-40 rules)
- **Unique item rules**: LP thresholds and priorities (5-15 rules)
- **Class filtering**: Hide other classes (1-5 rules)
- **Utility rules**: Currency, crafting materials (5-10 rules)

**CRITICAL**: Total must stay under 75 rules

### 3.2 Apply Strictness Level
Modify requirements based on specified strictness:

**semi_strict**:
- T4+ affixes on most items
- Lower LP requirements (1+ for most uniques)
- More inclusive item base types

**strict** (default):
- T5+ affixes for endgame items  
- Standard LP requirements (2+ for valuable uniques)
- Focused on build-relevant bases

**very_strict**:
- T6+ affixes preferred
- Higher LP requirements (2-3+ for all uniques)
- Stricter base type filtering

**ultra_strict**:
- T7+ affixes where possible
- Maximum LP requirements (3-4+ for uniques)
- Minimal item volume, premium quality only

## Step 4: Generate XML Structure

### 4.1 Create XML Header
Start with standard Last Epoch filter format:
```xml
<?xml version="1.0" encoding="utf-8"?>
<ItemFilter>
  <!-- Filter Name and Description -->
</ItemFilter>
```

### 4.2 Generate Equipment Rules
For each equipment category (weapons, armor, accessories):
1. **Create progression rules** for different level ranges
2. **Apply weapon type filters** based on build requirements
3. **Include base-type specific conditions** where relevant
4. **Add affix requirements** matching build priorities

### 4.3 Generate Affix Category Rules  
Group affixes by priority and create rules:
1. **Critical affixes**: Essential stats with high-tier requirements
2. **High priority**: Important stats with medium-tier requirements
3. **Medium priority**: Beneficial stats with lower requirements
4. **Universal**: General utility stats (health, resistances)

### 4.4 Generate Unique Item Rules
For each priority unique item:
1. **Create LP-based rules** with appropriate thresholds
2. **Include set item handling** if relevant
3. **Add Weaver's Will considerations** for high-value items
4. **Handle experimental/cocooned variations**

### 4.5 Add Class Filtering
Create rules to hide irrelevant classes:
```xml
<Rule Visible="false">
  <BaseType>ClassSpecific</BaseType>
  <Class>Mage</Class>
</Rule>
```

## Step 5: Optimize Rule Count

### 5.1 Rule Consolidation Techniques
Apply these optimization methods:
1. **Large affix arrays**: Combine similar conditions into single rules
2. **Level range grouping**: Consolidate overlapping level requirements  
3. **Global hide patterns**: Use broad exclusions with specific exceptions
4. **Multi-condition rules**: Pack multiple requirements per rule

### 5.2 Efficiency Patterns
Use proven efficiency techniques:
- **Progressive tiers**: T7+ then T6+, T5+ as separate rules
- **Equipment grouping**: Multiple base types in single rules
- **Shared conditions**: Common requirements across item types
- **Exception handling**: Global hides with targeted shows

## Step 6: Apply Game Knowledge

### 6.1 Last Epoch Specific Considerations
Account for game mechanics:
- **Scaling patterns**: How stats actually affect builds
- **Meta considerations**: Currently strong/weak item types
- **Drop patterns**: What's commonly found vs rare
- **Progression flow**: Early game vs endgame priorities

### 6.2 Build-Specific Optimizations
Tailor to the specific build type:
- **Minion builds**: Prioritize minion stats, strength scaling
- **Spell builds**: Focus on spell damage, mana, cast speed
- **Melee builds**: Physical damage, attack speed, weapon types
- **Transform builds**: Unique transformation mechanics

## Step 7: Validate and Finalize

### 7.1 Rule Count Verification
Ensure compliance with constraints:
- **Count total rules**: Must be ≤75
- **Verify syntax**: All XML tags properly formed
- **Check logic**: No contradictory conditions
- **Test coverage**: All priority stats included

### 7.2 Quality Checks
Validate filter quality:
- **Build relevance**: All major build aspects covered
- **Progression suitability**: Works for intended level range
- **Strictness alignment**: Matches requested strictness level
- **Efficiency**: Optimal rule usage for coverage

## Step 8: Output Requirements

### 8.1 File Naming
Create XML file with naming pattern:
- Single build: `[BuildName]-[Strictness].xml`
- Multi-build: `[FilterName]-Multi-[Strictness].xml`

### 8.2 File Structure
Include in final XML:
- **Header comments**: Build description, strictness level
- **Rule organization**: Clear grouping with comments
- **Validation notes**: Rule count, coverage confirmation

### 8.3 Final Validation
Before outputting, ensure:
- Valid XML structure with proper encoding
- All intermediate requirements addressed
- Rule count within limits (display final count)
- Clear, actionable filter for user

## Error Handling

### Missing or Unclear Data
- **Affix not found**: Use closest equivalent or generic category
- **Unclear build type**: Default to hybrid pattern with broader coverage
- **Missing unique items**: Focus on stat priorities instead

### Rule Count Overruns
- **Over 75 rules**: Consolidate similar rules, remove medium-priority items
- **Optimization needed**: Use larger arrays, fewer specific conditions
- **Strictness adjustment**: Suggest higher strictness to reduce volume

### User Communication
When asking for clarification:
1. **Be specific** about what information is needed
2. **Explain impact** of missing data on filter quality
3. **Provide alternatives** when certain requirements can't be met
4. **Suggest modifications** if build is too complex for rule limit

## Reference Documents

**Essential Reading:**
- `INTERMEDIATE_BUILD_FORMAT.md` - Input structure specification
- `FILTER_FORMAT.md` - Last Epoch XML schema and examples
- `SampleFilters/*.xml` - Real filter examples for patterns

**Sample Analysis:**
- Study existing filters for rule organization
- Note optimization techniques used
- Understand progression patterns
- Learn from successful rule consolidation

This comprehensive process ensures reliable transformation from intermediate format to production-ready XML filters that respect all game constraints and user requirements.