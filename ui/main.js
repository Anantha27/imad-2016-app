console.log('Loaded!');
var submit=document.getElementById('submit_btn');
// on click of submit button
submit.onclick=function()
{
    var request=new XMLHttpRequest();
    request.onreadystate=function()
    {if(requet.readyState===XMLHttpRequest.DONE)
        {
            if(request.status===200)
            {
                alert('Logged in successfully');
            }
            else if(request.status===403)
            {
                alert('Usernmae/password incorrect');
            }
            else if(request.status===500)
            {
            alert('Internal Server error');
            }
        }
    };
};

var username=document.getElementById('username').value;
var password=document.getElementById('password').value;
console.log(username);
console.log(password);
request.open('POST','http://anantha27.imad.hasura-app.io/login',true);
request.setRequestHeader('Content-type','application/json');
request.send(JSON.stringify({username:username,password:password}));
