import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";

type Tab = "organizations" | "feature-flags" | "custom-fields" | "automation-rules";

export default function Settings() {
    const { token, organizationId, setOrganizationId } = useAuthStore();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<Tab>("organizations");
    const [newOrgName, setNewOrgName] = useState("");
    const [newOrgSlug, setNewOrgSlug] = useState("");

    // Feature Flag States
    const [newFlagKey, setNewFlagKey] = useState("");
    const [newFlagDesc, setNewFlagDesc] = useState("");

    // Custom Field States
    const [newFieldEntity, setNewFieldEntity] = useState("PRODUCT");
    const [newFieldName, setNewFieldName] = useState("");
    const [newFieldType, setNewFieldType] = useState("TEXT");

    // Automation Rule States
    const [newRuleName, setNewRuleName] = useState("");
    const [newRuleTrigger, setNewRuleTrigger] = useState("ORDER_CREATED");
    const [newRuleAction, setNewRuleAction] = useState("SEND_EMAIL");

    const { data: organizations, isLoading } = useQuery({
        queryKey: ["organizations"],
        queryFn: async () => {
            const res = await axios.get("http://localhost:3000/api/organizations", {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
        },
    });

    const { data: featureFlags } = useQuery({
        queryKey: ["feature-flags", organizationId],
        queryFn: async () => {
            const res = await axios.get("http://localhost:3000/api/settings/feature-flags", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-organization-id": organizationId,
                },
            });
            return res.data;
        },
        enabled: !!organizationId && activeTab === "feature-flags",
    });

    const { data: customFields } = useQuery({
        queryKey: ["custom-fields", organizationId],
        queryFn: async () => {
            const res = await axios.get("http://localhost:3000/api/settings/custom-fields", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-organization-id": organizationId,
                },
            });
            return res.data;
        },
        enabled: !!organizationId && activeTab === "custom-fields",
    });

    const { data: automationRules } = useQuery({
        queryKey: ["automation-rules", organizationId],
        queryFn: async () => {
            const res = await axios.get("http://localhost:3000/api/settings/automation-rules", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-organization-id": organizationId,
                },
            });
            return res.data;
        },
        enabled: !!organizationId && activeTab === "automation-rules",
    });

    const createOrgMutation = useMutation({
        mutationFn: async (data: { name: string; slug: string }) => {
            const res = await axios.post("http://localhost:3000/api/organizations", data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
            setNewOrgName("");
            setNewOrgSlug("");
        },
    });

    const createFlagMutation = useMutation({
        mutationFn: async (data: { key: string; description?: string }) => {
            const res = await axios.post("http://localhost:3000/api/settings/feature-flags", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-organization-id": organizationId,
                },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feature-flags", organizationId] });
            setNewFlagKey("");
            setNewFlagDesc("");
        },
    });

    const toggleFlagMutation = useMutation({
        mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
            const res = await axios.patch(
                `http://localhost:3000/api/settings/feature-flags/${id}`,
                { is_enabled },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "x-organization-id": organizationId,
                    },
                }
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feature-flags", organizationId] });
        },
    });

    const createFieldMutation = useMutation({
        mutationFn: async (data: { entity_type: string; name: string; type: string }) => {
            const res = await axios.post("http://localhost:3000/api/settings/custom-fields", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-organization-id": organizationId,
                },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["custom-fields", organizationId] });
            setNewFieldName("");
        },
    });

    const createRuleMutation = useMutation({
        mutationFn: async (data: { name: string; trigger_event: string; action_type: string; action_config: any }) => {
            const res = await axios.post("http://localhost:3000/api/settings/automation-rules", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-organization-id": organizationId,
                },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["automation-rules", organizationId] });
            setNewRuleName("");
        },
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: "organizations", label: "Organizations" },
                        { id: "feature-flags", label: "Feature Flags" },
                        { id: "custom-fields", label: "Custom Fields" },
                        { id: "automation-rules", label: "Automation Rules" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`${activeTab === tab.id
                                ? "border-indigo-500 text-indigo-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Organizations Tab */}
            {activeTab === "organizations" && (
                <>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Your Organizations</h2>
                        <div className="space-y-4">
                            {organizations?.map((org: any) => (
                                <div key={org.id} className="flex items-center justify-between p-4 border rounded">
                                    <div>
                                        <p className="font-medium">{org.name}</p>
                                        <p className="text-sm text-gray-500">{org.slug}</p>
                                    </div>
                                    <button
                                        onClick={() => setOrganizationId(org.id)}
                                        className={`px-4 py-2 rounded text-sm font-medium ${organizationId === org.id
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                            }`}
                                    >
                                        {organizationId === org.id ? "Active" : "Switch"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Create New Organization</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                createOrgMutation.mutate({ name: newOrgName, slug: newOrgSlug });
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                    value={newOrgName}
                                    onChange={(e) => setNewOrgName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Slug</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                    value={newOrgSlug}
                                    onChange={(e) => setNewOrgSlug(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                            >
                                Create Organization
                            </button>
                        </form>
                    </div>
                </>
            )}

            {/* Feature Flags Tab */}
            {activeTab === "feature-flags" && (
                <>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Feature Flags</h2>
                        <div className="space-y-3">
                            {featureFlags?.map((flag: any) => (
                                <div key={flag.id} className="flex items-center justify-between p-4 border rounded">
                                    <div>
                                        <p className="font-medium">{flag.key}</p>
                                        {flag.description && <p className="text-sm text-gray-500">{flag.description}</p>}
                                    </div>
                                    <button
                                        onClick={() => toggleFlagMutation.mutate({ id: flag.id, is_enabled: !flag.is_enabled })}
                                        className={`px-4 py-2 rounded text-sm font-medium ${flag.is_enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        {flag.is_enabled ? "Enabled" : "Disabled"}
                                    </button>
                                </div>
                            ))}
                            {featureFlags?.length === 0 && <p className="text-gray-500">No feature flags yet.</p>}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Create Feature Flag</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                createFlagMutation.mutate({ key: newFlagKey, description: newFlagDesc });
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Key</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                    value={newFlagKey}
                                    onChange={(e) => setNewFlagKey(e.target.value)}
                                    placeholder="e.g., ENABLE_NEW_DASHBOARD"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                    value={newFlagDesc}
                                    onChange={(e) => setNewFlagDesc(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                            >
                                Create Flag
                            </button>
                        </form>
                    </div>
                </>
            )}

            {/* Custom Fields Tab */}
            {activeTab === "custom-fields" && (
                <>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Custom Fields</h2>
                        <div className="space-y-3">
                            {customFields?.map((field: any) => (
                                <div key={field.id} className="flex items-center justify-between p-4 border rounded">
                                    <div>
                                        <p className="font-medium">{field.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {field.entity_type} • {field.type}
                                        </p>
                                    </div>
                                    {field.is_required && (
                                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Required</span>
                                    )}
                                </div>
                            ))}
                            {customFields?.length === 0 && <p className="text-gray-500">No custom fields yet.</p>}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Create Custom Field</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                createFieldMutation.mutate({
                                    entity_type: newFieldEntity,
                                    name: newFieldName,
                                    type: newFieldType,
                                });
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Entity Type</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                    value={newFieldEntity}
                                    onChange={(e) => setNewFieldEntity(e.target.value)}
                                >
                                    <option value="PRODUCT">Product</option>
                                    <option value="ORDER">Order</option>
                                    <option value="CUSTOMER">Customer</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Field Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                    value={newFieldName}
                                    onChange={(e) => setNewFieldName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Field Type</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                    value={newFieldType}
                                    onChange={(e) => setNewFieldType(e.target.value)}
                                >
                                    <option value="TEXT">Text</option>
                                    <option value="NUMBER">Number</option>
                                    <option value="DATE">Date</option>
                                    <option value="BOOLEAN">Boolean</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                            >
                                Create Field
                            </button>
                        </form>
                    </div>
                </>
            )}

            {/* Automation Rules Tab */}
            {activeTab === "automation-rules" && (
                <>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Automation Rules</h2>
                        <div className="space-y-3">
                            {automationRules?.map((rule: any) => (
                                <div key={rule.id} className="flex items-center justify-between p-4 border rounded">
                                    <div>
                                        <p className="font-medium">{rule.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {rule.trigger_event} → {rule.action_type}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2 py-1 text-xs rounded ${rule.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        {rule.is_active ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            ))}
                            {automationRules?.length === 0 && <p className="text-gray-500">No automation rules yet.</p>}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Create Automation Rule</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                createRuleMutation.mutate({
                                    name: newRuleName,
                                    trigger_event: newRuleTrigger,
                                    action_type: newRuleAction,
                                    action_config: {},
                                });
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Rule Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                    value={newRuleName}
                                    onChange={(e) => setNewRuleName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Trigger Event</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                    value={newRuleTrigger}
                                    onChange={(e) => setNewRuleTrigger(e.target.value)}
                                >
                                    <option value="ORDER_CREATED">Order Created</option>
                                    <option value="LOW_STOCK">Low Stock Alert</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Action Type</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                    value={newRuleAction}
                                    onChange={(e) => setNewRuleAction(e.target.value)}
                                >
                                    <option value="SEND_EMAIL">Send Email</option>
                                    <option value="CREATE_TASK">Create Task</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                            >
                                Create Rule
                            </button>
                        </form>
                    </div>
                </>
            )}

            <div className="mt-6 border-t pt-6">
                <Link to="/settings/shopify">
                    <Button variant="outline">Shopify Integration</Button>
                </Link>
            </div>
        </div>
    );
}
