import type { Graph, NodeView, EdgeView } from "../types";
import { GRAPH_SCHEMA_VERSION } from "../types";
import { generateId } from "../utils/idGenerator";
import { readJSON, writeJSON, exists, remove } from "../utils/fileSystem";
import type { WorkspaceService } from "./WorkspaceService";
import type { EventBus } from "./EventBus";

export class GraphService {
  private graphs = new Map<string, Graph>();
  private workspaceService: WorkspaceService;
  private eventBus: EventBus;

  constructor(workspaceService: WorkspaceService, eventBus: EventBus) {
    this.workspaceService = workspaceService;
    this.eventBus = eventBus;
  }

  getGraph(id: string): Graph | undefined {
    return this.graphs.get(id);
  }

  getAllGraphs(): Graph[] {
    return Array.from(this.graphs.values());
  }

  async create(name: string, parentNodeId?: string): Promise<Graph> {
    const graphId = generateId();
    const graph: Graph = {
      schemaVersion: GRAPH_SCHEMA_VERSION,
      id: graphId,
      name,
      parentNodeId,
      nodeIds: [],
      edgeIds: [],
      views: {
        nodeViews: {},
        edgeViews: {},
      },
    };

    this.graphs.set(graphId, graph);
    await this.save(graph);
    await this.workspaceService.addGraphId(graphId);

    this.eventBus.emit({
      type: "graph:created",
      payload: { graph },
    });

    return graph;
  }

  async delete(id: string): Promise<void> {
    const graph = this.graphs.get(id);
    if (!graph) return;

    this.graphs.delete(id);

    const graphPath = await this.workspaceService.graphPath(id);
    if (await exists(graphPath)) {
      await remove(graphPath);
    }

    await this.workspaceService.removeGraphId(id);

    this.eventBus.emit({
      type: "graph:deleted",
      payload: { graphId: id },
    });
  }

  async save(graph: Graph): Promise<void> {
    const path = await this.workspaceService.graphPath(graph.id);
    await writeJSON(path, graph);
  }

  setGraph(graph: Graph): void {
    this.graphs.set(graph.id, graph);
  }

  addNodeId(graphId: string, nodeId: string, view: NodeView): void {
    const graph = this.graphs.get(graphId);
    if (!graph) throw new Error(`Graph ${graphId} not found`);
    if (!graph.nodeIds.includes(nodeId)) {
      graph.nodeIds.push(nodeId);
    }
    graph.views.nodeViews[nodeId] = view;
  }

  removeNodeId(graphId: string, nodeId: string): void {
    const graph = this.graphs.get(graphId);
    if (!graph) return;
    graph.nodeIds = graph.nodeIds.filter((id) => id !== nodeId);
    delete graph.views.nodeViews[nodeId];
  }

  addEdgeId(graphId: string, edgeId: string, view: EdgeView): void {
    const graph = this.graphs.get(graphId);
    if (!graph) throw new Error(`Graph ${graphId} not found`);
    if (!graph.edgeIds.includes(edgeId)) {
      graph.edgeIds.push(edgeId);
    }
    graph.views.edgeViews[edgeId] = view;
  }

  removeEdgeId(graphId: string, edgeId: string): void {
    const graph = this.graphs.get(graphId);
    if (!graph) return;
    graph.edgeIds = graph.edgeIds.filter((id) => id !== edgeId);
    delete graph.views.edgeViews[edgeId];
  }

  updateNodeView(graphId: string, nodeId: string, changes: Partial<NodeView>): void {
    const graph = this.graphs.get(graphId);
    if (!graph) return;
    const view = graph.views.nodeViews[nodeId];
    if (view) {
      Object.assign(view, changes);
    }
  }

  updateEdgeView(graphId: string, edgeId: string, changes: Partial<EdgeView>): void {
    const graph = this.graphs.get(graphId);
    if (!graph) return;
    const view = graph.views.edgeViews[edgeId];
    if (view) {
      Object.assign(view, changes);
    }
  }

  clear(): void {
    this.graphs.clear();
  }
}

export async function loadGraph(path: string, graphService: GraphService): Promise<Graph | null> {
  try {
    const graph = await readJSON<Graph>(path);
    graphService.setGraph(graph);
    return graph;
  } catch {
    return null;
  }
}
