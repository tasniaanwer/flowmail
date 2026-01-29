import { Handle, Position } from '@xyflow/react';
import { Square } from 'lucide-react';

export function EndNode() {
  return (
    <div className="bg-card border-2 border-destructive rounded-xl px-6 py-4 shadow-node min-w-[140px] text-center">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-destructive !w-3 !h-3 !border-2 !border-card"
      />
      <div className="flex items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center">
          <Square className="w-4 h-4 text-destructive-foreground" />
        </div>
        <span className="font-semibold text-foreground">End</span>
      </div>
    </div>
  );
}
