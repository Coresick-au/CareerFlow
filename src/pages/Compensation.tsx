import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '../lib/tauri';
import { Position, CompensationRecord, CompensationEntryType } from '../types';
import { Edit, Trash2, Clock, DollarSign, Briefcase, Calendar } from 'lucide-react';
import { FuzzyCompensationForm } from '../components/forms/FuzzyCompensationForm';
import { ExactCompensationForm } from '../components/forms/ExactCompensationForm';
import { YearlyWageForm } from '../components/forms/YearlyWageForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

type EntryMode = 'fuzzy' | 'exact' | 'yearly' | null;

export function Compensation() {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [entryMode, setEntryMode] = useState<EntryMode>(null);
  const [editingRecord, setEditingRecord] = useState<CompensationRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: positions = [] } = useQuery({
    queryKey: ['positions'],
    queryFn: () => invoke<Position[]>('get_positions'),
  });

  const { data: records = [] } = useQuery({
    queryKey: ['compensationRecords', selectedPosition?.id],
    queryFn: () => {
      if (!selectedPosition) return [];
      return invoke<CompensationRecord[]>('get_compensation_records', {
        positionId: selectedPosition.id,
      });
    },
    enabled: !!selectedPosition,
  });

  const saveRecordMutation = useMutation({
    mutationFn: (record: CompensationRecord) => 
      invoke<number>('save_compensation_record', { record }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compensationRecords', selectedPosition?.id] });
      setDialogOpen(false);
      setEntryMode(null);
      setEditingRecord(null);
    },
  });

  const handleAddRecord = (mode: EntryMode) => {
    if (!selectedPosition) return;
    setEntryMode(mode);
    setEditingRecord(null);
    setDialogOpen(true);
  };

  const handleEditRecord = (record: CompensationRecord) => {
    setEditingRecord(record);
    setEntryMode(record.entry_type === CompensationEntryType.Fuzzy ? 'fuzzy' : 'exact');
    setDialogOpen(true);
  };

  const handleSaveRecord = (record: CompensationRecord) => {
    const fullRecord = {
      ...record,
      position_id: selectedPosition!.id!,
      entry_type: entryMode === 'fuzzy' ? CompensationEntryType.Fuzzy : CompensationEntryType.Exact,
      created_at: new Date(),
    };
    saveRecordMutation.mutate(fullRecord);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateAnnualEarnings = (record: CompensationRecord) => {
    const baseAnnual = record.pay_type === 'Salary' 
      ? record.base_rate 
      : record.base_rate * record.standard_weekly_hours * 52;
    
    const overtimeAnnual = record.overtime.average_hours_per_week * 
      record.overtime.rate_multiplier * 
      record.base_rate * 
      52;
    
    const allowancesAnnual = record.allowances.reduce((sum, allowance) => {
      const multiplier = allowance.frequency === 'Weekly' ? 52 : 
                       allowance.frequency === 'Fortnightly' ? 26 :
                       allowance.frequency === 'Monthly' ? 12 : 1;
      return sum + (allowance.amount * multiplier);
    }, 0);
    
    return baseAnnual + overtimeAnnual + allowancesAnnual;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Compensation Management</h1>
        <p className="text-muted-foreground">Track your earnings with fuzzy estimates or exact payslip data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Positions List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {positions.map((position) => (
                <button
                  key={position.id}
                  onClick={() => setSelectedPosition(position)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedPosition?.id === position.id
                      ? 'border-blue-500 bg-blue-500 dark:bg-blue-600'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <div className="font-medium">{position.job_title}</div>
                  <div className="text-sm text-muted-foreground">{position.employer_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {position.start_date.toLocaleDateString()} - 
                    {position.end_date?.toLocaleDateString() || 'Present'}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Compensation Records */}
        <div className="lg:col-span-2">
          {selectedPosition ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {selectedPosition.job_title} - {selectedPosition.employer_name}
                </h2>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleAddRecord('fuzzy')}
                    className="text-sm"
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Quick Estimate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAddRecord('yearly')}
                    className="text-sm"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Yearly Summary
                  </Button>
                  <Button
                    onClick={() => handleAddRecord('exact')}
                    className="text-sm"
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    Exact Payslip
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {records.map((record) => (
                  <Card key={record.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              record.entry_type === 'Fuzzy' 
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            }`}>
                              {record.entry_type}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Effective: {record.effective_date.toLocaleDateString()}
                            </span>
                            {record.entry_type === 'Fuzzy' && (
                              <span className="text-sm text-muted-foreground">
                                Confidence: {record.confidence_score}%
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Base: </span>
                              <span className="font-medium">
                                {record.pay_type === 'Salary' ? 'Salary' : 'Hourly'} - 
                                {formatCurrency(record.base_rate)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Annual Total: </span>
                              <span className="font-medium">
                                {formatCurrency(calculateAnnualEarnings(record))}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Hours/week: </span>
                              <span className="font-medium">{record.standard_weekly_hours}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Overtime: </span>
                              <span className="font-medium">
                                {record.overtime.frequency} ({record.overtime.average_hours_per_week}h/week)
                              </span>
                            </div>
                            {record.tax_withheld && (
                              <>
                                <div>
                                  <span className="text-muted-foreground">Tax Withheld: </span>
                                  <span className="font-medium">
                                    {formatCurrency(record.tax_withheld)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Net Income: </span>
                                  <span className="font-medium text-green-600 dark:text-green-400">
                                    {formatCurrency(calculateAnnualEarnings(record) - record.tax_withheld)}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          {record.allowances.length > 0 && (
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">Allowances: </span>
                              <span className="font-medium">
                                {record.allowances.map(a => a.name).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRecord(record)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {records.length === 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center text-muted-foreground">
                        <DollarSign className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                        <p>No compensation records yet</p>
                        <p className="text-sm">Add your first record to get started</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Briefcase className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p>Select a position to manage compensation</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Compensation Entry Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? 'Edit' : 'Add'} {entryMode === 'fuzzy' ? 'Quick Estimate' : entryMode === 'yearly' ? 'Yearly Summary' : 'Exact Payslip'} 
              {entryMode && ' for ' + selectedPosition?.job_title}
            </DialogTitle>
          </DialogHeader>
          
          {entryMode === 'fuzzy' && (
            <FuzzyCompensationForm
              record={editingRecord}
              onSave={handleSaveRecord}
              onCancel={() => setDialogOpen(false)}
            />
          )}
          
          {entryMode === 'yearly' && (
            <YearlyWageForm
              record={editingRecord}
              onSave={handleSaveRecord}
              onCancel={() => setDialogOpen(false)}
            />
          )}
          
          {entryMode === 'exact' && (
            <ExactCompensationForm
              record={editingRecord}
              onSave={handleSaveRecord}
              onCancel={() => setDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
