# Meta Build Format: Skill-Based Approach

This document defines a **skill-based format** for describing Last Epoch builds that enables automated loot filter generation. Users describe builds the way they naturally think about them - through skills and items.

## Design Philosophy

Users think about builds in terms of:
1. **"I'm playing a Necromancer"** (class/mastery)
2. **"My main skill is Summon Skeleton"** (primary skill)  
3. **"I also use Bone Curse and Bone Armor"** (secondary skills)
4. **"I want to use this unique item"** (optional key items)
5. **"I prefer armor-based defense"** (optional defense strategy)

The system derives everything else from these natural choices.

## User Format

### Single Build Format
What users write for single-build filters:

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

### Multi-Build Format
What users write for filters supporting multiple builds/characters:

```json
{
  "name": "Universal Primalist",
  "builds": [
    {
      "name": "Beastmaster Summoner",
      "class": "Primalist",
      "mastery": "Beastmaster",
      "primarySkill": "Summon Bear",
      "secondarySkills": ["Swipe", "Earthquake", "Warcry", "Maelstrom"],
      "uniqueItems": ["Mantle of the Pale Ox", "Naal's Tooth"],
      "variants": [
        {
          "name": "Bear Build",
          "primarySkill": "Summon Bear"
        },
        {
          "name": "Raptor Build", 
          "primarySkill": "Summon Raptor",
          "enabledBy": "Naal's Tooth"
        },
        {
          "name": "Frog Build",
          "primarySkill": "Summon Frog", 
          "enabledBy": "Chorus of the Aurok"
        }
      ]
    },
    {
      "name": "Druid Thorns",
      "class": "Primalist",
      "mastery": "Druid",
      "primarySkill": "Spriggan Form",
      "secondarySkills": ["Werebear Form", "Summon Spriggan", "Eterra's Blessing"],
      "uniqueItems": ["Thicket of Blinding Light", "Thornshell", "Tears of the Forest"],
      "scalingType": "damage_reflection"
    }
  ]
}
```

The system figures out:
- Damage types from skill data (necrotic, physical)
- Weapon types from class/mastery (axes, sceptres)
- Stat priorities from skills (minion damage, cast speed, health)
- Item requirements and affix preferences
- **Multi-build compatibility**: Overlapping stats and equipment needs

## Required Fields

### Single Build Format
#### Core Identity
- **`class`** *(string)*: Base class (`Acolyte`, `Mage`, `Primalist`, `Sentinel`, `Rogue`)
- **`mastery`** *(string)*: Mastery specialization 
- **`primarySkill`** *(string)*: Main damage/utility skill that defines the build

#### Optional Fields
- **`name`** *(string)*: Human-readable build name (defaults to "Class - Mastery - PrimarySkill")
- **`secondarySkills`** *(array)*: Supporting skills (up to 4 additional skills)
- **`uniqueItems`** *(array)*: Key unique items the build relies on
- **`optionalUniqueItems`** *(array)*: Additional unique items that enhance but aren't required for the build
- **`defense`** *(string)*: Defensive strategy preference (`armor`, `dodge`, `block`, `ward`, `hybrid`)
- **`description`** *(string)*: Brief build description explaining mechanics and synergies
- **`focus`** *(string)*: Special filter focus (`leveling`, `endgame`, `trading`)

### Multi-Build Format
#### Root Level
- **`name`** *(string)*: Filter name describing all supported builds
- **`builds`** *(array)*: Array of build definitions

#### Per-Build Fields
- **`name`** *(string)*: Descriptive name for this build
- **`class`**, **`mastery`**, **`primarySkill`**: Same as single build format
- **`secondarySkills`**, **`uniqueItems`**, **`optionalUniqueItems`**, **`defense`**, **`description`**: Same as single build format
- **`scalingType`** *(string)*: Special scaling mechanism (`damage_reflection`, `low_life`, etc.)
- **`variants`** *(array)*: Build variations enabled by different items

#### Build Variants (Item-Enabled Builds)
- **`name`** *(string)*: Variant name
- **`primarySkill`** *(string)*: Different primary skill for this variant
- **`enabledBy`** *(string)*: Unique item that enables this variant
- **`secondarySkills`** *(array, optional)*: Different secondary skills if needed

**Note**: Strictness level is a filter generation parameter, not part of the build definition. Users specify strictness when generating the filter, not when defining the build.

## Example User Builds

### Single Build Examples

#### 1. Minion Necromancer (Minimal)
```json
{
  "class": "Acolyte",
  "mastery": "Necromancer",
  "primarySkill": "Summon Skeleton"
}
```

System derives:
- Damage types: necrotic, physical (from Summon Skeleton data)
- Weapons: axes, sceptres (from Necromancer preferences)  
- Priority stats: minion damage, minion health, cast speed
- Defense: armor (default for Acolyte)

#### 2. Specialized Build with Items
```json
{
  "name": "Lich Build",
  "class": "Acolyte", 
  "mastery": "Lich",
  "primarySkill": "Bone Spear",
  "secondarySkills": ["Bone Curse", "Transplant"],
  "uniqueItems": ["Exsanguinous"],
  "defense": "ward"
}
```

System derives:
- Damage types: necrotic (from Bone Spear)
- Weapons: sceptres, wands (from spell-based skills)
- Priority stats: spell damage, necrotic damage, cast speed
- Special handling: low life synergy (from Exsanguinous)

### Multi-Build Examples

#### 3. Universal Dual-Character Filter
```json
{
  "name": "Primalist Dual Build",
  "builds": [
    {
      "name": "Beastmaster Summoner",
      "class": "Primalist",
      "mastery": "Beastmaster", 
      "primarySkill": "Summon Bear",
      "secondarySkills": ["Swipe", "Earthquake", "Warcry", "Maelstrom"],
      "uniqueItems": ["Mantle of the Pale Ox", "Naal's Tooth"],
      "variants": [
        {
          "name": "Bear Build",
          "primarySkill": "Summon Bear"
        },
        {
          "name": "Raptor Build",
          "primarySkill": "Summon Raptor", 
          "enabledBy": "Naal's Tooth"
        },
        {
          "name": "Frog Build",
          "primarySkill": "Summon Frog",
          "enabledBy": "Chorus of the Aurok"
        }
      ]
    },
    {
      "name": "Druid Thorns",
      "class": "Primalist",
      "mastery": "Druid",
      "primarySkill": "Spriggan Form", 
      "secondarySkills": ["Werebear Form", "Summon Spriggan", "Eterra's Blessing"],
      "uniqueItems": ["Thicket of Blinding Light", "Thornshell", "Tears of the Forest"],
      "scalingType": "damage_reflection"
    }
  ]
}
```

System derives:
- **Multi-build compatibility**: Stats useful for both minion and thorns builds
- **Equipment overlap**: 1H weapons + shield for both builds
- **Specialized categories**: Separate minion and thorns affix groups
- **Universal stats**: Health, resistances, movement speed for both builds

#### 4. Trading Filter (No Skills)
```json
{
  "name": "Trading Filter",
  "focus": "trading"
}
```

System creates:
- Multi-build compatible filter
- Universal valuable stats (movement speed, health, resistances)  
- Market-focused item selection

## Advanced Concepts

### Item-Enabled Builds

Some builds are impossible without specific unique items that fundamentally change game mechanics:

#### Build-Enabling Items
- **"Chorus of the Aurok"**: Enables Frog summoning (skill doesn't normally exist)
- **"Thicket of Blinding Light"**: Enables reflection damage to scale for bosses 
- **"Exsanguinous"**: Enables low-life mechanics with current health as ward

#### Pattern Recognition
```json
{
  "variants": [
    {
      "name": "Frog Build",
      "primarySkill": "Summon Frog",
      "enabledBy": "Chorus of the Aurok"
    }
  ]
}
```

**System Understanding**:
- Base build works without the item
- Variant requires specific unique to function
- Filter must accommodate both possibilities
- Item transforms the build's scaling and requirements

### Multi-Build Design Patterns

#### Dual-Character Filters
**Use Case**: Player has multiple characters that can share one filter
- Different classes with compatible equipment needs
- Different builds within same class
- Complementary playstyles (melee + ranged, minion + spell)

#### Hybrid Scaling Builds  
**Use Case**: Single build that scales multiple ways simultaneously
- Minion builds that also deal personal damage
- Spell builds that use melee skills for buffs/utility
- Defensive builds that deal damage through reflection

#### Progressive Build Evolution
**Use Case**: Build changes dramatically as items are acquired
- Early: Basic skill usage without items
- Mid: Some build-enabling items acquired
- Late: Full transformation with multiple synergy items

### Filter Architecture for Multi-Builds

#### Shared Equipment Strategy
When builds share equipment types:
```json
{
  "equipmentOverlap": {
    "weapons": "1H + Shield", // Both builds use same weapon style
    "armor": "Universal defensive stats", // Health, resistances work for both
    "idols": "Mixed categories" // Some shared, some build-specific
  }
}
```

#### Specialized Affix Categories
Multi-build filters require:
- **Universal stats**: Movement speed, health, resistances
- **Build-specific categories**: Separate minion, thorns, spell sections
- **Broad T7+ coverage**: All premium affixes for any possible need
- **Equipment filtering**: Hide types no build uses

#### Rule Efficiency for Multi-Builds
- **Global hide + exceptions**: More efficient than many specific rules
- **Large affix arrays**: Consolidated categories reduce rule count
- **Quality tiers**: T7+/T6+ progression works across build types

## Data Flow: User → Intermediate → Filter

### 1. User Input
```json
{
  "class": "Acolyte",
  "mastery": "Necromancer", 
  "primarySkill": "Summon Skeleton",
  "secondarySkills": ["Bone Curse"]
}
```

### 2. System Expansion (Intermediate Format)
The system looks up skill data and creates an expanded build profile:

```json
{
  "userInput": { /* original user input */ },
  "derived": {
    "buildType": "minion",
    "damageTypes": ["necrotic", "physical"],
    "scalingStats": ["minion_damage", "necrotic_damage", "cast_speed"],
    "weaponTypes": ["two_handed_axe", "one_handed_axe", "one_handed_sceptre"],
    "defenseStrategy": "armor",
    "keyAffixes": [643, 724, 102, 64, 719], // Mapped from skill requirements
    "itemTypes": {
      "weapons": {"required": true, "progressive": true},
      "armor": {"required": true, "defensive_focus": true},
      "idols": {"minion_focus": true}
    }
  },
  "filterRules": {
    "progressionLevels": [20, 35, 65, 100],
    "tierRequirements": {"weapons": 6, "armor": 6},
    "uniqueHandling": {"minLP": 2, "showCocooned": true}
  }
}
```

### 3. Filter Generation
The generator uses the expanded profile to create XML rules following the patterns we analyzed from sample filters.

## Skill Data Requirements

For this to work, the system needs access to skill information:

### Required Skill Properties
- **Damage Types**: What damage types the skill deals
- **Scaling Stats**: What affixes improve the skill's effectiveness  
- **Weapon Requirements**: What weapons can use the skill
- **Build Classification**: Is it minion, spell, melee, bow, etc.
- **Resource Costs**: Mana, rage, health costs that affect stat priorities

### Example Skill Data
```json
{
  "Summon Skeleton": {
    "damageTypes": ["necrotic", "physical"],
    "buildType": "minion", 
    "scalingStats": ["minion_damage", "minion_health", "minion_attack_speed"],
    "supportStats": ["cast_speed", "mana", "necrotic_damage"],
    "weaponTypes": ["axes", "sceptres"], 
    "class": "Acolyte",
    "mastery": "Necromancer"
  }
}
```

## Unique Item Integration

When users specify unique items, the system considers:

### Item Synergies
- Special mechanics the item enables
- Stat requirements the item creates
- Build modifications the item suggests

### Example: Exsanguinous
```json
{
  "uniqueItems": ["Exsanguinous"],
  "derived": {
    "specialMechanics": ["low_life"],
    "additionalStats": ["ward", "current_health_as_ward"],
    "defenseModification": "ward_based",
    "potionSynergy": true
  }
}
```

## Benefits of Skill-Based Approach

### For Users
- **Natural Language**: Describe builds how you think about them
- **No Research Required**: Don't need to know affix IDs or stat names  
- **Automatic Optimization**: System handles complex stat interactions
- **Item Integration**: Unique items automatically modify build priorities

### For System
- **Data-Driven**: Uses actual skill data rather than guessing
- **Consistent**: Same skill always produces same stat priorities
- **Extensible**: Easy to add new skills and items
- **Validated**: Builds based on actual game mechanics

### For Filter Quality
- **Build Coherence**: All stats work together for the actual skills used
- **Progression Awareness**: Understands what stats matter at different stages
- **Item Synergy**: Accounts for unique item interactions
- **Mechanical Accuracy**: Based on real skill scaling, not abstract priorities

## Implementation Pipeline

```
User Build File → Skill Data Lookup → Expanded Build Profile → Rule Generation → XML Filter
```

1. **Parse** user's minimal input
2. **Lookup** skill data and item interactions  
3. **Expand** into complete build profile with derived stats
4. **Generate** progressive filter rules using sample filter patterns
5. **Output** optimized XML within 75-rule limit

This approach makes build specification incredibly simple for users while producing highly accurate, mechanically-sound filters based on actual skill data and item synergies.