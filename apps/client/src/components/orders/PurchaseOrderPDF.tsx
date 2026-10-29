import { format } from "date-fns";

interface PurchaseOrderPDFProps {
    po: any;
}

export default function PurchaseOrderPDF({ po }: PurchaseOrderPDFProps) {
    if (!po) return null;

    return (
        <div id="po-pdf" className="p-8 bg-white text-black hidden print:block">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold mb-2">{po.organization.name}</h1>
                    <p className="text-sm text-gray-600">Purchase Order</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold">PO #{po.id.slice(0, 8)}</h2>
                    <p className="text-sm">Date: {format(new Date(po.created_at), "PPP")}</p>
                </div>
            </div>

            {/* Supplier Info */}
            <div className="mb-8 border-b pb-4">
                <h3 className="font-bold mb-2">Vendor:</h3>
                <p>{po.supplier.name}</p>
                <p>{po.supplier.email}</p>
                <p>{po.supplier.address}</p>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="border-b">
                        <th className="text-left py-2">Item</th>
                        <th className="text-left py-2">SKU</th>
                        <th className="text-right py-2">Qty</th>
                        <th className="text-right py-2">Unit Cost</th>
                        <th className="text-right py-2">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {po.items.map((item: any) => (
                        <tr key={item.id} className="border-b">
                            <td className="py-2">{item.variant.product.name}</td>
                            <td className="py-2">{item.variant.sku}</td>
                            <td className="text-right py-2">{item.quantity}</td>
                            <td className="text-right py-2">${Number(item.unit_cost).toFixed(2)}</td>
                            <td className="text-right py-2">${(item.quantity * Number(item.unit_cost)).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
                <div className="w-64">
                    <div className="flex justify-between py-1">
                        <span>Subtotal:</span>
                        <span>${po.items.reduce((acc: number, i: any) => acc + (i.quantity * Number(i.unit_cost)), 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                        <span>Tax:</span>
                        <span>${Number(po.tax_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                        <span>Shipping:</span>
                        <span>${Number(po.shipping_cost).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-t font-bold mt-2 pt-2">
                        <span>Total:</span>
                        <span>${Number(po.total_amount).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-sm text-gray-500">
                <p>Thank you for your business!</p>
            </div>
        </div>
    );
}
