"use strict";
// avoid warnings on using fetch and Promise --
/* global fetch, Promise */
// use port 80, i.e., apache server for webservice execution 
// Change localhost to localhost:8000 to use the tunnel to pe07's port 80
const baseUrl = "http://localhost/cs637/raj2421/pizza2_server/api";
// globals representing state of data and UI
let selectedUser = 'none';
let user_id;
let sizes = [];
let toppings = [];
let users = [];
let orders = [];
let main = function () {//(sizes, toppings, users, orders) {
    setupTabs();  // for home/order pizza 
    // for home tab--
    displaySizesToppingsOnHomeTab();
    setupUserForm();
    setupRefreshOrderListForm();
    setupAcknowledgeForm();
    displayOrders();
    // for order tab--
    setupOrderForm();
    displaySizesToppingsOnOrderForm();
};

// Suggested step 1: implement this, should see sizes displayed
// Suggested step 2: implement get_toppings, etc. so this shows toppings too
function displaySizesToppingsOnHomeTab() {
    const s = document.getElementById('sizes');
    const ul = document.createElement('ul');
    //let ul = document.getElementByTagName('ul');
    ul.setAttribute('id','theList');
//let array_of_sizes = getSizes();
//console.log(array_of_sizes);
for (var i=0; i<sizes.length; i++){

    const li=document.createElement('li');
    li.innerHTML=sizes[i]['size'];
    li.className="horizontal";
    ul.appendChild(li);
}
s.appendChild(ul);


const t = document.getElementById('toppings');
    const ul1 = document.createElement('ul');
    //let ul = document.getElementByTagName('ul');
    ul1.setAttribute('id','theList');
//let array_of_sizes = getSizes();
//console.log(array_of_sizes);
for (var i=0; i<toppings.length; i++){

    const li1=document.createElement('li');
    li1.className = "horizontal";
    li1.innerHTML=toppings[i]['topping'];
    ul1.appendChild(li1);
}
t.appendChild(ul1);


    // find right elements to build lists in the HTML
    // loop through sizes, creating <li>s for them
    // with class=horizontal to get them to go across horizontally
    // similarly with toppings
}

// Suggested step 3: implement this, and get_users
function setupUserForm() {
    let us = document.getElementById('userselect');
        //noneOption = document.createElement("option");
        //noneOption.appendChild("none");
        //.insertBefore(newOption,us.lastChild);
    //console.log('users='+users);
    //let options = document.createElement('option');
    //options.setAttribute('username');
    //users.push(['none',]);
    
    //us.append('<option value="none">none</option>');
    
   // options.text = "none";
    //us.options.add(options,0);
    users.unshift({username: 'none'});
    for (var i=0; i<users.length; i++){
        const options=document.createElement('option');
        options.innerHTML=users[i]['username'];

    // options.innerHTML="none";
              
    // if(i=0)
    //{
    //  var n = 'none';
    //options.innerHTML(n);    
    //}
    us.appendChild(options);

}   
 


        
    let select_un = document.getElementById('select_username');
    select_un.addEventListener("click",function setUserName(){
 
 selectedUser = document.getElementById('userselect').value;
console.log(selectedUser);
    
var uf1 = document.getElementById('username-fillin1');
var uf2 = document.getElementById('username-fillin2');
    
    if(selectedUser != 'none') 
    {
        uf1.innerHTML=selectedUser;
        uf2.innerHTML=selectedUser;

     
           let oa = document.getElementById('order-area');
           oa.classList.add("active");
          
        
        console.log("selected user = " + selectedUser);
        displayOrders(orders);
        
    }
});

    // find the element with id userselect
    // create <option> elements with value = username, for
    // each user with the current user selected, 
    // plus one for user "none".
    // Add a click listener that finds out which user was
    // selected, make it the "selectedUser", and fill it i n the
    //  "username-fillin" spots in the HTML.
    //  Also change the visibility of the order-area
    // and redisplay the orders
}

// suggested step 7, and needs update_order
function setupAcknowledgeForm() 
{
    console.log("setupAckForm...");
    document.querySelector("#ackform input").addEventListener("click", event => 
    {
        console.log("ack by user = " + selectedUser);
        for(var i = 0;i<users.length;i++)
        {
            if(users[i]['username']===selectedUser)
         {
                let selectedUserId = users[i]['id'];
            

            console.log(selectedUserId);
            orders.forEach(function (order) {
            console.log("cking order = %O", order);
            if (order.user_id == selectedUserId && order.status == 'Baked') {
                console.log("Found baked order for user " + order.username);
                order.status = 'Finished';
                updateOrder(order, () => console.log("back from fetch for upd")); // post update to server
            }
        });

         }
     }
        // find this user's info in users, and their selectedUserId
       // selectedUserId = 6; // bogus value for now
        displayOrders();
        console.log("just to check");
        event.preventDefault();
    });                         
}

// suggested steps: this should work once displayOrders works
function setupRefreshOrderListForm() {
    console.log("setupRefreshForm...");
    document.querySelector("#refreshbutton input").addEventListener("click", event => {
        console.log("refresh orders by user = " + selectedUser);
        getOrders(() => displayOrders());
        event.preventDefault();
    });
}

// suggested step 4, and needs get_orders
function displayOrders() {
    console.log("displayOrders");

    let oa1 = document.getElementById("order-area");
    oa1.classList.remove("active");
    console.log("for display",selectedUser);
    if(selectedUser=== "none"){
        console.log('nothing to do');
        return;
    }
    
        let ote = document.getElementById('ordertable');
        //ote.empty();
        ote.innerHTML="";
        oa1.classList.add("active");
        console.log("displayOrders orders: ",orders);
        console.log("displayOrders selectedUser: ", selectedUser);
        console.log('users = ', users);
        for (var i=0; i<users.length; i++){
         if(users[i]['username']==selectedUser)
         {
             user_id = users[i]['id'];
             console.log(user_id);
         }
         
        }
        let current_user_orders = [];
         for(var i=0;i<orders.length;i++) 
         {
            if(orders[i]['user_id']===user_id && orders[i]['status'] !== 'Finished'){
                current_user_orders.push(orders[i])
                console.log("pushing");
                console.log(current_user_orders);
            }
         }  
         if(current_user_orders === undefined || current_user_orders.length == 0)
         {
          document.getElementById('ordermessage').innerHTML = "no orders yet"; 
           document.getElementById('order-info').classList.remove('active');
         }
         else{
          document.getElementById('order-info').classList.add('active');  
          document.getElementById('ordermessage').innerHTML = ""; 
             }

         var table = document.getElementById('ordertable');

        for (var i = 0; i < current_user_orders.length; i++){
        var tr = document.createElement('tr');   

    var td1 = document.createElement('td');
    var td2 = document.createElement('td');
    var td3 = document.createElement('td');
    var td4 = document.createElement('td');

    var text1 = document.createTextNode(current_user_orders[i]['id']);
    var text2 = document.createTextNode(current_user_orders[i]['size']);
    var text3 = document.createTextNode(current_user_orders[i]['toppings']);
    var text4 = document.createTextNode(current_user_orders[i]['status']);
    td1.appendChild(text1);
    td2.appendChild(text2);
    td3.appendChild(text3);
    td4.appendChild(text4);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);

    table.appendChild(tr);
}
for (var i = 0; i < current_user_orders.length; i++){
    if(current_user_orders[i]['status']=== "Baked")
    {
        document.getElementById('ackform').classList.add("active");
    }
    // else{
    //     document.getElementById('ackform').classList.remove("active");
    // }

}
//document.body.appendChild(table);
     //getOrders of user id from server
     //

    // remove class "active" from the order-area
    // if selectedUser is "none", just return--nothing to do
    // empty the ordertable, i.e., remove its content: we'll rebuild it
    // add class active to order-area
    // find the user_id of selectedUser via the users array
    // find the in-progress orders for the user by filtering array 
    // orders on user_id and status
    // if there are no orders for user, make ordermessage be "none yet"
    //  and remove active from element id'd order-info
    // Otherwise, add class active to element order-info, make
    //   ordermessage be "", and rebuild the order table 
    // Finally, if there are Baked orders here, make sure that
    // ackform is active, else not active
}

// suggested step 8: have order form hidden until needed
// Let user click on one of two tabs, show its related contents.
// Contents for both tabs are in the HTML after initial setup, 
// but one part is not displayed because of display:none in its CSS
// made effective via class "active".
// Note you need to remove the extra "active" in the originally provided
// HTML near the comment "active here to make everything show"
function setupTabs() {
       
    console.log("setup run");
    let tabSpan0 = document.getElementById('tabSpan0'); 
    let tabSpan1 = document.getElementById('tabSpan1'); 
    tabSpan1.addEventListener('click',function orderPage(){
        console.log("fnction is running");
    let tabContent1 = document.getElementById('tabContent1'); 
    tabContent1.classList.remove("hide");    
    let tabContent0 = document.getElementById('tabContent0'); 
    tabContent0.classList.add("hide");

    })

    tabSpan0.addEventListener('click',function homePage(){
        
    let tabContent0 = document.getElementById('tabContent0'); 
    tabContent0.classList.remove("hide");    
    let tabContent1 = document.getElementById('tabContent1'); 
    tabContent1.classList.add("hide");

    })

    
    // Do this last. You may have a better approach, but here's one
    // way to do it. Also edit the html for better initial settings
    // of class active on these elements.    
    // Find an array of span elements for the tabs and another
    //  array of elements with class tabContent, the content for each tab.
    // Then tabSpan[0] is the first span and tabContent[0] is the
    // corresponding contents for that tab, and similarly with [1]s.
    // Then loop through the two cases i=0 and i=1:
    //   loop through tabSpan removing all class active's
    //   loop through tabContents removing all class active's
    //   set tabSpan[i]'s element active
    //   set tabContent[i]'s element active
}

// suggested step 5
function displaySizesToppingsOnOrderForm() {
    console.log("displaySizesToppingsOnOrderForm");
    const s = document.getElementById('order-sizes');
for (var i=0; i<sizes.length; i++){
let radiobox = document.createElement('input');
  radiobox.type = 'radio';
  radiobox.name = 'sizeChoice';
  radiobox.id = 'radiobtn';
                            

let label = document.createElement('label');
var description = document.createTextNode(sizes[i]['size']);
  radiobox.value = sizes[i]['size'];
  label.appendChild(description);
  s.appendChild(radiobox);
  s.appendChild(label);
}

const t = document.getElementById('order-toppings');
for (var i=0; i<toppings.length; i++){
let checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'checkbtn';
  checkbox.name = 'toppingChoice';
  let newline = document.createElement('br');
let label = document.createElement('label');
var description = document.createTextNode(toppings[i]['topping']);
checkbox.value = toppings[i]['topping'];
  label.appendChild(description);
  t.appendChild(checkbox);
  t.appendChild(label);
  t.appendChild(newline);
}
    

    // find the element with id order-sizes, and loop through sizes,
    // setting up <input> elements for radio buttons for each size
    // and labels for them too // and for each topping create an <input> element for a checkbox
    // and a <label> for each

}

// suggested step 6, and needs post_order
function setupOrderForm() {
    console.log("setupOrderForm...");
    let submitOrder = document.getElementById('submitOrder');
    submitOrder.addEventListener('click',function setOrderDetails(){
        
        const rbs = document.querySelectorAll('input[name="sizeChoice"]');
        let selectedSize;
        for (const rb of rbs) {
            if(rb.checked){
                selectedSize=rb.value;
                break;
            }
            if(selectedSize == null){
            document.getElementById('order-message').innerHTML="please select size!";
            
           
        }
        }
        console.log("RRR user ", selectedUser);
        const cbs = document.querySelectorAll('input[name="toppingChoice"]:checked');
        let selectedToppings = [];
        cbs.forEach((checkbox) => {
            selectedToppings.push(checkbox.value);
            console.log(selectedToppings);
    })
        console.log(selectedToppings);
        if(selectedToppings === undefined || selectedToppings.length == 0)
        {
        console.log("asdiu");
        document.getElementById('order-message').innerHTML = "please select atleast one topping!";
        }
       
       let order = {"user_id" : user_id , "size" : selectedSize , "day" : 1, "status" : "Preparing", "toppings" : selectedToppings};
        console.log("order:", order);
        console.log("userif",user_id);
        postOrder(order, function (newOrder)
        {
            let onm = document.getElementById('order-message');
            onm.innerHTML = "Your order number is " + newOrder.id;
            orders.push(newOrder);
            displayOrders();
        });
        return false; 
    });
    
       
    // find the orderform's submitbutton and put an event listener on it
    // When the click event comes in, figure out the sizeName from
    // the radio button and the toppings from the checkboxes
    // Complain if these are not specified, using order-message
    // Else, figure out the user_id of the selectedUser, and
    // compose an order, and post it. On success, report the
    // new order number to the user using order-message

}

// Plain modern JS: use fetch, which returns a "promise"
// that we can combine with other promises and wait for all to finish

function getSizes() {
    let promise = fetch(
            baseUrl + "/sizes",
            {method: 'GET'}
    )
            .then(// fetch sucessfully sent the request...
                    response => {
                        if (response.ok) { // check for HTTP 200 responsee
                            //  Need the "return" keyword in the following--
                            return response.json();
                        } else {  // throw to .catch below
                            throw Error('HTTP' + response.status + ' ' +
                                    response.statusText);
                        }
                    })
            .then(json => {
                console.log("back from fetch: %O", json);
                sizes = json;
            })
            .catch(error => console.error('error in getSizes:', error));
   // console.log(sizes[0]);
    return promise;
}

function getToppings() {
    let promise = fetch(
            baseUrl + "/toppings",
            {method: 'GET'}
    )
            .then(// fetch sucessfully sent the request...
                    response => {
                        if (response.ok) { // check for HTTP 200 responsee
                            return response.json();
                        } else {  // throw to .catch below
                            throw Error('HTTP' + response.status + ' ' +
                                    response.statusText);
                        }
                    })
            .then(json => {
                console.log("back from fetch: %O", json);
                toppings = json;
            })
            .catch(error => console.error('error in getToppings:', error));
    return promise;
}

function getUsers() {
    let promise = fetch(
            baseUrl + "/users",
            {method: 'GET'}
    )
            .then(// fetch sucessfully sent the request...
                    response => {
                        if (response.ok) { // check for HTTP 200 responsee
                            return response.json();
                        } else {  // throw to .catch below
                            throw Error('HTTP' + response.status + ' ' +
                                    response.statusText);
                        }
                    })
            .then(json => {
                console.log("back from fetch: %O", json);
                users = json;
            })
            .catch(error => console.error('error in getUsers:', error));
    return promise;


}

function getOrders() {
    let promise = fetch(
            baseUrl + "/orders",
            {method: 'GET'}
    )
            .then(// fetch sucessfully sent the request...
                    response => {
                        if (response.ok) { // check for HTTP 200 responsee
                            return response.json();
                        } else {  // throw to .catch below
                            throw Error('HTTP' + response.status + ' ' +
                                    response.statusText);
                        }
                    })
            .then(json => {
                console.log("back from fetch: %O", json);
                orders = json;
            })
            .catch(error => console.error('error in getOrders:', error));
    return promise;
    console.log(orders);   

}
function updateOrder(order) {
    console.log(order);
  let promise = fetch(
            baseUrl + "/orders/" + order.id,
            {
            method: "PUT",
            body: JSON.stringify(order),
            headers: {
                     'Content-Type': 'application/json; charset=utf-8'},

           success: function (result) {
            console.log("We did PUT to /orders/" + order.id);
            console.log("data: " + JSON.stringify(order))
            console.log(result);
        }
    });
    return promise;
    

 }
function postOrder(order, onSuccess) {
let promise = fetch(
            baseUrl + "/orders",
            {
            method: 'POST',
            body: JSON.stringify(order),
            headers: {
                     'Content-Type': 'application/json; charset=utf-8'
                     }
            }
    )
            .then(// fetch sucessfully sent the request...
                    response => {
                        if (response.ok) { // check for HTTP 200 responsee
                            return response.json();
                        } else {  // throw to .catch below
                            throw Error('HTTP' + response.status + ' ' +
                                    response.statusText);
                        }
                    })
            .then(json => {
                console.log("back from fetch: %O", json);
                orders = json;
            })
            .catch(error => console.error('error in postOrders:', error));
    return promise;
    
}


function refreshData(thenFn) {
    // wait until all promises from fetches "resolve", i.e., finish fetching
    Promise.all([getSizes(), getToppings(), getUsers(), getOrders()]).then(thenFn);
}

console.log("starting...");
refreshData(main);
