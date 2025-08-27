# Primalist - Frog Minions Filter Analysis

## Build Overview

**Build Archetype**: Primalist shaman focusing on frog/toad minions (Summon Frog specialization)  
**Build Reference**: https://www.lastepochtools.com/planner/oy5PRmao  
**Strategy**: Ultra-focused minion build with aggressive item type filtering  
**Philosophy**: Minimalist approach - show only items directly supporting the build

## Filter Strategy

### Core Philosophy
This filter implements an **extreme focus** strategy that aggressively hides most item categories and focuses exclusively on items that directly benefit the frog minion archetype. It prioritizes quality over quantity by showing very few items but ensuring they are highly relevant.

### Key Design Patterns

#### 1. Aggressive Base Filtering (Rules 1-3)
- **Rule 1**: Hide Normal, Magic, and Rare items globally (very strict baseline)
- **Rule 2**: Hide items for all other classes (Mage, Sentinel, Acolyte, Rogue)
- **Rule 3**: Hide numerous weapon types not used by the build

**Hidden Weapon Types**:
```
ONE_HANDED_AXE, ONE_HANDED_DAGGER, ONE_HANDED_MACES, ONE_HANDED_SCEPTRE, 
WAND, TWO_HANDED_AXE, TWO_HANDED_MACE, TWO_HANDED_SPEAR, TWO_HANDED_STAFF, 
TWO_HANDED_SWORD, QUIVER, SHIELD, CATALYST, BOW
```

*Design Insight: Process of elimination - hide everything not needed rather than showing what is needed*

#### 2. Minion-Focused Affix Targeting (Rule 4+)
**Primary Affix Set** (673-679, 710-714):
- Minion-specific damage and utility affixes
- T1+ requirement (very permissive on tier, strict on affix type)
- Focus on minion effectiveness over personal character stats

*Design Insight: Values affix relevance over affix tier - would rather have T1 minion damage than T7 spell damage*

#### 3. Implied Weapon Strategy
By elimination, the build likely uses:
- **Claws** (typical Primalist minion weapon)
- **Possibly specific staves or other Primalist weapons**

The extensive weapon hiding suggests very specific weapon type requirements.

## Technical Implementation

### Ultra-Minimalist Rule Usage
- Estimated **4-8 rules total** (exact count not fully visible in sample)
- Extremely efficient rule economy
- Leaves 67+ rules available for user customization

### Filtering Philosophy Differences

**Compared to Necromancer Filter**:
| Aspect | Necromancer | Frog Minions |
|--------|-------------|--------------|
| Base Items | Progressive hiding | Hide most immediately |
| Item Volume | Moderate | Very low |
| Affix Tiers | T6+ requirements | T1+ (permissive) |
| Weapon Types | Multiple types | Single type (implied) |
| Strictness | Progressive | Constant high |

## Build Requirements Analysis

### Minion Focus Affixes (673-679, 710-714)
Based on the affix ID ranges, this likely includes:
- **Minion Damage**: Core scaling for frog minions
- **Minion Health**: Frog survivability
- **Minion Attack Speed**: Frog DPS optimization
- **Poison/Nature Damage**: Thematic damage type support
- **Minion Utility**: Specialized frog-specific modifiers

### Defensive Strategy (Inferred)
The filter shows minimal defensive filtering, suggesting:
1. **Dodge/Avoidance Focus**: Primalist mobility-based defense
2. **Minion Tank Strategy**: Let frogs absorb damage while staying mobile
3. **Gear Minimalism**: Rely on skills/passives rather than gear for defense

## Strengths and Innovations

### Extreme Focus Benefits
1. **No Decision Fatigue**: Very few items shown, all highly relevant
2. **Clear Build Identity**: Obvious what the build is trying to achieve
3. **Minimal Visual Clutter**: Clean screen during gameplay
4. **Future-Proof**: Won't show items that become irrelevant

### Efficient Implementation
1. **Minimal Rule Count**: Leaves maximum room for customization
2. **Clear Logic**: Easy to understand and modify
3. **Performance Optimized**: Fewer rules = faster evaluation

## Limitations and Trade-offs

### Potential Downsides

#### 1. Inflexibility
- **No Adaptation**: Same strictness at all levels and stages
- **Missing Upgrades**: May hide items that are actually better
- **No Fallback Options**: Limited alternative gear choices

#### 2. New Player Unfriendly
- **Learning Curve**: Doesn't show example of what stats might be useful
- **Progression Issues**: May struggle with gear during leveling
- **Build Dependency**: Only works if build is properly optimized

#### 3. Limited Scope
- **Single Build Focus**: Cannot adapt to build variations
- **No Multi-Character**: Not suitable for players with multiple builds
- **No Trading Value**: Ignores potentially valuable items for trading

## Comparison with Standard Approaches

### Rule Philosophy Differences

**Standard Progressive Filter**:
```
Level 1-35: Show many items with low requirements
Level 36-65: Show moderate items with medium requirements  
Level 66+: Show few items with high requirements
```

**Frog Minions Filter**:
```
All Levels: Show very few items with specific affix requirements
```

### When This Approach Works Best

**Ideal Scenarios**:
1. **Experienced Players**: Know exactly what they need
2. **Single Character Focus**: Not managing multiple builds
3. **Well-Funded Builds**: Have good starter gear already
4. **Specialized Archetypes**: Very narrow stat requirements

**Problematic Scenarios**:
1. **New Players**: Need to see examples of useful stats
2. **Experimental Builds**: Might want to try different approaches
3. **Resource Constraints**: Need to work with whatever drops
4. **Multi-Character Players**: Want broader item coverage

## Learning Insights for Generation System

### Alternative Design Patterns
1. **Exclusion-Based Filtering**: Hide unwanted rather than show wanted
2. **Affix-Centric Logic**: Focus on specific affix IDs over item types
3. **Constant Strictness**: No level progression, consistent requirements
4. **Specialized Archetype Support**: Ultra-focused single-build optimization

### Generation System Considerations

#### When to Use This Pattern
- **Highly Specialized Builds**: Frog minions, specific unique-dependent builds
- **Expert Mode Filters**: For experienced players who know their needs
- **Performance Builds**: Minimum visual clutter for competitive play

#### Implementation Requirements
1. **Comprehensive Item Type Database**: Need to know all weapon types to hide appropriately
2. **Specialized Affix Lists**: Build-specific affix ID collections
3. **Alternative Templates**: Different from progressive standard templates
4. **User Warnings**: Should warn users about high strictness level

### Meta Build Format Implications

This filter pattern suggests the meta build format needs:
1. **Hide Lists**: Ability to specify items to hide rather than show
2. **Constant Strictness Mode**: Option to disable level progression
3. **Affix-Only Filtering**: Focus on specific affixes regardless of item type
4. **Minimal Volume Settings**: Ultra-strict filtering options

This filter represents a completely different philosophy from standard progressive filters and demonstrates that effective filtering can take radically different approaches depending on build requirements and player preferences.