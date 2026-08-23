import dagre from "@dagrejs/dagre";
import { WorkflowGraph, WorkflowNode } from "@/lib/api/schemas";

const nodeWidth = 220;
const nodeHeight = 72;
const rankSep = 80;
const nodeSep = 40;

export function applyDagreLayout(graph: WorkflowGraph): WorkflowGraph {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: nodeSep, ranksep: rankSep });
  g.setDefaultEdgeLabel(() => ({}));

  const positionMap = new Map<string, { x: number; y: number }>();

  graph.nodes.forEach((node) => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  graph.edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  g.nodes().forEach((id) => {
    const node = g.node(id);
    if (node) {
      positionMap.set(id, { x: node.x - nodeWidth / 2, y: node.y - nodeHeight / 2 });
    }
  });

  const updatedNodes: WorkflowNode[] = graph.nodes.map((node) => {
    const pos = positionMap.get(node.id);
    if (pos && !node.position) {
      return { ...node, position: pos };
    }
    if (pos) {
      return { ...node, position: pos };
    }
    return node;
  });

  return { ...graph, nodes: updatedNodes };
}
