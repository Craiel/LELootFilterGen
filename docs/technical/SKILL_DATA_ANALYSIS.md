# Skill Data Analysis

This document analyzes the scraped skill data files and describes their contents and limitations for filter generation purposes.

## File Overview

### `planner_data.json`
**Purpose**: Skill data for talent planning tools
**Content**: Templated skill definitions with variable references
**Usefulness**: ⚠️ Limited - names and descriptions use variables

**Example Structure**:
```json
{
  "internalName": "maelstrom",
  "index": 318,
  "id": "mas54", 
  "name": null,
  "nameKey": "Abilities.Ability_Maelstrom_Name",
  "descriptionKey": "Abilities.Ability_Maelstrom_Description"
}
```

**Limitations**:
- Names are stored as variable keys (`nameKey`) not actual text
- Descriptions are also variable references
- Mana costs and other values may use variables
- Variable definitions not found in any downloaded data files

### `skill_data_1.json`
**Purpose**: Complete skill tree data for all skills
**Content**: Skill tree structures, nodes, connections, and progression paths
**Usefulness**: ✅ Excellent for understanding skill mechanics

**Contains**:
- Full skill tree layouts for each skill
- Individual node data (stats, requirements, connections)
- Skill progression paths
- Node positioning and relationships
- Actual stat modifications (not variables)

### `skill_data_2.json` 
**Purpose**: Version changelog data
**Content**: Changes between game versions
**Usefulness**: ⚪ Not relevant for current filter generation

**Contains**:
- Patch notes and version differences
- Historical changes to skills
- Balance adjustments over time

## Current Status & Recommendations

### What We Can Use Now
1. **`skill_data_1.json`**: Rich skill tree data with actual values
2. **Basic structure from `planner_data.json`**: Internal names and IDs

### What's Missing
1. **Human-readable skill names**: Only variable keys available
2. **Skill descriptions**: Only variable references available  
3. **Variable resolution**: No variable definition files found

### Future Investigation Needed
1. **Web page analysis**: How does lastepochtools.com resolve skill names?
   - Look for additional JavaScript files that contain variable definitions
   - Check if skill names are loaded from separate API calls
   - Investigate client-side rendering for skill information

2. **Alternative data sources**: 
   - Check if skill names are embedded in other downloaded files
   - Look for pattern-based name extraction from skill tree data
   - Consider scraping individual skill pages if needed

### Immediate Action Items
- Document current parsing capabilities in js-data-parser.js
- Note limitations in skill parsing functions
- Plan future enhancement after web investigation
- Focus on unique items parsing which has complete data

## Implementation Notes

The current js-data-parser.js handles multiple skill files correctly but should document these limitations. For now, we can extract skill tree structures and internal references, but human-readable names will require additional investigation into the website's rendering mechanism.