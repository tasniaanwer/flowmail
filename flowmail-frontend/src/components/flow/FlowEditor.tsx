import { useCallback, useMemo, useEffect, useRef, useState } from 'react';
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

import { StartNode, EndNode, ActionNode, DelayNode, ConditionNode } from '@/components/nodes';
import { NodePalette } from '@/components/flow/NodePalette';
import { ConditionBuilderModal } from '@/components/modals/ConditionBuilderModal';
import { FlowNode, FlowNodeData, ConditionNodeData } from '@/types/automation';
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
      conditionNode: ConditionNode as any,
    }),
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(
    (initialNodes || createDefaultNodes()) as Node[]
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialEdges || createDefaultEdges()
  );

  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [editingConditionNode, setEditingConditionNode] = useState<FlowNode | null>(null);

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
      // If it's a condition node, open the builder modal first
      if (node.type === 'conditionNode') {
        setEditingConditionNode(node);
        setConditionModalOpen(true);
        return;
      }

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

  const handleConditionSave = useCallback((conditionData: ConditionNodeData) => {
    if (editingConditionNode) {
      // Update the condition node data
      setNodes((nds) =>
        nds.map((node) =>
          node.id === editingConditionNode.id
            ? { ...node, data: conditionData }
            : node
        )
      );
      
      // Add the node to the flow if it's not already there
      if (!nodes.find((n) => n.id === editingConditionNode.id)) {
        const endNode = nodes.find((n) => n.id === 'end');
        if (endNode) {
          const newNode: Node = {
            ...editingConditionNode,
            data: conditionData,
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

          // Update edges to insert condition node in the chain
          setEdges((eds) => {
            const edgeToEnd = eds.find((e) => e.target === 'end');
            if (edgeToEnd) {
              const newEdges = eds.filter((e) => e.id !== edgeToEnd.id);
              return [
                ...newEdges,
                { id: `${edgeToEnd.source}-${newNode.id}`, source: edgeToEnd.source, target: newNode.id, type: 'smoothstep' },
              ];
            }
            return eds;
          });
        }
      }
    }
    
    setEditingConditionNode(null);
    setConditionModalOpen(false);
  }, [editingConditionNode, nodes, setNodes, setEdges]);

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
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1}
            color="rgb(var(--primary) / 0.3)"
          />
          <Controls 
            className="!bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 !backdrop-blur-sm !border-2 !border-primary/30 !shadow-xl !shadow-primary/20 !rounded-xl !p-2 !gap-1"
            showZoom={true}
            showFitView={true}
            showInteractive={true}
            position="bottom-left"
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'rgb(var(--primary))',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            }}
          />
          <MiniMap 
            className="!bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-800/95 dark:to-gray-900/95 !backdrop-blur-sm !border-2 !border-primary/30 !shadow-xl !shadow-primary/20 !rounded-xl"
            nodeColor={(node) => {
              switch (node.type) {
                case 'startNode':
                  return 'rgb(34 197 94)'; // Success green
                case 'endNode':
                  return 'rgb(239 68 68)'; // Destructive red
                case 'actionNode':
                  return 'rgb(88 80 236)'; // Primary purple
                case 'delayNode':
                  return 'rgb(251 146 60)'; // Warning orange
                case 'conditionNode':
                  return 'rgb(251 146 60)'; // Warning orange
                default:
                  return 'rgb(156 163 175)'; // Muted gray
              }
            }}
            nodeStrokeWidth={3}
            nodeStrokeColor="#ffffff"
            nodeBorderRadius={8}
            maskColor="rgb(var(--muted) / 0.2)"
            position="top-right"
            style={{
              width: 200,
              height: 150,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            }}
          />
        </ReactFlow>
      </div>

      <ConditionBuilderModal
        open={conditionModalOpen}
        onOpenChange={setConditionModalOpen}
        initialData={editingConditionNode?.data as ConditionNodeData}
        onSave={handleConditionSave}
      />
    </div>
  );
}
