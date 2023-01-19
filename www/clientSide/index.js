//Global variables
var debugOn = false;
debugOn = true;

var debugLevel = 5;
var cy = cytoscape();
let selectedNode; //Holds the Node object which is selected by the user
let modal; //Holds the object to provide modal setup information and the Node object being built
//let graphSettings; //Holds the object to track graph settings between sessions
let sosmSystemData, sosmSystemInterfaceData, sosmNetworkData, sosmStats, sosmNetworkStats, sosmQuantities;
let issuesData = [];
let breadcrumbTracker = [];

const imagePath = './images/'
var hideNodes = false; //Tracks whether a click on a node should remove it from the graph

$(document).ready(function(){
	//graphSettings = new GraphSettings();

	//Load private constants, if they exist
	//if(typeof privateSeverityLabels !== 'undefined'){ const severityLabels = privateSeverityLabels}
	//if(typeof privateTechnologyCategory !== 'undefined'){ technologyCategory = privateTechnologyCategory}

	//Load graph settings, if none exist
	settings.forEach((element) => {
		if (element.type != 'heading'){
			if (!localStorage.getItem(element.id)) { localStorage.setItem(element.id, element.default)}
		}
	})

	debug(5, localStorage)

	pageSwitch();
  	selectedNode = new Node();
})

function addGraph(pageCleared)
{
	if ( pageCleared ){
		$('#mainPaneContainer').append(`<div class="row"><div class="col"><div id="cy" class="px-1 w-100"></div></div></div>`);
	}
}

//Load the appropriate main pane data
async function pageSwitch(page){
	debug(5,`In pageSwitch() with page:`)
	var currentPage = null;
	if (sessionStorage.getItem('currentPage') === null){
		currentPage = localStorage.getItem('defaultLandingPage');
	} else {
		currentPage = sessionStorage.getItem('currentPage');
	}

	if (!page){
		page = currentPage;
	}
	debug(5, page)

	var pageCleared = page != currentPage;
	if ( pageCleared )
	{
		$('#mainPaneContainer').empty();
	}

	switch (page){
		case 'specificSystem':
			displayTags('#tagsInfoContainer');
			addGraph(pageCleared);
			commonGraph({graph: page, id_system: sessionStorage.getItem('id_system')})
			break;	
		case 'standard':
			sessionStorage.setItem('currentPage', page);
			displayTags('#tagsInfoContainer');
			addGraph(pageCleared);
			commonGraph({graph: page})
			break;	
		case 'subsystems':
		case 'standardOrganisation':
			sessionStorage.setItem('currentPage', page);
			addGraph(pageCleared);
			commonGraph({graph: page})
		break;
		case 'summary':
			sessionStorage.setItem('currentPage', 'summary');
			$('#pageTitle').text(`SOS Model Summary ${parseInt(localStorage.getItem('activeYear'))}`)
			listSummary();
		break;
		case 'issues':
			sessionStorage.setItem('currentPage', 'issues');
			$('#pageTitle').text(`SOS Model Issues ${parseInt(localStorage.getItem('activeYear'))}`)
			listIssues();
		break;
		case 'charts':
			sessionStorage.setItem('currentPage', 'charts');
			$('#pageTitle').text(`Summary Charts`)
			charts();
		break;
		case 'pocs':
			sessionStorage.setItem('currentPage', 'pocs');
			$('#pageTitle').text(`System POCs`)
			pocs();
		break;

	}
}

async function listSummary(){
	debug(5,'In listSummary()')

	//Display the current filter tags
	displayTags('#mainPaneContainer');
	
	//Prepare the page
	var table = `<table class="table table-sm table-striped"><thead>
	<tr>
		<th scope="col">Interface Name</th>
		<th scope="col">Quantity of Interfaces</th>
		<th scope="col">Number of different system types</th>
		<th scope="col">Systems implementing the interface</th>
	</tr>
	</thead>
	<tbody>`

	await commonGraph({graph: 'standard', headless: true})
	await commonGraph({graph: 'summary', headless: true})

	debug(5, 'starting')
	debug(5, sosm)

	sosm.stats.interfaces.forEach((element) => {

		table += `<tr>
			<td scope="row"><a href="#" onclick="commonModal({modal: 'interfaces', id_interface: ${element.id_interface}});">${element.name}</a></td>
			<td class="">${element.totalInterfaces}</td>
			<td>${element.systemsCount}</td><td>`
		element.systems.forEach((element2) => {

			var name = '';
			if (element2.version === null || element2.version === ''){
				name = element2.name
			} else {
				name = element2.name + ` [${element2.version}]`
			}

			table += systemButton(element2.id_system, name)
		})	
		table += `</td></tr>`
	})

	table += `</tbody></table>`

	$('#mainPaneContainer').append(table);
}

async function listIssues(){
	debug(2, 'In listIssues()')

	displayTags('#mainPaneContainer');

	await commonGraph({graph: 'issues', headless: true})

	var severityText = '<h3>Severity Details</h3><ul>'

	severityLabels.forEach((element) => {
		severityText += `<li>${element.index} <strong>${element.label}</strong> ${element.description}</li>`
	})
	severityText += '</ul>'

	$('#mainPaneContainer').append(severityText);

	//Build the table
	var table = `<table class="table table-sm table-striped"><thead>
	<tr>
		<th scope="col" class="align-middle">Interface</th>
		<th scope="col" class="align-middle">Severity</th>
		<th scope="col" class="align-middle">Issue Title</th>
		<th scope="col" class="align-middle">Issue</th>
		<th scope="col" class="align-middle">Proposed Resolution</th>
		<th scope="col" class="align-middle">Qty Affected Interfaces</th>
		<th scope="col" class="align-middle">Affected Systems</th>
	</tr>
	</thead>
	<tbody>`

	sosm.issues.forEach((element) => {

		//Place the interface details into the table
		var rowspan = element.issues.length;
		if (rowspan == 0){ rowspan = 1 }

		table += `<tr><td rowspan="${rowspan}" class="align-middle"><a href="#" onclick="commonModal({modal: 'interfaces', id_interface: '${element.id_interface}'})">${element.name}</a></td>`

		//Handle no issues
		if (element.issues.length == 0){
			table += `<td colspan="6" class="text-center align-middle"><a href="#" onclick="commonModal({modal: 'interfaceIssues', id_interface: '${element.id_interface}'})">No issues recorded</a></td>`
		} else {
			element.issues.forEach((element2) => {
				//debug(5, element2)
				if (element2.severity >= parseInt(localStorage.getItem('severityLevel'))){
					table += `<td class="text-center">${element2.severity}</td>`
					table += `<td><a href="#" onclick="commonModal({modal: 'interfaceIssues', id_interface: ${element2.id_interface}, id_interfaceIssue: '${element2.id_interfaceIssue}'})">${element2.name}</td>`
					table += `<td>${element2.issue}</td>`
					table += `<td>${element2.resolution}</td>`
					if (element2.quantityAffected == 0) {
						table += `<td>Nil</td>`
					} else {
						table += `<td>${element2.quantityAffected}</td>`
					}
					
					table += `<td>`
					element2.systems.forEach((element3) => {
						var name = '';
						if (element3.version === null || element3.version === ''){
							name = element3.name
						} else {
							name = element3.name + ` [${element3.version}]`
						}


						table += systemButton(element3.id_system, name)
					})	
					table += `</td></tr>`
				} else {
					table += `<td colspan="6" class="text-center align-middle"><a href="#" onclick="commonModal({modal: 'interfaceIssues', id_interface: '${element.id_interface}'})">Issue below the set severity threshold</a></td></tr>`
				}
			})
			table += `</tr>`
		}
	})

	table += `</tbody></table>`
	$('#mainPaneContainer').append(table);
}

async function charts(){
	debug(2, 'In charts()')

	displayTags('#mainPaneContainer');

	

	//Prepare the page
	$('#mainPaneContainer').append(`<h3 class="my-2">Total Interfaces Per Year (${parseInt(localStorage.getItem('yearMin'))} - ${parseInt(localStorage.getItem('yearMax'))})</h3>`);
	$('#mainPaneContainer').append(`<div class="my-1"><canvas id="chartInterfaces" width="200" height="500"></canvas></div>`);

	$('#mainPaneContainer').append(`<h3 class="my-5">Issues Map ${parseInt(localStorage.getItem('activeYear'))}</h3>`);
	$('#mainPaneContainer').append(`<div><canvas id="chartIssues" width="200" height="500"></canvas></div>`);

	startYear = localStorage.getItem('yearMin');
	endYear = localStorage.getItem('yearMax');
	endYear++;
	//endYear = 2022
	var data = {}
	data.interfaces = []
	
	var labels = []
	var datasets = [];
	var colorIndex = 0;
	var interfacesSeen = [];

	await commonGraph({graph: 'reset', headless: true})

	for (var i = startYear; i < endYear; i++){
		await commonGraph({graph: 'chartInterfaces', headless: true, year: parseInt(i)})
	}

	await commonGraph({graph: 'chartInterfaces2', headless: true})

	var chartInterfaces = {
			type: 'line',
			data: { labels: sosm.charts.labels,	datasets: sosm.charts.datasets }
		}
		chartInterfaces.options = {
			maintainAspectRatio: false,
			scales: { y: { beginAtZero: true } },
			plugins: { legend: { position: 'bottom'}}
		}

	debug(5, 'chartInterface', chartInterfaces)

	const myChinterfaceChart = new Chart(document.getElementById('chartInterfaces').getContext('2d'), chartInterfaces)
	
	
	
	
	//Produce the issues chart
	issuesChartData = [];
	var issuesLabels = [];
	var colorIndex = 0;
	//issuesChartData = 

	await commonGraph({graph: 'issues', headless: true})

	sosm.issues.forEach((element) => { //Iterate through each interface
		//debug(5, element)
		issuesChartData.push({
			label: element.name,
			backgroundColor: getColor(colorIndex) + 'bb',
			data: []
		})

		//Color
		colorIndex++;

		//Produce graph data
		element.issues.forEach((element2) => { //Iterate through each issue within the interface
			//debug(5, element2)
			if (element2.severity > 0){
				issuesChartData[issuesChartData.length - 1].data.push({
					x: element2.quantityAffected,
					y: element2.systems.length,
					r: 20 * element2.severity,
					//Severity: element2.severity
				})						
			}
		})

	})
	
	debug(5, 'issuesLabels', issuesLabels)
	debug(5, 'data', issuesChartData)

	var chartIssues = {
		type: 'bubble',
		//data: issuesChartData
		data: { datasets: issuesChartData }
	}
	chartIssues.options = {
		maintainAspectRatio: false,
		//scales: { y: { beginAtZero: true } },
		scales: { 
			x: {title: {display: true, text: 'Quantity of Interfaces Affected'}},
			y: {title: {display: true, text: 'Quantity of Systems Affected'}}},
		plugins: { legend: { position: 'bottom'}}
	}
			
			
	const myIssueChart = new Chart(document.getElementById('chartIssues').getContext('2d'), chartIssues)
	
	
	
}


/**
 * @description A page to show the systems assigned to each POC, or those systems not assigned
 */
async function pocs(){
	debug(5, 'In pocs()')
	
	//Prepare the page

	//Build the table
	var table = `<table class="table table-sm table-striped"><thead>
	<tr>
		<th scope="col" class="align-middle">POC</th>
		<th scope="col" class="align-middle">Responsible Systems</th>
	</tr>
	</thead>
	<tbody><tr>`


	var postData = {
		type: 'Pocs'
	}

	await $.post('select.json', postData, (result) => {
		debug(5, postData, result);


		if (result.msg){
			//An error was passed
			//definition.message = {info: 'failure', msg: `There was an error. Check the console.`};
			//definition.continue = false;
		} else {

			var pocArr = []
			var lastPoc
			

			result[0].forEach((row) => {
				//Check if this row is assigned to the same person as the other
				if( row.id_poc === lastPoc ){
					//Just add the system
					pocArr[pocArr.length - 1].systems.push({systemName: row.systemName, version: row.version, id_system: row.id_system})

				} else {
					//Add a new row and the system
					pocArr.push({ id_poc: row.id_poc, pocName: row.pocName, systems: [ {systemName: row.systemName, version: row.version, id_system: row.id_system} ]})
					
				}

				lastPoc = row.id_poc
			})

			debug(5, pocArr)

			pocArr.forEach((row) => {
				table += `<tr><td><a href="#" onclick="">${row.pocName}</a></td><td>`
				row.systems.forEach((system) => {
					table += systemButton(system.id_system, `${system.systemName} [${system.version}]`)
				})
				table += `</td></tr>`
			})

			//Handle systems which are not allocated a POC
			table += `<tr><td>No POC Allocated</td><td>`
			result[1].forEach((row) => {
				table += systemButton(row.id_system, generateSystemName(row.systemName, row.version))
			})
			table += `</td></tr>`
			for (var i = 0; i<result[1].length; i++)  {



				/*
				if (lastPoc !== result[0][i].id_poc){
					//Handle a null
					debug(5, 'lastPoc is ' + lastPoc)
					if (result[i].id_poc === null){
						table += `<tr><td class="align-middle"><a href="#" >NULL</a></td><td>`
					} else {
						table += `<tr><td class="align-middle"><a href="#" onclick="commonModal({modal: 'interfaces', id_interface: '${result[i].id_poc}'})">${result[i].pocName}</a></td><td>`
					}

				} else {
					//Just add the system
					

				}
				lastPoc = result[i].id_poc

				/*

				table += `<tr><td rowspan="${rowspan}" class="align-middle"><a href="#" onclick="commonModal({modal: 'interfaces', id_interface: '${element.id_interface}'})">${element.name}</a></td>`

				table += `<td class="text-center">${element2.severity}</td>`
				table += `<td><a href="#" onclick="commonModal({modal: 'interfaceIssues', id_interface: ${element2.id_interface}, id_interfaceIssue: '${element2.id_interfaceIssue}'})">${element2.name}</td>`
				table += `<td>${element2.issue}</td>`
				table += `<td>${element2.resolution}</td>`
				if (element2.quantityAffected == 0) {
					table += `<td>Nil</td>`
				} else {
					table += `<td>${element2.quantityAffected}</td>`
				}
				
				table += `<td>`
				element2.systems.forEach((element3) => {
					var name = '';
					if (element3.version === null || element3.version === ''){
						name = element3.name
					} else {
						name = element3.name + ` [${element3.version}]`
					}


					table += systemButton(element3.id_system, name)
				})	
				table += `</td></tr>`
				table += `<td colspan="6" class="text-center align-middle"><a href="#" onclick="commonModal({modal: 'interfaceIssues', id_interface: '${element.id_interface}'})">Issue below the set severity threshold</a></td></tr>`
				table += `</tr>`
				*/

				
			}

			table += `</tbody></table>`
			$('#mainPaneContainer').append(table);
		}
	})
}



/*


async function charts(){
	debug(2, 'In charts()')

	displayTags('#mainPaneContainer');

	

	//Prepare the page
	$('#mainPaneContainer').append(`<h3 class="my-2">Total Interfaces Per Year (${parseInt(localStorage.getItem('yearMin'))} - ${parseInt(localStorage.getItem('yearMax'))})</h3>`);
	$('#mainPaneContainer').append(`<div class="my-1"><canvas id="chartInterfaces" width="200" height="500"></canvas></div>`);

	$('#mainPaneContainer').append(`<h3 class="my-5">Issues Map ${parseInt(localStorage.getItem('activeYear'))}</h3>`);
	$('#mainPaneContainer').append(`<div><canvas id="chartIssues" width="200" height="500"></canvas></div>`);

	
	
	startYear = localStorage.getItem('yearMin');
	endYear = localStorage.getItem('yearMax');
	endYear++;
	var data = {}
	data.interfaces = []
	
	var labels = []
	var datasets = [];
	var colorIndex = 0;
	var interfacesSeen = [];


	

	//Get chart data for each year
	for (var i = startYear; i < endYear; i++){
		labels.push(i)
		

		//await commonGraph({graph: 'chartInterfaces', headless: true, year: i})

		postData = {
			type: 'InterfaceQuantitiesInYear',
			year: i,
		}

		postData.includedFilterTag = JSON.parse(localStorage.getItem('includedFilterTag'))
		postData.excludedFilterTag = JSON.parse(localStorage.getItem('excludedFilterTag'))

		debug(5, `Sending '${postData.type}' to the server (chart.json):`)
		await $.post("chart.json", postData, (result) => {
			//debug(5, postData, result);

			if (result.msg){
				//An error was passed
				debug(5, 'error', result.msg)
				//updateSystemLinksModal(id_system,{info: 'failure', msg: `There was an error. Check the console.`}, id_ISMap);
			} else {
				//Interface data
				data.interfaces.push({x: i})
				result.forEach((element) => {
					data.interfaces[data.interfaces.length-1][element.name] = element.interfaceQty;
					interfacesSeen.push(element.id_interface);
				})
			}
		});
	}

	//Prune excess results from interfacesSeen
	
	interfacesSeen.sort();
	
	debug(5, 'interfacesSeen before', interfacesSeen)
	var tempArr = [interfacesSeen[0]];
	for (var i=0; i<interfacesSeen.length; i++){
		if (tempArr[tempArr.length - 1] != interfacesSeen[i]){
			tempArr.push(interfacesSeen[i]);
		}
	}
	interfacesSeen = tempArr;
	
	

	//Produce the interface chart
	var postData2 = {
		type: 'AllInterfaces',
	}
	debug(5, `Sending '${postData2.type}' to the server (select.json):`)
	$.post("select.json", postData2, (result) => {
		debug(5, 'interface chart', postData2, result);

		if (result.msg){
			//An error was passed
			debug(5, 'error', result.msg)
		} else {
			debug(5, 'fafddsf')
			result.forEach((element) => {
				if (interfacesSeen.includes(element.id_interface)){
					datasets.push({
						label: element.name,
						data: data.interfaces,
						borderColor: getColor(colorIndex),
						parsing: { yAxisKey: element.name }
					})	
					colorIndex++;					
				}
			})
		}

		var chartInterfaces = {
			type: 'line',
			data: { labels: labels,	datasets: datasets }
		}
		chartInterfaces.options = {
			maintainAspectRatio: false,
			scales: { y: { beginAtZero: true } },
			plugins: { legend: { position: 'bottom'}}
		}
		const myChinterfaceChart = new Chart(document.getElementById('chartInterfaces').getContext('2d'), chartInterfaces)
		//debug(5,data)
	});

	//Produce the subsystems chart

	//Produce the issues chart
	issuesChartData = [];
	var issuesLabels = [];
	var colorIndex = 0;
	//issuesChartData = 

	await processIssues();

	//debug(5, 'issuesData', issuesData[0], issuesData[1])
	//debug(5, 'example chart data', datasets[0])

	issuesData.forEach((element) => { //Iterate through each interface
		//debug(5, element)
		issuesChartData.push({
			label: element.name,
			backgroundColor: getColor(colorIndex) + 'bb',
			data: []
		})

		//Color
		colorIndex++;

		//Produce graph data
		element.issues.forEach((element2) => { //Iterate through each issue within the interface
			//debug(5, element2)
			if (element2.severity > 0){
				issuesChartData[issuesChartData.length - 1].data.push({
					x: element2.quantityAffected,
					y: element2.systems.length,
					r: 20 * element2.severity,
					//Severity: element2.severity
				})						
			}
		})

	})
	
	debug(5, 'issuesLabels', issuesLabels)
	debug(5, 'data', issuesChartData)

	var chartIssues = {
		type: 'bubble',
		//data: issuesChartData
		data: { datasets: issuesChartData }
	}
	chartIssues.options = {
		maintainAspectRatio: false,
		//scales: { y: { beginAtZero: true } },
		scales: { 
			x: {title: {display: true, text: 'Quantity of Interfaces Affected'}},
			y: {title: {display: true, text: 'Quantity of Systems Affected'}}},
		plugins: { legend: { position: 'bottom'}}
	}
			
			
	const myIssueChart = new Chart(document.getElementById('chartIssues').getContext('2d'), chartIssues)
	
	
	
}


*/