import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BarcodeScanner from "@/components/inventory/BarcodeScanner";
import { MapPin, CheckCircle } from "lucide-react";

export default function PutAway() {
    const [warehouseId, setWarehouseId] = useState("");
    const [scannedCode, setScannedCode] = useState("");
    const [scannedItem, setScannedItem] = useState<any>(null);

    const { data: warehouses } = useQuery({
        queryKey: ["warehouses"],
        queryFn: async () => {
            const res = await api.get("/warehouses");
            if (res.data.length > 0 && !warehouseId) setWarehouseId(res.data[0].id);
            return res.data;
        }
    });

    // Fetch item details when scanned
    const { refetch: fetchItem } = useQuery({
        queryKey: ["product-by-sku", scannedCode],
        queryFn: async () => {
            // Assuming we have an endpoint or we filter. For MVP, let's assume we search products.
            // Ideally: GET /products/lookup?sku=...
            // I'll simulate by fetching all products and finding.
            const res = await api.get("/products");
            const products = res.data;
            let foundVariant = null;

            for (const p of products) {
                const v = p.variants.find((v: any) => v.sku === scannedCode || v.barcode === scannedCode);
                if (v) {
                    foundVariant = { ...v, product: p };
                    break;
                }
            }

            if (foundVariant) {
                setScannedItem(foundVariant);
                setTimeout(() => fetchSuggestion(), 0);
            } else {
                alert("Item not found!");
                setScannedItem(null);
            }
            return foundVariant;
        },
        enabled: false
    });

    const { data: suggestion, refetch: fetchSuggestion } = useQuery({
        queryKey: ["put-away-suggestion", warehouseId, scannedItem?.id],
        queryFn: async () => {
            if (!scannedItem) return null;
            const res = await api.get(`/warehouses/${warehouseId}/put-away-suggestion?variantId=${scannedItem.id}`);
            return res.data;
        },
        enabled: false
    });

    const handleScan = (code: string) => {
        setScannedCode(code);
        setTimeout(() => fetchItem(), 100);
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold">Put-Away</h1>

            <div className="flex items-center space-x-4">
                <label className="font-medium">Warehouse:</label>
                <Select value={warehouseId} onValueChange={setWarehouseId}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select Warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                        {warehouses?.map((w: any) => (
                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Scan Item</CardTitle>
                </CardHeader>
                <CardContent>
                    <BarcodeScanner onScan={handleScan} />
                    {scannedCode && <p className="text-sm text-gray-500 mt-2">Last Scanned: <span className="font-mono font-bold">{scannedCode}</span></p>}
                </CardContent>
            </Card>

            {scannedItem && (
                <Card className="border-indigo-200 bg-indigo-50">
                    <CardHeader>
                        <CardTitle className="text-indigo-900">Item Identified</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold">{scannedItem.product.name}</h3>
                                <p className="text-sm text-gray-600">SKU: {scannedItem.sku}</p>
                                <p className="text-sm text-gray-600">Color/Size: {JSON.stringify(scannedItem.attributes)}</p>
                            </div>
                            <div className="text-right">
                                <span className="inline-block px-3 py-1 bg-white rounded border text-sm font-mono">
                                    Current Stock: {scannedItem.stock_levels?.reduce((acc: number, sl: any) => acc + sl.quantity, 0) || 0}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {suggestion && (
                <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                        <CardTitle className="text-green-900 flex items-center">
                            <MapPin className="mr-2" /> Suggested Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-green-800">{suggestion.location.code}</p>
                                <p className="text-sm text-green-700">{suggestion.location.name} ({suggestion.location.type})</p>
                                <p className="text-xs text-green-600 mt-1">Reason: {suggestion.reason}</p>
                            </div>
                            <Button className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="mr-2 h-4 w-4" /> Confirm Put-Away
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {scannedItem && !suggestion && (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-yellow-600">No specific suggestion found. Please choose a location manually.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
