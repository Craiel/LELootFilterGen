# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

- **Architecture**: See `ARCHITECTURE.md` for an overview of the project architecture and how it works
- **Class Build Definition**: See `CLASS_BUILD_DEFINITION.md` for a detailed description of class builds and how they are structured
- **Constraints**: See `CONSTRAINTS.md` for constraints on the project in general
- **Defensive Strategies**: See `DEFENSIVE_STRATEGIES.md` for a detailed description of defensive strategies in the game
- - **Filter Design**: See `FILTER_DESIGN.md` for details on how filters are designed and an overview on the process of designing a filter
- **Game Rules**: See `GAME_RULES.md` for a detailed description of all basic rules of the game