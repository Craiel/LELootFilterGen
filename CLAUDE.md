# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

For general Claude best practices and guidelines that apply across all projects, see [Claude Best Practices](D:\Dev\CLAUDE_BEST_PRACTICES.md).

## Project Overview

LELootFilterGen is a Node.js suite to generate and edit loot filter XML files for Last Epoch. The project is structured as two independent sub-projects:

1. **Database Generator** (`database-generator/`): Parse template XML files and web data to create structured database
2. **Filter Generator** (`filter-generator/`): Generate custom loot filters based on class/gameplay descriptions  
3. **Shared Resources** (`shared/`): Game knowledge and constraints used by both sub-projects

## Key Constraints

- **⚠️ CRITICAL: Last Epoch loot filters have a maximum of 75 rules total** - This applies to ALL XML files
- **⚠️ CRITICAL: NEVER manually edit XML files - ALWAYS use generation scripts** - All XML files are generated, not hand-edited
- **⚠️ CRITICAL: database-generator/Data folder is OFF-LIMITS except for database generation** - Only the database build process may write to `database-generator/Data/`. All scraped data goes to `database-generator/WebData/`
- Template XML files may change with game updates, requiring re-parsing
- Manual overrides in intermediate data must persist through re-generation
- All generated template files and loot filters must respect the 75-rule limit

## Development Commands

### Root Project Commands (orchestrates both sub-projects)
```bash
npm run install-all           # Install dependencies for all sub-projects
npm run build-database        # Build database (in database-generator)
npm run database-info         # Show database info
npm run generate-filter       # Generate filter (in filter-generator)  
npm start                     # Start filter generator
npm run lint                  # Lint both sub-projects
```

### Database Generator Commands
```bash
cd database-generator
npm run build                 # Build/rebuild database
npm run info                  # Show database statistics
npm run build-force           # Force rebuild (ignore timestamps)
npm run validate              # Validate data integrity only
```

### Filter Generator Commands  
```bash
cd filter-generator
npm run generate             # Generate a loot filter
npm start                    # Interactive mode
npm run validate-filter      # Validate existing filter
npm run sample-analysis      # Analyze sample filters
```

## Template System (Database Generator)

Template XML files in `database-generator/TemplateFilters/` contain game data that needs to be:
- Parsed to extract structured information
- Combined with manual additions/overrides  
- Maintained as game updates occur

The `MasterTemplate1.xml` provides key data points but lacks detailed game information, requiring additional template files.

## Data Flow

```
database-generator/TemplateFilters/ → database-generator/scripts/ → database-generator/Data/game-database.jsonl → filter-generator/src/
```

## Sub-Project Workflows

### Database Generator Workflow
1. Parse template files and web data
2. Apply manual overrides from `database-generator/Overrides/`
3. Validate data integrity and log issues
4. Generate `database-generator/Data/game-database.jsonl`

### Filter Generator Workflow  
1. Read database from `../database-generator/Data/game-database.jsonl`
2. Accept class/gameplay description input
3. Use AI assistance to determine appropriate rules
4. Generate XML filter with general rules, affix rules, and unique item rules
5. Ensure total rule count stays within 75-rule limit
6. Output to `filter-generator/generated/`

## Sample Filter Learning

Sample filters in `filter-generator/SampleFilters/` serve as learning examples, each documented with:
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