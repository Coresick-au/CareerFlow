import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../lib/utils';
import { getChartColors } from '../../lib/chartTheme';

interface CompensationBreakdownProps {
    data: {
        base: number;
        allowances: number;
        bonus: number;
        super: number;
    };
}

export function CompensationBreakdownChart({ data }: CompensationBreakdownProps) {
    const colors = getChartColors();

    const chartData = [
        {
            name: 'Components',
            base: data.base,
            allowances: data.allowances,
            bonus: data.bonus,
            super: data.super,
        }
    ];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                <XAxis
                    type="number"
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    tick={{ fill: colors.text }}
                    tickLine={{ stroke: colors.grid }}
                    axisLine={{ stroke: colors.grid }}
                />
                <YAxis type="category" dataKey="name" hide />
                <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
                />
                <Legend />
                <Bar dataKey="base" name="Base Salary" stackId="a" fill={colors.slate} radius={[0, 0, 0, 0]} />
                <Bar dataKey="allowances" name="Allowances & Overtime" stackId="a" fill={colors.primary} radius={[0, 0, 0, 0]} />
                <Bar dataKey="bonus" name="Bonuses" stackId="a" fill={colors.warning} radius={[0, 0, 0, 0]} />
                <Bar dataKey="super" name="Superannuation" stackId="a" fill={colors.success} radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
