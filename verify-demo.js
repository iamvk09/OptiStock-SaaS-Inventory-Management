const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const DEMO_TOKEN = 'demo-token'; // Assuming backend accepts this for demo user

async function verify() {
    try {
        console.log('🔍 Verifying API Health...');
        const health = await axios.get(`${API_URL}/health`);
        console.log('✅ Health Check:', health.data);

        console.log('\n🔍 Verifying Warehouses...');
        const warehouses = await axios.get(`${API_URL}/warehouses`, {
            headers: {
                Authorization: `Bearer ${DEMO_TOKEN}`,
                'x-organization-id': 'optistock-demo-org'
            }
        });
        console.log(`✅ Found ${warehouses.data.length} warehouses.`);
        if (warehouses.data.length !== 4) throw new Error('Expected 4 warehouses');

        console.log('\n🔍 Verifying Products...');
        const products = await axios.get(`${API_URL}/products`, {
            headers: {
                Authorization: `Bearer ${DEMO_TOKEN}`,
                'x-organization-id': 'optistock-demo-org'
            }
        });
        console.log(`✅ Found ${products.data.length} products.`);
        if (products.data.length < 4) throw new Error('Expected at least 4 products');

        console.log('\n🔍 Creating New Product...');
        const newProduct = await axios.post(`${API_URL}/products`, {
            name: "API Test Product",
            category: "Test",
            variants: [{
                sku: "API-TEST-001",
                price: 100,
                cost_price: 50
            }]
        }, {
            headers: {
                Authorization: `Bearer ${DEMO_TOKEN}`,
                'x-organization-id': 'optistock-demo-org'
            }
        });
        console.log('✅ Product Created:', newProduct.data.name);

        console.log('\n🎉 Verification Successful!');
    } catch (error) {
        console.error('❌ Verification Failed:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    }
}

verify();
