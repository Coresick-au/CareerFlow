import { EarningsInsight, InsightCategory } from '../../types';
import { AlertTriangle, TrendingUp, TrendingDown, Info, DollarSign, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

interface InsightsCardProps {
  insight: EarningsInsight;
}

export function InsightsCard({ insight }: InsightsCardProps) {
  const getIcon = (category: InsightCategory) => {
    switch (category) {
      case InsightCategory.Underpaid:
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case InsightCategory.Overpaid:
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case InsightCategory.OvertimeHeavy:
        return <Clock className="w-5 h-5 text-orange-500" />;
      case InsightCategory.LoyaltyTax:
        return <DollarSign className="w-5 h-5 text-purple-500" />;
      case InsightCategory.MarketOpportunity:
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case InsightCategory.SkillsGap:
        return <Info className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getVariant = (category: InsightCategory) => {
    switch (category) {
      case InsightCategory.Underpaid:
        return 'destructive';
      case InsightCategory.Overpaid:
        return 'default';
      case InsightCategory.OvertimeHeavy:
        return 'secondary';
      case InsightCategory.LoyaltyTax:
        return 'outline';
      case InsightCategory.MarketOpportunity:
        return 'default';
      case InsightCategory.SkillsGap:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start space-x-3">
          {getIcon(insight.category)}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-foreground">{insight.title}</h3>
              <Badge variant={getVariant(insight.category)}>
                {insight.confidence_level}% confidence
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
            {insight.data_points.length > 0 && (
              <ul className="text-xs text-muted-foreground space-y-1">
                {insight.data_points.map((point, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2"></span>
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
