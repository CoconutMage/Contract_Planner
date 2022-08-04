let tableData = [];
let splitData = [];
let changeOrders = [];
let paidCheckVals = [];
var saveImminent = false;
var tableName = NumberToString(sessionStorage.getItem("tableName").replaceAll(" ", "")) + "Budget";
var splitTableName = "";
const checkBoxVal = new Array(41);
var numChangeOrders = 0;
var splitRowNum = 0;

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
			tableGenTest();
		}
		else
		{
			data = [];
			data = event.data.split('-:-')[0];

			console.log(data);
			splitData = JSON.parse(data);
			console.log(splitData);
			splitTableGen();
		}
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
	//console.log(tableData);
	if (tableData.length == 0)
	{
		dataTableHead += 
	`<th>
		<button type="button" class="anyButton" onclick="addLineItem(null, true)">
			Add line item
		</button>
		<button type="button" class="anyButton" onclick="saveTable()">
			Save table
		</button>
	</th>`;
	tableHead.innerHTML = dataTableHead;
		return;
	}
	let tableKeys = Object.keys(tableData[0]);
	for (i = 0; i < tableKeys.length - 2; i++) 
	{
		dataTableHead += 
		`<th id = "tableKey">${tableKeys[i]}</th>`
	}
	dataTableHead += 
	`<th>
		<button type="button" class="anyButton" onclick="addLineItem(null, true)">
			Add line item
		</button>
		<button type="button" class="anyButton" onclick="saveTable()">
			Save table
		</button>
	</th>`;
	tableHead.innerHTML = dataTableHead;

	var i = 0;
	for (data of tableData)
	{
		if (i != 0 && !data["isChangeOrder"]) addLineItem(data, false);
		else if (data["isChangeOrder"])
		{
			changeOrders[numChangeOrders] = data;
			numChangeOrders += 1;
		}
		i++;
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
	console.log(changeOrders[0]);
	console.log(changeOrders[1]);
	//tableBody.innerHTML = dataHtml;
}

const splitTableHead = document.getElementById('splitTableHead');
const splitTableBody = document.getElementById('splitTableData');
let splitDataTableHead = '<tr>';
let splitDataHtml = '';

function splitTableGen()
{
	splitDataTableHead = '<tr>';
	splitDataHtml = '';
	if (splitData.length == 0)
	{
		splitDataTableHead += 
			`<th>
				<img src="../images/addIcon.png" class="addSubButton" onclick="addLineItemForSplit(null, true)"></button>
			</th>`;
		splitTableHead.innerHTML = splitDataTableHead;
		return;
	}

	let tableKeys = Object.keys(splitData[0]);
	for (i = 0; i < tableKeys.length; i++) 
	{
		splitDataTableHead += 
		`<th id = "splitTableKey">${tableKeys[i]}</th>`
	}
	splitDataTableHead += 
		`<th>
			<img src="../images/addIcon.png" class="addSubButton" onclick="addLineItemForSplit(null, true)"></button>
		</th>`;
	splitTableHead.innerHTML = splitDataTableHead;

	var i = 0;
	for (sData of splitData)
	{
		console.log(sData);
		if (i != 0) addLineItemForSplit(sData, false);
		i++;
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
}

function removeLineItem(element)
{
	elementToRemove = element.parentNode.parentNode;

	var rowIdToRemove = element.parentNode.parentNode.id.replace("tableRow_", "");
	removeSupportingTables(rowIdToRemove);
	elementToRemove.remove();
}

function removeSupportingTables(rowIdToRemove)
{
	var i = 0;

		console.log(tableData[rowIdToRemove]["Material Cost"]);
		console.log(tableData[rowIdToRemove]["Subcontractor Fee"]);
		websocket.dropTable(tableData[rowIdToRemove]["Material Cost"]);
		websocket.dropTable(tableData[rowIdToRemove]["Subcontractor Fee"]);

	websocket.removeRowFromTable(rowIdToRemove, tableName);
}

function addLineItem(data, isNew, itemName = "Item Name")
{
	let tableKeys = Object.keys(tableData[0]);
	dataHtml += `<tr id = "tableRow_${rowNumber}">`;
	for (i = 0; i < tableKeys.length - 2; i++) 
	{
		var cellID = tableKeys[i] + "_" + i;
		if (data == null)
		{
			console.log(tableName);
			if (i == 0) keyName = rowNumber;
			else if (i == 4)
			{
				keyName = (tableName + rowNumber + "SubSplit");
				if (tableData[rowNumber]) tableData[rowNumber]["Subcontractor Fee"] = keyName;
				else tableData[rowNumber] = {"Subcontractor Fee": keyName};
			}
			else if (i ==5)
			{
				keyName = (tableName + rowNumber + "MatSplit");
				if (tableData[rowNumber]) tableData[rowNumber]["Material Cost"] = keyName;
				else tableData[rowNumber] = {"Material Cost": keyName};
			}
			else if(i != 1 && i != tableKeys.length - 3) keyName = 0;
			else if (i == 1) keyName = itemName;
			else if (i == tableKeys.length - 3) keyName = "";
		}
		else
		{
			keyName = data[tableKeys[i]];
		}

		//if (i != 0) dataHtml += `<td id = ${cellID} contenteditable="true" style="text-align:center" oninput="tableSaveTimer()">${keyName}</td>`
		if (i == 0) dataHtml += `<td id = "td" draggable="true" ondragstart="rowDragStart(event)" ondragover="allowDrop(event)" ondrop="rowDrop(event)" style="text-align:center" oninput="tableSaveTimer()">${keyName}</td>`;
		else if (i == 4 || i ==5)
		{
			dataHtml += `<td id = "td" contenteditable="false" style="text-align:center" oninput="tableSaveTimer()">`;
			dataHtml += `  <button type="button" class="tableCellDropdown" onclick="displaySplit('${keyName}')"></button></td>`;
		}
		else dataHtml += `<td id = "td" contenteditable="true" style="text-align:center" oninput="tableSaveTimer()">${keyName}</td>`;
	}
	if (data != null && data["ChangeID"]) dataHtml += `<td><button type="button" class="anyButton" onclick="removeLineItem(this)">Remove line item</button> <button type="button" class="changeOrderButton" onclick="ViewChangeOrders('${rowNumber}', '${data["ChangeID"]}')">Change Order</button></td></tr>`;
	else dataHtml += `<td><button type="button" class="anyButton" onclick="removeLineItem(this)">Remove line item</button> <button type="button" class="changeOrderButton" onclick="ViewChangeOrders('${rowNumber}', '${numChangeOrders}')">Change Order</button></td></tr>`;
	tableBody.innerHTML = dataHtml;
	if(isNew)
	{
		if (itemName == "Item Name") websocket.addRowToTable(tableName, rowNumber);
		else websocket.addRowToTableWithValue(tableName, itemName, rowNumber);
	}
	rowNumber += 1;
}

function addLineItemForSplit(data, isNew, itemName = "Item Name")
{
	console.log("Adding Line Item Split");
	let tableKeys = Object.keys(splitData[0]);
	splitDataHtml += `<tr id = "tableRow_${splitRowNum}">`;
	for (i = 0; i < tableKeys.length; i++) 
	{
		var cellID = tableKeys[i] + "_" + i;
		if (data == null)
		{
			//else if(i != 1 && i != tableKeys.length - 1) keyName = 0;
			if (i == 1 || i == 3) keyName = "0";
			else keyName = "";
			//else if (i == tableKeys.length - 1) keyName = "";
		}
		else
		{
			keyName = data[tableKeys[i]];
		}

		//if (i != 0) dataHtml += `<td id = ${cellID} contenteditable="true" style="text-align:center" oninput="tableSaveTimer()">${keyName}</td>`
		if (i != 3) splitDataHtml += `<td id = "std" contenteditable="true" style="text-align:center" oninput="splitTableSaveTimer()">${keyName}</td>`;
		else
		{
			//splitDataHtml += `<td input="checkbox" id="split${rowNumber}Paid" name="split${rowNumber}Paid" value="" onchange="">`
			//splitDataHtml += `<td id="stdCheck"><input type="checkbox" id="split${rowNumber}Paid"name="split${rowNumber}Paid" value="" onchange="splitTableSaveTimer()"></td>`
			splitDataHtml += `<td id="splitPaid${splitRowNum}"><input type="checkbox" id="std" name="splitPaid${rowNumber}" value="" onchange="splitTableSaveTimer(); paidCheckChange(${splitRowNum});"></td>`
		}
		/*else if (i == 4 || i ==5)
		{
			splitDataHtml += `<td id = "td" contenteditable="false" style="text-align:center" oninput="tableSaveTimer()">  ${keyName}`;
			splitDataHtml += `  <button type="button" class="tableCellDropdown" onclick="displaySplit(${keyName})"></button></td>`;
		}
		else splitDataHtml += `<td id = "td" contenteditable="true" style="text-align:center" oninput="tableSaveTimer()">${keyName}</td>`;*/
	}
	//splitDataHtml += `<td><button type="button" class="anyButton" onclick="removeLineItem(this)">Remove line item</button> <button type="button" class="anyButton" onclick="removeLineItem(this)">Change</button></td></tr>`;
	splitTableBody.innerHTML = splitDataHtml;
	if(isNew)
	{
		websocket.addRowToSplit(splitTableName);
	}
	splitRowNum++;
}

function paidCheckChange(id)
{
	paidCheckVals[id] = !paidCheckVals[id];
}

function tableSaveTimer()
{
    var secondsBetweenAutosave = 1
    if (!saveImminent) setTimeout(function() {saveTable();}, secondsBetweenAutosave * 1000);
    saveImminent = true;
}

function splitTableSaveTimer()
{
    var secondsBetweenAutosave = 1
    if (!saveImminent) setTimeout(function() {saveSplitTable();}, secondsBetweenAutosave * 1000);
    saveImminent = true;
}

const changeOrderTableHead = document.getElementById('changeOrderTableHead');
const changeOrderTableBody = document.getElementById('changeOrderTableData');
let changeOrderDataTableHead = '<tr>';
let changeOrderDataHtml = '';
function ViewChangeOrders(data, changeId)
{
	changeOrderTableBody.innerHTML = "";
	GenChangeOrderTable();
	var left = 75;
	var top = 105 + (30 * parseInt(data.replace("SubSplit", "").replace("Mat", "").replace(`${tableName}`, "")));
	document.getElementById("changeOrderMenu").classList.toggle("show");
	document.getElementById("changeOrderMenu").style.setProperty("left", `${left}px`);
	document.getElementById("changeOrderMenu").style.setProperty("top", `${top}px`);

	for (i in changeOrders)
	{
		console.log("View Change Order: " + changeOrders[i]);
		if (changeOrders[i]["ChangeID"] == changeId) addChangeOrderLine(changeOrders[i]);
	}

	//splitTableName = data;
	//websocket.sendMessageWithData('RequestTable' + data + ":SubSplit");
}

function GenChangeOrderTable()
{
	changeOrderDataTableHead = '<tr>';
	changeOrderDataHtml = '';

	let tableKeys = Object.keys(tableData[0]);
	for (i = 2; i < tableKeys.length - 2; i++) 
	{
		changeOrderDataTableHead += 
		`<th id = "tableKey">${tableKeys[i]}</th>`
	}
	changeOrderDataTableHead += 
		`<th> <img src="../images/addIcon.png" class="addSubButton" onclick="console.log('Happ');"></button> </th>`;
		changeOrderTableHead.innerHTML = changeOrderDataTableHead;
}

function addChangeOrderLine(data)
{
	let tableKeys = Object.keys(tableData[0]);
	changeOrderDataHtml += `<tr id = "tableRow_${rowNumber}">`;
	for (i = 2; i < tableKeys.length - 2; i++) 
	{
		
		keyName = data[tableKeys[i]];

		//if (i != 0) dataHtml += `<td id = ${cellID} contenteditable="true" style="text-align:center" oninput="tableSaveTimer()">${keyName}</td>`
		if (i == 0) changeOrderDataHtml += `<td id = "td" draggable="true" ondragstart="rowDragStart(event)" ondragover="allowDrop(event)" ondrop="rowDrop(event)" style="text-align:center" oninput="tableSaveTimer()">${keyName}</td>`;
		else if (i == 4 || i ==5)
		{
			changeOrderDataHtml += `<td id = "td" contenteditable="false" style="text-align:center" oninput="tableSaveTimer()">`;
			changeOrderDataHtml += `  <button type="button" class="tableCellDropdown" onclick="displaySplit('${keyName}')"></button></td>`;
		}
		else changeOrderDataHtml += `<td id = "td" contenteditable="true" style="text-align:center" oninput="tableSaveTimer()">${keyName}</td>`;
	}
	changeOrderTableBody.innerHTML = changeOrderDataHtml;
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
		keys[i] = (readKeys[i].textContent).replace(" ", "");
		console.log("kEYS: " + keys[i]);
	}
	for(i = 0; i < readValues.length; i++)
	{
		values[i] = (readValues[i].textContent).replace(/(\n|\t)/gm, "");//((readValues[i].textContent.split("\n")[1]).split("\t"))[4];
		console.log(readValues[i].textContent);
    }
	values[3]
	
	for (let i = 0, ii = 0; i < arr.length; i++, ii++) 
	{
		arr[i] = {[keys[ii%keys.length]] : values[i]};
		//console.log(JSON.stringify(arr[i]));
	}
	console.log(JSON.stringify(arr));
	//send
	websocket.sendTable(JSON.stringify(arr));
}

function saveSplitTable()
{
    console.log("saving split table");
    saveImminent = false;
	
	let keys = [];
	let values = [];
	let readKeys = document.querySelectorAll('[id=splitTableKey]');
	let readValues = document.querySelectorAll('[id=std]');
	let arr = new Array(readValues.length);

	for(i = 0; i < readKeys.length; i++)
	{
		keys[i] = (readKeys[i].textContent).replace(" ", "");
		console.log("kEYS: " + keys[i]);
	}
	for(i = 0; i < readValues.length; i++)
	{
		if (readValues[i].nodeName == "TD") values[i] = (readValues[i].textContent).replace(/(\n|\t)/gm, "");//((readValues[i].textContent.split("\n")[1]).split("\t"))[4];
		else values[i] = paidCheckVals[readValues[i].parentElement.id.replace("splitPaid", "")];
		console.log(readValues[i].parentElement.id + " : " + values[i]);
    }
	
	for (let i = 0, ii = 0; i < arr.length; i++, ii++) 
	{
		arr[i] = {[keys[ii%keys.length]] : values[i]};
		//console.log(JSON.stringify(arr[i]));
	}
	console.log(JSON.stringify(arr));
	//send
	websocket.sendSubTable(splitTableName, JSON.stringify(arr));
}

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function myFunction()
{
	document.getElementById("bulkAddDropdown").classList.toggle("show");
}

function displaySplit(data)
{
	/*splitDataTableHead = '<tr>';
	splitDataHtml = '';*/
	splitTableBody.innerHTML = "";
	var left = 0;
	console.log(data);
	var top = 105 + (30 * parseInt(data.replace("SubSplit", "").replace("Mat", "").replace(`${tableName}`, "")));
	if (data.includes("Mat")) left = 385;
	else left = 230;
	document.getElementById("splitMenu").classList.toggle("show");
	document.getElementById("splitMenu").style.setProperty("left", `${left}px`);
	document.getElementById("splitMenu").style.setProperty("top", `${top}px`);
	splitTableName = data;
	websocket.sendMessageWithData('RequestTable' + data + ":SubSplit");
}
  
  // Close the dropdown menu if the user clicks outside of it
window.onclick = function(event)
{
	//if (!event.target.matches('.dropbtn'))
	if (!document.getElementById('bulkAddDropdown').contains(event.target) && !event.target.matches('.dropbtn'))
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
	if (!document.getElementById('splitMenu').contains(event.target) && !event.target.matches('.tableCellDropdown'))
	{
		var dropdowns = document.getElementsByClassName("splitMenuDropDown");
		var i;
		for (i = 0; i < dropdowns.length; i++)
		{
			var openDropdown = dropdowns[i];
			if (openDropdown.classList.contains('show'))
			{
				openDropdown.classList.remove('show');
				splitTableBody.innerHTML = "";
			}
		}
	}
	if (!document.getElementById('changeOrderMenu').contains(event.target) && !event.target.matches('.changeOrderButton'))
	{
		var dropdowns = document.getElementsByClassName("changeOrderMenuDropDown");
		var i;
		for (i = 0; i < dropdowns.length; i++)
		{
			var openDropdown = dropdowns[i];
			if (openDropdown.classList.contains('show'))
			{
				openDropdown.classList.remove('show');
				splitTableBody.innerHTML = "";
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
	console.log(ev.target.parentNode.id);
	ev.dataTransfer.setData("rowDragging", ev.target.parentNode.id);
}
function rowDrop(ev)
{
	console.log(ev.target.parentNode.id);
	ev.preventDefault();
	var data = ev.dataTransfer.getData("rowDragging");
	console.log(data);

	var rowHtml = ev.target.parentNode.innerHTML;
	var rowNum = document.getElementById(data).firstElementChild.innerHTML;
	var rowNumDropped = ev.target.innerHTML;
	var droppedRow = ev.target.parentNode;
	
	droppedRow.innerHTML = document.getElementById(data).innerHTML;
	droppedRow.firstElementChild.innerHTML = rowNumDropped;

	document.getElementById(data).innerHTML = rowHtml;
	//document.getElementById(data).firstElementChild.innerHTML = rowNum;
	//ev.target.innerHTML = document.getElementById(data).firstElementChild.innerHTML;
	console.log(document.getElementById(data).firstElementChild.innerHTML);
	console.log(rowNum);
	document.getElementById(data).firstElementChild.innerHTML = rowNum;

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
			addLineItem(null, true, (document.getElementById(("bulkAddLineItem" + (j + 1))).nextElementSibling.innerHTML).replace(" ", ""));
			document.getElementById(("bulkAddLineItem" + (j + 1))).checked = false;
		}
		checkBoxVal[j] = false;
	}
}