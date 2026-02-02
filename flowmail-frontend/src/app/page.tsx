'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Play, Loader2, AlertCircle, Zap, Sparkles } from 'lucide-react';
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
    <div className="flex-1 p-6 lg:p-8 animate-fade-in-up">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Automations
            </h1>
            <p className="text-muted-foreground text-lg">
              Create vibrant email automation flows with ease
            </p>
          </div>
          <Button 
            onClick={() => setCreateModalOpen(true)}
            className="bg-gradient-primary hover:shadow-glow transform hover:scale-105 transition-all duration-300 text-white font-medium px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Automation
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <div className="absolute inset-0 w-12 h-12 animate-ping bg-primary/20 rounded-full"></div>
            </div>
            <p className="text-muted-foreground mt-4 animate-pulse">Loading your colorful automations...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-destructive flex items-center justify-center mb-4 animate-bounce-gentle">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Connection Error
            </h3>
            <p className="text-muted-foreground max-w-md mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={loadAutomations}
              className="border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300"
            >
              Retry
            </Button>
          </div>
        ) : automations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-primary/30 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 animate-fade-in">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-primary flex items-center justify-center mb-6 shadow-glow animate-float">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-accent rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">
              No automations yet
            </h3>
            <p className="text-muted-foreground max-w-md mb-6 text-lg">
              Start creating vibrant email automation flows that make your inbox come alive!
            </p>
            <Button 
              onClick={() => setCreateModalOpen(true)}
              className="bg-gradient-secondary hover:shadow-glow transform hover:scale-105 transition-all duration-300 text-white font-medium px-8 py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Automation
            </Button>
          </div>
        ) : (
          <div className="border border-border/50 rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm shadow-lg shadow-primary/10 animate-fade-in">
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
                           className="border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300"
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
                           className="border-success/20 hover:bg-success/10 hover:border-success/40 text-success transition-all duration-300"
                         >
                           <Play className="w-4 h-4 mr-1" />
                           Test
                         </Button>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => setDeleteId(automation._id)}
                           className="border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40 text-destructive transition-all duration-300"
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
