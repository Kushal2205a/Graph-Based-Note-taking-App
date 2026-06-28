import type { Command, CommandContext } from "../types";

const MAX_HISTORY = 100;

export class CommandHistoryService {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private ctx: CommandContext;

  constructor(ctx: CommandContext) {
    this.ctx = ctx;
  }

  execute(command: Command): void {
    command.execute(this.ctx);
    this.undoStack.push(command);
    if (this.undoStack.length > MAX_HISTORY) {
      this.undoStack.shift();
    }
    this.redoStack = [];
  }

  undo(): Command | undefined {
    const command = this.undoStack.pop();
    if (!command) return undefined;
    command.undo(this.ctx);
    this.redoStack.push(command);
    return command;
  }

  redo(): Command | undefined {
    const command = this.redoStack.pop();
    if (!command) return undefined;
    command.execute(this.ctx);
    this.undoStack.push(command);
    return command;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  getUndoStack(): Command[] {
    return [...this.undoStack];
  }

  getRedoStack(): Command[] {
    return [...this.redoStack];
  }
}
