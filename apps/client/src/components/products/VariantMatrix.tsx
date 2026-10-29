import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X } from "lucide-react";

interface VariantMatrixProps {
    onVariantsGenerated: (variants: any[]) => void;
}

export default function VariantMatrix({ onVariantsGenerated }: VariantMatrixProps) {
    const [attributes, setAttributes] = useState<{ name: string; values: string[] }[]>([
        { name: "Size", values: ["S", "M", "L"] },
        { name: "Color", values: ["Red", "Blue"] }
    ]);

    const [generatedVariants, setGeneratedVariants] = useState<any[]>([]);

    const addAttribute = () => {
        setAttributes([...attributes, { name: "", values: [] }]);
    };

    const updateAttributeName = (index: number, name: string) => {
        const newAttrs = [...attributes];
        newAttrs[index].name = name;
        setAttributes(newAttrs);
    };

    const updateAttributeValues = (index: number, valuesStr: string) => {
        const newAttrs = [...attributes];
        newAttrs[index].values = valuesStr.split(",").map(v => v.trim()).filter(v => v);
        setAttributes(newAttrs);
    };

    const removeAttribute = (index: number) => {
        setAttributes(attributes.filter((_, i) => i !== index));
    };

    const generate = () => {
        if (attributes.length === 0) return;

        // Cartesian product
        const cartesian = (a: any[], b: any[]) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));

        let combinations = attributes[0].values.map(v => ({ [attributes[0].name]: v }));

        for (let i = 1; i < attributes.length; i++) {
            const nextAttr = attributes[i];
            const nextValues = nextAttr.values.map(v => ({ [nextAttr.name]: v }));
            // @ts-ignore
            combinations = cartesian(combinations, nextValues).map(arr => Object.assign({}, ...arr));
        }

        const variants = combinations.map((combo: any) => ({
            sku: "",
            price: 0,
            cost_price: 0,
            attributes: combo,
            name: Object.values(combo).join(" / ")
        }));

        setGeneratedVariants(variants);
        onVariantsGenerated(variants);
    };

    const updateVariant = (index: number, field: string, value: any) => {
        const newVariants = [...generatedVariants];
        newVariants[index][field] = value;
        setGeneratedVariants(newVariants);
        onVariantsGenerated(newVariants);
    };

    return (
        <div className="space-y-6 border p-4 rounded-md">
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Variant Matrix Generator</h3>
                    <Button type="button" variant="outline" onClick={addAttribute}>Add Attribute</Button>
                </div>

                {attributes.map((attr, index) => (
                    <div key={index} className="flex gap-4 items-end">
                        <div className="grid gap-2">
                            <Label>Attribute Name</Label>
                            <Input
                                placeholder="e.g. Size"
                                value={attr.name}
                                onChange={e => updateAttributeName(index, e.target.value)}
                            />
                        </div>
                        <div className="flex-1 grid gap-2">
                            <Label>Values (comma separated)</Label>
                            <Input
                                placeholder="e.g. S, M, L"
                                value={attr.values.join(", ")}
                                onChange={e => updateAttributeValues(index, e.target.value)}
                            />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeAttribute(index)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}

                <Button type="button" onClick={generate}>Generate Variants</Button>
            </div>

            {generatedVariants.length > 0 && (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Variant</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Cost</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {generatedVariants.map((v, i) => (
                                <TableRow key={i}>
                                    <TableCell>{v.name}</TableCell>
                                    <TableCell>
                                        <Input
                                            value={v.sku}
                                            onChange={e => updateVariant(i, "sku", e.target.value)}
                                            placeholder="SKU"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={v.price}
                                            onChange={e => updateVariant(i, "price", Number(e.target.value))}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={v.cost_price}
                                            onChange={e => updateVariant(i, "cost_price", Number(e.target.value))}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
