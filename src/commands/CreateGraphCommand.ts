import type { Command, CommandContext } from "../types";

export class CreateGraphCommand implements Command {
  readonly type = "create-graph";
  readonly label = "Create Graph";

  private name: string;
  private parentNodeId?: string;
  private graphId?: string;

  constructor(name: string, parentNodeId?: string) {
    this.name = name;
    this.parentNodeId = parentNodeId;
  }

  async execute(ctx: CommandContext): Promise<void> {
    const graph = await ctx.graphService.create(this.name, this.parentNodeId);
    this.graphId = graph.id;

    if (this.parentNodeId) {
      await ctx.nodeService.update(this.parentNodeId, { childGraphId: graph.id });
    }
  }

  undo(ctx: CommandContext): void {
    if (!this.graphId) return;
    ctx.graphService.delete(this.graphId);

    if (this.parentNodeId) {
      ctx.nodeService.update(this.parentNodeId, { childGraphId: undefined });
    }
  }
}
