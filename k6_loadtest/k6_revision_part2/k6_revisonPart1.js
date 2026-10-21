import http from 'k6/http';
import {check,sleep} from 'k6';


export const options={


stages:[

    {duration:'3s',target:5},
    {duration:'6s',target:2},
    {duration:'10s',target:10},
    {duration:'12s',target:0}
],
Thresholds:{

http_req_duration:['p(95)<200'],
checks:['rate>0.9']
    
}


}

export default function(){

const response=http.get('https://quickpizza.grafana.com/')

check(response,{

    'status is 200':(response)=> response.status==200

})


//sleep(3);

}