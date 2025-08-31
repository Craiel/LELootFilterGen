# Unique Item Enriched Analytics Process

This document explains how to update and extend the enriched analytics data for unique items when new items are added to Last Epoch.

## Overview

The enriched analytics system analyzes unique items to extract build-relevant data that enables creative build discovery. Each item gets analyzed for build archetypes, skill synergies, damage types, defensive mechanisms, and more.

## Files Structure

```
database-generator/
├── docs/
│   └── analytics_process_documentation.md        # This documentation
├── lib/parsers/
│   └── html-item-parser.js                       # HTML parsing with analytics integration
├── Overrides/
│   ├── analytics_unique_items_data.json          # Complete analytics for all items
│   └── analytics_analyzed_items_list.json        # Simple list of analyzed item names  
└── scripts/build-database.js                     # Main build process with analytics
```

## Process for Adding New Items

When new unique items are added to Last Epoch:

### 1. Identify New Items

Compare the current unique items in the database with the `analyzed_items_list.json`:

```bash
# Get current item list
find "D:\Dev\LELootFilterGen\filter-generator\Data\UniqueItems" -name "*.json" -exec basename {} .json \; | sort > current_items.txt

# Compare with analyzed items
diff Overrides/analytics_analyzed_items_list.json current_items.txt
```

### 2. Request Analysis for New Items Only

Use Claude Code to analyze only the new items:

**Example prompt:**
```
I need you to analyze these new unique items for build compatibility: [list of new item names]

Analyze each item in the same format as the existing Overrides/analytics_unique_items_data.json, extracting:
- buildArchetypes (tank, caster, melee, minion, etc.)  
- skillSynergies (specific skills enhanced)
- damageTypes (fire, cold, lightning, etc.)
- defensiveMechanisms (armor, ward, dodge, etc.)
- buildEnablers (conversion, trigger, scaling, threshold mechanics)
- powerLevel (Chase, Premium, Good, Standard)
- buildTags (flexible tags for querying)

Return only the analysis for the new items in JSON format.
```

### 3. Merge New Analysis

Add the new item analyses to `Overrides/analytics_unique_items_data.json` and update `Overrides/analytics_analyzed_items_list.json`:

```bash
# Update the analyzed items list
cd database-generator
node -e "const data = require('./Overrides/analytics_unique_items_data.json'); console.log(JSON.stringify(Object.keys(data).sort(), null, 2))" > Overrides/analytics_analyzed_items_list.json
```

### 4. Rebuild Database

Run the database generation to integrate the new analytics:

```bash
cd database-generator
npm run build-force
# OR use the interactive CLI
node index.js
```

This will:
- Load the updated analytics data
- Enrich all unique items (including new ones) with analytics
- Rebuild all indexes for efficient querying
- Update the analytics summary

## Analytics Categories

### Build Archetypes
- **Primary**: `melee`, `ranged`, `caster`, `minion`, `tank`
- **Specialized**: `dot`, `ailment`, `critical`, `hybrid_damage`, `glass_cannon`
- **Advanced**: `minion_hybrid`, `proc`, `speed`, `resource_manipulation`, `transformation`, `support`

### Damage Types
`fire`, `cold`, `lightning`, `necrotic`, `poison`, `physical`, `void`, `elemental`

### Defensive Mechanisms
`armor`, `ward`, `dodge`, `block`, `resistance`, `health`, `mana`, `leech`, `regen`, `immunity`, `endurance`, `damage_reduction`

### Build Enablers
- **Unique Conversion Mechanic**: Converts one thing to another uniquely
- **Trigger Mechanic**: Causes additional effects to trigger
- **Scaling Mechanic**: Scales with specific conditions
- **Threshold Mechanic**: Activates at certain thresholds

### Power Levels
- **Chase**: Build-defining, extremely rare items (top tier)
- **Premium**: Powerful items that enable strong builds  
- **Good**: Solid items that enhance builds effectively
- **Standard**: Common items with basic effects

## Build Tags Format

Tags follow the pattern: `[descriptor]_[category]`

Examples:
- `fire_damage`, `necrotic_damage`
- `minion_build`, `tank_build`, `caster_build`
- `summon_skeleton_synergy`, `harvest_synergy`
- `armor_defense`, `ward_defense`
- `helmet_slot`, `body_armor_slot`
- `acolyte_class`, `primalist_class`
- `early_game`, `mid_game`, `end_game`

## Querying the Analytics

The system creates optimized indexes for efficient querying:

```javascript
// Load specific indexes
const buildArchetypes = require('./Data/indexes/buildArchetypes.json');
const skillSynergies = require('./Data/indexes/skillSynergies.json');
const damageTypes = require('./Data/indexes/damageTypes.json');

// Example: Find all fire caster items
const fireCasters = buildArchetypes.caster.filter(item => 
  damageTypes.fire.some(fireItem => fireItem.name === item.name)
);
```

## Tips for Analysis

1. **Be Creative**: Consider unconventional build possibilities
2. **Be Comprehensive**: Include all relevant archetypes an item might support  
3. **Focus on Synergies**: Look for explicit skill names and mechanics
4. **Power Assessment**: Consider rarity, level requirement, and unique mechanics
5. **Tag Generously**: More tags = better discoverability for new builds

## Maintenance

- Review analytics periodically for accuracy
- Update categories when new build archetypes emerge  
- Ensure new game mechanics are captured in build enablers
- Monitor for items that might have been missed in initial analysis