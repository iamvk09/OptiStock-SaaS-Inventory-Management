import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Check, AlertTriangle } from "lucide-react";

export default function AuditSession() {
    const { id } = useParams();
    const { token, organizationId } = useAuthStore();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [counts, setCounts] = useState<Record<string, number>>({});

    const { data: audit, isLoading } = useQuery({
        queryKey: ["audit", id],
        queryFn: async () => {
            const res = await axios.get(`http://localhost:3000/api/audit/${id}`, {
                headers: { Authorization: `Bearer ${token}`, "x-organization-id": organizationId },
            });
            return res.data;
        },
        enabled: !!id && !!organizationId,
    });

    const updateItemMutation = useMutation({
        mutationFn: async ({ variantId, quantity }: { variantId: string, quantity: number }) => {
            await axios.post(`http://localhost:3000/api/audit/${id}/item`, {
                product_variant_id: variantId,
                counted_quantity: quantity
            }, {
                headers: { Authorization: `Bearer ${token}`, "x-organization-id": organizationId },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["audit", id] });
        }
    });

    const finalizeMutation = useMutation({
        mutationFn: async () => {
            await axios.post(`http://localhost:3000/api/audit/${id}/finalize`, {}, {
                headers: { Authorization: `Bearer ${token}`, "x-organization-id": organizationId },
            });
        },
        onSuccess: () => {
            navigate("/inventory/audit");
        }
    });

    const handleCountChange = (variantId: string, val: string) => {
        setCounts(prev => ({ ...prev, [variantId]: parseInt(val) || 0 }));
    };

    const handleSaveCount = (variantId: string) => {
        const qty = counts[variantId];
        if (qty !== undefined) {
            updateItemMutation.mutate({ variantId, quantity: qty });
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (!audit) return <div>Audit not found</div>;

    const isCompleted = audit.status === "COMPLETED";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Audit: {audit.warehouse.name}</h1>
                    <p className="text-gray-500 text-sm">{audit.id}</p>
                </div>
                {!isCompleted && (
                    <Button
                        variant="destructive"
                        onClick={() => finalizeMutation.mutate()}
                        disabled={finalizeMutation.isPending}
                    >
                        Finalize Audit
                    </Button>
                )}
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Expected</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Counted</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {audit.items.map((item: any) => {
                            const variantId = item.variant.id;
                            const currentCount = counts[variantId] !== undefined ? counts[variantId] : (item.counted_quantity ?? "");
                            const hasDiscrepancy = item.counted_quantity !== null && item.counted_quantity !== item.expected_quantity;

                            return (
                                <tr key={item.id} className={hasDiscrepancy ? "bg-yellow-50" : ""}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {item.variant.product.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.variant.sku}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                        {item.expected_quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                        {isCompleted ? (
                                            item.counted_quantity
                                        ) : (
                                            <Input
                                                type="number"
                                                className="w-24 text-right ml-auto"
                                                value={currentCount}
                                                onChange={(e) => handleCountChange(variantId, e.target.value)}
                                            />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {!isCompleted && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleSaveCount(variantId)}
                                                disabled={updateItemMutation.isPending}
                                            >
                                                <Check className="h-4 w-4 text-green-600" />
                                            </Button>
                                        )}
                                        {hasDiscrepancy && <AlertTriangle className="h-4 w-4 text-yellow-500 inline ml-2" />}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
