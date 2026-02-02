'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Play, Loader2, AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CreateAutomationModal } from '@/components/modals/CreateAutomationModal';
import { TestRunModal } from '@/components/modals/TestRunModal';
import { automationService } from '@/services/automationService';
import { Automation } from '@/types/automation';
import { createDefaultNodes, createDefaultEdges } from '@/utils/flowUtils';
import { toast } from '@/hooks/use-toast';

export default function AutomationsPage() {
  const router = useRouter();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [testAutomation, setTestAutomation] = useState<Automation | null>(null);

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await automationService.getAll();
      setAutomations(data);
    } catch (err) {
      setError('Failed to load automations. Make sure your backend is running.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (name: string) => {
    const newAutomation = await automationService.create({
      name,
      nodes: createDefaultNodes(),
      edges: createDefaultEdges(),
    });
    router.push(`/automations/${newAutomation._id}`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await automationService.delete(deleteId);
      setAutomations((prev) => prev.filter((a) => a._id !== deleteId));
      toast({
        title: 'Automation deleted',
        description: 'The automation has been removed.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete automation.',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleTestRun = async (email: string) => {
    if (!testAutomation) return;
    await automationService.testRun(testAutomation._id, { email });
  };

  return (
    <div className="flex-1 p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Automations</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your email automation flows
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Automation
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Connection Error
            </h3>
            <p className="text-muted-foreground max-w-md mb-4">{error}</p>
            <Button variant="outline" onClick={loadAutomations}>
              Retry
            </Button>
          </div>
        ) : automations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No automations yet
            </h3>
            <p className="text-muted-foreground max-w-md mb-4">
              Create your first email automation to get started with automated workflows.
            </p>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Automation
            </Button>
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[60%]">Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {automations.map((automation) => (
                  <TableRow key={automation._id}>
                    <TableCell className="font-medium">
                      {automation.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/automations/${automation._id}`}>
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTestAutomation(automation)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(automation._id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <CreateAutomationModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreate={handleCreate}
        existingNames={automations.map((a) => a.name)}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Automation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this automation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {testAutomation && (
        <TestRunModal
          open={!!testAutomation}
          onOpenChange={(open) => !open && setTestAutomation(null)}
          automationName={testAutomation.name}
          onTestRun={handleTestRun}
        />
      )}
    </div>
  );
}
