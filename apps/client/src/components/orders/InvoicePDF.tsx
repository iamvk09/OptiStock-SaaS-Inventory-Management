import { format } from "date-fns";

interface InvoicePDFProps {
    order: any;
}

export default function InvoicePDF({ order }: InvoicePDFProps) {
    if (!order) return null;

    return (
        <div id="invoice-pdf" className="p-8 bg-white text-black hidden print:block">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold mb-2">INVOICE</h1>
                    <p className="text-sm text-gray-600">{order.organization?.name || "Our Company"}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold">#{order.id.slice(0, 8)}</h2>
                    <p className="text-sm">Date: {format(new Date(order.created_at), "PPP")}</p>
                    <p className="text-sm">Status: {order.payment_status}</p>
                </div>
            </div>

            {/* Bill To */}
            <div className="mb-8 border-b pb-4">
                <h3 className="font-bold mb-2">Bill To:</h3>
                <p>{order.customer.name}</p>
                <p>{order.customer.email}</p>
                <p>{order.customer.address}</p>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="border-b">
                        <th className="text-left py-2">Item</th>
                        <th className="text-left py-2">SKU</th>
                        <th className="text-right py-2">Qty</th>
                        <th className="text-right py-2">Price</th>
                        <th className="text-right py-2">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map((item: any) => (
                        <tr key={item.id} className="border-b">
                            <td className="py-2">{item.variant.product.name}</td>
                            <td className="py-2">{item.variant.sku}</td>
                            <td className="text-right py-2">{item.quantity}</td>
                            <td className="text-right py-2">${Number(item.unit_price).toFixed(2)}</td>
                            <td className="text-right py-2">${(item.quantity * Number(item.unit_price)).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
                <div className="w-64">
                    <div className="flex justify-between py-1 border-t font-bold mt-2 pt-2">
                        <span>Total:</span>
                        <span>${Number(order.total_amount).toFixed(2)}</span>
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
