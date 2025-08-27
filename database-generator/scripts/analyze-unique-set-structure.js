const fs = require('fs-extra');
const path = require('path');
const { parseStringPromise } = require('xml2js');

async function analyzeUniqueSetStructure() {
    console.log('🔍 Analyzing unique and set item structure in MasterTemplate1.xml...');
    
    const templatePath = path.join(__dirname, '..', 'TemplateFilters', 'MasterTemplate1.xml');
    
    if (!await fs.pathExists(templatePath)) {
        throw new Error('MasterTemplate1.xml not found');
    }
    
    const xmlContent = await fs.readFile(templatePath, 'utf8');
    const parsed = await parseStringPromise(xmlContent);
    
    const rules = parsed.ItemFilter.rules[0].Rule;
    console.log(`📊 Total rules in master template: ${rules.length}`);
    
    let allUniqueRuleFound = false;
    let setItemRuleFound = false;
    let allUniqueIds = new Set();
    let setItemIds = new Set();
    
    for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        const nameOverride = rule.nameOverride?.[0] || '';
        
        // Look for rules with UniqueModifiersCondition
        if (rule.conditions?.[0]?.Condition) {
            for (const condition of rule.conditions[0].Condition) {
                if (condition.$?.['i:type'] === 'UniqueModifiersCondition') {
                    console.log(`\n📋 Rule ${i + 1}: "${nameOverride}"`);
                    
                    if (condition.Uniques) {
                        const uniqueIds = [];
                        for (const unique of condition.Uniques) {
                            if (unique.UniqueId) {
                                const id = parseInt(unique.UniqueId[0]);
                                uniqueIds.push(id);
                                
                                if (nameOverride === 'All Set Items') {
                                    setItemIds.add(id);
                                } else {
                                    allUniqueIds.add(id);
                                }
                            }
                        }
                        
                        console.log(`   Unique IDs: [${uniqueIds.sort((a, b) => a - b).join(', ')}]`);
                        console.log(`   Total count: ${uniqueIds.length}`);
                        
                        if (nameOverride === 'All Set Items') {
                            setItemRuleFound = true;
                        }
                        if (nameOverride.includes('All') && nameOverride.includes('Unique')) {
                            allUniqueRuleFound = true;
                        }
                    }
                }
            }
        }
    }
    
    // Convert sets to sorted arrays
    const allUniqueIdsArray = Array.from(allUniqueIds).sort((a, b) => a - b);
    const setItemIdsArray = Array.from(setItemIds).sort((a, b) => a - b);
    
    console.log('\n📈 Summary:');
    console.log(`Set item rule found: ${setItemRuleFound}`);
    console.log(`Total unique IDs in other rules: ${allUniqueIdsArray.length}`);
    console.log(`Total set item IDs: ${setItemIdsArray.length}`);
    console.log(`Grand total unique IDs: ${allUniqueIdsArray.length + setItemIdsArray.length}`);
    
    // Check for overlaps
    const overlaps = allUniqueIdsArray.filter(id => setItemIds.has(id));
    console.log(`Overlapping IDs between unique and set: ${overlaps.length}`);
    if (overlaps.length > 0) {
        console.log(`Overlapping IDs: [${overlaps.join(', ')}]`);
    }
    
    // Find gaps in unique ID ranges
    const allIds = [...allUniqueIdsArray, ...setItemIdsArray].sort((a, b) => a - b);
    const gaps = [];
    for (let i = 0; i < Math.max(...allIds); i++) {
        if (!allIds.includes(i)) {
            gaps.push(i);
        }
    }
    
    console.log(`\n🔍 Analysis Results:`);
    console.log(`ID range: ${Math.min(...allIds)} - ${Math.max(...allIds)}`);
    console.log(`Missing IDs (gaps): ${gaps.length > 0 ? `[${gaps.join(', ')}]` : 'None'}`);
    
    // Save results for template generators
    const results = {
        uniqueIds: allUniqueIdsArray,
        setIds: setItemIdsArray,
        totalUniqueItems: allUniqueIdsArray.length,
        totalSetItems: setItemIdsArray.length,
        maxId: Math.max(...allIds),
        gaps: gaps
    };
    
    await fs.writeJson(path.join(__dirname, '..', 'Data', 'unique-set-analysis.json'), results, { spaces: 2 });
    console.log('\n💾 Analysis saved to Data/unique-set-analysis.json');
    
    return results;
}

if (require.main === module) {
    analyzeUniqueSetStructure()
        .then(results => {
            console.log('\n✅ Analysis complete');
        })
        .catch(error => {
            console.error('❌ Error:', error.message);
            process.exit(1);
        });
}

module.exports = { analyzeUniqueSetStructure };