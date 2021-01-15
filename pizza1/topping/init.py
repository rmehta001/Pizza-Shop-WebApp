import os
import requests
from utils import loadJson
from tablulate import tablulate
from lib.query import QueryCurrentFoodTrucks

userInput = loadJson()
def query_api(offset):
    query = QueryCurrentFoodTrucks(
        offset=offset
    ).build_query()
    url = "{0}{1}".format(base_url,query)

    if os.environ.get('FT_APP_TOKEN') is not None:
        header={'X-App-token': os.environ.get('FT_APP_TOKEN')}
        request = requests.get(url, headers=header)
    else:
            request =requests.get(url)

            return request
def go_to_page(page, num):
    request = query_api(page)
    page += num
    keep_paging = True
    return (page,request, keep_paging)

def print_results_to_terminal(results):
    trucks = []
    for foodtruck in data:
        trucks.append([foodtruck['applicant'],foodtruck['location']])
        columns = ["NAME", "LOCATION"]
        table_format ="simple"
    print (tabulate(trucks,columns,tablefmt=table_format))
    print ("---PAGE {0}---\n".format(page))

keep_paging = True
page = 1
request = query_api(0);

while keep_paging:
   if request.ok:
       data =request.json()
       if len(data) == 0:
           #print "\nYou've reached the end. Thanks!\n"
           break

print_results_to_terminal(data)

if page == 1:
    user_input = raw_input("See more results? (Y/N): ").lower()
    if user_input == "y" or user_input == "next":
        user_input = "next"
    elif user_input == "n":
        user_input = "exit"
    else:
        user_input = raw_input('I did not get it. Do you want to see more results (YES/NO): ').lower()
else:
    user_input = raw_input("where to? (next, prev,exit): ").lower()

if user_input == "next":
    (page, request,keep_paging) = go_to_page(page, 1)
elif user_input == "prev":
    (page, request,keep_paging) = go_to_page(page, -1)
elif user_input == "exit":
    keep_paging = False
    break 
else:
    user_input raw_input('I did not get that. Where to? (next,prev,exit): ').lower()
else:
  print "Something with awry with the request."

print "Goodbye!"