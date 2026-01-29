import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Mail, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ActionNodeData } from '@/types/automation';

interface ActionNodeProps {
  id: string;
  data: ActionNodeData;
}

export function ActionNode({ id, data }: ActionNodeProps) {
  const { setNodes } = useReactFlow();

  const handleMessageChange = (message: string) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, message } }
          : node
      )
    );
  };

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  return (
    <div className="bg-card border-2 border-primary rounded-xl shadow-node min-w-[280px] overflow-hidden">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary !w-3 !h-3 !border-2 !border-card"
      />
      
      <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Mail className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground text-sm">Send Email</span>
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
      
      <div className="p-4">
        <label className="block text-xs font-medium text-muted-foreground mb-2">
          Email Message
        </label>
        <Textarea
          value={data.message || ''}
          onChange={(e) => handleMessageChange(e.target.value)}
          placeholder="Enter email message..."
          className="min-h-[80px] resize-none text-sm nodrag"
        />
        {!data.message && (
          <p className="text-xs text-destructive mt-1">Message is required</p>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary !w-3 !h-3 !border-2 !border-card"
      />
    </div>
  );
}
