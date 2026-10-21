import {http} from 'k6/http';
import {sleep,check} from 'k6';
import {Trend} from 'k6/metrics';

const username='prabhakar68697';
const passwd='ashish420'
const base_url='https://quickpizza.grafana.com';
let registerd_users=false;

export const options={

    // stages:[

    // ]


    vus:10,
    duration:'10s'
}

export default function(){

    group('User_registration',function(){


        const payload={

        Username:username,
        password:passwd

    
    }
    const params={

        headers:{

            'Content-Type': 'application/json'
        }
    }

    


        const response=http.post(`${base_url}/api/users`,JSON.stringify(payload),params)
registerd_users=check(response,{

    'status is 201':(response)=>response.status==201,
    'response contains id':(response)=> response.body.includes('id')

})

    
   if(!registerd_users){

    console.error(`${username} is already taken with ${response.body}`)
   }

})  

}

    
