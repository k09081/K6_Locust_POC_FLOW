import { browser } from 'k6/browser';
import http from 'k6/http';
import { check } from 'k6';



export const options = {


    scenarios: {


        ui_test: {
            executor: 'shared-iterations',
            exec: 'browserTest',
            vus: 2,
            maxDuration: '1m',
            iterations: 4,
            options: {

                browser: {
                    type: 'chromium',
                    headless: false
                }
            }

        },

        backend_test: {
            executor: 'constant-vus',
            exec: 'backendTest',
            vus: 10,
            duration: '1m'
        }
    },
    thresholds: {

        checks: ['rate>0.5'],
        'browser_web_vital_cls': ['p(95)<200'],
        'browser_web_vital_fcp': ['p(95)<100'],
        'browser_web_vital_lcp{url:https://sso.teachable.com/secure/9521/identity/login/password?force=true}': ['p(95)<300']
        //there is no tag options in browser based testing in k6 unlike backend api testing.

    }

}

export async function browserTest() {

    const context = await browser.newContext(); // it will open incognito mode in the browser.

    const page = await context.newPage();// it will a new page in the browser.

    await page.goto('https://sso.teachable.com/secure/9521/identity/login/password?force=true');

    await page.locator('#email').type('ashish1998prabhakar@gmail.com');
    await page.locator('#password').type('Ashish@1998');
    console.log('attempting to click on login button');
    await page.locator("input[value='Log in']").click();
    console.log('Login button clicked');

    await page.waitForTimeout(20000);
    //  Correct: Added () to execute .first()
    const greetingText = await page.locator("h2[class='h2 text-center hidden md:block DashboardGreeting']").first().textContent();

    check(greetingText, {

        'greeting text is correct': (greetingText) => greetingText.includes('Welcome back ashish.')

    })

    await page.close();

}

export async function backendTest() {

    const response = http.get('https://sso.teachable.com/secure/9521/identity/login/password?force=true');

    check(response, {

        'status is 201': (response) => response.status === 201

    })


}

