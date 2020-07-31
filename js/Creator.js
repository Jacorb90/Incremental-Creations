class Creator {
	constructor(el, library, name, mode) {
		this.el = el;
		this.library = library;
		this.name = name;
		this.html;
		this.css;
		this.js;
		this.text = {};
		this.classes = {};
		this.numbers = {};
		this.events = {};
		this.buttons = {};
		this.mode = mode;
		this.updaters = [];
		this.formulas = {};
		this.realName = {
			text: "text",
			classes: "class",
			numbers: "number",
			events: "event",
			buttons: "button",
			formulas: "formula",
		};
	}

	load() {
		let save = localStorage.getItem("incremental-creations")
		if (save!==null) {
			let data = JSON.parse(atob(save))
			this.name = data.name
			this.text = data.text
			this.classes = data.classes
			this.numbers = data.numbers
			this.events = data.events
			this.buttons = data.buttons
			this.mode = data.mode
			this.updaters = data.updaters
			this.formulas = data.formulas||{}
			this.update();
		}
	}

	save() {
		localStorage.setItem("incremental-creations", btoa(JSON.stringify(this)))
	}

	updateHTML() {
		this.html = "<!DOCTYPE html ><head><link rel='stylesheet' type='text/css' href='style.css'/></head><body onload='onLoad()'>"
		for (let i=0;i<Object.keys(this.text).length;i++) {
			let id = Object.keys(this.text)[i]
			let textData = Object.values(this.text)[i]
			let classes = textData.classes ? (textData.classes.length>1 ? textData.classes.reduce((a,b) => a+" "+b) : (textData.classes[0]||"")) : ""
			this.html += "<p id='text"+id+"' class='"+classes+"' style='position: absolute; top: "+(textData.top||0)+"px; left: "+(textData.left||0)+"px'>"+(textData.text||"")+"</p>"
		}
		for (let i=0;i<Object.keys(this.buttons).length;i++) {
			let id = Object.keys(this.buttons)[i]
			let data = Object.values(this.buttons)[i]
			let classes = data.classes ? (data.classes.length>1 ? data.classes.reduce((a,b) => a+" "+b) : (data.classes[0]||"")) : ""
			this.html += "<button id='buttons"+id+"' class='"+classes+"' style='position: absolute; top: "+(data.top||0)+"px; left: "+(data.left||0)+"px' onclick='"+data.event+"()'>"+(data.text||"")+"</button>"
		}
		this.html += "<script type='text/javascript' src='https://raw.githack.com/Naruyoko/OmegaNum.js/master/OmegaNum.js'></script> <script type='text/javascript' src='game.js'></script></body>"
	}

	updateCSS() {
		this.css = "";
		for (let i=0;i<Object.keys(this.classes).length;i++) {
			let className = Object.keys(this.classes)[i]
			this.css += "."+className+" {\n"
			for (let j=0;j<Object.keys(this.classes[className]).length;j++) {
				let styleName = Object.keys(this.classes[className])[j]
				this.css += styleName+": "+this.classes[className][styleName]+";\n"
			}
			this.css += "}\n"
		}
	}

	updateJS() {
		this.js = "function onLoad() {\n"
		this.js += "\tplayer = {};\n"
		this.js += "\tlet d = localStorage.getItem('incremental-creations"+this.name+"');\n"
		this.js += "\tlet saveData = d?JSON.parse(atob(d)):{}\n"
		for (let i=0;i<Object.keys(this.numbers).length;i++) {
			let numID = Object.keys(this.numbers)[i]
			let numData = Object.values(this.numbers)[i]
			this.js += "\tif (Object.keys(saveData).includes('"+numID+"')) player['"+numID+"'] = new OmegaNum(saveData['"+numID+"']);\n" 
			this.js += "\telse player['"+numID+"'] = new OmegaNum("+numData.start+");\n"
		}
		this.js += "};\n"
		this.js += "OmegaNum.prototype.toSWDP = function(digits) {\n"
		this.js += "\treturn new OmegaNum(this).times(OmegaNum.pow(10, digits)).round().div(OmegaNum.pow(10, digits));\n"
		this.js += "}\n"
		for (let i=0;i<Object.keys(this.events).length;i++) {
			let eventID = Object.keys(this.events)[i]
			this.js += "function "+eventID+"() {\n"
			for (let j=0;j<Object.keys(this.events[eventID]).length;j++) {
				let actionID = Object.keys(this.events[eventID])[j]
				let actionCode = this.events[eventID][actionID]
				if (actionCode.type=="action") {
					this.js += "\tplayer['"+actionCode[1]+"'] = player['"+actionCode[1]+"']"
					if (actionCode[2]=="&#43;") this.js+=".plus("
					else if (actionCode[2]=="&#45;") this.js+=".minus("
					else if (actionCode[2]=="&#42;") this.js+=".times("
					else if (actionCode[2]=="&#47;") this.js+=".div("
					else if (actionCode[2]=="&#94;") this.js+=".pow("
					this.js += Object.keys(this.numbers).includes(actionCode[3])?("player['"+actionCode[3]+"']"):((Object.keys(this.formulas).includes(actionCode[3]))?(actionCode[3]+"()"):("'"+actionCode[3]+"'"));
					this.js += ")"+((actionCode[2]=="&#45;")?".max(0)":"")+";\n"
				} else {
					this.js += "\tif (!player['"+actionCode[1]+"']"
					if (actionCode[2]=="&#62;") this.js+=".gt("
					else if (actionCode[2]=="&#8805;") this.js+=".gte("
					else if (actionCode[2]=="&#60;") this.js+=".lt("
					else if (actionCode[2]=="&#8804;") this.js+=".lte("
					else this.js+=".eq("
					this.js += Object.keys(this.numbers).includes(actionCode[3])?("player['"+actionCode[3]+"']"):((Object.keys(this.formulas).includes(actionCode[3]))?(actionCode[3]+"()"):"'"+actionCode[3]+"'");
					this.js += ")) return;\n"
				}
			}
			this.js += "}\n"
		}
		for (let i=0;i<Object.keys(this.formulas).length;i++) {
			let formulaID = Object.keys(this.formulas)[i]
			this.js += "function "+formulaID+"() {\n"
			this.js += "\tlet x = new OmegaNum('"+this.formulas[formulaID].base+"');\n"
			for (let j=0;j<Object.keys(this.formulas[formulaID]).length;j++) {
				let innerID = Object.keys(this.formulas[formulaID])[j]
				if (innerID=="base") continue;
				let code = this.formulas[formulaID][innerID]
				if (code.type=="adjustment") {
					this.js += "\tx = x"
					if (code[2]=="&#43;") this.js+=".plus("
					else if (code[2]=="&#45;") this.js+=".minus("
					else if (code[2]=="&#42;") this.js+=".times("
					else if (code[2]=="&#47;") this.js+=".div("
					else if (code[2]=="&#94;") this.js+=".pow("
					else if (code[2]=="&#114;") this.js+=".toSWDP("
					this.js += Object.keys(this.numbers).includes(code[3])?("player['"+code[3]+"']"):((Object.keys(this.formulas).includes(code[3]))?(code[3]+"()"):"'"+code[3]+"'");
					this.js += ")"+((code[2]=="&#45;")?".max(0)":"")+";\n"
				} else {
					this.js += "\tif (!player['"+code[1]+"']"
					if (code[2]=="&#62;") this.js+=".gt("
					else if (code[2]=="&#8805;") this.js+=".gte("
					else if (code[2]=="&#60;") this.js+=".lt("
					else if (code[2]=="&#8804;") this.js+=".lte("
					else this.js+=".eq("
					this.js += Object.keys(this.numbers).includes(code[3])?("player['"+code[3]+"']"):((Object.keys(this.formulas).includes(code[3]))?(code[3]+"()"):"'"+code[3]+"'");
					this.js += ")) return x;\n"
				}
			}
			this.js += "\treturn x;\n"
			this.js += "}\n"
		}
		this.js += "var updater_starts = {};\n"
		for (let i=0;i<this.updaters.length;i++) {
			let id = this.updaters[i];
			this.js += "updater_starts['"+id+"'] = '"+((id.includes("text"))?this.text[id.replace("text", "")]:this.buttons[id.replace("buttons", "")]).text+"';\n"
		}
		this.js += "function parseForUpdates(id) {\n"
		this.js += "\tlet txt = updater_starts[id];\n"
		this.js += "\tif (txt.includes('{{') && txt.includes('}}')) {\n"
		this.js += "\t\tlet content = txt.slice(txt.indexOf('{{')+2, txt.indexOf('}}')).split(' ').join('');\n"
		this.js += "\t\tlet act;\n"
		this.js += "\t\tif (player[content]===undefined) act = window[content]();\n"
		this.js += "\t\telse act = player[content];\n"
		this.js += "\t\tdocument.getElementById(id).textContent = txt.slice(0, txt.indexOf('{{'))+act+txt.slice(txt.indexOf('}}')+2, txt.length);\n"
		this.js += "\t}\n"
		this.js += "}\n"
		this.js += "function save() {\n"
		this.js += "\tlocalStorage.setItem('incremental-creations"+this.name+"', btoa(JSON.stringify(player)))"
		this.js += "}\n"
		this.js += "function hardReset(force=false) {\n"
		this.js += "\tif (!force) if (!confirm('Are you sure you want to reset everything?')) return;\n"
		this.js += "\tlocalStorage.removeItem('incremental-creations"+this.name+"');\n"
		this.js += "\tonLoad();\n"
		this.js += "}\n"
		this.js += "function gameLoop(diff) {\n"
		for (let i=0;i<this.updaters.length;i++) {
			let id = this.updaters[i]
			this.js += "\tparseForUpdates('"+id+"');\n"
		}
		this.js += "}\n"
		this.js += "var lastTime = new Date().getTime();\n"
		this.js += "let interval = setInterval(function() {\n"
		this.js += "\tgameLoop(new Date().getTime()-lastTime);\n"
		this.js += "\tlastTime = new Date().getTime();\n"
		this.js += "}, 50)\n"
		this.js += "let saveInterval = setInterval(function() {\n"
		this.js += "\tsave();\n"
		this.js += "}, 4000)\n"
	}

	update() {
		this.updateHTML();
		this.updateCSS();
		this.updateJS();
		this.save();
	}

	updateText(id, type) {
		let field = document.getElementById("text"+id+type).value
		if (type=="value") {
			this.text[id].text = field
			if (field.includes("{{") && field.includes("}}") && !this.updaters.includes("text"+id)) this.updaters.push("text"+id)
			else if (this.updaters.includes("text"+id)) this.updaters.splice(this.updaters.indexOf("text"+id), 1);
		} else if (type=="top") {
			if (field<0) field = 0
			if (field>screen.height) field = screen.height
			this.text[id][type] = field
		} else if (type=="left") {
			if (field<0) field = 0
			if (field>screen.width) field = screen.width
			this.text[id][type] = field
		}
		document.getElementById("text"+id+type).value = field
		this.update();
	}

	updateBtn(id, type) {
		let field = document.getElementById("buttons"+id+type).value
		if (type=="value") {
			this.buttons[id].text = field
			if (field.includes("{{") && field.includes("}}") && !this.updaters.includes("buttons"+id)) this.updaters.push("buttons"+id)
			else if (this.updaters.includes("buttons"+id)) this.updaters.splice(this.updaters.indexOf("buttons"+id), 1);
		} else if (type=="top") {
			if (field<0) field = 0
			if (field>screen.height) field = screen.height
			this.buttons[id][type] = field
		} else if (type=="left") {
			if (field<0) field = 0
			if (field>screen.width) field = screen.width
			this.buttons[id][type] = field
		} else if (type=="event") this.buttons[id][type] = field;
		document.getElementById("buttons"+id+type).value = field
		this.update();
	}

	updateNum(id, type) {
		let field = document.getElementById("numbers"+id+type).value
		try {
			field = new OmegaNum(field).toString();
			this.numbers[id].start = field
			document.getElementById("numbers"+id+type).value = field
		} catch(e) {
			return
		}
		this.update();
	}

	view(type) {
		if (document.getElementById("dropdown").style.display!="none") {
			hideDropdown()
			return
		}
		let dd = "<b>"+capitalFirst(type)+"</b><br><br>"
		for (let i=0;i<Object.keys(this[type]).length;i++) {
			let key = Object.keys(this[type])[i]
			dd += key+"&nbsp;&nbsp;<button class='btn' onclick='creator.edit(&quot;"+type+"&quot;,&quot;"+key+"&quot;)'>Edit</button>"
			dd += "&nbsp;&nbsp;<button class='btn' onclick='creator.delete(&quot;"+type+"&quot;,&quot;"+key+"&quot;)'>Delete</button><br><br>"
		}
		dd += "<br><button class='shortbtn' onclick='creator.add(&quot;"+type+"&quot;)'>+</button>"
		toggleDropdown(dd)
	}

	addToClass(className) {
		let toAdd;
		if (this.mode == "advanced") toAdd = prompt("What style type would you like to add?")
		else toAdd = prompt("What style type would you like to add? (color, font-size, width, height, etc.)")
		if (this.classes[className][toAdd] !== undefined) return;
		this.classes[className][toAdd] = ""
		this.update();
		hideDropdown();
		this.openDropdown("classes", className);
	}

	addToEvent(id) {
		this.events[id][Object.keys(this.events[id]||{}).length+1]={type: "action"}
		this.update();
		hideDropdown();
		this.openDropdown("events", id);
	}

	addCondition(id) {
		this.events[id][Object.keys(this.events[id]||{}).length+1]={type: "condition"}
		this.update();
		hideDropdown();
		this.openDropdown("events", id);
	}

	addToFormula(id) {
		this.formulas[id][Object.keys(this.formulas[id]||{}).length]={type: "adjustment"}
		this.update();
		hideDropdown();
		this.openDropdown("formulas", id);
	}

	addFormulaCondition(id) {
		this.formulas[id][Object.keys(this.formulas[id]||{}).length]={type: "condition"}
		this.update();
		hideDropdown();
		this.openDropdown("formulas", id);
	}

	updateStyle(className, styleName) {
		let val = document.getElementById("classes"+className+styleName).value
		if ((styleName=="width"||styleName=="height"||styleName=="font-size") && (!val.includes("px")&&!val.includes("%"))) val += "px"
		this.classes[className][styleName] = val
		document.getElementById("classes"+className+styleName).value = val;
		this.update();
	}

	addClassToText(textID) {
		let className = prompt("Which class?")
		className = className.split(' ').join('-');
		if (!Object.keys(this.classes).includes(className)) return
		if ((this.text[textID].classes||[]).includes(className)) return
		if ((this.text[textID].classes||[]).length>0) this.text[textID].classes.push(className)
		else this.text[textID].classes = [className]
		this.update();
		this.openDropdown("text", textID)
	}

	deleteClassFromText(className, textID) {
		if (this.text[textID].classes!==undefined) if (this.text[textID].classes.includes(className)) this.text[textID].classes.splice(this.text[textID].classes.indexOf(className), 1);
		this.update();
		this.openDropdown("text", textID)
	}

	addClassToBtn(id) {
		let className = prompt("Which class?")
		className = className.split(' ').join('-');
		if (!Object.keys(this.classes).includes(className)) return
		if ((this.buttons[id].classes||[]).includes(className)) return
		if ((this.buttons[id].classes||[]).length>0) this.buttons[id].classes.push(className)
		else this.buttons[id].classes = [className]
		this.update();
		this.openDropdown("buttons", id)
	}

	deleteClassFromBtn(className, id) {
		if (this.buttons[id].classes!==undefined) if (this.buttons[id].classes.includes(className)) this.buttons[id].classes.splice(this.buttons[id].classes.indexOf(className), 1);
		this.update();
		this.openDropdown("buttons", id)
	}

	updateEvent(eventID, actionID) {
		let p1 = document.getElementById("events1"+eventID+actionID).value
		let p2 = document.getElementById("events2"+eventID+actionID).value.includes("&#") ? document.getElementById("events2"+eventID+actionID).value : ("&#"+document.getElementById("events2"+eventID+actionID).value.charCodeAt(0)+";");
		let p3 = document.getElementById("events3"+eventID+actionID).value
		this.events[eventID][actionID][1] = p1
		this.events[eventID][actionID][2] = p2
		this.events[eventID][actionID][3] = p3
		this.update();
	}

	updateFormula(formulaID, partialID) {
		let p1 = document.getElementById("formulas1"+formulaID+partialID).value
		let p2 = document.getElementById("formulas2"+formulaID+partialID).value.includes("&#") ? document.getElementById("formulas2"+formulaID+partialID).value : ("&#"+document.getElementById("formulas2"+formulaID+partialID).value.charCodeAt(0)+";");
		let p3 = document.getElementById("formulas3"+formulaID+partialID).value
		this.formulas[formulaID][partialID][1] = p1
		this.formulas[formulaID][partialID][2] = p2
		this.formulas[formulaID][partialID][3] = p3
		this.update();
	}

	updateFormulaBase(formulaID) {
		let val = document.getElementById("formulasBase"+formulaID).value
		try {
			this.formulas[formulaID].base = new OmegaNum(val).toString()
		} catch(e) {
			return
		}
		this.update();
	}

	deleteEventThing(eventID) {
		if (Object.keys(this.events[eventID]).length>0) {
			if (!confirm("Are you sure you want to delete this?")) return
			delete this.events[eventID][Object.keys(this.events[eventID]).length]
		}
		this.update();
		this.openDropdown("events", eventID)
	}

	deleteFormulaThing(id) {
		if (Object.keys(this.formulas[id]).length>1) {
			if (!confirm("Are you sure you want to delete this?")) return
			delete this.formulas[id][Object.keys(this.formulas[id]).length-1]
		}
		this.update();
		this.openDropdown("formulas", id)
	}

	openDropdown(type, id) {
		let data = "<h2><b>"+id+"</b></h2><br>"
		if (type=="buttons") {
			data += "<b>Text</b><br><input id='buttons"+id+"value' type='text' onchange='creator.updateBtn(&quot;"+id+"&quot;, &quot;value&quot;)' value='"+(this.buttons[id].text||"")+"'></input><br><br>"
			data += "<b>Event</b><br><input id='buttons"+id+"event' type='text' list='buttonList"+id+"' onchange='creator.updateBtn(&quot;"+id+"&quot;, &quot;event&quot;)' value='"+(this.buttons[id].event||"")+"'></input><br><br>"
			data += "<datalist id='buttonList"+id+"'>"
			for (let j=0;j<Object.keys(this.events).length;j++) {
				let eventID = Object.keys(this.events)[j]
				data += "<option value='"+eventID+"'>"
			}
			data += "<option value='hardReset'>"
			data +="</datalist>"
			data += "<b>Distance from Top (pixels, maximum "+screen.height+")</b><br><input id='buttons"+id+"top' type='number' onchange='creator.updateBtn(&quot;"+id+"&quot;, &quot;top&quot;)' value='"+(this.buttons[id].top||0)+"'></input><br><br>"
			data += "<b>Distance from Left (pixels, maximum "+screen.width+")</b><br><input id='buttons"+id+"left' type='number' onchange='creator.updateBtn(&quot;"+id+"&quot;, &quot;left&quot;)' value='"+(this.buttons[id].left||0)+"'></input><br><br>"
			data += "<b>Classes</b><br><br>"
			let len = (this.buttons[id].classes||[]).length
			if (len>0) for (let i=0;i<len;i++) {
				let className = this.buttons[id].classes[i]
				data += className+"&nbsp;&nbsp;<button class='btn' onclick='creator.deleteClassFromBtn(&quot;"+className+"&quot;, &quot;"+id+"&quot;)'>Remove</button><br><br>"
			}
			data += "<br><button id='buttons"+id+"class' class='btn' onclick='creator.addClassToBtn(&quot;"+id+"&quot;)'>Add Class</button><br><br>"
		} else if (type=="text") {
			data += "<b>Text</b><br><input id='text"+id+"value' type='text' onchange='creator.updateText(&quot;"+id+"&quot;, &quot;value&quot;)' value='"+(this.text[id].text||"")+"'></input><br><br>"
			data += "<b>Distance from Top (pixels, maximum "+screen.height+")</b><br><input id='text"+id+"top' type='number' onchange='creator.updateText(&quot;"+id+"&quot;, &quot;top&quot;)' value='"+(this.text[id].top||0)+"'></input><br><br>"
			data += "<b>Distance from Left (pixels, maximum "+screen.width+")</b><br><input id='text"+id+"left' type='number' onchange='creator.updateText(&quot;"+id+"&quot;, &quot;left&quot;)' value='"+(this.text[id].left||0)+"'></input><br><br>"
			data += "<b>Classes</b><br><br>"
			let len = (this.text[id].classes||[]).length
			if (len>0) for (let i=0;i<len;i++) {
				let className = this.text[id].classes[i]
				data += className+"&nbsp;&nbsp;<button class='btn' onclick='creator.deleteClassFromText(&quot;"+className+"&quot;, &quot;"+id+"&quot;)'>Remove</button><br><br>"
			}
			data += "<br><button id='text"+id+"class' class='btn' onclick='creator.addClassToText(&quot;"+id+"&quot;)'>Add Class</button><br><br>"
		} else if (type=="classes") {
			let len = Object.keys(this.classes[id]).length
			if (len>0) for (let i=0;i<len;i++) {
				let styleName = Object.keys(this.classes[id])[i]
				if (styleName.includes("color")) data += "<b>"+styleName+"</b><br><input id='classes"+id+styleName+"' type='color' value='"+(this.classes[id][styleName]||"#000000")+"' onchange='creator.updateStyle(&quot;"+id+"&quot;, &quot;"+styleName+"&quot;)'></input><br><br>"
				else data += "<b>"+styleName+"</b><br><input id='classes"+id+styleName+"' type='text' value='"+(this.classes[id][styleName]||"")+"' onchange='creator.updateStyle(&quot;"+id+"&quot;, &quot;"+styleName+"&quot;)'></input><br><br>"
			}
			data += "<button class='shortbtn' onclick='creator.addToClass(&quot;"+id+"&quot;)'>+</button><br>"
		} else if (type=="numbers") {
			data += "<b>Base Value</b><br><input id='numbers"+id+"start' type='text' onchange='creator.updateNum(&quot;"+id+"&quot;, &quot;start&quot;)' value='"+(this.numbers[id].start||"")+"'></input><br><br>"
		} else if (type=="events") {
			let len = Object.keys(this.events[id]).length
			if (len>0) for (let i=0;i<len;i++) {
				let eventID = Object.keys(this.events[id])[i]
				if (this.events[id][eventID].type=="action") {
					data += "<b>Action ("+eventID+")</b><br><input value='"+(this.events[id][eventID][1]||"")+"' style='width: 50px' id='events1"+id+eventID+"' type='text' list='eventList1"+id+eventID+"' onchange='creator.updateEvent(&quot;"+id+"&quot;, &quot;"+eventID+"&quot;)'></input>&nbsp;<input id='events2"+id+eventID+"' value='"+(this.events[id][eventID][2]||"")+"' style='width: 50px' type='text' list='eventList2"+id+eventID+"' onchange='creator.updateEvent(&quot;"+id+"&quot;, &quot;"+eventID+"&quot;)'></input>&nbsp;<input id='events3"+id+eventID+"' value='"+(this.events[id][eventID][3]||"")+"' style='width: 50px' type='text' list='eventList3"+id+eventID+"' onchange='creator.updateEvent(&quot;"+id+"&quot;, &quot;"+eventID+"&quot;)'></input><br><br>"
					data += "<datalist id='eventList1"+id+eventID+"'>"
					for (let j=0;j<Object.keys(this.numbers).length;j++) {
						let numID = Object.keys(this.numbers)[j]
						data += "<option value='"+numID+"'>"
					}
					data +="</datalist>"
					data += "<datalist id='eventList2"+id+eventID+"'>"
					for (let j=0;j<OPERATORS.length;j++) {
						let op = OPERATORS[j]
						data += "<option value='"+op+"'>"
					}
					data +="</datalist>"
					data += "<datalist id='eventList3"+id+eventID+"'>"
					for (let j=0;j<Object.keys(this.numbers).length;j++) {
						let numID = Object.keys(this.numbers)[j]
						data += "<option value='"+numID+"'>"
					}
					for (let j=0;j<Object.keys(this.formulas).length;j++) {
						let formID = Object.keys(this.formulas)[j]
						data += "<option value='"+formID+"'>"
					}
					data +="</datalist>"
				} else {
					data += "<b>Condition ("+eventID+")</b><br><input style='width: 50px' value='"+(this.events[id][eventID][1]||"")+"' id='events1"+id+eventID+"' type='text' list='eventList1c"+id+eventID+"' onchange='creator.updateEvent(&quot;"+id+"&quot;, &quot;"+eventID+"&quot;)'></input>&nbsp;<input value='"+(this.events[id][eventID][2]||"")+"' id='events2"+id+eventID+"' style='width: 50px' type='text' list='eventList2c"+id+eventID+"' onchange='creator.updateEvent(&quot;"+id+"&quot;, &quot;"+eventID+"&quot;)'></input>&nbsp;<input value='"+(this.events[id][eventID][3]||"")+"' id='events3"+id+eventID+"' style='width: 50px' type='text' list='eventList3c"+id+eventID+"' onchange='creator.updateEvent(&quot;"+id+"&quot;, &quot;"+eventID+"&quot;)'></input><br><br>"
					data += "<datalist id='eventList1c"+id+eventID+"'>"
					for (let j=0;j<Object.keys(this.numbers).length;j++) {
						let numID = Object.keys(this.numbers)[j]
						data += "<option value='"+numID+"'>"
					}
					data +="</datalist>"
					data += "<datalist id='eventList2c"+id+eventID+"'>"
					for (let j=0;j<CHOICES.length;j++) {
						let op = CHOICES[j]
						data += "<option value='"+op+"'>"
					}
					data +="</datalist>"
					data += "<datalist id='eventList3c"+id+eventID+"'>"
					for (let j=0;j<Object.keys(this.numbers).length;j++) {
						let numID = Object.keys(this.numbers)[j]
						data += "<option value='"+numID+"'>"
					}
					for (let j=0;j<Object.keys(this.formulas).length;j++) {
						let formID = Object.keys(this.formulas)[j]
						data += "<option value='"+formID+"'>"
					}
					data +="</datalist>"
				}
			}
			data += "<button class='btn' onclick='creator.addToEvent(&quot;"+id+"&quot;)'>Add Action</button>"
			data += "&nbsp;<button class='btn' onclick='creator.addCondition(&quot;"+id+"&quot;)'>Add Condition</button>"
			data += "&nbsp;<button class='btn' onclick='creator.deleteEventThing(&quot;"+id+"&quot;)'>Delete One</button><br>"
		} else if (type=="formulas") {
			data += "<b>Base</b><br><input value='"+(this.formulas[id].base||"")+"' id='formulasBase"+id+"' type='text' onchange='creator.updateFormulaBase(&quot;"+id+"&quot;)'></input><br><br>"
			let len = Object.keys(this.formulas[id]).length
			if (len>0) for (let i=0;i<len;i++) {
				let partialID = Object.keys(this.formulas[id])[i]
				if (this.formulas[id][partialID].type=="adjustment") {
					data += "<b>Adjustment ("+partialID+")</b><br><input style='display: none;' value='"+(this.formulas[id][partialID][1]||"")+"' style='width: 50px' id='formulas1"+id+partialID+"' type='text' list='formulaList1"+id+partialID+"' onchange='creator.updateFormula(&quot;"+id+"&quot;, &quot;"+partialID+"&quot;)'></input>&nbsp;<input id='formulas2"+id+partialID+"' value='"+(this.formulas[id][partialID][2]||"")+"' style='width: 50px' type='text' list='formulaList2"+id+partialID+"' onchange='creator.updateFormula(&quot;"+id+"&quot;, &quot;"+partialID+"&quot;)'></input>&nbsp;<input id='formulas3"+id+partialID+"' value='"+(this.formulas[id][partialID][3]||"")+"' style='width: 50px' type='text' list='formulaList3"+id+partialID+"' onchange='creator.updateFormula(&quot;"+id+"&quot;, &quot;"+partialID+"&quot;)'></input><br><br>"
					data += "<datalist id='formulaList1"+id+partialID+"'>"
					for (let j=0;j<Object.keys(this.numbers).length;j++) {
						let numID = Object.keys(this.numbers)[j]
						data += "<option value='"+numID+"'>"
					}
					data +="</datalist>"
					data += "<datalist id='formulaList2"+id+partialID+"'>"
					for (let j=0;j<OPERATORS.length;j++) {
						let op = OPERATORS[j]
						data += "<option value='"+op+"'>"
					}
					data += "<option value='r'>"
					data +="</datalist>"
					data += "<datalist id='formulaList3"+id+partialID+"'>"
					for (let j=0;j<Object.keys(this.numbers).length;j++) {
						let numID = Object.keys(this.numbers)[j]
						data += "<option value='"+numID+"'>"
					}
					for (let j=0;j<Object.keys(this.formulas).length;j++) {
						let formID = Object.keys(this.formulas)[j]
						if (formID!=id) data += "<option value='"+formID+"'>"
					}
					data +="</datalist>"
				} else if (this.formulas[id][partialID].type!==undefined) {
					data += "<b>Condition ("+partialID+")</b><br><input style='width: 50px' value='"+(this.formulas[id][partialID][1]||"")+"' id='formulas1"+id+partialID+"' type='text' list='formulaList1c"+id+partialID+"' onchange='creator.updateFormula(&quot;"+id+"&quot;, &quot;"+partialID+"&quot;)'></input>&nbsp;<input value='"+(this.formulas[id][partialID][2]||"")+"' id='formulas2"+id+partialID+"' style='width: 50px' type='text' list='formulaList2c"+id+partialID+"' onchange='creator.updateFormula(&quot;"+id+"&quot;, &quot;"+partialID+"&quot;)'></input>&nbsp;<input value='"+(this.formulas[id][partialID][3]||"")+"' id='formulas3"+id+partialID+"' style='width: 50px' type='text' list='formulaList3c"+id+partialID+"' onchange='creator.updateFormula(&quot;"+id+"&quot;, &quot;"+partialID+"&quot;)'></input><br><br>"
					data += "<datalist id='formulaList1c"+id+partialID+"'>"
					for (let j=0;j<Object.keys(this.numbers).length;j++) {
						let numID = Object.keys(this.numbers)[j]
						data += "<option value='"+numID+"'>"
					}
					data +="</datalist>"
					data += "<datalist id='formulaList2c"+id+partialID+"'>"
					for (let j=0;j<CHOICES.length;j++) {
						let op = CHOICES[j]
						data += "<option value='"+op+"'>"
					}
					data +="</datalist>"
					data += "<datalist id='formulaList3c"+id+partialID+"'>"
					for (let j=0;j<Object.keys(this.numbers).length;j++) {
						let numID = Object.keys(this.numbers)[j]
						data += "<option value='"+numID+"'>"
					}
					for (let j=0;j<Object.keys(this.formulas).length;j++) {
						let formID = Object.keys(this.formulas)[j]
						if (formID!=id) data += "<option value='"+formID+"'>"
					}
					data +="</datalist>"
				}
			}
			data += "<button class='btn' onclick='creator.addToFormula(&quot;"+id+"&quot;)'>Add Adjustment</button>"
			data += "&nbsp;<button class='btn' onclick='creator.addFormulaCondition(&quot;"+id+"&quot;)'>Add Condition</button><br>"
			data += "&nbsp;<button class='btn' onclick='creator.deleteFormulaThing(&quot;"+id+"&quot;)'>Delete One</button><br>"
		}
		data += "<button class='shortbtn' onclick='hideDropdown()'>X</button><br>"
		toggleDropdown(data);
	}

	edit(type, id) {
		this[type][id] = this[type][id]||{}
		this.update();
		this.openDropdown(type, id);
	}

	delete(type, id) {
		if (!confirm("Are you sure you want to delete this? You won't be able to undo this!")) return
		if (type=="buttons"||type=="text") this.updaters.splice(this.updaters.indexOf(type+id), 1)
		delete this[type][id]
		hideDropdown();
		this.update();
	}

	getName(txt, type) {
		let data = prompt(txt);
		if (data==""||data==" ") return this.getName(txt, type);
		let keys = Object.keys(this[type])
		if (keys.includes(data)) return this.getName(txt, type);
		return data;
	}

	add(type) {
		let id = (this.getName("ID of "+this.realName[type], "text")||"").split(' ').join('-');
		this[type][id] = this[type][id]||(type=="classes"?baseClass:{})
		this.openDropdown(type, id);
		this.update();
	}

	export() {
		this.update();
		let name = this.name
		var zip = new JSZip();
		zip.file("index.html", this.html)
		zip.file("style.css", this.css)
		zip.file("game.js", this.js)
		zip.generateAsync({type:"blob"}).then(function(content) {
    		saveAs(content, name+".zip");
		});
		this.save();
	}

	rename() {
		let name = prompt("Rename project?").split(' ').join('-')
		if (name=="") name = this.name
		this.name = name
	}

	reset() {
		if (!confirm("Are you sure you want to start your project from scratch?")) return
		localStorage.removeItem("incremental-creations")
		window.location.reload();
	}
}