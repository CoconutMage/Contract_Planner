let tableData = [];
var saveImminent = false;
var tableName = NumberToString(sessionStorage.getItem("tableName").replaceAll(" ", "")) + "Budget";
const checkBoxVal = new Array(41);

function Start()
{
	//String with table name here
	console.log(tableName);
	for (let i = 0; i < checkBoxVal.length; i++)
	{
		checkBoxVal[i] = false;
	}
	websocket();
}

function checkBoxChanged(lineNum)
{
	//console.log(lineNum.replaceAll("lineItem", ""));
	lineNum = lineNum.replaceAll("bulkAddLineItem", "");
	checkBoxVal[parseInt(lineNum) - 1] = !checkBoxVal[parseInt(lineNum) - 1];
}

function websocket()
{
	var HOST = location.origin.replace(/^http/, "ws");
	var ws = new WebSocket(HOST);

	//ws.addEventListener('open', () => {	});
	ws.onopen = function (event)
	{
		//ws.send('Bazinga');
		ws.send('RequestTable' + tableName);
	};

	ws.onmessage = function (event)
	{
		data = [];
		data = event.data;

		tableData = JSON.parse(data);
		tableGenTest();
	
	};

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
		var wsMessage = "AddRowToTable" + tableName + ":" + rowNumber;
		ws.send(wsMessage);
	}
	websocket.addRowToTable = addRowToTable;

	function addRowToTableWithValue(tableName, itemName, rowNumber)
	{
		var wsMessage = "AddRowToTableWithValue" + tableName + ":" + itemName + ":" + rowNumber;
		ws.send(wsMessage);
	}
	websocket.addRowToTableWithValue = addRowToTableWithValue;

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

let hidden = true;
function toggle()
{
	bigOne = document.getElementById("TheBigOne");
	procTable = document.getElementById("procTableDiv");

	if(hidden == true)
	{
		bigOne.style.display = "none";
		procTable.style.display = 'block';
		hidden = false;
	}
	else
	{
		bigOne.style.display = "block";
		procTable.style.display = 'none';
		hidden = true;
	}
}

const tableHead = document.getElementById('tableHead');
const tableBody = document.getElementById('tableData');
//let tableKeys = Object.keys(tableData[0]);
let dataTableHead = '<tr>';
let dataHtml = '';
let rowNumber = 1;
function tableGenTest()
{
	//Clean up and combine some of this code to generate table elements so im not having to edit in multiple places
	let tableKeys = Object.keys(tableData[0]);
	for (i = 0; i < tableKeys.length; i++) 
	{
		dataTableHead += 
		`<th id = "tableKey">${tableKeys[i]}</th>`
	}
	dataTableHead += 
	`<th>
		<button type="button" class="anyButton" onclick="addLineItem()">
			Add line item
		</button>
		<button type="button" class="anyButton" onclick="saveTable()">
			Save table
		</button>
	</th>`;
	tableHead.innerHTML = dataTableHead;

	for (data of tableData)
	{
		addLineItem("x", data);
		/*
		dataHtml += `<tr id = "tableRow_${rowNumber}">`;
		for (i = 0; i < tableKeys.length; i++)
		{
			var cellID = tableKeys[i] + "" + i;
			dataHtml +=
			`<td id = ${cellID} contenteditable="true" oninput="tableSaveTimer()">
				${data[tableKeys[i]]}
			</td>`
			`<td id = "td"" contenteditable="true" style="text-align:center" oninput="tableSaveTimer()">
				${data[tableKeys[i]]}
			</td>`
		}
		dataHtml += `<td><button type="button" class="anyButton" onclick="removeLineItem(this)">Remove line item</button> <button type="button" class="anyButton" onclick="removeLineItem(this)">Change</button></td></tr>`;
		rowNumber += 1;*/
	}
	//tableBody.innerHTML = dataHtml;
}

function removeLineItem(element)
{
	elementToRemove = element.parentNode.parentNode;

	console.log(element.parentNode.parentNode.id.replace("tableRow_", ""));
	//console.log(elementToRemove);
	websocket.removeRowFromTable(elementToRemove.id.replace("tableRow_", ""), tableName);
	elementToRemove.remove();
}

function addLineItem(itemName = "Item Name", data = null)
{
	let tableKeys = Object.keys(tableData[0]);
	dataHtml += `<tr id = "tableRow_${rowNumber}">`;
	for (i = 0; i < tableKeys.length; i++) 
	{
		var cellID = tableKeys[i] + "_" + i;
		if (data == null)
		{
			if (i == 0) keyName = rowNumber;
			else if(i != 1 && i != tableKeys.length - 1) keyName = 0;
			else if (i == 1) keyName = itemName;
			else if (i == tableKeys.length - 1) keyName = "";
		}
		else
		{
			keyName = data[tableKeys[i]];
		}

		if (i != 0) dataHtml += `<td id = ${cellID} contenteditable="true" style="text-align:center" oninput="tableSaveTimer()">${keyName}</td>`
		else dataHtml += `<td id = ${cellID} draggable="true" ondragstart="rowDragStart(event)" ondragover="allowDrop(event)" ondrop="rowDrop(event)" style="text-align:center" oninput="tableSaveTimer()">${keyName}</td>`
	}
	dataHtml += `<td><button type="button" class="anyButton" onclick="removeLineItem(this)">Remove line item</button> <button type="button" class="anyButton" onclick="removeLineItem(this)">Change</button></td></tr>`;
	rowNumber += 1;
	tableBody.innerHTML = dataHtml;
	
	if (itemName == "Item Name") websocket.addRowToTable(tableName, rowNumber);
	else websocket.addRowToTableWithValue(tableName, itemName, rowNumber);
}

function tableSaveTimer()
{
    var secondsBetweenAutosave = 3
    if (!saveImminent) setTimeout(function() {saveTable();}, secondsBetweenAutosave * 1000);
    saveImminent = true;
}

function saveTable()
{
    console.log("saving table");
    saveImminent = false;
	let keys = [];
	let values = [];
	let readKeys = document.querySelectorAll('[id=tableKey]');
	let readValues = document.querySelectorAll('[id=td]');
	let arr = new Array(readValues.length);

	for(i = 0; i < readKeys.length; i++)
	{
		keys[i] = readKeys[i].textContent;
		console.log("kEYS: " + keys[i]);
	}
	for(i = 0; i < readValues.length; i++)
	{
		values[i] = (readValues[i].textContent).replace(/(\n|\t)/gm, "");//((readValues[i].textContent.split("\n")[1]).split("\t"))[4];
		console.log(values[i]);
    }
	
	for (let i = 0, ii = 0; i < arr.length; i++, ii++) 
	{
		arr[i] = {[keys[ii%keys.length]] : values[i]};
		//console.log(JSON.stringify(arr[i]));
	}
	console.log(JSON.stringify(arr));
	//send
	websocket.sendTable(JSON.stringify(arr));
}

function projectStatusChanger()
{
	//The database deals in an array that represents a dictionary
	//This simple function to change project status is something like BigO(n^2) or something super inefficient
	let keys = [];
	let values = [];
	let readKeys = document.querySelectorAll('[id=tableKey]');
	let readValues = document.querySelectorAll('[id=td]');
	let arr = new Array(readValues.length);

	for(i = 0; i < readKeys.length; i++)
	{
		keys[i] = readKeys[i].textContent;
		//console.log(keys[i]);
	}
	for(i = 0; i < readValues.length; i++)
	{
		values[i] = readValues[i].textContent;
		//console.log(values[i]);
	}
	
	for (let i = 0, ii = 0; i < arr.length; i++, ii++) 
	{
		if(ii == 5)
		{
			ii = 0;
		}
		arr[i] = {[keys[ii]] : values[i]};
		console.log(JSON.stringify(arr[i]));
	}
	//let tableKeys = Object.keys(tableData[0]);
	for (i = 2; i < tableData.length; i++) 
	{
		dataTableHead += 
		`<th id = "tableKey">${tableKeys[i]}</th>`
	}

	websocket.sendTable(JSON.stringify(arr));
}

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function myFunction()
{
	document.getElementById("bulkAddDropdown").classList.toggle("show");
}
  
  // Close the dropdown menu if the user clicks outside of it
window.onclick = function(event)
{
	//if (!event.target.matches('.dropbtn'))
	if (/*document.URL.includes("projectBudget") && */!document.getElementById('bulkAddDropdown').contains(event.target) && !event.target.matches('.dropbtn'))
	{
		var dropdowns = document.getElementsByClassName("dropdown-content");
		var i;
		for (i = 0; i < dropdowns.length; i++)
		{
			var openDropdown = dropdowns[i];
			if (openDropdown.classList.contains('show'))
			{
				openDropdown.classList.remove('show');
			}
		}
	}
}
function allowDrop(ev)
{
	ev.preventDefault();
}
function rowDragStart(ev)
{
	console.log(ev.target);
	ev.dataTransfer.setData("rowDragging", ev.target.id);
}
function rowDrop(ev)
{
	console.log(ev.target);
	ev.preventDefault();
	var data = ev.dataTransfer.getData("rowDragging");
	//ev.target.nextElementSibling.appendChild(document.getElementById(data));
	//Change project status here
}
function BulkAddRows()
{
	for (j = 0; j < checkBoxVal.length; j++)
	{
		if(checkBoxVal[j])
		{
			console.log(("bulkAddLineItem" + (j + 1)));
			addLineItem(document.getElementById(("bulkAddLineItem" + (j + 1))).nextElementSibling.innerHTML);
			document.getElementById(("bulkAddLineItem" + (j + 1))).checked = false;
		}
		checkBoxVal[j] = false;
	}
}