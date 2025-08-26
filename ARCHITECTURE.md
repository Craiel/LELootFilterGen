## Architecture

### Directory Structure
- `src/` - Main application source code (unused currently)
- `Data/` - **Database ONLY** - Generated database files (OFF-LIMITS to scrapers)
- `WebData/` - Web scraping cache and processed web data
- `TemplateFilters/` - Template XML files with game data to be parsed
- `SampleFilters/` - Example loot filter files for learning/reference
- `Overrides/` - Manual data overrides and corrections
- `scripts/` - Build and utility scripts
- `generated/` - Generated loot filter output files

### Core Components
- **Template Parser**: Parses XML templates to extract game data
- **Database Builder**: Creates intermediate database with manual override support
- **Filter Generator**: Creates custom loot filters using AI assistance
- **XML Processor**: Handles XML parsing and generation
