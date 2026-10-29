import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, CheckCircle, Printer, Scan } from "lucide-react";
import InvoicePDF from "@/components/orders/InvoicePDF";
import { useState } from "react";
import BarcodeScanner from "@/components/common/BarcodeScanner";

export default function PackingStation() {
    const queryClient = useQueryClient();
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const { data: orders, isLoading } = useQuery({
        queryKey: ["sales-orders"],
        queryFn: async () => {
            const res = await api.get("/orders/sales");
            return res.data;
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            await api.patch(`/orders/sales/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
        }
    });

    const handlePrint = (order: any) => {
        setSelectedOrder(order);
        setTimeout(() => window.print(), 100);
    };

    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const handleScan = (code: string) => {
        // Find order or item by barcode (simulated logic)
        const order = confirmedOrders.find((o: any) => o.id.includes(code) || o.items.some((i: any) => i.variant.sku === code || i.variant.barcode === code));
        if (order) {
            // Auto-pack if order found
            updateStatusMutation.mutate({ id: order.id, status: "PACKED" });
            setIsScannerOpen(false);
            // In a real app, we would verify individual items
        } else {
            alert("Order or Product not found for code: " + code);
        }
    };

    const generatePickList = () => {
        // Aggregate items from all confirmed orders
        const pickMap = new Map<string, number>();
        confirmedOrders.forEach((order: any) => {
            order.items.forEach((item: any) => {
                const key = `${item.variant.product.name} (${item.variant.sku})`;
                pickMap.set(key, (pickMap.get(key) || 0) + item.quantity);
            });
        });

        const pickList = Array.from(pickMap.entries()).map(([name, qty]) => `${name}: ${qty}`).join("\n");
        const newWindow = window.open("", "_blank");
        newWindow?.document.write(`<pre>${pickList}</pre>`);
        newWindow?.print();
    };

    if (isLoading) return <div>Loading orders...</div>;

    const confirmedOrders = orders?.filter((o: any) => o.status === "CONFIRMED") || [];
    const packedOrders = orders?.filter((o: any) => o.status === "PACKED") || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Packing Station</h1>
                <div className="space-x-2">
                    <Button variant="outline" onClick={generatePickList}>
                        <Printer className="mr-2 h-4 w-4" /> Generate Pick List
                    </Button>
                    <Button onClick={() => setIsScannerOpen(true)}>
                        <Scan className="mr-2 h-4 w-4" /> Scan Barcode
                    </Button>
                </div>
            </div>

            <BarcodeScanner
                isActive={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleScan}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* To Pack Column */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center">
                        <Package className="mr-2" /> To Pack ({confirmedOrders.length})
                    </h2>
                    {confirmedOrders.map((order: any) => (
                        <Card key={order.id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between">
                                    <CardTitle className="text-base">Order #{order.id.slice(0, 8)}</CardTitle>
                                    <Badge>{order.status}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 mb-4">
                                    {order.items.map((item: any) => (
                                        <div key={item.id} className="text-sm flex justify-between">
                                            <span>{item.variant.product.name} ({item.variant.sku})</span>
                                            <span className="font-medium">x{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        className="w-full"
                                        onClick={() => updateStatusMutation.mutate({ id: order.id, status: "PACKED" })}
                                        disabled={updateStatusMutation.isPending}
                                    >
                                        Mark as Packed
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => handlePrint(order)}>
                                        <Printer className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {confirmedOrders.length === 0 && <p className="text-muted-foreground">No orders to pack.</p>}
                </div>

                {/* Packed Column */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center text-green-600">
                        <CheckCircle className="mr-2" /> Packed ({packedOrders.length})
                    </h2>
                    {packedOrders.map((order: any) => (
                        <Card key={order.id} className="opacity-75">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between">
                                    <CardTitle className="text-base">Order #{order.id.slice(0, 8)}</CardTitle>
                                    <Badge variant="secondary">{order.status}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 mb-4">
                                    {order.items.map((item: any) => (
                                        <div key={item.id} className="text-sm flex justify-between">
                                            <span>{item.variant.product.name} ({item.variant.sku})</span>
                                            <span className="font-medium">x{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => updateStatusMutation.mutate({ id: order.id, status: "SHIPPED" })}
                                        disabled={updateStatusMutation.isPending}
                                    >
                                        Mark Shipped
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => handlePrint(order)}>
                                        <Printer className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Hidden Invoice for Printing */}
            <div className="hidden print:block fixed inset-0 bg-white z-[9999]">
                <InvoicePDF order={selectedOrder} />
            </div>
        </div>
    );
}
