const axios = require("axios");

const API_URL = "http://localhost:3000/api";

async function runDemo() {
    console.log("=== STARTING SECURITY DEMO ===");

    // 1. Test Audit Logging (Login)
    console.log("\n[1] Testing Audit Logging (Login)...");
    try {
        // Attempt login with invalid credentials to trigger failure log
        await axios.post(`${API_URL}/auth/login`, {
            email: "test@example.com",
            password: "wrongpassword"
        }).catch(() => { }); // Expected error
        console.log("-> Triggered failed login (Check server logs for [SECURITY] LOGIN_FAILED)");
    } catch (e) {
        console.error("Login test error:", e.message);
    }

    // 2. Test Rate Limiting
    console.log("\n[2] Testing Rate Limiting (IP Fallback)...");
    // The IP limit is 100 requests per 15 minutes.
    // We will send 110 requests to trigger it.

    console.log("-> Sending 110 requests to trigger IP rate limit...");
    let blocked = false;
    for (let i = 0; i < 110; i++) {
        try {
            await axios.get(`${API_URL}/health`);
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.log(`-> Request ${i + 1}: BLOCKED (429 Too Many Requests)`);
                blocked = true;
                break;
            }
        }
        if (i % 10 === 0) process.stdout.write(".");
    }
    console.log("");

    if (blocked) {
        console.log("-> Rate Limiting VERIFIED.");
    } else {
        console.log("-> Rate Limit not triggered (limit might be higher than 110).");
    }

    console.log("\n=== DEMO COMPLETE ===");
}

runDemo();
