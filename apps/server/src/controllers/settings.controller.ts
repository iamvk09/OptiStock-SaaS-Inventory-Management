import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { z } from "zod";

// Feature Flags
const createFeatureFlagSchema = z.object({
    key: z.string().min(1),
    is_enabled: z.boolean().optional(),
    description: z.string().optional(),
});

export const createFeatureFlag = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { key, is_enabled, description } = createFeatureFlagSchema.parse(req.body);
        const organizationId = req.organizationId!;

        const flag = await prisma.featureFlag.create({
            data: {
                organization_id: organizationId,
                key,
                is_enabled: is_enabled ?? false,
                description,
            },
        });
        res.status(201).json(flag);
    } catch (error) {
        next(error);
    }
};

export const getFeatureFlags = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.organizationId!;
        const flags = await prisma.featureFlag.findMany({
            where: { organization_id: organizationId },
        });
        res.json(flags);
    } catch (error) {
        next(error);
    }
};

export const updateFeatureFlag = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { is_enabled } = req.body;
        const organizationId = req.organizationId!;

        const flag = await prisma.featureFlag.update({
            where: { id, organization_id: organizationId },
            data: { is_enabled },
        });
        res.json(flag);
    } catch (error) {
        next(error);
    }
};

// Custom Fields
const createCustomFieldSchema = z.object({
    entity_type: z.enum(["PRODUCT", "ORDER", "CUSTOMER"]),
    name: z.string().min(1),
    type: z.enum(["TEXT", "NUMBER", "DATE", "BOOLEAN"]),
    is_required: z.boolean().optional(),
});

export const createCustomField = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { entity_type, name, type, is_required } = createCustomFieldSchema.parse(req.body);
        const organizationId = req.organizationId!;

        const field = await prisma.customField.create({
            data: {
                organization_id: organizationId,
                entity_type,
                name,
                type,
                is_required: is_required ?? false,
            },
        });
        res.status(201).json(field);
    } catch (error) {
        next(error);
    }
};

export const getCustomFields = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.organizationId!;
        const fields = await prisma.customField.findMany({
            where: { organization_id: organizationId },
        });
        res.json(fields);
    } catch (error) {
        next(error);
    }
};

// Automation Rules
const createAutomationRuleSchema = z.object({
    name: z.string().min(1),
    trigger_event: z.string(),
    action_type: z.string(),
    action_config: z.any(),
});

export const createAutomationRule = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, trigger_event, action_type, action_config } = createAutomationRuleSchema.parse(req.body);
        const organizationId = req.organizationId!;

        const rule = await prisma.automationRule.create({
            data: {
                organization_id: organizationId,
                name,
                trigger_event,
                action_type,
                action_config,
            },
        });
        res.status(201).json(rule);
    } catch (error) {
        next(error);
    }
};

export const getAutomationRules = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.organizationId!;
        const rules = await prisma.automationRule.findMany({
            where: { organization_id: organizationId },
        });
        res.json(rules);
    } catch (error) {
        next(error);
    }
};
