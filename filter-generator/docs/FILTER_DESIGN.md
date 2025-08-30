# Filter Design Guide

This document describes the principles and processes for designing effective loot filters for Last Epoch.

## Core Filter Philosophy

Effective loot filters translate build priorities into focused item acquisition strategies while respecting technical constraints and rule evaluation mechanics.

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
- **IMPORTANT**: Currency and crafting materials (runes/glyphs) should NOT be added to loot filters - they are handled by the game's built-in systems
- **Implementation**: Focus on equipment and unique items only

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

---

## Special Cases and Other Information

### Item Type Distinctions

**CRITICAL: Unique vs Legendary Items**
- **Unique Items**: Orange items with fixed names and special properties - these are base items we filter by LP/WW
- **Legendary Items**: Orange items that were unique items with LP, where affixes were added using that LP - now "completed"
- **NEVER MIX**: Unique and Legendary items have different rarity values and should have separate rules
- **Legendary Rule**: Always show all Legendary items regardless of build (they're completed unique items with added affixes)

**Unique Item Categories**

**Cocooned Items**
- **Identification**: Unique items prefixed with "Cocooned " 
- **Behavior**: Generate random unique items when used
- **Value Assessment**: Highly variable due to random nature
- **Filter Recommendation**: Generally worth showing and picking up regardless of build
- **Rationale**: Potential for any unique outcome makes them universally valuable

**Legendary Power (LP) Values**
- **System**: Unique items can roll with Legendary Power values (1-4 LP)
- **4 LP Items**: Extremely rare, always show regardless of item
- **3 LP Items**: Very rare, always show regardless of item  
- **2 LP Items**: Show based on item rarity and build relevance
- **1 LP Items**: Show only if item is build-relevant or high-value
- **0 LP Items**: Show only for semi-strict filters or build-specific items
- **Implementation**: LP value requirements vary by unique item rarity and build needs

**Weaver's Will Items**
- **System**: Special power type similar to Legendary Power (5-25 range)
- **Value Threshold**: 15+ Weaver's Will is considered high-value (matches database)
- **Filter Recommendation**: Items with 15+ Weaver's Will should be shown
- **Build Consideration**: Value may vary based on specific build requirements
- **Implementation**: Use Weaver's Will thresholds from database, not hardcoded values

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

### Tier 1: Always Show (Before Any Hide Rules)
- **4 LP Uniques**: Highest priority, emphasized with beams/sounds
- **3 LP Uniques**: Very high priority, emphasized  
- **High-value uniques**: From database (15+ Weaver's Will), premium display
- **Build-specific uniques**: Items mentioned in build, always show
- **Legendary items**: Always show all Legendary items

### Tier 2: Hide Rules & Filtering
- **Normal item hiding**: Hide normal (white) items
- **Class restrictions**: Hide items for other classes (won't affect Tier 1 items)
- **Set item filtering**: Hide sets on strict+ unless build-specific

### Tier 3: Show Rules by Priority
- **2 LP uniques**: Show based on item rarity and build relevance
- **1 LP uniques**: Show only if build-relevant or valuable
- **Primary equipment**: Core weapon/armor types with build-specific affixes
- **Specialized equipment**: Secondary weapons, accessories with targeted affixes
- **Idol rules**: Separate rules for idol-specific affixes (never mix with equipment)

### Tier 4: Endgame Focus (Optional)
- **0 LP uniques**: Show only on semi-strict or if build-specific
- **Common rarity filter**: Hide common uniques on strict+ (unless above rules apply)
- **Quality thresholds**: Affix tier requirements based on strictness level

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

## Visual & Audio Theming

**Color Organization by Item Rarity:**
- **Normal Items**: White (0) - typically hidden
- **Magic Items**: Blue (12) - basic quality items
- **Rare Items**: Yellow (3) - moderate quality items  
- **Unique Items**: Orange (5) - special named items
- **Exalted Items**: Purple (10) - high-tier crafted items
- **Set Items**: Green (16) - set piece items
- **Legendary Items**: Hot Pink (9) - completed unique items with LP affixes
- **Valuable/Premium**: Red (7) or dominant colors for highest priority items

**Rule Naming Conventions:**
- **Never prefix with "Hide" or "Show"** - the game adds this automatically
- Use descriptive names like "Normal Items", "4 LP Uniques", "Defensive Gear"
- Avoid redundant phrases that duplicate the rule type display

**Emphasis & Effects:**
- **Beams**: Use sparingly for only the most valuable items (4 LP, ultra-rare uniques)
- **Sounds**: Reserve for items that require immediate attention
- **Emphasis**: Don't apply to every rule - create clear hierarchy
- **Implementation**: Not every rule needs visual/audio effects - use strategically

**Leveling vs Endgame:**
- **Default**: Focus on endgame filtering without level-based rules
- **Only add level brackets when explicitly requested** for leveling builds
- Endgame filters assume level-appropriate content and focus on quality over progression

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