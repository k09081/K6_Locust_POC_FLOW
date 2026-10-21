import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

const base_url = 'https://quickpizza.grafana.com';
const passwd = 'p@1234689';

function randomString(length) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
    }
    return result;
}

export const options = {
    stages: [
        { duration: '3s', target: 10 },
        { duration: '6s', target: 20 },
        { duration: '10s', target: 0 }
    ],
    thresholds: {
        'http_req_duration': ['p(95)<300'],
        checks: ['rate>0.9'],
        'iteration_duration': ['p(95)<2'],
        'group_duration{group:::Order_Management}': ['p(95)<500'],
        'group_duration{group:::login api}':['p(95)<500'],
        'group_duration{group:::user registration}':['p(95)<500']
    }
};

export default function () {
    let username = `ashishp${randomString(7)}`;
    let user_registered = false;
    let user_authenticated = false;
    let auth_token = ''; // Declared here so all groups can access it

    group('user registration', function () {
        const register_payload = {
            username: username,
            password: passwd
        };

        const params = {
            headers: { 'Content-Type': 'application/json' }
        };

        const response = http.post(`${base_url}/api/users`, JSON.stringify(register_payload), params);

        user_registered = check(response, {
            'status is 201': (res) => res.status == 201,
            'response contains id': (res) => res.body.includes('id')
        });

        if (!user_registered) {
            console.error(`user registration failed for ${username} with status ${response.status}`);
        }
    });

    group('login api', function () {
        const register_payload = {
            username: username,
            password: passwd
        };

        const params = {
            headers: { 'Content-Type': 'application/json' }
        };

        const login_response = http.post(`${base_url}/api/users/token/login`, JSON.stringify(register_payload), params);

        user_authenticated = check(login_response, {
            'status is 200': (res) => res.status == 200,
            'login response contains token': (res) => res.json('token') !== undefined
        });

        if (user_authenticated) {
            auth_token = login_response.json('token');
            console.log(`user authenticated successfully: ${username}`);
        } else {
            console.log(`user authentication failed for ${username}`);
        }
    });

    group('Order_Management', function () {
        // Guard clause: Only proceed if authentication succeeded
        if (!user_authenticated || !auth_token) {
            console.error(`Skipping order management for ${username} due to failed authentication.`);
            return;
        }

        const params = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth_token}` // FIXED: Backticks & Bearer prefix
            }
        };

        const orderpayload = {
            maxCaloriesPerSlice: 1000,
            mustBeVegetarian: true,
            excludedIngredients: [],
            excludedTools: ["pizzaclutter"],
            maxnumberOfToppings: 9,
            minnumberOfToppings: 2,
            customName: "hello"
        };

        // FIXED: Correct endpoint URL (removed extra '}')
        const Order_response = http.post(`${base_url}/api/pizza`, JSON.stringify(orderpayload), params);

        let order_authenication = check(Order_response, {
            'status is 200': (res) => res.status === 200,
            'Order contains id': (res) => res.status === 200 && res.json('pizza.id') !== undefined,
        });

        // Safe extraction only if status is 200
        if (order_authenication && Order_response.status === 200) {
            const order_id = Order_response.json('pizza.id');
            console.log(`Order created successfully with ID: ${order_id}`);

            const order_details_response = http.get(`${base_url}/api/pizza/${order_id}`, params);

            let order_validation = check(order_details_response, {
                'Status is 200': (res) => res.status === 200,
                'order details contains id': (res) => res.json('id') == order_id
            });

            if (order_validation) {
                console.log(`Order retrieved successfully with ID: ${order_id}`);
            } else {
                console.log(`Order retrieval failed for ID: ${order_id}`);
            }
        } else {
            console.error(`Order creation failed for ${username} with status ${Order_response.status}`);
        }
    });

    sleep(2);
}

export function handleSummary(data) {
    return {
        "summary.html": htmlReport(data),
    };
}