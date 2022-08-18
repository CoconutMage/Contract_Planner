var tableName = NumberToString(sessionStorage.getItem("tableName").replaceAll(" ", "")) + "Budget";

function Start()
{
	//String with table name here
	console.log(tableName);
	websocket();
}

function websocket()
{
	var HOST = location.origin.replace(/^http/, "ws");
	var ws = new WebSocket(HOST);

	//ws.addEventListener('open', () => {	});
	ws.onopen = function (event)
	{
		//ws.send('Bazinga');
		ws.send('RequestTable' + tableName + ":Budget");
	};

	ws.onmessage = function (event)
	{
		if (event.data.split('-:-')[1] == "Budget")
		{
			data = [];
			data = event.data.split('-:-')[0];

			console.log(data);
			tableData = JSON.parse(data);
			//tableGenTest();

			generateTable();
		}
		else
		{
			data = [];
			data = event.data.split('-:-')[0];

			console.log(data);
			splitData = JSON.parse(data);
			console.log(splitData);
			//splitTableGen();
		}
	};

	//const tableHead = document.getElementById('TableHead');
	const tableBody = document.getElementById('tableData');

	let isTableGenerated = false;
function generateTable() 
{
	let tableKeys = Object.keys(tableData[0]);
	let bazingaHtml = ``;
  	if (isTableGenerated == false) 
  	{
    	for (i = 0; i < tableData.length; i++) 
		{
			bazingaHtml += `<td>${tableData[tableKeys[i]]}</td>`
    	}
		//top.innerHTML = topDataHtml;
    	//middle.innerHTML = middleDataHtml;
		//bottom.innerHTML = bottomDataHtml;
		tableBody.innerHTML = bazingaHtml;
    	isTableGenerated = true;
  	} 
  	else 
  	{
    	isTableGenerated = false;
		//console.log("Bazinga");
		/*
    	document.getElementById("Bazinga").innerHTML = "<tr></tr>";
    	document.getElementById("Bazinga2").innerHTML = "<tr></tr>";
    	document.getElementById("Bazinga3").innerHTML = "<tr></tr>";
		*/
    	generateTable();
  	}

  //document.getElementById("Bazinga").innerHTML += '</tr>';
  //isTableGenerated = true;
}

	//CUSTOM FUNCTIONS
	function sendTable(arr) 
	{
		ws.send("TableData:" + tableName + "-:-" + arr);
	}
	websocket.sendTable = sendTable;

	function addRow() 
	{
		ws.send("Add Row");
	}
	websocket.addRow = addRow;

	function removeRow(rowid) 
	{
		console.log(rowid);
		ws.send("RemoveRow: " + rowid);
	}
	websocket.removeRow = removeRow;

	function dropTable(tableName)
	{
		ws.send("DropTable " + tableName);
	}
	websocket.dropTable = dropTable;

	//ERROR HANDLING AND DEBUGGING
	ws.onerror = function (event)
	{
		ws.send("ERROR " + event);
	};

	//////////////////////////////////////////////////////////
	//Added without Will

	function addRowData(projectName) 
	{
		var wsMessage = "AddLineItemWithName" + itemName;
		ws.send(wsMessage);
	}
	websocket.addRowData = addRowData;

	function removeRowFromTable(rowId, tableName) 
	{
		var wsMessage = "RemoveRowFromTable" + rowId + ":" + tableName;
		ws.send(wsMessage);
	}
	websocket.removeRowFromTable = removeRowFromTable;

	function addRowToTable(tableName, rowNumber) 
	{
		var wsMessage = "AddRowToTableBudget" + tableName + ":" + rowNumber;
		ws.send(wsMessage);
	}
	websocket.addRowToTable = addRowToTable;

	function addRowToTableWithValue(tableName, itemName, rowNumber)
	{
		var wsMessage = "AddRowToBudgetWithValue" + tableName + ":" + itemName + ":" + rowNumber;
		ws.send(wsMessage);
	}
	websocket.addRowToTableWithValue = addRowToTableWithValue;

	function addRowToSplit(tableName)
	{
		var wsMessage = "AddRowToSplit" + tableName;
		ws.send(wsMessage);
	}
	websocket.addRowToSplit = addRowToSplit;

	function sendMessageWithData(data)
	{
		ws.send(data);
	}
	websocket.sendMessageWithData = sendMessageWithData;

	function sendSubTable(subTable, arr) 
	{
		ws.send("SaveSubTable:" + subTable + "-:-" + arr);
	}
	websocket.sendSubTable = sendSubTable;
	//////////////////////////////////////////////////////////
}

function NumberToString(data)
{
	var convertedData = data

	convertedData = convertedData.replaceAll('0', 'Zero');
	convertedData = convertedData.replaceAll('1', 'One');
	convertedData = convertedData.replaceAll('2', 'Two');
	convertedData = convertedData.replaceAll('3', 'Three');
	convertedData = convertedData.replaceAll('4', 'Four');
	convertedData = convertedData.replaceAll('5', 'Five');
	convertedData = convertedData.replaceAll('6', 'Six');
	convertedData = convertedData.replaceAll('7', 'Seven');
	convertedData = convertedData.replaceAll('8', 'Eight');
	convertedData = convertedData.replaceAll('9', 'Nine');

	return convertedData;
}