import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HoursEarningsPoint } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface HoursEarningsChartProps {
  data: HoursEarningsPoint[];
}

export function HoursEarningsChart({ data }: HoursEarningsChartProps) {
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
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="text-sm font-medium mb-2">Year: {data.year}</p>
          <p className="text-sm">Hours Worked: {data.hours.toLocaleString()}</p>
          <p className="text-sm">Earnings: {formatCurrency(data.earnings)}</p>
          <p className="text-sm">Overtime: {data.overtimePercent.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const getDotColor = (overtimePercent: number) => {
    if (overtimePercent > 20) return '#ef4444'; // red for high overtime
    if (overtimePercent > 10) return '#f59e0b'; // amber for moderate
    return '#10b981'; // green for low
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="hours"
          name="Hours Worked"
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: '#e5e7eb' }}
          label={{ value: 'Annual Hours', position: 'insideBottom', offset: -5 }}
        />
        <YAxis 
          dataKey="earnings"
          name="Earnings"
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: '#e5e7eb' }}
          tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
          label={{ value: 'Annual Earnings', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
        <Scatter 
          dataKey="earnings" 
          fill={(entry: any) => getDotColor(entry.overtimePercent)}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
