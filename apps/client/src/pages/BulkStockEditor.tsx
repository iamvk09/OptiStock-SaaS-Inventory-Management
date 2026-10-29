import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface StockEdit {
    id: string;
    quantity: number;
}

export default function BulkStockEditor() {
    const { token, organizationId } = useAuthStore();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [edits, setEdits] = useState<Record<string, number>>({});

    const { data: stockLevels, isLoading } = useQuery({
        queryKey: ["stock-levels", organizationId],
        queryFn: async () => {
            // We need an endpoint to get all stock levels. 
            // Assuming we can reuse an existing one or create a specific one.
            // For now, let's assume we fetch from /api/inventory/stock-levels (need to verify/create this)
            // Or we can use the warehouse endpoint and aggregate.
            // Let's use a new endpoint for simplicity in this "mock" implementation or reuse warehouse details.
            // Actually, let's fetch warehouses and their stock.
            const res = await axios.get("http://localhost:3000/api/warehouses", {
                headers: { Authorization: `Bearer ${token}`, "x-organization-id": organizationId },
            });
            // Flatten stock levels
            const allStock: any[] = [];
            for (const wh of res.data) {
                const whRes = await axios.get(`http://localhost:3000/api/warehouses/${wh.id}`, {
                    headers: { Authorization: `Bearer ${token}`, "x-organization-id": organizationId },
                });
                if (whRes.data.stock_levels) {
                    allStock.push(...whRes.data.stock_levels.map((sl: any) => ({ ...sl, warehouseName: wh.name })));
                }
            }
            return allStock;
        },
        enabled: !!organizationId,
    });

    const updateMutation = useMutation({
        mutationFn: async (updates: StockEdit[]) => {
            // We need a batch update endpoint. 
            // For now, we'll loop through updates (not ideal for large data, but works for MVP)
            // Or better, create a bulk update endpoint.
            // Let's loop for safety with existing APIs.
            // Loop for safety with existing APIs.
            // for (const update of updates) {
            //    // Logic placeholder
            // }
            // Placeholder for backend implementation
            await axios.post("http://localhost:3000/api/inventory/bulk-update", { updates }, {
                headers: { Authorization: `Bearer ${token}`, "x-organization-id": organizationId },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stock-levels"] });
            setEdits({});
            toast({ title: "Success", description: "Stock levels updated successfully" });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to update stock levels", variant: "destructive" });
        }
    });

    const handleChange = (id: string, value: string) => {
        setEdits(prev => ({ ...prev, [id]: parseInt(value) || 0 }));
    };

    const handleSave = () => {
        const updates = Object.entries(edits).map(([id, quantity]) => ({ id, quantity }));
        if (updates.length === 0) return;
        updateMutation.mutate(updates);
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Bulk Stock Editor</h1>
                <Button onClick={handleSave} disabled={updateMutation.isPending || Object.keys(edits).length === 0}>
                    <Save className="mr-2 h-4 w-4" />
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {stockLevels?.map((stock: any) => {
                            const currentQty = edits[stock.id] !== undefined ? edits[stock.id] : stock.quantity;
                            const isEdited = edits[stock.id] !== undefined && edits[stock.id] !== stock.quantity;

                            return (
                                <tr key={stock.id} className={isEdited ? "bg-yellow-50" : ""}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {stock.variant?.product?.name || "Unknown"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {stock.variant?.sku}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {stock.warehouseName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {stock.batch_number || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                        <Input
                                            type="number"
                                            className="w-24 text-right ml-auto"
                                            value={currentQty}
                                            onChange={(e) => handleChange(stock.id, e.target.value)}
                                        />
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
