import { useState } from 'react';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, AlertCircle } from 'lucide-react';

const nameSchema = z.string().min(1, 'Name is required').max(100, 'Name must be under 100 characters');

interface CreateAutomationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string) => Promise<void>;
  existingNames?: string[];
}

export function CreateAutomationModal({
  open,
  onOpenChange,
  onCreate,
  existingNames = [],
}: CreateAutomationModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    
    const result = nameSchema.safeParse(trimmedName);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    if (existingNames.some((n) => n.toLowerCase() === trimmedName.toLowerCase())) {
      setError('An automation with this name already exists');
      return;
    }

    setIsLoading(true);
    try {
      await onCreate(trimmedName);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create automation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setName('');
      setError('');
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Automation</DialogTitle>
          <DialogDescription>
            Give your automation a unique name to get started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Automation Name</Label>
            <Input
              id="name"
              placeholder="e.g., Welcome Email Sequence"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="mt-1.5"
              autoFocus
            />
            {error && (
              <div className="flex items-center gap-1.5 mt-1.5 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Plus className="w-4 h-4 mr-2" />
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
