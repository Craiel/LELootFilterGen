# Shared Resources

This directory contains resources shared between the database generator and filter generator sub-projects.

## Documentation

### Game Knowledge
- `docs/GAME_SYSTEMS.md` - Comprehensive guide to Last Epoch mechanics, defensive strategies, and class build requirements
- `docs/CONSTRAINTS.md` - Technical constraints and limitations that both projects must respect

## Usage

Both sub-projects reference these shared resources:

**Database Generator:**
- Uses game knowledge to understand data relationships
- Applies constraints during data validation
- References defensive strategies for data categorization

**Filter Generator:**  
- Uses game knowledge to make intelligent filtering decisions
- Applies constraints (75-rule limit) during filter generation
- References build strategies to prioritize rules

## Maintenance

These files should be updated when:
- Game mechanics change significantly
- New classes or masteries are added
- Technical constraints change (rule limits, etc.)
- New defensive strategies are discovered

Changes here affect both sub-projects, so coordinate updates carefully.