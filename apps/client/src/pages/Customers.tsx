import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Users, Mail, Phone } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

const customerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
    ranking: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface Customer {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    ranking?: string;
    ltv?: number;
}

export default function Customers() {
    const { token } = useAuthStore();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
            ranking: "Bronze",
        },
    });

    const { data: customers, isLoading } = useQuery({
        queryKey: ["customers"],
        queryFn: async () => {
            const res = await axios.get("http://localhost:3000/api/customers", {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
        },
        enabled: !!token,
    });

    const createMutation = useMutation({
        mutationFn: async (data: CustomerFormValues) => {
            await axios.post("http://localhost:3000/api/customers", data, {
                headers: { Authorization: `Bearer ${token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            toast({ title: "Success", description: "Customer created successfully" });
            setIsOpen(false);
            form.reset();
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to create customer", variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: CustomerFormValues) => {
            await axios.put(`http://localhost:3000/api/customers/${editingId}`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            toast({ title: "Success", description: "Customer updated successfully" });
            setIsOpen(false);
            setEditingId(null);
            form.reset();
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to update customer", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`http://localhost:3000/api/customers/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            toast({ title: "Success", description: "Customer deleted successfully" });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to delete customer", variant: "destructive" });
        },
    });

    const onSubmit = (data: CustomerFormValues) => {
        if (editingId) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (customer: Customer) => {
        setEditingId(customer.id);
        form.reset({
            name: customer.name,
            email: customer.email || "",
            phone: customer.phone || "",
            address: customer.address || "",
            ranking: customer.ranking || "Bronze",
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
            ranking: "Bronze",
        });
        setIsOpen(true);
    };

    const getRankingColor = (ranking: string) => {
        switch (ranking?.toLowerCase()) {
            case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'silver': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-orange-100 text-orange-800 border-orange-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground">Manage your client base.</p>
                </div>
                <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" /> Add Customer
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Ranking</TableHead>
                            <TableHead>LTV</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : customers?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No customers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers?.map((customer: Customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center">
                                            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {customer.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm text-muted-foreground">
                                            {customer.email && (
                                                <div className="flex items-center">
                                                    <Mail className="mr-1 h-3 w-3" /> {customer.email}
                                                </div>
                                            )}
                                            {customer.phone && (
                                                <div className="flex items-center mt-1">
                                                    <Phone className="mr-1 h-3 w-3" /> {customer.phone}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getRankingColor(customer.ranking || "")}>
                                            {customer.ranking || "Bronze"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>${Number(customer.ltv || 0).toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(customer)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => {
                                                if (confirm("Are you sure?")) {
                                                    deleteMutation.mutate(customer.id);
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
                        <DialogTitle>{editingId ? "Edit Customer" : "Add Customer"}</DialogTitle>
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
                                            <Input placeholder="TechStart Inc" {...field} />
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
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123 Business Rd" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ranking"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Ranking</FormLabel>
                                        <FormControl>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                {...field}
                                            >
                                                <option value="Bronze">Bronze</option>
                                                <option value="Silver">Silver</option>
                                                <option value="Gold">Gold</option>
                                                <option value="Platinum">Platinum</option>
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
