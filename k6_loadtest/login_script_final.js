import http from 'k6/http'; // Fixed: Removed curly braces
import { sleep, check } from 'k6';
import { Trend } from 'k6/metrics';
import { group } from 'k6';

const base_url = 'https://quickpizza.grafana.com';
const passwd = 'p@1234689';

// Fixed: Correct random string generation logic
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
    stages:[

        {duration:'3s',target:10},
        {duration:'6s',target:20},
        {duration:'10s',target:0}
    ],
    thresholds:{

     'http_req_duration':['p(95)<300'],
     checks:['rate>0.9'],
     'iteration_duration':['p(95)<2']


}
};

export default function () {
    let user_registered = false;
    let username = `ashishp${randomString(7)}`;

    group('user registration', function () {
        const register_payload = {
            Username: username,
            password: passwd
        };

        const params = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const response = http.post(`${base_url}/api/users`, JSON.stringify(register_payload), params);

        user_registered = check(response, {
            'status is 201': (res) => res.status == 201,
            'response contains id': (res) => res.body.includes('id')
        });

        if (!user_registered) {
            console.error(`user registration failed for ${username} with status ${response.status} and body ${response.body}`);
        }
    });

    group('login api', function () {
        const register_payload = {
            Username: username,
            password: passwd
        };
        
        const params = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const login_response = http.post(`${base_url}/api/users/token/login`, JSON.stringify(register_payload), params);

        // Fixed: Defined user_authenticated, fixed 'r' typo to 'login_response'
        let user_authenticated = check(login_response, {
            'status is 200': (res) => res.status == 200,
            'login response contains token': (res) => res.json('token') !== undefined,
            'token is valid string': (res) => res.json('token').length > 4
        });

        if (user_authenticated) {
            let auth_token = login_response.json('token'); // Note: k6 uses lowercase .json(), not .JSON()
            console.log(`user authenticated successfully: ${username}`);
        } else {
            console.log(`user authentication failed for ${username}`);
        }
    });
}