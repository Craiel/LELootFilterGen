# Last Epoch Loot Filter Generator

A Node.js suite to generate and edit loot filter XML files for Last Epoch.

## Overview

This tool helps create optimized loot filters for Last Epoch by:

1. **Parsing template XML files** to build a comprehensive game data database
2. **Managing template files** that can be updated as the game evolves
3. **Generating custom filters** based on class and gameplay descriptions using AI assistance

## Key Features

- **⚠️ 75-Rule Optimization**: **CRITICAL** - Respects Last Epoch's strict 75-rule filter limit
- **Template-Driven**: Uses XML templates that can be updated with game patches
- **AI-Assisted Generation**: Creates filters based on natural language descriptions
- **Manual Override Support**: Preserves custom data additions through re-generation
- **Sample Learning**: Learns from existing filter examples

## Quick Start

```bash
# Install dependencies
npm install

# Parse template files and build database
npm run build-database

# Force rebuild database (overwrites all data)
npm run build-database -- --force

# Build database for specific game version  
npm run build-database -- --version=1.3.0.5

# View database statistics and completion status
npm run database-info

# Manual data entry using override files in Data/overrides/
# Edit Data/overrides/affixes.json, uniques.json, sets.json

# Generate a filter (interactive)
npm run generate-filter

# View all available commands
npm start --help
```

## Project Structure

```
├── src/                 # Main application source
├── Data/                # Intermediate database files
├── TemplateFilters/     # XML templates with game data
├── SampleFilters/       # Example filters for reference
├── generated/           # Generated loot filter outputs
└── docs/                # Additional documentation
```

## Workflow

### 1. Database Creation
Parse template XML files to create intermediate database:
```bash
npm run build-database
```

The enhanced database builder:
- **Tracks game version** for compatibility with Last Epoch updates
- **Maps all IDs** to names from filled-out templates  
- **Manual override system** for adding discovered data
- **Comprehensive logging** with detailed build logs
- **Duplicate detection** and validation warnings
- **Git-friendly format** (JSONL) for version control
- **Preserves manual data** through regeneration
- **HTML parsing ready** for future external data sources
- **Calculates completion** percentages for data collection progress

### 2. Filter Generation
Generate custom filters based on build descriptions:
```bash
npm run generate-filter --class "Necromancer" --build "minion summoner"
```

### 3. Template Management
Update template files as game data changes, then rebuild:
```bash
npm run build-database --force
```

## Template System

Template XML files in `TemplateFilters/` provide the foundation for filter generation:

- `MasterTemplate1.xml` - Core game data structure
- `Colors.xml` - Complete color reference for loot filter highlighting  
- `Sounds.xml` - Complete sound reference for loot filter audio alerts
- `MapIcon_LootBeam.xml` - Complete loot beam reference for map indicators
- Additional templates for missing data categories
- Each template documented for easy maintenance

## Filter Rules

Generated filters include:
- **General Rules**: Base item filtering
- **Affix Rules**: Specific stat requirements  
- **Unique Rules**: Named item handling
- **Class-Specific Rules**: Tailored to build requirements

All filters respect the 75-rule maximum limit.

## Template Generation

Generate template files for in-game data collection:

```bash
# Generate affix templates (946 affixes, IDs 0-945)
node scripts/generate-affix-templates.js

# Analyze unique vs set item structure in master template
node scripts/analyze-unique-set-structure.js

# Generate unique item templates (403 unique items, excluding sets)
node scripts/generate-unique-templates.js

# Generate set item templates (47 set items)
node scripts/generate-set-templates.js

# Force regeneration (overwrites manual edits)
node scripts/generate-affix-templates.js --force
node scripts/generate-unique-templates.js --force
node scripts/generate-set-templates.js --force
```

**⚠️ Warning**: Template generators include safeguards to prevent accidental overwriting of manually edited templates. Use `--force` flag only when intentionally regenerating.

## Requirements

- Node.js 16.0.0 or higher
- Last Epoch game installation (for template updates)

## License

MIT