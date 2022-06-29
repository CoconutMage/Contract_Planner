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


//Beginnings of a table generator/injector

//Pretending to be a database
let tableData =
  [
    {row: 0, test: "Test 0", test2: "Bazinga", test3 : "Bazinga", test4: "Bazinga"},
		{row: 1, test: "Test 1", test2: "Bazinga", test3 : "Bazinga", test4: "Bazinga"},
		{row: 2, test: "Test 2", test2: "Bazinga", test3 : "Bazinga", test4: "Bazinga"},
		{row: 3, test: "Test 3", test2: "Bazinga", test3 : "Bazinga", test4: "Bazinga"}
	];

let isTableGenerated = false;
function generateTable()
{
	for (i = 0; i < tableData.length; i++)
	{
		if(isTableGenerated == false)
		{
		//Adds html to the table with the id of "Bazinga" and then injects
		//the "database" data into the table
		document.getElementById("Bazinga").innerHTML +=
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
		}
	}
	isTableGenerated = true;
}

function addTableRow()
{
	tableData +=
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
