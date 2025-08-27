# Last Epoch Loot Filter XML Format

This document provides comprehensive documentation of the XML structure used for Last Epoch loot filters. This format documentation focuses on the technical structure and schema, separate from design strategy covered in `FILTER_DESIGN.md`.

## Root Structure

```xml
<ItemFilter xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
  <name>Filter Name</name>
  <filterIcon>2</filterIcon>
  <filterIconColor>3</filterIconColor>
  <description>Optional description text</description>
  <lastModifiedInVersion>1.3.0</lastModifiedInVersion>
  <lootFilterVersion>3</lootFilterVersion>
  <rules>
    <!-- Rules array - maximum 75 rules -->
  </rules>
</ItemFilter>
```

## Filter Metadata

### Required Fields
- **name**: Display name shown in-game filter list
- **filterIcon**: Integer representing icon type (0-15+ available icons)
- **filterIconColor**: Integer representing color (0-15+ available colors)  
- **lastModifiedInVersion**: Game version when filter was last modified
- **lootFilterVersion**: Filter schema version (current: 3)
- **rules**: Array containing all filter rules

### Optional Fields  
- **description**: Text description displayed in filter details

## Rule Structure

Each rule follows this structure:

```xml
<Rule>
  <type>SHOW|HIDE|HIGHLIGHT</type>
  <conditions>
    <!-- Condition array -->
  </conditions>
  <color>0-15</color>
  <isEnabled>true|false</isEnabled>
  <levelDependent>true|false</levelDependent>
  <minLvl>0</minLvl>
  <maxLvl>0</maxLvl>
  <emphasized>true|false</emphasized>
  <nameOverride>Optional display name</nameOverride>
</Rule>
```

### Rule Types

1. **SHOW**: Item is displayed with specified styling
2. **HIDE**: Item is hidden from view  
3. **HIGHLIGHT**: Item uses special highlighting (typically used with other SHOW rules)

### Rule Properties

- **color**: Integer 0-15 specifying item text/border color
- **isEnabled**: Boolean controlling if rule is active
- **levelDependent**: Boolean indicating if rule uses level restrictions
- **minLvl/maxLvl**: Level range when rule applies (0 = no restriction)
- **emphasized**: Boolean for bold text styling
- **nameOverride**: Custom display name shown instead of item name

## Condition Types

Rules contain arrays of conditions that must be met for the rule to apply. Multiple conditions use AND logic.

### RarityCondition

Controls item rarity filtering:

```xml
<Condition i:type="RarityCondition">
  <rarity>NORMAL MAGIC RARE EXALTED UNIQUE SET LEGENDARY</rarity>
  <minLegendaryPotential>2</minLegendaryPotential>
  <maxLegendaryPotential i:nil="true" />
  <minWeaversWill>20</minWeaversWill>
  <maxWeaversWill i:nil="true" />
</Condition>
```

**Parameters**:
- **rarity**: Space-separated list of rarities to match
- **minLegendaryPotential**: Minimum LP value (1-4)
- **maxLegendaryPotential**: Maximum LP value (can be nil)
- **minWeaversWill**: Minimum Weaver's Will value (5-25)
- **maxWeaversWill**: Maximum Weaver's Will value (can be nil)

### SubTypeCondition

Controls equipment type filtering:

```xml
<Condition i:type="SubTypeCondition">
  <type>
    <EquipmentType>HELMET</EquipmentType>
    <EquipmentType>BODY_ARMOR</EquipmentType>
    <EquipmentType>BOOTS</EquipmentType>
  </type>
  <subTypes>
    <int>3</int>
    <int>4</int>
  </subTypes>
</Condition>
```

**Parameters**:
- **type**: Array of equipment type enums
- **subTypes**: Array of integers representing specific base type variations

### Common Equipment Types
```
HELMET, BODY_ARMOR, BELT, BOOTS, GLOVES
AMULET, RING, RELIC, CATALYST
ONE_HANDED_AXE, ONE_HANDED_DAGGER, ONE_HANDED_MACES, ONE_HANDED_SCEPTRE, WAND
TWO_HANDED_AXE, TWO_HANDED_MACE, TWO_HANDED_SPEAR, TWO_HANDED_STAFF, TWO_HANDED_SWORD
BOW, QUIVER, SHIELD
IDOL_1x1_ETERRA, IDOL_1x1_LAGON, IDOL_2x1, IDOL_1x2, IDOL_3x1, IDOL_1x3, IDOL_4x1, IDOL_1x4, IDOL_2x2
```

### AffixCondition

Controls affix (stat) requirements:

```xml
<Condition i:type="AffixCondition">
  <affixes>
    <int>28</int>  <!-- Health -->
    <int>36</int>  <!-- Movement Speed -->
    <int>52</int>  <!-- Elemental Resistance -->
  </affixes>
  <comparsion>MORE_OR_EQUAL</comparsion>
  <comparsionValue>6</comparsionValue>
  <minOnTheSameItem>2</minOnTheSameItem>
  <combinedComparsion>ANY</combinedComparsion>
  <combinedComparsionValue>12</combinedComparsionValue>
  <advanced>true</advanced>
</Condition>
```

**Parameters**:
- **affixes**: Array of integer affix IDs to check
- **comparsion**: Comparison operator (ANY, MORE_OR_EQUAL, EQUAL, LESS_OR_EQUAL)
- **comparsionValue**: Tier threshold (typically 1-7+ for affix tiers)
- **minOnTheSameItem**: Minimum number of matching affixes required
- **combinedComparsion**: How to combine multiple affix values
- **combinedComparsionValue**: Threshold for combined affix values  
- **advanced**: Boolean indicating advanced condition logic

### ClassCondition

Controls class-based filtering:

```xml
<Condition i:type="ClassCondition">
  <req>Primalist Mage Sentinel Rogue</req>
</Condition>
```

**Parameters**:
- **req**: Space-separated list of class names to match

**Class Names**: `Primalist`, `Mage`, `Sentinel`, `Rogue`, `Acolyte`

## Rule Processing Logic

1. **Top-to-Bottom Evaluation**: Rules are processed in order from first to last
2. **First Match Wins**: First rule that matches determines item behavior
3. **Early Termination**: Once a SHOW or HIDE rule matches, no further rules are evaluated
4. **HIGHLIGHT Exception**: HIGHLIGHT rules can be processed alongside other rule types

## Color Values

Standard color values (may vary by game version):
```
0 = Default/White    8 = Orange
1 = Red              9 = Pink  
2 = Green           10 = Purple
3 = Blue            11 = Brown
4 = Yellow          12 = Cyan
5 = Magenta         13 = Light Green
6 = Cyan            14 = Light Blue
7 = Gray            15 = Light Purple
```

## Technical Constraints

### Hard Limits
- **Maximum Rules**: 75 total rules per filter
- **Rule Evaluation**: Sequential processing with early termination
- **Namespace**: Must include XML schema instance namespace

### Performance Considerations
- **Rule Ordering**: Place most common matches early for better performance
- **Condition Complexity**: Simpler conditions evaluate faster
- **Rule Count**: Fewer rules generally perform better

## Common Affix ID Reference

Based on observed patterns in sample filters:

### Defensive Affixes
```
28  = Health
25  = Fire Resistance  
52  = Cold Resistance
36  = Movement Speed
502 = Dodge Rating
97  = Armor
```

### Offensive Affixes
```
643 = Minion Damage
102 = Cast Speed  
724 = Necrotic Damage
64  = Minion Attack Speed
719 = Minion Health
```

### General Utility
```
4   = Mana
34  = Mana Regeneration
714 = Experience Gain
```

*Note: Complete affix ID database should be cross-referenced with game data files*

## Version History

### lootFilterVersion: 3 (Current)
- Current schema used in game version 1.3.0+
- Supports Weaver's Will conditions
- Enhanced Legendary Potential handling

### lootFilterVersion: 2 (Legacy)  
- Previous schema version
- May lack some newer condition types

## Validation Rules

Valid filters must:
1. **Respect Rule Limit**: Use ≤75 rules total
2. **Include Required Fields**: All mandatory metadata fields present
3. **Valid Condition Types**: Only use supported condition types
4. **Proper Namespace**: Include XML schema instance namespace
5. **Valid Enums**: Equipment types and class names must match game values
6. **Logical Structure**: Rules and conditions must be properly nested

## Example Complete Rule

```xml
<Rule>
  <type>SHOW</type>
  <conditions>
    <Condition i:type="SubTypeCondition">
      <type>
        <EquipmentType>HELMET</EquipmentType>
        <EquipmentType>BODY_ARMOR</EquipmentType>
      </type>
      <subTypes />
    </Condition>
    <Condition i:type="AffixCondition">
      <affixes>
        <int>28</int>  <!-- Health -->
        <int>36</int>  <!-- Movement Speed -->
      </affixes>
      <comparsion>MORE_OR_EQUAL</comparsion>
      <comparsionValue>6</comparsionValue>
      <minOnTheSameItem>1</minOnTheSameItem>
      <combinedComparsion>ANY</combinedComparsion>
      <combinedComparsionValue>6</combinedComparsionValue>
      <advanced>true</advanced>
    </Condition>
    <Condition i:type="RarityCondition">
      <rarity>RARE EXALTED</rarity>
      <minLegendaryPotential i:nil="true" />
      <maxLegendaryPotential i:nil="true" />
      <minWeaversWill i:nil="true" />
      <maxWeaversWill i:nil="true" />
    </Condition>
  </conditions>
  <color>8</color>
  <isEnabled>true</isEnabled>
  <levelDependent>false</levelDependent>
  <minLvl>0</minLvl>
  <maxLvl>0</maxLvl>
  <emphasized>true</emphasized>
  <nameOverride>Defensive Gear</nameOverride>
</Rule>
```

This rule shows Rare or Exalted helmets and body armor with T6+ Health or Movement Speed, displayed in orange with bold text and custom name.

## Advanced Filter Patterns

Based on extended analysis of sample filters, several advanced patterns have been identified:

### Global Hide Strategy
**Pattern**: Hide everything by default, then show specific exceptions
```xml
<!-- Rule 1: Hide ALL rarities including uniques -->
<Rule>
  <type>HIDE</type>
  <conditions>
    <Condition i:type="RarityCondition">
      <rarity>NORMAL MAGIC RARE UNIQUE SET EXALTED</rarity>
    </Condition>
  </conditions>
</Rule>
<!-- Subsequent rules show specific items that override the global hide -->
```

**Usage**: Ultra-strict filters (Thorns AllieSInk - 69/75 rules)
**Benefits**: Maximum selectivity, extreme quality control
**Risks**: Very low item volume, progression difficulties

### Multi-Affix Hybrid Requirements
**Pattern**: Large affix arrays supporting multiple build types
```xml
<Condition i:type="AffixCondition">
  <affixes>
    <!-- 100+ affix IDs covering multiple scaling types -->
    <int>643</int>  <!-- Minion damage -->
    <int>909</int>  <!-- Beast/companion stats --> 
    <int>828</int>  <!-- Spell damage -->
    <int>846</int>  <!-- Poison damage -->
    <!-- ... many more affixes -->
  </affixes>
  <minOnTheSameItem>2</minOnTheSameItem>  <!-- Require multiple relevant affixes -->
</Condition>
```

**Usage**: Hybrid builds (Wolf Carnage, Toxic Wind)
**Benefits**: Supports complex multi-scaling builds
**Challenge**: Large rule size, complex priority balancing

### Specialized Single-Stat Focus
**Pattern**: Multiple rules targeting the same critical stat
```xml
<!-- Multiple rules all focusing on affix 43 (Healing Effectiveness) -->
<Rule><!-- Weapons with Healing Effectiveness T6+ --></Rule>
<Rule><!-- Armor with Healing Effectiveness T6+ --></Rule>
<Rule><!-- Jewelry with Healing Effectiveness T6+ --></Rule>
```

**Usage**: Specialized builds (Thorns - Healing Effectiveness)
**Benefits**: Laser focus on build-critical mechanics
**Application**: Builds with unusual scaling mechanics

### Rule Budget Management
**Complexity Tiers Observed**:
- **Simple**: 8 rules (Frog Minions) - Ultra-focused
- **Efficient**: 21-23 rules (Necromancer builds) - Standard complexity
- **Moderate**: 25 rules (Wolf Carnage) - Hybrid builds
- **Complex**: 69 rules (Thorns) - Near maximum complexity

### Seasonal and Variant Adaptations
**Pattern**: Similar builds with minor rule variations
- **Base Build**: Arcane Servants (21 rules)
- **Seasonal Variant**: Meat Shielder S3 (23 rules) - +2 rules for seasonal mechanics
- **Strategy Variant**: Toxic Wind hybrid (21 rules) - same count, different focus

**Insight**: Good filter architectures adapt to variations without major restructuring.

## Advanced Implementation Techniques

### Custom Rule Naming
```xml
<nameOverride>Healing Effectiveness</nameOverride>
<nameOverride>Regular, Weaver and Enchanted Idols</nameOverride>  
<nameOverride>Exalted T7 items to keep for alt. characters</nameOverride>
```

**Purpose**: User-friendly rule identification
**Best Practice**: Descriptive names for complex or specialized rules

### Advanced Condition Logic
```xml
<advanced>true</advanced>
```

**Usage**: Complex evaluation scenarios
**Application**: Multi-condition rules with sophisticated logic

### Quality Gating by Build Type
- **Minion Builds**: Often allow Rare+ items (accessible progression)
- **Specialized Builds**: May require Exalted+ only (quality over quantity)
- **Trading Builds**: Balanced approach across quality levels

## Filter Architecture Insights

### Universal Minion Patterns
**Discovered**: All minion builds use identical core affixes regardless of strategy
- **Direct Damage** (Arcane Servants): 643, 102, 724, 64, 719
- **Explosion** (Meat Shielder): Same affixes
- **Hybrid** (Toxic Wind): Same core + additional spell affixes

**Implication**: Minion templates can support multiple strategies with same base stats.

### Hybrid Build Challenges
**Requirements**:
- Large affix arrays (85+ different IDs)
- Balanced priority systems
- Multi-condition rule logic
- Higher rule counts (25+ rules typical)

### Complexity vs Usability Trade-offs
- **Simple Filters**: Easy to understand, limited flexibility
- **Complex Filters**: Maximum functionality, expert knowledge required
- **Rule Budget**: Critical constraint affecting all design decisions

This analysis reveals that effective filter design must support a spectrum from ultra-simple focused builds to maximum-complexity specialist builds, each with distinct patterns and requirements.