import prisma from "../prisma";
import nodemailer from "nodemailer";

export class PurchaseService {
    static async predictStockNeeds(productId: string): Promise<number> {
        // 1. Calculate Average Daily Sales (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sales = await prisma.salesItem.findMany({
            where: {
                variant: { product_id: productId },
                sales_order: { created_at: { gte: thirtyDaysAgo } }
            }
        });

        const totalSold = sales.reduce((acc, item) => acc + item.quantity, 0);
        const avgDailySales = totalSold / 30;

        // 2. Get Lead Time (from Supplier or default 14 days)
        // Ideally we'd fetch this from the supplier linked to the product, 
        // but for now we'll use a default or a simple lookup if a supplier exists.
        const leadTimeDays = 14;

        // 3. Calculate Safety Stock (Buffer for 7 days)
        const safetyStock = avgDailySales * 7;

        // 4. Calculate Reorder Point
        const reorderPoint = (avgDailySales * leadTimeDays) + safetyStock;

        // 5. Get Current Stock
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { variants: { include: { stock_levels: true } } }
        });

        const currentStock = product?.variants.reduce((acc, v) =>
            acc + v.stock_levels.reduce((s, sl) => s + sl.quantity, 0), 0) || 0;

        // 6. Recommendation
        if (currentStock < reorderPoint) {
            return Math.ceil(reorderPoint - currentStock);
        }

        return 0;
    }

    static async sendPOEmail(poId: string): Promise<boolean> {
        const po = await prisma.purchaseOrder.findUnique({
            where: { id: poId },
            include: {
                supplier: true,
                items: { include: { variant: { include: { product: true } } } },
                organization: true
            }
        });

        if (!po || !po.supplier.email) return false;

        // Configure Transporter (Mock for demo, or use env vars)
        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: "ethereal.user@example.com", // Replace with real creds in prod
                pass: "ethereal_pass"
            }
        });

        // Email Content
        const itemsList = po.items.map(i =>
            `- ${i.variant.product.name} (${i.variant.sku}): ${i.quantity} units @ $${i.unit_cost}`
        ).join("\n");

        const mailOptions = {
            from: `"Inventory System" <no-reply@${po.organization.slug}.com>`,
            to: po.supplier.email,
            subject: `Purchase Order #${po.id.slice(0, 8)}`,
            text: `Dear ${po.supplier.name},\n\nPlease find attached our purchase order.\n\nItems:\n${itemsList}\n\nTotal: $${po.total_amount}\n\nRegards,\n${po.organization.name}`
        };

        try {
            // In a real app, we would await transporter.sendMail(mailOptions);
            console.log("Sending Email to:", po.supplier.email);
            console.log("Content:", mailOptions.text);
            return true;
        } catch (error) {
            console.error("Failed to send email", error);
            return false;
        }
    }
}
