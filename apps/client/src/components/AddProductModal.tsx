import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AddProductModal() {
    const { token, organizationId } = useAuthStore();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
        brand: "",
        hsn_code: "",
        tags: "",
        sku: "",
        price: 0,
        cost_price: 0,
        image_url: "",
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            await axios.post("http://localhost:3000/api/products", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-organization-id": organizationId,
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            setOpen(false);
            setFormData({
                name: "",
                description: "",
                category: "",
                brand: "",
                hsn_code: "",
                tags: "",
                sku: "",
                price: 0,
                cost_price: 0,
                image_url: "",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            brand: formData.brand,
            hsn_code: formData.hsn_code,
            tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
            image_url: formData.image_url,
            variants: [{
                sku: formData.sku,
                price: Number(formData.price),
                cost_price: Number(formData.cost_price),
            }]
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add Product</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Input id="category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="brand">Brand</Label>
                            <Input id="brand" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hsn">HSN Code</Label>
                            <Input id="hsn" value={formData.hsn_code} onChange={e => setFormData({ ...formData, hsn_code: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (comma separated)</Label>
                            <Input id="tags" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} />
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-2">
                        <h4 className="font-medium mb-4">Initial Variant</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input id="sku" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Selling Price</Label>
                                <Input type="number" id="price" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cost">Cost Price</Label>
                                <Input type="number" id="cost" value={formData.cost_price} onChange={e => setFormData({ ...formData, cost_price: Number(e.target.value) })} required />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image">Product Image</Label>
                        <Input id="image" type="file" accept="image/*" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            const formData = new FormData();
                            formData.append("file", file);

                            try {
                                const res = await axios.post("http://localhost:3000/api/upload", formData, {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                        "Content-Type": "multipart/form-data",
                                    },
                                });
                                setFormData(prev => ({ ...prev, image_url: res.data.url }));
                            } catch (err) {
                                console.error("Upload failed", err);
                                alert("Image upload failed");
                            }
                        }} />
                        {formData.image_url && <p className="text-xs text-green-600">Image uploaded successfully</p>}
                    </div>

                    <div className="flex justify-end mt-4">
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Saving..." : "Save Product"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
