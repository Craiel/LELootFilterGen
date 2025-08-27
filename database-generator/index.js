#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { exec, spawn } = require('child_process');
const readline = require('readline');

/**
 * Database Generator - Interactive Menu System
 * 
 * Handles database building, template generation, and data management
 */

class DatabaseGenerator {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.menuItems = [
      { key: '1', name: 'Build Database', desc: 'Parse templates and build game database', action: 'buildDatabase' },
      { key: '2', name: 'Force Rebuild Database', desc: 'Clean rebuild database (overwrites all)', action: 'forceBuildDatabase' },
      { key: '3', name: 'Generate Templates', desc: 'Create test templates (affixes, uniques, sets)', action: 'generateTemplates' },
      { key: '4', name: 'Database Info', desc: 'Show database statistics and information', action: 'databaseInfo' },
      { key: '5', name: 'Validate Data', desc: 'Check data integrity and validation', action: 'validateData' },
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
    console.log('║                   Database Generator v1.0.0                 ║');
    console.log('║              Last Epoch Game Data Builder                   ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    
    // Show system status
    const dataDir = path.join(__dirname, '../filter-generator/Data');
    const dbFile = path.join(dataDir, 'game-database.jsonl');
    const dbExists = await fs.pathExists(dbFile);
    
    if (dbExists) {
      try {
        const versionFile = path.join(dataDir, 'database-version.json');
        const version = await fs.readJson(versionFile);
        const buildDate = new Date(version.buildDate).toLocaleDateString();
        console.log(`📊 Database Status: ✅ Built (${buildDate}, ${version.templateCount} templates)`);
        console.log(`📂 Output Location: ../filter-generator/Data/`);
      } catch {
        console.log('📊 Database Status: ✅ Available');
        console.log(`📂 Output Location: ../filter-generator/Data/`);
      }
    } else {
      console.log('📊 Database Status: ❌ Not built (run option 1 first)');
      console.log(`📂 Output Location: ../filter-generator/Data/ (will be created)`);
    }
    
    const overrideFiles = ['affixes.json', 'uniques.json', 'sets.json'];
    let overrideCount = 0;
    const overridesDir = path.join(__dirname, 'Overrides');
    for (const file of overrideFiles) {
      const filePath = path.join(overridesDir, file);
      if (await fs.pathExists(filePath)) {
        try {
          const data = await fs.readJson(filePath);
          overrideCount += Object.keys(data.overrides || {}).length;
        } catch {}
      }
    }
    console.log(`🔧 Manual Overrides: ${overrideCount > 0 ? `✅ ${overrideCount} entries` : '⚪ None'}`);
    
    // Check WebData files
    const webDataDir = path.join(__dirname, 'WebData');
    const requiredFiles = ['ItemList.html', 'Sets.html', 'Prefixes.html', 'Suffixes.html'];
    let webDataCount = 0;
    for (const file of requiredFiles) {
      if (await fs.pathExists(path.join(webDataDir, file))) {
        webDataCount++;
      }
    }
    console.log(`🌐 Web Data Files: ${webDataCount}/${requiredFiles.length} available`);
    
    console.log('');
  }

  /**
   * Display main menu and handle selection
   */
  async showMainMenu() {
    console.log('┌─ Database Generator Menu ────────────────────────────────────┐');
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
          await this.runScript('npm run build');
          break;
          
        case 'forceBuildDatabase':
          console.log('⚠️  This will completely rebuild the database, preserving overrides.');
          const confirm = await this.prompt('Continue? (y/N): ');
          if (confirm.toLowerCase() === 'y') {
            await this.runScript('npm run build-force');
          } else {
            console.log('❌ Operation cancelled.');
          }
          break;
          
        case 'generateTemplates':
          await this.showTemplateGenerationMenu();
          break;
          
        case 'databaseInfo':
          await this.runScript('npm run info');
          break;
          
        case 'validateData':
          await this.runScript('npm run validate');
          break;
          
        case 'quit':
          console.log('👋 Thanks for using Database Generator!');
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
   * Show template generation submenu
   */
  async showTemplateGenerationMenu() {
    console.log('');
    console.log('┌─ Template Generation ────────────────────────────────────────┐');
    console.log('│                                                              │');
    console.log('│ [1] Generate Affix Templates      Create affix ID templates  │');
    console.log('│ [2] Generate Unique Templates     Create unique item temps   │');
    console.log('│ [3] Generate Set Templates        Create set item templates  │');
    console.log('│ [4] Generate Subtype Templates    Create subtype templates   │');
    console.log('│ [5] Generate All Templates        Create all template types  │');
    console.log('│ [6] Analyze Template Structure    Analyze master template    │');
    console.log('│ [B] Back to Main Menu             Return to main menu        │');
    console.log('│                                                              │');
    console.log('└──────────────────────────────────────────────────────────────┘');
    console.log('');

    const choice = await this.prompt('Select template option: ');
    
    switch (choice.toLowerCase()) {
      case '1':
        await this.generateAffixTemplates();
        break;
      case '2':
        await this.generateUniqueTemplates();
        break;
      case '3':
        await this.generateSetTemplates();
        break;
      case '4':
        await this.generateSubtypeTemplates();
        break;
      case '5':
        await this.generateAllTemplates();
        break;
      case '6':
        await this.runScript('node scripts/analyze-unique-set-structure.js');
        break;
      case 'b':
      case 'back':
        return; // Return to main menu
      default:
        console.log('❌ Invalid option. Please try again.');
        await this.waitForKey();
        await this.showTemplateGenerationMenu();
    }
  }

  /**
   * Generate affix templates
   */
  async generateAffixTemplates() {
    console.log('⚠️  This will generate/overwrite affix templates.');
    const confirm = await this.prompt('Continue? (y/N): ');
    if (confirm.toLowerCase() === 'y') {
      const force = await this.prompt('Force overwrite existing templates? (y/N): ');
      const forceFlag = force.toLowerCase() === 'y' ? ' --force' : '';
      await this.runScript(`node scripts/generate-affix-templates.js${forceFlag}`);
    } else {
      console.log('❌ Operation cancelled.');
    }
  }

  /**
   * Generate unique templates
   */
  async generateUniqueTemplates() {
    console.log('⚠️  This will generate/overwrite unique item templates.');
    const confirm = await this.prompt('Continue? (y/N): ');
    if (confirm.toLowerCase() === 'y') {
      const force = await this.prompt('Force overwrite existing templates? (y/N): ');
      const forceFlag = force.toLowerCase() === 'y' ? ' --force' : '';
      await this.runScript(`node scripts/generate-unique-templates.js${forceFlag}`);
    } else {
      console.log('❌ Operation cancelled.');
    }
  }

  /**
   * Generate set templates
   */
  async generateSetTemplates() {
    console.log('⚠️  This will generate/overwrite set item templates.');
    const confirm = await this.prompt('Continue? (y/N): ');
    if (confirm.toLowerCase() === 'y') {
      const force = await this.prompt('Force overwrite existing templates? (y/N): ');
      const forceFlag = force.toLowerCase() === 'y' ? ' --force' : '';
      await this.runScript(`node scripts/generate-set-templates.js${forceFlag}`);
    } else {
      console.log('❌ Operation cancelled.');
    }
  }

  /**
   * Generate subtype templates
   */
  async generateSubtypeTemplates() {
    console.log('⚠️  This will generate/overwrite subtype templates.');
    const confirm = await this.prompt('Continue? (y/N): ');
    if (confirm.toLowerCase() === 'y') {
      const force = await this.prompt('Force overwrite existing templates? (y/N): ');
      const forceFlag = force.toLowerCase() === 'y' ? ' --force' : '';
      await this.runScript(`node scripts/generate-subtype-templates.js${forceFlag}`);
    } else {
      console.log('❌ Operation cancelled.');
    }
  }

  /**
   * Generate all template types
   */
  async generateAllTemplates() {
    console.log('⚠️  This will generate/overwrite ALL template types (affixes, uniques, sets, subtypes).');
    const confirm = await this.prompt('Continue? (y/N): ');
    if (confirm.toLowerCase() === 'y') {
      const force = await this.prompt('Force overwrite existing templates? (y/N): ');
      const forceFlag = force.toLowerCase() === 'y' ? ' --force' : '';
      
      console.log('🚀 Generating affix templates...');
      await this.runScript(`node scripts/generate-affix-templates.js${forceFlag}`);
      
      console.log('🚀 Generating unique templates...');
      await this.runScript(`node scripts/generate-unique-templates.js${forceFlag}`);
      
      console.log('🚀 Generating set templates...');
      await this.runScript(`node scripts/generate-set-templates.js${forceFlag}`);
      
      console.log('🚀 Generating subtype templates...');
      await this.runScript(`node scripts/generate-subtype-templates.js${forceFlag}`);
      
      console.log('✅ All template types generated successfully!');
    } else {
      console.log('❌ Operation cancelled.');
    }
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
    const app = new DatabaseGenerator();
    await app.run();
    return;
  }
  
  // Direct command execution
  const command = args[0];
  const flags = args.slice(1);
  
  const commands = {
    'build': () => {
      const force = flags.includes('--force');
      return force ? 'npm run build-force' : 'npm run build';
    },
    'info': () => 'npm run info',
    'validate': () => 'npm run validate',
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
    'generate-subtypes': () => {
      const force = flags.includes('--force');
      return `node scripts/generate-subtype-templates.js${force ? ' --force' : ''}`;
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
    console.log('  build [--force]              - Build game database');
    console.log('  info                         - Show database information');
    console.log('  validate                     - Validate data integrity');
    console.log('  generate-affixes [--force]   - Generate affix templates');
    console.log('  generate-uniques [--force]   - Generate unique templates'); 
    console.log('  generate-sets [--force]      - Generate set templates');
    console.log('  generate-subtypes [--force]  - Generate subtype templates');
    console.log('  analyze                      - Analyze template structure');
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

module.exports = { DatabaseGenerator };