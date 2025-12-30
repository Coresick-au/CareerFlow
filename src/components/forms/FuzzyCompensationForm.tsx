import React, { useState } from 'react';
import { CompensationRecord, CompensationEntryType, PayType, OvertimeFrequency, AllowanceFrequency } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Trash2 } from 'lucide-react';

interface FuzzyCompensationFormProps {
  initialData?: CompensationRecord | null;
  onSave: (record: CompensationRecord) => void;
  onCancel: () => void;
  onDelete?: (id: number) => void;
  isSaving?: boolean;
}

export function FuzzyCompensationForm({ initialData, onSave, onCancel, onDelete, isSaving }: FuzzyCompensationFormProps) {
  const [payType, setPayType] = useState<PayType>(initialData?.pay_type || PayType.Salary);
  const [baseRate, setBaseRate] = useState(initialData?.base_rate || (initialData?.pay_type === PayType.Salary ? 90000 : 45));
  const [standardHours, setStandardHours] = useState(initialData?.standard_weekly_hours || 38);

  const [overtimeFrequency, setOvertimeFrequency] = useState<OvertimeFrequency>(initialData?.overtime?.frequency || OvertimeFrequency.None);
  const [overtimeHours, setOvertimeHours] = useState(initialData?.overtime?.average_hours_per_week || 0);

  // Extract allowance amount if it exists (assuming single estimate allowance for fuzzy)
  const initialAllowanceAmount = initialData?.allowances?.[0]?.amount || 0;
  const [allowances, setAllowances] = useState(initialAllowanceAmount);

  const [superRate, setSuperRate] = useState(initialData?.super_contributions?.contribution_rate || 11.5);
  const [effectiveDate, setEffectiveDate] = useState(initialData?.effective_date ? new Date(initialData.effective_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);

  // Derived confidence score based on input granularity
  const calculateConfidence = () => {
    let score = 60; // Base score for estimate
    if (payType === PayType.Hourly) score += 10;
    if (overtimeFrequency !== OvertimeFrequency.None && overtimeHours > 0) score += 5;
    if (allowances > 0) score += 5;
    return Math.min(score, 90); // Cap at 90% for estimates
  };

  const confidenceScore = calculateConfidence();

  const calculateEstimatedAnnual = () => {
    const baseAnnual = payType === PayType.Salary
      ? baseRate
      : baseRate * standardHours * 52;



    // If hours are explicitly set, use them. Otherwise imply from frequency? 
    // The previous code used multiplier relative to base rate? 
    // Let's assume overtimeHours is the weekly average.
    const overtimeAnnual = overtimeHours * 1.5 * (payType === PayType.Hourly ? baseRate : baseRate / (38 * 52)) * 52;

    // Allowances are annual
    const allowancesAnnual = allowances;

    return {
      base: baseAnnual,
      overtime: overtimeAnnual,
      allowances: allowancesAnnual,
      total: baseAnnual + overtimeAnnual + allowancesAnnual,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const compensationRecord: CompensationRecord = {
      id: initialData?.id,
      position_id: 0, // Will be set by parent
      entry_type: CompensationEntryType.Fuzzy,
      pay_type: payType,
      base_rate: baseRate,
      standard_weekly_hours: standardHours,
      overtime: {
        frequency: overtimeFrequency,
        rate_multiplier: 1.5,
        average_hours_per_week: overtimeHours,
        annual_hours: undefined,
      },
      allowances: [
        {
          name: 'Estimated Allowances',
          amount: allowances,
          frequency: AllowanceFrequency.Annually,
          taxable: true,
        }
      ],
      bonuses: [],
      super_contributions: {
        contribution_rate: superRate,
        additional_contributions: 0,
        salary_sacrifice: 0,
      },
      payslip_frequency: undefined,
      effective_date: new Date(effectiveDate),
      confidence_score: confidenceScore,
      notes: `Fuzzy estimate - ${confidenceScore}% confidence`,
      created_at: initialData?.created_at || new Date(),
    };

    onSave(compensationRecord);
  };

  const earnings = calculateEstimatedAnnual();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Confidence Indicator */}
      <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Estimate Confidence</span>
        <Badge variant={confidenceScore >= 80 ? 'default' : confidenceScore >= 60 ? 'secondary' : 'destructive'}>
          {confidenceScore}%
        </Badge>
      </div>

      {/* Pay Type and Base Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Base Compensation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Pay Type</Label>
            <Select value={payType} onValueChange={(value: PayType) => setPayType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PayType.Salary}>Annual Salary</SelectItem>
                <SelectItem value={PayType.Hourly}>Hourly Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>
              Base {payType === PayType.Salary ? 'Salary' : 'Hourly Rate'}
              <span className="text-sm text-muted-foreground ml-2">
                (Use round numbers for quick estimate)
              </span>
            </Label>
            <div className="mt-2">
              <Slider
                value={[baseRate]}
                onValueChange={(value) => setBaseRate(value[0])}
                min={payType === PayType.Salary ? 50000 : 25}
                max={payType === PayType.Salary ? 300000 : 150}
                step={payType === PayType.Salary ? 5000 : 5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>{formatCurrency(payType === PayType.Salary ? 50000 : 25)}</span>
                <span className="font-medium">{formatCurrency(baseRate)}</span>
                <span>{formatCurrency(payType === PayType.Salary ? 300000 : 150)}</span>
              </div>
            </div>
          </div>

          {payType === PayType.Hourly && (
            <div>
              <Label>Standard Weekly Hours</Label>
              <Input
                type="number"
                value={standardHours}
                onChange={(e) => setStandardHours(Number(e.target.value))}
                min={0}
                max={80}
                step={1}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overtime */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overtime Estimate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>How often do you work overtime?</Label>
            <Select value={overtimeFrequency} onValueChange={(value: OvertimeFrequency) => setOvertimeFrequency(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OvertimeFrequency.None}>Never</SelectItem>
                <SelectItem value={OvertimeFrequency.Occasional}>Occasional (1-2 days/month)</SelectItem>
                <SelectItem value={OvertimeFrequency.Frequent}>Frequent (1-2 days/week)</SelectItem>
                <SelectItem value={OvertimeFrequency.Extreme}>Extreme (3+ days/week)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {overtimeFrequency !== OvertimeFrequency.None && (
            <div>
              <Label>Average overtime hours per week</Label>
              <div className="mt-2">
                <Slider
                  value={[overtimeHours]}
                  onValueChange={(value) => setOvertimeHours(value[0])}
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <div className="text-center text-sm font-medium mt-1">
                  {overtimeHours} hours/week
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allowances and Super */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Benefits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Annual Allowances (travel, site, vehicle, etc.)</Label>
            <div className="mt-2">
              <Slider
                value={[allowances]}
                onValueChange={(value) => setAllowances(value[0])}
                min={0}
                max={20000}
                step={1000}
                className="w-full"
              />
              <div className="text-center text-sm font-medium mt-1">
                {formatCurrency(allowances)}
              </div>
            </div>
          </div>

          <div>
            <Label>Superannuation Rate (%)</Label>
            <div className="mt-2">
              <Slider
                value={[superRate]}
                onValueChange={(value) => setSuperRate(value[0])}
                min={10.5}
                max={15}
                step={0.5}
                className="w-full"
              />
              <div className="text-center text-sm font-medium mt-1">
                {superRate}%
              </div>
            </div>
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

      {/* Summary */}
      <Card className="bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/20">
        <CardHeader>
          <CardTitle className="text-lg">Estimated Annual Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Base Pay:</span>
              <span className="font-medium">{formatCurrency(earnings.base)}</span>
            </div>
            <div className="flex justify-between">
              <span>Overtime:</span>
              <span className="font-medium">{formatCurrency(earnings.overtime)}</span>
            </div>
            <div className="flex justify-between">
              <span>Allowances:</span>
              <span className="font-medium">{formatCurrency(earnings.allowances)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total Annual:</span>
              <span>{formatCurrency(earnings.total)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>With Super ({superRate}%):</span>
              <span>{formatCurrency(earnings.total * (1 + superRate / 100))}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between space-x-2 pt-4">
        {initialData?.id ? (
          <Button
            type="button"
            variant="destructive"
            className="mr-auto"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this estimate?')) {
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
            {isSaving ? 'Saving...' : 'Save Estimate'}
          </Button>
        </div>
      </div>
    </form>
  );
}
