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
	});

	//When the websocket opens do...
	wss.onopen = function () 
	{
		//...nothing, yet
	}	

	//If the websocket throws an error, log the error
	wss.on('error', function (event)
		{
			console.log(event)
		});
}

//Database shenanigans, I think I mostly know whats going on here
db.serialize(() => {

//const result = await db.get('SELECT col FROM tbl WHERE col = ?', 'test')
	
//db.run("INSERT INTO BudgetEstimate SET Item = Bazinga WHERE rowid = 1");

const result = await db.run('INSERT INTO tbl(col) VALUES (:col)', {
  ':col': 'something'
});

	

	//console.log(db.get("SELECT * FROM 'Budget Estimate' WHERE rowid = 0"));
	    db.each("SELECT rowid AS id, Item FROM 'Budget Estimate'", (err, row) => {
        console.log(row.id + ": " + row.Item);
				console.log(err);
			});
	
	/*
    db.run("CREATE TABLE lorem (info TEXT)");

    const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    for (let i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i);
    }
    stmt.finalize();
*
		db.run("UPDATE lorem SET rowid = 1 WHERE rowid = 11 ");
	
    db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
        console.log(row.id + ": " + row.info);
    });
*/
});

db.close();


//This I think gets specific files, but its not needed atm cause public dir is all included
/*app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});
app.get('/script.js', function(req, res){
    res.sendFile(__dirname + '/script.js');
});*/
