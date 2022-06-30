function Start()
{
	websocket();
	generateTable();
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



//This is a giant mess, I need to clean it up, and find a better way to either emulate a database
//Or actually start using the database
//Beginnings of a table generator/injector

//Pretending to be a database
let tableData =
  [
    {row: 0, test: "Project 1", test2: "$400", test3 : "$200", test4: "4/16/22"},
		{row: 1, test: "Project 2", test2: "$6500", test3 : "$450", test4: "2/14/22"},
		{row: 2, test: "Project 3", test2: "$900", test3 : "$20", test4: "3/07/22"},
		{row: 3, test: "Project 4", test2: "$12,000", test3 : "$1490", test4: "10/28/21"}
	];

let isTableGenerated = false;
function generateTable()
{
	//document.getElementById("Bazinga").innerHTML = '<tr class = "tableRow">';
	
	if(isTableGenerated == false)
	{
		//Adds html to the table with the id of "Bazinga" and then injects
		//the "database" data into the table
		for (i = 0; i < tableData.length; i++)
		{
			document.getElementById("Bazinga").innerHTML +=
					`
					<tr class = "tableRow">
							<td id = "Bazinga"> 
								${tableData[i].row}
							</td>
							<td id = "Bazinga"> 
								${tableData[i].test}
							</td>
							<td id = "Bazinga"> 
								${tableData[i].test2}
							</td>
							<td id = "Bazinga"> 
								${tableData[i].test3}
							</td>
							<td id = "Bazinga"> 
								${tableData[i].test4}
							</td>
						</tr>
					`;
      document.getElementById("Bazinga2").innerHTML +=
					`
					<tr class = "tableRow">
							<td id = "Bazinga2"> 
								${tableData[i].row}
							</td>
							<td id = "Bazinga2"> 
								${tableData[i].test}
							</td>
							<td id = "Bazinga2"> 
								${tableData[i].test2}
							</td>
							<td id = "Bazinga2"> 
								${tableData[i].test3}
							</td>
							<td id = "Bazinga2"> 
								${tableData[i].test4}
							</td>
						</tr>
					`;
      document.getElementById("Bazinga3").innerHTML +=
					`
					<tr class = "tableRow">
							<td id = "Bazinga3"> 
								${tableData[i].row}
							</td>
							<td id = "Bazinga3"> 
								${tableData[i].test}
							</td>
							<td id = "Bazinga3"> 
								${tableData[i].test2}
							</td>
							<td id = "Bazinga3"> 
								${tableData[i].test3}
							</td>
							<td id = "Bazinga3"> 
								${tableData[i].test4}
							</td>
						</tr>
					`;
			isTableGenerated = true;
		}
	}
	else
	{
		isTableGenerated = false;
		document.getElementById("Bazinga").innerHTML = "<tr></tr>";
    document.getElementById("Bazinga2").innerHTML = "<tr></tr>";
    document.getElementById("Bazinga3").innerHTML = "<tr></tr>";
		generateTable();
	}
	
	//document.getElementById("Bazinga").innerHTML += '</tr>';
	//isTableGenerated = true;
}

function addTableRow()
{
	document.getElementById("Bazinga").innerHTML = "<tr></tr>";
	//I know this doesnt actually add or remove lines but 
	//delete tableData[4];
	tableData =
	[
		{row: 0, test: "Test 0", test2: "Bazinga", test3 : "Bazinga", test4: "Bazinga"},
		{row: 1, test: "Test 1", test2: "Bazinga", test3 : "Bazinga", test4: "Bazinga"},
		{row: 2, test: "Test 2", test2: "Bazinga", test3 : "Bazinga", test4: "Bazinga"},
		{row: 3, test: "Test 3", test2: "Bazinga", test3 : "Bazinga", test4: "Bazinga"},
		{row: 4, test: "Test 4", test2: "Bazinga", test3 : "Bazinga", test4: "Bazinga"},
	];
	isTableGenerated = false;
	generateTable();
}

//code for the collapsible thing
var coll = document.getElementsByClassName("collapsible");

for (let i = 0; i < coll.length; i++) 
{
	coll[i].addEventListener("click", function() 
	{
		this.classList.toggle("active");
		var content = this.nextElementSibling;
		if (content.style.display === "block") 
		{
			content.style.display = "none";
		} 
		else 
		{
			content.style.display = "block";
		}
	});
}

function websocket() 
{
	var HOST = location.origin.replace(/^http/, 'ws')
	var ws = new WebSocket(HOST);

	//ws.addEventListener('open', () => {	});
	ws.onopen = function(event) 
	{
		ws.send('Bazinga');
	}
	ws.onerror = function(event)
		{
			ws.send("ERROR " + event);
		}
}