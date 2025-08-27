# Acolyte - Necromancer - Meat Shielder Necro Exploder - Season 3 Filter Analysis

## Build Overview

**Build Archetype**: Necromancer minion build focusing on "meat shield" strategy with minion explosion mechanics  
**Season Context**: Season 3 specific build adaptation  
**Rule Count**: 23/75 rules (efficient usage - 31% of available rules)  
**Strategy**: Progressive minion build with explosion/sacrifice mechanics  
**Efficiency**: High - similar to other Necromancer builds but with variation focus

## Filter Strategy

### Core Philosophy
This filter implements a **minion sacrifice/explosion strategy** that uses minions both as damage dealers and as expendable resources for burst damage through explosion mechanics. The "Meat Shielder" name suggests minions serve dual purposes as protection and ammunition.

### Key Design Patterns

#### 1. Standard Necromancer Foundation (Rules 1-2)
- **Rule 1**: Hide Normal, Magic, Rare, and Exalted items (more restrictive than Arcane Servants)
- **Rule 2**: Hide all idols initially (standard pattern)
- **Strictness Level**: More selective baseline than other Necromancer builds

#### 2. Minion-Focused Idol Strategy (Rules 3-4)
**Pattern Match with Arcane Servants**:
```xml
<affixes>
  <!-- Same general affix array as Arcane Servants -->
  <int>112</int>, <int>324</int>, <int>142</int>, <int>124</int>
  <!-- Minion-focused stats -->
  <int>860</int>, <int>862</int>, <int>863</int>
</affixes>
```

**Key Insight**: Nearly identical affix priorities to Arcane Servants, suggesting similar stat requirements for different minion strategies.

#### 3. Progressive Weapon Focus (Rules 5+)
**Weapon Progression Pattern**:
- **Level 21-34**: Sceptres and Axes (subtype 4 for sceptres)
- **Level 35-65**: Axes (subtype 4) 
- **Level 66+**: High-tier weapon subtypes (subtype 9)

**Core Affixes**: Same as Arcane Servants (643, 102, 724, 64, 719)
- 643: Minion damage (critical for all minion builds)
- 102: Cast speed (minion summoning efficiency)
- 724: Necrotic damage (secondary damage type)
- 64: Minion attack speed (minion DPS)
- 719: Minion health (minion survivability)

## Seasonal and Mechanical Context

### Season 3 Adaptations
**Season-Specific Mechanics**: Season 3 likely introduced or emphasized:
- **Minion Explosion Mechanics**: Sacrifice minions for burst damage
- **Meat Shield Strategy**: Use minions defensively then explode them
- **Temporal/Seasonal Balance**: Adapts to season-specific skill balance

### Explosion/Sacrifice Mechanics
**Build Strategy Implications**:
- **High Minion Turnover**: Minions are created and destroyed frequently
- **Burst Damage Cycles**: Alternating between minion buildup and explosion
- **Resource Management**: Must balance minion creation with explosion timing
- **Survivability Focus**: Player exposed during minion rebuilding phases

## Technical Implementation Analysis

### Rule Efficiency
**23 vs 21 Rules**: Slight increase from Arcane Servants
- **Additional Complexity**: Explosion mechanics may require extra rules
- **Season Adaptations**: Extra rules for seasonal mechanic support
- **Still Efficient**: Well within sustainable rule count limits

### Identical Affix Patterns
**Statistical Analysis**: 95%+ overlap with Arcane Servants affix priorities
- **Minion Fundamentals**: Core minion stats remain the same
- **Damage Scaling**: Same underlying scaling mechanics
- **Survivability**: Similar defensive requirements

**Implication**: Different minion strategies (direct damage vs explosion) use same base stats.

## Comparison with Other Necromancer Builds

### vs. Arcane Servants (Direct Minion Damage)
| Aspect | Arcane Servants | Meat Shielder |
|--------|-----------------|---------------|
| **Strategy** | Sustained minion damage | Burst explosion damage |
| **Minion Longevity** | Long-lived minions | Expendable minions |
| **Burst Potential** | Sustained DPS | High burst cycles |
| **Rule Count** | 21 rules | 23 rules |
| **Affix Priorities** | Identical core stats | Identical core stats |
| **Complexity** | Straightforward | Timing-dependent |

### vs. Toxic Wind (Hybrid)
| Aspect | Toxic Wind | Meat Shielder |
|--------|------------|---------------|
| **Damage Sources** | Minions + Spells | Minions + Explosions |
| **Stat Diversity** | Mixed affix types | Minion-focused |
| **Mechanical Complexity** | Dual scaling | Timing mechanics |
| **Filter Complexity** | Hybrid requirements | Pure minion requirements |

## Build Requirements Analysis

### Core Scaling (Identical to Arcane Servants)
1. **Minion Damage** (643): Primary scaling for both sustained and burst
2. **Minion Health** (719): Critical for survivability before explosion
3. **Cast Speed** (102): Rapid minion replacement after explosions
4. **Necrotic Damage** (724): Explosion damage scaling
5. **Minion Attack Speed** (64): DPS during buildup phase

### Explosion-Specific Considerations
**Why Same Stats Work**:
- **Minion Quality**: Better minions create better explosions
- **Minion Health**: Healthier minions survive longer to reach explosion timing
- **Cast Speed**: Faster minion replacement between explosion cycles
- **Damage Stats**: Scale both minion attacks and explosion damage

## Learning Insights for Generation System

### Mechanical Variation Recognition
**Key Discovery**: Different minion strategies (sustained vs burst) use identical stat priorities
- **Core Requirements**: Fundamental minion stats transcend specific mechanics
- **Strategy Flexibility**: Same filter can support multiple minion approaches
- **Stat Universality**: Core scaling stats work across minion variants

### Seasonal Build Adaptation
**Season 3 Context**: Shows how builds adapt to seasonal mechanics
- **Filter Longevity**: Good filters adapt to mechanical changes
- **Core Stability**: Base stat requirements remain consistent
- **Seasonal Flexibility**: Extra rules accommodate new mechanics

### Skill Data Implications
```json
{
  "primarySkill": "Bone Prison", // Likely creates "meat shields"
  "secondarySkills": ["Summon Skeleton", "Corpse Explosion"],
  "mechanical_synergy": "minion_sacrifice_explosion",
  "seasonal_context": "season_3"
}
```

**System Recognition Needed**:
- **Sacrifice Mechanics**: Skills that consume minions for effects
- **Burst Strategies**: Builds with damage cycling rather than sustained output
- **Seasonal Variants**: How builds adapt to temporary mechanical changes

### Meta Build Format Challenges
```json
{
  "name": "Meat Shielder Necro Exploder",
  "class": "Acolyte",
  "mastery": "Necromancer",
  "primarySkill": "Bone Prison", 
  "secondarySkills": ["Corpse Explosion"],
  "seasonalAdaptation": "season_3"
}
```

**Generation Challenges**:
- **Mechanical Complexity**: Understanding sacrifice/explosion synergies
- **Timing Dependencies**: Builds requiring specific action sequences
- **Seasonal Context**: Adapting to temporary game state changes
- **Strategy Variants**: Different approaches using same fundamental stats

## Filter Design Insights

### Strategy-Agnostic Stat Selection
**Universal Minion Stats**: Core minion requirements work across:
- Direct damage strategies (Arcane Servants)
- Explosion strategies (Meat Shielder) 
- Hybrid strategies (Toxic Wind + minions)
- Support strategies (tank/utility minions)

### Seasonal Adaptability
**Filter Longevity**: Well-designed filters accommodate:
- **Mechanical Changes**: New skills or interactions
- **Balance Updates**: Stat scaling adjustments
- **Strategy Evolution**: Players discovering new approaches
- **Content Adaptations**: Different optimal strategies per content type

**Rule Budget Management**: Additional seasonal mechanics require careful rule allocation to stay within limits.

This analysis reveals that successful minion builds share fundamental stat requirements regardless of specific mechanical implementations, and that good filter design can accommodate strategic variations within the same build archetype.