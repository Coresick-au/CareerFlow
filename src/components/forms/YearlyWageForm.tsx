import React, { useState, useEffect } from 'react';
import { CompensationRecord, AllowanceFrequency, CompensationEntryType, PayType, OvertimeFrequency } from '../../types';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Plus, Trash2, Calculator } from 'lucide-react';

interface YearlyWageFormProps {
  initialData?: CompensationRecord | null;
  onSave: (record: CompensationRecord) => void;
  onCancel: () => void;
  onDelete?: (id: number) => void;
  isSaving?: boolean;
}

export function YearlyWageForm({ initialData: record, onSave, onCancel, onDelete, isSaving }: YearlyWageFormProps) {
  const [financialYear, setFinancialYear] = useState(() => {
    // If we have an effective date, use that to guess FY
    if (record?.effective_date) {
      const date = new Date(record.effective_date);
      const year = date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;
      return `${year}-${year + 1}`;
    }
    const now = new Date();
    const year = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    return `${year}-${year + 1}`;
  });

  const [baseSalary, setBaseSalary] = useState(record?.base_rate || 0);
  const [taxWithheld, setTaxWithheld] = useState(record?.tax_withheld || 0);
  const [overtimeHours, setOvertimeHours] = useState(record?.overtime?.annual_hours || 0);
  const [overtimeRate, setOvertimeRate] = useState(record?.overtime?.rate_multiplier || 1.5);
  const [hourlyRate, setHourlyRate] = useState(0);

  const [allowances, setAllowances] = useState(record?.allowances || []);
  const [superRate, setSuperRate] = useState(record?.super_contributions?.contribution_rate || 11);

  const [newAllowance, setNewAllowance] = useState({
    name: '',
    amount: 0,
    frequency: AllowanceFrequency.Annually,
    taxable: true,
  });

  // Calculate hourly rate from base salary (assuming 38-hour week)
  useEffect(() => {
    if (baseSalary > 0) {
      setHourlyRate(baseSalary / (38 * 52));
    }
  }, [baseSalary]);

  const calculateAnnualEarnings = () => {
    const overtimeEarnings = overtimeHours * overtimeRate * hourlyRate;
    const allowancesTotal = allowances.reduce((sum, allowance) => {
      const multiplier = {
        [AllowanceFrequency.Weekly]: 52,
        [AllowanceFrequency.Fortnightly]: 26,
        [AllowanceFrequency.Monthly]: 12,
        [AllowanceFrequency.Annually]: 1,
      }[allowance.frequency] || 1;
      return sum + (allowance.amount * multiplier);
    }, 0);

    const grossIncome = baseSalary + overtimeEarnings + allowancesTotal;
    const netIncome = grossIncome - taxWithheld;
    const superContributions = grossIncome * (superRate / 100);

    return {
      baseSalary,
      overtimeEarnings,
      allowancesTotal,
      grossIncome,
      taxWithheld,
      netIncome,
      superContributions,
      totalPackage: grossIncome + superContributions,
    };
  };

  const handleAddAllowance = () => {
    if (newAllowance.name && newAllowance.amount > 0) {
      setAllowances([...allowances, { ...newAllowance }]);
      setNewAllowance({
        name: '',
        amount: 0,
        frequency: AllowanceFrequency.Annually,
        taxable: true,
      });
    }
  };

  const handleRemoveAllowance = (index: number) => {
    setAllowances(allowances.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const compensationRecord: CompensationRecord = {
      id: record?.id,
      position_id: 0,
      entry_type: CompensationEntryType.YearlySummary,
      pay_type: PayType.Annual,
      base_rate: baseSalary,
      standard_weekly_hours: 38,
      overtime: {
        frequency: overtimeHours > 0 ? OvertimeFrequency.Occasional : OvertimeFrequency.None,
        rate_multiplier: overtimeRate,
        average_hours_per_week: 0,
        annual_hours: overtimeHours,
      },
      allowances: allowances,
      bonuses: [],
      super_contributions: {
        contribution_rate: superRate,
        additional_contributions: 0,
        salary_sacrifice: 0,
      },
      payslip_frequency: undefined,
      effective_date: new Date(`${financialYear.split('-')[1]}-06-30`),
      confidence_score: 1.0,
      notes: `Yearly summary for ${financialYear}`,
      created_at: record?.created_at || new Date(),
    };

    onSave(compensationRecord);
  };

  const earnings = calculateAnnualEarnings();
  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return '$0';
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-4">
        <Label className="w-1/3">Financial Year</Label>
        <Select value={financialYear} onValueChange={setFinancialYear}>
          <SelectTrigger className="w-2/3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 15 }).map((_, i) => {
              const year = new Date().getFullYear() - 10 + i;
              const fy = `${year}-${year + 1}`;
              return (
                <SelectItem key={fy} value={fy}>
                  {fy}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Income</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Base Gross Salary</Label>
              <Input
                type="number"
                value={baseSalary || ''}
                onChange={(e) => setBaseSalary(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Tax Withheld</Label>
              <Input
                type="number"
                value={taxWithheld || ''}
                onChange={(e) => setTaxWithheld(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Overtime & Super</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Total Overtime Hours</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  type="number"
                  value={overtimeHours || ''}
                  onChange={(e) => setOvertimeHours(Number(e.target.value))}
                  placeholder="Hours"
                />
                <div className="w-24">
                  <Select
                    value={overtimeRate.toString()}
                    onValueChange={(v) => setOvertimeRate(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.5">1.5x</SelectItem>
                      <SelectItem value="2.0">2.0x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div>
              <Label>Super Rate (%)</Label>
              <Input
                type="number"
                value={superRate}
                onChange={(e) => setSuperRate(Number(e.target.value))}
                step={0.5}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex justify-between items-center">
            <span>Allowances</span>
            <span className="text-xs text-muted-foreground font-normal">Travel, Uniform, Tools, etc.</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allowances.map((allowance, index) => (
              <div key={index} className="flex justify-between items-center bg-secondary/50 p-2 rounded text-sm">
                <div>
                  <span className="font-medium">{allowance.name}</span>
                  <span className="text-muted-foreground ml-2">
                    ({formatCurrency(allowance.amount)} / {allowance.frequency})
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAllowance(index)}
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ))}

            <div className="flex gap-2 items-end">
              <div className="grid gap-1 flex-1">
                <Label className="text-xs">Name</Label>
                <Input
                  value={newAllowance.name}
                  onChange={(e) => setNewAllowance({ ...newAllowance, name: e.target.value })}
                  placeholder="e.g. Travel"
                  className="h-8"
                />
              </div>
              <div className="grid gap-1 w-24">
                <Label className="text-xs">Amount</Label>
                <Input
                  type="number"
                  value={newAllowance.amount || ''}
                  onChange={(e) => setNewAllowance({ ...newAllowance, amount: Number(e.target.value) })}
                  className="h-8"
                />
              </div>
              <div className="grid gap-1 w-32">
                <Label className="text-xs">Frequency</Label>
                <Select
                  value={newAllowance.frequency}
                  onValueChange={(v: AllowanceFrequency) => setNewAllowance({ ...newAllowance, frequency: v })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AllowanceFrequency.Weekly}>Weekly</SelectItem>
                    <SelectItem value={AllowanceFrequency.Fortnightly}>Fortnightly</SelectItem>
                    <SelectItem value={AllowanceFrequency.Monthly}>Monthly</SelectItem>
                    <SelectItem value={AllowanceFrequency.Annually}>Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" size="sm" onClick={handleAddAllowance} className="h-8">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Estimated Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Base Salary:</span>
              <span className="font-medium">{formatCurrency(earnings.baseSalary)}</span>
            </div>
            <div className="flex justify-between">
              <span>Overtime:</span>
              <span className="font-medium">{formatCurrency(earnings.overtimeEarnings)}</span>
            </div>
            <div className="flex justify-between">
              <span>Allowances:</span>
              <span className="font-medium">{formatCurrency(earnings.allowancesTotal)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Gross Income:</span>
              <span>{formatCurrency(earnings.grossIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax Withheld:</span>
              <span className="font-medium">-{formatCurrency(earnings.taxWithheld)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Net Income:</span>
              <span>{formatCurrency(earnings.netIncome)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Super ({superRate}%):</span>
              <span>{formatCurrency(earnings.superContributions)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-green-700 pt-2 border-t">
              <span>Total Package:</span>
              <span>{formatCurrency(earnings.totalPackage)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between space-x-2 pt-4">
        {record?.id ? (
          <Button
            type="button"
            variant="destructive"
            className="mr-auto"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this yearly record?')) {
                onDelete?.(record.id!);
              }
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        ) : <div />}

        <div className="flex space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Yearly Wage Data'}
          </Button>
        </div>
      </div>
    </form>
  );
}
