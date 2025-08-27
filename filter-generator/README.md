# Last Epoch Filter Generator

This sub-project generates custom loot filters for Last Epoch based on class builds and gameplay descriptions.

## Overview

The filter generator creates XML loot filter files by:
- **Analyzing class builds** - Understanding player requirements and priorities
- **Reading game database** - Using structured data from the database generator
- **Applying filter logic** - Converting requirements into XML filter rules
- **Respecting constraints** - Ensuring filters stay within the 75-rule limit

## Quick Start

```bash
# Install dependencies
npm install

# Start interactive filter generation
npm start

# Generate filter directly
npm run generate

# Validate existing filter
npm run validate-filter

# Analyze sample filters
npm run sample-analysis
```

## Key Components

### Source Code
- `src/index.js` - Main filter generation application
- `index.js` - Legacy entry point (may be updated)

### Learning Resources
- `SampleFilters/` - Example filters with documentation
- Each sample includes build archetype and strategy notes

### Output
- `generated/` - Output directory for created filters
- Filters are named based on class, build, and generation timestamp

## Filter Generation Process

1. **Input Analysis** - Process class/gameplay description
2. **Database Loading** - Read game data from database generator
3. **Rule Prioritization** - Determine most important filter rules
4. **Rule Generation** - Create XML filter rules
5. **Rule Optimization** - Ensure 75-rule limit compliance
6. **XML Output** - Generate final filter file

## Database Integration

The filter generator reads the game database:
```javascript
// Reads: Data/game-database.jsonl (and indexed files)
```

This provides access to:
- 946 affixes with complete T1-T8 tier data
- 440 unique items with full specifications  
- 47 set items with bonus information
- 136 skills organized by class
- Optimized indexes for O(1) lookups
- Reference data (colors, sounds, beams)

## Sample Filter Learning

Sample filters serve as learning examples:
- **Build Archetype** - What class/mastery combination
- **Filter Strategy** - Why certain rules were prioritized
- **Rule Breakdown** - How the 75-rule limit was managed
- **Priority Logic** - Which items are most/least important

## Critical Constraints

- **Maximum 75 rules total** - All generated filters must respect this limit
- **Never edit XML manually** - Always use generation system
- **Database dependency** - Requires built database from database generator
- **Build-specific focus** - Filters should match the described playstyle

## Dependencies

This project requires:
- Node.js 16+  
- commander (CLI interface)
- fs-extra (file system operations)
- xml2js (XML generation)

## Development Workflow

1. Ensure database is built: `cd ../database-generator && npm run build`
2. Develop filter logic: `npm run dev`
3. Test with sample builds: `npm run sample-analysis`
4. Generate production filters: `npm run generate`