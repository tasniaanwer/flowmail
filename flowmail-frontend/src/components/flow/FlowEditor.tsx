import { useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  NodeTypes,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { StartNode, EndNode, ActionNode, DelayNode } from '@/components/nodes';
import { NodePalette } from '@/components/flow/NodePalette';
import { FlowNode, FlowNodeData } from '@/types/automation';
import { createDefaultNodes, createDefaultEdges, normalizeNodes } from '@/utils/flowUtils';

interface FlowEditorProps {
  initialNodes?: FlowNode[];
  initialEdges?: Edge[];
  onSave: (nodes: FlowNode[], edges: Edge[]) => void;
  isSaving?: boolean;
}

export function FlowEditor({
  initialNodes,
  initialEdges,
  onSave,
  isSaving = false,
}: FlowEditorProps) {
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      startNode: StartNode,
      endNode: EndNode,
      actionNode: ActionNode as any,
      delayNode: DelayNode as any,
    }),
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(
    (initialNodes || createDefaultNodes()) as Node[]
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialEdges || createDefaultEdges()
  );

  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Update nodes and edges when initialNodes/initialEdges change (e.g., when loading from backend)
  useEffect(() => {
    if (initialNodes && initialNodes.length > 0) {
      // Normalize nodes from backend to ensure proper structure
      const normalizedNodes = normalizeNodes(initialNodes) as Node[];
      setNodes(normalizedNodes);
    } else if (!initialNodes) {
      // If no initial nodes, use defaults
      setNodes(createDefaultNodes() as Node[]);
    }
  }, [initialNodes, setNodes]);

  useEffect(() => {
    if (initialEdges) {
      setEdges(initialEdges);
    } else if (!initialEdges) {
      setEdges(createDefaultEdges());
    }
  }, [initialEdges, setEdges]);

  // Fit view after nodes are loaded
  useEffect(() => {
    if (reactFlowInstance.current && nodes.length > 0) {
      setTimeout(() => {
        reactFlowInstance.current?.fitView({ padding: 0.2, duration: 400 });
      }, 100);
    }
  }, [nodes.length]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds)),
    [setEdges]
  );

  const handleSave = () => {
    onSave(nodes as FlowNode[], edges);
  };

  const handleAddNode = useCallback(
    (node: FlowNode) => {
      // Find the end node position
      const endNode = nodes.find((n) => n.id === 'end');
      if (endNode) {
        // Position new node above the end node
        const newNode: Node = {
          ...node,
          position: {
            x: endNode.position.x,
            y: endNode.position.y - 150,
          },
        };
        
        // Move end node down
        setNodes((nds) => [
          ...nds.map((n) =>
            n.id === 'end'
              ? { ...n, position: { ...n.position, y: n.position.y + 150 } }
              : n
          ),
          newNode,
        ]);

        // Update edges to insert new node in the chain
        setEdges((eds) => {
          // Find edge going to end
          const edgeToEnd = eds.find((e) => e.target === 'end');
          if (edgeToEnd) {
            const newEdges = eds.filter((e) => e.id !== edgeToEnd.id);
            return [
              ...newEdges,
              { id: `${edgeToEnd.source}-${newNode.id}`, source: edgeToEnd.source, target: newNode.id, type: 'smoothstep' },
              { id: `${newNode.id}-end`, source: newNode.id, target: 'end', type: 'smoothstep' },
            ];
          }
          return eds;
        });
      }
    },
    [nodes, setNodes, setEdges]
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
    // Fit view on initial load
    setTimeout(() => {
      instance.fitView({ padding: 0.2, duration: 400 });
    }, 100);
  }, []);

  return (
    <div className="flex h-full w-full" style={{ height: '100%', width: '100%' }}>
      <NodePalette onAddNode={handleAddNode} onSave={handleSave} isSaving={isSaving} />
      <div className="flex-1 h-full" style={{ height: '100%', width: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={onInit}
          nodeTypes={nodeTypes}
          proOptions={{ hideAttribution: true }}
          deleteKeyCode={['Backspace', 'Delete']}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          style={{ width: '100%', height: '100%' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls />
          <MiniMap 
            className="!bg-card !border !border-border"
            nodeColor={(node) => {
              switch (node.type) {
                case 'startNode':
                  return 'hsl(var(--success))';
                case 'endNode':
                  return 'hsl(var(--destructive))';
                case 'actionNode':
                  return 'hsl(var(--primary))';
                case 'delayNode':
                  return 'hsl(var(--warning))';
                default:
                  return 'hsl(var(--muted))';
              }
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
