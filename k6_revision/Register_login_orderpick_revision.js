import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

const base_url = 'https://quickpizza.grafana.com';

export const options = {
    stages: [
        { duration: '3s', target: 10 },
        { duration: '6s', target: 20 },
        { duration: '10s', target: 0 }
    ],
    thresholds: {}
};

function randomString(length) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
    }
    return result;
}

export default function () {
    let Username = `pashishp${randomString(7)}`;
    const password = 'p@1234689';
    let user_registration = false;

    const params = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    group('User_registration', function () {
        const user_credentials = {
            username: Username,
            password: password // Note: QuickPizza expects lowercase 'password'
        };

        // FIXED: Passed 'params' directly instead of wrapping it as '{params}'
        const response = http.post(`${base_url}/api/users`, JSON.stringify(user_credentials), params);

        user_registration = check(response, {
            'status is 201': (response) => response.status == 201,
            'response contains id': (response) => response.body.includes('id')
        });

        if (!user_registration) {
            console.error(`User registration failed for username:${Username} and response:${response.status}`);
        }
    });

    group('login_api', function () {
        const register_payload = {
            username: Username,
            password: password // Note: QuickPizza expects lowercase 'password'
        };

        // FIXED: Passed 'params' directly instead of wrapping it as '{params}'
        const Login_response = http.post(`${base_url}/api/users/token/login`, JSON.stringify(register_payload), params);
        
        let login_authentication = check(Login_response, {
            'status is 200': (Login_response) => Login_response.status == 200,
            'login response contains token': (Login_response) => Login_response.json('token') !== undefined
        });

        if (login_authentication) {
            // FIXED: Changed 'login_response' to 'Login_response' to match your variable declaration
            let auth_token = Login_response.json('token'); 
            console.log(`User authenticated for username:${Username} and response:${Login_response.status}`);
        } else {
            console.log(`User login failed for username:${Username} and response:${Login_response.status}`);
        }
    });

    sleep(2);
}

export function handleSummary(data) {
    return {
        "summary.html": htmlReport(data),
    };
}