import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LowStockAlertsProps {
    data: { id: string; name: string; sku: string; quantity: number }[];
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
                <p>No low stock alerts.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {data.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="font-medium text-sm text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-red-600 dark:text-red-400">{item.quantity} units</p>
                        <Link to={`/products/${item.id}`} className="text-xs text-primary hover:underline flex items-center justify-end gap-1 mt-1">
                            Restock <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LowStockAlerts;
