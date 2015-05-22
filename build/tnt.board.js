(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
if (typeof tnt === "undefined") {
    module.exports = tnt = {};
}

tnt.board = require("./index.js");

},{"./index.js":2}],2:[function(require,module,exports){
// if (typeof tnt === "undefined") {
//     module.exports = tnt = {}
// }
// tnt.utils = require("tnt.utils");
// tnt.tooltip = require("tnt.tooltip");
// tnt.board = require("./src/index.js");

module.exports = require("./src/index");

},{"./src/index":12}],3:[function(require,module,exports){
module.exports = require("./src/api.js");

},{"./src/api.js":4}],4:[function(require,module,exports){
var api = function (who) {

    var _methods = function () {
	var m = [];

	m.add_batch = function (obj) {
	    m.unshift(obj);
	};

	m.update = function (method, value) {
	    for (var i=0; i<m.length; i++) {
		for (var p in m[i]) {
		    if (p === method) {
			m[i][p] = value;
			return true;
		    }
		}
	    }
	    return false;
	};

	m.add = function (method, value) {
	    if (m.update (method, value) ) {
	    } else {
		var reg = {};
		reg[method] = value;
		m.add_batch (reg);
	    }
	};

	m.get = function (method) {
	    for (var i=0; i<m.length; i++) {
		for (var p in m[i]) {
		    if (p === method) {
			return m[i][p];
		    }
		}
	    }
	};

	return m;
    };

    var methods    = _methods();
    var api = function () {};

    api.check = function (method, check, msg) {
	if (method instanceof Array) {
	    for (var i=0; i<method.length; i++) {
		api.check(method[i], check, msg);
	    }
	    return;
	}

	if (typeof (method) === 'function') {
	    method.check(check, msg);
	} else {
	    who[method].check(check, msg);
	}
	return api;
    };

    api.transform = function (method, cbak) {
	if (method instanceof Array) {
	    for (var i=0; i<method.length; i++) {
		api.transform (method[i], cbak);
	    }
	    return;
	}

	if (typeof (method) === 'function') {
	    method.transform (cbak);
	} else {
	    who[method].transform(cbak);
	}
	return api;
    };

    var attach_method = function (method, opts) {
	var checks = [];
	var transforms = [];

	var getter = opts.on_getter || function () {
	    return methods.get(method);
	};

	var setter = opts.on_setter || function (x) {
	    for (var i=0; i<transforms.length; i++) {
		x = transforms[i](x);
	    }

	    for (var j=0; j<checks.length; j++) {
		if (!checks[j].check(x)) {
		    var msg = checks[j].msg || 
			("Value " + x + " doesn't seem to be valid for this method");
		    throw (msg);
		}
	    }
	    methods.add(method, x);
	};

	var new_method = function (new_val) {
	    if (!arguments.length) {
		return getter();
	    }
	    setter(new_val);
	    return who; // Return this?
	};
	new_method.check = function (cbak, msg) {
	    if (!arguments.length) {
		return checks;
	    }
	    checks.push ({check : cbak,
			  msg   : msg});
	    return this;
	};
	new_method.transform = function (cbak) {
	    if (!arguments.length) {
		return transforms;
	    }
	    transforms.push(cbak);
	    return this;
	};

	who[method] = new_method;
    };

    var getset = function (param, opts) {
	if (typeof (param) === 'object') {
	    methods.add_batch (param);
	    for (var p in param) {
		attach_method (p, opts);
	    }
	} else {
	    methods.add (param, opts.default_value);
	    attach_method (param, opts);
	}
    };

    api.getset = function (param, def) {
	getset(param, {default_value : def});

	return api;
    };

    api.get = function (param, def) {
	var on_setter = function () {
	    throw ("Method defined only as a getter (you are trying to use it as a setter");
	};

	getset(param, {default_value : def,
		       on_setter : on_setter}
	      );

	return api;
    };

    api.set = function (param, def) {
	var on_getter = function () {
	    throw ("Method defined only as a setter (you are trying to use it as a getter");
	};

	getset(param, {default_value : def,
		       on_getter : on_getter}
	      );

	return api;
    };

    api.method = function (name, cbak) {
	if (typeof (name) === 'object') {
	    for (var p in name) {
		who[p] = name[p];
	    }
	} else {
	    who[name] = cbak;
	}
	return api;
    };

    return api;
    
};

module.exports = exports = api;
},{}],5:[function(require,module,exports){
module.exports = require("./src/index.js");

},{"./src/index.js":6}],6:[function(require,module,exports){
// require('fs').readdirSync(__dirname + '/').forEach(function(file) {
//     if (file.match(/.+\.js/g) !== null && file !== __filename) {
// 	var name = file.replace('.js', '');
// 	module.exports[name] = require('./' + file);
//     }
// });

// Same as
var utils = require("./utils.js");
utils.reduce = require("./reduce.js");
module.exports = exports = utils;

},{"./reduce.js":7,"./utils.js":8}],7:[function(require,module,exports){
var reduce = function () {
    var smooth = 5;
    var value = 'val';
    var redundant = function (a, b) {
	if (a < b) {
	    return ((b-a) <= (b * 0.2));
	}
	return ((a-b) <= (a * 0.2));
    };
    var perform_reduce = function (arr) {return arr;};

    var reduce = function (arr) {
	if (!arr.length) {
	    return arr;
	}
	var smoothed = perform_smooth(arr);
	var reduced  = perform_reduce(smoothed);
	return reduced;
    };

    var median = function (v, arr) {
	arr.sort(function (a, b) {
	    return a[value] - b[value];
	});
	if (arr.length % 2) {
	    v[value] = arr[~~(arr.length / 2)][value];	    
	} else {
	    var n = ~~(arr.length / 2) - 1;
	    v[value] = (arr[n][value] + arr[n+1][value]) / 2;
	}

	return v;
    };

    var clone = function (source) {
	var target = {};
	for (var prop in source) {
	    if (source.hasOwnProperty(prop)) {
		target[prop] = source[prop];
	    }
	}
	return target;
    };

    var perform_smooth = function (arr) {
	if (smooth === 0) { // no smooth
	    return arr;
	}
	var smooth_arr = [];
	for (var i=0; i<arr.length; i++) {
	    var low = (i < smooth) ? 0 : (i - smooth);
	    var high = (i > (arr.length - smooth)) ? arr.length : (i + smooth);
	    smooth_arr[i] = median(clone(arr[i]), arr.slice(low,high+1));
	}
	return smooth_arr;
    };

    reduce.reducer = function (cbak) {
	if (!arguments.length) {
	    return perform_reduce;
	}
	perform_reduce = cbak;
	return reduce;
    };

    reduce.redundant = function (cbak) {
	if (!arguments.length) {
	    return redundant;
	}
	redundant = cbak;
	return reduce;
    };

    reduce.value = function (val) {
	if (!arguments.length) {
	    return value;
	}
	value = val;
	return reduce;
    };

    reduce.smooth = function (val) {
	if (!arguments.length) {
	    return smooth;
	}
	smooth = val;
	return reduce;
    };

    return reduce;
};

var block = function () {
    var red = reduce()
	.value('start');

    var value2 = 'end';

    var join = function (obj1, obj2) {
        return {
            'object' : {
                'start' : obj1.object[red.value()],
                'end'   : obj2[value2]
            },
            'value'  : obj2[value2]
        };
    };

    // var join = function (obj1, obj2) { return obj1 };

    red.reducer( function (arr) {
	var value = red.value();
	var redundant = red.redundant();
	var reduced_arr = [];
	var curr = {
	    'object' : arr[0],
	    'value'  : arr[0][value2]
	};
	for (var i=1; i<arr.length; i++) {
	    if (redundant (arr[i][value], curr.value)) {
		curr = join(curr, arr[i]);
		continue;
	    }
	    reduced_arr.push (curr.object);
	    curr.object = arr[i];
	    curr.value = arr[i].end;
	}
	reduced_arr.push(curr.object);

	// reduced_arr.push(arr[arr.length-1]);
	return reduced_arr;
    });

    reduce.join = function (cbak) {
	if (!arguments.length) {
	    return join;
	}
	join = cbak;
	return red;
    };

    reduce.value2 = function (field) {
	if (!arguments.length) {
	    return value2;
	}
	value2 = field;
	return red;
    };

    return red;
};

var line = function () {
    var red = reduce();

    red.reducer ( function (arr) {
	var redundant = red.redundant();
	var value = red.value();
	var reduced_arr = [];
	var curr = arr[0];
	for (var i=1; i<arr.length-1; i++) {
	    if (redundant (arr[i][value], curr[value])) {
		continue;
	    }
	    reduced_arr.push (curr);
	    curr = arr[i];
	}
	reduced_arr.push(curr);
	reduced_arr.push(arr[arr.length-1]);
	return reduced_arr;
    });

    return red;

};

module.exports = reduce;
module.exports.line = line;
module.exports.block = block;


},{}],8:[function(require,module,exports){

module.exports = {
    iterator : function(init_val) {
	var i = init_val || 0;
	var iter = function () {
	    return i++;
	};
	return iter;
    },

    script_path : function (script_name) { // script_name is the filename
	var script_scaped = script_name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	var script_re = new RegExp(script_scaped + '$');
	var script_re_sub = new RegExp('(.*)' + script_scaped + '$');

	// TODO: This requires phantom.js or a similar headless webkit to work (document)
	var scripts = document.getElementsByTagName('script');
	var path = "";  // Default to current path
	if(scripts !== undefined) {
            for(var i in scripts) {
		if(scripts[i].src && scripts[i].src.match(script_re)) {
                    return scripts[i].src.replace(script_re_sub, '$1');
		}
            }
	}
	return path;
    },

    defer_cancel : function (cbak, time) {
	var tick;

	var defer_cancel = function () {
	    clearTimeout(tick);
	    tick = setTimeout(cbak, time);
	};

	return defer_cancel;
    }
};

},{}],9:[function(require,module,exports){
var apijs = require ("tnt.api");
var deferCancel = require ("tnt.utils").defer_cancel;

var board = function() {
    "use strict";
    
    //// Private vars
    var svg;
    var div_id;
    var tracks = [];
    var min_width = 50;
    var height    = 0;    // This is the global height including all the tracks
    var width     = 920;
    var height_offset = 20;
    var loc = {
	species  : undefined,
	chr      : undefined,
        from     : 0,
        to       : 500
    };

    // TODO: We have now background color in the tracks. Can this be removed?
    // It looks like it is used in the too-wide pane etc, but it may not be needed anymore
    var bgColor   = d3.rgb('#F8FBEF'); //#F8FBEF
    var pane; // Draggable pane
    var svg_g;
    var xScale;
    var zoomEventHandler = d3.behavior.zoom();
    var limits = {
	left : 0,
	right : 1000,
	zoom_out : 1000,
	zoom_in  : 100
    };
    var cap_width = 3;
    var dur = 500;
    var drag_allowed = true;

    var exports = {
	ease          : d3.ease("cubic-in-out"),
	extend_canvas : {
	    left : 0,
	    right : 0
	},
	show_frame : true
	// limits        : function () {throw "The limits method should be defined"}	
    };

    // The returned closure / object
    var track_vis = function(div) {
	div_id = d3.select(div).attr("id");

	// The original div is classed with the tnt class
	d3.select(div)
	    .classed("tnt", true);

	// TODO: Move the styling to the scss?
	var browserDiv = d3.select(div)
	    .append("div")
	    .attr("id", "tnt_" + div_id)
	    .style("position", "relative")
	    .classed("tnt_framed", exports.show_frame ? true : false)
	    .style("width", (width + cap_width*2 + exports.extend_canvas.right + exports.extend_canvas.left) + "px")

	var groupDiv = browserDiv
	    .append("div")
	    .attr("class", "tnt_groupDiv");

	// The SVG
	svg = groupDiv
	    .append("svg")
	    .attr("class", "tnt_svg")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("pointer-events", "all");

	svg_g = svg
	    .append("g")
            .attr("transform", "translate(0,20)")
            .append("g")
	    .attr("class", "tnt_g");

	// caps
	svg_g
	    .append("rect")
	    .attr("id", "tnt_" + div_id + "_5pcap")
	    .attr("x", 0)
	    .attr("y", 0)
	    .attr("width", 0)
	    .attr("height", height)
	    .attr("fill", "red");
	svg_g
	    .append("rect")
	    .attr("id", "tnt_" + div_id + "_3pcap")
	    .attr("x", width-cap_width)
	    .attr("y", 0)
	    .attr("width", 0)
	    .attr("height", height)
	    .attr("fill", "red");

	// The Zooming/Panning Pane
	pane = svg_g
	    .append("rect")
	    .attr("class", "tnt_pane")
	    .attr("id", "tnt_" + div_id + "_pane")
	    .attr("width", width)
	    .attr("height", height)
	    .style("fill", bgColor);

	// ** TODO: Wouldn't be better to have these messages by track?
	// var tooWide_text = svg_g
	//     .append("text")
	//     .attr("class", "tnt_wideOK_text")
	//     .attr("id", "tnt_" + div_id + "_tooWide")
	//     .attr("fill", bgColor)
	//     .text("Region too wide");

	// TODO: I don't know if this is the best way (and portable) way
	// of centering the text in the text area
	// var bb = tooWide_text[0][0].getBBox();
	// tooWide_text
	//     .attr("x", ~~(width/2 - bb.width/2))
	//     .attr("y", ~~(height/2 - bb.height/2));
    };

    // API
    var api = apijs (track_vis)
	.getset (exports)
	.getset (limits)
	.getset (loc);

    api.transform (track_vis.extend_canvas, function (val) {
	var prev_val = track_vis.extend_canvas();
	val.left = val.left || prev_val.left;
	val.right = val.right || prev_val.right;
	return val;
    });

    // track_vis always starts on loc.from & loc.to
    api.method ('start', function () {

	// Reset the tracks
	for (var i=0; i<tracks.length; i++) {
	    if (tracks[i].g) {
		tracks[i].display().reset.call(tracks[i]);
	    }
	    _init_track(tracks[i]);
	}

	_place_tracks();

	// The continuation callback
	var cont = function (resp) {
	    limits.right = resp;

	    // zoomEventHandler.xExtent([limits.left, limits.right]);
	    if ((loc.to - loc.from) < limits.zoom_in) {
		if ((loc.from + limits.zoom_in) > limits.zoom_in) {
		    loc.to = limits.right;
		} else {
		    loc.to = loc.from + limits.zoom_in;
		}
	    }
	    plot();

	    for (var i=0; i<tracks.length; i++) {
		_update_track(tracks[i], loc);
	    }
	};

	// If limits.right is a function, we have to call it asynchronously and
	// then starting the plot once we have set the right limit (plot)
	// If not, we assume that it is an objet with new (maybe partially defined)
	// definitions of the limits and we can plot directly
	// TODO: Right now, only right can be called as an async function which is weak
	if (typeof (limits.right) === 'function') {
	    limits.right(cont);
	} else {
	    cont(limits.right);
	}

    });

    api.method ('update', function () {
	for (var i=0; i<tracks.length; i++) {
	    _update_track (tracks[i]);
	}

    });

    var _update_track = function (track, where) {
	if (track.data()) {
	    var track_data = track.data();
	    var data_updater = track_data.update();
	    //var data_updater = track.data().update();
	    data_updater.call(track_data, {
		'loc' : where,
		'on_success' : function () {
		    track.display().update.call(track, xScale);
		}
	    });
	}
    };

    var plot = function() {

	xScale = d3.scale.linear()
	    .domain([loc.from, loc.to])
	    .range([0, width]);

	if (drag_allowed) {
	    svg_g.call( zoomEventHandler
		       .x(xScale)
		       .scaleExtent([(loc.to-loc.from)/(limits.zoom_out-1), (loc.to-loc.from)/limits.zoom_in])
		       .on("zoom", _move)
		     );
	}

    };

    // right/left/zoom pans or zooms the track. These methods are exposed to allow external buttons, etc to interact with the tracks. The argument is the amount of panning/zooming (ie. 1.2 means 20% panning) With left/right only positive numbers are allowed.
    api.method ('move_right', function (factor) {
	if (factor > 0) {
	    _manual_move(factor, 1);
	}
    });

    api.method ('move_left', function (factor) {
	if (factor > 0) {
	    _manual_move(factor, -1);
	}
    });

    api.method ('zoom', function (factor) {
	_manual_move(factor, 0);
    });

    api.method ('find_track_by_id', function (id) {
	for (var i=0; i<tracks.length; i++) {
	    if (tracks[i].id() === id) {
		return tracks[i];
	    }
	}
    });

    api.method ('reorder', function (new_tracks) {
	// TODO: This is defining a new height, but the global height is used to define the size of several
	// parts. We should do this dynamically

	for (var j=0; j<new_tracks.length; j++) {
	    var found = false;
	    for (var i=0; i<tracks.length; i++) {
		if (tracks[i].id() === new_tracks[j].id()) {
		    found = true;
		    tracks.splice(i,1);
		    break;
		}
	    }
	    if (!found) {
		_init_track(new_tracks[j]);
		_update_track(new_tracks[j], {from : loc.from, to : loc.to});
	    }
	}

	for (var x=0; x<tracks.length; x++) {
	    tracks[x].g.remove();
	}

	tracks = new_tracks;
	_place_tracks();

    });

    api.method ('remove_track', function (track) {
	track.g.remove();
    });

    api.method ('add_track', function (track) {
	if (track instanceof Array) {
	    for (var i=0; i<track.length; i++) {
		track_vis.add_track (track[i]);
	    }
	    return track_vis;
	}
	tracks.push(track);
	return track_vis;
    });

    api.method('tracks', function (new_tracks) {
	if (!arguments.length) {
	    return tracks
	}
	tracks = new_tracks;
	return track_vis;
    });

    // 
    api.method ('width', function (w) {
	// TODO: Allow suffixes like "1000px"?
	// TODO: Test wrong formats
	if (!arguments.length) {
	    return width;
	}
	// At least min-width
	if (w < min_width) {
	    w = min_width
	}

	// We are resizing
	if (div_id !== undefined) {
	    d3.select("#tnt_" + div_id).select("svg").attr("width", w);
	    // Resize the zooming/panning pane
	    d3.select("#tnt_" + div_id).style("width", (parseInt(w) + cap_width*2) + "px");
	    d3.select("#tnt_" + div_id + "_pane").attr("width", w);

	    // Replot
	    width = w;
	    plot();
	    for (var i=0; i<tracks.length; i++) {
		tracks[i].g.select("rect").attr("width", w);
		tracks[i].display().reset.call(tracks[i]);
		tracks[i].display().update.call(tracks[i],xScale);
	    }
	    
	} else {
	    width = w;
	}
	
	return track_vis;
    });

    api.method('allow_drag', function(b) {
	if (!arguments.length) {
	    return drag_allowed;
	}
	drag_allowed = b;
	if (drag_allowed) {
	    // When this method is called on the object before starting the simulation, we don't have defined xScale
	    if (xScale !== undefined) {
		svg_g.call( zoomEventHandler.x(xScale)
			   // .xExtent([0, limits.right])
			   .scaleExtent([(loc.to-loc.from)/(limits.zoom_out-1), (loc.to-loc.from)/limits.zoom_in])
			   .on("zoom", _move) );
	    }
	} else {
	    // We create a new dummy scale in x to avoid dragging the previous one
	    // TODO: There may be a cheaper way of doing this?
	    zoomEventHandler.x(d3.scale.linear()).on("zoom", null);
	}
	return track_vis;
    });

    var _place_tracks = function () {
	var h = 0;
	for (var i=0; i<tracks.length; i++) {
	    var track = tracks[i];
	    if (track.g.attr("transform")) {
		track.g
		    .transition()
		    .duration(dur)
		    .attr("transform", "translate(" + exports.extend_canvas.left + "," + h + ")");
	    } else {
		track.g
		    .attr("transform", "translate(" + exports.extend_canvas.left + "," + h + ")");
	    }

	    h += track.height();
	}

	// svg
	svg.attr("height", h + height_offset);

	// div
	d3.select("#tnt_" + div_id)
	    .style("height", (h + 10 + height_offset) + "px");

	// caps
	d3.select("#tnt_" + div_id + "_5pcap")
	    .attr("height", h)
	    // .move_to_front()
	    .each(function (d) {
		move_to_front(this);
	    })
	d3.select("#tnt_" + div_id + "_3pcap")
	    .attr("height", h)
	//.move_to_front()
	    .each (function (d) {
		move_to_front(this);
	    });
	

	// pane
	pane
	    .attr("height", h + height_offset);

	// tooWide_text. TODO: Is this still needed?
	// var tooWide_text = d3.select("#tnt_" + div_id + "_tooWide");
	// var bb = tooWide_text[0][0].getBBox();
	// tooWide_text
	//     .attr("y", ~~(h/2) - bb.height/2);

	return track_vis;
    }

    var _init_track = function (track) {
	track.g = svg.select("g").select("g")
	    .append("g")
	    .attr("class", "tnt_track")
	    .attr("height", track.height());

	// Rect for the background color
	track.g
	    .append("rect")
	    .attr("x", 0)
	    .attr("y", 0)
	    .attr("width", track_vis.width())
	    .attr("height", track.height())
	    .style("fill", track.background_color())
	    .style("pointer-events", "none");

	if (track.display()) {
	    track.display().init.call(track, width);
	}
	
	return track_vis;
    };

    var _manual_move = function (factor, direction) {
	var oldDomain = xScale.domain();

	var span = oldDomain[1] - oldDomain[0];
	var offset = (span * factor) - span;

	var newDomain;
	switch (direction) {
	case -1 :
	    newDomain = [(~~oldDomain[0] - offset), ~~(oldDomain[1] - offset)];
	    break;
	case 1 :
	    newDomain = [(~~oldDomain[0] + offset), ~~(oldDomain[1] - offset)];
	    break;
	case 0 :
	    newDomain = [oldDomain[0] - ~~(offset/2), oldDomain[1] + (~~offset/2)];
	}

	var interpolator = d3.interpolateNumber(oldDomain[0], newDomain[0]);
	var ease = exports.ease;

	var x = 0;
	d3.timer(function() {
	    var curr_start = interpolator(ease(x));
	    var curr_end;
	    switch (direction) {
	    case -1 :
		curr_end = curr_start + span;
		break;
	    case 1 :
		curr_end = curr_start + span;
		break;
	    case 0 :
		curr_end = oldDomain[1] + oldDomain[0] - curr_start;
		break;
	    }

	    var currDomain = [curr_start, curr_end];
	    xScale.domain(currDomain);
	    _move(xScale);
	    x+=0.02;
	    return x>1;
	});
    };


    var _move_cbak = function () {
	var currDomain = xScale.domain();
	track_vis.from(~~currDomain[0]);
	track_vis.to(~~currDomain[1]);

	for (var i = 0; i < tracks.length; i++) {
	    var track = tracks[i];
	    _update_track(track, loc);
	}
    };
    // The deferred_cbak is deferred at least this amount of time or re-scheduled if deferred is called before
    var _deferred = deferCancel(_move_cbak, 300);

    // api.method('update', function () {
    // 	_move();
    // });

    var _move = function (new_xScale) {
	if (new_xScale !== undefined && drag_allowed) {
	    zoomEventHandler.x(new_xScale);
	}

	// Show the red bars at the limits
	var domain = xScale.domain();
	if (domain[0] <= 5) {
	    d3.select("#tnt_" + div_id + "_5pcap")
		.attr("width", cap_width)
		.transition()
		.duration(200)
		.attr("width", 0);
	}

	if (domain[1] >= (limits.right)-5) {
	    d3.select("#tnt_" + div_id + "_3pcap")
		.attr("width", cap_width)
		.transition()
		.duration(200)
		.attr("width", 0);
	}


	// Avoid moving past the limits
	if (domain[0] < limits.left) {
	    zoomEventHandler.translate([zoomEventHandler.translate()[0] - xScale(limits.left) + xScale.range()[0], zoomEventHandler.translate()[1]]);
	} else if (domain[1] > limits.right) {
	    zoomEventHandler.translate([zoomEventHandler.translate()[0] - xScale(limits.right) + xScale.range()[1], zoomEventHandler.translate()[1]]);
	}

	_deferred();

	for (var i = 0; i < tracks.length; i++) {
	    var track = tracks[i];
	    track.display().move.call(track,xScale);
	}
    };

    // api.method({
    // 	allow_drag : api_allow_drag,
    // 	width      : api_width,
    // 	add_track  : api_add_track,
    // 	reorder    : api_reorder,
    // 	zoom       : api_zoom,
    // 	left       : api_left,
    // 	right      : api_right,
    // 	start      : api_start
    // });

    // Auxiliar functions
    function move_to_front (elem) {
	elem.parentNode.appendChild(elem);
    }
    
    return track_vis;
};

module.exports = exports = board;

},{"tnt.api":3,"tnt.utils":5}],10:[function(require,module,exports){
var apijs = require ("tnt.api");
// var ensemblRestAPI = require("tnt.ensembl");

// var board = {};
// board.track = {};

var data = function() {
    "use strict";
    var _ = function () {
    };

    // Getters / Setters
    apijs (_)
    // label is not used at the moment
	.getset ('label', "")
	.getset ('elements', [])
	.getset ('update', function () {});

    return _;
};

// The retrievers. They need to access 'elements'
data.retriever = {};

data.retriever.sync = function() {
    var update_track = function(obj) {
	// "this" is set to the data obj
        this.elements(update_track.retriever()(obj.loc));
        obj.on_success();
    };

    apijs (update_track)
	.getset ('retriever', function () {})

    return update_track;
};

data.retriever.async = function () {
    var url = '';

    // "this" is set to the data obj
    var data_obj = this;
    var update_track = function (obj) {
	d3.json(url, function (err, resp) {
	    data_obj.elements(resp);
	    obj.on_success();
	}); 
    };

    apijs (update_track)
	.getset ('url', '');

    return update_track;
};



// A predefined track for genes
// tnt.track.data.gene = function () {
//     var track = tnt.track.data();
// 	// .index("ID");

//     var updater = tnt.track.retriever.ensembl()
// 	.endpoint("region")
//     // TODO: If success is defined here, means that it can't be user-defined
//     // is that good? enough? API?
//     // UPDATE: Now success is backed up by an array. Still don't know if this is the best option
// 	.success(function(genes) {
// 	    for (var i = 0; i < genes.length; i++) {
// 		if (genes[i].strand === -1) {  
// 		    genes[i].display_label = "<" + genes[i].external_name;
// 		} else {
// 		    genes[i].display_label = genes[i].external_name + ">";
// 		}
// 	    }
// 	});

//     return track.update(updater);
// }

// A predefined track displaying no external data
// it is used for location and axis tracks for example
data.empty = function () {
    var track = data();
    var updater = data.retriever.sync();
    track.update(updater);

    return track;
};

module.exports = exports = data;

},{"tnt.api":3}],11:[function(require,module,exports){
var apijs = require ("tnt.api");
var layout = require("./layout.js");

// FEATURE VIS
// var board = {};
// board.track = {};
var tnt_feature = function () {
    ////// Vars exposed in the API
    var exports = {
	create   : function () {throw "create_elem is not defined in the base feature object";},
	mover    : function () {throw "move_elem is not defined in the base feature object";},
	updater  : function () {},
	on_click : function () {},
	on_mouseover : function () {},
	guider   : function () {},
	index    : undefined,
	layout   : layout.identity(),
	foreground_color : '#000'
    };


    // The returned object
    var feature = {};

    var reset = function () {
    	var track = this;
    	track.g.selectAll(".tnt_elem").remove();
	track.g.selectAll(".tnt_guider").remove();
    };

    var init = function (width) {
	var track = this;
	exports.guider.call(track, width);
    };

    var plot = function (new_elems, track, xScale) {
	new_elems.on("click", exports.on_click);
	new_elems.on("mouseover", exports.on_mouseover);
	// new_elem is a g element where the feature is inserted
	exports.create.call(track, new_elems, xScale);
    };

    var update = function (xScale, field) {
	var track = this;
	var svg_g = track.g;
	var layout = exports.layout;

	var elements = track.data().elements();

	if (field !== undefined) {
	    elements = elements[field];
	}

	layout(elements, xScale);
	var data_elems = layout.elements();

	var vis_sel;
	var vis_elems;
	if (field !== undefined) {
	    vis_sel = svg_g.selectAll(".tnt_elem_" + field);
	} else {
	    vis_sel = svg_g.selectAll(".tnt_elem");
	}

	if (exports.index) { // Indexing by field
	    vis_elems = vis_sel
		.data(data_elems, function (d) {
		    if (d !== undefined) {
			return exports.index(d);
		    }
		});
	} else { // Indexing by position in array
	    vis_elems = vis_sel
		.data(data_elems);
	}

	exports.updater.call(track, vis_elems, xScale);

	var new_elem = vis_elems
	    .enter();

	new_elem
	    .append("g")
	    .attr("class", "tnt_elem")
	    .classed("tnt_elem_" + field, field)
	    .call(feature.plot, track, xScale);

	vis_elems
	    .exit()
	    .remove();
    };

    var move = function (xScale, field) {
	var track = this;
	var svg_g = track.g;
	var elems;
	// TODO: Is selecting the elements to move too slow?
	// It would be nice to profile
	if (field !== undefined) {
	    elems = svg_g.selectAll(".tnt_elem_" + field);
	} else {
	    elems = svg_g.selectAll(".tnt_elem");
	}

	exports.mover.call(this, elems, xScale);
    };

    var mtf = function (elem) {
	elem.parentNode.appendChild(elem);
    };

    var move_to_front = function (field) {
	if (field !== undefined) {
	    var track = this;
	    var svg_g = track.g;
	    svg_g.selectAll(".tnt_elem_" + field)
	        .each( function () {
		    mtf(this);
		});
	}
    };

    // API
    apijs (feature)
	.getset (exports)
	.method ({
	    reset  : reset,
	    plot   : plot,
	    update : update,
	    move   : move,
	    init   : init,
	    move_to_front : move_to_front
	});

    return feature;
};

tnt_feature.composite = function () {
    var displays = {};
    var display_order = [];

    var features = {};

    var reset = function () {
	var track = this;
	for (var i=0; i<displays.length; i++) {
	    displays[i].reset.call(track);
	}
    };

    var init = function (width) {
	var track = this;
 	for (var display in displays) {
	    if (displays.hasOwnProperty(display)) {
		displays[display].init.call(track, width);
	    }
	}
    };

    var update = function (xScale) {
	var track = this;
	for (var i=0; i<display_order.length; i++) {
	    displays[display_order[i]].update.call(track, xScale, display_order[i]);
	    displays[display_order[i]].move_to_front.call(track, display_order[i]);
	}
	// for (var display in displays) {
	//     if (displays.hasOwnProperty(display)) {
	// 	displays[display].update.call(track, xScale, display);
	//     }
	// }
    };

    var move = function (xScale) {
	var track = this;
	for (var display in displays) {
	    if (displays.hasOwnProperty(display)) {
		displays[display].move.call(track, xScale, display);
	    }
	}
    };

    var add = function (key, display) {
	displays[key] = display;
	display_order.push(key);
	return features;
    };

    var on_click = function (cbak) {
	for (var display in displays) {
	    if (displays.hasOwnProperty(display)) {
		displays[display].on_click(cbak);
	    }
	}
	return features;
    };

    var get_displays = function () {
	var ds = [];
	for (var i=0; i<display_order.length; i++) {
	    ds.push(displays[display_order[i]]);
	}
	return ds;
    };

    // API
    apijs (features)
	.method ({
	    reset  : reset,
	    update : update,
	    move   : move,
	    init   : init,
	    add    : add,
	    on_click : on_click,
	    displays : get_displays
	});

    return features;
};

tnt_feature.area = function () {
    var feature = tnt_feature.line();
    var line = tnt_feature.line();

    var area = d3.svg.area()
	.interpolate(line.interpolate())
	.tension(feature.tension());

    var data_points;

    var line_create = feature.create(); // We 'save' line creation
    feature.create (function (points, xScale) {
	var track = this;

	if (data_points !== undefined) {
//	     return;
	    track.g.select("path").remove();
	}

	line_create.call(track, points, xScale);

	area
	    .x(line.x())
	    .y1(line.y())
	    .y0(track.height());

	data_points = points.data();
	points.remove();

	track.g
	    .append("path")
	    .attr("class", "tnt_area")
	    .classed("tnt_elem", true)
	    .datum(data_points)
	    .attr("d", area)
	    .attr("fill", d3.rgb(feature.foreground_color()).brighter());

    });

    var line_mover = feature.mover();
    feature.mover (function (path, xScale) {
	var track = this;
	line_mover.call(track, path, xScale);

	area.x(line.x());
	track.g
	    .select(".tnt_area")
	    .datum(data_points)
	    .attr("d", area);
    });

    return feature;

};

tnt_feature.line = function () {
    var feature = tnt_feature();

    var x = function (d) {
	return d.pos;
    };
    var y = function (d) {
	return d.val;
    };
    var tension = 0.7;
    var yScale = d3.scale.linear();
    var line = d3.svg.line()
	.interpolate("basis");

    // line getter. TODO: Setter?
    feature.line = function () {
	return line;
    };

    feature.x = function (cbak) {
	if (!arguments.length) {
	    return x;
	}
	x = cbak;
	return feature;
    };

    feature.y = function (cbak) {
	if (!arguments.length) {
	    return y;
	}
	y = cbak;
	return feature;
    };

    feature.tension = function (t) {
	if (!arguments.length) {
	    return tension;
	}
	tension = t;
	return feature;
    };

    var data_points;

    // For now, create is a one-off event
    // TODO: Make it work with partial paths, ie. creating and displaying only the path that is being displayed
    feature.create (function (points, xScale) {
	var track = this;

	if (data_points !== undefined) {
	    // return;
	    track.g.select("path").remove();
	}

	line
	    .tension(tension)
	    .x(function (d) {
		return xScale(x(d));
	    })
	    .y(function (d) {
		return track.height() - yScale(y(d));
	    })

	data_points = points.data();
	points.remove();

	yScale
	    .domain([0, 1])
	    // .domain([0, d3.max(data_points, function (d) {
	    // 	return y(d);
	    // })])
	    .range([0, track.height() - 2]);

	track.g
	    .append("path")
	    .attr("class", "tnt_elem")
	    .attr("d", line(data_points))
	    .style("stroke", feature.foreground_color())
	    .style("stroke-width", 4)
	    .style("fill", "none");

    });

    feature.mover (function (path, xScale) {
	var track = this;

	line.x(function (d) {
	    return xScale(x(d))
	});
	track.g.select("path")
	    .attr("d", line(data_points));
    });

    return feature;
};

tnt_feature.conservation = function () {
    // 'Inherit' from feature.area
    var feature = tnt_feature.area();

    var area_create = feature.create(); // We 'save' area creation
    feature.create  (function (points, xScale) {
	var track = this;

	area_create.call(track, d3.select(points[0][0]), xScale)
    });

    return feature;
};

tnt_feature.ensembl = function () {
    // 'Inherit' from board.track.feature
    var feature = tnt_feature();

    var foreground_color2 = "#7FFF00";
    var foreground_color3 = "#00BB00";

    feature.guider (function (width) {
	var track = this;
	var height_offset = ~~(track.height() - (track.height()  * 0.8)) / 2;

	track.g
	    .append("line")
	    .attr("class", "tnt_guider")
	    .attr("x1", 0)
	    .attr("x2", width)
	    .attr("y1", height_offset)
	    .attr("y2", height_offset)
	    .style("stroke", feature.foreground_color())
	    .style("stroke-width", 1);

	track.g
	    .append("line")
	    .attr("class", "tnt_guider")
	    .attr("x1", 0)
	    .attr("x2", width)
	    .attr("y1", track.height() - height_offset)
	    .attr("y2", track.height() - height_offset)
	    .style("stroke", feature.foreground_color())
	    .style("stroke-width", 1);

    });

    feature.create (function (new_elems, xScale) {
	var track = this;

	var height_offset = ~~(track.height() - (track.height()  * 0.8)) / 2;

	new_elems
	    .append("rect")
	    .attr("x", function (d) {
		return xScale (d.start);
	    })
	    .attr("y", height_offset)
// 	    .attr("rx", 3)
// 	    .attr("ry", 3)
	    .attr("width", function (d) {
		return (xScale(d.end) - xScale(d.start));
	    })
	    .attr("height", track.height() - ~~(height_offset * 2))
	    .attr("fill", track.background_color())
	    .transition()
	    .duration(500)
	    .attr("fill", function (d) {
		if (d.type === 'high') {
		    return d3.rgb(feature.foreground_color());
		}
		if (d.type === 'low') {
		    return d3.rgb(feature.foreground_color2());
		}
		return d3.rgb(feature.foreground_color3());
	    });
    });

    feature.updater (function (blocks, xScale) {
	blocks
	    .select("rect")
	    .attr("width", function (d) {
		return (xScale(d.end) - xScale(d.start))
	    });
    });

    feature.mover (function (blocks, xScale) {
	blocks
	    .select("rect")
	    .attr("x", function (d) {
		return xScale(d.start);
	    })
	    .attr("width", function (d) {
		return (xScale(d.end) - xScale(d.start));
	    });
    });

    feature.foreground_color2 = function (col) {
	if (!arguments.length) {
	    return foreground_color2;
	}
	foreground_color2 = col;
	return feature;
    };

    feature.foreground_color3 = function (col) {
	if (!arguments.length) {
	    return foreground_color3;
	}
	foreground_color3 = col;
	return feature;
    };

    return feature;
};

tnt_feature.vline = function () {
    // 'Inherit' from feature
    var feature = tnt_feature();

    feature.create (function (new_elems, xScale) {
	var track = this;
	new_elems
	    .append ("line")
	    .attr("x1", function (d) {
		// TODO: Should use the index value?
		return xScale(feature.index()(d))
	    })
	    .attr("x2", function (d) {
		return xScale(feature.index()(d))
	    })
	    .attr("y1", 0)
	    .attr("y2", track.height())
	    .attr("stroke", feature.foreground_color())
	    .attr("stroke-width", 1);
    });

    feature.mover (function (vlines, xScale) {
	vlines
	    .select("line")
	    .attr("x1", function (d) {
		return xScale(feature.index()(d));
	    })
	    .attr("x2", function (d) {
		return xScale(feature.index()(d));
	    });
    });

    return feature;

};

tnt_feature.pin = function () {
    // 'Inherit' from board.track.feature
    var feature = tnt_feature();

    var yScale = d3.scale.linear()
	.domain([0,0])
	.range([0,0]);

    var opts = {
	pos : d3.functor("pos"),
	val : d3.functor("val"),
	domain : [0,0]
    };

    var pin_ball_r = 5; // the radius of the circle in the pin

    apijs(feature)
	.getset(opts);


    feature.create (function (new_pins, xScale) {
	var track = this;
	yScale
	    .domain(feature.domain())
	    .range([pin_ball_r, track.height()-pin_ball_r]);

	// pins are composed of lines and circles
	new_pins
	    .append("line")
	    .attr("x1", function (d, i) {
	    	return xScale(d[opts.pos(d, i)])
	    })
	    .attr("y1", function (d) {
	    	return track.height();
	    })
	    .attr("x2", function (d,i) {
	    	return xScale(d[opts.pos(d, i)]);
	    })
	    .attr("y2", function (d, i) {
	    	return track.height() - yScale(d[opts.val(d, i)]);
	    })
	    .attr("stroke", feature.foreground_color());

	new_pins
	    .append("circle")
	    .attr("cx", function (d, i) {
		return xScale(d[opts.pos(d, i)]);
	    })
	    .attr("cy", function (d, i) {
		return track.height() - yScale(d[opts.val(d, i)]);
	    })
	    .attr("r", pin_ball_r)
	    .attr("fill", feature.foreground_color());
    });

    feature.mover(function (pins, xScale) {
	var track = this;
	pins
	    //.each(position_pin_line)
	    .select("line")
	    .attr("x1", function (d, i) {
		return xScale(d[opts.pos(d, i)])
	    })
	    .attr("y1", function (d) {
		return track.height();
	    })
	    .attr("x2", function (d,i) {
		return xScale(d[opts.pos(d, i)]);
	    })
	    .attr("y2", function (d, i) {
		return track.height() - yScale(d[opts.val(d, i)]);
	    });

	pins
	    .select("circle")
	    .attr("cx", function (d, i) {
		return xScale(d[opts.pos(d, i)]);
	    })
	    .attr("cy", function (d, i) {
		return track.height() - yScale(d[opts.val(d, i)]);
	    });

    });

    feature.guider (function (width) {
	var track = this;
	track.g
	    .append("line")
	    .attr("x1", 0)
	    .attr("x2", width)
	    .attr("y1", track.height())
	    .attr("y2", track.height())
	    .style("stroke", "black")
	    .style("stroke-with", "1px");
    });

    return feature;
};

tnt_feature.block = function () {
    // 'Inherit' from board.track.feature
    var feature = tnt_feature();

    apijs(feature)
	.getset('from', function (d) {
	    return d.start;
	})
	.getset('to', function (d) {
	    return d.end;
	});

    feature.create(function (new_elems, xScale) {
	var track = this;
	new_elems
	    .append("rect")
	    .attr("x", function (d, i) {
		// TODO: start, end should be adjustable via the tracks API
		return xScale(feature.from()(d, i));
	    })
	    .attr("y", 0)
	    .attr("width", function (d, i) {
		return (xScale(feature.to()(d, i)) - xScale(feature.from()(d, i)));
	    })
	    .attr("height", track.height())
	    .attr("fill", track.background_color())
	    .transition()
	    .duration(500)
	    .attr("fill", function (d) {
		if (d.color === undefined) {
		    return feature.foreground_color();
		} else {
		    return d.color;
		}
	    });
    });

    feature.updater(function (elems, xScale) {
	elems
	    .select("rect")
	    .attr("width", function (d) {
		return (xScale(d.end) - xScale(d.start));
	    });
    });

    feature.mover(function (blocks, xScale) {
	blocks
	    .select("rect")
	    .attr("x", function (d) {
		return xScale(d.start);
	    })
	    .attr("width", function (d) {
		return (xScale(d.end) - xScale(d.start));
	    });
    });

    return feature;

};

tnt_feature.axis = function () {
    var xAxis;
    var orientation = "top";

    // Axis doesn't inherit from feature
    var feature = {};
    feature.reset = function () {
	xAxis = undefined;
	var track = this;
	track.g.selectAll("rect").remove();
	track.g.selectAll(".tick").remove();
    };
    feature.plot = function () {};
    feature.move = function () {
	var track = this;
	var svg_g = track.g;
	svg_g.call(xAxis);
    }

    feature.init = function () {};

    feature.update = function (xScale) {
	// Create Axis if it doesn't exist
	if (xAxis === undefined) {
	    xAxis = d3.svg.axis()
		.scale(xScale)
		.orient(orientation);
	}

	var track = this;
	var svg_g = track.g;
	svg_g.call(xAxis);
    };

    feature.orientation = function (pos) {
	if (!arguments.length) {
	    return orientation;
	}
	orientation = pos;
	return feature;
    };

    return feature;
};

tnt_feature.location = function () {
    var row;

    var feature = {};
    feature.reset = function () {};
    feature.plot = function () {};
    feature.init = function () {};
    feature.move = function(xScale) {
	var domain = xScale.domain();
	row.select("text")
	    .text("Location: " + ~~domain[0] + "-" + ~~domain[1]);
    };

    feature.update = function (xScale) {
	var track = this;
	var svg_g = track.g;
	var domain = xScale.domain();
	if (row === undefined) {
	    row = svg_g;
	    row
		.append("text")
		.text("Location: " + ~~domain[0] + "-" + ~~domain[1]);
	}
    };

    return feature;
};

module.exports = exports = tnt_feature;

},{"./layout.js":13,"tnt.api":3}],12:[function(require,module,exports){
var board = require ("./board.js");
board.track = require ("./track");
board.track.data = require ("./data.js");
board.track.layout = require ("./layout.js");
board.track.feature = require ("./feature.js");

module.exports = exports = board;

},{"./board.js":9,"./data.js":10,"./feature.js":11,"./layout.js":13,"./track":14}],13:[function(require,module,exports){
var apijs = require ("tnt.api");

// var board = {};
// board.track = {};
layout = {};

layout.identity = function () {
    // vars exposed in the API:
    var elements;

    // The returned closure / object
    var l = function (new_elements) {
	elements = new_elements;
    }

    var api = apijs (l)
	.method ({
	    height   : function () {},
	    elements : function () {
		return elements;
	    }
	});

    return l;
};

module.exports = exports = layout;

},{"tnt.api":3}],14:[function(require,module,exports){
var apijs = require ("tnt.api");
var iterator = require("tnt.utils").iterator;

//var board = {};

var track = function () {
    "use strict";

    var read_conf = {
	// Unique ID for this track
	id : track.id()
    };

    var display;

    var conf = {
	// foreground_color : d3.rgb('#000000'),
	background_color : d3.rgb('#CCCCCC'),
	height           : 250,
	// data is the object (normally a tnt.track.data object) used to retrieve and update data for the track
	data             : track.data.empty()
    };

    // The returned object / closure
    var _ = function() {
    };

    // API
    var api = apijs (_)
	.getset (conf)
	.get (read_conf);

    // TODO: This means that height should be defined before display
    // we shouldn't rely on this
    _.display = function (new_plotter) {
	if (!arguments.length) {
	    return display;
	}
	display = new_plotter;
	if (typeof (display) === 'function') {
	    display.layout && display.layout().height(conf.height);	    
	} else {
	    for (var key in display) {
		if (display.hasOwnProperty(key)) {
		    display[key].layout && display[key].layout().height(conf.height);
		}
	    }
	}

	return _;
    };

    return _;

};

track.id = iterator(1);

module.exports = exports = track;

},{"tnt.api":3,"tnt.utils":5}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9waWduYXRlbGxpL3NyYy9yZXBvcy90bnQuYm9hcmQvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3BpZ25hdGVsbGkvc3JjL3JlcG9zL3RudC5ib2FyZC9mYWtlXzdmNDczMzU5LmpzIiwiL1VzZXJzL3BpZ25hdGVsbGkvc3JjL3JlcG9zL3RudC5ib2FyZC9pbmRleC5qcyIsIi9Vc2Vycy9waWduYXRlbGxpL3NyYy9yZXBvcy90bnQuYm9hcmQvbm9kZV9tb2R1bGVzL3RudC5hcGkvaW5kZXguanMiLCIvVXNlcnMvcGlnbmF0ZWxsaS9zcmMvcmVwb3MvdG50LmJvYXJkL25vZGVfbW9kdWxlcy90bnQuYXBpL3NyYy9hcGkuanMiLCIvVXNlcnMvcGlnbmF0ZWxsaS9zcmMvcmVwb3MvdG50LmJvYXJkL25vZGVfbW9kdWxlcy90bnQudXRpbHMvaW5kZXguanMiLCIvVXNlcnMvcGlnbmF0ZWxsaS9zcmMvcmVwb3MvdG50LmJvYXJkL25vZGVfbW9kdWxlcy90bnQudXRpbHMvc3JjL2luZGV4LmpzIiwiL1VzZXJzL3BpZ25hdGVsbGkvc3JjL3JlcG9zL3RudC5ib2FyZC9ub2RlX21vZHVsZXMvdG50LnV0aWxzL3NyYy9yZWR1Y2UuanMiLCIvVXNlcnMvcGlnbmF0ZWxsaS9zcmMvcmVwb3MvdG50LmJvYXJkL25vZGVfbW9kdWxlcy90bnQudXRpbHMvc3JjL3V0aWxzLmpzIiwiL1VzZXJzL3BpZ25hdGVsbGkvc3JjL3JlcG9zL3RudC5ib2FyZC9zcmMvYm9hcmQuanMiLCIvVXNlcnMvcGlnbmF0ZWxsaS9zcmMvcmVwb3MvdG50LmJvYXJkL3NyYy9kYXRhLmpzIiwiL1VzZXJzL3BpZ25hdGVsbGkvc3JjL3JlcG9zL3RudC5ib2FyZC9zcmMvZmVhdHVyZS5qcyIsIi9Vc2Vycy9waWduYXRlbGxpL3NyYy9yZXBvcy90bnQuYm9hcmQvc3JjL2luZGV4LmpzIiwiL1VzZXJzL3BpZ25hdGVsbGkvc3JjL3JlcG9zL3RudC5ib2FyZC9zcmMvbGF5b3V0LmpzIiwiL1VzZXJzL3BpZ25hdGVsbGkvc3JjL3JlcG9zL3RudC5ib2FyZC9zcmMvdHJhY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyaUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3B2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImlmICh0eXBlb2YgdG50ID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB0bnQgPSB7fTtcbn1cblxudG50LmJvYXJkID0gcmVxdWlyZShcIi4vaW5kZXguanNcIik7XG4iLCIvLyBpZiAodHlwZW9mIHRudCA9PT0gXCJ1bmRlZmluZWRcIikge1xuLy8gICAgIG1vZHVsZS5leHBvcnRzID0gdG50ID0ge31cbi8vIH1cbi8vIHRudC51dGlscyA9IHJlcXVpcmUoXCJ0bnQudXRpbHNcIik7XG4vLyB0bnQudG9vbHRpcCA9IHJlcXVpcmUoXCJ0bnQudG9vbHRpcFwiKTtcbi8vIHRudC5ib2FyZCA9IHJlcXVpcmUoXCIuL3NyYy9pbmRleC5qc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9zcmMvaW5kZXhcIik7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL3NyYy9hcGkuanNcIik7XG4iLCJ2YXIgYXBpID0gZnVuY3Rpb24gKHdobykge1xuXG4gICAgdmFyIF9tZXRob2RzID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgbSA9IFtdO1xuXG5cdG0uYWRkX2JhdGNoID0gZnVuY3Rpb24gKG9iaikge1xuXHQgICAgbS51bnNoaWZ0KG9iaik7XG5cdH07XG5cblx0bS51cGRhdGUgPSBmdW5jdGlvbiAobWV0aG9kLCB2YWx1ZSkge1xuXHQgICAgZm9yICh2YXIgaT0wOyBpPG0ubGVuZ3RoOyBpKyspIHtcblx0XHRmb3IgKHZhciBwIGluIG1baV0pIHtcblx0XHQgICAgaWYgKHAgPT09IG1ldGhvZCkge1xuXHRcdFx0bVtpXVtwXSA9IHZhbHVlO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0ICAgIH1cblx0XHR9XG5cdCAgICB9XG5cdCAgICByZXR1cm4gZmFsc2U7XG5cdH07XG5cblx0bS5hZGQgPSBmdW5jdGlvbiAobWV0aG9kLCB2YWx1ZSkge1xuXHQgICAgaWYgKG0udXBkYXRlIChtZXRob2QsIHZhbHVlKSApIHtcblx0ICAgIH0gZWxzZSB7XG5cdFx0dmFyIHJlZyA9IHt9O1xuXHRcdHJlZ1ttZXRob2RdID0gdmFsdWU7XG5cdFx0bS5hZGRfYmF0Y2ggKHJlZyk7XG5cdCAgICB9XG5cdH07XG5cblx0bS5nZXQgPSBmdW5jdGlvbiAobWV0aG9kKSB7XG5cdCAgICBmb3IgKHZhciBpPTA7IGk8bS5sZW5ndGg7IGkrKykge1xuXHRcdGZvciAodmFyIHAgaW4gbVtpXSkge1xuXHRcdCAgICBpZiAocCA9PT0gbWV0aG9kKSB7XG5cdFx0XHRyZXR1cm4gbVtpXVtwXTtcblx0XHQgICAgfVxuXHRcdH1cblx0ICAgIH1cblx0fTtcblxuXHRyZXR1cm4gbTtcbiAgICB9O1xuXG4gICAgdmFyIG1ldGhvZHMgICAgPSBfbWV0aG9kcygpO1xuICAgIHZhciBhcGkgPSBmdW5jdGlvbiAoKSB7fTtcblxuICAgIGFwaS5jaGVjayA9IGZ1bmN0aW9uIChtZXRob2QsIGNoZWNrLCBtc2cpIHtcblx0aWYgKG1ldGhvZCBpbnN0YW5jZW9mIEFycmF5KSB7XG5cdCAgICBmb3IgKHZhciBpPTA7IGk8bWV0aG9kLmxlbmd0aDsgaSsrKSB7XG5cdFx0YXBpLmNoZWNrKG1ldGhvZFtpXSwgY2hlY2ssIG1zZyk7XG5cdCAgICB9XG5cdCAgICByZXR1cm47XG5cdH1cblxuXHRpZiAodHlwZW9mIChtZXRob2QpID09PSAnZnVuY3Rpb24nKSB7XG5cdCAgICBtZXRob2QuY2hlY2soY2hlY2ssIG1zZyk7XG5cdH0gZWxzZSB7XG5cdCAgICB3aG9bbWV0aG9kXS5jaGVjayhjaGVjaywgbXNnKTtcblx0fVxuXHRyZXR1cm4gYXBpO1xuICAgIH07XG5cbiAgICBhcGkudHJhbnNmb3JtID0gZnVuY3Rpb24gKG1ldGhvZCwgY2Jhaykge1xuXHRpZiAobWV0aG9kIGluc3RhbmNlb2YgQXJyYXkpIHtcblx0ICAgIGZvciAodmFyIGk9MDsgaTxtZXRob2QubGVuZ3RoOyBpKyspIHtcblx0XHRhcGkudHJhbnNmb3JtIChtZXRob2RbaV0sIGNiYWspO1xuXHQgICAgfVxuXHQgICAgcmV0dXJuO1xuXHR9XG5cblx0aWYgKHR5cGVvZiAobWV0aG9kKSA9PT0gJ2Z1bmN0aW9uJykge1xuXHQgICAgbWV0aG9kLnRyYW5zZm9ybSAoY2Jhayk7XG5cdH0gZWxzZSB7XG5cdCAgICB3aG9bbWV0aG9kXS50cmFuc2Zvcm0oY2Jhayk7XG5cdH1cblx0cmV0dXJuIGFwaTtcbiAgICB9O1xuXG4gICAgdmFyIGF0dGFjaF9tZXRob2QgPSBmdW5jdGlvbiAobWV0aG9kLCBvcHRzKSB7XG5cdHZhciBjaGVja3MgPSBbXTtcblx0dmFyIHRyYW5zZm9ybXMgPSBbXTtcblxuXHR2YXIgZ2V0dGVyID0gb3B0cy5vbl9nZXR0ZXIgfHwgZnVuY3Rpb24gKCkge1xuXHQgICAgcmV0dXJuIG1ldGhvZHMuZ2V0KG1ldGhvZCk7XG5cdH07XG5cblx0dmFyIHNldHRlciA9IG9wdHMub25fc2V0dGVyIHx8IGZ1bmN0aW9uICh4KSB7XG5cdCAgICBmb3IgKHZhciBpPTA7IGk8dHJhbnNmb3Jtcy5sZW5ndGg7IGkrKykge1xuXHRcdHggPSB0cmFuc2Zvcm1zW2ldKHgpO1xuXHQgICAgfVxuXG5cdCAgICBmb3IgKHZhciBqPTA7IGo8Y2hlY2tzLmxlbmd0aDsgaisrKSB7XG5cdFx0aWYgKCFjaGVja3Nbal0uY2hlY2soeCkpIHtcblx0XHQgICAgdmFyIG1zZyA9IGNoZWNrc1tqXS5tc2cgfHwgXG5cdFx0XHQoXCJWYWx1ZSBcIiArIHggKyBcIiBkb2Vzbid0IHNlZW0gdG8gYmUgdmFsaWQgZm9yIHRoaXMgbWV0aG9kXCIpO1xuXHRcdCAgICB0aHJvdyAobXNnKTtcblx0XHR9XG5cdCAgICB9XG5cdCAgICBtZXRob2RzLmFkZChtZXRob2QsIHgpO1xuXHR9O1xuXG5cdHZhciBuZXdfbWV0aG9kID0gZnVuY3Rpb24gKG5ld192YWwpIHtcblx0ICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuXHRcdHJldHVybiBnZXR0ZXIoKTtcblx0ICAgIH1cblx0ICAgIHNldHRlcihuZXdfdmFsKTtcblx0ICAgIHJldHVybiB3aG87IC8vIFJldHVybiB0aGlzP1xuXHR9O1xuXHRuZXdfbWV0aG9kLmNoZWNrID0gZnVuY3Rpb24gKGNiYWssIG1zZykge1xuXHQgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0cmV0dXJuIGNoZWNrcztcblx0ICAgIH1cblx0ICAgIGNoZWNrcy5wdXNoICh7Y2hlY2sgOiBjYmFrLFxuXHRcdFx0ICBtc2cgICA6IG1zZ30pO1xuXHQgICAgcmV0dXJuIHRoaXM7XG5cdH07XG5cdG5ld19tZXRob2QudHJhbnNmb3JtID0gZnVuY3Rpb24gKGNiYWspIHtcblx0ICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuXHRcdHJldHVybiB0cmFuc2Zvcm1zO1xuXHQgICAgfVxuXHQgICAgdHJhbnNmb3Jtcy5wdXNoKGNiYWspO1xuXHQgICAgcmV0dXJuIHRoaXM7XG5cdH07XG5cblx0d2hvW21ldGhvZF0gPSBuZXdfbWV0aG9kO1xuICAgIH07XG5cbiAgICB2YXIgZ2V0c2V0ID0gZnVuY3Rpb24gKHBhcmFtLCBvcHRzKSB7XG5cdGlmICh0eXBlb2YgKHBhcmFtKSA9PT0gJ29iamVjdCcpIHtcblx0ICAgIG1ldGhvZHMuYWRkX2JhdGNoIChwYXJhbSk7XG5cdCAgICBmb3IgKHZhciBwIGluIHBhcmFtKSB7XG5cdFx0YXR0YWNoX21ldGhvZCAocCwgb3B0cyk7XG5cdCAgICB9XG5cdH0gZWxzZSB7XG5cdCAgICBtZXRob2RzLmFkZCAocGFyYW0sIG9wdHMuZGVmYXVsdF92YWx1ZSk7XG5cdCAgICBhdHRhY2hfbWV0aG9kIChwYXJhbSwgb3B0cyk7XG5cdH1cbiAgICB9O1xuXG4gICAgYXBpLmdldHNldCA9IGZ1bmN0aW9uIChwYXJhbSwgZGVmKSB7XG5cdGdldHNldChwYXJhbSwge2RlZmF1bHRfdmFsdWUgOiBkZWZ9KTtcblxuXHRyZXR1cm4gYXBpO1xuICAgIH07XG5cbiAgICBhcGkuZ2V0ID0gZnVuY3Rpb24gKHBhcmFtLCBkZWYpIHtcblx0dmFyIG9uX3NldHRlciA9IGZ1bmN0aW9uICgpIHtcblx0ICAgIHRocm93IChcIk1ldGhvZCBkZWZpbmVkIG9ubHkgYXMgYSBnZXR0ZXIgKHlvdSBhcmUgdHJ5aW5nIHRvIHVzZSBpdCBhcyBhIHNldHRlclwiKTtcblx0fTtcblxuXHRnZXRzZXQocGFyYW0sIHtkZWZhdWx0X3ZhbHVlIDogZGVmLFxuXHRcdCAgICAgICBvbl9zZXR0ZXIgOiBvbl9zZXR0ZXJ9XG5cdCAgICAgICk7XG5cblx0cmV0dXJuIGFwaTtcbiAgICB9O1xuXG4gICAgYXBpLnNldCA9IGZ1bmN0aW9uIChwYXJhbSwgZGVmKSB7XG5cdHZhciBvbl9nZXR0ZXIgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICB0aHJvdyAoXCJNZXRob2QgZGVmaW5lZCBvbmx5IGFzIGEgc2V0dGVyICh5b3UgYXJlIHRyeWluZyB0byB1c2UgaXQgYXMgYSBnZXR0ZXJcIik7XG5cdH07XG5cblx0Z2V0c2V0KHBhcmFtLCB7ZGVmYXVsdF92YWx1ZSA6IGRlZixcblx0XHQgICAgICAgb25fZ2V0dGVyIDogb25fZ2V0dGVyfVxuXHQgICAgICApO1xuXG5cdHJldHVybiBhcGk7XG4gICAgfTtcblxuICAgIGFwaS5tZXRob2QgPSBmdW5jdGlvbiAobmFtZSwgY2Jhaykge1xuXHRpZiAodHlwZW9mIChuYW1lKSA9PT0gJ29iamVjdCcpIHtcblx0ICAgIGZvciAodmFyIHAgaW4gbmFtZSkge1xuXHRcdHdob1twXSA9IG5hbWVbcF07XG5cdCAgICB9XG5cdH0gZWxzZSB7XG5cdCAgICB3aG9bbmFtZV0gPSBjYmFrO1xuXHR9XG5cdHJldHVybiBhcGk7XG4gICAgfTtcblxuICAgIHJldHVybiBhcGk7XG4gICAgXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBhcGk7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9zcmMvaW5kZXguanNcIik7XG4iLCIvLyByZXF1aXJlKCdmcycpLnJlYWRkaXJTeW5jKF9fZGlybmFtZSArICcvJykuZm9yRWFjaChmdW5jdGlvbihmaWxlKSB7XG4vLyAgICAgaWYgKGZpbGUubWF0Y2goLy4rXFwuanMvZykgIT09IG51bGwgJiYgZmlsZSAhPT0gX19maWxlbmFtZSkge1xuLy8gXHR2YXIgbmFtZSA9IGZpbGUucmVwbGFjZSgnLmpzJywgJycpO1xuLy8gXHRtb2R1bGUuZXhwb3J0c1tuYW1lXSA9IHJlcXVpcmUoJy4vJyArIGZpbGUpO1xuLy8gICAgIH1cbi8vIH0pO1xuXG4vLyBTYW1lIGFzXG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi91dGlscy5qc1wiKTtcbnV0aWxzLnJlZHVjZSA9IHJlcXVpcmUoXCIuL3JlZHVjZS5qc1wiKTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IHV0aWxzO1xuIiwidmFyIHJlZHVjZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc21vb3RoID0gNTtcbiAgICB2YXIgdmFsdWUgPSAndmFsJztcbiAgICB2YXIgcmVkdW5kYW50ID0gZnVuY3Rpb24gKGEsIGIpIHtcblx0aWYgKGEgPCBiKSB7XG5cdCAgICByZXR1cm4gKChiLWEpIDw9IChiICogMC4yKSk7XG5cdH1cblx0cmV0dXJuICgoYS1iKSA8PSAoYSAqIDAuMikpO1xuICAgIH07XG4gICAgdmFyIHBlcmZvcm1fcmVkdWNlID0gZnVuY3Rpb24gKGFycikge3JldHVybiBhcnI7fTtcblxuICAgIHZhciByZWR1Y2UgPSBmdW5jdGlvbiAoYXJyKSB7XG5cdGlmICghYXJyLmxlbmd0aCkge1xuXHQgICAgcmV0dXJuIGFycjtcblx0fVxuXHR2YXIgc21vb3RoZWQgPSBwZXJmb3JtX3Ntb290aChhcnIpO1xuXHR2YXIgcmVkdWNlZCAgPSBwZXJmb3JtX3JlZHVjZShzbW9vdGhlZCk7XG5cdHJldHVybiByZWR1Y2VkO1xuICAgIH07XG5cbiAgICB2YXIgbWVkaWFuID0gZnVuY3Rpb24gKHYsIGFycikge1xuXHRhcnIuc29ydChmdW5jdGlvbiAoYSwgYikge1xuXHQgICAgcmV0dXJuIGFbdmFsdWVdIC0gYlt2YWx1ZV07XG5cdH0pO1xuXHRpZiAoYXJyLmxlbmd0aCAlIDIpIHtcblx0ICAgIHZbdmFsdWVdID0gYXJyW35+KGFyci5sZW5ndGggLyAyKV1bdmFsdWVdO1x0ICAgIFxuXHR9IGVsc2Uge1xuXHQgICAgdmFyIG4gPSB+fihhcnIubGVuZ3RoIC8gMikgLSAxO1xuXHQgICAgdlt2YWx1ZV0gPSAoYXJyW25dW3ZhbHVlXSArIGFycltuKzFdW3ZhbHVlXSkgLyAyO1xuXHR9XG5cblx0cmV0dXJuIHY7XG4gICAgfTtcblxuICAgIHZhciBjbG9uZSA9IGZ1bmN0aW9uIChzb3VyY2UpIHtcblx0dmFyIHRhcmdldCA9IHt9O1xuXHRmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuXHQgICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuXHRcdHRhcmdldFtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcblx0ICAgIH1cblx0fVxuXHRyZXR1cm4gdGFyZ2V0O1xuICAgIH07XG5cbiAgICB2YXIgcGVyZm9ybV9zbW9vdGggPSBmdW5jdGlvbiAoYXJyKSB7XG5cdGlmIChzbW9vdGggPT09IDApIHsgLy8gbm8gc21vb3RoXG5cdCAgICByZXR1cm4gYXJyO1xuXHR9XG5cdHZhciBzbW9vdGhfYXJyID0gW107XG5cdGZvciAodmFyIGk9MDsgaTxhcnIubGVuZ3RoOyBpKyspIHtcblx0ICAgIHZhciBsb3cgPSAoaSA8IHNtb290aCkgPyAwIDogKGkgLSBzbW9vdGgpO1xuXHQgICAgdmFyIGhpZ2ggPSAoaSA+IChhcnIubGVuZ3RoIC0gc21vb3RoKSkgPyBhcnIubGVuZ3RoIDogKGkgKyBzbW9vdGgpO1xuXHQgICAgc21vb3RoX2FycltpXSA9IG1lZGlhbihjbG9uZShhcnJbaV0pLCBhcnIuc2xpY2UobG93LGhpZ2grMSkpO1xuXHR9XG5cdHJldHVybiBzbW9vdGhfYXJyO1xuICAgIH07XG5cbiAgICByZWR1Y2UucmVkdWNlciA9IGZ1bmN0aW9uIChjYmFrKSB7XG5cdGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuXHQgICAgcmV0dXJuIHBlcmZvcm1fcmVkdWNlO1xuXHR9XG5cdHBlcmZvcm1fcmVkdWNlID0gY2Jhaztcblx0cmV0dXJuIHJlZHVjZTtcbiAgICB9O1xuXG4gICAgcmVkdWNlLnJlZHVuZGFudCA9IGZ1bmN0aW9uIChjYmFrKSB7XG5cdGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuXHQgICAgcmV0dXJuIHJlZHVuZGFudDtcblx0fVxuXHRyZWR1bmRhbnQgPSBjYmFrO1xuXHRyZXR1cm4gcmVkdWNlO1xuICAgIH07XG5cbiAgICByZWR1Y2UudmFsdWUgPSBmdW5jdGlvbiAodmFsKSB7XG5cdGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuXHQgICAgcmV0dXJuIHZhbHVlO1xuXHR9XG5cdHZhbHVlID0gdmFsO1xuXHRyZXR1cm4gcmVkdWNlO1xuICAgIH07XG5cbiAgICByZWR1Y2Uuc21vb3RoID0gZnVuY3Rpb24gKHZhbCkge1xuXHRpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcblx0ICAgIHJldHVybiBzbW9vdGg7XG5cdH1cblx0c21vb3RoID0gdmFsO1xuXHRyZXR1cm4gcmVkdWNlO1xuICAgIH07XG5cbiAgICByZXR1cm4gcmVkdWNlO1xufTtcblxudmFyIGJsb2NrID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZWQgPSByZWR1Y2UoKVxuXHQudmFsdWUoJ3N0YXJ0Jyk7XG5cbiAgICB2YXIgdmFsdWUyID0gJ2VuZCc7XG5cbiAgICB2YXIgam9pbiA9IGZ1bmN0aW9uIChvYmoxLCBvYmoyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAnb2JqZWN0JyA6IHtcbiAgICAgICAgICAgICAgICAnc3RhcnQnIDogb2JqMS5vYmplY3RbcmVkLnZhbHVlKCldLFxuICAgICAgICAgICAgICAgICdlbmQnICAgOiBvYmoyW3ZhbHVlMl1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAndmFsdWUnICA6IG9iajJbdmFsdWUyXVxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICAvLyB2YXIgam9pbiA9IGZ1bmN0aW9uIChvYmoxLCBvYmoyKSB7IHJldHVybiBvYmoxIH07XG5cbiAgICByZWQucmVkdWNlciggZnVuY3Rpb24gKGFycikge1xuXHR2YXIgdmFsdWUgPSByZWQudmFsdWUoKTtcblx0dmFyIHJlZHVuZGFudCA9IHJlZC5yZWR1bmRhbnQoKTtcblx0dmFyIHJlZHVjZWRfYXJyID0gW107XG5cdHZhciBjdXJyID0ge1xuXHQgICAgJ29iamVjdCcgOiBhcnJbMF0sXG5cdCAgICAndmFsdWUnICA6IGFyclswXVt2YWx1ZTJdXG5cdH07XG5cdGZvciAodmFyIGk9MTsgaTxhcnIubGVuZ3RoOyBpKyspIHtcblx0ICAgIGlmIChyZWR1bmRhbnQgKGFycltpXVt2YWx1ZV0sIGN1cnIudmFsdWUpKSB7XG5cdFx0Y3VyciA9IGpvaW4oY3VyciwgYXJyW2ldKTtcblx0XHRjb250aW51ZTtcblx0ICAgIH1cblx0ICAgIHJlZHVjZWRfYXJyLnB1c2ggKGN1cnIub2JqZWN0KTtcblx0ICAgIGN1cnIub2JqZWN0ID0gYXJyW2ldO1xuXHQgICAgY3Vyci52YWx1ZSA9IGFycltpXS5lbmQ7XG5cdH1cblx0cmVkdWNlZF9hcnIucHVzaChjdXJyLm9iamVjdCk7XG5cblx0Ly8gcmVkdWNlZF9hcnIucHVzaChhcnJbYXJyLmxlbmd0aC0xXSk7XG5cdHJldHVybiByZWR1Y2VkX2FycjtcbiAgICB9KTtcblxuICAgIHJlZHVjZS5qb2luID0gZnVuY3Rpb24gKGNiYWspIHtcblx0aWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG5cdCAgICByZXR1cm4gam9pbjtcblx0fVxuXHRqb2luID0gY2Jhaztcblx0cmV0dXJuIHJlZDtcbiAgICB9O1xuXG4gICAgcmVkdWNlLnZhbHVlMiA9IGZ1bmN0aW9uIChmaWVsZCkge1xuXHRpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcblx0ICAgIHJldHVybiB2YWx1ZTI7XG5cdH1cblx0dmFsdWUyID0gZmllbGQ7XG5cdHJldHVybiByZWQ7XG4gICAgfTtcblxuICAgIHJldHVybiByZWQ7XG59O1xuXG52YXIgbGluZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVkID0gcmVkdWNlKCk7XG5cbiAgICByZWQucmVkdWNlciAoIGZ1bmN0aW9uIChhcnIpIHtcblx0dmFyIHJlZHVuZGFudCA9IHJlZC5yZWR1bmRhbnQoKTtcblx0dmFyIHZhbHVlID0gcmVkLnZhbHVlKCk7XG5cdHZhciByZWR1Y2VkX2FyciA9IFtdO1xuXHR2YXIgY3VyciA9IGFyclswXTtcblx0Zm9yICh2YXIgaT0xOyBpPGFyci5sZW5ndGgtMTsgaSsrKSB7XG5cdCAgICBpZiAocmVkdW5kYW50IChhcnJbaV1bdmFsdWVdLCBjdXJyW3ZhbHVlXSkpIHtcblx0XHRjb250aW51ZTtcblx0ICAgIH1cblx0ICAgIHJlZHVjZWRfYXJyLnB1c2ggKGN1cnIpO1xuXHQgICAgY3VyciA9IGFycltpXTtcblx0fVxuXHRyZWR1Y2VkX2Fyci5wdXNoKGN1cnIpO1xuXHRyZWR1Y2VkX2Fyci5wdXNoKGFyclthcnIubGVuZ3RoLTFdKTtcblx0cmV0dXJuIHJlZHVjZWRfYXJyO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlZDtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSByZWR1Y2U7XG5tb2R1bGUuZXhwb3J0cy5saW5lID0gbGluZTtcbm1vZHVsZS5leHBvcnRzLmJsb2NrID0gYmxvY2s7XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaXRlcmF0b3IgOiBmdW5jdGlvbihpbml0X3ZhbCkge1xuXHR2YXIgaSA9IGluaXRfdmFsIHx8IDA7XG5cdHZhciBpdGVyID0gZnVuY3Rpb24gKCkge1xuXHQgICAgcmV0dXJuIGkrKztcblx0fTtcblx0cmV0dXJuIGl0ZXI7XG4gICAgfSxcblxuICAgIHNjcmlwdF9wYXRoIDogZnVuY3Rpb24gKHNjcmlwdF9uYW1lKSB7IC8vIHNjcmlwdF9uYW1lIGlzIHRoZSBmaWxlbmFtZVxuXHR2YXIgc2NyaXB0X3NjYXBlZCA9IHNjcmlwdF9uYW1lLnJlcGxhY2UoL1stXFwvXFxcXF4kKis/LigpfFtcXF17fV0vZywgJ1xcXFwkJicpO1xuXHR2YXIgc2NyaXB0X3JlID0gbmV3IFJlZ0V4cChzY3JpcHRfc2NhcGVkICsgJyQnKTtcblx0dmFyIHNjcmlwdF9yZV9zdWIgPSBuZXcgUmVnRXhwKCcoLiopJyArIHNjcmlwdF9zY2FwZWQgKyAnJCcpO1xuXG5cdC8vIFRPRE86IFRoaXMgcmVxdWlyZXMgcGhhbnRvbS5qcyBvciBhIHNpbWlsYXIgaGVhZGxlc3Mgd2Via2l0IHRvIHdvcmsgKGRvY3VtZW50KVxuXHR2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKTtcblx0dmFyIHBhdGggPSBcIlwiOyAgLy8gRGVmYXVsdCB0byBjdXJyZW50IHBhdGhcblx0aWYoc2NyaXB0cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gc2NyaXB0cykge1xuXHRcdGlmKHNjcmlwdHNbaV0uc3JjICYmIHNjcmlwdHNbaV0uc3JjLm1hdGNoKHNjcmlwdF9yZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjcmlwdHNbaV0uc3JjLnJlcGxhY2Uoc2NyaXB0X3JlX3N1YiwgJyQxJyk7XG5cdFx0fVxuICAgICAgICAgICAgfVxuXHR9XG5cdHJldHVybiBwYXRoO1xuICAgIH0sXG5cbiAgICBkZWZlcl9jYW5jZWwgOiBmdW5jdGlvbiAoY2JhaywgdGltZSkge1xuXHR2YXIgdGljaztcblxuXHR2YXIgZGVmZXJfY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuXHQgICAgY2xlYXJUaW1lb3V0KHRpY2spO1xuXHQgICAgdGljayA9IHNldFRpbWVvdXQoY2JhaywgdGltZSk7XG5cdH07XG5cblx0cmV0dXJuIGRlZmVyX2NhbmNlbDtcbiAgICB9XG59O1xuIiwidmFyIGFwaWpzID0gcmVxdWlyZSAoXCJ0bnQuYXBpXCIpO1xudmFyIGRlZmVyQ2FuY2VsID0gcmVxdWlyZSAoXCJ0bnQudXRpbHNcIikuZGVmZXJfY2FuY2VsO1xuXG52YXIgYm9hcmQgPSBmdW5jdGlvbigpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBcbiAgICAvLy8vIFByaXZhdGUgdmFyc1xuICAgIHZhciBzdmc7XG4gICAgdmFyIGRpdl9pZDtcbiAgICB2YXIgdHJhY2tzID0gW107XG4gICAgdmFyIG1pbl93aWR0aCA9IDUwO1xuICAgIHZhciBoZWlnaHQgICAgPSAwOyAgICAvLyBUaGlzIGlzIHRoZSBnbG9iYWwgaGVpZ2h0IGluY2x1ZGluZyBhbGwgdGhlIHRyYWNrc1xuICAgIHZhciB3aWR0aCAgICAgPSA5MjA7XG4gICAgdmFyIGhlaWdodF9vZmZzZXQgPSAyMDtcbiAgICB2YXIgbG9jID0ge1xuXHRzcGVjaWVzICA6IHVuZGVmaW5lZCxcblx0Y2hyICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgIGZyb20gICAgIDogMCxcbiAgICAgICAgdG8gICAgICAgOiA1MDBcbiAgICB9O1xuXG4gICAgLy8gVE9ETzogV2UgaGF2ZSBub3cgYmFja2dyb3VuZCBjb2xvciBpbiB0aGUgdHJhY2tzLiBDYW4gdGhpcyBiZSByZW1vdmVkP1xuICAgIC8vIEl0IGxvb2tzIGxpa2UgaXQgaXMgdXNlZCBpbiB0aGUgdG9vLXdpZGUgcGFuZSBldGMsIGJ1dCBpdCBtYXkgbm90IGJlIG5lZWRlZCBhbnltb3JlXG4gICAgdmFyIGJnQ29sb3IgICA9IGQzLnJnYignI0Y4RkJFRicpOyAvLyNGOEZCRUZcbiAgICB2YXIgcGFuZTsgLy8gRHJhZ2dhYmxlIHBhbmVcbiAgICB2YXIgc3ZnX2c7XG4gICAgdmFyIHhTY2FsZTtcbiAgICB2YXIgem9vbUV2ZW50SGFuZGxlciA9IGQzLmJlaGF2aW9yLnpvb20oKTtcbiAgICB2YXIgbGltaXRzID0ge1xuXHRsZWZ0IDogMCxcblx0cmlnaHQgOiAxMDAwLFxuXHR6b29tX291dCA6IDEwMDAsXG5cdHpvb21faW4gIDogMTAwXG4gICAgfTtcbiAgICB2YXIgY2FwX3dpZHRoID0gMztcbiAgICB2YXIgZHVyID0gNTAwO1xuICAgIHZhciBkcmFnX2FsbG93ZWQgPSB0cnVlO1xuXG4gICAgdmFyIGV4cG9ydHMgPSB7XG5cdGVhc2UgICAgICAgICAgOiBkMy5lYXNlKFwiY3ViaWMtaW4tb3V0XCIpLFxuXHRleHRlbmRfY2FudmFzIDoge1xuXHQgICAgbGVmdCA6IDAsXG5cdCAgICByaWdodCA6IDBcblx0fSxcblx0c2hvd19mcmFtZSA6IHRydWVcblx0Ly8gbGltaXRzICAgICAgICA6IGZ1bmN0aW9uICgpIHt0aHJvdyBcIlRoZSBsaW1pdHMgbWV0aG9kIHNob3VsZCBiZSBkZWZpbmVkXCJ9XHRcbiAgICB9O1xuXG4gICAgLy8gVGhlIHJldHVybmVkIGNsb3N1cmUgLyBvYmplY3RcbiAgICB2YXIgdHJhY2tfdmlzID0gZnVuY3Rpb24oZGl2KSB7XG5cdGRpdl9pZCA9IGQzLnNlbGVjdChkaXYpLmF0dHIoXCJpZFwiKTtcblxuXHQvLyBUaGUgb3JpZ2luYWwgZGl2IGlzIGNsYXNzZWQgd2l0aCB0aGUgdG50IGNsYXNzXG5cdGQzLnNlbGVjdChkaXYpXG5cdCAgICAuY2xhc3NlZChcInRudFwiLCB0cnVlKTtcblxuXHQvLyBUT0RPOiBNb3ZlIHRoZSBzdHlsaW5nIHRvIHRoZSBzY3NzP1xuXHR2YXIgYnJvd3NlckRpdiA9IGQzLnNlbGVjdChkaXYpXG5cdCAgICAuYXBwZW5kKFwiZGl2XCIpXG5cdCAgICAuYXR0cihcImlkXCIsIFwidG50X1wiICsgZGl2X2lkKVxuXHQgICAgLnN0eWxlKFwicG9zaXRpb25cIiwgXCJyZWxhdGl2ZVwiKVxuXHQgICAgLmNsYXNzZWQoXCJ0bnRfZnJhbWVkXCIsIGV4cG9ydHMuc2hvd19mcmFtZSA/IHRydWUgOiBmYWxzZSlcblx0ICAgIC5zdHlsZShcIndpZHRoXCIsICh3aWR0aCArIGNhcF93aWR0aCoyICsgZXhwb3J0cy5leHRlbmRfY2FudmFzLnJpZ2h0ICsgZXhwb3J0cy5leHRlbmRfY2FudmFzLmxlZnQpICsgXCJweFwiKVxuXG5cdHZhciBncm91cERpdiA9IGJyb3dzZXJEaXZcblx0ICAgIC5hcHBlbmQoXCJkaXZcIilcblx0ICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0bnRfZ3JvdXBEaXZcIik7XG5cblx0Ly8gVGhlIFNWR1xuXHRzdmcgPSBncm91cERpdlxuXHQgICAgLmFwcGVuZChcInN2Z1wiKVxuXHQgICAgLmF0dHIoXCJjbGFzc1wiLCBcInRudF9zdmdcIilcblx0ICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXG5cdCAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpXG5cdCAgICAuYXR0cihcInBvaW50ZXItZXZlbnRzXCIsIFwiYWxsXCIpO1xuXG5cdHN2Z19nID0gc3ZnXG5cdCAgICAuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCwyMClcIilcbiAgICAgICAgICAgIC5hcHBlbmQoXCJnXCIpXG5cdCAgICAuYXR0cihcImNsYXNzXCIsIFwidG50X2dcIik7XG5cblx0Ly8gY2Fwc1xuXHRzdmdfZ1xuXHQgICAgLmFwcGVuZChcInJlY3RcIilcblx0ICAgIC5hdHRyKFwiaWRcIiwgXCJ0bnRfXCIgKyBkaXZfaWQgKyBcIl81cGNhcFwiKVxuXHQgICAgLmF0dHIoXCJ4XCIsIDApXG5cdCAgICAuYXR0cihcInlcIiwgMClcblx0ICAgIC5hdHRyKFwid2lkdGhcIiwgMClcblx0ICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodClcblx0ICAgIC5hdHRyKFwiZmlsbFwiLCBcInJlZFwiKTtcblx0c3ZnX2dcblx0ICAgIC5hcHBlbmQoXCJyZWN0XCIpXG5cdCAgICAuYXR0cihcImlkXCIsIFwidG50X1wiICsgZGl2X2lkICsgXCJfM3BjYXBcIilcblx0ICAgIC5hdHRyKFwieFwiLCB3aWR0aC1jYXBfd2lkdGgpXG5cdCAgICAuYXR0cihcInlcIiwgMClcblx0ICAgIC5hdHRyKFwid2lkdGhcIiwgMClcblx0ICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodClcblx0ICAgIC5hdHRyKFwiZmlsbFwiLCBcInJlZFwiKTtcblxuXHQvLyBUaGUgWm9vbWluZy9QYW5uaW5nIFBhbmVcblx0cGFuZSA9IHN2Z19nXG5cdCAgICAuYXBwZW5kKFwicmVjdFwiKVxuXHQgICAgLmF0dHIoXCJjbGFzc1wiLCBcInRudF9wYW5lXCIpXG5cdCAgICAuYXR0cihcImlkXCIsIFwidG50X1wiICsgZGl2X2lkICsgXCJfcGFuZVwiKVxuXHQgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aClcblx0ICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodClcblx0ICAgIC5zdHlsZShcImZpbGxcIiwgYmdDb2xvcik7XG5cblx0Ly8gKiogVE9ETzogV291bGRuJ3QgYmUgYmV0dGVyIHRvIGhhdmUgdGhlc2UgbWVzc2FnZXMgYnkgdHJhY2s/XG5cdC8vIHZhciB0b29XaWRlX3RleHQgPSBzdmdfZ1xuXHQvLyAgICAgLmFwcGVuZChcInRleHRcIilcblx0Ly8gICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0bnRfd2lkZU9LX3RleHRcIilcblx0Ly8gICAgIC5hdHRyKFwiaWRcIiwgXCJ0bnRfXCIgKyBkaXZfaWQgKyBcIl90b29XaWRlXCIpXG5cdC8vICAgICAuYXR0cihcImZpbGxcIiwgYmdDb2xvcilcblx0Ly8gICAgIC50ZXh0KFwiUmVnaW9uIHRvbyB3aWRlXCIpO1xuXG5cdC8vIFRPRE86IEkgZG9uJ3Qga25vdyBpZiB0aGlzIGlzIHRoZSBiZXN0IHdheSAoYW5kIHBvcnRhYmxlKSB3YXlcblx0Ly8gb2YgY2VudGVyaW5nIHRoZSB0ZXh0IGluIHRoZSB0ZXh0IGFyZWFcblx0Ly8gdmFyIGJiID0gdG9vV2lkZV90ZXh0WzBdWzBdLmdldEJCb3goKTtcblx0Ly8gdG9vV2lkZV90ZXh0XG5cdC8vICAgICAuYXR0cihcInhcIiwgfn4od2lkdGgvMiAtIGJiLndpZHRoLzIpKVxuXHQvLyAgICAgLmF0dHIoXCJ5XCIsIH5+KGhlaWdodC8yIC0gYmIuaGVpZ2h0LzIpKTtcbiAgICB9O1xuXG4gICAgLy8gQVBJXG4gICAgdmFyIGFwaSA9IGFwaWpzICh0cmFja192aXMpXG5cdC5nZXRzZXQgKGV4cG9ydHMpXG5cdC5nZXRzZXQgKGxpbWl0cylcblx0LmdldHNldCAobG9jKTtcblxuICAgIGFwaS50cmFuc2Zvcm0gKHRyYWNrX3Zpcy5leHRlbmRfY2FudmFzLCBmdW5jdGlvbiAodmFsKSB7XG5cdHZhciBwcmV2X3ZhbCA9IHRyYWNrX3Zpcy5leHRlbmRfY2FudmFzKCk7XG5cdHZhbC5sZWZ0ID0gdmFsLmxlZnQgfHwgcHJldl92YWwubGVmdDtcblx0dmFsLnJpZ2h0ID0gdmFsLnJpZ2h0IHx8IHByZXZfdmFsLnJpZ2h0O1xuXHRyZXR1cm4gdmFsO1xuICAgIH0pO1xuXG4gICAgLy8gdHJhY2tfdmlzIGFsd2F5cyBzdGFydHMgb24gbG9jLmZyb20gJiBsb2MudG9cbiAgICBhcGkubWV0aG9kICgnc3RhcnQnLCBmdW5jdGlvbiAoKSB7XG5cblx0Ly8gUmVzZXQgdGhlIHRyYWNrc1xuXHRmb3IgKHZhciBpPTA7IGk8dHJhY2tzLmxlbmd0aDsgaSsrKSB7XG5cdCAgICBpZiAodHJhY2tzW2ldLmcpIHtcblx0XHR0cmFja3NbaV0uZGlzcGxheSgpLnJlc2V0LmNhbGwodHJhY2tzW2ldKTtcblx0ICAgIH1cblx0ICAgIF9pbml0X3RyYWNrKHRyYWNrc1tpXSk7XG5cdH1cblxuXHRfcGxhY2VfdHJhY2tzKCk7XG5cblx0Ly8gVGhlIGNvbnRpbnVhdGlvbiBjYWxsYmFja1xuXHR2YXIgY29udCA9IGZ1bmN0aW9uIChyZXNwKSB7XG5cdCAgICBsaW1pdHMucmlnaHQgPSByZXNwO1xuXG5cdCAgICAvLyB6b29tRXZlbnRIYW5kbGVyLnhFeHRlbnQoW2xpbWl0cy5sZWZ0LCBsaW1pdHMucmlnaHRdKTtcblx0ICAgIGlmICgobG9jLnRvIC0gbG9jLmZyb20pIDwgbGltaXRzLnpvb21faW4pIHtcblx0XHRpZiAoKGxvYy5mcm9tICsgbGltaXRzLnpvb21faW4pID4gbGltaXRzLnpvb21faW4pIHtcblx0XHQgICAgbG9jLnRvID0gbGltaXRzLnJpZ2h0O1xuXHRcdH0gZWxzZSB7XG5cdFx0ICAgIGxvYy50byA9IGxvYy5mcm9tICsgbGltaXRzLnpvb21faW47XG5cdFx0fVxuXHQgICAgfVxuXHQgICAgcGxvdCgpO1xuXG5cdCAgICBmb3IgKHZhciBpPTA7IGk8dHJhY2tzLmxlbmd0aDsgaSsrKSB7XG5cdFx0X3VwZGF0ZV90cmFjayh0cmFja3NbaV0sIGxvYyk7XG5cdCAgICB9XG5cdH07XG5cblx0Ly8gSWYgbGltaXRzLnJpZ2h0IGlzIGEgZnVuY3Rpb24sIHdlIGhhdmUgdG8gY2FsbCBpdCBhc3luY2hyb25vdXNseSBhbmRcblx0Ly8gdGhlbiBzdGFydGluZyB0aGUgcGxvdCBvbmNlIHdlIGhhdmUgc2V0IHRoZSByaWdodCBsaW1pdCAocGxvdClcblx0Ly8gSWYgbm90LCB3ZSBhc3N1bWUgdGhhdCBpdCBpcyBhbiBvYmpldCB3aXRoIG5ldyAobWF5YmUgcGFydGlhbGx5IGRlZmluZWQpXG5cdC8vIGRlZmluaXRpb25zIG9mIHRoZSBsaW1pdHMgYW5kIHdlIGNhbiBwbG90IGRpcmVjdGx5XG5cdC8vIFRPRE86IFJpZ2h0IG5vdywgb25seSByaWdodCBjYW4gYmUgY2FsbGVkIGFzIGFuIGFzeW5jIGZ1bmN0aW9uIHdoaWNoIGlzIHdlYWtcblx0aWYgKHR5cGVvZiAobGltaXRzLnJpZ2h0KSA9PT0gJ2Z1bmN0aW9uJykge1xuXHQgICAgbGltaXRzLnJpZ2h0KGNvbnQpO1xuXHR9IGVsc2Uge1xuXHQgICAgY29udChsaW1pdHMucmlnaHQpO1xuXHR9XG5cbiAgICB9KTtcblxuICAgIGFwaS5tZXRob2QgKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XG5cdGZvciAodmFyIGk9MDsgaTx0cmFja3MubGVuZ3RoOyBpKyspIHtcblx0ICAgIF91cGRhdGVfdHJhY2sgKHRyYWNrc1tpXSk7XG5cdH1cblxuICAgIH0pO1xuXG4gICAgdmFyIF91cGRhdGVfdHJhY2sgPSBmdW5jdGlvbiAodHJhY2ssIHdoZXJlKSB7XG5cdGlmICh0cmFjay5kYXRhKCkpIHtcblx0ICAgIHZhciB0cmFja19kYXRhID0gdHJhY2suZGF0YSgpO1xuXHQgICAgdmFyIGRhdGFfdXBkYXRlciA9IHRyYWNrX2RhdGEudXBkYXRlKCk7XG5cdCAgICAvL3ZhciBkYXRhX3VwZGF0ZXIgPSB0cmFjay5kYXRhKCkudXBkYXRlKCk7XG5cdCAgICBkYXRhX3VwZGF0ZXIuY2FsbCh0cmFja19kYXRhLCB7XG5cdFx0J2xvYycgOiB3aGVyZSxcblx0XHQnb25fc3VjY2VzcycgOiBmdW5jdGlvbiAoKSB7XG5cdFx0ICAgIHRyYWNrLmRpc3BsYXkoKS51cGRhdGUuY2FsbCh0cmFjaywgeFNjYWxlKTtcblx0XHR9XG5cdCAgICB9KTtcblx0fVxuICAgIH07XG5cbiAgICB2YXIgcGxvdCA9IGZ1bmN0aW9uKCkge1xuXG5cdHhTY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdCAgICAuZG9tYWluKFtsb2MuZnJvbSwgbG9jLnRvXSlcblx0ICAgIC5yYW5nZShbMCwgd2lkdGhdKTtcblxuXHRpZiAoZHJhZ19hbGxvd2VkKSB7XG5cdCAgICBzdmdfZy5jYWxsKCB6b29tRXZlbnRIYW5kbGVyXG5cdFx0ICAgICAgIC54KHhTY2FsZSlcblx0XHQgICAgICAgLnNjYWxlRXh0ZW50KFsobG9jLnRvLWxvYy5mcm9tKS8obGltaXRzLnpvb21fb3V0LTEpLCAobG9jLnRvLWxvYy5mcm9tKS9saW1pdHMuem9vbV9pbl0pXG5cdFx0ICAgICAgIC5vbihcInpvb21cIiwgX21vdmUpXG5cdFx0ICAgICApO1xuXHR9XG5cbiAgICB9O1xuXG4gICAgLy8gcmlnaHQvbGVmdC96b29tIHBhbnMgb3Igem9vbXMgdGhlIHRyYWNrLiBUaGVzZSBtZXRob2RzIGFyZSBleHBvc2VkIHRvIGFsbG93IGV4dGVybmFsIGJ1dHRvbnMsIGV0YyB0byBpbnRlcmFjdCB3aXRoIHRoZSB0cmFja3MuIFRoZSBhcmd1bWVudCBpcyB0aGUgYW1vdW50IG9mIHBhbm5pbmcvem9vbWluZyAoaWUuIDEuMiBtZWFucyAyMCUgcGFubmluZykgV2l0aCBsZWZ0L3JpZ2h0IG9ubHkgcG9zaXRpdmUgbnVtYmVycyBhcmUgYWxsb3dlZC5cbiAgICBhcGkubWV0aG9kICgnbW92ZV9yaWdodCcsIGZ1bmN0aW9uIChmYWN0b3IpIHtcblx0aWYgKGZhY3RvciA+IDApIHtcblx0ICAgIF9tYW51YWxfbW92ZShmYWN0b3IsIDEpO1xuXHR9XG4gICAgfSk7XG5cbiAgICBhcGkubWV0aG9kICgnbW92ZV9sZWZ0JywgZnVuY3Rpb24gKGZhY3Rvcikge1xuXHRpZiAoZmFjdG9yID4gMCkge1xuXHQgICAgX21hbnVhbF9tb3ZlKGZhY3RvciwgLTEpO1xuXHR9XG4gICAgfSk7XG5cbiAgICBhcGkubWV0aG9kICgnem9vbScsIGZ1bmN0aW9uIChmYWN0b3IpIHtcblx0X21hbnVhbF9tb3ZlKGZhY3RvciwgMCk7XG4gICAgfSk7XG5cbiAgICBhcGkubWV0aG9kICgnZmluZF90cmFja19ieV9pZCcsIGZ1bmN0aW9uIChpZCkge1xuXHRmb3IgKHZhciBpPTA7IGk8dHJhY2tzLmxlbmd0aDsgaSsrKSB7XG5cdCAgICBpZiAodHJhY2tzW2ldLmlkKCkgPT09IGlkKSB7XG5cdFx0cmV0dXJuIHRyYWNrc1tpXTtcblx0ICAgIH1cblx0fVxuICAgIH0pO1xuXG4gICAgYXBpLm1ldGhvZCAoJ3Jlb3JkZXInLCBmdW5jdGlvbiAobmV3X3RyYWNrcykge1xuXHQvLyBUT0RPOiBUaGlzIGlzIGRlZmluaW5nIGEgbmV3IGhlaWdodCwgYnV0IHRoZSBnbG9iYWwgaGVpZ2h0IGlzIHVzZWQgdG8gZGVmaW5lIHRoZSBzaXplIG9mIHNldmVyYWxcblx0Ly8gcGFydHMuIFdlIHNob3VsZCBkbyB0aGlzIGR5bmFtaWNhbGx5XG5cblx0Zm9yICh2YXIgaj0wOyBqPG5ld190cmFja3MubGVuZ3RoOyBqKyspIHtcblx0ICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuXHQgICAgZm9yICh2YXIgaT0wOyBpPHRyYWNrcy5sZW5ndGg7IGkrKykge1xuXHRcdGlmICh0cmFja3NbaV0uaWQoKSA9PT0gbmV3X3RyYWNrc1tqXS5pZCgpKSB7XG5cdFx0ICAgIGZvdW5kID0gdHJ1ZTtcblx0XHQgICAgdHJhY2tzLnNwbGljZShpLDEpO1xuXHRcdCAgICBicmVhaztcblx0XHR9XG5cdCAgICB9XG5cdCAgICBpZiAoIWZvdW5kKSB7XG5cdFx0X2luaXRfdHJhY2sobmV3X3RyYWNrc1tqXSk7XG5cdFx0X3VwZGF0ZV90cmFjayhuZXdfdHJhY2tzW2pdLCB7ZnJvbSA6IGxvYy5mcm9tLCB0byA6IGxvYy50b30pO1xuXHQgICAgfVxuXHR9XG5cblx0Zm9yICh2YXIgeD0wOyB4PHRyYWNrcy5sZW5ndGg7IHgrKykge1xuXHQgICAgdHJhY2tzW3hdLmcucmVtb3ZlKCk7XG5cdH1cblxuXHR0cmFja3MgPSBuZXdfdHJhY2tzO1xuXHRfcGxhY2VfdHJhY2tzKCk7XG5cbiAgICB9KTtcblxuICAgIGFwaS5tZXRob2QgKCdyZW1vdmVfdHJhY2snLCBmdW5jdGlvbiAodHJhY2spIHtcblx0dHJhY2suZy5yZW1vdmUoKTtcbiAgICB9KTtcblxuICAgIGFwaS5tZXRob2QgKCdhZGRfdHJhY2snLCBmdW5jdGlvbiAodHJhY2spIHtcblx0aWYgKHRyYWNrIGluc3RhbmNlb2YgQXJyYXkpIHtcblx0ICAgIGZvciAodmFyIGk9MDsgaTx0cmFjay5sZW5ndGg7IGkrKykge1xuXHRcdHRyYWNrX3Zpcy5hZGRfdHJhY2sgKHRyYWNrW2ldKTtcblx0ICAgIH1cblx0ICAgIHJldHVybiB0cmFja192aXM7XG5cdH1cblx0dHJhY2tzLnB1c2godHJhY2spO1xuXHRyZXR1cm4gdHJhY2tfdmlzO1xuICAgIH0pO1xuXG4gICAgYXBpLm1ldGhvZCgndHJhY2tzJywgZnVuY3Rpb24gKG5ld190cmFja3MpIHtcblx0aWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG5cdCAgICByZXR1cm4gdHJhY2tzXG5cdH1cblx0dHJhY2tzID0gbmV3X3RyYWNrcztcblx0cmV0dXJuIHRyYWNrX3ZpcztcbiAgICB9KTtcblxuICAgIC8vIFxuICAgIGFwaS5tZXRob2QgKCd3aWR0aCcsIGZ1bmN0aW9uICh3KSB7XG5cdC8vIFRPRE86IEFsbG93IHN1ZmZpeGVzIGxpa2UgXCIxMDAwcHhcIj9cblx0Ly8gVE9ETzogVGVzdCB3cm9uZyBmb3JtYXRzXG5cdGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuXHQgICAgcmV0dXJuIHdpZHRoO1xuXHR9XG5cdC8vIEF0IGxlYXN0IG1pbi13aWR0aFxuXHRpZiAodyA8IG1pbl93aWR0aCkge1xuXHQgICAgdyA9IG1pbl93aWR0aFxuXHR9XG5cblx0Ly8gV2UgYXJlIHJlc2l6aW5nXG5cdGlmIChkaXZfaWQgIT09IHVuZGVmaW5lZCkge1xuXHQgICAgZDMuc2VsZWN0KFwiI3RudF9cIiArIGRpdl9pZCkuc2VsZWN0KFwic3ZnXCIpLmF0dHIoXCJ3aWR0aFwiLCB3KTtcblx0ICAgIC8vIFJlc2l6ZSB0aGUgem9vbWluZy9wYW5uaW5nIHBhbmVcblx0ICAgIGQzLnNlbGVjdChcIiN0bnRfXCIgKyBkaXZfaWQpLnN0eWxlKFwid2lkdGhcIiwgKHBhcnNlSW50KHcpICsgY2FwX3dpZHRoKjIpICsgXCJweFwiKTtcblx0ICAgIGQzLnNlbGVjdChcIiN0bnRfXCIgKyBkaXZfaWQgKyBcIl9wYW5lXCIpLmF0dHIoXCJ3aWR0aFwiLCB3KTtcblxuXHQgICAgLy8gUmVwbG90XG5cdCAgICB3aWR0aCA9IHc7XG5cdCAgICBwbG90KCk7XG5cdCAgICBmb3IgKHZhciBpPTA7IGk8dHJhY2tzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dHJhY2tzW2ldLmcuc2VsZWN0KFwicmVjdFwiKS5hdHRyKFwid2lkdGhcIiwgdyk7XG5cdFx0dHJhY2tzW2ldLmRpc3BsYXkoKS5yZXNldC5jYWxsKHRyYWNrc1tpXSk7XG5cdFx0dHJhY2tzW2ldLmRpc3BsYXkoKS51cGRhdGUuY2FsbCh0cmFja3NbaV0seFNjYWxlKTtcblx0ICAgIH1cblx0ICAgIFxuXHR9IGVsc2Uge1xuXHQgICAgd2lkdGggPSB3O1xuXHR9XG5cdFxuXHRyZXR1cm4gdHJhY2tfdmlzO1xuICAgIH0pO1xuXG4gICAgYXBpLm1ldGhvZCgnYWxsb3dfZHJhZycsIGZ1bmN0aW9uKGIpIHtcblx0aWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG5cdCAgICByZXR1cm4gZHJhZ19hbGxvd2VkO1xuXHR9XG5cdGRyYWdfYWxsb3dlZCA9IGI7XG5cdGlmIChkcmFnX2FsbG93ZWQpIHtcblx0ICAgIC8vIFdoZW4gdGhpcyBtZXRob2QgaXMgY2FsbGVkIG9uIHRoZSBvYmplY3QgYmVmb3JlIHN0YXJ0aW5nIHRoZSBzaW11bGF0aW9uLCB3ZSBkb24ndCBoYXZlIGRlZmluZWQgeFNjYWxlXG5cdCAgICBpZiAoeFNjYWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRzdmdfZy5jYWxsKCB6b29tRXZlbnRIYW5kbGVyLngoeFNjYWxlKVxuXHRcdFx0ICAgLy8gLnhFeHRlbnQoWzAsIGxpbWl0cy5yaWdodF0pXG5cdFx0XHQgICAuc2NhbGVFeHRlbnQoWyhsb2MudG8tbG9jLmZyb20pLyhsaW1pdHMuem9vbV9vdXQtMSksIChsb2MudG8tbG9jLmZyb20pL2xpbWl0cy56b29tX2luXSlcblx0XHRcdCAgIC5vbihcInpvb21cIiwgX21vdmUpICk7XG5cdCAgICB9XG5cdH0gZWxzZSB7XG5cdCAgICAvLyBXZSBjcmVhdGUgYSBuZXcgZHVtbXkgc2NhbGUgaW4geCB0byBhdm9pZCBkcmFnZ2luZyB0aGUgcHJldmlvdXMgb25lXG5cdCAgICAvLyBUT0RPOiBUaGVyZSBtYXkgYmUgYSBjaGVhcGVyIHdheSBvZiBkb2luZyB0aGlzP1xuXHQgICAgem9vbUV2ZW50SGFuZGxlci54KGQzLnNjYWxlLmxpbmVhcigpKS5vbihcInpvb21cIiwgbnVsbCk7XG5cdH1cblx0cmV0dXJuIHRyYWNrX3ZpcztcbiAgICB9KTtcblxuICAgIHZhciBfcGxhY2VfdHJhY2tzID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgaCA9IDA7XG5cdGZvciAodmFyIGk9MDsgaTx0cmFja3MubGVuZ3RoOyBpKyspIHtcblx0ICAgIHZhciB0cmFjayA9IHRyYWNrc1tpXTtcblx0ICAgIGlmICh0cmFjay5nLmF0dHIoXCJ0cmFuc2Zvcm1cIikpIHtcblx0XHR0cmFjay5nXG5cdFx0ICAgIC50cmFuc2l0aW9uKClcblx0XHQgICAgLmR1cmF0aW9uKGR1cilcblx0XHQgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBleHBvcnRzLmV4dGVuZF9jYW52YXMubGVmdCArIFwiLFwiICsgaCArIFwiKVwiKTtcblx0ICAgIH0gZWxzZSB7XG5cdFx0dHJhY2suZ1xuXHRcdCAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIGV4cG9ydHMuZXh0ZW5kX2NhbnZhcy5sZWZ0ICsgXCIsXCIgKyBoICsgXCIpXCIpO1xuXHQgICAgfVxuXG5cdCAgICBoICs9IHRyYWNrLmhlaWdodCgpO1xuXHR9XG5cblx0Ly8gc3ZnXG5cdHN2Zy5hdHRyKFwiaGVpZ2h0XCIsIGggKyBoZWlnaHRfb2Zmc2V0KTtcblxuXHQvLyBkaXZcblx0ZDMuc2VsZWN0KFwiI3RudF9cIiArIGRpdl9pZClcblx0ICAgIC5zdHlsZShcImhlaWdodFwiLCAoaCArIDEwICsgaGVpZ2h0X29mZnNldCkgKyBcInB4XCIpO1xuXG5cdC8vIGNhcHNcblx0ZDMuc2VsZWN0KFwiI3RudF9cIiArIGRpdl9pZCArIFwiXzVwY2FwXCIpXG5cdCAgICAuYXR0cihcImhlaWdodFwiLCBoKVxuXHQgICAgLy8gLm1vdmVfdG9fZnJvbnQoKVxuXHQgICAgLmVhY2goZnVuY3Rpb24gKGQpIHtcblx0XHRtb3ZlX3RvX2Zyb250KHRoaXMpO1xuXHQgICAgfSlcblx0ZDMuc2VsZWN0KFwiI3RudF9cIiArIGRpdl9pZCArIFwiXzNwY2FwXCIpXG5cdCAgICAuYXR0cihcImhlaWdodFwiLCBoKVxuXHQvLy5tb3ZlX3RvX2Zyb250KClcblx0ICAgIC5lYWNoIChmdW5jdGlvbiAoZCkge1xuXHRcdG1vdmVfdG9fZnJvbnQodGhpcyk7XG5cdCAgICB9KTtcblx0XG5cblx0Ly8gcGFuZVxuXHRwYW5lXG5cdCAgICAuYXR0cihcImhlaWdodFwiLCBoICsgaGVpZ2h0X29mZnNldCk7XG5cblx0Ly8gdG9vV2lkZV90ZXh0LiBUT0RPOiBJcyB0aGlzIHN0aWxsIG5lZWRlZD9cblx0Ly8gdmFyIHRvb1dpZGVfdGV4dCA9IGQzLnNlbGVjdChcIiN0bnRfXCIgKyBkaXZfaWQgKyBcIl90b29XaWRlXCIpO1xuXHQvLyB2YXIgYmIgPSB0b29XaWRlX3RleHRbMF1bMF0uZ2V0QkJveCgpO1xuXHQvLyB0b29XaWRlX3RleHRcblx0Ly8gICAgIC5hdHRyKFwieVwiLCB+fihoLzIpIC0gYmIuaGVpZ2h0LzIpO1xuXG5cdHJldHVybiB0cmFja192aXM7XG4gICAgfVxuXG4gICAgdmFyIF9pbml0X3RyYWNrID0gZnVuY3Rpb24gKHRyYWNrKSB7XG5cdHRyYWNrLmcgPSBzdmcuc2VsZWN0KFwiZ1wiKS5zZWxlY3QoXCJnXCIpXG5cdCAgICAuYXBwZW5kKFwiZ1wiKVxuXHQgICAgLmF0dHIoXCJjbGFzc1wiLCBcInRudF90cmFja1wiKVxuXHQgICAgLmF0dHIoXCJoZWlnaHRcIiwgdHJhY2suaGVpZ2h0KCkpO1xuXG5cdC8vIFJlY3QgZm9yIHRoZSBiYWNrZ3JvdW5kIGNvbG9yXG5cdHRyYWNrLmdcblx0ICAgIC5hcHBlbmQoXCJyZWN0XCIpXG5cdCAgICAuYXR0cihcInhcIiwgMClcblx0ICAgIC5hdHRyKFwieVwiLCAwKVxuXHQgICAgLmF0dHIoXCJ3aWR0aFwiLCB0cmFja192aXMud2lkdGgoKSlcblx0ICAgIC5hdHRyKFwiaGVpZ2h0XCIsIHRyYWNrLmhlaWdodCgpKVxuXHQgICAgLnN0eWxlKFwiZmlsbFwiLCB0cmFjay5iYWNrZ3JvdW5kX2NvbG9yKCkpXG5cdCAgICAuc3R5bGUoXCJwb2ludGVyLWV2ZW50c1wiLCBcIm5vbmVcIik7XG5cblx0aWYgKHRyYWNrLmRpc3BsYXkoKSkge1xuXHQgICAgdHJhY2suZGlzcGxheSgpLmluaXQuY2FsbCh0cmFjaywgd2lkdGgpO1xuXHR9XG5cdFxuXHRyZXR1cm4gdHJhY2tfdmlzO1xuICAgIH07XG5cbiAgICB2YXIgX21hbnVhbF9tb3ZlID0gZnVuY3Rpb24gKGZhY3RvciwgZGlyZWN0aW9uKSB7XG5cdHZhciBvbGREb21haW4gPSB4U2NhbGUuZG9tYWluKCk7XG5cblx0dmFyIHNwYW4gPSBvbGREb21haW5bMV0gLSBvbGREb21haW5bMF07XG5cdHZhciBvZmZzZXQgPSAoc3BhbiAqIGZhY3RvcikgLSBzcGFuO1xuXG5cdHZhciBuZXdEb21haW47XG5cdHN3aXRjaCAoZGlyZWN0aW9uKSB7XG5cdGNhc2UgLTEgOlxuXHQgICAgbmV3RG9tYWluID0gWyh+fm9sZERvbWFpblswXSAtIG9mZnNldCksIH5+KG9sZERvbWFpblsxXSAtIG9mZnNldCldO1xuXHQgICAgYnJlYWs7XG5cdGNhc2UgMSA6XG5cdCAgICBuZXdEb21haW4gPSBbKH5+b2xkRG9tYWluWzBdICsgb2Zmc2V0KSwgfn4ob2xkRG9tYWluWzFdIC0gb2Zmc2V0KV07XG5cdCAgICBicmVhaztcblx0Y2FzZSAwIDpcblx0ICAgIG5ld0RvbWFpbiA9IFtvbGREb21haW5bMF0gLSB+fihvZmZzZXQvMiksIG9sZERvbWFpblsxXSArICh+fm9mZnNldC8yKV07XG5cdH1cblxuXHR2YXIgaW50ZXJwb2xhdG9yID0gZDMuaW50ZXJwb2xhdGVOdW1iZXIob2xkRG9tYWluWzBdLCBuZXdEb21haW5bMF0pO1xuXHR2YXIgZWFzZSA9IGV4cG9ydHMuZWFzZTtcblxuXHR2YXIgeCA9IDA7XG5cdGQzLnRpbWVyKGZ1bmN0aW9uKCkge1xuXHQgICAgdmFyIGN1cnJfc3RhcnQgPSBpbnRlcnBvbGF0b3IoZWFzZSh4KSk7XG5cdCAgICB2YXIgY3Vycl9lbmQ7XG5cdCAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xuXHQgICAgY2FzZSAtMSA6XG5cdFx0Y3Vycl9lbmQgPSBjdXJyX3N0YXJ0ICsgc3Bhbjtcblx0XHRicmVhaztcblx0ICAgIGNhc2UgMSA6XG5cdFx0Y3Vycl9lbmQgPSBjdXJyX3N0YXJ0ICsgc3Bhbjtcblx0XHRicmVhaztcblx0ICAgIGNhc2UgMCA6XG5cdFx0Y3Vycl9lbmQgPSBvbGREb21haW5bMV0gKyBvbGREb21haW5bMF0gLSBjdXJyX3N0YXJ0O1xuXHRcdGJyZWFrO1xuXHQgICAgfVxuXG5cdCAgICB2YXIgY3VyckRvbWFpbiA9IFtjdXJyX3N0YXJ0LCBjdXJyX2VuZF07XG5cdCAgICB4U2NhbGUuZG9tYWluKGN1cnJEb21haW4pO1xuXHQgICAgX21vdmUoeFNjYWxlKTtcblx0ICAgIHgrPTAuMDI7XG5cdCAgICByZXR1cm4geD4xO1xuXHR9KTtcbiAgICB9O1xuXG5cbiAgICB2YXIgX21vdmVfY2JhayA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIGN1cnJEb21haW4gPSB4U2NhbGUuZG9tYWluKCk7XG5cdHRyYWNrX3Zpcy5mcm9tKH5+Y3VyckRvbWFpblswXSk7XG5cdHRyYWNrX3Zpcy50byh+fmN1cnJEb21haW5bMV0pO1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdHJhY2tzLmxlbmd0aDsgaSsrKSB7XG5cdCAgICB2YXIgdHJhY2sgPSB0cmFja3NbaV07XG5cdCAgICBfdXBkYXRlX3RyYWNrKHRyYWNrLCBsb2MpO1xuXHR9XG4gICAgfTtcbiAgICAvLyBUaGUgZGVmZXJyZWRfY2JhayBpcyBkZWZlcnJlZCBhdCBsZWFzdCB0aGlzIGFtb3VudCBvZiB0aW1lIG9yIHJlLXNjaGVkdWxlZCBpZiBkZWZlcnJlZCBpcyBjYWxsZWQgYmVmb3JlXG4gICAgdmFyIF9kZWZlcnJlZCA9IGRlZmVyQ2FuY2VsKF9tb3ZlX2NiYWssIDMwMCk7XG5cbiAgICAvLyBhcGkubWV0aG9kKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgLy8gXHRfbW92ZSgpO1xuICAgIC8vIH0pO1xuXG4gICAgdmFyIF9tb3ZlID0gZnVuY3Rpb24gKG5ld194U2NhbGUpIHtcblx0aWYgKG5ld194U2NhbGUgIT09IHVuZGVmaW5lZCAmJiBkcmFnX2FsbG93ZWQpIHtcblx0ICAgIHpvb21FdmVudEhhbmRsZXIueChuZXdfeFNjYWxlKTtcblx0fVxuXG5cdC8vIFNob3cgdGhlIHJlZCBiYXJzIGF0IHRoZSBsaW1pdHNcblx0dmFyIGRvbWFpbiA9IHhTY2FsZS5kb21haW4oKTtcblx0aWYgKGRvbWFpblswXSA8PSA1KSB7XG5cdCAgICBkMy5zZWxlY3QoXCIjdG50X1wiICsgZGl2X2lkICsgXCJfNXBjYXBcIilcblx0XHQuYXR0cihcIndpZHRoXCIsIGNhcF93aWR0aClcblx0XHQudHJhbnNpdGlvbigpXG5cdFx0LmR1cmF0aW9uKDIwMClcblx0XHQuYXR0cihcIndpZHRoXCIsIDApO1xuXHR9XG5cblx0aWYgKGRvbWFpblsxXSA+PSAobGltaXRzLnJpZ2h0KS01KSB7XG5cdCAgICBkMy5zZWxlY3QoXCIjdG50X1wiICsgZGl2X2lkICsgXCJfM3BjYXBcIilcblx0XHQuYXR0cihcIndpZHRoXCIsIGNhcF93aWR0aClcblx0XHQudHJhbnNpdGlvbigpXG5cdFx0LmR1cmF0aW9uKDIwMClcblx0XHQuYXR0cihcIndpZHRoXCIsIDApO1xuXHR9XG5cblxuXHQvLyBBdm9pZCBtb3ZpbmcgcGFzdCB0aGUgbGltaXRzXG5cdGlmIChkb21haW5bMF0gPCBsaW1pdHMubGVmdCkge1xuXHQgICAgem9vbUV2ZW50SGFuZGxlci50cmFuc2xhdGUoW3pvb21FdmVudEhhbmRsZXIudHJhbnNsYXRlKClbMF0gLSB4U2NhbGUobGltaXRzLmxlZnQpICsgeFNjYWxlLnJhbmdlKClbMF0sIHpvb21FdmVudEhhbmRsZXIudHJhbnNsYXRlKClbMV1dKTtcblx0fSBlbHNlIGlmIChkb21haW5bMV0gPiBsaW1pdHMucmlnaHQpIHtcblx0ICAgIHpvb21FdmVudEhhbmRsZXIudHJhbnNsYXRlKFt6b29tRXZlbnRIYW5kbGVyLnRyYW5zbGF0ZSgpWzBdIC0geFNjYWxlKGxpbWl0cy5yaWdodCkgKyB4U2NhbGUucmFuZ2UoKVsxXSwgem9vbUV2ZW50SGFuZGxlci50cmFuc2xhdGUoKVsxXV0pO1xuXHR9XG5cblx0X2RlZmVycmVkKCk7XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0cmFja3MubGVuZ3RoOyBpKyspIHtcblx0ICAgIHZhciB0cmFjayA9IHRyYWNrc1tpXTtcblx0ICAgIHRyYWNrLmRpc3BsYXkoKS5tb3ZlLmNhbGwodHJhY2sseFNjYWxlKTtcblx0fVxuICAgIH07XG5cbiAgICAvLyBhcGkubWV0aG9kKHtcbiAgICAvLyBcdGFsbG93X2RyYWcgOiBhcGlfYWxsb3dfZHJhZyxcbiAgICAvLyBcdHdpZHRoICAgICAgOiBhcGlfd2lkdGgsXG4gICAgLy8gXHRhZGRfdHJhY2sgIDogYXBpX2FkZF90cmFjayxcbiAgICAvLyBcdHJlb3JkZXIgICAgOiBhcGlfcmVvcmRlcixcbiAgICAvLyBcdHpvb20gICAgICAgOiBhcGlfem9vbSxcbiAgICAvLyBcdGxlZnQgICAgICAgOiBhcGlfbGVmdCxcbiAgICAvLyBcdHJpZ2h0ICAgICAgOiBhcGlfcmlnaHQsXG4gICAgLy8gXHRzdGFydCAgICAgIDogYXBpX3N0YXJ0XG4gICAgLy8gfSk7XG5cbiAgICAvLyBBdXhpbGlhciBmdW5jdGlvbnNcbiAgICBmdW5jdGlvbiBtb3ZlX3RvX2Zyb250IChlbGVtKSB7XG5cdGVsZW0ucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChlbGVtKTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHRyYWNrX3Zpcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGJvYXJkO1xuIiwidmFyIGFwaWpzID0gcmVxdWlyZSAoXCJ0bnQuYXBpXCIpO1xuLy8gdmFyIGVuc2VtYmxSZXN0QVBJID0gcmVxdWlyZShcInRudC5lbnNlbWJsXCIpO1xuXG4vLyB2YXIgYm9hcmQgPSB7fTtcbi8vIGJvYXJkLnRyYWNrID0ge307XG5cbnZhciBkYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIF8gPSBmdW5jdGlvbiAoKSB7XG4gICAgfTtcblxuICAgIC8vIEdldHRlcnMgLyBTZXR0ZXJzXG4gICAgYXBpanMgKF8pXG4gICAgLy8gbGFiZWwgaXMgbm90IHVzZWQgYXQgdGhlIG1vbWVudFxuXHQuZ2V0c2V0ICgnbGFiZWwnLCBcIlwiKVxuXHQuZ2V0c2V0ICgnZWxlbWVudHMnLCBbXSlcblx0LmdldHNldCAoJ3VwZGF0ZScsIGZ1bmN0aW9uICgpIHt9KTtcblxuICAgIHJldHVybiBfO1xufTtcblxuLy8gVGhlIHJldHJpZXZlcnMuIFRoZXkgbmVlZCB0byBhY2Nlc3MgJ2VsZW1lbnRzJ1xuZGF0YS5yZXRyaWV2ZXIgPSB7fTtcblxuZGF0YS5yZXRyaWV2ZXIuc3luYyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB1cGRhdGVfdHJhY2sgPSBmdW5jdGlvbihvYmopIHtcblx0Ly8gXCJ0aGlzXCIgaXMgc2V0IHRvIHRoZSBkYXRhIG9ialxuICAgICAgICB0aGlzLmVsZW1lbnRzKHVwZGF0ZV90cmFjay5yZXRyaWV2ZXIoKShvYmoubG9jKSk7XG4gICAgICAgIG9iai5vbl9zdWNjZXNzKCk7XG4gICAgfTtcblxuICAgIGFwaWpzICh1cGRhdGVfdHJhY2spXG5cdC5nZXRzZXQgKCdyZXRyaWV2ZXInLCBmdW5jdGlvbiAoKSB7fSlcblxuICAgIHJldHVybiB1cGRhdGVfdHJhY2s7XG59O1xuXG5kYXRhLnJldHJpZXZlci5hc3luYyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdXJsID0gJyc7XG5cbiAgICAvLyBcInRoaXNcIiBpcyBzZXQgdG8gdGhlIGRhdGEgb2JqXG4gICAgdmFyIGRhdGFfb2JqID0gdGhpcztcbiAgICB2YXIgdXBkYXRlX3RyYWNrID0gZnVuY3Rpb24gKG9iaikge1xuXHRkMy5qc29uKHVybCwgZnVuY3Rpb24gKGVyciwgcmVzcCkge1xuXHQgICAgZGF0YV9vYmouZWxlbWVudHMocmVzcCk7XG5cdCAgICBvYmoub25fc3VjY2VzcygpO1xuXHR9KTsgXG4gICAgfTtcblxuICAgIGFwaWpzICh1cGRhdGVfdHJhY2spXG5cdC5nZXRzZXQgKCd1cmwnLCAnJyk7XG5cbiAgICByZXR1cm4gdXBkYXRlX3RyYWNrO1xufTtcblxuXG5cbi8vIEEgcHJlZGVmaW5lZCB0cmFjayBmb3IgZ2VuZXNcbi8vIHRudC50cmFjay5kYXRhLmdlbmUgPSBmdW5jdGlvbiAoKSB7XG4vLyAgICAgdmFyIHRyYWNrID0gdG50LnRyYWNrLmRhdGEoKTtcbi8vIFx0Ly8gLmluZGV4KFwiSURcIik7XG5cbi8vICAgICB2YXIgdXBkYXRlciA9IHRudC50cmFjay5yZXRyaWV2ZXIuZW5zZW1ibCgpXG4vLyBcdC5lbmRwb2ludChcInJlZ2lvblwiKVxuLy8gICAgIC8vIFRPRE86IElmIHN1Y2Nlc3MgaXMgZGVmaW5lZCBoZXJlLCBtZWFucyB0aGF0IGl0IGNhbid0IGJlIHVzZXItZGVmaW5lZFxuLy8gICAgIC8vIGlzIHRoYXQgZ29vZD8gZW5vdWdoPyBBUEk/XG4vLyAgICAgLy8gVVBEQVRFOiBOb3cgc3VjY2VzcyBpcyBiYWNrZWQgdXAgYnkgYW4gYXJyYXkuIFN0aWxsIGRvbid0IGtub3cgaWYgdGhpcyBpcyB0aGUgYmVzdCBvcHRpb25cbi8vIFx0LnN1Y2Nlc3MoZnVuY3Rpb24oZ2VuZXMpIHtcbi8vIFx0ICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2VuZXMubGVuZ3RoOyBpKyspIHtcbi8vIFx0XHRpZiAoZ2VuZXNbaV0uc3RyYW5kID09PSAtMSkgeyAgXG4vLyBcdFx0ICAgIGdlbmVzW2ldLmRpc3BsYXlfbGFiZWwgPSBcIjxcIiArIGdlbmVzW2ldLmV4dGVybmFsX25hbWU7XG4vLyBcdFx0fSBlbHNlIHtcbi8vIFx0XHQgICAgZ2VuZXNbaV0uZGlzcGxheV9sYWJlbCA9IGdlbmVzW2ldLmV4dGVybmFsX25hbWUgKyBcIj5cIjtcbi8vIFx0XHR9XG4vLyBcdCAgICB9XG4vLyBcdH0pO1xuXG4vLyAgICAgcmV0dXJuIHRyYWNrLnVwZGF0ZSh1cGRhdGVyKTtcbi8vIH1cblxuLy8gQSBwcmVkZWZpbmVkIHRyYWNrIGRpc3BsYXlpbmcgbm8gZXh0ZXJuYWwgZGF0YVxuLy8gaXQgaXMgdXNlZCBmb3IgbG9jYXRpb24gYW5kIGF4aXMgdHJhY2tzIGZvciBleGFtcGxlXG5kYXRhLmVtcHR5ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0cmFjayA9IGRhdGEoKTtcbiAgICB2YXIgdXBkYXRlciA9IGRhdGEucmV0cmlldmVyLnN5bmMoKTtcbiAgICB0cmFjay51cGRhdGUodXBkYXRlcik7XG5cbiAgICByZXR1cm4gdHJhY2s7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBkYXRhO1xuIiwidmFyIGFwaWpzID0gcmVxdWlyZSAoXCJ0bnQuYXBpXCIpO1xudmFyIGxheW91dCA9IHJlcXVpcmUoXCIuL2xheW91dC5qc1wiKTtcblxuLy8gRkVBVFVSRSBWSVNcbi8vIHZhciBib2FyZCA9IHt9O1xuLy8gYm9hcmQudHJhY2sgPSB7fTtcbnZhciB0bnRfZmVhdHVyZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLy8vLy8gVmFycyBleHBvc2VkIGluIHRoZSBBUElcbiAgICB2YXIgZXhwb3J0cyA9IHtcblx0Y3JlYXRlICAgOiBmdW5jdGlvbiAoKSB7dGhyb3cgXCJjcmVhdGVfZWxlbSBpcyBub3QgZGVmaW5lZCBpbiB0aGUgYmFzZSBmZWF0dXJlIG9iamVjdFwiO30sXG5cdG1vdmVyICAgIDogZnVuY3Rpb24gKCkge3Rocm93IFwibW92ZV9lbGVtIGlzIG5vdCBkZWZpbmVkIGluIHRoZSBiYXNlIGZlYXR1cmUgb2JqZWN0XCI7fSxcblx0dXBkYXRlciAgOiBmdW5jdGlvbiAoKSB7fSxcblx0b25fY2xpY2sgOiBmdW5jdGlvbiAoKSB7fSxcblx0b25fbW91c2VvdmVyIDogZnVuY3Rpb24gKCkge30sXG5cdGd1aWRlciAgIDogZnVuY3Rpb24gKCkge30sXG5cdGluZGV4ICAgIDogdW5kZWZpbmVkLFxuXHRsYXlvdXQgICA6IGxheW91dC5pZGVudGl0eSgpLFxuXHRmb3JlZ3JvdW5kX2NvbG9yIDogJyMwMDAnXG4gICAgfTtcblxuXG4gICAgLy8gVGhlIHJldHVybmVkIG9iamVjdFxuICAgIHZhciBmZWF0dXJlID0ge307XG5cbiAgICB2YXIgcmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgXHR2YXIgdHJhY2sgPSB0aGlzO1xuICAgIFx0dHJhY2suZy5zZWxlY3RBbGwoXCIudG50X2VsZW1cIikucmVtb3ZlKCk7XG5cdHRyYWNrLmcuc2VsZWN0QWxsKFwiLnRudF9ndWlkZXJcIikucmVtb3ZlKCk7XG4gICAgfTtcblxuICAgIHZhciBpbml0ID0gZnVuY3Rpb24gKHdpZHRoKSB7XG5cdHZhciB0cmFjayA9IHRoaXM7XG5cdGV4cG9ydHMuZ3VpZGVyLmNhbGwodHJhY2ssIHdpZHRoKTtcbiAgICB9O1xuXG4gICAgdmFyIHBsb3QgPSBmdW5jdGlvbiAobmV3X2VsZW1zLCB0cmFjaywgeFNjYWxlKSB7XG5cdG5ld19lbGVtcy5vbihcImNsaWNrXCIsIGV4cG9ydHMub25fY2xpY2spO1xuXHRuZXdfZWxlbXMub24oXCJtb3VzZW92ZXJcIiwgZXhwb3J0cy5vbl9tb3VzZW92ZXIpO1xuXHQvLyBuZXdfZWxlbSBpcyBhIGcgZWxlbWVudCB3aGVyZSB0aGUgZmVhdHVyZSBpcyBpbnNlcnRlZFxuXHRleHBvcnRzLmNyZWF0ZS5jYWxsKHRyYWNrLCBuZXdfZWxlbXMsIHhTY2FsZSk7XG4gICAgfTtcblxuICAgIHZhciB1cGRhdGUgPSBmdW5jdGlvbiAoeFNjYWxlLCBmaWVsZCkge1xuXHR2YXIgdHJhY2sgPSB0aGlzO1xuXHR2YXIgc3ZnX2cgPSB0cmFjay5nO1xuXHR2YXIgbGF5b3V0ID0gZXhwb3J0cy5sYXlvdXQ7XG5cblx0dmFyIGVsZW1lbnRzID0gdHJhY2suZGF0YSgpLmVsZW1lbnRzKCk7XG5cblx0aWYgKGZpZWxkICE9PSB1bmRlZmluZWQpIHtcblx0ICAgIGVsZW1lbnRzID0gZWxlbWVudHNbZmllbGRdO1xuXHR9XG5cblx0bGF5b3V0KGVsZW1lbnRzLCB4U2NhbGUpO1xuXHR2YXIgZGF0YV9lbGVtcyA9IGxheW91dC5lbGVtZW50cygpO1xuXG5cdHZhciB2aXNfc2VsO1xuXHR2YXIgdmlzX2VsZW1zO1xuXHRpZiAoZmllbGQgIT09IHVuZGVmaW5lZCkge1xuXHQgICAgdmlzX3NlbCA9IHN2Z19nLnNlbGVjdEFsbChcIi50bnRfZWxlbV9cIiArIGZpZWxkKTtcblx0fSBlbHNlIHtcblx0ICAgIHZpc19zZWwgPSBzdmdfZy5zZWxlY3RBbGwoXCIudG50X2VsZW1cIik7XG5cdH1cblxuXHRpZiAoZXhwb3J0cy5pbmRleCkgeyAvLyBJbmRleGluZyBieSBmaWVsZFxuXHQgICAgdmlzX2VsZW1zID0gdmlzX3NlbFxuXHRcdC5kYXRhKGRhdGFfZWxlbXMsIGZ1bmN0aW9uIChkKSB7XG5cdFx0ICAgIGlmIChkICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiBleHBvcnRzLmluZGV4KGQpO1xuXHRcdCAgICB9XG5cdFx0fSk7XG5cdH0gZWxzZSB7IC8vIEluZGV4aW5nIGJ5IHBvc2l0aW9uIGluIGFycmF5XG5cdCAgICB2aXNfZWxlbXMgPSB2aXNfc2VsXG5cdFx0LmRhdGEoZGF0YV9lbGVtcyk7XG5cdH1cblxuXHRleHBvcnRzLnVwZGF0ZXIuY2FsbCh0cmFjaywgdmlzX2VsZW1zLCB4U2NhbGUpO1xuXG5cdHZhciBuZXdfZWxlbSA9IHZpc19lbGVtc1xuXHQgICAgLmVudGVyKCk7XG5cblx0bmV3X2VsZW1cblx0ICAgIC5hcHBlbmQoXCJnXCIpXG5cdCAgICAuYXR0cihcImNsYXNzXCIsIFwidG50X2VsZW1cIilcblx0ICAgIC5jbGFzc2VkKFwidG50X2VsZW1fXCIgKyBmaWVsZCwgZmllbGQpXG5cdCAgICAuY2FsbChmZWF0dXJlLnBsb3QsIHRyYWNrLCB4U2NhbGUpO1xuXG5cdHZpc19lbGVtc1xuXHQgICAgLmV4aXQoKVxuXHQgICAgLnJlbW92ZSgpO1xuICAgIH07XG5cbiAgICB2YXIgbW92ZSA9IGZ1bmN0aW9uICh4U2NhbGUsIGZpZWxkKSB7XG5cdHZhciB0cmFjayA9IHRoaXM7XG5cdHZhciBzdmdfZyA9IHRyYWNrLmc7XG5cdHZhciBlbGVtcztcblx0Ly8gVE9ETzogSXMgc2VsZWN0aW5nIHRoZSBlbGVtZW50cyB0byBtb3ZlIHRvbyBzbG93P1xuXHQvLyBJdCB3b3VsZCBiZSBuaWNlIHRvIHByb2ZpbGVcblx0aWYgKGZpZWxkICE9PSB1bmRlZmluZWQpIHtcblx0ICAgIGVsZW1zID0gc3ZnX2cuc2VsZWN0QWxsKFwiLnRudF9lbGVtX1wiICsgZmllbGQpO1xuXHR9IGVsc2Uge1xuXHQgICAgZWxlbXMgPSBzdmdfZy5zZWxlY3RBbGwoXCIudG50X2VsZW1cIik7XG5cdH1cblxuXHRleHBvcnRzLm1vdmVyLmNhbGwodGhpcywgZWxlbXMsIHhTY2FsZSk7XG4gICAgfTtcblxuICAgIHZhciBtdGYgPSBmdW5jdGlvbiAoZWxlbSkge1xuXHRlbGVtLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQoZWxlbSk7XG4gICAgfTtcblxuICAgIHZhciBtb3ZlX3RvX2Zyb250ID0gZnVuY3Rpb24gKGZpZWxkKSB7XG5cdGlmIChmaWVsZCAhPT0gdW5kZWZpbmVkKSB7XG5cdCAgICB2YXIgdHJhY2sgPSB0aGlzO1xuXHQgICAgdmFyIHN2Z19nID0gdHJhY2suZztcblx0ICAgIHN2Z19nLnNlbGVjdEFsbChcIi50bnRfZWxlbV9cIiArIGZpZWxkKVxuXHQgICAgICAgIC5lYWNoKCBmdW5jdGlvbiAoKSB7XG5cdFx0ICAgIG10Zih0aGlzKTtcblx0XHR9KTtcblx0fVxuICAgIH07XG5cbiAgICAvLyBBUElcbiAgICBhcGlqcyAoZmVhdHVyZSlcblx0LmdldHNldCAoZXhwb3J0cylcblx0Lm1ldGhvZCAoe1xuXHQgICAgcmVzZXQgIDogcmVzZXQsXG5cdCAgICBwbG90ICAgOiBwbG90LFxuXHQgICAgdXBkYXRlIDogdXBkYXRlLFxuXHQgICAgbW92ZSAgIDogbW92ZSxcblx0ICAgIGluaXQgICA6IGluaXQsXG5cdCAgICBtb3ZlX3RvX2Zyb250IDogbW92ZV90b19mcm9udFxuXHR9KTtcblxuICAgIHJldHVybiBmZWF0dXJlO1xufTtcblxudG50X2ZlYXR1cmUuY29tcG9zaXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBkaXNwbGF5cyA9IHt9O1xuICAgIHZhciBkaXNwbGF5X29yZGVyID0gW107XG5cbiAgICB2YXIgZmVhdHVyZXMgPSB7fTtcblxuICAgIHZhciByZXNldCA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIHRyYWNrID0gdGhpcztcblx0Zm9yICh2YXIgaT0wOyBpPGRpc3BsYXlzLmxlbmd0aDsgaSsrKSB7XG5cdCAgICBkaXNwbGF5c1tpXS5yZXNldC5jYWxsKHRyYWNrKTtcblx0fVxuICAgIH07XG5cbiAgICB2YXIgaW5pdCA9IGZ1bmN0aW9uICh3aWR0aCkge1xuXHR2YXIgdHJhY2sgPSB0aGlzO1xuIFx0Zm9yICh2YXIgZGlzcGxheSBpbiBkaXNwbGF5cykge1xuXHQgICAgaWYgKGRpc3BsYXlzLmhhc093blByb3BlcnR5KGRpc3BsYXkpKSB7XG5cdFx0ZGlzcGxheXNbZGlzcGxheV0uaW5pdC5jYWxsKHRyYWNrLCB3aWR0aCk7XG5cdCAgICB9XG5cdH1cbiAgICB9O1xuXG4gICAgdmFyIHVwZGF0ZSA9IGZ1bmN0aW9uICh4U2NhbGUpIHtcblx0dmFyIHRyYWNrID0gdGhpcztcblx0Zm9yICh2YXIgaT0wOyBpPGRpc3BsYXlfb3JkZXIubGVuZ3RoOyBpKyspIHtcblx0ICAgIGRpc3BsYXlzW2Rpc3BsYXlfb3JkZXJbaV1dLnVwZGF0ZS5jYWxsKHRyYWNrLCB4U2NhbGUsIGRpc3BsYXlfb3JkZXJbaV0pO1xuXHQgICAgZGlzcGxheXNbZGlzcGxheV9vcmRlcltpXV0ubW92ZV90b19mcm9udC5jYWxsKHRyYWNrLCBkaXNwbGF5X29yZGVyW2ldKTtcblx0fVxuXHQvLyBmb3IgKHZhciBkaXNwbGF5IGluIGRpc3BsYXlzKSB7XG5cdC8vICAgICBpZiAoZGlzcGxheXMuaGFzT3duUHJvcGVydHkoZGlzcGxheSkpIHtcblx0Ly8gXHRkaXNwbGF5c1tkaXNwbGF5XS51cGRhdGUuY2FsbCh0cmFjaywgeFNjYWxlLCBkaXNwbGF5KTtcblx0Ly8gICAgIH1cblx0Ly8gfVxuICAgIH07XG5cbiAgICB2YXIgbW92ZSA9IGZ1bmN0aW9uICh4U2NhbGUpIHtcblx0dmFyIHRyYWNrID0gdGhpcztcblx0Zm9yICh2YXIgZGlzcGxheSBpbiBkaXNwbGF5cykge1xuXHQgICAgaWYgKGRpc3BsYXlzLmhhc093blByb3BlcnR5KGRpc3BsYXkpKSB7XG5cdFx0ZGlzcGxheXNbZGlzcGxheV0ubW92ZS5jYWxsKHRyYWNrLCB4U2NhbGUsIGRpc3BsYXkpO1xuXHQgICAgfVxuXHR9XG4gICAgfTtcblxuICAgIHZhciBhZGQgPSBmdW5jdGlvbiAoa2V5LCBkaXNwbGF5KSB7XG5cdGRpc3BsYXlzW2tleV0gPSBkaXNwbGF5O1xuXHRkaXNwbGF5X29yZGVyLnB1c2goa2V5KTtcblx0cmV0dXJuIGZlYXR1cmVzO1xuICAgIH07XG5cbiAgICB2YXIgb25fY2xpY2sgPSBmdW5jdGlvbiAoY2Jhaykge1xuXHRmb3IgKHZhciBkaXNwbGF5IGluIGRpc3BsYXlzKSB7XG5cdCAgICBpZiAoZGlzcGxheXMuaGFzT3duUHJvcGVydHkoZGlzcGxheSkpIHtcblx0XHRkaXNwbGF5c1tkaXNwbGF5XS5vbl9jbGljayhjYmFrKTtcblx0ICAgIH1cblx0fVxuXHRyZXR1cm4gZmVhdHVyZXM7XG4gICAgfTtcblxuICAgIHZhciBnZXRfZGlzcGxheXMgPSBmdW5jdGlvbiAoKSB7XG5cdHZhciBkcyA9IFtdO1xuXHRmb3IgKHZhciBpPTA7IGk8ZGlzcGxheV9vcmRlci5sZW5ndGg7IGkrKykge1xuXHQgICAgZHMucHVzaChkaXNwbGF5c1tkaXNwbGF5X29yZGVyW2ldXSk7XG5cdH1cblx0cmV0dXJuIGRzO1xuICAgIH07XG5cbiAgICAvLyBBUElcbiAgICBhcGlqcyAoZmVhdHVyZXMpXG5cdC5tZXRob2QgKHtcblx0ICAgIHJlc2V0ICA6IHJlc2V0LFxuXHQgICAgdXBkYXRlIDogdXBkYXRlLFxuXHQgICAgbW92ZSAgIDogbW92ZSxcblx0ICAgIGluaXQgICA6IGluaXQsXG5cdCAgICBhZGQgICAgOiBhZGQsXG5cdCAgICBvbl9jbGljayA6IG9uX2NsaWNrLFxuXHQgICAgZGlzcGxheXMgOiBnZXRfZGlzcGxheXNcblx0fSk7XG5cbiAgICByZXR1cm4gZmVhdHVyZXM7XG59O1xuXG50bnRfZmVhdHVyZS5hcmVhID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmZWF0dXJlID0gdG50X2ZlYXR1cmUubGluZSgpO1xuICAgIHZhciBsaW5lID0gdG50X2ZlYXR1cmUubGluZSgpO1xuXG4gICAgdmFyIGFyZWEgPSBkMy5zdmcuYXJlYSgpXG5cdC5pbnRlcnBvbGF0ZShsaW5lLmludGVycG9sYXRlKCkpXG5cdC50ZW5zaW9uKGZlYXR1cmUudGVuc2lvbigpKTtcblxuICAgIHZhciBkYXRhX3BvaW50cztcblxuICAgIHZhciBsaW5lX2NyZWF0ZSA9IGZlYXR1cmUuY3JlYXRlKCk7IC8vIFdlICdzYXZlJyBsaW5lIGNyZWF0aW9uXG4gICAgZmVhdHVyZS5jcmVhdGUgKGZ1bmN0aW9uIChwb2ludHMsIHhTY2FsZSkge1xuXHR2YXIgdHJhY2sgPSB0aGlzO1xuXG5cdGlmIChkYXRhX3BvaW50cyAhPT0gdW5kZWZpbmVkKSB7XG4vL1x0ICAgICByZXR1cm47XG5cdCAgICB0cmFjay5nLnNlbGVjdChcInBhdGhcIikucmVtb3ZlKCk7XG5cdH1cblxuXHRsaW5lX2NyZWF0ZS5jYWxsKHRyYWNrLCBwb2ludHMsIHhTY2FsZSk7XG5cblx0YXJlYVxuXHQgICAgLngobGluZS54KCkpXG5cdCAgICAueTEobGluZS55KCkpXG5cdCAgICAueTAodHJhY2suaGVpZ2h0KCkpO1xuXG5cdGRhdGFfcG9pbnRzID0gcG9pbnRzLmRhdGEoKTtcblx0cG9pbnRzLnJlbW92ZSgpO1xuXG5cdHRyYWNrLmdcblx0ICAgIC5hcHBlbmQoXCJwYXRoXCIpXG5cdCAgICAuYXR0cihcImNsYXNzXCIsIFwidG50X2FyZWFcIilcblx0ICAgIC5jbGFzc2VkKFwidG50X2VsZW1cIiwgdHJ1ZSlcblx0ICAgIC5kYXR1bShkYXRhX3BvaW50cylcblx0ICAgIC5hdHRyKFwiZFwiLCBhcmVhKVxuXHQgICAgLmF0dHIoXCJmaWxsXCIsIGQzLnJnYihmZWF0dXJlLmZvcmVncm91bmRfY29sb3IoKSkuYnJpZ2h0ZXIoKSk7XG5cbiAgICB9KTtcblxuICAgIHZhciBsaW5lX21vdmVyID0gZmVhdHVyZS5tb3ZlcigpO1xuICAgIGZlYXR1cmUubW92ZXIgKGZ1bmN0aW9uIChwYXRoLCB4U2NhbGUpIHtcblx0dmFyIHRyYWNrID0gdGhpcztcblx0bGluZV9tb3Zlci5jYWxsKHRyYWNrLCBwYXRoLCB4U2NhbGUpO1xuXG5cdGFyZWEueChsaW5lLngoKSk7XG5cdHRyYWNrLmdcblx0ICAgIC5zZWxlY3QoXCIudG50X2FyZWFcIilcblx0ICAgIC5kYXR1bShkYXRhX3BvaW50cylcblx0ICAgIC5hdHRyKFwiZFwiLCBhcmVhKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBmZWF0dXJlO1xuXG59O1xuXG50bnRfZmVhdHVyZS5saW5lID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmZWF0dXJlID0gdG50X2ZlYXR1cmUoKTtcblxuICAgIHZhciB4ID0gZnVuY3Rpb24gKGQpIHtcblx0cmV0dXJuIGQucG9zO1xuICAgIH07XG4gICAgdmFyIHkgPSBmdW5jdGlvbiAoZCkge1xuXHRyZXR1cm4gZC52YWw7XG4gICAgfTtcbiAgICB2YXIgdGVuc2lvbiA9IDAuNztcbiAgICB2YXIgeVNjYWxlID0gZDMuc2NhbGUubGluZWFyKCk7XG4gICAgdmFyIGxpbmUgPSBkMy5zdmcubGluZSgpXG5cdC5pbnRlcnBvbGF0ZShcImJhc2lzXCIpO1xuXG4gICAgLy8gbGluZSBnZXR0ZXIuIFRPRE86IFNldHRlcj9cbiAgICBmZWF0dXJlLmxpbmUgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiBsaW5lO1xuICAgIH07XG5cbiAgICBmZWF0dXJlLnggPSBmdW5jdGlvbiAoY2Jhaykge1xuXHRpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcblx0ICAgIHJldHVybiB4O1xuXHR9XG5cdHggPSBjYmFrO1xuXHRyZXR1cm4gZmVhdHVyZTtcbiAgICB9O1xuXG4gICAgZmVhdHVyZS55ID0gZnVuY3Rpb24gKGNiYWspIHtcblx0aWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG5cdCAgICByZXR1cm4geTtcblx0fVxuXHR5ID0gY2Jhaztcblx0cmV0dXJuIGZlYXR1cmU7XG4gICAgfTtcblxuICAgIGZlYXR1cmUudGVuc2lvbiA9IGZ1bmN0aW9uICh0KSB7XG5cdGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuXHQgICAgcmV0dXJuIHRlbnNpb247XG5cdH1cblx0dGVuc2lvbiA9IHQ7XG5cdHJldHVybiBmZWF0dXJlO1xuICAgIH07XG5cbiAgICB2YXIgZGF0YV9wb2ludHM7XG5cbiAgICAvLyBGb3Igbm93LCBjcmVhdGUgaXMgYSBvbmUtb2ZmIGV2ZW50XG4gICAgLy8gVE9ETzogTWFrZSBpdCB3b3JrIHdpdGggcGFydGlhbCBwYXRocywgaWUuIGNyZWF0aW5nIGFuZCBkaXNwbGF5aW5nIG9ubHkgdGhlIHBhdGggdGhhdCBpcyBiZWluZyBkaXNwbGF5ZWRcbiAgICBmZWF0dXJlLmNyZWF0ZSAoZnVuY3Rpb24gKHBvaW50cywgeFNjYWxlKSB7XG5cdHZhciB0cmFjayA9IHRoaXM7XG5cblx0aWYgKGRhdGFfcG9pbnRzICE9PSB1bmRlZmluZWQpIHtcblx0ICAgIC8vIHJldHVybjtcblx0ICAgIHRyYWNrLmcuc2VsZWN0KFwicGF0aFwiKS5yZW1vdmUoKTtcblx0fVxuXG5cdGxpbmVcblx0ICAgIC50ZW5zaW9uKHRlbnNpb24pXG5cdCAgICAueChmdW5jdGlvbiAoZCkge1xuXHRcdHJldHVybiB4U2NhbGUoeChkKSk7XG5cdCAgICB9KVxuXHQgICAgLnkoZnVuY3Rpb24gKGQpIHtcblx0XHRyZXR1cm4gdHJhY2suaGVpZ2h0KCkgLSB5U2NhbGUoeShkKSk7XG5cdCAgICB9KVxuXG5cdGRhdGFfcG9pbnRzID0gcG9pbnRzLmRhdGEoKTtcblx0cG9pbnRzLnJlbW92ZSgpO1xuXG5cdHlTY2FsZVxuXHQgICAgLmRvbWFpbihbMCwgMV0pXG5cdCAgICAvLyAuZG9tYWluKFswLCBkMy5tYXgoZGF0YV9wb2ludHMsIGZ1bmN0aW9uIChkKSB7XG5cdCAgICAvLyBcdHJldHVybiB5KGQpO1xuXHQgICAgLy8gfSldKVxuXHQgICAgLnJhbmdlKFswLCB0cmFjay5oZWlnaHQoKSAtIDJdKTtcblxuXHR0cmFjay5nXG5cdCAgICAuYXBwZW5kKFwicGF0aFwiKVxuXHQgICAgLmF0dHIoXCJjbGFzc1wiLCBcInRudF9lbGVtXCIpXG5cdCAgICAuYXR0cihcImRcIiwgbGluZShkYXRhX3BvaW50cykpXG5cdCAgICAuc3R5bGUoXCJzdHJva2VcIiwgZmVhdHVyZS5mb3JlZ3JvdW5kX2NvbG9yKCkpXG5cdCAgICAuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwgNClcblx0ICAgIC5zdHlsZShcImZpbGxcIiwgXCJub25lXCIpO1xuXG4gICAgfSk7XG5cbiAgICBmZWF0dXJlLm1vdmVyIChmdW5jdGlvbiAocGF0aCwgeFNjYWxlKSB7XG5cdHZhciB0cmFjayA9IHRoaXM7XG5cblx0bGluZS54KGZ1bmN0aW9uIChkKSB7XG5cdCAgICByZXR1cm4geFNjYWxlKHgoZCkpXG5cdH0pO1xuXHR0cmFjay5nLnNlbGVjdChcInBhdGhcIilcblx0ICAgIC5hdHRyKFwiZFwiLCBsaW5lKGRhdGFfcG9pbnRzKSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZmVhdHVyZTtcbn07XG5cbnRudF9mZWF0dXJlLmNvbnNlcnZhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAnSW5oZXJpdCcgZnJvbSBmZWF0dXJlLmFyZWFcbiAgICB2YXIgZmVhdHVyZSA9IHRudF9mZWF0dXJlLmFyZWEoKTtcblxuICAgIHZhciBhcmVhX2NyZWF0ZSA9IGZlYXR1cmUuY3JlYXRlKCk7IC8vIFdlICdzYXZlJyBhcmVhIGNyZWF0aW9uXG4gICAgZmVhdHVyZS5jcmVhdGUgIChmdW5jdGlvbiAocG9pbnRzLCB4U2NhbGUpIHtcblx0dmFyIHRyYWNrID0gdGhpcztcblxuXHRhcmVhX2NyZWF0ZS5jYWxsKHRyYWNrLCBkMy5zZWxlY3QocG9pbnRzWzBdWzBdKSwgeFNjYWxlKVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGZlYXR1cmU7XG59O1xuXG50bnRfZmVhdHVyZS5lbnNlbWJsID0gZnVuY3Rpb24gKCkge1xuICAgIC8vICdJbmhlcml0JyBmcm9tIGJvYXJkLnRyYWNrLmZlYXR1cmVcbiAgICB2YXIgZmVhdHVyZSA9IHRudF9mZWF0dXJlKCk7XG5cbiAgICB2YXIgZm9yZWdyb3VuZF9jb2xvcjIgPSBcIiM3RkZGMDBcIjtcbiAgICB2YXIgZm9yZWdyb3VuZF9jb2xvcjMgPSBcIiMwMEJCMDBcIjtcblxuICAgIGZlYXR1cmUuZ3VpZGVyIChmdW5jdGlvbiAod2lkdGgpIHtcblx0dmFyIHRyYWNrID0gdGhpcztcblx0dmFyIGhlaWdodF9vZmZzZXQgPSB+fih0cmFjay5oZWlnaHQoKSAtICh0cmFjay5oZWlnaHQoKSAgKiAwLjgpKSAvIDI7XG5cblx0dHJhY2suZ1xuXHQgICAgLmFwcGVuZChcImxpbmVcIilcblx0ICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0bnRfZ3VpZGVyXCIpXG5cdCAgICAuYXR0cihcIngxXCIsIDApXG5cdCAgICAuYXR0cihcIngyXCIsIHdpZHRoKVxuXHQgICAgLmF0dHIoXCJ5MVwiLCBoZWlnaHRfb2Zmc2V0KVxuXHQgICAgLmF0dHIoXCJ5MlwiLCBoZWlnaHRfb2Zmc2V0KVxuXHQgICAgLnN0eWxlKFwic3Ryb2tlXCIsIGZlYXR1cmUuZm9yZWdyb3VuZF9jb2xvcigpKVxuXHQgICAgLnN0eWxlKFwic3Ryb2tlLXdpZHRoXCIsIDEpO1xuXG5cdHRyYWNrLmdcblx0ICAgIC5hcHBlbmQoXCJsaW5lXCIpXG5cdCAgICAuYXR0cihcImNsYXNzXCIsIFwidG50X2d1aWRlclwiKVxuXHQgICAgLmF0dHIoXCJ4MVwiLCAwKVxuXHQgICAgLmF0dHIoXCJ4MlwiLCB3aWR0aClcblx0ICAgIC5hdHRyKFwieTFcIiwgdHJhY2suaGVpZ2h0KCkgLSBoZWlnaHRfb2Zmc2V0KVxuXHQgICAgLmF0dHIoXCJ5MlwiLCB0cmFjay5oZWlnaHQoKSAtIGhlaWdodF9vZmZzZXQpXG5cdCAgICAuc3R5bGUoXCJzdHJva2VcIiwgZmVhdHVyZS5mb3JlZ3JvdW5kX2NvbG9yKCkpXG5cdCAgICAuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwgMSk7XG5cbiAgICB9KTtcblxuICAgIGZlYXR1cmUuY3JlYXRlIChmdW5jdGlvbiAobmV3X2VsZW1zLCB4U2NhbGUpIHtcblx0dmFyIHRyYWNrID0gdGhpcztcblxuXHR2YXIgaGVpZ2h0X29mZnNldCA9IH5+KHRyYWNrLmhlaWdodCgpIC0gKHRyYWNrLmhlaWdodCgpICAqIDAuOCkpIC8gMjtcblxuXHRuZXdfZWxlbXNcblx0ICAgIC5hcHBlbmQoXCJyZWN0XCIpXG5cdCAgICAuYXR0cihcInhcIiwgZnVuY3Rpb24gKGQpIHtcblx0XHRyZXR1cm4geFNjYWxlIChkLnN0YXJ0KTtcblx0ICAgIH0pXG5cdCAgICAuYXR0cihcInlcIiwgaGVpZ2h0X29mZnNldClcbi8vIFx0ICAgIC5hdHRyKFwicnhcIiwgMylcbi8vIFx0ICAgIC5hdHRyKFwicnlcIiwgMylcblx0ICAgIC5hdHRyKFwid2lkdGhcIiwgZnVuY3Rpb24gKGQpIHtcblx0XHRyZXR1cm4gKHhTY2FsZShkLmVuZCkgLSB4U2NhbGUoZC5zdGFydCkpO1xuXHQgICAgfSlcblx0ICAgIC5hdHRyKFwiaGVpZ2h0XCIsIHRyYWNrLmhlaWdodCgpIC0gfn4oaGVpZ2h0X29mZnNldCAqIDIpKVxuXHQgICAgLmF0dHIoXCJmaWxsXCIsIHRyYWNrLmJhY2tncm91bmRfY29sb3IoKSlcblx0ICAgIC50cmFuc2l0aW9uKClcblx0ICAgIC5kdXJhdGlvbig1MDApXG5cdCAgICAuYXR0cihcImZpbGxcIiwgZnVuY3Rpb24gKGQpIHtcblx0XHRpZiAoZC50eXBlID09PSAnaGlnaCcpIHtcblx0XHQgICAgcmV0dXJuIGQzLnJnYihmZWF0dXJlLmZvcmVncm91bmRfY29sb3IoKSk7XG5cdFx0fVxuXHRcdGlmIChkLnR5cGUgPT09ICdsb3cnKSB7XG5cdFx0ICAgIHJldHVybiBkMy5yZ2IoZmVhdHVyZS5mb3JlZ3JvdW5kX2NvbG9yMigpKTtcblx0XHR9XG5cdFx0cmV0dXJuIGQzLnJnYihmZWF0dXJlLmZvcmVncm91bmRfY29sb3IzKCkpO1xuXHQgICAgfSk7XG4gICAgfSk7XG5cbiAgICBmZWF0dXJlLnVwZGF0ZXIgKGZ1bmN0aW9uIChibG9ja3MsIHhTY2FsZSkge1xuXHRibG9ja3Ncblx0ICAgIC5zZWxlY3QoXCJyZWN0XCIpXG5cdCAgICAuYXR0cihcIndpZHRoXCIsIGZ1bmN0aW9uIChkKSB7XG5cdFx0cmV0dXJuICh4U2NhbGUoZC5lbmQpIC0geFNjYWxlKGQuc3RhcnQpKVxuXHQgICAgfSk7XG4gICAgfSk7XG5cbiAgICBmZWF0dXJlLm1vdmVyIChmdW5jdGlvbiAoYmxvY2tzLCB4U2NhbGUpIHtcblx0YmxvY2tzXG5cdCAgICAuc2VsZWN0KFwicmVjdFwiKVxuXHQgICAgLmF0dHIoXCJ4XCIsIGZ1bmN0aW9uIChkKSB7XG5cdFx0cmV0dXJuIHhTY2FsZShkLnN0YXJ0KTtcblx0ICAgIH0pXG5cdCAgICAuYXR0cihcIndpZHRoXCIsIGZ1bmN0aW9uIChkKSB7XG5cdFx0cmV0dXJuICh4U2NhbGUoZC5lbmQpIC0geFNjYWxlKGQuc3RhcnQpKTtcblx0ICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZmVhdHVyZS5mb3JlZ3JvdW5kX2NvbG9yMiA9IGZ1bmN0aW9uIChjb2wpIHtcblx0aWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG5cdCAgICByZXR1cm4gZm9yZWdyb3VuZF9jb2xvcjI7XG5cdH1cblx0Zm9yZWdyb3VuZF9jb2xvcjIgPSBjb2w7XG5cdHJldHVybiBmZWF0dXJlO1xuICAgIH07XG5cbiAgICBmZWF0dXJlLmZvcmVncm91bmRfY29sb3IzID0gZnVuY3Rpb24gKGNvbCkge1xuXHRpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcblx0ICAgIHJldHVybiBmb3JlZ3JvdW5kX2NvbG9yMztcblx0fVxuXHRmb3JlZ3JvdW5kX2NvbG9yMyA9IGNvbDtcblx0cmV0dXJuIGZlYXR1cmU7XG4gICAgfTtcblxuICAgIHJldHVybiBmZWF0dXJlO1xufTtcblxudG50X2ZlYXR1cmUudmxpbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gJ0luaGVyaXQnIGZyb20gZmVhdHVyZVxuICAgIHZhciBmZWF0dXJlID0gdG50X2ZlYXR1cmUoKTtcblxuICAgIGZlYXR1cmUuY3JlYXRlIChmdW5jdGlvbiAobmV3X2VsZW1zLCB4U2NhbGUpIHtcblx0dmFyIHRyYWNrID0gdGhpcztcblx0bmV3X2VsZW1zXG5cdCAgICAuYXBwZW5kIChcImxpbmVcIilcblx0ICAgIC5hdHRyKFwieDFcIiwgZnVuY3Rpb24gKGQpIHtcblx0XHQvLyBUT0RPOiBTaG91bGQgdXNlIHRoZSBpbmRleCB2YWx1ZT9cblx0XHRyZXR1cm4geFNjYWxlKGZlYXR1cmUuaW5kZXgoKShkKSlcblx0ICAgIH0pXG5cdCAgICAuYXR0cihcIngyXCIsIGZ1bmN0aW9uIChkKSB7XG5cdFx0cmV0dXJuIHhTY2FsZShmZWF0dXJlLmluZGV4KCkoZCkpXG5cdCAgICB9KVxuXHQgICAgLmF0dHIoXCJ5MVwiLCAwKVxuXHQgICAgLmF0dHIoXCJ5MlwiLCB0cmFjay5oZWlnaHQoKSlcblx0ICAgIC5hdHRyKFwic3Ryb2tlXCIsIGZlYXR1cmUuZm9yZWdyb3VuZF9jb2xvcigpKVxuXHQgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMSk7XG4gICAgfSk7XG5cbiAgICBmZWF0dXJlLm1vdmVyIChmdW5jdGlvbiAodmxpbmVzLCB4U2NhbGUpIHtcblx0dmxpbmVzXG5cdCAgICAuc2VsZWN0KFwibGluZVwiKVxuXHQgICAgLmF0dHIoXCJ4MVwiLCBmdW5jdGlvbiAoZCkge1xuXHRcdHJldHVybiB4U2NhbGUoZmVhdHVyZS5pbmRleCgpKGQpKTtcblx0ICAgIH0pXG5cdCAgICAuYXR0cihcIngyXCIsIGZ1bmN0aW9uIChkKSB7XG5cdFx0cmV0dXJuIHhTY2FsZShmZWF0dXJlLmluZGV4KCkoZCkpO1xuXHQgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZmVhdHVyZTtcblxufTtcblxudG50X2ZlYXR1cmUucGluID0gZnVuY3Rpb24gKCkge1xuICAgIC8vICdJbmhlcml0JyBmcm9tIGJvYXJkLnRyYWNrLmZlYXR1cmVcbiAgICB2YXIgZmVhdHVyZSA9IHRudF9mZWF0dXJlKCk7XG5cbiAgICB2YXIgeVNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcblx0LmRvbWFpbihbMCwwXSlcblx0LnJhbmdlKFswLDBdKTtcblxuICAgIHZhciBvcHRzID0ge1xuXHRwb3MgOiBkMy5mdW5jdG9yKFwicG9zXCIpLFxuXHR2YWwgOiBkMy5mdW5jdG9yKFwidmFsXCIpLFxuXHRkb21haW4gOiBbMCwwXVxuICAgIH07XG5cbiAgICB2YXIgcGluX2JhbGxfciA9IDU7IC8vIHRoZSByYWRpdXMgb2YgdGhlIGNpcmNsZSBpbiB0aGUgcGluXG5cbiAgICBhcGlqcyhmZWF0dXJlKVxuXHQuZ2V0c2V0KG9wdHMpO1xuXG5cbiAgICBmZWF0dXJlLmNyZWF0ZSAoZnVuY3Rpb24gKG5ld19waW5zLCB4U2NhbGUpIHtcblx0dmFyIHRyYWNrID0gdGhpcztcblx0eVNjYWxlXG5cdCAgICAuZG9tYWluKGZlYXR1cmUuZG9tYWluKCkpXG5cdCAgICAucmFuZ2UoW3Bpbl9iYWxsX3IsIHRyYWNrLmhlaWdodCgpLXBpbl9iYWxsX3JdKTtcblxuXHQvLyBwaW5zIGFyZSBjb21wb3NlZCBvZiBsaW5lcyBhbmQgY2lyY2xlc1xuXHRuZXdfcGluc1xuXHQgICAgLmFwcGVuZChcImxpbmVcIilcblx0ICAgIC5hdHRyKFwieDFcIiwgZnVuY3Rpb24gKGQsIGkpIHtcblx0ICAgIFx0cmV0dXJuIHhTY2FsZShkW29wdHMucG9zKGQsIGkpXSlcblx0ICAgIH0pXG5cdCAgICAuYXR0cihcInkxXCIsIGZ1bmN0aW9uIChkKSB7XG5cdCAgICBcdHJldHVybiB0cmFjay5oZWlnaHQoKTtcblx0ICAgIH0pXG5cdCAgICAuYXR0cihcIngyXCIsIGZ1bmN0aW9uIChkLGkpIHtcblx0ICAgIFx0cmV0dXJuIHhTY2FsZShkW29wdHMucG9zKGQsIGkpXSk7XG5cdCAgICB9KVxuXHQgICAgLmF0dHIoXCJ5MlwiLCBmdW5jdGlvbiAoZCwgaSkge1xuXHQgICAgXHRyZXR1cm4gdHJhY2suaGVpZ2h0KCkgLSB5U2NhbGUoZFtvcHRzLnZhbChkLCBpKV0pO1xuXHQgICAgfSlcblx0ICAgIC5hdHRyKFwic3Ryb2tlXCIsIGZlYXR1cmUuZm9yZWdyb3VuZF9jb2xvcigpKTtcblxuXHRuZXdfcGluc1xuXHQgICAgLmFwcGVuZChcImNpcmNsZVwiKVxuXHQgICAgLmF0dHIoXCJjeFwiLCBmdW5jdGlvbiAoZCwgaSkge1xuXHRcdHJldHVybiB4U2NhbGUoZFtvcHRzLnBvcyhkLCBpKV0pO1xuXHQgICAgfSlcblx0ICAgIC5hdHRyKFwiY3lcIiwgZnVuY3Rpb24gKGQsIGkpIHtcblx0XHRyZXR1cm4gdHJhY2suaGVpZ2h0KCkgLSB5U2NhbGUoZFtvcHRzLnZhbChkLCBpKV0pO1xuXHQgICAgfSlcblx0ICAgIC5hdHRyKFwiclwiLCBwaW5fYmFsbF9yKVxuXHQgICAgLmF0dHIoXCJmaWxsXCIsIGZlYXR1cmUuZm9yZWdyb3VuZF9jb2xvcigpKTtcbiAgICB9KTtcblxuICAgIGZlYXR1cmUubW92ZXIoZnVuY3Rpb24gKHBpbnMsIHhTY2FsZSkge1xuXHR2YXIgdHJhY2sgPSB0aGlzO1xuXHRwaW5zXG5cdCAgICAvLy5lYWNoKHBvc2l0aW9uX3Bpbl9saW5lKVxuXHQgICAgLnNlbGVjdChcImxpbmVcIilcblx0ICAgIC5hdHRyKFwieDFcIiwgZnVuY3Rpb24gKGQsIGkpIHtcblx0XHRyZXR1cm4geFNjYWxlKGRbb3B0cy5wb3MoZCwgaSldKVxuXHQgICAgfSlcblx0ICAgIC5hdHRyKFwieTFcIiwgZnVuY3Rpb24gKGQpIHtcblx0XHRyZXR1cm4gdHJhY2suaGVpZ2h0KCk7XG5cdCAgICB9KVxuXHQgICAgLmF0dHIoXCJ4MlwiLCBmdW5jdGlvbiAoZCxpKSB7XG5cdFx0cmV0dXJuIHhTY2FsZShkW29wdHMucG9zKGQsIGkpXSk7XG5cdCAgICB9KVxuXHQgICAgLmF0dHIoXCJ5MlwiLCBmdW5jdGlvbiAoZCwgaSkge1xuXHRcdHJldHVybiB0cmFjay5oZWlnaHQoKSAtIHlTY2FsZShkW29wdHMudmFsKGQsIGkpXSk7XG5cdCAgICB9KTtcblxuXHRwaW5zXG5cdCAgICAuc2VsZWN0KFwiY2lyY2xlXCIpXG5cdCAgICAuYXR0cihcImN4XCIsIGZ1bmN0aW9uIChkLCBpKSB7XG5cdFx0cmV0dXJuIHhTY2FsZShkW29wdHMucG9zKGQsIGkpXSk7XG5cdCAgICB9KVxuXHQgICAgLmF0dHIoXCJjeVwiLCBmdW5jdGlvbiAoZCwgaSkge1xuXHRcdHJldHVybiB0cmFjay5oZWlnaHQoKSAtIHlTY2FsZShkW29wdHMudmFsKGQsIGkpXSk7XG5cdCAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgZmVhdHVyZS5ndWlkZXIgKGZ1bmN0aW9uICh3aWR0aCkge1xuXHR2YXIgdHJhY2sgPSB0aGlzO1xuXHR0cmFjay5nXG5cdCAgICAuYXBwZW5kKFwibGluZVwiKVxuXHQgICAgLmF0dHIoXCJ4MVwiLCAwKVxuXHQgICAgLmF0dHIoXCJ4MlwiLCB3aWR0aClcblx0ICAgIC5hdHRyKFwieTFcIiwgdHJhY2suaGVpZ2h0KCkpXG5cdCAgICAuYXR0cihcInkyXCIsIHRyYWNrLmhlaWdodCgpKVxuXHQgICAgLnN0eWxlKFwic3Ryb2tlXCIsIFwiYmxhY2tcIilcblx0ICAgIC5zdHlsZShcInN0cm9rZS13aXRoXCIsIFwiMXB4XCIpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGZlYXR1cmU7XG59O1xuXG50bnRfZmVhdHVyZS5ibG9jayA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAnSW5oZXJpdCcgZnJvbSBib2FyZC50cmFjay5mZWF0dXJlXG4gICAgdmFyIGZlYXR1cmUgPSB0bnRfZmVhdHVyZSgpO1xuXG4gICAgYXBpanMoZmVhdHVyZSlcblx0LmdldHNldCgnZnJvbScsIGZ1bmN0aW9uIChkKSB7XG5cdCAgICByZXR1cm4gZC5zdGFydDtcblx0fSlcblx0LmdldHNldCgndG8nLCBmdW5jdGlvbiAoZCkge1xuXHQgICAgcmV0dXJuIGQuZW5kO1xuXHR9KTtcblxuICAgIGZlYXR1cmUuY3JlYXRlKGZ1bmN0aW9uIChuZXdfZWxlbXMsIHhTY2FsZSkge1xuXHR2YXIgdHJhY2sgPSB0aGlzO1xuXHRuZXdfZWxlbXNcblx0ICAgIC5hcHBlbmQoXCJyZWN0XCIpXG5cdCAgICAuYXR0cihcInhcIiwgZnVuY3Rpb24gKGQsIGkpIHtcblx0XHQvLyBUT0RPOiBzdGFydCwgZW5kIHNob3VsZCBiZSBhZGp1c3RhYmxlIHZpYSB0aGUgdHJhY2tzIEFQSVxuXHRcdHJldHVybiB4U2NhbGUoZmVhdHVyZS5mcm9tKCkoZCwgaSkpO1xuXHQgICAgfSlcblx0ICAgIC5hdHRyKFwieVwiLCAwKVxuXHQgICAgLmF0dHIoXCJ3aWR0aFwiLCBmdW5jdGlvbiAoZCwgaSkge1xuXHRcdHJldHVybiAoeFNjYWxlKGZlYXR1cmUudG8oKShkLCBpKSkgLSB4U2NhbGUoZmVhdHVyZS5mcm9tKCkoZCwgaSkpKTtcblx0ICAgIH0pXG5cdCAgICAuYXR0cihcImhlaWdodFwiLCB0cmFjay5oZWlnaHQoKSlcblx0ICAgIC5hdHRyKFwiZmlsbFwiLCB0cmFjay5iYWNrZ3JvdW5kX2NvbG9yKCkpXG5cdCAgICAudHJhbnNpdGlvbigpXG5cdCAgICAuZHVyYXRpb24oNTAwKVxuXHQgICAgLmF0dHIoXCJmaWxsXCIsIGZ1bmN0aW9uIChkKSB7XG5cdFx0aWYgKGQuY29sb3IgPT09IHVuZGVmaW5lZCkge1xuXHRcdCAgICByZXR1cm4gZmVhdHVyZS5mb3JlZ3JvdW5kX2NvbG9yKCk7XG5cdFx0fSBlbHNlIHtcblx0XHQgICAgcmV0dXJuIGQuY29sb3I7XG5cdFx0fVxuXHQgICAgfSk7XG4gICAgfSk7XG5cbiAgICBmZWF0dXJlLnVwZGF0ZXIoZnVuY3Rpb24gKGVsZW1zLCB4U2NhbGUpIHtcblx0ZWxlbXNcblx0ICAgIC5zZWxlY3QoXCJyZWN0XCIpXG5cdCAgICAuYXR0cihcIndpZHRoXCIsIGZ1bmN0aW9uIChkKSB7XG5cdFx0cmV0dXJuICh4U2NhbGUoZC5lbmQpIC0geFNjYWxlKGQuc3RhcnQpKTtcblx0ICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZmVhdHVyZS5tb3ZlcihmdW5jdGlvbiAoYmxvY2tzLCB4U2NhbGUpIHtcblx0YmxvY2tzXG5cdCAgICAuc2VsZWN0KFwicmVjdFwiKVxuXHQgICAgLmF0dHIoXCJ4XCIsIGZ1bmN0aW9uIChkKSB7XG5cdFx0cmV0dXJuIHhTY2FsZShkLnN0YXJ0KTtcblx0ICAgIH0pXG5cdCAgICAuYXR0cihcIndpZHRoXCIsIGZ1bmN0aW9uIChkKSB7XG5cdFx0cmV0dXJuICh4U2NhbGUoZC5lbmQpIC0geFNjYWxlKGQuc3RhcnQpKTtcblx0ICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGZlYXR1cmU7XG5cbn07XG5cbnRudF9mZWF0dXJlLmF4aXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHhBeGlzO1xuICAgIHZhciBvcmllbnRhdGlvbiA9IFwidG9wXCI7XG5cbiAgICAvLyBBeGlzIGRvZXNuJ3QgaW5oZXJpdCBmcm9tIGZlYXR1cmVcbiAgICB2YXIgZmVhdHVyZSA9IHt9O1xuICAgIGZlYXR1cmUucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG5cdHhBeGlzID0gdW5kZWZpbmVkO1xuXHR2YXIgdHJhY2sgPSB0aGlzO1xuXHR0cmFjay5nLnNlbGVjdEFsbChcInJlY3RcIikucmVtb3ZlKCk7XG5cdHRyYWNrLmcuc2VsZWN0QWxsKFwiLnRpY2tcIikucmVtb3ZlKCk7XG4gICAgfTtcbiAgICBmZWF0dXJlLnBsb3QgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICBmZWF0dXJlLm1vdmUgPSBmdW5jdGlvbiAoKSB7XG5cdHZhciB0cmFjayA9IHRoaXM7XG5cdHZhciBzdmdfZyA9IHRyYWNrLmc7XG5cdHN2Z19nLmNhbGwoeEF4aXMpO1xuICAgIH1cblxuICAgIGZlYXR1cmUuaW5pdCA9IGZ1bmN0aW9uICgpIHt9O1xuXG4gICAgZmVhdHVyZS51cGRhdGUgPSBmdW5jdGlvbiAoeFNjYWxlKSB7XG5cdC8vIENyZWF0ZSBBeGlzIGlmIGl0IGRvZXNuJ3QgZXhpc3Rcblx0aWYgKHhBeGlzID09PSB1bmRlZmluZWQpIHtcblx0ICAgIHhBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdC5zY2FsZSh4U2NhbGUpXG5cdFx0Lm9yaWVudChvcmllbnRhdGlvbik7XG5cdH1cblxuXHR2YXIgdHJhY2sgPSB0aGlzO1xuXHR2YXIgc3ZnX2cgPSB0cmFjay5nO1xuXHRzdmdfZy5jYWxsKHhBeGlzKTtcbiAgICB9O1xuXG4gICAgZmVhdHVyZS5vcmllbnRhdGlvbiA9IGZ1bmN0aW9uIChwb3MpIHtcblx0aWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG5cdCAgICByZXR1cm4gb3JpZW50YXRpb247XG5cdH1cblx0b3JpZW50YXRpb24gPSBwb3M7XG5cdHJldHVybiBmZWF0dXJlO1xuICAgIH07XG5cbiAgICByZXR1cm4gZmVhdHVyZTtcbn07XG5cbnRudF9mZWF0dXJlLmxvY2F0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByb3c7XG5cbiAgICB2YXIgZmVhdHVyZSA9IHt9O1xuICAgIGZlYXR1cmUucmVzZXQgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICBmZWF0dXJlLnBsb3QgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICBmZWF0dXJlLmluaXQgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICBmZWF0dXJlLm1vdmUgPSBmdW5jdGlvbih4U2NhbGUpIHtcblx0dmFyIGRvbWFpbiA9IHhTY2FsZS5kb21haW4oKTtcblx0cm93LnNlbGVjdChcInRleHRcIilcblx0ICAgIC50ZXh0KFwiTG9jYXRpb246IFwiICsgfn5kb21haW5bMF0gKyBcIi1cIiArIH5+ZG9tYWluWzFdKTtcbiAgICB9O1xuXG4gICAgZmVhdHVyZS51cGRhdGUgPSBmdW5jdGlvbiAoeFNjYWxlKSB7XG5cdHZhciB0cmFjayA9IHRoaXM7XG5cdHZhciBzdmdfZyA9IHRyYWNrLmc7XG5cdHZhciBkb21haW4gPSB4U2NhbGUuZG9tYWluKCk7XG5cdGlmIChyb3cgPT09IHVuZGVmaW5lZCkge1xuXHQgICAgcm93ID0gc3ZnX2c7XG5cdCAgICByb3dcblx0XHQuYXBwZW5kKFwidGV4dFwiKVxuXHRcdC50ZXh0KFwiTG9jYXRpb246IFwiICsgfn5kb21haW5bMF0gKyBcIi1cIiArIH5+ZG9tYWluWzFdKTtcblx0fVxuICAgIH07XG5cbiAgICByZXR1cm4gZmVhdHVyZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IHRudF9mZWF0dXJlO1xuIiwidmFyIGJvYXJkID0gcmVxdWlyZSAoXCIuL2JvYXJkLmpzXCIpO1xuYm9hcmQudHJhY2sgPSByZXF1aXJlIChcIi4vdHJhY2tcIik7XG5ib2FyZC50cmFjay5kYXRhID0gcmVxdWlyZSAoXCIuL2RhdGEuanNcIik7XG5ib2FyZC50cmFjay5sYXlvdXQgPSByZXF1aXJlIChcIi4vbGF5b3V0LmpzXCIpO1xuYm9hcmQudHJhY2suZmVhdHVyZSA9IHJlcXVpcmUgKFwiLi9mZWF0dXJlLmpzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBib2FyZDtcbiIsInZhciBhcGlqcyA9IHJlcXVpcmUgKFwidG50LmFwaVwiKTtcblxuLy8gdmFyIGJvYXJkID0ge307XG4vLyBib2FyZC50cmFjayA9IHt9O1xubGF5b3V0ID0ge307XG5cbmxheW91dC5pZGVudGl0eSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyB2YXJzIGV4cG9zZWQgaW4gdGhlIEFQSTpcbiAgICB2YXIgZWxlbWVudHM7XG5cbiAgICAvLyBUaGUgcmV0dXJuZWQgY2xvc3VyZSAvIG9iamVjdFxuICAgIHZhciBsID0gZnVuY3Rpb24gKG5ld19lbGVtZW50cykge1xuXHRlbGVtZW50cyA9IG5ld19lbGVtZW50cztcbiAgICB9XG5cbiAgICB2YXIgYXBpID0gYXBpanMgKGwpXG5cdC5tZXRob2QgKHtcblx0ICAgIGhlaWdodCAgIDogZnVuY3Rpb24gKCkge30sXG5cdCAgICBlbGVtZW50cyA6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gZWxlbWVudHM7XG5cdCAgICB9XG5cdH0pO1xuXG4gICAgcmV0dXJuIGw7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBsYXlvdXQ7XG4iLCJ2YXIgYXBpanMgPSByZXF1aXJlIChcInRudC5hcGlcIik7XG52YXIgaXRlcmF0b3IgPSByZXF1aXJlKFwidG50LnV0aWxzXCIpLml0ZXJhdG9yO1xuXG4vL3ZhciBib2FyZCA9IHt9O1xuXG52YXIgdHJhY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICB2YXIgcmVhZF9jb25mID0ge1xuXHQvLyBVbmlxdWUgSUQgZm9yIHRoaXMgdHJhY2tcblx0aWQgOiB0cmFjay5pZCgpXG4gICAgfTtcblxuICAgIHZhciBkaXNwbGF5O1xuXG4gICAgdmFyIGNvbmYgPSB7XG5cdC8vIGZvcmVncm91bmRfY29sb3IgOiBkMy5yZ2IoJyMwMDAwMDAnKSxcblx0YmFja2dyb3VuZF9jb2xvciA6IGQzLnJnYignI0NDQ0NDQycpLFxuXHRoZWlnaHQgICAgICAgICAgIDogMjUwLFxuXHQvLyBkYXRhIGlzIHRoZSBvYmplY3QgKG5vcm1hbGx5IGEgdG50LnRyYWNrLmRhdGEgb2JqZWN0KSB1c2VkIHRvIHJldHJpZXZlIGFuZCB1cGRhdGUgZGF0YSBmb3IgdGhlIHRyYWNrXG5cdGRhdGEgICAgICAgICAgICAgOiB0cmFjay5kYXRhLmVtcHR5KClcbiAgICB9O1xuXG4gICAgLy8gVGhlIHJldHVybmVkIG9iamVjdCAvIGNsb3N1cmVcbiAgICB2YXIgXyA9IGZ1bmN0aW9uKCkge1xuICAgIH07XG5cbiAgICAvLyBBUElcbiAgICB2YXIgYXBpID0gYXBpanMgKF8pXG5cdC5nZXRzZXQgKGNvbmYpXG5cdC5nZXQgKHJlYWRfY29uZik7XG5cbiAgICAvLyBUT0RPOiBUaGlzIG1lYW5zIHRoYXQgaGVpZ2h0IHNob3VsZCBiZSBkZWZpbmVkIGJlZm9yZSBkaXNwbGF5XG4gICAgLy8gd2Ugc2hvdWxkbid0IHJlbHkgb24gdGhpc1xuICAgIF8uZGlzcGxheSA9IGZ1bmN0aW9uIChuZXdfcGxvdHRlcikge1xuXHRpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcblx0ICAgIHJldHVybiBkaXNwbGF5O1xuXHR9XG5cdGRpc3BsYXkgPSBuZXdfcGxvdHRlcjtcblx0aWYgKHR5cGVvZiAoZGlzcGxheSkgPT09ICdmdW5jdGlvbicpIHtcblx0ICAgIGRpc3BsYXkubGF5b3V0ICYmIGRpc3BsYXkubGF5b3V0KCkuaGVpZ2h0KGNvbmYuaGVpZ2h0KTtcdCAgICBcblx0fSBlbHNlIHtcblx0ICAgIGZvciAodmFyIGtleSBpbiBkaXNwbGF5KSB7XG5cdFx0aWYgKGRpc3BsYXkuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdCAgICBkaXNwbGF5W2tleV0ubGF5b3V0ICYmIGRpc3BsYXlba2V5XS5sYXlvdXQoKS5oZWlnaHQoY29uZi5oZWlnaHQpO1xuXHRcdH1cblx0ICAgIH1cblx0fVxuXG5cdHJldHVybiBfO1xuICAgIH07XG5cbiAgICByZXR1cm4gXztcblxufTtcblxudHJhY2suaWQgPSBpdGVyYXRvcigxKTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gdHJhY2s7XG4iXX0=
