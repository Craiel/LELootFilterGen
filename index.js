#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { exec, spawn } = require('child_process');
const readline = require('readline');

/**
 * LELootFilterGen - Main Entry Point
 * 
 * Interactive menu system for all Last Epoch loot filter operations
 */

class LELootFilterGen {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.menuItems = [
      { key: '1', name: 'Build Database', desc: 'Parse templates and build game database', action: 'buildDatabase' },
      { key: '2', name: 'Force Rebuild Database', desc: 'Clean rebuild database (overwrites all)', action: 'forceBuildDatabase' },
      { key: '3', name: 'Database Info', desc: 'View database statistics and completion', action: 'databaseInfo' },
      { key: '4', name: 'Generate Affix Templates', desc: 'Create affix ID templates for testing', action: 'generateAffixTemplates' },
      { key: '5', name: 'Generate Unique Templates', desc: 'Create unique item templates for testing', action: 'generateUniqueTemplates' },
      { key: '6', name: 'Generate Set Templates', desc: 'Create set item templates for testing', action: 'generateSetTemplates' },
      { key: '7', name: 'Analyze Template Structure', desc: 'Analyze unique/set structure in master template', action: 'analyzeStructure' },
      { key: '8', name: 'Generate Filter', desc: 'Create custom loot filter (interactive)', action: 'generateFilter' },
      { key: '9', name: 'Open Override Files', desc: 'Open Data/overrides directory for manual editing', action: 'openOverrides' },
      { key: '0', name: 'Help & Documentation', desc: 'View help and documentation links', action: 'showHelp' },
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
    console.log('║                    LELootFilterGen v1.0.0                   ║');
    console.log('║              Last Epoch Loot Filter Generator               ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    
    // Show system status
    const dataDir = path.join(__dirname, 'Data');
    const dbFile = path.join(dataDir, 'game-database.jsonl');
    const dbExists = await fs.pathExists(dbFile);
    
    if (dbExists) {
      try {
        const versionFile = path.join(dataDir, 'database-version.json');
        const version = await fs.readJson(versionFile);
        const buildDate = new Date(version.buildDate).toLocaleDateString();
        console.log(`📊 Database Status: ✅ Built (${buildDate}, ${version.templateCount} templates)`);
      } catch {
        console.log('📊 Database Status: ✅ Available');
      }
    } else {
      console.log('📊 Database Status: ❌ Not built (run option 1 first)');
    }
    
    const overrideFiles = ['affixes.json', 'uniques.json', 'sets.json'];
    let overrideCount = 0;
    for (const file of overrideFiles) {
      const filePath = path.join(dataDir, 'overrides', file);
      if (await fs.pathExists(filePath)) {
        try {
          const data = await fs.readJson(filePath);
          overrideCount += Object.keys(data.overrides || {}).length;
        } catch {}
      }
    }
    console.log(`🔧 Manual Overrides: ${overrideCount > 0 ? `✅ ${overrideCount} entries` : '⚪ None'}`);
    
    console.log('');
  }

  /**
   * Display main menu and handle selection
   */
  async showMainMenu() {
    console.log('┌─ Main Menu ──────────────────────────────────────────────────┐');
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
        case 'buildDatabase':
          await this.runScript('node scripts/build-database.js');
          break;
          
        case 'forceBuildDatabase':
          console.log('⚠️  This will completely rebuild the database, preserving overrides.');
          const confirm = await this.prompt('Continue? (y/N): ');
          if (confirm.toLowerCase() === 'y') {
            await this.runScript('node scripts/build-database.js --force');
          } else {
            console.log('❌ Operation cancelled.');
          }
          break;
          
        case 'databaseInfo':
          await this.runScript('node scripts/database-info.js');
          break;
          
        case 'generateAffixTemplates':
          console.log('⚠️  This will generate/overwrite affix templates.');
          const confirmAffix = await this.prompt('Continue? (y/N): ');
          if (confirmAffix.toLowerCase() === 'y') {
            const force = await this.prompt('Force overwrite existing templates? (y/N): ');
            const forceFlag = force.toLowerCase() === 'y' ? ' --force' : '';
            await this.runScript(`node scripts/generate-affix-templates.js${forceFlag}`);
          }
          break;
          
        case 'generateUniqueTemplates':
          console.log('⚠️  This will generate/overwrite unique item templates.');
          const confirmUnique = await this.prompt('Continue? (y/N): ');
          if (confirmUnique.toLowerCase() === 'y') {
            const force = await this.prompt('Force overwrite existing templates? (y/N): ');
            const forceFlag = force.toLowerCase() === 'y' ? ' --force' : '';
            await this.runScript(`node scripts/generate-unique-templates.js${forceFlag}`);
          }
          break;
          
        case 'generateSetTemplates':
          console.log('⚠️  This will generate/overwrite set item templates.');
          const confirmSet = await this.prompt('Continue? (y/N): ');
          if (confirmSet.toLowerCase() === 'y') {
            const force = await this.prompt('Force overwrite existing templates? (y/N): ');
            const forceFlag = force.toLowerCase() === 'y' ? ' --force' : '';
            await this.runScript(`node scripts/generate-set-templates.js${forceFlag}`);
          }
          break;
          
        case 'analyzeStructure':
          await this.runScript('node scripts/analyze-unique-set-structure.js');
          break;
          
        case 'generateFilter':
          console.log('🚧 Filter generation coming soon!');
          console.log('For now, use the database and create filters manually.');
          break;
          
        case 'openOverrides':
          await this.openOverridesDirectory();
          break;
          
        case 'showHelp':
          await this.showHelp();
          break;
          
        case 'quit':
          console.log('👋 Thanks for using LELootFilterGen!');
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
   * Open overrides directory
   */
  async openOverridesDirectory() {
    const overridesDir = path.join(__dirname, 'Data', 'overrides');
    
    try {
      await fs.ensureDir(overridesDir);
      
      // Try to open in file explorer
      const platform = process.platform;
      let command;
      
      if (platform === 'win32') {
        command = `explorer "${overridesDir}"`;
      } else if (platform === 'darwin') {
        command = `open "${overridesDir}"`;
      } else {
        command = `xdg-open "${overridesDir}"`;
      }
      
      exec(command, (error) => {
        if (error) {
          console.log('❌ Could not open file explorer');
          console.log(`📁 Manual overrides directory: ${overridesDir}`);
          console.log('');
          console.log('Edit these files to add discovered item data:');
          console.log('  • affixes.json - Affix names and properties');
          console.log('  • uniques.json - Unique item names and properties');  
          console.log('  • sets.json - Set item names and properties');
        } else {
          console.log('✅ Opened overrides directory in file explorer');
          console.log(`📁 Location: ${overridesDir}`);
        }
      });
      
    } catch (error) {
      console.error('❌ Error accessing overrides directory:', error.message);
    }
  }

  /**
   * Show help and documentation
   */
  async showHelp() {
    console.log('📖 Help & Documentation');
    console.log('═'.repeat(60));
    console.log('');
    console.log('🎯 Quick Start:');
    console.log('  1. Run "Build Database" to create the initial database');
    console.log('  2. Generate templates for the data you want to collect');
    console.log('  3. Load templates in Last Epoch to identify items');
    console.log('  4. Add discovered data to override files (option 9)');
    console.log('  5. Rebuild database to include your discoveries');
    console.log('');
    console.log('📂 Important Directories:');
    console.log('  • TemplateFilters/ - Template XML files for game testing');
    console.log('  • Data/overrides/ - Manual data entry (JSON files)');
    console.log('  • Data/ - Generated database and logs');
    console.log('  • docs/ - Detailed documentation');
    console.log('');
    console.log('🔧 Advanced Operations:');
    console.log('  • Force rebuild: Cleans all generated data');
    console.log('  • Template generation: Creates XML for in-game testing');
    console.log('  • Override files: Add discovered item names and data');
    console.log('');
    console.log('📚 Documentation Files:');
    console.log('  • README.md - Project overview and commands');
    console.log('  • docs/database-builder-guide.md - Database system guide');
    console.log('  • docs/template-creation-procedure.md - Template procedures');
    console.log('  • Data/overrides/README.md - Override file format');
    console.log('');
    console.log('⚠️  Important Notes:');
    console.log('  • Last Epoch filters are limited to 75 rules maximum');
    console.log('  • Templates are generated, not hand-edited');  
    console.log('  • Manual data goes in Data/overrides/*.json files');
    console.log('  • Database rebuilds preserve override data');
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
    const app = new LELootFilterGen();
    await app.run();
    return;
  }
  
  // Direct command execution
  const command = args[0];
  const flags = args.slice(1);
  
  const commands = {
    'build-database': () => {
      const force = flags.includes('--force');
      const version = flags.find(f => f.startsWith('--version='))?.split('=')[1];
      let cmd = 'node scripts/build-database.js';
      if (force) cmd += ' --force';
      if (version) cmd += ` --version=${version}`;
      return cmd;
    },
    'database-info': () => 'node scripts/database-info.js',
    'generate-affixes': () => {
      const force = flags.includes('--force');
      return `node scripts/generate-affix-templates.js${force ? ' --force' : ''}`;
    },
    'generate-uniques': () => {
      const force = flags.includes('--force');
      return `node scripts/generate-unique-templates.js${force ? ' --force' : ''}`;
    },
    'generate-sets': () => {
      const force = flags.includes('--force');
      return `node scripts/generate-set-templates.js${force ? ' --force' : ''}`;
    },
    'analyze': () => 'node scripts/analyze-unique-set-structure.js'
  };
  
  if (commands[command]) {
    const cmd = commands[command]();
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
    console.log('❌ Unknown command. Available commands:');
    console.log('  build-database [--force] [--version=x.x.x]');
    console.log('  database-info');
    console.log('  generate-affixes [--force]');
    console.log('  generate-uniques [--force]'); 
    console.log('  generate-sets [--force]');
    console.log('  analyze');
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

module.exports = { LELootFilterGen };