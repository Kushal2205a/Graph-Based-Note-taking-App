import type React from "react";
import type { NodeProps, EdgeProps } from "@xyflow/react";
import type { Plugin, PluginContext, Command, Node, Edge, Graph } from "../types";
import type { WorkspaceManifest } from "../types/workspace";
import type { EventBus } from "./EventBus";
import type { NodeService } from "./NodeService";
import type { EdgeService } from "./EdgeService";
import type { GraphService } from "./GraphService";
import type { NavigationService } from "./NavigationService";

export class PluginRegistry {
  private plugins = new Map<string, Plugin>();
  private nodeTypes = new Map<string, React.ComponentType<NodeProps>>();
  private edgeTypes = new Map<string, React.ComponentType<EdgeProps>>();
  private commands = new Map<string, Command>();

  private ctx: PluginContext;

  constructor(
    eventBus: EventBus,
    nodeService: NodeService,
    edgeService: EdgeService,
    graphService: GraphService,
    navigationService: NavigationService,
  ) {
    this.ctx = {
      eventBus,
      nodeService,
      edgeService,
      graphService,
      navigationService,
      registerNodeType: (type, component) => {
        this.nodeTypes.set(type, component);
      },
      registerEdgeType: (type, component) => {
        this.edgeTypes.set(type, component);
      },
      registerCommand: (command) => {
        this.commands.set(command.type, command);
      },
    };

    eventBus.on("node:created", (event) => {
      if ("onNodeCreated" in event) return;
      for (const plugin of this.plugins.values()) {
        if (plugin.onNodeCreated) {
          plugin.onNodeCreated(event.payload.node);
        }
      }
    });

    eventBus.on("node:deleted", (event) => {
      for (const plugin of this.plugins.values()) {
        if (plugin.onNodeDeleted) {
          plugin.onNodeDeleted(event.payload.nodeId);
        }
      }
    });

    eventBus.on("node:updated", (event) => {
      for (const plugin of this.plugins.values()) {
        if (plugin.onNodeUpdated) {
          plugin.onNodeUpdated(event.payload.nodeId, event.payload.changes);
        }
      }
    });

    eventBus.on("edge:created", (event) => {
      for (const plugin of this.plugins.values()) {
        if (plugin.onEdgeCreated) {
          plugin.onEdgeCreated(event.payload.edge);
        }
      }
    });

    eventBus.on("edge:deleted", (event) => {
      for (const plugin of this.plugins.values()) {
        if (plugin.onEdgeDeleted) {
          plugin.onEdgeDeleted(event.payload.edgeId);
        }
      }
    });

    eventBus.on("edge:updated", (event) => {
      for (const plugin of this.plugins.values()) {
        if (plugin.onEdgeUpdated) {
          plugin.onEdgeUpdated(event.payload.edgeId, event.payload.changes);
        }
      }
    });

    eventBus.on("graph:created", (event) => {
      for (const plugin of this.plugins.values()) {
        if (plugin.onGraphChanged) {
          plugin.onGraphChanged(event.payload.graph.id, event.payload.graph);
        }
      }
    });

    eventBus.on("workspace:opened", (event) => {
      for (const plugin of this.plugins.values()) {
        if (plugin.onWorkspaceOpened) {
          plugin.onWorkspaceOpened(event.payload.manifest);
        }
      }
    });
  }

  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin "${plugin.id}" is already registered. Skipping.`);
      return;
    }
    this.plugins.set(plugin.id, plugin);
    plugin.activate(this.ctx);
  }

  unregister(id: string): void {
    const plugin = this.plugins.get(id);
    if (plugin?.deactivate) {
      plugin.deactivate();
    }
    this.plugins.delete(id);
  }

  getNodeType(type: string): React.ComponentType<NodeProps> | undefined {
    return this.nodeTypes.get(type);
  }

  getEdgeType(type: string): React.ComponentType<EdgeProps> | undefined {
    return this.edgeTypes.get(type);
  }

  getAllNodeTypes(): [string, React.ComponentType<NodeProps>][] {
    return Array.from(this.nodeTypes.entries());
  }

  getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  getCommand(type: string): Command | undefined {
    return this.commands.get(type);
  }

  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }
}
