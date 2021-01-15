# Pizza-Shop-WebApp
This is an MVC web app in which I used php on the server side and css,html on the client side.
I have used xampp cross platform for php and mySql.

PIZZA1

In Pizza1 I have implemented the basic functionalities as follows:
adds a topping
adds a user 
adds an order
A student can order pizza by selecting the required size,topping and username.
It shows state management using hidden parameters.
User can acknowledge the delivery of the order when the order is marked baked by the administrator.
A database is maintained for the above functionalities.

You can navigate to this website using the following link:

http://pe07.cs.umb.edu/cs637/raj2421/pizza1/

PIZZA2_SERVER

In pizza2_server, I have implemented the following web services using curl.
It answers the web service requests using PHP.
The services can be seen working on pizza2_phpclient

Following are the services implemented:

GET /pizza2_server/api/day             returns the current day
POST /pizza2_server/api/day            reinitialize database 
GET /pizza2_server/api/toppings/{id}   returns info on topping id = 2
GET /pizza2_server/api/toppings        returns info on all toppings
GET /pizza2_server/api/sizes           returns info on all  sizes
GET /pizza2_server/api/users           returns info on all  users
GET /pizza2_server/api/orders          returns info on all orders
GET /pizza2_server/api/orders/{id}     returns info on order of id (id)
POST /pizza2_server/api/orders         adds an order
PUT /pizza2_server/api/orders/{id}     updates an order (so user can acknowledge receipt

PIZZA2_JSCLIENT

I rewrote the client using javascript.

Following is the link:

http://pe07.cs.umb.edu/cs637/raj2421/pizza2_jsclient/
