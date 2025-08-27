# Primalist - Wolf Carnage Filter Analysis

## Build Overview

**Build Archetype**: Primalist Beast Master focusing on wolf companion builds with melee/companion synergy  
**Rule Count**: 25/75 rules (moderate usage - 33% of available rules)  
**Strategy**: Balanced companion/melee hybrid filter with comprehensive coverage  
**Efficiency**: Good - efficient rule usage while maintaining broader coverage than ultra-focused filters

## Filter Strategy

### Core Philosophy
This filter implements a **companion-focused melee hybrid** approach that prioritizes both wolf companion effectiveness and melee combat stats. Unlike pure minion builds, it recognizes that Primalist beast builds often involve direct combat alongside companions.

### Key Design Patterns

#### 1. Aggressive Idol Filtering (Rules 1-4)
- **Rule 1**: Hide all idol sizes initially (similar to other filters)
- **Rules 2-4**: Show idols with specific affix combinations
  - **Rule 3**: Small idols (1x1, 2x1, 1x2) with T3+ affixes and 2+ relevant affixes
  - **Rule 4**: Large idols (1x4, 2x2, 4x1, 1x3, 3x1) with more permissive requirements

**Key Affix Pattern** (909, 854, 853, 828, 829, etc.):
- Much larger affix array than previous filters (115+ different affix IDs)
- Includes both companion-specific and melee-specific affixes
- Shows hybrid nature of the build (not pure minion like Frog build)

#### 2. Quality-Based Item Filtering (Rule 2)
- **Hide**: Normal, Magic, and Rare items globally
- **Show**: Only Exalted and higher quality items
- Similar to Frog Minions but less extreme (doesn't hide Exalted)

*Design Insight: More permissive than Frog build but stricter than Necromancer builds*

#### 3. Hybrid Stat Focus
**Different from Pure Minion Builds**:
- Includes melee damage stats alongside companion stats
- Physical damage, attack speed, and melee-specific modifiers
- Defensive stats for direct combat (not just companion survivability)

**Compared to Necromancer Filters**:
- Less weapon-type specific (Necromancer focuses on axes/sceptres)
- More diverse affix requirements reflecting hybrid playstyle
- Lower tier requirements (T3+ vs T6+) but requires more affixes per item

## Technical Implementation Analysis

### Advanced Idol Logic
```xml
<comparsionValue>3</comparsionValue>         <!-- T3+ requirement -->
<minOnTheSameItem>2</minOnTheSameItem>       <!-- Need 2+ relevant affixes -->  
<combinedComparsionValue>6</combinedComparsionValue>  <!-- Combined T6+ value -->
```

**Pattern Analysis**:
- **More Permissive Tiers**: T3+ vs T6+ from Necromancer builds
- **Higher Affix Count**: Requires 2+ affixes vs 1+ for specialized builds  
- **Balance Strategy**: Lower individual requirements, higher combination requirements

### Affix Diversity
**Massive Affix Array** (115+ IDs in idol rules):
- **Companion Stats**: Wolf damage, companion health, companion attack speed
- **Melee Stats**: Physical damage, attack speed, melee critical stats  
- **Hybrid Stats**: Stats that benefit both playstyles
- **Defensive Stats**: Health, resistances, armor for direct combat

*Design Insight: Reflects complexity of hybrid builds that don't fit single categories*

## Build Requirements Analysis

### Hybrid Scaling Focus
**Primary**: Companion effectiveness + personal melee combat
**Secondary**: Physical damage type (both personal and companion)
**Defensive**: Direct combat survivability (not minion tanking strategy)

### Stat Priority Inference
1. **Companion Stats**: Wolf/beast specific modifiers
2. **Physical Damage**: Both personal and companion scaling
3. **Melee Combat**: Attack speed, melee damage, melee critical strikes
4. **Survivability**: Health, resistances, armor for melee range combat

## Comparison with Other Build Types

### vs. Necromancer Minion Builds
| Aspect | Necromancer | Wolf Carnage |
|--------|-------------|--------------|
| **Playstyle** | Pure minion support | Hybrid melee + companion |
| **Tier Requirements** | T6+ (strict) | T3+ (permissive) |
| **Affix Count** | 1+ per item | 2+ per item |
| **Weapon Focus** | Specific types | More flexible |
| **Rule Count** | 21-23 rules | 25 rules |
| **Complexity** | Specialized | Hybrid complexity |

### vs. Frog Minions (Pure Minion)
| Aspect | Frog Minions | Wolf Carnage |
|--------|--------------|--------------|
| **Focus** | Ultra-specialized | Hybrid approach |
| **Item Volume** | Minimal | Moderate |
| **Stat Diversity** | Single type | Multiple types |
| **Rule Efficiency** | Maximum | Good |

## Strengths and Innovations

### Hybrid Build Support
- **Dual Scaling**: Accommodates both companion and personal combat
- **Flexibility**: Works with various Primalist build variations
- **Balanced Requirements**: Not too strict or too permissive

### Advanced Filtering Logic
- **Tiered Complexity**: Different requirements for different idol sizes
- **Combined Value Logic**: Uses both individual and combined affix thresholds
- **Quality Gating**: Focuses on higher-tier items only

### Build Adaptability
- **Multiple Playstyles**: Can adapt to pure companion or hybrid approaches
- **Stat Variety**: Large affix array covers many build variations
- **Progression Friendly**: T3+ requirements accessible throughout progression

## Areas of Interest

### Rule Count Usage
- **25/75 rules**: Moderate usage leaving room for customization
- **Balanced Approach**: More rules than ultra-focused, fewer than comprehensive filters
- **Efficiency**: Good coverage per rule used

### Quality vs Quantity Trade-off
- **Higher Quality**: Only shows exalted+ items
- **More Affixes Required**: 2+ relevant affixes per item
- **Balanced Volume**: Moderate item showing (not overwhelming, not starved)

## Learning Insights for Generation System

### Hybrid Build Patterns
1. **Multiple Scaling Types**: Need to support builds that scale multiple ways
2. **Flexible Requirements**: Different tier/affix combinations vs rigid requirements
3. **Stat Diversity**: Large affix arrays needed for hybrid builds
4. **Quality Gating**: Some builds prefer fewer higher-quality items

### Generation System Requirements
1. **Hybrid Templates**: Build archetypes that aren't purely one type
2. **Affix Flexibility**: System must handle builds with diverse stat needs
3. **Quality vs Quantity Settings**: Users might prefer strict quality filters
4. **Complexity Management**: Hybrid builds need more rules but must stay under limit

### Meta Build Format Implications
For hybrid builds like Wolf Carnage:
```json
{
  "name": "Wolf Carnage",
  "class": "Primalist",
  "mastery": "Beast Master", 
  "primarySkill": "Summon Wolf",
  "secondarySkills": ["Maul", "Swipe"],
  "uniqueItems": ["The Fang"]
}
```

System would need to recognize:
- **Hybrid Nature**: Wolf + melee skills = hybrid scaling
- **Dual Stat Priorities**: Both companion and melee stats needed
- **Quality Preferences**: Beast Master builds might prefer fewer, higher-quality items
- **Flexible Weapons**: Not as weapon-type restricted as spell builds

This filter demonstrates that effective filters must handle complex hybrid builds that don't fit into single categories, requiring sophisticated affix selection and balanced requirements.