var express = require('express');
var session = require('express-session');
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

app.use(session({secret: 'someSecretWordtoencrytYourSessionData'}));
app.use( bodyParser.json() ); 
 app.use(bodyParser.urlencoded({ 
  extended: true
}));
app.listen(8082);

app.get('/', function (req, res) {
   res.render('loginPage.ejs');
})

app.post('/login', function (req, res) {
    console.log("userName::"+req.body.userName)
    var userName=req.body.userName
	var password=req.body.password
   	pg.connect(connString, function(err, client, done) {
		console.log("Client for pg: "+client)
		if(err) {
			return console.error('error fetching client from pool', err);
    		}
    		query="select user_id,user_name from public.user where user_name='"+userName+"'and password='"+password+"'";
			console.log("query generated is "+query)
    		client.query(query, function(err, result) {
    		done(); //call done() to release the client back to the pool
    		 if(err) {
    		      return console.error('error running query', err);
    		           }
    		var userData=result.rows;
			console.log("Length of result::"+userData.length)
			if(userData.length>0)
			{
				req.session.id=userData[0]['user_id']
				req.session.userName=userData[0]['user_name']
			}
			console.log("Session created : "+json.stringify(req.session))
			//console.log("Data from result::"+userData[0]['user_name'])
    		res.end("Hello User:"+json.stringify(userData[0]['user_name']));
    		});});
        });
		
		app.get('/greetings', function (req, res) {
			if(req.session.id)
            res.end("Hello : "+req.session.userName);
})
		
console.log("Server Listening on 8081")