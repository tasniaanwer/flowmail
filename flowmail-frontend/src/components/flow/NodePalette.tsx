import { Mail, Clock, Save, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlowNode } from '@/types/automation';
import { createActionNode, createDelayNode, createConditionNode } from '@/utils/flowUtils';

interface NodePaletteProps {
  onAddNode: (node: FlowNode) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function NodePalette({ onAddNode, onSave, isSaving }: NodePaletteProps) {
  return (
    <div className="w-64 bg-card border-r border-border p-4 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Add Nodes</h3>
        <div className="space-y-2">
          <button
            onClick={() => onAddNode(createActionNode({ x: 0, y: 0 }))}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:bg-secondary/10 transition-colors text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Action</p>
              <p className="text-xs text-muted-foreground">Send email</p>
            </div>
          </button>
          
          <button
            onClick={() => onAddNode(createDelayNode({ x: 0, y: 0 }))}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:bg-warning/10 transition-colors text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center group-hover:bg-warning/20 transition-colors">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Delay</p>
              <p className="text-xs text-muted-foreground">Wait before next</p>
            </div>
          </button>

          <button
            onClick={() => onAddNode(createConditionNode({ x: 0, y: 0 }))}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:bg-warning/10 transition-colors text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-warm/20 flex items-center justify-center group-hover:bg-gradient-warm/30 transition-colors">
              <GitBranch className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Condition</p>
              <p className="text-xs text-muted-foreground">Split flow based on rules</p>
            </div>
          </button>
        </div>
      </div>
      
      <div className="mt-auto">
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Automation'}
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Drag nodes to reposition</p>
        <p>• Click node trash icon to delete</p>
        <p>• Start and End nodes are fixed</p>
      </div>
    </div>
  );
}
