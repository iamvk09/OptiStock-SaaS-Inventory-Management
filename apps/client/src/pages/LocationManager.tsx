import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Folder, Box } from "lucide-react";

export default function LocationManager() {
    const [warehouseId, setWarehouseId] = useState("");
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Form State
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [type, setType] = useState("AISLE");
    const [parentId, setParentId] = useState<string | null>(null);

    const { data: warehouses } = useQuery({
        queryKey: ["warehouses"],
        queryFn: async () => {
            const res = await api.get("/warehouses");
            if (res.data.length > 0 && !warehouseId) setWarehouseId(res.data[0].id);
            return res.data;
        }
    });

    const { data: locations } = useQuery({
        queryKey: ["locations", warehouseId],
        queryFn: async () => {
            const res = await api.get(`/warehouses/${warehouseId}/locations`);
            return res.data;
        },
        enabled: !!warehouseId
    });

    const createLocationMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.post(`/warehouses/${warehouseId}/locations`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["locations", warehouseId] });
            toast({ title: "Location Created", description: `${type} created successfully.` });
            setName("");
            setCode("");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createLocationMutation.mutate({
            name,
            code,
            type,
            parent_id: parentId === "root" ? null : parentId
        });
    };

    const LocationTree = ({ nodes, level = 0 }: { nodes: any[], level?: number }) => {
        return (
            <div className={`pl-${level * 4}`}>
                {nodes.map(node => (
                    <div key={node.id} className="mb-2">
                        <div className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer group">
                            {node.type === "BIN" ? <Box className="h-4 w-4 mr-2 text-blue-500" /> : <Folder className="h-4 w-4 mr-2 text-yellow-500" />}
                            <span className="font-medium text-sm">{node.name} ({node.code})</span>
                            <span className="ml-2 text-xs text-gray-400 bg-gray-200 px-1 rounded">{node.type}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="ml-auto opacity-0 group-hover:opacity-100 h-6 text-xs"
                                onClick={() => {
                                    setParentId(node.id);
                                    setType(getNextType(node.type));
                                }}
                            >
                                <Plus className="h-3 w-3 mr-1" /> Add Child
                            </Button>
                        </div>
                        {node.children && node.children.length > 0 && (
                            <div className="ml-4 border-l pl-2">
                                <LocationTree nodes={node.children} level={level + 1} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const getNextType = (currentType: string) => {
        switch (currentType) {
            case "AISLE": return "RACK";
            case "RACK": return "SHELF";
            case "SHELF": return "BIN";
            default: return "BIN";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Location Manager</h1>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tree View */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Hierarchy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <Button variant="outline" size="sm" onClick={() => { setParentId(null); setType("AISLE"); }}>
                                <Plus className="h-4 w-4 mr-2" /> Add Root Aisle
                            </Button>
                        </div>
                        {locations ? <LocationTree nodes={locations} /> : <p>Select a warehouse to view locations.</p>}
                    </CardContent>
                </Card>

                {/* Create Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Add Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Parent</label>
                                <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded border">
                                    {parentId ? "Selected Node" : "Root (None)"}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Type</label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AISLE">Aisle</SelectItem>
                                        <SelectItem value="RACK">Rack</SelectItem>
                                        <SelectItem value="SHELF">Shelf</SelectItem>
                                        <SelectItem value="BIN">Bin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Name</label>
                                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aisle 1" required />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Code</label>
                                <Input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. A1" required />
                            </div>
                            <Button type="submit" className="w-full" disabled={createLocationMutation.isPending}>
                                Create Location
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
