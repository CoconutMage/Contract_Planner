const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;
var http = require('http');
const { table, Console } = require('console');
const { query } = require('express');
var queryInProgress = false;

//Database Variables
const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database.db');

//sendFile will go here
//include subdir
app.use(express.static('public'));
//app.listen(port);

//I think this actually starts both the webapp and the websocket
const server = http.createServer(app).listen(port);//(port, "0.0.0.0");
console.log("Server started at http:localhost/:" + port + " On " + Date());
connectWebsocket(server);


function connectWebsocket(server)
{
	const { Server } = require('ws');
	const wss = new Server({ server });

	//On successful websocket connection, log that the connection was successful
	wss.on('connection', (ws) => 
	{
		db = new sqlite3.Database('database.db');
		console.log("Websocket Connection Successful");
		console.log(wss.clients[0]);
		//sendTableData();
		
		function sendTableData()
		{
			queryInProgress = true;
			db.serialize(() => 
			{
				/*db.all('SELECT * FROM BudgetEstimate', //[param1, param2],// (err, result) => */
				db.all('SELECT * FROM ProjectList', /*[param1, param2],*/ (err, result) =>
				{
					if (err) 
					{
						console.log(err);
						queryInProgress = false;
					} 
					else 
					{
						//console.log(result);
						let tableData = [];
						tableData = result;
						
						/*wss.clients.forEach((client) => 
						{
							client.send(JSON.stringify(tableData));
						});*/
						queryInProgress = false;
					}
				});
			});
			//db.close();
		}


		ws.onmessage = function(e) 
		{
			////////////////////////////////////////////////////////////////////////////////////////
			//Added till Will finishes table serving

			if(e.data.includes("USER_ID: "))
			{
				let userId = e.data.replace("USER_ID: ", "");
			}

			var i = 0;
			while(queryInProgress && i < 1000)
			{
				i++;
				console.log("Query Waiting");
			}
			queryInProgress = true;

			if (e.data.includes("RequestTable"))
			{
				console.log("Requesting: " + e.data.replace("RequestTable", "").split(':')[0]);
				var tableRequest = `SELECT * FROM '${e.data.replace("RequestTable", "").split(':')[0]}'`;
				db.parallelize(() => 
				{
					/*db.all('SELECT * FROM BudgetEstimate', //[param1, param2],// (err, result) => */
					//db.all('SELECT * FROM ?', [tableRequested], /*[param1, param2],*/ (err, result) =>
					//db.all('SELECT * FROM table=?',[tableRequested], /*[param1, param2],*/ (err, result) =>
					db.all(tableRequest, /*[param1, param2],*/ (err, result) =>
					{
						if (err) 
						{
							console.log(err);
							queryInProgress = false;
						} 
						else 
						{
							console.log(result);
							let tableData = [];
							tableData = result;
							queryInProgress = false;

							ws.send(JSON.stringify(tableData) + '-:-' + e.data.replace("RequestTable", "").split(':')[1]);
							/*wss.clients.forEach((client) => 
							{
								client.send(JSON.stringify(tableData) + '-:-' + e.data.replace("RequestTable", "").split(':')[1]);
							});*/
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
						queryInProgress = false;
					  return console.log(err.message);
					}
					else
					{
						queryInProgress = false;
						console.log("Row Added with Data");
					}
				});
			}

			if(e.data.includes("AddRowToBudgetWithValue"))
			{
				var params = e.data.replace("AddRowToBudgetWithValue", "");
				var queryRequest = 'INSERT INTO ' + params.split(':')[0]
				console.log(params);
				queryRequest += `(Row, Item, Quantity, Cost, 'Subcontractor Fee', 'Material Cost', 'Prelim Cost', 'Final Cost', 'Profit Margin', Notes)`;
				queryRequest += `VALUES (${params.split(':')[2]}, '${params.split(':')[1]}', '0', '0', '${params.split(':')[0] + params.split(':')[2]}SubSplit', '${params.split(':')[0] + params.split(':')[2]}MatSplit', '0', '0', '0', '')`
				console.log(queryRequest);
				db.run(queryRequest, function(err)
				{
					if (err) 
					{
						queryInProgress = false;
					  return console.log(err.message);
					}
					else
					{
						console.log("Row Added");

						var splitTableName = params.split(':')[0] + params.split(':')[2] + 'SubSplit';

						sql = `CREATE TABLE IF NOT EXISTS '${splitTableName}'
						(
							"Name"	TEXT NOT NULL DEFAULT 'Item Name',
							"Cost"	REAL NOT NULL DEFAULT 0.0,
							"Notes"	TEXT NOT NULL DEFAULT '',
							"Paid" BOOLEAN NOT NULL DEFAULT '0'
						)`;
						
						db.run(sql, function(err) 
						{
							if (err) 
							{
								queryInProgress = false;
								return console.log(err.message);
							}
							else
							{
								console.log(splitTableName);
								var queryRequest = `INSERT INTO '${splitTableName}'`;
								queryRequest += `(Name, Cost, Notes, Paid)`;
								queryRequest += 'VALUES (\'\', \'0\', \'\', \'0\')'
								//db.run(`INSERT INTO BudgetEstimate DEFAULT VALUES`, function(err) 
								db.run(queryRequest, function(err) 
								{
									if (err) 
									{
										queryInProgress = false;
										return console.log(err.message);
									}
									else
									{
										queryInProgress = false;
										console.log("Row Added");
									}
								});
							}
						});

						var matTableName = params.split(':')[0] + params.split(':')[2] + 'MatSplit';

						sql = `CREATE TABLE IF NOT EXISTS '${matTableName}'
						(
							"Name"	TEXT NOT NULL DEFAULT 'Item Name',
							"Cost"	REAL NOT NULL DEFAULT 0.0,
							"Notes"	TEXT NOT NULL DEFAULT '',
							"Paid" BOOLEAN NOT NULL DEFAULT '0'
						)`;
						
						db.run(sql, function(err) 
						{
							if (err) 
							{
								queryInProgress = false;
								return console.log(err.message);
							}
							else
							{
								console.log(matTableName);
								var queryRequest = `INSERT INTO '${matTableName}'`;
								queryRequest += `(Name, Cost, Notes, Paid)`;
								queryRequest += 'VALUES (\'\', \'0\', \'\', \'0\')'
								//db.run(`INSERT INTO BudgetEstimate DEFAULT VALUES`, function(err) 
								db.run(queryRequest, function(err) 
								{
									if (err) 
									{
										queryInProgress = false;
									return console.log(err.message);
									}
									else
									{
										queryInProgress = false;
										console.log("Row Added");
									}
								});
							}
						});
					}
				});
			}

			if(e.data.includes("AddRowToSplit"))
			{
				var params = e.data.replace("AddRowToSplit", "");
				var queryRequest = `INSERT INTO '${params}'`;
				queryRequest += `(Name, Cost, Notes, Paid)`;
				queryRequest += ' VALUES (\'\', \'0\', \'\', \'0\')';

				console.log(queryRequest);
				db.run(queryRequest, function(err)
				{
					if (err) 
					{
						queryInProgress = false;
					  return console.log(err.message);
					}
					else
					{
						queryInProgress = false;
						console.log("Row Added with Data");
					}
				});
			}

			if(e.data.includes("AddBulkItem"))
			{
				var params = e.data.replace("AddBulkItem:", "");
				var queryRequest = `INSERT INTO 'BulkItem' `;
				queryRequest += `(ItemVal, ItemName)`;
				queryRequest += ` VALUES ('${params.replaceAll(" ", "")}', '${params}')`;

				console.log(queryRequest);
				db.run(queryRequest, function(err)
				{
					if (err) 
					{
						queryInProgress = false;
					  return console.log(err.message);
					}
					else
					{
						queryInProgress = false;
						console.log("Row Added with Data");
					}
				});
			}

			if(e.data.includes("AddRowToTableBudget"))
			{
				var params = e.data.replace("AddRowToTableBudget", "");
				console.log(e.data + " JHBJD");
				var queryRequest = 'INSERT INTO ' + params.split(':')[0];
				queryRequest += `(Row, Item, Quantity, Cost, 'Subcontractor Fee', 'Material Cost', 'Prelim Cost', 'SubFee', 'MatFee', 'Profit Margin', Notes)`;
				//queryRequest += 'VALUES (\'0\', \'Item Name\', \'0\', \'0\', \'\', \'\', \'0\', \'0\', \'0\', \'0\', \'\')';
				queryRequest += `VALUES (${params.split(':')[1]}, 'Item Name', '0', '0', '${params.split(':')[0] + params.split(':')[1]}SubSplit', '${params.split(':')[0] + params.split(':')[1]}MatSplit', '0', '0', '0', '0', '')`
				//db.run(`INSERT INTO BudgetEstimate DEFAULT VALUES`, function(err) 
				db.run(queryRequest, function(err) 
				{
					if (err) 
					{
						queryInProgress = false;
					  return console.log(err.message);
					}
					else
					{
						console.log("Row Added");

						var splitTableName = params.split(':')[0] + params.split(':')[1] + 'SubSplit';

						sql = `CREATE TABLE IF NOT EXISTS '${splitTableName}'
						(
							"Name"	TEXT NOT NULL DEFAULT 'Item Name',
							"Cost"	REAL NOT NULL DEFAULT 0.0,
							"Notes"	TEXT NOT NULL DEFAULT '',
							"Paid" BOOLEAN NOT NULL DEFAULT '0'
						)`;
						
						db.run(sql, function(err) 
						{
							if (err) 
							{
								queryInProgress = false;
								return console.log(err.message);
							}
							else
							{
								console.log(splitTableName);
								var queryRequest = `INSERT INTO '${splitTableName}'`;
								queryRequest += `(Name, Cost, Notes, Paid)`;
								queryRequest += 'VALUES (\'\', \'0\', \'\', \'0\')'
								//db.run(`INSERT INTO BudgetEstimate DEFAULT VALUES`, function(err) 
								db.run(queryRequest, function(err) 
								{
									if (err) 
									{
										queryInProgress = false;
										return console.log(err.message);
									}
									else
									{
										queryInProgress = false;
										console.log("Row Added");
									}
								});
							}
						});

						var matTableName = params.split(':')[0] + params.split(':')[1] + 'MatSplit';

						sql = `CREATE TABLE IF NOT EXISTS '${matTableName}'
						(
							"Name"	TEXT NOT NULL DEFAULT 'Item Name',
							"Cost"	REAL NOT NULL DEFAULT 0.0,
							"Notes"	TEXT NOT NULL DEFAULT '',
							"Paid" BOOLEAN NOT NULL DEFAULT '0'
						)`;
						
						db.run(sql, function(err) 
						{
							if (err) 
							{
								queryInProgress = false;
								return console.log(err.message);
							}
							else
							{
								console.log(matTableName);
								var queryRequest = `INSERT INTO '${matTableName}'`;
								queryRequest += `(Name, Cost, Notes, Paid)`;
								queryRequest += 'VALUES (\'\', \'0\', \'\', \'0\')'
								//db.run(`INSERT INTO BudgetEstimate DEFAULT VALUES`, function(err) 
								db.run(queryRequest, function(err) 
								{
									if (err) 
									{
										queryInProgress = false;
									return console.log(err.message);
									}
									else
									{
										queryInProgress = false;
										console.log("Row Added");
									}
								});
							}
						});
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
						queryInProgress = false;
						return console.log(err.message);
					}
					else
					{
						queryInProgress = false;
						console.log(rowid);
					}
				});
			}

			if(e.data.includes("UpdateProjectStatus"))
			{
				var params = e.data.replace("UpdateProjectStatus:", "").split(':');

				var queryRequest = 'UPDATE ProjectList SET ProjectStatus=' + params[1] + ' WHERE ProjectName=\'' + params[0] + '\'';
				console.log(queryRequest);
				//db.run(`DELETE FROM ? WHERE rowid=?`,[tableName, rowid], function(err) 
				db.run(queryRequest, function(err) 
				{
					if (err) 
					{
						queryInProgress = false;
						return console.log(err.message);
					}
				});
			}

			if(e.data.includes("UpdateProjectNotes"))
			{
				var params = e.data.replace("UpdateProjectNotes:", "").split(':');

				var queryRequest = `UPDATE ProjectList SET Notes='${params[1]}' WHERE ProjectName='${params[0]}'`;
				console.log(queryRequest);
				//db.run(`DELETE FROM ? WHERE rowid=?`,[tableName, rowid], function(err) 
				db.run(queryRequest, function(err) 
				{
					if (err) 
					{
						queryInProgress = false;
						return console.log(err.message);
					}
				});
			}

			if(e.data.includes("UpdateProjectPrice"))
			{
				var params = e.data.replace("UpdateProjectPrice:", "").split(':');

				var queryRequest = `UPDATE ProjectList SET Price='${params[1]}' WHERE ProjectName='${params[0]}'`;
				console.log(queryRequest);
				//db.run(`DELETE FROM ? WHERE rowid=?`,[tableName, rowid], function(err) 
				db.run(queryRequest, function(err) 
				{
					if (err) 
					{
						queryInProgress = false;
						return console.log(err.message);
					}
				});
			}

			if(e.data.includes("UpdateProjectCost"))
			{
				var params = e.data.replace("UpdateProjectCost:", "").split(':');

				var queryRequest = `UPDATE ProjectList SET Cost='${params[1]}' WHERE ProjectName='${params[0]}'`;
				console.log(queryRequest);
				//db.run(`DELETE FROM ? WHERE rowid=?`,[tableName, rowid], function(err) 
				db.run(queryRequest, function(err) 
				{
					if (err) 
					{
						queryInProgress = false;
						return console.log(err.message);
					}
				});
			}

			if(e.data.includes("UpdateSubTotal"))
			{
				var params = e.data.replace("UpdateSubTotal:", "").split(':');

				var queryRequest = `UPDATE '${params[0]}' SET SubFee='${params[1]}'WHERE Row='${params[2]}'`;
				console.log(queryRequest);
				//db.run(`DELETE FROM ? WHERE rowid=?`,[tableName, rowid], function(err) 
				db.run(queryRequest, function(err) 
				{
					if (err) 
					{
						queryInProgress = false;
						return console.log(err.message);
					}
				});
			}

			if(e.data.includes("UpdateMatTotal"))
			{
				var params = e.data.replace("UpdateMatTotal:", "").split(':');

				var queryRequest = `UPDATE '${params[0]}' SET MatFee='${params[1]}'WHERE Row='${params[2]}'`;
				console.log(queryRequest);
				//db.run(`DELETE FROM ? WHERE rowid=?`,[tableName, rowid], function(err) 
				db.run(queryRequest, function(err) 
				{
					if (err) 
					{
						queryInProgress = false;
						return console.log(err.message);
					}
				});
			}

			if(e.data.includes("UpdateProjectPayments"))
			{
				var params = e.data.replace("UpdateProjectPayments:", "").split(':');

				var queryRequest = 'UPDATE ProjectList SET Payments=' + params[1] + ' WHERE ProjectName=\'' + params[0] + '\'';
				console.log(queryRequest);
				//db.run(`DELETE FROM ? WHERE rowid=?`,[tableName, rowid], function(err) 
				db.run(queryRequest, function(err) 
				{
					if (err) 
					{
						queryInProgress = false;
						return console.log(err.message);
					}
				});
			}

			if(e.data.includes("UpdateProjectName"))
			{
				var params = e.data.replace("UpdateProjectName:", "").split(':');

				var queryRequest = `UPDATE ProjectList SET ProjectName='${params[1]}' WHERE ProjectName='${params[0]}'`;
				console.log(queryRequest);
				//db.run(`DELETE FROM ? WHERE rowid=?`,[tableName, rowid], function(err) 
				db.run(queryRequest, function(err) 
				{
					if (err) 
					{
						queryInProgress = false;
						return console.log(err.message);
					}
				});

				var queryRequest = `ALTER TABLE ${params[0]}Budget RENAME TO ${params[1]}Budget`;
				console.log(queryRequest);
				//db.run(`DELETE FROM ? WHERE rowid=?`,[tableName, rowid], function(err) 
				db.run(queryRequest, function(err) 
				{
					if (err) 
					{
						queryInProgress = false;
						return console.log(err.message);
					}
				});
			}

			if(e.data.includes("SaveSubTable"))
			{
				var params = e.data.replace("SaveSubTable:", "");
				var tableName = params.split("-:-")[0];
				console.log(params);
				recData = JSON.parse(params.split("-:-")[1]);

				//I know this is large and ugly and I could probably do it better
				// but I don't want to spend too much time on SQLite when there's other things to do
				db.serialize(() => 
				{
					console.log(recData[i]);
					ri = 0;
					var numRows = 4;
					for(i  = 0; i < recData.length; i++)
					{
						if(i%numRows == 0)
						{
							ri = parseInt(i/numRows) + 2;
							console.log(ri);
						}

						if(recData[i].Name != undefined)
						{
							var queryRequest = `UPDATE '${tableName}' SET Name='${recData[i].Name}' WHERE rowid='${ri}'`;
							console.log(queryRequest);
							db.run(queryRequest, /*[param1, param2],*/ function (err, result) 
							{
								if (err) throw err;
    							//console.log(result + " record(s) updated");
							});
						}
						if(recData[i].Cost != undefined)
						{
							var queryRequest = `UPDATE '${tableName}' SET Cost='${recData[i].Cost}' WHERE rowid='${ri}'`;
							console.log(queryRequest);
							db.run(queryRequest, /*[param1, param2],*/ function (err, result) 
							{
								if (err) throw err;
    							//console.log(result + " record(s) updated");
							});
						}
						if(recData[i].Notes != undefined)
						{
							var queryRequest = `UPDATE '${tableName}' SET Notes='${recData[i].Notes}' WHERE rowid='${ri}'`;
							console.log(queryRequest);
							db.run(queryRequest, /*[param1, param2],*/ function (err, result) 
							{
								if (err) throw err;
    							//console.log(result + " record(s) updated");
							});
						}
						if(recData[i].Paid != undefined)
						{
							var queryRequest = `UPDATE '${tableName}' SET Paid='${recData[i].Paid}' WHERE rowid='${ri}'`;
							console.log(queryRequest);
							db.run(queryRequest, /*[param1, param2],*/ function (err, result) 
							{
								if (err) throw err;
    							//console.log(result + " record(s) updated");
							});
						}
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
					console.log(recData[i]);
					ri = 0;
					var numRows = 10;
					for(i  = 0; i < recData.length; i++)
					{
						if(i%numRows == 0)
						{
							ri = parseInt(i/numRows) + 1;
							console.log(ri);
						}

						if(recData[i].Row != undefined)
						{
							//ri = recData[i].Row;
							ri = parseInt(i/numRows) + 1;
							//var queryRequest = `UPDATE '${tableName}' SET Item='${recData[i].Item}' WHERE rowid='${ri}'`;
							var queryRequest = 'UPDATE ' + tableName + ' SET Row=' + ri + ' WHERE Row=' + recData[i].Row;
							console.log(queryRequest);
							db.run(queryRequest, /*[param1, param2],*/ function (err, result) 
							{
								if (err) throw err;
    							//console.log(result + " record(s) updated");
							});
						}
						if(recData[i].Item != undefined)
						{
							//var queryRequest = `UPDATE '${tableName}' SET Item='${recData[i].Item}' WHERE rowid='${ri}'`;
							var queryRequest = 'UPDATE ' + tableName + ' SET Item=\'' + recData[i].Item + '\' WHERE Row=' + ri;
							console.log(queryRequest);
							db.run(queryRequest, /*[param1, param2],*/ function (err, result) 
							{
								if (err) throw err;
    							//console.log(result.message + " record(s) updated");
							});
						}
						if(recData[i].Quantity != undefined)
						{
							var queryRequest = 'UPDATE ' + tableName + ' SET Quantity=' + recData[i].Quantity + ' WHERE Row=' + ri;
							console.log(queryRequest);
							db.run(queryRequest, /*[param1, param2],*/ function (err, result) 
							//db.run("UPDATE tkhnlgnkfBudget SET Item='jnjm'", /*[param1, param2],*/ function (err, result) 
							{
								if (err) throw err;
    							//console.log(result.message + " record(s) updated");
							});
						}
						if(recData[i].Cost != undefined)
						{
							var queryRequest = 'UPDATE ' + tableName + ' SET Cost=' + recData[i].Cost + ' WHERE Row=' + ri;
							console.log(queryRequest);
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
							var queryRequest = `UPDATE ${tableName} SET 'Subcontractor Fee'= '${recData[i].SubcontractorFee}' WHERE Row=${ri}`;
							console.log(queryRequest);
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
							var queryRequest = `UPDATE ${tableName} SET 'Material Cost'= '${recData[i].MaterialCost}' WHERE Row=${ri}`;
							console.log(queryRequest);
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
							var queryRequest = `UPDATE ${tableName} SET 'Prelim Cost'= ${recData[i].PrelimCost} WHERE Row=${ri}`;
							console.log(queryRequest);
							db.run(queryRequest, /*[param1, param2],*/ (err) => 
							{
								if (err) 
								{
									console.log(err)
								} 
							});
						}
						if(recData[i].SubFee != undefined)
						{
							var queryRequest = `UPDATE ${tableName} SET 'SubFee'= ${recData[i].SubFee} WHERE Row=${ri}`;
							console.log(queryRequest);
							db.run(queryRequest, /*[param1, param2],*/ (err) => 
							{
								if (err) 
								{
									console.log(err)
								} 
							});
						}
						if(recData[i].MatFee != undefined)
						{
							var queryRequest = `UPDATE ${tableName} SET 'MatFee'= ${recData[i].MatFee} WHERE Row=${ri}`;
							console.log(queryRequest);
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
							var queryRequest = `UPDATE ${tableName} SET 'Final Cost'= ${recData[i].FinalCost} WHERE Row=${ri}`;
							console.log(queryRequest);
							db.run(queryRequest, /*[param1, param2],*/ (err) => 
							{
								if (err) 
								{
									console.log(err)
								} 
							});
						}
						if(recData[i].ProfitMargin != undefined)
						{
							var queryRequest = `UPDATE ${tableName} SET 'Profit Margin'= ${recData[i].ProfitMargin} WHERE Row=${ri}`;
							console.log(queryRequest);
							db.run(queryRequest, /*[param1, param2],*/ (err) => 
							{
								if (err) 
								{
									console.log(err)
								}
								else
								{
									console.log("")
								}
							});
						}
						if(recData[i].Notes != undefined)
						{
							var queryRequest = 'UPDATE ' + tableName + ' SET Notes=\'' + recData[i].Notes + '\' WHERE Row=' + ri;
							console.log(queryRequest);
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
				queryInProgress = false;
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
					"Subcontractor Fee"	TEXT NOT NULL DEFAULT 0.0,
					"Material Cost"	TEXT NOT NULL DEFAULT 0.0,
					"Prelim Cost"	REAL NOT NULL DEFAULT 0.0,
					"Profit Margin"	REAL NOT NULL DEFAULT 0.0,
					"SubFee"	REAL NOT NULL DEFAULT 0.0,
					"MatFee"	REAL NOT NULL DEFAULT 0.0,
					"Notes"	TEXT NOT NULL DEFAULT '',
					"ChangeID"	INTEGER NOT NULL DEFAULT 0,
					"isChangeOrder" BOOLEAN NOT NULL DEFAULT '0'
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
						queryRequest += `(Row, Item, Quantity, Cost, 'Subcontractor Fee', 'Material Cost', 'Prelim Cost', 'SubFee', 'MatFee', 'Profit Margin', Notes)`;
						queryRequest += 'VALUES (\'0\', \'Item Name\', \'0\', \'0\', \'\', \'\', \'0\', \'0\', \'0\', \'0\', \'\')';
						//db.run(`INSERT INTO BudgetEstimate DEFAULT VALUES`, function(err) 
						console.log(queryRequest);
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
				console.log(e.data + " 561");
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
						//client.send("DroppedTable" + tableName);
					}
				});
			}
			queryInProgress = false;
		}

		ws.on('close', function (event)
		{
			console.log('Client disconnected');
			db.close();
		});

		//If the websocket throws an error, log the error
		ws.on('error', function (event)
		{
			console.log(event)
		});
	});
	wss.on('close', (ws) => 
	{
		console.log("Closing Server");
		db.close();
	});
}

//This I think gets specific files, but its not needed atm cause public dir is all included
/*app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});
app.get('/script.js', function(req, res){
    res.sendFile(__dirname + '/script.js');
});*/