import random as rnd
import csv
import uuid
from locust import HttpUser, between, constant_throughput,task,tag,SequentialTaskSet,events,between,constant_pacing


user_data=[]

with open('users-100.csv','r',encoding='utf-8') as f:
    reader=csv.DictReader(f)
    for row in reader:
        user_data.append(row)


@events.test_start.add_listener
def start_test(environment,**kwargs):
    print('test is starting')

@events.test_stop.add_listener    
def stop_test(environment,**kwargs):
    print('test is stopping')

class BankingWorkflow(SequentialTaskSet):

    token=None
    user_id=None


    def on_start(self):
            self.data=user_data[hash(self) % len(user_data)]
     

    @tag('launch_page')
    @task
    def launch_page(self):
        headers = {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.9',
            'content-type': 'application/json',
            'origin': self.user.host,
            'priority': 'u=1, i',
            'referer': f"{self.user.host}/login",
            'sec-ch-ua': '"Chromium";v="154", "Microsoft Edge";v="154", "Not A(Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0',
            'x-correlation-id': str(uuid.uuid4())
        }
        resp = self.client.get('/login', headers=headers)
        assert resp.status_code == 200, f"Page load failed with status: {resp.status_code}"

    @tag('login_page')
    @task
    
    def login(self):

        headers={
           'accept': 'application/json, text/plain, */*',
           'accept-language': 'en-US,en;q=0.9',
           'content-type': 'application/json',
            'origin': self.user.host,
            'priority': 'u=1, i',
            'referer': f"{self.user.host}/login",
            'sec-ch-ua': '"Chromium";v="154", "Microsoft Edge";v="154", "Not A(Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0',
            'x-correlation-id': str(uuid.uuid4())


        }

        payload={

            'email':'user1@loadtest.bank',
            'password':'LoadTest123!'
        }

        resp=self.client.post('/api/v1/auth/login',headers=headers,json=payload)
        assert resp.status_code==200,'response code not found'

        self.token= resp.json()['token']
    @tag('create_user')
    @task  
    def create_user(self):

        rand_id = rnd.randint(10000, 99999)

        headers={
           'accept': 'application/json, text/plain, */*',
           'accept-language': 'en-US,en;q=0.9',
           'content-type': 'application/json',
           'authorization': f'Bearer {self.token}',
            'origin': self.user.host,
            'priority': 'u=1, i',
            'referer': f"{self.user.host}/login",
            'sec-ch-ua': '"Chromium";v="154", "Microsoft Edge";v="154", "Not A(Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0'

        }
        payload = {
          "name": self.data['name'],
           "email": self.data['email'],
            "initial_deposit": int(self.data['initial_deposit'])
       }
        resp=self.client.post('/api/users',headers=headers,json=payload)
        #assert resp.status_code==201,'response code not found'
        self.user_id=resp.json()['user_id']
    @tag('get_userid')
    @task
    def get_userid(self):

        headers={

            
           'accept': 'application/json, text/plain, */*',
           'accept-language': 'en-US,en;q=0.9',
           'content-type': 'application/json',
           'authorization': f'Bearer {self.token}',
           'priority': 'u=1, i',
           'origin': self.user.host,
           'priority': 'u=1, i',
            'referer': f"{self.user.host}/login",
            'sec-ch-ua': '"Chromium";v="154", "Microsoft Edge";v="154", "Not A(Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0',
            'x-correlation-id': str(uuid.uuid4())
           

        }
        resp=self.client.get(f'/api/users/{self.user_id}',headers=headers,name='/api/users/user_id')
        #assert resp.status_code==200,'response code not found'

        



        


class BankingUser(HttpUser):

    host = 'http://192.168.29.128:5173'
    wait_time = constant_throughput(0.9)
    tasks = [BankingWorkflow]
    