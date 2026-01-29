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

interface StartEndNodeData {
  type: 'start' | 'end';
}

type NodeData = ActionNodeData | DelayNodeData | StartEndNodeData;

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

const sendEmail = async (to: string, message: string): Promise<void> => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@flowmail.com',
    to,
    subject: 'FlowMail Automation',
    text: message,
    html: `<p>${message}</p>`,
  });
  // eslint-disable-next-line no-console
  console.log(`Email sent to ${to}`);
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    // eslint-disable-next-line no-console
    console.log(`Ethereal preview: ${previewUrl}`);
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
    const nextNode = getNextNode(currentNode.id, edges, nodes);
    if (!nextNode) break;

    currentNode = nextNode;

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
  }

  await TestRun.findByIdAndUpdate(testRunId, {
    status: 'finished',
    finishedAt: new Date(),
  });

  // eslint-disable-next-line no-console
  console.log(`Automation "${automation.name}" completed for ${email}`);
};

