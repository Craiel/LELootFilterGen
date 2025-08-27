# TODO - Last Epoch Loot Filter Generation Project

## EXECUTION PLAN OVERVIEW

This document outlines the comprehensive plan to refactor the Last Epoch database builder and web data parsing system. The work is divided into phases to ensure systematic completion and proper testing.

**CRITICAL CONSTRAINTS:**
- Maximum 75 rules per loot filter XML
- Never manually edit XML files - always use generation scripts
- Data folder is OFF-LIMITS except for database generation
- All scraped data goes to WebData/ folder only

---

## PHASE 1: Database Structure Cleanup ✋ **HIGH PRIORITY**

### 1.1 Remove Irrelevant Metadata Fields
**Files to modify:** `scripts/build-database.js`
**Action:** Remove "source" and "notes" fields from generated database entries
**Rationale:** Database should be self-contained without metadata about data origins
**Status:** ✅ COMPLETED

### 1.2 Fix Unique Item ID Handling  
**Files to modify:** `scripts/build-database.js`, `scripts/html-item-parser.js`
**Action:** Preserve template filter IDs instead of replacing with HTML hashes, the id from the html web files can be safely ignored
**Details:** Ensure missing items retain template IDs, parsed items keep original IDs
**Status:** ✅ COMPLETED

### 1.3 Reconcile UniqueItems Folder Data
**Files to modify:** `scripts/build-database.js`
**Action:** Map UniqueItems folder data to template filter IDs via name lookup
**Goal:** Eliminate duplicates - total items should match TemplateFilter references
**Dependencies:** Requires analysis of Data/UniqueItems/* and TemplateFilters/uniques/* and TemplateFilters/sets/*
**Status:** ✅ COMPLETED

### 1.4 Remove Redundant Rarity Field
**Files to modify:** `scripts/build-database.js`
**Action:** Remove rarity field from unique and set items (inherently unique/set)
**Status:** ✅ COMPLETED

### 1.5 Disable Subtype Processing Temporarily
**Files to modify:** `scripts/build-database.js`
**Action:** Skip subtype parsing until complete data is available
**Status:** ✅ COMPLETED

### 1.6 Improve Validation Output Format
**Files to modify:** `scripts/build-database.js`
**Action:** Separate validation issues into dedicated file, improve formatting
**New file:** `Data/validation-report.txt` or similar
**Status:** ✅ COMPLETED

---

## PHASE 2: Web Data Processing Modernization ✋ **HIGH PRIORITY**

### 2.1 Remove Legacy Scraping System
**Files to modify:** `scripts/build-database.js`, remove `scripts/scraper.js`, `scripts/curl-scraper.js`
**Action:** Remove all automatic scraping functionality and references
**Status:** ✅ COMPLETED

### 2.2 Update HTML Parser for New File Location
**Files to modify:** `scripts/html-item-parser.js`
**Action:** Change path from `WebData/scraped/ItemList_Manual.html` to `WebData/ItemList.html`
**Status:** ✅ COMPLETED

### 2.3 Implement Set Data Parser
**New file:** `scripts/html-set-parser.js` 
**Action:** Parse `WebData/Sets.html` for set data
**Data location:** `<div class="item-card item-itemset">` elements
**Cross-reference:** Map to existing set item IDs in database
**Validation:** Log warnings for unknown set items or orphaned database sets
**Status:** ✅ COMPLETED

### 2.4 Implement Affix Parsing System
**New files:** `scripts/html-prefix-parser.js`, `scripts/html-suffix-parser.js`
**Source files:** `WebData/Prefixes.html`, `WebData/Suffixes.html`
**Action:** Parse affix data and cross-reference with TemplateFilters
**Master source:** TemplateFilters files are authoritative
**Validation:** Log mismatches between HTML and template data
**Status:** ✅ COMPLETED

### 2.5 Implement Skill Data Parser
**New file:** `scripts/html-skill-parser.js`
**Source:** `WebData/SkillOverview.html`
**Action:** Parse navigation panel for skill categorization
**Data structure:** 
  - Classes: Primalist, Mage, Sentinel, Acolyte, Rogue
  - Masteries: Sub-categories under classes
  - Skills: Individual items under categories/masteries
  - Other headers: Preserve as-is for non-class skill sources
**Status:** ✅ COMPLETED

---

## PHASE 3: Browser Automation Utilities 🔧 **MEDIUM PRIORITY**

### 3.1 Create Tampermonkey Skill Data Scraper
**New file:** `utils/tampermonkey-skill-scraper.js`
**Purpose:** Navigate skill overview, capture `<div class="ability-card">` data
**Manual process:** User copies/pastes captured data into files
**Reference:** `WebData/SkillSample_Abyssal_Orb.html` shows target structure
**Status:** ✅ COMPLETED

### 3.2 Extend Tampermonkey for Ailments  
**Extension of:** `utils/tampermonkey-skill-scraper.js`
**Source:** `WebData/AilmentsOverview.html`
**Target element:** `<div class="ailment-card">`
**Status:** ✅ COMPLETED

### 3.3 Extend Tampermonkey for Minions
**Extension of:** `utils/tampermonkey-skill-scraper.js`  
**Source:** `WebData/MinionsOverview.html`
**Target element:** `<div class="entity-card">`
**Status:** ✅ COMPLETED

---

## PHASE 4: Final Integration 🔧 **MEDIUM PRIORITY**

### 4.1 Integrate New Parsers into Existing Build Process
**Files to modify:** `scripts/build-database.js`
**Action:** Extend existing HTML parsing to include Sets, Affixes, Skills
**Keep:** Current `npm run build-database` command structure
**Status:** ✅ COMPLETED

### 4.2 Clean Up Legacy Scraping Code
**Files to remove:** `scripts/scraper.js`, `scripts/curl-scraper.js`
**Action:** Remove obsolete files only
**Status:** ✅ COMPLETED

---

## EXECUTION ORDER & DEPENDENCIES

```
Phase 1 (Database Cleanup) - Can be done in parallel
Phase 2 (Web Data Processing) - Can be done in parallel  
Phase 3 (Browser Utilities) - Can be done in parallel
Phase 4 (Integration) - Requires Phases 1-2 completion
```

---

## SUCCESS CRITERIA

✅ **Database Cleanup Complete:** Clean, self-contained database without metadata pollution
✅ **Parser Modernization:** HTML-based parsing replaces legacy scraping
✅ **Data Integrity:** No duplicate items, proper ID mapping, comprehensive validation
✅ **Cross-Reference System:** All game data properly linked and validated
✅ **Maintainable Codebase:** Clear separation of concerns, good documentation
✅ **Working Build Process:** `npm run build-database` works end-to-end

---

## RESOLVED ITEMS

### PHASE 1: Database Structure Cleanup ✅ **COMPLETED**

#### 1.1 Remove Irrelevant Metadata Fields ✅
- Removed "source" and "notes" fields from generated database entries
- Modified `scripts/build-database.js` and `scripts/html-item-parser.js`
- Database is now self-contained without metadata about data origins

#### 1.2 Fix Unique Item ID Handling ✅
- Preserved template filter IDs instead of replacing with HTML hashes
- HTML web file IDs are safely ignored as intended
- Missing items retain template IDs, parsed items keep original IDs

#### 1.3 Reconcile UniqueItems Folder Data ✅
- Mapped UniqueItems folder data to template filter IDs via name lookup
- Successfully integrated 444 unique items and 47 set items
- Eliminated duplicates - total items match TemplateFilter references

#### 1.4 Remove Redundant Rarity Field ✅
- Removed rarity field from unique and set items (inherently unique/set)
- Database structure cleaner and more logical

#### 1.5 Disable Subtype Processing Temporarily ✅
- Skipped subtype parsing until complete data is available
- Prevents incomplete/incorrect subtype data pollution

#### 1.6 Improve Validation Output Format ✅
- Created dedicated `Data/validation-report.txt` with structured formatting
- Improved readability and separate validation issues tracking
- Added comprehensive summary statistics

### PHASE 2: Web Data Processing Modernization ✅ **COMPLETED**

#### 2.1 Remove Legacy Scraping System ✅
- Removed all automatic scraping functionality and references
- Deleted `scripts/scraper.js` and `scripts/curl-scraper.js`
- Clean modernized codebase

#### 2.2 Update HTML Parser for New File Location ✅
- Changed path from `WebData/scraped/ItemList_Manual.html` to `WebData/ItemList.html`
- Updated for new manual file management approach

#### 2.3 Implement Set Data Parser ✅
- Created `scripts/html-set-parser.js` 
- Parses `WebData/Sets.html` for set data from `<div class="item-card item-itemset">` elements
- Cross-references with existing set item IDs in database
- Validates and logs warnings for unknown sets or orphaned database sets

#### 2.4 Implement Affix Parsing System ✅
- Created `scripts/html-prefix-parser.js` and `scripts/html-suffix-parser.js`
- Parses `WebData/Prefixes.html` and `WebData/Suffixes.html`
- Successfully processed 683 prefixes and 263 suffixes
- Cross-references with TemplateFilters with proper validation

#### 2.5 Implement Skill Data Parser ✅
- Created `scripts/html-skill-parser.js`
- Parses `WebData/SkillOverview.html` navigation panel for skill categorization  
- Successfully extracted 156 skills across 5 classes (Primalist, Mage, Sentinel, Acolyte, Rogue)
- Handles masteries and preserves non-class skill sources

---

## PHASE 6: PROJECT RESTRUCTURING 🏗️ **✅ COMPLETED**

*This phase was executed after successful completion and testing of Phases 1-4*

### 6.1 Analyze Shared vs Project-Specific Files ✅
**Action:** Audit all current files to determine which belong to each sub-project
**Analysis completed:**
- Database Generation files (templates, parsers, web data) → `database-generator/`
- Filter Generation files (sample filters, generation logic) → `filter-generator/`
- Shared files (game rules, constraints, documentation) → `shared/`
- Root-level configuration (package.json, .gitignore, etc.) → Root orchestration
**Status:** ✅ COMPLETED

### 6.2 Design Directory Structure
**Proposed structure:**
```
/LELootFilterGen/
├── shared/                          # Shared resources
│   ├── docs/
│   │   ├── GAME_RULES.md           # Game mechanics (both projects need)
│   │   ├── CONSTRAINTS.md          # Technical constraints
│   │   └── DEFENSIVE_STRATEGIES.md # Game strategies
│   └── utils/                       # Shared utilities if any
├── database-generator/              # Database Generation Sub-Project
│   ├── scripts/                     # All database build scripts
│   ├── TemplateFilters/            # XML templates
│   ├── WebData/                    # HTML files for parsing
│   ├── Data/                       # Generated database output
│   ├── Overrides/                  # Manual data corrections
│   ├── docs/
│   │   └── DATABASE_ARCHITECTURE.md
│   ├── package.json                # Database-specific dependencies
│   └── README.md                   # Database generation instructions
├── filter-generator/               # Filter Generation Sub-Project  
│   ├── src/                        # Filter generation logic
│   ├── SampleFilters/             # Example filters for learning
│   ├── generated/                 # Output folder for generated filters
│   ├── docs/
│   │   ├── FILTER_DESIGN.md       # Filter design methodology
│   │   └── CLASS_BUILD_DEFINITION.md
│   ├── package.json               # Filter-specific dependencies
│   └── README.md                  # Filter generation instructions
├── README.md                       # Root project overview
├── .gitignore                     # Global ignore rules
└── CLAUDE.md                      # Updated for new structure
```
**Status:** ✅ COMPLETED

### 6.3 Create Database Generator Sub-Project
**New directory:** `database-generator/`
**Files to move:**
- `scripts/` → `database-generator/scripts/`
- `TemplateFilters/` → `database-generator/TemplateFilters/`
- `WebData/` → `database-generator/WebData/`
- `Data/` → `database-generator/Data/`
- `Overrides/` → `database-generator/Overrides/`
- `utils/tampermonkey-*.js` → `database-generator/utils/`
**New files needed:**
- `database-generator/package.json` (subset of dependencies)
- `database-generator/README.md` (database-focused instructions)
- `database-generator/.gitignore` (database-specific ignores)
**Status:** ✅ COMPLETED

### 6.4 Create Filter Generator Sub-Project  
**New directory:** `filter-generator/`
**Files to move:**
- `src/` → `filter-generator/src/`
- `SampleFilters/` → `filter-generator/SampleFilters/`
**New files needed:**
- `filter-generator/generated/` (output directory)
- `filter-generator/package.json` (subset of dependencies)
- `filter-generator/README.md` (filter-focused instructions)
- `filter-generator/.gitignore` (filter-specific ignores)
**Database integration:** Filter generator reads from `../database-generator/Data/`
**Status:** ✅ COMPLETED

### 6.5 Create Shared Resources Structure
**New directory:** `shared/`
**Files to move:**
- `GAME_RULES.md` → `shared/docs/GAME_RULES.md`
- `CONSTRAINTS.md` → `shared/docs/CONSTRAINTS.md`
- `DEFENSIVE_STRATEGIES.md` → `shared/docs/DEFENSIVE_STRATEGIES.md`
**Split existing files:**
- `ARCHITECTURE.md` → Split into database and filter specific docs
- `FILTER_DESIGN.md` → `filter-generator/docs/FILTER_DESIGN.md`
- Database architecture → `database-generator/docs/DATABASE_ARCHITECTURE.md`
**Status:** ✅ COMPLETED

### 6.6 Update Build Commands and Scripts
**Root package.json changes:**
```json
{
  "scripts": {
    "build-database": "cd database-generator && npm run build",
    "generate-filter": "cd filter-generator && npm run generate",
    "install-all": "npm install && cd database-generator && npm install && cd ../filter-generator && npm install"
  }
}
```
**Database generator commands:**
- `npm run build` - Build database
- `npm run parse-templates` - Parse templates only
- `npm run validate` - Validate data integrity
**Filter generator commands:**
- `npm run generate` - Generate filter
- `npm start` - Interactive filter generation
- `npm run validate-filter` - Check 75-rule limit
**Status:** ✅ COMPLETED

### 6.7 Update Documentation and References
**Files to update:**
- Root `README.md` - Overview of both sub-projects
- `CLAUDE.md` - Updated paths and structure guidance
- All documentation cross-references between projects
- Git ignore patterns for new structure
**Database generator focus:**
- Template parsing and data extraction
- HTML parsing and validation  
- Database integrity and completeness
**Filter generator focus:**
- Class builds and gameplay strategies
- Filter rule optimization (75-rule limit)
- Sample filter analysis and learning
**Status:** ✅ COMPLETED

### 6.8 Verify Project Separation
**Testing requirements:**
- Database generator works independently 
- Filter generator can consume generated database
- No circular dependencies between projects
- Both projects maintain their own dependencies
- Shared resources accessible to both
**Database outputs must be stable:** Filter generator shouldn't break when database is rebuilt
**Status:** ✅ COMPLETED

### 6.9 Update Development Workflow
**Typical workflow:**
1. Developer runs database generation: `npm run build-database`
2. Database outputs stable data files
3. Developer works on filter generation: `npm run generate-filter`
4. Filter generator reads stable database without rebuilding it
**Claude Code benefits:**
- Smaller, focused context per sub-project
- Clear separation of concerns
- Reduced confusion about which files are relevant
- Easier to maintain and extend each system independently
**Status:** ✅ COMPLETED

### 6.10 Clean Up Root Package.json Dependencies
**Files to modify:** Root `package.json`
**Action:** Audit all dependencies and scripts after restructuring
**Review needed:**
- Remove dependencies that moved to sub-projects
- Remove obsolete scripts that are now in sub-projects
- Keep only root-level orchestration commands
- Verify all remaining dependencies are actually used at root level
**Goal:** Clean, minimal root package.json with only necessary shared dependencies
**Status:** ✅ COMPLETED - **Must be done LAST after all file moves**

---

### PHASE 6 SUCCESS CRITERIA

✅ **Clean Separation:** Database and filter generation are independent projects  
✅ **Shared Resources:** Common game knowledge accessible to both projects
✅ **Stable Interface:** Database output format is consistent for filter consumption
✅ **Focused Context:** Each sub-project has only relevant files and documentation
✅ **Maintained Functionality:** All existing features work after restructuring
✅ **Developer Experience:** Clear workflow and build commands for each project

---

---

## PHASE 6 COMPLETION SUMMARY ✅

**Restructuring Successfully Completed on 2025-08-26**

### ✅ All Phase 6 Success Criteria Met:

✅ **Clean Separation:** Database and filter generation are now independent projects  
✅ **Shared Resources:** Common game knowledge accessible to both projects via `shared/`
✅ **Stable Interface:** Database output format (`game-database.jsonl`) is consistent for filter consumption
✅ **Focused Context:** Each sub-project has only relevant files and documentation
✅ **Maintained Functionality:** All existing features work after restructuring
✅ **Developer Experience:** Clear workflow and build commands for each project

### 📊 Final Project Structure:
```
/LELootFilterGen/                    # Root orchestration
├── database-generator/              # Self-contained database generation
├── filter-generator/               # Self-contained filter generation  
├── shared/                         # Common game knowledge
├── README.md                       # Updated project overview
└── CLAUDE.md                       # Updated development guidance
```

### 🚀 Development Workflow:
```bash
# First-time setup
npm run install-all

# Regular workflow
npm run build-database      # Build game database
npm run generate-filter     # Generate loot filters

# Individual sub-project work
cd database-generator && npm run build
cd filter-generator && npm start
```

### 🎯 Benefits Achieved:
- **Cleaner Architecture**: Each sub-project has focused responsibilities
- **Improved Maintainability**: Changes to database logic don't affect filter logic
- **Better Testing**: Each sub-project can be tested independently
- **Enhanced Claude Code Experience**: Smaller, more focused contexts per sub-project
- **Future-Proof Design**: Easy to extend either system independently

**🎉 Phase 6 Project Restructuring: COMPLETE**