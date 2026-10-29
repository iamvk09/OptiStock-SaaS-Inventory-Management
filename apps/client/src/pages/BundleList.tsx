import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";

export default function BundleList() {
    const { data: bundles, isLoading } = useQuery({
        queryKey: ["bundles"],
        queryFn: async () => {
            const res = await api.get("/products/bundles");
            return res.data;
        }
    });

    if (isLoading) return <div>Loading bundles...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Product Bundles</h1>
                <Link to="/inventory/bundles/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Bundle
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Bundles</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Items</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bundles?.map((bundle: any) => (
                                <TableRow key={bundle.id}>
                                    <TableCell className="font-medium">{bundle.name}</TableCell>
                                    <TableCell>{bundle.sku}</TableCell>
                                    <TableCell>${Number(bundle.price).toFixed(2)}</TableCell>
                                    <TableCell>
                                        {bundle.items.length} items
                                        <div className="text-xs text-muted-foreground">
                                            {bundle.items.map((i: any) => i.variant.product.name).join(", ")}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
