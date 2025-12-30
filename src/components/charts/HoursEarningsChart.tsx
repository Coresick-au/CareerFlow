import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HoursEarningsPoint } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { getChartColors } from '../../lib/chartTheme';

interface HoursEarningsChartProps {
  data: HoursEarningsPoint[];
}

export function HoursEarningsChart({ data }: HoursEarningsChartProps) {
  const colors = getChartColors();

  const chartData = data.map(point => ({
    hours: point.total_hours_worked,
    earnings: point.total_earnings,
    overtimePercent: point.overtime_percentage,
    year: point.year,
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: any }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-3 border rounded-lg shadow-lg">
          <p className="text-sm font-medium mb-2">Year: {data.year}</p>
          <p className="text-sm">Hours Worked: {data.hours.toLocaleString()}</p>
          <p className="text-sm">Earnings: {formatCurrency(data.earnings)}</p>
          <p className="text-sm">Overtime: {data.overtimePercent.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis
          dataKey="hours"
          name="Hours Worked"
          tick={{ fontSize: 12, fill: colors.text }}
          tickLine={{ stroke: colors.grid }}
          axisLine={{ stroke: colors.grid }}
          label={{ value: 'Annual Hours', position: 'insideBottom', offset: -5, fill: colors.text }}
        />
        <YAxis
          dataKey="earnings"
          name="Earnings"
          tick={{ fontSize: 12, fill: colors.text }}
          tickLine={{ stroke: colors.grid }}
          axisLine={{ stroke: colors.grid }}
          tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
          label={{ value: 'Annual Earnings', angle: -90, position: 'insideLeft', fill: colors.text }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
        <Scatter
          dataKey="earnings"
          fill={colors.primary}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
