import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import prisma from "../prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2023-10-16",
});

export const createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.organizationId!;
        const { priceId } = req.body; // e.g., price_...

        const organization = await prisma.organization.findUnique({
            where: { id: organizationId },
        });

        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer: organization.stripe_customer_id || undefined,
            customer_email: !organization.stripe_customer_id ? req.user!.email : undefined,
            success_url: `${process.env.CLIENT_URL}/settings/billing?success=true`,
            cancel_url: `${process.env.CLIENT_URL}/settings/billing?canceled=true`,
            metadata: {
                organizationId,
            },
        });

        res.json({ url: session.url });
    } catch (error) {
        next(error);
    }
};

export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig as string,
            process.env.STRIPE_WEBHOOK_SECRET || ""
        );
    } catch (err: any) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case "checkout.session.completed":
                const session = event.data.object as Stripe.Checkout.Session;
                const organizationId = session.metadata?.organizationId;
                if (organizationId) {
                    // Determine tier based on price ID (simplified logic)
                    // In production, you'd map price IDs to tiers
                    const planTier = "PRO";
                    const maxUsers = 10;
                    const maxWarehouses = 5;

                    await prisma.organization.update({
                        where: { id: organizationId },
                        data: {
                            stripe_customer_id: session.customer as string,
                            subscription_status: "active",
                            plan_tier: planTier,
                            max_users: maxUsers,
                            max_warehouses: maxWarehouses,
                        }
                    });
                }
                break;
            case "customer.subscription.deleted":
                // Handle cancellation
                break;
        }
        res.json({ received: true });
    } catch (error) {
        next(error);
    }
};
