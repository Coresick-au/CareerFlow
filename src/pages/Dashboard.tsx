import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '../lib/tauri';
import {
  DollarSign,
  Clock,
  AlertTriangle,
  Users,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EarningsAnalysis, UserProfile as UserProfileType } from '../types';
import { EarningsChart } from '../components/charts/EarningsChart';
import { HoursEarningsChart } from '../components/charts/HoursEarningsChart';
import { CompensationBreakdownChart } from '../components/charts/CompensationBreakdownChart';
import { InsightsCard } from '../components/cards/InsightsCard';
import { RealityCheckCard } from '../components/cards/RealityCheckCard';
import { WelcomeModal } from '../components/WelcomeModal';
import { LoyaltyTaxTooltip } from '../components/LoyaltyTaxTooltip';
import { SuperTracker } from '../components/SuperTracker';
import { formatCurrency, formatCurrencyPrecise } from '../lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

export function Dashboard() {
  const queryClient = useQueryClient();
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const { data: analysis, isLoading } = useQuery({
    queryKey: ['earningsAnalysis'],
    queryFn: () => invoke<EarningsAnalysis>('calculate_earnings_analysis'),
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => invoke<UserProfileType>('get_user_profile'),
  });

  const navigate = useNavigate();

  const loadSampleDataMutation = useMutation({
    mutationFn: () => invoke('load_sample_data'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['compensationRecords'] });
      queryClient.invalidateQueries({ queryKey: ['earningsAnalysis'] });
    },
  });

  const availableYears = useMemo(() => {
    if (!analysis?.earnings_over_time) return [];
    const years = new Set(analysis.earnings_over_time.map(s => {
      // Use financial year logic or just calendar year?
      // EarningsSnapshot has a date.
      return new Date(s.date).getFullYear().toString();
    }));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [analysis]);

  const filteredMetrics = useMemo(() => {
    if (!analysis) return null;
    if (selectedYear === 'all') return {
      total: analysis.current_total_compensation,
      hourly: analysis.current_effective_hourly_rate,
      percentile: analysis.income_percentile,
      loyalty: analysis.loyalty_tax_cumulative
    };

    // Find snapshot for selected year
    // Note: snapshots are points in time. If we have date '2024-01-15', it represents that year.
    const snapshot = analysis.earnings_over_time.find(s => new Date(s.date).getFullYear().toString() === selectedYear);
    if (!snapshot) return null;

    return {
      total: snapshot.total_with_super,
      hourly: snapshot.effective_hourly_rate,
      percentile: analysis.income_percentile, // Kept constant for now or needs historic data
      loyalty: analysis.loyalty_tax_cumulative // Kept constant
    };
  }, [analysis, selectedYear]);

  const selectedYearSnapshot = useMemo(() => {
    if (!analysis || selectedYear === 'all') return null;
    return analysis.earnings_over_time.find(s => new Date(s.date).getFullYear().toString() === selectedYear);
  }, [analysis, selectedYear]);


  // Show loading skeleton only while fetching
  if (isLoading) {
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

  // Show empty state when no data
  if (!analysis) {
    // ... keeping existing empty state logic ...
    const hasProfile = userProfile && userProfile.first_name;

    return (
      <div className="p-6">
        <WelcomeModal onLoadSampleData={() => loadSampleDataMutation.mutate()} />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Career Dashboard</h1>
          <p className="text-muted-foreground">Your earnings analysis at a glance</p>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px] bg-card rounded-xl border border-border p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <DollarSign className="w-8 h-8 text-primary" />
          </div>

          {hasProfile ? (
            <>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Welcome back, {userProfile.first_name}!
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Your profile is set up. Now add your career positions and compensation
                to unlock powerful earnings insights.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => navigate('/ledger')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Add Your First Position
                </button>
                <button
                  onClick={() => loadSampleDataMutation.mutate()}
                  disabled={loadSampleDataMutation.isPending}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  {loadSampleDataMutation.isPending ? 'Loading...' : 'Load Sample Data'}
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to CareerFlow</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Get started by setting up your profile, then add your career positions and compensation.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => navigate('/profile')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Set Up Your Profile
                </button>
                <button
                  onClick={() => loadSampleDataMutation.mutate()}
                  disabled={loadSampleDataMutation.isPending}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  {loadSampleDataMutation.isPending ? 'Loading...' : 'Load Sample Data'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Welcome Modal for first-time users */}
      <WelcomeModal onLoadSampleData={() => loadSampleDataMutation.mutate()} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Career Dashboard</h1>
          <p className="text-muted-foreground">Your earnings analysis at a glance</p>
        </div>

        {availableYears.length > 0 && (
          <div className="w-[180px]">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {selectedYear === 'all' ? 'Total Current Compensation' : `Total Comp (${selectedYear})`}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(filteredMetrics?.total || 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">incl. super & allowances</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Effective Hourly Rate</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrencyPrecise(filteredMetrics?.hourly || 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">actual earnings</p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Income Percentile</p>
              <p className="text-2xl font-bold text-foreground">
                {filteredMetrics?.percentile.toFixed(0)}th
              </p>
              <p className="text-xs text-muted-foreground mt-1">vs industry peers</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium text-muted-foreground">Loyalty Tax</p>
                <LoyaltyTaxTooltip />
              </div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(filteredMetrics?.loyalty || 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">cumulative opportunity cost</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {selectedYear === 'all' ? 'Earnings Over Time' : `Compensation Breakdown (${selectedYear})`}
          </h2>
          {selectedYear === 'all' ? (
            <EarningsChart data={analysis.earnings_over_time} />
          ) : (
            selectedYearSnapshot ? (
              <CompensationBreakdownChart
                data={{
                  base: selectedYearSnapshot.base_annual,
                  allowances: selectedYearSnapshot.allowances_annual,
                  bonus: selectedYearSnapshot.bonuses_annual,
                  super: selectedYearSnapshot.total_with_super - selectedYearSnapshot.actual_annual
                }}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data for selected year
              </div>
            )
          )}
        </div>

        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Hours vs Earnings</h2>
          <HoursEarningsChart data={analysis.hours_vs_earnings} />
        </div>
      </div>

      {/* Insights and Reality Check */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Key Insights</h2>
          <div className="space-y-4">
            {analysis.insights.map((insight, index) => (
              <InsightsCard key={index} insight={insight} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <RealityCheckCard
            actualHoursPerWeek={selectedYearSnapshot ? (selectedYearSnapshot.effective_hourly_rate ? (selectedYearSnapshot.total_with_super / selectedYearSnapshot.effective_hourly_rate / 52) : 38) : (analysis.current_weekly_hours || 38)}
            standardHoursPerWeek={userProfile?.standard_weekly_hours || 38}
            annualGross={filteredMetrics?.total || analysis.current_total_compensation}
            yearsAtCurrentEmployer={analysis.years_since_last_change || 0}
          />

          <SuperTracker
            annualGross={filteredMetrics?.total || analysis.current_total_compensation}
            employerContributions={selectedYearSnapshot ? (selectedYearSnapshot.total_with_super - selectedYearSnapshot.actual_annual) : analysis.super_summary?.employer_contributions}
            salarySacrifice={selectedYearSnapshot ? 0 : analysis.super_summary?.personal_contributions}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">Ready to dive deeper?</h3>
            <p className="text-sm text-muted-foreground">Add your income details for more accurate analysis</p>
          </div>
          <button
            onClick={() => navigate('/ledger')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to Career Ledger
          </button>
        </div>
      </div>
    </div>
  );
}
