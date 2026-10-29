import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { X } from "lucide-react";

interface StockTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    warehouses: any[];
    products: any[];
}

export default function StockTransferModal({ isOpen, onClose, warehouses, products }: StockTransferModalProps) {
    const { token, organizationId } = useAuthStore();
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [serverError, setServerError] = useState("");

    const transferMutation = useMutation({
        mutationFn: async (data: any) => {
            await axios.post(
                "http://localhost:3000/api/inventory/transfer",
                {
                    ...data,
                    quantity: Number(data.quantity),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "x-organization-id": organizationId,
                    },
                }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory-ledger"] });
            queryClient.invalidateQueries({ queryKey: ["warehouse-stats"] }); // Assuming we have this
            reset();
            onClose();
            alert("Stock transferred successfully!");
        },
        onError: (error: any) => {
            setServerError(error.response?.data?.message || "Failed to transfer stock");
        },
    });

    const onSubmit = (data: any) => {
        setServerError("");
        if (data.from_warehouse_id === data.to_warehouse_id) {
            setServerError("Source and destination warehouses cannot be the same.");
            return;
        }
        transferMutation.mutate(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-bold mb-4">Transfer Stock</h2>

                {serverError && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product Variant</label>
                        <select
                            {...register("product_variant_id", { required: "Product is required" })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        >
                            <option value="">Select Product</option>
                            {products.map((p) => (
                                p.variants.map((v: any) => (
                                    <option key={v.id} value={v.id}>
                                        {p.name} - {v.sku}
                                    </option>
                                ))
                            ))}
                        </select>
                        {errors.product_variant_id && <span className="text-red-500 text-xs">Required</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">From Warehouse</label>
                            <select
                                {...register("from_warehouse_id", { required: "Source is required" })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            >
                                <option value="">Select Source</option>
                                {warehouses.map((w) => (
                                    <option key={w.id} value={w.id} disabled={w.is_frozen}>
                                        {w.name} {w.is_frozen ? "(Frozen)" : ""}
                                    </option>
                                ))}
                            </select>
                            {errors.from_warehouse_id && <span className="text-red-500 text-xs">Required</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">To Warehouse</label>
                            <select
                                {...register("to_warehouse_id", { required: "Destination is required" })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            >
                                <option value="">Select Destination</option>
                                {warehouses.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>
                            {errors.to_warehouse_id && <span className="text-red-500 text-xs">Required</span>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input
                            type="number"
                            {...register("quantity", { required: "Quantity is required", min: 1 })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                        {errors.quantity && <span className="text-red-500 text-xs">Invalid quantity</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <textarea
                            {...register("notes")}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={transferMutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {transferMutation.isPending ? "Transferring..." : "Transfer Stock"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
