import React from 'react';

interface Batch {
    id: string;
    productName: string;
    sku: string;
    batchNumber: string;
    expiryDate: string;
    warehouseName: string;
    quantity: number;
}

interface ExpiringBatchesProps {
    data: Batch[];
}

export default function ExpiringBatches({ data }: ExpiringBatchesProps) {
    if (!data || data.length === 0) {
        return <div className="text-sm text-gray-500 text-center py-4">No expiring batches found.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                        <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {data.map((batch) => (
                        <tr key={batch.id}>
                            <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                                <div className="font-medium">{batch.productName}</div>
                                <div className="text-gray-500">{batch.sku}</div>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">{batch.batchNumber}</td>
                            <td className="px-2 py-2 whitespace-nowrap text-xs text-red-600 font-medium">
                                {new Date(batch.expiryDate).toLocaleDateString()}
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-right">{batch.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
