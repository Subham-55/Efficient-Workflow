"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { WorkflowGraph } from "@/lib/api/schemas";
import { applyDagreLayout } from "@/lib/utils/layout";
import { StepNode } from "./nodes/StepNode";
import { AgentNode } from "./nodes/AgentNode";
import { HumanGateNode } from "./nodes/HumanGateNode";
import { ConditionalEdge } from "./edges/ConditionalEdge";

const nodeTypes: NodeTypes = {
  step: StepNode,
  agent: AgentNode,
  humanGate: HumanGateNode,
};

const edgeTypes: EdgeTypes = {
  conditional: ConditionalEdge,
};

interface WorkflowCanvasProps {
  graph: WorkflowGraph;
  onNodeClick?: (nodeId: string) => void;
  selectedNodeId?: string | null;
  readOnly?: boolean;
}

export function WorkflowCanvas({ graph, onNodeClick, readOnly = false }: WorkflowCanvasProps) {
  const layoutGraph = useMemo(() => applyDagreLayout(graph), [graph]);

  const nodes: Node[] = useMemo(
    () =>
      layoutGraph.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position ?? { x: 0, y: 0 },
        data: {
          label: n.label,
          description: n.description,
          status: n.status,
          confidence: n.confidence,
        },
      })),
    [layoutGraph.nodes]
  );

  const edges: Edge[] = useMemo(
    () =>
      layoutGraph.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        type: "conditional",
        animated: !readOnly,
        style: { stroke: "#d4a24c", strokeWidth: 2 },
        labelStyle: { fill: "#8fa396", fontFamily: "var(--font-plex-mono)", fontSize: 11 },
        labelBgStyle: { fill: "#16241c", fillOpacity: 0.8 },
        labelBgPadding: [6, 4] as [number, number],
        labelBgBorderRadius: 4,
      })),
    [layoutGraph.edges, readOnly]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick]
  );

  return (
    <div className="w-full h-full min-h-[500px] bg-board-bg rounded-node border border-border/30">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        defaultEdgeOptions={{ type: "conditional" }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#2a4a3a" />
        <Controls className="bg-board-panel border-border/50 fill-ink" />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === "humanGate") return "#8ab4f8";
            if (node.type === "agent") return "#4ade80";
            return "#4ade80";
          }}
          maskColor="#0f1a14"
          className="bg-board-panel border border-border/50"
        />
      </ReactFlow>
    </div>
  );
}
