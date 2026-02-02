import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitBranch, Plus, Settings } from 'lucide-react';
import { ConditionNodeData } from '@/types/automation';

export const ConditionNode = memo(({ data, selected }: NodeProps) => {
  const hasRules = (data as ConditionNodeData).rules && (data as ConditionNodeData).rules.length > 0;
  const rules = (data as ConditionNodeData).rules || [];

  return (
    <div className="relative">
      <Card 
        className={`min-w-[280px] border-2 ${
          selected ? 'border-primary shadow-glow' : 'border-warning/30 shadow-lg shadow-warning/10'
        } bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 transition-all duration-300 hover:shadow-xl hover:shadow-warning/20`}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-warm flex items-center justify-center shadow-md">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">Condition</h3>
              <p className="text-xs text-muted-foreground">
                {hasRules ? `${rules.length} rule${rules.length > 1 ? 's' : ''}` : 'No rules'}
              </p>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0 hover:bg-warning/20"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

            {!hasRules ? (
              <div className="text-center py-4 border-2 border-dashed border-warning/30 rounded-lg bg-warning/5">
                <Plus className="w-8 h-8 mx-auto mb-2 text-warning/50" />
                <p className="text-sm text-muted-foreground">Add rules to split flow</p>
              </div>
            ) : (
              <div className="space-y-2">
                {rules.slice(0, 2).map((rule, index) => (
                <div key={rule.id} className="text-xs p-2 bg-background/50 rounded border border-border/30">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-warning">{index > 0 ? rule.joinType : 'WHERE'}</span>
                    <span className="font-medium">{rule.field}</span>
                    <span className="text-muted-foreground">{rule.operator.replace('_', ' ')}</span>
                    <span className="font-mono text-primary">"{rule.value}"</span>
                  </div>
                </div>
              ))}
              {rules.length > 2 && (
                <p className="text-xs text-muted-foreground text-center">
                  ...and {rules.length - 2} more rules
                </p>
              )}
            </div>
          )}

          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-success shadow-sm"></div>
              <span className="text-xs font-medium text-success">TRUE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-destructive">FALSE</span>
              <div className="w-3 h-3 rounded-full bg-gradient-destructive shadow-sm"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-warning !border-2 !border-white !shadow-lg"
      />

      {/* TRUE Output Handle - Left */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="w-3 h-3 !bg-success !border-2 !border-white !shadow-lg"
        style={{ left: '25%' }}
      />

      {/* FALSE Output Handle - Right */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="w-3 h-3 !bg-destructive !border-2 !border-white !shadow-lg"
        style={{ left: '75%' }}
      />

      {/* Branch Indicators */}
      <div className="absolute -bottom-8 left-1/4 transform -translate-x-1/2">
        <div className="text-xs font-bold text-success bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded-full border border-success/30">
          TRUE
        </div>
      </div>
      <div className="absolute -bottom-8 left-3/4 transform -translate-x-1/2">
        <div className="text-xs font-bold text-destructive bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded-full border border-destructive/30">
          FALSE
        </div>
      </div>
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';