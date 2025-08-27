# Filter Data Missing Analysis

This document identifies data gaps discovered by cross-referencing sample filter usage against the available game database. Understanding these gaps is critical for successful filter generation.

## Analysis Summary

**Database Status (as of 2025-08-27)**:
- Affixes: 946 discovered, 0 missing (100% coverage) ✅
- **Affix Tier Data**: Complete T1-T8 modifier value ranges ✅ **NEW**
- **Database Indexes**: O(1) ID lookups and tag-based searching ✅ **NEW**
- **Affix Item Type Compatibility**: Still missing (0% coverage - **CRITICAL GAP**)
- Uniques: 440 items available (+37 from previous count)
- Sets: 47 items available  
- Subtypes: 0 discovered (0% coverage - **CRITICAL GAP**)
- Global Tags: 29 available with full tag indexing ✅

## Critical Missing Data

### 1. Equipment Subtype Information (CRITICAL)

**Issue**: The database shows 0 subtypes discovered, but sample filters extensively use subtype IDs.

**Evidence from Sample Filters**:
```xml
<!-- From Necromancer filter -->
<subTypes>
  <int>3</int>  <!-- Used with TWO_HANDED_AXE -->
  <int>4</int>  <!-- Used with ONE_HANDED_SCEPTRE and ONE_HANDED_AXE -->
  <int>9</int>  <!-- Used with high-level weapons -->
</subTypes>
```

**Impact**: 
- Cannot generate accurate weapon progression rules
- Unable to target specific base types within equipment categories
- Filter generation will fail for level-appropriate gear selection

**Required**: Complete mapping of subtype IDs to specific base types for all equipment categories.

**Additional Evidence from Extended Analysis**:
- **Wolf Carnage**: Uses complex subtype combinations across all equipment types
- **Thorns Filter**: Uses subtype filtering across 69 different rules (near maximum complexity)
- **All Necromancer Variants**: Consistently use subtypes 3, 4, and 9 for weapon progression
- **Pattern**: Subtypes appear to indicate item level/tier within equipment categories

### 2. Affix ID Mappings Inconsistencies

**Issue**: Analysis reveals discrepancies between expected affix functions in filters vs database names.

**Evidence**:

| Affix ID | Expected (from filter context) | Database Name | Status | Filter Evidence |
|----------|-------------------------------|---------------|---------|------------------|
| 28 | Health | "Movement Speed" | ❌ MISMATCH | All Necromancer filters |
| 36 | Movement Speed | "Hybrid Health" | ❌ MISMATCH | All armor rules |
| 25 | Fire Resistance | "Added Health" | ❌ MISMATCH | All defensive rules |
| 102 | Cast Speed | "Minion Spell and Bow Damage" | ❌ MISMATCH | All Necromancer builds |
| 643 | Minion Damage | "Minion Melee and Spell Damage" | ✅ PARTIAL MATCH | All minion builds |
| 43 | Healing Effectiveness | Unknown | ❓ NEEDS VERIFICATION | Thorns AllieSInk (T6+ primary stat) |
| 724 | Necrotic Damage | Unknown | ❓ NEEDS VERIFICATION | All Necromancer builds |
| 64 | Minion Attack Speed | Unknown | ❓ NEEDS VERIFICATION | All minion builds |
| 719 | Minion Health | Unknown | ❓ NEEDS VERIFICATION | All minion builds |
| 909 | Beast/Wolf Stat | Unknown | ❓ NEEDS VERIFICATION | Wolf Carnage (high priority) |

**Impact**: 
- Filter generation will target wrong stats
- Generated filters will be ineffective or incorrect
- Cannot trust affix ID mappings for automation

**Required**: Verification and correction of affix ID to name mappings.

### 3. Tier Information Understanding ✅ RESOLVED

**Previous Issue**: All affix entries showed `"tier":null`, but filters use tier-based comparisons extensively.

**Resolution**: Per `shared/docs/GAME_SYSTEMS.md`, affixes have tiers 1-8 and we don't need per-tier database information.

**Understanding from GAME_SYSTEMS.md**:
- **Tier Range**: Affixes come in Tiers 1-8 (with potential for future expansion)
- **Tier 1**: Lowest power level with minimal stat ranges
- **Tier 8**: Highest power level with maximum stat ranges
- **Non-Overlapping Values**: A low-roll higher tier is always better than a high-roll lower tier
- **Tiers 1-5**: Available through crafting (max T5) and item drops
- **Tiers 6-8**: Drop-only affixes that cannot be crafted (premium modifiers)

**Filter Implementation**:
```xml
<comparsionValue>6</comparsionValue>  <!-- T6+ drop-only premium requirement -->
<comparsionValue>3</comparsionValue>  <!-- T3+ semi-strict accessible requirement -->
<comparsionValue>7</comparsionValue>  <!-- T7+ very strict exceptional requirement -->
```

**Impact**: ✅ NO ACTION NEEDED - Tier system is well understood and doesn't require database expansion.

### 4. Item Type Compatibility Data (STILL CRITICAL)

**Issue**: Affix entries show empty `itemTypes[]` arrays, preventing proper item-affix matching.

**Evidence**:
```json
{"affix":643,"name":"Minion Melee and Spell Damage","props":{"itemTypes":[],"minValue":null,"maxValue":null}}
```

**Impact**:
- Cannot determine which affixes appear on which item types
- Unable to generate valid affix conditions
- May create impossible filter conditions

**Required**: Complete mapping of which affixes can appear on which item types.

**Current Status**: While affix tier data has been added, **item type compatibility is still missing**.

### 5. Affix Tier and Value Information ✅ PARTIALLY RESOLVED  

**Previous Issue**: All affixes showed null min/max values, preventing threshold calculations.

**Resolution**: Database now includes comprehensive tier-specific value data for affix modifiers.

**✅ Current Status - AVAILABLE**:
- **Tier-Specific Values**: Complete T1-T8 percentage ranges for each affix (e.g., T8 Movement Speed: 43% to 48%)
- **Proper Affix Names**: Human-readable names instead of IDs
- **Idol Compatibility**: Flags indicating which affixes can appear on idols
- **Value Range Structure**: Min-max ranges for each tier enabling threshold calculations

**❌ Still Missing**:
- **Item Type Compatibility**: Which equipment types each affix can appear on
- **Item Type Variations**: Different value ranges on different equipment types
- **Equipment-Specific Restrictions**: Implicit vs explicit affix availability

**Impact**: ✅ **MAJOR IMPROVEMENT** - Can now calculate appropriate T6+/T7+ thresholds and validate tier requirements. ❌ **Still cannot validate equipment compatibility** or generate item-type-specific rules.

## Moderate Priority Gaps

### 6. Cocooned Unique Identification

**Evidence from FILTER_DESIGN.md**:
- Cocooned items are prefixed with "Cocooned " in their names
- These are high-value items that should generally be shown

**Current Status**: No specific identification system for cocooned items in database.

**Impact**: Cannot implement special handling for cocooned items as recommended in design guide.

### 7. Legendary Potential Value Distributions

**Available**: Unique items list LP ranges (min/max)
**Missing**: Statistical distribution of LP values for filtering optimization

**Impact**: Cannot optimize LP threshold values for filter effectiveness.

### 8. Weaver's Will Information

**Available**: Basic Weaver's Will ranges (5-25) documented
**Missing**: Which items can roll Weaver's Will and typical value distributions

**Impact**: Cannot implement precise Weaver's Will filtering strategies.

## Data Verification Priorities

### Immediate Actions Required

1. **Verify Affix Mappings**: Cross-check affix IDs against actual in-game data
   - Use in-game testing or template file analysis
   - Correct database entries for core affixes (28, 36, 25, 102, etc.)

2. **Populate Subtype Data**: Complete mapping of equipment subtypes
   - Priority: Weapons (axes, sceptres, swords, etc.)
   - Secondary: Armor types, jewelry variations

3. **Tier Information**: ✅ **COMPLETED** - Database now contains complete T1-T8 tier data
   - All affixes have tier-specific modifier value ranges
   - Proper affix names and idol compatibility flags

4. **Item Type Compatibility**: ❌ **STILL NEEDED** - Affix-to-item-type relationships missing
   - Which affixes can appear on which equipment types still unknown
   - Item-type-specific value variations not available

### Testing Strategy

1. **Sample Filter Validation**: Use corrected data to validate against known working filters
2. **In-Game Verification**: Test generated filters against actual game behavior  
3. **Template File Cross-Reference**: Compare against template XML files for accuracy

## Workaround Strategies

Until data gaps are filled:

1. **Manual Override System**: Create manual mappings for critical affixes
2. **Conservative Generation**: Use only verified affix IDs in generated filters
3. **Template-Based Approach**: Extract patterns from working sample filters
4. **Incremental Validation**: Test each generated rule individually

## Data Collection Recommendations

### Primary Sources
1. **Template Files**: Extract subtype information from MasterTemplate1.xml
2. **In-Game Testing**: Manual verification of critical affix mappings
3. **Community Resources**: Last Epoch databases and community tools
4. **Game File Analysis**: Direct extraction from game data files if accessible

### Secondary Sources
1. **Sample Filter Analysis**: Reverse-engineer patterns from working filters
2. **User Testing**: Validate generated filters through user feedback
3. **Incremental Discovery**: Build database through iterative testing

## Impact on Filter Generation

**Current Status**: Significant progress made with complete affix tier data now available.

**✅ Major Improvements**:
- **Affix Value Thresholds**: Can now calculate appropriate T6+, T7+ thresholds for different strictness levels
- **Tier-Based Filtering**: Full support for tier-based progression (T1-T8) with accurate value ranges
- **Affix Name Resolution**: Proper human-readable names available instead of IDs only
- **Idol Compatibility**: Can determine which affixes work on idols vs equipment

**Remaining Critical Blockers**:
- **Item Type Validation**: Cannot determine which affixes appear on which equipment types
- **Equipment Subtypes**: Still cannot generate weapon/armor progression rules (0% coverage)  
- **Affix ID Verification**: Core stat mappings (28, 36, 25, 102) still need verification

**Current Capability Level**: **Basic+** - Can generate tier-aware filters with correct value thresholds, but **cannot validate equipment compatibility** or create progression rules.

**Next Milestone**: Complete subtype database to enable weapon progression and level-appropriate gear selection.

## Next Steps

**Updated Priorities (Post Affix Tier Data Addition)**:

1. **✅ COMPLETED**: Affix tier value ranges - All T1-T8 percentage ranges and affix names added
2. **HIGH PRIORITY**: Item Type Compatibility Mapping - Determine which affixes appear on which equipment types
3. **HIGH PRIORITY**: Implement Subtype Discovery - Extract subtype data from template files  
4. **HIGH PRIORITY**: Prioritize Affix Mapping Correction - Focus on core affixes 28, 36, 25, 102, 643, 724
5. **MEDIUM PRIORITY**: Create Manual Override System - Allow manual data corrections during development
6. **MEDIUM PRIORITY**: Establish Testing Framework - Validate data corrections against known working filters

**Current Target**: With tier data complete, achieving **item type compatibility mapping** and **subtype mapping** will enable generation of **intermediate-complexity functional filters** for primary archetypes (Necromancer minion, Primalist minion builds).

## Additional Findings from Extended Analysis (2025-08-27)

### New Filter Patterns Discovered

#### 1. Ultra-Complex Filters (69/75 Rule Usage)
**Evidence**: Thorns AllieSInk filter uses 69 rules
- **Challenge**: Approaching maximum complexity while staying within 75-rule limit
- **Pattern**: Global HIDE everything + specific SHOW exceptions
- **Specialization**: Single critical stat (Healing Effectiveness ID: 43) drives entire filter
- **Impact**: Generation system must support maximum complexity builds

#### 2. Hybrid Build Complexity  
**Evidence**: Toxic Wind / Skeleton Poisoner and Wolf Carnage filters
- **Multi-School Scaling**: Builds requiring both minion AND spell/melee stats
- **Affix Diversity**: 85+ different affix IDs needed for hybrid builds
- **Cross-Type Benefits**: Stats that benefit multiple skill types simultaneously
- **Challenge**: Priority balancing across different scaling mechanisms

#### 3. Consistent Minion Patterns
**Evidence**: All Necromancer minion variants (Arcane, Meat Shielder, Toxic Wind)
- **Universal Stats**: Core minion affixes (643, 102, 724, 64, 719) across ALL minion builds
- **Strategy Agnostic**: Same base stats work for direct damage, explosion, and hybrid strategies  
- **Mechanical Insight**: Different minion tactics use identical fundamental scaling

### Critical Data Gaps Expanded

#### 4. Specialized Mechanics Database
**New Requirements Identified**:
- **Healing Effectiveness** (43): Critical for Thorn builds but unknown in database
- **Beast/Wolf Stats** (909+): Primalist-specific scaling stats not documented
- **Seasonal Mechanics**: Season 3 adaptations require specific stat knowledge
- **Explosion/Sacrifice**: Minion sacrifice mechanics need stat understanding

#### 5. Rule Complexity Management
**System Requirements**:
- **Rule Budget Tracking**: Must warn when approaching 69+ rule usage
- **Complexity Tiers**: Different templates for simple (21 rules) vs complex (69 rules) builds
- **Expert Mode**: Advanced users need access to maximum complexity options
- **Validation**: System must prevent exceeding 75-rule hard limit

### Affix Priority Expansion

#### Build-Specific Critical Stats
- **All Minion Builds**: 643 (minion damage) is universally critical
- **Thorn Builds**: 43 (healing effectiveness) is primary scaling stat
- **Hybrid Builds**: Require balanced priorities across multiple stat types
- **Beast Builds**: 909+ range affixes for companion scaling

#### Cross-Build Universal Stats
- **Movement Speed**: Critical for all builds (multiple ID mappings needed)
- **Health/Resistances**: Universal defensive requirements
- **Cast Speed**: Important for most active skill builds

### Generation System Implications

#### Template Complexity Levels
1. **Simple** (15-25 rules): Basic single-archetype builds
2. **Moderate** (25-40 rules): Hybrid or progression-focused builds  
3. **Complex** (40-60 rules): Multi-archetype or comprehensive builds
4. **Expert** (60-70 rules): Maximum complexity specialist builds

#### Data Quality Requirements
- **Phase 1**: Fix top 10 critical affixes for basic generation (28, 36, 25, 102, 643, 724, 64, 719, 43, 909) 
- **Phase 1.5**: ✅ **COMPLETED** - Complete affix tier data (T1-T8 values and item type compatibility)
- **Phase 2**: Complete subtype database for weapon progression (**CURRENT PRIORITY**)
- **Phase 3**: Expand affix coverage for hybrid and specialized builds

This extended analysis confirms that successful filter generation requires both foundational data fixes AND support for complex, specialized build requirements.

## Multi-Build and Item-Enabled Build Requirements (2025-08-27)

### New Data Requirements from "Mine - Primalist" Analysis

#### 1. Item-Enabled Build Mechanics
**Critical Discovery**: Some builds are impossible without specific unique items

**Build-Enabling Items Identified**:
- **"Chorus of the Aurok"**: Enables Frog summoning (skill doesn't exist without this item)
- **"Thicket of Blinding Light"**: Makes reflection damage viable for endgame bosses
- **"Naal's Tooth"**: Enables Raptor build variant within Beastmaster
- **"Exsanguinous"**: Enables low-life mechanics with current health as ward

**Database Requirements**:
- **Item-Skill Relationships**: Which items enable which skills
- **Mechanical Transformations**: How items change build scaling and requirements
- **Build Dependencies**: Which builds require specific items vs optional enhancement
- **Variant Mappings**: How items enable different playstyles within same mastery

#### 2. Multi-Build Filter Architecture Data
**Pattern**: Single filter optimally supporting multiple characters/builds

**Design Requirements**:
- **Shared Equipment Analysis**: Which equipment types work across multiple builds
- **Stat Overlap Detection**: Universal stats that benefit multiple build archetypes
- **Rule Efficiency Modeling**: Optimal rule allocation for multi-build coverage
- **Specialized Category Needs**: Build-specific affix groups within universal filters

**Evidence from "Mine - Primalist"**:
- **12 rules** support **2 complete builds** + **3 build variants** = 5 configurations total
- **Equipment overlap**: Both builds use 1H+Shield, enabling shared rules
- **Specialized sections**: Separate minion and thorns categories within universal framework
- **Global coverage**: 522+ affixes in T7+ rule covers all possible scaling needs

#### 3. Form-Swapping and Content-Specific Skills
**New Pattern**: Builds using different skills for different content types

**Skill Usage Patterns**:
- **Spriggan Form**: Mapping and AoE clear with thorn shield mechanics
- **Werebear Form**: Single target and boss survivability
- **Auto-Proc Chains**: Forms automatically trigger other skills (Maelstrom, Eterra's Blessing)
- **Content Optimization**: Different tools for different challenge types

**Database Requirements**:
- **Skill Context Tags**: Which skills are optimal for mapping vs bosses
- **Auto-Proc Relationships**: Which skills trigger other skills automatically
- **Form Transformation Data**: How forms change character capabilities and stat priorities
- **Content Type Classifications**: Mapping, single target, boss, defensive, utility categories

#### 4. Schema Version Evolution Impact
**lootFilterVersion: 5** introduces advanced features requiring database support:

**New Features**:
- **SoundId/BeamId**: Audio and visual alert system for priority items
- **Order Field**: Explicit rule processing sequence control
- **Enhanced Deprecated Handling**: Backward compatibility with evolving fields
- **Advanced Condition Logic**: Complex evaluation requiring expanded condition support

**Database Implications**:
- **Priority Classification**: Which items deserve audio/visual alerts
- **Rule Processing Optimization**: Optimal rule ordering for performance
- **Schema Migration Data**: How to handle deprecated fields across versions

### Updated Data Collection Priorities

#### Phase 1: Critical Item-Build Relationships
1. **Build-Enabling Items**: Complete database of items that enable specific skills/builds
2. **Item Dependencies**: Required vs optional items for each build archetype
3. **Variant Mappings**: How items create build variants within same mastery
4. **Mechanical Transformations**: How items change scaling and stat requirements

#### Phase 2: Multi-Build Optimization Data
1. **Equipment Compatibility Matrix**: Which builds can share which equipment types
2. **Universal Stat Identification**: Stats that benefit multiple build archetypes
3. **Specialized Category Definitions**: Build-specific affix groups for efficient filtering
4. **Rule Efficiency Modeling**: Optimal rule allocation algorithms

#### Phase 3: Advanced Skill Mechanics
1. **Content-Specific Skill Data**: Mapping vs boss optimization
2. **Auto-Proc Relationship Mapping**: Skill trigger chains and dependencies
3. **Form Transformation Effects**: How shapeshift skills change character capabilities
4. **Skill Synergy Analysis**: How different skills work together in complex builds

### Filter Generation System Requirements

#### Multi-Build Support
- **Dual-Character Templates**: Filter architectures optimized for multiple characters
- **Shared Equipment Detection**: Automatic identification of compatible gear types
- **Rule Budget Optimization**: Efficient allocation across multiple build requirements
- **Specialized Section Generation**: Automatic creation of build-specific affix categories

#### Item-Enabled Build Recognition
- **Dependency Analysis**: Understanding which items enable which build strategies
- **Variant Generation**: Creating build variants based on available items
- **Progressive Enhancement**: Filters that adapt as build-enabling items are acquired
- **Alternative Path Support**: Multiple approaches to same build goals

This analysis reveals that successful filter generation for advanced players requires understanding not just individual builds, but complex multi-build relationships, item dependencies, and content-specific optimizations.

## Database Access and Optimization Improvements (2025-08-27)

### New Database Indexes and Structure ✅

**Major Infrastructure Addition**: Complete indexing system implemented for efficient data access.

#### Available Indexes
1. **ID Lookup Index** (`indexes/id-lookup.json`):
   - O(1) access to any affix by ID
   - Example: `indexes.affixes["28"]` for instant affix lookup
   - Eliminates need to search through large JSONL files

2. **Tag-Based Index** (`indexes/tags-index.json`):
   - Find all items/skills/affixes by tag
   - 29 global tags indexed: "Minion", "Fire", "Lightning", "Movement", etc.
   - Example: `indexes.byTag.Minion.skills` returns all minion skills

3. **Mechanics Index** (`indexes/mechanics-index.json`):
   - Cross-references game mechanics relationships
   - Enables queries like "what affects critical strikes"

#### Organized File Structure
```
Data/
├── game-database.jsonl          # Main database (legacy)
├── Prefixes/                    # 683 individual affix files with tier data
├── Suffixes/                    # 263 individual affix files  
├── UniqueItems/                 # 440 unique item files
├── Skills/                      # Class-organized skill files
├── indexes/                     # O(1) lookup indexes ✅ NEW
│   ├── id-lookup.json          # Fast ID-based lookups
│   ├── tags-index.json         # Tag-based filtering  
│   └── mechanics-index.json    # Game mechanics relationships
└── database-index.json         # Master index with stats
```

### Efficient Data Access Patterns

#### For Analysis Tasks
**Old Method** (inefficient):
```bash
grep '"id":28,' game-database.jsonl  # Slow text search
```

**New Method** (optimized):
```bash
# Direct file access for affix data
cat Prefixes/Health.json  # Instant access to Health affix with all tiers

# Or programmatic access via indexes
node -e "console.log(require('./Data/indexes/id-lookup.json').affixes['28'])"
```

#### For Build Analysis
**Tag-Based Queries**:
```bash
# Find all minion-related skills instantly
node -e "console.log(require('./Data/indexes/tags-index.json').byTag.Minion.skills)"

# Find all fire damage sources  
node -e "console.log(require('./Data/indexes/tags-index.json').byTag.Fire)"
```

### Performance Impact for Future Analysis

#### ✅ **Resolved Bottlenecks**:
- **Fast Affix Lookups**: No more searching through 946-line JSONL files
- **Tag-Based Filtering**: Instant access to build-relevant items by tag
- **Batch Processing**: Individual files enable parallel processing
- **Caching Friendly**: File-based structure enables smart caching strategies

#### **Analysis Task Optimization**:
- **Filter Verification**: Can instantly look up affix IDs found in sample filters
- **Build Requirements**: Tag-based queries for "Minion", "Fire", "Lightning" etc.
- **Cross-References**: Mechanics index enables relationship discovery
- **Bulk Analysis**: Parallel processing of individual affix/item files

### Database Quality and Statistics

**Updated Counts** (from database-index.json):
- **Affixes**: 946 (unchanged)
- **Unique Items**: 440 (+37 items discovered)  
- **Skills**: 136 catalogued
- **Global Tags**: 29 fully indexed
- **Total Items**: 1433 in database

**Data Quality**: 
- Tier data complete for all affixes
- Individual affix files contain complete T1-T8 value ranges
- Tag relationships mapped and indexed
- File naming consistent (snake_case)

This infrastructure dramatically improves the efficiency of future analysis tasks and enables sophisticated queries that were previously impossible or very slow.