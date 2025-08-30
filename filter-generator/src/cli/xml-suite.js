#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const fs = require('fs-extra');

// Import core components
const SchemaGenerator = require('../schema/schema-generator');
const DataManager = require('../data/data-manager');
const XMLValidator = require('../validation/xml-validator');
// const FilterAnalyzer = require('../analysis/filter-analyzer');
// const FilterGenerator = require('../generator/filter-generator');

program
  .name('xml-suite')
  .description('XML suite: XSD generation, XML filter creation, and validation')
  .version('2.0.0');

program
  .command('schema')
  .description('Generate XSD schema from existing XML filters')
  .option('-s, --source <pattern>', 'Source XML files pattern', 'SampleFilters/*.xml')
  .option('-o, --output <file>', 'Output XSD schema file', 'schema/filter-schema.xsd')
  .action(async (options) => {
    console.log('🔧 XML Schema Generation');
    console.log('');
    
    try {
      console.log(`📁 Source pattern: ${options.source}`);
      console.log(`📄 Output schema: ${options.output}`);
      console.log('');
      
      const schemaGenerator = new SchemaGenerator();
      await schemaGenerator.generateSchema(options.source, options.output);
      
    } catch (error) {
      console.error('❌ Schema generation failed:', error.message);
      process.exit(1);
    }
  });


program
  .command('create')
  .description('Create XML filter from intermediate JSON file')
  .requiredOption('-i, --intermediate <file>', 'Intermediate JSON file (created by Claude analysis)')
  .option('-s, --strictness <level>', 'Filter strictness level', 'strict')
  .option('-o, --output <file>', 'Output XML filter file')
  .action(async (options) => {
    console.log('⚡ XML Filter Creation');
    console.log('');
    
    try {
      if (!await fs.pathExists(options.intermediate)) {
        console.error(`❌ Intermediate file not found: ${options.intermediate}`);
        console.error('💡 Create intermediate JSON using Claude with FILTER_ANALYSIS_INSTRUCTIONS.md');
        process.exit(1);
      }
      
      const baseName = path.basename(options.intermediate, '.intermediate.json') || 
                      path.basename(options.intermediate, '.json');
      const outputFile = options.output || `generated/${baseName}-${options.strictness}.xml`;
      
      console.log(`📁 Intermediate file: ${options.intermediate}`);
      console.log(`🎯 Strictness level: ${options.strictness}`);
      console.log(`📄 Output filter: ${outputFile}`);
      console.log('');
      
      // TODO: Implement filter creation from intermediate JSON
      console.log('❌ XML filter creation not yet implemented');
      console.log('💡 Will read intermediate JSON and generate XML using native XML processing');
      
    } catch (error) {
      console.error('❌ Filter creation failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate all XML filters in SampleFilters against XSD schema')
  .option('-s, --schema <file>', 'XSD schema file', 'schema/filter-schema.xsd')
  .option('-d, --directory <dir>', 'Directory containing XML filters', 'SampleFilters')
  .action(async (options) => {
    console.log('✅ XML Filter Validation');
    console.log('');
    
    try {
      if (!await fs.pathExists(options.schema)) {
        console.error(`❌ Schema file not found: ${options.schema}`);
        console.error('💡 Run "xml-suite schema" first to generate the XSD schema');
        process.exit(1);
      }
      
      if (!await fs.pathExists(options.directory)) {
        console.error(`❌ Directory not found: ${options.directory}`);
        process.exit(1);
      }
      
      console.log(`📋 Schema file: ${options.schema}`);
      console.log(`📁 Filter directory: ${options.directory}`);
      console.log('');
      
      const validator = new XMLValidator();
      const results = await validator.validateDirectory(options.directory, options.schema);
      
      // Exit with error code if validation issues found
      if (results.errors.length > 0) {
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  });


// Interactive menu when no command is specified
program
  .action(async () => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    function prompt(question) {
      return new Promise((resolve) => {
        rl.question(question, (answer) => {
          resolve(answer.trim());
        });
      });
    }

    function showMenu() {
      console.clear();
      console.log('╔══════════════════════════════════════════════════════════════╗');
      console.log('║                     XML Suite v2.0.0                        ║');
      console.log('║                Last Epoch Loot Filter Suite                 ║');
      console.log('╚══════════════════════════════════════════════════════════════╝');
      console.log('');
      console.log('┌─ XML Suite Menu ─────────────────────────────────────────────┐');
      console.log('│                                                              │');
      console.log('│ [1] Generate Schema       Create XSD from existing filters  │');
      console.log('│ [2] Create Filter        Generate filter from intermediate  │');
      console.log('│ [3] Validate Filters     Check all SampleFilters vs XSD    │');
      console.log('│ [Q] Quit                 Exit application                   │');
      console.log('│                                                              │');
      console.log('└──────────────────────────────────────────────────────────────┘');
      console.log('');
    }

    async function handleChoice(choice) {
      const { spawn } = require('child_process');
      
      switch (choice.toLowerCase()) {
        case '1':
          console.log('\n🔧 Running Schema Generation...\n');
          return new Promise((resolve) => {
            const child = spawn('node', ['src/cli/xml-suite.js', 'schema'], { stdio: 'inherit' });
            child.on('close', resolve);
          });
          
        case '2':
          const intermediateFile = await prompt('Enter intermediate JSON file path: ');
          if (intermediateFile.trim()) {
            console.log('\n⚡ Running Filter Creation...\n');
            return new Promise((resolve) => {
              const child = spawn('node', ['src/cli/xml-suite.js', 'create', '-i', intermediateFile.trim()], { stdio: 'inherit' });
              child.on('close', resolve);
            });
          } else {
            console.log('❌ Operation cancelled.');
            await prompt('Press Enter to continue...');
          }
          break;
          
        case '3':
          console.log('\n✅ Running Filter Validation...\n');
          return new Promise((resolve) => {
            const child = spawn('node', ['src/cli/xml-suite.js', 'validate'], { stdio: 'inherit' });
            child.on('close', resolve);
          });
          
        case 'q':
        case 'quit':
          console.log('\n👋 Thanks for using XML Suite!');
          rl.close();
          process.exit(0);
          
        default:
          console.log('❌ Invalid option. Please try again.');
          await prompt('Press Enter to continue...');
      }
    }

    // Main interactive loop
    async function runMenu() {
      showMenu();
      const choice = await prompt('Select option: ');
      await handleChoice(choice);
      
      if (!choice.toLowerCase().startsWith('q')) {
        console.log('');
        await prompt('Press Enter to return to menu...');
        await runMenu();
      }
    }
    
    await runMenu();
  });

program.parse();