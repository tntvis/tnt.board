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
		    .attr("transform", "translate(0," + h + ")");
	    } else {
		track.g
		    .attr("transform", "translate(0," + h + ")");
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
	create   : function () {throw "create_elem is not defined in the base feature object"},
	mover    : function () {throw "move_elem is not defined in the base feature object"},
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
		})
	} else { // Indexing by position in array
	    vis_elems = vis_sel
		.data(data_elems)
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

    // API
    apijs (features)
	.method ({
	    reset  : reset,
	    update : update,
	    move   : move,
	    init   : init,
	    add    : add
	});


    return features;
};

tnt_feature.sequence = function () {
    // 'Inherit' from tnt.track.feature
    var feature = tnt_feature();

    var config = {
	fontsize : 10,
	sequence : function (d) {
	    return d.sequence
	}
    };

    var api = apijs (feature)
	.getset (config);


    feature.create (function (new_nts, xScale) {
	var track = this;

	new_nts
	    .append("text")
	    .attr("fill", track.background_color())
	    .style('font-size', config.fontsize + "px")
	    .attr("x", function (d) {
		return xScale (d.pos);
	    })
	    .attr("y", function (d) {
		return ~~(track.height() / 2) + 5; 
	    })
	    .text(config.sequence)
	    .transition()
	    .duration(500)
	    .attr('fill', feature.foreground_color());
    });

    feature.mover (function (nts, xScale) {
	nts.select ("text")
	    .attr("x", function (d) {
		return xScale(d.pos);
	    });
    });

    return feature;
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
	    .x(function (d) {return xScale(x(d))})
	    .y(function (d) {return track.height() - yScale(y(d))})

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
	var height_offset = ~~(track.height() - (track.height()  * .8)) / 2;

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

	var height_offset = ~~(track.height() - (track.height()  * .8)) / 2;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9waWduYXRlbGxpL3NyYy9yZXBvcy90bnQuYm9hcmQvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3BpZ25hdGVsbGkvc3JjL3JlcG9zL3RudC5ib2FyZC9mYWtlXzZjMWEwYjExLmpzIiwiL1VzZXJzL3BpZ25hdGVsbGkvc3JjL3JlcG9zL3RudC5ib2FyZC9pbmRleC5qcyIsIi9Vc2Vycy9waWduYXRlbGxpL3NyYy9yZXBvcy90bnQuYm9hcmQvbm9kZV9tb2R1bGVzL3RudC5hcGkvaW5kZXguanMiLCIvVXNlcnMvcGlnbmF0ZWxsaS9zcmMvcmVwb3MvdG50LmJvYXJkL25vZGVfbW9kdWxlcy90bnQuYXBpL3NyYy9hcGkuanMiLCIvVXNlcnMvcGlnbmF0ZWxsaS9zcmMvcmVwb3MvdG50LmJvYXJkL25vZGVfbW9kdWxlcy90bnQudXRpbHMvaW5kZXguanMiLCIvVXNlcnMvcGlnbmF0ZWxsaS9zcmMvcmVwb3MvdG50LmJvYXJkL25vZGVfbW9kdWxlcy90bnQudXRpbHMvc3JjL2luZGV4LmpzIiwiL1VzZXJzL3BpZ25hdGVsbGkvc3JjL3JlcG9zL3RudC5ib2FyZC9ub2RlX21vZHVsZXMvdG50LnV0aWxzL3NyYy9yZWR1Y2UuanMiLCIvVXNlcnMvcGlnbmF0ZWxsaS9zcmMvcmVwb3MvdG50LmJvYXJkL25vZGVfbW9kdWxlcy90bnQudXRpbHMvc3JjL3V0aWxzLmpzIiwiL1VzZXJzL3BpZ25hdGVsbGkvc3JjL3JlcG9zL3RudC5ib2FyZC9zcmMvYm9hcmQuanMiLCIvVXNlcnMvcGlnbmF0ZWxsaS9zcmMvcmVwb3MvdG50LmJvYXJkL3NyYy9kYXRhLmpzIiwiL1VzZXJzL3BpZ25hdGVsbGkvc3JjL3JlcG9zL3RudC5ib2FyZC9zcmMvZmVhdHVyZS5qcyIsIi9Vc2Vycy9waWduYXRlbGxpL3NyYy9yZXBvcy90bnQuYm9hcmQvc3JjL2luZGV4LmpzIiwiL1VzZXJzL3BpZ25hdGVsbGkvc3JjL3JlcG9zL3RudC5ib2FyZC9zcmMvbGF5b3V0LmpzIiwiL1VzZXJzL3BpZ25hdGVsbGkvc3JjL3JlcG9zL3RudC5ib2FyZC9zcmMvdHJhY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyaUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImlmICh0eXBlb2YgdG50ID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB0bnQgPSB7fTtcbn1cblxudG50LmJvYXJkID0gcmVxdWlyZShcIi4vaW5kZXguanNcIik7XG4iLCIvLyBpZiAodHlwZW9mIHRudCA9PT0gXCJ1bmRlZmluZWRcIikge1xuLy8gICAgIG1vZHVsZS5leHBvcnRzID0gdG50ID0ge31cbi8vIH1cbi8vIHRudC51dGlscyA9IHJlcXVpcmUoXCJ0bnQudXRpbHNcIik7XG4vLyB0bnQudG9vbHRpcCA9IHJlcXVpcmUoXCJ0bnQudG9vbHRpcFwiKTtcbi8vIHRudC5ib2FyZCA9IHJlcXVpcmUoXCIuL3NyYy9pbmRleC5qc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9zcmMvaW5kZXhcIik7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL3NyYy9hcGkuanNcIik7XG4iLCJ2YXIgYXBpID0gZnVuY3Rpb24gKHdobykge1xuXG4gICAgdmFyIF9tZXRob2RzID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgbSA9IFtdO1xuXG5cdG0uYWRkX2JhdGNoID0gZnVuY3Rpb24gKG9iaikge1xuXHQgICAgbS51bnNoaWZ0KG9iaik7XG5cdH07XG5cblx0bS51cGRhdGUgPSBmdW5jdGlvbiAobWV0aG9kLCB2YWx1ZSkge1xuXHQgICAgZm9yICh2YXIgaT0wOyBpPG0ubGVuZ3RoOyBpKyspIHtcblx0XHRmb3IgKHZhciBwIGluIG1baV0pIHtcblx0XHQgICAgaWYgKHAgPT09IG1ldGhvZCkge1xuXHRcdFx0bVtpXVtwXSA9IHZhbHVlO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0ICAgIH1cblx0XHR9XG5cdCAgICB9XG5cdCAgICByZXR1cm4gZmFsc2U7XG5cdH07XG5cblx0bS5hZGQgPSBmdW5jdGlvbiAobWV0aG9kLCB2YWx1ZSkge1xuXHQgICAgaWYgKG0udXBkYXRlIChtZXRob2QsIHZhbHVlKSApIHtcblx0ICAgIH0gZWxzZSB7XG5cdFx0dmFyIHJlZyA9IHt9O1xuXHRcdHJlZ1ttZXRob2RdID0gdmFsdWU7XG5cdFx0bS5hZGRfYmF0Y2ggKHJlZyk7XG5cdCAgICB9XG5cdH07XG5cblx0bS5nZXQgPSBmdW5jdGlvbiAobWV0aG9kKSB7XG5cdCAgICBmb3IgKHZhciBpPTA7IGk8bS5sZW5ndGg7IGkrKykge1xuXHRcdGZvciAodmFyIHAgaW4gbVtpXSkge1xuXHRcdCAgICBpZiAocCA9PT0gbWV0aG9kKSB7XG5cdFx0XHRyZXR1cm4gbVtpXVtwXTtcblx0XHQgICAgfVxuXHRcdH1cblx0ICAgIH1cblx0fTtcblxuXHRyZXR1cm4gbTtcbiAgICB9O1xuXG4gICAgdmFyIG1ldGhvZHMgICAgPSBfbWV0aG9kcygpO1xuICAgIHZhciBhcGkgPSBmdW5jdGlvbiAoKSB7fTtcblxuICAgIGFwaS5jaGVjayA9IGZ1bmN0aW9uIChtZXRob2QsIGNoZWNrLCBtc2cpIHtcblx0aWYgKG1ldGhvZCBpbnN0YW5jZW9mIEFycmF5KSB7XG5cdCAgICBmb3IgKHZhciBpPTA7IGk8bWV0aG9kLmxlbmd0aDsgaSsrKSB7XG5cdFx0YXBpLmNoZWNrKG1ldGhvZFtpXSwgY2hlY2ssIG1zZyk7XG5cdCAgICB9XG5cdCAgICByZXR1cm47XG5cdH1cblxuXHRpZiAodHlwZW9mIChtZXRob2QpID09PSAnZnVuY3Rpb24nKSB7XG5cdCAgICBtZXRob2QuY2hlY2soY2hlY2ssIG1zZyk7XG5cdH0gZWxzZSB7XG5cdCAgICB3aG9bbWV0aG9kXS5jaGVjayhjaGVjaywgbXNnKTtcblx0fVxuXHRyZXR1cm4gYXBpO1xuICAgIH07XG5cbiAgICBhcGkudHJhbnNmb3JtID0gZnVuY3Rpb24gKG1ldGhvZCwgY2Jhaykge1xuXHRpZiAobWV0aG9kIGluc3RhbmNlb2YgQXJyYXkpIHtcblx0ICAgIGZvciAodmFyIGk9MDsgaTxtZXRob2QubGVuZ3RoOyBpKyspIHtcblx0XHRhcGkudHJhbnNmb3JtIChtZXRob2RbaV0sIGNiYWspO1xuXHQgICAgfVxuXHQgICAgcmV0dXJuO1xuXHR9XG5cblx0aWYgKHR5cGVvZiAobWV0aG9kKSA9PT0gJ2Z1bmN0aW9uJykge1xuXHQgICAgbWV0aG9kLnRyYW5zZm9ybSAoY2Jhayk7XG5cdH0gZWxzZSB7XG5cdCAgICB3aG9bbWV0aG9kXS50cmFuc2Zvcm0oY2Jhayk7XG5cdH1cblx0cmV0dXJuIGFwaTtcbiAgICB9O1xuXG4gICAgdmFyIGF0dGFjaF9tZXRob2QgPSBmdW5jdGlvbiAobWV0aG9kLCBvcHRzKSB7XG5cdHZhciBjaGVja3MgPSBbXTtcblx0dmFyIHRyYW5zZm9ybXMgPSBbXTtcblxuXHR2YXIgZ2V0dGVyID0gb3B0cy5vbl9nZXR0ZXIgfHwgZnVuY3Rpb24gKCkge1xuXHQgICAgcmV0dXJuIG1ldGhvZHMuZ2V0KG1ldGhvZCk7XG5cdH07XG5cblx0dmFyIHNldHRlciA9IG9wdHMub25fc2V0dGVyIHx8IGZ1bmN0aW9uICh4KSB7XG5cdCAgICBmb3IgKHZhciBpPTA7IGk8dHJhbnNmb3Jtcy5sZW5ndGg7IGkrKykge1xuXHRcdHggPSB0cmFuc2Zvcm1zW2ldKHgpO1xuXHQgICAgfVxuXG5cdCAgICBmb3IgKHZhciBqPTA7IGo8Y2hlY2tzLmxlbmd0aDsgaisrKSB7XG5cdFx0aWYgKCFjaGVja3Nbal0uY2hlY2soeCkpIHtcblx0XHQgICAgdmFyIG1zZyA9IGNoZWNrc1tqXS5tc2cgfHwgXG5cdFx0XHQoXCJWYWx1ZSBcIiArIHggKyBcIiBkb2Vzbid0IHNlZW0gdG8gYmUgdmFsaWQgZm9yIHRoaXMgbWV0aG9kXCIpO1xuXHRcdCAgICB0aHJvdyAobXNnKTtcblx0XHR9XG5cdCAgICB9XG5cdCAgICBtZXRob2RzLmFkZChtZXRob2QsIHgpO1xuXHR9O1xuXG5cdHZhciBuZXdfbWV0aG9kID0gZnVuY3Rpb24gKG5ld192YWwpIHtcblx0ICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuXHRcdHJldHVybiBnZXR0ZXIoKTtcblx0ICAgIH1cblx0ICAgIHNldHRlcihuZXdfdmFsKTtcblx0ICAgIHJldHVybiB3aG87IC8vIFJldHVybiB0aGlzP1xuXHR9O1xuXHRuZXdfbWV0aG9kLmNoZWNrID0gZnVuY3Rpb24gKGNiYWssIG1zZykge1xuXHQgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0cmV0dXJuIGNoZWNrcztcblx0ICAgIH1cblx0ICAgIGNoZWNrcy5wdXNoICh7Y2hlY2sgOiBjYmFrLFxuXHRcdFx0ICBtc2cgICA6IG1zZ30pO1xuXHQgICAgcmV0dXJuIHRoaXM7XG5cdH07XG5cdG5ld19tZXRob2QudHJhbnNmb3JtID0gZnVuY3Rpb24gKGNiYWspIHtcblx0ICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuXHRcdHJldHVybiB0cmFuc2Zvcm1zO1xuXHQgICAgfVxuXHQgICAgdHJhbnNmb3Jtcy5wdXNoKGNiYWspO1xuXHQgICAgcmV0dXJuIHRoaXM7XG5cdH07XG5cblx0d2hvW21ldGhvZF0gPSBuZXdfbWV0aG9kO1xuICAgIH07XG5cbiAgICB2YXIgZ2V0c2V0ID0gZnVuY3Rpb24gKHBhcmFtLCBvcHRzKSB7XG5cdGlmICh0eXBlb2YgKHBhcmFtKSA9PT0gJ29iamVjdCcpIHtcblx0ICAgIG1ldGhvZHMuYWRkX2JhdGNoIChwYXJhbSk7XG5cdCAgICBmb3IgKHZhciBwIGluIHBhcmFtKSB7XG5cdFx0YXR0YWNoX21ldGhvZCAocCwgb3B0cyk7XG5cdCAgICB9XG5cdH0gZWxzZSB7XG5cdCAgICBtZXRob2RzLmFkZCAocGFyYW0sIG9wdHMuZGVmYXVsdF92YWx1ZSk7XG5cdCAgICBhdHRhY2hfbWV0aG9kIChwYXJhbSwgb3B0cyk7XG5cdH1cbiAgICB9O1xuXG4gICAgYXBpLmdldHNldCA9IGZ1bmN0aW9uIChwYXJhbSwgZGVmKSB7XG5cdGdldHNldChwYXJhbSwge2RlZmF1bHRfdmFsdWUgOiBkZWZ9KTtcblxuXHRyZXR1cm4gYXBpO1xuICAgIH07XG5cbiAgICBhcGkuZ2V0ID0gZnVuY3Rpb24gKHBhcmFtLCBkZWYpIHtcblx0dmFyIG9uX3NldHRlciA9IGZ1bmN0aW9uICgpIHtcblx0ICAgIHRocm93IChcIk1ldGhvZCBkZWZpbmVkIG9ubHkgYXMgYSBnZXR0ZXIgKHlvdSBhcmUgdHJ5aW5nIHRvIHVzZSBpdCBhcyBhIHNldHRlclwiKTtcblx0fTtcblxuXHRnZXRzZXQocGFyYW0sIHtkZWZhdWx0X3ZhbHVlIDogZGVmLFxuXHRcdCAgICAgICBvbl9zZXR0ZXIgOiBvbl9zZXR0ZXJ9XG5cdCAgICAgICk7XG5cblx0cmV0dXJuIGFwaTtcbiAgICB9O1xuXG4gICAgYXBpLnNldCA9IGZ1bmN0aW9uIChwYXJhbSwgZGVmKSB7XG5cdHZhciBvbl9nZXR0ZXIgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICB0aHJvdyAoXCJNZXRob2QgZGVmaW5lZCBvbmx5IGFzIGEgc2V0dGVyICh5b3UgYXJlIHRyeWluZyB0byB1c2UgaXQgYXMgYSBnZXR0ZXJcIik7XG5cdH07XG5cblx0Z2V0c2V0KHBhcmFtLCB7ZGVmYXVsdF92YWx1ZSA6IGRlZixcblx0XHQgICAgICAgb25fZ2V0dGVyIDogb25fZ2V0dGVyfVxuXHQgICAgICApO1xuXG5cdHJldHVybiBhcGk7XG4gICAgfTtcblxuICAgIGFwaS5tZXRob2QgPSBmdW5jdGlvbiAobmFtZSwgY2Jhaykge1xuXHRpZiAodHlwZW9mIChuYW1lKSA9PT0gJ29iamVjdCcpIHtcblx0ICAgIGZvciAodmFyIHAgaW4gbmFtZSkge1xuXHRcdHdob1twXSA9IG5hbWVbcF07XG5cdCAgICB9XG5cdH0gZWxzZSB7XG5cdCAgICB3aG9bbmFtZV0gPSBjYmFrO1xuXHR9XG5cdHJldHVybiBhcGk7XG4gICAgfTtcblxuICAgIHJldHVybiBhcGk7XG4gICAgXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBhcGk7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9zcmMvaW5kZXguanNcIik7XG4iLCIvLyByZXF1aXJlKCdmcycpLnJlYWRkaXJTeW5jKF9fZGlybmFtZSArICcvJykuZm9yRWFjaChmdW5jdGlvbihmaWxlKSB7XG4vLyAgICAgaWYgKGZpbGUubWF0Y2goLy4rXFwuanMvZykgIT09IG51bGwgJiYgZmlsZSAhPT0gX19maWxlbmFtZSkge1xuLy8gXHR2YXIgbmFtZSA9IGZpbGUucmVwbGFjZSgnLmpzJywgJycpO1xuLy8gXHRtb2R1bGUuZXhwb3J0c1tuYW1lXSA9IHJlcXVpcmUoJy4vJyArIGZpbGUpO1xuLy8gICAgIH1cbi8vIH0pO1xuXG4vLyBTYW1lIGFzXG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi91dGlscy5qc1wiKTtcbnV0aWxzLnJlZHVjZSA9IHJlcXVpcmUoXCIuL3JlZHVjZS5qc1wiKTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IHV0aWxzO1xuIiwidmFyIHJlZHVjZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc21vb3RoID0gNTtcbiAgICB2YXIgdmFsdWUgPSAndmFsJztcbiAgICB2YXIgcmVkdW5kYW50ID0gZnVuY3Rpb24gKGEsIGIpIHtcblx0aWYgKGEgPCBiKSB7XG5cdCAgICByZXR1cm4gKChiLWEpIDw9IChiICogMC4yKSk7XG5cdH1cblx0cmV0dXJuICgoYS1iKSA8PSAoYSAqIDAuMikpO1xuICAgIH07XG4gICAgdmFyIHBlcmZvcm1fcmVkdWNlID0gZnVuY3Rpb24gKGFycikge3JldHVybiBhcnI7fTtcblxuICAgIHZhciByZWR1Y2UgPSBmdW5jdGlvbiAoYXJyKSB7XG5cdGlmICghYXJyLmxlbmd0aCkge1xuXHQgICAgcmV0dXJuIGFycjtcblx0fVxuXHR2YXIgc21vb3RoZWQgPSBwZXJmb3JtX3Ntb290aChhcnIpO1xuXHR2YXIgcmVkdWNlZCAgPSBwZXJmb3JtX3JlZHVjZShzbW9vdGhlZCk7XG5cdHJldHVybiByZWR1Y2VkO1xuICAgIH07XG5cbiAgICB2YXIgbWVkaWFuID0gZnVuY3Rpb24gKHYsIGFycikge1xuXHRhcnIuc29ydChmdW5jdGlvbiAoYSwgYikge1xuXHQgICAgcmV0dXJuIGFbdmFsdWVdIC0gYlt2YWx1ZV07XG5cdH0pO1xuXHRpZiAoYXJyLmxlbmd0aCAlIDIpIHtcblx0ICAgIHZbdmFsdWVdID0gYXJyW35+KGFyci5sZW5ndGggLyAyKV1bdmFsdWVdO1x0ICAgIFxuXHR9IGVsc2Uge1xuXHQgICAgdmFyIG4gPSB+fihhcnIubGVuZ3RoIC8gMikgLSAxO1xuXHQgICAgdlt2YWx1ZV0gPSAoYXJyW25dW3ZhbHVlXSArIGFycltuKzFdW3ZhbHVlXSkgLyAyO1xuXHR9XG5cblx0cmV0dXJuIHY7XG4gICAgfTtcblxuICAgIHZhciBjbG9uZSA9IGZ1bmN0aW9uIChzb3VyY2UpIHtcblx0dmFyIHRhcmdldCA9IHt9O1xuXHRmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuXHQgICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuXHRcdHRhcmdldFtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcblx0ICAgIH1cblx0fVxuXHRyZXR1cm4gdGFyZ2V0O1xuICAgIH07XG5cbiAgICB2YXIgcGVyZm9ybV9zbW9vdGggPSBmdW5jdGlvbiAoYXJyKSB7XG5cdGlmIChzbW9vdGggPT09IDApIHsgLy8gbm8gc21vb3RoXG5cdCAgICByZXR1cm4gYXJyO1xuXHR9XG5cdHZhciBzbW9vdGhfYXJyID0gW107XG5cdGZvciAodmFyIGk9MDsgaTxhcnIubGVuZ3RoOyBpKyspIHtcblx0ICAgIHZhciBsb3cgPSAoaSA8IHNtb290aCkgPyAwIDogKGkgLSBzbW9vdGgpO1xuXHQgICAgdmFyIGhpZ2ggPSAoaSA+IChhcnIubGVuZ3RoIC0gc21vb3RoKSkgPyBhcnIubGVuZ3RoIDogKGkgKyBzbW9vdGgpO1xuXHQgICAgc21vb3RoX2FycltpXSA9IG1lZGlhbihjbG9uZShhcnJbaV0pLCBhcnIuc2xpY2UobG93LGhpZ2grMSkpO1xuXHR9XG5cdHJldHVybiBzbW9vdGhfYXJyO1xuICAgIH07XG5cbiAgICByZWR1Y2UucmVkdWNlciA9IGZ1bmN0aW9uIChjYmFrKSB7XG5cdGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuXHQgICAgcmV0dXJuIHBlcmZvcm1fcmVkdWNlO1xuXHR9XG5cdHBlcmZvcm1fcmVkdWNlID0gY2Jhaztcblx0cmV0dXJuIHJlZHVjZTtcbiAgICB9O1xuXG4gICAgcmVkdWNlLnJlZHVuZGFudCA9IGZ1bmN0aW9uIChjYmFrKSB7XG5cdGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuXHQgICAgcmV0dXJuIHJlZHVuZGFudDtcblx0fVxuXHRyZWR1bmRhbnQgPSBjYmFrO1xuXHRyZXR1cm4gcmVkdWNlO1xuICAgIH07XG5cbiAgICByZWR1Y2UudmFsdWUgPSBmdW5jdGlvbiAodmFsKSB7XG5cdGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuXHQgICAgcmV0dXJuIHZhbHVlO1xuXHR9XG5cdHZhbHVlID0gdmFsO1xuXHRyZXR1cm4gcmVkdWNlO1xuICAgIH07XG5cbiAgICByZWR1Y2Uuc21vb3RoID0gZnVuY3Rpb24gKHZhbCkge1xuXHRpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcblx0ICAgIHJldHVybiBzbW9vdGg7XG5cdH1cblx0c21vb3RoID0gdmFsO1xuXHRyZXR1cm4gcmVkdWNlO1xuICAgIH07XG5cbiAgICByZXR1cm4gcmVkdWNlO1xufTtcblxudmFyIGJsb2NrID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZWQgPSByZWR1Y2UoKVxuXHQudmFsdWUoJ3N0YXJ0Jyk7XG5cbiAgICB2YXIgdmFsdWUyID0gJ2VuZCc7XG5cbiAgICB2YXIgam9pbiA9IGZ1bmN0aW9uIChvYmoxLCBvYmoyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAnb2JqZWN0JyA6IHtcbiAgICAgICAgICAgICAgICAnc3RhcnQnIDogb2JqMS5vYmplY3RbcmVkLnZhbHVlKCldLFxuICAgICAgICAgICAgICAgICdlbmQnICAgOiBvYmoyW3ZhbHVlMl1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAndmFsdWUnICA6IG9iajJbdmFsdWUyXVxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICAvLyB2YXIgam9pbiA9IGZ1bmN0aW9uIChvYmoxLCBvYmoyKSB7IHJldHVybiBvYmoxIH07XG5cbiAgICByZWQucmVkdWNlciggZnVuY3Rpb24gKGFycikge1xuXHR2YXIgdmFsdWUgPSByZWQudmFsdWUoKTtcblx0dmFyIHJlZHVuZGFudCA9IHJlZC5yZWR1bmRhbnQoKTtcblx0dmFyIHJlZHVjZWRfYXJyID0gW107XG5cdHZhciBjdXJyID0ge1xuXHQgICAgJ29iamVjdCcgOiBhcnJbMF0sXG5cdCAgICAndmFsdWUnICA6IGFyclswXVt2YWx1ZTJdXG5cdH07XG5cdGZvciAodmFyIGk9MTsgaTxhcnIubGVuZ3RoOyBpKyspIHtcblx0ICAgIGlmIChyZWR1bmRhbnQgKGFycltpXVt2YWx1ZV0sIGN1cnIudmFsdWUpKSB7XG5cdFx0Y3VyciA9IGpvaW4oY3VyciwgYXJyW2ldKTtcblx0XHRjb250aW51ZTtcblx0ICAgIH1cblx0ICAgIHJlZHVjZWRfYXJyLnB1c2ggKGN1cnIub2JqZWN0KTtcblx0ICAgIGN1cnIub2JqZWN0ID0gYXJyW2ldO1xuXHQgICAgY3Vyci52YWx1ZSA9IGFycltpXS5lbmQ7XG5cdH1cblx0cmVkdWNlZF9hcnIucHVzaChjdXJyLm9iamVjdCk7XG5cblx0Ly8gcmVkdWNlZF9hcnIucHVzaChhcnJbYXJyLmxlbmd0aC0xXSk7XG5cdHJldHVybiByZWR1Y2VkX2FycjtcbiAgICB9KTtcblxuICAgIHJlZHVjZS5qb2luID0gZnVuY3Rpb24gKGNiYWspIHtcblx0aWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG5cdCAgICByZXR1cm4gam9pbjtcblx0fVxuXHRqb2luID0gY2Jhaztcblx0cmV0dXJuIHJlZDtcbiAgICB9O1xuXG4gICAgcmVkdWNlLnZhbHVlMiA9IGZ1bmN0aW9uIChmaWVsZCkge1xuXHRpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcblx0ICAgIHJldHVybiB2YWx1ZTI7XG5cdH1cblx0dmFsdWUyID0gZmllbGQ7XG5cdHJldHVybiByZWQ7XG4gICAgfTtcblxuICAgIHJldHVybiByZWQ7XG59O1xuXG52YXIgbGluZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVkID0gcmVkdWNlKCk7XG5cbiAgICByZWQucmVkdWNlciAoIGZ1bmN0aW9uIChhcnIpIHtcblx0dmFyIHJlZHVuZGFudCA9IHJlZC5yZWR1bmRhbnQoKTtcblx0dmFyIHZhbHVlID0gcmVkLnZhbHVlKCk7XG5cdHZhciByZWR1Y2VkX2FyciA9IFtdO1xuXHR2YXIgY3VyciA9IGFyclswXTtcblx0Zm9yICh2YXIgaT0xOyBpPGFyci5sZW5ndGgtMTsgaSsrKSB7XG5cdCAgICBpZiAocmVkdW5kYW50IChhcnJbaV1bdmFsdWVdLCBjdXJyW3ZhbHVlXSkpIHtcblx0XHRjb250aW51ZTtcblx0ICAgIH1cblx0ICAgIHJlZHVjZWRfYXJyLnB1c2ggKGN1cnIpO1xuXHQgICAgY3VyciA9IGFycltpXTtcblx0fVxuXHRyZWR1Y2VkX2Fyci5wdXNoKGN1cnIpO1xuXHRyZWR1Y2VkX2Fyci5wdXNoKGFyclthcnIubGVuZ3RoLTFdKTtcblx0cmV0dXJuIHJlZHVjZWRfYXJyO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlZDtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSByZWR1Y2U7XG5tb2R1bGUuZXhwb3J0cy5saW5lID0gbGluZTtcbm1vZHVsZS5leHBvcnRzLmJsb2NrID0gYmxvY2s7XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaXRlcmF0b3IgOiBmdW5jdGlvbihpbml0X3ZhbCkge1xuXHR2YXIgaSA9IGluaXRfdmFsIHx8IDA7XG5cdHZhciBpdGVyID0gZnVuY3Rpb24gKCkge1xuXHQgICAgcmV0dXJuIGkrKztcblx0fTtcblx0cmV0dXJuIGl0ZXI7XG4gICAgfSxcblxuICAgIHNjcmlwdF9wYXRoIDogZnVuY3Rpb24gKHNjcmlwdF9uYW1lKSB7IC8vIHNjcmlwdF9uYW1lIGlzIHRoZSBmaWxlbmFtZVxuXHR2YXIgc2NyaXB0X3NjYXBlZCA9IHNjcmlwdF9uYW1lLnJlcGxhY2UoL1stXFwvXFxcXF4kKis/LigpfFtcXF17fV0vZywgJ1xcXFwkJicpO1xuXHR2YXIgc2NyaXB0X3JlID0gbmV3IFJlZ0V4cChzY3JpcHRfc2NhcGVkICsgJyQnKTtcblx0dmFyIHNjcmlwdF9yZV9zdWIgPSBuZXcgUmVnRXhwKCcoLiopJyArIHNjcmlwdF9zY2FwZWQgKyAnJCcpO1xuXG5cdC8vIFRPRE86IFRoaXMgcmVxdWlyZXMgcGhhbnRvbS5qcyBvciBhIHNpbWlsYXIgaGVhZGxlc3Mgd2Via2l0IHRvIHdvcmsgKGRvY3VtZW50KVxuXHR2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKTtcblx0dmFyIHBhdGggPSBcIlwiOyAgLy8gRGVmYXVsdCB0byBjdXJyZW50IHBhdGhcblx0aWYoc2NyaXB0cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gc2NyaXB0cykge1xuXHRcdGlmKHNjcmlwdHNbaV0uc3JjICYmIHNjcmlwdHNbaV0uc3JjLm1hdGNoKHNjcmlwdF9yZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjcmlwdHNbaV0uc3JjLnJlcGxhY2Uoc2NyaXB0X3JlX3N1YiwgJyQxJyk7XG5cdFx0fVxuICAgICAgICAgICAgfVxuXHR9XG5cdHJldHVybiBwYXRoO1xuICAgIH0sXG5cbiAgICBkZWZlcl9jYW5jZWwgOiBmdW5jdGlvbiAoY2JhaywgdGltZSkge1xuXHR2YXIgdGljaztcblxuXHR2YXIgZGVmZXJfY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuXHQgICAgY2xlYXJUaW1lb3V0KHRpY2spO1xuXHQgICAgdGljayA9IHNldFRpbWVvdXQoY2JhaywgdGltZSk7XG5cdH07XG5cblx0cmV0dXJuIGRlZmVyX2NhbmNlbDtcbiAgICB9XG59O1xuIiwidmFyIGFwaWpzID0gcmVxdWlyZSAoXCJ0bnQuYXBpXCIpO1xudmFyIGRlZmVyQ2FuY2VsID0gcmVxdWlyZSAoXCJ0bnQudXRpbHNcIikuZGVmZXJfY2FuY2VsO1xuXG52YXIgYm9hcmQgPSBmdW5jdGlvbigpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBcbiAgICAvLy8vIFByaXZhdGUgdmFyc1xuICAgIHZhciBzdmc7XG4gICAgdmFyIGRpdl9pZDtcbiAgICB2YXIgdHJhY2tzID0gW107XG4gICAgdmFyIG1pbl93aWR0aCA9IDUwO1xuICAgIHZhciBoZWlnaHQgICAgPSAwOyAgICAvLyBUaGlzIGlzIHRoZSBnbG9iYWwgaGVpZ2h0IGluY2x1ZGluZyBhbGwgdGhlIHRyYWNrc1xuICAgIHZhciB3aWR0aCAgICAgPSA5MjA7XG4gICAgdmFyIGhlaWdodF9vZmZzZXQgPSAyMDtcbiAgICB2YXIgbG9jID0ge1xuXHRzcGVjaWVzICA6IHVuZGVmaW5lZCxcblx0Y2hyICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgIGZyb20gICAgIDogMCxcbiAgICAgICAgdG8gICAgICAgOiA1MDBcbiAgICB9O1xuXG4gICAgLy8gVE9ETzogV2UgaGF2ZSBub3cgYmFja2dyb3VuZCBjb2xvciBpbiB0aGUgdHJhY2tzLiBDYW4gdGhpcyBiZSByZW1vdmVkP1xuICAgIC8vIEl0IGxvb2tzIGxpa2UgaXQgaXMgdXNlZCBpbiB0aGUgdG9vLXdpZGUgcGFuZSBldGMsIGJ1dCBpdCBtYXkgbm90IGJlIG5lZWRlZCBhbnltb3JlXG4gICAgdmFyIGJnQ29sb3IgICA9IGQzLnJnYignI0Y4RkJFRicpOyAvLyNGOEZCRUZcbiAgICB2YXIgcGFuZTsgLy8gRHJhZ2dhYmxlIHBhbmVcbiAgICB2YXIgc3ZnX2c7XG4gICAgdmFyIHhTY2FsZTtcbiAgICB2YXIgem9vbUV2ZW50SGFuZGxlciA9IGQzLmJlaGF2aW9yLnpvb20oKTtcbiAgICB2YXIgbGltaXRzID0ge1xuXHRsZWZ0IDogMCxcblx0cmlnaHQgOiAxMDAwLFxuXHR6b29tX291dCA6IDEwMDAsXG5cdHpvb21faW4gIDogMTAwXG4gICAgfTtcbiAgICB2YXIgY2FwX3dpZHRoID0gMztcbiAgICB2YXIgZHVyID0gNTAwO1xuICAgIHZhciBkcmFnX2FsbG93ZWQgPSB0cnVlO1xuXG4gICAgdmFyIGV4cG9ydHMgPSB7XG5cdGVhc2UgICAgICAgICAgOiBkMy5lYXNlKFwiY3ViaWMtaW4tb3V0XCIpLFxuXHRleHRlbmRfY2FudmFzIDoge1xuXHQgICAgbGVmdCA6IDAsXG5cdCAgICByaWdodCA6IDBcblx0fSxcblx0c2hvd19mcmFtZSA6IHRydWVcblx0Ly8gbGltaXRzICAgICAgICA6IGZ1bmN0aW9uICgpIHt0aHJvdyBcIlRoZSBsaW1pdHMgbWV0aG9kIHNob3VsZCBiZSBkZWZpbmVkXCJ9XHRcbiAgICB9O1xuXG4gICAgLy8gVGhlIHJldHVybmVkIGNsb3N1cmUgLyBvYmplY3RcbiAgICB2YXIgdHJhY2tfdmlzID0gZnVuY3Rpb24oZGl2KSB7XG5cdGRpdl9pZCA9IGQzLnNlbGVjdChkaXYpLmF0dHIoXCJpZFwiKTtcblxuXHQvLyBUaGUgb3JpZ2luYWwgZGl2IGlzIGNsYXNzZWQgd2l0aCB0aGUgdG50IGNsYXNzXG5cdGQzLnNlbGVjdChkaXYpXG5cdCAgICAuY2xhc3NlZChcInRudFwiLCB0cnVlKTtcblxuXHQvLyBUT0RPOiBNb3ZlIHRoZSBzdHlsaW5nIHRvIHRoZSBzY3NzP1xuXHR2YXIgYnJvd3NlckRpdiA9IGQzLnNlbGVjdChkaXYpXG5cdCAgICAuYXBwZW5kKFwiZGl2XCIpXG5cdCAgICAuYXR0cihcImlkXCIsIFwidG50X1wiICsgZGl2X2lkKVxuXHQgICAgLnN0eWxlKFwicG9zaXRpb25cIiwgXCJyZWxhdGl2ZVwiKVxuXHQgICAgLmNsYXNzZWQoXCJ0bnRfZnJhbWVkXCIsIGV4cG9ydHMuc2hvd19mcmFtZSA/IHRydWUgOiBmYWxzZSlcblx0ICAgIC5zdHlsZShcIndpZHRoXCIsICh3aWR0aCArIGNhcF93aWR0aCoyICsgZXhwb3J0cy5leHRlbmRfY2FudmFzLnJpZ2h0ICsgZXhwb3J0cy5leHRlbmRfY2FudmFzLmxlZnQpICsgXCJweFwiKVxuXG5cdHZhciBncm91cERpdiA9IGJyb3dzZXJEaXZcblx0ICAgIC5hcHBlbmQoXCJkaXZcIilcblx0ICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0bnRfZ3JvdXBEaXZcIik7XG5cblx0Ly8gVGhlIFNWR1xuXHRzdmcgPSBncm91cERpdlxuXHQgICAgLmFwcGVuZChcInN2Z1wiKVxuXHQgICAgLmF0dHIoXCJjbGFzc1wiLCBcInRudF9zdmdcIilcblx0ICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXG5cdCAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpXG5cdCAgICAuYXR0cihcInBvaW50ZXItZXZlbnRzXCIsIFwiYWxsXCIpO1xuXG5cdHN2Z19nID0gc3ZnXG5cdCAgICAuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCwyMClcIilcbiAgICAgICAgICAgIC5hcHBlbmQoXCJnXCIpXG5cdCAgICAuYXR0cihcImNsYXNzXCIsIFwidG50X2dcIik7XG5cblx0Ly8gY2Fwc1xuXHRzdmdfZ1xuXHQgICAgLmFwcGVuZChcInJlY3RcIilcblx0ICAgIC5hdHRyKFwiaWRcIiwgXCJ0bnRfXCIgKyBkaXZfaWQgKyBcIl81cGNhcFwiKVxuXHQgICAgLmF0dHIoXCJ4XCIsIDApXG5cdCAgICAuYXR0cihcInlcIiwgMClcblx0ICAgIC5hdHRyKFwid2lkdGhcIiwgMClcblx0ICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodClcblx0ICAgIC5hdHRyKFwiZmlsbFwiLCBcInJlZFwiKTtcblx0c3ZnX2dcblx0ICAgIC5hcHBlbmQoXCJyZWN0XCIpXG5cdCAgICAuYXR0cihcImlkXCIsIFwidG50X1wiICsgZGl2X2lkICsgXCJfM3BjYXBcIilcblx0ICAgIC5hdHRyKFwieFwiLCB3aWR0aC1jYXBfd2lkdGgpXG5cdCAgICAuYXR0cihcInlcIiwgMClcblx0ICAgIC5hdHRyKFwid2lkdGhcIiwgMClcblx0ICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodClcblx0ICAgIC5hdHRyKFwiZmlsbFwiLCBcInJlZFwiKTtcblxuXHQvLyBUaGUgWm9vbWluZy9QYW5uaW5nIFBhbmVcblx0cGFuZSA9IHN2Z19nXG5cdCAgICAuYXBwZW5kKFwicmVjdFwiKVxuXHQgICAgLmF0dHIoXCJjbGFzc1wiLCBcInRudF9wYW5lXCIpXG5cdCAgICAuYXR0cihcImlkXCIsIFwidG50X1wiICsgZGl2X2lkICsgXCJfcGFuZVwiKVxuXHQgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aClcblx0ICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodClcblx0ICAgIC5zdHlsZShcImZpbGxcIiwgYmdDb2xvcik7XG5cblx0Ly8gKiogVE9ETzogV291bGRuJ3QgYmUgYmV0dGVyIHRvIGhhdmUgdGhlc2UgbWVzc2FnZXMgYnkgdHJhY2s/XG5cdC8vIHZhciB0b29XaWRlX3RleHQgPSBzdmdfZ1xuXHQvLyAgICAgLmFwcGVuZChcInRleHRcIilcblx0Ly8gICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0bnRfd2lkZU9LX3RleHRcIilcblx0Ly8gICAgIC5hdHRyKFwiaWRcIiwgXCJ0bnRfXCIgKyBkaXZfaWQgKyBcIl90b29XaWRlXCIpXG5cdC8vICAgICAuYXR0cihcImZpbGxcIiwgYmdDb2xvcilcblx0Ly8gICAgIC50ZXh0KFwiUmVnaW9uIHRvbyB3aWRlXCIpO1xuXG5cdC8vIFRPRE86IEkgZG9uJ3Qga25vdyBpZiB0aGlzIGlzIHRoZSBiZXN0IHdheSAoYW5kIHBvcnRhYmxlKSB3YXlcblx0Ly8gb2YgY2VudGVyaW5nIHRoZSB0ZXh0IGluIHRoZSB0ZXh0IGFyZWFcblx0Ly8gdmFyIGJiID0gdG9vV2lkZV90ZXh0WzBdWzBdLmdldEJCb3goKTtcblx0Ly8gdG9vV2lkZV90ZXh0XG5cdC8vICAgICAuYXR0cihcInhcIiwgfn4od2lkdGgvMiAtIGJiLndpZHRoLzIpKVxuXHQvLyAgICAgLmF0dHIoXCJ5XCIsIH5+KGhlaWdodC8yIC0gYmIuaGVpZ2h0LzIpKTtcbiAgICB9O1xuXG4gICAgLy8gQVBJXG4gICAgdmFyIGFwaSA9IGFwaWpzICh0cmFja192aXMpXG5cdC5nZXRzZXQgKGV4cG9ydHMpXG5cdC5nZXRzZXQgKGxpbWl0cylcblx0LmdldHNldCAobG9jKTtcblxuICAgIGFwaS50cmFuc2Zvcm0gKHRyYWNrX3Zpcy5leHRlbmRfY2FudmFzLCBmdW5jdGlvbiAodmFsKSB7XG5cdHZhciBwcmV2X3ZhbCA9IHRyYWNrX3Zpcy5leHRlbmRfY2FudmFzKCk7XG5cdHZhbC5sZWZ0ID0gdmFsLmxlZnQgfHwgcHJldl92YWwubGVmdDtcblx0dmFsLnJpZ2h0ID0gdmFsLnJpZ2h0IHx8IHByZXZfdmFsLnJpZ2h0O1xuXHRyZXR1cm4gdmFsO1xuICAgIH0pO1xuXG4gICAgLy8gdHJhY2tfdmlzIGFsd2F5cyBzdGFydHMgb24gbG9jLmZyb20gJiBsb2MudG9cbiAgICBhcGkubWV0aG9kICgnc3RhcnQnLCBmdW5jdGlvbiAoKSB7XG5cblx0Ly8gUmVzZXQgdGhlIHRyYWNrc1xuXHRmb3IgKHZhciBpPTA7IGk8dHJhY2tzLmxlbmd0aDsgaSsrKSB7XG5cdCAgICBpZiAodHJhY2tzW2ldLmcpIHtcblx0XHR0cmFja3NbaV0uZGlzcGxheSgpLnJlc2V0LmNhbGwodHJhY2tzW2ldKTtcblx0ICAgIH1cblx0ICAgIF9pbml0X3RyYWNrKHRyYWNrc1tpXSk7XG5cdH1cblxuXHRfcGxhY2VfdHJhY2tzKCk7XG5cblx0Ly8gVGhlIGNvbnRpbnVhdGlvbiBjYWxsYmFja1xuXHR2YXIgY29udCA9IGZ1bmN0aW9uIChyZXNwKSB7XG5cdCAgICBsaW1pdHMucmlnaHQgPSByZXNwO1xuXG5cdCAgICAvLyB6b29tRXZlbnRIYW5kbGVyLnhFeHRlbnQoW2xpbWl0cy5sZWZ0LCBsaW1pdHMucmlnaHRdKTtcblx0ICAgIGlmICgobG9jLnRvIC0gbG9jLmZyb20pIDwgbGltaXRzLnpvb21faW4pIHtcblx0XHRpZiAoKGxvYy5mcm9tICsgbGltaXRzLnpvb21faW4pID4gbGltaXRzLnpvb21faW4pIHtcblx0XHQgICAgbG9jLnRvID0gbGltaXRzLnJpZ2h0O1xuXHRcdH0gZWxzZSB7XG5cdFx0ICAgIGxvYy50byA9IGxvYy5mcm9tICsgbGltaXRzLnpvb21faW47XG5cdFx0fVxuXHQgICAgfVxuXHQgICAgcGxvdCgpO1xuXG5cdCAgICBmb3IgKHZhciBpPTA7IGk8dHJhY2tzLmxlbmd0aDsgaSsrKSB7XG5cdFx0X3VwZGF0ZV90cmFjayh0cmFja3NbaV0sIGxvYyk7XG5cdCAgICB9XG5cdH07XG5cblx0Ly8gSWYgbGltaXRzLnJpZ2h0IGlzIGEgZnVuY3Rpb24sIHdlIGhhdmUgdG8gY2FsbCBpdCBhc3luY2hyb25vdXNseSBhbmRcblx0Ly8gdGhlbiBzdGFydGluZyB0aGUgcGxvdCBvbmNlIHdlIGhhdmUgc2V0IHRoZSByaWdodCBsaW1pdCAocGxvdClcblx0Ly8gSWYgbm90LCB3ZSBhc3N1bWUgdGhhdCBpdCBpcyBhbiBvYmpldCB3aXRoIG5ldyAobWF5YmUgcGFydGlhbGx5IGRlZmluZWQpXG5cdC8vIGRlZmluaXRpb25zIG9mIHRoZSBsaW1pdHMgYW5kIHdlIGNhbiBwbG90IGRpcmVjdGx5XG5cdC8vIFRPRE86IFJpZ2h0IG5vdywgb25seSByaWdodCBjYW4gYmUgY2FsbGVkIGFzIGFuIGFzeW5jIGZ1bmN0aW9uIHdoaWNoIGlzIHdlYWtcblx0aWYgKHR5cGVvZiAobGltaXRzLnJpZ2h0KSA9PT0gJ2Z1bmN0aW9uJykge1xuXHQgICAgbGltaXRzLnJpZ2h0KGNvbnQpO1xuXHR9IGVsc2Uge1xuXHQgICAgY29udChsaW1pdHMucmlnaHQpO1xuXHR9XG5cbiAgICB9KTtcblxuICAgIGFwaS5tZXRob2QgKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XG5cdGZvciAodmFyIGk9MDsgaTx0cmFja3MubGVuZ3RoOyBpKyspIHtcblx0ICAgIF91cGRhdGVfdHJhY2sgKHRyYWNrc1tpXSk7XG5cdH1cblxuICAgIH0pO1xuXG4gICAgdmFyIF91cGRhdGVfdHJhY2sgPSBmdW5jdGlvbiAodHJhY2ssIHdoZXJlKSB7XG5cdGlmICh0cmFjay5kYXRhKCkpIHtcblx0ICAgIHZhciB0cmFja19kYXRhID0gdHJhY2suZGF0YSgpO1xuXHQgICAgdmFyIGRhdGFfdXBkYXRlciA9IHRyYWNrX2RhdGEudXBkYXRlKCk7XG5cdCAgICAvL3ZhciBkYXRhX3VwZGF0ZXIgPSB0cmFjay5kYXRhKCkudXBkYXRlKCk7XG5cdCAgICBkYXRhX3VwZGF0ZXIuY2FsbCh0cmFja19kYXRhLCB7XG5cdFx0J2xvYycgOiB3aGVyZSxcblx0XHQnb25fc3VjY2VzcycgOiBmdW5jdGlvbiAoKSB7XG5cdFx0ICAgIHRyYWNrLmRpc3BsYXkoKS51cGRhdGUuY2FsbCh0cmFjaywgeFNjYWxlKTtcblx0XHR9XG5cdCAgICB9KTtcblx0fVxuICAgIH07XG5cbiAgICB2YXIgcGxvdCA9IGZ1bmN0aW9uKCkge1xuXG5cdHhTY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdCAgICAuZG9tYWluKFtsb2MuZnJvbSwgbG9jLnRvXSlcblx0ICAgIC5yYW5nZShbMCwgd2lkdGhdKTtcblxuXHRpZiAoZHJhZ19hbGxvd2VkKSB7XG5cdCAgICBzdmdfZy5jYWxsKCB6b29tRXZlbnRIYW5kbGVyXG5cdFx0ICAgICAgIC54KHhTY2FsZSlcblx0XHQgICAgICAgLnNjYWxlRXh0ZW50KFsobG9jLnRvLWxvYy5mcm9tKS8obGltaXRzLnpvb21fb3V0LTEpLCAobG9jLnRvLWxvYy5mcm9tKS9saW1pdHMuem9vbV9pbl0pXG5cdFx0ICAgICAgIC5vbihcInpvb21cIiwgX21vdmUpXG5cdFx0ICAgICApO1xuXHR9XG5cbiAgICB9O1xuXG4gICAgLy8gcmlnaHQvbGVmdC96b29tIHBhbnMgb3Igem9vbXMgdGhlIHRyYWNrLiBUaGVzZSBtZXRob2RzIGFyZSBleHBvc2VkIHRvIGFsbG93IGV4dGVybmFsIGJ1dHRvbnMsIGV0YyB0byBpbnRlcmFjdCB3aXRoIHRoZSB0cmFja3MuIFRoZSBhcmd1bWVudCBpcyB0aGUgYW1vdW50IG9mIHBhbm5pbmcvem9vbWluZyAoaWUuIDEuMiBtZWFucyAyMCUgcGFubmluZykgV2l0aCBsZWZ0L3JpZ2h0IG9ubHkgcG9zaXRpdmUgbnVtYmVycyBhcmUgYWxsb3dlZC5cbiAgICBhcGkubWV0aG9kICgnbW92ZV9yaWdodCcsIGZ1bmN0aW9uIChmYWN0b3IpIHtcblx0aWYgKGZhY3RvciA+IDApIHtcblx0ICAgIF9tYW51YWxfbW92ZShmYWN0b3IsIDEpO1xuXHR9XG4gICAgfSk7XG5cbiAgICBhcGkubWV0aG9kICgnbW92ZV9sZWZ0JywgZnVuY3Rpb24gKGZhY3Rvcikge1xuXHRpZiAoZmFjdG9yID4gMCkge1xuXHQgICAgX21hbnVhbF9tb3ZlKGZhY3RvciwgLTEpO1xuXHR9XG4gICAgfSk7XG5cbiAgICBhcGkubWV0aG9kICgnem9vbScsIGZ1bmN0aW9uIChmYWN0b3IpIHtcblx0X21hbnVhbF9tb3ZlKGZhY3RvciwgMCk7XG4gICAgfSk7XG5cbiAgICBhcGkubWV0aG9kICgnZmluZF90cmFja19ieV9pZCcsIGZ1bmN0aW9uIChpZCkge1xuXHRmb3IgKHZhciBpPTA7IGk8dHJhY2tzLmxlbmd0aDsgaSsrKSB7XG5cdCAgICBpZiAodHJhY2tzW2ldLmlkKCkgPT09IGlkKSB7XG5cdFx0cmV0dXJuIHRyYWNrc1tpXTtcblx0ICAgIH1cblx0fVxuICAgIH0pO1xuXG4gICAgYXBpLm1ldGhvZCAoJ3Jlb3JkZXInLCBmdW5jdGlvbiAobmV3X3RyYWNrcykge1xuXHQvLyBUT0RPOiBUaGlzIGlzIGRlZmluaW5nIGEgbmV3IGhlaWdodCwgYnV0IHRoZSBnbG9iYWwgaGVpZ2h0IGlzIHVzZWQgdG8gZGVmaW5lIHRoZSBzaXplIG9mIHNldmVyYWxcblx0Ly8gcGFydHMuIFdlIHNob3VsZCBkbyB0aGlzIGR5bmFtaWNhbGx5XG5cblx0Zm9yICh2YXIgaj0wOyBqPG5ld190cmFja3MubGVuZ3RoOyBqKyspIHtcblx0ICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuXHQgICAgZm9yICh2YXIgaT0wOyBpPHRyYWNrcy5sZW5ndGg7IGkrKykge1xuXHRcdGlmICh0cmFja3NbaV0uaWQoKSA9PT0gbmV3X3RyYWNrc1tqXS5pZCgpKSB7XG5cdFx0ICAgIGZvdW5kID0gdHJ1ZTtcblx0XHQgICAgdHJhY2tzLnNwbGljZShpLDEpO1xuXHRcdCAgICBicmVhaztcblx0XHR9XG5cdCAgICB9XG5cdCAgICBpZiAoIWZvdW5kKSB7XG5cdFx0X2luaXRfdHJhY2sobmV3X3RyYWNrc1tqXSk7XG5cdFx0X3VwZGF0ZV90cmFjayhuZXdfdHJhY2tzW2pdLCB7ZnJvbSA6IGxvYy5mcm9tLCB0byA6IGxvYy50b30pO1xuXHQgICAgfVxuXHR9XG5cblx0Zm9yICh2YXIgeD0wOyB4PHRyYWNrcy5sZW5ndGg7IHgrKykge1xuXHQgICAgdHJhY2tzW3hdLmcucmVtb3ZlKCk7XG5cdH1cblxuXHR0cmFja3MgPSBuZXdfdHJhY2tzO1xuXHRfcGxhY2VfdHJhY2tzKCk7XG5cbiAgICB9KTtcblxuICAgIGFwaS5tZXRob2QgKCdyZW1vdmVfdHJhY2snLCBmdW5jdGlvbiAodHJhY2spIHtcblx0dHJhY2suZy5yZW1vdmUoKTtcbiAgICB9KTtcblxuICAgIGFwaS5tZXRob2QgKCdhZGRfdHJhY2snLCBmdW5jdGlvbiAodHJhY2spIHtcblx0aWYgKHRyYWNrIGluc3RhbmNlb2YgQXJyYXkpIHtcblx0ICAgIGZvciAodmFyIGk9MDsgaTx0cmFjay5sZW5ndGg7IGkrKykge1xuXHRcdHRyYWNrX3Zpcy5hZGRfdHJhY2sgKHRyYWNrW2ldKTtcblx0ICAgIH1cblx0ICAgIHJldHVybiB0cmFja192aXM7XG5cdH1cblx0dHJhY2tzLnB1c2godHJhY2spO1xuXHRyZXR1cm4gdHJhY2tfdmlzO1xuICAgIH0pO1xuXG4gICAgYXBpLm1ldGhvZCgndHJhY2tzJywgZnVuY3Rpb24gKG5ld190cmFja3MpIHtcblx0aWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG5cdCAgICByZXR1cm4gdHJhY2tzXG5cdH1cblx0dHJhY2tzID0gbmV3X3RyYWNrcztcblx0cmV0dXJuIHRyYWNrX3ZpcztcbiAgICB9KTtcblxuICAgIC8vIFxuICAgIGFwaS5tZXRob2QgKCd3aWR0aCcsIGZ1bmN0aW9uICh3KSB7XG5cdC8vIFRPRE86IEFsbG93IHN1ZmZpeGVzIGxpa2UgXCIxMDAwcHhcIj9cblx0Ly8gVE9ETzogVGVzdCB3cm9uZyBmb3JtYXRzXG5cdGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuXHQgICAgcmV0dXJuIHdpZHRoO1xuXHR9XG5cdC8vIEF0IGxlYXN0IG1pbi13aWR0aFxuXHRpZiAodyA8IG1pbl93aWR0aCkge1xuXHQgICAgdyA9IG1pbl93aWR0aFxuXHR9XG5cblx0Ly8gV2UgYXJlIHJlc2l6aW5nXG5cdGlmIChkaXZfaWQgIT09IHVuZGVmaW5lZCkge1xuXHQgICAgZDMuc2VsZWN0KFwiI3RudF9cIiArIGRpdl9pZCkuc2VsZWN0KFwic3ZnXCIpLmF0dHIoXCJ3aWR0aFwiLCB3KTtcblx0ICAgIC8vIFJlc2l6ZSB0aGUgem9vbWluZy9wYW5uaW5nIHBhbmVcblx0ICAgIGQzLnNlbGVjdChcIiN0bnRfXCIgKyBkaXZfaWQpLnN0eWxlKFwid2lkdGhcIiwgKHBhcnNlSW50KHcpICsgY2FwX3dpZHRoKjIpICsgXCJweFwiKTtcblx0ICAgIGQzLnNlbGVjdChcIiN0bnRfXCIgKyBkaXZfaWQgKyBcIl9wYW5lXCIpLmF0dHIoXCJ3aWR0aFwiLCB3KTtcblxuXHQgICAgLy8gUmVwbG90XG5cdCAgICB3aWR0aCA9IHc7XG5cdCAgICBwbG90KCk7XG5cdCAgICBmb3IgKHZhciBpPTA7IGk8dHJhY2tzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dHJhY2tzW2ldLmcuc2VsZWN0KFwicmVjdFwiKS5hdHRyKFwid2lkdGhcIiwgdyk7XG5cdFx0dHJhY2tzW2ldLmRpc3BsYXkoKS5yZXNldC5jYWxsKHRyYWNrc1tpXSk7XG5cdFx0dHJhY2tzW2ldLmRpc3BsYXkoKS51cGRhdGUuY2FsbCh0cmFja3NbaV0seFNjYWxlKTtcblx0ICAgIH1cblx0ICAgIFxuXHR9IGVsc2Uge1xuXHQgICAgd2lkdGggPSB3O1xuXHR9XG5cdFxuXHRyZXR1cm4gdHJhY2tfdmlzO1xuICAgIH0pO1xuXG4gICAgYXBpLm1ldGhvZCgnYWxsb3dfZHJhZycsIGZ1bmN0aW9uKGIpIHtcblx0aWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG5cdCAgICByZXR1cm4gZHJhZ19hbGxvd2VkO1xuXHR9XG5cdGRyYWdfYWxsb3dlZCA9IGI7XG5cdGlmIChkcmFnX2FsbG93ZWQpIHtcblx0ICAgIC8vIFdoZW4gdGhpcyBtZXRob2QgaXMgY2FsbGVkIG9uIHRoZSBvYmplY3QgYmVmb3JlIHN0YXJ0aW5nIHRoZSBzaW11bGF0aW9uLCB3ZSBkb24ndCBoYXZlIGRlZmluZWQgeFNjYWxlXG5cdCAgICBpZiAoeFNjYWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRzdmdfZy5jYWxsKCB6b29tRXZlbnRIYW5kbGVyLngoeFNjYWxlKVxuXHRcdFx0ICAgLy8gLnhFeHRlbnQoWzAsIGxpbWl0cy5yaWdodF0pXG5cdFx0XHQgICAuc2NhbGVFeHRlbnQoWyhsb2MudG8tbG9jLmZyb20pLyhsaW1pdHMuem9vbV9vdXQtMSksIChsb2MudG8tbG9jLmZyb20pL2xpbWl0cy56b29tX2luXSlcblx0XHRcdCAgIC5vbihcInpvb21cIiwgX21vdmUpICk7XG5cdCAgICB9XG5cdH0gZWxzZSB7XG5cdCAgICAvLyBXZSBjcmVhdGUgYSBuZXcgZHVtbXkgc2NhbGUgaW4geCB0byBhdm9pZCBkcmFnZ2luZyB0aGUgcHJldmlvdXMgb25lXG5cdCAgICAvLyBUT0RPOiBUaGVyZSBtYXkgYmUgYSBjaGVhcGVyIHdheSBvZiBkb2luZyB0aGlzP1xuXHQgICAgem9vbUV2ZW50SGFuZGxlci54KGQzLnNjYWxlLmxpbmVhcigpKS5vbihcInpvb21cIiwgbnVsbCk7XG5cdH1cblx0cmV0dXJuIHRyYWNrX3ZpcztcbiAgICB9KTtcblxuICAgIHZhciBfcGxhY2VfdHJhY2tzID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgaCA9IDA7XG5cdGZvciAodmFyIGk9MDsgaTx0cmFja3MubGVuZ3RoOyBpKyspIHtcblx0ICAgIHZhciB0cmFjayA9IHRyYWNrc1tpXTtcblx0ICAgIGlmICh0cmFjay5nLmF0dHIoXCJ0cmFuc2Zvcm1cIikpIHtcblx0XHR0cmFjay5nXG5cdFx0ICAgIC50cmFuc2l0aW9uKClcblx0XHQgICAgLmR1cmF0aW9uKGR1cilcblx0XHQgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCxcIiArIGggKyBcIilcIik7XG5cdCAgICB9IGVsc2Uge1xuXHRcdHRyYWNrLmdcblx0XHQgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCxcIiArIGggKyBcIilcIik7XG5cdCAgICB9XG5cblx0ICAgIGggKz0gdHJhY2suaGVpZ2h0KCk7XG5cdH1cblxuXHQvLyBzdmdcblx0c3ZnLmF0dHIoXCJoZWlnaHRcIiwgaCArIGhlaWdodF9vZmZzZXQpO1xuXG5cdC8vIGRpdlxuXHRkMy5zZWxlY3QoXCIjdG50X1wiICsgZGl2X2lkKVxuXHQgICAgLnN0eWxlKFwiaGVpZ2h0XCIsIChoICsgMTAgKyBoZWlnaHRfb2Zmc2V0KSArIFwicHhcIik7XG5cblx0Ly8gY2Fwc1xuXHRkMy5zZWxlY3QoXCIjdG50X1wiICsgZGl2X2lkICsgXCJfNXBjYXBcIilcblx0ICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGgpXG5cdCAgICAvLyAubW92ZV90b19mcm9udCgpXG5cdCAgICAuZWFjaChmdW5jdGlvbiAoZCkge1xuXHRcdG1vdmVfdG9fZnJvbnQodGhpcyk7XG5cdCAgICB9KVxuXHRkMy5zZWxlY3QoXCIjdG50X1wiICsgZGl2X2lkICsgXCJfM3BjYXBcIilcblx0ICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGgpXG5cdC8vLm1vdmVfdG9fZnJvbnQoKVxuXHQgICAgLmVhY2ggKGZ1bmN0aW9uIChkKSB7XG5cdFx0bW92ZV90b19mcm9udCh0aGlzKTtcblx0ICAgIH0pO1xuXHRcblxuXHQvLyBwYW5lXG5cdHBhbmVcblx0ICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGggKyBoZWlnaHRfb2Zmc2V0KTtcblxuXHQvLyB0b29XaWRlX3RleHQuIFRPRE86IElzIHRoaXMgc3RpbGwgbmVlZGVkP1xuXHQvLyB2YXIgdG9vV2lkZV90ZXh0ID0gZDMuc2VsZWN0KFwiI3RudF9cIiArIGRpdl9pZCArIFwiX3Rvb1dpZGVcIik7XG5cdC8vIHZhciBiYiA9IHRvb1dpZGVfdGV4dFswXVswXS5nZXRCQm94KCk7XG5cdC8vIHRvb1dpZGVfdGV4dFxuXHQvLyAgICAgLmF0dHIoXCJ5XCIsIH5+KGgvMikgLSBiYi5oZWlnaHQvMik7XG5cblx0cmV0dXJuIHRyYWNrX3ZpcztcbiAgICB9XG5cbiAgICB2YXIgX2luaXRfdHJhY2sgPSBmdW5jdGlvbiAodHJhY2spIHtcblx0dHJhY2suZyA9IHN2Zy5zZWxlY3QoXCJnXCIpLnNlbGVjdChcImdcIilcblx0ICAgIC5hcHBlbmQoXCJnXCIpXG5cdCAgICAuYXR0cihcImNsYXNzXCIsIFwidG50X3RyYWNrXCIpXG5cdCAgICAuYXR0cihcImhlaWdodFwiLCB0cmFjay5oZWlnaHQoKSk7XG5cblx0Ly8gUmVjdCBmb3IgdGhlIGJhY2tncm91bmQgY29sb3Jcblx0dHJhY2suZ1xuXHQgICAgLmFwcGVuZChcInJlY3RcIilcblx0ICAgIC5hdHRyKFwieFwiLCAwKVxuXHQgICAgLmF0dHIoXCJ5XCIsIDApXG5cdCAgICAuYXR0cihcIndpZHRoXCIsIHRyYWNrX3Zpcy53aWR0aCgpKVxuXHQgICAgLmF0dHIoXCJoZWlnaHRcIiwgdHJhY2suaGVpZ2h0KCkpXG5cdCAgICAuc3R5bGUoXCJmaWxsXCIsIHRyYWNrLmJhY2tncm91bmRfY29sb3IoKSlcblx0ICAgIC5zdHlsZShcInBvaW50ZXItZXZlbnRzXCIsIFwibm9uZVwiKTtcblxuXHRpZiAodHJhY2suZGlzcGxheSgpKSB7XG5cdCAgICB0cmFjay5kaXNwbGF5KCkuaW5pdC5jYWxsKHRyYWNrLCB3aWR0aCk7XG5cdH1cblx0XG5cdHJldHVybiB0cmFja192aXM7XG4gICAgfTtcblxuICAgIHZhciBfbWFudWFsX21vdmUgPSBmdW5jdGlvbiAoZmFjdG9yLCBkaXJlY3Rpb24pIHtcblx0dmFyIG9sZERvbWFpbiA9IHhTY2FsZS5kb21haW4oKTtcblxuXHR2YXIgc3BhbiA9IG9sZERvbWFpblsxXSAtIG9sZERvbWFpblswXTtcblx0dmFyIG9mZnNldCA9IChzcGFuICogZmFjdG9yKSAtIHNwYW47XG5cblx0dmFyIG5ld0RvbWFpbjtcblx0c3dpdGNoIChkaXJlY3Rpb24pIHtcblx0Y2FzZSAtMSA6XG5cdCAgICBuZXdEb21haW4gPSBbKH5+b2xkRG9tYWluWzBdIC0gb2Zmc2V0KSwgfn4ob2xkRG9tYWluWzFdIC0gb2Zmc2V0KV07XG5cdCAgICBicmVhaztcblx0Y2FzZSAxIDpcblx0ICAgIG5ld0RvbWFpbiA9IFsofn5vbGREb21haW5bMF0gKyBvZmZzZXQpLCB+fihvbGREb21haW5bMV0gLSBvZmZzZXQpXTtcblx0ICAgIGJyZWFrO1xuXHRjYXNlIDAgOlxuXHQgICAgbmV3RG9tYWluID0gW29sZERvbWFpblswXSAtIH5+KG9mZnNldC8yKSwgb2xkRG9tYWluWzFdICsgKH5+b2Zmc2V0LzIpXTtcblx0fVxuXG5cdHZhciBpbnRlcnBvbGF0b3IgPSBkMy5pbnRlcnBvbGF0ZU51bWJlcihvbGREb21haW5bMF0sIG5ld0RvbWFpblswXSk7XG5cdHZhciBlYXNlID0gZXhwb3J0cy5lYXNlO1xuXG5cdHZhciB4ID0gMDtcblx0ZDMudGltZXIoZnVuY3Rpb24oKSB7XG5cdCAgICB2YXIgY3Vycl9zdGFydCA9IGludGVycG9sYXRvcihlYXNlKHgpKTtcblx0ICAgIHZhciBjdXJyX2VuZDtcblx0ICAgIHN3aXRjaCAoZGlyZWN0aW9uKSB7XG5cdCAgICBjYXNlIC0xIDpcblx0XHRjdXJyX2VuZCA9IGN1cnJfc3RhcnQgKyBzcGFuO1xuXHRcdGJyZWFrO1xuXHQgICAgY2FzZSAxIDpcblx0XHRjdXJyX2VuZCA9IGN1cnJfc3RhcnQgKyBzcGFuO1xuXHRcdGJyZWFrO1xuXHQgICAgY2FzZSAwIDpcblx0XHRjdXJyX2VuZCA9IG9sZERvbWFpblsxXSArIG9sZERvbWFpblswXSAtIGN1cnJfc3RhcnQ7XG5cdFx0YnJlYWs7XG5cdCAgICB9XG5cblx0ICAgIHZhciBjdXJyRG9tYWluID0gW2N1cnJfc3RhcnQsIGN1cnJfZW5kXTtcblx0ICAgIHhTY2FsZS5kb21haW4oY3VyckRvbWFpbik7XG5cdCAgICBfbW92ZSh4U2NhbGUpO1xuXHQgICAgeCs9MC4wMjtcblx0ICAgIHJldHVybiB4PjE7XG5cdH0pO1xuICAgIH07XG5cblxuICAgIHZhciBfbW92ZV9jYmFrID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgY3VyckRvbWFpbiA9IHhTY2FsZS5kb21haW4oKTtcblx0dHJhY2tfdmlzLmZyb20ofn5jdXJyRG9tYWluWzBdKTtcblx0dHJhY2tfdmlzLnRvKH5+Y3VyckRvbWFpblsxXSk7XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0cmFja3MubGVuZ3RoOyBpKyspIHtcblx0ICAgIHZhciB0cmFjayA9IHRyYWNrc1tpXTtcblx0ICAgIF91cGRhdGVfdHJhY2sodHJhY2ssIGxvYyk7XG5cdH1cbiAgICB9O1xuICAgIC8vIFRoZSBkZWZlcnJlZF9jYmFrIGlzIGRlZmVycmVkIGF0IGxlYXN0IHRoaXMgYW1vdW50IG9mIHRpbWUgb3IgcmUtc2NoZWR1bGVkIGlmIGRlZmVycmVkIGlzIGNhbGxlZCBiZWZvcmVcbiAgICB2YXIgX2RlZmVycmVkID0gZGVmZXJDYW5jZWwoX21vdmVfY2JhaywgMzAwKTtcblxuICAgIC8vIGFwaS5tZXRob2QoJ3VwZGF0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAvLyBcdF9tb3ZlKCk7XG4gICAgLy8gfSk7XG5cbiAgICB2YXIgX21vdmUgPSBmdW5jdGlvbiAobmV3X3hTY2FsZSkge1xuXHRpZiAobmV3X3hTY2FsZSAhPT0gdW5kZWZpbmVkICYmIGRyYWdfYWxsb3dlZCkge1xuXHQgICAgem9vbUV2ZW50SGFuZGxlci54KG5ld194U2NhbGUpO1xuXHR9XG5cblx0Ly8gU2hvdyB0aGUgcmVkIGJhcnMgYXQgdGhlIGxpbWl0c1xuXHR2YXIgZG9tYWluID0geFNjYWxlLmRvbWFpbigpO1xuXHRpZiAoZG9tYWluWzBdIDw9IDUpIHtcblx0ICAgIGQzLnNlbGVjdChcIiN0bnRfXCIgKyBkaXZfaWQgKyBcIl81cGNhcFwiKVxuXHRcdC5hdHRyKFwid2lkdGhcIiwgY2FwX3dpZHRoKVxuXHRcdC50cmFuc2l0aW9uKClcblx0XHQuZHVyYXRpb24oMjAwKVxuXHRcdC5hdHRyKFwid2lkdGhcIiwgMCk7XG5cdH1cblxuXHRpZiAoZG9tYWluWzFdID49IChsaW1pdHMucmlnaHQpLTUpIHtcblx0ICAgIGQzLnNlbGVjdChcIiN0bnRfXCIgKyBkaXZfaWQgKyBcIl8zcGNhcFwiKVxuXHRcdC5hdHRyKFwid2lkdGhcIiwgY2FwX3dpZHRoKVxuXHRcdC50cmFuc2l0aW9uKClcblx0XHQuZHVyYXRpb24oMjAwKVxuXHRcdC5hdHRyKFwid2lkdGhcIiwgMCk7XG5cdH1cblxuXG5cdC8vIEF2b2lkIG1vdmluZyBwYXN0IHRoZSBsaW1pdHNcblx0aWYgKGRvbWFpblswXSA8IGxpbWl0cy5sZWZ0KSB7XG5cdCAgICB6b29tRXZlbnRIYW5kbGVyLnRyYW5zbGF0ZShbem9vbUV2ZW50SGFuZGxlci50cmFuc2xhdGUoKVswXSAtIHhTY2FsZShsaW1pdHMubGVmdCkgKyB4U2NhbGUucmFuZ2UoKVswXSwgem9vbUV2ZW50SGFuZGxlci50cmFuc2xhdGUoKVsxXV0pO1xuXHR9IGVsc2UgaWYgKGRvbWFpblsxXSA+IGxpbWl0cy5yaWdodCkge1xuXHQgICAgem9vbUV2ZW50SGFuZGxlci50cmFuc2xhdGUoW3pvb21FdmVudEhhbmRsZXIudHJhbnNsYXRlKClbMF0gLSB4U2NhbGUobGltaXRzLnJpZ2h0KSArIHhTY2FsZS5yYW5nZSgpWzFdLCB6b29tRXZlbnRIYW5kbGVyLnRyYW5zbGF0ZSgpWzFdXSk7XG5cdH1cblxuXHRfZGVmZXJyZWQoKTtcblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHRyYWNrcy5sZW5ndGg7IGkrKykge1xuXHQgICAgdmFyIHRyYWNrID0gdHJhY2tzW2ldO1xuXHQgICAgdHJhY2suZGlzcGxheSgpLm1vdmUuY2FsbCh0cmFjayx4U2NhbGUpO1xuXHR9XG4gICAgfTtcblxuICAgIC8vIGFwaS5tZXRob2Qoe1xuICAgIC8vIFx0YWxsb3dfZHJhZyA6IGFwaV9hbGxvd19kcmFnLFxuICAgIC8vIFx0d2lkdGggICAgICA6IGFwaV93aWR0aCxcbiAgICAvLyBcdGFkZF90cmFjayAgOiBhcGlfYWRkX3RyYWNrLFxuICAgIC8vIFx0cmVvcmRlciAgICA6IGFwaV9yZW9yZGVyLFxuICAgIC8vIFx0em9vbSAgICAgICA6IGFwaV96b29tLFxuICAgIC8vIFx0bGVmdCAgICAgICA6IGFwaV9sZWZ0LFxuICAgIC8vIFx0cmlnaHQgICAgICA6IGFwaV9yaWdodCxcbiAgICAvLyBcdHN0YXJ0ICAgICAgOiBhcGlfc3RhcnRcbiAgICAvLyB9KTtcblxuICAgIC8vIEF1eGlsaWFyIGZ1bmN0aW9uc1xuICAgIGZ1bmN0aW9uIG1vdmVfdG9fZnJvbnQgKGVsZW0pIHtcblx0ZWxlbS5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGVsZW0pO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gdHJhY2tfdmlzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gYm9hcmQ7XG4iLCJ2YXIgYXBpanMgPSByZXF1aXJlIChcInRudC5hcGlcIik7XG4vLyB2YXIgZW5zZW1ibFJlc3RBUEkgPSByZXF1aXJlKFwidG50LmVuc2VtYmxcIik7XG5cbi8vIHZhciBib2FyZCA9IHt9O1xuLy8gYm9hcmQudHJhY2sgPSB7fTtcblxudmFyIGRhdGEgPSBmdW5jdGlvbigpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgXyA9IGZ1bmN0aW9uICgpIHtcbiAgICB9O1xuXG4gICAgLy8gR2V0dGVycyAvIFNldHRlcnNcbiAgICBhcGlqcyAoXylcblx0LmdldHNldCAoJ2xhYmVsJywgXCJcIilcblx0LmdldHNldCAoJ2VsZW1lbnRzJywgW10pXG5cdC5nZXRzZXQgKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7fSk7XG5cbiAgICByZXR1cm4gXztcbn07XG5cbi8vIFRoZSByZXRyaWV2ZXJzLiBUaGV5IG5lZWQgdG8gYWNjZXNzICdlbGVtZW50cydcbmRhdGEucmV0cmlldmVyID0ge307XG5cbmRhdGEucmV0cmlldmVyLnN5bmMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdXBkYXRlX3RyYWNrID0gZnVuY3Rpb24ob2JqKSB7XG5cdC8vIFwidGhpc1wiIGlzIHNldCB0byB0aGUgZGF0YSBvYmpcbiAgICAgICAgdGhpcy5lbGVtZW50cyh1cGRhdGVfdHJhY2sucmV0cmlldmVyKCkob2JqLmxvYykpO1xuICAgICAgICBvYmoub25fc3VjY2VzcygpO1xuICAgIH07XG5cbiAgICBhcGlqcyAodXBkYXRlX3RyYWNrKVxuXHQuZ2V0c2V0ICgncmV0cmlldmVyJywgZnVuY3Rpb24gKCkge30pXG5cbiAgICByZXR1cm4gdXBkYXRlX3RyYWNrO1xufTtcblxuZGF0YS5yZXRyaWV2ZXIuYXN5bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHVybCA9ICcnO1xuXG4gICAgLy8gXCJ0aGlzXCIgaXMgc2V0IHRvIHRoZSBkYXRhIG9ialxuICAgIHZhciBkYXRhX29iaiA9IHRoaXM7XG4gICAgdmFyIHVwZGF0ZV90cmFjayA9IGZ1bmN0aW9uIChvYmopIHtcblx0ZDMuanNvbih1cmwsIGZ1bmN0aW9uIChlcnIsIHJlc3ApIHtcblx0ICAgIGRhdGFfb2JqLmVsZW1lbnRzKHJlc3ApO1xuXHQgICAgb2JqLm9uX3N1Y2Nlc3MoKTtcblx0fSk7IFxuICAgIH07XG5cbiAgICBhcGlqcyAodXBkYXRlX3RyYWNrKVxuXHQuZ2V0c2V0ICgndXJsJywgJycpO1xuXG4gICAgcmV0dXJuIHVwZGF0ZV90cmFjaztcbn07XG5cblxuXG4vLyBBIHByZWRlZmluZWQgdHJhY2sgZm9yIGdlbmVzXG4vLyB0bnQudHJhY2suZGF0YS5nZW5lID0gZnVuY3Rpb24gKCkge1xuLy8gICAgIHZhciB0cmFjayA9IHRudC50cmFjay5kYXRhKCk7XG4vLyBcdC8vIC5pbmRleChcIklEXCIpO1xuXG4vLyAgICAgdmFyIHVwZGF0ZXIgPSB0bnQudHJhY2sucmV0cmlldmVyLmVuc2VtYmwoKVxuLy8gXHQuZW5kcG9pbnQoXCJyZWdpb25cIilcbi8vICAgICAvLyBUT0RPOiBJZiBzdWNjZXNzIGlzIGRlZmluZWQgaGVyZSwgbWVhbnMgdGhhdCBpdCBjYW4ndCBiZSB1c2VyLWRlZmluZWRcbi8vICAgICAvLyBpcyB0aGF0IGdvb2Q/IGVub3VnaD8gQVBJP1xuLy8gICAgIC8vIFVQREFURTogTm93IHN1Y2Nlc3MgaXMgYmFja2VkIHVwIGJ5IGFuIGFycmF5LiBTdGlsbCBkb24ndCBrbm93IGlmIHRoaXMgaXMgdGhlIGJlc3Qgb3B0aW9uXG4vLyBcdC5zdWNjZXNzKGZ1bmN0aW9uKGdlbmVzKSB7XG4vLyBcdCAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdlbmVzLmxlbmd0aDsgaSsrKSB7XG4vLyBcdFx0aWYgKGdlbmVzW2ldLnN0cmFuZCA9PT0gLTEpIHsgIFxuLy8gXHRcdCAgICBnZW5lc1tpXS5kaXNwbGF5X2xhYmVsID0gXCI8XCIgKyBnZW5lc1tpXS5leHRlcm5hbF9uYW1lO1xuLy8gXHRcdH0gZWxzZSB7XG4vLyBcdFx0ICAgIGdlbmVzW2ldLmRpc3BsYXlfbGFiZWwgPSBnZW5lc1tpXS5leHRlcm5hbF9uYW1lICsgXCI+XCI7XG4vLyBcdFx0fVxuLy8gXHQgICAgfVxuLy8gXHR9KTtcblxuLy8gICAgIHJldHVybiB0cmFjay51cGRhdGUodXBkYXRlcik7XG4vLyB9XG5cbi8vIEEgcHJlZGVmaW5lZCB0cmFjayBkaXNwbGF5aW5nIG5vIGV4dGVybmFsIGRhdGFcbi8vIGl0IGlzIHVzZWQgZm9yIGxvY2F0aW9uIGFuZCBheGlzIHRyYWNrcyBmb3IgZXhhbXBsZVxuZGF0YS5lbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdHJhY2sgPSBkYXRhKCk7XG4gICAgdmFyIHVwZGF0ZXIgPSBkYXRhLnJldHJpZXZlci5zeW5jKCk7XG4gICAgdHJhY2sudXBkYXRlKHVwZGF0ZXIpO1xuXG4gICAgcmV0dXJuIHRyYWNrO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gZGF0YTtcbiIsInZhciBhcGlqcyA9IHJlcXVpcmUgKFwidG50LmFwaVwiKTtcbnZhciBsYXlvdXQgPSByZXF1aXJlKFwiLi9sYXlvdXQuanNcIik7XG5cbi8vIEZFQVRVUkUgVklTXG4vLyB2YXIgYm9hcmQgPSB7fTtcbi8vIGJvYXJkLnRyYWNrID0ge307XG52YXIgdG50X2ZlYXR1cmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8vLy8vIFZhcnMgZXhwb3NlZCBpbiB0aGUgQVBJXG4gICAgdmFyIGV4cG9ydHMgPSB7XG5cdGNyZWF0ZSAgIDogZnVuY3Rpb24gKCkge3Rocm93IFwiY3JlYXRlX2VsZW0gaXMgbm90IGRlZmluZWQgaW4gdGhlIGJhc2UgZmVhdHVyZSBvYmplY3RcIn0sXG5cdG1vdmVyICAgIDogZnVuY3Rpb24gKCkge3Rocm93IFwibW92ZV9lbGVtIGlzIG5vdCBkZWZpbmVkIGluIHRoZSBiYXNlIGZlYXR1cmUgb2JqZWN0XCJ9LFxuXHR1cGRhdGVyICA6IGZ1bmN0aW9uICgpIHt9LFxuXHRvbl9jbGljayA6IGZ1bmN0aW9uICgpIHt9LFxuXHRvbl9tb3VzZW92ZXIgOiBmdW5jdGlvbiAoKSB7fSxcblx0Z3VpZGVyICAgOiBmdW5jdGlvbiAoKSB7fSxcblx0aW5kZXggICAgOiB1bmRlZmluZWQsXG5cdGxheW91dCAgIDogbGF5b3V0LmlkZW50aXR5KCksXG5cdGZvcmVncm91bmRfY29sb3IgOiAnIzAwMCdcbiAgICB9O1xuXG5cbiAgICAvLyBUaGUgcmV0dXJuZWQgb2JqZWN0XG4gICAgdmFyIGZlYXR1cmUgPSB7fTtcblxuICAgIHZhciByZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICBcdHZhciB0cmFjayA9IHRoaXM7XG4gICAgXHR0cmFjay5nLnNlbGVjdEFsbChcIi50bnRfZWxlbVwiKS5yZW1vdmUoKTtcblx0dHJhY2suZy5zZWxlY3RBbGwoXCIudG50X2d1aWRlclwiKS5yZW1vdmUoKTtcbiAgICB9O1xuXG4gICAgdmFyIGluaXQgPSBmdW5jdGlvbiAod2lkdGgpIHtcblx0dmFyIHRyYWNrID0gdGhpcztcblx0ZXhwb3J0cy5ndWlkZXIuY2FsbCh0cmFjaywgd2lkdGgpO1xuICAgIH07XG5cbiAgICB2YXIgcGxvdCA9IGZ1bmN0aW9uIChuZXdfZWxlbXMsIHRyYWNrLCB4U2NhbGUpIHtcblx0bmV3X2VsZW1zLm9uKFwiY2xpY2tcIiwgZXhwb3J0cy5vbl9jbGljayk7XG5cdG5ld19lbGVtcy5vbihcIm1vdXNlb3ZlclwiLCBleHBvcnRzLm9uX21vdXNlb3Zlcik7XG5cdC8vIG5ld19lbGVtIGlzIGEgZyBlbGVtZW50IHdoZXJlIHRoZSBmZWF0dXJlIGlzIGluc2VydGVkXG5cdGV4cG9ydHMuY3JlYXRlLmNhbGwodHJhY2ssIG5ld19lbGVtcywgeFNjYWxlKTtcbiAgICB9O1xuXG4gICAgdmFyIHVwZGF0ZSA9IGZ1bmN0aW9uICh4U2NhbGUsIGZpZWxkKSB7XG5cdHZhciB0cmFjayA9IHRoaXM7XG5cdHZhciBzdmdfZyA9IHRyYWNrLmc7XG5cdHZhciBsYXlvdXQgPSBleHBvcnRzLmxheW91dDtcblxuXHR2YXIgZWxlbWVudHMgPSB0cmFjay5kYXRhKCkuZWxlbWVudHMoKTtcblxuXHRpZiAoZmllbGQgIT09IHVuZGVmaW5lZCkge1xuXHQgICAgZWxlbWVudHMgPSBlbGVtZW50c1tmaWVsZF07XG5cdH1cblxuXHRsYXlvdXQoZWxlbWVudHMsIHhTY2FsZSk7XG5cdHZhciBkYXRhX2VsZW1zID0gbGF5b3V0LmVsZW1lbnRzKCk7XG5cblx0dmFyIHZpc19zZWw7XG5cdHZhciB2aXNfZWxlbXM7XG5cdGlmIChmaWVsZCAhPT0gdW5kZWZpbmVkKSB7XG5cdCAgICB2aXNfc2VsID0gc3ZnX2cuc2VsZWN0QWxsKFwiLnRudF9lbGVtX1wiICsgZmllbGQpO1xuXHR9IGVsc2Uge1xuXHQgICAgdmlzX3NlbCA9IHN2Z19nLnNlbGVjdEFsbChcIi50bnRfZWxlbVwiKTtcblx0fVxuXG5cdGlmIChleHBvcnRzLmluZGV4KSB7IC8vIEluZGV4aW5nIGJ5IGZpZWxkXG5cdCAgICB2aXNfZWxlbXMgPSB2aXNfc2VsXG5cdFx0LmRhdGEoZGF0YV9lbGVtcywgZnVuY3Rpb24gKGQpIHtcblx0XHQgICAgaWYgKGQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIGV4cG9ydHMuaW5kZXgoZCk7XG5cdFx0ICAgIH1cblx0XHR9KVxuXHR9IGVsc2UgeyAvLyBJbmRleGluZyBieSBwb3NpdGlvbiBpbiBhcnJheVxuXHQgICAgdmlzX2VsZW1zID0gdmlzX3NlbFxuXHRcdC5kYXRhKGRhdGFfZWxlbXMpXG5cdH1cblxuXHRleHBvcnRzLnVwZGF0ZXIuY2FsbCh0cmFjaywgdmlzX2VsZW1zLCB4U2NhbGUpO1xuXG5cdHZhciBuZXdfZWxlbSA9IHZpc19lbGVtc1xuXHQgICAgLmVudGVyKCk7XG5cblx0bmV3X2VsZW1cblx0ICAgIC5hcHBlbmQoXCJnXCIpXG5cdCAgICAuYXR0cihcImNsYXNzXCIsIFwidG50X2VsZW1cIilcblx0ICAgIC5jbGFzc2VkKFwidG50X2VsZW1fXCIgKyBmaWVsZCwgZmllbGQpXG5cdCAgICAuY2FsbChmZWF0dXJlLnBsb3QsIHRyYWNrLCB4U2NhbGUpO1xuXG5cdHZpc19lbGVtc1xuXHQgICAgLmV4aXQoKVxuXHQgICAgLnJlbW92ZSgpO1xuICAgIH07XG5cbiAgICB2YXIgbW92ZSA9IGZ1bmN0aW9uICh4U2NhbGUsIGZpZWxkKSB7XG5cdHZhciB0cmFjayA9IHRoaXM7XG5cdHZhciBzdmdfZyA9IHRyYWNrLmc7XG5cdHZhciBlbGVtcztcblx0Ly8gVE9ETzogSXMgc2VsZWN0aW5nIHRoZSBlbGVtZW50cyB0byBtb3ZlIHRvbyBzbG93P1xuXHQvLyBJdCB3b3VsZCBiZSBuaWNlIHRvIHByb2ZpbGVcblx0aWYgKGZpZWxkICE9PSB1bmRlZmluZWQpIHtcblx0ICAgIGVsZW1zID0gc3ZnX2cuc2VsZWN0QWxsKFwiLnRudF9lbGVtX1wiICsgZmllbGQpO1xuXHR9IGVsc2Uge1xuXHQgICAgZWxlbXMgPSBzdmdfZy5zZWxlY3RBbGwoXCIudG50X2VsZW1cIik7XG5cdH1cblxuXHRleHBvcnRzLm1vdmVyLmNhbGwodGhpcywgZWxlbXMsIHhTY2FsZSk7XG4gICAgfTtcblxuICAgIHZhciBtdGYgPSBmdW5jdGlvbiAoZWxlbSkge1xuXHRlbGVtLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQoZWxlbSk7XG4gICAgfTtcbiAgICBcbiAgICB2YXIgbW92ZV90b19mcm9udCA9IGZ1bmN0aW9uIChmaWVsZCkge1xuXHRpZiAoZmllbGQgIT09IHVuZGVmaW5lZCkge1xuXHQgICAgdmFyIHRyYWNrID0gdGhpcztcblx0ICAgIHZhciBzdmdfZyA9IHRyYWNrLmc7XG5cdCAgICBzdmdfZy5zZWxlY3RBbGwoXCIudG50X2VsZW1fXCIgKyBmaWVsZClcblx0ICAgICAgICAuZWFjaCggZnVuY3Rpb24gKCkge1xuXHRcdCAgICBtdGYodGhpcyk7XG5cdFx0fSk7XG5cdH1cbiAgICB9O1xuXG4gICAgLy8gQVBJXG4gICAgYXBpanMgKGZlYXR1cmUpXG5cdC5nZXRzZXQgKGV4cG9ydHMpXG5cdC5tZXRob2QgKHtcblx0ICAgIHJlc2V0ICA6IHJlc2V0LFxuXHQgICAgcGxvdCAgIDogcGxvdCxcblx0ICAgIHVwZGF0ZSA6IHVwZGF0ZSxcblx0ICAgIG1vdmUgICA6IG1vdmUsXG5cdCAgICBpbml0ICAgOiBpbml0LFxuXHQgICAgbW92ZV90b19mcm9udCA6IG1vdmVfdG9fZnJvbnRcblx0fSk7XG5cbiAgICByZXR1cm4gZmVhdHVyZTtcbn07XG5cbnRudF9mZWF0dXJlLmNvbXBvc2l0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZGlzcGxheXMgPSB7fTtcbiAgICB2YXIgZGlzcGxheV9vcmRlciA9IFtdO1xuXG4gICAgdmFyIGZlYXR1cmVzID0ge307XG5cbiAgICB2YXIgcmVzZXQgPSBmdW5jdGlvbiAoKSB7XG5cdHZhciB0cmFjayA9IHRoaXM7XG5cdGZvciAodmFyIGk9MDsgaTxkaXNwbGF5cy5sZW5ndGg7IGkrKykge1xuXHQgICAgZGlzcGxheXNbaV0ucmVzZXQuY2FsbCh0cmFjayk7XG5cdH1cbiAgICB9O1xuXG4gICAgdmFyIGluaXQgPSBmdW5jdGlvbiAod2lkdGgpIHtcblx0dmFyIHRyYWNrID0gdGhpcztcbiBcdGZvciAodmFyIGRpc3BsYXkgaW4gZGlzcGxheXMpIHtcblx0ICAgIGlmIChkaXNwbGF5cy5oYXNPd25Qcm9wZXJ0eShkaXNwbGF5KSkge1xuXHRcdGRpc3BsYXlzW2Rpc3BsYXldLmluaXQuY2FsbCh0cmFjaywgd2lkdGgpO1xuXHQgICAgfVxuXHR9XG4gICAgfTtcblxuICAgIHZhciB1cGRhdGUgPSBmdW5jdGlvbiAoeFNjYWxlKSB7XG5cdHZhciB0cmFjayA9IHRoaXM7XG5cdGZvciAodmFyIGk9MDsgaTxkaXNwbGF5X29yZGVyLmxlbmd0aDsgaSsrKSB7XG5cdCAgICBkaXNwbGF5c1tkaXNwbGF5X29yZGVyW2ldXS51cGRhdGUuY2FsbCh0cmFjaywgeFNjYWxlLCBkaXNwbGF5X29yZGVyW2ldKTtcblx0ICAgIGRpc3BsYXlzW2Rpc3BsYXlfb3JkZXJbaV1dLm1vdmVfdG9fZnJvbnQuY2FsbCh0cmFjaywgZGlzcGxheV9vcmRlcltpXSk7XG5cdH1cblx0Ly8gZm9yICh2YXIgZGlzcGxheSBpbiBkaXNwbGF5cykge1xuXHQvLyAgICAgaWYgKGRpc3BsYXlzLmhhc093blByb3BlcnR5KGRpc3BsYXkpKSB7XG5cdC8vIFx0ZGlzcGxheXNbZGlzcGxheV0udXBkYXRlLmNhbGwodHJhY2ssIHhTY2FsZSwgZGlzcGxheSk7XG5cdC8vICAgICB9XG5cdC8vIH1cbiAgICB9O1xuXG4gICAgdmFyIG1vdmUgPSBmdW5jdGlvbiAoeFNjYWxlKSB7XG5cdHZhciB0cmFjayA9IHRoaXM7XG5cdGZvciAodmFyIGRpc3BsYXkgaW4gZGlzcGxheXMpIHtcblx0ICAgIGlmIChkaXNwbGF5cy5oYXNPd25Qcm9wZXJ0eShkaXNwbGF5KSkge1xuXHRcdGRpc3BsYXlzW2Rpc3BsYXldLm1vdmUuY2FsbCh0cmFjaywgeFNjYWxlLCBkaXNwbGF5KTtcblx0ICAgIH1cblx0fVxuICAgIH07XG5cbiAgICB2YXIgYWRkID0gZnVuY3Rpb24gKGtleSwgZGlzcGxheSkge1xuXHRkaXNwbGF5c1trZXldID0gZGlzcGxheTtcblx0ZGlzcGxheV9vcmRlci5wdXNoKGtleSk7XG5cdHJldHVybiBmZWF0dXJlcztcbiAgICB9O1xuXG4gICAgLy8gQVBJXG4gICAgYXBpanMgKGZlYXR1cmVzKVxuXHQubWV0aG9kICh7XG5cdCAgICByZXNldCAgOiByZXNldCxcblx0ICAgIHVwZGF0ZSA6IHVwZGF0ZSxcblx0ICAgIG1vdmUgICA6IG1vdmUsXG5cdCAgICBpbml0ICAgOiBpbml0LFxuXHQgICAgYWRkICAgIDogYWRkXG5cdH0pO1xuXG5cbiAgICByZXR1cm4gZmVhdHVyZXM7XG59O1xuXG50bnRfZmVhdHVyZS5zZXF1ZW5jZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAnSW5oZXJpdCcgZnJvbSB0bnQudHJhY2suZmVhdHVyZVxuICAgIHZhciBmZWF0dXJlID0gdG50X2ZlYXR1cmUoKTtcblxuICAgIHZhciBjb25maWcgPSB7XG5cdGZvbnRzaXplIDogMTAsXG5cdHNlcXVlbmNlIDogZnVuY3Rpb24gKGQpIHtcblx0ICAgIHJldHVybiBkLnNlcXVlbmNlXG5cdH1cbiAgICB9O1xuXG4gICAgdmFyIGFwaSA9IGFwaWpzIChmZWF0dXJlKVxuXHQuZ2V0c2V0IChjb25maWcpO1xuXG5cbiAgICBmZWF0dXJlLmNyZWF0ZSAoZnVuY3Rpb24gKG5ld19udHMsIHhTY2FsZSkge1xuXHR2YXIgdHJhY2sgPSB0aGlzO1xuXG5cdG5ld19udHNcblx0ICAgIC5hcHBlbmQoXCJ0ZXh0XCIpXG5cdCAgICAuYXR0cihcImZpbGxcIiwgdHJhY2suYmFja2dyb3VuZF9jb2xvcigpKVxuXHQgICAgLnN0eWxlKCdmb250LXNpemUnLCBjb25maWcuZm9udHNpemUgKyBcInB4XCIpXG5cdCAgICAuYXR0cihcInhcIiwgZnVuY3Rpb24gKGQpIHtcblx0XHRyZXR1cm4geFNjYWxlIChkLnBvcyk7XG5cdCAgICB9KVxuXHQgICAgLmF0dHIoXCJ5XCIsIGZ1bmN0aW9uIChkKSB7XG5cdFx0cmV0dXJuIH5+KHRyYWNrLmhlaWdodCgpIC8gMikgKyA1OyBcblx0ICAgIH0pXG5cdCAgICAudGV4dChjb25maWcuc2VxdWVuY2UpXG5cdCAgICAudHJhbnNpdGlvbigpXG5cdCAgICAuZHVyYXRpb24oNTAwKVxuXHQgICAgLmF0dHIoJ2ZpbGwnLCBmZWF0dXJlLmZvcmVncm91bmRfY29sb3IoKSk7XG4gICAgfSk7XG5cbiAgICBmZWF0dXJlLm1vdmVyIChmdW5jdGlvbiAobnRzLCB4U2NhbGUpIHtcblx0bnRzLnNlbGVjdCAoXCJ0ZXh0XCIpXG5cdCAgICAuYXR0cihcInhcIiwgZnVuY3Rpb24gKGQpIHtcblx0XHRyZXR1cm4geFNjYWxlKGQucG9zKTtcblx0ICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGZlYXR1cmU7XG59O1xuXG50bnRfZmVhdHVyZS5hcmVhID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmZWF0dXJlID0gdG50X2ZlYXR1cmUubGluZSgpO1xuICAgIHZhciBsaW5lID0gdG50X2ZlYXR1cmUubGluZSgpO1xuXG4gICAgdmFyIGFyZWEgPSBkMy5zdmcuYXJlYSgpXG5cdC5pbnRlcnBvbGF0ZShsaW5lLmludGVycG9sYXRlKCkpXG5cdC50ZW5zaW9uKGZlYXR1cmUudGVuc2lvbigpKTtcblxuICAgIHZhciBkYXRhX3BvaW50cztcblxuICAgIHZhciBsaW5lX2NyZWF0ZSA9IGZlYXR1cmUuY3JlYXRlKCk7IC8vIFdlICdzYXZlJyBsaW5lIGNyZWF0aW9uXG4gICAgZmVhdHVyZS5jcmVhdGUgKGZ1bmN0aW9uIChwb2ludHMsIHhTY2FsZSkge1xuXHR2YXIgdHJhY2sgPSB0aGlzO1xuXG5cdGlmIChkYXRhX3BvaW50cyAhPT0gdW5kZWZpbmVkKSB7XG4vL1x0ICAgICByZXR1cm47XG5cdCAgICB0cmFjay5nLnNlbGVjdChcInBhdGhcIikucmVtb3ZlKCk7XG5cdH1cblxuXHRsaW5lX2NyZWF0ZS5jYWxsKHRyYWNrLCBwb2ludHMsIHhTY2FsZSk7XG5cblx0YXJlYVxuXHQgICAgLngobGluZS54KCkpXG5cdCAgICAueTEobGluZS55KCkpXG5cdCAgICAueTAodHJhY2suaGVpZ2h0KCkpO1xuXG5cdGRhdGFfcG9pbnRzID0gcG9pbnRzLmRhdGEoKTtcblx0cG9pbnRzLnJlbW92ZSgpO1xuXG5cdHRyYWNrLmdcblx0ICAgIC5hcHBlbmQoXCJwYXRoXCIpXG5cdCAgICAuYXR0cihcImNsYXNzXCIsIFwidG50X2FyZWFcIilcblx0ICAgIC5jbGFzc2VkKFwidG50X2VsZW1cIiwgdHJ1ZSlcblx0ICAgIC5kYXR1bShkYXRhX3BvaW50cylcblx0ICAgIC5hdHRyKFwiZFwiLCBhcmVhKVxuXHQgICAgLmF0dHIoXCJmaWxsXCIsIGQzLnJnYihmZWF0dXJlLmZvcmVncm91bmRfY29sb3IoKSkuYnJpZ2h0ZXIoKSk7XG5cdFxuICAgIH0pO1xuXG4gICAgdmFyIGxpbmVfbW92ZXIgPSBmZWF0dXJlLm1vdmVyKCk7XG4gICAgZmVhdHVyZS5tb3ZlciAoZnVuY3Rpb24gKHBhdGgsIHhTY2FsZSkge1xuXHR2YXIgdHJhY2sgPSB0aGlzO1xuXHRsaW5lX21vdmVyLmNhbGwodHJhY2ssIHBhdGgsIHhTY2FsZSk7XG5cblx0YXJlYS54KGxpbmUueCgpKTtcblx0dHJhY2suZ1xuXHQgICAgLnNlbGVjdChcIi50bnRfYXJlYVwiKVxuXHQgICAgLmRhdHVtKGRhdGFfcG9pbnRzKVxuXHQgICAgLmF0dHIoXCJkXCIsIGFyZWEpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGZlYXR1cmU7XG5cbn07XG5cbnRudF9mZWF0dXJlLmxpbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZlYXR1cmUgPSB0bnRfZmVhdHVyZSgpO1xuXG4gICAgdmFyIHggPSBmdW5jdGlvbiAoZCkge1xuXHRyZXR1cm4gZC5wb3M7XG4gICAgfTtcbiAgICB2YXIgeSA9IGZ1bmN0aW9uIChkKSB7XG5cdHJldHVybiBkLnZhbDtcbiAgICB9O1xuICAgIHZhciB0ZW5zaW9uID0gMC43O1xuICAgIHZhciB5U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKTtcbiAgICB2YXIgbGluZSA9IGQzLnN2Zy5saW5lKClcblx0LmludGVycG9sYXRlKFwiYmFzaXNcIik7XG5cbiAgICAvLyBsaW5lIGdldHRlci4gVE9ETzogU2V0dGVyP1xuICAgIGZlYXR1cmUubGluZSA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIGxpbmU7XG4gICAgfTtcblxuICAgIGZlYXR1cmUueCA9IGZ1bmN0aW9uIChjYmFrKSB7XG5cdGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuXHQgICAgcmV0dXJuIHg7XG5cdH1cblx0eCA9IGNiYWs7XG5cdHJldHVybiBmZWF0dXJlO1xuICAgIH07XG5cbiAgICBmZWF0dXJlLnkgPSBmdW5jdGlvbiAoY2Jhaykge1xuXHRpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcblx0ICAgIHJldHVybiB5O1xuXHR9XG5cdHkgPSBjYmFrO1xuXHRyZXR1cm4gZmVhdHVyZTtcbiAgICB9O1xuXG4gICAgZmVhdHVyZS50ZW5zaW9uID0gZnVuY3Rpb24gKHQpIHtcblx0aWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG5cdCAgICByZXR1cm4gdGVuc2lvbjtcblx0fVxuXHR0ZW5zaW9uID0gdDtcblx0cmV0dXJuIGZlYXR1cmU7XG4gICAgfTtcblxuICAgIHZhciBkYXRhX3BvaW50cztcblxuICAgIC8vIEZvciBub3csIGNyZWF0ZSBpcyBhIG9uZS1vZmYgZXZlbnRcbiAgICAvLyBUT0RPOiBNYWtlIGl0IHdvcmsgd2l0aCBwYXJ0aWFsIHBhdGhzLCBpZS4gY3JlYXRpbmcgYW5kIGRpc3BsYXlpbmcgb25seSB0aGUgcGF0aCB0aGF0IGlzIGJlaW5nIGRpc3BsYXllZFxuICAgIGZlYXR1cmUuY3JlYXRlIChmdW5jdGlvbiAocG9pbnRzLCB4U2NhbGUpIHtcblx0dmFyIHRyYWNrID0gdGhpcztcblxuXHRpZiAoZGF0YV9wb2ludHMgIT09IHVuZGVmaW5lZCkge1xuXHQgICAgLy8gcmV0dXJuO1xuXHQgICAgdHJhY2suZy5zZWxlY3QoXCJwYXRoXCIpLnJlbW92ZSgpO1xuXHR9XG5cblx0bGluZVxuXHQgICAgLnRlbnNpb24odGVuc2lvbilcblx0ICAgIC54KGZ1bmN0aW9uIChkKSB7cmV0dXJuIHhTY2FsZSh4KGQpKX0pXG5cdCAgICAueShmdW5jdGlvbiAoZCkge3JldHVybiB0cmFjay5oZWlnaHQoKSAtIHlTY2FsZSh5KGQpKX0pXG5cblx0ZGF0YV9wb2ludHMgPSBwb2ludHMuZGF0YSgpO1xuXHRwb2ludHMucmVtb3ZlKCk7XG5cblx0eVNjYWxlXG5cdCAgICAuZG9tYWluKFswLCAxXSlcblx0ICAgIC8vIC5kb21haW4oWzAsIGQzLm1heChkYXRhX3BvaW50cywgZnVuY3Rpb24gKGQpIHtcblx0ICAgIC8vIFx0cmV0dXJuIHkoZCk7XG5cdCAgICAvLyB9KV0pXG5cdCAgICAucmFuZ2UoWzAsIHRyYWNrLmhlaWdodCgpIC0gMl0pO1xuXHRcblx0dHJhY2suZ1xuXHQgICAgLmFwcGVuZChcInBhdGhcIilcblx0ICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0bnRfZWxlbVwiKVxuXHQgICAgLmF0dHIoXCJkXCIsIGxpbmUoZGF0YV9wb2ludHMpKVxuXHQgICAgLnN0eWxlKFwic3Ryb2tlXCIsIGZlYXR1cmUuZm9yZWdyb3VuZF9jb2xvcigpKVxuXHQgICAgLnN0eWxlKFwic3Ryb2tlLXdpZHRoXCIsIDQpXG5cdCAgICAuc3R5bGUoXCJmaWxsXCIsIFwibm9uZVwiKTtcblxuICAgIH0pO1xuXG4gICAgZmVhdHVyZS5tb3ZlciAoZnVuY3Rpb24gKHBhdGgsIHhTY2FsZSkge1xuXHR2YXIgdHJhY2sgPSB0aGlzO1xuXG5cdGxpbmUueChmdW5jdGlvbiAoZCkge1xuXHQgICAgcmV0dXJuIHhTY2FsZSh4KGQpKVxuXHR9KTtcblx0dHJhY2suZy5zZWxlY3QoXCJwYXRoXCIpXG5cdCAgICAuYXR0cihcImRcIiwgbGluZShkYXRhX3BvaW50cykpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGZlYXR1cmU7XG59O1xuXG50bnRfZmVhdHVyZS5jb25zZXJ2YXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gJ0luaGVyaXQnIGZyb20gZmVhdHVyZS5hcmVhXG4gICAgdmFyIGZlYXR1cmUgPSB0bnRfZmVhdHVyZS5hcmVhKCk7XG5cbiAgICB2YXIgYXJlYV9jcmVhdGUgPSBmZWF0dXJlLmNyZWF0ZSgpOyAvLyBXZSAnc2F2ZScgYXJlYSBjcmVhdGlvblxuICAgIGZlYXR1cmUuY3JlYXRlICAoZnVuY3Rpb24gKHBvaW50cywgeFNjYWxlKSB7XG5cdHZhciB0cmFjayA9IHRoaXM7XG5cblx0YXJlYV9jcmVhdGUuY2FsbCh0cmFjaywgZDMuc2VsZWN0KHBvaW50c1swXVswXSksIHhTY2FsZSlcbiAgICB9KTtcblxuICAgIHJldHVybiBmZWF0dXJlO1xufTtcblxudG50X2ZlYXR1cmUuZW5zZW1ibCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAnSW5oZXJpdCcgZnJvbSBib2FyZC50cmFjay5mZWF0dXJlXG4gICAgdmFyIGZlYXR1cmUgPSB0bnRfZmVhdHVyZSgpO1xuXG4gICAgdmFyIGZvcmVncm91bmRfY29sb3IyID0gXCIjN0ZGRjAwXCI7XG4gICAgdmFyIGZvcmVncm91bmRfY29sb3IzID0gXCIjMDBCQjAwXCI7XG5cbiAgICBmZWF0dXJlLmd1aWRlciAoZnVuY3Rpb24gKHdpZHRoKSB7XG5cdHZhciB0cmFjayA9IHRoaXM7XG5cdHZhciBoZWlnaHRfb2Zmc2V0ID0gfn4odHJhY2suaGVpZ2h0KCkgLSAodHJhY2suaGVpZ2h0KCkgICogLjgpKSAvIDI7XG5cblx0dHJhY2suZ1xuXHQgICAgLmFwcGVuZChcImxpbmVcIilcblx0ICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0bnRfZ3VpZGVyXCIpXG5cdCAgICAuYXR0cihcIngxXCIsIDApXG5cdCAgICAuYXR0cihcIngyXCIsIHdpZHRoKVxuXHQgICAgLmF0dHIoXCJ5MVwiLCBoZWlnaHRfb2Zmc2V0KVxuXHQgICAgLmF0dHIoXCJ5MlwiLCBoZWlnaHRfb2Zmc2V0KVxuXHQgICAgLnN0eWxlKFwic3Ryb2tlXCIsIGZlYXR1cmUuZm9yZWdyb3VuZF9jb2xvcigpKVxuXHQgICAgLnN0eWxlKFwic3Ryb2tlLXdpZHRoXCIsIDEpO1xuXG5cdHRyYWNrLmdcblx0ICAgIC5hcHBlbmQoXCJsaW5lXCIpXG5cdCAgICAuYXR0cihcImNsYXNzXCIsIFwidG50X2d1aWRlclwiKVxuXHQgICAgLmF0dHIoXCJ4MVwiLCAwKVxuXHQgICAgLmF0dHIoXCJ4MlwiLCB3aWR0aClcblx0ICAgIC5hdHRyKFwieTFcIiwgdHJhY2suaGVpZ2h0KCkgLSBoZWlnaHRfb2Zmc2V0KVxuXHQgICAgLmF0dHIoXCJ5MlwiLCB0cmFjay5oZWlnaHQoKSAtIGhlaWdodF9vZmZzZXQpXG5cdCAgICAuc3R5bGUoXCJzdHJva2VcIiwgZmVhdHVyZS5mb3JlZ3JvdW5kX2NvbG9yKCkpXG5cdCAgICAuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwgMSk7XG5cbiAgICB9KTtcblxuICAgIGZlYXR1cmUuY3JlYXRlIChmdW5jdGlvbiAobmV3X2VsZW1zLCB4U2NhbGUpIHtcblx0dmFyIHRyYWNrID0gdGhpcztcblxuXHR2YXIgaGVpZ2h0X29mZnNldCA9IH5+KHRyYWNrLmhlaWdodCgpIC0gKHRyYWNrLmhlaWdodCgpICAqIC44KSkgLyAyO1xuXG5cdG5ld19lbGVtc1xuXHQgICAgLmFwcGVuZChcInJlY3RcIilcblx0ICAgIC5hdHRyKFwieFwiLCBmdW5jdGlvbiAoZCkge1xuXHRcdHJldHVybiB4U2NhbGUgKGQuc3RhcnQpO1xuXHQgICAgfSlcblx0ICAgIC5hdHRyKFwieVwiLCBoZWlnaHRfb2Zmc2V0KVxuLy8gXHQgICAgLmF0dHIoXCJyeFwiLCAzKVxuLy8gXHQgICAgLmF0dHIoXCJyeVwiLCAzKVxuXHQgICAgLmF0dHIoXCJ3aWR0aFwiLCBmdW5jdGlvbiAoZCkge1xuXHRcdHJldHVybiAoeFNjYWxlKGQuZW5kKSAtIHhTY2FsZShkLnN0YXJ0KSk7XG5cdCAgICB9KVxuXHQgICAgLmF0dHIoXCJoZWlnaHRcIiwgdHJhY2suaGVpZ2h0KCkgLSB+fihoZWlnaHRfb2Zmc2V0ICogMikpXG5cdCAgICAuYXR0cihcImZpbGxcIiwgdHJhY2suYmFja2dyb3VuZF9jb2xvcigpKVxuXHQgICAgLnRyYW5zaXRpb24oKVxuXHQgICAgLmR1cmF0aW9uKDUwMClcblx0ICAgIC5hdHRyKFwiZmlsbFwiLCBmdW5jdGlvbiAoZCkgeyBcblx0XHRpZiAoZC50eXBlID09PSAnaGlnaCcpIHtcblx0XHQgICAgcmV0dXJuIGQzLnJnYihmZWF0dXJlLmZvcmVncm91bmRfY29sb3IoKSk7XG5cdFx0fVxuXHRcdGlmIChkLnR5cGUgPT09ICdsb3cnKSB7XG5cdFx0ICAgIHJldHVybiBkMy5yZ2IoZmVhdHVyZS5mb3JlZ3JvdW5kX2NvbG9yMigpKTtcblx0XHR9XG5cdFx0cmV0dXJuIGQzLnJnYihmZWF0dXJlLmZvcmVncm91bmRfY29sb3IzKCkpO1xuXHQgICAgfSk7XG4gICAgfSk7XG5cbiAgICBmZWF0dXJlLnVwZGF0ZXIgKGZ1bmN0aW9uIChibG9ja3MsIHhTY2FsZSkge1xuXHRibG9ja3Ncblx0ICAgIC5zZWxlY3QoXCJyZWN0XCIpXG5cdCAgICAuYXR0cihcIndpZHRoXCIsIGZ1bmN0aW9uIChkKSB7XG5cdFx0cmV0dXJuICh4U2NhbGUoZC5lbmQpIC0geFNjYWxlKGQuc3RhcnQpKVxuXHQgICAgfSk7XG4gICAgfSk7XG5cbiAgICBmZWF0dXJlLm1vdmVyIChmdW5jdGlvbiAoYmxvY2tzLCB4U2NhbGUpIHtcblx0YmxvY2tzXG5cdCAgICAuc2VsZWN0KFwicmVjdFwiKVxuXHQgICAgLmF0dHIoXCJ4XCIsIGZ1bmN0aW9uIChkKSB7XG5cdFx0cmV0dXJuIHhTY2FsZShkLnN0YXJ0KTtcblx0ICAgIH0pXG5cdCAgICAuYXR0cihcIndpZHRoXCIsIGZ1bmN0aW9uIChkKSB7XG5cdFx0cmV0dXJuICh4U2NhbGUoZC5lbmQpIC0geFNjYWxlKGQuc3RhcnQpKTtcblx0ICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZmVhdHVyZS5mb3JlZ3JvdW5kX2NvbG9yMiA9IGZ1bmN0aW9uIChjb2wpIHtcblx0aWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG5cdCAgICByZXR1cm4gZm9yZWdyb3VuZF9jb2xvcjI7XG5cdH1cblx0Zm9yZWdyb3VuZF9jb2xvcjIgPSBjb2w7XG5cdHJldHVybiBmZWF0dXJlO1xuICAgIH07XG5cbiAgICBmZWF0dXJlLmZvcmVncm91bmRfY29sb3IzID0gZnVuY3Rpb24gKGNvbCkge1xuXHRpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcblx0ICAgIHJldHVybiBmb3JlZ3JvdW5kX2NvbG9yMztcblx0fVxuXHRmb3JlZ3JvdW5kX2NvbG9yMyA9IGNvbDtcblx0cmV0dXJuIGZlYXR1cmU7XG4gICAgfTtcblxuICAgIHJldHVybiBmZWF0dXJlO1xufTtcblxudG50X2ZlYXR1cmUudmxpbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gJ0luaGVyaXQnIGZyb20gZmVhdHVyZVxuICAgIHZhciBmZWF0dXJlID0gdG50X2ZlYXR1cmUoKTtcblxuICAgIGZlYXR1cmUuY3JlYXRlIChmdW5jdGlvbiAobmV3X2VsZW1zLCB4U2NhbGUpIHtcblx0dmFyIHRyYWNrID0gdGhpcztcblx0bmV3X2VsZW1zXG5cdCAgICAuYXBwZW5kIChcImxpbmVcIilcblx0ICAgIC5hdHRyKFwieDFcIiwgZnVuY3Rpb24gKGQpIHtcblx0XHQvLyBUT0RPOiBTaG91bGQgdXNlIHRoZSBpbmRleCB2YWx1ZT9cblx0XHRyZXR1cm4geFNjYWxlKGZlYXR1cmUuaW5kZXgoKShkKSlcblx0ICAgIH0pXG5cdCAgICAuYXR0cihcIngyXCIsIGZ1bmN0aW9uIChkKSB7XG5cdFx0cmV0dXJuIHhTY2FsZShmZWF0dXJlLmluZGV4KCkoZCkpXG5cdCAgICB9KVxuXHQgICAgLmF0dHIoXCJ5MVwiLCAwKVxuXHQgICAgLmF0dHIoXCJ5MlwiLCB0cmFjay5oZWlnaHQoKSlcblx0ICAgIC5hdHRyKFwic3Ryb2tlXCIsIGZlYXR1cmUuZm9yZWdyb3VuZF9jb2xvcigpKVxuXHQgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMSk7XG4gICAgfSk7XG5cbiAgICBmZWF0dXJlLm1vdmVyIChmdW5jdGlvbiAodmxpbmVzLCB4U2NhbGUpIHtcblx0dmxpbmVzXG5cdCAgICAuc2VsZWN0KFwibGluZVwiKVxuXHQgICAgLmF0dHIoXCJ4MVwiLCBmdW5jdGlvbiAoZCkge1xuXHRcdHJldHVybiB4U2NhbGUoZmVhdHVyZS5pbmRleCgpKGQpKTtcblx0ICAgIH0pXG5cdCAgICAuYXR0cihcIngyXCIsIGZ1bmN0aW9uIChkKSB7XG5cdFx0cmV0dXJuIHhTY2FsZShmZWF0dXJlLmluZGV4KCkoZCkpO1xuXHQgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZmVhdHVyZTtcblxufTtcblxudG50X2ZlYXR1cmUuYmxvY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gJ0luaGVyaXQnIGZyb20gYm9hcmQudHJhY2suZmVhdHVyZVxuICAgIHZhciBmZWF0dXJlID0gdG50X2ZlYXR1cmUoKTtcblxuICAgIGFwaWpzKGZlYXR1cmUpXG5cdC5nZXRzZXQoJ2Zyb20nLCBmdW5jdGlvbiAoZCkge1xuXHQgICAgcmV0dXJuIGQuc3RhcnQ7XG5cdH0pXG5cdC5nZXRzZXQoJ3RvJywgZnVuY3Rpb24gKGQpIHtcblx0ICAgIHJldHVybiBkLmVuZDtcblx0fSk7XG5cbiAgICBmZWF0dXJlLmNyZWF0ZShmdW5jdGlvbiAobmV3X2VsZW1zLCB4U2NhbGUpIHtcblx0dmFyIHRyYWNrID0gdGhpcztcblx0bmV3X2VsZW1zXG5cdCAgICAuYXBwZW5kKFwicmVjdFwiKVxuXHQgICAgLmF0dHIoXCJ4XCIsIGZ1bmN0aW9uIChkLCBpKSB7XG5cdFx0Ly8gVE9ETzogc3RhcnQsIGVuZCBzaG91bGQgYmUgYWRqdXN0YWJsZSB2aWEgdGhlIHRyYWNrcyBBUElcblx0XHRyZXR1cm4geFNjYWxlKGZlYXR1cmUuZnJvbSgpKGQsIGkpKTtcblx0ICAgIH0pXG5cdCAgICAuYXR0cihcInlcIiwgMClcblx0ICAgIC5hdHRyKFwid2lkdGhcIiwgZnVuY3Rpb24gKGQsIGkpIHtcblx0XHRyZXR1cm4gKHhTY2FsZShmZWF0dXJlLnRvKCkoZCwgaSkpIC0geFNjYWxlKGZlYXR1cmUuZnJvbSgpKGQsIGkpKSk7XG5cdCAgICB9KVxuXHQgICAgLmF0dHIoXCJoZWlnaHRcIiwgdHJhY2suaGVpZ2h0KCkpXG5cdCAgICAuYXR0cihcImZpbGxcIiwgdHJhY2suYmFja2dyb3VuZF9jb2xvcigpKVxuXHQgICAgLnRyYW5zaXRpb24oKVxuXHQgICAgLmR1cmF0aW9uKDUwMClcblx0ICAgIC5hdHRyKFwiZmlsbFwiLCBmdW5jdGlvbiAoZCkge1xuXHRcdGlmIChkLmNvbG9yID09PSB1bmRlZmluZWQpIHtcblx0XHQgICAgcmV0dXJuIGZlYXR1cmUuZm9yZWdyb3VuZF9jb2xvcigpO1xuXHRcdH0gZWxzZSB7XG5cdFx0ICAgIHJldHVybiBkLmNvbG9yO1xuXHRcdH1cblx0ICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZmVhdHVyZS51cGRhdGVyKGZ1bmN0aW9uIChlbGVtcywgeFNjYWxlKSB7XG5cdGVsZW1zXG5cdCAgICAuc2VsZWN0KFwicmVjdFwiKVxuXHQgICAgLmF0dHIoXCJ3aWR0aFwiLCBmdW5jdGlvbiAoZCkge1xuXHRcdHJldHVybiAoeFNjYWxlKGQuZW5kKSAtIHhTY2FsZShkLnN0YXJ0KSk7XG5cdCAgICB9KTtcbiAgICB9KTtcblxuICAgIGZlYXR1cmUubW92ZXIoZnVuY3Rpb24gKGJsb2NrcywgeFNjYWxlKSB7XG5cdGJsb2Nrc1xuXHQgICAgLnNlbGVjdChcInJlY3RcIilcblx0ICAgIC5hdHRyKFwieFwiLCBmdW5jdGlvbiAoZCkge1xuXHRcdHJldHVybiB4U2NhbGUoZC5zdGFydCk7XG5cdCAgICB9KVxuXHQgICAgLmF0dHIoXCJ3aWR0aFwiLCBmdW5jdGlvbiAoZCkge1xuXHRcdHJldHVybiAoeFNjYWxlKGQuZW5kKSAtIHhTY2FsZShkLnN0YXJ0KSk7XG5cdCAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBmZWF0dXJlO1xuXG59O1xuXG50bnRfZmVhdHVyZS5heGlzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB4QXhpcztcbiAgICB2YXIgb3JpZW50YXRpb24gPSBcInRvcFwiO1xuXG4gICAgLy8gQXhpcyBkb2Vzbid0IGluaGVyaXQgZnJvbSBmZWF0dXJlXG4gICAgdmFyIGZlYXR1cmUgPSB7fTtcbiAgICBmZWF0dXJlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuXHR4QXhpcyA9IHVuZGVmaW5lZDtcblx0dmFyIHRyYWNrID0gdGhpcztcblx0dHJhY2suZy5zZWxlY3RBbGwoXCJyZWN0XCIpLnJlbW92ZSgpO1xuXHR0cmFjay5nLnNlbGVjdEFsbChcIi50aWNrXCIpLnJlbW92ZSgpO1xuICAgIH07XG4gICAgZmVhdHVyZS5wbG90ID0gZnVuY3Rpb24gKCkge307XG4gICAgZmVhdHVyZS5tb3ZlID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgdHJhY2sgPSB0aGlzO1xuXHR2YXIgc3ZnX2cgPSB0cmFjay5nO1xuXHRzdmdfZy5jYWxsKHhBeGlzKTtcbiAgICB9XG4gICAgXG4gICAgZmVhdHVyZS5pbml0ID0gZnVuY3Rpb24gKCkge307XG5cbiAgICBmZWF0dXJlLnVwZGF0ZSA9IGZ1bmN0aW9uICh4U2NhbGUpIHtcblx0Ly8gQ3JlYXRlIEF4aXMgaWYgaXQgZG9lc24ndCBleGlzdFxuXHRpZiAoeEF4aXMgPT09IHVuZGVmaW5lZCkge1xuXHQgICAgeEF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0LnNjYWxlKHhTY2FsZSlcblx0XHQub3JpZW50KG9yaWVudGF0aW9uKTtcblx0fVxuXG5cdHZhciB0cmFjayA9IHRoaXM7XG5cdHZhciBzdmdfZyA9IHRyYWNrLmc7XG5cdHN2Z19nLmNhbGwoeEF4aXMpO1xuICAgIH07XG5cbiAgICBmZWF0dXJlLm9yaWVudGF0aW9uID0gZnVuY3Rpb24gKHBvcykge1xuXHRpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcblx0ICAgIHJldHVybiBvcmllbnRhdGlvbjtcblx0fVxuXHRvcmllbnRhdGlvbiA9IHBvcztcblx0cmV0dXJuIGZlYXR1cmU7XG4gICAgfTtcblxuICAgIHJldHVybiBmZWF0dXJlO1xufTtcblxudG50X2ZlYXR1cmUubG9jYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJvdztcblxuICAgIHZhciBmZWF0dXJlID0ge307XG4gICAgZmVhdHVyZS5yZXNldCA9IGZ1bmN0aW9uICgpIHt9O1xuICAgIGZlYXR1cmUucGxvdCA9IGZ1bmN0aW9uICgpIHt9O1xuICAgIGZlYXR1cmUuaW5pdCA9IGZ1bmN0aW9uICgpIHt9O1xuICAgIGZlYXR1cmUubW92ZSA9IGZ1bmN0aW9uKHhTY2FsZSkge1xuXHR2YXIgZG9tYWluID0geFNjYWxlLmRvbWFpbigpO1xuXHRyb3cuc2VsZWN0KFwidGV4dFwiKVxuXHQgICAgLnRleHQoXCJMb2NhdGlvbjogXCIgKyB+fmRvbWFpblswXSArIFwiLVwiICsgfn5kb21haW5bMV0pO1xuICAgIH07XG5cbiAgICBmZWF0dXJlLnVwZGF0ZSA9IGZ1bmN0aW9uICh4U2NhbGUpIHtcblx0dmFyIHRyYWNrID0gdGhpcztcblx0dmFyIHN2Z19nID0gdHJhY2suZztcblx0dmFyIGRvbWFpbiA9IHhTY2FsZS5kb21haW4oKTtcblx0aWYgKHJvdyA9PT0gdW5kZWZpbmVkKSB7XG5cdCAgICByb3cgPSBzdmdfZztcblx0ICAgIHJvd1xuXHRcdC5hcHBlbmQoXCJ0ZXh0XCIpXG5cdFx0LnRleHQoXCJMb2NhdGlvbjogXCIgKyB+fmRvbWFpblswXSArIFwiLVwiICsgfn5kb21haW5bMV0pO1xuXHR9XG4gICAgfTtcblxuICAgIHJldHVybiBmZWF0dXJlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gdG50X2ZlYXR1cmU7XG4iLCJ2YXIgYm9hcmQgPSByZXF1aXJlIChcIi4vYm9hcmQuanNcIik7XG5ib2FyZC50cmFjayA9IHJlcXVpcmUgKFwiLi90cmFja1wiKTtcbmJvYXJkLnRyYWNrLmRhdGEgPSByZXF1aXJlIChcIi4vZGF0YS5qc1wiKTtcbmJvYXJkLnRyYWNrLmxheW91dCA9IHJlcXVpcmUgKFwiLi9sYXlvdXQuanNcIik7XG5ib2FyZC50cmFjay5mZWF0dXJlID0gcmVxdWlyZSAoXCIuL2ZlYXR1cmUuanNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGJvYXJkO1xuIiwidmFyIGFwaWpzID0gcmVxdWlyZSAoXCJ0bnQuYXBpXCIpO1xuXG4vLyB2YXIgYm9hcmQgPSB7fTtcbi8vIGJvYXJkLnRyYWNrID0ge307XG5sYXlvdXQgPSB7fTtcblxubGF5b3V0LmlkZW50aXR5ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIHZhcnMgZXhwb3NlZCBpbiB0aGUgQVBJOlxuICAgIHZhciBlbGVtZW50cztcblxuICAgIC8vIFRoZSByZXR1cm5lZCBjbG9zdXJlIC8gb2JqZWN0XG4gICAgdmFyIGwgPSBmdW5jdGlvbiAobmV3X2VsZW1lbnRzKSB7XG5cdGVsZW1lbnRzID0gbmV3X2VsZW1lbnRzO1xuICAgIH1cblxuICAgIHZhciBhcGkgPSBhcGlqcyAobClcblx0Lm1ldGhvZCAoe1xuXHQgICAgaGVpZ2h0ICAgOiBmdW5jdGlvbiAoKSB7fSxcblx0ICAgIGVsZW1lbnRzIDogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBlbGVtZW50cztcblx0ICAgIH1cblx0fSk7XG5cbiAgICByZXR1cm4gbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGxheW91dDtcbiIsInZhciBhcGlqcyA9IHJlcXVpcmUgKFwidG50LmFwaVwiKTtcbnZhciBpdGVyYXRvciA9IHJlcXVpcmUoXCJ0bnQudXRpbHNcIikuaXRlcmF0b3I7XG5cbi8vdmFyIGJvYXJkID0ge307XG5cbnZhciB0cmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciByZWFkX2NvbmYgPSB7XG5cdC8vIFVuaXF1ZSBJRCBmb3IgdGhpcyB0cmFja1xuXHRpZCA6IHRyYWNrLmlkKClcbiAgICB9O1xuXG4gICAgdmFyIGRpc3BsYXk7XG5cbiAgICB2YXIgY29uZiA9IHtcblx0Ly8gZm9yZWdyb3VuZF9jb2xvciA6IGQzLnJnYignIzAwMDAwMCcpLFxuXHRiYWNrZ3JvdW5kX2NvbG9yIDogZDMucmdiKCcjQ0NDQ0NDJyksXG5cdGhlaWdodCAgICAgICAgICAgOiAyNTAsXG5cdC8vIGRhdGEgaXMgdGhlIG9iamVjdCAobm9ybWFsbHkgYSB0bnQudHJhY2suZGF0YSBvYmplY3QpIHVzZWQgdG8gcmV0cmlldmUgYW5kIHVwZGF0ZSBkYXRhIGZvciB0aGUgdHJhY2tcblx0ZGF0YSAgICAgICAgICAgICA6IHRyYWNrLmRhdGEuZW1wdHkoKVxuICAgIH07XG5cbiAgICAvLyBUaGUgcmV0dXJuZWQgb2JqZWN0IC8gY2xvc3VyZVxuICAgIHZhciBfID0gZnVuY3Rpb24oKSB7XG4gICAgfTtcblxuICAgIC8vIEFQSVxuICAgIHZhciBhcGkgPSBhcGlqcyAoXylcblx0LmdldHNldCAoY29uZilcblx0LmdldCAocmVhZF9jb25mKTtcblxuICAgIC8vIFRPRE86IFRoaXMgbWVhbnMgdGhhdCBoZWlnaHQgc2hvdWxkIGJlIGRlZmluZWQgYmVmb3JlIGRpc3BsYXlcbiAgICAvLyB3ZSBzaG91bGRuJ3QgcmVseSBvbiB0aGlzXG4gICAgXy5kaXNwbGF5ID0gZnVuY3Rpb24gKG5ld19wbG90dGVyKSB7XG5cdGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuXHQgICAgcmV0dXJuIGRpc3BsYXk7XG5cdH1cblx0ZGlzcGxheSA9IG5ld19wbG90dGVyO1xuXHRpZiAodHlwZW9mIChkaXNwbGF5KSA9PT0gJ2Z1bmN0aW9uJykge1xuXHQgICAgZGlzcGxheS5sYXlvdXQgJiYgZGlzcGxheS5sYXlvdXQoKS5oZWlnaHQoY29uZi5oZWlnaHQpO1x0ICAgIFxuXHR9IGVsc2Uge1xuXHQgICAgZm9yICh2YXIga2V5IGluIGRpc3BsYXkpIHtcblx0XHRpZiAoZGlzcGxheS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG5cdFx0ICAgIGRpc3BsYXlba2V5XS5sYXlvdXQgJiYgZGlzcGxheVtrZXldLmxheW91dCgpLmhlaWdodChjb25mLmhlaWdodCk7XG5cdFx0fVxuXHQgICAgfVxuXHR9XG5cblx0cmV0dXJuIF87XG4gICAgfTtcblxuICAgIHJldHVybiBfO1xuXG59O1xuXG50cmFjay5pZCA9IGl0ZXJhdG9yKDEpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSB0cmFjaztcbiJdfQ==
