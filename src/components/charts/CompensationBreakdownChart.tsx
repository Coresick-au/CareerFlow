
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../lib/utils';

interface CompensationBreakdownProps {
    data: {
        base: number;
        allowances: number;
        bonus: number;
        super: number;
    };
}

export function CompensationBreakdownChart({ data }: CompensationBreakdownProps) {
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
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" hide />
                <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
                />
                <Legend />
                <Bar dataKey="base" name="Base Salary" stackId="a" fill="#94a3b8" radius={[0, 0, 0, 0]} />
                <Bar dataKey="allowances" name="Allowances & Overtime" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="bonus" name="Bonuses" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} />
                <Bar dataKey="super" name="Superannuation" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
