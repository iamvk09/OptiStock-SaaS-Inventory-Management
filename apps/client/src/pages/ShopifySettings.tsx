import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, CheckCircle2, XCircle } from "lucide-react";

export default function ShopifySettings() {
    const { token, organizationId } = useAuthStore();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [shopUrl, setShopUrl] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [isActive, setIsActive] = useState(true);

    const { data: config, isLoading } = useQuery({
        queryKey: ["shopify-config", organizationId],
        queryFn: async () => {
            const res = await axios.get("http://localhost:3000/api/shopify", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-organization-id": organizationId,
                },
            });
            return res.data;
        },
        enabled: !!organizationId,
    });

    // Update local state when data is loaded
    if (config && shopUrl === "" && accessToken === "") {
        if (config.api_url) setShopUrl(config.api_url);
        if (config.access_token) setAccessToken(config.access_token);
        if (config.is_active !== undefined) setIsActive(config.is_active);
    }

    const saveMutation = useMutation({
        mutationFn: async () => {
            await axios.post(
                "http://localhost:3000/api/shopify",
                { shopUrl, accessToken, isActive },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "x-organization-id": organizationId,
                    },
                }
            );
        },
        onSuccess: () => {
            toast({ title: "Saved", description: "Shopify configuration saved successfully." });
            queryClient.invalidateQueries({ queryKey: ["shopify-config"] });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to save configuration.",
                variant: "destructive"
            });
        }
    });

    const syncMutation = useMutation({
        mutationFn: async () => {
            const res = await axios.post(
                "http://localhost:3000/api/shopify/sync",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "x-organization-id": organizationId,
                    },
                }
            );
            return res.data;
        },
        onSuccess: (data) => {
            toast({
                title: "Sync Completed",
                description: `Created: ${data.results.created}, Updated: ${data.results.updated}, Errors: ${data.results.errors}`
            });
        },
        onError: (error: any) => {
            toast({
                title: "Sync Failed",
                description: error.response?.data?.message || "Failed to sync with Shopify.",
                variant: "destructive"
            });
        }
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Shopify Integration</h2>
                <p className="text-muted-foreground">Connect your Shopify store to sync products and orders.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                    <CardDescription>
                        Enter your Shopify store URL and Admin API Access Token.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="shopUrl">Shop URL</Label>
                        <Input
                            id="shopUrl"
                            placeholder="your-shop.myshopify.com"
                            value={shopUrl}
                            onChange={(e) => setShopUrl(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">The *.myshopify.com URL of your store.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accessToken">Admin API Access Token</Label>
                        <Input
                            id="accessToken"
                            type="password"
                            placeholder="shpat_..."
                            value={accessToken}
                            onChange={(e) => setAccessToken(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Generated from Shopify Admin &rarr; Settings &rarr; Apps and sales channels.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isActive"
                            checked={isActive}
                            onCheckedChange={setIsActive}
                        />
                        <Label htmlFor="isActive">Enable Integration</Label>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        onClick={() => saveMutation.mutate()}
                        disabled={saveMutation.isPending}
                    >
                        {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save & Test Connection
                    </Button>
                </CardFooter>
            </Card>

            {config?.id && (
                <Card>
                    <CardHeader>
                        <CardTitle>Sync Status</CardTitle>
                        <CardDescription>
                            Manually trigger a sync to update products and orders.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            {config.is_active ? (
                                <div className="flex items-center text-green-600">
                                    <CheckCircle2 className="mr-2 h-5 w-5" />
                                    <span>Active</span>
                                </div>
                            ) : (
                                <div className="flex items-center text-red-600">
                                    <XCircle className="mr-2 h-5 w-5" />
                                    <span>Inactive</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            variant="secondary"
                            onClick={() => syncMutation.mutate()}
                            disabled={syncMutation.isPending || !config.is_active}
                        >
                            {syncMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            Sync Now
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
