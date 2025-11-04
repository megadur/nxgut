#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const projectName = process.argv[2];
const specifier = process.argv[3] || 'patch'; // patch, minor, major

if (!projectName) {
  console.error('Usage: node scripts/version-bump.js <projectName> [patch|minor|major]');
  process.exit(1);
}

const projectPath = `apps/${projectName}`;
const projectJsonPath = path.join(projectPath, 'project.json');
const envProdPath = path.join(projectPath, 'src/environments/environment.prod.ts');

if (!fs.existsSync(projectJsonPath)) {
  console.error(`Project ${projectName} not found - no project.json`);
  process.exit(1);
}

// Read current version from project.json metadata
const projectJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf-8'));
const currentVersion = projectJson.metadata?.version;

if (!currentVersion) {
  console.error(`No version found in ${projectJsonPath} metadata`);
  process.exit(1);
}

const [major, minor, patch] = currentVersion.split('.').map(Number);

// Calculate new version
let newVersion;
switch (specifier) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

console.log(`Bumping ${projectName} from ${currentVersion} to ${newVersion}`);

// Update project.json metadata
projectJson.metadata.version = newVersion;
fs.writeFileSync(projectJsonPath, JSON.stringify(projectJson, null, 2));

// Update environment.prod.ts if it exists
if (fs.existsSync(envProdPath)) {
  const envContent = fs.readFileSync(envProdPath, 'utf-8');
  const newEnvContent = envContent.replace(
    /version:\s*['"`]\d+\.\d+\.\d+['"`]/,
    `version: '${newVersion}'`
  );
  fs.writeFileSync(envProdPath, newEnvContent);
}

// Create git tag
const tagName = `${projectName}-v${newVersion}`;
try {
  execSync(`git add ${projectJsonPath} ${envProdPath}`, { stdio: 'inherit' });
  execSync(`git commit -m "chore(${projectName}): bump version to ${newVersion}"`, { stdio: 'inherit' });
  execSync(`git tag ${tagName}`, { stdio: 'inherit' });
  console.log(`✅ Created tag: ${tagName}`);
  console.log(`📦 Version updated in: ${projectJsonPath}`);
  if (fs.existsSync(envProdPath)) {
    console.log(`📦 Environment synced: ${envProdPath}`);
  }
} catch (error) {
  console.error('❌ Error creating git tag:', error.message);
  process.exit(1);
}