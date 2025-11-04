# Quick Migration Checklist ✅

## Für jede App (Verwaltung & Gutachten):

### 1. Environment Files
- [ ] `apps/{app}/src/environments/environment.ts` → `version: '0.0.0-dev'`
- [ ] `apps/{app}/src/environments/environment.prod.ts` → `version: '1.0.0'` (aktuelle Version)

### 2. App Component aktualisieren
- [ ] `import { environment } from '../environments/environment'`
- [ ] `get appVersion(): string { return environment.version; }`
- [ ] Alten `APP_VERSION` Import entfernen

### 3. Project.json - FileReplacements hinzufügen
```json
"production": {
  "fileReplacements": [
    {
      "replace": "apps/{app}/src/environments/environment.ts", 
      "with": "apps/{app}/src/environments/environment.prod.ts"
    }
  ]
}
```

## Einmalige Workspace Changes:

### 4. Version Bump Script
- [ ] `scripts/version-bump.js` erstellen
- [ ] `chmod +x scripts/version-bump.js`

### 5. Package.json Scripts
```json
"version:verwaltung:patch": "node scripts/version-bump.js nxgut.Verwaltung patch",
"version:gutachten:patch": "node scripts/version-bump.js nxgut.Gutachten patch"
```

### 6. Aufräumen
- [ ] `rm -rf apps/*/version.json apps/*/src/app/version.ts apps/*/scripts/`
- [ ] `npm uninstall @changesets/cli`
- [ ] `rm -rf .changeset/`
- [ ] Custom `version` Felder aus `project.json` entfernen

## Test:
```bash
npm run version:verwaltung:patch  # Bumpt Version
npm run build:verwaltung          # Baut mit neuer Version
```

**Fertig!** 🎉