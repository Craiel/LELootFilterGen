const fs = require('fs-extra');
const path = require('path');
const xml2js = require('xml2js');

/**
 * XSD Schema Generator for Last Epoch loot filter XML files
 * Analyzes existing XML filters to extract schema patterns and generate XSD
 */
class SchemaGenerator {
    constructor() {
        this.parser = new xml2js.Parser({
            explicitArray: false,
            ignoreAttrs: false,
            attrkey: '@',
            charkey: '#text',
            normalizeTags: false,
            explicitRoot: true
        });
        
        this.schema = {
            elements: new Map(),
            attributes: new Map(),
            types: new Map(),
            patterns: new Set()
        };
    }

    /**
     * Generate XSD schema from existing XML filters
     */
    async generateSchema(sourcePattern, outputPath) {
        console.log('🔍 Analyzing XML filters for schema generation...');
        
        try {
            // Find all XML files matching the pattern
            const xmlFiles = await this.findXMLFiles(sourcePattern);
            console.log(`📁 Found ${xmlFiles.length} XML filter files`);
            
            if (xmlFiles.length === 0) {
                throw new Error('No XML files found matching the pattern');
            }

            // Analyze each XML file
            for (const xmlFile of xmlFiles) {
                await this.analyzeXMLFile(xmlFile);
            }

            // Generate XSD schema
            const xsdContent = this.generateXSDContent();
            
            // Ensure output directory exists
            await fs.ensureDir(path.dirname(outputPath));
            
            // Write XSD file
            await fs.writeFile(outputPath, xsdContent, 'utf8');
            
            console.log(`✅ XSD schema generated: ${outputPath}`);
            this.printSchemaStatistics();
            
            return outputPath;
            
        } catch (error) {
            console.error('❌ Schema generation failed:', error.message);
            throw error;
        }
    }

    /**
     * Find XML files matching the given pattern
     */
    async findXMLFiles(sourcePattern) {
        const { glob } = require('glob');
        
        try {
            const files = await glob(sourcePattern, { 
                cwd: process.cwd(),
                absolute: true 
            });
            
            // Filter for XML files only
            return files.filter(file => file.toLowerCase().endsWith('.xml'));
            
        } catch (error) {
            // Fallback: try direct directory search if glob fails
            const dirPath = sourcePattern.includes('*') ? 
                path.dirname(sourcePattern) : sourcePattern;
                
            if (await fs.pathExists(dirPath)) {
                const files = await fs.readdir(dirPath);
                return files
                    .filter(file => file.toLowerCase().endsWith('.xml'))
                    .map(file => path.join(dirPath, file));
            }
            
            throw error;
        }
    }

    /**
     * Analyze a single XML file to extract schema information
     */
    async analyzeXMLFile(xmlFilePath) {
        try {
            const xmlContent = await fs.readFile(xmlFilePath, 'utf8');
            const parsed = await this.parser.parseStringPromise(xmlContent);
            
            console.log(`📄 Analyzing: ${path.basename(xmlFilePath)}`);
            
            // Analyze the parsed XML structure
            this.analyzeElement('ItemFilter', parsed.ItemFilter || parsed);
            
        } catch (error) {
            console.warn(`⚠️  Failed to analyze ${xmlFilePath}: ${error.message}`);
        }
    }

    /**
     * Recursively analyze XML elements to build schema
     */
    analyzeElement(elementName, element, parentPath = '') {
        const currentPath = parentPath ? `${parentPath}/${elementName}` : elementName;
        
        if (!this.schema.elements.has(elementName)) {
            this.schema.elements.set(elementName, {
                name: elementName,
                type: this.determineElementType(element),
                children: new Set(),
                attributes: new Set(),
                textContent: false,
                optional: false,
                multiple: false
            });
        }
        
        const elementInfo = this.schema.elements.get(elementName);
        
        if (typeof element === 'object' && element !== null) {
            // Check for attributes
            if (element['@']) {
                Object.keys(element['@']).forEach(attr => {
                    elementInfo.attributes.add(attr);
                    this.recordAttribute(elementName, attr, element['@'][attr]);
                });
            }
            
            // Check for text content
            if (element['#text']) {
                elementInfo.textContent = true;
                this.recordTextPattern(elementName, element['#text']);
            }
            
            // Process child elements
            Object.keys(element).forEach(key => {
                if (key !== '@' && key !== '#text') {
                    elementInfo.children.add(key);
                    
                    const childElement = element[key];
                    
                    // Handle arrays (multiple occurrences)
                    if (Array.isArray(childElement)) {
                        this.markAsMultiple(key);
                        childElement.forEach(child => 
                            this.analyzeElement(key, child, currentPath)
                        );
                    } else {
                        this.analyzeElement(key, childElement, currentPath);
                    }
                }
            });
        } else if (element !== null && element !== undefined) {
            // Simple text content
            elementInfo.textContent = true;
            this.recordTextPattern(elementName, element);
        }
    }

    /**
     * Determine the data type of an element
     */
    determineElementType(element) {
        if (typeof element === 'boolean') return 'boolean';
        if (typeof element === 'number') return 'integer';
        if (typeof element === 'string') {
            if (/^\d+$/.test(element)) return 'integer';
            if (/^(true|false)$/i.test(element)) return 'boolean';
            if (/^\d+\.\d+$/.test(element)) return 'decimal';
            return 'string';
        }
        return 'complexType';
    }

    /**
     * Record attribute information
     */
    recordAttribute(elementName, attributeName, value) {
        const key = `${elementName}@${attributeName}`;
        
        if (!this.schema.attributes.has(key)) {
            this.schema.attributes.set(key, {
                element: elementName,
                name: attributeName,
                type: this.determineElementType(value),
                values: new Set()
            });
        }
        
        this.schema.attributes.get(key).values.add(value);
    }

    /**
     * Record text content patterns
     */
    recordTextPattern(elementName, textContent) {
        const pattern = this.classifyTextPattern(textContent);
        this.schema.patterns.add(`${elementName}:${pattern}`);
    }

    /**
     * Classify text content into patterns
     */
    classifyTextPattern(text) {
        if (/^\d+$/.test(text)) return 'integer';
        if (/^(true|false)$/i.test(text)) return 'boolean';
        if (/^\d+\.\d+$/.test(text)) return 'decimal';
        if (text.length === 0) return 'empty';
        return 'string';
    }

    /**
     * Mark an element as potentially occurring multiple times
     */
    markAsMultiple(elementName) {
        if (this.schema.elements.has(elementName)) {
            this.schema.elements.get(elementName).multiple = true;
        }
    }

    /**
     * Generate the actual XSD content
     */
    generateXSDContent() {
        const xsd = [];
        
        // XSD header
        xsd.push('<?xml version="1.0" encoding="UTF-8"?>');
        xsd.push('<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"');
        xsd.push('           xmlns:i="http://www.w3.org/2001/XMLSchema-instance"');
        xsd.push('           elementFormDefault="qualified">');
        xsd.push('');
        xsd.push('  <!-- Generated XSD for Last Epoch Loot Filter XML Files -->');
        xsd.push(`  <!-- Generated on: ${new Date().toISOString()} -->`);
        xsd.push('');

        // Root element
        xsd.push('  <xs:element name="ItemFilter" type="ItemFilterType"/>');
        xsd.push('');

        // Generate complex types
        const processedTypes = new Set();
        
        for (const [elementName, elementInfo] of this.schema.elements) {
            if (!processedTypes.has(elementName)) {
                xsd.push(...this.generateComplexType(elementName, elementInfo));
                xsd.push('');
                processedTypes.add(elementName);
            }
        }

        // XSD footer
        xsd.push('</xs:schema>');
        
        return xsd.join('\n');
    }

    /**
     * Generate XSD complex type definition
     */
    generateComplexType(elementName, elementInfo) {
        const lines = [];
        const typeName = `${elementName}Type`;
        
        lines.push(`  <xs:complexType name="${typeName}">`);
        
        if (elementInfo.children.size > 0) {
            lines.push('    <xs:sequence>');
            
            for (const childName of elementInfo.children) {
                const childInfo = this.schema.elements.get(childName);
                const minOccurs = childInfo && childInfo.optional ? '0' : '1';
                const maxOccurs = childInfo && childInfo.multiple ? 'unbounded' : '1';
                
                if (childInfo && childInfo.type === 'complexType') {
                    lines.push(`      <xs:element name="${childName}" type="${childName}Type" minOccurs="${minOccurs}" maxOccurs="${maxOccurs}"/>`);
                } else {
                    const type = this.mapToXSDType(childInfo ? childInfo.type : 'string');
                    lines.push(`      <xs:element name="${childName}" type="${type}" minOccurs="${minOccurs}" maxOccurs="${maxOccurs}"/>`);
                }
            }
            
            lines.push('    </xs:sequence>');
        } else if (elementInfo.textContent) {
            lines.push('    <xs:simpleContent>');
            const baseType = this.mapToXSDType(elementInfo.type);
            lines.push(`      <xs:extension base="${baseType}">`);
            
            // Add attributes if any
            for (const attrName of elementInfo.attributes) {
                lines.push(`        <xs:attribute name="${attrName}" type="xs:string"/>`);
            }
            
            lines.push('      </xs:extension>');
            lines.push('    </xs:simpleContent>');
        }
        
        // Add attributes for complex types without text content
        if (!elementInfo.textContent && elementInfo.attributes.size > 0) {
            for (const attrName of elementInfo.attributes) {
                lines.push(`    <xs:attribute name="${attrName}" type="xs:string"/>`);
            }
        }
        
        lines.push('  </xs:complexType>');
        
        return lines;
    }

    /**
     * Map internal types to XSD types
     */
    mapToXSDType(internalType) {
        const typeMap = {
            'string': 'xs:string',
            'integer': 'xs:int',
            'boolean': 'xs:boolean',
            'decimal': 'xs:decimal',
            'complexType': 'xs:string' // fallback
        };
        
        return typeMap[internalType] || 'xs:string';
    }

    /**
     * Print schema generation statistics
     */
    printSchemaStatistics() {
        console.log('');
        console.log('📊 Schema Generation Statistics:');
        console.log(`   Elements discovered: ${this.schema.elements.size}`);
        console.log(`   Attributes discovered: ${this.schema.attributes.size}`);
        console.log(`   Text patterns: ${this.schema.patterns.size}`);
        
        console.log('');
        console.log('🏗️  Element Structure:');
        for (const [elementName, elementInfo] of this.schema.elements) {
            const childCount = elementInfo.children.size;
            const attrCount = elementInfo.attributes.size;
            const flags = [];
            
            if (elementInfo.multiple) flags.push('multiple');
            if (elementInfo.textContent) flags.push('text');
            if (elementInfo.optional) flags.push('optional');
            
            const flagStr = flags.length > 0 ? ` (${flags.join(', ')})` : '';
            console.log(`   ${elementName}: ${childCount} children, ${attrCount} attributes${flagStr}`);
        }
    }
}

module.exports = SchemaGenerator;