// ==UserScript==
// @name         Last Epoch Data Scraper
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Scrape Last Epoch skill, ailment, and minion data from lastepochtools.com
// @author       LELootFilterGen
// @match        https://www.lastepochtools.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // Global variable to store scraped data for console access
    window.lastScrapedData = null;

    // Configuration for different data types
    const DATA_CONFIGS = {
        skills: {
            containerSelector: '.ability-card',
            dataType: 'skill',
            urlPattern: /\/skills\//
        },
        ailments: {
            containerSelector: '.ailment-card',
            dataType: 'ailment',
            urlPattern: /\/ailments\//
        },
        minions: {
            containerSelector: '.entity-card',
            dataType: 'minion',
            urlPattern: /\/minions\//
        }
    };

    // Determine current data type based on URL
    function getCurrentDataType() {
        const url = window.location.href;
        for (const [type, config] of Object.entries(DATA_CONFIGS)) {
            if (config.urlPattern.test(url)) {
                return config;
            }
        }
        return null;
    }

    // Extract text content, handling nested elements properly
    function extractCleanText(element) {
        if (!element) return '';
        
        // Clone the element to avoid modifying the original
        const clone = element.cloneNode(true);
        
        // Remove script and style elements
        clone.querySelectorAll('script, style').forEach(el => el.remove());
        
        // Get text content and clean it up
        return clone.textContent.trim().replace(/\s+/g, ' ');
    }

    // Extract structured data from a card element
    function extractCardData(cardElement, dataType) {
        const data = {
            type: dataType,
            url: window.location.href,
            extractedAt: new Date().toISOString()
        };

        // Extract title (usually in header or first prominent element)
        const titleSelectors = [
            '.card-title', '.ability-title', '.skill-title', '.entity-title',
            'h1', 'h2', 'h3', '.title', '.name'
        ];
        
        for (const selector of titleSelectors) {
            const titleEl = cardElement.querySelector(selector);
            if (titleEl) {
                data.name = extractCleanText(titleEl);
                break;
            }
        }

        // Extract description
        const descSelectors = [
            '.description', '.card-description', '.ability-description',
            '.content', '.details', 'p:first-of-type'
        ];
        
        for (const selector of descSelectors) {
            const descEl = cardElement.querySelector(selector);
            if (descEl) {
                data.description = extractCleanText(descEl);
                break;
            }
        }

        // Extract all tables (stats, properties, etc.)
        const tables = cardElement.querySelectorAll('table');
        if (tables.length > 0) {
            data.tables = [];
            tables.forEach((table, index) => {
                const tableData = {
                    index: index,
                    headers: [],
                    rows: []
                };

                // Extract headers
                const headerCells = table.querySelectorAll('thead th, tr:first-child th, tr:first-child td:first-child');
                headerCells.forEach(cell => {
                    tableData.headers.push(extractCleanText(cell));
                });

                // Extract rows
                const rows = table.querySelectorAll('tbody tr, tr');
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td, th');
                    if (cells.length > 0) {
                        const rowData = [];
                        cells.forEach(cell => {
                            rowData.push(extractCleanText(cell));
                        });
                        tableData.rows.push(rowData);
                    }
                });

                data.tables.push(tableData);
            });
        }

        // Extract any list data
        const lists = cardElement.querySelectorAll('ul, ol');
        if (lists.length > 0) {
            data.lists = [];
            lists.forEach((list, index) => {
                const listData = {
                    index: index,
                    type: list.tagName.toLowerCase(),
                    items: []
                };

                const items = list.querySelectorAll('li');
                items.forEach(item => {
                    listData.items.push(extractCleanText(item));
                });

                data.lists.push(listData);
            });
        }

        // Extract any key-value pairs (common in game data)
        const kvSelectors = [
            '.stat-row', '.property-row', '.attribute-row',
            '.info-row', '.data-row'
        ];
        
        kvSelectors.forEach(selector => {
            const kvElements = cardElement.querySelectorAll(selector);
            if (kvElements.length > 0 && !data.keyValuePairs) {
                data.keyValuePairs = [];
                kvElements.forEach(kvEl => {
                    const keyEl = kvEl.querySelector('.key, .label, .name, strong:first-child');
                    const valueEl = kvEl.querySelector('.value, .amount, .number, span:last-child');
                    
                    if (keyEl || valueEl) {
                        data.keyValuePairs.push({
                            key: keyEl ? extractCleanText(keyEl) : '',
                            value: valueEl ? extractCleanText(valueEl) : extractCleanText(kvEl)
                        });
                    }
                });
            }
        });

        // Extract raw HTML for complex cases
        data.rawHtml = cardElement.innerHTML;

        return data;
    }

    // Navigation-based scraping for overview pages
    async function scrapeFromNavigation() {
        const config = getCurrentDataType();
        if (!config) {
            console.log('No matching data type configuration found for this page');
            return null;
        }

        console.log(`Starting navigation-based scraping for ${config.dataType}`);

        // Find navigation links, excluding passive tree entries
        const allNavLinks = document.querySelectorAll('.nav-block .section-item.nav-item');
        const navLinks = Array.from(allNavLinks).filter(link => {
            const linkText = link.textContent.trim().toLowerCase();
            return !linkText.includes('passive tree');
        });
        
        if (navLinks.length === 0) {
            console.log('No valid navigation links found (excluding passive trees)');
            return null;
        }

        console.log(`Found ${navLinks.length} navigation items to process (${allNavLinks.length - navLinks.length} passive tree entries ignored)`);

        const scrapedData = {
            dataType: config.dataType,
            url: window.location.href,
            scrapedAt: new Date().toISOString(),
            itemCount: 0,
            totalLinks: navLinks.length,
            items: []
        };

        const statusEl = document.getElementById('scraper-status');
        
        for (let i = 0; i < navLinks.length; i++) {
            const link = navLinks[i];
            const linkText = link.textContent.trim();
            
            if (statusEl) {
                statusEl.textContent = `Processing ${i + 1}/${navLinks.length}: ${linkText}`;
            }
            
            console.log(`Processing ${i + 1}/${navLinks.length}: ${linkText}`);
            
            // Click the link
            link.click();
            
            // Wait for content to load
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Look for the card data
            const cardContainers = document.querySelectorAll(config.containerSelector);
            
            if (cardContainers.length > 0) {
                console.log(`Found ${cardContainers.length} card(s) for ${linkText} - using first card only`);
                
                // Only process the first card (index 0)
                const container = cardContainers[0];
                const itemData = extractCardData(container, config.dataType);
                itemData.index = scrapedData.items.length;
                itemData.navIndex = i;
                itemData.navText = linkText;
                itemData.cardIndex = 0;
                scrapedData.items.push(itemData);
                
                scrapedData.itemCount += 1;
            } else {
                console.log(`No card data found for ${linkText}`);
            }
            
            // Small delay between items to avoid overwhelming the site
            if (i < navLinks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }

        console.log(`Scraping complete! Found ${scrapedData.itemCount} total items`);
        return scrapedData;
    }

    // Direct scraping for pages that already show cards
    function scrapeDirectCards() {
        const config = getCurrentDataType();
        if (!config) {
            console.log('No matching data type configuration found for this page');
            return null;
        }

        console.log(`Scraping ${config.dataType} data from: ${window.location.href}`);

        const containers = document.querySelectorAll(config.containerSelector);
        if (containers.length === 0) {
            console.log(`No ${config.containerSelector} elements found on page`);
            return null;
        }

        console.log(`Found ${containers.length} ${config.containerSelector} elements`);

        const scrapedData = {
            dataType: config.dataType,
            url: window.location.href,
            scrapedAt: new Date().toISOString(),
            itemCount: containers.length,
            items: []
        };

        containers.forEach((container, index) => {
            console.log(`Processing ${config.dataType} ${index + 1}/${containers.length}`);
            const itemData = extractCardData(container, config.dataType);
            itemData.index = index;
            scrapedData.items.push(itemData);
        });

        return scrapedData;
    }

    // Main scraping function - decides which method to use
    async function scrapePageData() {
        // First try direct scraping (for individual pages)
        const directResult = scrapeDirectCards();
        if (directResult && directResult.itemCount > 0) {
            return directResult;
        }

        // If no direct cards found, try navigation-based scraping (for overview pages)
        const navResult = await scrapeFromNavigation();
        return navResult;
    }

    // Copy data to clipboard with size checking
    function copyToClipboard(data) {
        const jsonString = JSON.stringify(data, null, 2);
        const dataSize = new Blob([jsonString]).size;
        const sizeKB = Math.round(dataSize / 1024);
        
        console.log(`📋 Attempting to copy ${sizeKB}KB of data to clipboard...`);
        
        if (dataSize > 500000) { // If larger than ~500KB, warn user
            console.warn(`⚠️ Large data size (${sizeKB}KB) - clipboard copy may fail`);
            showNotification(`⚠️ Large data (${sizeKB}KB) - copy may fail. Use console variable instead.`);
        }
        
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(jsonString).then(() => {
                console.log(`✅ Data copied to clipboard! (${sizeKB}KB)`);
                showNotification(`✅ Copied ${sizeKB}KB to clipboard!`);
            }).catch(err => {
                console.error('❌ Failed to copy to clipboard:', err);
                console.log('💡 Use console variable instead: lastScrapedData');
                showNotification(`❌ Clipboard failed (${sizeKB}KB too large). Use console variable 'lastScrapedData'`);
                fallbackCopy(jsonString);
            });
        } else {
            fallbackCopy(jsonString);
        }
    }

    // Fallback copy method
    function fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                console.log('Data copied to clipboard using fallback method!');
                showNotification('Data copied to clipboard!');
            } else {
                console.error('Fallback copy failed');
                showDataInConsole(text);
            }
        } catch (err) {
            console.error('Fallback copy error:', err);
            showDataInConsole(text);
        } finally {
            document.body.removeChild(textArea);
        }
    }

    // Show data in console if clipboard fails
    function showDataInConsole(jsonString) {
        console.log('❌ Copy to clipboard failed. Data is available via console variable.');
        console.log('='.repeat(60));
        console.log('💡 DATA ACCESS OPTIONS:');
        console.log('🔗 Console variable: lastScrapedData');
        console.log('📋 Manual copy: copy(JSON.stringify(lastScrapedData, null, 2))');
        console.log('🔍 Inspect data: Type "lastScrapedData" and press Enter');
        console.log('='.repeat(60));
        showNotification('❌ Clipboard failed - use console variable \'lastScrapedData\'');
    }

    // Show notification to user
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(notification);
        
        // Auto-dismiss notification, longer for success messages
        const dismissTime = message.includes('✅') ? 5000 : 3000;
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, dismissTime);
    }

    // Create control panel
    function createControlPanel() {
        const panel = document.createElement('div');
        panel.id = 'le-scraper-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: #2c3e50;
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            min-width: 200px;
        `;

        const config = getCurrentDataType();
        const dataTypeName = config ? config.dataType : 'unknown';
        
        panel.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px; color: #ecf0f1;">
                LE Data Scraper (${dataTypeName})
            </div>
            <button id="scrape-btn" style="
                background: #3498db;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                margin-right: 5px;
                font-size: 11px;
                min-width: 80px;
            ">Scrape Data</button>
            <button id="copy-btn" style="
                background: #27ae60;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                margin-right: 5px;
                font-size: 11px;
                display: none;
            ">Copy Data</button>
            <button id="toggle-panel" style="
                background: #e74c3c;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
            ">Hide</button>
            <div id="scraper-status" style="
                margin-top: 10px;
                font-size: 11px;
                color: #bdc3c7;
                min-height: 16px;
            ">Ready</div>
            <div style="margin-top: 8px; font-size: 10px; color: #95a5a6; line-height: 1.3;">
                Clicks through nav links (ignores Passive Tree). Data stored in console variable 'lastScrapedData'.
            </div>
        `;

        document.body.appendChild(panel);

        // Add event listeners
        document.getElementById('scrape-btn').addEventListener('click', async () => {
            const statusEl = document.getElementById('scraper-status');
            const scrapeBtn = document.getElementById('scrape-btn');
            
            // Disable button during scraping
            scrapeBtn.disabled = true;
            scrapeBtn.textContent = 'Scraping...';
            scrapeBtn.style.background = '#95a5a6';
            scrapeBtn.style.cursor = 'not-allowed';
            statusEl.textContent = 'Starting scrape...';
            
            try {
                const data = await scrapePageData();
                if (data) {
                    // Store data globally for console access
                    window.lastScrapedData = data;
                    
                    // Show copy button
                    const copyBtn = document.getElementById('copy-btn');
                    copyBtn.style.display = 'inline-block';
                    
                    statusEl.textContent = `Scraped ${data.itemCount} items - available in console`;
                    
                    // Log to console with instructions
                    console.log('='.repeat(60));
                    console.log('✅ SCRAPING COMPLETE!');
                    console.log(`📊 Scraped ${data.itemCount} items from ${data.totalLinks || 'N/A'} links`);
                    console.log('🔗 Data is now available in the global variable: lastScrapedData');
                    console.log('📋 To copy to clipboard: Use the "Copy Data" button or run: copy(JSON.stringify(lastScrapedData, null, 2))');
                    console.log('🔍 To inspect data: Type "lastScrapedData" in console');
                    console.log('='.repeat(60));
                    
                    showNotification(`✅ Scraped ${data.itemCount} items! Data available in console variable 'lastScrapedData'`);
                } else {
                    statusEl.textContent = 'No data found';
                    showNotification('No data found on this page');
                }
            } catch (error) {
                console.error('Scraping error:', error);
                statusEl.textContent = `Error: ${error.message}`;
                showNotification(`Error: ${error.message}`);
            } finally {
                // Re-enable button
                scrapeBtn.disabled = false;
                scrapeBtn.textContent = 'Scrape Data';
                scrapeBtn.style.background = '#3498db';
                scrapeBtn.style.cursor = 'pointer';
            }
        });

        // Copy button event listener
        document.getElementById('copy-btn').addEventListener('click', () => {
            if (window.lastScrapedData) {
                copyToClipboard(window.lastScrapedData);
            } else {
                showNotification('No data to copy - scrape first!');
            }
        });

        document.getElementById('toggle-panel').addEventListener('click', () => {
            const isHidden = panel.style.transform === 'translateX(-180px)';
            panel.style.transform = isHidden ? 'translateX(0)' : 'translateX(-180px)';
            document.getElementById('toggle-panel').textContent = isHidden ? 'Hide' : 'Show';
        });
    }

    // Initialize when page loads
    function initialize() {
        // Wait a bit for dynamic content to load
        setTimeout(() => {
            createControlPanel();
            console.log('Last Epoch Data Scraper loaded');
            
            const config = getCurrentDataType();
            if (config) {
                console.log(`Page type detected: ${config.dataType}`);
                console.log(`Looking for elements: ${config.containerSelector}`);
                
                const containers = document.querySelectorAll(config.containerSelector);
                console.log(`Found ${containers.length} ${config.dataType} containers`);
            }
        }, 1000);
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();