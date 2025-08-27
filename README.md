# Last Epoch Loot Filter Generator

A Node.js suite to generate and edit loot filter XML files for Last Epoch. This project is composed of two independent sub-projects that work together to create optimized loot filters.

## Overview

This tool helps create optimized loot filters for Last Epoch through a two-phase approach:

1. **Database Generation** - Parses template XML files and web data to build a comprehensive game database
2. **Filter Generation** - Creates custom loot filters based on class builds and gameplay descriptions

## Key Features

- **⚠️ 75-Rule Optimization**: **CRITICAL** - Respects Last Epoch's strict 75-rule filter limit
- **Modular Architecture**: Separate database building from filter generation for better maintainability
- **Template-Driven**: Uses XML templates that can be updated with game patches  
- **AI-Assisted Generation**: Creates filters based on natural language descriptions
- **Sample Learning**: Learns from existing filter examples

## Project Structure

This project is now organized as independent sub-projects:

```
/LELootFilterGen/                    # Root directory
├── database-generator/              # Game database generation
│   ├── scripts/                     # Database build scripts
│   ├── TemplateFilters/            # XML templates
│   ├── WebData/                    # HTML files for parsing
│   ├── Data/                       # Generated database output
│   ├── Overrides/                  # Manual data corrections
│   ├── index.js                    # Interactive menu
│   ├── start.bat                   # Windows launcher
│   └── package.json                # Dependencies and scripts
├── filter-generator/               # Loot filter generation  
│   ├── src/                        # Filter generation logic
│   ├── SampleFilters/             # Example filters for learning
│   ├── generated/                 # Output folder for generated filters
│   ├── index.js                   # Interactive menu
│   ├── start.bat                  # Windows launcher
│   └── package.json               # Dependencies and scripts
├── shared/                         # Common resources
│   └── docs/                      # Game knowledge and constraints
└── README.md                      # This file
```

## Quick Start

### Option 1: Use Individual Sub-Projects (Recommended)

**Database Generator:**
```bash
cd database-generator
./start.bat                        # Windows
node index.js                      # Cross-platform
```

**Filter Generator:**
```bash
cd filter-generator  
./start.bat                        # Windows
node index.js                      # Cross-platform
```

### Option 2: Use NPM Scripts (from root)

```bash
# Install all dependencies for both sub-projects
npm run install-all

# Build the game database (required first step)
npm run build-database

# View database statistics
npm run database-info

# Generate a loot filter (interactive)
npm run generate-filter

# Start filter generator in interactive mode
npm start
```

## Project Structure

```
/LELootFilterGen/
├── database-generator/          # Database Generation Sub-Project
│   ├── scripts/                 # Database build scripts and parsers
│   ├── TemplateFilters/        # XML templates from Last Epoch
│   ├── WebData/                # HTML/JSON files for parsing
│   ├── Data/                   # Generated database output
│   ├── Overrides/              # Manual data corrections
│   └── docs/                   # Database-specific documentation
├── filter-generator/           # Filter Generation Sub-Project  
│   ├── src/                    # Filter generation logic
│   ├── SampleFilters/         # Example filters for learning
│   ├── generated/             # Output folder for generated filters
│   └── docs/                  # Filter-specific documentation
├── shared/                    # Shared Resources
│   └── docs/                  # Game knowledge shared by both projects
└── README.md                  # This file - project overview
```

## Sub-Projects

### 🗄️ Database Generator (`database-generator/`)

Handles parsing template XML files and web data to create a structured database.

**Key Features:**
- Tracks game version compatibility with Last Epoch updates
- Maps all IDs to names from filled-out templates  
- Manual override system for adding discovered data
- Comprehensive validation and logging
- Git-friendly JSONL format for version control
- HTML parsing for external data sources

**Quick Commands:**
```bash
cd database-generator
npm run build          # Build database
npm run info           # Show database statistics
npm run build-force    # Force rebuild (ignore timestamps)
```

### 🎮 Filter Generator (`filter-generator/`)

Creates custom loot filters based on class builds and gameplay descriptions.

**Key Features:**
- Respects 75-rule limit with intelligent rule prioritization
- AI-assisted generation from natural language descriptions
- Learns from sample filters for better recommendations
- Validates generated filters for correctness

**Quick Commands:**
```bash
cd filter-generator  
npm run generate     # Generate a new filter
npm start           # Interactive mode
npm run validate    # Validate existing filter
```

### 📚 Shared Resources (`shared/`)

Game knowledge and constraints shared by both sub-projects.

**Contains:**
- Game mechanics documentation
- Technical constraints (75-rule limit, etc.)
- Defensive strategies and build requirements

## Workflow

### 1. First Time Setup
```bash
# Install all dependencies
npm run install-all

# Build the database (required before generating filters)
npm run build-database
```

### 2. Generate Filters
```bash
# Interactive filter generation
npm run generate-filter

# Or work directly in the filter generator
cd filter-generator && npm start
```

### 3. Update Game Data
When Last Epoch updates or you get new template data:
```bash
# Rebuild database with latest data
npm run build-database-force

# Verify database integrity  
npm run database-info
```

## Data Flow

```
Template Files → Database Generator → game-database.jsonl → Filter Generator → Generated Filters
```

The database generator processes templates and creates a stable database file that the filter generator reads. This separation allows independent development and testing of each component.

## Requirements

- Node.js 16.0.0 or higher
- Last Epoch game installation (for template updates)

## License

MIT