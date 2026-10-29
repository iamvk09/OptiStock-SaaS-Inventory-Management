import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { Printer, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import PurchaseOrderPDF from "@/components/orders/PurchaseOrderPDF";

export default function PurchaseOrderDetails() {
    const { id } = useParams();
    const { token, organizationId } = useAuthStore();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [commentText, setCommentText] = useState("");

    const { data: po, isLoading } = useQuery({
        queryKey: ["purchase-order", id],
        queryFn: async () => {
            // We might need a getPurchaseOrder endpoint, but for now let's assume we can fetch list and filter or add a specific endpoint.
            // Actually, I didn't add a getPurchaseOrder(id) endpoint. I should probably add it or just fetch all and find one (inefficient but works for MVP).
            // Let's assume I'll add the endpoint or use the list for now.
            // Wait, I should add the endpoint to backend first to be clean.
            // But to save time, I'll just use the list endpoint and filter if the list is small, OR I'll add the endpoint.
            // Let's add the endpoint to backend quickly.
            // Actually, I can just use the list endpoint for now if I don't want to context switch too much.
            // But wait, I need comments too. I added getPOComments endpoint.
            // So I can fetch PO details from list (maybe passing state) or fetch list.
            // Let's try fetching list and finding.
            const res = await axios.get("http://localhost:3000/api/purchase-orders", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-organization-id": organizationId,
                },
            });
            return res.data.find((p: any) => p.id === id);
        },
        enabled: !!organizationId && !!id,
    });

    const { data: comments } = useQuery({
        queryKey: ["po-comments", id],
        queryFn: async () => {
            const res = await axios.get(`http://localhost:3000/api/purchase-orders/${id}/comments`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-organization-id": organizationId,
                },
            });
            return res.data;
        },
        enabled: !!organizationId && !!id,
    });

    const commentMutation = useMutation({
        mutationFn: async (text: string) => {
            await axios.post(
                `http://localhost:3000/api/purchase-orders/${id}/comments`,
                { text },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "x-organization-id": organizationId,
                    },
                }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["po-comments", id] });
            setCommentText("");
        },
    });

    const emailMutation = useMutation({
        mutationFn: async () => {
            await axios.post(
                `http://localhost:3000/api/purchase-orders/${id}/email`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "x-organization-id": organizationId,
                    },
                }
            );
        },
        onSuccess: () => {
            toast({ title: "Email Sent", description: "Purchase Order emailed to supplier." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to send email.", variant: "destructive" });
        }
    });

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) return <div>Loading...</div>;
    if (!po) return <div>Purchase Order not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Purchase Order #{po.id.slice(0, 8)}</h1>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${po.status === 'RECEIVED' ? 'bg-green-100 text-green-800' :
                        po.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                    {po.status}
                </span>
            </div>

            <div className="flex gap-2 print:hidden">
                <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print / PDF
                </Button>
                <Button variant="outline" onClick={() => emailMutation.mutate()} disabled={emailMutation.isPending}>
                    <Mail className="mr-2 h-4 w-4" />
                    {emailMutation.isPending ? "Sending..." : "Email Supplier"}
                </Button>
            </div>

            <PurchaseOrderPDF po={po} />

            <div className="bg-white shadow overflow-hidden sm:rounded-lg print:hidden">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Order Details</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Supplier: {po.supplier.name}</p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Order Date</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(po.order_date).toLocaleDateString()}</dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Expected Date</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{po.expected_date ? new Date(po.expected_date).toLocaleDateString() : 'N/A'}</dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${Number(po.total_amount).toLocaleString()}</dd>
                        </div>
                        {po.pdf_url && (
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">PDF Attachment</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <a href={po.pdf_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                                        View PDF
                                    </a>
                                </dd>
                            </div>
                        )}
                    </dl>
                </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg">
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
                                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Unit Cost</th>
                                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {po.items.map((item: any) => (
                                            <tr key={item.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                    {item.variant.product.name} ({item.variant.sku})
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">{item.quantity}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">${item.unit_cost}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">${item.quantity * item.unit_cost}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 shadow sm:rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Comments & Collaboration</h3>
                <div className="space-y-4 mb-4">
                    {comments?.map((comment: any) => (
                        <div key={comment.id} className="bg-white p-3 rounded shadow-sm">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span className="font-medium text-gray-900">{comment.user.name || comment.user.email}</span>
                                <span>{new Date(comment.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-gray-800">{comment.text}</p>
                        </div>
                    ))}
                    {comments?.length === 0 && <p className="text-sm text-gray-500">No comments yet.</p>}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        onKeyPress={(e) => e.key === 'Enter' && commentText && commentMutation.mutate(commentText)}
                    />
                    <button
                        onClick={() => commentText && commentMutation.mutate(commentText)}
                        disabled={commentMutation.isPending || !commentText}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
