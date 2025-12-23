// Using native fetch in Node 22

// CONFIG
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
    email: 'owner@example.com',
    password: 'password123',
    name: 'Owner User',
    phone: '010-1111-1111'
};

let accessToken = '';
let shopId = 0;
let userId = 0;
let ticketId = 0;
let customerId = 0; // For prepaid charging test (can be same as userId or new customer)

// UTILS
async function request(method, path, body = null, headers = {}) {
    const opts = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
            ...headers
        }
    };
    if (body) opts.body = JSON.stringify(body);

    console.log(`\n[${method}] ${path} ...`);
    try {
        const res = await fetch(`${BASE_URL}${path}`, opts);
        const data = await res.json().catch(() => ({}));
        console.log(`Status: ${res.status}`);
        if (res.status >= 400) console.log('Error:', JSON.stringify(data));
        return { status: res.status, data };
    } catch (e) {
        console.error('Request Failed:', e.message);
        return { status: 500, error: e.message };
    }
}

async function runTests() {
    console.log('=== STARTING BACKEND TESTS ===');

    // 1. Auth: Register (Skipping for Seed User test)
    // const regRes = await request('POST', '/users', TEST_USER);
    // if (regRes.status === 201) {
    //     console.log('✅ Register Success');
    //     userId = regRes.data.user_id || regRes.data.id; 
    // } else {
    //     console.log('ℹ️ Skipping Register (Using existing user)');
    // }

    // 2. Auth: Login
    const loginRes = await request('POST', '/auth/login', { email: TEST_USER.email, password: TEST_USER.password });
    if (loginRes.status === 201 || loginRes.status === 200) {
        console.log('✅ Login Success');
        accessToken = loginRes.data.accessToken;
        // userId might be in loginRes.data.user.id
        if (!userId) userId = loginRes.data.user.id;
    } else {
        console.error('❌ Login Failed. Aborting.');
        return;
    }

    // 3. Shop: Get My Shop (Usually created on register or seeding. If null, we might need to create one, but let's see)
    // NOTE: If registration doesn't create a shop, we need to create one manually or assume one exists.
    // Let's try getting my shop.
    const shopRes = await request('GET', '/shops/my-shop');
    if (shopRes.status === 200) {
        console.log('✅ Get My Shop Success');
        shopId = shopRes.data.shop_id;
        console.log('Shop ID:', shopId);
    } else {
        console.log('⚠️ No Shop Found. Tests requiring Shop ID will fail.');
    }

    if (shopId) {
        // 4. Prepaid: Create Ticket
        const ticketPayload = {
            name: "Test VIP Ticket",
            price: 100000,
            credit_amount: 110000,
            validity_days: 365
        };
        const ticketRes = await request('POST', `/shops/${shopId}/prepaid-tickets`, ticketPayload);
        if (ticketRes && (ticketRes.status === 201 || ticketRes.status === 200)) {
            console.log('✅ Create Prepaid Ticket Success');
            ticketId = ticketRes.data.ticket_id ? Number(ticketRes.data.ticket_id) : 0; // JSON might imply string for BigInt
        } else {
            console.log('❌ Create Prepaid Ticket Failed');
        }

        // 5. Prepaid: List Tickets
        const listTicketsRes = await request('GET', `/shops/${shopId}/prepaid-tickets`);
        if (listTicketsRes.status === 200 && Array.isArray(listTicketsRes.data)) {
            console.log(`✅ List Tickets Success. Count: ${listTicketsRes.data.length}`);
        }

        // 6. Prepaid: Charge (Using the logged in user as the customer for simplicity)
        // If ticketId exists, charge ticket. Else charge manual.
        let chargePayload = {};
        if (ticketId) {
            chargePayload = { ticketId: ticketId };
        } else {
            chargePayload = { amount: 50000, bonusAmount: 5000 };
        }

        const chargeRes = await request('POST', `/shops/${shopId}/customers/${userId}/prepaid/charge`, chargePayload);
        if (chargeRes.status === 201 || chargeRes.status === 200) {
            console.log('✅ Charge Prepaid Success');
        } else {
            console.log('❌ Charge Prepaid Failed');
        }

        // 7. Prepaid: Get Balance
        const balanceRes = await request('GET', `/shops/${shopId}/customers/${userId}/prepaid`);
        if (balanceRes.status === 200) {
            console.log('✅ Get Balance Success:', balanceRes.data);
            if (balanceRes.data.balance > 0) console.log('   -> Balance verification OK');
        }
    }

    console.log('=== TESTS COMPLETED ===');
}

runTests();
