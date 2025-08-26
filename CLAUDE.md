# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

For general Claude best practices and guidelines that apply across all projects, see [Claude Best Practices](D:\Dev\CLAUDE_BEST_PRACTICES.md).

## Project Overview

LELootFilterGen is a Node.js suite to generate and edit loot filter XML files for Last Epoch. The project follows a multi-stage approach:

1. **Database Creation**: Parse template XML files to create intermediate database
2. **Template Management**: Maintain and document template XML files for game data
3. **Filter Generation**: Generate custom loot filters based on class/gameplay descriptions

## Key Constraints

- **⚠️ CRITICAL: Last Epoch loot filters have a maximum of 75 rules total** - This applies to ALL XML files
- **⚠️ CRITICAL: NEVER manually edit XML files - ALWAYS use generation scripts** - All XML files are generated, not hand-edited
- **⚠️ CRITICAL: Data folder is OFF-LIMITS except for database generation** - Only the database build process may write to `Data/`. All scraped data goes to `WebData/`
- Template XML files may change with game updates, requiring re-parsing
- Manual overrides in intermediate data must persist through re-generation
- All generated template files and loot filters must respect the 75-rule limit

## Development Commands

```bash
npm install                    # Install dependencies
npm start                     # Run the main application
npm run parse-templates       # Parse template XML files and build database
npm run generate-filter       # Generate a loot filter
npm run build-database        # Build/rebuild intermediate database
npm run lint                  # Run ESLint
npm run test                  # Run tests
```

## Template System

Template XML files in `TemplateFilters/` contain game data that needs to be:
- Parsed to extract structured information
- Combined with manual additions/overrides
- Maintained as game updates occur

The `MasterTemplate1.xml` provides key data points but lacks detailed game information, requiring additional template files.

## Filter Generation Process

1. Parse template files to build intermediate database
2. Accept class/gameplay description input
3. Use AI assistance to determine appropriate rules
4. Generate XML filter with general rules, affix rules, and unique item rules
5. Ensure total rule count stays within 75-rule limit

## Sample Filter Learning

Sample filters in `SampleFilters/` serve as learning examples, each documented with:
- Build archetype they serve
- Filter strategy and reasoning
- Rule prioritization approach

## Additional Documentation

### Game Knowledge
- **Game Systems**: See `docs/game/GAME_SYSTEMS.md` for comprehensive game mechanics, defensive strategies, and class build requirements

### Design & Process  
- **Filter Design**: See `docs/FILTER_DESIGN.md` for filter design principles and methodologies
- **Constraints**: See `docs/CONSTRAINTS.md` for project constraints and technical limitations

### Technical Implementation
- **Architecture**: See `docs/technical/ARCHITECTURE.md` for project architecture and component overview
- **Database Builder**: See `docs/technical/database-builder-guide.md` for database generation system
- **Skill Analysis**: See `docs/technical/SKILL_DATA_ANALYSIS.md` for skill data file analysis