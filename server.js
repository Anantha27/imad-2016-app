var express = require('express');
var morgan = require('morgan');
var path = require('path');
var crypto=require('crypto');
var pg = require('pg');
var app = express();
var bodyParser=require('body-parser');
var Pool =require('pg').Pool;
app.use(morgan('combined'));
app.use(bodyParser.json());
var config = {
  user: 'anantha27', //env var: PGUSER
  database: 'anantha27', //env var: PGDATABASE
  password: process.env.DB_PASSWORD, //env var: PGPASSWORD
  host: 'db.imad.hasura-app.io', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};
function hash(input,salt)
{
    var hashed=crypto.pbkdf2Sync(input,salt,10000,512,'sha512');
    return hashed.toString('hex');
}
function createTemplate(data){
    var RepNo=data.Rno;
    var Sub=data.Rname;
    var date=data.Date;
    var body=data.Body;
    var auName=data.Auname;
var htmlTemplate=
'<html>'+
    '<head>'+
    '<title>Report</title>'+
    '</head>'+
    '<div>$[Sub]</div>'+
    '<div>$[body]</div></html>';

  return htmlTemplate;  
}
var pool = new pg.Pool(config);
app.get('/articles/:articleName',function(req,res)
{
    
   pool.query("SELECT * FROM report WHERE Rname ='"+req.params.articleName+"'",function(err,result){
         if(err)
      {
      res.status(500).send(err.toString());
        }
        else
        {
            if(result.rows.length === 0){
                 res.status(500).send('Article not found');
            }
            else
            {
                var articleData=result.rows[0];
                res.send(createTemplate(articleData));
            }
        }
    });
});
// To test the hashing concept....    
app.get('/hash/:input',function(req,res){
    var hashedString=hash(req.params.input,'salt');
    res.send(hashedString);
});

// To display the contents in db as JSON objects....
app.get('/test-db',function(req,res)
{
    pool.query('SELECT * FROM report', function(err, result)
    {
             if(err)
      {  res.status(500).send(err.toString());
        }
        else
        {   res.send(JSON.stringify(result.rows));
        }
    });

});
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});
// create new user
app.post('/create-user',function(req,res)
{ 
    var username=req.body.username;
    var password=req.body.password;
var salt=crypto.randomBytes(128).toString('hex');
var dbstring = hash(password,salt);
pool.query('INSERT INTO "user"(username,password) VALUES($1,$2)',[username,dbstring],function(err,result)
{   if(err)
    {res.status(500).send(err.toString());
    }
    else
    { res.send('User successfully created:'+ username);
    }
    
    });
});
app.get('/login',function(req,res){
    var username=req.body.username;
    var password=req.body.password;
    pool.query('SELECT * FROM "user" WHERE username=$1"',[username,dbstring],function(err,result)
{   if(err)
    {res.status(500).send(err.toString());
    }
    else if(result.rows.length===0)
    { // user does not exists
        res.send(403).send('Username is invalid:'+username);
    }
    else
    {// match the passord
        var dbstring=result.rows[0].password;
        var salt= dbstring.split('$')[2];
        var hashpassword=hash(password,salt);
        if(hashpassword===dbstring)
        {
            res.send('credentials correct');
        }
        else
        {
            res.send(403).send('Password is invalid');
        }
        
    }
});
});

app.get('/article-three',function(req,res)
{
    res.send("Article three will be served here");
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/shiva.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'shiva.PNG'));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
