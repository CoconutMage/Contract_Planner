let tableData = [];
let projectNameToRowID = {};
var numProjects = 0;

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
		ws.send('RequestTableProjectList');
	};

	ws.onmessage = function (event)
	{
		data = [];
		data = event.data;

		tableData = JSON.parse(data);
		//console.log("Loading page: " + document.URL);
		generateTable();
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

	function addTable(tableName)
	{
		console.log(tableName);
		tableName = NumberToString(tableName);
		ws.send("AddTable " + tableName);
	}
	websocket.addTable = addTable;

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
		var wsMessage = "AddRowData" + projectName;
		ws.send(wsMessage);
	}
	websocket.addRowData = addRowData;

	function removeRowFromTable(rowId, tableName) 
	{
		var wsMessage = "RemoveRowFromTable" + rowId + ":" + tableName;
		ws.send(wsMessage);
	}
	websocket.removeRowFromTable = removeRowFromTable;

	function addRowToTable(tableName) 
	{
		var wsMessage = "AddRowToTable" + tableName;
		ws.send(wsMessage);
	}
	websocket.addRowToTable = addRowToTable;

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

function createProject()
{
	var projectName = document.getElementById('newProjectText').value;
	var processedProjectName = NumberToString(projectName).replaceAll(" ", "");

	if (processedProjectName in projectNameToRowID) return;
	projectNameToRowID[processedProjectName] = (i + 1);
	console.log("Project Name In: " + projectName.replaceAll(" ", "") + "Budget");
	
	websocket.addTable(projectName.replaceAll(" ", "") + "Budget");
	websocket.addRowData(projectName);
	//websocket.addRowToTable(projectName.replaceAll(" ", "") + "Budget");
	document.getElementById("ActiveList").innerHTML += getHtmlForProjectList(numProjects, projectName);
	numProjects += 1;
}
function removeTable(element, data)
{
	//websocket.removeRowData((document.getElementById('newProjectText').value.replaceAll(" ", "")));
	websocket.removeRowFromTable(projectNameToRowID[data], 'ProjectList');
	websocket.dropTable((data + "Budget"));
	document.getElementById(element).remove();
	numProjects -= 1;
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
				case 0: topDataHtml += getHtmlForProjectList(i, tableData[i].ProjectName);
					break;
				case 1: middleDataHtml += getHtmlForProjectList(i, tableData[i].ProjectName);
					break;
				case 2: bottomDataHtml += getHtmlForProjectList(i, tableData[i].ProjectName);
					break;
			}
			
			var processedProjectName = NumberToString(tableData[i].ProjectName).replaceAll(" ", "");
			projectNameToRowID[processedProjectName] = (i + 1);
			console.log("Project Name In: " + processedProjectName);

			numProjects += 1;
    	}
		top.innerHTML = topDataHtml;
    	middle.innerHTML = middleDataHtml;
		bottom.innerHTML = bottomDataHtml;
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

//This function is crap and doesnt work
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

//code for the collapsible thing
var coll = document.getElementsByClassName("collapsibleButton");

for (let i = 0; i < coll.length; i++)
{
	coll[i].addEventListener("click", function ()
	{
		//theres gotta be a better way to get the image from under a div then this but
		var imgElem = this.firstChild.nextElementSibling;
		this.classList.toggle("active");
		var content = this.nextElementSibling;
		if (content.style.display === "grid")
		{
			content.style.display = "none";
			imgElem.setAttribute("src", "images/dropDownArrowOpen.png");
			imgElem.classList.add("collapsibleArrowImageOpen");
			imgElem.classList.remove("collapsibleArrowImageClose");
		} 
		else
		{
			content.style.display = "grid";
			imgElem.setAttribute("src", "images/dropDownArrowClosed.png");
			imgElem.classList.remove("collapsibleArrowImageOpen");
			imgElem.classList.add("collapsibleArrowImageClose");
		}
	});
}

function getHtmlForProjectList(i, projectName)
{
	/*return `
		<div id="projectList" class="projectListing">
			<span>
				${tb[i].ProjectName}
			</span>
			<span input type="button" onclick="Bazanga()">
				Button
			</span>
		</div>`*/
	const newElement = document.createElement("div");
	newElement.id = ("project" + i);
	newElement.setAttribute("draggable", true);
	newElement.setAttribute("ondragstart", "drag(event)");
	newElement.setAttribute("class", "draggableProject");
	newElement.innerHTML = projectName;

	var infoButton = document.createElement('img');
	//infoButton.setAttribute("onclick", functionCall);
	infoButton.setAttribute("class", "projectInfoButton");
	infoButton.setAttribute("src", "images/infoIcon.png")
	//buttonTwo.innerHTML = "Delete Project";

	var button = document.createElement('button');
	button.setAttribute("onclick", "window.location.href='html/projectBudget.html'; sessionStorage.setItem('tableName','" + projectName + "');");
	button.setAttribute("class", "anybutton");
	button.innerHTML = "Budget";

	var removeProjectButton = document.createElement('img');
	//This project name is not currently the table which holds its budget
	var functionCall = "removeTable('" + newElement.id + "','" + NumberToString(projectName).replaceAll(" ", "") + "')";

	//How do I call function with arguement passed in *******************************************************
	//removeProjectButton.setAttribute("onclick", functionCall);
	removeProjectButton.setAttribute("onclick", functionCall);
	removeProjectButton.setAttribute("class", "removeProjectButton");
	removeProjectButton.setAttribute("src", "images/removeIcon.png")
	//removeProjectButton.innerHTML = "Delete Project";

	newElement.appendChild(infoButton);
	newElement.appendChild(button);
	newElement.appendChild(removeProjectButton);

	return newElement.outerHTML;
	//return `<div id=${tb[i].ProjectName} draggable="true" ondragstart="drag(event)" class="draggableProject">${tb[i].ProjectName}</div>`
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
	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");
	console.log(data);
	console.log(ev.target);
	console.log(ev.target.nextElementSibling);
	ev.target.nextElementSibling.appendChild(document.getElementById(data));
	//Change project status here
}