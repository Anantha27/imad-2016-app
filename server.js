var express = require('express');
var morgan = require('morgan');
var path = require('path');
var crypto=require('crypto');
var session=require('express-session');
var app = express();
var bodyParser=require('body-parser');
var pg=require('pg');
var Pool =require('pg').Pool;
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 
  extended: true
}));

var config = {
  user: 'anantha27', //env var: PGUSER
  database: 'anantha27', //env var: PGDATABASE
  password: process.env.DB_PASSWORD, //env var: PGPASSWORD
  host: 'db.imad.hasura-app.io', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
};
/*app.use(session({
    secret:"Randomsecretvalue",
    cookie:{ maxAge:1000*60*60*24*30}
}));*/
function hash(input,salt)
{
    var hashed=crypto.pbkdf2Sync(input,salt,10000,512,'sha512');
 var hashedarray=["pbkdf2","10000",salt,hashed.toString('hex')];
  var passwordString=hashedarray.join('$');
    return passwordString;
}
// To test the hashing concept....    
app.get('/hash/:input',function(req,res){
    var hashedString=hash(req.params.input,"salt");
    res.send(hashedString);
});
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
    
   pool.query('SELECT * FROM "report" WHERE Rname ='+req.params.articleName,function(err,result){
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


// To display the contents in db as JSON objects....
app.get('/test-db',function(req,res)
{
    pool.query('SELECT * FROM "report"', function(err, result)
    {
             if(err)
      {  res.status(500).send(err.toString());
        }
        else
        {   res.send(JSON.stringify(result.rows));
        }
    });

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
app.post('/login',function(req,res){
    var username=req.body.username;
    var password=req.body.password;
    pool.query('SELECT * FROM "user" WHERE username = $1',[username],function(err,result)
{   if(err)
    {res.status(500).send(err.toString());
    }
   
    else
    {    if(result.rows.length===0)
        { // user does not exists
            res.send(403).send('Username is invalid:');
        }
        else
        {// match the passord
        var dbString=result.rows[0].password;
        var salt= dbString.split('$')[2];
        var hashedPassword=hash(password, salt);
        if(hashedPassword===dbString)
        {
            req.session.auth={userId:result.rows[0].id};
            res.send('credentials correct');
        }
        else
        {
            res.send(403).send('Password is invalid');
        }
    }
        
    }
});
});
app.get('/check-login',function(req,res)
{
    if(req.session && req.session.auth && req.session.auth.userId)
    {
        res.send("You are logged in:"+req.session.auth.userId.toString());
    }
    else
    {
        res.send("You are not logged in");
    }
});
app.get('/logout',function(req,res)
{
    delete req.session.auth;
    res.send('session expires');
});

app.get('/article-three',function(req,res)
{
    res.send("Article three will be served here");
});
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname,'ui','index.html'));
});
app.get('/ui/ak.gif', function (req, res) {
    res.sendFile(path.join(__dirname,'ui','ak.gif'));
});
app.get('/ui/bootstrap.js', function (req, res) {
  res.sendFile(path.join(__dirname,'ui','bootstrap.js'));
});
app.get('/ui/bootstrap.css', function (req, res) {
  res.sendFile(path.join(__dirname,'ui','bootstrap.css'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname,'ui','style.css'));
});
app.get('/profile.html', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'profile.html'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname,'ui','main.js'));
});
app.get('/ui/fb.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'fb.jpg'));
});

app.get('/ui/gmail.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'gmail.png'));
});

app.get('/ui/github.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'github.png'));
});

app.get('/ui/linkedin.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'linkedin.png'));
});
var port=8080;
// Use 8080 for local development because you might already have apache running on 80
app.listen(8080);
