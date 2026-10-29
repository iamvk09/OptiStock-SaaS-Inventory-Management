"use strict";
async function verifyDashboard() {
    try {
        // 1. Login
        const loginRes = await fetch('http://127.0.0.1:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'demo@optistock.com',
                password: 'password123'
            })
        });
        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.status} ${loginRes.statusText}`);
        }
        const loginData = await loginRes.json();
        const token = loginData.token;
        const orgId = loginData.user.organizations[0].organization.id;
        console.log('✅ Login successful');
        console.log('Organization ID:', orgId);
        // 2. Fetch Stats
        const statsRes = await fetch('http://127.0.0.1:3000/api/dashboard/stats', {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-organization-id': orgId
            }
        });
        if (!statsRes.ok) {
            throw new Error(`Stats fetch failed: ${statsRes.status} ${statsRes.statusText}`);
        }
        const stats = await statsRes.json();
        console.log('✅ Dashboard stats fetched');
        // 3. Verify New Metrics
        if (stats.purchaseVsSales && Array.isArray(stats.purchaseVsSales)) {
            console.log(`✅ purchaseVsSales found: ${stats.purchaseVsSales.length} months`);
            console.log('Sample:', stats.purchaseVsSales[0]);
        }
        else {
            console.error('❌ purchaseVsSales missing or invalid');
        }
        if (stats.categoryValuation && Array.isArray(stats.categoryValuation)) {
            console.log(`✅ categoryValuation found: ${stats.categoryValuation.length} categories`);
            console.log('Sample:', stats.categoryValuation[0]);
        }
        else {
            console.error('❌ categoryValuation missing or invalid');
        }
    }
    catch (error) {
        console.error('❌ Error:', error.message);
    }
}
verifyDashboard();
