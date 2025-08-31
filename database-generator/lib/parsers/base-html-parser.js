const fs = require('fs-extra');
const path = require('path');
const { JSDOM } = require('jsdom');
const paths = require('../config/paths');

/**
 * Base HTML Parser
 * 
 * Common functionality for all HTML parsers
 */
class BaseHTMLParser {
  constructor(htmlFileName) {
    this.htmlFile = path.join(paths.WEB_DATA_DIR, htmlFileName);
    this.outputDir = paths.DATA_DIR;
    this.logger = console;
  }

  /**
   * Load and parse HTML file
   */
  async loadHTML() {
    if (!await fs.pathExists(this.htmlFile)) {
      throw new Error(`HTML file not found: ${this.htmlFile}`);
    }

    this.logger.log('📄 Loading HTML file...');
    const htmlContent = await fs.readFile(this.htmlFile, 'utf8');
    
    this.logger.log('🔍 Parsing HTML structure...');
    const dom = new JSDOM(htmlContent);
    return dom.window.document;
  }

  /**
   * Ensure output directory exists
   */
  async ensureOutputDir() {
    await fs.ensureDir(this.outputDir);
  }

  /**
   * Save data to JSON file
   */
  async saveJSON(filePath, data) {
    await fs.writeJson(filePath, data, { spaces: 2 });
  }

  /**
   * Generate clean filename from text
   */
  generateFilename(name, extension = '.json') {
    return name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') + extension;
  }

  /**
   * Abstract method - must be implemented by subclasses
   */
  async parse() {
    throw new Error('parse() method must be implemented by subclass');
  }
}

module.exports = BaseHTMLParser;