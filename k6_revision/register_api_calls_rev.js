import http from 'k6/http';
import {sleep} from 'k6';
import {check} from 'k6';
import {Trend} from 'k6/metrics';

const base_url='https://quickpizza.grafana.com';
const username='prabhakar440';
const passwd='423359';
let user_registered=false;


export const options={

     vus:1,
     duration:'3s'

//     stages:[

// //    {duration:'3s',target:10},
// //    {duration:'5s',target:20},
// //    {duration:'10s',target:30},
// //    {duration:'10s',target:0}

    

//     ],

 }




export default function(){

    const register_payload={

        Username:username,
        Password:passwd
    }
    const params={

        headers:{
            'Content-Type':'application/json'
        }
    }

    const response=http.post(`${base_url}/api/users`,JSON.stringify(register_payload),params);

    user_registered=check(response,{

        'status is 201':(response)=>response.status==201,
        'page contains pizza':(response)=> response.body.includes('id')


    })

    if(!user_registered){

        console.error(`user registration failed for ${username} with status with ${response.status} and body ${response.body}`);
    }



}