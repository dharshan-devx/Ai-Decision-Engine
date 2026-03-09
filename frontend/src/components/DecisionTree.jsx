"use client";
import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
    Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import dagre from 'dagre';

const nodeWidth = 280;
const nodeHeight = 140;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 60,
        ranksep: 80,
        edgesep: 20,
        marginx: 30,
        marginy: 30,
    });

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
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };
        return node;
    });

    return { nodes, edges };
};

// Determine node color based on type/keywords
const getNodeStyle = (label, description, index, total) => {
    const text = `${label} ${description}`.toLowerCase();
    let borderColor = '#ffa116';
    let bgGradient = 'linear-gradient(135deg, rgba(255, 161, 22, 0.08) 0%, rgba(255, 161, 22, 0.02) 100%)';
    let iconEmoji = '◆';
    let glowColor = 'rgba(255, 161, 22, 0.15)';

    if (index === 0) {
        // Root node
        borderColor = '#ffc96b';
        bgGradient = 'linear-gradient(135deg, rgba(255, 201, 107, 0.12) 0%, rgba(255, 161, 22, 0.06) 100%)';
        iconEmoji = '🎯';
        glowColor = 'rgba(255, 201, 107, 0.2)';
    } else if (text.includes('risk') || text.includes('danger') || text.includes('fail') || text.includes('worst') || text.includes('threat')) {
        borderColor = '#ef4743';
        bgGradient = 'linear-gradient(135deg, rgba(239, 71, 67, 0.1) 0%, rgba(239, 71, 67, 0.02) 100%)';
        iconEmoji = '⚠️';
        glowColor = 'rgba(239, 71, 67, 0.15)';
    } else if (text.includes('success') || text.includes('optimal') || text.includes('best') || text.includes('recommend') || text.includes('benefit') || text.includes('win')) {
        borderColor = '#2cbb5d';
        bgGradient = 'linear-gradient(135deg, rgba(44, 187, 93, 0.1) 0%, rgba(44, 187, 93, 0.02) 100%)';
        iconEmoji = '✅';
        glowColor = 'rgba(44, 187, 93, 0.15)';
    } else if (text.includes('option') || text.includes('path') || text.includes('alternative') || text.includes('choice')) {
        borderColor = '#3b82f6';
        bgGradient = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.02) 100%)';
        iconEmoji = '🔀';
        glowColor = 'rgba(59, 130, 246, 0.15)';
    } else if (text.includes('outcome') || text.includes('result') || text.includes('impact') || text.includes('consequence')) {
        borderColor = '#8b5cf6';
        bgGradient = 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.02) 100%)';
        iconEmoji = '📊';
        glowColor = 'rgba(139, 92, 246, 0.15)';
    }

    return { borderColor, bgGradient, iconEmoji, glowColor };
};

export default function DecisionTree({ data }) {
    const [direction, setDirection] = useState('TB');
    const [hoveredNode, setHoveredNode] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef(null);

    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const initialNodes = useMemo(() => {
        if (!data?.decisionTree?.nodes) return [];
        const total = data.decisionTree.nodes.length;
        return data.decisionTree.nodes.map((n, index) => {
            const { borderColor, bgGradient, iconEmoji, glowColor } = getNodeStyle(
                n.label || '', n.description || '', index, total
            );
            return {
                id: String(n.id),
                data: {
                    label: (
                        <div style={{
                            textAlign: 'left',
                            padding: '14px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            height: '100%',
                            justifyContent: 'center',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}>
                                <span style={{ fontSize: '16px', lineHeight: 1 }}>{iconEmoji}</span>
                                <strong style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
                                    fontWeight: 600,
                                    color: borderColor,
                                    letterSpacing: '0.01em',
                                    lineHeight: 1.3,
                                }}>{n.label}</strong>
                            </div>
                            {n.description && (
                                <span style={{
                                    fontSize: '11.5px',
                                    color: '#b0b0b0',
                                    lineHeight: 1.45,
                                    fontFamily: "'Inter', system-ui, sans-serif",
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}>{n.description}</span>
                            )}
                        </div>
                    )
                },
                style: {
                    background: bgGradient,
                    color: '#fff',
                    border: `1px solid ${borderColor}30`,
                    borderLeft: `3px solid ${borderColor}`,
                    borderRadius: '12px',
                    boxShadow: `0 4px 16px rgba(0,0,0,0.3), 0 0 20px ${glowColor}`,
                    backdropFilter: 'blur(12px)',
                    width: nodeWidth,
                    cursor: 'grab',
                }
            };
        });
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
            style: {
                stroke: 'url(#edge-gradient)',
                strokeWidth: 2,
                opacity: 0.8,
            },
            labelStyle: {
                fill: '#e5e5e5',
                fontWeight: 500,
                fontSize: '11px',
                fontFamily: "'Inter', system-ui, sans-serif",
            },
            labelBgStyle: {
                fill: '#1a1a2e',
                fillOpacity: 0.95,
                rx: 6,
                ry: 6,
                stroke: 'rgba(255, 161, 22, 0.15)',
                strokeWidth: 1,
            },
            labelBgPadding: [8, 6],
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#ffa116',
                width: 16,
                height: 16,
            },
        }));
    }, [data]);

    const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
        () => getLayoutedElements(
            initialNodes.map(n => ({ ...n })),
            initialEdges.map(e => ({ ...e })),
            direction
        ),
        [initialNodes, initialEdges, direction]
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

    // Track if this is a user-triggered direction change
    const prevDirection = useRef(direction);

    useEffect(() => {
        if (prevDirection.current !== direction) {
            prevDirection.current = direction;
            const { nodes: newNodes, edges: newEdges } = getLayoutedElements(
                initialNodes.map(n => ({ ...n })),
                initialEdges.map(e => ({ ...e })),
                direction
            );
            setNodes(newNodes);
            setEdges(newEdges);
        }
    }, [direction]);

    if (!data?.decisionTree?.nodes?.length) {
        return (
            <div style={{
                padding: 60,
                textAlign: 'center',
                color: '#6b7280',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.06)',
            }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌳</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '16px', fontWeight: 600, color: '#9ca3af' }}>
                    No Decision Tree Generated
                </div>
                <div style={{ fontSize: '13px', marginTop: '8px', color: '#6b7280' }}>
                    Run an analysis to visualize the decision pathways
                </div>
            </div>
        );
    }

    const nodeCount = data.decisionTree.nodes.length;
    const edgeCount = data.decisionTree.edges?.length || 0;

    return (
        <div 
            ref={containerRef}
            style={{
                width: "100%",
                height: isFullscreen ? "100vh" : "700px",
                borderRadius: isFullscreen ? "0px" : "16px",
                overflow: "hidden",
                background: "linear-gradient(135deg, #0a0a1a 0%, #0d0d1f 50%, #0a0a1a 100%)",
                border: isFullscreen ? "none" : "1px solid rgba(255, 161, 22, 0.1)",
                boxShadow: isFullscreen ? "none" : "0 8px 32px rgba(0,0,0,0.4), inset 0 0 60px rgba(255, 161, 22, 0.02)",
                position: "relative",
            }}
        >
            {/* SVG Gradient Definitions */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffa116" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#ffc96b" stopOpacity="0.5" />
                    </linearGradient>
                </defs>
            </svg>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.1}
                maxZoom={2.5}
                attributionPosition="bottom-right"
                proOptions={{ hideAttribution: true }}
                nodesDraggable={true}
                nodesConnectable={false}
                elementsSelectable={true}
            >
                <Controls
                    showInteractive={false}
                    style={{
                        background: 'rgba(10, 10, 26, 0.9)',
                        borderColor: 'rgba(255, 161, 22, 0.15)',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                        backdropFilter: 'blur(12px)',
                    }}
                />

                <MiniMap
                    nodeStrokeColor="rgba(255, 161, 22, 0.3)"
                    nodeColor={(n) => {
                        const style = n.style;
                        if (style?.borderLeft?.includes('#ef4743')) return '#ef4743';
                        if (style?.borderLeft?.includes('#2cbb5d')) return '#2cbb5d';
                        if (style?.borderLeft?.includes('#3b82f6')) return '#3b82f6';
                        if (style?.borderLeft?.includes('#8b5cf6')) return '#8b5cf6';
                        return '#ffa116';
                    }}
                    maskColor="rgba(10, 10, 26, 0.85)"
                    style={{
                        background: 'rgba(10, 10, 26, 0.95)',
                        border: '1px solid rgba(255, 161, 22, 0.1)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    }}
                    pannable
                    zoomable
                />

                <Background
                    color="rgba(255, 161, 22, 0.06)"
                    variant="dots"
                    gap={20}
                    size={1}
                />

                {/* Layout Toggle & Stats Panel */}
                <Panel position="top-left" style={{ margin: '12px' }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                    }}>
                        {/* Layout Direction Toggle */}
                        <div style={{
                            display: 'flex',
                            background: 'rgba(10, 10, 26, 0.9)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '10px',
                            padding: '3px',
                            border: '1px solid rgba(255, 161, 22, 0.12)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                        }}>
                            <button
                                onClick={() => setDirection('TB')}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '7px',
                                    border: 'none',
                                    background: direction === 'TB' ? 'rgba(255, 161, 22, 0.2)' : 'transparent',
                                    color: direction === 'TB' ? '#ffa116' : '#6b7280',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontFamily: "'Inter', sans-serif",
                                    letterSpacing: '0.02em',
                                }}
                                title="Vertical layout"
                            >
                                ↕ Vertical
                            </button>
                            <button
                                onClick={() => setDirection('LR')}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '7px',
                                    border: 'none',
                                    background: direction === 'LR' ? 'rgba(255, 161, 22, 0.2)' : 'transparent',
                                    color: direction === 'LR' ? '#ffa116' : '#6b7280',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontFamily: "'Inter', sans-serif",
                                    letterSpacing: '0.02em',
                                }}
                                title="Horizontal layout"
                            >
                                ↔ Horizontal
                            </button>
                            <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '4px 2px' }} />
                            <button
                                onClick={toggleFullscreen}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '7px',
                                    border: 'none',
                                    background: isFullscreen ? 'rgba(255, 161, 22, 0.2)' : 'transparent',
                                    color: isFullscreen ? '#ffa116' : '#6b7280',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontFamily: "'Inter', sans-serif",
                                    letterSpacing: '0.02em',
                                }}
                                title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
                            >
                                {isFullscreen ? 'Collapse ⛶' : 'Full Screen ⛶'}
                            </button>
                        </div>

                        {/* Stats Badge */}
                        <div style={{
                            display: 'flex',
                            gap: '6px',
                            alignItems: 'center',
                            background: 'rgba(10, 10, 26, 0.9)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '10px',
                            padding: '8px 12px',
                            border: '1px solid rgba(255, 161, 22, 0.08)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                        }}>
                            <span style={{
                                fontSize: '10px',
                                color: '#ffa116',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontWeight: 500,
                            }}>
                                {nodeCount} nodes
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '10px' }}>•</span>
                            <span style={{
                                fontSize: '10px',
                                color: '#6b7280',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontWeight: 500,
                            }}>
                                {edgeCount} connections
                            </span>
                        </div>
                    </div>
                </Panel>

                {/* Legend Panel */}
                <Panel position="top-right" style={{ margin: '12px' }}>
                    <div style={{
                        background: 'rgba(10, 10, 26, 0.9)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        border: '1px solid rgba(255, 161, 22, 0.08)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                    }}>
                        <div style={{ fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '2px' }}>
                            Legend
                        </div>
                        {[
                            { color: '#ffc96b', label: 'Root Decision' },
                            { color: '#3b82f6', label: 'Option / Path' },
                            { color: '#2cbb5d', label: 'Positive Outcome' },
                            { color: '#ef4743', label: 'Risk / Threat' },
                            { color: '#8b5cf6', label: 'Impact / Result' },
                            { color: '#ffa116', label: 'General Node' },
                        ].map(({ color, label }) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '12px',
                                    height: '3px',
                                    borderRadius: '2px',
                                    background: color,
                                    boxShadow: `0 0 6px ${color}40`,
                                }} />
                                <span style={{
                                    fontSize: '10px',
                                    color: '#9ca3af',
                                    fontFamily: "'Inter', sans-serif",
                                }}>{label}</span>
                            </div>
                        ))}
                    </div>
                </Panel>
            </ReactFlow>

            {/* Custom CSS for ReactFlow overrides */}
            <style>{`
                .react-flow__node {
                    transition: box-shadow 0.2s ease, filter 0.2s ease !important;
                }
                .react-flow__node:hover {
                    filter: brightness(1.15);
                    z-index: 10 !important;
                }
                .react-flow__node.selected {
                    box-shadow: 0 0 0 2px #ffa116, 0 8px 32px rgba(255, 161, 22, 0.25) !important;
                }
                .react-flow__edge-path {
                    transition: stroke-width 0.2s ease;
                }
                .react-flow__edge:hover .react-flow__edge-path {
                    stroke-width: 3 !important;
                }
                .react-flow__controls-button {
                    background: rgba(10, 10, 26, 0.95) !important;
                    border-bottom: 1px solid rgba(255, 161, 22, 0.1) !important;
                    color: #9ca3af !important;
                    transition: all 0.2s ease !important;
                }
                .react-flow__controls-button:hover {
                    background: rgba(255, 161, 22, 0.15) !important;
                    color: #ffa116 !important;
                }
                .react-flow__controls-button svg {
                    fill: currentColor !important;
                }
            `}</style>
        </div>
    );
}
