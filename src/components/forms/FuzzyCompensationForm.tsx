import React, { useState, useEffect } from 'react';
import { CompensationRecord, OvertimeFrequency, PayType, AllowanceFrequency } from '../../types';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface FuzzyCompensationFormProps {
  record?: CompensationRecord | null;
  onSave: (record: CompensationRecord) => void;
  onCancel: () => void;
}

export function FuzzyCompensationForm({ record, onSave, onCancel }: FuzzyCompensationFormProps) {
  const [payType, setPayType] = useState<PayType>('Salary');
  const [baseRate, setBaseRate] = useState(record?.base_rate || 100000);
  const [standardHours, setStandardHours] = useState(record?.standard_weekly_hours || 38);
  const [overtimeFrequency, setOvertimeFrequency] = useState<OvertimeFrequency>('Occasional');
  const [overtimeHours, setOvertimeHours] = useState(record?.overtime.average_hours_per_week || 5);
  const [allowances, setAllowances] = useState(5000);
  const [superRate, setSuperRate] = useState(record?.super_contributions.contribution_rate || 11);
  const [effectiveDate, setEffectiveDate] = useState(
    record?.effective_date || new Date().toISOString().split('T')[0]
  );

  // Calculate confidence score based on specificity
  const [confidenceScore, setConfidenceScore] = useState(75);

  useEffect(() => {
    let score = 100;
    
    // Reduce score for estimates
    if (payType === 'Salary' && baseRate % 5000 === 0) score -= 10;
    if (overtimeFrequency === 'Occasional') score -= 15;
    if (allowances % 1000 === 0) score -= 10;
    
    setConfidenceScore(Math.max(score, 50));
  }, [payType, baseRate, overtimeFrequency, allowances]);

  const calculateEstimatedAnnual = () => {
    const baseAnnual = payType === 'Salary' 
      ? baseRate 
      : baseRate * standardHours * 52;
    
    const overtimeMultiplier = {
      'None': 0,
      'Occasional': 0.5,
      'Frequent': 1.0,
      'Extreme': 1.5,
    }[overtimeFrequency] || 0;
    
    const overtimeAnnual = overtimeHours * 1.5 * baseRate * overtimeMultiplier * 52;
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
    
    const earnings = calculateEstimatedAnnual();
    
    const compensationRecord: CompensationRecord = {
      id: record?.id,
      position_id: 0, // Will be set by parent
      entry_type: 'Fuzzy',
      pay_type: payType,
      base_rate: baseRate,
      standard_weekly_hours: standardHours,
      overtime: {
        frequency: overtimeFrequency,
        rate_multiplier: 1.5,
        average_hours_per_week: overtimeHours,
        annual_hours: null,
      },
      allowances: [
        {
          name: 'Estimated Allowances',
          amount: allowances,
          frequency: 'Annually' as AllowanceFrequency,
          taxable: true,
        }
      ],
      bonuses: [],
      super_contributions: {
        contribution_rate: superRate,
        additional_contributions: 0,
        salary_sacrifice: 0,
      },
      payslip_frequency: null,
      effective_date: new Date(effectiveDate),
      confidence_score: confidenceScore,
      notes: `Fuzzy estimate - ${confidenceScore}% confidence`,
      created_at: new Date(),
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
      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
        <span className="text-sm font-medium text-yellow-800">Estimate Confidence</span>
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
                <SelectItem value="Salary">Annual Salary</SelectItem>
                <SelectItem value="Hourly">Hourly Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>
              Base {payType === 'Salary' ? 'Salary' : 'Hourly Rate'}
              <span className="text-sm text-gray-500 ml-2">
                (Use round numbers for quick estimate)
              </span>
            </Label>
            <div className="mt-2">
              <Slider
                value={[baseRate]}
                onValueChange={(value) => setBaseRate(value[0])}
                min={payType === 'Salary' ? 50000 : 25}
                max={payType === 'Salary' ? 300000 : 150}
                step={payType === 'Salary' ? 5000 : 5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>{formatCurrency(payType === 'Salary' ? 50000 : 25)}</span>
                <span className="font-medium">{formatCurrency(baseRate)}</span>
                <span>{formatCurrency(payType === 'Salary' ? 300000 : 150)}</span>
              </div>
            </div>
          </div>

          {payType === 'Hourly' && (
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
                <SelectItem value="None">Never</SelectItem>
                <SelectItem value="Occasional">Occasional (1-2 days/month)</SelectItem>
                <SelectItem value="Frequent">Frequent (1-2 days/week)</SelectItem>
                <SelectItem value="Extreme">Extreme (3+ days/week)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {overtimeFrequency !== 'None' && (
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
      <Card className="bg-blue-50">
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
            <div className="flex justify-between text-sm text-gray-600">
              <span>With Super ({superRate}%):</span>
              <span>{formatCurrency(earnings.total * (1 + superRate / 100))}</span>
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
          Save Estimate
        </Button>
      </div>
    </form>
  );
}
