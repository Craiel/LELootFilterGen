# Acolyte - Necromancer - Toxic Wind / Skeleton Poisoner Filter Analysis

## Build Overview

**Build Archetype**: Necromancer hybrid minion/spell build combining poison damage with skeleton minions  
**Build Reference**: https://www.youtube.com/watch?v=EgX0G3Q614k (YouTube build guide)  
**Rule Count**: 21/75 rules (efficient usage - 28% of available rules)  
**Strategy**: Hybrid poison/minion build with progressive requirements  
**Efficiency**: High - matches Arcane Servants efficiency while targeting different damage types

## Filter Strategy

### Core Philosophy
This filter implements a **hybrid poison-minion approach** that bridges the gap between pure minion builds and spell-based builds. It recognizes that Toxic Wind Necromancers scale both minion effectiveness AND personal spell damage through poison mechanics.

### Key Design Patterns

#### 1. Standard Necromancer Foundation (Rule 1)
- **Rule 1**: Hide Normal, Magic, and Rare items globally
- **More Permissive**: Unlike Thorns filter, allows Exalted and Unique items
- **Similar to Arcane Servants**: Standard Necromancer approach

#### 2. Hybrid Idol Strategy (Rules 2+)
**Idol Rule Pattern**:
```xml
<affixes>
  <!-- Large affix array including both minion and spell stats -->
  <int>112</int>  <!-- General utility -->
  <int>324</int>  <!-- Weaver affixes -->
  <int>846</int>  <!-- Poison-specific -->
  <int>828</int>  <!-- Spell damage -->
  <int>860</int>  <!-- Minion stats -->
</affixes>
<minOnTheSameItem>2</minOnTheSameItem>  <!-- 2+ relevant affixes -->
```

**Key Differences from Pure Minion**:
- **Mixed Affix Arrays**: Both minion and spell-damage affixes
- **Poison Focus**: Specific poison damage affixes (846, 828, 829)
- **Spell Integration**: Spell damage and cast speed for personal casting

#### 3. Hybrid Damage Scaling
**Evidence of Dual Scaling**:
- **Minion Affixes**: Traditional minion damage and health affixes
- **Poison Affixes**: Poison damage, poison chance, poison effectiveness
- **Spell Support**: Cast speed, spell damage for Toxic Wind casting
- **Combined Approach**: Benefits both minion effectiveness and personal poison spells

## Technical Implementation Analysis

### Affix Diversity Patterns
**Comprehensive Affix Coverage** (85+ different affix IDs):
- **Minion Core**: 860, 862, 880 (minion damage, health, speed)
- **Poison Specific**: 846, 828, 829 (poison damage and effects)
- **Spell Support**: Cast speed, spell damage, mana efficiency
- **General Utility**: Health, resistances, movement speed
- **Hybrid Stats**: Stats that benefit both minions and spells

### Progressive Requirements
**Similar Structure to Arcane Servants**:
- Level-dependent rules for weapon progression
- Tier requirements increasing with level
- Equipment type specialization by progression stage

**Key Difference**: Broader stat requirements reflecting hybrid nature

## Build Requirements Analysis

### Primary Damage Types
1. **Poison Damage**: Core damage type for both minions and spells
2. **Necrotic Damage**: Secondary damage type (traditional Necromancer)
3. **Physical Damage**: Minion base damage type

### Dual Scaling Mechanics
**Minion Scaling**: Traditional minion damage, health, attack speed
**Spell Scaling**: Poison damage, spell damage, cast speed for Toxic Wind
**Hybrid Synergy**: Poison affixes that benefit both minions and spells

### Defensive Strategy
**Necromancer Standard**: Health, resistances, armor-based defense
**Spell Caster Needs**: Mana, mana regeneration for active casting
**Minion Support**: Some defensive stats for minion survivability

## Comparison with Other Necromancer Builds

### vs. Arcane Servants (Pure Minion)
| Aspect | Arcane Servants | Toxic Wind |
|--------|-----------------|------------|
| **Damage Focus** | Pure minion | Hybrid minion+spell |
| **Stat Complexity** | Minion-focused | Mixed affix types |
| **Cast Speed Priority** | Support stat | Primary stat |
| **Poison Integration** | Minimal | Core mechanic |
| **Rule Count** | 21 rules | 21 rules |

### vs. Pure Spell Necromancer (Hypothetical)
| Aspect | Pure Spell | Toxic Wind |
|--------|------------|------------|
| **Minion Investment** | None | Significant |
| **Weapon Types** | Spell weapons | Hybrid weapons |
| **Affix Priorities** | Spell damage | Mixed priorities |
| **Resource Management** | Mana-focused | Balanced |

## Build Mechanical Insights

### Toxic Wind + Skeleton Synergy
**Mechanical Integration**:
- **Toxic Wind**: Personal spell that creates poison fields
- **Skeleton Minions**: Benefit from minion stats, potentially interact with poison
- **Poison Scaling**: Both the spell and potentially minion effects scale with poison stats
- **Hybrid Casting**: Player actively casts while minions fight

### Skill Integration Evidence
**From YouTube Link Reference**: This filter was designed for a specific build guide
- **Proven Combination**: Real build that requires both minion and spell support
- **Mechanical Synergy**: Poison effects benefit both playstyle components
- **Resource Balance**: Must manage both minion effectiveness and spell casting

## Learning Insights for Generation System

### Hybrid Build Classification
**Challenge**: Builds that don't fit single categories
- **Multi-School**: Uses both minion and spell mechanics
- **Cross-Scaling**: Stats benefit multiple damage sources
- **Complex Priorities**: No single "most important" stat type

### Skill Data Requirements
**For Toxic Wind + Skeleton Build**:
```json
{
  "primarySkill": "Toxic Wind",
  "secondarySkills": ["Summon Skeleton"],
  "mechanical_synergy": "poison_minion_hybrid",
  "scaling_complexity": "dual_type"
}
```

**System Must Recognize**:
- **Skill Synergies**: How different skills work together
- **Cross-School Benefits**: Stats that help multiple skill types
- **Hybrid Priorities**: Balanced stat requirements vs specialized focus

### Meta Build Format Implications
```json
{
  "name": "Toxic Wind Skeleton Poisoner",
  "class": "Acolyte",
  "mastery": "Necromancer", 
  "primarySkill": "Toxic Wind",
  "secondarySkills": ["Summon Skeleton"],
  "uniqueItems": [],
  "buildGuide": "https://www.youtube.com/watch?v=EgX0G3Q614k"
}
```

**System Derivation Challenge**:
- **Damage Types**: poison (primary), necrotic (secondary), physical (minion base)
- **Scaling Stats**: poison_damage + minion_damage + cast_speed
- **Weapon Types**: Must work for both minion summoning and spell casting
- **Defense Strategy**: Spell caster positioning with minion protection

## Filter Generation Requirements

### Hybrid Template Needs
1. **Multi-Affix Arrays**: Support builds needing diverse stat types
2. **Balanced Priorities**: No single stat dominates completely
3. **Mechanical Understanding**: Recognize skill synergies and interactions
4. **Flexible Weapon Types**: Accommodate builds using multiple skill types

### Complex Stat Interactions
- **Cross-School Benefits**: Affixes that help multiple skill types
- **Synergy Recognition**: Understanding when skills complement each other
- **Priority Balancing**: How to weight competing stat requirements

This filter demonstrates the complexity of hybrid builds and the need for sophisticated understanding of skill interactions in the generation system. It shows that effective builds often cross traditional boundaries and require nuanced stat balancing rather than single-focus optimization.