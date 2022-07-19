let tableData = [];
var saveImminent = false;

function Start()
{
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
	};

	ws.onmessage = function (event)
	{
		data = [];
		data = event.data;

		tableData = JSON.parse(data);
		//console.log("Loading page: " + document.URL);
		if (document.URL.includes("projectBudget.html"))
		{
			//console.log("New Page");
			tableGenTest();
		}
		else generateTable();
	
	};

	//CUSTOM FUNCTIONS
	function sendTable(arr) 
	{
		ws.send("TableData: " + arr);
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

function Bazanga()
{
	console.log("Bazung");
}

function revealMessage()
{
	document.getElementById("hiddenMessage").style.display = 'block';
}
function countUp()
{
	var currentVal = parseInt(document.getElementById("counterText").innerHTML);
	var newVal = currentVal + 1;
	document.getElementById("counterText").innerHTML = newVal;
}
function countDown()
{
	var currentVal = parseInt(document.getElementById("counterText").innerHTML);
	var newVal = currentVal - 1;
	document.getElementById("counterText").innerHTML = newVal;
}

let isTableGenerated = false;
function generateTable() 
{
	let top = document.getElementById("ActiveList");
  	let middle = document.getElementById("ProposalList");
	let bottom = document.getElementById("CompletedList");
	let topDataHtml = "";
  	let middleDataHtml = "";
	let bottomDataHtml = "";

  	if (isTableGenerated == false) 
  	{
    	for (i = 0; i < tableData.length; i++) 
		{
			switch(tableData[i].ProjectStatus) 
			{
				case 0: topDataHtml += getHtml(i, tableData);
					break;
				case 1: middleDataHtml += getHtml(i, tableData);
					break;
				case 2: bottomDataHtml += getHtml(i, tableData);
					break;
			}
    	}
		top.innerHTML = topDataHtml;
    	middle.innerHTML = middleDataHtml;
		bottom.innerHTML = bottomDataHtml;
    	isTableGenerated = true;
  	} 
  	else 
  	{
    	isTableGenerated = false;
		console.log("Bazinga");
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

const tableHead = document.getElementById('tableHead');
const tableBody = document.getElementById('tableData');
//let tableKeys = Object.keys(tableData[0]);
let dataTableHead = '<tr>';
let dataHtml = '';
let rowNumber = 1;
function tableGenTest()
{
	let tableKeys = Object.keys(tableData[0]);
	for (i = 2; i < tableKeys.length; i++) 
	{
		dataTableHead += 
		`<th id = "tableKey">${tableKeys[i]}</th>`
	}
	dataTableHead += 
	`<th>
		<button type="button" onclick="addProject()">
			Add line item
		</button>
		<button type="button" onclick="saveTable()">
			Save table
		</button>
	</th>`;
	tableHead.innerHTML = dataTableHead;

	for (data of tableData)
	{
		dataHtml += `<tr id = "tableRow_${rowNumber}">`;
		for (i = 2; i < tableKeys.length; i++)
		{
			dataHtml +=
			`<td id = "td" contenteditable="true" oninput="tableSaveTimer()">
				${data[tableKeys[i]]}
			</td>`
		}
		dataHtml += `<td><button type="button" onclick="removeProject(this)">Remove line item</button></td></tr>`;
		rowNumber += 1;
	}
	tableBody.innerHTML = dataHtml;
}

function removeProject(element)
{
	elementToRemove = element.parentNode.parentNode;

	console.log(element.parentNode.parentNode.id.replace("tableRow_", ""));
	//console.log(elementToRemove);
	websocket.removeRow(elementToRemove.id.replace("tableRow_", ""));
	elementToRemove.remove();
}

function addProject()
{
	let tableKeys = Object.keys(tableData[0]);
	dataHtml += `<tr id = "tableRow_${rowNumber}">`;
	rowNumber += 1;
	let keyName = "Item Name";
	for (i = 2; i < tableKeys.length; i++) 
	{
		if(i >=3) keyName = 0;
		dataHtml += `<td id = "td" contenteditable="true" oninput="tableSaveTimer()">${keyName}</td>`
	}
	dataHtml += `<td>
					<button type="button" onclick="removeProject(this)">
						Remove Project
					</button>
				</td>
			</tr>`;
	tableBody.innerHTML = dataHtml;
	
	websocket.addRow();
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
		//console.log("kEYS: " + keys[i]);
	}
	for(i = 0; i < readValues.length; i++)
	{
		values[i] = (readValues[i].textContent).replace(/(\n|\t)/gm, "");//((readValues[i].textContent.split("\n")[1]).split("\t"))[4];
		//console.log(values[i]);
    }
	
	for (let i = 0, ii = 0; i < arr.length; i++, ii++) 
	{
		if(ii == 5)
		{
			ii = 0;
		}
		arr[i] = {[keys[ii]] : values[i]};
		//console.log(JSON.stringify(arr[i]));
	}

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
function drag(ev)
{
	ev.dataTransfer.setData("text", ev.target.id);
}
function dropProject(ev)
{
	console.log(ev.target);
	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");
	ev.target.nextElementSibling.appendChild(document.getElementById(data));
	//Change project status here
}
function BulkAddRows()
{

}