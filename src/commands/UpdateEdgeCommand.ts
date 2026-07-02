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

  async execute(ctx: CommandContext): Promise<void> {
    // Same persistence as CreateEdgeCommand: if this edit sets a custom
    // relationship label, save it to the project so it's reusable
    // elsewhere. Dedupes by label, so retyping an existing one is a no-op.
    const rel = this.newData.relationship;
    if (rel?.id === "custom" && rel.customLabel?.trim()) {
      await ctx.workspaceService.addCustomRelationship(rel.customLabel);
    }

    ctx.edgeService.update(this.edgeId, this.newData);
  }

  undo(ctx: CommandContext): void {
    ctx.edgeService.update(this.edgeId, this.oldData);
  }
}