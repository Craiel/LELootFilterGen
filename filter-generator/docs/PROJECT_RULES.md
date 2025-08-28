# Project Development Rules

**CRITICAL**: These rules must be followed for all development in the filter-generator project. They were established during Phase 1 implementation and are mandatory for maintaining system integrity.

## Rule 1: Database-Driven Architecture

### ❌ NEVER hardcode game data in source code
- **No affix IDs** directly in JavaScript files
- **No skill-specific mappings** in code
- **No build type assumptions** hardcoded in logic

### ✅ Always pull from database
```javascript
// WRONG - Hardcoded data
const minionAffixes = [643, 719, 102]; // Never do this

// CORRECT - Database-driven
const minionAffixes = await this.db.getAffixesByTags(['minion']);
```

### Why This Matters
- Game data changes with updates
- Database is the single source of truth
- Code should be generic and reusable
- Intermediate files handle specific data mappings

## Rule 2: Build-Agnostic System Design

### ❌ NEVER include build-specific knowledge in core logic
- **No Primalist-specific code** in generic processors
- **No class assumptions** beyond what database provides
- **No hardcoded build patterns** for specific character types

### ✅ Always design for ANY build
```javascript
// WRONG - Build-specific logic
if (buildType === 'minion') {
  return ['minion damage', 'cast speed']; // Specific knowledge
}

// CORRECT - Generic database lookup
return await this.db.getSkillScalingStats(primarySkill);
```

### Why This Matters
- System must work for all classes and builds
- Prevents bias toward analyzed examples
- Ensures true generic applicability
- Reduces maintenance when game evolves

## Rule 3: Intermediate File Responsibility

### Data Flow Responsibility
```
Database → Core Logic → Intermediate File → Filter Generation
```

### ❌ Core logic should NOT contain
- Specific affix ID to name mappings
- Build template patterns
- Hardcoded stat priorities
- Class-specific default values

### ✅ Intermediate file should contain
- All resolved affix IDs and mappings
- Complete build-specific data
- Calculated priorities and requirements
- Ready-to-use filter generation data

### Why This Separation Matters
- Core logic stays generic and testable
- Intermediate files capture all build specifics
- Clear separation of concerns
- Easy debugging and validation

## Rule 4: Generic Method Signatures

### ❌ Avoid specific parameter patterns
```javascript
// WRONG - Too specific
async getMinionBuildAffixes(summonType)
async getPrimalistWeapons()
```

### ✅ Use generic, flexible patterns
```javascript
// CORRECT - Generic and flexible
async getAffixesByTags(tags)
async getUniqueItemsBySearch(searchTerms, specifiedItems)
async getSkillScalingStats(skillName)
```

### Why Generic Signatures Matter
- Works for any build type
- Future-proof for new content
- Reusable across different game classes
- Database evolution doesn't break API

## Rule 5: Error Handling for Missing Data

### ❌ Never assume data exists
```javascript
// WRONG - Assumes skill data structure
const damageType = skill.damageTypes[0]; // Could crash
```

### ✅ Always handle missing/incomplete data
```javascript
// CORRECT - Safe data access
const damageTypes = skill.damageTypes || [];
const primaryDamage = damageTypes.length > 0 ? damageTypes[0] : 'unknown';
```

### Missing Data Strategy
1. **Log warnings** for missing data
2. **Ask user for clarification** when critical data missing
3. **Provide fallbacks** only when safe and generic
4. **Never guess** build-specific information

## Rule 6: Learning System Guidelines

### ❌ Don't capture database content in learning files
```markdown
<!-- WRONG in learning files -->
## Minion Affixes
- Affix ID 643: Minion Damage (T1-T7)
- Affix ID 719: Minion Health (T1-T6)
```

### ✅ Capture patterns and insights only
```markdown
<!-- CORRECT in learning files -->
## Build Type Patterns
- All minion builds share core scaling stats regardless of specific strategy
- Form-swapping builds use different skills for different content types
```

### Learning Content Guidelines
- **High-level patterns** only
- **Relationships and synergies** discovered through experience
- **User preference patterns** from feedback
- **NO specific data** that belongs in database

## Rule 7: Future Development Consistency

### When Adding New Features
1. **Check database first** - Can existing data support this?
2. **Design generically** - Will this work for all build types?
3. **Avoid hardcoding** - Where should the data actually live?
4. **Test with different builds** - Not just the one you're working with

### Code Review Questions
- Does this code work for ANY class/build combination?
- Where is the data coming from? (Should be database)
- Could this break if game data changes?
- Is this generic enough for future builds?

## Rule 8: Database Query Patterns

### ✅ Preferred query patterns
```javascript
// Search by tags (generic)
const affixes = await this.db.getAffixesByTags(['defense', 'armor']);

// Search by name (fuzzy matching)
const healthAffixes = await this.db.getAffixesByName('health');

// Get skill data (returns whatever database has)
const skillData = await this.db.getSkillScalingStats(skillName);
```

### ❌ Avoid specific lookups
```javascript
// WRONG - Too specific
const minionDamageAffix = await this.db.getAffixById(643);
```

## Rule 9: Validation and User Communication

### When Data is Missing or Unclear
1. **Be specific** about what's needed
2. **Explain why** it's required
3. **Provide options** when possible
4. **Suggest alternatives** if user's request is problematic

### Example User Communication
```javascript
// GOOD - Clear, specific request
throw new Error(
  `Skill '${skillName}' not found in database. ` +
  `Please verify the skill name or provide the skill's damage types and scaling stats.`
);
```

## Rule 10: Testing with Multiple Build Types

### Required Test Coverage
- **Different classes** (not just Primalist)
- **Different build types** (minion, spell, melee, hybrid)
- **Single and multi-build** formats
- **Missing/incomplete data** scenarios

### Avoid Test Bias
- Don't test only with builds you've analyzed
- Include edge cases and unusual combinations
- Test with minimal user input
- Test with complex multi-build scenarios

## Enforcement

### During Development
- All code must pass generic design review
- No hardcoded data allowed in commits
- Database queries must be generic
- Error handling required for all data access

### During Code Review
- Check for hardcoded values
- Verify database-driven approach
- Test with different build types
- Confirm generic method signatures

---

**These rules ensure the filter generation system remains truly generic, maintainable, and capable of handling any Last Epoch build without modification to core logic.**