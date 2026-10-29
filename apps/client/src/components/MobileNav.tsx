import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Warehouse, ShoppingCart, TrendingUp, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function MobileNav() {
    const location = useLocation();

    const navItems = [
        { href: "/", label: "Home", icon: LayoutDashboard },
        { href: "/products", label: "Products", icon: Package },
        { href: "/inventory", label: "Stock", icon: Warehouse },
        { href: "/orders/sales", label: "Orders", icon: TrendingUp },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-lg border-t border-border/50 md:hidden">
            <nav className="h-full flex items-center justify-around px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className="relative">
                                <Icon className={cn("h-5 w-5 transition-transform duration-200", isActive && "-translate-y-1")} />
                                {isActive && (
                                    <motion.div
                                        layoutId="mobileNavIndicator"
                                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
