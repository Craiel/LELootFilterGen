# Template Creation Procedure

This document outlines the systematic approach for creating template XML files to gather missing game data from Last Epoch.

## Overview

The MasterTemplate1.xml contains references to game objects by ID but lacks descriptive information about what each ID represents. To build a comprehensive database, we need to create template files that allow manual data entry through in-game testing.

## ⚠️ CRITICAL CONSTRAINT: 75-Rule Limit

**ALL Last Epoch loot filter XML files are limited to a maximum of 75 rules.** This constraint applies to:
- All template files we create
- All generated loot filters
- Any XML file that will be loaded into Last Epoch

**This limit cannot be exceeded or the filter will not work properly.**

## Affix Template Procedure

### Problem
- MasterTemplate1.xml contains 946 unique affix IDs (0-945)
- Each ID references a specific affix but provides no descriptive information
- We need to identify what each affix ID represents (name, description, tiers, requirements)

### Solution
Create multiple template files that generate individual rules for each affix, allowing in-game identification:

1. **Template Structure**: Each template contains rules with single affix conditions
2. **In-Game Testing**: Use templates to identify which affixes trigger which rules
3. **Data Collection**: Manually record affix names, descriptions, and properties
4. **Database Building**: Parse collected data into intermediate database

### Implementation Steps

#### 1. Template File Creation
- Create multiple template files (e.g., 14 files with 70 affixes each)
- **Each file must not exceed 75 rules** (using 70 to leave room for other conditions)
- Each file contains rules for a range of affix IDs
- Rules are structured to show items with specific affixes

#### 2. Reference Values

Last Epoch uses integer values for colors, sounds, and loot beams in filters. Complete references are available in template files:

##### Colors (`TemplateFilters/Colors.xml`)
- **0**: White, **1**: Grey, **2**: Lime, **3**: Yellow
- **4**: Light Orange, **5**: Orange, **6**: Light Red, **7**: Red  
- **8**: Pink, **9**: Hot Pink, **10**: Purple, **11**: Light Purple
- **12**: Blue, **13**: Light Blue, **14**: Cyan, **15**: Aqua
- **16**: Green, **17**: Dark Green

##### Sound IDs (`TemplateFilters/Sounds.xml`)
- **0**: Default, **1**: None, **2**: Shing, **3**: Shaker, **4**: Zap
- **5**: Drum, **6**: Begin, **7**: Fight, **8**: Discovery
- **9**: Inspiration, **10**: Anvil

##### Beam IDs (`TemplateFilters/MapIcon_LootBeam.xml`)  
- **0**: Default, **1**: None, **2**: Rare, **3**: Unique, **4**: Set
- **5**: Legendary, **6**: Key, **7**: Exalted, **8**: Golden, **9**: Obsidian

**To find reference values**: Load the respective template files in Last Epoch and observe the effects in-game. Each rule's `nameOverride` field shows the name corresponding to its ID value.

#### 3. Using Reference Values in Templates

When creating template files, you can use these values to enhance the in-game experience:

```xml
<color>7</color>          <!-- Red color for high-priority items -->
<SoundId>8</SoundId>      <!-- Discovery sound for important finds -->
<BeamId>3</BeamId>        <!-- Unique beam for unique items -->
```

**Best Practices:**
- Use distinct colors per template file for visual separation
- Reserve special sounds (Anvil, Discovery) for high-value items
- Match beam types to item rarity (Unique beam for unique items, Set beam for set items)
- Use Default (0) values for basic templates to minimize audio/visual noise

#### 4. Template File Structure
```xml
<Rule>
  <type>SHOW</type>
  <conditions>
    <Condition i:type="AffixCondition">
      <affixes>
        <int>ID_NUMBER</int>
      </affixes>
      <combinedComparsion>ANY</combinedComparsion>
      <combinedComparsionValue>1</combinedComparsionValue>
      <advanced>false</advanced>
    </Condition>
  </conditions>
  <color>COLOR_CODE</color>  <!-- Reference: TemplateFilters/Colors.xml for valid color values -->
  <isEnabled>true</isEnabled>
  <emphasized>true</emphasized>
  <nameOverride>Affix ID: ID_NUMBER</nameOverride>
  <SoundId>0</SoundId>       <!-- Reference: TemplateFilters/Sounds.xml for sound options -->
  <BeamId>0</BeamId>         <!-- Reference: TemplateFilters/MapIcon_LootBeam.xml for beam options -->
  <Order>ORDER_NUMBER</Order>
</Rule>
```

#### 3. In-Game Data Collection
- Load each template file in Last Epoch
- Test with various items to see which affixes trigger rules
- Record affix names, descriptions, tier ranges, and applicability
- Document findings in structured format

#### 4. Data Processing
- Create JSON files with collected affix data
- Store in Data/overrides/affixes/ directory
- Include fields: id, name, description, tiers, item_types, requirements

## Generalization for Other Data Types

This procedure applies to other game object types that follow similar ID-based references:

### Unique Items
- Extract unique item IDs from MasterTemplate1.xml analysis
- **403 unique items** identified from master template structure
- Create template rules for UniqueModifiersCondition
- Test in-game to identify unique item names and properties
- **Generator Available**: `scripts/generate-unique-templates.js`

### Set Items
- **47 set items** identified as specific unique IDs in master template
- Set items use UniqueModifiersCondition with specific unique IDs (not rarity-based filtering)
- Separate from regular unique items in "All Set Items" rule
- Create template rules for set item identification using unique IDs
- **Generator Available**: `scripts/generate-set-templates.js`

### Base Item Types
- Extract base type IDs
- Create template rules for base type conditions
- Document base item properties and categories

## Template File Organization

```
TemplateFilters/
├── MasterTemplate1.xml                # Original master template
├── Colors.xml                         # Color reference template
├── Sounds.xml                         # Sound reference template
├── MapIcon_LootBeam.xml               # Loot beam reference template
├── SingleAffixTemplate.xml            # Example single affix template
├── affixes/
│   ├── AffixTemplate_000-069.xml      # Affixes 0-69 (70 rules each)
│   ├── AffixTemplate_070-139.xml      # Affixes 70-139
│   └── ... (14 files total)
├── uniques/
│   ├── UniqueTemplate_000-075.xml     # Unique items (403 total, excluding sets)
│   ├── UniqueTemplate_076-178.xml     # 70 unique items per file
│   └── ... (6 files total)
└── sets/
    └── SetTemplate_005-261.xml        # Set items (47 total, using unique IDs)
```

**Note**: Set items are identified using specific unique IDs, not rarity-based filtering.

## Data Collection Workflow

1. **Generate Templates**: Create template XML files programmatically
2. **In-Game Testing**: Load templates and test with items
3. **Data Recording**: Document findings in structured format
4. **Database Integration**: Process collected data into intermediate database
5. **Validation**: Verify data accuracy and completeness

## Quality Control

- **Consistency**: Use standardized naming conventions
- **Completeness**: Ensure all referenced IDs are covered
- **Accuracy**: Cross-reference data with multiple sources
- **Maintainability**: Structure data for easy updates

This procedure ensures comprehensive data collection while maintaining organization and quality standards for the loot filter generation system.