import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PiggyBank, TrendingUp, Info } from 'lucide-react';
import { formatCurrency, getSuperGuaranteeRate, getCurrentFinancialYear } from '../lib/utils';

interface SuperTrackerProps {
    annualGross: number;
    employerContributions?: number; // If known from ATO data
    salarySacrifice?: number;
    additionalContributions?: number;
}

/**
 * Dedicated superannuation visibility card.
 * Shows employer contributions, salary sacrifice, and basic projections.
 */
export function SuperTracker({
    annualGross,
    employerContributions,
    salarySacrifice = 0,
    additionalContributions = 0,
}: SuperTrackerProps) {
    const currentFY = getCurrentFinancialYear();
    const superRate = getSuperGuaranteeRate();

    // Calculate expected employer contribution if not provided
    const calculatedEmployerSuper = annualGross * (superRate / 100);
    const actualEmployerSuper = employerContributions ?? calculatedEmployerSuper;

    // Total super for the year
    const totalSuper = actualEmployerSuper + salarySacrifice + additionalContributions;

    // Simple projection - assuming 7% annual return over 30 years
    const projectedBalance = totalSuper * Math.pow(1.07, 30) * (Math.pow(1.07, 30) - 1) / 0.07;

    // Concessional contributions cap (2024-25 is $30,000)
    const concessionalCap = 30000;
    const totalConcessional = actualEmployerSuper + salarySacrifice;
    const capUtilisation = (totalConcessional / concessionalCap) * 100;
    const remainingCap = Math.max(0, concessionalCap - totalConcessional);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <PiggyBank className="h-5 w-5 text-primary" />
                    Super Tracker
                    <span className="ml-auto text-sm font-normal text-muted-foreground">{currentFY}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Current Rate Info */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <span className="text-sm text-muted-foreground">Super Guarantee Rate</span>
                        <span className="font-semibold text-foreground">{superRate}%</span>
                    </div>

                    {/* Contributions Breakdown */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Employer contributions</span>
                            <span className="font-medium text-foreground">{formatCurrency(actualEmployerSuper)}</span>
                        </div>

                        {salarySacrifice > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Salary sacrifice</span>
                                <span className="font-medium text-foreground">{formatCurrency(salarySacrifice)}</span>
                            </div>
                        )}

                        {additionalContributions > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Additional contributions</span>
                                <span className="font-medium text-foreground">{formatCurrency(additionalContributions)}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-sm pt-2 border-t border-border">
                            <span className="font-medium text-foreground">Total for {currentFY}</span>
                            <span className="font-bold text-primary">{formatCurrency(totalSuper)}</span>
                        </div>
                    </div>

                    {/* Cap Utilisation */}
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">Concessional Cap Usage</span>
                            <span className="text-sm text-muted-foreground">{capUtilisation.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${Math.min(capUtilisation, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {remainingCap > 0 ? (
                                <>You can contribute up to {formatCurrency(remainingCap)} more this FY (cap: {formatCurrency(concessionalCap)})</>
                            ) : (
                                <>You've reached the {formatCurrency(concessionalCap)} concessional cap</>
                            )}
                        </p>
                    </div>

                    {/* Simple Projection */}
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                    30-Year Projection
                                </p>
                                <p className="text-lg font-bold text-green-800 dark:text-green-200">
                                    ~{formatCurrency(projectedBalance)}
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    If you maintain current contributions (assumes 7% p.a. return)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <p>
                            Projections are estimates only. Actual returns depend on market conditions and your super fund's performance.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
