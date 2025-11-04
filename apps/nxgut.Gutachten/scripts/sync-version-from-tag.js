const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get latest tag (assumes tags are in the form vX.Y.Z)
const tag = execSync('git describe --tags --abbrev=0').toString().trim().replace(/^v/, '');
const versionFile = path.resolve(__dirname, '../version.json');
const versionData = { version: tag };

fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));
console.log(`version.json updated to ${tag}`);