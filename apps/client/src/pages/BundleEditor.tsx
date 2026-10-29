import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";

export default function BundleEditor() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [name, setName] = useState("");
    const [sku, setSku] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [items, setItems] = useState<{ variantId: string; quantity: number }[]>([]);

    const { data: products } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const res = await api.get("/products");
            return res.data;
        }
    });

    const createBundleMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.post("/products/bundles", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bundles"] });
            toast({ title: "Success", description: "Bundle created successfully" });
            navigate("/inventory/bundles");
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to create bundle", variant: "destructive" });
        }
    });

    const addItem = () => {
        setItems([...items, { variantId: "", quantity: 1 }]);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createBundleMutation.mutate({
            name,
            sku,
            description,
            price: Number(price),
            items: items.map(i => ({
                product_variant_id: i.variantId,
                quantity: Number(i.quantity)
            }))
        });
    };

    // Flatten variants for selection
    const allVariants = products?.flatMap((p: any) =>
        p.variants.map((v: any) => ({
            id: v.id,
            name: `${p.name} - ${v.sku}`,
            price: v.price
        }))
    ) || [];

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Create Bundle</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Bundle Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Bundle Name</Label>
                            <Input value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>SKU</Label>
                                <Input value={sku} onChange={e => setSku(e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <Label>Price</Label>
                                <Input type="number" value={price} onChange={e => setPrice(e.target.value)} required />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <Input value={description} onChange={e => setDescription(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Bundle Items</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={addItem}>
                            <Plus className="h-4 w-4 mr-2" /> Add Item
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="flex gap-4 items-end">
                                <div className="flex-1 grid gap-2">
                                    <Label>Product Variant</Label>
                                    <Select
                                        value={item.variantId}
                                        onValueChange={(v) => updateItem(index, "variantId", v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select product..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allVariants.map((v: any) => (
                                                <SelectItem key={v.id} value={v.id}>
                                                    {v.name} (${v.price})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-24 grid gap-2">
                                    <Label>Qty</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={e => updateItem(index, "quantity", e.target.value)}
                                    />
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate("/inventory/bundles")}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={createBundleMutation.isPending}>
                        {createBundleMutation.isPending ? "Creating..." : "Create Bundle"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
