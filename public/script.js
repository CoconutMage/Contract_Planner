let tableData = [];

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

	ws.onerror = function (event)
	{
		ws.send("ERROR " + event);
	};

	ws.onmessage = function (event)
	{
		data = [];
		data = event.data;

		tableData = JSON.parse(data);
		generateTable();
	};
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
	/*
	const tableBody = document.getElementById("bazingaTable2");
	//const tableHead = document.getElementById('tableHead');
	let dataHtml = "<tr>";
	//let dataTableHead = '<tr>';
	*/


	if (isTableGenerated == false)
	{
		//Adds html to the table with the id of "Bazinga" and then injects
		//the "database" data into the table
		for (i = 0; i < tableData.length; i++)
		{
			document.getElementById("Bazinga").innerHTML += `
					<tr class = "tableRow">
							<td id = "Bazinga"> 
								${tableData[i].Item}
							</td>
							<td id = "Bazinga"> 
								${tableData[i].Quantity}
							</td>
							<td id = "Bazinga"> 
								${tableData[i].Cost}
							</td>
							<td id = "Bazinga"> 
								${tableData[i].SubcontractorFee}
							</td>
							<td id = "Bazinga"> 
								${tableData[i].MaterialCost}
							</td>
						</tr>
					`;
			document.getElementById("Bazinga2").innerHTML += `
					<tr class = "tableRow">
							<td id = "Bazinga2"> 
								${tableData[i].Item}
							</td>
							<td id = "Bazinga2"> 
								${tableData[i].Quantity}
							</td>
							<td id = "Bazinga2"> 
								${tableData[i].Cost}
							</td>
							<td id = "Bazinga2"> 
								${tableData[i].SubcontractorFee}
							</td>
							<td id = "Bazinga2"> 
								${tableData[i].MaterialCost}
							</td>
						</tr>
					`;
			document.getElementById("Bazinga3").innerHTML += `
					<tr class = "tableRow">
							<td id = "Bazinga3"> 
								${tableData[i].Item}
							</td>
							<td id = "Bazinga3"> 
								${tableData[i].Quantity}
							</td>
							<td id = "Bazinga3"> 
								${tableData[i].Cost}
							</td>
							<td id = "Bazinga3"> 
								${tableData[i].SubcontractorFee}
							</td>
							<td id = "Bazinga3"> 
								${tableData[i].MaterialCost}
							</td>
						</tr>
					`;
			isTableGenerated = true;
		}
	} else
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

//code for the collapsible thing
var coll = document.getElementsByClassName("collapsible");

for (let i = 0; i < coll.length; i++)
{
	coll[i].addEventListener("click", function ()
	{
		this.classList.toggle("active");
		var content = this.nextElementSibling;
		if (content.style.display === "block")
		{
			content.style.display = "none";
		} else
		{
			content.style.display = "block";
		}
	});
}
