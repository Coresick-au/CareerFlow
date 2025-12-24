import { DataBackup } from '../components/DataBackup';

export function Settings() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your application settings and data</p>
      </div>

      <div className="space-y-6">
        <DataBackup />
      </div>
    </div>
  );
}
