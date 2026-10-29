import prisma from "../prisma";

export class ProductHealthService {
    static async calculateHealthScore(productId: string): Promise<number> {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { variants: { include: { stock_levels: true } } }
        });

        if (!product) return 0;

        let score = 0;

        // 1. Stock Status (30pts)
        const totalStock = product.variants.reduce((acc, v) =>
            acc + v.stock_levels.reduce((s, sl) => s + sl.quantity, 0), 0);

        if (totalStock > 0) score += 30;

        // 2. Sales Velocity (30pts) - Sold in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const salesCount = await prisma.salesItem.count({
            where: {
                variant: { product_id: productId },
                sales_order: { created_at: { gte: thirtyDaysAgo } }
            }
        });

        if (salesCount > 0) score += 30;
        else if (totalStock > 0) score += 10; // In stock but no sales is better than OOS

        // 3. Content Quality (20pts)
        let contentScore = 0;
        if (product.image_url) contentScore += 10;
        if (product.description && product.description.length > 20) contentScore += 5;
        if (product.tags && product.tags.length > 0) contentScore += 5;
        score += contentScore;

        // 4. Variant Health (20pts)
        const variantsValid = product.variants.every(v =>
            v.sku && Number(v.price) > 0 && Number(v.cost_price) > 0
        );
        if (variantsValid && product.variants.length > 0) score += 20;

        // Update Product
        await prisma.product.update({
            where: { id: productId },
            data: { health_score: score }
        });

        return score;
    }
}
