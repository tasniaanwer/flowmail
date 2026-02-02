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
import { Plus, AlertCircle, Sparkles, Zap } from 'lucide-react';

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
      setError(result.error.issues[0].message);
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
      <DialogContent className="sm:max-w-md border-0 shadow-2xl shadow-primary/20 animate-fade-in">
        <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-lg"></div>
        <DialogHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl bg-gradient-primary bg-clip-text text-transparent">Create New Automation</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Give your vibrant automation a unique name
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Automation Name
            </Label>
            <Input
              id="name"
              placeholder="e.g., Welcome Email Sequence"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="mt-1.5 border-2 border-primary/20 focus:border-primary/50 bg-background/50 backdrop-blur-sm text-base h-11"
              autoFocus
            />
            {error && (
              <div className="flex items-center gap-1.5 mt-2 text-destructive bg-destructive/10 rounded-lg px-3 py-2 border border-destructive/20">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="border-2 border-muted/20 hover:bg-muted/10"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-primary hover:shadow-glow min-w-[120px]"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
