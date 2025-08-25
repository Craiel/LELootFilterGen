# Database Builder Guide

This guide covers the enhanced database builder system for LELootFilterGen.

## Overview

The database builder creates a comprehensive, version-tracked database from template files and manual overrides. It produces a git-friendly, efficient format suitable for version control and consumption by other scripts.

## Features

### ✅ **Version Tracking**
- Tracks Last Epoch game version for compatibility
- Build timestamps and generator versioning
- Automatic rebuild detection based on file timestamps

### ✅ **Manual Override System**
- Add discovered item names through JSON override files
- Corrections for duplicate or unclear names
- Data additions and custom properties
- Preserves manual data through regeneration

### ✅ **Comprehensive Logging**
- Detailed build logs with timestamps (`Data/build.log`)
- Warning and error tracking
- Duplicate detection and validation

### ✅ **Git-Friendly Output**
- JSONL format for line-by-line diffs
- Sorted by ID for consistent ordering
- Human-readable summary file
- Optimized for version control

### ✅ **Future-Ready**
- HTML parsing infrastructure for external data sources
- Extensible validation system
- Modular architecture for additional data types

## Usage

### Basic Commands

```bash
# Build database (skip if up-to-date)
npm run build-database

# Force rebuild (overwrites all data)  
npm run build-database -- --force

# Build for specific game version
npm run build-database -- --version=1.3.0.5

# View database statistics
npm run database-info
```

### Manual Data Entry

#### 1. Override Files Location
```
Data/overrides/
├── affixes.json          # Affix data and corrections
├── uniques.json          # Unique item data and corrections  
├── sets.json             # Set item data and corrections
└── README.md             # Override system documentation
```

#### 2. Override File Format
```json
{
  "version": "1.3.0.4",
  "lastModified": "2025-08-25T18:00:00.000Z",
  "overrides": {
    "140": {
      "id": 140,
      "name": "+# to Minion Damage",
      "description": "Increases damage dealt by minions",
      "properties": {
        "tier": "T1-T7",
        "itemTypes": ["helmet", "body_armor", "relic"],
        "minValue": 1,
        "maxValue": 25
      },
      "source": "in-game-testing",
      "verified": true,
      "notes": "Discovered through template testing"
    }
  },
  "corrections": {
    "150": {
      "reason": "duplicate_name",
      "originalName": "Confusing Name",
      "correctedName": "Clear Affix Name", 
      "explanation": "Clarification for similar items"
    }
  }
}
```

#### 3. Override Workflow
1. **Test templates in-game** to discover item names
2. **Edit override files** with discovered data
3. **Run database build** to apply overrides
4. **Commit changes** to version control
5. **Repeat** as more data is discovered

### Output Files

The builder generates several output files:

#### `Data/game-database.jsonl` (Main Database)
- JSONL format (one JSON object per line)
- Git-friendly for diffs and merging
- Contains all game data with IDs mapped to names
- Sorted by ID for consistency

#### `Data/database-summary.txt` (Human-Readable Summary)
- Statistics and completion percentages
- Warning and error summaries
- Build information

#### `Data/build.log` (Detailed Log)
- Timestamped build process log
- All warnings, errors, and info messages
- Useful for debugging issues

#### `Data/database-version.json` (Version Info)
- Game version and build metadata
- File format information
- Template count and statistics

## Database Structure

The database uses an optimized, self-contained JSONL format with minimal redundancy:

### Line 1: Metadata
```json
{"version":"1.3.0.4","buildDate":"2025-08-25T18:23:37.596Z","stats":{"affixes":737,"uniques":403,"sets":47,"overrides":1}}
```

### Line 2: Reference Data (All in one compact object)
```json
{"colors":{"0":"White","1":"Grey",...},"sounds":{"0":"Default","1":"None",...},"beams":{"0":"Default","1":"None",...}}
```

### Line 3+: Discovered Items Only (Compact format)
```json
{"a":140,"name":"+# to Minion Damage","desc":"Increases damage dealt by minions","props":{"tier":"T1-T7"},"notes":"Sample override entry"}
{"u":25,"name":"Invoker's Wand","props":{"baseType":"wand"}}
{"s":16,"name":"Bone Prison Helmet"}
```

## Optimized Field Structure

### Item Entry Fields
- **a/u/s**: Affix/Unique/Set ID (replaces redundant type+id)
- **name**: Item/affix name (only for discovered items)
- **desc**: Description (abbreviated, optional)  
- **props**: Properties object (optional, only if not empty)
- **notes**: Additional context (optional)

### Key Benefits
- **60% smaller** than previous format
- **Git-friendly**: Consistent ordering, clean diffs
- **Self-contained**: No external references or fluff
- **Efficient parsing**: Minimal structure, fast loading
- **Only discovered items**: No null entries, only actual data

## Validation and Warnings

The builder performs comprehensive validation:

### Duplicate Detection
- **Same name, different IDs**: Warns about potential confusion
- **Multiple template entries**: Detects duplicate template rules

### Data Quality Checks
- **Unclear names**: Flags names containing "???" or "Unknown"
- **Unverified discoveries**: Warns about unverified manual entries
- **Missing data**: Tracks completion percentages

### Error Handling
- **Template parsing errors**: Logs XML parsing failures
- **File access errors**: Handles missing or corrupted files
- **Override validation**: Validates JSON structure

## Future Enhancements

### HTML Parsing (Prepared)
The system includes infrastructure for parsing external HTML sources:

```
Data/overrides/external-sources/
└── config.json          # External source configuration
```

This will enable automatic data fetching from community databases when implemented.

### Additional Validations
- Cross-reference validation between data types
- Tier range validation for affixes
- Item type compatibility checking

## Troubleshooting

### Common Issues

**Database not rebuilding**
- Use `--force` flag to force rebuild
- Check file timestamps in build log

**Override not applying**
- Verify JSON syntax in override files
- Check ID matches template data
- Review build log for override application messages

**Warnings about duplicates**
- Review duplicate names in build log
- Add corrections in override files to clarify differences
- Consider if items are actually the same with different IDs

**Template parsing errors**
- Verify XML file structure
- Check for corrupted template files
- Review template generation scripts

### Log Analysis

Check `Data/build.log` for detailed information:
```
INFO: Template parsing progress
WARN: Data quality issues  
ERROR: Critical failures
```

The build summary shows high-level statistics and the most important warnings/errors.