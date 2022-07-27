const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;
var http = require('http');
const { table, Console } = require('console');
const { query } = require('express');

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
		//sendTableData();
		
		function sendTableData()
		{
			db.serialize(() => 
			{
				/*db.all('SELECT * FROM BudgetEstimate', //[param1, param2],// (err, result) => */
				db.all('SELECT * FROM ProjectList', /*[param1, param2],*/ (err, result) =>
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
			////////////////////////////////////////////////////////////////////////////////////////
			//Added till Will finishes table serving

			if (e.data.includes("RequestTable"))
			{
				console.log("Requesting: " + e.data.replace("RequestTable", ""));
				var tableRequest = 'SELECT * FROM ' + e.data.replace("RequestTable", "")
				db.serialize(() => 
				{
					/*db.all('SELECT * FROM BudgetEstimate', //[param1, param2],// (err, result) => */
					//db.all('SELECT * FROM ?', [tableRequested], /*[param1, param2],*/ (err, result) =>
					//db.all('SELECT * FROM table=?',[tableRequested], /*[param1, param2],*/ (err, result) =>
					db.all(tableRequest, /*[param1, param2],*/ (err, result) =>
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
			}

			if(e.data.includes("AddRowData"))
			{
				var params = e.data.replace("AddRowData", "");
				var queryRequest = `INSERT INTO ProjectList(ProjectName,ProjectStatus) VALUES('` + params +`',` + `0`+ `)`;//'SELECT * FROM ' + e.data.replace("RequestTable", "")
				//db.run(`INSERT INTO BudgetEstimate DEFAULT VALUES`, function(err) 
				db.run(queryRequest, function(err)
				{
					if (err) 
					{
					  return console.log(err.message);
					}
					else
					{
						console.log("Row Added with Data");
					}
				});
			}

			if(e.data.includes("AddRowToTable"))
			{
				var params = e.data.replace("AddRowToTable", "");
				console.log(e.data + " JHBJD");
				var queryRequest = 'INSERT INTO ' + params.split(':')[0]
				queryRequest += `(Row, Item, Quantity, Cost, 'Subcontractor Fee', 'Material Cost', 'Prelim Cost', 'Final Cost', 'Proft Margin', Notes)`;
				queryRequest += 'VALUES (' + params.split(':')[0] + ', \'Item Name\', \'0\', \'0\', \'0\', \'0\', \'0\', \'0\', \'0\', \'\')'
				//db.run(`INSERT INTO BudgetEstimate DEFAULT VALUES`, function(err) 
				db.run(queryRequest, function(err) 
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

			if(e.data.includes("RemoveRowFromTable"))
			{
				var params = e.data.replace("RemoveRowFromTable", "").split(":");
				rowid = params[0];
				tableName = params[1];

				var queryRequest = 'DELETE FROM ' + tableName + ' WHERE rowid=' + rowid;

				//db.run(`DELETE FROM ? WHERE rowid=?`,[tableName, rowid], function(err) 
				db.run(queryRequest, function(err) 
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

			/////////////////////////////////////////////////////////////////////////////////////////

			if(e.data.includes("TableData"))
			{
				var params = e.data.replace("TableData:", "");
				var tableName = params.split("-:-")[0];
				console.log(params);
				recData = JSON.parse(params.split("-:-")[1]);

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
							//var queryRequest = `UPDATE '${tableName}' SET Item='${recData[i].Item}' WHERE rowid='${ri}'`;
							var queryRequest = 'UPDATE ' + tableName + ' SET Item=\'' + recData[i].Item + '\' WHERE rowid=' + ri;
							console.log(queryRequest);
							db.run(queryRequest, /*[param1, param2],*/ (err) => 
							{
								if (err) 
								{
									console.log(err)
								} 
							});
						}
						if(recData[i].Quantity != undefined)
						{
							var queryRequest = 'UPDATE ' + tableName + ' SET Quantity=' + recData[i].Quantity + ' WHERE rowid=' + ri;
							console.log(queryRequest);
							db.run(queryRequest, /*[param1, param2],*/ (err) => 
							{
								if (err) 
								{
									console.log(err)
								} 
							});
						}
						if(recData[i].Cost != undefined)
						{
							var queryRequest = 'UPDATE ' + tableName + ' SET Cost=' + recData[i].Cost + ' WHERE rowid=' + ri;
							db.run(queryRequest, /*[param1, param2],*/ (err) => 
							{
								if (err) 
								{
									console.log(err)
								} 
							});
						}
						if(recData[i].SubcontractorFee != undefined)
						{
							var queryRequest = 'UPDATE ' + tableName + ' SET SubcontractorFee=' + recData[i].SubcontractorFee + ' WHERE rowid=' + ri;
							db.run(queryRequest, /*[param1, param2],*/ (err) => 
							{
								if (err) 
								{
									console.log(err)
								} 
							});
						}
						if(recData[i].MaterialCost != undefined)
						{
							var queryRequest = 'UPDATE ' + tableName + ' SET MaterialCost=' + recData[i].MaterialCost + ' WHERE rowid=' + ri;
							db.run(queryRequest, /*[param1, param2],*/ (err) => 
							{
								if (err) 
								{
									console.log(err)
								} 
							});
						}
						if(recData[i].PrelimCost != undefined)
						{
							var queryRequest = 'UPDATE ' + tableName + ' SET PrelimCost=' + recData[i].PrelimCost + ' WHERE rowid=' + ri;
							db.run(queryRequest, /*[param1, param2],*/ (err) => 
							{
								if (err) 
								{
									console.log(err)
								} 
							});
						}
						if(recData[i].FinalCost != undefined)
						{
							var queryRequest = 'UPDATE ' + tableName + ' SET FinalCost=' + recData[i].FinalCost + ' WHERE rowid=' + ri;
							db.run(queryRequest, /*[param1, param2],*/ (err) => 
							{
								if (err) 
								{
									console.log(err)
								} 
							});
						}
						if(recData[i].ProftMargin != undefined)
						{
							var queryRequest = 'UPDATE ' + tableName + ' SET ProftMargin=' + recData[i].ProftMargin + ' WHERE rowid=' + ri;
							db.run(queryRequest, /*[param1, param2],*/ (err) => 
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

			if(e.data.includes("AddTable"))
			{
				tableName = e.data.replace("AddTable ", "");

				sql = `CREATE TABLE IF NOT EXISTS ${tableName}
				(
					"Row"	INTEGER NOT NULL DEFAULT 0,
					"Item"	TEXT NOT NULL DEFAULT 'Item Name',
					"Quantity"	INTEGER NOT NULL DEFAULT 0,
					"Cost"	REAL NOT NULL DEFAULT 0.0,
					"Subcontractor Fee"	REAL NOT NULL DEFAULT 0.0,
					"Material Cost"	REAL NOT NULL DEFAULT 0.0,
					"Prelim Cost"	REAL NOT NULL DEFAULT 0.0,
					"Final Cost"	REAL NOT NULL DEFAULT 0.0,
					"Proft Margin"	REAL NOT NULL DEFAULT 0.0,
					"Notes"	TEXT NOT NULL DEFAULT ''
				)`;
				
				db.run(sql, function(err) 
				{
					if (err) 
					{
						return console.log(err.message);
					}
					else
					{
						console.log(tableName);
						var queryRequest = 'INSERT INTO ' + tableName
						queryRequest += `(Row, Item, Quantity, Cost, 'Subcontractor Fee', 'Material Cost', 'Prelim Cost', 'Final Cost', 'Proft Margin', Notes)`;
						queryRequest += 'VALUES (\'1\', \'Item Name\', \'0\', \'0\', \'0\', \'0\', \'0\', \'0\', \'0\', \'\')'
						//db.run(`INSERT INTO BudgetEstimate DEFAULT VALUES`, function(err) 
						db.run(queryRequest, function(err) 
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
				});
			}

			if(e.data.includes("DropTable"))
			{
				tableName = e.data.replace("DropTable ", "");

				sql = `DROP TABLE IF EXISTS ${tableName}`;

				db.run(sql, function(err) 
				{
					if (err) 
					{
						return console.log(err.message);
					}
					else
					{
						console.log(tableName);
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