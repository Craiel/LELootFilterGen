#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

/**
 * Debug script to analyze the JavaScript parsing issues
 */
async function debugJsData() {
  const dataFile = path.join(__dirname, '..', 'WebData', 'scraped', 'item_data.json');
  
  if (!await fs.pathExists(dataFile)) {
    console.log('❌ item_data.json not found');
    return;
  }
  
  console.log('🔍 Analyzing item_data.json structure...');
  
  try {
    const cached = await fs.readJson(dataFile);
    let jsContent = cached.data;
    
    // Handle different data formats from scraper
    if (typeof jsContent === 'object' && jsContent.html) {
      jsContent = jsContent.html;
    }
    
    console.log(`📊 Data type: ${typeof jsContent}`);
    console.log(`📏 Data length: ${jsContent.length} characters`);
    
    // Check for window.itemDB pattern
    const startMarker = 'window.itemDB=';
    const startIndex = jsContent.indexOf(startMarker);
    console.log(`🔍 Found '${startMarker}' at position: ${startIndex}`);
    
    if (startIndex !== -1) {
      // Extract first 1000 characters after the marker
      let jsonStr = jsContent.substring(startIndex + startMarker.length);
      const preview = jsonStr.substring(0, 1000);
      console.log(`📖 First 1000 chars after marker:\n${preview}`);
      
      // Check for problematic characters
      const problemChars = ['\n', '\r', '\t'];
      problemChars.forEach(char => {
        const count = (jsonStr.match(new RegExp(char, 'g')) || []).length;
        console.log(`🔸 Contains ${count} '${char === '\n' ? '\\n' : char === '\r' ? '\\r' : '\\t'}' characters`);
      });
      
      // Find the end of the object
      const endMarkers = [';window.', '\nwindow.', ';var ', '\nvar ', ';(function', '\n(function'];
      console.log(`🔍 Looking for end markers...`);
      
      for (const marker of endMarkers) {
        const endIndex = jsonStr.indexOf(marker);
        if (endIndex !== -1) {
          console.log(`🎯 Found end marker '${marker}' at position: ${endIndex}`);
          jsonStr = jsonStr.substring(0, endIndex);
          break;
        }
      }
      
      // Show the actual end of the extracted JSON
      const endPreview = jsonStr.substring(jsonStr.length - 200);
      console.log(`📖 Last 200 chars of extracted data:\n${endPreview}`);
      
      // Try to clean and parse a small sample using same logic as the parser
      const smallSample = jsonStr.substring(0, 50000); // Larger sample
      console.log(`\n🧪 Testing small sample parse (50k chars)...`);
      
      try {
        // Clean the sample using the same method as js-data-parser
        let cleanedSample = smallSample;
        
        // Apply same cleaning steps
        cleanedSample = cleanedSample.replace(/\r\n/g, ' ').replace(/\n/g, ' ').replace(/\r/g, ' ');
        cleanedSample = cleanedSample.replace(/\s+/g, ' ');
        cleanedSample = cleanedSample.replace(/;+\s*$/, '');
        cleanedSample = cleanedSample.trim();
        cleanedSample = cleanedSample.replace(/,\s*}/g, '}');
        cleanedSample = cleanedSample.replace(/,\s*]/g, ']');
        
        console.log(`🧹 Cleaned sample length: ${cleanedSample.length}`);
        console.log(`🔍 First 200 chars of cleaned sample: ${cleanedSample.substring(0, 200)}`);
        console.log(`🔍 Last 200 chars of cleaned sample: ${cleanedSample.substring(cleanedSample.length - 200)}`);
        
        // Try to find a complete object within the sample
        let braceCount = 0;
        let completeObjectEnd = -1;
        
        for (let i = 0; i < cleanedSample.length; i++) {
          if (cleanedSample[i] === '{') braceCount++;
          if (cleanedSample[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              completeObjectEnd = i;
              break;
            }
          }
        }
        
        if (completeObjectEnd > 0) {
          const completeObject = cleanedSample.substring(0, completeObjectEnd + 1);
          console.log(`🎯 Found complete object of ${completeObject.length} chars`);
          
          // Try parsing it with Function (like the actual parser does)
          try {
            const safeEval = (code) => {
              return Function('"use strict"; return (' + code + ')')();
            };
            
            const parsed = safeEval(completeObject);
            console.log('✅ Function() eval succeeded on sample!');
            console.log(`📊 Parsed object keys: ${Object.keys(parsed).join(', ')}`);
            
          } catch (evalError) {
            console.log(`❌ Function() eval failed: ${evalError.message}`);
            
            // Try to find the error position in the eval error
            const errorMatch = evalError.message.match(/unexpected token.*at position (\d+)/i) || 
                             evalError.message.match(/position (\d+)/i);
            if (errorMatch) {
              const errorPos = parseInt(errorMatch[1]);
              const errorContext = completeObject.substring(Math.max(0, errorPos - 100), errorPos + 100);
              console.log(`📍 Error context around position ${errorPos}:\n"${errorContext}"`);
            } else {
              console.log(`📍 Error details: ${evalError.message}`);
              // Show a bit more context around potential problem areas
              console.log(`🔍 Looking for problematic patterns...`);
              
              // Check for common minification issues
              const problemPatterns = [';', '!0', '!1', '"', "'"];
              problemPatterns.forEach(pattern => {
                const firstOccurrence = completeObject.indexOf(pattern);
                if (firstOccurrence !== -1) {
                  const context = completeObject.substring(Math.max(0, firstOccurrence - 50), firstOccurrence + 50);
                  console.log(`🔍 First '${pattern}' at ${firstOccurrence}: "${context}"`);
                }
              });
            }
          }
          
        } else {
          console.log('❌ Could not find complete object in sample');
          
          // Show brace analysis
          let openBraces = 0;
          let maxBraces = 0;
          for (let i = 0; i < cleanedSample.length; i++) {
            if (cleanedSample[i] === '{') openBraces++;
            if (cleanedSample[i] === '}') openBraces--;
            maxBraces = Math.max(maxBraces, openBraces);
          }
          console.log(`📊 Brace analysis: max depth ${maxBraces}, final count ${openBraces}`);
        }
        
      } catch (error) {
        console.log(`❌ Sample analysis failed: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug analysis failed:', error.message);
  }
}

if (require.main === module) {
  debugJsData();
}