import { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConditionRule, ConditionNodeData } from '@/types/automation';
import { Plus, Trash2, GitBranch, AlertCircle } from 'lucide-react';

interface ConditionBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ConditionNodeData;
  onSave: (data: ConditionNodeData) => void;
}

export function ConditionBuilderModal({
  open,
  onOpenChange,
  initialData,
  onSave,
}: ConditionBuilderModalProps) {
  const [rules, setRules] = useState<ConditionRule[]>(
    initialData?.rules || [
      {
        id: '1',
        field: 'subject',
        operator: 'includes',
        value: '',
        joinType: 'AND',
      },
    ]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fieldOptions = [
    { value: 'subject', label: 'Subject' },
    { value: 'from', label: 'From' },
    { value: 'to', label: 'To' },
    { value: 'body', label: 'Body' },
    { value: 'cc', label: 'CC' },
    { value: 'bcc', label: 'BCC' },
  ];

  const operatorOptions = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'includes', label: 'Includes' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
  ];

  const addRule = (joinType: 'AND' | 'OR') => {
    const newRule: ConditionRule = {
      id: Date.now().toString(),
      field: 'subject',
      operator: 'includes',
      value: '',
      joinType,
    };
    setRules([...rules, newRule]);
  };

  const removeRule = (id: string) => {
    if (rules.length > 1) {
      setRules(rules.filter((rule) => rule.id !== id));
    }
  };

  const updateRule = (id: string, updates: Partial<ConditionRule>) => {
    setRules(
      rules.map((rule) =>
        rule.id === id ? { ...rule, ...updates } : rule
      )
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    rules.forEach((rule) => {
      if (!rule.value.trim()) {
        newErrors[`value-${rule.id}`] = 'Value is required';
        isValid = false;
      }
      if (rule.value.length < 2) {
        newErrors[`value-${rule.id}`] = 'Value must be at least 2 characters';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (!validate()) return;

    onSave({
      type: 'condition',
      rules,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto border-0 shadow-2xl shadow-warning/20">
        <div className="absolute inset-0 bg-gradient-warm opacity-5 rounded-lg"></div>
        <DialogHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-warm flex items-center justify-center shadow-glow">
              <GitBranch className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Condition Builder</DialogTitle>
              <DialogDescription>
                Create rules to split your flow based on email conditions
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 relative">
          <Card className="border-warning/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center">
                  <span className="text-warning font-bold">IF</span>
                </div>
                Condition Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rules.map((rule, index) => (
                <div
                  key={rule.id}
                  className="flex items-center gap-2 p-3 bg-background/50 rounded-lg border border-border/30 hover:border-warning/50 transition-colors"
                >
                  {index === 0 ? (
                    <div className="w-16 text-center">
                      <span className="text-sm font-medium text-muted-foreground">WHERE</span>
                    </div>
                  ) : (
                    <Select
                      value={rule.joinType}
                      onValueChange={(value: 'AND' | 'OR') =>
                        updateRule(rule.id, { joinType: value })
                      }
                    >
                      <SelectTrigger className="w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  <Select
                    value={rule.field}
                    onValueChange={(value) => updateRule(rule.id, { field: value })}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={rule.operator}
                    onValueChange={(value: any) =>
                      updateRule(rule.id, { operator: value })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operatorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex-1">
                    <Input
                      value={rule.value}
                      onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                      placeholder="Enter value..."
                      className={`border-warning/20 focus:border-warning/50 ${
                        errors[`value-${rule.id}`] ? 'border-destructive' : ''
                      }`}
                    />
                    {errors[`value-${rule.id}`] && (
                      <div className="flex items-center gap-1.5 mt-1 text-destructive text-xs">
                        <AlertCircle className="w-3 h-3" />
                        {errors[`value-${rule.id}`]}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeRule(rule.id)}
                    disabled={rules.length === 1}
                    className="border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40 text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => addRule('AND')}
                  className="border-success/20 hover:bg-success/10 hover:border-success/40 text-success"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  AND
                </Button>
                <Button
                  variant="outline"
                  onClick={() => addRule('OR')}
                  className="border-warning/20 hover:bg-warning/10 hover:border-warning/40 text-warning"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  OR
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                TRUE Path
              </div>
              <p className="text-xs text-muted-foreground mt-1">Follow when conditions are met</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-destructive rounded-full"></div>
                FALSE Path
              </div>
              <p className="text-xs text-muted-foreground mt-1">Follow when conditions are not met</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-muted/20 hover:bg-muted/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-warm hover:shadow-glow min-w-[120px]"
            >
              Save Condition
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}