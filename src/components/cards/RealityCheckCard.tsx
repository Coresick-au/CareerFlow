import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertTriangle, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { formatCurrency, formatCurrencyPrecise } from '../../lib/utils';
import { LoyaltyTaxTooltip } from '../LoyaltyTaxTooltip';

interface RealityCheckCardProps {
    actualHoursPerWeek: number;
    standardHoursPerWeek: number;
    annualGross: number;
    marketAverageRate?: number; // Optional market comparison
    yearsAtCurrentEmployer?: number;
}

/**
 * A prominent Dashboard card showing the "real" picture of earnings.
 * Compares actual hours worked vs contracted, calculates real hourly rate,
 * and highlights loyalty tax if applicable.
 */
export function RealityCheckCard({
    actualHoursPerWeek,
    standardHoursPerWeek,
    annualGross,
    marketAverageRate,
    yearsAtCurrentEmployer = 0,
}: RealityCheckCardProps) {
    // Calculate real hourly rate based on actual hours worked
    const actualAnnualHours = actualHoursPerWeek * 52;
    const realHourlyRate = actualAnnualHours > 0 ? annualGross / actualAnnualHours : 0;

    // Calculate what rate would be if working standard hours
    const standardAnnualHours = standardHoursPerWeek * 52;
    const standardHourlyRate = standardAnnualHours > 0 ? annualGross / standardAnnualHours : 0;

    // Calculate overtime intensity
    const overtimeHours = Math.max(0, actualHoursPerWeek - standardHoursPerWeek);
    const overtimePercentage = standardHoursPerWeek > 0
        ? ((actualHoursPerWeek - standardHoursPerWeek) / standardHoursPerWeek) * 100
        : 0;

    // Market comparison
    const belowMarket = marketAverageRate && realHourlyRate < marketAverageRate;
    const marketDifference = marketAverageRate ? marketAverageRate - realHourlyRate : 0;
    const annualMarketGap = marketDifference * actualAnnualHours;

    // Determine if there's a concern
    const hasOvertimeConcern = overtimeHours > 5; // More than 5 hours overtime
    const hasMarketConcern = belowMarket && marketDifference > 5; // More than $5/hr below market
    const hasLoyaltyConcern = yearsAtCurrentEmployer >= 2;

    const hasConcerns = hasOvertimeConcern || hasMarketConcern || hasLoyaltyConcern;

    return (
        <Card className={`${hasConcerns ? 'border-orange-500/50' : 'border-green-500/50'}`}>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    {hasConcerns ? (
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                    ) : (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                    )}
                    Reality Check
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Real Hourly Rate */}
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-muted-foreground">Your real hourly rate</p>
                            <p className="text-2xl font-bold text-foreground">
                                {formatCurrencyPrecise(realHourlyRate)}/hr
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Based on {actualHoursPerWeek} hours × 52 weeks
                            </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-muted-foreground" />
                    </div>

                    {/* Overtime Warning */}
                    {hasOvertimeConcern && (
                        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                                    Working +{overtimeHours.toFixed(1)} hours overtime
                                </span>
                            </div>
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                That's {overtimePercentage.toFixed(0)}% above your {standardHoursPerWeek}-hour contract.
                                Your contracted rate is {formatCurrencyPrecise(standardHourlyRate)}/hr.
                            </p>
                        </div>
                    )}

                    {/* Market Comparison */}
                    {hasMarketConcern && marketAverageRate && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                                    {formatCurrencyPrecise(marketDifference)}/hr below market
                                </span>
                            </div>
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                Market average: {formatCurrencyPrecise(marketAverageRate)}/hr.
                                If paid market rate, you'd earn an extra {formatCurrency(annualMarketGap)}/year.
                            </p>
                        </div>
                    )}

                    {/* Loyalty Tax Warning */}
                    {hasLoyaltyConcern && (
                        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                    {yearsAtCurrentEmployer}+ years at current employer
                                </span>
                                <LoyaltyTaxTooltip />
                            </div>
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                Job changers typically see 10-20% salary increases vs 2-3% internal raises.
                            </p>
                        </div>
                    )}

                    {/* All Good */}
                    {!hasConcerns && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                    Looking good!
                                </span>
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                Your work intensity and compensation appear well-balanced.
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
