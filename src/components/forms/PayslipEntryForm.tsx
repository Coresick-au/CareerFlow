import React, { useState, useEffect } from 'react';
import {
    WeeklyCompensationEntry,
    Allowance,
    AllowanceFrequency
} from '../../types';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CurrencyInput } from '../ui/currency-input';
import { Plus, Trash2, Calendar, DollarSign, Calculator } from 'lucide-react';
import { getFinancialYear } from '../../lib/utils'; // Assuming helper exists, or logic can be inline

interface PayslipEntryFormProps {
    initialData?: WeeklyCompensationEntry;
    onSave: (entry: WeeklyCompensationEntry) => void;
    onCancel: () => void;
    isSaving?: boolean;
}

export function PayslipEntryForm({ initialData, onSave, onCancel, isSaving }: PayslipEntryFormProps) {
    const [weekEnding, setWeekEnding] = useState(
        initialData?.week_ending
            ? new Date(initialData.week_ending).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    );

    // Core Pay
    const [grossPay, setGrossPay] = useState(initialData?.gross_pay || 0);
    const [taxWithheld, setTaxWithheld] = useState(initialData?.tax_withheld || 0);
    const [superContributed, setSuperContributed] = useState(initialData?.super_contributed || 0);

    // Hours
    const [ordinaryHours, setOrdinaryHours] = useState(initialData?.hours_ordinary || 38);
    // Split overtime: 1.5x and 2x are stored as separate values but we'll combine for saving
    const [overtimeHours15x, setOvertimeHours15x] = useState(
        initialData?.overtime_rate_multiplier === 1.5 ? (initialData?.hours_overtime || 0) : 0
    );
    const [overtimeHours2x, setOvertimeHours2x] = useState(
        initialData?.overtime_rate_multiplier === 2 ? (initialData?.hours_overtime || 0) : 0
    );

    // Allowances
    const [allowances, setAllowances] = useState<Allowance[]>(initialData?.allowances || []);
    const [newAllowance, setNewAllowance] = useState({ name: '', amount: 0 });

    // Note
    const [notes, setNotes] = useState(initialData?.notes || '');

    // Calculated fields
    const netPay = grossPay - taxWithheld;
    const fy = getFinancialYear(new Date(weekEnding));

    const handleAddAllowance = () => {
        if (newAllowance.name && newAllowance.amount > 0) {
            setAllowances([...allowances, {
                name: newAllowance.name,
                amount: newAllowance.amount,
                frequency: AllowanceFrequency.Weekly,
                taxable: true
            }]);
            setNewAllowance({ name: '', amount: 0 });
        }
    };

    const handleRemoveAllowance = (index: number) => {
        setAllowances(allowances.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Calculate total overtime and a weighted average multiplier for backend storage
        const totalOvertimeHours = (overtimeHours15x || 0) + (overtimeHours2x || 0);
        const weightedMultiplier = totalOvertimeHours > 0
            ? ((overtimeHours15x * 1.5) + (overtimeHours2x * 2)) / totalOvertimeHours
            : 1.5;

        const entry: WeeklyCompensationEntry = {
            id: initialData?.id,
            financial_year: fy,
            week_ending: new Date(weekEnding),
            gross_pay: grossPay,
            tax_withheld: taxWithheld,
            net_pay: netPay,
            hours_ordinary: ordinaryHours,
            hours_overtime: totalOvertimeHours,
            overtime_rate_multiplier: weightedMultiplier,
            allowances: allowances,
            super_contributed: superContributed,
            notes: notes,
            created_at: initialData?.created_at || new Date(),
        };

        onSave(entry);
    };

    // Auto-calculate suggested Super (11.5%)
    useEffect(() => {
        if (!initialData && grossPay > 0 && superContributed === 0) {
            setSuperContributed(Math.round(grossPay * 0.115 * 100) / 100);
        }
    }, [grossPay]);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Single Payslip Entry</span>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">{fy}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Week Ending Date</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="date"
                            className="pl-9"
                            value={weekEnding}
                            onChange={(e) => setWeekEnding(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div>
                    <Label>Ordinary Hours</Label>
                    <Input
                        type="number"
                        min={0}
                        step={0.5}
                        value={ordinaryHours}
                        onChange={(e) => setOrdinaryHours(Number(e.target.value))}
                    />
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Pay Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Gross Pay (Before Tax)</Label>
                            <CurrencyInput
                                value={grossPay}
                                onChange={setGrossPay}
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <Label>Tax Withheld (PAYG)</Label>
                            <CurrencyInput
                                value={taxWithheld}
                                onChange={setTaxWithheld}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Superannuation Contribution</Label>
                        <CurrencyInput
                            value={superContributed}
                            onChange={setSuperContributed}
                            placeholder="0.00"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Employer contribution only (SG)
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        Overtime & Allowances
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label>Time & Half (1.5x)</Label>
                            <Input
                                type="number"
                                min={0}
                                step={0.5}
                                placeholder="0"
                                value={overtimeHours15x || ''}
                                onChange={(e) => setOvertimeHours15x(Number(e.target.value))}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Hours at 1.5× rate</p>
                        </div>
                        <div>
                            <Label>Double Time (2x)</Label>
                            <Input
                                type="number"
                                min={0}
                                step={0.5}
                                placeholder="0"
                                value={overtimeHours2x || ''}
                                onChange={(e) => setOvertimeHours2x(Number(e.target.value))}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Hours at 2× rate</p>
                        </div>
                        <div className="flex flex-col justify-center">
                            <p className="text-xs text-muted-foreground">Total OT Hours</p>
                            <p className="text-lg font-semibold">{(overtimeHours15x || 0) + (overtimeHours2x || 0)}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Allowances</Label>
                        {allowances.map((allowance, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input value={allowance.name} readOnly className="bg-muted" />
                                <div className="w-24">
                                    <CurrencyInput value={allowance.amount} onChange={() => { }} readOnly className="bg-muted" />
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

                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <Input
                                    placeholder="Name (e.g. Meal, Travel)"
                                    value={newAllowance.name}
                                    onChange={(e) => setNewAllowance({ ...newAllowance, name: e.target.value })}
                                />
                            </div>
                            <div className="w-24">
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={newAllowance.amount || ''}
                                    onChange={(e) => setNewAllowance({ ...newAllowance, amount: Number(e.target.value) })}
                                />
                            </div>
                            <Button type="button" size="sm" onClick={handleAddAllowance}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div>
                <Label>Notes (optional)</Label>
                <Input
                    placeholder="e.g. Include bonus, sick leave taken"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
                <div>
                    <p className="text-sm font-medium">Net Pay</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(netPay)}
                    </p>
                </div>
                <div className="space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Payslip'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
