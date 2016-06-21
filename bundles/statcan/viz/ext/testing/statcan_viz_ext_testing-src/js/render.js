define("statcan_viz_ext_testing-src/js/render", 
["statcan_viz_ext_testing-src/js/libs/generalize"], 
function(generalize) {
	/*
	 * This function is a drawing function; you should put all your drawing logic in it.
	 * it's called in moduleFunc.prototype.render
	 * @param {Object} data - proceessed dataset, check dataMapping.js
	 * @param {Object} container - the target d3.selection element of plot area
	 * @example
	 *   container size:     this.width() or this.height()
	 *   chart properties:   this.properties()
	 *   dimensions info:    data.meta.dimensions()
	 *   measures info:      data.meta.measures()
	 */
	var render = function(data, container) {
		
		var dimensionSet = data.meta.dimensions("X Axis"),
			measureSet = data.meta.measures("Y Axis");
		
		var dGen = generalize;
		dGen.load(dimensionSet, data);
		//
		//Add pattern for dimension A.
		//
		//New line.
		//Extra.

		dGen.add("word", function(value, index, self) {
		    var n = Number(value);
		    if (isNaN(n)) { return true; }
		    var y = new Date().getFullYear(); //Current year.
		    return n <= 1000 || n >= y + 100;
		}, function(filtered) {
		    return filtered.length === 0;
		});
		//
		//Add pattern for dimension B.
		//
		dGen.add(function(value, index, self) {
		    return self.indexOf(value) === index;
		}, function(filtered) {
		    return filtered.length === 2;
		});
		
		//
		//Add pattern for dimension C.
		//
		dGen.add(function(value, index, self) {
		    return true;
		}, function(filtered) {
		    return true;
		});
		
		dGen.compute();
		
		alert("Year: " + dGen.columns.indices[dimensionSet[0]] +
		    "\nSex: " + dGen.columns.indices[dimensionSet[1]] +
		    "\nAge: " + dGen.columns.indices[dimensionSet[2]]);
	};
	return render;
});