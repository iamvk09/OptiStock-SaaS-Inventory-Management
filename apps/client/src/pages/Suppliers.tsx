import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Truck, Mail, Phone } from "lucide-react";
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

const supplierSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    average_delivery_time: z.coerce.number().min(0).optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface Supplier {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    rating?: number;
    average_delivery_time?: number;
}

export default function Suppliers() {
    const { token } = useAuthStore();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const form = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
            rating: 5,
            average_delivery_time: 0,
        },
    });

    const { data: suppliers, isLoading } = useQuery({
        queryKey: ["suppliers"],
        queryFn: async () => {
            const res = await axios.get("http://localhost:3000/api/suppliers", {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
        },
        enabled: !!token,
    });

    const createMutation = useMutation({
        mutationFn: async (data: SupplierFormValues) => {
            await axios.post("http://localhost:3000/api/suppliers", data, {
                headers: { Authorization: `Bearer ${token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
            toast({ title: "Success", description: "Supplier created successfully" });
            setIsOpen(false);
            form.reset();
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to create supplier", variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: SupplierFormValues) => {
            await axios.put(`http://localhost:3000/api/suppliers/${editingId}`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
            toast({ title: "Success", description: "Supplier updated successfully" });
            setIsOpen(false);
            setEditingId(null);
            form.reset();
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to update supplier", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`http://localhost:3000/api/suppliers/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
            toast({ title: "Success", description: "Supplier deleted successfully" });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to delete supplier", variant: "destructive" });
        },
    });

    const onSubmit = (data: SupplierFormValues) => {
        if (editingId) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (supplier: Supplier) => {
        setEditingId(supplier.id);
        form.reset({
            name: supplier.name,
            email: supplier.email || "",
            phone: supplier.phone || "",
            address: supplier.address || "",
            rating: supplier.rating || 5,
            average_delivery_time: supplier.average_delivery_time || 0,
        });
        setIsOpen(true);
    };

    const handleAddNew = () => {
        setEditingId(null);
        form.reset({
            name: "",
            email: "",
            phone: "",
            address: "",
            rating: 5,
            average_delivery_time: 0,
        });
        setIsOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
                    <p className="text-muted-foreground">Manage your vendor relationships.</p>
                </div>
                <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" /> Add Supplier
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Lead Time (Days)</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : suppliers?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No suppliers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            suppliers?.map((supplier: Supplier) => (
                                <TableRow key={supplier.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center">
                                            <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {supplier.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm text-muted-foreground">
                                            {supplier.email && (
                                                <div className="flex items-center">
                                                    <Mail className="mr-1 h-3 w-3" /> {supplier.email}
                                                </div>
                                            )}
                                            {supplier.phone && (
                                                <div className="flex items-center mt-1">
                                                    <Phone className="mr-1 h-3 w-3" /> {supplier.phone}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{supplier.rating} / 5</TableCell>
                                    <TableCell>{supplier.average_delivery_time || "N/A"}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(supplier)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => {
                                                if (confirm("Are you sure?")) {
                                                    deleteMutation.mutate(supplier.id);
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
                        <DialogTitle>{editingId ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
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
                                            <Input placeholder="Global Tech" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="contact@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+1 234 567 890" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="rating"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormLabel>Rating (0-5)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" max="5" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="average_delivery_time"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormLabel>Lead Time (Days)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
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
