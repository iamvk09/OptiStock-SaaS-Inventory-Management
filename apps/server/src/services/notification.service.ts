import prisma from "../prisma";
import { supabase } from "../lib/supabase";

export class NotificationService {
    static async createNotification(
        organizationId: string,
        title: string,
        message: string,
        type: "INFO" | "WARNING" | "ERROR" | "SUCCESS" = "INFO"
    ) {
        const notification = await prisma.notification.create({
            data: {
                organization_id: organizationId,
                title,
                message,
                type,
                is_read: false,
            },
        });

        // Broadcast via Supabase Realtime
        await supabase
            .channel(`org-notifications-${organizationId}`)
            .send({
                type: "broadcast",
                event: "new-notification",
                payload: notification,
            });

        return notification;
    }

    static async getNotifications(organizationId: string) {
        return prisma.notification.findMany({
            where: { organization_id: organizationId },
            orderBy: { created_at: "desc" },
            take: 50,
        });
    }

    static async markAsRead(id: string, organizationId: string) {
        return prisma.notification.update({
            where: { id, organization_id: organizationId },
            data: { is_read: true },
        });
    }
}
