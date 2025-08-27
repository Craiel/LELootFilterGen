# Last Epoch XML Filter Structure

This document defines the exact XML structure that Last Epoch loot filters must use. **DO NOT deviate from this structure.**

## Root Element Structure

```xml
<ItemFilter xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
  <name>Filter Name</name>
  <filterIcon>0</filterIcon>
  <filterIconColor>0</filterIconColor>
  <description>Optional description</description>
  <lastModifiedInVersion>1.3.0.4</lastModifiedInVersion>
  <lootFilterVersion>0</lootFilterVersion>
  <rules>
    <!-- Rules go here -->
  </rules>
</ItemFilter>
```

## Rule Structure

```xml
<Rule>
  <type>SHOW|HIDE</type>
  <conditions>
    <!-- Conditions go here -->
  </conditions>
  <color>0</color>                    <!-- Color ID: 0-17 (see TemplateFilters/Colors.xml) -->
  <isEnabled>true|false</isEnabled>
  <levelDependent_deprecated>false</levelDependent_deprecated>
  <minLvl_deprecated>0</minLvl_deprecated>
  <maxLvl_deprecated>0</maxLvl_deprecated>
  <emphasized>true|false</emphasized>
  <nameOverride>Rule Display Name</nameOverride>
  <SoundId>0</SoundId>                <!-- Sound ID: 0-10 (see TemplateFilters/Sounds.xml) -->
  <BeamId>0</BeamId>                  <!-- Beam ID: 0-9 (see TemplateFilters/MapIcon_LootBeam.xml) -->
  <Order>0</Order>
</Rule>
```

### Alternative Rule Tags (Found in sample filters)

Some sample filters use these tags instead of the deprecated versions:
```xml
<levelDependent>false</levelDependent>
<minLvl>0</minLvl>
<maxLvl>0</maxLvl>
```

## Condition Types

### AffixCondition
```xml
<Condition i:type="AffixCondition">
  <affixes>
    <int>AFFIX_ID</int>
    <int>ANOTHER_AFFIX_ID</int>
  </affixes>
  <combinedComparsion>ANY|ALL</combinedComparsion>
  <combinedComparsionValue>1</combinedComparsionValue>
  <advanced>false</advanced>
</Condition>
```

### RarityCondition
```xml
<Condition i:type="RarityCondition">
  <rarity>NORMAL MAGIC RARE UNIQUE SET EXALTED</rarity>
  <minLegendaryPotential i:nil="true" />
  <maxLegendaryPotential i:nil="true" />
  <minWeaversWill i:nil="true" />
  <maxWeaversWill i:nil="true" />
</Condition>
```

### UniqueModifiersCondition
```xml
<Condition i:type="UniqueModifiersCondition">
  <Uniques>
    <UniqueId>0</UniqueId>
    <Rolls>
      <UniqueModifierWithRollId>
        <RollId>0</RollId>
        <Modifier>
          <LessIsBetter>false</LessIsBetter>
          <MinRoll i:nil="true" />
          <MaxRoll i:nil="true" />
        </Modifier>
      </UniqueModifierWithRollId>
    </Rolls>
  </Uniques>
</Condition>
```

## Important Notes

- **Root element must be `<ItemFilter>`** not `<ArrayOfFilterRule>`
- **Maximum 75 rules per filter** - this is enforced by the game
- **Namespace declaration required**: `xmlns:i="http://www.w3.org/2001/XMLSchema-instance"`
- **Boolean values**: Use `true` and `false` (lowercase)
- **Null values**: Use `i:nil="true"` attribute
- **Rule type**: Must be exactly `SHOW` or `HIDE`
- **Color values**: Numeric color codes (0-17, see `TemplateFilters/Colors.xml`)
- **Sound values**: Numeric sound IDs (0-10, see `TemplateFilters/Sounds.xml`) 
- **Beam values**: Numeric beam IDs (0-9, see `TemplateFilters/MapIcon_LootBeam.xml`)
- **Order values**: Numeric ordering for rule priority

## Template Requirements

When creating template files:
1. Use the exact structure shown above
2. Include all required metadata fields
3. Respect the 75-rule limit
4. Use proper condition types with correct attributes
5. Include meaningful rule names in `<nameOverride>`

## Validation

All generated XML files must:
- Parse as valid XML
- Match this exact structure
- Contain ≤75 rules
- Use only documented condition types
- Include all required attributes