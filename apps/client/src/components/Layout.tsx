import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Package,
    Warehouse,
    ShoppingCart,
    TrendingUp,
    Settings,
    LogOut,
    Menu,
    ChevronLeft,
    Search,
    Building2,
    Truck,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MobileNav from "@/components/MobileNav";
import NotificationBell from "./common/NotificationBell";

export default function Layout() {
    const { user, logout, isLoading } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (!isLoading && !user) {
            navigate("/login");
        }
    }, [user, isLoading, navigate]);

    if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
    if (!user) return null;

    const navItems = [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/products", label: "Products", icon: Package },
        { href: "/inventory", label: "Inventory", icon: Warehouse },
        { href: "/warehouses", label: "Warehouses", icon: Building2 },
        { href: "/suppliers", label: "Suppliers", icon: Truck },
        { href: "/customers", label: "Customers", icon: Users },
        { href: "/orders/purchase", label: "Purchase Orders", icon: ShoppingCart },
        { href: "/orders/sales", label: "Sales Orders", icon: TrendingUp },
        { href: "/settings", label: "Settings", icon: Settings },
        { href: "/admin", label: "Admin", icon: Package },
    ];

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Animated Sidebar */}
            <motion.aside
                initial={{ width: isSidebarOpen ? 256 : 80 }}
                animate={{ width: isSidebarOpen ? 256 : 80 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                className="glass border-r relative z-20 flex flex-col hidden md:flex"
            >
                <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.h1
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 truncate"
                            >
                                OptiStock
                            </motion.h1>
                        )}
                    </AnimatePresence>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="hover:bg-primary/10"
                    >
                        {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>

                <nav className="flex-1 mt-6 px-2 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute inset-0 bg-primary opacity-100 z-[-1]"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <Icon className={cn("h-5 w-5 flex-shrink-0 transition-transform duration-200", isSidebarOpen ? "mr-3" : "mx-auto", !isSidebarOpen && "group-hover:scale-110")} />
                                {isSidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border/50">
                    <div className={cn("flex items-center", !isSidebarOpen && "justify-center")}>
                        <Avatar className="h-9 w-9 border-2 border-primary/20">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        {isSidebarOpen && (
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-medium truncate">{user.name || "User"}</p>
                                <button
                                    onClick={() => {
                                        logout();
                                        navigate("/login");
                                    }}
                                    className="text-xs text-muted-foreground hover:text-destructive flex items-center mt-0.5 transition-colors"
                                >
                                    <LogOut className="mr-1 h-3 w-3" /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative pb-16 md:pb-0">
                {/* Glass Navbar */}
                <header className="h-16 glass border-b z-10 flex items-center justify-between px-6 sticky top-0">
                    <div className="flex items-center w-full max-w-md">
                        <div className="relative w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search anything..."
                                className="pl-9 bg-background/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50 transition-all duration-300 hover:bg-background/80"
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <NotificationBell />
                    </div>
                </header>

                {/* Page Content with Transition */}
                <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-7xl mx-auto"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
            <MobileNav />
        </div>
    );
}
