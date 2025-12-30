import React, { useState } from 'react';
import { YearlyIncomeEntry } from '../../types';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Trash2, Calculator, Plus, X } from 'lucide-react';
import { Allowance, AllowanceFrequency } from '../../types';

interface YearlyWageFormProps {
  initialData?: YearlyIncomeEntry | null;
  onSave: (entry: YearlyIncomeEntry) => void;
  onCancel: () => void;
  onDelete?: (id: number) => void;
  isSaving?: boolean;
}

export function YearlyWageForm({ initialData, onSave, onCancel, onDelete, isSaving }: YearlyWageFormProps) {
  const [financialYear, setFinancialYear] = useState(() => {
    if (initialData?.financial_year) {
      return initialData.financial_year;
    }
    const now = new Date();
    const year = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    return `${year}-${year + 1}`;
  });

  const [grossIncome, setGrossIncome] = useState(initialData?.gross_income || 0);
  const [taxWithheld, setTaxWithheld] = useState(initialData?.tax_withheld || 0);
  const [reportableSuper, setReportableSuper] = useState(initialData?.reportable_super || 0);
  const [reportableFringeBenefits, setReportableFringeBenefits] = useState(initialData?.reportable_fringe_benefits || 0);
  const [source, setSource] = useState<'ATO' | 'Manual'>(initialData?.source || 'Manual');
  const [notes, setNotes] = useState(initialData?.notes || '');

  // Allowances state
  const [allowances, setAllowances] = useState<Allowance[]>(initialData?.allowances || []);
  const [newAllowanceName, setNewAllowanceName] = useState('');
  const [newAllowanceAmount, setNewAllowanceAmount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const yearlyEntry: YearlyIncomeEntry = {
      id: initialData?.id,
      position_id: initialData?.position_id,
      financial_year: financialYear,
      gross_income: grossIncome,
      tax_withheld: taxWithheld,
      reportable_super: reportableSuper,
      reportable_fringe_benefits: reportableFringeBenefits || 0,
      allowances: allowances,
      source: source,
      notes: notes || undefined,
      created_at: initialData?.created_at || new Date(),
    };

    onSave(yearlyEntry);
  };

  const allowancesTotal = allowances.reduce((sum, a) => sum + a.amount, 0);
  // Gross income usually INCLUDES allowances in ATO summaries, but for manual entry it might be separate.
  // However, the "Gross Income" field is separate.
  // Net Income calculation:
  const netIncome = grossIncome - taxWithheld;
  const totalPackage = grossIncome + reportableSuper + reportableFringeBenefits + allowancesTotal;

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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Financial Year</Label>
          <Select value={financialYear} onValueChange={setFinancialYear}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 15 }).map((_, i) => {
                const year = new Date().getFullYear() - 10 + i;
                const fy = `${year}-${year + 1}`;
                return (
                  <SelectItem key={fy} value={fy}>
                    FY {fy}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Data Source</Label>
          <Select value={source} onValueChange={(v: 'ATO' | 'Manual') => setSource(v)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ATO">ATO Payment Summary</SelectItem>
              <SelectItem value="Manual">Manual Entry</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Income Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Gross Income</Label>
            <Input
              type="number"
              value={grossIncome || ''}
              onChange={(e) => setGrossIncome(Number(e.target.value))}
              className="mt-1"
              placeholder="Total gross income for the year"
            />
          </div>

          <div>
            <Label>Tax Withheld</Label>
            <Input
              type="number"
              value={taxWithheld || ''}
              onChange={(e) => setTaxWithheld(Number(e.target.value))}
              className="mt-1"
              placeholder="Total tax withheld"
            />
          </div>

          <div>
            <Label>Reportable Superannuation</Label>
            <Input
              type="number"
              value={reportableSuper || ''}
              onChange={(e) => setReportableSuper(Number(e.target.value))}
              className="mt-1"
              placeholder="Employer super contributions"
            />
          </div>

          <div>
            <Label>Reportable Fringe Benefits (Optional)</Label>
            <Input
              type="number"
              value={reportableFringeBenefits || ''}
              onChange={(e) => setReportableFringeBenefits(Number(e.target.value))}
              className="mt-1"
              placeholder="Car, phone, etc."
            />
          </div>

          {/* Allowances Section */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex justify-between items-center">
              <Label>Allowances & Other Income</Label>
              <div className="text-xs text-muted-foreground">
                Total: {formatCurrency(allowancesTotal)}
              </div>
            </div>

            {allowances.map((allowance, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={allowance.name}
                  readOnly
                  className="flex-1 bg-muted"
                />
                <div className="w-24 px-3 py-2 bg-muted rounded text-sm text-right border">
                  {formatCurrency(allowance.amount)}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAllowances(allowances.filter((_, i) => i !== index))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="flex gap-2 items-end">
              <div className="grid gap-1 flex-1">
                <Input
                  placeholder="Description (e.g. Car, Laundry)"
                  value={newAllowanceName}
                  onChange={(e) => setNewAllowanceName(e.target.value)}
                />
              </div>
              <div className="grid gap-1 w-32">
                <Input
                  type="number"
                  value={newAllowanceAmount || ''}
                  onChange={(e) => setNewAllowanceAmount(Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (newAllowanceName && newAllowanceAmount > 0) {
                    setAllowances([
                      ...allowances,
                      {
                        name: newAllowanceName,
                        amount: newAllowanceAmount,
                        frequency: AllowanceFrequency.Annually,
                        taxable: true
                      }
                    ]);
                    setNewAllowanceName('');
                    setNewAllowanceAmount(0);
                  }
                }}
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          <div>
            <Label>Notes (Optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
              placeholder="Additional notes"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Gross Income:</span>
              <span>{formatCurrency(grossIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax Withheld:</span>
              <span className="font-medium">-{formatCurrency(taxWithheld)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Net Income:</span>
              <span>{formatCurrency(netIncome)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Reportable Super:</span>
              <span>{formatCurrency(reportableSuper)}</span>
            </div>
            {reportableFringeBenefits > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Fringe Benefits:</span>
                <span>{formatCurrency(reportableFringeBenefits)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-green-700 dark:text-green-300 pt-2 border-t">
              <span>Total Package:</span>
              <span>{formatCurrency(totalPackage)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between space-x-2 pt-4">
        {initialData?.id ? (
          <Button
            type="button"
            variant="destructive"
            className="mr-auto"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this yearly record?')) {
                onDelete?.(initialData.id!);
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
            {isSaving ? 'Saving...' : 'Save ATO Entry'}
          </Button>
        </div>
      </div>
    </form>
  );
}
