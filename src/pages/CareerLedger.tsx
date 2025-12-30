import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '../lib/tauri';
import { Position, CompensationRecord, WeeklyCompensationEntry, YearlyIncomeEntry } from '../types';
import {
    Plus,
    Briefcase,
    FileText,
    DollarSign,
    TrendingUp,
    Calendar,
    ChevronRight,
    AlertTriangle,
    Trash2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { AddIncomeWizard } from '../components/AddIncomeWizard';
import { WeeklyIncomeProjection } from '../components/WeeklyIncomeProjection';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { PositionForm } from '../components/forms/PositionForm';
import { YearlyWageForm } from '../components/forms/YearlyWageForm';
import { ExactCompensationForm } from '../components/forms/ExactCompensationForm';
import { PayslipEntryForm } from '../components/forms/PayslipEntryForm';
import { FuzzyCompensationForm } from '../components/forms/FuzzyCompensationForm';
import {
    formatDateAU,
    formatCurrency,
    formatDuration,
    getFinancialYear,
    getCurrentFinancialYear,
    calculateTakeHomePay
} from '../lib/utils';

// Union type for timeline entries
type TimelineEntry =
    | { type: 'position'; date: Date; data: Position }
    | { type: 'compensation'; date: Date; data: CompensationRecord }
    | { type: 'weekly'; date: Date; data: WeeklyCompensationEntry }
    | { type: 'yearly'; date: Date; data: YearlyIncomeEntry };

export function CareerLedger() {
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [wizardOpen, setWizardOpen] = useState(false);
    const queryClient = useQueryClient();

    // Fetch all data
    const { data: positions = [] } = useQuery({
        queryKey: ['positions'],
        queryFn: () => invoke<Position[]>('get_positions'),
    });

    const { data: compensationRecords = [] } = useQuery({
        queryKey: ['compensationRecords'],
        queryFn: () => invoke<CompensationRecord[]>('get_all_compensation_records'),
    });

    const { data: weeklyEntries = [] } = useQuery({
        queryKey: ['weeklyEntries'],
        queryFn: () => invoke<WeeklyCompensationEntry[]>('get_weekly_entries'),
    });

    const { data: yearlyEntries = [] } = useQuery({
        queryKey: ['yearlyEntries'],
        queryFn: () => invoke<YearlyIncomeEntry[]>('get_yearly_entries'),
    });

    // Combine all entries into a single timeline, sorted by date
    const allTimelineEntries: TimelineEntry[] = [
        ...positions.map(p => ({
            type: 'position' as const,
            date: new Date(p.start_date),
            data: p
        })),
        ...compensationRecords.map(c => ({
            type: 'compensation' as const,
            date: new Date(c.effective_date),
            data: c
        })),
        ...weeklyEntries.map(w => ({
            type: 'weekly' as const,
            date: new Date(w.week_ending),
            data: w
        })),
        ...yearlyEntries.map(y => ({
            type: 'yearly' as const,
            date: new Date(parseInt(y.financial_year.match(/\d{4}/)?.[0] || '2024'), 6, 1),
            data: y
        })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime()); // Most recent first

    // Extract available Financial Years
    const availableYears = Array.from(new Set(allTimelineEntries.map(entry => getFinancialYear(entry.date))))
        .sort((a, b) => b.localeCompare(a));

    // Filter entries based on selection
    const timelineEntries = selectedYear === 'all'
        ? allTimelineEntries
        : allTimelineEntries.filter(entry => getFinancialYear(entry.date) === selectedYear);

    // Calculate stats
    const currentFY = getCurrentFinancialYear();
    const displayFY = selectedYear === 'all' ? currentFY : selectedYear;

    // Count stats based on FILTERED view
    const positionsCount = timelineEntries.filter(e => e.type === 'position').length;
    const incomeRecordsCount = timelineEntries.filter(e => e.type !== 'position').length;

    // ... (Mutations remain the same) ...
    const savePositionMutation = useMutation({
        mutationFn: (position: Position) => invoke<number>('save_position', { ...position }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['positions'] });
            setEditingEntry(null);
        },
    });

    const deletePositionMutation = useMutation({
        mutationFn: (id: number) => invoke('delete_position', id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['positions'] });
            setEditingEntry(null);
        },
    });

    const saveCompensationMutation = useMutation({
        mutationFn: (record: CompensationRecord) => invoke<number>('save_compensation_record', { ...record }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['compensationRecords'] });
            setEditingEntry(null);
        },
    });

    const deleteCompensationMutation = useMutation({
        mutationFn: (id: number) => invoke('delete_compensation_record', id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['compensationRecords'] });
            setEditingEntry(null);
        },
    });

    const saveWeeklyEntryMutation = useMutation({
        mutationFn: (entry: WeeklyCompensationEntry) => invoke<number>('save_weekly_entry', { entry }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['weeklyEntries'] });
            setEditingEntry(null);
        },
    });

    const deleteWeeklyEntryMutation = useMutation({
        mutationFn: (id: number) => invoke('delete_weekly_entry', id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['weeklyEntries'] });
            setEditingEntry(null);
        },
    });

    const saveYearlyEntryMutation = useMutation({
        mutationFn: (entry: YearlyIncomeEntry) => invoke<number>('save_yearly_entry', { entry }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['yearlyEntries'] });
            setEditingEntry(null);
        },
    });

    const deleteYearlyEntryMutation = useMutation({
        mutationFn: (id: number) => invoke('delete_yearly_entry', id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['yearlyEntries'] });
            setEditingEntry(null);
        },
    });

    const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null);

    const handleEntryClick = (entry: TimelineEntry) => {
        setEditingEntry(entry);
    };

    const handleWizardComplete = () => {
        setWizardOpen(false);
        queryClient.invalidateQueries({ queryKey: ['positions'] });
        queryClient.invalidateQueries({ queryKey: ['compensationRecords'] });
        queryClient.invalidateQueries({ queryKey: ['weeklyEntries'] });
        queryClient.invalidateQueries({ queryKey: ['earningsAnalysis'] });
    };

    // ... (Helper functions remain the same) ...
    const getEntryIcon = (type: TimelineEntry['type']) => {
        switch (type) {
            case 'position': return <Briefcase className="h-5 w-5 text-blue-500" />;
            case 'compensation': return <DollarSign className="h-5 w-5 text-green-500" />;
            case 'weekly': return <Calendar className="h-5 w-5 text-purple-500" />;
            case 'yearly': return <FileText className="h-5 w-5 text-orange-500" />;
        }
    };

    const getEntryBadge = (type: TimelineEntry['type']) => {
        switch (type) {
            case 'position': return <Badge variant="secondary">Job</Badge>;
            case 'compensation': return <Badge className="bg-green-500/20 text-green-700 dark:text-green-300">Compensation</Badge>;
            case 'weekly': return <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300">Payslip</Badge>;
            case 'yearly': return <Badge className="bg-orange-500/20 text-orange-700 dark:text-orange-300">ATO Summary</Badge>;
        }
    };

    const renderEntry = (entry: TimelineEntry, index: number) => {
        const fy = getFinancialYear(entry.date);

        return (
            <Card
                key={`${entry.type}-${index}`}
                className="hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => handleEntryClick(entry)}
            >
                {/* ... existing card content ... */}
                <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                            {getEntryIcon(entry.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                {getEntryBadge(entry.type)}
                                <span className="text-xs text-muted-foreground">{fy}</span>
                            </div>

                            {entry.type === 'position' && (
                                <>
                                    <h3 className="font-semibold text-foreground">{entry.data.job_title}</h3>
                                    <p className="text-sm text-muted-foreground">{entry.data.employer_name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDateAU(entry.data.start_date)} - {entry.data.end_date ? formatDateAU(entry.data.end_date) : 'Present'}
                                        <span className="ml-2">({formatDuration(entry.data.start_date, entry.data.end_date)})</span>
                                    </p>
                                </>
                            )}

                            {entry.type === 'compensation' && (
                                (() => {
                                    const isAnnual = entry.data.pay_type === 'Annual' || entry.data.pay_type === 'Salary';
                                    const baseRateAnnual = isAnnual
                                        ? entry.data.base_rate
                                        : entry.data.base_rate * 52;

                                    const allowancesAnnual = entry.data.allowances?.reduce((sum, a) => {
                                        let amount = a.amount;
                                        if (a.frequency === 'Weekly') amount *= 52;
                                        if (a.frequency === 'Fortnightly') amount *= 26;
                                        if (a.frequency === 'Monthly') amount *= 12;
                                        return sum + amount;
                                    }, 0) || 0;

                                    const totalGross = baseRateAnnual + allowancesAnnual;
                                    const position = positions.find(p => p.id === entry.data.position_id);

                                    return (
                                        <>
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-foreground">
                                                    {formatCurrency(totalGross)}
                                                    <span className="text-sm font-normal text-muted-foreground ml-2">/year gross</span>
                                                </h3>
                                                {position && (
                                                    <Badge variant="outline" className="text-xs font-normal">
                                                        {position.employer_name}
                                                    </Badge>
                                                )}
                                            </div>
                                            {entry.data.tax_withheld && (
                                                <p className="text-sm text-green-600 dark:text-green-400">
                                                    Take-home: {formatCurrency(calculateTakeHomePay(totalGross, entry.data.tax_withheld))}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {entry.data.standard_weekly_hours}hrs/week • Effective {formatDateAU(entry.data.effective_date)}
                                            </p>
                                        </>
                                    );
                                })()
                            )}

                            {entry.type === 'yearly' && (
                                <>
                                    <h3 className="font-semibold text-foreground">
                                        {formatCurrency(entry.data.gross_income)}
                                        <span className="text-sm font-normal text-muted-foreground ml-2">/year gross</span>
                                    </h3>
                                    <p className="text-sm text-green-600 dark:text-green-400">
                                        Take-home: {formatCurrency(calculateTakeHomePay(entry.data.gross_income, entry.data.tax_withheld))}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Tax: {formatCurrency(entry.data.tax_withheld)} • Super: {formatCurrency(entry.data.reportable_super)}
                                    </p>
                                </>
                            )}

                            {entry.type === 'weekly' && (
                                <>
                                    <h3 className="font-semibold text-foreground">
                                        {formatCurrency(entry.data.gross_pay)}
                                        <span className="text-sm font-normal text-muted-foreground ml-2">gross</span>
                                    </h3>
                                    <p className="text-sm text-green-600 dark:text-green-400">
                                        Take-home: {formatCurrency(entry.data.net_pay)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {entry.data.hours_ordinary + entry.data.hours_overtime}hrs • Week ending {formatDateAU(entry.data.week_ending)}
                                    </p>
                                </>
                            )}
                        </div>

                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Career Ledger</h1>
                    <p className="text-muted-foreground">Your complete career and income history</p>
                </div>

                <div className="flex gap-2">
                    <div className="w-[180px]">
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Time" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                {availableYears.map(year => (
                                    <SelectItem key={year} value={year}>{year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={() => setWizardOpen(true)}>
                        <Plus className="w-5 h-5 mr-2" />
                        Add Income
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {selectedYear === 'all' ? 'current FY' : 'selected FY'}
                                </p>
                                <p className="text-2xl font-bold text-foreground">{displayFY}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Positions</p>
                                <p className="text-2xl font-bold text-foreground">{positionsCount}</p>
                            </div>
                            <Briefcase className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Income Records</p>
                                <p className="text-2xl font-bold text-foreground">
                                    {incomeRecordsCount}
                                </p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Weekly Income Projection (if weekly entries exist) */}
            {weeklyEntries.length > 0 && (
                <div className="mb-6">
                    <WeeklyIncomeProjection entries={weeklyEntries} />
                </div>
            )}

            {/* Timeline */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Timeline
                </h2>

                {timelineEntries.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <div className="max-w-md mx-auto">
                                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    Start Your Career Story
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Add your first income entry to begin tracking your earnings journey.
                                    You can enter your yearly ATO summary, individual payslips, or job details.
                                </p>
                                <Button onClick={() => setWizardOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Your First Entry
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    timelineEntries.map((entry, index) => renderEntry(entry, index))
                )}
            </div>

            {/* Editing Dialog */}
            <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
                <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Edit Details</DialogTitle>
                    </DialogHeader>

                    {editingEntry?.type === 'position' && (
                        <PositionForm
                            initialData={editingEntry.data}
                            onSave={(pos) => savePositionMutation.mutate(pos)}
                            onCancel={() => setEditingEntry(null)}
                            onDelete={(id) => deletePositionMutation.mutate(id)}
                            isSaving={savePositionMutation.isPending}
                        />
                    )}

                    {editingEntry?.type === 'yearly' && (
                        <YearlyWageForm
                            initialData={editingEntry.data}
                            onSave={(entry) => saveYearlyEntryMutation.mutate(entry)}
                            onCancel={() => setEditingEntry(null)}
                            onDelete={(id) => deleteYearlyEntryMutation.mutate(id)}
                            isSaving={saveYearlyEntryMutation.isPending}
                        />
                    )}

                    {/* Legacy support: If old records still exist as CompensationRecord with YearlySummary type */}
                    {editingEntry?.type === 'compensation' && editingEntry.data.entry_type === 'YearlySummary' && (
                        <YearlyWageForm
                            initialData={{
                                financial_year: 'FY2024-25', // Default fallback
                                gross_income: editingEntry.data.base_rate,
                                tax_withheld: editingEntry.data.tax_withheld || 0,
                                reportable_super: editingEntry.data.super_contributions.additional_contributions,
                                source: 'Manual',
                                created_at: editingEntry.data.created_at
                            }}
                            onSave={(entry) => saveYearlyEntryMutation.mutate(entry)} // Convert to new format
                            onCancel={() => setEditingEntry(null)}
                            onDelete={(id) => deleteCompensationMutation.mutate(id)}
                        />
                    )}

                    {editingEntry?.type === 'compensation' && editingEntry.data.entry_type === 'Exact' && (
                        <ExactCompensationForm
                            initialData={editingEntry.data}
                            onSave={(record) => saveCompensationMutation.mutate(record)}
                            onCancel={() => setEditingEntry(null)}
                            onDelete={(id) => deleteCompensationMutation.mutate(id)}
                        />
                    )}

                    {editingEntry?.type === 'compensation' && editingEntry.data.entry_type === 'Fuzzy' && (
                        <FuzzyCompensationForm
                            initialData={editingEntry.data}
                            onSave={(record) => saveCompensationMutation.mutate(record)}
                            onCancel={() => setEditingEntry(null)}
                            onDelete={(id) => deleteCompensationMutation.mutate(id)}
                        />
                    )}

                    {/* Fallback for corrupted/unknown entries */}
                    {editingEntry?.type === 'compensation' &&
                        !['YearlySummary', 'Exact', 'Fuzzy'].includes(editingEntry.data.entry_type as string) && (
                            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                                <div className="bg-destructive/10 p-4 rounded-full">
                                    <AlertTriangle className="w-8 h-8 text-destructive" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Corrupted Entry</h3>
                                    <p className="text-muted-foreground mt-1 max-w-xs mx-auto">
                                        This entry has missing or invalid data (Type: {String(editingEntry.data.entry_type || 'Unknown')}).
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        if (editingEntry.data.id && confirm('Are you sure you want to delete this corrupted entry?')) {
                                            deleteCompensationMutation.mutate(editingEntry.data.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Entry
                                </Button>
                            </div>
                        )}

                    {editingEntry?.type === 'weekly' && (
                        <PayslipEntryForm
                            initialData={editingEntry.data}
                            onSave={(entry) => saveWeeklyEntryMutation.mutate(entry)}
                            onCancel={() => setEditingEntry(null)}
                            isSaving={saveWeeklyEntryMutation.isPending}
                        />
                    )}

                    {/* Delete button specific for Payslip form is handled inside the form or we can add a footer here if needed. 
                        For now, let's add a delete button below the form if it's an edit */}
                    {editingEntry?.type === 'weekly' && editingEntry.data.id && (
                        <div className="border-t pt-4 mt-4 flex justify-end">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    if (confirm('Are you sure you want to remove this payslip?')) {
                                        deleteWeeklyEntryMutation.mutate(editingEntry.data.id!);
                                    }
                                }}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Payslip
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Add Income Wizard */}
            <AddIncomeWizard
                open={wizardOpen}
                onOpenChange={setWizardOpen}
                onComplete={handleWizardComplete}
            />
        </div>
    );
}
