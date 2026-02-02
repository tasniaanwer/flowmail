import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

export function StartNode() {
  return (
    <div className="bg-card border-2 border-success rounded-xl px-6 py-4 shadow-node min-w-[140px] text-center">
      <div className="flex items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
          <Play className="w-4 h-4 text-success-foreground" />
        </div>
        <span className="font-semibold text-foreground">Start</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-success !w-3 !h-3 !border-2 !border-card"
      />
    </div>
  );
}
