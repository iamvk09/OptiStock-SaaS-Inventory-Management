import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Building2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const warehouseSchema = z.object({
    name: z.string().min(1, "Name is required"),
    location: z.string().optional(),
    capacity: z.coerce.number().min(0).optional(),
    is_frozen: z.boolean().default(false),
});

type WarehouseFormValues = z.infer<typeof warehouseSchema>;

interface Warehouse {
    id: string;
    name: string;
    location?: string;
    capacity?: number;
    utilization?: number;
    is_frozen: boolean;
}

export default function Warehouses() {
    const { token } = useAuthStore();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const form = useForm<WarehouseFormValues>({
        resolver: zodResolver(warehouseSchema),
        defaultValues: {
            name: "",
            location: "",
            capacity: 0,
            is_frozen: false,
        },
    });

    const { data: warehouses, isLoading } = useQuery({
        queryKey: ["warehouses"],
        queryFn: async () => {
            const res = await axios.get("http://localhost:3000/api/warehouses", {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
        },
        enabled: !!token,
    });

    const createMutation = useMutation({
        mutationFn: async (data: WarehouseFormValues) => {
            await axios.post("http://localhost:3000/api/warehouses", data, {
                headers: { Authorization: `Bearer ${token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["warehouses"] });
            toast({ title: "Success", description: "Warehouse created successfully" });
            setIsOpen(false);
            form.reset();
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to create warehouse", variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: WarehouseFormValues) => {
            await axios.put(`http://localhost:3000/api/warehouses/${editingId}`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["warehouses"] });
            toast({ title: "Success", description: "Warehouse updated successfully" });
            setIsOpen(false);
            setEditingId(null);
            form.reset();
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to update warehouse", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`http://localhost:3000/api/warehouses/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["warehouses"] });
            toast({ title: "Success", description: "Warehouse deleted successfully" });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to delete warehouse", variant: "destructive" });
        },
    });

    const onSubmit = (data: WarehouseFormValues) => {
        if (editingId) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (warehouse: Warehouse) => {
        setEditingId(warehouse.id);
        form.reset({
            name: warehouse.name,
            location: warehouse.location || "",
            capacity: warehouse.capacity || 0,
            is_frozen: warehouse.is_frozen,
        });
        setIsOpen(true);
    };

    const handleAddNew = () => {
        setEditingId(null);
        form.reset({
            name: "",
            location: "",
            capacity: 0,
            is_frozen: false,
        });
        setIsOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
                    <p className="text-muted-foreground">Manage your storage locations and capacity.</p>
                </div>
                <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" /> Add Warehouse
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Utilization</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : warehouses?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No warehouses found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            warehouses?.map((warehouse: Warehouse) => (
                                <TableRow key={warehouse.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center">
                                            <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {warehouse.name}
                                            {warehouse.is_frozen && (
                                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Cold Storage</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center text-muted-foreground">
                                            <MapPin className="mr-1 h-3 w-3" />
                                            {warehouse.location || "N/A"}
                                        </div>
                                    </TableCell>
                                    <TableCell>{warehouse.capacity?.toLocaleString() || "Unlimited"}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <div className="w-24 h-2 bg-secondary rounded-full mr-2 overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${Math.min(warehouse.utilization || 0, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-muted-foreground">{Math.round(warehouse.utilization || 0)}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(warehouse)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => {
                                                if (confirm("Are you sure? This cannot be undone.")) {
                                                    deleteMutation.mutate(warehouse.id);
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Warehouse" : "Add Warehouse"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Main Warehouse" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123 Storage Lane, NY" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="capacity"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Capacity (Units)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex items-center space-x-2">
                                <FormField
                                    control={form.control}
                                    name="is_frozen"
                                    render={({ field }: { field: any }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <input
                                                    type="checkbox"
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Cold Storage</FormLabel>
                                                <p className="text-sm text-muted-foreground">
                                                    This warehouse supports frozen goods.
                                                </p>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {editingId ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
