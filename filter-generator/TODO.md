# XML Loot Filter Suite Implementation Plan

This document outlines the implementation of the focused XML suite for Last Epoch loot filter processing.

## Overview

The XML suite has exactly three functions:

1. **XSD Schema Generation**: Analyze sample XML filters and create/update XSD schema
2. **XML Filter Creation**: Generate XML filters from intermediate JSON files
3. **XML Filter Validation**: Validate all XML filters against XSD schema

## Scope Clarification

**IN SCOPE:**
- XSD schema generation from existing XML filters
- XML filter generation from intermediate JSON files created by Claude analysis
- XML filter validation against XSD schema with detailed error reporting
- Native XML processing with proper validation

**OUT OF SCOPE:**
- Build analysis (handled by Claude using FILTER_ANALYSIS_INSTRUCTIONS.md)
- Intermediate JSON creation (manual Claude process)
- Filter updating/modification tools

## Architecture

```
CLI Entry Point → [1] XSD Generator → Schema File
                → [2] XML Generator → Filter XML  
                → [3] XML Validator → Validation Report
```

## Implementation Plan

### Phase 1: XSD Schema Generation ✅
- [x] **Created** `src/schema/schema-generator.js`
  - Analyzes existing XML filters to extract schema patterns
  - Generates XSD schema file from discovered patterns
  - Handles version differences and schema evolution
  - Supports re-running when format changes

- [x] **Created** `src/data/data-manager.js`
  - Comprehensive reading of all Data folder files
  - Centralized access to database information
  - Validation of data integrity and completeness

### Phase 2: XML Filter Generation
- [ ] **Create** `src/generator/xml-filter-generator.js`
  - Read intermediate JSON files
  - Generate XML filters using native XML processing
  - Apply rule optimization and 75-rule limit compliance
  - Use XSD validation for output verification

- [ ] **Create** `src/components/filter-builder.js`
  - Filter header construction (name, description, version)
  - Rule construction from intermediate data
  - Visual effects handling (colors, sounds, beams)

### Phase 3: Integration & Validation
- [ ] **Create** `src/validation/xml-validator.js`
  - XSD schema validation
  - Rule count validation (75-rule limit)
  - Data integrity validation

- [ ] **Complete** CLI integration
  - Remove unused commands (parse, update, validate)
  - Focus on schema generation and XML creation only

## Implementation Priorities

### Week 1-2: Foundation
- Core XML processing infrastructure
- XSD schema generation
- Data loading system

### Week 3-4: Components  
- Filter component classes
- Rule logic implementation
- Visual effects handling

### Week 5-6: Generation
- Filter analysis tools
- Build integration
- Filter generator

### Week 7-8: Interface
- CLI interface
- Validation system
- Error handling

## Technical Requirements

### Dependencies
```json
{
  "xml2js": "^0.6.2",
  "xmlbuilder2": "^3.1.1", 
  "ajv": "^8.12.0",
  "ajv-formats": "^2.1.1",
  "commander": "^11.1.0",
  "fs-extra": "^11.2.0"
}
```

### File Structure
```
src/
├── cli/
│   └── xml-suite.js              # Main CLI entry point
├── xml/
│   ├── xml-processor.js          # Native XML handling
│   └── schema-manager.js         # XSD management
├── components/
│   ├── filter-header.js          # Header components
│   ├── filter-rules.js           # Rule components
│   └── visual-effects.js         # Visual effect handling
├── rules/
│   ├── rarity-rules.js           # Rarity condition logic
│   ├── affix-rules.js            # Affix condition logic
│   └── class-rules.js            # Class filtering logic
├── analysis/
│   ├── filter-analyzer.js        # Filter analysis
│   └── build-analyzer.js         # Build analysis
├── generator/
│   └── filter-generator.js       # Main generator
├── validation/
│   ├── xml-validator.js          # XML validation
│   ├── data-validator.js         # Data validation
│   └── field-validator.js        # Field validation
├── data/
│   └── data-manager.js           # Data loading
├── errors/
│   └── error-manager.js          # Error handling
└── utils/
    └── helpers.js                # Utility functions
```

## Success Criteria

### Phase 1 Success
- XSD schema successfully generated from existing filters
- Native XML processing fully functional
- All Data folder files loaded and accessible

### Phase 2 Success  
- Component classes handle all XML elements correctly
- Rule logic generates valid conditions
- Visual effects properly mapped and validated

### Phase 3 Success
- Filters analyzed and patterns extracted
- Build definitions converted to filter requirements
- Generated filters pass XSD validation

### Phase 4 Success
- Intuitive CLI interface with file selection
- Comprehensive validation catches all errors
- Clear error messages and recovery guidance

### Overall Success
- 75-rule limit consistently maintained
- All XML operations use native classes (no string manipulation)
- Unknown fields/tags properly detected and reported
- Filters validate against generated XSD schema
- Clean, maintainable code architecture

## Clean Implementation

All deprecated components have been removed from the codebase. The new system is built from the ground up with:

- **Native XML Processing**: No legacy string manipulation code
- **Comprehensive Data Access**: Enhanced database loading and validation
- **Modern Architecture**: Clean separation of concerns with logical component classes
- **Proper Validation**: XSD schema generation and XML validation capabilities
- **Maintainable Codebase**: No deprecated code or documentation

This new approach provides a robust, maintainable foundation for XML filter processing with proper validation, error handling, and native XML support.