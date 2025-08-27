# Template Filters

This directory contains XML template files that define game data for Last Epoch loot filter generation.

## ⚠️ CRITICAL: 75-Rule Limit

**ALL template files must not exceed 75 rules.** Last Epoch enforces this strict limit on all loot filter XML files. Template files use 70 rules maximum to leave room for additional conditions if needed.

## Purpose

Template files serve as the source of truth for game data, including:
- Item types and categories
- Affix definitions and tiers
- Base item statistics
- Unique item information
- Class-specific requirements

## Template Files

### Current Templates

- **MasterTemplate1.xml** - Core game data structure with key data points but lacking detailed game information

### Generated Affix Templates

The `affixes/` directory contains auto-generated template files for affix identification:

- **AffixTemplate_000-069.xml** - Affix IDs 0-69 (70 affixes)
- **AffixTemplate_070-139.xml** - Affix IDs 70-139 (70 affixes)
- **AffixTemplate_140-209.xml** - Affix IDs 140-209 (70 affixes)
- **AffixTemplate_210-279.xml** - Affix IDs 210-279 (70 affixes)
- **AffixTemplate_280-349.xml** - Affix IDs 280-349 (70 affixes)
- **AffixTemplate_350-419.xml** - Affix IDs 350-419 (70 affixes)
- **AffixTemplate_420-489.xml** - Affix IDs 420-489 (70 affixes)
- **AffixTemplate_490-559.xml** - Affix IDs 490-559 (70 affixes)
- **AffixTemplate_560-629.xml** - Affix IDs 560-629 (70 affixes)
- **AffixTemplate_630-699.xml** - Affix IDs 630-699 (70 affixes)
- **AffixTemplate_700-769.xml** - Affix IDs 700-769 (70 affixes)
- **AffixTemplate_770-839.xml** - Affix IDs 770-839 (70 affixes)
- **AffixTemplate_840-909.xml** - Affix IDs 840-909 (70 affixes)
- **AffixTemplate_910-945.xml** - Affix IDs 910-945 (36 affixes)

**Total**: 946 unique affixes across 14 template files

These templates are used for in-game identification of affix names and properties. Each template uses different colors to distinguish between affix ranges.

### Planned Templates

Additional template files will be created to cover missing data categories:
- Unique item templates
- Set item templates  
- Base type templates
- Class-specific item templates

## Template Structure

Each template file should:
1. Use valid XML structure compatible with Last Epoch's format
2. Include comprehensive data for its category
3. Be documented with inline comments where helpful
4. Follow consistent naming conventions

## Maintenance

Template files may need updates when:
- Game patches introduce new items or affixes
- Balance changes affect item statistics
- New content is added to Last Epoch

When updating templates:
1. Back up existing files
2. Update the changed data
3. Run database rebuild: `npm run build-database`
4. Verify generated filters still work correctly

## Affix Data Collection Process

### Generating Affix Templates
```bash
npm run generate-affix-templates
```
This command regenerates all affix template files based on the current MasterTemplate1.xml.

### In-Game Data Collection
1. **Load Templates**: Import each affix template file into Last Epoch
2. **Test Items**: Use various items to see which affixes trigger the colored highlights
3. **Record Data**: Document affix names, descriptions, tier ranges, and applicable item types
4. **Store Results**: Save collected data in `Data/overrides/affixes/` directory

### Data Collection Format
Create JSON files for collected affix data:
```json
{
  "affixId": 123,
  "name": "Increased Physical Damage",
  "description": "Increases physical damage dealt",
  "tiers": [
    {"min": 1, "max": 5, "value": "1-5%"},
    {"min": 6, "max": 10, "value": "6-10%"}
  ],
  "itemTypes": ["weapon", "jewelry"],
  "requirements": [],
  "category": "damage"
}
```

## Adding New Templates

To add a new template file:
1. Create the XML file in this directory
2. Document its purpose in this README
3. Update the parser to recognize the new template
4. Test with a database rebuild

## Manual Data Override

The parser supports manual data overrides that persist through re-generation. Override files are stored in the `Data/` directory and will not be lost when templates are updated.