import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { Link } from "react-router-dom";
import StockTransferModal from "@/components/inventory/StockTransferModal";

export default function Inventory() {
    const { token, organizationId } = useAuthStore();
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    const { data: warehouses, isLoading: isLoadingWarehouses } = useQuery({
        queryKey: ["warehouses", organizationId],
        queryFn: async () => {
            const res = await axios.get("http://localhost:3000/api/warehouses", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-organization-id": organizationId,
                },
            });
            return res.data;
        },
        enabled: !!organizationId,
    });

    // Fetch products for the transfer modal
    const { data: products } = useQuery({
        queryKey: ["products", organizationId],
        queryFn: async () => {
            const res = await axios.get("http://localhost:3000/api/products", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-organization-id": organizationId,
                },
            });
            return res.data;
        },
        enabled: !!organizationId,
    });

    if (isLoadingWarehouses) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Inventory</h1>
                <div className="space-x-2">
                    <button
                        onClick={() => setIsTransferModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Transfer Stock
                    </button>
                    <Link to="/inventory/ledger" className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                        View Stock Ledger
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {warehouses?.map((warehouse: any) => (
                    <div key={warehouse.id} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium text-gray-900 truncate">{warehouse.name}</h3>
                                {warehouse.is_frozen && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Frozen
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-gray-500 truncate">{warehouse.location || "No location"}</p>

                            <div className="mt-4">
                                <div className="flex justify-between text-sm font-medium text-gray-900 mb-1">
                                    <span>Capacity</span>
                                    <span>{warehouse.utilization || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full ${(warehouse.utilization || 0) > 90 ? 'bg-red-600' :
                                                (warehouse.utilization || 0) > 75 ? 'bg-yellow-500' : 'bg-green-600'
                                            }`}
                                        style={{ width: `${Math.min(warehouse.utilization || 0, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {warehouse.capacity ? `${warehouse.capacity} units max` : 'Unlimited capacity'}
                                </p>
                            </div>

                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-900">Stock Levels</h4>
                                <ul className="mt-2 divide-y divide-gray-200">
                                    {warehouse.stock_levels?.slice(0, 3).map((level: any) => (
                                        <li key={level.id} className="py-2 flex justify-between text-sm">
                                            <span className="text-gray-600">{level.variant?.sku}</span>
                                            <span className="font-medium text-gray-900">{level.quantity}</span>
                                        </li>
                                    ))}
                                    {warehouse.stock_levels?.length > 3 && (
                                        <li className="py-2 text-xs text-gray-500 text-center">
                                            + {warehouse.stock_levels.length - 3} more items
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <StockTransferModal
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                warehouses={warehouses || []}
                products={products || []}
            />
        </div>
    );
}
