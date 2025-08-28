# Common Mistakes in Build Generation

This document tracks common errors, pitfalls, and their solutions encountered during build expansion and filter generation. Use this to avoid repeating mistakes.

## Data Lookup Mistakes

### Skill Name Resolution Errors

#### Problem: Exact String Matching Failures
**Symptom**: Skill not found in database despite being valid
**Common Causes**:
- User input: "Summon Skeleton" vs Database: "Summon Skeletons" (plural)
- Capitalization mismatches
- Special characters in skill names

**Solution**: Implement fuzzy matching for skill names
**Prevention**: Always try case-insensitive partial matching before declaring skill unknown

#### Problem: Skill Alias Recognition
**Symptom**: Skills referred to by community nicknames not found
**Examples**:
- "Bear" → "Summon Bear"
- "Spriggan Form" → "Druid Form: Spriggan"
- "TP" → "Teleport"

**Solution**: Maintain alias mapping table for common skill nicknames

### Affix ID Mapping Errors

#### Problem: Multiple Affixes for Same Stat Concept
**Symptom**: Missing some relevant affixes when user requests broad stat category
**Example**: User wants "resistances" but only Fire Resistance (25) mapped, missing Cold (52), Lightning (10), Poison (7)

**Solution**: Create stat category mappings that include all relevant affix variants
**Prevention**: Always expand broad stat categories to all applicable specific affixes

#### Problem: Tier Availability Assumptions
**Symptom**: Requiring T6+ for affixes that don't exist at high tiers
**Common Error**: Assuming all affixes have T1-T7 variants

**Solution**: Check actual tier ranges available for each affix in database
**Prevention**: Validate tier requirements against database before inclusion

## Build Classification Mistakes

### Primary vs Secondary Skill Confusion

#### Problem: Misclassifying Build Type from Secondary Skills
**Symptom**: Build classified as "spell" when primary skill is "Summon Bear" but has "Elemental Nova" secondary
**Root Cause**: Giving equal weight to all skills instead of prioritizing primary skill

**Solution**: Always use primary skill for core build type classification
**Secondary skills should modify/enhance, not override the classification**

#### Problem: Hybrid Build Under-Classification
**Symptom**: Missing important scaling stats because build type too narrowly defined
**Example**: "Toxic Wind" classified as pure "minion" missing poison spell scaling

**Solution**: Check for hybrid patterns when secondary skills suggest different scaling types

#### Problem: Skill Interaction Assumptions Without Explicit Usage
**Symptom**: Including skills/mechanics not explicitly mentioned in build description
**Example**: Adding raptor-related affixes because "Naal's Tooth" enables raptors, but no raptor skill listed
**Root Cause**: Assuming item effects imply skill usage

**Solution**: Only include skill interactions when:
- The interacting skill is explicitly mentioned in the build, OR
- Fewer than 5 total skills are used (then suggest the interaction to user)
**Do not assume unique item capabilities mean the skill will be used**

### Defense Strategy Inference Errors

#### Problem: Default Defense Assumptions
**Symptom**: Assuming armor-based defense for all builds without checking skill/item requirements
**Common Error**: Assigning armor defense to ward-based Mage builds

**Solution**: Check skill resource costs and scaling first:
- High mana costs suggest ward synergy
- Health costs suggest life-based strategies
- Rage suggests armor/physical builds

#### Problem: Incorrect Mana Priority Assessment
**Symptom**: Including mana affixes for builds that rarely cast spells
**Example**: Bear summoner builds getting mana priority when bear is summoned once and skills used sparingly
**Root Cause**: Not analyzing actual casting frequency vs just seeing mana costs

**Solution**: Analyze casting patterns:
- **Cooldown-limited skills**: Mana irrelevant regardless of cost
- **Frequent casting builds**: High mana priority
- **One-time summoning**: Low mana priority even with high costs
- **Sustained channeling**: High mana priority

## Multi-Build Optimization Mistakes

### Equipment Compatibility Errors

#### Problem: Impossible Weapon Combinations
**Symptom**: Multi-build filter supports bow + sceptre when no build can use both
**Example**: Primalist bow build + Druid spell build = impossible weapon overlap

**Solution**: Calculate actual weapon intersection, not union
**Only include weapons ALL builds can potentially use**

#### Problem: Unique Item Weapon Constraint Violations
**Symptom**: Including two-handed weapons when build specifies one-handed unique item
**Example**: Including 2H swords when "Naal's Tooth" (1H sword) is specified as key item
**Root Cause**: Weapon type determination ignoring unique item constraints

**Solution**: When unique items specify weapon types, preferred weapons must match exactly
**Prevention**: Always check unique item weapon constraints before setting preferred types

#### Problem: Over-Specialized Shared Categories
**Symptom**: "Shared" stat categories too narrow to benefit all builds meaningfully
**Example**: Including "minion attack speed" in shared category for minion + spell multi-build

**Solution**: Shared categories should be universally beneficial stats only:
- Health, resistances, movement speed always shared
- Damage scaling only shared if ALL builds benefit

### Rule Efficiency Miscalculations

#### Problem: Rule Count Underestimation
**Symptom**: Estimated rule count far below actual XML generation needs
**Common Cause**: Not accounting for progressive equipment rules and class filtering

**Solution**: Use rule estimation formula:
- Base rules: 3-5 (class filtering, global rules)
- Equipment types × level brackets: Major contribution
- Affix categories: 1 rule per distinct category
- Unique item rules: 2-3 rules typical

## Unique Item Integration Mistakes

### Mechanical Effect Misunderstanding

#### Problem: Surface-Level Item Analysis
**Symptom**: Missing critical mechanical changes items cause
**Example**: Adding "Exsanguinous" without understanding low-life ward mechanics

**Solution**: Always research item's complete mechanical effects:
- What skills/stats does it enhance?
- What build strategies does it enable/disable?
- What new stat priorities does it create?

#### Problem: Item Synergy Blindness
**Symptom**: Missing powerful combinations between multiple unique items
**Example**: "Exsanguinous" + "Last Steps of the Living" ward stacking synergy

**Solution**: Check for item combination effects when multiple uniques specified

## User Communication Mistakes

### Unclear Clarification Requests

#### Problem: Vague Questions to User
**Poor Example**: "Your build needs more information"
**Better**: "I need clarification on your Druid build: Do you primarily use Spriggan Form for damage, or is it mainly for the defensive benefits while using other skills?"

**Solution**: Always specify:
- Exactly what information is missing
- Why it's needed for accurate generation
- Provide specific options when possible

#### Problem: Technical Jargon in User Communication
**Poor Example**: "Affix ID mapping failed for primary scaling stat derivation"
**Better**: "I couldn't find the 'minion damage' stat in the database. Do you mean damage bonuses for your summoned creatures?"

**Solution**: Translate technical issues to user-friendly language

## Generation Quality Mistakes

### Assumption-Making Without User Confirmation

#### Problem: Making Major Build Assumptions
**Dangerous Pattern**: Inferring complex build mechanics from minimal information
**Example**: User specifies "Necromancer" and "Summon Skeleton" → Assuming minion-only build when they might want hybrid personal damage

**Solution**: Ask for clarification on ambiguous aspects rather than guessing

#### Problem: Default Strictness Application
**Symptom**: Applying system default strictness without considering build complexity
**Example**: Ultra-strict settings on leveling build making progression impossible

**Solution**: Match strictness recommendations to build complexity and stated user goals

## Validation and Error Checking Mistakes

### Insufficient Build Coherence Checking

#### Problem: Missing Incompatibility Detection
**Example**: Not catching that bow skills can't be used with sceptres
**Result**: Generated filter shows impossible equipment combinations

**Solution**: Implement compatibility matrix checking:
- Skills vs weapon types
- Defensive strategies vs class capabilities
- Unique item requirements vs build type

#### Problem: Rule Count Validation Timing
**Symptom**: Discovering rule count issues only after full generation
**Better Approach**: Estimate and validate rule counts during expansion phase

## Learning Integration Mistakes

### Over-Detailed Learning Entries

#### Problem: Recording Specific Data Instead of Patterns
**Poor Learning Entry**: "Affix ID 643 is minion damage with tier range T1-T7"
**Better Entry**: "Minion builds consistently require same core affixes regardless of specific minion strategy"

**Solution**: Focus on patterns, relationships, and insights rather than data that belongs in the database

### Failure to Update Learning

#### Problem: Not Recording New Patterns
**Symptom**: Making same mistakes repeatedly because insights not captured
**Solution**: Always update relevant learning file after each generation cycle

---

## Mistake Categories Summary

### High Impact Mistakes (Fix Immediately)
- Skill classification errors leading to wrong build type
- Impossible equipment combinations in multi-builds
- Rule count violations exceeding 75-rule limit

### Medium Impact Mistakes (Address in Reviews)
- Incomplete affix mappings missing important variants
- Suboptimal rule efficiency patterns
- User communication clarity issues

### Low Impact Mistakes (Improvement Opportunities)
- Learning documentation gaps
- Minor assumption patterns
- Edge case handling improvements

---

*This document is updated whenever new mistake patterns are identified during build generation or user feedback cycles.*