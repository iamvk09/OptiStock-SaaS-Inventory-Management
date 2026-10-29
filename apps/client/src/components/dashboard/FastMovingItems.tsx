import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FastMovingItem {
    id: string;
    name: string;
    sku: string;
    quantitySold: number;
}

interface FastMovingItemsProps {
    data: FastMovingItem[];
}

export default function FastMovingItems({ data }: FastMovingItemsProps) {
    if (!data || data.length === 0) {
        return <div className="text-sm text-gray-500 text-center py-4">No data available.</div>;
    }

    return (
        <div className="h-full w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={100}
                        tick={{ fontSize: 10 }}
                        interval={0}
                    />
                    <Tooltip
                        formatter={(value: number) => [`${value} units`, 'Sold']}
                        contentStyle={{ fontSize: '12px' }}
                    />
                    <Bar dataKey="quantitySold" fill="#8884d8" radius={[0, 4, 4, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#6366f1'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
