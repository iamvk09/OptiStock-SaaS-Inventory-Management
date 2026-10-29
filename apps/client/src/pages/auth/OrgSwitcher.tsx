import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/AuthLayout";
import { Building2, Plus, ArrowRight, Loader2 } from "lucide-react";
import axios from "axios";

interface Organization {
    id: number;
    name: string;
    slug: string;
}

export default function OrgSwitcher() {
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { token, setOrganizationId } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrgs = async () => {
            if (!token) return;
            try {
                // In a real app, we'd have an endpoint like /api/organizations/me
                // For now, we'll simulate or fetch from the sync endpoint if it returned a list
                // Assuming the sync endpoint might return a list in the future or we fetch here
                // For MVP, we'll just show the one attached to the user if any, or mock
                const res = await axios.get("http://localhost:3000/api/organizations", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrgs(res.data);
            } catch (error) {
                console.error("Failed to fetch organizations", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrgs();
    }, [token]);

    const handleSelect = (orgId: number) => {
        setOrganizationId(orgId.toString());
        navigate("/");
    };

    return (
        <AuthLayout title="Select Organization" subtitle="Choose a workspace to continue">
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-4">
                    {orgs.length > 0 ? (
                        orgs.map((org) => (
                            <button
                                key={org.id}
                                onClick={() => handleSelect(org.id)}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all group"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold">{org.name}</h3>
                                        <p className="text-xs text-muted-foreground">{org.slug}</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </button>
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No organizations found.
                        </div>
                    )}

                    <Button variant="outline" className="w-full h-12 rounded-xl border-dashed" onClick={() => navigate("/onboarding")}>
                        <Plus className="mr-2 h-4 w-4" /> Create New Organization
                    </Button>
                </div>
            )}
        </AuthLayout>
    );
}
