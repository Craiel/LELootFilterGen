# Acolyte - Necromancer - Arcane Servants Filter Analysis

## Build Overview

**Build Archetype**: Necromancer minion build focused on skeletal servants with necrotic damage scaling  
**Rule Count**: 21/75 rules (efficient usage - 28% of available rules)  
**Strategy**: Progressive leveling filter with weapon focus and defensive priorities  
**Efficiency**: High - stays well within rule limits while providing comprehensive coverage

## Filter Strategy

### Core Philosophy
This filter implements a **progressive strictness** approach that adapts requirements based on character level. It focuses on enabling the minion archetype while maintaining strong defensive priorities throughout all progression stages.

### Key Design Patterns

#### 1. Foundation Rules (Rules 1-2)
- **Rule 1**: Hide normal/magic/rare items globally to reduce clutter
- **Rule 2**: Hide unwanted idol sizes initially, then override with specific SHOW rules

*Design Insight: Uses early HIDE rules to establish baseline, then SHOW rules for exceptions*

#### 2. Idol Specialization (Rules 3-4)
- **Rule 3**: Show small/medium idols (1x4, 2x2, etc.) with 2+ relevant affixes from a curated list
- **Rule 4**: Show large idols (3x1, 1x3, 4x1, 2x2) with 1+ class-specific minion affixes

*Design Insight: Different requirements for different idol sizes - larger idols need fewer affixes*

**Key Affix Sets**:
- General/Weaver: 112, 324, 142, 124, 115, 114, 116, 430, 113, 111, 117, 107, 105, 109, 110, etc.
- Class-Specific: 142, 285, 297, 313, 650, 324, 941, 114, 109, 105, 906, 897, 316

#### 3. Weapon Progression System (Rules 5-10, 14-15)

**Level-Gated Weapon Rules**:
- **Levels 21-34**: T6+ minion affixes on low-tier weapon subtypes (subtype 3, 4)
- **Levels 35-65**: T6+ minion affixes on mid-tier weapon subtypes (subtype 4)  
- **Levels 66-75**: T6+ minion affixes on high-tier weapon subtypes (subtype 9)
- **Endgame**: Exalted T6+ weapons with perfect subtypes

**Weapon Types Prioritized**:
- Two-handed Axes (primary)
- One-handed Axes (secondary/dual-wield)
- One-handed Sceptres (caster option)

**Core Weapon Affixes** (IDs: 643, 102, 724, 64, 719):
- Minion damage scaling
- Cast speed for minion summoning
- Necrotic damage support
- Minion attack speed
- Minion health/survivability

#### 4. Armor Progression System (Rules 11-13, 16)

**Progressive Requirements**:
- **Levels 0-20**: 1 relevant affix at T6+
- **Levels 21-35**: 2 relevant affixes totaling T12+ combined value
- **Levels 36-65**: 3 relevant affixes totaling T18+ combined value
- **Endgame**: Exalted items with T6+ single affixes

**Armor Affix Priority** (28, 25, 52, 36, 502, 97, etc.):
- Health (primary defensive stat)
- Resistances (fire, cold, lightning, etc.)
- Movement speed (quality of life)
- Armor and dodge (build-specific defense)

#### 5. Special Rules

**Class Filtering** (Rule 18):
- Hide items for Primalist, Mage, Sentinel, Rogue
- Keeps only Acolyte-compatible items

**Unique Item Handling** (Rules 19-20):
- Show uniques with 2+ Legendary Potential (high-value threshold)
- Show all Legendary and Set items regardless of LP

**Highlighting** (Rules 17, 21):
- Highlight necrotic damage affixes (color 2 - green)
- Highlight movement speed affixes (color 7 - gray)
- Advanced highlighting for specific affixes across all item types

#### 6. Endgame Optimization (Rule 22)
- Show T7+ exalted gear for alternate characters
- Massive affix list covering all build types
- Future-proofing for multiple character builds

## Technical Implementation

### Rule Efficiency Techniques

1. **Condition Layering**: Multiple conditions per rule using AND logic
2. **Progressive Values**: Different `comparsionValue` by level brackets
3. **Affix Grouping**: Large affix arrays to maximize coverage per rule
4. **Level Dependencies**: Smart use of `levelDependent` flags

### Advanced Features Used

- **Combined Affix Values**: `combinedComparsionValue` for multi-affix requirements
- **Advanced Conditions**: `advanced="true"` for complex affix logic
- **Custom Naming**: `nameOverride` for user-friendly rule descriptions
- **Color Coding**: Strategic use of colors for visual distinction

## Build Requirements Analysis

### Primary Scaling
- **Minion Damage** (643): Core scaling stat for all minions
- **Necrotic Damage** (724): Secondary damage type support
- **Cast Speed** (102): Minion summoning efficiency

### Defensive Priorities
1. **Health** (28, 25): Primary survivability stat
2. **Resistances** (25, 52): Essential for all content
3. **Armor** (36, 97): Build-specific physical mitigation
4. **Movement Speed** (36): Quality of life and positioning

### Minion Support Stats
- **Minion Attack Speed** (64): Minion DPS optimization
- **Minion Health** (719): Minion survivability
- Various minion-specific modifiers for specialized builds

## Strengths and Innovations

### Excellent Rule Economy
- Only 21/75 rules used (28% utilization)
- Leaves significant room for user customization
- Highly efficient condition combinations

### Smart Progression Design
- Level-appropriate requirements prevent unrealistic filtering
- Progressive strictness matches player needs
- Smooth transition from leveling to endgame

### Comprehensive Coverage
- Handles all major item categories (weapons, armor, jewelry, idols)
- Special handling for unique items and edge cases
- Future-proofed with broad affix coverage

## Areas for Improvement

### Potential Enhancements
1. **Weaver's Will Integration**: Could add thresholds for Weaver's Will items
2. **More Strictness Options**: Could implement multiple strictness variants
3. **Market Value Consideration**: Could add rules for valuable trading items

### Minor Limitations
1. **Fixed Tier Requirements**: T6+ requirements may be too strict for some players
2. **Limited Jewelry Focus**: Less specialized jewelry filtering compared to weapons
3. **No Corruption Scaling**: Doesn't adjust for high-corruption endgame content

## Learning Insights for Generation System

### Critical Patterns to Replicate
1. **Progressive Level Gating**: Essential for realistic character progression
2. **Weapon Subtype Progression**: Different subtypes for different level ranges
3. **Combined Affix Logic**: Using both individual and combined affix values
4. **Defensive Priority Balance**: Health and resistances as foundational requirements

### Generation System Requirements
1. **Subtype Database**: Must have complete weapon subtype mappings
2. **Affix Tier Understanding**: T6+ as premium threshold, T7+ as exceptional
3. **Level Bracket Logic**: Implement 20-35, 36-65, 66+ progression stages
4. **Build Archetype Templates**: Minion builds need specific affix prioritization

This filter serves as an excellent template for minion-based builds and demonstrates sophisticated rule economy while maintaining comprehensive item coverage.