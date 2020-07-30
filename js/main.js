var mode = "advanced"
var baseClass = {
	color: "#000000",
	"font-size": "12px",
}
var OPERATORS = ["+","-","*","/","^"]
var CHOICES = [">","&#8805;","=", "&#8804;","<"]
var creator = new Creator(document.getElementById("creation"), OmegaNum, "project", mode);

let saveInterval = setInterval(function() {
	creator.save();
}, 10000)

function toggleDropdown(content) {
	document.getElementById("dropdown").style.display = "block"
	document.getElementById("dropdown").innerHTML = content
}

function hideDropdown() {
	document.getElementById("dropdown").style.display = "none"
}

function capitalFirst(str) {
	if (str=="" || str==" ") return str
	return str
		.split(" ")
		.map(x => x[0].toUpperCase() + x.slice(1))
		.join(" ");
}

creator.load();