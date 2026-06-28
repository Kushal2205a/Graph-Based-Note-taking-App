import type { Command, CommandContext } from "../types";

export class CreateNodeCommand implements Command {
  readonly type = "create-node";
  readonly label = "Create Concept Node";
  readonly shortcut = "Ctrl+N";

  private graphId: string;
  private nodeId?: string;
  private label: string;
  private position?: { x: number; y: number };

  constructor(graphId: string, label: string, position?: { x: number; y: number }) {
    this.graphId = graphId;
    this.label = label;
    this.position = position;
  }

  async execute(ctx: CommandContext): Promise<void> {
    const result = await ctx.nodeService.create(this.graphId, {
      label: this.label,
    });

    this.nodeId = result.node.id;

    if (this.position) {
      ctx.nodeService.updateView(this.graphId, result.node.id, { position: this.position });
    }

    ctx.graphService.addNodeId(this.graphId, result.node.id, result.view);
  }

  undo(ctx: CommandContext): void {
    if (!this.nodeId) return;
    ctx.graphService.removeNodeId(this.graphId, this.nodeId);
    ctx.nodeService.delete(this.nodeId);
  }
}
