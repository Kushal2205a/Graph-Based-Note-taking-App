import type { Command, CommandContext, RelationshipTypeId } from "../types";
import { PasteNodesCommand, type PasteNodeInput } from "./PasteNodesCommand";
import { CreateEdgeCommand } from "./CreateEdgeCommand";

export interface PasteEdgeInput {
  /** Index into the `nodes` array passed to PasteWithEdgesCommand. */
  sourceIndex: number;
  /** Index into the `nodes` array passed to PasteWithEdgesCommand. */
  targetIndex: number;
  relationshipId: RelationshipTypeId;
  customLabel?: string;
  sourceHandle?: string;
  targetHandle?: string;
}

/**
 * Pastes a set of copied nodes AND recreates whichever edges originally ran
 * between them (edges to nodes outside the copied selection are dropped —
 * there's nothing sensible to reconnect them to).
 *
 * Composes the existing PasteNodesCommand + CreateEdgeCommand rather than
 * touching NodeService/EdgeService directly, so undo/redo stay in lockstep
 * with however those commands already work. The whole paste — nodes and
 * edges together — is ONE entry on the undo stack.
 */
export class PasteWithEdgesCommand implements Command {
  readonly type = "paste-nodes-with-edges";
  readonly label = "Paste";
  readonly shortcut = "Ctrl+V";

  private graphId: string;
  private nodeInputs: PasteNodeInput[];
  private edgeInputs: PasteEdgeInput[];

  private pasteNodesCmd: PasteNodesCommand | null = null;
  private edgeCommands: CreateEdgeCommand[] = [];

  constructor(graphId: string, nodeInputs: PasteNodeInput[], edgeInputs: PasteEdgeInput[]) {
    this.graphId = graphId;
    this.nodeInputs = nodeInputs;
    this.edgeInputs = edgeInputs;
  }

  /** IDs of the nodes created by the most recent execute(), in nodeInputs order. */
  getCreatedNodeIds(): string[] {
    return this.pasteNodesCmd?.getCreatedNodeIds() ?? [];
  }

  async execute(ctx: CommandContext): Promise<void> {
    this.pasteNodesCmd = new PasteNodesCommand(this.graphId, this.nodeInputs);
    await this.pasteNodesCmd.execute(ctx);
    const newNodeIds = this.pasteNodesCmd.getCreatedNodeIds();

    this.edgeCommands = [];
    for (const e of this.edgeInputs) {
      const sourceId = newNodeIds[e.sourceIndex];
      const targetId = newNodeIds[e.targetIndex];
      if (!sourceId || !targetId) continue;

      const cmd = new CreateEdgeCommand(
        this.graphId,
        sourceId,
        targetId,
        e.relationshipId,
        e.customLabel,
        e.sourceHandle,
        e.targetHandle,
      );
      await cmd.execute(ctx);
      this.edgeCommands.push(cmd);
    }
  }

  undo(ctx: CommandContext): void {
    // Undo edges first (they reference the pasted nodes), then the nodes.
    for (const cmd of [...this.edgeCommands].reverse()) {
      cmd.undo(ctx);
    }
    this.edgeCommands = [];
    this.pasteNodesCmd?.undo(ctx);
  }
}