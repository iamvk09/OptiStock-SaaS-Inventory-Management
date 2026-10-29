import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { Link } from "react-router-dom";

export default function PurchaseOrders() {
    const { token, organizationId } = useAuthStore();
    const [showSuggestions, setShowSuggestions] = useState(false);

    const { data: orders, isLoading } = useQuery({
        queryKey: ["purchase-orders", organizationId],
        queryFn: async () => {
            const res = await axios.get("http://localhost:3000/api/purchase-orders", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-organization-id": organizationId,
                },
            });
            return res.data;
        },
        enabled: !!organizationId,
    });

    const { data: suggestions } = useQuery({
        queryKey: ["restock-suggestions", organizationId],
        queryFn: async () => {
            const res = await axios.get("http://localhost:3000/api/purchase-orders/suggestions", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-organization-id": organizationId,
                },
            });
            return res.data;
        },
        enabled: !!organizationId && showSuggestions,
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Purchase Orders</h1>
                <button
                    onClick={() => setShowSuggestions(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                    Restock Suggestions
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {orders?.map((order: any) => (
                        <li key={order.id}>
                            <Link to={`/orders/purchase/${order.id}`} className="block hover:bg-gray-50 px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-indigo-600 truncate">PO #{order.id.slice(0, 8)}</p>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {order.status}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500">
                                            Supplier: {order.supplier.name}
                                        </p>
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                        <p>
                                            Total: ${order.total_amount}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                    {orders?.length === 0 && (
                        <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                            No purchase orders found.
                        </li>
                    )}
                </ul>
            </div>

            {showSuggestions && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Restock Suggestions</h2>
                            <button onClick={() => setShowSuggestions(false)} className="text-gray-500 hover:text-gray-700">
                                Close
                            </button>
                        </div>

                        {suggestions?.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
                                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
                                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Suggested</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {suggestions.map((item: any) => (
                                        <tr key={item.product_variant_id}>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {item.name} ({item.sku})
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                {item.current_stock}
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                {item.threshold}
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-indigo-600 font-bold text-right">
                                                {item.suggested_quantity}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No items need restocking.</p>
                        )}

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowSuggestions(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
