import React from "react";
import { cn } from "@/lib/utils";
import { GripHorizontal } from "lucide-react";

interface WidgetCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    // Props passed by react-grid-layout
    onMouseDown?: React.MouseEventHandler;
    onMouseUp?: React.MouseEventHandler;
    onTouchEnd?: React.TouchEventHandler;
}

// Forward ref is required for react-grid-layout
const WidgetCard = React.forwardRef<HTMLDivElement, WidgetCardProps>(
    ({ title, children, className, style, onMouseDown, onMouseUp, onTouchEnd, ...props }, ref) => {
        return (
            <div
                ref={ref}
                style={style}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onTouchEnd={onTouchEnd}
                className={cn("glass-card flex flex-col overflow-hidden bg-card/50 backdrop-blur-xl border border-border/50", className)}
                {...props}
            >
                <div className="px-5 py-4 border-b border-border/10 bg-muted/20 flex justify-between items-center drag-handle cursor-move transition-colors hover:bg-muted/40">
                    <h3 className="text-sm font-semibold text-foreground/80 tracking-wide uppercase">{title}</h3>
                    <GripHorizontal className="h-4 w-4 text-muted-foreground/50 hover:text-primary transition-colors" />
                </div>
                <div className="p-5 flex-1 overflow-auto">
                    {children}
                </div>
            </div>
        );
    }
);

WidgetCard.displayName = "WidgetCard";

export default WidgetCard;
