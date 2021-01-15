<?php
require __DIR__ . '/../vendor/autoload.php';
require 'initial.php';
// provide aliases for long classname--
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

set_local_error_log(); // redirect error_log to ../php_server_errors.log
// Instantiate the app
$app = new \Slim\App();
// Add middleware that can add CORS headers to response (if uncommented)
// These CORS headers allow any client to use this service (the wildcard star)
// We don't need CORS for the ch05_gs client-server project, because
// its network requests don't come from the browser. Only requests that
// come from the browser need these headers in the response to satisfy
// the browser that all is well. Even in that case, the headers are not
// needed unless the server for the REST requests is different than
// the server for the HTML and JS. When we program in Javascript we do
// send requests from the browser, and then the server may need to
// generate these headers.
// Also specify JSON content-type, and overcome default Allow of GET, PUT
// Note these will be added on failing cases as well as sucessful ones
$app->add(function ($req, $res, $next) {
    $response = $next($req, $res);
    return $response
                    ->withHeader('Access-Control-Allow-Origin', '*')
                    ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
                    ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
                    ->withHeader('Content-Type', 'application/json')
                    ->withHeader('Allow', 'GET, POST, PUT, DELETE');
});
// Turn PHP errors and warnings (div by 0 is a warning!) into exceptions--
// From https://stackoverflow.com/questions/1241728/can-i-try-catch-a-warning
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    // error was suppressed with the @-operator--
    // echo 'in error handler...';
    if (0 === error_reporting()) {
        return false;
    }
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

// Slim has default error handling, but not super useful
// so we'll override those handlers so we can handle errors 
// in this code, and report file and line number.
// This also means we don't set $config['displayErrorDetails'] = true;
// because that just affects the default error handler.
// See https://akrabat.com/overriding-slim-3s-error-handling/
// To see this in action, put a parse error in your code
$container = $app->getContainer();
$container['errorHandler'] = function ($container) {
    return function (Request $request, Response $response, $exception) {
        // retrieve logger from $container here and log the error
        $response->getBody()->rewind();
        $errorJSON = '{"error":{"text":' . $exception->getMessage() .
                ', "line":' . $exception->getLine() .
                ', "file":' . $exception->getFile() . '}}';
        //     echo 'error JSON = '. $errorJSON;           
        error_log("server error: $errorJSON");
        return $response->withStatus(500)
                        //            ->withHeader('Content-Type', 'text/html')
                        ->write($errorJSON);
    };
};

// This function should not be called because errors are turned into exceptons
// but it still is, on error 'Call to undefined function' for example
$container['phpErrorHandler'] = function ($container) {
    return function (Request $request, Response $response, $error) {
        // retrieve logger from $container here and log the error
        $response->getBody()->rewind();
        echo 'PHP error:  ';
        print_r($error->getMessage());
        $errorJSON = '{"error":{"text":' . $error->getMessage() .
                ', "line":' . $error->getLine() .
                ', "file":' . $error->getFile() . '}}';
        error_log("server error: $errorJSON");
        return $response->withStatus(500)
                        //  ->withHeader('Content-Type', 'text/html)
                        ->write($errorJSON);
    };
};
$app->get('/day', 'getDay');
$app->post('/day', 'postDay');
$app->get('/toppings', 'getToppings');
$app->get('/toppings/{id}','getToppingByID');
$app->get('/sizes','getSizes');
$app->get('/users','getUsers');
$app->get('/orders','getOrders');
$app->get('/orders/{id}','getOrderById');
$app->post('/orders','postOrder');
$app->put('/orders/{id}','updateOrderByID');
//$app->get('/users','getUsers');
//$app->get('/users','getUsers');

// TODO add routes and functions for them,using ch05_gs_server code as a guide


// Take over response to URLs that don't match above rules, to avoid sending
// HTML back in these cases
$app->map(['GET', 'POST', 'PUT', 'DELETE'], '/{routes:.+}', function($req, $res) {
    $uri = $req->getUri();
    $errorJSON = '{"error": "HTTP 404 (URL not found) for URL ' . $uri . '"}';
    return $res->withStatus(404)
                    ->write($errorJSON);
});
$app->run();

// functions without try-catch are depending on overall
// exception handlers set up above, which generate HTTP 500
// Functions that need to generate HTTP 400s (client errors)
// have try-catch
// Function calls that don't throw return HTTP 200
function getDay(Request $request, Response $response) {
    error_log("server getDay");
    $sql = "select current_day FROM pizza_sys_tab";
    $db = getConnection();
    $stmt = $db->query($sql);
    // fetch just column 0 value--
    return $stmt->fetch(PDO::FETCH_COLUMN, 0);
}

function postDay(Request $request, Response $response) {
    error_log("server postDay");
    $db = getConnection();
    initial_db($db);
    return "1";  // new day value
}

function getToppings(Request $request, Response $response) {
    error_log("server getToppings");
    $sql = "select * from menu_toppings";
    $db = getConnection();
    $stmt = $db->prepare($sql);
    $stmt ->execute();
    $toppings_array = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt ->closeCursor();
    echo json_encode($toppings_array);
}

function getToppingByID(Request $request, Response $response, $args) {
    error_log("server getToppingByID");
    $id = $args['id'];
    $sql = "select topping from menu_toppings where id=:id";
    $db = getConnection();
    $stmt = $db->prepare($sql);
    $stmt->bindValue(':id', $id);
    $stmt->execute();
    $topping_info = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($topping_info === false) {
        // can't find product, so return not-found
        $errorJSON = '{"error":{"text":topping not found}}';
        error_log("server error $errorJSON");
        return $response->withStatus(404) // client error
                        ->write($errorJSON);     
    }
    $stmt->closeCursor();
    $toppingJSON= json_encode($topping_info);
    // TODO: other json_encode calls should have the following test too
    if ($toppingJSON === false) {  // encode failed
        $errorJSON = '{"error":{"text":JSON encode error' . json_last_error_msg() . '}}';
        error_log("server error $errorJSON");
        return $response->withStatus(500) // server error
                        ->write($errorJSON);
    }
    return $response->withStatus(200) 
                    ->write($toppingJSON);
    $stmt ->closeCursor();
}


function getSizes(Request $request, Response $response) {
    error_log("server getSizes");
    $sql = "select * from menu_sizes";
    $db = getConnection();
    $stmt = $db->prepare($sql);
    $stmt ->execute();
    $sizes_array = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt ->closeCursor();
    echo json_encode($sizes_array);
}

function getUsers(Request $request, Response $response) {
    error_log("server getUsers");
    $sql = "select * from shop_users";
    $db = getConnection();
    $stmt = $db->prepare($sql);
    $stmt ->execute();
    $users_array = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt ->closeCursor();
    echo json_encode($users_array);
}

function getOrders(Request $request, Response $response) {
    error_log("server getOrders");
    $sql = "select * from pizza_orders";
    $db = getConnection();
    $stmt = $db->prepare($sql);
    $stmt ->execute();
    $orders_array = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt ->closeCursor();

    foreach ($orders_array as $key => $order) 
    {
    $order_toppings = get_order_toppings($db,$order['id']);
    //print_r($order_toppings);
    $toppings_string_array =[];
        foreach ($order_toppings as $key1 => $value) 
        {
        $toppings_string_array[$key1] = $value['topping'];
        }
    $orders_array[$key]['toppings']=$toppings_string_array;
    }
    echo json_encode($orders_array);
}

function get_order_toppings($db, $order_id) {
    $sql = 'select topping from order_topping '
            . 'where order_id=:order_id';
    $stmt = $db->prepare($sql);
    $stmt->bindValue(':order_id',$order_id);
    $stmt->execute();
    $toppings = $stmt->fetchAll();
    $stmt->closeCursor();
    // error_log('toppings '. print_r($toppings, true) );
    return $toppings;
}

function getOrderByID(Request $request, Response $response, $args) {
    error_log("server getOrderByID");
    $id = $args['id'];
    $sql = "select p.id, p.user_id, p.size, p.day, p.status, o.topping as toppings FROM pizza_orders p, 
             order_topping o where p.id = o.order_id and p.id=:id";
    $db = getConnection();
    $stmt = $db->prepare($sql);
    $stmt->bindValue(':id', $id);
    $stmt->execute();
    //$orders_in_json = getOrders();
    //print_r($orders_in_json);
    //die;
    $order_info = $stmt->fetchAll(PDO::FETCH_ASSOC);
    //print_r($order_info);
    if ($order_info === false) {
        // can't find product, so return not-found
        $errorJSON = '{"error":{"text":order not found}}';
        error_log("server error $errorJSON");
        return $response->withStatus(404) // client error
                        ->write($errorJSON);     
    }
    $stmt->closeCursor();
    foreach ($order_info as $key => $order) 
    {
    $order_topping = get_order_toppings($db,$order['id']);
   // print_r($order_toppings);
    $topping_string_array =[];

        foreach ($order_topping as $key1 => $value) 
        {

        $topping_string_array[$key1] = $value['topping'];
        }
    $order_info[$key]['toppings']=$topping_string_array;
    
    }
    $orderIDJSON= json_encode($order_info[0]);
    if ($orderIDJSON === false) {  // encode failed
        $errorJSON = '{"error":{"text":JSON encode error' . json_last_error_msg() . '}}';
        error_log("server error $errorJSON");
        return $response->withStatus(500) // server error
                        ->write($errorJSON);
    }
    return $response->withStatus(200) 
                    ->write($orderIDJSON);
}


function postOrder(Request $request, Response $response) {
    error_log("server postOrder");
    error_log("server: body: " . $request->getBody());
    $order = $request->getParsedBody();  // Slim does JSON_decode here
    error_log('server: parsed order = ' .print_r($order, true));
    if ($order == NULL) { // parse failed (bad JSON)
        $errorJSON = '{"error":{"text":"bad JSON in request"}}';
        error_log("server error $errorJSON");
        return $response->withStatus(400)  //client error
                        ->write($errorJSON);
    }
    try {
        $db = getConnection();
        $orderID = addOrder($db, $order['user_id'], $order['size'], $order['day'], $order['status'],$order['toppings']);
       
    } catch (PDOException $e) {
        
        if(strstr($e->getMessage(), 'SQLSTATE[23000]')) {
            $errorJSON = '{"error":{"text":' . $e->getMessage() .
                    ', "line":' . $e->getLine() .
                    ', "file":' . $e->getFile() . '}}';
            error_log("server error $errorJSON");
            return $response->withStatus(400) // client error
                            ->write($errorJSON);
        } else {
            throw($e);  // generate HTTP 500 as usual         
        }
    }
    $order['orderID'] = $orderID;  // fix up id to current one
    $JSONcontent = json_encode($order);
    //echo $JSONcontent;  // wouldn't provide location header
    $location = $request->getUri() . '/' . $order["orderID"];
    return $response->withHeader('Location', $location)
                    ->withStatus(200)
                    ->write($JSONcontent);

}

function addOrder($db, $user_id, $size, $current_day, $status, $topping_name) {
    error_log("server addOrder");

    $sql1 = 'INSERT INTO pizza_orders
                 (user_id, size, day, status)
              VALUES
                 (:user_id, :size, :current_day, :status)';
    //$sql2 = 'insert into order_topping(order_id, topping) values (last_insert_id(), :topping)';
    $stmt = $db->prepare($sql1);
    $stmt->bindValue(':user_id', $user_id);
    $stmt->bindValue(':size', $size);
    $stmt->bindValue(':status', $status);
    $stmt->bindValue(':current_day', $current_day);
    $stmt->execute();
    $topping_array = addOrderTopping($db,$topping_name);
    $stmt->closeCursor();
    $id = $db->lastInsertId();
    return $id;
}

function addOrderTopping($db, $the_topping_name) {
    

    foreach ($the_topping_name as $value) 
    {
    $sql = 'INSERT INTO order_topping(order_id, topping) '
            . 'VALUES (last_insert_id(),:topping)';
    $stmt = $db->prepare($sql);
    $stmt->bindValue(':topping', $value);
    $stmt->execute();
    $stmt->closeCursor(); 
    }
    
}
 

function updateOrderByID(Request $request, Response $response, $args) {
    error_log("server updateOrderByID");
    $order = $request->getParsedBody();  // Slim does JSON_decode here
    $db = getConnection();
    $id_to_update = $args['id'];
    if($order['status']=="Finished")
    {
        $sql = 'UPDATE pizza_orders SET status="Finished" WHERE id=:id AND status="Baked"';
    }
    else
    {
        $sql = 'UPDATE pizza_orders SET status="Baked" WHERE id=:id AND status="Preparing"';   
    }
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':id', $id_to_update);
        $stmt->execute();
        $stmt->closeCursor();
}

// set up to execute on XAMPP or at pe07.cs.umb.edu:
// --set up a mysql user named pizza_user on your own system
// --see database/dev_setup.sql and database/createdb.sql
// --load your mysql database on pe07 with the pizza db
// Then this code figures out which setup to use at runtime
function getConnection() {
    if (gethostname() === 'pe07') {
        $dbuser = 'raj2421';  // CHANGE THIS to your cs.umb.edu username
        $dbpass = 'raj2421';  // CHANGE THIS to your mysql DB password on pe07 
        $dbname = $dbuser . 'db'; // our convention for mysql dbs on pe07   
    } else {  // dev machine, can create pizzadb
        $dbuser = 'pizza_user';
        $dbpass = 'pa55word';  // or your choice
        $dbname = 'pizzadb';
    }
    $dsn = 'mysql:host=localhost;dbname=' . $dbname;
    $dbh = new PDO($dsn, $dbuser, $dbpass);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $dbh;
}
