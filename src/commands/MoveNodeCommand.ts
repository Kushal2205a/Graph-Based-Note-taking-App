import type { Command, CommandContext } from "../types";

export class MoveNodeCommand implements Command {
  readonly type = "move-node";
  readonly label = "Move Node";

  private graphId: string;
  private nodeId: string;
  private oldPosition: { x: number; y: number };
  private newPosition: { x: number; y: number };

  constructor(
    graphId: string,
    nodeId: string,
    oldPosition: { x: number; y: number },
    newPosition: { x: number; y: number },
  ) {
    this.graphId = graphId;
    this.nodeId = nodeId;
    this.oldPosition = { ...oldPosition };
    this.newPosition = { ...newPosition };
  }

  execute(ctx: CommandContext): void {
    ctx.nodeService.updateView(this.graphId, this.nodeId, { position: this.newPosition });
  }

  undo(ctx: CommandContext): void {
    ctx.nodeService.updateView(this.graphId, this.nodeId, { position: this.oldPosition });
  }
}
