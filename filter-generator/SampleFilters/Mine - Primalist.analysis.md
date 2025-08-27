# Mine - Primalist Filter Analysis

## Build Overview

**Build Archetype**: Generic multi-purpose Primalist build with broad coverage
**Rule Count**: 12/75 rules (very efficient usage - 16% of available rules)
**Strategy**: Universal catch-all filter for any Primalist playstyle
**Efficiency**: Ultra-high - minimal rule usage for maximum coverage

## Filter Strategy

### Core Philosophy
This filter implements a **universal Primalist strategy** designed to work across multiple builds and playstyles. The "Mine" prefix suggests this is a personal/custom filter designed for flexible gameplay rather than build-specific optimization.

### Key Design Patterns

#### 1. Global Hide Foundation (Rule 1)
- **Rule 1**: Hide everything by default (no conditions - global hide)
- **Strategy**: Ultra-strict baseline requiring explicit SHOW rules for all items
- **Philosophy**: "Nothing shows unless specifically allowed"

#### 2. Progressive Quality Tiers
**Tier Structure**:
- **T7+ Affixes** (Rule 4): Premium drop-only affixes with sound notification
- **T6+ Generally Nice** (Rule 5): Good affixes for any build
- **T6+ Specialized Stats**: Thorns (Rule 6), Minions (Rule 7), Primalist-specific (Rule 8)

#### 3. Multi-Build Support Architecture
The filter supports multiple archetypes through specialized affix groups:
- **General Good Idols** (Rule 2): Universal idol stats for any build
- **Minion Idols** (Rule 3): Dedicated minion support
- **Thorns Affixes**: Specialized defensive scaling
- **Minion Affixes**: Core minion scaling stats
- **Primalist Affixes**: Class-specific scaling stats

## Technical Implementation Analysis

### Rule Efficiency Insights
**12 Rules for Universal Coverage**: Extremely efficient design
- **Global Hide**: 1 rule eliminates need for multiple hide rules
- **Consolidated Affixes**: Large affix arrays reduce rule count
- **Tier-Based Organization**: Clear quality progression with minimal rules

### Advanced Features
- **Sound Notifications**: T7+ affixes get audio alerts (SoundId: 4)
- **Beam Effects**: High-value uniques get visual beams (BeamId: 8)
- **Custom Names**: All rules have descriptive nameOverride values
- **Advanced Logic**: T6+ and T7+ rules use advanced=true

### Filter Schema Version
**lootFilterVersion: 5** - Uses latest schema with enhanced features:
- SoundId and BeamId support
- Order field for rule processing
- Enhanced deprecated field handling

## Affix Analysis

### Massive Affix Coverage (Rule 4 - T7+)
**522 different affix IDs** in the T7+ rule - comprehensive coverage including:
- All damage types and scaling mechanisms
- Universal defensive stats
- All class-specific scaling options
- Minion, spell, melee, and hybrid affixes
- Utility and convenience stats

### Specialized Affix Categories

#### General Good Idols (Rule 2)
Affixes: 846, 828, 853, 925, 929, 833, 866, 108, 132, 862, 430, 105, 107
- **Pattern**: Mixed damage types and utility stats
- **Philosophy**: Stats useful for most builds regardless of archetype

#### Minion Idols (Rule 3)  
Affixes: 146, 147, 148, 151, 152, 154, 160, 161, 171, 173, 226
- **Pattern**: Pure minion-focused scaling
- **Coverage**: All minion damage, health, and utility stats

#### Generally Nice T6+ (Rule 5)
Core universal stats: 28, 50, 501-504, 25, 52, 36, etc.
- **Focus**: Health, resistances, movement speed, core defenses
- **Philosophy**: Stats every character needs regardless of build

#### Build-Specific T6+ Categories
- **Thorns** (96, 95): Specialized defensive scaling
- **Minions** (26, 98, 540, etc.): Core minion scaling stats
- **Primalist** (336, 347, 348, etc.): Class-specific abilities and scaling

## Unique Item Strategy

### Three-Tier Unique System
1. **20+ Weaver's Will**: Premium high-value uniques with sound/beam
2. **4 LP (Legendary Potential)**: Exceptional crafting bases with sound/beam  
3. **All Other Uniques/Sets/Legendaries**: Standard display

### Equipment Type Filtering
**Hide Rule 9**: Explicitly hides equipment types not typically used by Primalists:
- **Ranged**: Bow, Quiver
- **Caster**: Catalyst, Wand, Staff
- **Unsuitable Melee**: Daggers, Sceptres
- **Two-Handed Options**: Various 2H weapons (suggesting 1H+Shield preference)

## Actual Build Architecture (Corrected Analysis)

### Dual-Character Filter Design
**Reality**: This filter supports **two distinct builds** for different characters:

#### Build 1: Beastmaster Summoner
- **Primary Strategy**: Minion-based damage with 3 variants
- **Base Build**: Summon Bear with personal combat support
- **Item Variants**:
  - **Raptor Build**: Enabled by "Naal's Tooth" 
  - **Frog Build**: Enabled by "Chorus of the Aurok" (skill normally unavailable)
- **Support Skills**: Swipe (culling/shred), Earthquake (bear scaling), Warcry/Maelstrom (buffs)

#### Build 2: Druid Thorns  
- **Primary Strategy**: Damage reflection and "damage dealt to attackers"
- **Form Swapping**: Spriggan Form (mapping) + Werebear Form (bosses)
- **Core Mechanic**: Damage reflection scaling with block/attunement
- **Build-Enabling Item**: "Thicket of Blinding Light" (makes reflection viable for bosses)

### Equipment Compatibility Analysis
**Hidden Equipment Types** reveal shared constraints:
- **Both builds use**: 1H weapons + shield (melee focus)
- **Neither build uses**: Ranged weapons (bow/quiver), pure caster gear (catalyst/wand/staff)
- **Shared Defense**: Block-based survivability with armor backing

### Multi-Build Filter Architecture
**Filter Design Excellence**:
- **Shared Categories**: Universal stats (health, resistances, movement) work for both
- **Specialized Sections**: Separate minion and thorns affix groups
- **Global Coverage**: T7+ rule covers all possible scaling needs
- **Efficient Design**: 12 rules support 2 complete builds + variants

## Learning Insights for Generation System

### Multi-Build Filter Design Principles
**Key Discovery**: Single filter can efficiently support **multiple distinct builds** through:
- **Dual-Character Optimization**: One filter for multiple characters
- **Shared Equipment Strategy**: Both builds use 1H+Shield, compatible stat priorities
- **Specialized Categories**: Separate sections for different scaling types (minion vs thorns)
- **Universal Foundation**: Core stats (health, resistances) work for all builds

### Item-Enabled Build Variants
**Critical Insight**: Some builds require specific uniques to function:
- **"Chorus of the Aurok"**: Enables Frog summoning (skill doesn't normally exist)
- **"Thicket of Blinding Light"**: Makes reflection damage scale for endgame content
- **"Naal's Tooth"**: Enables Raptor variant within same mastery
- **Pattern**: Base build works alone, items enable additional strategies

### Advanced Filter Architecture Patterns
**12 Rules Supporting 5+ Build Configurations**:
- **Global Hide Foundation**: More efficient than multiple specific hide rules
- **Massive Affix Coverage**: 522 affixes in T7+ rule = universal compatibility
- **Tier-Based Progression**: T7+/T6+ system works across all build types
- **Audio/Visual Enhancement**: Premium alerts for important items

### Form-Swapping Build Recognition
**New Pattern**: Builds that use different skills for different content:
- **Spriggan Form**: Mapping and AoE clear with thorn shield
- **Werebear Form**: Single target and boss survivability  
- **Auto-Proc Mechanics**: Forms trigger other skills automatically
- **Content Optimization**: Different tools for different challenges

### Schema Version 5 Advanced Features
**Technical Evolution**:
- **SoundId/BeamId**: Audio and visual alerts for priority items
- **Order Field**: Explicit rule processing sequence control
- **Enhanced Deprecated Handling**: Backward compatibility with field evolution
- **Advanced Logic**: Complex condition evaluation support

## Advanced Filter Techniques Demonstrated

### Audio/Visual Enhancement
- **Priority Sounds**: T7+ affixes get audio alerts for immediate attention
- **Beam Effects**: High-value uniques get visual beams for visibility
- **Color Coding**: Different colors for different quality/type tiers

### Rule Organization
- **Order Field**: Rules processed in specific sequence (0-12)
- **Descriptive Naming**: All rules have clear nameOverride values
- **Logical Grouping**: Related affixes grouped into coherent categories

## Filter Comprehension Test Results

### What This Analysis Got Right ✅
- **Filter Architecture**: Correctly identified global hide strategy and tier-based progression
- **Technical Features**: Properly documented audio/visual enhancements and schema version 5
- **Rule Efficiency**: Accurately noted the exceptional efficiency (12 rules for comprehensive coverage)
- **Equipment Filtering**: Correctly identified hidden weapon types and their implications
- **Multi-Archetype Recognition**: Properly identified that multiple build types were supported

### What This Analysis Missed ❌
- **Dual-Character Purpose**: Failed to recognize this was designed for multiple characters
- **Item-Enabled Variants**: Completely missed that specific uniques enable entire build strategies
- **Form-Swapping Mechanics**: Didn't understand alternating skill usage for different content
- **Reflection Scaling**: Surface-level understanding of thorns mechanics vs actual reflection system
- **Build-Specific Item Requirements**: Missed critical item dependencies

### Key Learning Discoveries 🎓

#### Multi-Character Filter Design
**New Understanding**: Filters can be optimized for multiple characters simultaneously
- More efficient than separate filters per character
- Requires careful balance of shared vs specialized stats
- Equipment overlap crucial for feasibility

#### Item-Enabled Build Mechanics  
**Critical Insight**: Some builds are impossible without specific unique items
- Items can enable skills that don't normally exist (Chorus of the Aurok → Frog summoning)
- Items can make mechanics viable for endgame (Thicket of Blinding Light → boss-viable reflection)
- Build variants within same mastery enabled by different items

#### Content-Specific Skill Usage
**New Pattern**: Advanced builds use different skills for different content types
- Mapping skills vs boss skills
- Form swapping for optimization
- Auto-proc skill chains triggered by forms

This test perfectly demonstrates the complexity gap between filter analysis and actual build understanding, highlighting the importance of user-provided build context and item-dependency recognition in filter generation systems.

This filter demonstrates sophisticated multi-build design principles, efficiently covering two distinct Primalist builds with multiple variants while maintaining exceptional rule efficiency and user-friendly features.