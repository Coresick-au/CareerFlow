import { useQuery } from '@tanstack/react-query';
import { invoke } from '../lib/tauri';
import { EarningsAnalysis, LoyaltyTaxAnalysis } from '../types';
import { TrendingUp, AlertTriangle, DollarSign, Clock, Target, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { formatCurrency } from '../lib/utils';

export function Analysis() {
  const { data: earnings, isLoading: earningsLoading } = useQuery({
    queryKey: ['earningsAnalysis'],
    queryFn: () => invoke<EarningsAnalysis>('calculate_earnings_analysis'),
  });

  const { data: loyaltyTax, isLoading: loyaltyLoading } = useQuery({
    queryKey: ['loyaltyTaxAnalysis'],
    queryFn: () => invoke<LoyaltyTaxAnalysis>('calculate_loyalty_tax'),
  });

  if (earningsLoading || loyaltyLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Career Analysis</h1>
        <p className="text-muted-foreground">Deep insights into your earning potential and loyalty tax</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Earnings Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Total</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(earnings?.current_total_compensation || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Effective Hourly</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(earnings?.current_effective_hourly_rate || 0)}/hr</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Market Position</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Income Percentile</span>
                  <Badge variant={earnings?.income_percentile && earnings.income_percentile > 75 ? 'default' : 
                                earnings?.income_percentile && earnings.income_percentile > 50 ? 'secondary' : 'destructive'}>
                    {earnings?.income_percentile.toFixed(0)}th
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${earnings?.income_percentile || 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">Key Insights</p>
                <div className="space-y-2">
                  {earnings?.insights.slice(0, 3).map((insight, index) => (
                    <div key={index} className="p-2 bg-muted rounded text-sm">
                      <p className="font-medium text-foreground">{insight.title}</p>
                      <p className="text-muted-foreground">{insight.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loyalty Tax Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Loyalty Tax Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Annual Impact</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(loyaltyTax?.annual_loyalty_tax[loyaltyTax.annual_loyalty_tax.length - 1]?.loyalty_tax_amount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cumulative</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(loyaltyTax?.cumulative_loyalty_tax || 0)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">Tenure Blocks</p>
                <div className="space-y-2">
                  {loyaltyTax?.tenure_blocks.slice(0, 3).map((block, index) => (
                    <div key={index} className="p-2 bg-muted rounded text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-foreground">{block.employer_name}</span>
                        <span className="text-red-600 dark:text-red-400">{formatCurrency(block.loyalty_tax_impact)}</span>
                      </div>
                      <p className="text-muted-foreground">
                        {block.years_of_service.toFixed(1)} years • {block.actual_progression.toFixed(1)}% vs {block.market_expected_progression.toFixed(1)}% expected
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Confidence Level:</strong> {((loyaltyTax?.confidence_level || 0) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Based on available career history and market benchmarks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <DollarSign className="w-4 h-4 mr-2" />
              Compensation Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Base Salary</span>
                <span className="font-medium">{formatCurrency(earnings?.current_total_compensation ? earnings.current_total_compensation * 0.7 : 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Overtime/Allowances</span>
                <span className="font-medium">{formatCurrency(earnings?.current_total_compensation ? earnings.current_total_compensation * 0.2 : 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Superannuation</span>
                <span className="font-medium">{formatCurrency(earnings?.current_total_compensation ? earnings.current_total_compensation * 0.1 : 0)}</span>
              </div>
              <div className="pt-2 border-t flex justify-between">
                <span className="font-medium">Total Package</span>
                <span className="font-bold">{formatCurrency(earnings?.current_total_compensation || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Clock className="w-4 h-4 mr-2" />
              Work Intensity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Standard Hours/Week</span>
                <span className="font-medium">38</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Average Overtime</span>
                <span className="font-medium text-orange-600">8 hours/week</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Hours/Week</span>
                <span className="font-medium">46 hours</span>
              </div>
              <div className="pt-2 border-t">
                <div className="text-xs text-gray-500">
                  <p>• 21% overtime intensity</p>
                  <p>• Consider work-life balance</p>
                  <p>• Overtime boosting effective rate</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Target className="w-4 h-4 mr-2" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-blue-50 rounded">
                <p className="font-medium text-blue-900">Market Review</p>
                <p className="text-blue-700">Consider negotiating every 18-24 months</p>
              </div>
              <div className="p-2 bg-green-50 rounded">
                <p className="font-medium text-green-900">Skills Development</p>
                <p className="text-green-700">Focus on high-demand certifications</p>
              </div>
              <div className="p-2 bg-purple-50 rounded">
                <p className="font-medium text-purple-900">Career Mobility</p>
                <p className="text-purple-700">Change roles every 3-5 years for growth</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Action Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Short Term (0-6 months)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Document specific achievements with metrics</li>
                <li>• Research market rates for your role</li>
                <li>• Update resume and LinkedIn profile</li>
                <li>• Schedule performance review</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Long Term (6-24 months)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Explore leadership opportunities</li>
                <li>• Build professional network</li>
                <li>• Consider contract vs permanent options</li>
                <li>• Plan next career move strategically</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
