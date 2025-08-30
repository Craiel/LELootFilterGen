# Common Mistakes & Solutions

This file documents generation errors and solutions discovered during the build analysis process. Claude should update this file whenever encountering and solving issues.

## Database Lookup Mistakes

### Affix Name Resolution Errors
*(Claude will document common affix lookup failures)*

- **Mistake**: [Description of the mistake]
- **Cause**: [Why it happened]
- **Solution**: [How to fix it]
- **Prevention**: [How to avoid it in future]
- **Analysis Date**: [When discovered]

### Skill Data Misinterpretation
*(Document cases where skill data was misunderstood)*

### Unique Item Compatibility Errors
*(Document cases where unique items were incorrectly analyzed)*

## Build Analysis Mistakes

### Scaling Stat Misidentification
*(Document cases where wrong stats were prioritized)*

- **Mistake**: Prioritizing player damage stats (physical damage, crit chance, crit multi) for pure minion builds
- **Cause**: Assuming player stats benefit minions when they don't
- **Solution**: For minion builds, focus on minion-specific affixes (minion damage, minion health, etc.)
- **Prevention**: Check if primary skill is minion-based and prioritize minion stats accordingly
- **Analysis Date**: 2025-08-29

- **Mistake**: Over-prioritizing minion survivability for high-defense companions
- **Cause**: Assuming all minions are fragile like skeletons
- **Solution**: Bears have very high defense and rarely die, so moderate minion health investment is sufficient
- **Prevention**: Consider base minion survivability when setting affix priorities
- **Analysis Date**: 2025-08-29

### Build Type Classification Errors
*(Document cases where builds were misclassified)*

### Synergy Oversight
*(Document cases where important skill synergies were missed)*

- **Mistake**: Missing specialized skill connections (Bear's Earthquake ability)
- **Cause**: Database may not contain all specialized skill data
- **Solution**: Consider that companions may use specialized versions of skills listed in secondary skills
- **Prevention**: Ask user about specialized skill connections when database data seems incomplete
- **Analysis Date**: 2025-08-29

- **Mistake**: Assuming unique item capabilities are always used
- **Cause**: Seeing item enables skill and assuming skill will be used
- **Solution**: Only include skill interactions if skill is explicitly mentioned in build OR fewer than 5 total skills
- **Prevention**: Focus on explicitly mentioned skills, treat unique item bonuses as potential rather than guaranteed
- **Analysis Date**: 2025-08-29

- **Mistake**: Missing skill level affixes (+N to skill levels) in affix mappings
- **Cause**: Focusing on damage/stat bonuses and overlooking skill level increases
- **Solution**: Always include skill level affixes for primary and secondary skills - they are extremely valuable
- **Prevention**: Check database for Level_of_[SkillName] affixes and prioritize them highly
- **Analysis Date**: 2025-08-29

- **Mistake**: Over-prioritizing cast speed for infrequent casting builds
- **Cause**: Assuming cast speed is always valuable for any build with skills
- **Solution**: Analyze actual casting frequency - bear builds cast very rarely
- **Prevention**: Consider build description and playstyle when setting cast speed priority
- **Analysis Date**: 2025-08-29

## Rule Generation Mistakes

### Rule Count Overruns
*(Document cases where filters exceeded 75-rule limit)*

### Affix Grouping Inefficiencies
*(Document cases where affixes could have been grouped more efficiently)*

### Progressive Rule Logic Errors
*(Document cases where level-gated rules were incorrect)*

## Multi-Build Optimization Mistakes

### Equipment Overlap Missed Opportunities
*(Document cases where equipment could have been shared between builds)*

### Incompatible Build Combinations
*(Document build combinations that don't work well together)*

## User Feedback Integration Patterns

### Common User Complaints
*(Document recurring user feedback themes)*

### Successful Adjustments
*(Document changes that resolved user issues)*

### Failed Adjustments
*(Document changes that didn't help or made things worse)*

## Learning From Sample Filters

### Misaligned Sample Analysis
*(Document cases where sample filters were misinterpreted)*

### Successful Pattern Extraction
*(Document successful learning from sample filters)*

---
*This file is automatically updated by Claude during the build analysis process.*