import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        const handleAuthCallback = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error("Auth error:", error);
                navigate("/login");
                return;
            }

            if (session?.user) {
                try {
                    // Call backend to sync user and get full details
                    const res = await axios.get("http://localhost:3000/api/auth/me", {
                        headers: { Authorization: `Bearer ${session.access_token}` }
                    });

                    setAuth(res.data.user, session.access_token);
                    navigate("/");
                } catch (err) {
                    console.error("Sync error:", err);
                    navigate("/login");
                }
            } else {
                navigate("/login");
            }
        };

        handleAuthCallback();
    }, [navigate, setAuth]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
                <p className="mt-2 text-gray-600">Completing sign in...</p>
            </div>
        </div>
    );
}
