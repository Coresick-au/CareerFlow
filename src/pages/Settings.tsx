import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '../lib/tauri';
import { DataBackup } from '../components/DataBackup';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { Database, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function Settings() {
  const queryClient = useQueryClient();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const loadSampleDataMutation = useMutation({
    mutationFn: () => invoke('load_sample_data'),
    onSuccess: () => {
      // Invalidate all data queries to refresh with sample data
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['compensationRecords'] });
      queryClient.invalidateQueries({ queryKey: ['earningsAnalysis'] });
      alert('Sample data loaded successfully!');
      // Auto-refresh to show all changes
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error) => {
      console.error('Failed to load sample data:', error);
      alert('Failed to load sample data. Please try again.');
    },
  });

  const clearDataMutation = useMutation({
    mutationFn: () => invoke('clear_all_data'),
    onSuccess: () => {
      setShowClearConfirm(false);
      // Invalidate all data queries to refresh with empty data
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['compensationRecords'] });
      queryClient.invalidateQueries({ queryKey: ['earningsAnalysis'] });
      alert('All data cleared successfully!');
      // Auto-refresh after a short delay to ensure state is clean
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error) => {
      console.error('Failed to clear data:', error);
      alert('Failed to clear data. Please try again.');
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and data</p>
      </div>

      <div className="space-y-6">
        {/* Test Data Controls */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Test Data Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Load realistic sample data to explore the application, or clear all data to start fresh.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => loadSampleDataMutation.mutate()}
                disabled={loadSampleDataMutation.isPending}
              >
                <Database className="w-4 h-4 mr-2" />
                {loadSampleDataMutation.isPending ? 'Loading...' : 'Load Sample Data'}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowClearConfirm(true)}
                disabled={clearDataMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {clearDataMutation.isPending ? 'Clearing...' : 'Clear All Data'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Backup */}
        <DataBackup />
      </div>

      {/* Confirmation Dialog for Clear All Data */}
      <ConfirmationDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        title="Clear All Data"
        description="This will permanently delete all your career data, positions, compensation records, and profile information."
        confirmPhrase="DELETE"
        confirmButtonText="Clear All Data"
        isLoading={clearDataMutation.isPending}
        onConfirm={() => clearDataMutation.mutate()}
      />
    </div>
  );
}
