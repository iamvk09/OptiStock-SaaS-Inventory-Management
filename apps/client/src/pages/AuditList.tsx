import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AuditList() {
    const { token, organizationId } = useAuthStore();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newAudit, setNewAudit] = useState({ warehouse_id: "", notes: "" });

    const { data: audits, isLoading } = useQuery({
        queryKey: ["audits", organizationId],
        queryFn: async () => {
            const res = await axios.get("http://localhost:3000/api/audit", {
                headers: { Authorization: `Bearer ${token}`, "x-organization-id": organizationId },
            });
            return res.data;
        },
        enabled: !!organizationId,
    });

    const { data: warehouses } = useQuery({
        queryKey: ["warehouses", organizationId],
        queryFn: async () => {
            const res = await axios.get("http://localhost:3000/api/warehouses", {
                headers: { Authorization: `Bearer ${token}`, "x-organization-id": organizationId },
            });
            return res.data;
        },
        enabled: !!organizationId,
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await axios.post("http://localhost:3000/api/audit", data, {
                headers: { Authorization: `Bearer ${token}`, "x-organization-id": organizationId },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["audits"] });
            setIsCreateOpen(false);
            setNewAudit({ warehouse_id: "", notes: "" });
        },
    });

    const handleCreate = () => {
        if (!newAudit.warehouse_id) return;
        createMutation.mutate(newAudit);
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Inventory Audits</h1>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> New Audit</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Start New Audit Session</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Warehouse</Label>
                                <Select
                                    onValueChange={(v) => setNewAudit({ ...newAudit, warehouse_id: v })}
                                    value={newAudit.warehouse_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select warehouse" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses?.map((w: any) => (
                                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Input
                                    value={newAudit.notes}
                                    onChange={(e) => setNewAudit({ ...newAudit, notes: e.target.value })}
                                    placeholder="Optional notes"
                                />
                            </div>
                            <Button onClick={handleCreate} disabled={createMutation.isPending}>
                                {createMutation.isPending ? "Starting..." : "Start Audit"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {audits?.map((audit: any) => (
                        <li key={audit.id}>
                            <Link to={`/inventory/audit/${audit.id}`} className="block hover:bg-gray-50">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-indigo-600 truncate">
                                            {audit.warehouse.name}
                                        </p>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${audit.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                    audit.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {audit.status}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                {audit.notes || "No notes"}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                            <p>
                                                Started {new Date(audit.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
