import { useState } from 'react';
import { invoke } from '../lib/tauri';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

export function DataBackup() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setMessage(null);

    try {
      const data = await invoke<any>('export_all_data');

      // Create a blob with the data
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `careerflow-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid file format');
      }

      // Import the data
      const result = await invoke<any>('import_all_data', { data });

      setMessage({
        type: 'success',
        text: `Data imported successfully! Imported: ${result.imported.positions} positions, ${result.imported.compensation} compensation records`
      });

      // Refresh the page to show imported data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to import data. Please check the file format.' });
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Data Backup & Restore
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Export Data</h3>
          <p className="text-sm text-muted-foreground">
            Download all your career data as a JSON file for safekeeping.
          </p>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export All Data'}
          </Button>
        </div>

        <div className="border-t pt-4 space-y-2">
          <h3 className="text-sm font-medium text-foreground">Import Data</h3>
          <p className="text-sm text-muted-foreground">
            Restore your data from a previously exported JSON file.
            This will replace all existing data.
          </p>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="hidden"
              />
              <Button
                variant="outline"
                disabled={isImporting}
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  {isImporting ? 'Importing...' : 'Choose File'}
                </span>
              </Button>
            </label>
          </div>
        </div>

        {message && (
          <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            {message.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Keep your backup files secure as they contain sensitive personal and financial information.
            Regular backups are recommended.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
