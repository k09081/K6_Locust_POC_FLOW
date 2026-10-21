import http from 'k6/http';
import {sleep} from 'k6';
import {check} from 'k6';
export const options = {

    vus : 15,
    duration : '30s',

    thresholds: {

      http_req_duration:['p(95)<100'], // 95% of requests should be below 100ms.

      http_req_failed:['rate<0.5'] // http errors should be less than 0.5%
    }

}

export default function(){

    http.get("https://quickpizza.grafana.com/");
    sleep(2);


}