import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, DollarSign, Clock, Calculator } from 'lucide-react';
import { WeeklyCompensationEntry } from '../types';
import {
    formatCurrency,
    formatCurrencyPrecise,
    calculateAverage,
    calculateMedian,
    projectAnnualIncome,
    getCurrentFinancialYear
} from '../lib/utils';

interface WeeklyIncomeProjectionProps {
    entries: WeeklyCompensationEntry[];
}

/**
 * Displays running statistics and projections based on weekly timesheet entries.
 * Updates as each new entry is added, showing average, median, and projected annual income.
 */
export function WeeklyIncomeProjection({ entries }: WeeklyIncomeProjectionProps) {
    if (entries.length === 0) {
        return null;
    }

    // Extract values for calculations
    const grossAmounts = entries.map(e => e.gross_pay);
    const netAmounts = entries.map(e => e.net_pay);
    const hoursWorked = entries.map(e => e.hours_ordinary + e.hours_overtime);

    // Calculate statistics
    const avgWeeklyGross = calculateAverage(grossAmounts);
    const medianWeeklyGross = calculateMedian(grossAmounts);
    const avgWeeklyNet = calculateAverage(netAmounts);
    const avgHoursPerWeek = calculateAverage(hoursWorked);

    // Project annual income
    const projectedAnnualGross = projectAnnualIncome(grossAmounts);
    const projectedAnnualNet = projectAnnualIncome(netAmounts);

    // Calculate real hourly rate (based on actual hours worked)
    const totalGross = grossAmounts.reduce((sum, val) => sum + val, 0);
    const totalHours = hoursWorked.reduce((sum, val) => sum + val, 0);
    const realHourlyRate = totalHours > 0 ? totalGross / totalHours : 0;

    const currentFY = getCurrentFinancialYear();

    return (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Calculator className="h-5 w-5 text-primary" />
                    Your Income Picture
                    <span className="text-sm font-normal text-muted-foreground ml-auto">
                        Based on {entries.length} week{entries.length !== 1 ? 's' : ''} entered
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Average Weekly (Gross) */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <DollarSign className="h-3 w-3" />
                            Avg weekly (gross)
                        </div>
                        <p className="text-xl font-bold text-foreground">
                            {formatCurrency(avgWeeklyGross)}
                        </p>
                    </div>

                    {/* Median Weekly (Gross) */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            Median weekly
                        </div>
                        <p className="text-xl font-bold text-foreground">
                            {formatCurrency(medianWeeklyGross)}
                        </p>
                    </div>

                    {/* Average Weekly (Take-home) */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <DollarSign className="h-3 w-3" />
                            Avg take-home
                        </div>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(avgWeeklyNet)}
                        </p>
                    </div>

                    {/* Average Hours */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Avg hours/week
                        </div>
                        <p className="text-xl font-bold text-foreground">
                            {avgHoursPerWeek.toFixed(1)}
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border my-4" />

                {/* Projections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Projected Annual */}
                    <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground mb-1">Projected Annual ({currentFY})</p>
                        <p className="text-2xl font-bold text-foreground">
                            {formatCurrency(projectedAnnualGross)}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                            Take-home: {formatCurrency(projectedAnnualNet)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Based on average × 52 weeks
                        </p>
                    </div>

                    {/* Real Hourly Rate */}
                    <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground mb-1">Real Hourly Rate</p>
                        <p className="text-2xl font-bold text-foreground">
                            {formatCurrencyPrecise(realHourlyRate)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Actual earnings ÷ actual hours
                        </p>
                    </div>

                    {/* Hours Insight */}
                    <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground mb-1">Work Intensity</p>
                        <p className="text-2xl font-bold text-foreground">
                            {avgHoursPerWeek > 38
                                ? `+${(avgHoursPerWeek - 38).toFixed(1)}hrs`
                                : avgHoursPerWeek < 38
                                    ? `${(avgHoursPerWeek - 38).toFixed(1)}hrs`
                                    : 'Standard'
                            }
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {avgHoursPerWeek > 38
                                ? 'Above standard 38-hour week'
                                : avgHoursPerWeek < 38
                                    ? 'Below standard 38-hour week'
                                    : 'On par with standard hours'
                            }
                        </p>
                    </div>
                </div>

                {/* Trend Indicator */}
                {entries.length >= 4 && (
                    <div className="mt-4 p-3 rounded-lg bg-muted/50">
                        <p className="text-sm">
                            <span className="font-medium">📈 Trend:</span>{' '}
                            {calculateTrend(grossAmounts)}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * Simple trend analysis - compares recent weeks to earlier weeks
 */
function calculateTrend(values: number[]): string {
    if (values.length < 4) return 'Not enough data';

    const midpoint = Math.floor(values.length / 2);
    const recentAvg = calculateAverage(values.slice(0, midpoint));
    const olderAvg = calculateAverage(values.slice(midpoint));

    const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (percentChange > 5) {
        return `Earnings trending up ${percentChange.toFixed(1)}% compared to earlier weeks`;
    } else if (percentChange < -5) {
        return `Earnings trending down ${Math.abs(percentChange).toFixed(1)}% compared to earlier weeks`;
    }
    return 'Earnings relatively stable';
}
