import type { WorkspaceManifest, RecentWorkspace, RelationshipDefinition } from "../types";
import { WORKSPACE_SCHEMA_VERSION } from "../types";
import { generateId } from "../utils/idGenerator";
import { readJSON, writeJSON, exists, ensureDir } from "../utils/fileSystem";
import { join } from "@tauri-apps/api/path";
import type { EventBus } from "./EventBus";

const RECENTS_KEY = "kg-recent-workspaces";

// Cycled through (by insertion order) so each new custom relationship gets
// a visually distinct color, same as the built-in relationships do.
const CUSTOM_RELATIONSHIP_COLORS = [
  "#eab308", "#f43f5e", "#0ea5e9", "#10b981",
  "#d946ef", "#fb923c", "#4ade80", "#facc15",
];

export class WorkspaceService {
  private manifest: WorkspaceManifest | null = null;
  private workspacePath: string | null = null;
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  getManifest(): WorkspaceManifest | null {
    return this.manifest;
  }

  getPath(): string | null {
    return this.workspacePath;
  }

  async create(path: string, name: string): Promise<WorkspaceManifest> {
    const manifest: WorkspaceManifest = {
      schemaVersion: WORKSPACE_SCHEMA_VERSION,
      id: generateId(),
      name,
      rootGraphId: generateId(),
      graphIds: [],
      customRelationships: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const graphsDir = await join(path, "graphs");
    const nodesDir = await join(path, "nodes");
    const edgesDir = await join(path, "edges");

    await ensureDir(path);
    await ensureDir(graphsDir);
    await ensureDir(nodesDir);
    await ensureDir(edgesDir);

    await writeJSON(await join(path, "manifest.json"), manifest);

    this.manifest = manifest;
    this.workspacePath = path;
    this.addRecent(path);
    return manifest;
  }

  async open(path: string): Promise<WorkspaceManifest> {
    const manifestPath = await join(path, "manifest.json");
    const exists_ = await exists(manifestPath);
    if (!exists_) {
      throw new Error(`No workspace found at ${path}`);
    }

    const manifest = await readJSON<WorkspaceManifest>(manifestPath);
    // Backfill for manifests written before customRelationships existed.
    if (!manifest.customRelationships) {
      manifest.customRelationships = [];
    }
    this.manifest = manifest;
    this.workspacePath = path;
    this.addRecent(path);

    this.eventBus.emit({
      type: "workspace:opened",
      payload: { manifest, path },
    });

    return manifest;
  }

  async save(): Promise<void> {
    if (!this.manifest || !this.workspacePath) return;
    this.manifest.updatedAt = new Date().toISOString();
    await writeJSON(await join(this.workspacePath, "manifest.json"), this.manifest);
    this.eventBus.emit({
      type: "workspace:saved",
      payload: { path: this.workspacePath },
    });
  }

  async graphPath(graphId: string): Promise<string> {
    if (!this.workspacePath) throw new Error("No workspace open");
    return await join(this.workspacePath, "graphs", `${graphId}.json`);
  }

  async nodePath(nodeId: string): Promise<string> {
    if (!this.workspacePath) throw new Error("No workspace open");
    return await join(this.workspacePath, "nodes", `${nodeId}.json`);
  }

  async edgePath(edgeId: string): Promise<string> {
    if (!this.workspacePath) throw new Error("No workspace open");
    return await join(this.workspacePath, "edges", `${edgeId}.json`);
  }

  getRecents(): RecentWorkspace[] {
    try {
      const raw = localStorage.getItem(RECENTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private addRecent(path: string): void {
    if (!this.manifest) return;
    const recents = this.getRecents();
    const filtered = recents.filter((r) => r.path !== path);
    filtered.unshift({
      path,
      name: this.manifest.name,
      lastOpened: new Date().toISOString(),
    });
    localStorage.setItem(RECENTS_KEY, JSON.stringify(filtered.slice(0, 10)));
  }

  removeRecent(path: string): RecentWorkspace[] {
    const recents = this.getRecents();
    const filtered = recents.filter((r) => r.path !== path);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(filtered));
    return filtered;
  }

  async addGraphId(graphId: string): Promise<void> {
    if (!this.manifest) return;
    if (!this.manifest.graphIds.includes(graphId)) {
      this.manifest.graphIds.push(graphId);
      await this.save();
    }
  }

  async removeGraphId(graphId: string): Promise<void> {
    if (!this.manifest) return;
    this.manifest.graphIds = this.manifest.graphIds.filter((id) => id !== graphId);
    await this.save();
  }

  /** All custom relationship types saved for this project, in creation order. */
  getCustomRelationships(): RelationshipDefinition[] {
    return this.manifest?.customRelationships ?? [];
  }

  /**
   * Saves a custom relationship label to the project so it shows up as a
   * reusable option everywhere (not just on the edge that created it).
   * Dedupes case-insensitively by displayName — retyping "trains" reuses
   * the existing entry rather than creating a duplicate.
   */
  async addCustomRelationship(displayName: string): Promise<RelationshipDefinition> {
    if (!this.manifest) throw new Error("No workspace open");

    const trimmed = displayName.trim();
    if (!trimmed) throw new Error("Custom relationship label cannot be empty");

    const existing = this.manifest.customRelationships.find(
      (r) => r.displayName.toLowerCase() === trimmed.toLowerCase(),
    );
    if (existing) return existing;

    const color = CUSTOM_RELATIONSHIP_COLORS[
      this.manifest.customRelationships.length % CUSTOM_RELATIONSHIP_COLORS.length
    ];
    const definition: RelationshipDefinition = {
      id: "custom",
      displayName: trimmed,
      inverse: null,
      color,
    };

    this.manifest.customRelationships.push(definition);
    await this.save();
    return definition;
  }

  /**
   * Updates the color of a project's custom relationship, matched
   * case-insensitively by displayName (same matching rule used everywhere
   * else custom relationships are looked up). No-op if the workspace isn't
   * open or the label isn't found.
   */
  async updateCustomRelationshipColor(displayName: string, color: string): Promise<void> {
    if (!this.manifest) return;
    const rel = this.manifest.customRelationships.find(
      (r) => r.displayName.toLowerCase() === displayName.toLowerCase(),
    );
    if (!rel) return;
    rel.color = color;
    await this.save();
  }
}