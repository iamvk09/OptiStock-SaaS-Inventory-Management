import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScanBarcode } from "lucide-react";

interface BarcodeScannerProps {
    onScan: (code: string) => void;
}

export default function BarcodeScanner({ onScan }: BarcodeScannerProps) {
    const [isScanMode, setIsScanMode] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState("");

    useEffect(() => {
        if (isScanMode) {
            inputRef.current?.focus();

            // Keep focus on input
            const handleBlur = () => {
                if (isScanMode) {
                    setTimeout(() => inputRef.current?.focus(), 100);
                }
            };

            const inputEl = inputRef.current;
            inputEl?.addEventListener("blur", handleBlur);
            return () => inputEl?.removeEventListener("blur", handleBlur);
        }
    }, [isScanMode]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            if (value.trim()) {
                onScan(value.trim());
                setValue("");
            }
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-gray-50 mb-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <ScanBarcode className="h-5 w-5 text-indigo-600" />
                    <Label htmlFor="scan-mode" className="font-medium">Scan Mode</Label>
                </div>
                <Switch
                    id="scan-mode"
                    checked={isScanMode}
                    onCheckedChange={setIsScanMode}
                />
            </div>

            <div className="relative">
                <Input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isScanMode ? "Ready to scan..." : "Enter barcode manually..."}
                    className={isScanMode ? "border-indigo-500 ring-2 ring-indigo-200" : ""}
                />
                {isScanMode && (
                    <div className="absolute right-3 top-2.5">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </div>
                )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
                {isScanMode
                    ? "Scanner active. Input will auto-focus. Press Enter to submit."
                    : "Toggle Scan Mode to capture barcode scanner input automatically."}
            </p>
        </div>
    );
}
