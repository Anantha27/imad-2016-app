var express = require('express');
var bodyParser = require('body-parser')
var app = express();
app.use(express.static(__dirname + '/public'));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use( bodyParser.json() ); 
 app.use(bodyParser.urlencoded({ 
  extended: true
}));
app.listen(8081);


app.get('/', function (req, res) {
   res.render('login.ejs');
})

app.post('/login', function (req, res) {
   console.log("userName::"+req.body.userName)
})

app.get('/login', function (req, res) {
   console.log("userName::"+req.query.userName)
   res.end("HELLO")
})

console.log("Server Listening on 8081")