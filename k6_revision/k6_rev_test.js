import http from 'k6/http';
import {sleep} from 'k6';
import {check} from 'k6';

export const options = {

    stages: [

        {duration:'10s',target:10},
        {duration: '15s',target:20},
        {duration:'20s',target:22},
        {duration:'30s',target:0}
    ],

    thresholds:{

         http_req_duration:['p(95)<100'],
         http_req_failed:['rate<0.5']
    }
}

export default function(){

    http.get("https://quickpizza.grafana.com/");
    sleep(3);
}