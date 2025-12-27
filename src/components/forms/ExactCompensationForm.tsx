import React, { useState } from 'react';
import { CompensationRecord, PayType, AllowanceFrequency, PayslipFrequency, CompensationEntryType, OvertimeFrequency } from '../../types';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Plus, Trash2 } from 'lucide-react';

interface ExactCompensationFormProps {
  initialData?: CompensationRecord | null;
  onSave: (record: CompensationRecord) => void;
  onCancel: () => void;
  onDelete?: (id: number) => void;
}

export function ExactCompensationForm({ initialData: record, onSave, onCancel, onDelete }: ExactCompensationFormProps) {
  const [payType, setPayType] = useState<PayType>(record?.pay_type || PayType.Salary);
  const [baseRate, setBaseRate] = useState(record?.base_rate || 0);
  const [standardHours, setStandardHours] = useState(record?.standard_weekly_hours || 38);
  const [overtimeRate, setOvertimeRate] = useState(record?.overtime.rate_multiplier || 1.5);
  const [overtimeHours, setOvertimeHours] = useState(record?.overtime.average_hours_per_week || 0);
  const [annualOvertimeHours, setAnnualOvertimeHours] = useState<number | null>(record?.overtime.annual_hours || null);
  const [payslipFrequency, setPayslipFrequency] = useState<PayslipFrequency>(
    record?.payslip_frequency || PayslipFrequency.Weekly
  );
  const [superRate, setSuperRate] = useState(record?.super_contributions.contribution_rate || 11);
  const [superAdditional, setSuperAdditional] = useState(record?.super_contributions.additional_contributions || 0);
  const [salarySacrifice, setSalarySacrifice] = useState(record?.super_contributions.salary_sacrifice || 0);
  const [effectiveDate, setEffectiveDate] = useState(
    record?.effective_date ? new Date(record.effective_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [allowances, setAllowances] = useState(record?.allowances || []);
  const [bonuses, setBonuses] = useState(record?.bonuses || []);
  const [notes, setNotes] = useState(record?.notes || '');

  const [newAllowance, setNewAllowance] = useState({
    name: '',
    amount: 0,
    frequency: AllowanceFrequency.Weekly,
    taxable: true,
  });

  const [newBonus, setNewBonus] = useState({
    name: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    taxable: true,
  });

  const calculateExactAnnual = () => {
    const baseAnnual = payType === 'Salary'
      ? baseRate
      : baseRate * standardHours * 52;

    const overtimeAnnual = annualOvertimeHours
      ? annualOvertimeHours * overtimeRate * baseRate
      : overtimeHours * overtimeRate * baseRate * 52;

    const allowancesAnnual = allowances.reduce((sum, allowance) => {
      const multiplier = {
        'Weekly': 52,
        'Fortnightly': 26,
        'Monthly': 12,
        'Annually': 1,
      }[allowance.frequency] || 1;
      return sum + (allowance.amount * multiplier);
    }, 0);

    const bonusesAnnual = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);

    return {
      base: baseAnnual,
      overtime: overtimeAnnual,
      allowances: allowancesAnnual,
      bonuses: bonusesAnnual,
      total: baseAnnual + overtimeAnnual + allowancesAnnual + bonusesAnnual,
    };
  };

  const handleAddAllowance = () => {
    if (newAllowance.name && newAllowance.amount > 0) {
      setAllowances([...allowances, { ...newAllowance }]);
      setNewAllowance({
        name: '',
        amount: 0,
        frequency: AllowanceFrequency.Weekly,
        taxable: true,
      });
    }
  };

  const handleRemoveAllowance = (index: number) => {
    setAllowances(allowances.filter((_, i) => i !== index));
  };

  const handleAddBonus = () => {
    if (newBonus.name && newBonus.amount > 0) {
      setBonuses([...bonuses, {
        ...newBonus,
        date_awarded: new Date(newBonus.date),
        name: newBonus.name,
        amount: newBonus.amount,
        taxable: newBonus.taxable,
      }]);
      setNewBonus({
        name: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        taxable: true,
      });
    }
  };

  const handleRemoveBonus = (index: number) => {
    setBonuses(bonuses.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const earnings = calculateExactAnnual();

    const compensationRecord: CompensationRecord = {
      id: record?.id,
      position_id: 0, // Will be set by parent
      entry_type: CompensationEntryType.Exact,
      pay_type: payType,
      base_rate: baseRate,
      standard_weekly_hours: standardHours,
      overtime: {
        frequency: overtimeHours > 0 ? OvertimeFrequency.Frequent : OvertimeFrequency.None,
        rate_multiplier: overtimeRate,
        average_hours_per_week: overtimeHours,
        annual_hours: annualOvertimeHours || undefined,
      },
      allowances: allowances,
      bonuses: bonuses,
      super_contributions: {
        contribution_rate: superRate,
        additional_contributions: superAdditional,
        salary_sacrifice: salarySacrifice,
      },
      payslip_frequency: payslipFrequency,
      effective_date: new Date(effectiveDate),
      confidence_score: 100, // Exact entries have 100% confidence
      notes: notes,
      created_at: new Date(),
    };

    onSave(compensationRecord);
  };

  const earnings = calculateExactAnnual();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Precision Indicator */}
      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <span className="text-sm font-medium text-green-800 dark:text-green-300">Payslip-Level Precision</span>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">100% Confidence</Badge>
      </div>

      {/* Pay Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Exact Pay Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Pay Type</Label>
              <Select value={payType} onValueChange={(value: PayType) => setPayType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Salary">Annual Salary</SelectItem>
                  <SelectItem value="Hourly">Hourly Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Payslip Frequency</Label>
              <Select value={payslipFrequency} onValueChange={(value: PayslipFrequency) => setPayslipFrequency(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Fortnightly">Fortnightly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>
              Base {payType === 'Salary' ? 'Salary' : 'Hourly Rate'} (exact)
            </Label>
            <Input
              type="number"
              value={baseRate}
              onChange={(e) => setBaseRate(Number(e.target.value))}
              min={0}
              step={0.01}
              placeholder="Enter exact amount from payslip"
            />
          </div>

          {payType === 'Hourly' && (
            <div>
              <Label>Standard Weekly Hours (from contract)</Label>
              <Input
                type="number"
                value={standardHours}
                onChange={(e) => setStandardHours(Number(e.target.value))}
                min={0}
                max={80}
                step={0.5}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overtime */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overtime Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Overtime Rate Multiplier</Label>
              <Select value={overtimeRate.toString()} onValueChange={(value) => setOvertimeRate(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.5">1.5x (Time and a half)</SelectItem>
                  <SelectItem value="2.0">2.0x (Double time)</SelectItem>
                  <SelectItem value="2.5">2.5x (Double time and a half)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Calculation Method</Label>
              <Select value={annualOvertimeHours ? 'annual' : 'weekly'} onValueChange={(value) => {
                if (value === 'annual') {
                  setAnnualOvertimeHours(overtimeHours * 52);
                } else {
                  setAnnualOvertimeHours(null);
                }
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly Average</SelectItem>
                  <SelectItem value="annual">Annual Total</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {annualOvertimeHours ? (
            <div>
              <Label>Total Annual Overtime Hours</Label>
              <Input
                type="number"
                value={annualOvertimeHours}
                onChange={(e) => setAnnualOvertimeHours(Number(e.target.value))}
                min={0}
                step={0.5}
              />
            </div>
          ) : (
            <div>
              <Label>Average Overtime Hours Per Week</Label>
              <Input
                type="number"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(Number(e.target.value))}
                min={0}
                step={0.5}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allowances */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Allowances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {allowances.map((allowance, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded">
              <div>
                <span className="font-medium text-foreground">{allowance.name}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  {formatCurrency(allowance.amount)}/{allowance.frequency}
                  {allowance.taxable && ' (taxable)'}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveAllowance(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Allowance name"
              value={newAllowance.name}
              onChange={(e) => setNewAllowance({ ...newAllowance, name: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Amount"
              value={newAllowance.amount || ''}
              onChange={(e) => setNewAllowance({ ...newAllowance, amount: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Select value={newAllowance.frequency} onValueChange={(value: AllowanceFrequency) =>
              setNewAllowance({ ...newAllowance, frequency: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Fortnightly">Fortnightly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Annually">Annually</SelectItem>
              </SelectContent>
            </Select>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newAllowance.taxable}
                onChange={(e) => setNewAllowance({ ...newAllowance, taxable: e.target.checked })}
              />
              <span className="text-sm">Taxable</span>
            </label>

            <Button type="button" onClick={handleAddAllowance}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bonuses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bonuses & Commissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bonuses.map((bonus, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded">
              <div>
                <span className="font-medium text-foreground">{bonus.name}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  {formatCurrency(bonus.amount)} on {bonus.date_awarded.toLocaleDateString()}
                  {bonus.taxable && ' (taxable)'}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveBonus(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Bonus name"
              value={newBonus.name}
              onChange={(e) => setNewBonus({ ...newBonus, name: e.target.value })}
            />
            <Input
              type="date"
              value={newBonus.date}
              onChange={(e) => setNewBonus({ ...newBonus, date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              placeholder="Amount"
              value={newBonus.amount || ''}
              onChange={(e) => setNewBonus({ ...newBonus, amount: Number(e.target.value) })}
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newBonus.taxable}
                onChange={(e) => setNewBonus({ ...newBonus, taxable: e.target.checked })}
              />
              <span className="text-sm">Taxable</span>
            </label>
            <Button type="button" onClick={handleAddBonus}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Superannuation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Superannuation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Employer Contribution Rate (%)</Label>
            <Input
              type="number"
              value={superRate}
              onChange={(e) => setSuperRate(Number(e.target.value))}
              min={0}
              max={20}
              step={0.1}
            />
          </div>

          <div>
            <Label>Additional Employer Contributions ($/year)</Label>
            <Input
              type="number"
              value={superAdditional}
              onChange={(e) => setSuperAdditional(Number(e.target.value))}
              min={0}
              step={100}
            />
          </div>

          <div>
            <Label>Salary Sacrifice ($/year)</Label>
            <Input
              type="number"
              value={salarySacrifice}
              onChange={(e) => setSalarySacrifice(Number(e.target.value))}
              min={0}
              step={100}
            />
          </div>
        </CardContent>
      </Card>

      {/* Effective Date */}
      <div>
        <Label>Effective Date</Label>
        <Input
          type="date"
          value={effectiveDate}
          onChange={(e) => setEffectiveDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Notes */}
      <div>
        <Label>Notes (optional)</Label>
        <Input
          placeholder="e.g., Reference payslip filename"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Summary */}
      <Card className="bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/20">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Exact Annual Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base Pay:</span>
              <span className="font-medium text-foreground">{formatCurrency(earnings.base)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Overtime:</span>
              <span className="font-medium text-foreground">{formatCurrency(earnings.overtime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Allowances:</span>
              <span className="font-medium text-foreground">{formatCurrency(earnings.allowances)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bonuses:</span>
              <span className="font-medium text-foreground">{formatCurrency(earnings.bonuses)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span className="text-foreground">Total Annual:</span>
              <span className="text-foreground">{formatCurrency(earnings.total)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>With Super ({superRate}%):</span>
              <span>{formatCurrency(earnings.total * (1 + superRate / 100))}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Effective Hourly Rate:</span>
              <span>
                {formatCurrency(earnings.total / (standardHours * 52))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between space-x-2">
        {record?.id && (
          <Button
            type="button"
            variant="destructive"
            className="mr-auto"
            onClick={() => {
              if (confirm('Are you sure you want to delete this compensation record?')) {
                onDelete?.(record.id!);
              }
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        )}
        <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Save Exact Details
          </Button>
        </div>
      </div>
    </form>
  );
}
