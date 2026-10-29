import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw, CheckCircle } from "lucide-react";

export default function IntegrationSettings() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: configs, isLoading } = useQuery({
        queryKey: ["integration-configs"],
        queryFn: async () => {
            const res = await api.get("/integrations/config");
            return res.data;
        }
    });

    const saveConfigMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.post("/integrations/config", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["integration-configs"] });
            toast({ title: "Configuration Saved", description: "Integration settings updated successfully." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to save configuration.", variant: "destructive" });
        }
    });

    const triggerSyncMutation = useMutation({
        mutationFn: async (data: { platform: string; type: string }) => {
            await api.post("/integrations/sync", data);
        },
        onSuccess: () => {
            toast({ title: "Sync Started", description: "Synchronization process has been triggered." });
        }
    });

    if (isLoading) return <div>Loading settings...</div>;

    const shopifyConfig = configs?.find((c: any) => c.platform === "SHOPIFY") || {};
    const wooConfig = configs?.find((c: any) => c.platform === "WOOCOMMERCE") || {};

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold">Integration Settings</h1>
            <p className="text-gray-500">Connect your external sales channels to sync products and orders.</p>

            {/* Shopify */}
            <IntegrationCard
                platform="SHOPIFY"
                title="Shopify"
                description="Connect your Shopify store."
                config={shopifyConfig}
                onSave={(data: any) => saveConfigMutation.mutate({ ...data, platform: "SHOPIFY" })}
                onSync={(type: string) => triggerSyncMutation.mutate({ platform: "SHOPIFY", type })}
                isSaving={saveConfigMutation.isPending}
            />

            {/* WooCommerce */}
            <IntegrationCard
                platform="WOOCOMMERCE"
                title="WooCommerce"
                description="Connect your WooCommerce store."
                config={wooConfig}
                onSave={(data: any) => saveConfigMutation.mutate({ ...data, platform: "WOOCOMMERCE" })}
                onSync={(type: string) => triggerSyncMutation.mutate({ platform: "WOOCOMMERCE", type })}
                isSaving={saveConfigMutation.isPending}
            />
        </div>
    );
}

function IntegrationCard({ platform, title, description, config, onSave, onSync, isSaving }: any) {
    const [apiUrl, setApiUrl] = useState(config.api_url || "");
    const [apiKey, setApiKey] = useState(config.api_key || "");
    const [accessToken, setAccessToken] = useState(config.access_token || "");
    const [isActive, setIsActive] = useState(config.is_active || false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ api_url: apiUrl, api_key: apiKey, access_token: accessToken, is_active: isActive });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    {config.id && (
                        <div className="flex items-center text-green-600 text-sm font-medium">
                            <CheckCircle className="h-4 w-4 mr-1" /> Connected
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Switch checked={isActive} onCheckedChange={setIsActive} />
                        <span className="text-sm font-medium">Enable Integration</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Store URL</label>
                            <Input
                                value={apiUrl}
                                onChange={e => setApiUrl(e.target.value)}
                                placeholder={`https://your-store.${platform === 'SHOPIFY' ? 'myshopify.com' : 'com'}`}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">API Key / Consumer Key</label>
                            <Input
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                type="password"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">Access Token / Consumer Secret</label>
                            <Input
                                value={accessToken}
                                onChange={e => setAccessToken(e.target.value)}
                                type="password"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Configuration"}
                        </Button>

                        {config.id && (
                            <div className="flex space-x-2">
                                <Button type="button" variant="outline" onClick={() => onSync("PRODUCTS")}>
                                    <RefreshCw className="h-4 w-4 mr-2" /> Sync Products
                                </Button>
                                <Button type="button" variant="outline" onClick={() => onSync("ORDERS")}>
                                    <RefreshCw className="h-4 w-4 mr-2" /> Sync Orders
                                </Button>
                            </div>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
