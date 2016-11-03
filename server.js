var express = require('express');
var morgan = require('morgan');
var path = require('path');
var pg = require('pg');
var app = express();
var Pool =require('pg').Pool;
app.use(morgan('combined'));
var config = {
  user: 'anantha27', //env var: PGUSER
  database: 'anantha27', //env var: PGDATABASE
  password: process.env.DB_PASSWORD, //env var: PGPASSWORD
  host: 'db.imad.hasura-app.io', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};
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
    
   pool.query("SELECT * FROM report WHERE Rno ='"+req.params.articleName+"'",function(err,result){
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
    

app.get('/test-db',function(req,res){
    


  pool.query('SELECT * FROM report', function(err, result) {
      if(err)
      {
      res.status(500).send(err.toString());
        }
        else
        {
            res.send(JSON.stringify(result.rows))
        }
});

});
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/article-two',function(req,res)
{
    res.send("Article two will be served here");
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
