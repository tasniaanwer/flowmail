import { FlowNode } from '@/types/automation';
import { Edge } from '@xyflow/react';

export const createDefaultNodes = (): FlowNode[] => [
  {
    id: 'start',
    type: 'startNode',
    position: { x: 250, y: 50 },
    data: { type: 'start' },
    deletable: false,
  },
  {
    id: 'end',
    type: 'endNode',
    position: { x: 250, y: 300 },
    data: { type: 'end' },
    deletable: false,
  },
];

export const createDefaultEdges = (): Edge[] => [
  {
    id: 'start-end',
    source: 'start',
    target: 'end',
    type: 'smoothstep',
  },
];

export const generateNodeId = (type: string): string => {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const createActionNode = (position: { x: number; y: number }): FlowNode => ({
  id: generateNodeId('action'),
  type: 'actionNode',
  position,
  data: {
    type: 'action',
    message: '',
  },
});

export const createDelayNode = (position: { x: number; y: number }): FlowNode => ({
  id: generateNodeId('delay'),
  type: 'delayNode',
  position,
  data: {
    type: 'delay',
    mode: 'relative',
    relativeValue: 1,
    relativeUnit: 'hours',
  },
});

export const createConditionNode = (position: { x: number; y: number }): FlowNode => ({
  id: generateNodeId('condition'),
  type: 'conditionNode',
  position,
  data: {
    type: 'condition',
    rules: [
      {
        id: '1',
        field: 'subject',
        operator: 'includes',
        value: '',
        joinType: 'AND',
      },
    ],
  },
});

// Normalize nodes from backend to ensure they have correct structure
export const normalizeNodes = (nodes: FlowNode[]): FlowNode[] => {
  return nodes.map((node) => {
    // Ensure node has proper type field based on data.type
    let nodeType = node.type;
    if (!nodeType && node.data) {
      switch (node.data.type) {
        case 'start':
          nodeType = 'startNode';
          break;
        case 'end':
          nodeType = 'endNode';
          break;
        case 'action':
          nodeType = 'actionNode';
          break;
        case 'delay':
          nodeType = 'delayNode';
          break;
        case 'condition':
          nodeType = 'conditionNode';
          break;
        default:
          nodeType = 'default';
      }
    }

    return {
      ...node,
      type: nodeType,
      draggable: node.id !== 'start' && node.id !== 'end',
      selectable: true,
      deletable: node.id !== 'start' && node.id !== 'end',
      position: node.position || { x: 250, y: 100 },
    };
  });
};