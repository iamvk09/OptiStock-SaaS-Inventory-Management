import { Request, Response, NextFunction } from "express";
import { NotificationService } from "../services/notification.service";

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.organizationId!;
        const notifications = await NotificationService.getNotifications(organizationId);
        res.json(notifications);
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const organizationId = req.organizationId!;
        await NotificationService.markAsRead(id, organizationId);
        res.json({ message: "Marked as read" });
    } catch (error) {
        next(error);
    }
};
