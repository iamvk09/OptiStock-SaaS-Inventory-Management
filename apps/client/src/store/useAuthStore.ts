import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import axios from "axios";

interface User {
    id: string;
    email: string;
    name?: string;
    organizations?: any[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    organizationId: string | null;
    isLoading: boolean;
    setAuth: (user: User, token: string) => void;
    setOrganizationId: (id: string) => void;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            organizationId: null,
            isLoading: true,
            setAuth: (user, token) => set({ user, token }),
            setOrganizationId: (id) => set({ organizationId: id }),
            logout: async () => {
                await supabase.auth.signOut();
                set({ user: null, token: null, organizationId: null });
            },
            checkSession: async () => {
                set({ isLoading: true });
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        const token = session.access_token;
                        // Sync with backend to get local user details and organization
                        // Use fetch or axios. Assuming axios is configured or use fetch if axios missing
                        // But client usually has axios.
                        try {
                            const res = await axios.post("http://localhost:3000/api/auth/sync", {}, {
                                headers: { Authorization: `Bearer ${token}` }
                            });

                            set({
                                user: res.data.user,
                                token,
                                organizationId: res.data.organization?.id || res.data.user.organizations?.[0]?.organization?.id || null,
                                isLoading: false
                            });
                        } catch (syncError) {
                            console.error("Sync failed", syncError);
                            // Fallback to session user
                            set({
                                user: {
                                    id: session.user.id,
                                    email: session.user.email!,
                                    name: session.user.user_metadata.name
                                },
                                token,
                                isLoading: false
                            });
                        }
                    } else {
                        set({ user: null, token: null, isLoading: false });
                    }
                } catch (error) {
                    console.error("Session check failed:", error);
                    set({ user: null, token: null, isLoading: false });
                }
            }
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({ organizationId: state.organizationId }),
        }
    )
);
