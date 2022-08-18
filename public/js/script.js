let tableData = [];
let projectPayments = [];
let projectNotes = [];
let projectCosts = [];
let projectPrices = [];
let removalTableData = [];
let projectNameToRowID = {};
var numProjects = 0;
var currentProjectDisplayed = "";
var saveImminent = false;

function Start()
{
	websocket();

	let userid = Date.now();
}

function websocket()
{
	var HOST = location.origin.replace(/^http/, "ws");
	var ws = new WebSocket(HOST);

	//ws.addEventListener('open', () => {	});
	ws.onopen = function (event)
	{
		//ws.send('Bazinga');
		ws.send('RequestTableProjectList' + ':ProhectListing');
		ws.send("USER_ID: " + userid);
	};

	ws.onmessage = function (event)
	{
		console.log(event.data);
		if (event.data.split('-:-')[1] == "Budget")
		{
			data = [];
			data = event.data.split('-:-')[0];

			console.log(data);
			removalTableData = JSON.parse(data);
			removeSupportingTables(removalTableData);
		}
		else
		{
			data = [];
			data = event.data.split('-:-')[0];

			tableData = JSON.parse(data);
			//console.log("Loading page: " + document.URL);
			generateTable();
		}
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

	function updateProjectStatus(tableName, status) 
	{
		var wsMessage = "UpdateProjectStatus:" + tableName + ":" + status;
		ws.send(wsMessage);
	}
	websocket.updateProjectStatus = updateProjectStatus;

	function updateProjectPayments(projectName, payment) 
	{
		var wsMessage = "UpdateProjectPayments:" + projectName + ":" + payment;
		ws.send(wsMessage);
	}
	websocket.updateProjectPayments = updateProjectPayments;

	function updateProjectName(projectName, newName) 
	{
		var wsMessage = "UpdateProjectName:" + projectName + ":" + newName;
		ws.send(wsMessage);
	}
	websocket.updateProjectName = updateProjectName;

	function updateProjectNotes(projectName, notes) 
	{
		var wsMessage = "UpdateProjectNotes:" + projectName + ":" + notes;
		ws.send(wsMessage);
	}
	websocket.updateProjectNotes = updateProjectNotes;

	function sendMessageWithData(data)
	{
		ws.send(data);
	}
	websocket.sendMessageWithData = sendMessageWithData;

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

function DisplayProjectInfo(projectName)
{
	currentProjectDisplayed = projectName;
	document.getElementsByClassName("projectOverview")[0].style.display = "grid";
	document.getElementById("projectOverViewHeader").innerHTML = "Project Overview: " + projectName;
	document.getElementById("paymentsText").innerHTML = "Payments Recieved: $" + projectPayments[projectName];
	document.getElementById("genPropButton").setAttribute("onclick", `GenerateProposal('${projectName}')`);
	document.getElementById("ProjectNotes").innerHTML = projectNotes[projectName];
	document.getElementById("projectPrice").innerHTML = "Total Price: $" +projectCosts[projectName];
	document.getElementById("projectCost").innerHTML = "Total Cost: $" +projectPrices[projectName];
}

function GenerateProposal(projectName)
{
	console.log('Generate: ' + projectName);
	window.location.href='html/projectProposal.html';
}

function createProject()
{
	var projectName = document.getElementById('newProjectText').value;
	var processedProjectName = NumberToString(projectName).replaceAll(" ", "");

	if (processedProjectName in projectNameToRowID || processedProjectName == "") return;
	projectNameToRowID[processedProjectName] = (numProjects + 1);
	console.log("Project Name In: " + projectName.replaceAll(" ", "") + "Budget");
	
	websocket.addTable(projectName.replaceAll(" ", "") + "Budget");
	websocket.addRowData(projectName);
	//websocket.addRowToTable(projectName.replaceAll(" ", "") + "Budget");
	document.getElementById("ActiveList").innerHTML += getHtmlForProjectList(numProjects, projectName);
	numProjects += 1;
}
var tableNameToRemove = '';
function removeTable(element, data)
{
	//websocket.removeRowData((document.getElementById('newProjectText').value.replaceAll(" ", "")));
	websocket.removeRowFromTable(projectNameToRowID[data], 'ProjectList');
	websocket.sendMessageWithData('RequestTable' + (data + "Budget:Budget"));
	tableNameToRemove = data;

	document.getElementById(element).remove();
	numProjects -= 1;
}

function removeSupportingTables(removalTableData)
{
	websocket.dropTable((tableNameToRemove + "Budget"));
	var i = 0;
	for (rmData of removalTableData)
	{
		console.log("Removing Support Table: " + rmData["Material Cost"]);
		if (i == 0)
		{
			i++;
			continue;
		}
		websocket.dropTable(rmData["Material Cost"]);
		websocket.dropTable(rmData["Subcontractor Fee"]);
	}
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
			console.log("Project Name In: " + tableData[i].Payments);

			if (tableData[i].Price) projectPrices[tableData[i].ProjectName] = tableData[i].Price;
			else projectPrices[tableData[i].ProjectName] = 0;

			if (tableData[i].Cost) projectCosts[tableData[i].ProjectName] = tableData[i].Cost;
			else projectCosts[tableData[i].ProjectName] = 0;

			if (tableData[i].Payments) projectPayments[tableData[i].ProjectName] = tableData[i].Payments;
			else projectPayments[tableData[i].ProjectName] = 0;

			if (tableData[i].Notes) projectNotes[tableData[i].ProjectName] = tableData[i].Notes;
			else projectNotes[tableData[i].ProjectName] = '';

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

//code for the collapsible thing
var coll = document.getElementsByClassName("collapsibleButton");

for (let i = 0; i < coll.length; i++)
{
	coll[i].addEventListener("click", function ()
	{
		//theres gotta be a better way to get the image from under a div then this but
		var imgElem = this.firstChild.nextElementSibling.nextElementSibling;
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
	//newElement.setAttribute("contentEditable", "true");
	//newElement.innerHTML = projectName;

	var elem = document.createElement("input");
	elem.setAttribute("type", "text");
	elem.setAttribute("value", `${projectName}`);
	elem.setAttribute("oninput", `updateProjectName('${projectName}')`)
	elem.setAttribute("id", `${projectName}`)

	var infoButton = document.createElement('img');
	//infoButton.setAttribute("onclick", functionCall);
	infoButton.setAttribute("class", "projectInfoButton");
	infoButton.setAttribute("src", "images/infoIcon.png")
	infoButton.setAttribute("onclick", `DisplayProjectInfo('${projectName}');`);
	//buttonTwo.innerHTML = "Delete Project";

	var button = document.createElement('button');
	button.setAttribute("onclick", `openProjectBudget('${projectName}');`);
	button.setAttribute("class", "anybutton");
	button.setAttribute("id", `displayBudget${projectName}`)
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

	newElement.appendChild(elem);
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
	console.log(ev.target.firstElementChild.innerHTML);
	console.log(document.getElementById(data).innerHTML.split('"')[0].split('<')[0]);
	if (ev.target.firstElementChild.innerHTML == 0) websocket.updateProjectStatus(document.getElementById(data).innerHTML.split('"')[0].split('<')[0], 0);
	else if (ev.target.firstElementChild.innerHTML == 1) websocket.updateProjectStatus(document.getElementById(data).innerHTML.split('"')[0].split('<')[0], 1);
	else if (ev.target.firstElementChild.innerHTML == 2) websocket.updateProjectStatus(document.getElementById(data).innerHTML.split('"')[0].split('<')[0], 2);
	ev.target.nextElementSibling.appendChild(document.getElementById(data));
	//Change project status here
}
function updateProjectName(oldProjectName)
{
	var secondsBetweenAutosave = 1
	document.getElementById(`displayBudget${oldProjectName}`).setAttribute("onclick", `openProjectBudget('${document.getElementById(oldProjectName).value}');`);
    if (!saveImminent) setTimeout(function() {websocket.updateProjectName(oldProjectName, document.getElementById(oldProjectName).value); saveImminent=false;}, secondsBetweenAutosave * 1000);
    saveImminent = true;
}
function openProjectBudget(tableName)
{
	window.location.href='html/projectBudget.html';
	sessionStorage.setItem('tableName',`${tableName}`);
}
function saveProjectNotes()
{
	var secondsBetweenAutosave = 1
    if (!saveImminent) setTimeout(function() {websocket.updateProjectNotes(currentProjectDisplayed, document.getElementById("ProjectNotes").value); saveImminent=false}, secondsBetweenAutosave * 1000);
    saveImminent = true;
}