import { useQuery } from '@tanstack/react-query';
import { invoke } from '../lib/tauri';
import { 
  DollarSign, 
  Clock, 
  AlertTriangle,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EarningsAnalysis } from '../types';
import { EarningsChart } from '../components/charts/EarningsChart';
import { HoursEarningsChart } from '../components/charts/HoursEarningsChart';
import { InsightsCard } from '../components/cards/InsightsCard';

export function Dashboard() {
  const { data: analysis, isLoading } = useQuery({
    queryKey: ['earningsAnalysis'],
    queryFn: () => invoke<EarningsAnalysis>('calculate_earnings_analysis'),
  });
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatHourlyRate = (rate: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(rate);
  };

  if (isLoading || !analysis) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Career Dashboard</h1>
        <p className="text-muted-foreground">Your earnings analysis at a glance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Compensation</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(analysis.current_total_compensation)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">incl. super & allowances</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Effective Hourly Rate</p>
              <p className="text-2xl font-bold text-foreground">
                {formatHourlyRate(analysis.current_effective_hourly_rate)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">actual earnings</p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Income Percentile</p>
              <p className="text-2xl font-bold text-foreground">
                {analysis.income_percentile.toFixed(0)}th
              </p>
              <p className="text-xs text-muted-foreground mt-1">vs industry peers</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Loyalty Tax</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(analysis.loyalty_tax_cumulative)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">cumulative</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-foreground mb-4">Earnings Over Time</h2>
          <EarningsChart data={analysis.earnings_over_time} />
        </div>

        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-foreground mb-4">Hours vs Earnings</h2>
          <HoursEarningsChart data={analysis.hours_vs_earnings} />
        </div>
      </div>

      {/* Insights */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Key Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {analysis.insights.map((insight, index) => (
            <InsightsCard key={index} insight={insight} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">Ready to dive deeper?</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">Add your compensation details for more accurate analysis</p>
          </div>
          <button
            onClick={() => navigate('/compensation')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Compensation Data
          </button>
        </div>
      </div>
    </div>
  );
}
