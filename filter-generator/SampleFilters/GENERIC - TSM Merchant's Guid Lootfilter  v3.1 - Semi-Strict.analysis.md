# TSM Merchant's Guild Lootfilter v3.1 - Semi-Strict Analysis

## Build Overview

**Build Archetype**: Generic multi-build filter designed for trading and merchant guild activities  
**Coverage**: 19 different builds supported  
**Target Audience**: Merchant's Guild members focused on profit and trading  
**Recommended Usage**: Starting Monolith content (no corruption)  
**Community**: Discord integration for updates and abbreviations

## Filter Strategy

### Core Philosophy
This filter implements a **multi-build trading-focused** approach that prioritizes items with market value and broad utility across multiple character builds. It emphasizes **economic value** over build-specific optimization.

### Key Design Patterns

#### 1. Multi-Build Accommodation
**Challenge**: Support 19 different builds in a single filter  
**Solution**: Focus on universally valuable affixes and item types  
**Trade-off**: Less specialized than single-build filters but broader utility

#### 2. Market-Value Prioritization
**Economic Focus**: Items shown based on trading potential  
**Tier Requirements**: T3+ thresholds (semi-strict level)  
**Volume**: Moderate item volume suitable for efficient farming

#### 3. Color-Coded Organization
**Visual System**: Different highlighting colors for different item categories  
**User Experience**: Easy to distinguish between item types at a glance

## Technical Implementation Analysis

### Rule Structure Patterns

#### Rule 1: Placeholder Rule
```xml
<Rule>
  <type>HIDE</type>
  <conditions></conditions>  <!-- Empty conditions -->
</Rule>
```
*Design Note: Likely serves as customization slot or disabled rule*

#### Rule 2: Basic Idol Filtering
Shows small idols (1x1, 2x1, 1x2) without affix requirements  
*Design Insight: Even small idols have trading value, show all*

#### Rule 3: Generic Boots/Belts/Bow Highlighting (Color 13)
**Complex Multi-Condition Logic**:
- **Condition 1**: Movement speed T3+ on boots/belts, OR bow-specific T3+ affixes
- **Condition 2**: Multiple valuable affixes with T3+ and 2+ affix requirement

**Key Affix Sets**:
- Movement affixes: 28, 36, 52, 672
- Diverse utility: 505, 36, 27, 677, 679, 504, 503, 502, 501, 28, 52, 75, 100, 330, 92, 672, 6, 720, 721

*Design Insight: Combines universal stats (movement speed) with build-specific stats*

#### Rule 4: Gloves/Amulet Highlighting (Color 6)
**Offensive Focus**:
- **Condition 1**: High-tier offensive affixes (2, 4, 16, 30) at T3+
- **Condition 2**: Critical stats (36, 6) at T3+

*Design Insight: Separates offensive jewelry from defensive gear*

### Advanced Filtering Logic

#### Multi-Condition AND Relationships
Each rule uses multiple conditions that ALL must be met:
1. **Item Type Condition**: Specifies which equipment types
2. **Primary Affix Condition**: Core stats with tier requirements
3. **Secondary Affix Condition**: Supporting stats or alternatives

#### Tier Thresholds (Semi-Strict Level)
- **T3+ Requirements**: Balance between accessibility and value
- **Combined Value Logic**: Multiple affixes must reach threshold totals
- **Advanced Mode**: Uses `advanced="true"` for complex comparisons

## Market-Focused Design Elements

### Universal Value Stats
**Always Valuable**:
- Movement Speed (universal quality of life)
- Health/Resistances (needed by all builds)
- Critical Strike stats (valuable for many builds)

**Build-Flexible**:
- Damage type variety (fire, cold, lightning, physical)
- Multiple scaling approaches (melee, spell, bow)
- Defense variety (armor, dodge, block support)

### Trading Optimization
**Volume Control**: Semi-strict prevents overwhelming item quantity  
**Quality Baseline**: T3+ ensures items are worth picking up  
**Category Separation**: Color coding helps quick value assessment

## Comparison with Specialized Filters

### Trade-offs Analysis

| Aspect | Specialized Build Filter | Trading Filter |
|--------|-------------------------|----------------|
| **Build Optimization** | Excellent | Good |
| **Market Coverage** | Poor | Excellent |
| **Rule Efficiency** | High | Moderate |
| **User Learning** | Build-specific | Market-focused |
| **Flexibility** | Limited | High |
| **Economic Value** | Variable | Consistent |

### When Trading Filters Excel
1. **Early League**: When all items have potential value
2. **Multiple Characters**: Supporting various builds simultaneously
3. **Economic Focus**: Players prioritizing wealth over character optimization
4. **Community Play**: Merchant guild coordination

## Strengths and Innovations

### Multi-Build Support Strategy
**Affix Diversity**: Large affix arrays covering multiple build types  
**Flexible Thresholds**: T3+ accessible to most content levels  
**Category Organization**: Visual separation helps quick decisions

### Community Integration
**Discord Support**: Updates and abbreviation explanations  
**Version Control**: Clear versioning (v3.1) for tracking changes  
**Merchant Guild Focus**: Designed for specific community needs

### Customization Slots
**4 Customization Slots**: Mentioned in description  
**User Adaptation**: Allows personal preference integration  
**Future Updates**: Structure supports ongoing refinement

## Limitations and Challenges

### Multi-Build Compromises
**Lack of Specialization**: Cannot optimize for any single build perfectly  
**Rule Count Pressure**: 19 builds require many rules to cover adequately  
**Generic Approach**: May miss build-specific synergies

### Economic Dependencies
**Market Volatility**: Item values change with league progression  
**Player Knowledge Required**: Users must understand trading value  
**Competition Focused**: May not suit solo/SSF players

### Maintenance Overhead
**Complex Update Process**: Changes affect multiple build types  
**Community Coordination**: Requires ongoing discord management  
**Version Synchronization**: Multiple strictness levels to maintain

## Learning Insights for Generation System

### Alternative Design Approaches

#### 1. Economic Value Integration
- **Market Data**: Consider item trading values in generation
- **Universal Stats**: Prioritize stats valuable across builds
- **Tier Flexibility**: Lower tier requirements for broader coverage

#### 2. Multi-Build Strategies
- **Affix Aggregation**: Combine affix lists from multiple builds
- **Common Denominators**: Focus on overlapping requirements
- **Category Separation**: Visual distinction for different item purposes

#### 3. Community-Focused Features
- **Version Control**: Built-in versioning and update mechanisms
- **Customization Layers**: User-modifiable sections
- **Documentation Integration**: Explanatory systems for complex filters

### Meta Build Format Implications

**Multi-Build Support**:
```json
{
  "buildType": "multi-build-trading",
  "supportedBuilds": ["necromancer", "paladin", "marksman", ...],
  "economicFocus": true,
  "strictness": "semi_strict",
  "marketPriorities": ["movement_speed", "health", "resistances"]
}
```

**Trading Configuration**:
```json
{
  "tradingMode": {
    "enabled": true,
    "tierThreshold": 3,
    "universalStats": ["movement_speed", "health", "resistances"],
    "marketCategories": {
      "boots_belts": {"color": 13, "priority": "movement"},
      "offensive_jewelry": {"color": 6, "priority": "damage"}
    }
  }
}
```

This filter demonstrates that effective filtering can serve economic objectives rather than just build optimization, opening up entirely different design paradigms for the generation system.