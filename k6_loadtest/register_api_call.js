import http from 'k6/http';
import { sleep } from 'k6';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

const base_url = 'https://quickpizza.grafana.com';
const username = 'prabhakar68697';
const passwd = 'p@1234689';
let user_resgistered = false;



export const options = {

    vus: 1,
    duration: '3s'

}

export default function () {

    group('user registration', function () {

        const register_payload = {

            Username: username,
            Password: passwd
        }
        const params = {

            headers: {
                'Content-Type': 'application/json'
            }
        }

        const response = http.post(`${base_url}/api/users`, JSON.stringify(register_payload), params);

        user_resgistered = check(response, {
            'status is 201': (response) => response.status == 201,
            'response contains id': (response) => response.body.includes('id')
        })

        if (!user_resgistered) {

            console.error(`user registrtion failed for ${username} with status ${response.status} and body ${response.body}`);

        }

    })


}