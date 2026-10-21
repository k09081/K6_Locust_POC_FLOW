from locust import HttpUser, between, constant_throughput,task,tag,SequentialTaskSet,events,between,constant_pacing
#from locust_plugins.pacing import ConstantPacing
# Global Event Hooks (Defined OUTSIDE of classes)
#Event listeners run globally across the Locust framework and
#  must be defined as standalone functions outside of any class 
# (or initialized using @events.test_start.connect).
@events.test_start.add_listener
def ontest_start(environment, **kwargs):
     print('test is starting')
@events.test_stop.add_listener
def ontest_stop(environment, **kwargs):
      print('test is stopping')


class petworkflow(SequentialTaskSet):

   
        

    pet_id=None

    @task 
    @tag('login')

    def get_inventory(self):
        resp=self.client.get('/v2/store/inventory')

        #print('get inventory response is',resp.json())
    
    
    
    @task
    @tag('create_post')
    def create_post(self):
        payload = {
            "id": 0,
            "category": {
                "id": 0,
                "name": "bruno"
            },
            "name": "doggie",
            "photoUrls": [
                "string"
            ],
            "tags": [
                {
                    "id": 0,
                    "name": "bruno"
                }
            ],
            "status": "available"
        }
        # with self.client.post('/v2/pet',json=payload,catch_response=True) as response:
        #        if response.status_code==200:
        #            response.success()
        #        else:
        #            response.failure()
      #above one will be utilised when we want to catch the response and check the status code and then decide whether to mark it as success or failure.
        response =self.client.post('/v2/pet',json=payload)
        status_code=response.status_code
        Name=response.json()['name']
        assert status_code==200,"Api call failed"
        assert Name=='doggie',"Name is not matching"



        
        #print('create_post_response is',response.json()['id'])
        self.pet_id=response.json()['id']

    @task
    @tag('get_pet_id')
    def get_pet(self):
        
           response_get=self.client.get(f'/v2/pet/{self.pet_id}',name='/v2/pet/{pet_id}')

        #print('get_pet_response is',response_get.json()) 

    



class Get_Inventory(HttpUser):
   
    host='https://petstore.swagger.io'
    #wait_time=between(1,2)
    
    #wait_time=between(1,2)
    wait_time = constant_throughput(0.9)
    tasks=[petworkflow]
    





        



