import type { Command, CommandContext } from "../types";

export class DeleteGraphCommand implements Command {
  readonly type = "delete-graph";
  readonly label = "Delete Graph";

  private graphId: string;
  private storedGraph: string | null = null;

  constructor(graphId: string) {
    this.graphId = graphId;
  }

  async execute(ctx: CommandContext): Promise<void> {
    const graph = ctx.graphService.getGraph(this.graphId);
    if (graph) {
      this.storedGraph = JSON.stringify(graph);
    }
    ctx.graphService.delete(this.graphId);
  }

  undo(ctx: CommandContext): void {
    if (this.storedGraph) {
      const graph = JSON.parse(this.storedGraph);
      ctx.graphService.setGraph(graph);
    }
  }
}
