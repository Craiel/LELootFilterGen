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
**Status:** ❌ PENDING

### 1.2 Fix Unique Item ID Handling  
**Files to modify:** `scripts/build-database.js`, `scripts/html-item-parser.js`
**Action:** Preserve template filter IDs instead of replacing with HTML hashes, the id from the html web files can be safely ignored
**Details:** Ensure missing items retain template IDs, parsed items keep original IDs
**Status:** ❌ PENDING

### 1.3 Reconcile UniqueItems Folder Data
**Files to modify:** `scripts/build-database.js`
**Action:** Map UniqueItems folder data to template filter IDs via name lookup
**Goal:** Eliminate duplicates - total items should match TemplateFilter references
**Dependencies:** Requires analysis of Data/UniqueItems/* and TemplateFilters/uniques/* and TemplateFilters/sets/*
**Status:** ❌ PENDING

### 1.4 Remove Redundant Rarity Field
**Files to modify:** `scripts/build-database.js`
**Action:** Remove rarity field from unique and set items (inherently unique/set)
**Status:** ❌ PENDING

### 1.5 Disable Subtype Processing Temporarily
**Files to modify:** `scripts/build-database.js`
**Action:** Skip subtype parsing until complete data is available
**Status:** ❌ PENDING

### 1.6 Improve Validation Output Format
**Files to modify:** `scripts/build-database.js`
**Action:** Separate validation issues into dedicated file, improve formatting
**New file:** `Data/validation-report.txt` or similar
**Status:** ❌ PENDING

---

## PHASE 2: Web Data Processing Modernization ✋ **HIGH PRIORITY**

### 2.1 Remove Legacy Scraping System
**Files to modify:** `scripts/build-database.js`, remove `scripts/scraper.js`, `scripts/curl-scraper.js`
**Action:** Remove all automatic scraping functionality and references
**Status:** ❌ PENDING

### 2.2 Update HTML Parser for New File Location
**Files to modify:** `scripts/html-item-parser.js`
**Action:** Change path from `WebData/scraped/ItemList_Manual.html` to `WebData/ItemList.html`
**Status:** ❌ PENDING

### 2.3 Implement Set Data Parser
**New file:** `scripts/html-set-parser.js` 
**Action:** Parse `WebData/Sets.html` for set data
**Data location:** `<div class="item-card item-itemset">` elements
**Cross-reference:** Map to existing set item IDs in database
**Validation:** Log warnings for unknown set items or orphaned database sets
**Status:** ❌ PENDING

### 2.4 Implement Affix Parsing System
**New files:** `scripts/html-prefix-parser.js`, `scripts/html-suffix-parser.js`
**Source files:** `WebData/Prefixes.html`, `WebData/Suffixes.html`
**Action:** Parse affix data and cross-reference with TemplateFilters
**Master source:** TemplateFilters files are authoritative
**Validation:** Log mismatches between HTML and template data
**Status:** ❌ PENDING

### 2.5 Implement Skill Data Parser
**New file:** `scripts/html-skill-parser.js`
**Source:** `WebData/SkillOverview.html`
**Action:** Parse navigation panel for skill categorization
**Data structure:** 
  - Classes: Primalist, Mage, Sentinel, Acolyte, Rogue
  - Masteries: Sub-categories under classes
  - Skills: Individual items under categories/masteries
  - Other headers: Preserve as-is for non-class skill sources
**Status:** ❌ PENDING

---

## PHASE 3: Browser Automation Utilities 🔧 **MEDIUM PRIORITY**

### 3.1 Create Tampermonkey Skill Data Scraper
**New file:** `utils/tampermonkey-skill-scraper.js`
**Purpose:** Navigate skill overview, capture `<div class="ability-card">` data
**Manual process:** User copies/pastes captured data into files
**Reference:** `WebData/SkillSample_Abyssal_Orb.html` shows target structure
**Status:** ❌ PENDING

### 3.2 Extend Tampermonkey for Ailments  
**Extension of:** `utils/tampermonkey-skill-scraper.js`
**Source:** `WebData/AilmentsOverview.html`
**Target element:** `<div class="ailment-card">`
**Status:** ❌ PENDING - **Depends on 3.1**

### 3.3 Extend Tampermonkey for Minions
**Extension of:** `utils/tampermonkey-skill-scraper.js`  
**Source:** `WebData/MinionsOverview.html`
**Target element:** `<div class="entity-card">`
**Status:** ❌ PENDING - **Depends on 3.1**

---

## PHASE 4: Final Integration 🔧 **MEDIUM PRIORITY**

### 4.1 Integrate New Parsers into Existing Build Process
**Files to modify:** `scripts/build-database.js`
**Action:** Extend existing HTML parsing to include Sets, Affixes, Skills
**Keep:** Current `npm run build-database` command structure
**Status:** ❌ PENDING - **Depends on Phases 1-2**

### 4.2 Clean Up Legacy Scraping Code
**Files to remove:** `scripts/scraper.js`, `scripts/curl-scraper.js`
**Action:** Remove obsolete files only
**Status:** ❌ PENDING

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

*Items will be moved here as they are completed*

---

## PHASE 6: PROJECT RESTRUCTURING 🏗️ **FUTURE - AFTER ALL PHASES COMPLETE**

*This phase should only be executed after Phases 1-4 are fully complete and tested*

### 6.1 Analyze Shared vs Project-Specific Files
**Action:** Audit all current files to determine which belong to each sub-project
**Analysis needed:**
- Database Generation files (templates, parsers, web data)
- Filter Generation files (sample filters, generation logic) 
- Shared files (game rules, constraints, documentation)
- Root-level configuration (package.json, .gitignore, etc.)
**Status:** ❌ PENDING

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
**Status:** ❌ PENDING

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
**Status:** ❌ PENDING

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
**Status:** ❌ PENDING

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
**Status:** ❌ PENDING

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
**Status:** ❌ PENDING

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
**Status:** ❌ PENDING

### 6.8 Verify Project Separation
**Testing requirements:**
- Database generator works independently 
- Filter generator can consume generated database
- No circular dependencies between projects
- Both projects maintain their own dependencies
- Shared resources accessible to both
**Database outputs must be stable:** Filter generator shouldn't break when database is rebuilt
**Status:** ❌ PENDING

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
**Status:** ❌ PENDING

---

### PHASE 6 SUCCESS CRITERIA

✅ **Clean Separation:** Database and filter generation are independent projects  
✅ **Shared Resources:** Common game knowledge accessible to both projects
✅ **Stable Interface:** Database output format is consistent for filter consumption
✅ **Focused Context:** Each sub-project has only relevant files and documentation
✅ **Maintained Functionality:** All existing features work after restructuring
✅ **Developer Experience:** Clear workflow and build commands for each project

---

**⚠️ IMPORTANT:** Phase 6 should only begin after successful completion and testing of Phases 1-4. This restructuring is significant and should be done when the current system is stable and working correctly.