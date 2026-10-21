import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

const base_url = 'https://quickpizza.grafana.com';

const configobj = JSON.parse(open('./test_config.json'));
const usertemplate = JSON.parse(open('./user.json'));
const passwd = usertemplate.password || 'SecurePassword123!'; // Fallback password

function getTestconfig() {
    const testtype = __ENV.TEST_TYPE || 'smoke';
    return configobj[testtype];
}

const selectedconfig = getTestconfig();

function randomString(length) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += charset[Math.floor(Math.random() * charset.length)];
    }
    return result;
}

export const options = {
    cloud: {
        ProjectID: 8144820,
        distribution: {
            'amazon:us:ashburn': { loadZone: 'amazon:gb:london', percent: 100 },
        }
    },
    stages: selectedconfig.stages,
    thresholds: selectedconfig.thresholds
};

export default function () {
    let username = `ashishp${randomString(7)}`;
    let user_registered = false;
    let user_authenticated = false;
    let auth_token = '';

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
            'status is 201': (res) => res.status === 201,
            'response contains id': (res) => res.status === 201 && res.json('id') !== undefined
        });

        if (!user_registered) {
            console.error(`user registration failed for ${username} [Status ${response.status}]: ${response.body}`);
        }
    });

    group('login api', function () {
        // Do not attempt login if registration failed
        if (!user_registered) {
            console.error(`Skipping login for ${username} because registration failed.`);
            return;
        }

        const login_payload = {
            username: username,
            password: passwd
        };

        const params = {
            headers: { 'Content-Type': 'application/json' }
        };

        const login_response = http.post(`${base_url}/api/users/token/login`, JSON.stringify(login_payload), params);

        user_authenticated = check(login_response, {
            'status is 200': (res) => res.status === 200,
            'login response contains token': (res) => res.status === 200 && res.json('token') !== undefined
        });

        if (user_authenticated && login_response.status === 200) {
            auth_token = login_response.json('token');
            console.log(`user authenticated successfully: ${username}`);
        } else {
            console.error(`user authentication failed for ${username} [Status ${login_response.status}]: ${login_response.body}`);
        }
    });

    group('Order_Management', function () {
        if (!user_authenticated || !auth_token) {
            console.error(`Skipping order management for ${username} due to failed authentication.`);
            return;
        }

        const params = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth_token}`
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

        const Order_response = http.post(`${base_url}/api/pizza`, JSON.stringify(orderpayload), params);

        let order_authenication = check(Order_response, {
            'status is 200': (res) => res.status === 200,
            'Order contains id': (res) => res.status === 200 && res.json('pizza.id') !== undefined,
        });

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
    if (__ENV.K6_CLOUD === undefined) {
        return {
            "summary.html": htmlReport(data),
        };
    }
    return {};
}