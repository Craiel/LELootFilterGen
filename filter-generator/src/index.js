#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const fs = require('fs-extra');

// Import modules (to be implemented)
// const TemplateParser = require('./lib/template-parser');
// const DatabaseBuilder = require('./lib/database-builder');
// const FilterGenerator = require('./lib/filter-generator');

program
  .name('le-loot-filter-gen')
  .description('Last Epoch Loot Filter Generator')
  .version('1.0.0');

program
  .command('parse-templates')
  .description('Parse template XML files and extract game data')
  .option('-f, --force', 'Force re-parsing even if templates haven\'t changed')
  .action(async (options) => {
    console.log('🔄 Parsing template files...');
    console.log('📝 This feature is not yet implemented');
    // TODO: Implement template parsing
  });

program
  .command('build-database')
  .description('Build or rebuild the intermediate database')
  .option('-b, --backup', 'Create backup before rebuilding')
  .action(async (options) => {
    console.log('🏗️  Building database...');
    console.log('📝 This feature is not yet implemented');
    // TODO: Implement database building
  });

program
  .command('generate-filter')
  .description('Generate a loot filter')
  .option('-c, --class <class>', 'Character class')
  .option('-b, --build <build>', 'Build description')
  .option('-o, --output <file>', 'Output file path')
  .option('-t, --template <template>', 'Use specific template')
  .action(async (options) => {
    console.log('⚡ Generating loot filter...');
    
    try {
      // Check if database exists (new structure)
      const dataDir = path.join(__dirname, '../Data');
      const databaseIndexPath = path.join(dataDir, 'database-index.json');
      const prefixesDir = path.join(dataDir, 'Prefixes');
      const suffixesDir = path.join(dataDir, 'Suffixes');
      
      if (!await fs.pathExists(databaseIndexPath) || !await fs.pathExists(prefixesDir) || !await fs.pathExists(suffixesDir)) {
        console.error('❌ Database not found. Please build it first:');
        console.error('   cd ../database-generator && npm run build');
        process.exit(1);
      }

      // Read database metadata
      const databaseIndex = JSON.parse(await fs.readFile(databaseIndexPath, 'utf8'));
      const versionFile = path.join(dataDir, 'database-version.json');
      let versionInfo = { gameVersion: 'unknown', buildDate: 'unknown' };
      
      if (await fs.pathExists(versionFile)) {
        versionInfo = JSON.parse(await fs.readFile(versionFile, 'utf8'));
      }
      
      console.log('✅ Database found:', versionInfo.gameVersion);
      console.log('📊 Available data:', {
        prefixes: databaseIndex.prefixes || 0,
        suffixes: databaseIndex.suffixes || 0,
        uniqueItems: databaseIndex.uniqueItems || 0,
        skills: databaseIndex.skills || 0,
        buildDate: versionInfo.buildDate
      });
      
      console.log('');
      console.log('🔧 Filter generation options:');
      if (options.class) console.log(`   Class: ${options.class}`);
      if (options.build) console.log(`   Build: ${options.build}`);
      if (options.output) console.log(`   Output: ${options.output}`);
      if (options.template) console.log(`   Template: ${options.template}`);
      
      console.log('');
      console.log('📝 Full filter generation functionality will be implemented in future updates.');
      console.log('💡 For now, use sample filters in SampleFilters/ directory as templates.');
      
    } catch (error) {
      console.error('❌ Error accessing database:', error.message);
      process.exit(1);
    }
  });

program
  .command('validate-filter')
  .description('Validate a loot filter file')
  .argument('<file>', 'Filter file to validate')
  .action(async (file) => {
    console.log(`✅ Validating filter: ${file}`);
    
    try {
      // Check if file exists
      if (!await fs.pathExists(file)) {
        console.error(`❌ Filter file not found: ${file}`);
        process.exit(1);
      }
      
      // Read and validate basic XML structure
      const content = await fs.readFile(file, 'utf8');
      
      // Count rules (basic validation)
      const ruleMatches = content.match(/<Rule[^>]*>/g) || [];
      const ruleCount = ruleMatches.length;
      
      console.log('📊 Filter Analysis:');
      console.log(`   Total rules: ${ruleCount}`);
      
      if (ruleCount > 75) {
        console.warn(`⚠️  Rule count (${ruleCount}) exceeds Last Epoch's limit of 75 rules!`);
      } else if (ruleCount === 75) {
        console.log('⚡ Rule count at maximum limit (75/75)');
      } else {
        console.log(`✅ Rule count within limit (${ruleCount}/75)`);
      }
      
      // Check for basic XML structure
      if (content.includes('<ItemFilter') && content.includes('</ItemFilter>')) {
        console.log('✅ Basic XML structure appears valid');
      } else {
        console.warn('⚠️  Missing required <ItemFilter> root element');
      }
      
      console.log('');
      console.log('📝 Advanced validation features will be added in future updates.');
      
    } catch (error) {
      console.error('❌ Error validating filter:', error.message);
      process.exit(1);
    }
  });

program
  .command('sample-analysis')
  .description('Analyze sample loot filters')
  .action(async () => {
    console.log('📊 Analyzing sample filters...');
    
    try {
      const sampleDir = path.join(__dirname, '../SampleFilters');
      
      if (!await fs.pathExists(sampleDir)) {
        console.error('❌ SampleFilters directory not found');
        process.exit(1);
      }
      
      const files = await fs.readdir(sampleDir);
      const xmlFiles = files.filter(f => f.endsWith('.xml'));
      
      if (xmlFiles.length === 0) {
        console.log('🔍 No sample filters found in SampleFilters/');
        return;
      }
      
      console.log(`🔍 Found ${xmlFiles.length} sample filters:`);
      console.log('');
      
      for (const file of xmlFiles) {
        const filePath = path.join(sampleDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const ruleCount = (content.match(/<Rule[^>]*>/g) || []).length;
        
        console.log(`📄 ${file}:`);
        console.log(`   Rules: ${ruleCount}/75 ${ruleCount > 75 ? '⚠️ OVER LIMIT' : '✅'}`);
      }
      
    } catch (error) {
      console.error('❌ Error analyzing samples:', error.message);
      process.exit(1);
    }
  });

program
  .command('info')
  .description('Show project information and status')
  .action(async () => {
    console.log('📊 Last Epoch Filter Generator');
    console.log('');
    
    // Check directory structure
    const dirs = ['SampleFilters', 'generated', 'Data'];
    console.log('📁 Directory Status:');
    for (const dir of dirs) {
      const exists = await fs.pathExists(dir);
      const displayName = dir + '/';
      console.log(`   ${exists ? '✅' : '❌'} ${displayName}`);
    }
    
    // Check if database exists (new structure)
    const databaseIndexFile = 'Data/database-index.json';
    const prefixesDir = 'Data/Prefixes';
    const suffixesDir = 'Data/Suffixes';
    const dbIndexExists = await fs.pathExists(databaseIndexFile);
    const prefixesDirExists = await fs.pathExists(prefixesDir);
    const suffixesDirExists = await fs.pathExists(suffixesDir);
    
    const dbExists = dbIndexExists && prefixesDirExists && suffixesDirExists;
    console.log(`   ${dbExists ? '✅' : '❌'} Database (structured format)`);
    
    if (dbExists) {
      try {
        const databaseIndex = JSON.parse(await fs.readFile(databaseIndexFile, 'utf8'));
        const versionFile = 'Data/database-version.json';
        let versionInfo = { gameVersion: 'unknown' };
        
        if (await fs.pathExists(versionFile)) {
          versionInfo = JSON.parse(await fs.readFile(versionFile, 'utf8'));
        }
        
        const totalItems = (databaseIndex.prefixes || 0) + (databaseIndex.suffixes || 0) + (databaseIndex.uniqueItems || 0);
        console.log(`   📊 Database version: ${versionInfo.gameVersion} (${totalItems} items)`);
      } catch (error) {
        console.log('   ⚠️ Database exists but could not read metadata');
      }
    }
    
    console.log('');
    console.log('🔧 Available Commands:');
    console.log('   npm run generate         - Generate a loot filter');
    console.log('   npm run validate-filter  - Validate a loot filter');
    console.log('   npm run sample-analysis  - Analyze sample filters'); 
    console.log('');
    console.log('💡 To build database: cd ../database-generator && npm run build');
    console.log('📚 Documentation: See README.md');
  });

// Default action when no command is specified
program
  .action(() => {
    console.log('🎮 Last Epoch Loot Filter Generator');
    console.log('');
    console.log('Use --help to see available commands');
    console.log('Run "npm run info" for project status');
  });

program.parse();