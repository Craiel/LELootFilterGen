# Intermediate Build Format Specification

**🚨 CRITICAL: This format is LOCKED for script compatibility. No structural changes allowed after this point.**

This document defines the exact JSON structure that all intermediate build analysis files must follow. Scripts depend on this exact format.

## Overview

The intermediate build format transforms user input into comprehensive build analysis data suitable for automated filter generation. It consists of 6 main sections: 4 required, 2+ optional.

## Complete Format Specification

```json
{
  "buildDefinition": {
    "userInput": {
      "name": "string (required)",
      "class": "string (required)", 
      "mastery": "string (required)",
      "primarySkill": "string (required)",
      "secondarySkills": "array of strings (required, can be empty)",
      "uniqueItems": "array of strings (required, can be empty)",
      "optionalUniqueItems": "array of strings (optional)",
      "defense": "enum: armor|dodge|ward|block|hybrid (optional)",
      "source": "string (optional - build source info)",
      "description": "string (optional - detailed build description)"
    },
    "derived": {
      "buildType": "enum: minion|spell|melee|bow|hybrid (required)",
      "buildClassification": "string (required - specific subtype)",
      "variants": "array (optional - only for multi-variant builds)",
      "damageTypes": {
        "primary": "array of strings (required)",
        "secondary": "array of strings (required, can be empty)",
        "notes": "string (required)"
      },
      "scalingStats": {
        "critical": "array of strings (required)",
        "high": "array of strings (required, can be empty)",
        "medium": "array of strings (required, can be empty)", 
        "low": "array of strings (required, can be empty)",
        "ignored": "array of strings (required, can be empty)"
      },
      "specializedSkills": "object (optional - skill name to description mapping)",
      "defenseStrategy": {
        "primary": "enum: armor|dodge|ward|block (required)",
        "stats": "array of strings (required)",
        "secondary": "array of strings (required, can be empty)",
        "reasoning": "string (required)"
      },
      "weaponTypes": {
        "preferred": "array of strings (required)",
        "compatible": "array of strings (required, can be empty)",
        "avoided": "array of strings (required, can be empty)",
        "reasoning": "string (required)"
      },
      "resourceManagement": {
        "mana": {
          "priority": "enum: critical|high|medium|low|very_low (required)",
          "reasoning": "string (required)"
        },
        "health": {
          "priority": "enum: critical|high|medium|low (required)", 
          "reasoning": "string (required)"
        }
      }
    }
  },
  "uniqueItemAnalysis": "object (optional - present when uniqueItems specified)",
  "optionalUniqueItemsAnalysis": "object (optional - present when optionalUniqueItems specified)",
  "skillAnalysis": "object (optional - present for complex skill interactions)",
  "filterConfiguration": {
    "affixMappings": "object (required - stat name to affix mapping)",
    "itemPriorities": {
      "weapons": {
        "required": "boolean (required)",
        "progressive": "boolean (required)",
        "levelBrackets": "array of objects (required)"
      },
      "armor": {
        "required": "boolean (required)",
        "progressive": "boolean (required)", 
        "levelBrackets": "array of objects (required)"
      },
      "accessories": {
        "rings": "object (required)",
        "amulets": "object (required)",
        "belts": "object (required)"
      },
      "idols": {
        "generalWeaver": "object (required)",
        "classSpecific": "object (required)"
      }
    },
    "uniqueHandling": {
      "targetUniques": "array of strings (required, can be empty)",
      "optionalUniques": "array of strings (optional)",
      "minLegendaryPotential": "number (required)",
      "showCocooned": "boolean (required)",
      "showSets": "boolean (required)",
      "showLegendary": "boolean (required)",
      "priorityThresholds": "object (optional)"
    },
    "classFiltering": {
      "hideClasses": "array of strings (required)",
      "reasoning": "string (required)"
    }
  },
  "generationMetadata": {
    "estimatedRules": "number (required)",
    "complexity": "enum: low|medium|medium-high|high (required)",
    "patterns": "array of strings (required)",
    "ruleBreakdown": {
      "weapons": "number (required)",
      "armor": "number (required)",
      "accessories": "number (required)",
      "idols": "number (required)",
      "uniques": "number (required)",
      "class_filtering": "number (required)",
      "general_items": "number (required)"
    },
    "optimizationNotes": "array of strings (required)"
  },
  "buildSpecificInsights": "object (optional - additional insights)",
  "plannerAnalysis": "object (optional - only when source is build planner)"
}
```

## Section Details

### Required Sections

#### 1. buildDefinition
Contains original user input and all derived analysis.

**buildDefinition.userInput** - Preserves original user specification
**buildDefinition.derived** - Complete analytical expansion of user input

#### 2. filterConfiguration
All data needed for filter rule generation.

**affixMappings** - Maps stat names to database affix IDs
**itemPriorities** - Progressive item requirements by level
**uniqueHandling** - Unique item filtering rules
**classFiltering** - Class hiding configuration

#### 3. generationMetadata
Information for optimization and validation.

**estimatedRules** - Expected XML rule count
**complexity** - Build complexity rating  
**patterns** - Filter generation patterns to use
**ruleBreakdown** - Rule count by category
**optimizationNotes** - Generation hints and warnings

### Optional Sections

#### uniqueItemAnalysis
Present when user specifies `uniqueItems`. Contains detailed analysis of each unique item.

```json
"uniqueItemAnalysis": {
  "ItemName": {
    "category": "string (required)",
    "priority": "enum: critical|high|medium|low (required)",
    "keyEffects": "array of strings (required)",
    "buildSynergies": "array of strings (required)",
    "filterImplications": {
      "legendaryPotential": "string (required)",
      "alternatives": "string (optional)"
    },
    "skillInteractionNote": "string (optional)"
  }
}
```

#### optionalUniqueItemsAnalysis
Present when user specifies `optionalUniqueItems`.

```json
"optionalUniqueItemsAnalysis": {
  "items": "array of strings (required)",
  "analysis": "object (optional - item name to analysis mapping)",
  "filterTreatment": "string (required)",
  "buildImpact": "string (required)"
}
```

#### skillAnalysis
Present for builds with complex skill interactions.

```json
"skillAnalysis": {
  "SkillName": {
    "manaCost": "number (required)",
    "type": "string (required)",
    "scaling": "array of strings (optional)",
    "mechanics": "array of strings (optional)",
    "priority": "enum: primary|high_secondary|medium_secondary|utility (required)",
    "notes": "string (optional)"
  }
}
```

#### buildSpecificInsights
Free-form insights section for additional analysis data.

#### plannerAnalysis
Only present when source is a build planner profile. Contains planner-specific data.

## Format Rules

### 1. Value Type Consistency
- **Arrays must always be arrays** - use `[]` for empty, never `null`
- **Objects must always be objects** - use `{}` for empty, never `null` 
- **Strings must always be strings** - no numbers as strings
- **Numbers must always be numbers** - no strings as numbers

### 2. Enum Values
Use exact values specified in format. Allowed enum values:

**buildType**: `minion`, `spell`, `melee`, `bow`, `hybrid`
**defense**: `armor`, `dodge`, `ward`, `block`, `hybrid`
**priority**: `critical`, `high`, `medium`, `low`, `very_low`
**complexity**: `low`, `medium`, `medium-high`, `high`
**priorityThresholds**: `show_always`, `prioritize`, `highlight`, `critical`

### 3. Required vs Optional Fields
- **Required fields**: Must be present in every file
- **Required-if-present fields**: If section is present, these fields must exist
- **Optional fields**: May be omitted entirely
- **Empty values**: Use empty arrays `[]` or empty objects `{}`, not `null`

### 4. No Custom Sections
Only use sections defined in this specification. No additional top-level keys allowed.

### 5. Affix Mapping Structure
Always use this exact structure for `affixMappings`:

```json
"affixMappings": {
  "stat_name": {
    "ids": ["affix_id1", "affix_id2"],
    "priority": "critical|high|medium|low",
    "description": "string explaining importance"
  }
}
```

### 6. Level Bracket Structure
Always use this exact structure for weapon and armor level brackets:

```json
"levelBrackets": [
  {
    "range": [min_level, max_level],
    "subtypes": ["subtype1", "subtype2"], // weapons only
    "minAffixes": number, // armor only
    "tierReq": number,
    "affixes": ["affix1", "affix2"], // weapons only  
    "priorityAffixes": ["affix1", "affix2"], // armor only
    "reasoning": "string explanation"
  }
]
```

## Validation Requirements

Every intermediate file must pass these validations:

1. **JSON validity** - Perfect JSON syntax
2. **Required sections** - All mandatory sections present
3. **Required fields** - All mandatory fields in each section
4. **Value types** - Correct types for all fields
5. **Enum compliance** - Only allowed enum values
6. **Array consistency** - Arrays never null, consistent element types
7. **No placeholders** - No TODO, undefined, or placeholder values
8. **Logical coherence** - Data makes sense together

## Migration Notes

This format consolidates and extends previous intermediate formats:

- **Added**: `optionalUniqueItems` support
- **Added**: `variants` for multi-variant builds  
- **Added**: `specializedSkills` tracking
- **Added**: `plannerAnalysis` for planner sources
- **Added**: `buildSpecificInsights` extensibility
- **Standardized**: All enum values
- **Required**: Consistent empty value handling
- **Locked**: No future structural changes allowed

## Usage in Scripts

Scripts can rely on:
- Exact section names and structure
- Consistent value types
- Required sections always present
- Arrays never being null
- Standardized enum values
- No unexpected additional sections

This stability enables robust automated filter generation without defensive programming against format changes.

## Examples

See `generated/analysis/*.intermediate.json` for real-world examples following this format.