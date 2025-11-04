# Nx Monorepo: Per-App Versioning Migration Guide

## Überblick
Diese Anleitung beschreibt die Migration von einer komplexen Versioning-Lösung zu einer sauberen, Angular-nativen Environment-basierten Versioning-Architektur.

## Problem der alten Lösung
- Redundante `version.json` Dateien
- Duplizierte `version.ts` Zwischenschichten
- Komplexe Script-Struktur mit `write-version.js` und `sync-version.js`
- Abhängigkeit von `@changesets/cli`
- Nx Schema Warnungen durch custom Felder in `project.json`
- Runtime vs. Build-Zeit Verwirrung

## Neue Architektur

### 1. Environment-basierte Versionsverwaltung
Nutzt Angular's Standard Environment System:
- `environment.ts` (Development): Version = `'0.0.0-dev'`
- `environment.prod.ts` (Production): Version = aktuelle Version

### 2. Automatisierte Version Bumps
Ein zentrales Script `scripts/version-bump.js` für alle Apps:
- Liest aktuelle Version aus `environment.prod.ts`
- Berechnet neue Version (patch/minor/major)
- Aktualisiert `environment.prod.ts`
- Erstellt Git Commit und Tag

### 3. Build-Zeit Version Injection
Angular's `fileReplacements` ersetzt automatisch `environment.ts` mit `environment.prod.ts` bei Production Builds.

## Migration Schritte

### Schritt 1: Environment Files erstellen

**Für jede App** (`apps/{app-name}/src/environments/`):

```typescript
// environment.ts (Development)
export const environment = {
  production: false,
  version: '0.0.0-dev'
};
```

```typescript
// environment.prod.ts (Production)
export const environment = {
  production: true,
  version: '1.0.0'  // Aktuelle Version der App
};
```

### Schritt 2: App Komponenten aktualisieren

**Alte Lösung entfernen:**
```typescript
// ❌ Alt
import { APP_VERSION } from './version';
protected appVersion = APP_VERSION;
```

**Neue Lösung:**
```typescript
// ✅ Neu
import { environment } from '../environments/environment';

get appVersion(): string {
  return environment.version;
}
```

### Schritt 3: Project.json konfigurieren

**FileReplacements für Production Builds hinzufügen:**
```json
{
  "targets": {
    "build": {
      "configurations": {
        "production": {
          "fileReplacements": [
            {
              "replace": "apps/{app-name}/src/environments/environment.ts",
              "with": "apps/{app-name}/src/environments/environment.prod.ts"
            }
          ]
        }
      }
    }
  }
}
```

### Schritt 4: Zentrales Version Bump Script

**`scripts/version-bump.js` erstellen:**
```javascript
#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectName = process.argv[2];
const specifier = process.argv[3] || 'patch';

const envProdPath = path.join(`apps/${projectName}`, 'src/environments/environment.prod.ts');

// Read current version
const envContent = fs.readFileSync(envProdPath, 'utf-8');
const versionMatch = envContent.match(/version:\s*['"`](\d+\.\d+\.\d+)['"`]/);
const currentVersion = versionMatch[1];
const [major, minor, patch] = currentVersion.split('.').map(Number);

// Calculate new version
let newVersion;
switch (specifier) {
  case 'major': newVersion = `${major + 1}.0.0`; break;
  case 'minor': newVersion = `${major}.${minor + 1}.0`; break;
  case 'patch':
  default: newVersion = `${major}.${minor}.${patch + 1}`; break;
}

// Update environment.prod.ts
const newEnvContent = envContent.replace(
  /version:\s*['"`]\d+\.\d+\.\d+['"`]/,
  `version: '${newVersion}'`
);
fs.writeFileSync(envProdPath, newEnvContent);

// Create git commit and tag
const tagName = `${projectName}-v${newVersion}`;
execSync(`git add ${envProdPath}`, { stdio: 'inherit' });
execSync(`git commit -m "chore(${projectName}): bump version to ${newVersion}"`, { stdio: 'inherit' });
execSync(`git tag ${tagName}`, { stdio: 'inherit' });

console.log(`✅ ${projectName} updated to ${newVersion} with tag ${tagName}`);
```

### Schritt 5: Package.json Scripts

**Neue Scripts hinzufügen:**
```json
{
  "scripts": {
    "version:{app}:patch": "node scripts/version-bump.js {app-name} patch",
    "version:{app}:minor": "node scripts/version-bump.js {app-name} minor", 
    "version:{app}:major": "node scripts/version-bump.js {app-name} major",
    "build:{app}": "npx nx build {app-name} --configuration=production"
  }
}
```

### Schritt 6: Aufräumen - Alte Dateien entfernen

**Zu entfernende Dateien:**
```bash
# Pro App
rm apps/{app-name}/version.json
rm apps/{app-name}/src/app/version.ts
rm -rf apps/{app-name}/scripts/

# Workspace-weit  
rm -rf .changeset/
npm uninstall @changesets/cli
```

**Zu entfernende Konfiguration:**
- Custom `version` Felder aus `project.json`
- `release` Sektionen aus `project.json`
- Alte Scripts aus `package.json`

## Neuer Workflow

### Version Release Prozess:

```bash
# 1. Version bumpen (erstellt automatisch Git Tag)
npm run version:verwaltung:patch   # 1.0.0 -> 1.0.1
npm run version:gutachten:minor    # 1.1.0 -> 1.2.0

# 2. App builden (Version wird automatisch eingebettet)
npm run build:verwaltung
npm run build:gutachten

# 3. Git Tags pushen
git push --tags
```

### Tag Format:
- `{projektname}-v{version}`
- Beispiel: `nxgut.Verwaltung-v1.0.1`

## Vorteile der neuen Lösung

### ✅ Technische Verbesserungen:
- **Angular-nativ**: Nutzt Standard Environment System
- **Build-Zeit Injection**: Korrekte Version zur Build-Zeit
- **Zero Redundancy**: Ein Script für alle Apps
- **Schema konform**: Keine Nx Warnungen mehr
- **Git integriert**: Automatische Commits und Tags

### ✅ Workflow Verbesserungen:
- **Einfache Commands**: Klare npm Scripts
- **Unabhängige Versioning**: Jede App separat versionierbar
- **Automatisiert**: Kein manueller Git Tag Prozess
- **Sichtbar**: Version im UI Footer und Build Output

### ✅ Maintenance Verbesserungen:
- **DRY Prinzip**: Kein duplizierter Code
- **Weniger Abhängigkeiten**: Kein Changesets mehr nötig
- **Klare Struktur**: Verständlicher für neue Entwickler
- **Standard Patterns**: Folgt Angular Best Practices

## Rollback Plan

Falls Probleme auftreten, können die alten Dateien aus Git wiederhergestellt werden:
```bash
git checkout HEAD~1 -- apps/{app}/version.json
git checkout HEAD~1 -- apps/{app}/scripts/
```

## Testing Checklist

- [ ] Development Build: Version zeigt `0.0.0-dev`
- [ ] Production Build: Version zeigt korrekte Nummer
- [ ] Version Bump: Aktualisiert `environment.prod.ts`  
- [ ] Git Integration: Erstellt Commit und Tag
- [ ] UI Display: Footer zeigt korrekte Version
- [ ] Multi-App: Jede App kann unabhängig versioniert werden

## Support

Bei Problemen:
1. Überprüfen Sie die `environment.prod.ts` Syntax
2. Stellen Sie sicher, dass `fileReplacements` korrekt konfiguriert ist
3. Testen Sie mit Development Build zuerst
4. Verwenden Sie `git log --oneline` um Tags zu überprüfen