import type { Command, CommandContext, Node } from "../types";

export class UpdateNodeCommand implements Command {
  readonly type = "update-node";
  readonly label = "Update Node";

  private nodeId: string;
  private oldData: Partial<Node>;
  private newData: Partial<Node>;

  constructor(nodeId: string, oldData: Partial<Node>, newData: Partial<Node>) {
    this.nodeId = nodeId;
    this.oldData = { ...oldData };
    this.newData = { ...newData };
  }

  async execute(ctx: CommandContext): Promise<void> {
    await ctx.nodeService.update(this.nodeId, this.newData);
  }

  async undo(ctx: CommandContext): Promise<void> {
    await ctx.nodeService.update(this.nodeId, this.oldData);
  }
}
