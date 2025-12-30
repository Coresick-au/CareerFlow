import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { invoke } from '../lib/tauri';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CurrencyInput } from './ui/currency-input';
import {
    FileText,
    DollarSign,
    HelpCircle,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    Check,
    X
} from 'lucide-react';
import {
    Position,
    CompensationRecord,
    CompensationEntryType,
    PayType,
    OvertimeFrequency,
    Allowance,
    AllowanceFrequency,
    WeeklyCompensationEntry,
    YearlyIncomeEntry
} from '../types';
import { getCurrentFinancialYear } from '../lib/utils';
import { PositionForm } from './forms/PositionForm';
import { PayslipEntryForm } from './forms/PayslipEntryForm';

type WizardStep = 'select-type' | 'form' | 'confirm';
type EntryType = 'ato' | 'payslip' | 'estimate' | 'job';

interface AddIncomeWizardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete: () => void;
}

export function AddIncomeWizard({ open, onOpenChange, onComplete }: AddIncomeWizardProps) {
    const [step, setStep] = useState<WizardStep>('select-type');
    const [entryType, setEntryType] = useState<EntryType | null>(null);
    const queryClient = useQueryClient();

    // Data fetching
    const { data: positions = [] } = useQuery({
        queryKey: ['positions'],
        queryFn: () => invoke<Position[]>('get_positions'),
    });

    // Form states
    const [fyYear, setFyYear] = useState(getCurrentFinancialYear());
    const [grossIncome, setGrossIncome] = useState(0);
    const [taxWithheld, setTaxWithheld] = useState(0);
    const [superAmount, setSuperAmount] = useState(0);

    // Allowance states
    const [allowances, setAllowances] = useState<Allowance[]>([]);
    const [newAllowanceName, setNewAllowanceName] = useState('');
    const [newAllowanceAmount, setNewAllowanceAmount] = useState(0);

    // Estimate form state
    const [hourlyRate, setHourlyRate] = useState(0);
    const [weeklyHours, setWeeklyHours] = useState(38);
    const [selectedPositionId, setSelectedPositionId] = useState<string>('');

    const savePositionMutation = useMutation({
        mutationFn: (position: Position) => invoke<number>('save_position', { ...position }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['positions'] });
            handleComplete();
        },
    });

    const saveCompensationMutation = useMutation({
        mutationFn: (record: CompensationRecord) => invoke<number>('save_compensation_record', { record }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['compensationRecords'] });
            handleComplete();
        },
    });

    const saveWeeklyEntryMutation = useMutation({
        mutationFn: (entry: WeeklyCompensationEntry) => invoke<number>('save_weekly_entry', { entry }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['weeklyEntries'] });
            handleComplete();
        },
    });

    const saveYearlyEntryMutation = useMutation({
        mutationFn: (entry: YearlyIncomeEntry) => invoke<number>('save_yearly_entry', { entry }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['yearlyEntries'] });
            handleComplete();
        },
    });

    const handleComplete = () => {
        resetForm();
        onComplete();
    };

    const resetForm = () => {
        setStep('select-type');
        setEntryType(null);
        setFyYear(getCurrentFinancialYear());
        setGrossIncome(0);
        setTaxWithheld(0);
        setSuperAmount(0);
        setAllowances([]);
        setNewAllowanceName('');
        setNewAllowanceAmount(0);
        setHourlyRate(0);
        setWeeklyHours(38);
        setSelectedPositionId('');
    };

    const handleClose = () => {
        resetForm();
        onOpenChange(false);
    };

    const handleSelectType = (type: EntryType) => {
        setEntryType(type);
        setStep('form');
    };

    const handleSubmit = () => {
        if (entryType === 'estimate') {
            if (!selectedPositionId) {
                alert('Please select a position to link this estimate to.');
                return;
            }

            const record: CompensationRecord = {
                position_id: parseInt(selectedPositionId),
                entry_type: CompensationEntryType.Fuzzy,
                pay_type: PayType.Hourly,
                base_rate: hourlyRate,
                standard_weekly_hours: weeklyHours,
                overtime: {
                    frequency: OvertimeFrequency.None,
                    rate_multiplier: 1.5,
                    average_hours_per_week: 0,
                },
                allowances: [],
                bonuses: [],
                super_contributions: {
                    contribution_rate: 11.5,
                    additional_contributions: 0,
                    salary_sacrifice: 0,
                },
                effective_date: new Date(),
                confidence_score: 0.6,
                created_at: new Date(),
            };
            saveCompensationMutation.mutate(record);
        } else if (entryType === 'ato') {
            // ATO Summaries are now saved as YearlyIncomeEntry, ensuring strict schema compliance
            const entry: YearlyIncomeEntry = {
                financial_year: fyYear,
                gross_income: grossIncome,
                tax_withheld: taxWithheld,
                reportable_super: superAmount,
                reportable_fringe_benefits: 0,
                allowances: allowances,
                source: 'ATO',
                notes: `${fyYear} ATO Payment Summary`,
                created_at: new Date(),
            };
            saveYearlyEntryMutation.mutate(entry);
        }
    };

    const entryTypeOptions: {
        type: EntryType;
        icon: any;
        title: string;
        description: string;
        color: string;
        disabled?: boolean;
    }[] = [
            {
                type: 'ato' as EntryType,
                icon: FileText,
                title: 'My tax return / ATO summary',
                description: 'Enter your yearly income from your ATO payment summary',
                color: 'text-green-600 dark:text-green-400',
            },
            {
                type: 'payslip' as EntryType,
                icon: DollarSign,
                title: 'A single payslip',
                description: 'Track individual weekly/fortnightly pay with hours',
                color: 'text-purple-600 dark:text-purple-400',
            },
            {
                type: 'estimate' as EntryType,
                icon: HelpCircle,
                title: 'A rough estimate',
                description: "I know my hourly rate or rough salary",
                color: 'text-orange-600 dark:text-orange-400',
            },
            {
                type: 'job' as EntryType,
                icon: Briefcase,
                title: 'A new job / position',
                description: 'Record a new role in your career history',
                color: 'text-blue-600 dark:text-blue-400',
            },
        ];

    // Generate FY options (last 15 years)
    const currentYear = new Date().getFullYear();
    const fyOptions = Array.from({ length: 15 }, (_, i) => {
        const year = currentYear - i;
        return `FY${year}-${(year + 1).toString().slice(-2)}`;
    });

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle>
                        {step === 'select-type' && 'What are you adding?'}
                        {step === 'form' && entryType === 'ato' && 'ATO Payment Summary'}
                        {step === 'form' && entryType === 'estimate' && 'Quick Estimate'}
                        {step === 'form' && entryType === 'job' && 'New Position'}
                        {step === 'form' && entryType === 'payslip' && 'Payslip Entry'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'select-type' && 'Choose the type of income entry you want to add'}
                        {step === 'form' && entryType === 'ato' && 'Enter details from your ATO payment summary'}
                        {step === 'form' && entryType === 'estimate' && 'Provide a rough estimate of your earnings'}
                        {step === 'form' && entryType === 'job' && 'Add a new position to your career history'}
                    </DialogDescription>
                </DialogHeader>

                {/* Step 1: Select Type */}
                {step === 'select-type' && (
                    <div className="grid gap-3 py-4">
                        {entryTypeOptions.map((option) => (
                            <Card
                                key={option.type}
                                className={`cursor-pointer hover:border-primary transition-colors ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => !option.disabled && handleSelectType(option.type)}
                            >
                                <CardContent className="p-4 flex items-center gap-3">
                                    <option.icon className={`h-8 w-8 flex-shrink-0 ${option.color}`} />
                                    <div className="flex-1">
                                        <h4 className="font-medium text-foreground">{option.title}</h4>
                                        <p className="text-sm text-muted-foreground">{option.description}</p>
                                        {option.disabled && (
                                            <p className="text-xs text-muted-foreground italic mt-1">Coming soon</p>
                                        )}
                                    </div>
                                    {!option.disabled && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Step 2: Form */}
                {step === 'form' && (
                    <div className="py-4 space-y-4">
                        {/* ATO Summary Form */}
                        {entryType === 'ato' && (
                            <>
                                <div>
                                    <Label>Financial Year</Label>
                                    <Select value={fyYear} onValueChange={setFyYear}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fyOptions.map((fy) => (
                                                <SelectItem key={fy} value={fy}>{fy}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Gross Income (Total payments from payment summary)</Label>
                                    <CurrencyInput
                                        value={grossIncome}
                                        onChange={setGrossIncome}
                                        placeholder="85000"
                                    />
                                </div>
                                <div>
                                    <Label>Tax Withheld (PAYG)</Label>
                                    <CurrencyInput
                                        value={taxWithheld}
                                        onChange={setTaxWithheld}
                                        placeholder="18500"
                                    />
                                </div>
                                <div>
                                    <Label>Reportable Super Contributions</Label>
                                    <CurrencyInput
                                        value={superAmount}
                                        onChange={setSuperAmount}
                                        placeholder="9775"
                                    />
                                </div>

                                {/* Allowances Section */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <Label>Allowances & Other Income</Label>
                                        <div className="text-xs text-muted-foreground">
                                            Total: {new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(allowances.reduce((sum, a) => sum + a.amount, 0))}
                                        </div>
                                    </div>

                                    {allowances.map((allowance, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <Input
                                                value={allowance.name}
                                                readOnly
                                                className="flex-1 bg-muted"
                                            />
                                            <div className="w-24 px-3 py-2 bg-muted rounded text-sm text-right">
                                                {new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(allowance.amount)}
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
                                            <CurrencyInput
                                                value={newAllowanceAmount}
                                                onChange={setNewAllowanceAmount}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="secondary"
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
                                            Add
                                        </Button>
                                    </div>
                                </div>
                                <div className="bg-muted/50 rounded-md p-3 text-sm text-muted-foreground">
                                    <p>💡 You can find these values on your:</p>
                                    <ul className="list-disc list-inside mt-1">
                                        <li>PAYG payment summary from your employer</li>
                                        <li>myGov ATO online services</li>
                                        <li>Previous tax return</li>
                                    </ul>
                                </div>
                            </>
                        )}

                        {/* Estimate Form */}
                        {entryType === 'estimate' && (
                            <>
                                <div>
                                    <Label>Linked Position</Label>
                                    <Select value={selectedPositionId} onValueChange={setSelectedPositionId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a position..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {positions.map((pos) => (
                                                <SelectItem key={pos.id} value={String(pos.id)}>
                                                    {pos.job_title} at {pos.employer_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        All compensation records must be linked to a position.
                                    </p>
                                </div>
                                <div>
                                    <Label>Hourly Rate (before tax)</Label>
                                    <CurrencyInput
                                        value={hourlyRate}
                                        onChange={setHourlyRate}
                                        showCents
                                        placeholder="45.00"
                                    />
                                </div>
                                <div>
                                    <Label>Hours per Week</Label>
                                    <Input
                                        type="number"
                                        value={weeklyHours}
                                        onChange={(e) => setWeeklyHours(parseInt(e.target.value) || 38)}
                                        min={1}
                                        max={80}
                                    />
                                </div>
                                <div className="bg-muted/50 rounded-md p-3">
                                    <p className="text-sm font-medium text-foreground">
                                        Estimated Annual: {new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(hourlyRate * weeklyHours * 52)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Based on {weeklyHours} hours × 52 weeks
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Job Form */}
                        {entryType === 'job' && (
                            <PositionForm
                                onSave={(position) => savePositionMutation.mutate(position)}
                                onCancel={() => setStep('select-type')}
                                isSaving={savePositionMutation.isPending}
                            />
                        )}

                        {/* Payslip Form */}
                        {entryType === 'payslip' && (
                            <PayslipEntryForm
                                onSave={(entry) => saveWeeklyEntryMutation.mutate(entry)}
                                onCancel={() => setStep('select-type')}
                                isSaving={saveWeeklyEntryMutation.isPending}
                            />
                        )}

                        {/* Navigation - Only show for standard forms, custom forms handle their own buttons */}
                        {entryType !== 'job' && entryType !== 'payslip' && (
                            <div className="flex justify-between pt-4">
                                <Button variant="outline" onClick={() => setStep('select-type')}>
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={savePositionMutation.isPending || saveCompensationMutation.isPending}
                                >
                                    {(savePositionMutation.isPending || saveCompensationMutation.isPending)
                                        ? 'Saving...'
                                        : (
                                            <>
                                                <Check className="h-4 w-4 mr-2" />
                                                Save Entry
                                            </>
                                        )
                                    }
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
