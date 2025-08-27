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
- Alternatively: Read `game-database.jsonl` and search for affix with specific ID

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
├── game-database.jsonl          # All affixes, sets, colors, sounds, beams
├── Prefixes/                    # 683 individual prefix affix files
├── Suffixes/                    # 263 individual suffix affix files  
├── UniqueItems/                 # 403 individual unique item files
├── Skills/                      # Skills organized by class
├── indexes/                     # O(1) lookup indexes
│   ├── id-lookup.json          # Fast ID-based lookups
│   ├── tags-index.json         # Tag-based filtering
│   └── mechanics-index.json    # Game mechanics relationships
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

# Or search by ID in main database  
grep '"id":38,' game-database.jsonl
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

## Current Limitations & Pain Points

❌ **No tag-based searching** - Must manually parse files to find items by tags  
❌ **No fast ID lookups** - Must search through large JSONL files  
❌ **No game mechanics indexing** - Can't easily find what affects specific mechanics  
❌ **Scattered data** - 403+ separate files make bulk analysis difficult  
❌ **No cross-references** - Can't easily find relationships between items/skills/affixes  

## Recommended Immediate Actions

When looking up data frequently:

1. **Use grep for ID searches** in `game-database.jsonl`
2. **Use direct file access** for unique items (convert names to snake_case)
3. **Check validation-report.txt** for data quality issues
4. **Use database-info script** for overview: `npm run info`

## Planned Optimizations (Coming Soon)

The following indexes are planned to solve current limitations:

### Fast ID Lookups
- `indexes/id-lookup.json` - O(1) lookup for any ID
- Direct access: `indexes.affixes["38"]`, `indexes.uniques["UAwRgrATA7BQ"]`

### Tag-Based Searching  
- `indexes/tags-index.json` - Find all items/skills/affixes by tag
- Query: `findByTag("Minion")` returns all minion-related data

### Game Mechanics Indexing
- `indexes/mechanics-index.json` - Find what affects specific mechanics
- Query: `findMechanic("CriticalStrike")` returns all crit-related items

### Search API
Programmatic interface for complex queries:
```javascript
// Planned API (not yet implemented)
const db = require('./database-search');
db.findByID("38")                    // Get affix ID 38
db.findByTag("Minion")               // All minion-related data  
db.findByTags(["Minion", "Fire"])    // Intersection of tags
db.findMechanic("CriticalStrike")    // What affects crit strikes
```

## Performance Tips

**For Current System:**
- Use `grep` and `rg` for text searches instead of loading files in code
- Cache frequently accessed data in memory when doing bulk operations
- Use the individual JSON files for single item lookups
- Check file modification times to avoid re-parsing unchanged data

**When New Indexes Are Available:**
- Always use ID indexes for single item lookups
- Use tag indexes for filtering operations  
- Use mechanics indexes for build-related queries
- Combine index results for complex multi-criteria searches

## Common Query Examples

### Current Method (Manual)
```bash
# Find all fire-related affixes (manual search)
grep -i "fire" game-database.jsonl

# Find unique item with "minion" in description  
find UniqueItems/ -name "*.json" -exec grep -l -i "minion" {} \;

# Get affix count
npm run info
```

### Planned Method (Optimized)
```bash
# Find all fire-related data (future)
node -e "console.log(require('./indexes/tags-index.json').byTag.Fire)"

# Find affix ID 38 (future)
node -e "console.log(require('./indexes/id-lookup.json').affixes['38'])"

# Find what affects critical strikes (future)  
node -e "console.log(require('./indexes/mechanics-index.json').byMechanic.CriticalStrike)"
```

## Data Quality Notes

- **77 duplicate affixes** identified in validation report
- **Missing IDs** in ranges: Uniques (5,16,26,57,63...), Sets (6,7,8,9,10...)
- **1396 total items** discovered (946 affixes, 403 uniques, 47 sets)
- **Game version 1.3.0.4** as of last build

## File Update Process

When database is rebuilt:
- All files in `Data/` folder are regenerated (except this guide)
- Individual `UniqueItems/*.json` files are recreated
- `game-database.jsonl` is completely rebuilt
- Indexes will be automatically regenerated when implemented

---

*This guide will be updated when the optimized indexing system is implemented.*