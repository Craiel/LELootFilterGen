# Intermediate Build Format

This document describes the expanded build format that the system creates internally after processing user input. This intermediate format contains all the derived information needed for filter generation.

## Processing Pipeline

```
User Build → Skill Data Lookup → Intermediate Format → Filter Generation
```

The intermediate format bridges the gap between minimal user input and complex filter generation requirements.

## Intermediate Format Structure

### Complete Example

Starting from this user input:
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

The system generates this intermediate format:
```json
{
  "buildDefinition": {
    "userInput": {
      "name": "Necromancer - Arcane Servants",
      "class": "Acolyte", 
      "mastery": "Necromancer",
      "primarySkill": "Summon Skeleton",
      "secondarySkills": ["Bone Curse", "Bone Armor"],
      "defense": "armor"
    },
    "derived": {
      "buildType": "minion",
      "damageTypes": {
        "primary": ["necrotic"],
        "secondary": ["physical"]
      },
      "scalingStats": {
        "critical": ["minion_damage", "minion_health"],
        "high": ["necrotic_damage", "cast_speed"],
        "medium": ["minion_attack_speed", "mana"]
      },
      "defenseStrategy": {
        "primary": "armor",
        "stats": ["health", "armor", "resistances"],
        "secondary": ["dodge_rating"]
      },
      "weaponTypes": {
        "preferred": ["two_handed_axe", "one_handed_axe", "one_handed_sceptre"],
        "avoided": ["bow", "wand", "dagger", "mace"]
      }
    }
  },
  "filterConfiguration": {
    "affixMappings": {
      "minion_damage": [643, 102],
      "necrotic_damage": [724],
      "cast_speed": [4],
      "health": [25],
      "armor": [1],
      "resistances": [13, 17, 10, 7]
    },
    "itemPriorities": {
      "weapons": {
        "required": true,
        "progressive": true,
        "levelBrackets": [
          {"range": [1, 34], "subtypes": [3], "tierReq": 6},
          {"range": [35, 65], "subtypes": [4], "tierReq": 6},
          {"range": [66, 100], "subtypes": [9], "tierReq": 6}
        ]
      },
      "armor": {
        "required": true,
        "progressive": true,
        "levelBrackets": [
          {"range": [1, 20], "minAffixes": 1, "tierReq": 6},
          {"range": [21, 35], "minAffixes": 2, "tierReq": 6},
          {"range": [36, 100], "minAffixes": 3, "tierReq": 6}
        ]
      },
      "idols": {
        "generalWeaver": {
          "sizes": ["1x4", "2x2", "2x1", "1x2"],
          "minAffixes": 2,
          "affixes": "general_utility"
        },
        "classSpecific": {
          "sizes": ["3x1", "1x3", "4x1"],
          "minAffixes": 1, 
          "affixes": "minion_focused"
        }
      }
    },
    "uniqueHandling": {
      "minLegendaryPotential": 2,
      "showCocooned": true,
      "showSets": true,
      "showLegendary": true
    },
    "classFiltering": {
      "hideClasses": ["Primalist", "Mage", "Sentinel", "Rogue"]
    }
  },
  "generationMetadata": {
    "estimatedRules": 21,
    "complexity": "medium",
    "patterns": ["progressive_weapons", "level_gated_armor", "idol_specialization"]
  }
}
```

## Section Breakdown

### buildDefinition.userInput
- Preserves the original user input exactly as provided
- Used for debugging and user feedback

### buildDefinition.derived
- **buildType**: Inferred from primary skill (minion, spell, melee, bow, hybrid)
- **damageTypes**: Primary and secondary damage types from skill data
- **scalingStats**: Stats categorized by importance for this build
- **defenseStrategy**: Defense approach with specific stat requirements
- **weaponTypes**: Preferred and avoided weapon categories

### filterConfiguration.affixMappings
- **Human names → Affix IDs**: Maps user-friendly names to database IDs
- **Resistance handling**: Groups all resistance types under "resistances"
- **Alternative mappings**: Some stats have multiple valid affix IDs

### filterConfiguration.itemPriorities
- **Progressive requirements**: Different rules for different level ranges
- **Subtype progression**: Weapon subtypes for leveling vs endgame
- **Tier requirements**: Minimum affix tier thresholds
- **Affix combinations**: How many affixes required on different item types

### generationMetadata
- **Rule estimation**: Predicted XML rule count
- **Complexity assessment**: Simple/medium/complex filter classification  
- **Pattern identification**: Which rule patterns will be used

## Skill Data Integration

The system looks up each skill to determine build characteristics:

### Example Skill Lookup: "Summon Skeleton"
```json
{
  "Summon Skeleton": {
    "class": "Acolyte",
    "mastery": "Necromancer", 
    "buildType": "minion",
    "damageTypes": ["necrotic", "physical"],
    "scalingStats": {
      "primary": ["minion_damage", "minion_health"],
      "secondary": ["necrotic_damage", "cast_speed", "mana"]
    },
    "weaponCompatibility": ["axes", "sceptres"],
    "resourceCosts": ["mana"],
    "synergies": ["minion_count", "minion_survivability"]
  }
}
```

### Skill Data Aggregation
When multiple skills are specified:
1. **Combine damage types**: Union of all damage types from all skills
2. **Merge scaling stats**: Higher priority if multiple skills need the same stat
3. **Weapon requirements**: Intersection of compatible weapon types
4. **Resource needs**: Combined resource requirements (mana, rage, etc.)

## Unique Item Integration

When unique items are specified, the system modifies the build profile:

### Example: Exsanguinous Integration
```json
{
  "uniqueItems": ["Exsanguinous"],
  "itemModifications": {
    "Exsanguinous": {
      "mechanics": ["low_life", "ward_based_defense"],
      "statModifications": {
        "add": ["ward", "ward_retention", "potion_effectiveness"],
        "modify": {"defense": "ward_hybrid"},
        "deprioritize": ["health_regeneration"]
      },
      "buildSynergies": ["chaos_inoculation_style", "high_risk_high_reward"]
    }
  }
}
```

## Filter Generation Parameters

The intermediate format is used with generation parameters:

### Generation Call Example
```javascript
generateFilter(intermediateBuild, {
  strictness: "strict",           // semi_strict, strict, very_strict, ultra_strict
  levelRange: "endgame",          // leveling, mixed, endgame
  customizations: {               // Optional user overrides
    hideOtherClasses: false,
    uniqueLPThreshold: 3
  }
})
```

### Strictness Application
The generator applies strictness to the intermediate format:
- **semi_strict**: Reduce tier requirements by 3, increase item volume
- **strict**: Use tier requirements as specified
- **very_strict**: Increase tier requirements by 1, reduce item volume  
- **ultra_strict**: Focus only on critical stats, minimal item volume

## Benefits of Intermediate Format

### For System Architecture
- **Separation of Concerns**: User interface vs generation logic
- **Cacheable**: Intermediate formats can be cached and reused
- **Debuggable**: Clear visibility into derivation process
- **Testable**: Each step can be validated independently

### For Filter Quality
- **Data-Driven**: Based on actual skill mechanics and scaling
- **Consistent**: Same skills always produce same intermediate format
- **Comprehensive**: Accounts for all build aspects (damage, defense, progression)
- **Optimized**: Pre-calculated for efficient filter generation

### For User Experience
- **Error Detection**: Can validate build coherence before generation
- **Feedback**: Can show users what the system derived from their input
- **Customization**: Users can override specific derived aspects if needed
- **Explanation**: Can explain why certain items are prioritized

This intermediate format ensures that the simple user input is properly expanded into a comprehensive build profile that produces high-quality, mechanically-accurate filters.