import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "@/components/DashboardLayout";
import WidgetCard from "@/components/dashboard/WidgetCard";
import InventoryHeatmap from "@/components/dashboard/InventoryHeatmap";
import LowStockAlerts from "@/components/dashboard/LowStockAlerts";
import SalesTrends from "@/components/dashboard/SalesTrends";
import WarehouseUtilization from "@/components/dashboard/WarehouseUtilization";
import { motion } from "framer-motion";
import { Users, Package, Warehouse, DollarSign } from "lucide-react";

import PurchaseSalesChart from "@/components/dashboard/PurchaseSalesChart";
import CategoryValuationChart from "@/components/dashboard/CategoryValuationChart";
import ExpiryRiskWidget from "@/components/dashboard/ExpiryRiskWidget";

export default function Dashboard() {
    const { token, organizationId } = useAuthStore();

    const { data: stats, isLoading } = useQuery({
        queryKey: ["dashboard-stats", organizationId],
        queryFn: async () => {
            const res = await axios.get("http://localhost:3000/api/dashboard/stats", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-organization-id": organizationId,
                },
            });
            return res.data;
        },
        enabled: !!organizationId,
        refetchInterval: 10000, // Auto-refresh every 10 seconds
    });

    if (isLoading) return <div className="flex h-full items-center justify-center">Loading dashboard...</div>;

    const defaultLayout = [
        { i: 'summary', x: 0, y: 0, w: 12, h: 4 },
        { i: 'trends', x: 0, y: 4, w: 8, h: 9 },
        { i: 'utilization', x: 8, y: 4, w: 4, h: 9 },
        { i: 'purchaseSales', x: 0, y: 13, w: 6, h: 9 },
        { i: 'categoryValuation', x: 6, y: 13, w: 6, h: 9 },
        { i: 'heatmap', x: 0, y: 22, w: 6, h: 9 },
        { i: 'lowStock', x: 6, y: 22, w: 6, h: 9 },
        { i: 'expiryRisk', x: 0, y: 31, w: 6, h: 9 },
        { i: 'recentSales', x: 6, y: 31, w: 6, h: 9 },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Overview of your inventory performance</p>
                </div>
            </div>

            <DashboardLayout defaultLayout={defaultLayout}>
                <div key="summary">
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 h-full"
                    >
                        <KPICard title="Total Products" value={stats?.counters?.products || 0} icon={Package} color="text-blue-500" delay={0} />
                        <KPICard title="Total Warehouses" value={stats?.counters?.warehouses || 0} icon={Warehouse} color="text-purple-500" delay={0.1} />
                        <KPICard title="Total Customers" value={stats?.counters?.customers || 0} icon={Users} color="text-green-500" delay={0.2} />
                        <KPICard title="Total Suppliers" value={stats?.counters?.suppliers || 0} icon={Users} color="text-orange-500" delay={0.3} />
                        <KPICard title="Valuation" value={`$${Number(stats?.valuation || 0).toLocaleString()}`} icon={DollarSign} color="text-emerald-500" delay={0.4} />
                    </motion.div>
                </div>

                <WidgetCard key="trends" title="Sales Trends (Last 7 Days)">
                    <SalesTrends data={stats?.salesTrends || []} />
                </WidgetCard>

                <WidgetCard key="utilization" title="Warehouse Utilization">
                    <WarehouseUtilization data={stats?.warehouseUtilization || []} />
                </WidgetCard>

                <WidgetCard key="purchaseSales" title="Purchase vs Sales (Last 6 Months)">
                    <PurchaseSalesChart data={stats?.purchaseVsSales || []} />
                </WidgetCard>

                <WidgetCard key="categoryValuation" title="Inventory Value by Category">
                    <CategoryValuationChart data={stats?.categoryValuation || []} />
                </WidgetCard>

                <WidgetCard key="heatmap" title="Stock Distribution by Category">
                    <InventoryHeatmap data={stats?.heatmapData || []} />
                </WidgetCard>

                <WidgetCard key="lowStock" title="Low Stock Alerts">
                    <LowStockAlerts data={stats?.lowStock || []} />
                </WidgetCard>

                <WidgetCard key="expiryRisk" title="Expiry Risk (Next 30 Days)">
                    <ExpiryRiskWidget data={stats?.expiringBatches || []} />
                </WidgetCard>

                <WidgetCard key="recentSales" title="Recent Sales">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {stats?.recentSales?.map((sale: any) => (
                                    <tr key={sale.id}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{sale.customer}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{new Date(sale.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${sale.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                    sale.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {sale.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">${Number(sale.amount).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </WidgetCard>
            </DashboardLayout>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, color }: any) {
    return (
        <motion.div
            variants={{
                hidden: { y: 20, opacity: 0 },
                show: { y: 0, opacity: 1 }
            }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="glass-card p-6 flex flex-col justify-between relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className={`h-16 w-16 ${color}`} />
            </div>
            <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
                <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
            </div>
            <div className={`mt-4 h-1 w-full bg-gradient-to-r from-transparent via-${color.split('-')[1]}-500 to-transparent opacity-50`} />
        </motion.div>
    );
}
