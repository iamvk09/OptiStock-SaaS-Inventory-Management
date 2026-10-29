import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../prisma";
import { signToken } from "../utils/jwt";

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

import { SecurityService } from "../services/security.service";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, name } = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password_hash: hashedPassword,
                name,
            },
        });

        const token = signToken({ userId: user.id });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Log registration event
        await SecurityService.logEvent(
            "SYSTEM", // No org yet
            user.id,
            "USER_REGISTER",
            { email: user.email },
            req.ip || "unknown"
        );

        res.status(201).json({ user, token });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { email },
            include: { organizations: { include: { organization: true } } }
        });
        if (!user) {
            // Log failed login attempt
            await SecurityService.logEvent(
                "SYSTEM",
                null,
                "LOGIN_FAILED",
                { email, reason: "User not found" },
                req.ip || "unknown"
            );
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            // Log failed login attempt
            await SecurityService.logEvent(
                "SYSTEM",
                user.id,
                "LOGIN_FAILED",
                { email, reason: "Invalid password" },
                req.ip || "unknown"
            );
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = signToken({ userId: user.id });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Log successful login
        await SecurityService.logEvent(
            "SYSTEM",
            user.id,
            "LOGIN_SUCCESS",
            { email },
            req.ip || "unknown"
        );

        res.json({ user, token });
    } catch (error) {
        next(error);
    }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
};

export const syncUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // User is already attached by authenticate middleware
        const user = req.user!;

        // Ensure user has an organization (simplified logic for MVP)
        // In a real app, we might check if they have invites or create a default org
        const organization = await prisma.organization.findFirst({
            where: { users: { some: { user_id: user.id } } }
        });

        if (organization) {
            await SecurityService.logEvent(
                organization.id,
                user.id,
                "USER_SYNC",
                { email: user.email },
                req.ip || "unknown"
            );
        } else {
            // Auto-create default organization for new users
            console.log(`Creating default organization for user ${user.email}...`);
            const newOrg = await prisma.organization.create({
                data: {
                    name: `${user.name || 'User'}'s Organization`,
                    slug: (user.name || 'user').toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000),
                    users: {
                        create: {
                            user_id: user.id,
                            role: "ADMIN"
                        }
                    }
                }
            });

            // Log organization creation
            await SecurityService.logEvent(
                newOrg.id,
                user.id,
                "ORG_CREATE_AUTO",
                { name: newOrg.name },
                req.ip || "unknown"
            );

            return res.json({ user, organization: newOrg });
        }

        res.json({ user, organization });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req: Request, res: Response) => {
    res.json({ user: req.user });
};
