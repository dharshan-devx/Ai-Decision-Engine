"use client";
import { useMemo, useCallback } from "react";
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Layout engine would be ideal here (like dagre), but for simplicity,
// we'll explicitly map some simple coordinates if the AI doesn't provide them,
// or we'll stack them. Since the AI won't know coordinates, let's do a basic auto-layout.
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250;
const nodeHeight = 120;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = direction === 'LR' ? 'left' : 'top';
        node.sourcePosition = direction === 'LR' ? 'right' : 'bottom';

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

export default function DecisionTree({ data }) {
    const initialNodes = useMemo(() => {
        if (!data?.decisionTree?.nodes) return [];
        return data.decisionTree.nodes.map((n) => ({
            id: String(n.id),
            data: {
                label: (
                    <div style={{ textAlign: 'center', padding: '10px' }}>
                        <strong style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#10b981' }}>{n.label}</strong>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>{n.description}</span>
                    </div>
                )
            },
            style: {
                background: 'var(--surface2)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-md)',
                backdropFilter: 'blur(10px)',
                width: 250,
            }
        }));
    }, [data]);

    const initialEdges = useMemo(() => {
        if (!data?.decisionTree?.edges) return [];
        return data.decisionTree.edges.map((e, index) => ({
            id: `e${index}-${e.source}-${e.target}`,
            source: String(e.source),
            target: String(e.target),
            label: e.label,
            animated: true,
            type: 'smoothstep',
            style: { stroke: 'var(--accent)', strokeWidth: 2 },
            labelStyle: { fill: 'var(--text)', fontWeight: 500 },
            labelBgStyle: { fill: 'var(--surface)', fillOpacity: 0.9, rx: 4, ry: 4 },
            markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--accent)' },
        }));
    }, [data]);

    const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
        () => getLayoutedElements(initialNodes, initialEdges),
        [initialNodes, initialEdges]
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

    if (!data?.decisionTree?.nodes?.length) {
        return <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>No decision tree data generated for this dilemma.</div>;
    }

    return (
        <div style={{ width: "100%", height: "700px", borderRadius: "16px", overflow: "hidden", background: "#111827", border: "1px solid #374151" }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                attributionPosition="bottom-right"
                proOptions={{ hideAttribution: true }}
            >
                <Controls
                    showInteractive={false}
                    style={{
                        background: 'var(--glass)',
                        borderColor: 'var(--border)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-md)'
                    }}
                />
                <MiniMap
                    nodeStrokeColor="var(--border)"
                    nodeColor="var(--surface3)"
                    maskColor="var(--bg-accent)"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px' }}
                />
                <Background color="var(--border-light)" variant="dots" gap={16} size={1.5} />
            </ReactFlow>
        </div>
    );
}

