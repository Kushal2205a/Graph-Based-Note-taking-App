const APP_SETTINGS_KEY = "kg-app-settings";

interface AppSettings {
  relationshipColorOverrides: Record<string, string>;
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(APP_SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return { relationshipColorOverrides: parsed?.relationshipColorOverrides ?? {} };
  } catch {
    return { relationshipColorOverrides: {} };
  }
}

function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable (e.g. private mode quota) — fail silently,
    // same tolerance WorkspaceService gives its recents list.
  }
}

/**
 * App-wide color overrides for built-in relationship types, keyed by
 * relationship id (e.g. "uses", "depends_on"). These apply across every
 * project — unlike custom relationship colors, which are saved per-project
 * on the workspace manifest (see WorkspaceService).
 */
export function getDefaultRelationshipColorOverrides(): Record<string, string> {
  return loadSettings().relationshipColorOverrides;
}

export function setDefaultRelationshipColor(id: string, color: string): void {
  const settings = loadSettings();
  settings.relationshipColorOverrides[id] = color;
  saveSettings(settings);
}

export function resetDefaultRelationshipColor(id: string): void {
  const settings = loadSettings();
  delete settings.relationshipColorOverrides[id];
  saveSettings(settings);
}

export function resetAllDefaultRelationshipColors(): void {
  saveSettings({ relationshipColorOverrides: {} });
}
