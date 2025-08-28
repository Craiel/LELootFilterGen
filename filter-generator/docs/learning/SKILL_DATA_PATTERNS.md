# Skill Data Patterns

This document captures patterns and relationships discovered between skills and their associated stats, build classifications, and synergies during build generation processes.

## Build Type Classification Patterns

### Minion Build Identification
**Primary Skill Patterns**:
- Skills starting with "Summon": Usually pure minion builds
- Form skills that spawn minions: Hybrid minion/personal builds
- Buff skills that enhance minions: Support for minion builds

**Scaling Stat Universals**:
All minion builds benefit from these core stats regardless of specific strategy:
- **Minion Damage** (Affix ID: 643) - Always critical priority
- **Minion Health** (Affix ID: 719) - Always high priority  
- **Cast Speed** (Affix ID: 102) - For summoning speed and recast utility
- **Mana** (Affix ID: 4) - Resource requirement for summoning

**Strategy Variations**:
- **Direct Minion Damage**: Focus purely on minion combat stats
- **Explosion/Death Effects**: Add spell damage for minion death effects
- **Hybrid Personal**: Add personal combat stats for player participation

### Spell Build Identification
**Primary Skill Patterns**:
- Direct damage spells with elemental types
- Utility spells that scale with spell damage
- Transformation skills that enhance spell casting

**Damage Type Correlations**:
- **Fire skills**: Often include ignite chance and burning effects
- **Cold skills**: Frequently have freeze and chill mechanics
- **Lightning skills**: Usually feature shock and chain effects
- **Necrotic skills**: Commonly drain health or apply decay
- **Poison skills**: Typically damage over time with stacking

### Physical/Melee Build Identification
**Primary Skill Patterns**:
- Weapon-specific skills requiring melee weapons
- Skills that scale with physical damage
- Movement skills with combat applications

**Weapon Type Correlations**:
- **Axe skills**: High damage, often cleave effects
- **Sword skills**: Balanced speed and damage
- **Mace skills**: Heavy damage, stun effects
- **Sceptre skills**: Hybrid physical/spell capabilities

## Cross-Class Skill Patterns

### Primalist Skill Characteristics
**Beastmaster Focus**:
- **Companion Skills**: Scale with minion stats but allow personal combat
- **Animal Forms**: Temporary transformations with specific bonuses
- **Nature Magic**: Elemental damage with physical weapon synergy

**Druid Focus**:
- **Form Transformations**: Persistent state changes with different capabilities
- **Nature Spells**: Elemental magic with healing/support elements
- **Summon Variants**: Plant-based minions with unique mechanics

### Acolyte Skill Characteristics
**Necromancer Focus**:
- **Undead Minions**: Classic minion builds with necrotic themes
- **Bone Magic**: Spell damage with defensive utilities
- **Corpse Mechanics**: Skills that consume or create corpses

**Lich Focus**:
- **Transformation Magic**: Powerful spells with life costs
- **Ward Mechanics**: Mana-based defensive scaling
- **Elemental Necromancy**: Spell-focused with necrotic/cold themes

## Skill Synergy Discovery Patterns

### Resource Cost Synergies
**Mana-Heavy Skills**:
- Usually benefit from **Mana** (4), **Mana Regeneration** (34)
- Synergize with **Ward** mechanics when mana is primary resource
- Often want **Cast Speed** (102) for better resource efficiency

**Health Cost Skills**:
- Benefit from **Health Regeneration** and **Leech** effects
- Often synergize with **Low Life** mechanics
- May want **Health** (28) for larger resource pool

**Rage Cost Skills**:
- Usually benefit from **Rage Generation** effects
- Synergize with **Physical Damage** and **Melee** stats
- Often want **Attack Speed** for better resource efficiency

### Transformation Skill Patterns
**Form-Swapping Builds**:
- Multiple forms for different content (mapping vs bossing)
- **Dual-form synergies**: Stats that benefit both forms
- **Form-specific optimization**: Different priorities per form

**Permanent Transformation Builds**:
- Single form with committed stat allocation
- **Form enhancement**: Stats that specifically improve transformed state
- **Transformation costs**: Resource management for maintaining form

## Equipment Compatibility Patterns

### Weapon-Skill Relationships
**Universal Weapon Compatibility**:
- Most classes can use **1H + Shield** combinations effectively
- **Sceptres** work for both physical and spell builds in many cases
- **Two-handed weapons** usually require build commitment

**Class-Specific Preferences**:
- **Primalist**: Axes and sceptres most common, rare bow/wand usage
- **Acolyte**: Sceptres primary, axes secondary, avoid bows entirely
- **Mage**: Wands and staves primary, sceptres possible, avoid physical weapons

### Armor Type Synergies
**Class Defense Tendencies**:
- **Strength-based classes**: Armor and health scaling preferred
- **Intelligence-based classes**: Ward and mana scaling preferred  
- **Dexterity-based classes**: Dodge and movement scaling preferred

## Advanced Pattern Recognition

### Multi-Build Compatibility Indicators
**High Compatibility Signals**:
- Shared weapon type usage across builds
- Similar resource management (both mana-heavy or both rage-heavy)
- Compatible defensive strategies

**Low Compatibility Warnings**:
- Conflicting weapon requirements (bow vs wand)
- Opposing defensive strategies (ward vs armor focus)
- Resource conflict (mana vs health cost skills)

### Item-Skill Interaction Patterns
**Build-Enabling Item Categories**:
1. **Skill Granters**: Items that provide access to new skills
2. **Mechanic Changers**: Items that fundamentally alter skill behavior
3. **Scaling Modifiers**: Items that change what stats benefit skills
4. **Resource Converters**: Items that change skill resource costs/effects

**Common Transformation Patterns**:
- Health → Ward conversions (Exsanguinous, Last Steps)
- Damage type conversions (Lightning → Necrotic, Physical → Void)
- Skill behavior changes (Cooldown → Duration, Single Target → AoE)

## Scaling Stat Hierarchy Patterns

### Universal High-Priority Stats
**Always Critical (Tier 1)**:
- **Health** (28) - Universal survivability
- **Elemental Resistances** (25, 52, 10, 7) - Universal defense
- **Movement Speed** (36) - Universal utility

**Usually High-Priority (Tier 2)**:
- Primary damage type scaling for build's main skills
- Resource management stats (mana, mana regen for casters)
- Primary defensive scaling (armor, ward, dodge based on strategy)

### Build-Specific Critical Stats
**Minion Builds**:
- **Minion Damage** (643) always top priority
- **Minion Health** (719) always high priority
- **Cast Speed** (102) for summoning efficiency

**Spell Builds**:
- Relevant **Spell Damage** variants by element
- **Cast Speed** (102) for DPS and utility
- **Spell Critical Strike** variants if build supports crits

## Skill Evolution Patterns

### Progression-Dependent Skill Usage
**Early Game Patterns**:
- Basic skills with low resource costs
- Utility skills for survivability
- Simple scaling requirements

**Mid Game Transitions**:
- Skill specializations unlock
- Synergy skills become viable
- Resource management becomes important

**Endgame Optimization**:
- Specialized skill combinations
- Advanced scaling mechanics
- Multi-skill synergy strategies

---

## Pattern Application Guidelines

### For Build Classification
1. **Primary skill dominates** build type classification
2. **Secondary skills modify** priorities and add synergies
3. **Resource patterns** indicate defensive strategy preferences
4. **Weapon requirements** limit equipment options

### For Stat Priority Assignment
1. **Universal stats** always included at appropriate priority
2. **Build type patterns** determine core scaling focus
3. **Skill synergies** add supplementary stat priorities
4. **Unique item effects** can override default priorities

### For Multi-Build Analysis
1. **Compatibility patterns** indicate feasibility of shared filtering
2. **Conflict patterns** require separate specialized sections
3. **Equipment overlap** determines shared vs specialized rules

---

*This document evolves as new skill relationships and patterns are discovered through build generation experience.*