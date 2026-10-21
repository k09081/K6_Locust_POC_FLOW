import http from 'k6/http';
import {check,group,sleep} from 'k6';
import {htmlReport} from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import {Rate} from 'k6/metrics';
import {Counter} from 'k6/metrics';


const passwd='p@123456';
const base_url='https://quickpizza.grafana.com';
let auth_token='';

const authenticationRate=new Rate('authentication_rate');
const logincounter=new Counter('login_success');

export const options={
    stages:[

        {duration:'10s',target:10},
        {duration:'10s',target:20},
        {duration:'10s',target:30},
        {duration:'10s',target:0}
    ],
    thresholds:{

        'group_duration{group:::user_registration}':['p(95)<500'],
        'group_duration{group:::login_api}':['p(95)<500'],
        'authentication_rate':['rate>0.9'],
        'login_success':['count>5']


        


    }

    
}

function randomString(length){

    const charset='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result='';
    for(let i=0;i<length;i++){
        result+=charset[Math.floor(Math.random()*charset.length)];

    }
    return result;

        
    }

    export default function(){
  
        const username=`ashishp${randomString(7)}`;
        let user_registered=false;
        let user_authenticated=false;

        group('user_registration',function(){


            const register_payload={

                username:username,
                password:passwd

            }

            const params={

                headers:{'Content-Type':'application/json'}
            }

            const response=http.post(`${base_url}/api/users`,JSON.stringify(register_payload),params);

          user_registered=check(response,{

            'status is 201':(response)=>response.status==201,
            'response contains id':(response)=> response.body.includes('id')


          })
          if(user_registered){
          console.log(`user registered successfully for ${username} with status ${response.status}`);
          }
          else{
            console.log(`user registered failed ${username} with status ${response.status}`);
          }
     
        })

        group('login_api',function(){

            const register_payload={

                username:username,
                password:passwd
            }

            const params={
                headers:{'Content-Type':'application/json'}
            }

            const login_response=http.post(`${base_url}/api/users/token/login`,JSON.stringify(register_payload),params);

            user_authenticated=check(login_response,{

                'status is 200':(login_response)=>login_response.status==200,
                'login response contains token':(login_response)=>login_response.json('token')!==undefined

                

            })
            if(user_authenticated){

                authenticationRate.add(1);
                logincounter.add(1);

                auth_token=login_response.json('token');
                console.log(`user authenticated sucessfully for ${username} with status ${login_response.status} and ${auth_token}`)

                }
                else{
                    authenticationRate.add(0);
                    logincounter.add(0);

                    console.log(`user authentication failed for ${username} with status ${login_response.status}`);
                }


        })
    }

    export function handleSummary(data) {
    return {
        "summary.html": htmlReport(data),
    };
}