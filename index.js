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
						console.log(err);
					} 
					else 
					{
						//console.log(result);
						let tableData = [];
						tableData = result;
						
						wss.clients.forEach((client) => 
						{
							client.send(JSON.stringify(tableData));
						});
					}
				});
			});
			//db.close();
		}


		ws.onmessage = function(e) 
		{
			if(e.data.includes("TableData"))
			{
				recData = JSON.parse(e.data.replace("TableData: ", ""));

				for(i = 0; i < recData.length ; i++)
				{
					//console.log(recData[i]);
					
					//console.log(recData[i].Item);
					/*
					if(recData[i].Item == undefined)
					{
						console.log("UNDEFINED");
					}
					*/
				}

				//I know this is large and ugly and I could probably do it better
				// but I don't want to spend too much time on SQLite when there's other things to do
				db.serialize(() => 
				{
					ri = 0;
					for(i  = 0; i < recData.length; i++)
					{
						if(i%5 == 0)
						{
							ri = i/5 + 1;
							//console.log(ri);
						}

						if(recData[i].Item != undefined)
						{
							db.run('UPDATE BudgetEstimate SET Item=? WHERE rowid=?', [recData[i].Item, ri],/*[param1, param2],*/ (err) => 
							{
								if (err) 
								{
									console.log(err)
								} 
							});
						}
						if(recData[i].Quantity != undefined)
						{
							db.run('UPDATE BudgetEstimate SET Quantity=? WHERE rowid=?', [recData[i].Quantity, ri],/*[param1, param2],*/ (err) => 
							{
								if (err) 
								{
									console.log(err)
								} 
							});
						}
						if(recData[i].Cost != undefined)
						{
							db.run('UPDATE BudgetEstimate SET Cost=? WHERE rowid=?', [recData[i].Cost, ri],/*[param1, param2],*/ (err) => 
							{
								if (err) 
								{
									console.log(err)
								} 
							});
						}
						if(recData[i].SubcontractorFee != undefined)
						{
							db.run('UPDATE BudgetEstimate SET SubcontractorFee=? WHERE rowid=?', [recData[i].SubcontractorFee, ri],/*[param1, param2],*/ (err) => 
							{
								if (err) 
								{
									console.log(err)
								} 
							});
						}
						if(recData[i].MaterialCost != undefined)
						{
							db.run('UPDATE BudgetEstimate SET MaterialCost=? WHERE rowid=?', [recData[i].MaterialCost, ri],/*[param1, param2],*/ (err) => 
							{
								if (err) 
								{
									console.log(err)
								} 
							});
						}
					}
				});
			}

			if(e.data.includes("Add Row"))
			{
				db.run(`INSERT INTO BudgetEstimate DEFAULT VALUES`, function(err) 
				{
					if (err) 
					{
					  return console.log(err.message);
					}
					else
					{
						console.log("Row Added");
					}
				});
			}

			if(e.data.includes("RemoveRow"))
			{
				rowid = e.data.replace("RemoveRow: ", "");

				db.run(`DELETE FROM BudgetEstimate WHERE rowid=?`,[rowid], function(err) 
				{
					if (err) 
					{
						return console.log(err.message);
					}
					else
					{
						console.log(rowid);
					}
				});
			}
		}

		ws.on('close', function (event)
		{
			console.log('Client disconnected');
			//db.close();
		});

		//If the websocket throws an error, log the error
		ws.on('error', function (event)
		{
			console.log(event)
		});
	});
}

//This I think gets specific files, but its not needed atm cause public dir is all included
/*app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});
app.get('/script.js', function(req, res){
    res.sendFile(__dirname + '/script.js');
});*/