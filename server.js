const http = require('http');
const app = require('./app');            //import app.js
const port = process.env.PORT || 5000;   //(we can hard code the port number or just declare environment vARiable)
                                         //here, the port nu,ber will be the env variable or 3000
//here we will create our server

const server = http.createServer(app);

//here we have start my server with passing arg  as port number
server.listen(5000);