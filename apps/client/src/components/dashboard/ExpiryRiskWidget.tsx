import { AlertTriangle } from "lucide-react";

interface ExpiryRiskWidgetProps {
    data: {
        id: string;
        productName: string;
        sku: string;
        batchNumber: string | null;
        expiryDate: string;
        warehouseName: string;
        quantity: number;
    }[];
}

export default function ExpiryRiskWidget({ data }: ExpiryRiskWidgetProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <p>No expiring items found.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {data.map((item) => {
                        const daysUntilExpiry = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        const isCritical = daysUntilExpiry <= 7;

                        return (
                            <tr key={item.id}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                    <div className="font-medium">{item.productName}</div>
                                    <div className="text-xs text-gray-500">{item.sku}</div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.batchNumber || "N/A"}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                    <div className={`flex items-center ${isCritical ? "text-red-600 font-bold" : "text-orange-600"}`}>
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        {new Date(item.expiryDate).toLocaleDateString()}
                                        <span className="ml-1 text-xs">({daysUntilExpiry}d)</span>
                                    </div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{item.quantity}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
