// This script copies the version from project.json to dist/apps/nxgut.Gutachten/version.json after build
const fs = require('fs');
const path = require('path');

const projectJsonPath = path.resolve(__dirname, '../project.json');
const distPath = path.resolve(__dirname, '../../../dist/apps/nxgut.Gutachten');
const versionFilePath = path.join(distPath, 'version.json');

const projectJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf-8'));
const version = projectJson.version || 'unknown';

if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true });
}

fs.writeFileSync(versionFilePath, JSON.stringify({ version }, null, 2));
console.log(`Version ${version} written to ${versionFilePath}`);
