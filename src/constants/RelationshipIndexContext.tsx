import { createContext, useContext } from "react";
import type { RelationshipIndexService } from "../services/RelationshipIndexService";

const RelationshipIndexContext = createContext<RelationshipIndexService | null>(null);

/**
 * Returns the RelationshipIndexService if one has been provided above in the
 * tree, or null if not (e.g. in tests or Storybook). Callers must handle null.
 */
export function useRelationshipIndex(): RelationshipIndexService | null {
  return useContext(RelationshipIndexContext);
}

export function RelationshipIndexProvider({
  value,
  children,
}: {
  value: RelationshipIndexService;
  children: React.ReactNode;
}) {
  return (
    <RelationshipIndexContext.Provider value={value}>
      {children}
    </RelationshipIndexContext.Provider>
  );
}