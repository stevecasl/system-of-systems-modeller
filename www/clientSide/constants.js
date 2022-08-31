/**
 * @description Objects to support graph production
 * 
 */
const graph = {
	reset: {
		title: 'Reset sosm object',
		iterations: [
			{
				//queryType: 'Systems',
				beforeServerInstructions: [
					{action: 'resetSosmObject'},
				],
				afterServerInstructions:[

				]			
			},
		],
	},

	standard: { //Node name prefix: g1
		title: 'Standard Graph',
		//Naming Convention
		//System Nodes: 					g1_node_system_<id_system>_<id_system>
		//Subsystem Nodes: 					g1_node_system_<id_system>_<id_system>
		//SystemInterface Nodes: 			g1_node_systemInterface_<id_SIMap>
		//Link Nodes: 						g1_node_link_<id_SINMap>
		//System-System Interface Edges: 	g1_edge_System_<id_system>_SystemInterface_<id_SIMap>
		//System-Link Edges: 				g1_edge_System_<id_system>_Link_<id_SINMap>
		//SystemInterface-Link Edges: 		g1_edge_SystemInterface_<id_SIMap>_Link_<id_network>


		iterations: [
			//Get and prepare the systems as nodes on the graph
			{
				beforeServerInstructions: [
					{action: 'resetSosmObject'},
					{action: 'toServer_fromLocalStorage_int', sourceName: 'activeYear', columnName: 'year'},
					{action: 'toServer_fromLocalStorage_arr', sourceName: 'includedFilterTag', columnName: 'includedFilterTag'},
					{action: 'toServer_fromLocalStorage_arr', sourceName: 'excludedFilterTag', columnName: 'excludedFilterTag'},
					{action: 'toServer_fromDefinition', definitionName: 'id_system', columnName: 'id_system'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'showInterfaces', sosmDisplayName: 'interfaces'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'showPrimaryLinks', sosmDisplayName: 'primaryLinks'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'showAlternateLinks', sosmDisplayName: 'alternateLinks'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'displaySubsystems', sosmDisplayName: 'compoundSystems'},
				],
				queryType: 'Systems', url: 'graph', 
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'systems',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_node_system_<0>_<1>', columnNames: ['id_system', 'id_system']},
							{action: 'fromResult', nodeName: 'id_system', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'System', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
							{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'category', constantName: 'systems', default: 'black'},
						],
						classes: ['image'],
						position: true,
					},
					{action: 'getDataFromResult', sosmName: 'id_system_arr', columnName: 'id_system'},
				],
			},

			//Get and prepare subsystems as nodes on the graph
			{
				beforeServerInstructions: [
					{action: 'toServer_fromSosmObject', sosmName: 'id_system_arr', columnName: 'id_system_arr'},
					{action: 'toServer_fromGraphConstant', columnName: 'startDepth', value: 1},
				],
				queryType: 'Subsystems', url: 'graph',
				afterServerInstructions:[ 
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'systems',
						conditions: [{type: 'checkLocalStorage', localStorageName: 'displaySubsystems'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_node_system_<0>_<1>', columnNames: ['topSystem', 'id_system']},
							{action: 'fromResult', nodeName: 'parent', format: 'g1_node_system_<0>_<1>', columnNames: ['topSystem', 'immediateParent']},
							{action: 'fromResult', nodeName: 'id_system', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'System', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
						],
						classes: ['square', 'centerLabel'],
						position: true,
					},
				]		
			},

			//Get and prepare System Interfaces as nodes on the graph, and their associated edges, if setting is enabled
			{
				beforeServerInstructions: [
					{action: 'toServer_fromSosmObject', sosmName: 'id_system_arr', columnName: 'id_system_arr'},
				],
				queryType: 'Interfaces', url: 'graph',
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'interfaces',
						conditions: [{type: 'checkLocalStorage', localStorageName: 'showInterfaces'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_node_systemInterface_<0>', columnNames: ['id_SIMap']},
							{action: 'fromResult', nodeName: 'id_interface', format: '<0>', columnNames: ['id_interface']},
							{action: 'fromResult', nodeName: 'id_SIMap', format: '<0>', columnNames: ['id_SIMap']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'SystemInterface', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
							{action: 'fromResult', nodeName: 'proposed', format: '<0>', columnNames: ['isProposed']},
							{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'category', constantName: 'interfaces', default: 'red'},
						],
						classes: ['small'],
						position: true
					},
					{action: 'nodeOrEdge', group: 'edges', sosmNodeName: 'edges',
						conditions: [{type: 'checkLocalStorage', localStorageName: 'showInterfaces'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_edge_System_<id_system>_SystemInterface_<0>', columnNames: ['id_SIMap']},
							{action: 'fromResult', nodeName: 'source', format: 'g1_node_system_<0>_<1>', columnNames: ['id_system','id_system']}, //System
							{action: 'fromResult', nodeName: 'target', format: 'g1_node_systemInterface_<0>', columnNames: ['id_SIMap']}, //SystemInterface
							{action: 'fromDefault', nodeName: 'lineColor', default: 'black'},
						],
						classes: []
					},

					{action: 'getDataFromResult', sosmName: 'id_SIMap_arr', columnName: 'id_SIMap'}
				]			
			},

			//Get and prepare Links as nodes on their graph, and their associated edges.
			{
				queryType: 'Links',
				beforeServerInstructions: [
					{action: 'toServer_fromSosmObject', sosmName: 'id_SIMap_arr', columnName: 'id_SIMap_arr'},
				],
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'links',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_node_link_<0>', columnNames: ['id_network']},
							{action: 'fromResult', nodeName: 'id_network', format: '<0>', columnNames: ['id_network']},
							{action: 'fromResult', nodeName: 'id_SIMap', format: '<0>', columnNames: ['id_SIMap']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'Link', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
							{action: 'fromResult', nodeName: 'proposed', format: '<0>', columnNames: ['isProposed']},
							{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'category', constantName: 'links', default: 'red'},
						],
						classes: ['network'],
						position: true,
					},
					//Draw edges from interfaces to links, if showInterfaces is true
					{action: 'nodeOrEdge', group: 'edges', sosmNodeName: 'edges', 
						conditions: [{type: 'checkLocalStorage', localStorageName: 'showInterfaces'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_edge_SystemInterface_<0>_Link_<1>', columnNames: ['id_SIMap','id_network']},
							{action: 'fromResult', nodeName: 'source', format: 'g1_node_systemInterface_<0>', columnNames: ['id_SIMap']}, //SystemInterface
							{action: 'fromResult', nodeName: 'target', format: 'g1_node_link_<0>', columnNames: ['id_network']}, //Link
							{action: 'fromResult', nodeName: 'id_network', format: '<0>', columnNames: ['id_network']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'technologyCategory', constantName: 'technology', default: 'red'},
							{action: 'fromResult', nodeName: 'linkCategory', format: '<0>', columnNames: ['linkCategory']},
						],
						classes: []
					},
					//Draw edges from systems to links, if showInterfaces is false
					{action: 'nodeOrEdge', group: 'edges', sosmNodeName: 'edges', 
						conditions: [{type: '!checkLocalStorage', localStorageName: 'showInterfaces'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_edge_System_<0>_Link_<1>', columnNames: ['id_system','id_network']},
							{action: 'fromResult', nodeName: 'source', format: 'g1_node_system_<0>_<1>', columnNames: ['id_system', 'id_system']}, //System
							{action: 'fromResult', nodeName: 'target', format: 'g1_node_link_<0>', columnNames: ['id_network']}, //Link
							{action: 'fromResult', nodeName: 'idNo', format: '<0>', columnNames: ['id_network']},
							{action: 'fromResult', nodeName: 'id_network', format: '<0>', columnNames: ['id_network']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'technologyCategory', constantName: 'technology', default: 'black'},
							{action: 'fromResult', nodeName: 'linkCategory', format: '<0>', columnNames: ['linkCategory']},
						],
						classes: []
					},
				],
			},
		]
	},

	standardOrganisation:{
		title: 'Standard Graph by Organisation',
		iterations: [
			//Get the organisational structure below the node provided at id_organisation
			{
				queryType: 'GetAllOrganisationalNodesBelow',
				beforeServerInstructions: [
					{action: 'resetSosmObject'},
					{action: 'toServer_fromLocalStorage_int', sourceName: 'currentOrganisation', columnName: 'id_organisation'},
				],
				afterServerInstructions:[
					{action: 'getDataFromResult', sosmName: 'id_organisation_arr', columnName: 'id_organisation'},
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'systems',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'node_o_<0>', columnNames: ['id_organisation']},
							{action: 'fromResult', nodeName: 'parent', format: 'node_o_<0>', columnNames: ['parent']},
							{action: 'fromResult', nodeName: 'idNo', format: '<0>', columnNames: ['id_organisation']},
							{action: 'fromResult', nodeName: 'id_organisation', format: '<0>', columnNames: ['id_organisation']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'Organisation', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
							//{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
							//{action: 'fromConstant', nodeName: 'lineColor', columnName: 'category', constantName: 'links', default: 'red'},
						],
						classes: ['square'],
						position: true,
					},
				]
			},

			//Get all the systems which are attacehd to the organisational nodes provided at id_organisation_arr
			{
				queryType: 'Systems_WithOrganisation',
				beforeServerInstructions: [
					{action: 'toServer_fromSosmObject', sosmName: 'id_organisation_arr', columnName: 'id_organisation_arr'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'showInterfaces', sosmDisplayName: 'interfaces'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'showPrimaryLinks', sosmDisplayName: 'primaryLinks'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'showAlternateLinks', sosmDisplayName: 'alternateLinks'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'displaySubsystems', sosmDisplayName: 'compoundSystems'},
				],
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'systems',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'node_os_<0>', columnNames: ['id_OSMap']},
							{action: 'fromResult', nodeName: 'parent', format: 'node_o_<0>', columnNames: ['id_organisation']},
							{action: 'fromResult', nodeName: 'idNo', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'id_system', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'System', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['systemName']},
							{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'category', constantName: 'systems', default: 'black'},
						],
						classes: [],
						position: true,
					},
					{action: 'getDataFromResult', sosmName: 'id_system_arr', columnName: 'id_system'},
				]			
			},
			
			//Get all subsystems, if enabled in settings
			{
				queryType: 'ChildrenSystems_WithOrganisation',
				beforeServerInstructions: [
					{action: 'toServer_fromSosmObject', sosmName: 'id_system_arr', columnName: 'id_system_arr'},
					{action: 'toServer_fromSosmObject', sosmName: 'id_organisation_arr', columnName: 'id_organisation_arr'},
					
				],
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'systems',
					conditions: [{type: 'checkLocalStorage', localStorageName: 'displaySubsystems'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'node_ss_<0>_<1>', columnNames: ['id_SMap','id_OSMap']},
							{action: 'fromResult', nodeName: 'parent', format: 'node_os_<0>', columnNames: ['id_OSMap']},
							{action: 'fromResult', nodeName: 'idNo', format: '<0>', columnNames: ['id_SMap']},
							{action: 'fromResult', nodeName: 'id_system', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'Subsystem', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
							{action: 'fromResult', nodeName: 'org', format: '<0>', columnNames: ['id_organisation']},
							//{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'category', constantName: 'systems', default: 'black'},
						],
						classes: ['square', 'centerLabel'],
						position: true,
					},
				]		
			},
		],
	},

	subsystems: { //Node name prefix: g2
		//Naming Convention
		//System Nodes: 					g2_node_system_<id_system>
		//Subsystem Nodes: 					g2_node_system_<id_system>
		//System-Subsystem Edges:			g2_edge_System_<id_system>_Subsystem_<id_SMap>
		//SystemInterface Nodes: 			g2_node_systemInterface_<id_SIMap>
		//Link Nodes: 						g2_node_link_<id_SINMap>
		//System-System Interface Edges: 	g2_edge_System_<id_system>_SystemInterface_<id_SIMap>
		//System-Link Edges: 				g2_edge_System_<id_system>_Link_<id_SINMap>
		//SystemInterface-Link Edges: 		g2_edge_SystemInterface_<id_SIMap>_Link_<id_network>
		title: 'Distributed Subsystem Graph',
		iterations: [

			//Place all primary systems in the given year
			{
				queryType: 'Systems',//'Systems',
				beforeServerInstructions: [
					{action: 'resetSosmObject'},
					{action: 'toServer_fromLocalStorage_int', sourceName: 'activeYear', columnName: 'year'},
				],
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'systems',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g2_node_system_<0>', columnNames: ['id_system']},
							//{action: 'fromResult', nodeName: 'idNo', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'id_system', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'System', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
							{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'category', constantName: 'systems', default: 'black'},
						],
						classes: ['small'],
						position: true,
					},
					{action: 'getDataFromResult', sosmName: 'id_system_arr', columnName: 'id_system'},
					{action: 'getDataFromResult', sosmName: 'id_system_arr!', columnName: 'id_system'},
				],		
			},

			//Place all distributed systems
			{
				queryType: 'AllDistributedSubsystems',
				beforeServerInstructions: [],
				afterServerInstructions:[

					//Place the distributed systems
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'systems',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g2_node_system_<0>', columnNames: ['id_system']},
							//{action: 'fromResult', nodeName: 'idNo', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'id_system', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'Subsystem', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
							{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
						],
						classes: [],
						position: true,
					},
				],
			},

			//Edges between systems and subsystems
			{
				queryType: 'SystemToSubsystems',
				beforeServerInstructions: [
					{action: 'toServer_fromSosmObject', sosmName: 'id_system_arr', columnName: 'id_system_arr'},
				],
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'edges', sosmNodeName: 'links',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g2_edge_System_Subsystem_<0>', columnNames: ['id_SMap']},
							{action: 'fromResult', nodeName: 'source', format: 'g2_node_system_<0>', columnNames: ['parent']},
							{action: 'fromResult', nodeName: 'target', format: 'g2_node_system_<0>', columnNames: ['child']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'technologyCategory', constantName: 'technology', default: 'black'},
							{action: 'fromResult', nodeName: 'linkCategory', format: '<0>', columnNames: ['linkCategory']},
						],
						classes: [],
						position: true,
					},
					{action: 'removeFromArr', sosmName: 'id_system_arr!', columnName: 'parent'},
				],
			},


			//Edges between distributed subsystems
			{
				queryType: 'DistributedSubsystemAssociations',
				beforeServerInstructions: [],
				afterServerInstructions:[
					//Links between distributed systems
					{action: 'nodeOrEdge', group: 'edges', sosmNodeName: 'links',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g2_edge_System_Subsystem_<0>', columnNames: ['id_SMap']},
							{action: 'fromResult', nodeName: 'source', format: 'g2_node_system_<0>', columnNames: ['parent']},
							{action: 'fromResult', nodeName: 'target', format: 'g2_node_system_<0>', columnNames: ['child']},
							{action: 'fromResult', nodeName: 'idNo', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'id_system', format: '<0>', columnNames: ['id_system']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'technologyCategory', constantName: 'technology', default: 'black'},
							{action: 'fromResult', nodeName: 'linkCategory', format: '<0>', columnNames: ['linkCategory']},
						],
						classes: [],
						position: true,
					},
				],
			},

			//For systems with no distributed systems, draw the network links between associated systems
			{
				queryType: 'LinksForAssociatedSystems',
				beforeServerInstructions: [
					{action: 'toServer_fromSosmObject', sosmName: 'id_system_arr!', columnName: 'id_system_arr!'},
					{action: 'toServer_fromGraphConstant', columnName: 'linkCategory', value: 'primary'},
				],
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'edges', sosmNodeName: 'links',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g2_edge_System_System_<0>_<1>', columnNames: ['id_AMap', 'id_network']},
							{action: 'fromResult', nodeName: 'source', format: 'g2_node_system_<0>', columnNames: ['source']},
							{action: 'fromResult', nodeName: 'target', format: 'g2_node_system_<0>', columnNames: ['destination']},
							{action: 'fromResult', nodeName: 'idNo', format: '<0>', columnNames: ['id_SINMap']},
							{action: 'fromResult', nodeName: 'id_SINMap', format: '<0>', columnNames: ['id_SINMap']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'technologyCategory', constantName: 'technology', default: 'black'},
							{action: 'fromResult', nodeName: 'linkCategory', format: '<0>', columnNames: ['linkCategory']},
						],
						classes: [],
						position: true,
					},
					
				],
			},	
		]
	},

	summary: {
		title: 'Standard Graph',
		iterations: [
			{
				queryType: 'QuantityOfInterfacesPerSystem',
				beforeServerInstructions: [
					{action: 'toServer_fromLocalStorage_int', sourceName: 'activeYear', columnName: 'year'},
					{action: 'toServer_fromSosmObject', sosmName: 'id_system_arr', columnName: 'id_system_arr'},
				],
				afterServerInstructions:[
					{action: 'buildSummaryObject_interfaces', },
				]			
			},
		]
	},

	issues: {
		title: 'Issues',
		iterations: [
			{
				queryType: 'Issues',
				beforeServerInstructions: [
					{action: 'resetSosmObject'},
					{action: 'toServer_fromLocalStorage_int', sourceName: 'activeYear', columnName: 'year'},
					{action: 'toServer_fromLocalStorage_arr', sourceName: 'includedFilterTag', columnName: 'includedFilterTag'},
					{action: 'toServer_fromLocalStorage_arr', sourceName: 'excludedFilterTag', columnName: 'excludedFilterTag'},
				],
				afterServerInstructions:[
					{action: 'buildIssuesObject'},
				]			
			},
		]
	},

	chartInterfaces: {
		title: 'chartInterfaces',
		iterations: [
			{
				queryType: 'InterfaceQuantitiesInYear',
				beforeServerInstructions: [
					//{action: 'resetSosmObject'},
					//{action: 'toServer_fromSosmObject', sosmName: 'id_system_arr', columnName: 'id_system_arr'},
					{action: 'toServer_fromDefinition', definitionName: 'year', columnName: 'year'},
					{action: 'toServer_fromLocalStorage_arr', sourceName: 'includedFilterTag', columnName: 'includedFilterTag'},
					{action: 'toServer_fromLocalStorage_arr', sourceName: 'excludedFilterTag', columnName: 'excludedFilterTag'},					
				],
				afterServerInstructions:[
					{action: 'buildInterfaceChartObject',},
				]			
			},
		]
	},

	chartInterfaces2: {
		title: 'chartInterfaces2',
		iterations: [
			{
				queryType: 'AllInterfaces',
				url: 'select',
				beforeServerInstructions: [				
				],
				afterServerInstructions:[
					{action: 'buildInterfaceChartObject_2',},
				]			
			},
		]
	},

	specificSystem: { //Node name prefix: g1
		title: 'Standard Graph',
		//Naming Convention
		//System Nodes: 					g1_node_system_<id_system>_<id_system>
		//Subsystem Nodes: 					g1_node_system_<id_system>_<id_system>
		//SystemInterface Nodes: 			g1_node_systemInterface_<id_SIMap>
		//Link Nodes: 						g1_node_link_<id_SINMap>
		//System-System Interface Edges: 	g1_edge_System_<id_system>_SystemInterface_<id_SIMap>
		//System-Link Edges: 				g1_edge_System_<id_system>_Link_<id_SINMap>
		//SystemInterface-Link Edges: 		g1_edge_SystemInterface_<id_SIMap>_Link_<id_network>


		iterations: [
			//Get and prepare the systems as nodes on the graph
			{
				beforeServerInstructions: [
					{action: 'resetSosmObject'},
					{action: 'toServer_fromLocalStorage_int', sourceName: 'activeYear', columnName: 'year'},
					{action: 'toServer_fromLocalStorage_arr', sourceName: 'includedFilterTag', columnName: 'includedFilterTag'},
					{action: 'toServer_fromLocalStorage_arr', sourceName: 'excludedFilterTag', columnName: 'excludedFilterTag'},
					{action: 'toServer_fromDefinition', definitionName: 'id_system', columnName: 'id_system'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'showInterfaces', sosmDisplayName: 'interfaces'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'showPrimaryLinks', sosmDisplayName: 'primaryLinks'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'showAlternateLinks', sosmDisplayName: 'alternateLinks'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'displaySubsystems', sosmDisplayName: 'compoundSystems'},
				],
				queryType: 'Systems', url: 'graph', 
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'systems',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_node_system_<0>_<1>', columnNames: ['id_system', 'id_system']},
							{action: 'fromResult', nodeName: 'id_system', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'System', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
							{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'category', constantName: 'systems', default: 'black'},
						],
						classes: ['image'],
						position: true,
					},
					{action: 'getDataFromResult', sosmName: 'id_system_arr', columnName: 'id_system'},
				],
			},

			//Get and prepare subsystems as nodes on the graph
			{
				beforeServerInstructions: [
					{action: 'toServer_fromSosmObject', sosmName: 'id_system_arr', columnName: 'id_system_arr'},
					{action: 'toServer_fromGraphConstant', columnName: 'startDepth', value: 1},
				],
				queryType: 'Subsystems', url: 'graph',
				afterServerInstructions:[ 
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'systems',
						conditions: [{type: 'checkLocalStorage', localStorageName: 'displaySubsystems'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_node_system_<0>_<1>', columnNames: ['topSystem', 'id_system']},
							{action: 'fromResult', nodeName: 'parent', format: 'g1_node_system_<0>_<1>', columnNames: ['topSystem', 'immediateParent']},
							{action: 'fromResult', nodeName: 'id_system', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'System', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
						],
						classes: ['square', 'centerLabel'],
						position: true,
					},
				]		
			},

			//Get and prepare System Interfaces as nodes on the graph, and their associated edges, if setting is enabled
			{
				beforeServerInstructions: [
					{action: 'toServer_fromSosmObject', sosmName: 'id_system_arr', columnName: 'id_system_arr'},
				],
				queryType: 'Interfaces', url: 'graph',
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'interfaces',
						conditions: [{type: 'checkLocalStorage', localStorageName: 'showInterfaces'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_node_systemInterface_<0>', columnNames: ['id_SIMap']},
							{action: 'fromResult', nodeName: 'id_interface', format: '<0>', columnNames: ['id_interface']},
							{action: 'fromResult', nodeName: 'id_SIMap', format: '<0>', columnNames: ['id_SIMap']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'SystemInterface', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
							{action: 'fromResult', nodeName: 'proposed', format: '<0>', columnNames: ['isProposed']},
							{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'category', constantName: 'interfaces', default: 'red'},
						],
						classes: ['small'],
						position: true
					},
					{action: 'nodeOrEdge', group: 'edges', sosmNodeName: 'edges',
						conditions: [{type: 'checkLocalStorage', localStorageName: 'showInterfaces'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_edge_System_<id_system>_SystemInterface_<0>', columnNames: ['id_SIMap']},
							{action: 'fromResult', nodeName: 'source', format: 'g1_node_system_<0>_<1>', columnNames: ['id_system','id_system']}, //System
							{action: 'fromResult', nodeName: 'target', format: 'g1_node_systemInterface_<0>', columnNames: ['id_SIMap']}, //SystemInterface
							{action: 'fromDefault', nodeName: 'lineColor', default: 'black'},
						],
						classes: []
					},

					{action: 'getDataFromResult', sosmName: 'id_SIMap_arr', columnName: 'id_SIMap'}
				]			
			},

			//Get and prepare Links as nodes on their graph, and their associated edges.
			{
				queryType: 'Links',
				beforeServerInstructions: [
					{action: 'toServer_fromSosmObject', sosmName: 'id_SIMap_arr', columnName: 'id_SIMap_arr'},
				],
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'links',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_node_link_<0>', columnNames: ['id_network']},
							{action: 'fromResult', nodeName: 'id_network', format: '<0>', columnNames: ['id_network']},
							{action: 'fromResult', nodeName: 'id_SIMap', format: '<0>', columnNames: ['id_SIMap']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'Link', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
							{action: 'fromResult', nodeName: 'proposed', format: '<0>', columnNames: ['isProposed']},
							{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'category', constantName: 'links', default: 'red'},
						],
						classes: ['network'],
						position: true,
					},
					//Draw edges from interfaces to links, if showInterfaces is true
					{action: 'nodeOrEdge', group: 'edges', sosmNodeName: 'edges', 
						conditions: [{type: 'checkLocalStorage', localStorageName: 'showInterfaces'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_edge_SystemInterface_<0>_Link_<1>', columnNames: ['id_SIMap','id_network']},
							{action: 'fromResult', nodeName: 'source', format: 'g1_node_systemInterface_<0>', columnNames: ['id_SIMap']}, //SystemInterface
							{action: 'fromResult', nodeName: 'target', format: 'g1_node_link_<0>', columnNames: ['id_network']}, //Link
							{action: 'fromResult', nodeName: 'id_network', format: '<0>', columnNames: ['id_network']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'technologyCategory', constantName: 'technology', default: 'black'},
							{action: 'fromResult', nodeName: 'linkCategory', format: '<0>', columnNames: ['linkCategory']},
						],
						classes: []
					},
					//Draw edges from systems to links, if showInterfaces is false
					{action: 'nodeOrEdge', group: 'edges', sosmNodeName: 'edges', 
						conditions: [{type: '!checkLocalStorage', localStorageName: 'showInterfaces'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_edge_System_<0>_Link_<1>', columnNames: ['id_system','id_network']},
							{action: 'fromResult', nodeName: 'source', format: 'g1_node_system_<0>_<1>', columnNames: ['id_system', 'id_system']}, //System
							{action: 'fromResult', nodeName: 'target', format: 'g1_node_link_<0>', columnNames: ['id_network']}, //Link
							{action: 'fromResult', nodeName: 'idNo', format: '<0>', columnNames: ['id_network']},
							{action: 'fromResult', nodeName: 'id_network', format: '<0>', columnNames: ['id_network']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'technologyCategory', constantName: 'technology', default: 'black'},
							{action: 'fromResult', nodeName: 'linkCategory', format: '<0>', columnNames: ['linkCategory']},
						],
						classes: []
					},
				],
			},
		]
	},
}



/**
 * @description Labels for the issue severity. Uncomment if privateConstants.js is not used
 * 
 */
/*
const severityLabels = [
	{index: 0, label: 'Information', description: 'Non-issue. For information only.'},
	{index: 1, label: 'Notice', description: 'For notice and tracking only.'},
	{index: 2, label: 'Warning', description: 'An issue that is isolated to a small subset of the overall system.'},
	{index: 3, label: 'Error', description: 'An issue that has a limited impact on the overall system.'},
	{index: 4, label: 'Critical', description: 'An issue that has a wide impact on the overall system.'},
	{index: 5, label: 'Alert', description: 'An issue that has a detrimental impact on the overall system.'},
	{index: 6, label: 'Emergency', description: 'An issue that renders the overall system inoperable.'},
];
*/

const graphTable = {
	System: [
		{ label: 'System Name', type: 'text', columnName: 'name' },
		{ label: 'Quantities', type: 'text', columnName: '' },
		{ label: 'Block Diagram', type: 'link', columnName: 'reference'},
		{ label: 'Description', type: 'text', columnName: 'description' },
		
	],
	SystemInterface: [
		{ label: 'Interface Name', type: 'text', columnName: 'interfaceName' },
		{ label: 'Installed In', type: 'text', columnName: 'systemName' },
		{ label: 'Description', type: 'text', columnName: 'description' },	
	],
	Link: [
		{ label: 'Link Name', type: 'text', columnName: 'name' },
		{ label: 'Description', type: 'text', columnName: 'description' },	
	],
}

//Cy styling objects
const cyStyle = [ // the stylesheet for the graph
	{ selector: 'node',
		style: {
			'width': '600px',
			'background-width': '591px',
			'height': '600px',
			'background-height': '591px',
			'background-color': 'white',
			'background-fit': 'none',
			'label': 'data(name)',
			//'border-color': 'black',
			'border-width': '15px',
			'font-size': '80px',
		}
	},
	{ selector: '[filename]',
		style: {
			'background-image': 'data(filename)',
		}
	},
	{ selector: 'node[lineColor]',
	style: {
		'border-color': 'data(lineColor)',
	}
	},
	{
		selector: 'edge[linkCategory = "alternate"]',
		style: {
			'line-style': 'dashed',
			'line-opacity': 0.8,
			'line-dash-pattern': [25,25],
		}
	},
	{
		selector: 'node[proposed = "1"]',
		style: {
			//'border-style': 'dashed',
			//'border-dash-pattern': [25,25],
			//'border-opacity': 0.5,
			'border-color': 'grey',
		}
	},

	{ selector: '.network',
		style: {
			'width': '300px',
			'background-width': '320px',
			'height': '300px',
			'background-height': '320px',
			'shape': 'round-octagon',
		}
	},
	// { selector: '.interface',
	// 	style: {
	// 		'width': '300px',
	// 		'background-width': '300px',
	// 		'height': '300px',
	// 		'background-height': '300px',
	// 		'border-color': 'black',
	// 	}
	// },

	{ selector: '.critical', style: { 'background-color': 'red' }},
	{ selector: '.warning', style: { 'background-color': '#ffcc00' }},
	{ selector: '.notice', style: { 'background-color': '#33cc33' }},

	{ selector: '.red', style: { 'line-color': 'red'}},
	{ selector: '.blue', style: { 'line-color': 'blue'}},
	{ selector: '.amber', style: { 'line-color': 'orange'}},

	{
		selector: 'edge',
		style: {
			'width': 15,
			'line-color': 'data(lineColor)',
			'curve-style': 'bezier',
		}
	},
	{
		selector: 'edge[name]',
		style: {
			'label': 'data(name)',
			'color': 'black',
			'text-border-color': 'green',
			'text-border-opacity': 1,
			'text-border-width': 2,		
			'text-background-padding': 1,
			'text-background-color': 'white',
			'text-background-opacity': 1,
		}
	},
	{
		selector: '.subordinateSystem',
		style: {
			'border-color': 'grey',
			'border-opacity': 0.5,

		}
	},
	{
		selector: '.class2',
		style: {
			'border-color': 'orange',
		}
	},
	{
		selector: '.class3',
		style: {
			'text-border-color': 'purple',
		}
	},
	{ selector: '.small',
		style: {
			'width': '300px',
			'background-width': '280px',
			'height': '300px',
			'background-height': '280px',
		}
	},
	{
		selector: '.square',
		style: {
			'shape': 'round-rectangle',
			'height': '200px',
		}
	},
	{
		selector: '.centerLabel',
		style: {
			'text-halign':'center',
			'text-valign':'center',
		}
	},
	// {
	// 	selector: '.proposed',
	// 	style: {
	// 		'line-style': 'dashed',
	// 		'line-color': 'grey',
	// 		'border-style': 'dashed',
	// 		'border-color': 'grey',
	// 	}
	// },

	// {
	// 	selector: '.dashed',
	// 	style: {
	// 		'line-style': 'dashed',
	// 		'line-opacity': 0.8,
	// 	}
	// },
];


function cyLayout(){
	var obj = {
		name: localStorage.getItem('graphLayoutName'),
		rows: localStorage.getItem('graphLayoutRows'),
		animate: localStorage.getItem('graphLayoutAnimate'),
		idealEdgeLength: 1000,
	}
	return obj
}

const colors = [//Cyclic array for chart colur selection
	'#b52626',
	//'#5e388f',
	'#b56726',
	'#1f911f',
	'#8f840c',
	'#f5ea7s',
	'#2b7f7f',
	'#d34747',
	'#39a939',
	'#8c2f88',
	'#d38647',
	'#176c6c',
	'#8f0c0c',
	'#075656',
	'#95ae25',
	'#8f480c',
	'#0a730a',
]

//var colorNames = ['red','green','blue','black','orange' ]


/**
 * @description Contains the categories for assigning colors to the various systems, interfaces and links (nodes and edges). Uncomment and
 * populate if these are not contained elsewhere. (i.e. privateConstants.js)
 *  
 */
/*

var categories = { //Must stay var to be found within the window object
	systems:[
		{title: 'Red', value: '', color: 'red'},
		{title: 'Green', value: '', color: 'green'},
		{title: 'Blue', value: '', color: 'blue'},
	],
	interfaces:[
		{title: 'Red', value: '', color: 'red'},
		{title: 'Green', value: '', color: 'green'},
		{title: 'Blue', value: '', color: 'blue'},
	],
	links:[
		{title: 'Red', value: '', color: 'red'},
		{title: 'Green', value: '', color: 'green'},
		{title: 'Blue', value: '', color: 'blue'},
	],
	technology: [ 
		{title: 'Red', value: '', color: 'red'},
		{title: 'Green', value: '', color: 'green'},
		{title: 'Blue', value: '', color: 'blue'},
	],
}
*/

const graphLayoutNames = ['cose', 'breadthfirst', 'circle', 'concentric', 'grid', 'random', 'fcose', 'preset'];
const defaultLandingPageOptions = ['standard', 'summary', 'issues'];

/**
 * @description Settings definition. All are stored in localStorage
 * 
 */
const settings = [
	{ type: 'heading', id: 'generalHeading', align: 'left', text: 'General Settings', noUpdate: true },
	{ type: 'select', id: 'defaultLandingPage', label: 'Default Landing Page', default: 'standard', options: defaultLandingPageOptions },
	{ type: 'checkbox', id: 'refreshOnUpdate', label: 'Redraw the graph on update', default: 0 },
	{ type: 'number', id: 'yearMin', label: 'Minimum Year', default: 2020},
	{ type: 'number', id: 'yearMax', label: 'Minimum Year', default: 2030},

	{ type: 'heading', align: 'left', text: 'Graph Settings', noUpdate: true },
	{ type: 'select', id: 'graphLayoutName', label: 'Graph Layout', default: 'cose', options: graphLayoutNames },
	{ type: 'checkbox', id: 'showInterfaces', label: 'Display Interface Nodes', default: 1 },
	{ type: 'checkbox', id: 'displaySubsystems', label: 'Display Subsystem Nodes', default: 0 },
	//{ type: 'checkbox', id: 'showIssues', label: 'Display issues on graph', default: 1 },
	//{ type: 'checkbox', id: 'pruneEdgeLinks', label: 'Prune links with only one interface', default: 0 },
	{ type: 'checkbox', id: 'showPrimaryLinks', label: 'Display Primary Links', default: 1 },
	{ type: 'checkbox', id: 'showAlternateLinks', label: 'Display Alternate Links', default: 1 },
	{ type: 'checkbox', id: 'snapToGrid', label: 'Snap To Grid', default: 1 },
	{ type: 'number', id: 'zoomSensitivity', label: 'Scroll Wheel Zoom Sensitivity', default: 1},
	
	{ type: 'heading', align: 'left', text: 'Issue Settings', noUpdate: true},
	{ type: 'number', id: 'severityLevel', label: 'Minimum Severity to display', default: 0 },
	{ type: 'null', id: 'graphLayoutRows', default: 5 },
	{ type: 'null', id: 'graphLayoutAnimate', default: 0 },
	{ type: 'null', id: 'includedFilterTag', default: [] },
	{ type: 'null', id: 'excludedFilterTag', default: [] },
	{ type: 'null', id: 'activeYear', default: 2022 },
	{ type: 'null', id: 'linksAsNodes', default: 0 },
]



/**
 * @description Object which holds the definition for all the modals
 * 
 * 
 */
const modals = {
	min: {
		title: 'Modal Title', //The title of the modal to display at the top of the modal
		formButtons: [ //The buttons to insert at the bottom of the modal
		{type: 'info', id: 'buttonNew', label: 'New Interface', initialState: 'unlock'},
		{type: 'delete', id: 'buttonDelete', label: 'Delete Interface', initialState: 'unlock'},
		{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
		{type: 'cancel', id: 'buttonCancel', label: 'Close', initialState: 'unlock'},
		{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ //The empty controls to insert in the modal

		],
		monitorChanges: [], //The ID of the controls to monitor for changes
		lockOnChange: [], //The ID of the controls to lock when editing an object
		unlockOnChange: [], //The ID of the controls to lock when editing an object
		iterations: [ //The objects to process in order to fetch information from the server and insert into the form controls
			{ //The first iteration of a query to the server
				type: '', //The type of select query to call (See req.body.type in select.js)
				definitionFields: [], //The params from definition that also need to be sent to the server to accompany the query
				continueOnUndefined: true, //If true, continue to send the request to the server if any of the definition fields is undefined
				instructions: [ //The actions to perform upon return of the query from the server
					{action: ''},
				],
			},
		],
		events: [
			{
				handlers: [{controlId: '', event: 'click'},], //The event type and control to add a handler to
				postType: '', //The type of update to send to the server, if required
				instructions: [ //Pre-server instructions
				],
				cleanup: [ //Post server instructions
				],
			},
		]
	},

	min_noComments: {
		title: 'Title',
		formButtons: [ 
			{type: 'info', id: 'buttonNew', label: 'New Interface', initialState: 'unlock'},
			{type: 'delete', id: 'buttonDelete', label: 'Delete Interface', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'cancel', id: 'buttonCancel', label: 'Close', initialState: 'unlock'},
			{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 

		],
		monitorChanges: [

		],
		lockOnChange: [],
		unlockOnChange: [], 
		iterations: [
			{ 
				type: '', 
				definitionFields: [], 
				continueOnUndefined: true,
				instructions: [ 
					{action: ''},
				],
			},
		],
		events: [
			{
				handlers: [{controlId: '', event: 'click'}, ],
				postType: '', 
				instructions: [
				],
				cleanup: [
				],
			},
		]
	},

	organisation: {
		title: 'Organisations',
		formButtons: [
			//{type: 'info', id: 'buttonMove', label: 'Move Node', initialState: 'unlock'},
			{type: 'info', id: 'buttonNew', label: 'New Node', initialState: 'unlock'},
			{type: 'delete', id: 'buttonDelete', label: 'Delete', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},	
		],
		formFields: [
			{ type: 'organisation', id: 'pathAbove', text: `Path to Current Organisational Node: `},
			{ type: 'organisation', id: 'currentNode', text: `Current Organisational Node: `},
			{ type: 'organisation', id: 'childNodes', text: `Child Subordinates Nodes: `},
			{ type: 'text', id: 'textName', label: 'Name'},
		],
		
		monitorChanges: [//The controls to monitor for changes
			{id: 'mainModalName', on: 'input'},
		], 
		lockOnChange: ['buttonDelete', 'buttonMove', 'buttonNew', 'pathAbove button','currentNode button','childNodes button'], //The ID of the controls to lock when editing an object
		unlockOnChange: ['buttonUpdate'], //The ID of the controls to lock when editing an object
		iterations: [
			{
				type: 'Organisation',
				definitionFields: ['id_organisation'],
				continueOnUndefined: true,
				instructions: [
					{action: 'setDefinition_SingleValue_AtSpecificArrayIndex', id: 'id_organisation',  arrayIndex: 1, columnName: 'id_organisation'},
					{action: 'setDefinition_SingleValue_AtSpecificArrayIndexFirstIndex', id: 'parent', arrayIndex: 0, columnName: 'id_organisation'},
					{action: 'setControl_MultipleValues_AtSpecificArrayIndex', type: 'orgPath', id: 'pathAbove', modal: 'organisation', arrayIndex: 0, columnName: 'name'},
					{action: 'setControl_MultipleValues_AtSpecificArrayIndex', type: 'organisation', id: 'currentNode', modal: 'organisation', arrayIndex: 1, columnName: 'name'},
					{action: 'setControl_MultipleValues_AtSpecificArrayIndex', type: 'organisation', id: 'childNodes', modal: 'organisation', arrayIndex: 2, columnName: 'name'},
					{action: 'setControl_SingleValue_AtSpecificArrayIndexFirstIndex', type: 'text', id: 'textName', arrayIndex: 1, columnName: 'name'}
				],
			}
		],
		events: [
			{ //New organisation button clicked
				handlers: [{controlId: 'buttonNew', event: 'click'},],
				instructions: [
					{action: 'moveDefinitionValue', old: 'id_organisation', new: 'parent'},
					{action: 'emptyControl', type: 'text', id: 'textName'}
				],
				cleanup: [],
			},
			{ //Update the organisation with the server
				handlers: [{controlId: 'buttonUpdate', event: 'click'},],
				postType: 'Organisation',
				instructions: [
					{action: 'toServer_ControlValue', type: 'text', id: 'textName', columnName: 'name'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_organisation', columnName: 'id_organisation'},
					{action: 'toServer_DefinitionValue', definitionName: 'parent', columnName: 'parent'},
				],
				cleanup: [
					{action: 'setDefinition_FromResultInsert', definitionName: 'id_organisation'},
					{action: 'reload'},
				],
			},
			{ //Delete the current organisation
				handlers: [{controlId: 'buttonDelete', event: 'click'}, ],
				postType: 'DeleteOrganisation',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_organisation', columnName: 'id_organisation'},
					{action: 'moveDefinitionValue', old: 'parent', new: 'id_organisation'},
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Handle clicks to node buttons in pathAbove or childNodes
				handlers: [
					{controlId: 'pathAbove button', event: 'click'},
					{controlId: 'childNodes button', event: 'click'},
				],
				instructions: [{action: 'setDefinition_FromClickedButton', id: 'pathAbove', dataAttr: 'id_organisation', definitionName: 'id_organisation'},],
				cleanup: [{action: 'reload'},],
			},
		]
	},

	mapSystems: {
		title: 'Map Subsystems to Systems',
		formButtons: [
			{type: 'cancel', id: 'buttonCancel', label: 'Close', initialState: 'unlock'},
		],
		formFields: [
			{ type: 'select', id: 'parentSystem', label: 'Parent System'},
			{ type: 'img', id: 'imageSystem', columnName: 'image'},
			{ type: 'heading', id: 'headingSystemName', align: 'center'},
			{ type: 'droppable2', id: 'availableChildSystems', label: 'Available Subsystems'},
			{ type: 'droppable2', id: 'assignedChildSystems', label: 'Assigned Subsystems'},
		],
		monitorChanges: [//The controls to monitor for changes
			{id: 'assignedChildSystems', on: 'input'},
		], 
		lockOnChange: ['buttonDelete'], //The ID of the controls to lock when editing an object
		unlockOnChange: ['buttonUpdate'], //The ID of the controls to lock when editing an object
		
		iterations: [
			{ //Get the systems for the parent system select
				type: 'AllSystems',
				definitionFields: [],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'selectOptions', id: 'parentSystem', columnName: 'name', attr: {name: 'id_system', columnName: 'id_system'} },
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'parentSystem', definition: 'id_system', dataAttr: 'id_system', columnName: 'id_system'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'parentSystem', definition: 'id_system', dataAttr: 'id_system'},

				],
			},
			{ //Get the subsystems for the available subsystems box
				type: 'AllSubsystems',
				definitionFields: [],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'droppableElements', id: 'availableChildSystems', columnName: 'name', attr: {name: 'id_system', columnName: 'id_system'} },
					{action: 'removeElement', id: 'availableChildSystems span', dataAttr: 'id_system', definitionName: 'id_system' },
				],
			},
			{ //Get specific system details
				type: 'SingleSystem',
				definitionFields: ['id_system'],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_SingleValue', id: 'headingSystemName', type: 'heading', columnName: 'name'},
					{action: 'setControl_SingleValue', id: 'imageSystem', type: 'image', columnName: 'image'},
				]
			},

			{ //Get all the systems which may be children
				type: 'SystemChildren',
				definitionFields: ['id_system'],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'moveDroppableElements', sourceId: 'availableChildSystems', id: 'assignedChildSystems', columnName: 'name', attr: {name: 'id_system', columnName: 'child'} },
					{action: 'setControl_Focus', id: 'parentSystem'},
				],
			}
		],
		events: [
			{ //Changes to the parent system select
				handlers: [{controlId: 'parentSystem', event: 'change'},],
				instructions: [
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'parentSystem', definitionName: 'id_system', dataAttr: 'id_system'}
				],
				cleanup: [
					{action: 'reload'},
				],
			},

			{	//Handle elements being dropped
				handlers: [{controlId: 'assignedChildSystems div', event: 'drop'},],
				postType: 'UpdateChildSystemAssignments',
				instructions: [
					{action: 'preventDefault'},
					{action: 'handleDrop', id: 'assignedChildSystems div'},
					{action: 'toServer_ControlValue', type: 'dropTargetContents', id: 'assignedChildSystems', dataAttr: 'id_system', columnName: 'id_system_arr'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_system', columnName: 'id_system'},
				],
				cleanup: [
				],
			},
			{	//Handle elements being dropped
				handlers: [{controlId: 'availableChildSystems div', event: 'drop'},],
				postType: 'UpdateChildSystemAssignments',
				instructions: [
					{action: 'preventDefault'},
					{action: 'handleDrop', id: 'availableChildSystems div'},
					{action: 'toServer_ControlValue', type: 'dropTargetContents', id: 'assignedChildSystems', dataAttr: 'id_system', columnName: 'id_system_arr'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_system', columnName: 'id_system'},
				],
				cleanup: [
				],
			},


			{	//Handle elements being dragged
				handlers: [{controlId: 'availableChildSystems div', event: 'dragover'},],
				instructions: [{action: 'preventDefault'},],
				cleanup: [],
			},
			{	//Handle elements being dragged
				handlers: [{controlId: 'assignedChildSystems div', event: 'dragover'},],
				instructions: [{action: 'preventDefault'},],
				cleanup: [],
			},
			{ //Close the modal
				handlers: [{controlId: 'buttonCancel', event: 'click'},], 
				instructions: [],
				cleanup: [
					{action: 'returnToLastModal'},
				],
			},
		]
	},

	orgSystemMap: {
		title: 'Systems to Organisations',
		formButtons: [
			{type: 'delete', id: 'buttonDelete', label: 'Remove System', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},		
		],
		formFields: [
			{ type: 'organisation', id: 'pathAbove', text: `Path to Current Organisational Node: `},
			{ type: 'organisation', id: 'currentNode', text: `Current Organisational Node: `},
			{ type: 'organisation', id: 'childNodes', text: `Child Subordinates Nodes: `},
			{ type: 'select', id: 'selectSystem', label: 'Primary Systems'},
			{ type: 'button', id: 'buttonAssignSystem', label: '&#8595 Assign System &#8595', align: 'centre'},
			{ type: 'container', id: 'containerAssignedSystems' },
			{ type: 'note', text: 'Select a system to access additional details:'},
			{ type: 'number', id: 'numberQuantities', label: 'Quantity of Systems'},
		],
		monitorChanges: [//The controls to monitor for changes
			{id: 'numberQuantities', on: 'input'},
		], 
		lockOnChange: ['buttonDelete', 'pathAbove button','currentNode button','childNodes button', 'selectSystem', 'containerAssignedSystems button', 'buttonAssignSystem'], //The ID of the controls to lock when editing an object
		unlockOnChange: ['buttonUpdate'], //The ID of the controls to lock when editing an object
		
		iterations: [
			{ //Get the organisational structure
				type: 'Organisation',
				definitionFields: ['id_organisation'],
				continueOnUndefined: true,
				instructions: [
					{action: 'setDefinition_SingleValue_AtSpecificArrayIndex', id: 'id_organisation',  arrayIndex: 1, columnName: 'id_organisation'},
					{action: 'setDefinition_SingleValue_AtSpecificArrayIndexFirstIndex', id: 'parent', arrayIndex: 0, columnName: 'id_organisation'},
					{action: 'setControl_MultipleValues_AtSpecificArrayIndex', type: 'orgPath', id: 'pathAbove', modal: 'organisation', arrayIndex: 0, columnName: 'name'},
					{action: 'setControl_MultipleValues_AtSpecificArrayIndex', type: 'organisation', id: 'currentNode', modal: 'organisation', arrayIndex: 1, columnName: 'name'},
					{action: 'setControl_MultipleValues_AtSpecificArrayIndex', type: 'organisation', id: 'childNodes', modal: 'organisation', arrayIndex: 2, columnName: 'name'},
				],
			},
			{ //Get the systems which can be added to the organisational nodes
				type: 'PrimarySystems',
				definitionFields: [],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'selectOptions', id: 'selectSystem', columnName: 'name', attr: {name: 'id_system', columnName: 'id_system'} },
				],
			},
			{ //Get the systems which have been assigned to the current organisational node
				type: 'SystemsAssignedToOrg',
				definitionFields: ['id_organisation'],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'iconButton', id: 'containerAssignedSystems', columnName: 'name', attr: {name: 'id_OSMap', columnName: 'id_OSMap'}},
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'number', id: 'numberQuantities', definition: 'id_OSMap', columnName: 'quantity'},
					{action: 'setControl_SingleValue_fromDefinitionIfExists', type: 'iconButtonSelected', id: 'containerAssignedSystems', attrName: 'id_osmap', definitionName: 'id_OSMap'},
					
				],
			},
		],
		events: [
			{ 	//Update the systems allocated to each organisation node with the server
				handlers: [{controlId: 'buttonUpdate', event: 'click'},],
				postType: 'UpdateOrgSystemMap',
				instructions: [
					{action: 'toServer_ControlValue', type: 'number', id: 'numberQuantities', columnName: 'quantity'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_OSMap', columnName: 'id_OSMap'},
				],
				cleanup: [
					//{action: 'setDefinition_FromResultInsert', definitionName: 'id_organisation'},
					{action: 'reload'},
				],
			},
			{
				handlers: [{controlId: 'buttonAssignSystem', event: 'click'},],
				postType: 'AssignSystemToOrg',
				instructions: [
					{action: 'toServer_ControlValue', type: 'select', id: 'selectSystem', dataAttr: 'id_system', columnName: 'id_system'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_organisation', columnName: 'id_organisation'},
				],
				cleanup: [
					{action: 'reload'},
				],
			},			
			{ //Remove the current system from the current organisation
				handlers: [{controlId: 'buttonDelete', event: 'click'},],
				postType: 'DeleteSystemFromOrganisation',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_OSMap', columnName: 'id_OSMap'},
				],
				cleanup: [
					{action: 'deleteDefinition', definitionName: 'id_OSMap'},
					{action: 'reload'},
				],
			},
			{	//Handle clicks to node buttons in pathAbove
				handlers: [{controlId: 'pathAbove button', event: 'click'},],
				instructions: [
					{action: 'setDefinition_FromClickedButton', definitionName: 'id_organisation', dataAttr: 'id_organisation'},
			],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Handle clicks to node buttons in childNodes
				handlers: [{controlId: 'childNodes button', event: 'click'},],
				instructions: [
					{action: 'setDefinition_FromClickedButton', definitionName: 'id_organisation', dataAttr: 'id_organisation'},
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{ 	//Clicks on system buttons
				handlers: [{controlId: 'containerAssignedSystems button', event: 'click'},],
				postType: 'SystemsAssignedToOrgDetail',
				url: 'select',
				instructions: [
					{action: 'setDefinition_FromClickedButton', definitionName: 'id_OSMap', dataAttr: 'id_osmap'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_OSMap', columnName: 'id_OSMap'},
					{action: 'resetButtonClasses', id: 'containerAssignedSystems'},
					{action: 'setButtonClassesCurrentTarget', id: 'containerAssignedSystems'},
				],
				cleanup: [
					{action: 'setControl_SingleValue', type: 'number', id: 'numberQuantities', columnName: 'quantity'}
				],
			},

		],
	},

	systems: {
		title: 'Systems', //The title of the modal to display at the top of the modal
		formButtons: [ //The buttons to insert at the bottom of the modal
			{type: 'info', id: 'buttonNew', label: 'New System', initialState: 'unlock'},
			{type: 'delete', id: 'buttonDelete', label: 'Remove System', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ //The empty controls to insert in the modal
			{ type: 'select', id: 'selectSystem', label: 'System'},
			{ type: 'img', id: 'imageSystem', columnName: 'image'},
			{ type: 'heading', id: 'headingSystemName', align: 'center'},
			{ type: 'text', id: 'textSystemName', label: 'Name'},
			{ type: 'textarea', id: 'textSystemDescription', label: 'Description' },
			{ type: 'select', id: 'selectCategory', label: 'Category'},
			{ type: 'text', id: 'textSystemReferences', label: 'System Block Diagram Reference', append: {
				id: 'systemReferenceDropZone', label: '&#8595'
			} },
			{ type: 'text', id: 'textSystemTags', label: 'Tag List (Comma separated)'},
			{ type: 'buttons', buttons: [
				{ id: 'buttonIcons', label: 'Choose Icon'},
				{ id: 'buttonSystemQuantities', label: 'Map Systems to Years'},
				{ id: 'buttonUpdateSystemInterfaces', label: 'Attach Interfaces & Connect Links'},
				{ id: 'buttonSystemRelationships', label: 'System Relationships'},
			]}

		],
		monitorChanges: [//The ID of the controls to monitor for changes
			{id: 'textSystemName', on: 'input'},
			{id: 'textSystemDescription', on: 'input'},
			{id: 'textSystemReferences', on: 'input'},
			{id: 'textSystemTags', on: 'input'},
			{id: 'selectCategory', on: 'change'},
		],
		lockOnChange: ['selectSystem','buttonNew','buttonDelete','buttonIcons','buttonSystemQuantities', 'buttonUpdateSystemInterfaces','buttonSystemRelationships'], //The ID of the controls to lock when editing an object
		unlockOnChange: ['buttonUpdate'], //The ID of the controls to lock when editing an object
		iterations: [ //The objects to process in order to fetch information from the server and insert into the form controls
			{ //Get the all the systems
				type: 'AllSystems',
				definitionFields: [],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'selectOptions', id: 'selectSystem', columnName: 'name', attr: {name: 'id_system', columnName: 'id_system'} },
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectSystem', definition: 'id_system', dataAttr: 'id_system', columnName: 'id_system'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectSystem', definition: 'id_system', dataAttr: 'id_system'},
					{action: 'setControl_MultipleValues_fromConstant', type: 'selectOptions', id: 'selectCategory', constantName: 'systems', columnName: 'title', attr: {name: 'category', columnName: 'value'} },
				],
			},
			{ //Get specific system details
				type: 'SingleSystem_WithTags',
				definitionFields: ['id_system'],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_SingleValue', arrayIndex: 0, id: 'headingSystemName', type: 'heading', columnName: 'name'},
					{action: 'setControl_SingleValue', arrayIndex: 0, id: 'imageSystem', type: 'image', columnName: 'image'},
					{action: 'setDefinition_SingleValue_AtSpecificArrayIndex', id: 'image', arrayIndex: 0, columnName: 'image'},
					{action: 'setControl_SingleValue', arrayIndex: 0, id: 'textSystemName', type: 'text', columnName: 'name'},
					{action: 'setControl_SingleValue', arrayIndex: 0, id: 'textSystemDescription', type: 'text', columnName: 'description'},
					{action: 'setControl_SingleValue', arrayIndex: 0, id: 'textSystemReferences', type: 'text', columnName: 'reference'},
					{action: 'setControl_SingleValue', arrayIndex: 0, type: 'select', id: 'selectCategory', dataAttr: 'category', columnName: 'category'},
					{action: 'setControl_MultipleValues_AtSpecificArrayIndex', arrayIndex: 1, id: 'textSystemTags', type: 'textList', columnName: 'tag'},
					{action: 'setControl_Focus', id: 'selectSystem'}
				]
			}
		],
		events: [
			{	//System quantities button clicked
				handlers: [{controlId: 'buttonSystemQuantities', event: 'click'},],
				instructions: [
				],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'systemQuantities'},
				],
			},
			{	//Delete system button clicked
				handlers: [{controlId: 'buttonDelete', event: 'click'},], 
				postType: 'DeleteSystem',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_system', columnName: 'id_system'},
					{action: 'deleteDefinitionValue', definitionName: 'id_system'},
				],
				cleanup: [{action: 'reload'},],
			},
			
			{ 	//New system button clicked
				handlers: [{controlId: 'buttonNew', event: 'click'},],
				instructions: [
					{action: 'deleteDefinitionValue', definitionName: 'id_system'},
					{action: 'emptyControl', type: 'heading', id: 'headingSystemName'},
					{action: 'emptyControl', type: 'text', id: 'textSystemName'},
					{action: 'emptyControl', type: 'text', id: 'textSystemDescription'},
					{action: 'emptyControl', type: 'image', id: 'imageSystem'},
					{action: 'emptyControl', type: 'text', id: 'textSystemReferences'},
					{action: 'emptyControl', type: 'text', id: 'textSystemTags'},
					{action: 'lockControls'}
				],
				cleanup: [],
			},
			{	//Update system button clicked
				handlers: [{controlId: 'buttonUpdate', event: 'click'},],
				postType: 'UpdateSystem',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_system', columnName: 'id_system'},
					{action: 'toServer_ControlValue', id: 'textSystemName', type: 'text', columnName: 'name'}, //Change id to controlId eventually
					{action: 'toServer_ControlValue', id: 'imageSystem',  type: 'image', columnName: 'image'},
					{action: 'toServer_ControlValue', id: 'textSystemDescription',  type: 'text', columnName: 'description'},
					{action: 'toServer_ControlValue', id: 'textSystemReferences',  type: 'text', columnName: 'reference'},
					{action: 'toServer_ControlValue', id: 'textSystemTags',  type: 'text', columnName: 'tags'},
					{action: 'toServer_ControlValue', type: 'select', id: 'selectCategory', columnName: 'category', dataAttr: 'category'},
				],
				cleanup: [
					{action: 'setDefinition_FromResultInsert', definitionName: 'id_system'},
					{action: 'reload'}
				],
			},
			{	//System relationship modal
				handlers: [{controlId: 'buttonSystemRelationships', event: 'click'},],
				instructions: [],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'mapSystems'},
				],
			},
			{	//Icon chooser
				handlers: [{controlId: 'buttonIcons', event: 'click'},],
				instructions: [],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'icons'},
				],
			},
			{	//Change to system select
				handlers: [{controlId: 'selectSystem', event: 'change'},],
				instructions: [
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectSystem', definitionName: 'id_system', dataAttr: 'id_system'}
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Attach interfaces button
				handlers: [{controlId: 'buttonUpdateSystemInterfaces', event: 'click'},],
				instructions: [

				],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'interfacesToSystems'},
				],
			},
		]
	},

	subsystems: {
		title: 'Subsystems', //The title of the modal to display at the top of the modal
		formButtons: [ //The buttons to insert at the bottom of the modal
			{type: 'info', id: 'buttonNew', label: 'New Subsystem', initialState: 'unlock'},
			{type: 'delete', id: 'buttonDelete', label: 'Remove Subsystem', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ //The empty controls to insert in the modal
			{ type: 'select', id: 'selectSubsystem', label: 'Subsystems'},
			{ type: 'img', id: 'imageSubsystem', columnName: 'image'},
			{ type: 'heading', id: 'headingSubsystemName', align: 'center'},
			{ type: 'text', id: 'textSubsystemName', label: 'Name'},
			{ type: 'textarea', id: 'textSubsystemDescription', label: 'Description' },
			{ type: 'checkbox', id: 'chkDistributedSystem', label: 'Distributed Subsystem' },
			{ type: 'buttons', buttons: [
				{ id: 'buttonIcons', label: 'Choose Icon'},
			]}

		],
		monitorChanges: [//The ID of the controls to monitor for changes
			{id: 'textSubsystemName', on: 'input'},
			{id: 'textSubsystemDescription', on: 'input'},
			{id: 'chkDistributedSystem', on: 'input'},
			//{id: 'selectCategory', on: 'change'},
		],
		lockOnChange: ['selectSubsystem','buttonNew','buttonDelete','buttonIcons','buttonSystemQuantities', 'buttonUpdateSystemInterfaces'], //The ID of the controls to lock when editing an object
		unlockOnChange: ['buttonUpdate'], //The ID of the controls to lock when editing an object
		iterations: [ //The objects to process in order to fetch information from the server and insert into the form controls
			{ //Get the all the subsystems
				type: 'AllSubsystems',
				definitionFields: [], 
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'selectOptions', id: 'selectSubsystem', columnName: 'name', attr: {name: 'id_system', columnName: 'id_system'} },
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectSubsystem', definition: 'id_system', dataAttr: 'id_system', columnName: 'id_system'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectSubsystem', definition: 'id_system', dataAttr: 'id_system'},
				],
			},
			{ //Get specific system details
				type: 'SingleSystem',
				definitionFields: ['id_system'],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_SingleValue', id: 'headingSubsystemName', type: 'heading', columnName: 'name'},
					{action: 'setControl_SingleValue', id: 'imageSubsystem', type: 'image', columnName: 'image'},
					{action: 'setDefinition_SingleValue', id: 'image', columnName: 'image'},
					{action: 'setControl_SingleValue',  id: 'textSubsystemName', type: 'text', columnName: 'name'},
					{action: 'setControl_SingleValue', id: 'textSubsystemDescription', type: 'text', columnName: 'description'},
					//{action: 'setControl_MultipleValues_fromConstant', type: 'selectOptions', id: 'selectCategory', constantName: 'systems', columnName: 'title', attr: {name: 'category', columnName: 'value'} },
					//{action: 'setControl_SingleValue', type: 'select', id: 'selectCategory', dataAttr: 'category', columnName: 'category'},
					{action: 'setControl_SingleValue', id: 'chkDistributedSystem', type: 'checkbox', columnName: 'distributedSubsystem'},
					{action: 'setControl_Focus', id: 'selectSubsystem'}
				]
			}
		],
		events: [
			{	//System quantities button clicked
				handlers: [{controlId: 'buttonSystemQuantities', event: 'click'},],
				instructions: [
				],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'systemQuantities'},
				],
			},
			{	//Delete system button clicked
				handlers: [{controlId: 'buttonDelete', event: 'click'},], 
				postType: 'DeleteSystem',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_system', columnName: 'id_system'},
					{action: 'deleteDefinitionValue', definitionName: 'id_system'},
				],
				cleanup: [{action: 'reload'},],
			},
			
			{ 	//New system button clicked
				handlers: [{controlId: 'buttonNew', event: 'click'},],
				instructions: [
					{action: 'deleteDefinitionValue', definitionName: 'id_system'},
					{action: 'emptyControl', type: 'heading', id: 'headingSubsystemName'},
					{action: 'emptyControl', type: 'text', id: 'textSubsystemName'},
					{action: 'emptyControl', type: 'text', id: 'textSubsystemDescription'},
					{action: 'emptyControl', type: 'image', id: 'imageSubsystem'},
					{action: 'emptyControl', type: 'checkbox', id: 'chkDistributedSystem'},
					{action: 'lockControls'}
				],
				cleanup: [],
			},
			{	//Update system button clicked
				handlers: [{controlId: 'buttonUpdate', event: 'click'},],
				postType: 'UpdateSubsystem',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_system', columnName: 'id_system'},
					{action: 'toServer_ControlValue', id: 'textSubsystemName', type: 'text', columnName: 'name'},
					{action: 'toServer_ControlValue', id: 'imageSubsystem',  type: 'image', columnName: 'image'},
					{action: 'toServer_ControlValue', id: 'textSubsystemDescription',  type: 'text', columnName: 'description'},
					{action: 'toServer_ControlValue', id: 'chkDistributedSystem',  type: 'checkbox', columnName: 'distributedSubsystem'},
					//{action: 'toServer_ControlValue', type: 'select', id: 'selectCategory', columnName: 'category', dataAttr: 'category'},
				],
				cleanup: [
					{action: 'setDefinition_FromResultInsert', definitionName: 'id_system'},
					{action: 'reload'}
				],
			},
			{	//System relationship modal
				handlers: [{controlId: 'buttonSystemRelationships', event: 'click'},],
				instructions: [],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'mapSystems'},
				],
			},
			{	//Icon chooser
				handlers: [{controlId: 'buttonIcons', event: 'click'},],
				instructions: [],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'icons'},
				],
			},
			{	//Change to system select
				handlers: [{controlId: 'selectSubsystem', event: 'change'},],
				instructions: [
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectSubsystem', definitionName: 'id_system', dataAttr: 'id_system'}
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Attach interfaces button
				handlers: [{controlId: 'buttonUpdateSystemInterfaces', event: 'click'},],
				instructions: [

				],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'interfacesToSystems'},
				],
			},
		]
	},

	icons: {
		title: 'Choose Icon', //The title of the modal to display at the top of the modal
		formButtons: [ //The buttons to insert at the bottom of the modal
			{type: 'submit', id: 'buttonUpdate', label: 'Select', initialState: 'unlock'},
			{type: 'cancel', id: 'buttonCancel', label: 'Cancel', initialState: 'unlock'},
		], 
		formFields: [ //The empty controls to insert in the modal
			{ type: 'container', id: 'containerIcons' },
		],
		monitorChanges: [], 
		lockOnChange: [], 
		unlockOnChange: [],
		iterations: [ 
			{ 
				type: 'images', 
				definitionFields: [],
				continueOnUndefined: true,
				instructions: [ 
					{action: 'setControl_MultipleValues_EntireArray', type: 'iconButtonChooser', id: 'containerIcons',},
					{action: 'setControl_SingleValue_fromDefinitionIfExists', type: 'chosenIconBySrc', id: 'containerIcons', definitionName: 'image'}
				],
			},
		],
		events: [
			{ //Handle icon button clicks to highlight the selected icon to the user
				handlers: [{controlId: 'containerIcons button', event: 'click'},],
				instructions: [ //Pre-server instructions
					{action: 'resetButtonClasses', id: 'containerIcons'},
					{action: 'setButtonClassesCurrentTarget', id: 'containerIcons'}
				],
				cleanup: [ //Post server instructions
				],
			},
			{ //Handle update button
				handlers: [{controlId: 'buttonUpdate', event: 'click'},],
				postType: 'UpdateImage', //The type of update to send to the server, if required
				instructions: [ //Pre-server instructions
					{action: 'toServer_ControlValue', type: 'selectedImage', id: 'containerIcons', columnName: 'image'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_system', columnName: 'id_system'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_interface', columnName: 'id_interface'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_network', columnName: 'id_network'},
				],
				cleanup: [ //Post server instructions
					{action: 'returnToLastModal'},
				],
			},
			{ //Handle icon button clicks to highlight the selected icon to the user
				handlers: [{controlId: 'buttonCancel', event: 'click'},], 
				instructions: [],
				cleanup: [ //Post server instructions
					{action: 'returnToLastModal'},
				],
			},
		]
	},

	interfacesToSystems: {
		title: 'Assign Interfaces & Links to System',
		formButtons: [
			{type: 'delete', id: 'buttonDelete', label: 'Remove Interface', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'cancel', id: 'buttonCancel', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [			
			{ type: 'img', id: 'imageSystem', columnName: 'image'},
			{ type: 'heading', id: 'headingSystemName', align: 'center'},
			{ type: 'select', id: 'selectInterface', label: 'Available Interfaces'},
			{ type: 'button', id: 'buttonAssignSystem', label: '&#8595 Assign Interface to System &#8595', align: 'centre'},
			{ type: 'container', id: 'containerAssignedInterfaces' },
			{ type: 'note', text: 'Select an interface to access additional details:'},
			{ type: 'text', id: 'textSystemInterfaceName', label: 'System Interface Name' },
			{ type: 'textarea', id: 'textSystemInterfaceDescription', label: 'Description' },
			{ type: 'select', id: 'selectCategory', label: 'Category'},
			{ type: 'checkbox', id: 'chkIsProposed', label: 'Proposed Interface'},
			{ type: 'droppable2', id: 'containerCompatibleLinks', label: 'Compatible Links'},
			{ type: 'droppable2', id: 'containerPrimaryLinks', label: 'Primary Links'},
			{ type: 'droppable2', id: 'containerAlternateLinks', label: 'Alternate Links'},
			{ type: 'droppable2', id: 'containerIncapableLinks', label: 'Incapable Links'},
		],
		monitorChanges: [
			{id: 'textSystemInterfaceName', on: 'input'},
			{id: 'textSystemInterfaceDescription', on: 'input'},
			{id: 'chkIsProposed', on: 'change'},
			{id: 'selectCategory', on: 'change'},
		],
		lockOnChange: ['buttonAssignSystem','containerAssignedInterfaces','buttonDelete', 'containerAssignedInterfaces button'], 
		unlockOnChange: ['buttonUpdate'], 
		iterations: [ 
			{ 
				type: 'SingleSystem',
				definitionFields: ['id_system'],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_SingleValue', type: 'image', id: 'imageSystem', columnName: 'image'},
					{action: 'setControl_SingleValue', type: 'heading', id: 'headingSystemName', columnName: 'name'},
				],
			},
			{ 
				type: 'AllInterfaces',
				definitionFields: [],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'selectOptions', id: 'selectInterface', columnName: 'name', attr: {name: 'id_interface', columnName: 'id_interface'}},
				],
			},
			{
				type: 'SystemInterfaces',
				definitionFields: ['id_system'],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'iconButton', id: 'containerAssignedInterfaces', columnName: 'name', attr: {name: 'id_SIMap', columnName: 'id_SIMap'}},
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'text', id: 'textSystemInterfaceName', definition: 'id_SIMap', columnName: 'SIName'},
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'text', id: 'textSystemInterfaceDescription', definition: 'id_SIMap', columnName: 'description'},
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'checkbox', id: 'chkIsProposed', definition: 'id_SIMap', columnName: 'isProposed'},
					{action: 'setControl_SingleValue_fromDefinitionIfExists', type: 'iconButtonSelected', id: 'containerAssignedInterfaces', attrName: 'id_SIMap', definitionName: 'id_SIMap'},
					{action: 'setControl_MultipleValues_fromConstant', type: 'selectOptions', id: 'selectCategory', constantName: 'systems', columnName: 'title', attr: {name: 'category', columnName: 'value'} },
					
				],
			},
			{	//Populate the droppables
				type: 'SpecificSystemInterfaceAndLinks',
				definitionFields: ['id_SIMap'],
				continueOnUndefined: false,
				instructions: [
					{action: 'setControl_MultipleValues', arrayIndex: 1, type: 'droppableElements', id: 'containerCompatibleLinks', columnName: 'name', attr: {name: 'id_network', columnName: 'id_network'}},
					{action: 'setControl_MultipleValues', arrayIndex: 2, type: 'moveDroppableElements', id: 'containerPrimaryLinks', sourceId: 'containerCompatibleLinks', dataAttr: 'id_network', attr: {name: 'id_network', columnName: 'id_network'}},
					{action: 'setControl_MultipleValues', arrayIndex: 3, type: 'moveDroppableElements', id: 'containerAlternateLinks', sourceId: 'containerCompatibleLinks', dataAttr: 'id_network', attr: {name: 'id_network', columnName: 'id_network'}},
					{action: 'setControl_MultipleValues', arrayIndex: 4, type: 'moveDroppableElements', id: 'containerIncapableLinks', sourceId: 'containerCompatibleLinks', dataAttr: 'id_network', attr: {name: 'id_network', columnName: 'id_network'}},
					{action: 'setControl_SingleValue', arrayIndex: 0, type: 'select', id: 'selectCategory', dataAttr: 'category', columnName: 'category'},
				],
			},
		],
		events: [
			{	//Remove interface button clicked
				handlers: [{controlId: 'buttonDelete', event: 'click'},], 
				postType: 'DeleteInterfaceFromSystem',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_SIMap', columnName: 'id_SIMap'},
					{action: 'deleteDefinitionValue', definitionName: 'id_SIMap'},
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{ 	//Clicks on individual interface buttons
				handlers: [{controlId: 'containerAssignedInterfaces button', event: 'click'}],
				postType: 'SpecificSystemInterfaceAndLinks',
				url: 'select',
				instructions: [
					{action: 'setDefinition_FromClickedButton', definitionName: 'id_SIMap', dataAttr: 'id_simap'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_SIMap', columnName: 'id_SIMap'},
					{action: 'resetButtonClasses', id: 'containerAssignedInterfaces'},
					{action: 'setButtonClassesCurrentTarget', id: 'containerAssignedInterfaces'},
				],
				cleanup: [
					{action: 'emptyControl', type: 'droppableElements', id: 'containerCompatibleLinks'},
					{action: 'emptyControl', type: 'droppableElements', id: 'containerPrimaryLinks'},
					{action: 'emptyControl', type: 'droppableElements', id: 'containerAlternateLinks'},
					{action: 'emptyControl', type: 'droppableElements', id: 'containerIncapableLinks'},
					{action: 'setControl_SingleValue', arrayIndex: 0, type: 'text', id: 'textSystemInterfaceName', columnName: 'name'},
					{action: 'setControl_SingleValue', arrayIndex: 0, type: 'text', id: 'textSystemInterfaceDescription', columnName: 'description'},
					{action: 'setControl_SingleValue', arrayIndex: 0, type: 'checkbox', id: 'chkIsProposed', columnName: 'isProposed'},
					{action: 'setControl_SingleValue', arrayIndex: 0, type: 'select', id: 'selectCategory', dataAttr: 'category', columnName: 'category'},
					{action: 'setControl_MultipleValues', arrayIndex: 1, type: 'droppableElements', id: 'containerCompatibleLinks', columnName: 'name', attr: {name: 'id_network', columnName: 'id_network'}},
					{action: 'setControl_MultipleValues', arrayIndex: 2, type: 'moveDroppableElements', id: 'containerPrimaryLinks', sourceId: 'containerCompatibleLinks', dataAttr: 'id_network', attr: {name: 'id_network', columnName: 'id_network'}},
					{action: 'setControl_MultipleValues', arrayIndex: 3, type: 'moveDroppableElements', id: 'containerAlternateLinks', sourceId: 'containerCompatibleLinks', dataAttr: 'id_network', attr: {name: 'id_network', columnName: 'id_network'}},
					{action: 'setControl_MultipleValues', arrayIndex: 4, type: 'moveDroppableElements', id: 'containerIncapableLinks', sourceId: 'containerCompatibleLinks', dataAttr: 'id_network', attr: {name: 'id_network', columnName: 'id_network'}},
				],
			},
			{	//Assign Interface to System button clicked
				handlers: [{controlId: 'buttonAssignSystem', event: 'click'}], 
				postType: 'AssignInterfaceToSystem',
				instructions: [ 
					{action: 'toServer_DefinitionValue', definitionName: 'id_system', columnName: 'id_system'},
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectInterface', dataAttr: 'id_interface', definitionName: 'id_interface'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_interface', columnName: 'id_interface'},
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Update System Interface details
				handlers: [{controlId: 'buttonUpdate', event: 'click'}], 
				postType: 'UpdateSIMap',
				instructions: [ 
					{action: 'toServer_DefinitionValue', definitionName: 'id_SIMap', columnName: 'id_SIMap'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textSystemInterfaceName',  columnName: 'name'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textSystemInterfaceDescription', columnName: 'description'},
					{action: 'toServer_ControlValue', type: 'checkbox', id: 'chkIsProposed', columnName: 'isProposed'},
					{action: 'toServer_ControlValue', type: 'select', id: 'selectCategory', columnName: 'category', dataAttr: 'category'},
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Close button
				handlers: [{controlId: 'buttonCancel', event: 'click'}], 
				instructions: [],
				cleanup: [{action: 'returnToLastModal'},],
			},
			{	//Handle elements being dropped
				handlers: [
					{controlId: 'containerCompatibleLinks div', event: 'drop'},
					{controlId: 'containerPrimaryLinks div', event: 'drop'},
					{controlId: 'containerAlternateLinks div', event: 'drop'},
					{controlId: 'containerIncapableLinks div', event: 'drop'},
				],
				postType: 'AssignLinksToSystemInterface',
				instructions: [
					{action: 'preventDefault'},
					{action: 'handleDrop'},
					{action: 'toServer_ControlValue', type: 'dropTargetContents', id: 'containerPrimaryLinks', dataAttr: 'id_network', columnName: 'primaryLinks'},
					{action: 'toServer_ControlValue', type: 'dropTargetContents', id: 'containerAlternateLinks', dataAttr: 'id_network', columnName: 'alternateLinks'},
					{action: 'toServer_ControlValue', type: 'dropTargetContents', id: 'containerIncapableLinks', dataAttr: 'id_network', columnName: 'incapableLinks'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_SIMap', columnName: 'id_SIMap'},
				],
				cleanup: [],
			},
			{	//Handle elements being dragged
				handlers: [
					{controlId: 'containerCompatibleLinks div', event: 'dragover'},
					{controlId: 'containerPrimaryLinks div', event: 'dragover'},
					{controlId: 'containerAlternateLinks div', event: 'dragover'},
					{controlId: 'containerIncapableLinks div', event: 'dragover'},
				],
				instructions: [{action: 'preventDefault'},],
				cleanup: [],
			},

		]
	},

	interfaces: {
		title: 'Interfaces',
		formButtons: [ 
			{type: 'info', id: 'buttonNew', label: 'New Interface', initialState: 'unlock'},
			{type: 'delete', id: 'buttonDelete', label: 'Delete Interface', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 
			{ type: 'select', id: 'selectInterfaces', label: 'Existing Interfaces'},
			{ type: 'img', id: 'imageInterface', columnName: 'image'},
			{ type: 'heading', id: 'headingInterfaceName', align: 'center'},
			{ type: 'text', id: 'textInterfaceName', label: 'Name'},
			{ type: 'textarea', id: 'textInterfaceDescription', label: 'Description' },
			{ type: 'droppable2', id: 'availableTechnologies', label: 'Available Technologies'},
			{ type: 'droppable2', id: 'assignedTechnologies', label: 'Interface Technologies'},
			{ type: 'buttons', buttons: [
				{ id: 'buttonIcons', label: 'Choose Icon'},
			]}
		],
		monitorChanges: [
			{id: 'textInterfaceName', on: 'input'},
			{id: 'textInterfaceDescription', on: 'input'},
		],
		lockOnChange: ['selectInterfaces','buttonIcons','buttonNew','buttonDelete'],
		unlockOnChange: ['buttonUpdate'], 
		iterations: [
			{ 	//Populate interface select
				type: 'AllInterfaces',
				definitionFields: [],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'selectOptions', id: 'selectInterfaces', columnName: 'name', attr: {name: 'id_interface', columnName: 'id_interface'}},
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectInterfaces', definition: 'id_interface', dataAttr: 'id_interface', columnName: 'id_interface'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectInterfaces', definition: 'id_interface', dataAttr: 'id_interface'},
				],
			},
			{ 	//Display interface details for the currently selected interface
				type: 'SingleInterface', 
				definitionFields: ['id_interface'], 
				instructions: [ 
					{action: 'setControl_SingleValue', type: 'image', id: 'imageInterface', columnName: 'image'},
					{action: 'setControl_SingleValue', type: 'heading', id: 'headingInterfaceName', columnName: 'name'},
					{action: 'setControl_SingleValue', type: 'text', id: 'textInterfaceName', columnName: 'name'},
					{action: 'setControl_SingleValue', type: 'text', id: 'textInterfaceDescription', columnName: 'description'},
					{action: 'setDefinition_SingleValue_fromParamNoArray', definitionName: 'image', columnName: 'image'},
				],
			},
			{ 	//Get all technologies
				type: 'AllTechnologies', 
				definitionFields: [], 
				instructions: [ 
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'droppableElements', id: 'availableTechnologies', columnName: 'name', attr: {name: 'id_technology', columnName: 'id_technology'} },
				],
			},
			{	//Get technologies associated with the selected interface and move to the appropriate container
				type: 'AssignedTechnologies', 
				definitionFields: ['id_interface'], 
				instructions: [ 
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'moveDroppableElements', sourceId: 'availableTechnologies', id: 'assignedTechnologies', columnName: 'name', attr: {name: 'id_technology', columnName: 'id_technology'} },
				],
			},

		],
		events: [
			{	//Icon chooser
				handlers: [{controlId: 'buttonIcons', event: 'click'},],
				instructions: [
				],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'icons'},
				],
			},
			{	//Delete Interface button clicked
				handlers: [{controlId: 'buttonDelete', event: 'click'},],
				postType: 'DeleteInterface',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_interface', columnName: 'id_interface'},
					{action: 'deleteDefinitionValue', definitionName: 'id_interface'},
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{ //New interface button clicked
				handlers: [{controlId: 'buttonNew', event: 'click'},],
				instructions: [
					{action: 'deleteDefinitionValue', definitionName: 'id_interface'},
					{action: 'emptyControl', type: 'heading', id: 'headingInterfaceName'},
					{action: 'emptyControl', type: 'text', id: 'textInterfaceName'},
					{action: 'emptyControl', type: 'text', id: 'textInterfaceDescription'},
					{action: 'emptyControl', type: 'image', id: 'imageInterface'},
					{action: 'hideControls', controls: ['availableTechnologies','availableTechnologies_heading','assignedTechnologies','assignedTechnologies_heading' ]},
					{action: 'lockControls'}
				],
				cleanup: [],
			},
			{	//Update Interface button clicked
				handlers: [{controlId: 'buttonUpdate', event: 'click'},],
				postType: 'UpdateInterface',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_interface', columnName: 'id_interface'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textInterfaceName', columnName: 'name'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textInterfaceDescription', columnName: 'description'},
				],
				cleanup: [
					{action: 'setDefinition_FromResultInsert', definitionName: 'id_interface'},
					{action: 'reload'},
				],
			},
			{	//Interface select changes
				handlers: [{controlId: 'selectInterfaces', event: 'change'},],
				postType: 'SingleInterface', 
				url: 'select',
				instructions: [
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectInterfaces', definitionName: 'id_interface', dataAttr: 'id_interface'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_interface', columnName: 'id_interface'},
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Handle elements being dropped
				handlers: [
					{controlId: 'assignedTechnologies div', event: 'drop'},
					{controlId: 'availableTechnologies div', event: 'drop'},
				],
				postType: 'UpdateInterfaceTechnologyAssignments',
				instructions: [
					{action: 'preventDefault'},
					{action: 'handleDrop'},
					{action: 'toServer_ControlValue', type: 'dropTargetContents', id: 'assignedTechnologies', dataAttr: 'id_technology', columnName: 'id_technology_arr'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_interface', columnName: 'id_interface'},
				],
				cleanup: [
				],
			},
			{	//Handle elements being dragged
				handlers: [
					{controlId: 'availableTechnologies div', event: 'dragover'},
					{controlId: 'assignedTechnologies div', event: 'dragover'},
				],
				instructions: [{action: 'preventDefault'},],
				cleanup: [],
			},
		]
	},

	systemQuantities: {
		title: 'System Quantities',
		formButtons: [
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'unlock'},
			{type: 'cancel', id: 'buttonCancel', label: 'Cancel', initialState: 'unlock'},
		], 
		formFields: [ 
			{ type: 'img', id: 'imageSystem', columnName: 'image'},
			{ type: 'heading', id: 'headingSystemName', align: 'center'},
			{ type: 'note', text: `This form is used to track the introduction of new systems into the system. For systems being removed, include a 0 in the final year to indicate removal.`},
			{ type: 'container', id: 'containerQtyToYears' },
			{ type: 'buttons', buttons: [
				{ id: 'buttonNewField', label: 'Add New Field'},
				{ id: 'buttonRemoveLastField', label: 'Remove Last Field'},
			]}
		],
		monitorChanges: [],
		lockOnChange: [],
		unlockOnChange: [], 
		iterations: [
			{ 
				type: 'SingleSystem', 
				definitionFields: ['id_system'],
				continueOnUndefined: true,
				instructions: [ 
					{action: 'setControl_SingleValue', id: 'headingSystemName', type: 'heading', columnName: 'name'},
					{action: 'setControl_SingleValue', id: 'imageSystem', type: 'image', columnName: 'image'},
				],
			},
			{ 
				type: 'QtyYears', 
				definitionFields: ['id_system'],
				continueOnUndefined: true,
				instructions: [ 
					{action: 'setControl_MultipleValues_EntireArray', type: 'qtyYears', id: 'containerQtyToYears'}
				],
			},
		],
		events: [
			{
				handlers: [{controlId: 'buttonUpdate', event: 'click'},], 
				postType: 'QtyYears', 
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_system', columnName: 'id_system'},
					{action: 'toServer_ControlValue', type: 'qtyYears', id: 'containerQtyToYears', columnName: 'years'},
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Add additional controls
				handlers: [{controlId: 'buttonNewField', event: 'click'},],
				instructions: [
					{action: 'addControls', id: 'containerQtyToYears', type: 'qtyYears'},
					{action: 'unlockControls'},
				],
				cleanup: [
				],
			},
			{	//Remove last control
				handlers: [{controlId: 'buttonRemoveLastField', event: 'click'},], 
				instructions: [
					{action: 'removeControls', id: 'containerQtyToYears', type: 'qtyYears'},
					{action: 'unlockControls'},
				],
				cleanup: [
				],
			},
			{	//Cancel button
				handlers: [{controlId: 'buttonCancel', event: 'click'},],  
				instructions: [],
				cleanup: [{action: 'returnToLastModal'},],
			},			
		]
	},

	links: {
		title: 'Interface Links',
		formButtons: [ 
			{type: 'info', id: 'buttonNew', label: 'New Link', initialState: 'unlock'},
			{type: 'delete', id: 'buttonDelete', label: 'Delete Link', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'cancel', id: 'buttonCancel', label: 'Cancel', initialState: 'unlock'},
		], 
		formFields: [
			{ type: 'select', id: 'selectLinks', label: 'Existing Links'},
			{ type: 'img', id: 'imageLinks', columnName: 'image'},
			{ type: 'heading', id: 'headingLinks', align: 'center'},
			{ type: 'text', id: 'textLinkName', label: 'Name'},
			{ type: 'select', id: 'selectCategory', label: 'Category'},
			{ type: 'text', id: 'textLinkDesignation', label: 'Designation'},
			{ type: 'select', id: 'selectTechnology', label: 'Link Technology'},
			{ type: 'textarea', id: 'textLinkDescription', label: 'Description' },
			{ type: 'buttons', buttons: [
				{ id: 'buttonIcons', label: 'Choose Icon'},
			]}

		],
		monitorChanges: [
			{id: 'textLinkName', on: 'input'},
			{id: 'textLinkDesignation', on: 'input'},
			{id: 'selectTechnology', on: 'change'},
			{id: 'textLinkDescription', on: 'input'},
			{id: 'selectLinkColor', on: 'change'},
			{id: 'selectCategory', on: 'change'}
		],
		lockOnChange: ['buttonDelete','buttonNew','selectLinks','buttonIcons',],
		unlockOnChange: ['buttonUpdate'], 
		iterations: [
			{
				type: 'AllTechnologies', 
				definitionFields: [],
				continueOnUndefined: true,
				instructions: [ 
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'selectOptions', id: 'selectTechnology', columnName: 'name', attr: {name: 'id_technology', columnName: 'id_technology'} },
				],
			},
			{ 
				type: 'AllLinks', 
				definitionFields: [], 
				instructions: [ 
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'selectOptions', id: 'selectLinks', columnName: 'name', attr: {name: 'id_network', columnName: 'id_network'} },
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectLinks', definition: 'id_network', dataAttr: 'id_network', columnName: 'id_network'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectLinks', definition: 'id_network', dataAttr: 'id_network'},
				],
			},
			{ 
				type: 'Link',
				definitionFields: ['id_network'], 
				instructions: [ 
					{action: 'setControl_SingleValue', type: 'image', id: 'imageLinks', columnName: 'image'},
					{action: 'setDefinition_SingleValue_fromParamNoArray', definitionName: 'image', columnName: 'image'},
					{action: 'setControl_SingleValue', type: 'heading', id: 'headingLinks', columnName: 'name'},
					{action: 'setControl_SingleValue', type: 'text', id: 'textLinkName', columnName: 'name'},
					{action: 'setControl_SingleValue', type: 'text', id: 'textLinkDesignation', columnName: 'designation'},
					{action: 'setControl_MultipleValues_fromConstant', type: 'selectOptions', id: 'selectCategory', constantName: 'links', columnName: 'title', attr: {name: 'category', columnName: 'value'} },
					{action: 'setControl_SingleValue', type: 'select', id: 'selectTechnology', columnName: 'id_technology', dataAttr: 'id_technology'},
					{action: 'setControl_SingleValue', type: 'text', id: 'textLinkDescription', columnName: 'description'},
					{action: 'setControl_SingleValue', type: 'select', id: 'selectCategory', dataAttr: 'category', columnName: 'category'},
					{action: 'setControl_Focus', id: 'selectLinks'}
				],
			},
		],
		events: [
			{	//Change to link select
				handlers: [{controlId: 'selectLinks', event: 'change'},], 
				instructions: [
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectLinks', definitionName: 'id_network', dataAttr: 'id_network'}
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Choose icon button
				handlers: [{controlId: 'buttonIcons', event: 'click'},], 
				instructions: [],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'icons'},
				],
			},
			{	//Add New link button
				handlers: [{controlId: 'buttonNew', event: 'click'},],
				instructions: [
					{action: 'deleteDefinitionValue', definitionName: 'id_network'},
					{action: 'emptyControl', type: 'select', id: 'selectLinks'},
					{action: 'emptyControl', type: 'heading', id: 'headingLinks'},
					{action: 'emptyControl', type: 'text', id: 'textLinkName'},
					{action: 'emptyControl', type: 'text', id: 'textLinkDesignation'},
					{action: 'emptyControl', type: 'text', id: 'textLinkDescription'},
					{action: 'emptyControl', type: 'image', id: 'imageLinks'},
					{action: 'lockControls'}					
				],
				cleanup: [
				],
			},
			{	//Delete button
				handlers: [{controlId: 'buttonDelete', event: 'click'},], 
				postType: 'DeleteLink', 
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_network', columnName: 'id_network'},
				],
				cleanup: [
					{action: 'deleteDefinition', definitionName: 'id_network'},
					{action: 'reload'},
				],
			},
			{	//Update button
				handlers: [{controlId: 'buttonUpdate', event: 'click'},], 
				postType: 'UpdateLink', 
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_network', columnName: 'id_network'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textLinkName', columnName: 'name'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textLinkDesignation', columnName: 'designation'},
					{action: 'toServer_ControlValue', type: 'select', id: 'selectTechnology', columnName: 'id_technology', dataAttr: 'id_technology'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textLinkDescription', columnName: 'description'},
					{action: 'toServer_ControlValue', type: 'select', id: 'selectCategory', columnName: 'category', dataAttr: 'category'},
				],
				cleanup: [
					{action: 'setDefinition_FromResultInsert', definitionName: 'id_network'},
					{action: 'reload'},
				],
			},
			{	//Close buttton
				handlers: [{controlId: 'buttonCancel', event: 'click'},], 
				instructions: [],
				cleanup: [{action: 'returnToLastModal'},],
			},
		]
	},

	technologies: {
		title: 'Link Technologies',
		formButtons: [ 
			{type: 'info', id: 'buttonNew', label: 'New Technology', initialState: 'unlock'},
			{type: 'delete', id: 'buttonDelete', label: 'Delete', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'cancel', id: 'buttonCancel', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 
			{ type: 'select', id: 'selectTechnologies', label: 'Link Technologies'},
			{ type: 'text', id: 'textTechnologyName', label: 'Name'},
			{ type: 'select', id: 'selectCategory', label: 'Category'},
			{ type: 'textarea', id: 'textTechnologyDescription', label: 'Description' },
		],
		monitorChanges: [
			{id: 'textTechnologyName', on: 'input'},
			{id: 'textTechnologyDescription', on: 'input'},
			{id: 'selectCategory', on: 'change'},
		],
		lockOnChange: ['buttonDelete','buttonNew','selectTechnologies'],
		unlockOnChange: ['buttonUpdate'], 
		iterations: [
			{ 
				type: 'AllTechnologies',
				definitionFields: [],
				continueOnUndefined: true,
				instructions: [ 
					{action: 'setControl_MultipleValues', type: 'selectOptions', id: 'selectTechnologies', columnName: 'name', attr: {name: 'id_technology', columnName: 'id_technology'} },
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectTechnologies', definition: 'id_technology', dataAttr: 'id_technology', columnName: 'id_technology'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectTechnologies', definition: 'id_technology', dataAttr: 'id_technology'},
					{action: 'setControl_MultipleValues_fromConstant', type: 'selectOptions', id: 'selectCategory', constantName: 'technology', columnName: 'title', attr: {name: 'category', columnName: 'value'} },
				],
			},
			{
				type: 'SingleTechnology', 
				definitionFields: ['id_technology'],
				continueOnUndefined: true,
				instructions: [ 
					{action: 'setControl_SingleValue', type: 'text', id: 'textTechnologyName', columnName: 'name'},
					{action: 'setControl_SingleValue', type: 'text', id: 'textTechnologyDescription', columnName: 'description'},
					{action: 'setControl_SingleValue', type: 'select', id: 'selectCategory', dataAttr: 'category', columnName: 'category'},
				],
			},
		],
		events: [
			{	//Change to technology select
				handlers: [{controlId: 'selectTechnologies', event: 'change'},], 
				instructions: [
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectTechnologies', definitionName: 'id_technology', dataAttr: 'id_technology'}
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			
			{	//Add New link button
				handlers: [{controlId: 'buttonNew', event: 'click'},], 
				instructions: [
					{action: 'deleteDefinitionValue', definitionName: 'id_technology'},
					{action: 'emptyControl', type: 'select', id: 'selectTechnologies'},
					{action: 'emptyControl', type: 'text', id: 'textTechnologyName'},
					{action: 'emptyControl', type: 'text', id: 'textTechnologyDescription'},
					{action: 'lockControls'}					
				],
				cleanup: [],
			},
			{	//Delete button
				handlers: [{controlId: 'buttonDelete', event: 'click'},], 
				postType: 'DeleteTechnology', 
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_technology', columnName: 'id_technology'},
				],
				cleanup: [
					{action: 'deleteDefinition', definitionName: 'id_technology'},
					{action: 'reload'},
				],
			},
			{	//Update button
				handlers: [{controlId: 'buttonUpdate', event: 'click'},], 
				postType: 'UpdateTechnology', 
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_technology', columnName: 'id_technology'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textTechnologyName', columnName: 'name'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textTechnologyDescription', columnName: 'description'},
					{action: 'toServer_ControlValue', type: 'select', id: 'selectCategory', columnName: 'category', dataAttr: 'category'},
				],
				cleanup: [
					{action: 'setDefinition_FromResultInsert', definitionName: 'id_technology'},
					{action: 'reload'},
				],
			},
			{	//Close buttton
				handlers: [{controlId: 'buttonCancel', event: 'click'},], 
				instructions: [],
				cleanup: [{action: 'returnToLastModal'},],
			},
		]
	},

	tags: {
		title: 'Show / Hide Systems by Tag',
		formButtons: [ 
			{type: 'submit', id: 'buttonUpdate', label: 'Save & Close', initialState: 'unlock'},
			//{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 
			{ type: 'droppable2', id: 'availableTags', label: 'Availaible Tags' },
			{ type: 'droppable2', id: 'includedTags', label: 'Included Tags', source: 'text', columnName: 'includedFilterTag'},
			{ type: 'droppable2', id: 'excludedTags', label: 'Excluded Tags', source: 'text', columnName: 'excludedFilterTag'},
		],
		monitorChanges: [

		],
		lockOnChange: [],
		unlockOnChange: [], 
		iterations: [
			{ 
				type: 'TagList', 
				definitionFields: [], 
				continueOnUndefined: true,
				instructions: [ 
					{action: 'setControl_MultipleValues', type: 'droppableElements', id: 'availableTags', columnName: 'tag', attr: {name: 'tag', columnName: 'tag'}},
					{action: 'setControl_MultipleValues_FromLocalStorage', type: 'moveDroppableElements', id: 'includedTags', sourceId: 'availableTags', localStorageName: 'includedFilterTag', attr: {name: 'tag', columnName: 'tag'}},
					{action: 'setControl_MultipleValues_FromLocalStorage', type: 'moveDroppableElements', id: 'excludedTags', sourceId: 'availableTags', localStorageName: 'excludedFilterTag', attr: {name: 'tag', columnName: 'tag'}},
				],
			},
		],
		events: [
			{	//Save/Update button
				handlers: [{controlId: 'buttonUpdate', event: 'click'}, ],
				instructions: [
					{action: 'setLocalStorage', type: 'dropTargetContents', id: 'includedTags', localStorageName: 'includedFilterTag', attrName: 'tag'},
					{action: 'setLocalStorage', type: 'dropTargetContents', id: 'excludedTags', localStorageName: 'excludedFilterTag', attrName: 'tag'},
				],
				cleanup: [
					{action: 'reloadPage'},
					{action: 'closeModal'},
				],
			},
			{	//Handle elements being dropped
				handlers: [
					{controlId: 'availableTags div', event: 'drop'},
					{controlId: 'includedTags div', event: 'drop'},
					{controlId: 'excludedTags div', event: 'drop'},
				],
				//postType: 'UpdateSystemsAssociatedwithIssues',
				instructions: [
					{action: 'preventDefault'},
					{action: 'handleDrop'},
				//	{action: 'toServer_ControlValue', type: 'dropTargetContents', id: 'droppableAffectedSystems', dataAttr: 'id_system', columnName: 'affectedSystems'},
				//	{action: 'toServer_DefinitionValue', definitionName: 'id_interfaceIssue', columnName: 'id_interfaceIssue'},
				],
				cleanup: [],
			},
			{	//Handle elements being dragged
				handlers: [
					{controlId: 'availableTags div', event: 'dragover'},
					{controlId: 'includedTags div', event: 'dragover'},
					{controlId: 'excludedTags div', event: 'dragover'},
				],
				instructions: [{action: 'preventDefault'},],
				cleanup: [],
			},
		]
	},

	interfaceIssues: {
		title: 'Interface Issues',
		formButtons: [ 
			{type: 'info', id: 'buttonNew', label: 'New Issue', initialState: 'unlock'},
			{type: 'delete', id: 'buttonDelete', label: 'Delete Issue', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Save Issue', initialState: 'lock'},
			{type: 'cancel', id: 'buttonCancel', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 
			{ type: 'select', id: 'selectInterface', label: 'Interfaces'},
			{ type: 'select', id: 'selectIssue', label: 'Existing Interface Issue'},
			{ type: 'text', id: 'textTitle', label: 'Issue Title'},
			{ type: 'droppable2', id: 'droppableAffectedSystems', label: 'Systems affected by this issue'},
			{ type: 'droppable2', id: 'droppableSystemsUsingThisInterface', label: 'Other systems which implement this interface'},
			{ type: 'slider', id: 'sliderSeverity', label: 'Severity', max: 6},
			{ type: 'textarea', id: 'textIssueDetails', label: 'Issue'},
			{ type: 'textarea', id: 'textIssueResolution', label: 'Proposed Resolution'},
		],
		monitorChanges: [
			{id: 'textTitle', on: 'input'},
			//{id: 'sliderSeverity', on: 'input'},
			{id: 'textIssueDetails', on: 'input'},
			{id: 'textIssueResolution', on: 'input'},
		],
		lockOnChange: ['buttonNew','buttonDelete','selectInterface','selectIssue','droppableAffectedSystems','droppableSystemsUsingThisInterface'],
		unlockOnChange: ['buttonUpdate'], 
		iterations: [
			{ 	//Populate interface select
				type: 'AllInterfaces',
				definitionFields: [],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues', type: 'selectOptions', id: 'selectInterface', columnName: 'name', attr: {name: 'id_interface', columnName: 'id_interface'}},
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectInterface', definition: 'id_interface', dataAttr: 'id_interface', columnName: 'id_interface'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectInterface', definition: 'id_interface', dataAttr: 'id_interface'},
				],
			},
			{ 	//Populate issues select
				type: 'AllInterfaceIssues',
				definitionFields: ['id_interface'],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues', type: 'selectOptions', id: 'selectIssue', columnName: 'name', attr: {name: 'id_interfaceIssue', columnName: 'id_interfaceIssue'}},
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectIssue', definition: 'id_interfaceIssue', dataAttr: 'id_interfaceIssue', columnName: 'id_interfaceIssue'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectIssue', definition: 'id_interfaceIssue', dataAttr: 'id_interfaceIssue'},
				],
			},
			{ 	//Populate the droppable with all systems which implement this interface
				type: 'SystemsWithSpecificInterface',
				definitionFields: ['id_interface'],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues', type: 'droppableElements', id: 'droppableSystemsUsingThisInterface', columnName: 'name', attr: {name: 'id_system', columnName: 'id_system'}},
				],
			},
			
			{ 	//Get selected issue detail
				type: 'SpecificInterfaceIssue',
				definitionFields: ['id_interfaceIssue'],
				continueOnUndefined: false,
				instructions: [
					{action: 'setControl_SingleValue_AtSpecificArrayIndexFirstIndex', type: 'text', id: 'textTitle', arrayIndex: 0, columnName: 'name'},
					{action: 'setControl_SingleValue_AtSpecificArrayIndexFirstIndex', type: 'slider', id: 'sliderSeverity', arrayIndex: 0,  columnName: 'severity'},
					{action: 'setControl_SingleValue_AtSpecificArrayIndexFirstIndex', type: 'text', id: 'textIssueDetails', arrayIndex: 0,  columnName: 'issue'},
					{action: 'setControl_SingleValue_AtSpecificArrayIndexFirstIndex', type: 'text', id: 'textIssueResolution', arrayIndex: 0,  columnName: 'resolution'},
					
					{action: 'setControl_MultipleValues', arrayIndex: 1, type: 'moveDroppableElements', id: 'droppableAffectedSystems', sourceId: 'droppableSystemsUsingThisInterface', dataAttr: 'id_system', attr: {name: 'id_system', columnName: 'id_system'}},
				],
			},
			


			
		],
		events: [
			{	//Update issue details
				handlers: [{controlId: 'buttonUpdate', event: 'click'}], 
				postType: 'UpdateInterfaceIssue',
				instructions: [ 
					{action: 'toServer_DefinitionValue', definitionName: 'id_interfaceIssue', columnName: 'id_interfaceIssue'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_interface', columnName: 'id_interface'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textTitle',  columnName: 'name'},
					{action: 'toServer_ControlValue', type: 'slider', id: 'sliderSeverity', columnName: 'severity'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textIssueDetails',  columnName: 'issue'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textIssueResolution', columnName: 'resolution'},
				],
				cleanup: [
					{action: 'setDefinition_FromResultInsert', definitionName: 'id_interfaceIssue'},
					{action: 'reload'},
				],
			},
			
			{ 	//Severity slider changes
				handlers: [{controlId: 'sliderSeverity', event: 'input'},],
				instructions: [
					//{action: 'preventDefault'},
					{action: 'debug', message: 'fired'},
					{action: 'setSliderDescription', type: 'sliderDescription', id: 'sliderSeverity'},
					{action: 'lockControls'}
				],
				cleanup: [],
			},

			{	//Delete button clicked
				handlers: [{controlId: 'buttonDelete', event: 'click'},], 
				postType: 'DeleteInterfaceIssue',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_interfaceIssue', columnName: 'id_interfaceIssue'},
					{action: 'deleteDefinitionValue', definitionName: 'id_interfaceIssue'},
				],
				cleanup: [{action: 'reload'},],
			},


			{ 	//New system button clicked
				handlers: [{controlId: 'buttonNew', event: 'click'},],
				instructions: [
					{action: 'deleteDefinitionValue', definitionName: 'id_interfaceIssue'},
					{action: 'emptyControl', type: 'select', id: 'selectIssue'},
					{action: 'emptyControl', type: 'text', id: 'textTitle'},
					{action: 'emptyControl', type: 'slider', id: 'sliderSeverity'},
					{action: 'emptyControl', type: 'text', id: 'textIssueDetails'},
					{action: 'emptyControl', type: 'text', id: 'textIssueResolution'},
					{action: 'lockControls'}
				],
				cleanup: [],
			},



			{	//Issue select changes
				handlers: [{controlId: 'selectIssue', event: 'change'},],
				instructions: [{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectIssue', definitionName: 'id_interfaceIssue', dataAttr: 'id_interfaceIssue'},],
				cleanup: [{action: 'reload'},],
			},
			{	//Interface select changes
				handlers: [{controlId: 'selectInterface', event: 'change'},],
				instructions: [
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectInterface', definitionName: 'id_interface', dataAttr: 'id_interface'},
					{action: 'deleteDefinitionValue', definitionName: 'id_interfaceIssue'},
				],
				cleanup: [{action: 'reload'},],
			},
			{	//Close button
				handlers: [{controlId: 'buttonCancel', event: 'click'}], 
				instructions: [],
				cleanup: [{action: 'returnToLastModal'},],
			},
			{	//Handle elements being dropped
				handlers: [
					{controlId: 'droppableAffectedSystems div', event: 'drop'},
					{controlId: 'droppableSystemsUsingThisInterface div', event: 'drop'},
				],
				postType: 'UpdateSystemsAssociatedwithIssues',
				instructions: [
					{action: 'preventDefault'},
					{action: 'handleDrop'},
					{action: 'toServer_ControlValue', type: 'dropTargetContents', id: 'droppableAffectedSystems', dataAttr: 'id_system', columnName: 'affectedSystems'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_interfaceIssue', columnName: 'id_interfaceIssue'},
				],
				cleanup: [],
			},
			{	//Handle elements being dragged
				handlers: [
					{controlId: 'droppableAffectedSystems div', event: 'dragover'},
					{controlId: 'droppableSystemsUsingThisInterface div', event: 'dragover'},
				],
				instructions: [{action: 'preventDefault'},],
				cleanup: [],
			},
		]
	},

	selectOrganisation: {
		title: 'Select Organisation',
		formButtons: [
			{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},	
		],
		formFields: [
			{ type: 'organisation', id: 'pathAbove', text: `Path to Current Organisational Node: `},
			{ type: 'organisation', id: 'currentNode', text: `Current Organisational Node: `},
			{ type: 'organisation', id: 'childNodes', text: `Child Subordinates Nodes: `},
		],
		
		monitorChanges: [], 
		lockOnChange: [], //The ID of the controls to lock when editing an object
		unlockOnChange: [], //The ID of the controls to lock when editing an object
		iterations: [
			{
				type: 'Organisation',
				definitionFields: ['id_organisation'],
				continueOnUndefined: true,
				instructions: [
					{action: 'setDefinition_SingleValue_AtSpecificArrayIndex', id: 'id_organisation',  arrayIndex: 1, columnName: 'id_organisation'},
					{action: 'setDefinition_SingleValue_AtSpecificArrayIndexFirstIndex', id: 'parent', arrayIndex: 0, columnName: 'id_organisation'},
					{action: 'setControl_MultipleValues_AtSpecificArrayIndex', type: 'orgPath', id: 'pathAbove', modal: 'organisation', arrayIndex: 0, columnName: 'name'},
					{action: 'setControl_MultipleValues_AtSpecificArrayIndex', type: 'organisation', id: 'currentNode', modal: 'organisation', arrayIndex: 1, columnName: 'name'},
					{action: 'setControl_MultipleValues_AtSpecificArrayIndex', type: 'organisation', id: 'childNodes', modal: 'organisation', arrayIndex: 2, columnName: 'name'},
				],
			}
		],
		events: [
			{	//Handle clicks to node buttons in pathAbove or childNodes
				handlers: [
					{controlId: 'pathAbove button', event: 'click'},
					{controlId: 'childNodes button', event: 'click'},
				],
				instructions: [
					{action: 'setDefinition_FromClickedButton', id: 'pathAbove', dataAttr: 'id_organisation', definitionName: 'id_organisation'},
					{action: 'setLocalStorage_fromDefinition', localStorageName: 'currentOrganisation', definitionName: 'id_organisation'}
				],
				cleanup: [{action: 'reload'},],
			},
		]
	},
	export: {
		title: 'Export Data',
		formButtons: [ 
			//{type: 'cancel', id: 'buttonCancel', label: 'Close', initialState: 'unlock'},
			{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 
			{ type: 'buttons', buttons: [
				{ id: 'exportPNG', label: 'Export PNG'},
				{ id: 'exportJPG', label: 'Export JPG'},
				//{ id: 'exportSVG', label: 'Export SVG'}, //cytoscape SVG output is inadequate. TBC
				{ id: 'exportCSV', label: 'Export CSV'},
			]},
		],
		monitorChanges: [],
		lockOnChange: [],
		unlockOnChange: [], 
		iterations: [
		],
		events: [
			{
				handlers: [{controlId: 'exportPNG', event: 'click'}, ], 
				instructions: [],
				cleanup: [
					{action: 'launchFunction', functionName: 'savePNG'},
					{action: 'closeModal'},
				],
			},
			{
				handlers: [{controlId: 'exportJPG', event: 'click'}, ],
				instructions: [],
				cleanup: [
					{action: 'launchFunction', functionName: 'saveJPG'},
					{action: 'closeModal'},
				],
			},
			{
				handlers: [{controlId: 'exportSVG', event: 'click'}, ],
				instructions: [],
				cleanup: [
					{action: 'launchFunction', functionName: 'saveSVG'},
					{action: 'closeModal'},
				],
			},
			{
				handlers: [{controlId: 'exportCSV', event: 'click'}, ],
				instructions: [],
				cleanup: [
					{action: 'launchFunction', functionName: 'saveCSV'},
					{action: 'closeModal'},

				],
			},
		]
	},

	specificSystem: {
		title: 'Title',
		formButtons: [ 
			{type: 'submit', id: 'buttonGo', label: 'Go', initialState: 'unlock'},
			{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 
			{ type: 'select', id: 'selectSystem', label: 'System'},
		],
		monitorChanges: [],
		lockOnChange: [],
		unlockOnChange: [], 
		iterations: [
			{ //Get the all the systems
				type: 'AllSystems', 
				definitionFields: [], 
				continueOnUndefined: true,
				instructions: [ 
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'selectOptions', id: 'selectSystem', columnName: 'name', attr: {name: 'id_system', columnName: 'id_system'} },
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectSystem', definition: 'id_system', dataAttr: 'id_system', columnName: 'id_system'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectSystem', definition: 'id_system', dataAttr: 'id_system'},
				],
			},
		],
		events: [
			{	//Go button clicked
				handlers: [{controlId: 'buttonGo', event: 'click'},],
				instructions: [
					{action: 'resetDefinition'},
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectSystem', definitionName: 'id_system', dataAttr: 'id_system'},
					{action: 'setDefinition_SingleValue_FromConstant', definitionName: 'graph', value: 'standard'},
				],
				cleanup: [
					{action: 'setSessionStorageFromConstant', sessionStorageName: 'currentPage', value: 'specificSystem'},
					{action: 'setSessionStorageFromDefinition', sessionStorageName: 'id_system', definitionName: 'id_system'},
					{action: 'launchFunctionWithDefinition', functionName: 'commonGraph'},
					{action: 'closeModal'},
				],
			},
		]
	},
}


