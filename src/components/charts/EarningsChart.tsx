import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EarningsSnapshot } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { getChartColors } from '../../lib/chartTheme';

interface EarningsChartProps {
  data: EarningsSnapshot[];
}

export function EarningsChart({ data }: EarningsChartProps) {
  const colors = getChartColors();

  const chartData = data.map(snapshot => ({
    date: snapshot.date.toLocaleDateString('en-AU', { year: 'numeric', month: 'short' }),
    base: snapshot.base_annual,
    actual: snapshot.actual_annual,
    total: snapshot.total_with_super,
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: any; color: string; name: string; value: number }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 border rounded-lg shadow-lg">
          <p className="text-sm font-medium mb-2">{payload[0].payload.date}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: colors.text }}
          tickLine={{ stroke: colors.grid }}
          axisLine={{ stroke: colors.grid }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: colors.text }}
          tickLine={{ stroke: colors.grid }}
          axisLine={{ stroke: colors.grid }}
          tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="base"
          stroke={colors.slate}
          strokeWidth={2}
          dot={false}
          name="Base Salary"
        />
        <Line
          type="monotone"
          dataKey="actual"
          stroke={colors.primary}
          strokeWidth={2}
          dot={false}
          name="Actual Earnings"
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke={colors.success}
          strokeWidth={2}
          dot={false}
          name="Total with Super"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
