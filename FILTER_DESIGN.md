# Last Epoch Loot Filter Design Guide

## Core Filter Philosophy

Effective loot filters translate build priorities into focused item acquisition strategies while respecting the game's technical constraints and rule evaluation mechanics.

---

## Critical Constraints

### Technical Limitations
- **75-Rule Maximum**: Hard limit that cannot be exceeded
- **Rule Evaluation Order**: Top-to-bottom processing with immediate termination on match
- **Early Termination**: First matching SHOW or HIDE rule ends evaluation for that item
- **Efficiency Focus**: Use only as many rules as needed - fewer rules can be better

### Strategic Implications
- **Optimization Required**: Rules must be efficient and well-prioritized
- **Order Matters**: Most important rules should appear first
- **Rule Efficiency**: Complex conditions should be consolidated when possible

---

## Filter Strictness Levels

Design filters with adjustable strictness to match different content and preferences:

### Semi-Strict Filters
- **Philosophy**: Show potential upgrades and useful alternatives
- **Coverage**: Broader item type inclusion with moderate affix requirements
- **Use Case**: Campaign progression, early endgame, experimenting with builds
- **Item Volume**: Higher volume, more permissive thresholds

### Strict Filters
- **Philosophy**: Focus on clear upgrades and high-value items
- **Coverage**: Targeted item types with specific affix combinations
- **Use Case**: Established builds, monolith progression, moderate optimization
- **Item Volume**: Moderate volume, focused on build priorities

### Very Strict Filters
- **Philosophy**: Only show significant upgrades and perfect items
- **Coverage**: Minimal item types with high-tier affix requirements
- **Use Case**: Min-maxed builds, high corruption pushing, endgame optimization
- **Item Volume**: Low volume, exceptional items only

---

## Filter Design Framework

## Universal Foundation Rules

Start every filter with these essential categories:

### Currency & Keys (Always Show)
- **Generic currency rules**: Covers all monetary items automatically
- **Key items**: Quest items, dungeon keys, special materials
- **Crafting essentials**: Shards, glyphs, runes regardless of build
- **Implementation**: Use broad SHOW rules that require minimal maintenance

### Ultra-Rare Items (Always Show)
- **Exceptional uniques**: Items with extreme rarity or universal value
- **Perfect crafting bases**: T20+ items with ideal affix combinations
- **Market valuable items**: High-demand items regardless of personal use

## Build-Specific Prioritization

Organize remaining rules by build priority using CLASS_BUILD_DEFINITION principles:

### Primary Damage Priority
Based on build's core ability and scaling:

**Weapon & Core Scaling**
- **Primary weapon types**: Matching your damage skill requirements
- **Damage type scaling**: Physical, elemental, minion, or hybrid focus
- **Skill-specific modifiers**: +skill levels, specialized damage increases
- **Critical scaling stats**: Critical strike, attack speed, cast speed

**Strictness Adaptation:**
- **Semi-Strict**: Include alternative weapon types, lower tier requirements
- **Strict**: Focus on optimal weapon types, moderate tier requirements
- **Very Strict**: Only best-in-slot weapons, high tier requirements

### Defensive Priority
Based on chosen defensive strategy from DEFENSIVE_STRATEGIES:

**Primary Defense Scaling**
- **Armor builds**: Armor rating, health, physical resistance
- **Dodge builds**: Dodge rating, movement speed, dexterity
- **Block builds**: Block chance, block effectiveness, shield bases
- **Hybrid approaches**: Balanced coverage with reduced individual focus

**Resistance Strategy**
- **Universal coverage**: All resistance types prioritized equally
- **Over-cap planning**: Higher resistance tiers for endgame content
- **Content adaptation**: Adjust based on encountered damage types

**Strictness Adaptation:**
- **Semi-Strict**: Accept lower resistance tiers, include backup defenses
- **Strict**: Require resistance caps, focus on primary defense type
- **Very Strict**: Demand over-cap resistances, perfect defensive combinations

### Secondary Priorities

**Support & Utility**
- **Movement speed**: Universal priority for all builds (30%+ target)
- **Resource management**: Build-specific mana, rage, or other resources
- **Quality of life**: Pickup radius, stun avoidance, convenience stats

**Idol Specialization**
- **Build-specific affixes**: Matching primary damage and defense types
- **Size optimization**: Efficient idol layouts for maximum benefit
- **Tier requirements**: Adjusted based on filter strictness level

---

## Rule Organization Strategy

## Priority Hierarchy

Structure rules using this strategic order:

### Tier 1: Foundation
- Currency and key items (generic SHOW rules)
- Ultra-rare uniques and perfect items
- Critical build-enabling items

### Tier 2: Core Build Items
- Primary weapon types with core scaling
- Essential defensive gear for chosen strategy
- Must-have resistance coverage

### Tier 3: Optimization Items
- Secondary weapon types and alternatives
- Upgrade paths for current gear
- Specialized build enhancers

### Tier 4: Filtering & Cleanup
- Item type exclusions for irrelevant categories
- Quality thresholds based on strictness level
- Final catch-all rules for remaining items

## Condition Optimization

**Efficiency Techniques:**
- **Multiple affixes**: Combine related affixes in single rules
- **Item type grouping**: Group similar item categories together
- **Value thresholds**: Set appropriate minimum roll requirements
- **Progressive strictness**: Layer rules from permissive to restrictive

**Advanced Consolidation:**
- **Logical grouping**: Combine offensive OR defensive conditions
- **Tier-based filtering**: Different highlighting for different quality levels
- **Exception handling**: Account for edge cases without rule waste

---

## Strictness Implementation

## Semi-Strict Implementation
- **Affix Requirements**: Lower tier thresholds (T3+ acceptable)
- **Item Coverage**: Include alternative and backup gear types
- **Resistance Goals**: Accept 75% resistance minimums
- **Volume Expectation**: Higher item visibility for learning and flexibility

## Strict Implementation
- **Affix Requirements**: Moderate tier thresholds (T5+ preferred)
- **Item Coverage**: Focus on optimal gear types with alternatives
- **Resistance Goals**: Target over-cap resistances (85%+)
- **Volume Expectation**: Moderate item visibility focused on clear upgrades

## Very Strict Implementation
- **Affix Requirements**: High tier thresholds (T7+ required)
- **Item Coverage**: Only best-in-slot item types
- **Resistance Goals**: Demand high over-cap resistances (90%+)
- **Volume Expectation**: Minimal item visibility, only exceptional pieces

---

## Quality Assurance Framework

## Filter Validation Process
1. **Rule efficiency check**: Ensure minimal rule usage for maximum coverage
2. **Build alignment verification**: Confirm filter matches CLASS_BUILD_DEFINITION priorities
3. **Strictness consistency**: Verify all rules match intended strictness level
4. **Currency coverage**: Confirm universal items are properly included

## Testing Methodology
- **Build simulation**: Test against theoretical perfect gear for your build
- **Strictness validation**: Verify appropriate item volumes for chosen strictness
- **Progression testing**: Ensure filter works across different character stages
- **Edge case handling**: Verify unusual but valuable combinations are covered

## Performance Metrics
- **Upgrade frequency**: How often filter shows meaningful improvements
- **Volume appropriateness**: Item count matches strictness expectations
- **Priority accuracy**: Most valuable items appear first in evaluation

---

## Common Filter Design Mistakes

### Structural Errors
1. **Rule inefficiency**: Using more rules than necessary
2. **Priority confusion**: Important items filtered out by earlier generic rules
3. **Strictness inconsistency**: Mixed strictness levels within single filter

### Build Integration Issues
1. **Priority mismatch**: Filter doesn't reflect build's actual needs
2. **Defense undervaluation**: Insufficient focus on survivability requirements
3. **Currency oversight**: Missing universal item coverage

### Progression Problems
1. **Static strictness**: Filter doesn't match current character needs
2. **Over-optimization**: Missing upgrade paths due to excessive restrictions
3. **Under-optimization**: Showing too many items for current progression stage

**Remember**: An effective filter should match your build's priorities while providing the right item volume for your current progression stage and preferences.