import type { Command, CommandContext, RelationshipTypeId } from "../types";

export class CreateEdgeCommand implements Command {
  readonly type = "create-edge";
  readonly label = "Create Edge";

  private graphId: string;
  private sourceId: string;
  private targetId: string;
  private relationshipId: RelationshipTypeId;
  private customLabel?: string;
  private edgeId?: string;

  constructor(
    graphId: string,
    sourceId: string,
    targetId: string,
    relationshipId: RelationshipTypeId,
    customLabel?: string,
  ) {
    this.graphId = graphId;
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.relationshipId = relationshipId;
    this.customLabel = customLabel;
  }

  async execute(ctx: CommandContext): Promise<void> {
    const result = await ctx.edgeService.create(this.graphId, {
      sourceId: this.sourceId,
      targetId: this.targetId,
      relationshipId: this.relationshipId,
      customLabel: this.customLabel,
    });

    this.edgeId = result.edge.id;
    ctx.graphService.addEdgeId(this.graphId, result.edge.id, result.view);
  }

  undo(ctx: CommandContext): void {
    if (!this.edgeId) return;
    ctx.graphService.removeEdgeId(this.graphId, this.edgeId);
    ctx.edgeService.delete(this.edgeId);
  }
}
