import http from 'k6/http';
import {sleep} from 'k6';
import {check} from 'k6';
import {Trend} from 'k6/metrics';

const pizza_response_time=new Trend('response_time');
const pizza_request_time=new Trend('request_time');



export const options={

    stages:[

        {duration:'10s',target:10},
        {duration:'15s',target:20},
        {duration:'20s',target:25},
        {duration:'30s',target:0}

    ],
    thresholds:{

        http_req_duration:['p(95)<100'],
        http_req_failed:['rate<0.9'],
        checks:['rate>0.9'],

        'http_req_duration{name:google}':['p(95)<100'],
        'http_req_failed{name:google}':['rate<0.9']


    }

}

    export default function(){

        const response=http.get('https://quickpizza.grafana.com/');

        check(response,{
        
            'status is 200':(response)=> response.status==200,
            'page contains pizza':(response)=>response.body.includes('pizza')

        })

        http.get('https://www.google.com',{

            tags:{name:'google'}

        })
        


    }

