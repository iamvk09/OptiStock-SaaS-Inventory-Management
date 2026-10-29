import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import SalesOrderPDF from "@/components/orders/SalesOrderPDF";

export default function SalesOrderDetails() {
    const { id } = useParams();
    const { token, organizationId } = useAuthStore();

    const { data: so, isLoading } = useQuery({
        queryKey: ["sales-order", id],
        queryFn: async () => {
            const res = await axios.get(`http://localhost:3000/api/sales-orders/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-organization-id": organizationId,
                },
            });
            return res.data;
        },
        enabled: !!organizationId && !!id,
    });

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) return <div>Loading...</div>;
    if (!so) return <div>Sales Order not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Sales Order #{so.id.slice(0, 8)}</h1>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${so.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        so.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'}`}>
                    {so.status}
                </span>
            </div>

            <div className="flex gap-2 print:hidden">
                <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print / PDF
                </Button>
            </div>

            <SalesOrderPDF so={so} />

            <div className="bg-white shadow overflow-hidden sm:rounded-lg print:hidden">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Order Details</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Customer: {so.customer.name}</p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Order Date</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(so.created_at).toLocaleDateString()}</dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${Number(so.total_amount).toLocaleString()}</dd>
                        </div>
                        {so.notes && (
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{so.notes}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg print:hidden">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Items</h3>
                    <div className="mt-4 flex flex-col">
                        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead>
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Product</th>
                                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Quantity</th>
                                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Unit Price</th>
                                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {so.items.map((item: any) => (
                                            <tr key={item.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                    {item.variant.product.name} ({item.variant.sku})
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">{item.quantity}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">${item.unit_price}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">${item.quantity * item.unit_price}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
