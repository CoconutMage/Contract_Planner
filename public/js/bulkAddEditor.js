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
		tableGenTest();
	
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