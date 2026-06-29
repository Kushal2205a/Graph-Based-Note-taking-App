import type { Command, CommandContext } from "../types";

export class ResizeNodeCommand implements Command {
  readonly type = "resize-node";
  readonly label = "Resize Node";

  private graphId: string;
  private nodeId: string;
  private oldSize: { width?: number; height?: number };
  private newSize: { width: number; height: number };

  constructor(
    graphId: string,
    nodeId: string,
    oldSize: { width?: number; height?: number },
    newSize: { width: number; height: number },
  ) {
    this.graphId = graphId;
    this.nodeId = nodeId;
    this.oldSize = { ...oldSize };
    this.newSize = { ...newSize };
  }

  execute(ctx: CommandContext): void {
    ctx.graphService.updateNodeView(this.graphId, this.nodeId, this.newSize);
    ctx.nodeService.updateView(this.graphId, this.nodeId, this.newSize);
  }

  undo(ctx: CommandContext): void {
    ctx.graphService.updateNodeView(this.graphId, this.nodeId, this.oldSize);
    ctx.nodeService.updateView(this.graphId, this.nodeId, this.oldSize);
  }
}
