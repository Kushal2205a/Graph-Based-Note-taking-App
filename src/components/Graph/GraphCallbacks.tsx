import { createContext, useContext } from "react";

import type { NodeContentDocument } from "../../types";

export interface GraphCallbacks {
  onRenameNode: (nodeId: string, newLabel: string) => void;
  onAddNodeContent: (nodeId: string) => void;
  onUpdateNodeContent: (nodeId: string, content: NodeContentDocument) => void;
  onResizeNode: (nodeId: string, width: number, height: number) => void;
  onDeleteNode: (nodeId: string) => void;
}

const GraphCallbacksContext = createContext<GraphCallbacks | null>(null);

export function useGraphCallbacks(): GraphCallbacks {
  return useContext(GraphCallbacksContext) ?? {
    onRenameNode: () => {},
    onAddNodeContent: () => {},
    onUpdateNodeContent: () => {},
    onResizeNode: () => {},
    onDeleteNode: () => {},
  };
}

export function GraphCallbacksProvider({
  value,
  children,
}: {
  value: GraphCallbacks;
  children: React.ReactNode;
}) {
  return (
    <GraphCallbacksContext.Provider value={value}>
      {children}
    </GraphCallbacksContext.Provider>
  );
}
