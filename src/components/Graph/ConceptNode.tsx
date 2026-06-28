import { memo } from "react";
import BaseNode from "./BaseNode";
import type { NodeProps } from "@xyflow/react";

interface ConceptNodeData {
  label: string;
  nodeId: string;
  color?: string;
  childGraphId?: string;
  tags?: string[];
}

function ConceptNode(props: NodeProps<ConceptNodeData>) {
  return <BaseNode {...props} />;
}

export default memo(ConceptNode);
