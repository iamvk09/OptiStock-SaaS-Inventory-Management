import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function SalesOrders() {
    const { token, organizationId } = useAuthStore();

    const { data: orders, isLoading } = useQuery({
        queryKey: ["sales-orders", organizationId],
        queryFn: async () => {
            const res = await axios.get("http://localhost:3000/api/sales-orders", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-organization-id": organizationId,
                },
            });
            return res.data;
        },
        enabled: !!organizationId,
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Sales Orders</h1>
                <Link to="/orders/packing">
                    <Button>Go to Packing Station</Button>
                </Link>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {orders?.map((order: any) => (
                        <li key={order.id} className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                                <Link to={`/orders/sales/${order.id}`} className="text-sm font-medium text-indigo-600 truncate hover:underline">
                                    SO #{order.id.slice(0, 8)}
                                </Link>
                                <div className="ml-2 flex-shrink-0 flex">
                                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        {order.status}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                        Customer: {order.customer.name}
                                    </p>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    <p>
                                        Total: ${order.total_amount}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
