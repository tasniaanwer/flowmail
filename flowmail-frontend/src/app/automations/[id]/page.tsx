'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlowEditor } from '@/components/flow/FlowEditor';
import { automationService } from '@/services/automationService';
import { Automation, FlowNode } from '@/types/automation';
import { Edge } from '@xyflow/react';
import { toast } from '@/hooks/use-toast';

export default function EditAutomationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [automation, setAutomation] = useState<Automation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadAutomation(id);
    }
  }, [id]);

  const loadAutomation = async (automationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await automationService.getById(automationId);
      setAutomation(data);
    } catch (err) {
      setError('Failed to load automation');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateFlow = (nodes: FlowNode[]): string | null => {
    for (const node of nodes) {
      if (node.data.type === 'action' && !node.data.message?.trim()) {
        return 'All Action nodes must have a message';
      }
      if (node.data.type === 'delay') {
        if (node.data.mode === 'absolute' && !node.data.absoluteDateTime) {
          return 'Delay nodes with specific date must have a date selected';
        }
        if (node.data.mode === 'relative' && (!node.data.relativeValue || node.data.relativeValue < 1)) {
          return 'Delay nodes must have a valid duration';
        }
      }
    }
    return null;
  };

  const handleSave = async (nodes: FlowNode[], edges: Edge[]) => {
    if (!id) return;

    const validationError = validateFlow(nodes);
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await automationService.update(id, { nodes, edges });
      toast({
        title: 'Saved',
        description: 'Automation saved successfully.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save automation.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !automation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {error || 'Automation not found'}
        </h3>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Automations
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col" style={{ height: '100%', minHeight: 0 }}>
      <div className="h-14 border-b border-border bg-card px-4 flex items-center gap-4 flex-shrink-0">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Link>
        </Button>
        <div className="h-6 w-px bg-border" />
        <h1 className="font-semibold text-foreground">{automation.name}</h1>
      </div>
      <div className="flex-1 min-h-0" style={{ height: '100%', minHeight: 0 }}>
        <FlowEditor
          initialNodes={automation.nodes}
          initialEdges={automation.edges}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}