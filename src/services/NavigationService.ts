import type { Breadcrumb } from "../types";
import type { GraphService } from "./GraphService";
import type { NodeService } from "./NodeService";
import type { EventBus } from "./EventBus";

export interface NavigationEntry {
  graphId: string;
  nodeId?: string;
  nodeLabel?: string;
}

export class NavigationService {
  private stack: NavigationEntry[] = [];
  private forwardStack: NavigationEntry[] = [];
  private graphService: GraphService;
  private nodeService: NodeService;
  private eventBus: EventBus;

  constructor(graphService: GraphService, nodeService: NodeService, eventBus: EventBus) {
    this.graphService = graphService;
    this.nodeService = nodeService;
    this.eventBus = eventBus;
  }

  getCurrentGraphId(): string | undefined {
    if (this.stack.length === 0) return undefined;
    return this.stack[this.stack.length - 1].graphId;
  }

  getBreadcrumbs(): Breadcrumb[] {
    return this.stack.map((entry) => {
      const graph = this.graphService.getGraph(entry.graphId);
      return {
        graphId: entry.graphId,
        graphName: graph?.name ?? "Unknown",
        nodeId: entry.nodeId,
        nodeLabel: entry.nodeLabel,
      };
    });
  }

  canGoBack(): boolean {
    return this.stack.length > 1;
  }

  canGoForward(): boolean {
    return this.forwardStack.length > 0;
  }

  navigateToGraph(graphId: string, fromNodeId?: string): void {
    const fromGraphId = this.getCurrentGraphId();

    let nodeLabel: string | undefined;
    if (fromNodeId) {
      const node = this.nodeService.getNode(fromNodeId);
      nodeLabel = node?.label;
    }

    this.stack.push({ graphId, nodeId: fromNodeId, nodeLabel });
    this.forwardStack = [];

    this.eventBus.emit({
      type: "graph:navigated",
      payload: { fromGraphId, toGraphId: graphId },
    });
  }

  goBack(): string | undefined {
    if (!this.canGoBack()) return undefined;

    const current = this.stack.pop();
    if (current) {
      this.forwardStack.push(current);
    }

    const prevGraphId = this.getCurrentGraphId();

    this.eventBus.emit({
      type: "graph:navigated",
      payload: { fromGraphId: prevGraphId, toGraphId: prevGraphId! },
    });

    return prevGraphId;
  }

  goForward(): string | undefined {
    if (!this.canGoForward()) return undefined;

    const next = this.forwardStack.pop();
    if (next) {
      this.stack.push(next);
    }

    const graphId = this.getCurrentGraphId();

    this.eventBus.emit({
      type: "graph:navigated",
      payload: { fromGraphId: undefined, toGraphId: graphId! },
    });

    return graphId;
  }

  navigateToBreadcrumb(index: number): string | undefined {
    if (index < 0 || index >= this.stack.length) return undefined;

    while (this.stack.length > index + 1) {
      const popped = this.stack.pop();
      if (popped) {
        this.forwardStack.push(popped);
      }
    }

    const graphId = this.getCurrentGraphId();

    this.eventBus.emit({
      type: "graph:navigated",
      payload: { fromGraphId: undefined, toGraphId: graphId! },
    });

    return graphId;
  }

  push(entry: NavigationEntry): void {
    this.stack.push(entry);
    this.forwardStack = [];
  }

  reset(graphId: string): void {
    this.stack = [{ graphId }];
    this.forwardStack = [];
  }
}
