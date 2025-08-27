# Database Overrides

This directory contains manual overrides and additions to the generated database.

## Directory Structure

```
overrides/
├── affixes.json          # Manual affix data and corrections
├── uniques.json          # Manual unique item data and corrections
├── sets.json             # Manual set item data and corrections
└── README.md            # This file
```

## Override File Format

Each override file follows this optimized structure:

```json
{
  "version": "1.3.0.4", 
  "lastModified": "2025-08-25T18:00:00.000Z",
  "overrides": {
    "140": {
      "name": "Manually Added Name",
      "description": "Optional description", 
      "properties": {
        "tier": "T1-T5",
        "itemTypes": ["weapon", "armor"]
      },
      "notes": "Additional context or corrections"
    }
  },
  "corrections": {
    "456": {
      "reason": "duplicate_name",
      "originalName": "Confusing Name",
      "correctedName": "Clarified Name",
      "explanation": "This item has the same name as ID 789 but different properties"
    }
  }
}
```

## Key Optimizations

- **Removed redundant fields**: No need to repeat ID or include source/verification flags
- **Streamlined structure**: Only essential data (name, description, properties, notes)
- **Clean properties**: Remove empty objects and unnecessary metadata
- **Self-contained**: Database becomes independent of override file structure

## Usage

1. **Manual Data Entry**: Add discovered item names and properties to override files
2. **Corrections**: Fix incorrect or ambiguous template data
3. **Clarifications**: Add explanations for duplicate names or confusing entries

## Example: Affix Override

```json
{
  "version": "1.3.0.4",
  "lastModified": "2025-08-25T18:00:00.000Z", 
  "overrides": {
    "140": {
      "name": "+# to Minion Damage",
      "description": "Increases damage dealt by minions",
      "properties": {
        "tier": "T1-T7",
        "itemTypes": ["helmet", "body_armor", "relic"],
        "minValue": 1,
        "maxValue": 25
      },
      "notes": "Discovered through template testing"
    }
  }
}
```

The database builder will automatically merge these overrides with template data, creating an optimized, self-contained database.