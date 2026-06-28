import type { WorkspaceManifest, RecentWorkspace } from "../types";
import { WORKSPACE_SCHEMA_VERSION } from "../types";
import { generateId } from "../utils/idGenerator";
import { readJSON, writeJSON, exists, ensureDir } from "../utils/fileSystem";
import { join } from "@tauri-apps/api/path";
import type { EventBus } from "./EventBus";

const RECENTS_KEY = "kg-recent-workspaces";

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
}
