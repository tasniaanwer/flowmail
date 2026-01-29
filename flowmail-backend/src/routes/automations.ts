import { Router, Request, Response } from 'express';
import { Automation } from '../models/Automation';
import { TestRun } from '../models/TestRun';
import { executeAutomation } from '../services/executionEngine';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const automations = await Automation.find().sort({ createdAt: -1 });
    res.json(automations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch automations' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation) {
      return res.status(404).json({ error: 'Automation not found' });
    }
    res.json(automation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch automation' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, nodes, edges } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const existing = await Automation.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });
    if (existing) {
      return res.status(400).json({ error: 'Automation name already exists' });
    }

    const automation = new Automation({
      name: name.trim(),
      nodes: nodes || [],
      edges: edges || [],
    });

    await automation.save();
    res.status(201).json(automation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create automation' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, nodes, edges } = req.body;

    const updates: any = {};
    if (nodes !== undefined) updates.nodes = nodes;
    if (edges !== undefined) updates.edges = edges;
    if (name !== undefined) {
      const existing = await Automation.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      });
      if (existing) {
        return res.status(400).json({ error: 'Automation name already exists' });
      }
      updates.name = name.trim();
    }

    const automation = await Automation.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!automation) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    res.json(automation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update automation' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const automation = await Automation.findByIdAndDelete(req.params.id);
    if (!automation) {
      return res.status(404).json({ error: 'Automation not found' });
    }
    res.json({ message: 'Automation deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete automation' });
  }
});

router.post('/:id/test', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const automation = await Automation.findById(req.params.id);
    if (!automation) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    const testRun = new TestRun({
      automationId: automation._id,
      email: email.trim(),
      status: 'running',
    });
    await testRun.save();

    executeAutomation(automation, email.trim(), testRun._id.toString()).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Execution error:', err);
    });

    res.json({ message: 'Test run started', testRunId: testRun._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start test run' });
  }
});

export default router;

