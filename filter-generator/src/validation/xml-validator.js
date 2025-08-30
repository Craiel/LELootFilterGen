const fs = require('fs-extra');
const path = require('path');
const xml2js = require('xml2js');

/**
 * XML Validator for Last Epoch loot filter XML files
 * Validates XML files against XSD schema and reports errors
 */
class XMLValidator {
    constructor() {
        this.parser = new xml2js.Parser({
            explicitArray: false,
            ignoreAttrs: false,
            attrkey: '@',
            charkey: '#text',
            normalizeTags: false,
            explicitRoot: true
        });
    }

    /**
     * Validate all XML files in a directory against XSD schema
     */
    async validateDirectory(directoryPath, schemaPath) {
        console.log('🔍 Scanning for XML files...');
        
        try {
            // Load XSD schema (for now, we'll do basic structure validation)
            const schemaContent = await fs.readFile(schemaPath, 'utf8');
            console.log(`📋 Loaded schema: ${path.basename(schemaPath)}`);
            
            // Find all XML files
            const xmlFiles = await this.findXMLFiles(directoryPath);
            console.log(`📁 Found ${xmlFiles.length} XML files to validate`);
            
            if (xmlFiles.length === 0) {
                console.log('⚠️  No XML files found in directory');
                return { totalFiles: 0, validFiles: 0, errors: [] };
            }

            console.log('');
            console.log('🔍 Validating XML files...');
            console.log('');

            const results = {
                totalFiles: xmlFiles.length,
                validFiles: 0,
                errors: []
            };

            // Validate each file
            for (const xmlFile of xmlFiles) {
                const fileName = path.basename(xmlFile);
                const validation = await this.validateFile(xmlFile, schemaContent);
                
                if (validation.valid) {
                    console.log(`✅ ${fileName}`);
                    results.validFiles++;
                } else {
                    console.log(`❌ ${fileName}`);
                    validation.errors.forEach(error => {
                        console.log(`   └─ ${error}`);
                    });
                    
                    results.errors.push({
                        file: fileName,
                        errors: validation.errors
                    });
                }
            }

            console.log('');
            this.printSummary(results);
            
            return results;
            
        } catch (error) {
            console.error('❌ Validation process failed:', error.message);
            throw error;
        }
    }

    /**
     * Find all XML files in a directory
     */
    async findXMLFiles(directoryPath) {
        const files = await fs.readdir(directoryPath);
        return files
            .filter(file => file.toLowerCase().endsWith('.xml'))
            .map(file => path.join(directoryPath, file));
    }

    /**
     * Validate a single XML file
     */
    async validateFile(xmlFilePath, schemaContent) {
        const validation = {
            valid: true,
            errors: []
        };

        try {
            // Read and parse XML file
            const xmlContent = await fs.readFile(xmlFilePath, 'utf8');
            
            // Basic XML parsing validation
            try {
                const parsed = await this.parser.parseStringPromise(xmlContent);
                
                // Validate structure against expected schema
                const structureErrors = this.validateStructure(parsed);
                if (structureErrors.length > 0) {
                    validation.valid = false;
                    validation.errors.push(...structureErrors);
                }
                
                // Validate rule count
                const ruleCountError = this.validateRuleCount(parsed);
                if (ruleCountError) {
                    validation.valid = false;
                    validation.errors.push(ruleCountError);
                }
                
                // Validate required fields
                const fieldErrors = this.validateRequiredFields(parsed);
                if (fieldErrors.length > 0) {
                    validation.valid = false;
                    validation.errors.push(...fieldErrors);
                }

                // Check for deprecated fields
                const deprecatedWarnings = this.checkDeprecatedFields(parsed);
                if (deprecatedWarnings.length > 0) {
                    // These are warnings, not errors
                    validation.errors.push(...deprecatedWarnings.map(w => `⚠️  ${w}`));
                }
                
            } catch (parseError) {
                validation.valid = false;
                validation.errors.push(`XML parsing failed: ${parseError.message}`);
            }
            
        } catch (readError) {
            validation.valid = false;
            validation.errors.push(`Failed to read file: ${readError.message}`);
        }

        return validation;
    }

    /**
     * Validate basic XML structure
     */
    validateStructure(parsed) {
        const errors = [];

        // Check for root element
        if (!parsed.ItemFilter) {
            errors.push('Missing root element <ItemFilter>');
            return errors;
        }

        const filter = parsed.ItemFilter;

        // Check for required top-level elements (description is optional in some versions)
        const required = ['name', 'filterIcon', 'filterIconColor', 'lastModifiedInVersion', 'lootFilterVersion'];
        for (const field of required) {
            if (!filter[field] && filter[field] !== 0) {
                errors.push(`Missing required field: ${field}`);
            }
        }

        // Check rules structure
        if (!filter.rules) {
            errors.push('Missing <rules> element');
        } else if (filter.rules.Rule) {
            // Validate individual rules
            const rules = Array.isArray(filter.rules.Rule) ? filter.rules.Rule : [filter.rules.Rule];
            
            for (let i = 0; i < rules.length; i++) {
                const rule = rules[i];
                const ruleErrors = this.validateRule(rule, i + 1);
                errors.push(...ruleErrors);
            }
        }

        return errors;
    }

    /**
     * Validate individual rule structure
     */
    validateRule(rule, ruleIndex) {
        const errors = [];

        if (!rule.type) {
            errors.push(`Rule ${ruleIndex}: Missing rule type`);
        } else if (!['SHOW', 'HIDE', 'HIGHLIGHT'].includes(rule.type)) {
            errors.push(`Rule ${ruleIndex}: Invalid rule type '${rule.type}'`);
        }

        // Conditions can be empty object/array for some rule types
        if (rule.conditions === undefined || rule.conditions === null) {
            errors.push(`Rule ${ruleIndex}: Missing conditions`);
        }

        if (rule.color === undefined || rule.color === null) {
            errors.push(`Rule ${ruleIndex}: Missing color`);
        }

        if (rule.isEnabled === undefined || rule.isEnabled === null) {
            errors.push(`Rule ${ruleIndex}: Missing isEnabled`);
        }

        return errors;
    }

    /**
     * Validate rule count (75 rule limit)
     */
    validateRuleCount(parsed) {
        if (!parsed.ItemFilter || !parsed.ItemFilter.rules || !parsed.ItemFilter.rules.Rule) {
            return null;
        }

        const rules = Array.isArray(parsed.ItemFilter.rules.Rule) ? 
            parsed.ItemFilter.rules.Rule : [parsed.ItemFilter.rules.Rule];
        
        if (rules.length > 75) {
            return `Rule count exceeds limit: ${rules.length}/75 rules`;
        }

        return null;
    }

    /**
     * Validate required fields have valid values
     */
    validateRequiredFields(parsed) {
        const errors = [];
        const filter = parsed.ItemFilter;

        if (!filter) return errors;

        // Validate lootFilterVersion (current versions are 3, 4, 5)
        if (filter.lootFilterVersion !== undefined) {
            const version = parseInt(filter.lootFilterVersion);
            if (isNaN(version) || version < 3 || version > 5) {
                errors.push(`Invalid lootFilterVersion: ${filter.lootFilterVersion} (expected: 3-5)`);
            }
        }

        // Validate filterIcon range
        if (filter.filterIcon !== undefined) {
            const icon = parseInt(filter.filterIcon);
            if (isNaN(icon) || icon < 0 || icon > 24) {
                errors.push(`Invalid filterIcon: ${filter.filterIcon} (expected: 0-24)`);
            }
        }

        // Validate filterIconColor range
        if (filter.filterIconColor !== undefined) {
            const color = parseInt(filter.filterIconColor);
            if (isNaN(color) || color < 0 || color > 17) {
                errors.push(`Invalid filterIconColor: ${filter.filterIconColor} (expected: 0-17)`);
            }
        }

        return errors;
    }

    /**
     * Check for deprecated fields that should be updated
     */
    checkDeprecatedFields(parsed) {
        const warnings = [];

        if (!parsed.ItemFilter || !parsed.ItemFilter.rules || !parsed.ItemFilter.rules.Rule) {
            return warnings;
        }

        const rules = Array.isArray(parsed.ItemFilter.rules.Rule) ? 
            parsed.ItemFilter.rules.Rule : [parsed.ItemFilter.rules.Rule];

        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];

            if (rule.levelDependent_deprecated !== undefined) {
                warnings.push(`Rule ${i + 1}: Uses deprecated field 'levelDependent_deprecated'`);
            }

            if (rule.minLvl_deprecated !== undefined) {
                warnings.push(`Rule ${i + 1}: Uses deprecated field 'minLvl_deprecated'`);
            }

            if (rule.maxLvl_deprecated !== undefined) {
                warnings.push(`Rule ${i + 1}: Uses deprecated field 'maxLvl_deprecated'`);
            }

            if (rule.advanced_DEPRECATED !== undefined) {
                warnings.push(`Rule ${i + 1}: Uses deprecated field 'advanced_DEPRECATED'`);
            }
        }

        return warnings;
    }

    /**
     * Print validation summary
     */
    printSummary(results) {
        console.log('📊 Validation Summary:');
        console.log(`   Total files: ${results.totalFiles}`);
        console.log(`   Valid files: ${results.validFiles}`);
        console.log(`   Files with errors: ${results.errors.length}`);
        
        if (results.errors.length === 0) {
            console.log('');
            console.log('🎉 All XML files are valid!');
        } else {
            console.log('');
            console.log('❌ Files with validation errors:');
            results.errors.forEach(fileError => {
                console.log(`   ${fileError.file}:`);
                fileError.errors.forEach(error => {
                    console.log(`     - ${error}`);
                });
            });
        }
    }
}

module.exports = XMLValidator;