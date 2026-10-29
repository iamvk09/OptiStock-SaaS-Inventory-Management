import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface InventoryAgingProps {
    data: {
        '0-30': number;
        '31-60': number;
        '61-90': number;
        '90+': number;
    };
}

const COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];

export default function InventoryAging({ data }: InventoryAgingProps) {
    if (!data) {
        return <div className="text-sm text-gray-500 text-center py-4">No data available.</div>;
    }

    const chartData = [
        { name: '0-30 Days', value: data['0-30'] },
        { name: '31-60 Days', value: data['31-60'] },
        { name: '61-90 Days', value: data['61-90'] },
        { name: '90+ Days', value: data['90+'] },
    ].filter(item => item.value > 0);

    if (chartData.length === 0) {
        return <div className="text-sm text-gray-500 text-center py-4">No aging stock found.</div>;
    }

    return (
        <div className="h-full w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
