import type { Command, CommandContext } from "../types";

export class DeleteEdgeCommand implements Command {
  readonly type = "delete-edge";
  readonly label = "Delete Edge";

  private graphId: string;
  private edgeId: string;
  private storedEdge: string | null = null;
  private storedView: string | null = null;

  constructor(graphId: string, edgeId: string) {
    this.graphId = graphId;
    this.edgeId = edgeId;
  }

  async execute(ctx: CommandContext): Promise<void> {
    const edge = ctx.edgeService.getEdge(this.edgeId);
    if (edge) {
      this.storedEdge = JSON.stringify(edge);
    }
    const view = ctx.edgeService.getView(this.edgeId, this.graphId);
    if (view) {
      this.storedView = JSON.stringify(view);
    }

    ctx.graphService.removeEdgeId(this.graphId, this.edgeId);
    ctx.edgeService.delete(this.edgeId);
  }

  undo(ctx: CommandContext): void {
    if (this.storedEdge) {
      const edge = JSON.parse(this.storedEdge);
      ctx.edgeService.setEdge(edge);

      if (this.storedView) {
        const view = JSON.parse(this.storedView);
        ctx.edgeService.setView(this.graphId, view);
        ctx.graphService.addEdgeId(this.graphId, edge.id, view);
      }
    }
  }
}
