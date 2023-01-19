

function defaultButtons(buttonList){
	buttonList.forEach((element) => {
		switch (element.type){
			case 'new':
				addButton('#mainModal .modal-footer', {type: 'info', id: 'mainModalAddNew', label: element.label});
			break;
			case 'submit':
				addButton('#mainModal .modal-footer', {type: 'submit', id: 'mainModalSubmit', label: element.label});
			break;
			case 'delete':
				addButton('#mainModal .modal-footer', {type: 'delete', id: 'mainModalDelete', label: element.label});
			break;
			case 'close':
				addButton('#mainModal .modal-footer', {type: 'close'});
			break;			
			default:
				debug(5, 'Unknown button requested in defaultButton');
		}
	})
}

/**
 * @description  
 * 
 */
function nodeSelectButton(id, image, name){
    var element = document.createElement('button');
    $(element).addClass('btn btn-secondary m-2');
    element.setAttribute('data-id', id);
    $(element).html(`<img src="./images/${image}" width="100" height="100"><br>${name}`);

    return element;
}

/**
 * @description Adds a button with image into the DOM at $selector
 * 
 */
function addIconButton($selector, image, name, data){

	if (data){
		var formElement = `<button class="btn btn-secondary m-2" data-${data.name}="${data.value}">`;
	} else {
		var formElement = '<button class="btn btn-secondary m-2">';
	}
	
	formElement += `<img src="./images/${image}" width="100" height="100"><br>${name}</button>`

	$($selector).append(formElement);
}

/**
 * @description Create a table based on the node selected
 * 
 */
function nodeTable($selector, node){
	debug(5, 'In nodeTable()');
	debug(3, node);

	var responseString = '<table id="nodeDetailsTable" class="table table-sm mx-1"><tbody>';

	graphTable[node.nodeType].forEach((element) => {
		if (element.columnName){
			switch (element.type){
				case 'link':
					if (node[element.columnName] == undefined || node[element.columnName] == ''){
						responseString += `<tr><th scope="row" class="text-secondary">${element.label}</th><td class="text-right">No Record</td></tr>`
					} else {
						responseString += `<tr><th scope="row" class="text-secondary">${element.label}</th><td class="text-right"><a target="_blank" href="${getReferenceURL(node[element.columnName])}">${node[element.columnName]}</a></td></tr>`
					}
					
				break;
				default:
					responseString += `<tr><th scope="row" class="text-secondary">${element.label}</th><td class="text-right">${node[element.columnName]}</td></tr>`
			}
			
		} else {
			//Separator
			
		}
	})

	responseString += `</tbody></table>`

	$($selector).replaceWith(responseString);
}

/**
 * @description Console logging helper
 * 
 * handle multiple paramaters, perhaps debug levels too
 */
function debug(...msg){
	//console.log(typeof msg[0])
	if (typeof msg[0] === 'number'){
		if (debugLevel >= msg[0]){
			for (var i = 1; i < msg.length; i++){
				switch(msg[0]){
					case 1:
						console.error(msg[i])
					break;
					case 2:
						console.warn(msg[i])
					break;
					case 3:
						console.info(msg[i])
					break;
					default:
						console.log(msg[i])
				}				
			}	
		}
	} else {
		if (debugLevel > 0){
			for (var i = 0; i < msg.length; i++){
				console.log(msg[i]);
			}	
		}
	}
}

/**
 * @description Button background toggling function
 * 
 */
function toggleButton($selector){
	if ($($selector).hasClass('btn-primary')){
		$($selector).addClass('btn-secondary').removeClass('btn-primary')
	} else (
		$($selector).addClass('btn-primary').removeClass('btn-secondary')
	)
}

/**
 * @description Adds a button to the modal at $selector
 * 
 * @param  {} selector
 * @param  {type, id, label} button
 */
function addButton($selector, button){
	switch (button.type){
		case 'submit':
			$($selector).append(`<button id="${button.id}" type="button" class="btn btn-primary">${button.label}</button>`);
			break;
		case 'delete':
			$($selector).append(`<button id="${button.id}" type="button" class="btn btn-danger">${button.label}</button>`);
			break;
		case 'close':
			$($selector).append(`<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>`);
			break;
		case 'cancel':
			$($selector).append(`<button id="${button.id}" type="button" class="btn btn-secondary">${button.label}</button>`);
			break;
		case 'info':
			$($selector).append(`<button id="${button.id}" type="button" class="btn btn-info">${button.label}</button>`);
			break;
  	}
	if (button.initialState == 'lock'){
		$('#' + button.id).prop('disabled', true)
	}
}

/**
 * @description Gets the value of form element specified at selector
 * 
 * @param  {} $selector
 * @param  {} properties
 */
function getFormElement($selector, properties){
	switch (properties.type){
		case 'params':
			//Get all the controls which are located within the provided #id (should be a <div>)

/*
					{title: 'Single Option', value: 'singleOption'},
						{title: 'Multiple Options', value: 'multiOption'},
						{title: 'True/False', value: 'boolean'},
						{title: 'Free Text', value: 'freeText'},
						{title: 'Number', value: 'number'},
*/

			const resultArr = []

			const singleOption = document.querySelectorAll(`${$selector} select:not([multiple])`)
			const multiOption = document.querySelectorAll(`${$selector} select[multiple]`)
			const boolean = document.querySelectorAll(`${$selector} input[type="checkbox"]`)
			const freeText = document.querySelectorAll(`${$selector} input[type="text"]`)
			//const number = document.querySelectorAll(`${$selector} input[type="text"]`)

			debug(5, multiOption);

			//Handle all singleOption controls
			singleOption.forEach((control) => {
				if (control.value == ''){ control.value = null}
				resultArr.push({id_paramDefinition: control.dataset.id_paramdefinition, value: control.value})
			})

			//Handle all multiOption controls
			multiOption.forEach((control) => {
				var selectedOptions = []
				debug(5, 'multiOption:', control.options)
				//Iterate through each option to determine which ones are selected
				for (var i=0; i<control.options.length; i++){
					if (control.options[i].selected == true){
						selectedOptions.push(control.options[i].value)
					}
				}

				resultArr.push({id_paramDefinition: control.dataset.id_paramdefinition, value: selectedOptions.join(',')})
			})

			//Handle all boolean controls
			boolean.forEach((control) => {
				debug(5, 'boolean', control, control.checked)
				//if (control. == ''){ control.value = null}
				resultArr.push({id_paramDefinition: control.dataset.id_paramdefinition, value: control.checked})
			})

			//Handle all freeText controls
			freeText.forEach((control) => {
				if (control.value == ''){ control.value = null}
				resultArr.push({id_paramDefinition: control.dataset.id_paramdefinition, value: control.value})
			})


			return resultArr
		break;
		case 'qtyYears':
			var qtyArr = []
			for (var i = 0; i < $($selector + ' [id^=formYears]').length; i++){
				qtyArr.push({year: $(`#formYears_${i}`).val(), quantity: $(`#formQuantity_${i}`).val()})
			}
			return qtyArr
		break;
		case 'selectedButton':
			var test = $($selector + ` button.btn-primary`).data(properties.attrName)
			debug(5, 'test' + test);
			return test
		break;
		case 'droppable':
			//Gets the list of indexes stored in the data attribute in columnName for each badge contained in the droppable div.

			var droppable = document.querySelectorAll(`${$selector} span`);
			var dataArr = [];
			
			switch (properties.source){
				case 'data-attr':
					droppable.forEach((element) => {
						dataArr.push($(element).data(`${properties.attr}`));
					})
					return dataArr;
				break;
				case 'text':
					droppable.forEach((element) => {
						dataString += element.textContent + ','
					})
				break;
				default:
					debug(5,'getFormElement droppable switch default. Shouldnt be here')
			}
			//Trim
			if (dataString.length > 0){ dataString = dataString.substring(0,dataString.length - 1);	}
			return dataString;
			break;
		case 'dropTargetContents':
			//Gets an array of all the dataAttr attributes associated with the elements contained within $selector
			var droppableElements = document.querySelectorAll($selector + ' span');
			var data = []

			if (droppableElements.length > 0){
				droppableElements.forEach((element) => {
					data.push($(element).data(properties.dataAttr));
				})				
			}

			return data;
			break;
		case 'select':
			if (properties.dataAttr){
				return $($selector + ' option:selected').attr(`data-${properties.dataAttr}`)
			} else {
				return $($selector + ' option:selected').val();
			}
		break;
		case 'number':
		case 'year':		
		case 'textarea':
		case 'text':
		case 'slider':
			return $($selector).val()
		break;

		case 'checkbox':
			if ($($selector).prop("checked")){
				return 1;
			} else {
				return 0;
			}
		break;
		case 'img':
		case 'image':
			var path = $($selector).attr('src');
			return path.substr(path.lastIndexOf('/') + 1)
			break;
		case 'selectedImage':
			var path = $($selector + ' button.btn-primary').data('image');
			debug(5, path)
			return path
			break;
		case 'radio':
		case 'radioGroup':
			var value = $($selector + ` [name=${properties.id}]:checked`).val()

			debug(5, `radioGroup is ` + value)
			
			if (value == undefined){
				return properties.default
			} else {
				return value
			}
			break;
		case 'trafficLightRadio':
			//Set focus to the current severity level
			return $($selector + ' button.btn-primary').attr('data-severity')


		break;
		case 'null':
		case 'heading':
			//No action required
		break;
		default:
			debug(`Switch default, shouldn't make it here in helpers.getFormElement() due to ${properties.type}`)
	}
}



/**
 * @description Sets the value of the form element provided at selector
 * 
 * @param  {} selector
 * @param  {} properties
 * @param  {} value
 */
function setFormElement($selector, properties, value){
	//debug(5, `setting: value of ${value} to:`, properties)
	switch (properties.type){
		case 'params': //Populate the provided container (a div) with parameter definitions and associated values, if they exist
			debug(5, 'in setFormElement params')

			var currentGroup = 0

			$($selector).append('<form>')

			if (value.length == 0) {
				debug(5,properties)
				$(`${$selector} form`).append(`<p>No parameters have been assigned to this type. Try defining parameters first.</p>`)
			}

			for(var i = 0; i < value.length; i++){

				//Check if this row indicates a new parameter group
				if (currentGroup != value[i].id_paramGroup){
					//Create the heading for this group
					$(`${$selector} form`).append(`<h4>${value[i].groupName}</h4>`)

					//Store the new parameter group id
					currentGroup = value[i].id_paramGroup
				}

				//Add the parameter name, relevent control and current values to the modal
				switch (value[i].paramType){
					case 'boolean':

						$(`${$selector} form`).append(`
						<fieldset class="form-group row">
							<legend class="col-form-label col-sm-4 float-sm-left pt-0">${value[i].paramName}</legend>
							<div class="col-sm-8">
						  		<div class="form-check form-check-inline">
									<input class="form-check-input" type="checkbox" name="boolean_${value[i].id_paramDefinition}" id="boolean_${value[i].id_paramDefinition}" data-id_paramDefinition="${value[i].id_paramDefinition}">
								</div>
							</div>
					 	</fieldset>`)
						
						//Set the controls
						if (value[i].value !== null){
							if (value[i].value === "true"){$(`#boolean_${value[i].id_paramDefinition}`).prop('checked', 'true')}
						}

						break;
					case 'freeText':
					case 'number':
						$(`${$selector} form`).append(`
						<div class="form-group row">
							<label for="freeText_${value[i].id_paramDefinition}" class="col-sm-4 col-form-label">${value[i].paramName}</label>
							<div class="col-sm-8">
								<input type="text" class="form-control" id="freeText_${value[i].id_paramDefinition}" data-id_paramDefinition="${value[i].id_paramDefinition}">
							</div>
						</div>`)

						//Set the control
						if (value[i].value !== null){ $(`#freeText_${value[i].id_paramDefinition}`).val(value[i].value)}
						break;
					
					case 'singleOption':
						//debug(5, 'in singleOption with', value[i])
						$(`${$selector} form`).append(`
						<div class="form-group row">
							<label for="singleOption_${value[i].id_paramDefinition}" class="col-sm-4 col-form-label">${value[i].paramName}</label>
							<div class="col-sm-8">
								<select class="form-control" id="singleOption_${value[i].id_paramDefinition}" data-id_paramDefinition="${value[i].id_paramDefinition}"></select>
							</div>
						</div>`)

						//Populate the available options
						var options = value[i].options.split(',')

						$(`#singleOption_${value[i].id_paramDefinition}`).append(`<option value="null"></option>`)
						options.forEach((option) => {
							$(`#singleOption_${value[i].id_paramDefinition}`).append(`<option value="${option}">${option}</option>`)
						})

						//Set the control
						if (value[i].value !== null){
							$(`#singleOption_${value[i].id_paramDefinition}`).val(value[i].value)
						} else {
							$(`#singleOption_${value[i].id_paramDefinition}`).val("null")
						}

						break;
					case 'multiOption':
						//debug(5, 'in multiOption with', value[i])
						$(`${$selector} form`).append(`
						<div class="form-group row">
							<label for="multiOption_${value[i].id_paramDefinition}" class="col-sm-4 col-form-label">${value[i].paramName}</label>
							<div class="col-sm-8">
								<select multiple class="form-control" id="multiOption_${value[i].id_paramDefinition}" data-id_paramDefinition="${value[i].id_paramDefinition}"></select>
							</div>
						</div>`)

						//Populate the available options
						var options = value[i].options.split(',')

						options.forEach((option) => {
							$(`#multiOption_${value[i].id_paramDefinition}`).append(`<option value="${option}">${option}</option>`)
						})

						//Set the control
						if (value[i].value !== null){
							var controlValues = value[i].value.split(',')

							$(`multiOption_${value[i].id_paramDefinition}`).val(controlValues)

							controlValues.forEach((controlValue) => {
								debug(5, 'trying to select ' + controlValue)
								$(`#multiOption_${value[i].id_paramDefinition} option[value='${controlValue}']`).prop('selected', true)
							})							
						}


						break;
					

						break;
					default:
						debug(5, 'in default with', value[i])
						break;
				}
			}
			break;
		case 'qtyYears':
			if (value.length > 0){ //Entries exist
				for (var i = 0; i < value.length; i++){
					addQuantityFormControl($selector, i, {year: value[i].year, quantity: value[i].quantity}, false)
				}
			} else {
				//addQuantityFormControl($selector, 0, {year: 2020, quantity: 1}, false)
			}
			break;
		case 'droppableElements':
			if (value == ''){
				$($selector + ' div.card-body').empty();
			} else {
				value.forEach((element) => {
					//$($selector + ' div.card-body').append(`<span id="draggable_${element[properties.attr.name]}" data-${properties.attr.name}="${element[properties.attr.columnName]}" class="badge mx-1 bg-success text-white" draggable="true" ondragstart="dragStart(event)">${element[properties.columnName]}</span>`);
					$($selector + ' div.card-body').append(`<span id="draggable_${element[properties.attr.name]}" data-${properties.attr.name}="${element[properties.attr.columnName]}" class="badge mx-1 bg-success text-white" draggable="true" ondragstart="dragStart(event)">${element[properties.columnName]}</span>`);
				})
			}
			break;
		case 'moveDroppableElements':
			var sourceElements = document.querySelectorAll('#' + properties.sourceId + ' span');
			//debug(5, 'moveDroppableElements', properties, 'val: ', value)
			if (Array.isArray(value)) {
				value.forEach((element) => {
					//debug(5, 'element', element)
					//Iterate through each source element and move to the target selector's .card-body
					sourceElements.forEach((element2) => {
						//debug(5, element2)

						if (element2.dataset[properties.attr.name] == element[properties.attr.columnName]){
							$($selector + ' .card-body').append(element2);
						}
					})
				})
			}
			break;
		case 'iconButtonSelected':
			//debug(5, 'in iconButtonSelected', properties, 'value ' + value)

			$($selector + ` button[data-${properties.attrName}="${value}"]`).addClass('btn-primary').removeClass('btn-secondary')
			break;
		case 'iconButtonChooser': //For the icon chooser modal

			value.forEach((element) => {
				var domElement = document.createElement('button');
				$(domElement).addClass('btn btn-secondary m-2');
				$(domElement).attr('data-image', element);
				$(domElement).html(`<img src="${imagePath + element}" width="100" height="100"><br>${element}`);
				$($selector).append(domElement);				
			})

			break;
		case 'chosenIconBySrc':
			//debug(5, 'Selecting current icon: ' + value)
			$($selector + ` img[src="${imagePath + value}"]`).parent().addClass('btn-primary').removeClass('btn-secondary')
			break;
		case 'iconButton':
			//debug(5, 'iconButton', properties, value)

			var formElement = '';

			value.forEach((element) => {
				if (properties.attr) { formElement = `<button class="btn btn-secondary m-2" data-${properties.attr.name}="${element[properties.attr.name]}">`}
				if (element.image !== undefined){
					formElement += `<img src="./images/${element.image}" width="100" height="100"><br>${element.name}`
				}
				formElement += '</button>'
				
				$($selector).append(formElement);
			})

			break;
		case 'moveDroppableElements':
		case 'droppable':
			var sourceElements = document.querySelectorAll('#' + properties.source + ' span');
			if (value) {
				value.forEach((element) => {
					//Iterate through each source element and move to the target selector's .card-body
					sourceElements.forEach((element2) => {
						if (element2.dataset[properties.dataAttr] == element[properties.dataAttr]){
							$($selector + ' .card-body').append(element2);
						}
					})
				})				
			}
			break;
		case 'select': //Assumes select has been filled previously and sets the value based on the passed attribute
			if(properties.dataAttr){
				$($selector + ` option[data-${properties.dataAttr}="${value}"]`).prop('selected', true);
			} else {
				$($selector).val(value);
			}
			
			if (value == ''){
				//debug(2,`Something is trying to empty the select ${properties.id}`)
				$($selector).empty();
			}
			break;
		case 'selectOptions': //Fills a select
			//debug(5, value)
			if(value.length > 0){
				if(properties.attr){
					value.forEach((element) => {
						$($selector).append(`<option data-${properties.attr.name}="${element[properties.attr.columnName]}">${element[properties.columnName]}</option>`)
					})
				} else {
					value.forEach((element) => {
						$($selector).append(`<option>${element}</option>`)
					})
				}				
			} else {
				//Disable the select if there were no values passed
				$($selector).prop('disabled', true)
			}
			break;
		case 'selectOptions_MultipleFields': //Fills a select, with multiple values
			//sdebug(5, value)
			if(properties.attr){
				value.forEach((element) => {
					if (element[properties.columnName[1]] === null || element[properties.columnName[1]] === ''){
						$($selector).append(`<option data-${properties.attr.name}="${element[properties.attr.columnName]}">${element[properties.columnName[0]]}</option>`)
					} else {
						$($selector).append(`<option data-${properties.attr.name}="${element[properties.attr.columnName]}">${element[properties.columnName[0]]} [${element[properties.columnName[1]]}]</option>`)
					}
				})
			} else {
				value.forEach((element) => {
					$($selector).append(`<option>${element}</option>`)
				})
			}
			break;
		case 'heading':
			if (!properties.noUpdate){
				$($selector).text(value)
			}
			break;
		case 'headingMultiple':
			debug(5, value)
			if (value[properties.columnName[1]] === null || value[properties.columnName[1]] === ''){
				$($selector).text(`${value[properties.columnName[0]]}`)
			} else {
				$($selector).text(`${value[properties.columnName[0]]} [${value[properties.columnName[1]]}]`)
			}

			
				
			break;
		case 'slider':
			if(value == ''){ value = 0 }
			$($selector).val(value)
			updateSlider($selector, value)
			break;
		case 'sliderDescription':
			updateSlider($selector, $($selector).val())
			break;
		case 'textarea':
		case 'text':
		case 'number':
			$($selector).val(value)
			break;
		case 'textList': //Comma separated list
			var text = '';
			//debug(5, 'in textList', value);
			value.forEach((element) => {text += element[properties.columnName] + ','})
			$($selector).val(text.substring(0, text.length - 1))
			break;
		case 'year':
			break;
		case 'checkbox':
			switch (value){
				case 1:
				case '1':
					$($selector).prop("checked", true);
					break;
				case 0:
				case '0':
				case '':
					$($selector).prop("checked", false);
					break;
				default:
					debug(1, `Value ${value} received in setFormElement for checkbox was unexpected`)
			}
			break;
		case 'img':
		case 'image':
			if (value == '') { value = 'tba.svg'}
			$($selector).attr('src', imagePath + value)
			break;
		case 'trafficLightRadio':
			//Set focus to the current severity level
			$($selector + ' button')
				.removeClass('btn-primary')
				.addClass('btn-light')

			switch (value){
				case 'critical':
					$($selector + ' button[data-severity="critical"')
						.addClass('btn-primary')
						.removeClass('btn-light')
				break;
				case 'warning':
					$($selector + ' button[data-severity="warning"')
						.addClass('btn-primary')
						.removeClass('btn-light')
				break;
				case 'notice':
					$($selector + ' button[data-severity="notice"')
						.addClass('btn-primary')
						.removeClass('btn-light')
				break;
				default:
					debug('setFormElement switch default trafficLightRadio should not make it here due to value of ' + value)
			}
			break;
		case 'radioGroup':
			debug(5, 'Setting radioGroup with value: ' + value)
			$($selector + ` input[value="${value}"]`).prop('checked', true)

			break;
		case 'orgPath':
			var html = '';

			if (value.length == 0){
				html = 'Not Applicable'
			} else {
				value.forEach((element) => {
					//html = `<button href="#" onclick="commonModal({modal: '${properties.modal}', id_organisation: ${element.id_organisation}})" class="badge">${element.name}</button><span>&#8594;</span>` + html
					html = `<button href="#" data-id_organisation="${element.id_organisation}" class="badge">${element.name}</button><span>&#8594;</span>` + html
				})
			}
			$('#' + properties.id).html(html)

			break;
		case 'organisation':
			var html = '';

			if (value.length == 0){
				html = 'Not Applicable'
			} else {
				value.forEach((element) => {
					html += `<button href="#" data-id_organisation="${element.id_organisation}" class="badge mx-1">${element.name}</button>`;
				})				
			}
			$('#' + properties.id).html(html)
			break;
		case 'null':
			//No action required
			break;

		default:
			debug(5, `Switch default, shouldn't make it here in helpers.setFormElement() due to:`, properties)
	}
}

/**
 * @description Inserts form elements into the DOM.
 * 
 * @param  {type, id, label, value, options{} } properties
 */
function addFormElement($selector, properties){

	var formElement = '';
	switch (properties.type){
		
		case 'button':
			//formElement += `<div class="form-group">`;
			formElement += `<button id="${properties.id}" class="btn btn-info">${properties.label}</button>`
			//formElement += `</div>`;
			break;
		
		case 'buttons':
			formElement += `<div class="row justify-content-left">`;
			properties.buttons.forEach((element) => {
				if (element.initialState == 'lock'){
					formElement += `<div class="col-6 my-2"><button id="${element.id}" class="btn btn-info btn-block" disabled>${element.label}</button></div>`
				} else {
					formElement += `<div class="col-6 my-2"><button id="${element.id}" class="btn btn-info btn-block">${element.label}</button></div>`
				}
			})
			formElement += `</div>`;
			break;		
		
		case 'checkbox':
			formElement += `<div class="form-group">`;
			formElement += `<div class="form-check">`;
			if (properties.value == 1){
				formElement += `<input id="${properties.id}" type="checkbox" class="form-check-input" checked>`;
			} else {
				formElement += `<input id="${properties.id}" type="checkbox" class="form-check-input">`;
			}
			formElement += `<label for="${properties.id}" class="form-check-label">${properties.label}</label>`;
			formElement += `</div></div>`;
			break;

		case 'container':
			formElement += `<div id="${properties.id}"></div>`;
			break;
		case 'div_links':
			formElement += `<span id="${properties.id}"></span>`
			break;
		case 'droppable':
			formElement += `<h5 class="my-2">${properties.label}</h5>
			<div id="${properties.id}" class="card bg-light border-secondary">
				<div class="card-body" ondrop="dragDrop(event, this)" ondragover="dragOver(event)"></div>
			</div>`

			break;
		case 'droppable2':																					//To replace droppable
			formElement += `<h5 id="${properties.id}_heading" class="my-2">${properties.label}</h5>
			<div id="${properties.id}" class="card bg-light border-secondary">
				<div class="card-body"></div>
			</div>`
			break;
		case 'heading':
			formElement += `<h5`;
			if (properties.id){	formElement += ` id="${properties.id}"` }
			if (properties.align){	formElement += ` class="text-${properties.align}"` }
			formElement += `>`;
			if (properties.text){ formElement += properties.text }
			formElement += `</h5>`;
			break;			
		case 'img':
			formElement += `<div class="text-center">`;
			formElement += `<img id="${properties.id}" src="${imagePath}tba.svg" width="200px" height="200px">`;
			//formElement += `<button id="${properties.id}Button" type="button" class="btn btn-primary mx-2">Assign Icon</button>`;			//Need to work on this to make it more generic
			formElement += `</div>`
			break;
		case 'note':
			if (properties.inline){
				formElement += `<p>${properties.text}<span id="${properties.inline.id}"></span></p>`;
			} else {
				formElement += `<p>${properties.text}</p>`;
			}
			break;
		case 'null':
			//No action required
			break;
		case 'number':
			formElement += `<div class="form-group">`;
			formElement += `<label for="${properties.id}">${properties.label}</label>`;
			if (properties.value){
				formElement += `<input id="${properties.id}" type="number" class="form-control" value="${properties.value}">`;
			} else {
				formElement += `<input id="${properties.id}" type="number" class="form-control" value="">`;
			}
			
			formElement += `</div>`;
			break;
		case 'organisation':
			formElement += `<p>${properties.text}<span id="${properties.id}"></span></p>`;
			break;		
		case 'option':
			//Load options into the select identified by selector
			if (properties.data){
				$($selector).append(`<option data-${properties.data.name}="${properties.data.value}">${properties.label}</option>`)
			} else {
				$($selector).append(`<option>${properties.label}</option>`)
			}
			
			break;
		case 'qtyYears':	
			var nextIndex = $($selector + ' [id^=formYears]').length;
			if (nextIndex == 0){
				var year = 2020
			} else {
				var year = parseInt($($selector + ' [id^=formYears]').last().val()) + 1;
			}
			addQuantityFormControl($selector, nextIndex, {year: year, quantity: 0}, false)
			break;
		case 'radio':
			debug(2, 'radio called in helpers.addFormElement()')
		case 'radioGroup':
			formElement += `<div id="${properties.id}" class="form-group">`;

			properties.options.forEach((element) => {
				formElement += `<div class="form-check">`;
				formElement += `<input class="form-check-input" type="radio" name="${properties.id}" id="${properties.id}_${element.id}" value="${element.id}">`;
				formElement += `<label class="form-check-label" for="${properties.id}_${element.id}">${element.label}</label>`;
				formElement += `</div>`;
			})
			formElement += `</div>`;


		/*
			formElement += `<div id="${properties.id}" class="btn-group">`;

			formElement += `<button class="btn btn-light mx-2" data-severity="critical"><img src="./assets/critical.png" width="30px"><br>Critical</button>`
			formElement += `<button class="btn btn-light mx-2" data-severity="warning"><img src="./assets/warning.png" width="30px"><br>Warning</button>`
			formElement += `<button class="btn btn-light mx-2" data-severity="notice"><img src="./assets/notice.png" width="30px"><br>Notice</button>`

			formElement += `</div>`;
			*/
			break;
		case 'radioOld':
			debug(2, 'radioOld called in helpers.addFormElement()')
			formElement += `<div id="${properties.id}" class="form-group">`;

			properties.options.forEach((element) => {
				formElement += `<div class="form-check form-check-inline">`;
				formElement += `<input class="form-check-input" type="radio" name="${properties.id}" id="${properties.id}_${element}" value="${element}" data-severity="${element.toLowerCase()}">`;
				formElement += `<label class="form-check-label" for="${properties.id}_${element}">${element}</label>`;
				formElement += `</div>`;
			})
			formElement += `</div>`;
			break;
		case 'select':
			formElement += `<div class="form-group"><label for="${properties.id}">${properties.label}</label>`;
			if (properties.multiple){
				formElement += `<select id="${properties.id}" multiple rows="10" class="form-control">`;
			} else {
				formElement += `<select id="${properties.id}" class="form-control">`;
			}

			if (properties.options) {
				properties.options.forEach((element) => {
					if (properties.value == element){
						formElement += `<option selected>${element}</option>`;
					} else {
						formElement += `<option>${element}</option>`;
					}
				})
			}
			formElement += `</select></div>`;
			break;
		case 'slider':
			formElement += `<div><label for="${properties.id}">Severity</label><br/><input type="range" id="${properties.id}" name="${properties.id}" min="0" max="${properties.max}"><span id="${properties.id}_desc" class="mx-3"></span></div>`
			break;			
		case 'text':
			formElement += `<label for="${properties.id}">${properties.label}</label>`;
			formElement += `<div class="input-group mb-3">`;
			
			if (properties.value){
				if(properties.append){
					formElement += `<input id="${properties.id}" type="text" class="form-control" aria-describedby="${properties.append.id}" value="${properties.value}">`;
					formElement += `<div class="input-group-append"><span class="input-group-text" id="${properties.append.id}">${properties.append.label}</span></div>`;
				} else {
					formElement += `<input id="${properties.id}" type="text" class="form-control" value="${properties.value}">`;
				}
				
			} else {
				if(properties.append){
					formElement += `<input id="${properties.id}" type="text" class="form-control" aria-describedby="${properties.append.id}" value="">`;
					formElement += `<div class="input-group-append"><span class="input-group-text" id="${properties.append.id}">${properties.append.label}</span></div>`;
				} else {
					formElement += `<input id="${properties.id}" type="text" class="form-control" value="">`;
				}
			}
			//Append any inputs to the text box

			formElement += `</div>`;
			break;
		case 'textarea':
			var rows = 4
			if (properties.rows){
				rows = properties.rows
			}
			formElement += `<div class="form-group">`;
			formElement += `<label for="${properties.id}">${properties.label}</label>`;
			formElement += `<textarea id="${properties.id}" class="form-control" rows="${rows}"></textarea>`;
			formElement += `</div>`
			break;
		case 'year':
			formElement += `<div class="form-group">`;
			formElement += `<label for="${properties.id}">${properties.label}</label>`;
			formElement += `<input id="${properties.id}" type="number" class="form-control" min="2000" max="2099" value="">`;
			formElement += `</div>`;
			break;
		default:
			debug(`Switch default, shouldn't make it here in helpers.addFormElement() with ${properties.type}`)

	}

	//Insert the element into the DOM
	$($selector).append(formElement);

	//Determine if the form should be locked
	if (properties.initialState == 'lock'){ $('#' + properties.id).prop('disabled', true) }
}


/**
 * @description Inserts form elements into the DOM.
 * 
 * @param  {type, id, label, value, options{} } properties
 */
 function deleteFormElement($selector, properties){

	var formElement = '';

	switch (properties.type){
		case 'qtyYears':
			
			$($selector + ' > div').last().remove()

			/*
			var html = `<div id="inputDiv_${index}" class="form-row my-2">
							<div class="col">
								<input id="formYears_${index}" type="number" class="form-control" value="${details.year}">
							</div>
							<div class="col">
								<input id="formQuantity_${index}" type="number" class="form-control" value="${details.quantity}">
							</div>
						</div>`
			*/

			break;
		default:
			debug(`Switch default, shouldn't make it here in helpers.deleteFormElement() with ${properties.type}`)

	}
}


/**
 * @description Validates a form control and returns the value.
 * 
 * @param  {} selector
 * @param  {type, id, label, value, options{} } properties
 */
function validate(selector, properties){
	switch (properties.type){
		case 'select':

			break;

		case 'number':
			var value = $(selector).val();
			if (typeof value == 'number'){
				return value;
			}
			break;
		case 'year':
			var value = $(selector).val();
			if (value > 1980 && value < 2100){
				return value;
			}

			break;
			
		case 'text':

			break;
		case 'checkbox':

			break;
		default:
			return {msg: 'Value was wrong'};
	}
}

/**
 * @description  
 * 
 */
function addQuantityFormControl($selector, index, details, after = false){
	var html = `<div id="inputDiv_${index}" class="form-row my-2">
					<div class="col">
						<input id="formYears_${index}" type="number" class="form-control" value="${details.year}">
					</div>
					<div class="col">
						<input id="formQuantity_${index}" type="number" class="form-control" value="${details.quantity}">
					</div>
				</div>`
	if (after) {
		$(html).insertAfter($selector);
	} else {
		$($selector).append(html);
	}
}


/**
 * @description Creates an event handler for the buttons which swap options between two selects
 * 
 * @param  {} buttonSelector
 * @param  {} sourceSelector
 * @param  {} destinationSelector
 */
function swapSelectOptions(buttonSelector, sourceSelector, destinationSelector){

	//Event: Inserted button click
	$(buttonSelector).unbind();
	$(buttonSelector).click(() => {

		var selectedItems = $(`${sourceSelector} option:selected`);
		if (selectedItems.length > 0){
			$(destinationSelector).append($(selectedItems).clone())
			$(selectedItems).remove();
		}
	})
}


/**
 * @description Add badge elements to the DOM at $selector
 * 
 * @param  {} $selector
 * @param  {type, msg} badge
 */
 function addBadge($selector, badge){
	switch (badge.info){
		case 'success':
			$($selector).append(`<span class="badge rounded-pill bg-success text-white">${badge.msg}</span>`);
		break;
	  	
		case 'warning':
			$($selector).append(`<span class="badge rounded-pill bg-warning">${badge.msg}</span>`);
		break;
		case 'error':
		case 'failure':
			$($selector).append(`<span class="badge rounded-pill bg-danger text-white">${badge.msg}</span>`);
		break;
	}
}

function addMultipleBadges($selector, badge, json){
	var arr = JSON.parse(json)
	arr.forEach((element) => {
		addBadge($selector, {msg: element, info: badge.info});
	})
}

/**
 * @description Add dragable badges to the DOM at $selector
 * 
 * @param  {} $selector
 * @param {} properties
 */
 function addDragableBadge($selector, text, dataAttrName, dataAttrValue){

	$($selector).append(`<span id="drag_${dataAttrValue}" data-${dataAttrName}="${dataAttrValue}" class="badge mx-1 bg-success text-white" draggable="true" ondragstart="dragStart(event)">${text}</span>`);

	//$($selector).append(`<span id="drag_${index}" data-${dataAttr}="${index}" class="badge mx-1 bg-success text-white" draggable="true" ondragstart="dragStart(event)">${text}</span>`);

}
function addDragableBadge2($selector, properties){
	//text: 			The text to display on the badge
	//dataAttrName: 	The name of the data-attribute
	//dataAttrValue:	The value to associate with the data-attribute

	$($selector).append(`<span id="draggable_${properties.dataAttrValue}" data-${properties.dataAttrName}="${properties.dataAttrValue}" class="badge mx-1 bg-success text-white" draggable="true" ondragstart="dragStart(event)">${properties.text}</span>`);
}


/**
 * @description Returns the URL to enable the user to quickly bring up related documents. Can
 * be changed to an Objective reference.
 * 
 * @param  {} $selector
 * @param  {type, msg} badge
 */
function getReferenceURL(reference){
	return `./assets/${reference}`
}


/**
 * @description Drag/Drop Handlers
 * 
 */
function dragStart(ev){
	 // Add the target element's id to the data transfer object
	 //debug(5, 'in dragstart', ev)
	 //ev.dataTransfer.setData("draggableElement", ev.target.id);
	 ev.dataTransfer.setData("draggableElement", ev.target.id);
}

function dragOver(ev) {
	ev.preventDefault();
}

function dragDrop(ev,el) {
	ev.preventDefault();
	// Get the id of the target and add the moved element to the target
	const data = ev.dataTransfer.getData("draggableElement");
	el.appendChild(document.getElementById(data));
}

function breadcrumbs($selector, details){

	var breadcrumbArr = [];
	var breadcrumbHtml = '<nav aria-label="breadcrumb"><ol class="breadcrumb">';
	//var breadcrumbHtml = `<nav style="--bs-breadcrumb-divider: '>';" aria-label="breadcrumb"><ol class="breadcrumb">`;


	//Start by pushing the detail of each breadcrumb into the array

	switch (details.type){
		case 'System':
			breadcrumbArr.push({ name: 'System', active: true, data: [{ key: 'id_system', value: details.id_system }]})
		break;
		case 'UpdateInterface':
			breadcrumbArr.push({ name: 'Interface', active: true, data: []})
		break;
		case 'SystemInterface':
			breadcrumbArr.push({ name: 'System', active: false, module: 'updateSystemsModal', data: [details.id_system]})
			breadcrumbArr.push({ name: 'System Interfaces', active: true, data: [] })
		break;
		case 'Network':
			breadcrumbArr.push({ name: 'System', active: false, module: 'updateSystemModal', data: [{ key: 'id_system', value: details.id_system }]})
			breadcrumbArr.push({ name: 'System Interface', active: false, module: 'updateSystemInterfacesModal', data: [{ key: 'id_system', value: details.id_system },{ key: 'id_ISMap', value: details.id_ISMap }]})
			breadcrumbArr.push({ name: 'Map Links', active: true, data: []})
		break;
		case 'UpdateNetwork':
			breadcrumbArr.push({ name: 'Links', active: true, data: []})
		break;
		case 'IssuesSystemInterface':
			breadcrumbArr.push({ name: 'System', active: false, module: 'updateSystemModal', data: [{ key: 'id_system', value: details.id_system }]})
			breadcrumbArr.push({ name: 'System Interface', active: false, module: 'updateSystemInterfacesModal', data: [{ key: 'id_system', value: details.id_system },{ key: 'id_ISMap', value: details.id_ISMap }]})
			breadcrumbArr.push({ name: 'Issue', active: true, data: []})
		break;
		case 'Quantities':
			breadcrumbArr.push({ name: 'System', active: false, module: 'updateSystemsModal', data: [{ key: 'id_system', value: details.id_system }], id: details.id_system})
			breadcrumbArr.push({ name: 'System Quantities', active: true, data: [] })
		break;
		case 'AssignSubsystems':
			breadcrumbArr.push({ name: 'System', active: false, module: 'updateSystemsModal', data: [details.id_system]})
			breadcrumbArr.push({ name: 'Assign Subsystems', active: true, data: [] })
		break;
		default:
			debug(`Breadcrumb switch default. Shouldn't make it here`)
	}

	//Produce the HTML
	breadcrumbArr.forEach((element) => {
		/*var paramData = '{ '
		element.data.forEach((element2) => {
			paramData += `${element2.key}: ${element2.value},`
		})
		paramData += '}'
		

		if (element.active){
			breadcrumbHtml += `<li class="breadcrumb-item active" aria-current="page">${element.name}<li>`;
		} else {
			breadcrumbHtml += `<li class="breadcrumb-item"><a href="#" onclick="${element.module}(${paramData})">${element.name}</a></li>`;
		}
		*/
		//debug(5, 'breadcrumb:', element)

		if (element.active){
			breadcrumbHtml += `<li class="breadcrumb-item active" aria-current="page">${element.name}<li>`;
		} else {
			breadcrumbHtml += `<li class="breadcrumb-item"><a href="#" onclick="${element.module}(${element.data[0]})">${element.name}</a></li>`;
		}

	})
	breadcrumbHtml += `</ol></nav>`

	$($selector).before(breadcrumbHtml)
}

/**
 * @description 
 * 
 * @param [] toEnable
 * @param [] toDisable
 * 
 */
function controlState(toEnable, toDisable){

	if (toEnable){
		toEnable.forEach((element) => {
			$(element).prop('disabled', false);
		})
	}

	if (toDisable){
		toDisable.forEach((element) => {
			$(element).prop('disabled', true);
		})
	}
}


function prepareModal(title, empty = true){
	if (empty){
		$('#mainModal .modal-body').empty();
		$('#mainModal .modal-body').append('<form></form>');
		$('#mainModal .modal-footer').html('<div class="warning-holder"></div>');
		$('#mainModalTitle').text(title);
		$('#mainModal').modal('show');	
	} else {
		$('#mainModal .warning-holder').empty();
	}
}

//Populate the primary select for the modal
async function populatePrimarySelect(callback, properties){

	let subjectSelectExists = false;
	//debug(5, form[properties.formReference][0].type)
	//Only process a select if it appears as the first entry in the form's definition
	if (form[properties.formReference][0].type == "select"){
		var subjectSelect = `#${form[properties.formReference][0].id}`
		subjectSelectExists = true;
	}
	
	var postData = { type: properties.postType }

	//Add additional postData, if present
	if (typeof properties.postData != 'undefined'){
		properties.postData.forEach((element) => {
			postData[element.key] = element.value;
		})
	}

	await $.post('select.json', postData, (result) => {
		debug(3, 'Passed to select.json: ', postData);
		debug(3, 'Response: ', result)

		if (result.msg){
			//An error was passed
			callback(-1, {info: 'failure', msg: `There was an error. Check the console.`});
		} else {
			if (subjectSelectExists){ //Handle populating of the select
				result.forEach((element) => {
					//Populate the primary select on the page
					$(subjectSelect).append(`<option data-${properties.key}="${element[properties.key]}">${element.name}</option>`)
					
					//Check if the current item should be populated across the remaining fields
					if (properties.subjectId == element[properties.key]){
						
						$(`#${form[properties.formReference][0].id} option[data-${properties.key}="${element[properties.key]}"]`).prop('selected', true);

						//Populate the form
						form[properties.formReference].forEach((element2) => {
							if (element2.columnName){
								setFormElement('#' + element2.id, element2, element[element2.columnName]) 
							}
						})
					}
				})
				//Event: Select changes
				$(subjectSelect).unbind();
				$(subjectSelect).change(() => {
					$('#mainModal').modal('hide');
					callback($(`#${form[properties.formReference][0].id} option:selected`).attr(`data-${properties.key}`))
				})
			} else { //Populating of a select is unnecessary
				result.forEach((element) => {
					//Populate the form
					form[properties.formReference].forEach((element2) => {
						if (element2.columnName){ 
							setFormElement('#' + element2.id, element2, element[element2.columnName]) 
						}
					})
				})
			}
		}
	})		
}

/**
 * @description  
 * 
 */
 async function populateSelect($selector, postData, data, callback){
	 debug(5,data)

	await $.post('select.json', postData, async (result) => {
		debug('Passed to select.json: ', postData);
		debug('Response: ', result)

		//Check the result
		if (result.msg){
			//An error was passed

		} else {
			
			result.forEach((element) => {
				if (data){
					debug(5, element)
					addFormElement($selector, {type: 'option', label: element.name, data: {name: data, value: element[data] }})
				} else {
					addFormElement($selector, {type: 'option', label: element.name})
				}
			})

			if (data) {	$(`${$selector} option[data-${data.attr}="${data.value}"]`).prop('selected', true) }

			if (callback) { callback() };
			
		}
	})
}

function deleteEntry(callback, properties){

	//Handle delete confirmation
		



	const postData = { type: 'Delete' + properties.postType }

	//Check if form submission includes an ID to delete
	if(properties.subjectId > 0){
		postData[properties.key] = properties.subjectId
	} else {
		callback(0, {info: 'failure', msg: `There was an error. An ID is required to delete and entry.`})
	}

	//Load issue details into postData
	form[properties.formReference].forEach((element) => {
		if (element.columnName){ postData[element.columnName] = getFormElement('#' + element.id, element) }
	})
	
	//Submit the data
	$.post('update.json', postData, (result) => {
		debug(3,'Passed to update.json: ', postData);
		debug(3,'Response: ', result)

		//Check the result
		if (result.msg){
			//An error was passed
			callback(properties.subjectId,{info: 'failure', msg: `There was an error. Check the console.`});
		} else {
			//Check if entry was a new entry
			if (result.affectedRows == 1){
				//Deletion was successful
				$('#mainModal').modal('hide');
				callback(1, {info: 'success', msg: `The '${postData.name}' record was successfully deleted.`});
			}
		}
	})
}


function saveEntry(callback, properties){

	const postData = { type: properties.postType }

	//Check if form submission is an update
	if(properties.subjectId > 0){ postData[properties.key] = properties.subjectId }

	//Load form details into postData
	form[properties.formReference].forEach((element) => {
		if (element.columnName){ postData[element.columnName] = getFormElement('#' + element.id, element) }
	})

	//Load any additional data into postData
	debug(5,properties)
	if (properties.postData){
		properties.postData.forEach((element) => {
			postData[element.key] = element.value;
		})		
	}

	//Submit the data
	$.post('update.json', postData, (result) => {
		debug(3,'Passed to update.json: ', postData);
		debug(3,'Response: ', result)

		//Check the result
		if (result.msg){
			//An error was passed
			callback(properties.subjectId,{info: 'failure', msg: `There was an error. Check the console.`});
		} else {
			//Check if entry was a new entry
			if (result.insertId == 0){
				//Submission was an update
				$('#mainModal').modal('hide');
				callback(properties.subjectId, {info: 'success', msg: `The '${postData.name}' record was successfully updated.`});
				
			} else {
				//Submission was a new interface
				callback(result.insertId, {info: 'success', msg: `The '${postData.name}' record was successfully added.`});
			}
		}
	})
}



function lockControlsOnUpdate(formDetails, lock = true){

	formDetails.forEach((element) => {
		switch (element.type){
			case 'buttons':
				element.buttons.forEach((element2) => {
					if (element2.onUpdate == 'lock'){ 
						$(`#${element2.id}`).prop('disabled', lock)
					}
				})
			break;
				case 'container':
					$('#' + element.id).children().prop('disabled', lock)
			break;
			default:
				if (element.onUpdate == 'lock'){
					$(`#${element.id}`).prop('disabled', lock);
					debug(5, 'update fired')
				}				
		}
	})
}


function updateEvents(formDetails, callback){
	debug(5, 'In updateEvents XXX DONT MORE updateSlider')
	formDetails.forEach((element) => {
		switch (element.type){
			case 'text':
			case 'textarea':
				$('#' + element.id).on('input',() => {
					callback(formDetails)
					controlState(['#mainModalSubmit'],['#mainModalAddNew','#mainModalDelete'])
				})		
			break;
			case 'slider':
				$('#' + element.id).on('input',() => {
					callback(formDetails)
					controlState(['#mainModalSubmit'],['#mainModalAddNew','#mainModalDelete'])
					updateSlider('#'+element.id, $('#'+element.id).val())
				})		
			break;
			case 'droppable':
				$('#' + element.id).on('drop', () => {
					debug(5,'drop fired')
					callback(formDetails)
					controlState(['#mainModalSubmit'],['#mainModalAddNew','#mainModalDelete'])
				})
			break;
			case 'select':
				if (!element.primary){
					$('#' + element.id).on('change',() => {
						callback(formDetails)
						controlState(['#mainModalSubmit'],['#mainModalAddNew','#mainModalDelete'])
					})							
				}
			break;
			default:
		}
	})
}




/**
 * @description Provides a common layout when showing a graphical depection of interfaces installed in a system
 * 
 * @param  {string} $selector The insert location of the element
 * @param  {name, image} left The left item, generally an interface
 * @param  {name, image} right The right itme, generally a system
 * @param  {boolean} prepend True if result should prepend to $selector. False appends.
 */
 function installedInModalInsert($selector,left,right,prepend){

	var response = `<div class="row text-center">
		<div class="col-sm">
			<h5>${left.name}</h5>
			<img src="${imagePath + left.image}" width="100px" height="100px">
		</div>
		<div class="col-sm mt-5">
			<h5>Installed In<br><h3>&#8594</h3></h5>
		</div>
		<div class="col-sm">
			<h5>${right.name}</h5>
			<img src="${imagePath + right.image}" width="100px" height="100px">
		</div>
	</div>`

	if (prepend){
		$($selector).prepend(response)
	} else {
		$($selector).append(response)
	}
}


function placeInterfaceButtons($selector, row, id_system, id_ISMap, callback){
	//Create the button element for each interface installed into the system
	addIconButton($selector, row.image, row.name, {name: 'id_ISMap', value: row.id_ISMap});

	//Select the interface if it matches
	if (id_ISMap == row.id_ISMap){
		$($selector + ' button:last-of-type').removeClass('btn-secondary').addClass('btn-primary');
	}

	//Event: Interface Button
	$($selector + ' button:last-of-type').on( 'click', (event) => {

		//Toggle the selected interface button styling
		$($selector + ' button').removeClass("btn-primary").addClass("btn-secondary");
		$(event.currentTarget).removeClass('btn-secondary').addClass('btn-primary');

		//Update the system object with the in-focus id_ISMap
		//id_ISMap = parseInt($(event.currentTarget).attr('data-id_ISMap'));

		//Populate the additional details
		callback(id_system, null, row.id_ISMap)
	});
}

/*
function rnd(min, max) {
	return Math.floor(Math.random() * (max - min) ) + min;
}
*/

function getColor(index){
	var i = index % colors.length
	return colors[i];
}


function systemButton(id_system, name){
	return `<a href="#" class='btn btn-sm btn-outline-dark my-1 mx-1' onclick="commonModal({modal: 'systems', id_system: ${id_system}});">${name}</a>`
}


function displayTags($selector){
	$($selector).empty()
		//Setup the page
		if (localStorage.getItem('includedFilterTag') == ''){
			$($selector).append(`<p id="tagsIncluded">No included tags</p>`);
		} else {
			$($selector).append(`<p id="tagsIncluded">Tags included: </p>`);
			addMultipleBadges('#tagsIncluded', {info: 'success'}, localStorage.getItem('includedFilterTag'))
		}

		if (localStorage.getItem('excludedFilterTag') == ''){
			$($selector).append(`<p id="tagsExcluded">No excluded tags</p>`);
		} else {
			$($selector).append(`<p id="tagsExcluded">Tags excluded: </p>`);
			addMultipleBadges('#tagsExcluded', {info: 'success'}, localStorage.getItem('excludedFilterTag'))
		}
}

function updateSlider($selector, value){
	$($selector + '_desc').empty()
	if (value != undefined){
		$($selector + '_desc').html(`<strong>${severityLabels[value].label}</strong> ${severityLabels[value].description}`)
	}
}

/**
 * @description Returns a string identifying how long ago something was updated
 * 
 * @param t1 The first time to compare, in ms
 * @param t2 The second time to compare, in ms
 */
 function updatedWhen(t1, t2){
	diff = Math.abs(t1-t2)/1000;
	debug(5, diff)
	if (diff < 60){ return 'in the last minute'}
	if (diff < 3600){ return Math.trunc(diff /60) + ' minutes ago'}
	if (diff < 7200){ return 'an hour ago'}
	if (diff < 86400){ return Math.trunc(diff /3600) + ' hours ago'}
	if (diff < 172800){ return 'a day ago'}
	if (diff < 604800){ return Math.trunc(diff /86400) + ' days ago'}
	if (diff < 1209600){ return 'over a week ago'}
	if (diff < 31449600){ return Math.trunc(diff /86400) + ' weeks ago'}
	if (diff < 62899200){ return ' over a year ago'}
	if (diff => 62899200){ return Math.trunc(diff /62899200) + ' years ago'}
}

function generateSystemName(name, version){
	if (version === undefined || version === null || version === ''){
		return name
	} else {
		return `${name} [${version}]`
	}
}


function buildFormattedString(format, data){
	var str = format
	for (var i = 0; i < data.length; i++){
		str = str.replace(`<${i}>`, data[i])
	}
	return str
}