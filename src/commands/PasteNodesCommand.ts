import type { Command, CommandContext, NodeContentDocument } from "../types";

export interface PasteNodeInput {
  type: string;
  label: string;
  tags: string[];
  content?: NodeContentDocument;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  color?: string;
}

/**
 * Creates copies of previously-copied nodes (Ctrl+C -> Ctrl+V). All pasted
 * nodes are created together as a single undoable step. Intentionally does
 * NOT copy childGraphId — a pasted node is a new, independent concept, not a
 * pointer into the original node's nested graph.
 */
export class PasteNodesCommand implements Command {
  readonly type = "paste-nodes";
  readonly label = "Paste Nodes";
  readonly shortcut = "Ctrl+V";

  private graphId: string;
  private inputs: PasteNodeInput[];
  private createdNodeIds: string[] = [];

  constructor(graphId: string, inputs: PasteNodeInput[]) {
    this.graphId = graphId;
    this.inputs = inputs;
  }

  /** IDs of the nodes created by the most recent execute(), in input order. */
  getCreatedNodeIds(): string[] {
    return [...this.createdNodeIds];
  }

  async execute(ctx: CommandContext): Promise<void> {
    this.createdNodeIds = [];

    for (const input of this.inputs) {
      const result = await ctx.nodeService.create(this.graphId, {
        type: input.type,
        label: input.label,
        tags: [...input.tags],
      });

      if (input.content) {
        await ctx.nodeService.update(result.node.id, { content: input.content });
      }

      ctx.nodeService.updateView(this.graphId, result.node.id, {
        position: input.position,
        width: input.width,
        height: input.height,
        color: input.color,
      });

      ctx.graphService.addNodeId(this.graphId, result.node.id, result.view);
      this.createdNodeIds.push(result.node.id);
    }
  }

  undo(ctx: CommandContext): void {
    for (const nodeId of this.createdNodeIds) {
      ctx.graphService.removeNodeId(this.graphId, nodeId);
      ctx.nodeService.delete(nodeId);
    }
    this.createdNodeIds = [];
  }
}