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
    {row: 0, test: "Test 0"},
		{row: 1, test: "Test 1"},
		{row: 2, test: "Test 2"},
		{row: 3, test: "Test 3"}
	];

function test()
{
	for (i = 0; i < tableData.length; i++)
	{
		//Adds html to the table with the id of "Bazinga" and then injects
		//the "database" data into the table
		document.getElementById("Bazinga").innerHTML += 
					`
					<tr>
							<td> 
								${tableData[i].row}
							</td>
							<td> 
								${tableData[i].test}
							</td>
					</tr>
					`;
	}
}