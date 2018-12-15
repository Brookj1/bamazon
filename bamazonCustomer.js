var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    prodList();
    // console.log('connected')
});

function prodList() {
    connection.query('SELECT * FROM product', function (err, res) {
        if (err) throw err;
        console.log('==========================================');
        console.log('============= Items In Store =============');
        console.log('==========================================');

        for (i = 0; i < res.length; i++) {
        console.log('Item ID: ' + res[i].id + '  || Product Name: ' + res[i].product_name + ' || Department: ' + res[i].department_name + ' || Price: ' + '$' + res[i].price + ' || In Stock: ' + res[i].stock_quantity)
        }
        console.log('==========================================');
        purchase();
        // connection.end();
    })
}

function purchase() {
    inquirer.prompt([{
        name: 'selectId',
        message: "Please enter product ID",
        validate: function(value) {
            var valid = value.match(/^[0-9]+$/)
            if(valid){
                return true
            }
                return "Please enter a valid Item ID"
        }
    },{
        name: 'quantity',
        message: "How many would you like?",
        validate: function(value) {
            var valid = value.match(/^[0-9]+$/)
            if(valid){
                return true
            }
                return "Please enter a valid number"
        }
    }]).then(function(answer){
        connection.query('SELECT * FROM product WHERE id = ?', [answer.selectId], function(err, res){
            if(answer.quantity > res[0].stock_quantity){
                console.log("There's not enough of that item in stock!");
                console.log("This order has been cancelled.");
                console.log('');
                newOrder();
            }else{
                var amountOwed = res[0].price * answer.quantity;
                console.log("You owe $" + amountOwed);
                console.log("Thank You!");
                console.log("");

                connection.query('UPDATE product SET ? WHERE ?', [{
                    stock_quantity: res[0].stock_quantity - answer.quantity
                },{
                    id: answer.selectId
                }], function(err, res) {});
                
                newOrder();
                
            }
        })
     })
};

function newOrder() {
    inquirer.prompt ([{
        type: 'list',
        name: 'choice',
        message: 'Would you like to place a new order?',
        choices: ["Place a new order", "Exit"],
    }]).then(function(answer) {
        // console.log(answer);
        if(answer.choice === "Place a new order"){
            prodList();
        
        }else{
            console.log("Thank you for shopping on Bamazon! Hope to see you again soon!");
            connection.end();
        }
    })
}
 


// prodList();