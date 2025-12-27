import React, { useState } from 'react';
import { CompensationRecord, AllowanceFrequency, CompensationEntryType, PayType, OvertimeFrequency } from '../../types';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Plus, Trash2, Calculator } from 'lucide-react';

interface YearlyWageFormProps {
  record?: CompensationRecord | null;
  onSave: (record: CompensationRecord) => void;
  onCancel: () => void;
}

export function YearlyWageForm({ record, onSave, onCancel }: YearlyWageFormProps) {
  const [financialYear, setFinancialYear] = useState(() => {
    const now = new Date();
    const year = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    return `${year}-${year + 1}`;
  });
  
  const [baseSalary, setBaseSalary] = useState(record?.base_rate || 0);
  const [taxWithheld, setTaxWithheld] = useState(record?.tax_withheld || 0);
  const [overtimeHours, setOvertimeHours] = useState(record?.overtime.annual_hours || 0);
  const [overtimeRate, setOvertimeRate] = useState(record?.overtime.rate_multiplier || 1.5);
  const [hourlyRate, setHourlyRate] = useState(0); // For calculating overtime
  
  const [allowances, setAllowances] = useState(record?.allowances || []);
  const [superRate, setSuperRate] = useState(record?.super_contributions.contribution_rate || 11);
  
  const [newAllowance, setNewAllowance] = useState({
    name: '',
    amount: 0,
    frequency: AllowanceFrequency.Annually,
    taxable: true,
  });

  // Calculate hourly rate from base salary (assuming 38-hour week)
  React.useEffect(() => {
    if (baseSalary > 0) {
      setHourlyRate(baseSalary / (38 * 52));
    }
  }, [baseSalary]);

  const calculateAnnualEarnings = () => {
    const overtimeEarnings = overtimeHours * overtimeRate * hourlyRate;
    const allowancesTotal = allowances.reduce((sum, allowance) => {
      const multiplier = {
        'Weekly': 52,
        'Fortnightly': 26,
        'Monthly': 12,
        'Annually': 1,
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
    
    // Calculate gross income first for validation
    const overtimeEarnings = overtimeHours * overtimeRate * hourlyRate;
    const allowancesTotal = allowances.reduce((sum, allowance) => {
      const multiplier = {
        'Weekly': 52,
        'Fortnightly': 26,
        'Monthly': 12,
        'Annually': 1,
      }[allowance.frequency] || 1;
      return sum + (allowance.amount * multiplier);
    }, 0);
    const grossIncome = baseSalary + overtimeEarnings + allowancesTotal;
    
    // Basic validation
    if (baseSalary <= 0) {
      alert('Please enter a valid base salary');
      return;
    }
    
    if (taxWithheld < 0) {
      alert('Tax withheld cannot be negative');
      return;
    }
    
    if (taxWithheld > grossIncome) {
      alert('Tax withheld cannot exceed total gross income (base + overtime + allowances)');
      return;
    }
    
    if (overtimeHours < 0) {
      alert('Overtime hours cannot be negative');
      return;
    }
    
    if (superRate < 11.5 || superRate > 20) {
      alert('Super contribution rate should be between 11.5% (current minimum) and 20%');
      return;
    }
    
    // Parse financial year to get effective date (start of financial year: July 1)
    const [startYear] = financialYear.split('-').map(Number);
    const effectiveDate = new Date(startYear, 6, 1); // July 1st
    
    const compensationRecord: CompensationRecord = {
      id: record?.id,
      position_id: 0, // Will be set by parent
      entry_type: CompensationEntryType.Exact,
      pay_type: PayType.Salary,
      base_rate: baseSalary,
      standard_weekly_hours: 38,
      overtime: {
        frequency: overtimeHours > 0 ? OvertimeFrequency.Frequent : OvertimeFrequency.None,
        rate_multiplier: overtimeRate,
        average_hours_per_week: overtimeHours / 52,
        annual_hours: overtimeHours,
      },
      allowances: allowances,
      bonuses: [], // Not included in simplified form
      super_contributions: {
        contribution_rate: superRate,
        additional_contributions: 0,
        salary_sacrifice: 0,
      },
      tax_withheld: taxWithheld,
      effective_date: effectiveDate,
      confidence_score: 95, // High confidence for yearly entry
      notes: `Financial Year ${financialYear}`,
      created_at: new Date(),
    };

    onSave(compensationRecord);
  };

  const earnings = calculateAnnualEarnings();
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
      {/* Financial Year */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Yearly Wage Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Financial Year</Label>
            <Select value={financialYear} onValueChange={setFinancialYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <SelectItem key={year} value={`${year}-${year + 1}`}>
                      {year}-{year + 1}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Base Salary (per year)</Label>
            <Input
              type="number"
              value={baseSalary}
              onChange={(e) => setBaseSalary(Number(e.target.value))}
              min={0}
              step={1000}
              placeholder="e.g., 120000"
            />
            <p className="text-sm text-gray-500 mt-1">
              Your annual base salary before overtime and allowances
            </p>
          </div>

          <div>
            <Label>Tax Withheld (per year)</Label>
            <Input
              type="number"
              value={taxWithheld}
              onChange={(e) => setTaxWithheld(Number(e.target.value))}
              min={0}
              step={100}
              placeholder="e.g., 35000"
            />
            <p className="text-sm text-gray-500 mt-1">
              Total tax deducted from your payslips for the year
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Overtime */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overtime Income</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Total Overtime Hours (per year)</Label>
              <Input
                type="number"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(Number(e.target.value))}
                min={0}
                step={10}
                placeholder="e.g., 200"
              />
            </div>
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
          </div>
          <p className="text-sm text-gray-500">
            Estimated overtime earnings: {formatCurrency(earnings.overtimeEarnings)}
            {hourlyRate > 0 && ` (based on ${formatCurrency(hourlyRate)}/hour)`}
          </p>
        </CardContent>
      </Card>

      {/* Allowances */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Allowances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {allowances.map((allowance, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <span className="font-medium">{allowance.name}</span>
                <span className="ml-2 text-sm text-gray-600">
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

      {/* Superannuation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Superannuation</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Employer Super Contribution Rate (%)</Label>
            <Input
              type="number"
              value={superRate}
              onChange={(e) => setSuperRate(Number(e.target.value))}
              min={0}
              max={20}
              step={0.5}
            />
            <p className="text-sm text-gray-500 mt-1">
              Current minimum is 11% (as of 2023/24)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Yearly Summary</CardTitle>
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

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Yearly Wage Data
        </Button>
      </div>
    </form>
  );
}
