import type { Command, CommandContext, RelationshipTypeId } from "../types";

export class CreateEdgeCommand implements Command {
  readonly type = "create-edge";
  readonly label = "Create Edge";

  private graphId: string;
  private sourceId: string;
  private targetId: string;
  private sourceHandle?: string;
  private targetHandle?: string;
  private relationshipId: RelationshipTypeId;
  private customLabel?: string;
  private edgeId?: string;

  constructor(
    graphId: string,
    sourceId: string,
    targetId: string,
    relationshipId: RelationshipTypeId,
    customLabel?: string,
    sourceHandle?: string,
    targetHandle?: string,
  ) {
    this.graphId = graphId;
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.relationshipId = relationshipId;
    this.customLabel = customLabel;
    this.sourceHandle = sourceHandle;
    this.targetHandle = targetHandle;
  }

  async execute(ctx: CommandContext): Promise<void> {
    // Persist a new custom relationship label to the project so it's
    // reusable on any future edge, in any graph. No-ops (dedupes) if a
    // custom relationship with this label already exists.
    if (this.relationshipId === "custom" && this.customLabel?.trim()) {
      await ctx.workspaceService.addCustomRelationship(this.customLabel);
    }

    const result = await ctx.edgeService.create(this.graphId, {
      sourceId: this.sourceId,
      targetId: this.targetId,
      sourceHandle: this.sourceHandle,
      targetHandle: this.targetHandle,
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