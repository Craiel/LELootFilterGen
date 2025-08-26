# Cleanup Scraper and Wed data parsing

## Scraper changes

- The scraper still saves files in `Data` it should save it in `WebData`, no script should save anything in `Data` except the database generation, the Data folder is off-limits, make sure to take note of that in the applicable md files
- Scraping should be one single command the sub-menu for scraping should just be two options, either scrape normally or force (removing the cache), no need for other options like custom url or anything

## Clean up file names
- we have `curl-scraper.js`, `skills-scraper.js`, `web-scraper.js`, `html-parser.js`, `js-data-parser.js`
- do we need them all? what does each do?
- Ideally i would like the scraper file and command to be organized to server a single purpose, to download a set of files from the site that contain the data we need
- the parser should be a separate action that is always executed with the Database rebuild, no need to run this separately

## what do we scrape

- Item data (https://www.lastepochtools.com/db/items/unique), currently parsed into `db_js_data.json` but would like to rename that to `item_data.json`
- Skill data (https://www.lastepochtools.com/skills/), currently parsed into `skills_js_data.json` but would like to be renamed to `skills_data.json`