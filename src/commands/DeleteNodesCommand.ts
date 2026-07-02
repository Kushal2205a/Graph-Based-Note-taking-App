import type { Command, CommandContext, Edge } from "../types";

interface DeletedNodeRecord {
  nodeId: string;
  nodeJson: string | null;
  viewJson: string | null;
}

interface DeletedEdgeRecord {
  edgeId: string;
  graphId: string;
  edgeJson: string;
}

/**
 * Deletes a set of nodes (and every edge touching any of them) as a single
 * undoable step. This is the multi-select counterpart to DeleteNodeCommand —
 * used when the user deletes several selected nodes at once, so Ctrl+Z
 * restores the whole selection in one go rather than one node at a time.
 */
export class DeleteNodesCommand implements Command {
  readonly type = "delete-nodes";
  readonly label = "Delete Nodes";
  readonly shortcut = "Delete";

  private graphId: string;
  private nodeIds: string[];
  private deletedNodes: DeletedNodeRecord[] = [];
  private deletedEdges: DeletedEdgeRecord[] = [];

  constructor(graphId: string, nodeIds: string[]) {
    this.graphId = graphId;
    this.nodeIds = [...nodeIds];
  }

  async execute(ctx: CommandContext): Promise<void> {
    this.deletedNodes = [];
    this.deletedEdges = [];

    const idSet = new Set(this.nodeIds);
    const graph = ctx.graphService.getGraph(this.graphId);

    // Remove every edge touching any of the selected nodes exactly once,
    // snapshotting each before it's deleted so undo can restore it.
    if (graph) {
      for (const edgeId of [...graph.edgeIds]) {
        const edge = ctx.edgeService.getEdge(edgeId);
        if (!edge) continue;
        if (idSet.has(edge.sourceId) || idSet.has(edge.targetId)) {
          this.deletedEdges.push({
            edgeId,
            graphId: this.graphId,
            edgeJson: JSON.stringify(edge),
          });
          ctx.graphService.removeEdgeId(this.graphId, edgeId);
          ctx.edgeService.delete(edgeId);
        }
      }
    }

    // Snapshot + remove each node.
    for (const nodeId of this.nodeIds) {
      const node = ctx.nodeService.getNode(nodeId);
      const view = ctx.nodeService.getView(nodeId, this.graphId);
      this.deletedNodes.push({
        nodeId,
        nodeJson: node ? JSON.stringify(node) : null,
        viewJson: view ? JSON.stringify(view) : null,
      });
      ctx.graphService.removeNodeId(this.graphId, nodeId);
      ctx.nodeService.delete(nodeId);
    }
  }

  undo(ctx: CommandContext): void {
    // Restore nodes first so restored edges have valid endpoints.
    for (const record of this.deletedNodes) {
      if (!record.nodeJson) continue;
      const node = JSON.parse(record.nodeJson);
      ctx.nodeService.setNode(node);

      if (record.viewJson) {
        const view = JSON.parse(record.viewJson);
        ctx.nodeService.setView(this.graphId, view);
        ctx.graphService.addNodeId(this.graphId, node.id, view);
      }
    }

    for (const record of this.deletedEdges) {
      const edge = JSON.parse(record.edgeJson) as Edge;
      ctx.edgeService.setEdge(edge);
      const view = ctx.edgeService.getView(edge.id, record.graphId);
      if (view) {
        ctx.graphService.addEdgeId(record.graphId, edge.id, view);
      }
    }
  }
}