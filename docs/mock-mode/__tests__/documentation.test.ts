/**
 * Documentation Tests
 * 
 * These tests verify that the documentation files exist and contain the expected content.
 */

import fs from 'fs';
import path from 'path';

describe('Mock Mode Documentation', () => {
    const docsDir = path.join(process.cwd(), 'docs', 'mock-mode');

    test('README.md exists', () => {
        const filePath = path.join(docsDir, 'README.md');
        expect(fs.existsSync(filePath)).toBe(true);

        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('DevPulse Mock Mode Documentation');
        expect(content).toContain('Table of Contents');
        expect(content).toContain('Setup Guide');
        expect(content).toContain('Mock Users Guide');
        expect(content).toContain('Mock Data Structure Guide');
        expect(content).toContain('Developer Guide');
    });

    test('setup-guide.md exists', () => {
        const filePath = path.join(docsDir, 'setup-guide.md');
        expect(fs.existsSync(filePath)).toBe(true);

        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('Mock Mode Setup Guide');
        expect(content).toContain('Environment Configuration');
        expect(content).toContain('Getting Started');
        expect(content).toContain('Verifying Mock Mode');
        expect(content).toContain('Managing Mock Data');
        expect(content).toContain('Troubleshooting');
    });

    test('mock-users.md exists', () => {
        const filePath = path.join(docsDir, 'mock-users.md');
        expect(fs.existsSync(filePath)).toBe(true);

        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('Mock Users Guide');
        expect(content).toContain('Available Mock Users');
        expect(content).toContain('User Characteristics');
        expect(content).toContain('User Profiles in Detail');
        expect(content).toContain('Using Mock Users');
        expect(content).toContain('Extending Mock Users');
    });

    test('mock-data-structure.md exists', () => {
        const filePath = path.join(docsDir, 'mock-data-structure.md');
        expect(fs.existsSync(filePath)).toBe(true);

        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('Mock Data Structure Guide');
        expect(content).toContain('Data Structure');
        expect(content).toContain('Data Patterns');
        expect(content).toContain('Data Generation Options');
        expect(content).toContain('Data Storage');
        expect(content).toContain('Managing Mock Data');
        expect(content).toContain('Customizing Mock Data');
    });

    test('developer-guide.md exists', () => {
        const filePath = path.join(docsDir, 'developer-guide.md');
        expect(fs.existsSync(filePath)).toBe(true);

        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('Developer Guide for Mock Functionality');
        expect(content).toContain('Architecture');
        expect(content).toContain('Key Files and Directories');
        expect(content).toContain('Extending the Mock System');
        expect(content).toContain('Testing Mock Functionality');
        expect(content).toContain('Best Practices');
        expect(content).toContain('Troubleshooting Common Issues');
    });

    test('documentation references are consistent', () => {
        const files = [
            'README.md',
            'setup-guide.md',
            'mock-users.md',
            'mock-data-structure.md',
            'developer-guide.md'
        ];

        // Check that each file references the other files correctly
        for (const file of files) {
            const filePath = path.join(docsDir, file);
            const content = fs.readFileSync(filePath, 'utf8');

            for (const otherFile of files) {
                if (file !== otherFile) {
                    const fileName = otherFile.replace('.md', '');
                    const linkPattern = new RegExp(`\\[.*\\]\\(\\.\\/.*${fileName}.*\\)`, 'i');
                    expect(content).toMatch(linkPattern);
                }
            }
        }
    });
});