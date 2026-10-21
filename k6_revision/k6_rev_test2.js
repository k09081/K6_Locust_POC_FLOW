import http from 'k6/http';
import {sleep,check} from 'k6';
export const options ={

    stages:[

        {duration:'10s', target:10},
        {duration:'15s',target:20},
        {duration:'20s',target:0}
    ],

    thresholds:{


http_req_duration:['p(95)<100'],
http_req_failed:['rate<0.5'],
      checks:['rate>0.9']

     }

    

    }



export default function(){

    const response=http.get("https://quickpizza.grafana.com/");
    sleep(2);

    check(response,{
        'status is 200':(response)=> response.status==200,
        'page contains pizza':(response)=>response.body.includes('pizza')
        
    });


    
}