import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scan, X } from "lucide-react";

interface BarcodeScannerProps {
    onScan: (code: string) => void;
    isActive: boolean;
    onClose: () => void;
}

export default function BarcodeScanner({ onScan, isActive, onClose }: BarcodeScannerProps) {
    const [manualCode, setManualCode] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isActive && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isActive]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualCode.trim()) {
            onScan(manualCode.trim());
            setManualCode("");
        }
    };

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-background w-full max-w-md p-6 rounded-lg shadow-lg relative">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>

                <div className="text-center space-y-4">
                    <div className="mx-auto bg-muted h-16 w-16 rounded-full flex items-center justify-center">
                        <Scan className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <h2 className="text-xl font-semibold">Scan Barcode</h2>
                    <p className="text-sm text-muted-foreground">
                        Use a handheld scanner or enter the code manually.
                    </p>

                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            ref={inputRef}
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                            placeholder="Enter barcode..."
                            className="text-lg tracking-widest"
                            autoFocus
                        />
                        <Button type="submit">Enter</Button>
                    </form>

                    <div className="text-xs text-muted-foreground mt-4">
                        Listening for scanner input...
                    </div>
                </div>
            </div>
        </div>
    );
}
