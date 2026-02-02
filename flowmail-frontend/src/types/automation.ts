import { Node, Edge } from '@xyflow/react';

export interface ActionNodeData {
  type: 'action';
  message: string;
  [key: string]: unknown;
}

export interface DelayNodeData {
  type: 'delay';
  mode: 'absolute' | 'relative';
  absoluteDateTime?: string;
  relativeValue?: number;
  relativeUnit?: 'minutes' | 'hours' | 'days';
  [key: string]: unknown;
}

export interface ConditionRule {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'includes' | 'ends_with' | 'starts_with';
  value: string;
  joinType: 'AND' | 'OR';
}

export interface ConditionNodeData {
  type: 'condition';
  rules: ConditionRule[];
  [key: string]: unknown;
}

export interface StartEndNodeData {
  type: 'start' | 'end';
  [key: string]: unknown;
}

export type FlowNodeData = ActionNodeData | DelayNodeData | ConditionNodeData | StartEndNodeData;

export type FlowNode = Node<FlowNodeData>;

export interface Automation {
  _id: string;
  name: string;
  nodes: FlowNode[];
  edges: Edge[];
  createdAt: string;
}

export interface CreateAutomationPayload {
  name: string;
  nodes: FlowNode[];
  edges: Edge[];
}

export interface TestRunPayload {
  email: string;
}

export interface TestRun {
  _id: string;
  automationId: string;
  email: string;
  status: 'running' | 'finished';
  startedAt: string;
  finishedAt?: string;
}
