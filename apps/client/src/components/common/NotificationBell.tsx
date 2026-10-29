import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
    is_read: boolean;
    created_at: string;
}

export default function NotificationBell() {
    const { token, organizationId } = useAuthStore();
    const queryClient = useQueryClient();
    const [unreadCount, setUnreadCount] = useState(0);

    const { data: notifications } = useQuery({
        queryKey: ["notifications", organizationId],
        queryFn: async () => {
            if (!token || !organizationId) return [];
            const res = await axios.get("http://localhost:3000/api/notifications", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-organization-id": organizationId,
                },
            });
            return res.data;
        },
        enabled: !!token && !!organizationId,
        refetchInterval: 60000, // Fallback polling
    });

    useEffect(() => {
        if (notifications) {
            setUnreadCount(notifications.filter((n: Notification) => !n.is_read).length);
        }
    }, [notifications]);

    useEffect(() => {
        if (!organizationId) return;

        const channel = supabase
            .channel(`org-notifications-${organizationId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "Notification",
                    filter: `organization_id=eq.${organizationId}`,
                },
                (payload) => {
                    console.log("New notification:", payload);
                    queryClient.invalidateQueries({ queryKey: ["notifications"] });
                    // Optional: Show toast
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [organizationId, queryClient]);

    const markAsRead = async (id: string) => {
        try {
            await axios.patch(
                `http://localhost:3000/api/notifications/${id}/read`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "x-organization-id": organizationId,
                    },
                }
            );
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                    {notifications?.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                            No notifications
                        </div>
                    ) : (
                        notifications?.map((notification: Notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`flex flex-col items-start p-4 cursor-pointer ${!notification.is_read ? "bg-gray-50" : ""
                                    }`}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="flex w-full justify-between">
                                    <span className="font-medium text-sm">{notification.title}</span>
                                    <span className="text-xs text-gray-400">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {notification.message}
                                </p>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
