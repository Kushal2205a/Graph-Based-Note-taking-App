import type { Command, CommandContext, Edge } from "../types";

export class UpdateEdgeCommand implements Command {
  readonly type = "update-edge";
  readonly label = "Update Edge";

  private edgeId: string;
  private oldData: Partial<Edge>;
  private newData: Partial<Edge>;

  constructor(edgeId: string, oldData: Partial<Edge>, newData: Partial<Edge>) {
    this.edgeId = edgeId;
    this.oldData = { ...oldData };
    this.newData = { ...newData };
  }

  execute(ctx: CommandContext): void {
    ctx.edgeService.update(this.edgeId, this.newData);
  }

  undo(ctx: CommandContext): void {
    ctx.edgeService.update(this.edgeId, this.oldData);
  }
}
