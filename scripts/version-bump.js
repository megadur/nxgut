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
const envProdPath = path.join(projectPath, 'src/environments/environment.prod.ts');

if (!fs.existsSync(envProdPath)) {
  console.error(`Project ${projectName} not found or no environment.prod.ts`);
  process.exit(1);
}

// Read current version from environment.prod.ts
const envContent = fs.readFileSync(envProdPath, 'utf-8');
const versionMatch = envContent.match(/version:\s*['"`](\d+\.\d+\.\d+)['"`]/);

if (!versionMatch) {
  console.error(`Could not find version in ${envProdPath}`);
  process.exit(1);
}

const currentVersion = versionMatch[1];
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

// Update environment.prod.ts
const newEnvContent = envContent.replace(
  /version:\s*['"`]\d+\.\d+\.\d+['"`]/,
  `version: '${newVersion}'`
);

fs.writeFileSync(envProdPath, newEnvContent);

// Create git tag
const tagName = `${projectName}-v${newVersion}`;
try {
  execSync(`git add ${envProdPath}`, { stdio: 'inherit' });
  execSync(`git commit -m "chore(${projectName}): bump version to ${newVersion}"`, { stdio: 'inherit' });
  execSync(`git tag ${tagName}`, { stdio: 'inherit' });
  console.log(`✅ Created tag: ${tagName}`);
  console.log(`📦 Version updated in: ${envProdPath}`);
} catch (error) {
  console.error('❌ Error creating git tag:', error.message);
  process.exit(1);
}