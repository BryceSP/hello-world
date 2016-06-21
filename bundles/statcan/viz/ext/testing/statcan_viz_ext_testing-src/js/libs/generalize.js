define([], function () {

/*==================================================================================
Generalize.js

A lightweight library that provides generalization by being able to determine which 
dimension or measure is at which index within an array, despite order, and based on 
patterns supplied by the programmer.

Intended for SAP Lumira visualization extensions and adapted for requireJS.

Business Intelligence & Analytics Technology Centre
Statistics Canada
Bryce St. Pierre
Version 1.0.0
June 8, 2016
===================================================================================*/

var generalize =
{
    //Provides parameters for configuring the analysis process.
    limits: {          
        sample: 100     //Number for maximum amount of sample data observed.  
    },

    //Provides common error indication and logging.
    errors: {
        absent: function (type) {
            console.log("Usage error: no " + type + " argument(s) provided.");
            return false;
        },

        incorrect: function () {
            console.log("Usage error: incorrect argument(s) provided.");
            return false;
        },

        general: function (m) {
            console.log(m);
            return false;
        }
    },

    //Stores column metadata, and sample data used for pattern matching.
    columns: {          
        names: [],      //Array for column names.
        indices: {},    //Object for column indices.
        samples: {},    //Object for arrays of sample data.

        count: function () {
            return this.names.length;
        },

        has: function (n) {
            return isNaN(Number(n)) ? false : this.count() === Number(n);
        },

        setIndex: function (k, i) {
            this.indices[k] = i;
        },

        getIndex: function (k) {
            return this.indices[k];
        }
    },

    //Stores patterns and performs appropriate access and updating operations.
    patterns: {
        objects: [],    //Array for pattern objects.

        get: function (i) {
            return this.objects[i];
        },

        count: function () {
            return this.objects.length;
        },

        setMatched: function (i) {
            if (i >= 0 && i < this.count()) {
                this.objects[i].matched = true;
            }
        },

        getMatched: function (i) {
            if (i >= 0 && i < this.count()) {
                return this.objects[i].matched;
            }
        },

        push: function (f, c) {
            if (typeof f !== "function" || typeof c !== "function") {
                return this.errors.incorrect();
            }
            this.objects.push({
                filter: f,
                condition: c,
                matched: false
            });
            return true;
        }
    },

//===================================================================================

    /** Initializes column and sample data properties.
     * @function
     * @param {Array} c - Column names set for measures or dimensions.
     * @param {Object} s - Contains data objects to be mapped to arrays.
     * @returns {Boolean} - Indicates success.
     */
    load: function (c, s) {
        if (!Array.isArray(c) || s === null || typeof s !== "object") {
            return this.errors.incorrect();
        }
        this.columns.names = c;
        for (var i = 0; i < c.length; i++) {
            this.columns.indices[c[i]] = -1;
            this.columns.samples[c[i]] = [];
        }
        var count = 0;
        for (var row in s) {
            if (count++ >= this.limits.sample) { break; }
            for (var j = 0; j < this.columns.count(); j++) {
                var column = this.columns.names[j];
                this.columns.samples[column].push(s[row][column]);
            }
        }
        return true;
    },

    /** Adds a new object to the pattern set, if possible.
     * @function
     * @param {Function} f - Callback used for filtering an array.
     * @param {Function} c - Callback used to check a final condition.
     * @returns {Boolean} - Indicates success.
     */
    add: function (f, c) {
        if (this.patterns.count() >= this.columns.count()) {
            return this.errors.general("Usage error: patterns exceeding columns.");
        } 
        return this.patterns.push(f, c);
    },

    /** Determines if an array of values matches a pattern.
     * @function
     * @param {Array} a - Contains sample data values.
     * @param {Object} p - Used to obtain filter and condition functions.
     * @returns {Boolean} - Indicates success.
     */
    follows: function (a, p) {
        if (!Array.isArray(a)) {
            return this.errors.absent("array");
        } else if (typeof p !== "object") {
            return this.errors.absent("pattern object");
        }
        return p.condition(a.filter(p.filter));
    },

    /** Loops through columns and uses pattern matching to determine indices.
     * @function
     * @returns {Number} - Indicates number of patterns matched to columns.
     */
    compute: function () {
        var matched = 0;
        for (var i = 0; i < this.patterns.count() ; i++) {
            var p = this.patterns.get(i);
            for (var j = 0; j < this.columns.count() ; j++) {
                var column = this.columns.names[j],
                    s = this.columns.samples[column];
                if (!this.patterns.getMatched(i) && this.follows(s, p)) {
                    this.columns.setIndex(column, j);
                    this.patterns.setMatched(i);
                }
            }
        }
        for (var k = 0; k < this.patterns.count(); k++) {
            if (this.patterns.getMatched(k)) { matched++; }
        }
        return matched;
    }
};
    return generalize;
});


//Example Usage:

