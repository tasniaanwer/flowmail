import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Clock, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DelayNodeData } from '@/types/automation';
import { cn } from '@/lib/utils';

interface DelayNodeProps {
  id: string;
  data: DelayNodeData;
}

export function DelayNode({ id, data }: DelayNodeProps) {
  const { setNodes } = useReactFlow();

  const updateNodeData = (updates: Partial<DelayNodeData>) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  };

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  const isRelativeMode = data.mode === 'relative';
  const isAbsoluteMode = data.mode === 'absolute';

  return (
    <div className="bg-card border-2 border-warning rounded-xl shadow-node min-w-[280px] overflow-hidden">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-warning !w-3 !h-3 !border-2 !border-card"
      />
      
      <div className="flex items-center justify-between px-4 py-3 bg-warning/10 border-b border-warning/20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-warning flex items-center justify-center">
            <Clock className="w-4 h-4 text-warning-foreground" />
          </div>
          <span className="font-semibold text-foreground text-sm">Delay</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Mode Selection */}
        <div className="flex gap-2">
          <Button
            variant={isRelativeMode ? "default" : "outline"}
            size="sm"
            className={cn(
              "flex-1 text-xs",
              isRelativeMode && "bg-warning text-warning-foreground hover:bg-warning/90"
            )}
            onClick={() => updateNodeData({ mode: 'relative' })}
          >
            Relative
          </Button>
          <Button
            variant={isAbsoluteMode ? "default" : "outline"}
            size="sm"
            className={cn(
              "flex-1 text-xs",
              isAbsoluteMode && "bg-warning text-warning-foreground hover:bg-warning/90"
            )}
            onClick={() => updateNodeData({ mode: 'absolute' })}
          >
            Specific Date
          </Button>
        </div>

        {isRelativeMode && (
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Amount</Label>
              <Input
                type="number"
                min={1}
                value={data.relativeValue || 1}
                onChange={(e) => updateNodeData({ relativeValue: Math.max(1, parseInt(e.target.value) || 1) })}
                className="mt-1 nodrag"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Unit</Label>
              <Select
                value={data.relativeUnit || 'hours'}
                onValueChange={(value: 'minutes' | 'hours' | 'days') => 
                  updateNodeData({ relativeUnit: value })
                }
              >
                <SelectTrigger className="mt-1 nodrag">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {isAbsoluteMode && (
          <div>
            <Label className="text-xs text-muted-foreground">Date & Time</Label>
            <Input
              type="datetime-local"
              value={data.absoluteDateTime || ''}
              onChange={(e) => updateNodeData({ absoluteDateTime: e.target.value })}
              className="mt-1 nodrag"
            />
            {!data.absoluteDateTime && (
              <p className="text-xs text-destructive mt-1">Date & time required</p>
            )}
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-warning !w-3 !h-3 !border-2 !border-card"
      />
    </div>
  );
}
