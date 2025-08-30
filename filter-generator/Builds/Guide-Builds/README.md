# Guide-Based Builds

This folder contains builds extracted from comprehensive build guides, providing an alternative approach to the simple JSON build format.

## Build Sources

### 1. **Web Guide Analysis** (`.html` files)
- **Source**: Comprehensive build guides from sites like maxroll.gg  
- **Content**: Detailed build descriptions, stat priorities, gear recommendations
- **Advantages**: Rich contextual information, gameplay mechanics, rotation details
- **Challenges**: Requires text parsing and inference of priorities

### 2. **Build Planner Profiles** (`.profile.json` files)
- **Source**: Exported build planner data with complete configurations
- **Content**: Exact item specifications, affix IDs, tier requirements, multiple variants
- **Advantages**: Game-accurate data, precise targeting, multi-variant support
- **Quality**: **GOLD STANDARD** for filter generation accuracy

## Analysis Quality Comparison

| Source Type | Precision | Rule Count | Variants | Data Quality |
|-------------|-----------|------------|----------|--------------|
| Simple JSON Build | Medium | ~18 | 1 | Good |
| Clean Web Guide | High | ~22 | 1 | Very Good |
| **Planner Profile** | **Perfect** | **~28** | **5** | **Excellent** |

## Build Planner Profile Advantages

### **🎯 Exact Game Data**
- **Affix IDs**: Direct database mapping (64 = minion damage, 643 = minion attack speed)
- **Unique IDs**: Precise item targeting (314 = Naal's Tooth, 370 = Mantle of the Pale Ox)  
- **Tier Requirements**: Exact T7/T6/T5 specifications per progression stage
- **Legendary Potential**: Exact LP usage and affix combinations

### **📊 Multi-Variant Intelligence**
- **Starting Gear**: Early progression with basic functionality
- **Endgame Gear**: Core uniques established with standard LP
- **Aspirational Gear**: Perfect rolls and optimal crafting
- **Specialized Variants**: Boss DPS, Hardcore, etc. with different focuses

### **🔬 Progressive Scaling**
- **Level Brackets**: Different requirements per character level range
- **Affix Tiers**: Precise tier requirements based on actual build needs
- **Item Transitions**: Clear progression path from leveling to endgame

## Key Discoveries from Profile Analysis

### **Critical Affix Database IDs**
- `64` = Minion Damage (weapon priority)
- `643` = Minion Attack Speed (paired with minion damage)
- `2` = Health (defensive core)
- `348` = Armor (body armor primary)
- `629` = Level of Summon Bear (helmet T7)
- `501` = Minion Critical Strike Chance (universal)

### **Idol Patterns**
- **Small Idols**: Consistent 862+837 affix pattern (T1)
- **Large Idols**: 148+925+226+899 pattern (mixed T1/T7)
- **Sizes**: Specific idol size requirements per build

### **Unique Item Specifications**
- **Exact Unique IDs**: Direct database targeting
- **LP Requirements**: Minimum legendary potential per item
- **Affix Combinations**: Optimal legendary affix choices
- **Dual Items**: Special handling (Red Ring x2)

## Implementation Notes

### **Current Approach**
1. Manual extraction and analysis of guide/profile data
2. Create comprehensive intermediate JSON files
3. Apply all established build analysis rules and patterns
4. Document discoveries in learning files

### **Future Improvements**
- **Automated Profile Parsing**: Direct JSON parsing of planner exports
- **Guide Text Processing**: NLP/LLM-based guide analysis
- **API Integration**: Direct build planner API access (if available)
- **Batch Processing**: Multiple guide analysis workflows

## File Naming Conventions

- **Web Guides**: `[build-name]-guide.html`
- **Planner Profiles**: `[build-name]-guide.profile.json` 
- **Analysis Output**: `generated/analysis/[build-name]-[source-type].intermediate.json`

## Usage in Filter Generation

These comprehensive build analyses provide:
- **Superior targeting precision** with exact affix/unique IDs
- **Multi-variant support** for different playstyles  
- **Progressive scaling** based on actual build requirements
- **Game-accurate data** eliminating guesswork

The planner profile approach represents the **highest quality** build analysis possible, providing filter generation accuracy that matches actual in-game build requirements.