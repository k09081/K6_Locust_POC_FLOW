import requests  
class testbasicapi:

    def test_get_basic_api(self):

        req=requests.get('https://api.github.com/events')
        print('response is ',req.text)




    def test_get_request(self):

      req1=requests.get('https://reqres.in/api/users?page=2')
      #print('response is',req1.json())
      assert req1.status_code==200,"Api call failed"
      total_page = req1.json()['total_pages']
      assert total_page==2,"Total pages are not matching"
      print('Total pages are ',total_page)
      email=req1.json()['data'][0]['email']
      assert email == 'michael.lawson@reqres.in',"Email is not matching"
      print('Email is ',email)
      print('***********************')
      print('Api call is successful and response is ',req1.json())




#req_validation.test_get_basic_api(req_validation)
#req_validation.test_get_request()

    def test_post_request(self):#Instead of passing a string to data= and explicitly typing the headers dictionary,
                            #please note that python request library has a built-in json= parameter:
        payload={
           "name":"John",
           "job":"laeder"
           
           
        }
        header={
            'Content-Type':'application/json'
        }




        req2=requests.post('https://reqres.in/api/users',json=payload,headers=header)

        assert req2.status_code==201,"Api call failed"
        assert req2.json()['name']=='John',"Name is not matching"
        #assert req2.json()["_meta"]["docs_url"]=='https://reqres.in/api/users',"doc_url is not matching"
        print('post response is ',req2.json())

#req_validation=testbasicapi()

#req_validation.test_post_request()


    def test_put_request(self):
         payload={
                "name":"John",
                "job":"zion resident"
                
                
             }

         header={

         'Content-Type':'application/json'
     }

         req3=requests.put('https://reqres.in/api/users/2',json=payload,headers=header)
         assert req3.status_code==200,'Api call failed'
         print('put response is',req3.json())

    def test_patch_request(self):

        payload={
            "job":"zion resident"


        }

        header={

       'Content-Type':'application/json'

        } 
        req4=requests.patch('https://reqres.in/api/users/2',json=payload,headers=header) 
        timesatmp=req4.json()['updatedAt']
        doc_url=req4.json()['_meta']['docs_url']
        url=req4.json()['_meta']['cta']['url']
        assert req4.status_code==200,'Api call failed'
        assert doc_url=='https://app.reqres.in/documentation','doc_url not matching'
        assert url=='https://app.reqres.in/upgrade','url not matching'
        print('timestamp',timesatmp) 
        print('doc_url is ',doc_url)
        print('url is',url)

    def test_delete_request(self):



        req5=requests.delete('https://reqres.in/api/users/2')

        assert req5.status_code==204,'Api call failed'
        print('delete status is',req5.status_code)

     
req_validation=testbasicapi()
req_validation.test_delete_request()