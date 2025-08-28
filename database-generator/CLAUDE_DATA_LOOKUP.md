# Claude Data Lookup Guide

This guide explains the most efficient methods for accessing Last Epoch game data in this database.

## Current Data Access Methods

### 1. ID-Based Lookups (Most Efficient)

**For Affixes:**
- Read individual files from `Prefixes/` or `Suffixes/` directories
- File names are snake_case versions of affix names  
- Example: `Prefixes/1_skeleton_and_increased_skeleton_damage.json`
- Each affix file contains:
  - `id`: Short identifier (e.g., "1_skeleton_and_incre")
  - `name`: Display name (e.g., "+1 Skeleton and Increased Skeleton Damage")  
  - `modificationColumns`: Column-based tier data with "Tier" and stat columns
  - `isIdolAffix`: Boolean indicating if it applies to idols
- Legacy: Previously available in single `game-database.jsonl` file (no longer exists)

**For Unique Items:**
- Read individual files from `UniqueItems/` directory
- File names are snake_case versions of item names
- Example: `UniqueItems/aarons_will.json` for "Aaron's Will"

**For Skills:**
- Read class-specific files from `Skills/` directory
- Files: `acolyte.json`, `mage.json`, `primalist.json`, `rogue.json`, `sentinel.json`
- Also: `from_equipment.json`, `invocations.json`, `other.json`

### 2. Browse by Category

**Current Structure:**
```
Data/
├── Prefixes/                    # 683+ individual prefix affix files
├── Suffixes/                    # 263+ individual suffix affix files  
├── Skills/                      # Skills organized by class
├── indexes/                     # O(1) lookup indexes
│   ├── id-lookup.json          # Fast ID-based lookups
│   ├── tags-index.json         # Tag-based filtering
│   └── mechanics-index.json    # Game mechanics relationships
├── ailments.json                # Game ailment data
├── colors-sounds-beams.json     # UI appearance data
├── global-tags.json             # Global tag definitions
├── idol-affixes.json            # Idol-specific affixes
├── item-affixes.json            # Item affix mappings
├── monsters.json                # Monster/enemy data
├── set-data.json                # Set item information
├── unique-items-overview.json   # Unique item summary
├── database-index.json          # Master database index
├── database-version.json        # Build metadata
├── build.log                    # Build process log
└── validation-report.txt        # Data quality issues
```

## Most Efficient Lookup Patterns (Current)

### Find Affix by Name or ID
```bash
# Direct file access (most efficient)
cat Prefixes/1_skeleton_and_increased_skeleton_damage.json

# Or use ID lookup index (most efficient)
node -e "console.log(require('./indexes/id-lookup.json').affixes['38'])"
```

### Understanding Affix Data Structure
```json
{
  "id": "1_skeleton_and_incre",
  "name": "+1 Skeleton and Increased Skeleton Damage",
  "modificationColumns": {
    "Tier": ["Tier 1", "Tier 2", "Tier 3", "Tier 4", "Tier 5", "Tier 6", "Tier 7", "Tier 8"],
    "Maximum Skeletons": ["1", "1", "1", "1", "1", "1", "1", "2"], 
    "Increased Skeleton Damage": ["10% to 14%", "15% to 19%", "20% to 24%", "25% to 29%", "30% to 50%", "75% to 90%", "91% to 120%", "192% to 240%"]
  },
  "isIdolAffix": false
}
```

### Find Unique Item by Name
```bash
# Convert name to snake_case filename
# "Aaron's Will" → "aarons_will.json"
cat UniqueItems/aarons_will.json
```

### Find Skills by Class
```bash
# For Acolyte skills
cat Skills/acolyte.json
```

### Find Items with Specific Tags
```bash
# Currently requires manual search through files
# No tag-based index exists yet
```

## Current Capabilities & Improvements

✅ **Tag-based searching** - Use `indexes/tags-index.json` for instant tag lookups  
✅ **Fast ID lookups** - O(1) access via `indexes/id-lookup.json`  
✅ **Game mechanics indexing** - Find mechanics relationships via `indexes/mechanics-index.json`  
✅ **Organized data** - Structured directories with logical grouping  
✅ **Cross-references** - Index files provide relationship mappings  

⚠️ **Considerations:**
- More files to manage than single JSONL approach
- Requires index awareness for optimal performance  

## Recommended Immediate Actions

When looking up data frequently:

1. **Use ID lookup index** in `indexes/id-lookup.json` for fastest access
2. **Use direct file access** for individual items (Prefixes/, Suffixes/, etc.)
3. **Use tag indexes** in `indexes/tags-index.json` for filtered searches
4. **Check validation-report.txt** for data quality issues
5. **Use database-info script** for overview: `npm run info`

## Available Optimizations (Current Features)

The following indexes are now available and solve previous limitations:

### Fast ID Lookups ✅ Available
- `indexes/id-lookup.json` - O(1) lookup for any ID
- Direct access: `indexes.affixes["38"]`, `indexes.uniques["UAwRgrATA7BQ"]`

### Tag-Based Searching ✅ Available
- `indexes/tags-index.json` - Find all items/skills/affixes by tag
- Query support for tag-based filtering

### Game Mechanics Indexing ✅ Available
- `indexes/mechanics-index.json` - Find what affects specific mechanics
- Query support for mechanics-based searches

### Current Usage Examples
Direct index access for complex queries:
```javascript
// Current API (implemented)
const idLookup = require('./indexes/id-lookup.json');
const tagsIndex = require('./indexes/tags-index.json');
const mechanicsIndex = require('./indexes/mechanics-index.json');

// Get affix by ID
const affix = idLookup.affixes["38"];

// Find by tag
const minionItems = tagsIndex.byTag["Minion"];

// Find by mechanic
const critItems = mechanicsIndex.byMechanic["CriticalStrike"];
```

## Performance Tips

**For Current System:**
- Use `grep` and `rg` for text searches instead of loading files in code
- Cache frequently accessed data in memory when doing bulk operations
- Use the individual JSON files for single item lookups
- Check file modification times to avoid re-parsing unchanged data

**With Current Indexes:**
- Always use ID indexes for single item lookups
- Use tag indexes for filtering operations  
- Use mechanics indexes for build-related queries
- Combine index results for complex multi-criteria searches

## Common Query Examples

### Current Method (Optimized)
```bash
# Find all fire-related data (using indexes)
node -e "console.log(require('./indexes/tags-index.json').byTag.Fire)"

# Find affix by ID (O(1) lookup)
node -e "console.log(require('./indexes/id-lookup.json').affixes['38'])"

# Find what affects critical strikes
node -e "console.log(require('./indexes/mechanics-index.json').byMechanic.CriticalStrike)"

# Find items with "minion" in data (direct file search)
find Prefixes/ Suffixes/ -name "*.json" -exec grep -l -i "minion" {} \;

# Get database statistics
npm run info
```

### Legacy Method (No Longer Available)
```bash
# These commands no longer work (game-database.jsonl removed)
# grep -i "fire" game-database.jsonl  # ❌ File no longer exists
# grep '"id":38,' game-database.jsonl  # ❌ File no longer exists
```

## Data Quality Notes

- **77 duplicate affixes** identified in validation report
- **Missing IDs** in ranges: Uniques (5,16,26,57,63...), Sets (6,7,8,9,10...)
- **1396 total items** discovered (946 affixes, 403 uniques, 47 sets)
- **Game version 1.3.0.4** as of last build

## File Update Process

When database is rebuilt:
- All files in `Data/` folder are regenerated (except this guide)
- Individual affix files in `Prefixes/` and `Suffixes/` are recreated
- All data files (ailments.json, monsters.json, etc.) are rebuilt
- Index files are automatically regenerated with current data

---

*Last Updated: 2025-08-27 - Updated for new structured database format with optimized indexes*