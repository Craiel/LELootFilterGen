# Sample Filters

This directory contains example loot filter files for various Last Epoch builds and archetypes.

## Purpose

Sample filters serve as:
- **Learning Examples**: Understanding how different builds prioritize loot
- **Reference Material**: Patterns and strategies for filter generation
- **Quality Benchmarks**: Comparison standards for generated filters

## Documentation Structure

Each sample filter should be accompanied by documentation that includes:
- **Build Archetype**: What class/build this filter serves
- **Filter Strategy**: Overall approach to item prioritization
- **Rule Breakdown**: Explanation of key filtering decisions
- **Priority Logic**: How rules are ordered and why

## Documentation Options

Choose one of these documentation approaches:

### Option 1: Single README (Current)
Document all filters in this README file with sections for each filter.

### Option 2: Individual Markdown Files
Create separate `.md` files for each filter (e.g., `necromancer-summoner.md` for `necromancer-summoner.xml`).

## Sample Filter Categories

### By Class
- **Acolyte**: Death Knight, Necromancer, Warlock builds
- **Mage**: Runemaster, Sorcerer, Spellblade builds  
- **Primalist**: Beast Master, Druid, Shaman builds
- **Rogue**: Bladedancer, Marksman builds
- **Sentinel**: Forge Guard, Paladin, Void Knight builds

### By Playstyle
- **Melee Builds**: Close combat focused filters
- **Ranged Builds**: Projectile and spell focused filters
- **Minion Builds**: Pet-focused build filters
- **Hybrid Builds**: Multi-approach build filters

### By Progression Stage
- **Campaign**: Leveling and story progression
- **Early Endgame**: Monolith progression
- **Late Endgame**: High corruption pushing
- **Crafting Focus**: Specific crafting material priorities

## Adding Sample Filters

To add a new sample filter:

1. **Add the XML file** to this directory with a descriptive name
2. **Document the filter** (see structure above)
3. **Test the filter** in-game to verify effectiveness
4. **Update this README** if using the single-file approach

## Filter Analysis

When analyzing sample filters, consider:
- **Rule Count**: How close to the 75-rule limit
- **Priority Order**: Which items are filtered first
- **Affix Focus**: What stats are prioritized
- **Base Type Coverage**: Which item categories are included
- **Unique Item Handling**: How named items are managed

## Learning Objectives

From these samples, the generator should learn:
- Rule prioritization strategies
- Affix selection patterns
- Class-specific requirements
- Progression-appropriate filtering
- Efficient rule usage within the 75-rule limit