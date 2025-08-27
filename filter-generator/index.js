#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { exec, spawn } = require('child_process');
const readline = require('readline');

/**
 * Filter Generator - Interactive Menu System
 * 
 * Handles loot filter generation, validation, and sample analysis
 */

class FilterGenerator {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.menuItems = [
      { key: '1', name: 'Generate Filter', desc: 'Create custom loot filter (interactive)', action: 'generateFilter' },
      { key: '2', name: 'Validate Filter', desc: 'Check filter XML and rule count', action: 'validateFilter' },
      { key: '3', name: 'Analyze Samples', desc: 'Examine sample filters and patterns', action: 'analyzeSamples' },
      { key: '4', name: 'Filter Info', desc: 'Show system status and information', action: 'filterInfo' },
      { key: '5', name: 'Build Database', desc: 'Quick build database (from database-generator)', action: 'buildDatabase' },
      { key: 'q', name: 'Quit', desc: 'Exit the application', action: 'quit' }
    ];
  }

  /**
   * Main application entry point
   */
  async run() {
    await this.showWelcome();
    await this.showMainMenu();
  }

  /**
   * Display welcome message and system info
   */
  async showWelcome() {
    console.clear();
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                   Filter Generator v1.0.0                   ║');
    console.log('║               Last Epoch Loot Filter Creator                ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    
    // Show system status
    const dbFile = path.join(__dirname, 'Data/game-database.jsonl');
    const dbExists = await fs.pathExists(dbFile);
    
    if (dbExists) {
      try {
        const content = await fs.readFile(dbFile, 'utf8');
        const firstLine = content.split('\n')[0].trim();
        
        if (!firstLine || firstLine === '{') {
          console.log('📊 Database Status: ⚠️ Incomplete - needs rebuilding');
        } else {
          const metadata = JSON.parse(firstLine);
          const totalItems = metadata.stats.affixes + metadata.stats.uniques + metadata.stats.sets;
          console.log(`📊 Database Status: ✅ Ready (${metadata.version}, ${totalItems} items)`);
        }
      } catch {
        console.log('📊 Database Status: ⚠️ Available but unreadable');
      }
    } else {
      console.log('📊 Database Status: ❌ Not found (use option 5 to build)');
    }
    
    // Check sample filters
    const sampleDir = path.join(__dirname, 'SampleFilters');
    if (await fs.pathExists(sampleDir)) {
      const files = await fs.readdir(sampleDir);
      const xmlFiles = files.filter(f => f.endsWith('.xml'));
      console.log(`📄 Sample Filters: ${xmlFiles.length} available for analysis`);
    } else {
      console.log('📄 Sample Filters: ❌ Directory not found');
    }
    
    // Check generated directory
    const genDir = path.join(__dirname, 'generated');
    if (await fs.pathExists(genDir)) {
      const files = await fs.readdir(genDir);
      const xmlFiles = files.filter(f => f.endsWith('.xml'));
      console.log(`🎯 Generated Filters: ${xmlFiles.length} in output directory`);
    } else {
      console.log('🎯 Generated Filters: ⚪ Output directory will be created');
    }
    
    console.log('');
  }

  /**
   * Display main menu and handle selection
   */
  async showMainMenu() {
    console.log('┌─ Filter Generator Menu ──────────────────────────────────────┐');
    console.log('│                                                              │');
    
    for (const item of this.menuItems) {
      const keyDisplay = item.key === 'q' ? 'Q' : item.key;
      const line = `│ [${keyDisplay}] ${item.name.padEnd(25)} ${item.desc.padEnd(28)} │`;
      console.log(line);
    }
    
    console.log('│                                                              │');
    console.log('└──────────────────────────────────────────────────────────────┘');
    console.log('');
    
    const choice = await this.prompt('Select option: ');
    const selectedItem = this.menuItems.find(item => item.key.toLowerCase() === choice.toLowerCase());
    
    if (selectedItem) {
      await this.executeAction(selectedItem.action);
    } else {
      console.log('❌ Invalid option. Please try again.');
      await this.waitForKey();
      await this.showWelcome();
      await this.showMainMenu();
    }
  }

  /**
   * Execute the selected action
   */
  async executeAction(action) {
    console.log('');
    
    try {
      switch (action) {
        case 'generateFilter':
          await this.runScript('npm run generate');
          break;
          
        case 'validateFilter':
          await this.showValidateFilterMenu();
          break;
          
        case 'analyzeSamples':
          await this.runScript('npm run sample-analysis');
          break;
          
        case 'filterInfo':
          await this.runScript('npm run info');
          break;
          
        case 'buildDatabase':
          console.log('⚡ Building database using database-generator...');
          await this.runScriptInSubProject('../database-generator', 'npm run build');
          break;
          
        case 'quit':
          console.log('👋 Thanks for using Filter Generator!');
          this.rl.close();
          process.exit(0);
          
        default:
          console.log('❌ Unknown action');
      }
      
    } catch (error) {
      console.error('❌ Error executing action:', error.message);
    }
    
    if (action !== 'quit') {
      await this.waitForKey();
      await this.showWelcome();
      await this.showMainMenu();
    }
  }

  /**
   * Show validate filter submenu
   */
  async showValidateFilterMenu() {
    console.log('');
    console.log('┌─ Filter Validation ──────────────────────────────────────────┐');
    console.log('│                                                              │');
    console.log('│ [1] Validate Sample Filter     Choose from available samples │');
    console.log('│ [2] Validate Custom File       Enter file path manually      │');
    console.log('│ [3] Validate Generated Filter  Check filters in generated/   │');
    console.log('│ [B] Back to Main Menu          Return to main menu           │');
    console.log('│                                                              │');
    console.log('└──────────────────────────────────────────────────────────────┘');
    console.log('');

    const choice = await this.prompt('Select validation option: ');
    
    switch (choice.toLowerCase()) {
      case '1':
        await this.validateSampleFilter();
        break;
      case '2':
        await this.validateCustomFilter();
        break;
      case '3':
        await this.validateGeneratedFilter();
        break;
      case 'b':
      case 'back':
        return; // Return to main menu
      default:
        console.log('❌ Invalid option. Please try again.');
        await this.waitForKey();
        await this.showValidateFilterMenu();
    }
  }

  /**
   * Validate a sample filter
   */
  async validateSampleFilter() {
    const sampleDir = path.join(__dirname, 'SampleFilters');
    if (!await fs.pathExists(sampleDir)) {
      console.log('❌ SampleFilters directory not found');
      return;
    }
    
    const files = await fs.readdir(sampleDir);
    const xmlFiles = files.filter(f => f.endsWith('.xml'));
    
    if (xmlFiles.length === 0) {
      console.log('❌ No sample filters found');
      return;
    }
    
    console.log('📄 Available sample filters:');
    xmlFiles.forEach((file, i) => {
      console.log(`   ${i + 1}. ${file}`);
    });
    console.log('');
    
    const choice = await this.prompt('Select filter number (or press Enter to cancel): ');
    const index = parseInt(choice) - 1;
    
    if (choice.trim() === '' || isNaN(index) || index < 0 || index >= xmlFiles.length) {
      console.log('❌ Operation cancelled or invalid choice.');
      return;
    }
    
    const selectedFile = path.join(sampleDir, xmlFiles[index]);
    await this.runScript(`node src/index.js validate-filter "${selectedFile}"`);
  }

  /**
   * Validate a custom filter file
   */
  async validateCustomFilter() {
    const filePath = await this.prompt('Enter filter file path: ');
    if (filePath.trim()) {
      await this.runScript(`node src/index.js validate-filter "${filePath.trim()}"`);
    } else {
      console.log('❌ Operation cancelled.');
    }
  }

  /**
   * Validate a generated filter
   */
  async validateGeneratedFilter() {
    const genDir = path.join(__dirname, 'generated');
    if (!await fs.pathExists(genDir)) {
      console.log('❌ Generated filters directory not found');
      return;
    }
    
    const files = await fs.readdir(genDir);
    const xmlFiles = files.filter(f => f.endsWith('.xml'));
    
    if (xmlFiles.length === 0) {
      console.log('❌ No generated filters found');
      return;
    }
    
    console.log('🎯 Available generated filters:');
    xmlFiles.forEach((file, i) => {
      console.log(`   ${i + 1}. ${file}`);
    });
    console.log('');
    
    const choice = await this.prompt('Select filter number (or press Enter to cancel): ');
    const index = parseInt(choice) - 1;
    
    if (choice.trim() === '' || isNaN(index) || index < 0 || index >= xmlFiles.length) {
      console.log('❌ Operation cancelled or invalid choice.');
      return;
    }
    
    const selectedFile = path.join(genDir, xmlFiles[index]);
    await this.runScript(`node src/index.js validate-filter "${selectedFile}"`);
  }

  /**
   * Run a script and show its output
   */
  async runScript(command) {
    console.log(`🚀 Running: ${command}`);
    console.log('─'.repeat(60));
    
    return new Promise((resolve, reject) => {
      const child = spawn('cmd', ['/c', command], {
        stdio: 'inherit',
        shell: true,
        cwd: __dirname
      });
      
      child.on('close', (code) => {
        console.log('─'.repeat(60));
        if (code === 0) {
          console.log('✅ Command completed successfully');
        } else {
          console.log(`❌ Command failed with code: ${code}`);
        }
        resolve();
      });
      
      child.on('error', (err) => {
        console.log('─'.repeat(60));
        console.error('❌ Error:', err.message);
        resolve();
      });
    });
  }

  /**
   * Run a script in a different sub-project directory
   */
  async runScriptInSubProject(subProject, command) {
    const projectPath = path.join(__dirname, subProject);
    console.log(`🚀 Running in ${subProject}: ${command}`);
    console.log('─'.repeat(60));
    
    return new Promise((resolve, reject) => {
      const child = spawn('cmd', ['/c', command], {
        stdio: 'inherit',
        shell: true,
        cwd: projectPath
      });
      
      child.on('close', (code) => {
        console.log('─'.repeat(60));
        if (code === 0) {
          console.log('✅ Command completed successfully');
        } else {
          console.log(`❌ Command failed with code: ${code}`);
        }
        resolve();
      });
      
      child.on('error', (err) => {
        console.log('─'.repeat(60));
        console.error('❌ Error:', err.message);
        resolve();
      });
    });
  }

  /**
   * Prompt for user input
   */
  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }
  
  /**
   * Wait for user to press any key
   */
  async waitForKey() {
    console.log('');
    await this.prompt('Press Enter to continue...');
  }
}

// CLI argument handling for direct script calls
async function handleDirectCall() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // No arguments - show interactive menu
    const app = new FilterGenerator();
    await app.run();
    return;
  }
  
  // Direct command execution
  const command = args[0];
  const flags = args.slice(1);
  
  const commands = {
    'generate': () => 'npm run generate',
    'info': () => 'npm run info',
    'validate': () => {
      const file = flags[0];
      return file ? `node src/index.js validate-filter "${file}"` : 'npm run info';
    },
    'samples': () => 'npm run sample-analysis',
    'build-database': () => {
      return { subProject: '../database-generator', cmd: 'npm run build' };
    }
  };
  
  if (commands[command]) {
    const result = commands[command]();
    
    if (typeof result === 'string') {
      // Regular command
      const cmd = result;
      console.log(`🚀 Running: ${cmd}`);
      
      const { spawn } = require('child_process');
      const child = spawn('cmd', ['/c', cmd], {
        stdio: 'inherit',
        shell: true,
        cwd: __dirname
      });
      
      child.on('close', (code) => {
        process.exit(code);
      });
    } else {
      // Sub-project command
      const { subProject, cmd } = result;
      console.log(`🚀 Running in ${subProject}: ${cmd}`);
      
      const { spawn } = require('child_process');
      const projectPath = path.join(__dirname, subProject);
      const child = spawn('cmd', ['/c', cmd], {
        stdio: 'inherit',
        shell: true,
        cwd: projectPath
      });
      
      child.on('close', (code) => {
        process.exit(code);
      });
    }
  } else {
    console.log('❌ Unknown command. Available commands:');
    console.log('  generate                     - Generate a loot filter');
    console.log('  info                         - Show system information');
    console.log('  validate [file]              - Validate a filter file');
    console.log('  samples                      - Analyze sample filters');
    console.log('  build-database               - Build database (via database-generator)');
    console.log('');
    console.log('Or run with no arguments for interactive menu.');
    process.exit(1);
  }
}

// Handle uncaught errors gracefully
process.on('uncaughtException', (error) => {
  console.error('❌ Unexpected error:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled promise rejection:', reason);
  process.exit(1);
});

// Run the application
if (require.main === module) {
  handleDirectCall();
}

module.exports = { FilterGenerator };