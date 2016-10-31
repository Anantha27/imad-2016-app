var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var json=require('JSON');
var pg=require('pg')
var connString="pg://postgres:postgres@localhost:5432/user"
//connString=connString.trim();
console.log("connection sting::"+connString)
app.use(express.static(__dirname + '/public'));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use( bodyParser.json() ); 
 app.use(bodyParser.urlencoded({ 
  extended: true
}));
app.listen(8081);


app.get('/', function (req, res) {
   res.render('loginPage.ejs');
})

app.post('/login', function (req, res) {
    console.log("userName::"+req.body.userName)
    var userName=req.body.userName
   	pg.connect(connString, function(err, client, done) {
		console.log("Client for pg: "+client)
		if(err) {
			return console.error('error fetching client from pool', err);
    		}
    		query="select user_id,user_name from public.user where user_name='"+userName+"'";
    		client.query(query, function(err, result) {
    		done(); //call done() to release the client back to the pool
    		 if(err) {
    		      return console.error('error running query', err);
    		           }
    		var userData=result.rows;
			console.log("Result::"+userData)
			console.log("Data from result::"+userData[0]['user_name'])
    		res.end("Hello User:"+json.stringify(result.rows));
    		});});
        });

console.log("Server Listening on 8081")