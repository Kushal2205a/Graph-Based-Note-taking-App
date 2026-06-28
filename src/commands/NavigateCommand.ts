import type { Command, CommandContext } from "../types";

export class NavigateCommand implements Command {
  readonly type = "navigate";
  readonly label = "Navigate to Graph";

  private graphId: string;
  private nodeId?: string;

  constructor(graphId: string, nodeId?: string) {
    this.graphId = graphId;
    this.nodeId = nodeId;
  }

  execute(ctx: CommandContext): void {
    ctx.navigationService.navigateToGraph(this.graphId, this.nodeId);
  }

  undo(_ctx: CommandContext): void {
    // Navigation undo not supported directly
  }
}
