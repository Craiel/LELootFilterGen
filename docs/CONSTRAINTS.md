# Project Constraints

This document outlines the critical technical and design constraints for the LELootFilterGen project.

## ⚠️ CRITICAL: Last Epoch 75-Rule Limit

**This is the most important constraint in the entire project.**

### Rule
ALL Last Epoch loot filter XML files are limited to a maximum of **75 rules**.

### Scope
This constraint applies to:
- ✅ All template XML files we generate
- ✅ All affix template files
- ✅ All unique item template files
- ✅ All set item template files
- ✅ All generated loot filter output files
- ✅ Any XML file that will be loaded into Last Epoch

### Implementation
- Template generators use **70 rules maximum** to leave room for additional conditions
- All generation scripts must enforce this limit
- All validation must check rule count
- Documentation must prominently display this constraint

### Consequences of Violation
- Filters will not work properly in Last Epoch
- Game may reject the filter entirely
- Wasted development time
- Poor user experience

### Enforcement
- Generation scripts limit to 70 rules
- Add rule count validation to all generators
- Include rule count in all template summaries
- Verify rule count in all generated files

## Other Constraints

### Template File Organization
- Use clear naming conventions for template files
- Group related templates in subdirectories
- Maintain generation summary files for tracking

### Data Persistence
- Manual overrides must survive template regeneration
- Backup important data before regeneration
- Use structured JSON format for override data

### Documentation
- All template procedures must be documented
- Include usage instructions for all generated templates
- Maintain up-to-date file listings in READMEs

---

**Remember: The 75-rule limit is non-negotiable. Always verify rule count before generating or releasing any XML files.**