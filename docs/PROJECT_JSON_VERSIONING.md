# Nx Monorepo: Project.json Metadata Versioning

## ✅ **Implementierte Lösung: project.json metadata**

Diese Lösung nutzt Nx-native `metadata` Felder als **Single Source of Truth** für Versionen und synchronisiert sie zur Build-Zeit mit Angular Environments.

## Architektur

### **1. Version Storage: project.json metadata**
```json
// apps/{app-name}/project.json
{
  "name": "nxgut.Verwaltung",
  "metadata": {
    "version": "2.0.3"
  }
}
```

### **2. Build-Zeit Synchronisation**
- `scripts/sync-env-from-metadata.js` liest version aus project.json
- Aktualisiert `environment.prod.ts` vor jedem Build
- Angular's `fileReplacements` injiziert Version automatisch

### **3. Runtime Display**
```typescript
// App Component
import { environment } from '../environments/environment';

get appVersion(): string {
  return environment.version;
}
```

## Workflow

### **Version Release:**
```bash
# 1. Bump version in project.json + sync environment
npm run version:verwaltung:patch   # 2.0.3 -> 2.0.4

# 2. Build (sync + compile)
npm run build:verwaltung           # Auto-sync + build

# 3. Manual sync (optional)
npm run sync:verwaltung           # Sync without build
```

### **Automatisierte Schritte:**
1. **version-bump.js** aktualisiert `project.json` metadata
2. **version-bump.js** synchronisiert `environment.prod.ts`
3. **Git commit** und **tag** werden erstellt
4. **Build** synchronisiert erneut und kompiliert

## Implementierte Scripts

### **scripts/version-bump.js**
- Liest aktuelle Version aus `project.json` metadata
- Berechnet neue Version (patch/minor/major)
- Aktualisiert `project.json` und `environment.prod.ts`
- Erstellt Git Commit und Tag

### **scripts/sync-env-from-metadata.js**
- Synchronisiert `environment.prod.ts` mit `project.json` metadata
- Wird vor jedem Build automatisch ausgeführt
- Stellt sicher dass Build immer aktuelle Version hat

## Package.json Scripts

```json
{
  "scripts": {
    // Version Bumps (project.json -> environment -> git)
    "version:verwaltung:patch": "node scripts/version-bump.js nxgut.Verwaltung patch",
    "version:gutachten:minor": "node scripts/version-bump.js nxgut.Gutachten minor",
    
    // Builds (sync + compile)
    "build:verwaltung": "node scripts/sync-env-from-metadata.js nxgut.Verwaltung && nx build nxgut.Verwaltung --production",
    
    // Manual Sync
    "sync:verwaltung": "node scripts/sync-env-from-metadata.js nxgut.Verwaltung"
  }
}
```

## Vorteile dieser Lösung

### ✅ **Nx-native**
- Nutzt offizielles `metadata` Feld
- Schema-konform, keine Lint-Warnungen
- Zukunftssicher für Nx Release Integration

### ✅ **Single Source of Truth**
- Version wird nur in `project.json` verwaltet
- Environment wird automatisch synchronisiert
- Keine Duplikation oder Inkonsistenzen

### ✅ **Build-Zeit Garantie**
- Jeder Build synchronisiert automatisch
- Kein manueller Sync-Schritt nötig
- Version stimmt immer überein

### ✅ **Angular-kompatibel**
- Nutzt Standard Environment Pattern
- TypeScript typisiert zur Compile-Zeit
- Automatische `fileReplacements` Injection

## Git Tag Format
- `{projektname}-v{version}`
- Beispiel: `nxgut.Verwaltung-v2.0.3`

## File Structure
```
apps/
├── nxgut.Verwaltung/
│   ├── project.json                 # ← Single Source of Truth (metadata.version)
│   └── src/environments/
│       ├── environment.ts           # version: '0.0.0-dev'
│       └── environment.prod.ts      # version: '2.0.3' (auto-synced)
├── nxgut.Gutachten/
│   ├── project.json                 # ← Single Source of Truth (metadata.version)
│   └── src/environments/
│       ├── environment.ts           # version: '0.0.0-dev'  
│       └── environment.prod.ts      # version: '2.1.1' (auto-synced)
scripts/
├── version-bump.js                  # Bump version + sync + git
└── sync-env-from-metadata.js        # Sync environment from metadata
```

## Migration von Environment-only

Falls Sie von der reinen Environment-Lösung migrieren:
1. Fügen Sie `metadata.version` zu allen `project.json` hinzu
2. Aktualisieren Sie `scripts/version-bump.js`
3. Fügen Sie `scripts/sync-env-from-metadata.js` hinzu  
4. Aktualisieren Sie `package.json` Scripts um Sync-Step
5. Environments bleiben unverändert (werden automatisch synchronisiert)

## Troubleshooting

**Version nicht aktuell in UI:**
```bash
npm run sync:verwaltung  # Manual sync
npm run build:verwaltung # Rebuild
```

**Git Tag Konflikte:**
```bash
git tag -d {projektname}-v{version}  # Lokalen Tag löschen
git push origin :refs/tags/{projektname}-v{version}  # Remote Tag löschen
```

**Schema Errors:**
- Stellen Sie sicher dass `metadata` als direktes Feld in `project.json` steht
- Nx 22.x+ unterstützt metadata offiziell