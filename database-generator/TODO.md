# Database Optimization TODO

## Current Database Analysis

### Current Structure Issues
- **403 individual unique item JSON files** in `Data/UniqueItems/` - difficult to navigate and get overview
- **Main database file** `game-database.jsonl` contains all data in JSONL format (hard to read/navigate)  
- **Scattered information** across multiple files with no centralized index
- **No quick access** to specific data categories without parsing large files
- **Validation report** shows 77 duplicate affixes but no easy way to cross-reference
- **Build logs** are verbose but lack structured summary information

### Current Generated Files
- `database-generator/Data/` (2 files): `ailments.json`, `monsters.json` 
- `filter-generator/Data/` (403+ files): Main database + individual unique items + skills + metadata
- Total discoverable items: 1396 (946 affixes, 403 uniques, 47 sets)

## Core Access Requirements
Based on frequent usage patterns, we need optimized indexes for:

1. **Tag-Based Lookups**: Find Items/Skills/Affixes by tags (e.g., "Minion", "Fire", "DoT")
2. **Game Mechanic Queries**: Find data that modifies specific mechanics (using tag relationships) 
3. **ID-Based Lookups**: Fast retrieval by ID (affixes, items, skills, etc.)

## Optimization Plan

### Phase 1: Core Index Generation (HIGH PRIORITY)
**Objective**: Enable the three critical access patterns efficiently

#### 1.1 ID Lookup Index (CRITICAL)
- Generate `Data/indexes/id-lookup.json` containing:
  - `affixes: { "0": {...}, "1": {...} }` - Direct affix ID to data mapping
  - `uniques: { "UAwRgrATA7BQ": {...} }` - Direct unique ID to data mapping  
  - `sets: { "5": {...} }` - Direct set ID to data mapping
  - `skills: { "skill_id": {...} }` - Direct skill ID to data mapping
  - **O(1) lookup time** for any ID-based query

#### 1.2 Tag-Based Indexes (CRITICAL)
- Generate `Data/indexes/tags-index.json` containing:
  - `byTag: { "Minion": { affixes: [1,5,23], uniques: ["abc","def"], skills: [...] } }`
  - `byMechanic: { "Fire": { affixes: [...], uniques: [...], skills: [...] } }`
  - `combinedTags: { "Minion+Fire": [...] }` - Pre-computed intersections for common combinations
  - **Fast filtering** by single or multiple tags
- Make Sure every data we have that contains Tags is indexed in some way here
- If data does not have tags that should have some add another todo entry to start tagging that data

#### 1.3 Game Mechanics Index (CRITICAL)  
- Generate `Data/indexes/mechanics-index.json` containing:
  - `byMechanic: { "CriticalStrike": { modifiers: [...], scalers: [...], triggers: [...] } }`
  - `mechanicRelationships: { "Ignite": ["Fire", "DoT", "Ailment"] }` - Tag hierarchies
  - `affixToMechanics: { "38": ["SpellDamage", "ElementalDamage"] }` - What mechanics each affix affects
  - **Discover what affects specific game mechanics**

#### 1.4 Master Index File
- Generate `Data/database-index.json` containing:
  - Summary statistics and file mappings
  - Index file metadata and timestamps  
  - Quick access to most common queries

### Phase 2: Enhanced Search Capabilities
**Objective**: Build on core indexes for complex queries

#### 2.1 Composite Search Indexes
- `Data/indexes/composite-search.json`: Pre-computed complex queries
  - Class + Tag combinations (e.g., "Acolyte + Minion")
  - Level range + mechanic combinations
  - Equipment slot + stat type combinations

#### 2.2 Relationship Mapping
- `Data/indexes/relationships.json`: Cross-references between data types
  - Which skills benefit from which affixes
  - Which uniques synergize with which skills  
  - Tag inheritance and mechanic overlap

### Phase 2: Overview Generation
**Objective**: Generate human-readable summaries and documentation

#### 2.1 Generate Overview Files
- `Data/overviews/database-summary.md`: Human-readable database statistics and health
- `Data/overviews/affixes-overview.md`: Affix guide with examples and usage
- `Data/overviews/uniques-catalog.md`: Unique items guide organized by build type
- `Data/overviews/data-issues.md`: Summary of validation issues, duplicates, missing data

#### 2.2 Create Quick Reference Guides  
- `Data/quick-reference/class-guides.json`: Per-class relevant affixes and uniques
- `Data/quick-reference/build-archetypes.json`: Common build patterns with relevant items
- `Data/quick-reference/missing-data.json`: Organized list of missing IDs and gaps

### Phase 3: Integration with Build Scripts
**Objective**: Integrate index generation into existing build pipeline

#### 3.1 Extend Database Builder
- Add index generation step to `scripts/build-database.js`
- Create new script `scripts/generate-indexes.js` 
- Update `scripts/database-info.js` to use new indexes for faster queries

#### 3.2 Create Index Validation
- Add index consistency checks to validation pipeline
- Ensure indexes are regenerated when source data changes  
- Add index file timestamps and dependency tracking

#### 3.3 Update Build Pipeline
- Modify npm scripts to include index generation
- Add `npm run build-indexes` command for standalone index rebuild
- Update `npm run info` to show index status and health

### Phase 4: Advanced Features
**Objective**: Add advanced search and analysis capabilities

#### 4.1 Search API
- Create `utils/database-search.js`: Programmatic search interface
- Support queries like: "Find all fire damage affixes for mage class"
- Enable complex filters: level ranges, multiple categories, etc.

#### 4.2 Data Analysis Tools
- `scripts/analyze-duplicates.js`: Deep dive into duplicate affix issues
- `scripts/analyze-gaps.js`: Identify missing data patterns and suggest fixes
- `scripts/export-csv.js`: Export data to CSV for external analysis

#### 4.3 Build Integration Helpers
- `utils/build-recommendations.js`: Suggest relevant items for build descriptions
- `utils/filter-optimization.js`: Analyze filter efficiency and suggest improvements

## Implementation Priority

### CRITICAL Priority (Immediate Impact - Core Access Patterns)
1. **ID Lookup Index** - O(1) lookup for any affix/unique/skill/set by ID
2. **Tag-Based Indexes** - Fast filtering by tags and game mechanics  
3. **Game Mechanics Index** - Find what affects specific mechanics
4. **Integration with Build Scripts** - Automated index generation

### High Priority (Enhanced Functionality)
1. **Composite Search Indexes** - Pre-computed complex tag combinations
2. **Search API** - Programmatic interface: `findByTag("Minion")`, `findByID("38")`
3. **Relationship Mapping** - Cross-references between skills/affixes/items

### Medium Priority (Quality of Life)
1. **Overview Documentation** - Human-readable guides and summaries
2. **Data Issues Analysis** - Better visibility into duplicates and gaps
3. **Quick Reference Guides** - Developer-friendly documentation

### Low Priority (Advanced Features)  
1. **Build Integration Helpers** - Smart recommendations based on tags
2. **Advanced Analysis Tools** - Deep data mining and optimization
3. **Export Tools** - CSV/spreadsheet exports for external analysis

## Technical Requirements

### File Structure
```
database-generator/Data/
├── indexes/               # Core lookup indexes (CRITICAL)
│   ├── id-lookup.json          # O(1) ID-based lookups
│   ├── tags-index.json         # Tag-based filtering  
│   ├── mechanics-index.json    # Game mechanics relationships
│   ├── composite-search.json   # Pre-computed complex queries
│   └── relationships.json      # Cross-references between data
├── overviews/            # Human-readable summaries
│   ├── database-summary.md
│   └── data-issues.md
├── quick-reference/      # Developer guides
│   └── api-examples.md
└── database-index.json   # Master index with metadata
```

### Critical Index File Examples

**id-lookup.json structure:**
```json
{
  "affixes": { "0": {...affix data...}, "1": {...} },
  "uniques": { "UAwRgrATA7BQ": {...unique data...} },
  "sets": { "5": {...set data...} },
  "skills": { "skill_id": {...skill data...} }
}
```

**tags-index.json structure:**
```json
{
  "byTag": {
    "Minion": { "affixes": [1,5,23], "uniques": ["abc"], "skills": ["def"] },
    "Fire": { "affixes": [12,38], "uniques": ["xyz"], "skills": ["ghi"] }
  },
  "combinedTags": {
    "Minion+Fire": { "affixes": [5], "uniques": [], "skills": [] }
  }
}
```

**mechanics-index.json structure:**
```json
{
  "byMechanic": {
    "CriticalStrike": { "modifiers": [5,6], "scalers": [45], "triggers": [12] }
  },
  "affixToMechanics": {
    "38": ["SpellDamage", "Fire", "ElementalDamage"]
  },
  "mechanicHierarchy": {
    "Fire": { "parent": "ElementalDamage", "children": ["Ignite", "Burning"] }
  }
}
```

### Integration Points
- Modify `scripts/build-database.js` to call index generation ✅ (copyClaudeGuide method added)
- Update `scripts/database-info.js` to use indexes for performance
- Add index validation to existing validation pipeline
- Ensure indexes are regenerated on template changes
- Copy `CLAUDE_DATA_LOOKUP.md` to Data folder during builds ✅ (implemented)

### Constraints
- **Maintain backward compatibility** - Don't break existing filter generation
- **Preserve git-friendly output** - Use consistent formatting and sorting
- **Keep indexes up-to-date** - Regenerate automatically with database builds
- **Minimal size overhead** - Indexes should be efficient, not duplicate all data

## Success Metrics
- **Reduced lookup time** - Find specific items/affixes in seconds, not minutes
- **Better data visibility** - Easy overview of database contents and issues
- **Improved developer experience** - Quick access to relevant data for development
- **Maintainable structure** - Clear organization that scales with data growth

## Notes
- Indexes should be generated, not manually maintained
- All new files must be compatible with existing CLAUDE.md constraints  
- Consider future needs: build recommendation system, filter optimization
- Keep performance in mind - indexes should speed up, not slow down builds