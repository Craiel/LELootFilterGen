# Game Systems Guide

This document describes the fundamental game systems, mechanics, and strategies in Last Epoch that are essential for understanding character builds and loot filtering.

## General Game Concepts

- "Elemental" generally applies to Fire, Lightning and Cold Damage and Resistances

---

## Character Power Systems

Character power is driven by five interconnected systems:

1. **Passive Trees** - Skill point allocation for permanent bonuses
2. **Skill Specializations** - Focused development of specific abilities
3. **Skill Specialization Trees** - Detailed customization within specialized skills
4. **Items** - Equipment that provides stats and modifiers
5. **Idols** - Special socketed items that provide targeted bonuses

---

## Class & Mastery System

### Class Structure
- Each class has **3 Masteries** available
- Each class has **4 Passive Trees**:
    - 3 mastery-specific trees (one per mastery)
    - 1 class-generic tree (shared across all masteries)

### Mastery Selection Rules
- **Main Mastery**: Only **one** mastery can be chosen as the main focus
- **Cross-Mastery Skills**: Can access the **first 2 skills** from non-chosen masteries
- **Skill Restrictions**: Cannot access the **last 2 skills** from non-chosen masteries

### Passive Point Allocation
- **Main Mastery**: **No limitations** on passive point allocation
- **Non-Main Masteries**: Can only allocate points to the **first half** of the passive tree
- **Point Requirements**: Some passives require specific point investments
- **Prerequisites**: Some passives require other passives to reach certain levels first

---

## Skill Specialization System

### Specialization Limits
- Maximum of **5 skills** can be specialized simultaneously
- Skill modifications targeting non-specialized skills are **wasted**

### Skill Levels
- **Default maximum level**: 20
- **Level increases**: Can exceed 20 with "+to skill" items and affixes

### Specialization Trees
- Each specialized skill has its own **specialization tree**
- Trees contain multiple **sub-nodes** for customization
- **Allocation Order**: Nodes must be allocated in pre-defined order
- **Multi-Point Nodes**: Some nodes require multiple points to fully unlock

---

## Item & Affix System

### Affix Structure
- **Default Affix Capacity**: Items can have **4 Affixes** by default
    - **2 Prefixes** - Modifiers that appear before the item name
    - **2 Suffixes** - Modifiers that appear after the item name
- **Affix Uniqueness**: Each item can only have **one instance** of any specific affix type
- **Sealed Affixes**: Special affixes that **cannot be modified** through crafting or other means

### Affix Tiers
- **Tier Range**: Affixes come in **Tiers 1-8** (with potential for future expansion)
- **Tier 1**: Lowest power level with minimal stat ranges
- **Tier 8**: Highest power level with maximum stat ranges
- **Non-Overlapping Values**: A low-roll higher tier is **always better** than a high-roll lower tier
    - Example: A minimum Tier 5 affix > maximum Tier 4 affix

### Affix Availability
- **Tiers 1-5**: Available through both **crafting** (maximum Tier 5) and **item drops**
- **Tiers 6-8**: **Drop-only** affixes that cannot be crafted
- **Value Scaling**: Each tier above 6 becomes increasingly more **valuable and powerful**
- **Rarity**: Higher tiers (6+) are considered **premium** modifiers

### Set Item Affixes
- Special Affixes that typically end in " Reforged" and incorporate a set bonus of the set that item (name) belongs to
- Only one affix of the set is needed to get the bonus, multiple of the same set do not add anything
- These Affixes can only be crafted onto items and do not Drop naturally in the current game version

### Legendary Potential System

**Function**
- **Legendary Potential (LP)** allows unique items to be enhanced by "slamming" rare items onto them
- **Base Type Matching**: Only rare items of the same base type can be slammed (shield → shield, sword → sword)
- **Affix Transfer**: LP number determines how many affixes transfer from the rare to the unique (1-4 maximum)

**Transfer Mechanics**
- **Guaranteed Choice**: Player can choose ONE affix to transfer for certain
- **Random Selection**: Remaining affixes transferred randomly from available pool
- **Build Enhancement**: Allows unique items to gain critical affixes they normally lack
- **Slot Optimization**: Enables builds to use build-defining uniques while maintaining affix access

**Strategic Importance**
- **Under-powered Uniques**: Items with sufficient LP become viable despite weak base stats
- **Build Flexibility**: Pre-occupied slots can still contribute essential affixes through LP
- **Filter Priority**: Higher LP values make otherwise ignored uniques valuable

---

## Minion Systems

Minion mechanics vary significantly by class, affecting build strategy and stat priorities:

### Primalist Minions (Companions)
**Revival Mechanics**
- **Death State**: Minions become "downed" when health reaches 0
- **Revival Process**: Player must stand in a circle near the downed minion for several seconds
- **Revival Time**: Takes significant time, making minion survivability crucial
- **Combat Impact**: Minion death during combat is highly disruptive

**Strategic Implications**
- **Health Investment**: Minion survivability more important than damage in many cases
- **Positioning**: Player must be able to safely reach downed companions
- **Build Focus**: Defensive minion stats often prioritized over offensive stats

### Acolyte Minions
**Re-summoning Mechanics**
- **Death State**: Minions are completely destroyed when health reaches 0
- **Re-cast Requirement**: Must re-cast the summoning skill entirely
- **Mana Cost**: Full mana cost paid for each re-summon
- **Setup Time**: Must rebuild minion army from scratch after losses

**Temporary Minions**
- **Health Decay**: Some minions continuously lose health over time
- **Duration Limits**: Minions automatically die after set time periods
- **Constant Recasting**: Requires frequent re-summoning during extended fights

**Strategic Implications**
- **Mana Priority**: Higher mana costs make resource management critical
- **Cast Speed**: Faster summoning reduces vulnerability during rebuilds
- **Quantity Focus**: Multiple weak minions often preferred over few strong ones

### Minion Scaling Considerations

**High-Survivability Minions** (Bears, Golems)
- **Base Defense**: High natural armor and health
- **Scaling Priority**: Damage > Health (already durable)
- **Investment Focus**: Offensive stats provide better returns

**Low-Survivability Minions** (Skeletons, Wraiths)
- **Base Defense**: Low natural survivability
- **Scaling Priority**: Health/Defense > Damage
- **Investment Focus**: Survivability stats essential for functionality

---

## Defensive Systems

> **Note**: All values shown are calculated for Area Level 100. Lower area levels will have different scaling.

### Base Defense Systems

These form the foundation of every character's survivability:

#### Health
- **Primary health pool** that determines how much damage you can take
- **Critical stat** - all builds need sufficient health to survive

#### Health Regeneration
- **Passive recovery** that restores health over time
- **Sustain mechanism** for consistent healing between combat encounters

#### Ward
- **Secondary protection layer** that absorbs damage before health
- **Decay mechanic**: Ward naturally decreases over time
- **Ward Retention**: Can be increased to slow decay rate
- **Usage**: Primarily used by caster builds and some hybrid builds

### Primary Defense Types

Choose ONE of these as your main defensive strategy:

#### Armor Defense

**Mechanics**
- **Function**: Reduces damage from all direct hits
- **Limitation**: Does NOT reduce damage over time effects
- **Efficiency**: Only 70% effective against non-physical damage types

**Effectiveness Caps**
- **Maximum**: Hard-capped at 85% damage reduction
- **Scaling**: Diminishing returns as you approach the cap

**Armor Rating Examples (Area Level 100)**
- **1,000 armor** = 23.7% damage reduction
- **10,000 armor** = 77.3% damage reduction ⭐ *Recommended minimum*
- **50,000 armor** = 84.4% damage reduction

#### Dodge Defense

**Mechanics**
- **Function**: Chance to completely avoid incoming attacks
- **All-or-nothing**: Either dodge completely or take full damage
- **Enemy scaling**: Dodge chance reduced by area level of enemies

**Effectiveness Caps**
- **Maximum**: Hard-capped at 85% dodge chance
- **Scaling**: Diminishing returns as you approach the cap

**Dodge Rating Examples (Area Level 100)**
- **1,000 dodge rating** = 29.1% dodge chance
- **10,000 dodge rating** = 81.6% dodge chance ⭐ *Recommended minimum*
- **50,000 dodge rating** = 84.6% dodge chance

#### Block Defense

**Mechanics**
- **Two components**: Block Chance (%) + Block Effectiveness (rating)
- **Function**: Reduces damage by effectiveness percentage when blocking occurs
- **Requirement**: Must use shield or specific weapon types
- **Enemy scaling**: Block effectiveness reduced by area level of enemies

**Effectiveness Caps**
- **Maximum**: Hard-capped at 85% damage reduction when blocking
- **Scaling**: Diminishing returns on effectiveness rating

**Block Effectiveness Examples (Area Level 100)**
- **2,500 effectiveness** = 55% damage reduction when blocking
- **5,000 effectiveness** = 71% damage reduction when blocking ⭐ *Recommended minimum*
- **10,000 effectiveness** = 80% damage reduction when blocking

### Secondary Defense (Mandatory)

#### Resistance System

**Resistance Types**
Last Epoch has **7 resistance types** total:

**Elemental Resistances (3 types)**
- **Fire Resistance**
- **Lightning Resistance**
- **Cold Resistance**
- **Group affixes**: Some gear provides "Elemental Resistances" affecting all three

**Non-Elemental Resistances (4 types)**
- **Physical Resistance**
- **Poison Resistance**
- **Necrotic Resistance**
- **Void Resistance**

**Universal Resistance**
- **"All Resistances"** affects all 7 resistance types

**Resistance Mechanics**
- **Default cap**: 75% resistance maximum
- **Over-cap potential**: Cap can be modified through certain means
- **Enemy penetration**: Enemies penetrate 1% resistance per area level (up to 75% penetration at area level 75+)
- **Penetration application**: Applied AFTER the resistance cap, making over-cap valuable
- **Negative resistance**: Can be reduced below 0%, causing increased damage taken

**Resistance Strategy**
- **Minimum target**: 75% in all relevant resistances
- **Endgame target**: 85-90% total resistance (10-15% over-cap)
- **Priority order**:
    1. Elemental Resistances (Fire, Lightning, Cold)
    2. Physical Resistance
    3. Poison, Necrotic, Void (based on content being faced)

### Tertiary Defense (Optional)

#### Critical Strike Mitigation (highly recommended)

- Need to have at least one of the two ways to mitigate crits to some degree
- Ideally 100% mitigation, but if not get as close as possible without sacrificing too much in other areas

**Critical Strike Avoidance**
- Critical Strike avoidance gives a chance to downgrade an enemy crit on you to a regular hit
- can get to 100% and exceed it but does nothing above 100%

**Reduced bonus Damage from Crits**
- Reduces the bonus damage from crits by a percentage
- Crits do 200% damage, so 100% Reduction results in a normal hit
- can get to 100% and exceed it but does nothing above 100%

#### Endurance System

**Mechanics**
- **Function**: Percentage-based damage reduction for smaller hits
- **Threshold system**: Only applies to hits below the endurance threshold
- **Use case**: Effective for builds that maintain consistent health levels

**Example**
- **25% endurance** with **100 threshold** = Any hit dealing less than 100 damage gets reduced by 25%
- **Effectiveness**: Best for characters with high health pools and good sustain

---

## Build Philosophy & Structure

A powerful Last Epoch build follows a focused approach where all systems work together to maximize effectiveness while maintaining survivability and utility. Every build must balance offense with defense to handle endgame content effectively.

### Essential Build Components

#### 1. Primary Damage Focus
- **Single Core Ability**: Choose ONE skill to be your primary damage dealer
- **Specialization Priority**: This skill MUST be one of your 5 specialized skills
- **Resource Allocation**: Majority of passive points should support this ability
- **Scaling Focus**: All damage scaling should prioritize this skill's damage type

#### 2. Supporting Skill Framework
- **Enhancement Skills**: 1-2 skills that directly boost your core ability
- **Utility Skills**: Skills that provide necessary functions (movement, defense, etc.)
- **Specialization Limits**: Remember you only have 5 specialization slots total

#### 3. Mastery Selection Strategy
- **Main Mastery**: Choose based on your core damage skill location
- **Cross-Mastery Access**: Utilize first 2 skills from other masteries for support
- **Passive Synergy**: Ensure your chosen mastery's passive tree supports your build

### Defense Requirements Framework

#### Base Defense Requirements
Every build needs a foundation of survivability:

- **Health**: Minimum 2,500-3,000 HP for endgame content
- **Health Regeneration**: Provides consistent recovery
- **Ward** (if applicable): High-capacity ward with retention for burst protection

#### Primary Defense Selection
Choose ONE primary defensive strategy to focus on:

**Armor-Based Defense**
- **Target**: 10,000+ armor rating (77%+ damage reduction)
- **Strengths**: Consistent physical damage reduction
- **Weakness**: Only 70% effective vs non-physical damage
- **Item Priority**: Armor rating on gear, armor passives

**Dodge-Based Defense**
- **Target**: 10,000+ dodge rating (80%+ dodge chance)
- **Strengths**: Complete avoidance of attacks
- **Weakness**: All-or-nothing protection
- **Item Priority**: Dodge rating, movement speed

**Block-Based Defense**
- **Target**: High block chance + 5,000+ block effectiveness (70%+ reduction)
- **Strengths**: Reliable partial damage reduction
- **Weakness**: Requires shield or specific weapons
- **Item Priority**: Block chance, block effectiveness rating

#### Secondary Defense (Resistance)
**MANDATORY** for all builds:

- **Resistance Cap**: Achieve 75% in all relevant resistances
- **Over-Cap**: Consider 85-90% total resistance for endgame (10-15% over-cap)
- **Priority Order**:
    1. Elemental Resistances (Fire, Lightning, Cold)
    2. Physical Resistance
    3. Poison, Necrotic, Void (based on content)

### Build Validation Checklist

#### ✅ Offense Requirements
- [ ] One clear primary damage skill identified and specialized
- [ ] All passive points contribute meaningfully to damage or survivability
- [ ] Supporting skills enhance rather than compete with core ability
- [ ] Scaling focuses on single damage type/method

#### ✅ Defense Requirements
- [ ] Primary defense strategy chosen and scaled (10,000+ rating)
- [ ] All resistances at 75% minimum (preferably 85-90%)
- [ ] Minimum 2,500+ health achieved
- [ ] Defense scaling doesn't sacrifice more than 40% of total passive budget

#### ✅ Utility Requirements
- [ ] Movement skill or 30%+ movement speed included
- [ ] Resource management addressed (mana, etc.)
- [ ] Quality of life improvements considered

#### ✅ System Optimization
- [ ] All 5 specialization slots used effectively
- [ ] Mastery selection maximizes available synergies
- [ ] Passive point allocation follows game restrictions
- [ ] Item priorities balance offense and defense appropriately

---

## Critical Constraints

> **⚠️ IMPORTANT**: These rules are **non-negotiable** and cannot be modified or bypassed through any means.

### Hard Limits
- **5 specialized skills maximum** - No exceptions
- **1 main mastery only** - Cannot change after selection
- **Passive point caps** - Fixed limits that cannot be exceeded
- **Skill access restrictions** - Cross-mastery limitations are absolute
- **4 affix maximum per item** - Default limit cannot be exceeded
- **Unique affix restriction** - No duplicate affixes on single items

### Progression Requirements
- **Point investment order** - Some passives have mandatory prerequisites
- **Specialization tree paths** - Node allocation must follow defined routes
- **Level requirements** - Some features locked behind character/skill levels
- **Affix tier limitations** - Tiers 6+ are drop-exclusive and cannot be crafted

**Remember**: The most powerful build is one that can consistently clear the content you want to play. Perfect balance between offense and defense creates builds that are both effective and enjoyable to play.