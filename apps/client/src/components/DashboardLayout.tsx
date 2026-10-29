import React, { useState, useEffect, useCallback } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";
import { debounce } from "lodash";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardLayoutProps {
    children: React.ReactNode;
    defaultLayout?: any[];
    onLayoutChange?: (layout: any) => void;
}

export default function DashboardLayout({ children, defaultLayout, onLayoutChange }: DashboardLayoutProps) {
    const { token, organizationId } = useAuthStore();
    const [layouts, setLayouts] = useState<any>({ lg: defaultLayout || [] });

    // Fetch saved layout on mount
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await axios.get("http://localhost:3000/api/dashboard/config", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "x-organization-id": organizationId,
                    },
                });
                if (res.data.layout && res.data.layout.length > 0) {
                    setLayouts({ lg: res.data.layout });
                }
            } catch (error) {
                console.error("Failed to fetch dashboard config", error);
            }
        };
        if (token && organizationId) {
            fetchConfig();
        }
    }, [token, organizationId]);

    const saveLayout = useCallback(
        debounce(async (newLayout: any) => {
            try {
                await axios.post(
                    "http://localhost:3000/api/dashboard/config",
                    { layout: newLayout },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "x-organization-id": organizationId,
                        },
                    }
                );
            } catch (error) {
                console.error("Failed to save layout", error);
            }
        }, 1000),
        [token, organizationId]
    );

    const handleLayoutChange = (currentLayout: any, allLayouts: any) => {
        setLayouts(allLayouts);
        saveLayout(currentLayout);
        if (onLayoutChange) {
            onLayoutChange(currentLayout);
        }
    };

    return (
        <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={30}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".drag-handle"
        >
            {children}
        </ResponsiveGridLayout>
    );
}
