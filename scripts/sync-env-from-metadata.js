#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const projectName = process.argv[2];

if (!projectName) {
  console.error('Usage: node scripts/sync-env-from-metadata.js <projectName>');
  process.exit(1);
}

const projectPath = `apps/${projectName}`;
const projectJsonPath = path.join(projectPath, 'project.json');
const envProdPath = path.join(projectPath, 'src/environments/environment.prod.ts');

// Read version from project.json metadata
const projectJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf-8'));
const version = projectJson.metadata?.version;

if (!version) {
  console.error(`No version found in ${projectJsonPath} metadata`);
  process.exit(1);
}

// Update environment.prod.ts
const envContent = fs.readFileSync(envProdPath, 'utf-8');
const newEnvContent = envContent.replace(
  /version:\s*['"`]\d+\.\d+\.\d+['"`]/,
  `version: '${version}'`
);

fs.writeFileSync(envProdPath, newEnvContent);
console.log(`✅ Synced ${projectName} environment.prod.ts with version ${version}`);