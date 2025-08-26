#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Simple curl-based web scraper
 * Uses curl subprocess to bypass bot detection
 */
class CurlScraper {
  constructor(options = {}) {
    this.config = {
      requestDelay: options.requestDelay || 3000,
      retryAttempts: options.retryAttempts || 3,
      timeout: options.timeout || 15000,
      cacheDir: path.join(__dirname, '..', 'WebData', 'scraped'),
      maxCacheAge: options.maxCacheAge || 24 * 60 * 60 * 1000
    };
    
    this.logger = new SimpleLogger();
    this.ensureCacheDirectory();
  }
  
  async ensureCacheDirectory() {
    await fs.ensureDir(this.config.cacheDir);
  }
  
  async scrapeUrl(url, options = {}) {
    const cacheName = options.cacheName || this.urlToCacheName(url);
    const cacheFile = path.join(this.config.cacheDir, `${cacheName}.json`);
    const forceRefresh = options.forceRefresh || false;
    
    // Check cache first
    if (!forceRefresh) {
      const cached = await this.loadFromCache(cacheFile);
      if (cached) {
        this.logger.info(`Using cached data for ${url}`);
        return cached;
      }
    }
    
    this.logger.info(`Fetching fresh data from ${url}`);
    
    // Use curl to fetch the data
    const html = await this.curlFetch(url);
    const parsed = {
      html,
      length: html.length,
      title: this.extractTitle(html)
    };
    
    // Cache the result
    await this.saveToCache(cacheFile, parsed, url);
    
    return parsed;
  }
  
  async curlFetch(url) {
    const curlCommand = [
      'curl',
      '-s', // Silent mode
      '-L', // Follow redirects
      '--max-time', '30', // 30 second timeout for larger files
      '--user-agent', '"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"',
      '-H', '"Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"',
      '-H', '"Accept-Language: en-US,en;q=0.9"',
      `"${url}"`
    ].join(' ');
    
    try {
      const { stdout, stderr } = await execAsync(curlCommand, { 
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large JS files
      });
      
      if (stderr && stderr.trim()) {
        this.logger.warn(`curl stderr: ${stderr.trim()}`);
      }
      
      if (!stdout || stdout.trim().length === 0) {
        throw new Error('Empty response from curl');
      }
      
      return stdout;
      
    } catch (error) {
      throw new Error(`curl failed: ${error.message}`);
    }
  }
  
  async loadFromCache(cacheFile) {
    try {
      if (!await fs.pathExists(cacheFile)) {
        return null;
      }
      
      const stats = await fs.stat(cacheFile);
      const age = Date.now() - stats.mtime.getTime();
      
      if (age > this.config.maxCacheAge) {
        this.logger.info(`Cache expired for ${path.basename(cacheFile)}`);
        return null;
      }
      
      const cached = await fs.readJson(cacheFile);
      return cached.data;
      
    } catch (error) {
      this.logger.warn(`Failed to load cache ${cacheFile}: ${error.message}`);
      return null;
    }
  }
  
  async saveToCache(cacheFile, data, sourceUrl) {
    try {
      const cacheData = {
        url: sourceUrl,
        timestamp: new Date().toISOString(),
        data
      };
      
      await fs.writeJson(cacheFile, cacheData, { spaces: 2 });
      this.logger.info(`Cached data to ${path.basename(cacheFile)}`);
      
    } catch (error) {
      this.logger.warn(`Failed to save cache ${cacheFile}: ${error.message}`);
    }
  }
  
  extractTitle(html) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : null;
  }
  
  urlToCacheName(url) {
    return url
      .replace(/^https?:\/\//, '')
      .replace(/[^\w.-]/g, '_')
      .substring(0, 100);
  }
}

class SimpleLogger {
  info(message) {
    console.log(`${new Date().toISOString()} [INFO] ${message}`);
  }
  
  warn(message) {
    console.log(`${new Date().toISOString()} [WARN] ${message}`);
  }
  
  error(message) {
    console.log(`${new Date().toISOString()} [ERROR] ${message}`);
  }
}

module.exports = { CurlScraper };