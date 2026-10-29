import prisma from "../prisma";

interface IntegrationProvider {
    syncProducts(config: any): Promise<void>;
    syncOrders(config: any): Promise<void>;
}

class ShopifyProvider implements IntegrationProvider {
    async syncProducts(config: any) {
        console.log("Syncing Shopify products for config:", config.id);
        // Mock implementation: Fetch from Shopify API -> Upsert to DB
        // In a real app, use axios to call Shopify Admin API
    }

    async syncOrders(config: any) {
        console.log("Syncing Shopify orders for config:", config.id);
        // Mock implementation
    }
}

class WooCommerceProvider implements IntegrationProvider {
    async syncProducts(config: any) {
        console.log("Syncing WooCommerce products for config:", config.id);
    }

    async syncOrders(config: any) {
        console.log("Syncing WooCommerce orders for config:", config.id);
    }
}

export class IntegrationService {
    private static getProvider(platform: string): IntegrationProvider {
        switch (platform) {
            case "SHOPIFY": return new ShopifyProvider();
            case "WOOCOMMERCE": return new WooCommerceProvider();
            default: throw new Error(`Unsupported platform: ${platform}`);
        }
    }

    static async syncProducts(organizationId: string, platform: string) {
        const config = await prisma.integrationConfig.findFirst({
            where: { organization_id: organizationId, platform, is_active: true }
        });

        if (!config) throw new Error("Integration not configured or inactive");

        const provider = this.getProvider(platform);
        await provider.syncProducts(config);

        // Update last synced
        await prisma.integrationConfig.update({
            where: { id: config.id },
            data: { updated_at: new Date() } // Ideally add a last_synced_at field to schema
        });
    }

    static async syncOrders(organizationId: string, platform: string) {
        const config = await prisma.integrationConfig.findFirst({
            where: { organization_id: organizationId, platform, is_active: true }
        });

        if (!config) throw new Error("Integration not configured or inactive");

        const provider = this.getProvider(platform);
        await provider.syncOrders(config);
    }
}
