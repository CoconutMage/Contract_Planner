const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;
var http = require('http');

//Database Variables
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

//sendFile will go here
//include subdir
app.use(express.static('public'));

//I think this actually starts both the webapp and the websocket
const server = http.createServer(app).listen(port);
console.log("Server started at http:localhost/:" + port + " On " + Date());
connectWebsocket(server);


function connectWebsocket(server)
{
	const { Server } = require('ws');
	const wss = new Server({ server });

	//On successful websocket connection, log that the connection was successful
	wss.on('connection', (ws) => 
	{
		console.log("Websocket Connection Successful");
		sendTableData();
		
		function sendTableData()
		{
			db.serialize(() => 
			{
				db.all('SELECT * FROM BudgetEstimate', /*[param1, param2],*/ (err, result) => 
				{
					if (err) 
					{
						console.log(err)
					} 
					else 
					{
						console.log(result);
						let tableData = [];
						tableData = result;
						
						wss.clients.forEach((client) => 
						{
							client.send(JSON.stringify(tableData));
						});
					}
				});
			});
			db.close();
		}
	});

	/*
	//When the websocket opens do...
	wss.onopen = function () 
	{
		//...nothing, yet
	}	
*/

	//If the websocket throws an error, log the error
	wss.on('error', function (event)
	{
		console.log(event)
	});
}

//This I think gets specific files, but its not needed atm cause public dir is all included
/*app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});
app.get('/script.js', function(req, res){
    res.sendFile(__dirname + '/script.js');
});*/