#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { CurlScraper } = require('./curl-scraper.js');

/**
 * Enhanced scraper for Last Epoch Tools data
 * Dynamically discovers and downloads JavaScript database files
 */
class LEToolsScraper {
  constructor() {
    this.scraper = new CurlScraper({
      requestDelay: 2000,
      retryAttempts: 3,
      timeout: 30000
    });
    
    this.logger = new ScrapingLogger();
    this.baseUrl = 'https://www.lastepochtools.com';
    
    // Configurable game version - update when new versions are released
    this.gameVersion = 'version130';
    
    // File mapping based on URL patterns
    this.fileMapping = {
      'factions/js': 'faction_data.json',
      'skills/js': 'skill_data', // Special case - multiple files
      'db/js': 'item_data.json',
      'planner/js': 'planner_data.json',
      'endgame/js': 'endgame_data.json'
    };
  }
  
  /**
   * Main scraping workflow
   */
  async scrapeAll(forceRefresh = false) {
    this.logger.info('🚀 Starting enhanced data scraping workflow...');
    
    try {
      // Step 1: Download the skills page to discover JS file URLs
      const skillsHtml = await this.downloadSkillsPage(forceRefresh);
      
      // Step 2: Extract all JS file URLs from the HTML
      const jsFiles = this.extractJsFileUrls(skillsHtml);
      
      // Step 3: Map and download the required files
      await this.downloadMappedFiles(jsFiles, forceRefresh);
      
      this.logger.info('✅ Enhanced scraping completed successfully!');
      
    } catch (error) {
      this.logger.error('❌ Enhanced scraping failed:', error);
      throw error;
    }
  }
  
  /**
   * Download the skills page HTML
   */
  async downloadSkillsPage(forceRefresh = false) {
    this.logger.info('📥 Downloading skills page to discover JS files...');
    
    const skillsUrl = `${this.baseUrl}/skills/`;
    
    try {
      const result = await this.scraper.scrapeUrl(skillsUrl, {
        cacheName: 'skills_page_discovery',
        forceRefresh
      });
      
      this.logger.info('✅ Skills page downloaded successfully');
      return result.html;
      
    } catch (error) {
      this.logger.error(`❌ Failed to download skills page: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Extract JavaScript file URLs using regex pattern
   */
  extractJsFileUrls(html) {
    this.logger.info('🔍 Extracting JS file URLs from HTML...');
    
    // Updated regex to match the versioned JS files
    const jsFileRegex = new RegExp(`/data/${this.gameVersion}/[^<"']+\\.js`, 'g');
    const matches = html.match(jsFileRegex);
    
    if (!matches || matches.length === 0) {
      throw new Error(`No JS files found for version ${this.gameVersion}. Check if game version needs updating.`);
    }
    
    // Convert to full URLs and remove duplicates
    const jsFiles = [...new Set(matches)].map(path => `${this.baseUrl}${path}`);
    
    this.logger.info(`✅ Found ${jsFiles.length} JS files:`);
    jsFiles.forEach(url => this.logger.info(`   ${url}`));
    
    return jsFiles;
  }
  
  /**
   * Map discovered files to proper names and download them
   */
  async downloadMappedFiles(jsFiles, forceRefresh = false) {
    this.logger.info('🗂️ Mapping and downloading data files...');
    
    const downloadedFiles = [];
    let skillFileCount = 1;
    
    for (const jsUrl of jsFiles) {
      try {
        const fileName = this.mapJsUrlToFileName(jsUrl, skillFileCount);
        
        if (fileName) {
          await this.scraper.scrapeUrl(jsUrl, {
            cacheName: fileName.replace('.json', ''),
            forceRefresh
          });
          
          downloadedFiles.push(fileName);
          this.logger.info(`✅ Downloaded: ${fileName}`);
          
          // Increment skill file counter for multiple skill files
          if (fileName.startsWith('skill_data')) {
            skillFileCount++;
          }
        } else {
          this.logger.warn(`⚠️ Unrecognized JS file pattern: ${jsUrl}`);
        }
        
      } catch (error) {
        this.logger.error(`❌ Failed to download ${jsUrl}: ${error.message}`);
        // Continue with other files instead of failing completely
      }
    }
    
    this.logger.info(`✅ Successfully downloaded ${downloadedFiles.length} data files`);
    return downloadedFiles;
  }
  
  /**
   * Map JavaScript URL to appropriate file name
   */
  mapJsUrlToFileName(jsUrl, skillFileCount = 1) {
    // Extract the path part after the base URL
    const urlPath = jsUrl.replace(this.baseUrl, '');
    
    // Check each mapping pattern
    for (const [pattern, fileName] of Object.entries(this.fileMapping)) {
      if (urlPath.includes(`/${this.gameVersion}/${pattern}/`)) {
        // Special handling for skill files (multiple files)
        if (fileName === 'skill_data') {
          return `skill_data_${skillFileCount}.json`;
        }
        return fileName;
      }
    }
    
    return null; // Unrecognized pattern
  }
  
  /**
   * Get current game version
   */
  getGameVersion() {
    return this.gameVersion;
  }
  
  /**
   * Update game version (for when new versions are released)
   */
  setGameVersion(version) {
    this.gameVersion = version;
    this.logger.info(`🏷️ Game version updated to: ${version}`);
  }
  
  /**
   * Get scraping statistics
   */
  async getStats() {
    const cacheDir = path.join(__dirname, '..', 'WebData', 'scraped');
    
    try {
      if (!await fs.pathExists(cacheDir)) {
        return { totalFiles: 0, files: [] };
      }
      
      const files = await fs.readdir(cacheDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      const stats = {
        totalFiles: jsonFiles.length,
        gameVersion: this.gameVersion,
        cacheDirectory: cacheDir,
        files: []
      };
      
      for (const file of jsonFiles) {
        const filePath = path.join(cacheDir, file);
        const fileStat = await fs.stat(filePath);
        
        try {
          const cached = await fs.readJson(filePath);
          stats.files.push({
            name: file,
            url: cached.url || 'Unknown',
            timestamp: cached.timestamp || fileStat.mtime.toISOString(),
            size: fileStat.size,
            age: Date.now() - fileStat.mtime.getTime()
          });
        } catch {
          // Skip corrupted files
        }
      }
      
      return stats;
      
    } catch (error) {
      this.logger.error(`Failed to get stats: ${error.message}`);
      return { totalFiles: 0, files: [] };
    }
  }
}

/**
 * Scraping Logger
 */
class ScrapingLogger {
  constructor() {
    this.logFile = path.join(__dirname, '..', 'WebData', 'scraping.log');
  }
  
  log(level, message, error = null) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [${level.toUpperCase()}] ${message}`;
    
    console.log(logEntry);
    
    // Append to log file
    fs.appendFile(this.logFile, logEntry + '\n').catch(() => {
      // Ignore log file errors
    });
    
    if (error && error.stack) {
      const stackEntry = `${timestamp} [STACK] ${error.stack}`;
      fs.appendFile(this.logFile, stackEntry + '\n').catch(() => {});
    }
  }
  
  info(message) {
    this.log('info', message);
  }
  
  warn(message, error = null) {
    this.log('warn', message, error);
  }
  
  error(message, error = null) {
    this.log('error', message, error);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const scraper = new LEToolsScraper();
  
  try {
    switch (command) {
      case 'scrape':
        const forceRefresh = args.includes('--force');
        
        console.log('🌐 Starting enhanced Last Epoch Tools scraping...');
        console.log(`🏷️ Target version: ${scraper.getGameVersion()}`);
        if (forceRefresh) console.log('🔄 Force refresh enabled');
        
        await scraper.scrapeAll(forceRefresh);
        console.log('✅ Enhanced scraping complete!');
        break;
        
      case 'version':
        if (args[1]) {
          scraper.setGameVersion(args[1]);
          console.log(`✅ Game version set to: ${args[1]}`);
          console.log('💡 Run scrape command to download new version data');
        } else {
          console.log(`Current game version: ${scraper.getGameVersion()}`);
        }
        break;
        
      case 'stats':
        console.log('📊 Scraping Statistics:');
        const stats = await scraper.getStats();
        console.log(`Total files: ${stats.totalFiles}`);
        console.log(`Game version: ${stats.gameVersion}`);
        if (stats.files.length > 0) {
          console.log('\nCached files:');
          stats.files.forEach(file => {
            const ageHours = Math.round(file.age / (1000 * 60 * 60));
            console.log(`  • ${file.name} (${ageHours}h old, ${Math.round(file.size/1024)}KB)`);
          });
        }
        break;
        
      default:
        console.log('LELootFilterGen Enhanced Data Scraper');
        console.log('');
        console.log('Available commands:');
        console.log('  scrape [--force]     - Discover and scrape all data files');
        console.log('  version [version]    - Get/set game version (e.g., version130)');
        console.log('  stats               - Show scraping statistics');
        console.log('');
        console.log('Examples:');
        console.log('  node scripts/scraper.js scrape');
        console.log('  node scripts/scraper.js scrape --force');
        console.log('  node scripts/scraper.js version version140');
        console.log('  node scripts/scraper.js stats');
        console.log('');
        console.log('Features:');
        console.log('  • Automatically discovers JS data files from skills page');
        console.log('  • Maps files to proper names (faction_data, skill_data, etc.)');
        console.log('  • Handles multiple skill data files automatically');
        console.log('  • Configurable game version for updates');
    }
    
  } catch (error) {
    console.error('❌ Scraper error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { LEToolsScraper };