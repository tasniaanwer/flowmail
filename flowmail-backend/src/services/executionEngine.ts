import nodemailer from 'nodemailer';
import { IAutomation } from '../models/Automation';
import { TestRun } from '../models/TestRun';

interface ActionNodeData {
  type: 'action';
  message: string;
}

interface DelayNodeData {
  type: 'delay';
  mode: 'absolute' | 'relative';
  absoluteDateTime?: string;
  relativeValue?: number;
  relativeUnit?: 'minutes' | 'hours' | 'days';
}

interface ConditionRule {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'includes' | 'ends_with' | 'starts_with';
  value: string;
  joinType: 'AND' | 'OR';
}

interface ConditionNodeData {
  type: 'condition';
  rules: ConditionRule[];
}

interface StartEndNodeData {
  type: 'start' | 'end';
}

type NodeData = ActionNodeData | DelayNodeData | ConditionNodeData | StartEndNodeData;

interface FlowNode {
  id: string;
  type: string;
  data: NodeData;
}

interface Edge {
  source: string;
  target: string;
}

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const calculateDelay = (data: DelayNodeData): number => {
  if (data.mode === 'absolute' && data.absoluteDateTime) {
    const targetTime = new Date(data.absoluteDateTime).getTime();
    const now = Date.now();
    return Math.max(0, targetTime - now);
  }

  if (data.mode === 'relative' && data.relativeValue && data.relativeUnit) {
    const multipliers: Record<string, number> = {
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
    };
    return data.relativeValue * (multipliers[data.relativeUnit] || 0);
  }

  return 0;
};

const getNextNode = (currentId: string, edges: Edge[], nodes: FlowNode[]): FlowNode | null => {
  const edge = edges.find((e) => e.source === currentId);
  if (!edge) return null;
  return nodes.find((n) => n.id === edge.target) || null;
};

const getNextNodeByCondition = (currentId: string, conditionResult: boolean, edges: Edge[], nodes: FlowNode[]): FlowNode | null => {
  // Find edge with matching condition result (true/false)
  const edge = edges.find((e: any) => 
    e.source === currentId && 
    ((e.sourceHandle === conditionResult.toString()) || 
     (!e.sourceHandle && conditionResult) || // Default to true if no handle
     (e.sourceHandle === 'true' && conditionResult) ||
     (e.sourceHandle === 'false' && !conditionResult))
  );
  if (!edge) return null;
  return nodes.find((n) => n.id === edge.target) || null;
};

const sendEmail = async (to: string, message: string, subject?: string): Promise<void> => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@flowmail.com',
    to,
    subject: subject || 'FlowMail Automation',
    text: message,
    html: `<p>${message}</p>`,
  });
  // eslint-disable-next-line no-console
  console.log(`Email sent to ${to} with subject: "${subject || 'FlowMail Automation'}"`);
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    // eslint-disable-next-line no-console
    console.log(`Ethereal preview: ${previewUrl}`);
  }
};

const evaluateCondition = (conditionData: ConditionNodeData, emailData: any): boolean => {
  if (!conditionData.rules || conditionData.rules.length === 0) {
    return false;
  }

  let result = true; // Start with true for first rule
  
  for (let i = 0; i < conditionData.rules.length; i++) {
    const rule = conditionData.rules[i];
    const fieldValue = getEmailFieldValue(emailData, rule.field);
    const ruleResult = evaluateRule(rule, fieldValue);
    
    if (i === 0) {
      // First rule sets the initial result
      result = ruleResult;
    } else {
      // Subsequent rules use join type (AND/OR)
      if (rule.joinType === 'AND') {
        result = result && ruleResult;
      } else {
        result = result || ruleResult;
      }
    }
  }
  
  return result;
};

const getEmailFieldValue = (emailData: any, field: string): string => {
  // Create a test email with sample data if not provided
  if (!emailData) {
    emailData = {
      subject: 'Test Subject with test keyword',
      from: 'test@example.com',
      to: 'user@example.com',
      body: 'This is a test email body',
      cc: '',
      bcc: ''
    };
  }
  
  switch (field) {
    case 'subject':
      return emailData.subject || '';
    case 'from':
      return emailData.from || '';
    case 'to':
      return emailData.to || '';
    case 'body':
      return emailData.body || '';
    case 'cc':
      return emailData.cc || '';
    case 'bcc':
      return emailData.bcc || '';
    default:
      return '';
  }
};

const evaluateRule = (rule: ConditionRule, fieldValue: string): boolean => {
  const value = (rule.value || '').toLowerCase();
  const field = (fieldValue || '').toLowerCase();
  
  switch (rule.operator) {
    case 'equals':
      return field === value;
    case 'not_equals':
      return field !== value;
    case 'includes':
      return field.includes(value);
    case 'starts_with':
      return field.startsWith(value);
    case 'ends_with':
      return field.endsWith(value);
    default:
      return false;
  }
};

const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const executeAutomation = async (
  automation: IAutomation,
  email: string,
  testRunId: string
): Promise<void> => {
  const nodes = automation.nodes as FlowNode[];
  const edges = automation.edges as Edge[];

  // eslint-disable-next-line no-console
  console.log(`Starting automation "${automation.name}" for ${email}`);

  let currentNode = nodes.find((n) => n.data.type === 'start');
  if (!currentNode) {
    // eslint-disable-next-line no-console
    console.error('No start node found');
    return;
  }

  while (currentNode) {
    if (currentNode.data.type === 'end') {
      // eslint-disable-next-line no-console
      console.log('Reached end node');
      break;
    }

    if (currentNode.data.type === 'action') {
      const actionData = currentNode.data as ActionNodeData;
      try {
        await sendEmail(email, actionData.message);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to send email:', error);
      }
    }

    if (currentNode.data.type === 'delay') {
      const delayData = currentNode.data as DelayNodeData;
      const delayMs = calculateDelay(delayData);
      // eslint-disable-next-line no-console
      console.log(`Waiting ${delayMs}ms`);
      await wait(delayMs);
    }

    if (currentNode.data.type === 'condition') {
      const conditionData = currentNode.data as ConditionNodeData;
      
      // Create test email data for evaluation
      const testEmailData = {
        subject: `Test Subject with ${email.includes('urgent') || email.includes('sale') ? email.includes('urgent') ? 'urgent' : 'sale' : 'test'} keyword`,
        from: email,
        to: 'user@example.com',
        body: 'This is a test email body to check conditions',
        cc: '',
        bcc: ''
      };
      
      const conditionResult = evaluateCondition(conditionData, testEmailData);
      // eslint-disable-next-line no-console
      console.log(`Condition evaluated: ${conditionResult ? 'TRUE' : 'FALSE'}`);
      
      // Find next node based on condition result
      const nextNode = getNextNodeByCondition(currentNode.id, conditionResult, edges, nodes);
      if (!nextNode) break;
      
      currentNode = nextNode;
      continue;
    }

    // Find next node for non-condition nodes
    const nextNode = getNextNode(currentNode.id, edges, nodes);
    if (!nextNode) break;

    currentNode = nextNode;
  }

  await TestRun.findByIdAndUpdate(testRunId, {
    status: 'finished',
    finishedAt: new Date(),
  });

  // eslint-disable-next-line no-console
  console.log(`Automation "${automation.name}" completed for ${email}`);
};

