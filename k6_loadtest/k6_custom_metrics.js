import http from 'k6/http';
import {sleep} from 'k6';
import {check} from 'k6';
import {Trend} from 'k6/metrics';



const pizza_response_time=new Trend('response_time');
const pizza_request_time=new Trend('request_time');

export const options={


    cloud:{

        projectID: 8144820,
        distribution: {
      'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 },
    },
        name: 'Test e2e'
    },

    stages:[

        {duration:'10s',target:10},
        {duration:'20s',target:20},
        {duration:'15s',target:0}
    ],

    thresholds: {

      http_req_duration:['p(95)<100'],
      http_req_failed:['rate<0.5'],
      checks:['rate>0.9'],
    'http_req_duration{name:google}':['p(95)<100'],
    'http_req_failed{name:google}':['rate<0.9'],
    response_time:['p(95)<100'],
    request_time:['p(95)<100']
      

    }


}

export default function(){


    const response=http.get("https://quickpizza.grafana.com/");
    pizza_response_time.add(response.timings.waiting);// to capture only the waiting time of the response
    pizza_request_time.add(response.timings.sending);
    sleep(2);
    check(response,{

        'status is 200':(response)=> response.status==200,
        'page contains pizza':(response)=> response.body.includes('pizza')
    })

    http.get('https://www.google.com',{

        tags:{name:'google'}
    })
}
