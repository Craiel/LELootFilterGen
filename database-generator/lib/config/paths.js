#!/usr/bin/env node

const path = require('path');

/**
 * Centralized path configuration for all database generator scripts and parsers
 * 
 * This module provides a single source of truth for all paths used throughout
 * the database generation system, making maintenance easier and reducing
 * path-related bugs when code is moved or reorganized.
 */

// Root directories
const DATABASE_GENERATOR_ROOT = path.resolve(__dirname, '..', '..');
const PROJECT_ROOT = path.resolve(DATABASE_GENERATOR_ROOT, '..');
const FILTER_GENERATOR_ROOT = path.resolve(PROJECT_ROOT, 'filter-generator');

// Template and source data paths
const TEMPLATE_DIR = path.join(DATABASE_GENERATOR_ROOT, 'TemplateFilters');
const WEB_DATA_DIR = path.join(DATABASE_GENERATOR_ROOT, 'WebData');
const OVERRIDES_DIR = path.join(DATABASE_GENERATOR_ROOT, 'Overrides');

// Output data paths
const DATA_DIR = path.join(FILTER_GENERATOR_ROOT, 'Data');
const UNIQUE_ITEMS_DIR = path.join(DATA_DIR, 'UniqueItems');
const PREFIXES_DIR = path.join(DATA_DIR, 'Prefixes');
const SUFFIXES_DIR = path.join(DATA_DIR, 'Suffixes');
const SKILLS_DIR = path.join(DATA_DIR, 'Skills');
const INDEXES_DIR = path.join(DATA_DIR, 'indexes');

// Log and report files
const LOG_FILE = path.join(DATA_DIR, 'build.log');
const VALIDATION_REPORT_FILE = path.join(DATA_DIR, 'validation-report.txt');
const VERSION_FILE = path.join(DATA_DIR, 'database-version.json');

// Web data source files
const HTML_FILES = {
  itemList: path.join(WEB_DATA_DIR, 'ItemList.html'),
  sets: path.join(WEB_DATA_DIR, 'Sets.html'),
  prefixes: path.join(WEB_DATA_DIR, 'Prefixes.html'),
  suffixes: path.join(WEB_DATA_DIR, 'Suffixes.html'),
  skills: path.join(WEB_DATA_DIR, 'SkillOverview.html'),
  ailmentsOverview: path.join(WEB_DATA_DIR, 'AilmentsOverview.html'),
  minionsOverview: path.join(WEB_DATA_DIR, 'MinionsOverview.html')
};

const JSON_FILES = {
  skillData: path.join(WEB_DATA_DIR, 'SkillData.json'),
  monsters: path.join(WEB_DATA_DIR, 'Monsters.json'),
  ailments: path.join(WEB_DATA_DIR, 'Ailments.json')
};

// Template files
const TEMPLATE_FILES = {
  colors: path.join(TEMPLATE_DIR, 'Colors.xml'),
  sounds: path.join(TEMPLATE_DIR, 'Sounds.xml'),
  beams: path.join(TEMPLATE_DIR, 'MapIcon_LootBeam.xml'),
  masterTemplate: path.join(TEMPLATE_DIR, 'MasterTemplate1.xml')
};

// Override files
const OVERRIDE_FILES = {
  affixes: path.join(OVERRIDES_DIR, 'affixes.json'),
  uniques: path.join(OVERRIDES_DIR, 'uniques.json'),
  sets: path.join(OVERRIDES_DIR, 'sets.json'),
  analytics: path.join(OVERRIDES_DIR, 'analytics_unique_items_data.json')
};

// Output database files
const OUTPUT_FILES = {
  itemAffixes: path.join(DATA_DIR, 'item-affixes.json'),
  idolAffixes: path.join(DATA_DIR, 'idol-affixes.json'),
  uniqueItemsOverview: path.join(DATA_DIR, 'unique-items-overview.json'),
  setData: path.join(DATA_DIR, 'set-data.json'),
  colorsReferenceData: path.join(DATA_DIR, 'colors-sounds-beams.json'),
  globalTags: path.join(DATA_DIR, 'global-tags.json'),
  databaseIndex: path.join(DATA_DIR, 'database-index.json')
};

module.exports = {
  // Root directories
  DATABASE_GENERATOR_ROOT,
  PROJECT_ROOT,
  FILTER_GENERATOR_ROOT,
  
  // Main directories
  TEMPLATE_DIR,
  WEB_DATA_DIR,
  OVERRIDES_DIR,
  DATA_DIR,
  UNIQUE_ITEMS_DIR,
  PREFIXES_DIR,
  SUFFIXES_DIR,
  SKILLS_DIR,
  INDEXES_DIR,
  
  // Files
  LOG_FILE,
  VALIDATION_REPORT_FILE,
  VERSION_FILE,
  HTML_FILES,
  JSON_FILES,
  TEMPLATE_FILES,
  OVERRIDE_FILES,
  OUTPUT_FILES,
  
  // Utility functions
  getTemplateSubdir: (subdir) => path.join(TEMPLATE_DIR, subdir),
  getOutputFile: (filename) => path.join(DATA_DIR, filename),
  getIndexFile: (filename) => path.join(INDEXES_DIR, filename),
  getUniqueItemFile: (filename) => path.join(UNIQUE_ITEMS_DIR, filename),
  getPrefixFile: (filename) => path.join(PREFIXES_DIR, filename),
  getSuffixFile: (filename) => path.join(SUFFIXES_DIR, filename)
};