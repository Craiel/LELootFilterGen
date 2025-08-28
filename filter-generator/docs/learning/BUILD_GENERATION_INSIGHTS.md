# Build Generation Insights

This document captures high-level insights learned during the filter generation process. These insights help improve future build expansions and avoid repeated mistakes.

## Pattern Recognition Insights

### Multi-Build Filter Architecture Patterns

#### Shared Equipment Strategy Success Patterns
- **1H + Shield combinations** work well for multiple Primalist builds (Beastmaster + Druid)
- **Axe + Sceptre compatibility** supports both physical and spell-hybrid builds
- **Universal defensive stats** (health, resistances, movement) benefit all builds

#### Rule Efficiency Discoveries
- **Global hide + exceptions** more efficient than multiple specific hide rules
- **Large affix arrays** (100+ affixes) better than many small specialized rules
- **Tier-based progression** (T7+/T6+) scales well across build types

### Skill Synergy Patterns

#### Minion Build Universals
- All minion builds share core affixes regardless of strategy:
  - Minion Damage (643), Cast Speed (102), Minion Health (719)
  - Pattern holds across direct damage, explosion, and hybrid minion builds
- **Insight**: Minion templates can support multiple strategies with same base stats

#### Form-Swapping Build Recognition
- Builds using multiple forms for different content types:
  - Mapping forms (AoE clear) vs Boss forms (single target)
  - Auto-proc skill chains triggered by form changes
  - Content-specific optimization patterns

### Item-Enabled Build Mechanics

#### Build-Enabling Item Categories
1. **Skill Enablers**: Items that grant access to normally unavailable skills
   - Example: "Chorus of the Aurok" enables Frog summoning
2. **Mechanic Transformers**: Items that fundamentally change how builds scale
   - Example: "Thicket of Blinding Light" makes reflection viable for bosses
3. **Strategy Variants**: Items that enable different approaches within same mastery
   - Example: "Naal's Tooth" enables Raptor variant within Beastmaster

## Build Type Classification Insights

### Minion Build Scaling Priority Patterns
- **High-defense minions** (bears, golems) benefit more from damage scaling than health scaling
- **Low-defense minions** (skeletons, wraiths) require heavy investment in minion health
- **Base survivability analysis** critical for determining minion health priority level
- **Companion vs non-companion** minions have different scaling emphases

### Mana Relevance Assessment Patterns
- **Cast frequency analysis** determines mana priority: low-frequency casting = low mana priority
- **Cooldown-gated skills** rarely require mana investment regardless of mana cost
- **Channel/toggle skills** require sustained mana vs one-time activation costs
- **Bear builds and similar** typically use skills sparingly, making mana low priority

### Hybrid Build Characteristics
- **Large affix requirements** (85+ different affix IDs typical)
- **Multiple scaling paths** requiring balanced priority systems
- **Higher rule counts** (25+ rules common vs 8-12 for focused builds)
- **Multi-condition logic** needed for complex interactions

### Progression-Aware Filtering
- **Early game** focuses on accessibility (T5+ affixes acceptable)
- **Mid game** introduces quality gates (T6+ requirements)
- **Endgame** emphasizes premium items (T7+ focus, LP thresholds)

## Multi-Build Optimization Techniques

### Equipment Compatibility Analysis
- **Weapon type intersection** critical for multi-build feasibility
- **Defense strategy alignment** necessary for shared stat priorities
- **Class restrictions** can dramatically improve filter efficiency

### Rule Sharing Optimization
- **Universal categories** should be prioritized over build-specific rules
- **Specialized sections** needed only when builds have conflicting requirements
- **Global coverage rules** (T7+ all affixes) provide safety net for any build variation

## User Preference Patterns

### Strictness Level Calibration
- **Semi-strict**: Users prefer accessibility over perfection (T5+ acceptable)
- **Strict**: Standard endgame focus with T6+ requirements
- **Very strict**: Quality-focused players want T7+ only
- **Ultra-strict**: Minimal item volume for expert players

### Build Description Patterns
- Users naturally describe builds through **primary skills** rather than stat priorities
- **Secondary skills** often reveal build's true complexity and requirements
- **Unique items** frequently transform build entirely from base skill expectations

## Generation Quality Indicators

### Successful Generation Markers
- Estimated rule count ≤ 50 (leaving room for optimization)
- Clear build type classification achieved
- No conflicting weapon/skill requirements
- Complete affix ID mappings for all critical stats

### Warning Signs
- Rule count estimates approaching 75 limit
- Many unresolved affix name mappings
- Conflicting defensive strategies
- Missing skill data for primary abilities

## Technical Implementation Insights

### Database Access Patterns
- **Skill lookups** most critical for accurate build classification
- **Affix name mappings** frequently need fuzzy matching for user terms
- **Unique item effects** require detailed mechanical understanding

### Performance Optimization
- **Caching skill data** significantly improves multi-build processing
- **Batch affix lookups** more efficient than individual queries
- **Progressive validation** catches errors early in expansion process

---

## Future Learning Areas

### Areas Needing More Data
- Seasonal mechanic integration patterns
- Cross-class unique item synergies
- Advanced scaling mechanic combinations
- User feedback correlation with generation parameters

### Expansion Opportunities
- Integration with community build databases
- Automated sample filter pattern extraction
- Real-time game data integration for meta shifts
- User preference learning from usage patterns

---

*This document is updated after each successful build generation cycle to capture new insights and patterns.*