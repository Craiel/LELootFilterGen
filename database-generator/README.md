# Last Epoch Database Generator

This sub-project handles parsing template XML files and web data to create a structured database for Last Epoch game data.

## Overview

The database generator processes:
- **Template XML files** - Game data from Last Epoch loot filter templates
- **Web data** - HTML and JSON files with additional game information
- **Manual overrides** - Corrections and additions to parsed data

## Quick Start

```bash
# Install dependencies
npm install

# Start interactive CLI
npm start
# OR
node index.js

# Force rebuild database (CLI option 1)
npm run build-force
```

## Key Components

### Architecture
- `index.js` - Interactive CLI with 2 options: Build Database, Generate Templates
- `scripts/build-database.js` - Main database builder
- `lib/parsers/` - HTML parsers for different data types
- `lib/generators/` - Template generation utilities
- `lib/generate-indexes.js` - Index generation system

### Data Sources
- `TemplateFilters/` - XML template files from Last Epoch
- `WebData/` - HTML and JSON files with game data
- `Overrides/` - Manual corrections and additions

### Output
- `Data/` directory with structured database files:
  - `Prefixes/` - Individual prefix affix JSON files
  - `Suffixes/` - Individual suffix affix JSON files  
  - `indexes/` - Optimized lookup index files
  - `database-index.json` - Master database index
  - `database-version.json` - Build metadata
- `Data/validation-report.txt` - Data validation results
- `Data/build.log` - Detailed build process log

## Data Processing Pipeline

1. **Parse Reference Data** - Colors, sounds, loot beams from template files
2. **Process Templates** - Extract affixes, uniques, sets from XML templates
3. **Parse Web Data** - Process HTML files for additional item information
4. **Apply Overrides** - Merge manual corrections and additions
5. **Validate Data** - Check for inconsistencies and missing information
6. **Build Database** - Generate structured database files and indexes

## Usage by Filter Generator

The filter generator sub-project reads the generated database:
```javascript
// Filter generator accesses: filter-generator/Data/ (structured files and indexes)
```

## Critical Constraints

- **Data folder is OFF-LIMITS except for database generation** - Only this project writes to `Data/`
- **Never manually edit XML files** - Always use generation scripts
- **All scraped data goes to WebData/** - Maintain separation of concerns
- **Template files may change** - Re-run build after game updates

## Dependencies

This project requires:
- Node.js 16+
- fs-extra (file system operations)
- jsdom (HTML parsing)
- xml2js (XML parsing)