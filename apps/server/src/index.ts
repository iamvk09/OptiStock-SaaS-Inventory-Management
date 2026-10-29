import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import prisma from "./prisma";
import router from "./routes";
import { ipRateLimiter } from "./middleware/rate-limit";

import { initSentry } from "./sentry";

initSentry();

const app = express();
// const prisma = new PrismaClient(); // Removed local instance
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true
}));
app.use(ipRateLimiter);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "OptiStock API" });
});

app.use("/api", router);

async function main() {
    try {
        await prisma.$connect();
        console.log("Connected to database");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

main();
