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

},{"./src/index":13}],3:[function(require,module,exports){
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
utils.png = require("./png.js");
module.exports = exports = utils;

},{"./png.js":7,"./reduce.js":8,"./utils.js":9}],7:[function(require,module,exports){
var png = function () {

    var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

    var scale_factor = 1;
    // var filename = 'image.png';

    // Restrict the css to apply to the following array (hrefs)
    // TODO: substitute this by an array of regexp
    var css; // If undefined, use all stylesheets
    // var inline_images_opt = true; // If true, inline images

    var img_cbak = function () {};

    var png_export = function (from_svg) {
        from_svg = from_svg.node();
        // var svg = div.querySelector('svg');

        var inline_images = function (cbak) {
            var images = d3.select(from_svg)
                .selectAll('image');

            var remaining = images[0].length;
            if (remaining === 0) {
                cbak();
            }

            images
                .each (function () {
                    var image = d3.select(this);
                    var img = new Image();
                    img.onload = function () {
                        var canvas = document.createElement('canvas');
                        var ctx = canvas.getContext('2d');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        var uri = canvas.toDataURL('image/png');
                        image.attr('href', uri);
                        remaining--;
                        if (remaining === 0) {
                            cbak();
                        }
                    };
                    img.src = image.attr('href');
            });
        };

        var move_children = function (src, dest) {
            var children = src.children || src.childNodes;
            while (children.length > 0) {
                var child = children[0];
                if (child.nodeType !== 1/*Node.ELEMENT_NODE*/) continue;
                dest.appendChild(child);
            }
            return dest;
        };

        var styling = function (dom) {
            var used = "";
            var sheets = document.styleSheets;
            // var sheets = [];
            for (var i=0; i<sheets.length; i++) {
                var href = sheets[i].href || "";
                if (css) {
                    var skip = true;
                    for (var c=0; c<css.length; c++) {
                        if (href.indexOf(css[c]) > -1) {
                            skip = false;
                            break;
                        }
                    }
                    if (skip) {
                        continue;
                    }
                }
                var rules = sheets[i].cssRules || [];
                for (var j = 0; j < rules.length; j++) {
                    var rule = rules[j];
                    if (typeof(rule.style) != "undefined") {
                        var elems = dom.querySelectorAll(rule.selectorText);
                        if (elems.length > 0) {
                            used += rule.selectorText + " { " + rule.style.cssText + " }\n";
                        }
                    }
                }
            }

            // Check if there are <defs> already
            var defs = dom.querySelector("defs") || document.createElement('defs');
            var s = document.createElement('style');
            s.setAttribute('type', 'text/css');
            s.innerHTML = "<![CDATA[\n" + used + "\n]]>";

            // var defs = document.createElement('defs');
            defs.appendChild(s);
            return defs;
        };

        inline_images (function () {
            // var svg = div.querySelector('svg');
            var outer = document.createElement("div");
            var clone = from_svg.cloneNode(true);
            var width = parseInt(clone.getAttribute('width'));
            var height = parseInt(clone.getAttribute('height'));

            clone.setAttribute("version", "1.1");
            clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
            clone.setAttribute("width", width * scale_factor);
            clone.setAttribute("height", height * scale_factor);
            var scaling = document.createElement("g");
            scaling.setAttribute("transform", "scale(" + scale_factor + ")");
            clone.appendChild(move_children(clone, scaling));
            outer.appendChild(clone);

            clone.insertBefore (styling(clone), clone.firstChild);

            var svg = doctype + outer.innerHTML;
            svg = svg.replace ("none", "block"); // In case the svg is not being displayed, it is ignored in FF
            var image = new Image();

            image.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svg)));
            image.onload = function() {
                var canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                var context = canvas.getContext('2d');
                context.drawImage(image, 0, 0);

                var src = canvas.toDataURL('image/png');
                img_cbak (src);
                // var a = document.createElement('a');
                // a.download = filename;
                // a.href = canvas.toDataURL('image/png');
                // document.body.appendChild(a);
                // a.click();
            };
        });

    };
    png_export.scale_factor = function (f) {
        if (!arguments.length) {
            return scale_factor;
        }
        scale_factor = f;
        return this;
    };

    png_export.callback = function (cbak) {
        if (!arguments.length) {
            return img_cbak;
        }
        img_cbak = cbak;
        return this;
    };

    png_export.stylesheets = function (restrictCss) {
        if (!arguments.length) {
            return css;
        }
        css = restrictCss;
        return this;
    };

    // png_export.filename = function (f) {
    // 	if (!arguments.length) {
    // 	    return filename;
    // 	}
    // 	filename = f;
    // 	return png_export;
    // };

    return png_export;
};

var download = function () {

    var filename = 'image.png';
    var max_size = {
        limit: Infinity,
        onError: function () {
            console.log("image too large");
        }
    };

    var png_export = png()
        .callback (function (src) {
            var a = document.createElement('a');
            a.download = filename;
            a.href = src;
            document.body.appendChild(a);

            if (a.href.length > max_size.limit) {
                a.parentNode.removeChild(a);
                max_size.onError();
            } else {
                a.click();
            }
            // setTimeout(function () {
            //     a.click();
            // }, 3000);
        });

    png_export.filename = function (fn) {
        if (!arguments.length) {
            return filename;
        }
        filename = fn;
        return png_export;
    };

    png_export.limit = function (l) {
        if (!arguments.length) {
            return max_size;
        }
        max_size = l;
        return this;
    };

    return png_export;
};

module.exports = exports = download;

},{}],8:[function(require,module,exports){
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


},{}],9:[function(require,module,exports){

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
            var args = Array.prototype.slice.call(arguments);
            var that = this;
            clearTimeout(tick);
            tick = setTimeout (function () {
                cbak.apply (that, args);
            }, time);
        };

        return defer_cancel;
    }
};

},{}],10:[function(require,module,exports){
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

    // Limit caps
    var caps = {
        left : undefined,
        right : undefined
    };
    var cap_width = 3;


    // TODO: We have now background color in the tracks. Can this be removed?
    // It looks like it is used in the too-wide pane etc, but it may not be needed anymore
    var bgColor   = d3.rgb('#F8FBEF'); //#F8FBEF
    var pane; // Draggable pane
    var svg_g;
    var xScale;
    var zoomEventHandler = d3.behavior.zoom();
    var limits = {
        min : 0,
        max : 1000,
        zoom_out : 1000,
        zoom_in  : 100
    };
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
    	    .style("width", (width + cap_width*2 + exports.extend_canvas.right + exports.extend_canvas.left) + "px");

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
    	caps.left = svg_g
    	    .append("rect")
    	    .attr("id", "tnt_" + div_id + "_5pcap")
    	    .attr("x", 0)
    	    .attr("y", 0)
    	    .attr("width", 0)
    	    .attr("height", height)
    	    .attr("fill", "red");
    	caps.right = svg_g
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
        // make sure that zoom_out is within the min-max range
        if ((limits.max - limits.min) < limits.zoom_out) {
            limits.zoom_out = limits.max - limits.min;
        }

        plot();

        // Reset the tracks
        for (var i=0; i<tracks.length; i++) {
            if (tracks[i].g) {
                //    tracks[i].display().reset.call(tracks[i]);
                tracks[i].g.remove();
            }
            _init_track(tracks[i]);
        }
        _place_tracks();

        // The continuation callback
        var cont = function () {

            if ((loc.to - loc.from) < limits.zoom_in) {
                if ((loc.from + limits.zoom_in) > limits.max) {
                    loc.to = limits.max;
                } else {
                    loc.to = loc.from + limits.zoom_in;
                }
            }

            for (var i=0; i<tracks.length; i++) {
                _update_track(tracks[i], loc);
            }
        };

        cont();
    });

    api.method ('update', function () {
    	for (var i=0; i<tracks.length; i++) {
    	    _update_track (tracks[i]);
    	}
    });

    var _update_track = function (track, where) {
    	if (track.data()) {
    	    var track_data = track.data();
            var data_updater = track_data;

    	    data_updater.call(track, {
                'loc' : where,
                'on_success' : function () {
                    track.display().update.call(track, where);
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

    var _reorder = function (new_tracks) {
        // TODO: This is defining a new height, but the global height is used to define the size of several
        // parts. We should do this dynamically

        var found_indexes = [];
        for (var j=0; j<new_tracks.length; j++) {
            var found = false;
            for (var i=0; i<tracks.length; i++) {
                if (tracks[i].id() === new_tracks[j].id()) {
                    found = true;
                    found_indexes[i] = true;
                    // tracks.splice(i,1);
                    break;
                }
            }
            if (!found) {
                _init_track(new_tracks[j]);
                _update_track(new_tracks[j], {from : loc.from, to : loc.to});
            }
        }

        for (var x=0; x<tracks.length; x++) {
            if (!found_indexes[x]) {
                tracks[x].g.remove();
            }
        }

        tracks = new_tracks;
        _place_tracks();
    };

    // right/left/zoom pans or zooms the track. These methods are exposed to allow external buttons, etc to interact with the tracks. The argument is the amount of panning/zooming (ie. 1.2 means 20% panning) With left/right only positive numbers are allowed.
    api.method ('scroll', function (factor) {
        var amount = Math.abs(factor);
    	if (factor > 0) {
    	    _manual_move(amount, 1);
    	} else if (factor < 0){
            _manual_move(amount, -1);
        }
    });

    api.method ('zoom', function (factor) {
        _manual_move(1/factor, 0);
    });

    api.method ('find_track', function (id) {
        for (var i=0; i<tracks.length; i++) {
            if (tracks[i].id() === id) {
                return tracks[i];
            }
        }
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

    api.method('tracks', function (ts) {
        if (!arguments.length) {
            return tracks;
        }
        _reorder(ts);
        return this;
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
    	    w = min_width;
    	}

    	// We are resizing
    	if (div_id !== undefined) {
    	    d3.select("#tnt_" + div_id).select("svg").attr("width", w);
    	    // Resize the zooming/panning pane
    	    d3.select("#tnt_" + div_id).style("width", (parseInt(w) + cap_width*2) + "px");
    	    d3.select("#tnt_" + div_id + "_pane").attr("width", w);
            caps.right
                .attr("x", w-cap_width);

    	    // Replot
    	    width = w;
            xScale.range([0, width]);

    	    plot();
    	    for (var i=0; i<tracks.length; i++) {
        		tracks[i].g.select("rect").attr("width", w);
                tracks[i].display().scale(xScale);
        		tracks[i].display().reset.call(tracks[i]);
                tracks[i].display().init.call(tracks[i], w);
        		tracks[i].display().update.call(tracks[i], loc);
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
            .each(function (d) {
                move_to_front(this);
            });

        d3.select("#tnt_" + div_id + "_3pcap")
            .attr("height", h)
            .each (function (d) {
                move_to_front(this);
            });

        // pane
        pane
            .attr("height", h + height_offset);

        return track_vis;
    };

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
    	    .style("fill", track.color())
    	    .style("pointer-events", "none");

    	if (track.display()) {
    	    track.display()
                .scale(xScale)
                .init.call(track, width);
    	}

    	return track_vis;
    };

    var _manual_move = function (factor, direction) {
        var oldDomain = xScale.domain();

    	var span = oldDomain[1] - oldDomain[0];
    	var offset = (span * factor) - span;

    	var newDomain;
    	switch (direction) {
            case 1 :
            newDomain = [(~~oldDomain[0] - offset), ~~(oldDomain[1] - offset)];
    	    break;
        	case -1 :
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
    	if (domain[0] <= (limits.min + 5)) {
    	    d3.select("#tnt_" + div_id + "_5pcap")
    		.attr("width", cap_width)
    		.transition()
    		.duration(200)
    		.attr("width", 0);
    	}

    	if (domain[1] >= (limits.max)-5) {
    	    d3.select("#tnt_" + div_id + "_3pcap")
    		.attr("width", cap_width)
    		.transition()
    		.duration(200)
    		.attr("width", 0);
    	}


    	// Avoid moving past the limits
    	if (domain[0] < limits.min) {
    	    zoomEventHandler.translate([zoomEventHandler.translate()[0] - xScale(limits.min) + xScale.range()[0], zoomEventHandler.translate()[1]]);
    	} else if (domain[1] > limits.max) {
    	    zoomEventHandler.translate([zoomEventHandler.translate()[0] - xScale(limits.max) + xScale.range()[1], zoomEventHandler.translate()[1]]);
    	}

    	_deferred();

    	for (var i = 0; i < tracks.length; i++) {
    	    var track = tracks[i];
    	    track.display().mover.call(track);
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

},{"tnt.api":3,"tnt.utils":5}],11:[function(require,module,exports){
var apijs = require ("tnt.api");
var spinner = require ("./spinner.js")();

tnt_data = {};

tnt_data.sync = function() {
    var update_track = function(obj) {
        var track = this;
        track.data().elements(update_track.retriever().call(track, obj.loc));
        obj.on_success();
    };

    apijs (update_track)
        .getset ('elements', [])
        .getset ('retriever', function () {});

    return update_track;
};

tnt_data.async = function () {
    var update_track = function (obj) {
        var track = this;
        spinner.on.call(track);
        update_track.retriever().call(track, obj.loc)
            .then (function (resp) {
                track.data().elements(resp);
                obj.on_success();
                spinner.off.call(track);
            });
    };

    var api = apijs (update_track)
        .getset ('elements', [])
        .getset ('retriever');

    return update_track;
};


// A predefined track displaying no external data
// it is used for location and axis tracks for example
tnt_data.empty = function () {
    var updater = tnt_data.sync();

    return updater;
};

module.exports = exports = tnt_data;

},{"./spinner.js":15,"tnt.api":3}],12:[function(require,module,exports){
var apijs = require ("tnt.api");
var layout = require("./layout.js");

// FEATURE VIS
// var board = {};
// board.track = {};
var tnt_feature = function () {
    var dispatch = d3.dispatch ("click", "dblclick", "mouseover", "mouseout");

    ////// Vars exposed in the API
    var config = {
        create   : function () {throw "create_elem is not defined in the base feature object";},
        move    : function () {throw "move_elem is not defined in the base feature object";},
        distribute  : function () {},
        fixed   : function () {},
        //layout   : function () {},
        index    : undefined,
        layout   : layout.identity(),
        color : '#000',
        scale : undefined
    };


    // The returned object
    var feature = {};

    var reset = function () {
    	var track = this;
    	track.g.selectAll(".tnt_elem").remove();
        track.g.selectAll(".tnt_guider").remove();
        track.g.selectAll(".tnt_fixed").remove();
    };

    var init = function (width) {
        var track = this;

        track.g
            .append ("text")
            .attr ("class", "tnt_fixed")
            .attr ("x", 5)
            .attr ("y", 12)
            .attr ("font-size", 11)
            .attr ("fill", "grey")
            .text (track.label());

        config.fixed.call(track, width);
    };

    var plot = function (new_elems, track, xScale) {
        new_elems.on("click", function (d, i) {
            if (d3.event.defaultPrevented) {
                return;
            }
            dispatch.click.call(this, d, i);
        });
        new_elems.on("mouseover", function (d, i) {
            if (d3.event.defaultPrevented) {
                return;
            }
            dispatch.mouseover.call(this, d, i);
        });
        new_elems.on("dblclick", function (d, i) {
            if (d3.event.defaultPrevented) {
                return;
            }
            dispatch.dblclick.call(this, d, i);
        });
        new_elems.on("mouseout", function (d, i) {
            if (d3.event.defaultPrevented) {
                return;
            }
            dispatch.mouseout.call(this, d, i);
        });
        // new_elem is a g element the feature is inserted
        config.create.call(track, new_elems, xScale);
    };

    var update = function (loc, field) {
        var track = this;
        var svg_g = track.g;

        var elements = track.data().elements();

        if (field !== undefined) {
            elements = elements[field];
        }

        var data_elems = config.layout.call(track, elements);


        if (data_elems === undefined) {
            return;
        }

        var vis_sel;
        var vis_elems;
        if (field !== undefined) {
            vis_sel = svg_g.selectAll(".tnt_elem_" + field);
        } else {
            vis_sel = svg_g.selectAll(".tnt_elem");
        }

        if (config.index) { // Indexing by field
            vis_elems = vis_sel
                .data(data_elems, function (d) {
                    if (d !== undefined) {
                        return config.index(d);
                    }
                });
        } else { // Indexing by position in array
            vis_elems = vis_sel
                .data(data_elems);
        }

        config.distribute.call(track, vis_elems, config.scale);

    	var new_elem = vis_elems
    	    .enter();

    	new_elem
    	    .append("g")
    	    .attr("class", "tnt_elem")
    	    .classed("tnt_elem_" + field, field)
    	    .call(feature.plot, track, config.scale);

    	vis_elems
    	    .exit()
    	    .remove();
    };

    var mover = function (field) {
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

    	config.move.call(this, elems);
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
    	.getset (config)
    	.method ({
    	    reset  : reset,
    	    plot   : plot,
    	    update : update,
    	    mover   : mover,
    	    init   : init,
    	    move_to_front : move_to_front
    	});

    return d3.rebind(feature, dispatch, "on");
};

tnt_feature.composite = function () {
    var displays = {};
    var display_order = [];

    var features = {};

    var reset = function () {
    	var track = this;
        for (var display in displays) {
            if (displays.hasOwnProperty(display)) {
                displays[display].reset.call(track);
            }
        }
    };

    var init = function (width) {
        var track = this;
        for (var display in displays) {
            if (displays.hasOwnProperty(display)) {
                displays[display].scale(features.scale());
                displays[display].init.call(track, width);
            }
        }
    };

    var update = function () {
    	var track = this;
    	for (var i=0; i<display_order.length; i++) {
    	    displays[display_order[i]].update.call(track, undefined, display_order[i]);
    	    displays[display_order[i]].move_to_front.call(track, display_order[i]);
    	}
        // for (var display in displays) {
        //     if (displays.hasOwnProperty(display)) {
        //         displays[display].update.call(track, xScale, display);
        //     }
        // }
    };

    var mover = function () {
        var track = this;
        for (var display in displays) {
            if (displays.hasOwnProperty(display)) {
                displays[display].mover.call(track, display);
            }
        }
    };

    var add = function (key, display) {
    	displays[key] = display;
    	display_order.push(key);
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
        .getset("scale")
    	.method ({
    	    reset  : reset,
    	    update : update,
    	    mover   : mover,
    	    init   : init,
    	    add    : add,
    	    displays : get_displays
    	});

    return features;
};

tnt_feature.area = function () {
    var feature = tnt_feature.line();
    var line = feature.line();

    var area = d3.svg.area()
    	.interpolate(line.interpolate())
    	.tension(feature.tension());

    var data_points;

    var line_create = feature.create(); // We 'save' line creation

    feature.create (function (points) {
    	var track = this;
        var xScale = feature.scale();

    	if (data_points !== undefined) {
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
    	    .attr("fill", d3.rgb(feature.color()).brighter());
    });

    var line_move = feature.move();
    feature.move (function (path) {
    	var track = this;
        var xScale = feature.scale();
    	line_move.call(track, path, xScale);

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
    feature.create (function (points) {
    	var track = this;
        var xScale = feature.scale();

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
    	    });

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
    	    .style("stroke", feature.color())
    	    .style("stroke-width", 4)
    	    .style("fill", "none");
    });

    feature.move (function (path) {
    	var track = this;
        var xScale = feature.scale();

    	line.x(function (d) {
    	    return xScale(x(d));
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
        feature.create  (function (points) {
        	var track = this;
            var xScale = feature.scale();
        	area_create.call(track, d3.select(points[0][0]), xScale);
        });

    return feature;
};

tnt_feature.ensembl = function () {
    // 'Inherit' from board.track.feature
    var feature = tnt_feature();

    var color2 = "#7FFF00";
    var color3 = "#00BB00";

    feature.fixed (function (width) {
    	var track = this;
    	var height_offset = ~~(track.height() - (track.height()  * 0.8)) / 2;

    	track.g
    	    .append("line")
    	    .attr("class", "tnt_guider tnt_fixed")
    	    .attr("x1", 0)
    	    .attr("x2", width)
    	    .attr("y1", height_offset)
    	    .attr("y2", height_offset)
    	    .style("stroke", feature.color())
    	    .style("stroke-width", 1);

    	track.g
    	    .append("line")
    	    .attr("class", "tnt_guider tnt_fixed")
    	    .attr("x1", 0)
    	    .attr("x2", width)
    	    .attr("y1", track.height() - height_offset)
    	    .attr("y2", track.height() - height_offset)
    	    .style("stroke", feature.color())
    	    .style("stroke-width", 1);

    });

    feature.create (function (new_elems) {
    	var track = this;
        var xScale = feature.scale();

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
    	    .attr("fill", track.color())
    	    .transition()
    	    .duration(500)
    	    .attr("fill", function (d) {
        		if (d.type === 'high') {
        		    return d3.rgb(feature.color());
        		}
        		if (d.type === 'low') {
        		    return d3.rgb(feature.color2());
        		}
        		return d3.rgb(feature.color3());
    	    });
    });

    feature.distribute (function (blocks) {
        var xScale = feature.scale();
    	blocks
    	    .select("rect")
    	    .attr("width", function (d) {
                return (xScale(d.end) - xScale(d.start));
    	    });
    });

    feature.move (function (blocks) {
        var xScale = feature.scale();
    	blocks
    	    .select("rect")
    	    .attr("x", function (d) {
                return xScale(d.start);
    	    })
    	    .attr("width", function (d) {
                return (xScale(d.end) - xScale(d.start));
    	    });
    });

    feature.color2 = function (col) {
    	if (!arguments.length) {
    	    return color2;
    	}
    	color2 = col;
    	return feature;
    };

    feature.color3 = function (col) {
    	if (!arguments.length) {
    	    return color3;
    	}
    	color3 = col;
    	return feature;
    };

    return feature;
};

tnt_feature.vline = function () {
    // 'Inherit' from feature
    var feature = tnt_feature();

    feature.create (function (new_elems) {
        var xScale = feature.scale();
    	var track = this;
    	new_elems
    	    .append ("line")
    	    .attr("x1", function (d) {
                return xScale(feature.index()(d));
    	    })
    	    .attr("x2", function (d) {
                return xScale(feature.index()(d));
    	    })
    	    .attr("y1", 0)
    	    .attr("y2", track.height())
    	    .attr("stroke", feature.color())
    	    .attr("stroke-width", 1);
    });

    feature.move (function (vlines) {
        var xScale = feature.scale();
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


    feature.create (function (new_pins) {
    	var track = this;
        var xScale = feature.scale();
    	yScale
    	    .domain(feature.domain())
    	    .range([pin_ball_r, track.height()-pin_ball_r-10]); // 10 for labelling

    	// pins are composed of lines, circles and labels
    	new_pins
    	    .append("line")
    	    .attr("x1", function (d, i) {
    	    	return xScale(d[opts.pos(d, i)]);
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
    	    .attr("stroke", function (d) {
                return d3.functor(feature.color())(d);
            });

    	new_pins
    	    .append("circle")
    	    .attr("cx", function (d, i) {
                return xScale(d[opts.pos(d, i)]);
    	    })
    	    .attr("cy", function (d, i) {
                return track.height() - yScale(d[opts.val(d, i)]);
    	    })
    	    .attr("r", pin_ball_r)
    	    .attr("fill", function (d) {
                return d3.functor(feature.color())(d);
            });

        new_pins
            .append("text")
            .attr("font-size", "13")
            .attr("x", function (d, i) {
                return xScale(d[opts.pos(d, i)]);
            })
            .attr("y", function (d, i) {
                return 10;
            })
            .style("text-anchor", "middle")
            .text(function (d) {
                return d.label || "";
            });

    });

    feature.distribute (function (pins) {
        pins
            .select("text")
            .text(function (d) {
                return d.label || "";
            });
    });

    feature.move(function (pins) {
    	var track = this;
        var xScale = feature.scale();

    	pins
    	    //.each(position_pin_line)
    	    .select("line")
    	    .attr("x1", function (d, i) {
                return xScale(d[opts.pos(d, i)]);
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

        pins
            .select("text")
            .attr("x", function (d, i) {
                return xScale(d[opts.pos(d, i)]);
            })
            .text(function (d) {
                return d.label || "";
            });

    });

    feature.fixed (function (width) {
        var track = this;
        track.g
            .append("line")
            .attr("class", "tnt_fixed")
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

    feature.create(function (new_elems) {
    	var track = this;
        var xScale = feature.scale();
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
    	    .attr("fill", track.color())
    	    .transition()
    	    .duration(500)
    	    .attr("fill", function (d) {
        		if (d.color === undefined) {
        		    return feature.color();
        		} else {
        		    return d.color;
        		}
    	    });
    });

    feature.distribute(function (elems) {
        var xScale = feature.scale();
    	elems
    	    .select("rect")
    	    .attr("width", function (d) {
        		return (xScale(d.end) - xScale(d.start));
    	    });
    });

    feature.move(function (blocks) {
        var xScale = feature.scale();
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
    var xScale;

    // Axis doesn't inherit from feature
    var feature = {};
    feature.reset = function () {
    	xAxis = undefined;
    	var track = this;
    	track.g.selectAll(".tick").remove();
    };
    feature.plot = function () {};
    feature.mover = function () {
    	var track = this;
    	var svg_g = track.g;
    	svg_g.call(xAxis);
    };

    feature.init = function () {
        xAxis = undefined;
    };

    feature.update = function () {
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
    	return this;
    };

    feature.scale = function (s) {
        if (!arguments.length) {
            return xScale;
        }
        xScale = s;
        return this;
    };

    return feature;
};

tnt_feature.location = function () {
    var row;
    var xScale;

    var feature = {};
    feature.reset = function () {
        row = undefined;
    };
    feature.plot = function () {};
    feature.init = function () {
        row = undefined;
        var track = this;
        track.g.select("text").remove();
    };
    feature.mover = function() {
    	var domain = xScale.domain();
    	row.select("text")
    	    .text("Location: " + ~~domain[0] + "-" + ~~domain[1]);
    };

    feature.scale = function (sc) {
        if (!arguments.length) {
            return xScale;
        }
        xScale = sc;
        return this;
    };

    feature.update = function (loc) {
    	var track = this;
    	var svg_g = track.g;
    	var domain = xScale.domain();
    	if (row === undefined) {
    	    row = svg_g;
    	    row
        		.append("text")
        		.text("Location: " + Math.round(domain[0]) + "-" + Math.round(domain[1]));
    	}
    };

    return feature;
};

module.exports = exports = tnt_feature;

},{"./layout.js":14,"tnt.api":3}],13:[function(require,module,exports){
var board = require ("./board.js");
board.track = require ("./track");
board.track.data = require ("./data.js");
board.track.layout = require ("./layout.js");
board.track.feature = require ("./feature.js");
board.track.layout = require ("./layout.js");

module.exports = exports = board;

},{"./board.js":10,"./data.js":11,"./feature.js":12,"./layout.js":14,"./track":16}],14:[function(require,module,exports){
var apijs = require ("tnt.api");

// var board = {};
// board.track = {};
var layout = function () {

    // The returned closure / object
    var l = function (new_elems)  {
        var track = this;
        l.elements().call(track, new_elems);
        return new_elems;
    };

    var api = apijs(l)
        .getset ('elements', function () {});

    return l;
};

layout.identity = function () {
    return layout()
        .elements (function (e) {
            return e;
        });
};

module.exports = exports = layout;

},{"tnt.api":3}],15:[function(require,module,exports){
var spinner = function () {
    // var n = 0;
    var sp_elem;
    var sp = {};

    sp.on = function () {
        var track = this;
        if (!track.spinner) {
            track.spinner = 1;
        } else {
            track.spinner++;
        }
        if (track.spinner==1) {
            var container = track.g;
            var bgColor = track.color();
            sp_elem = container
                .append("svg")
                .attr("class", "tnt_spinner")
                .attr("width", "30px")
                .attr("height", "30px")
                .attr("xmls", "http://www.w3.org/2000/svg")
                .attr("viewBox", "0 0 100 100")
                .attr("preserveAspectRatio", "xMidYMid");


            sp_elem
                .append("rect")
                .attr("x", '0')
                .attr("y", '0')
                .attr("width", "100")
                .attr("height", "100")
                .attr("rx", '50')
                .attr("ry", '50')
                .attr("fill", bgColor);
                //.attr("opacity", 0.6);

            for (var i=0; i<12; i++) {
                tick(sp_elem, i, bgColor);
            }

        } else if (track.spinner>0){
            // Move the spinner to front
            var node = sp_elem.node();
            if (node.parentNode) {
                node.parentNode.appendChild(node);
            }
        }
    };

    sp.off = function () {
        var track = this;
        track.spinner--;
        if (!track.spinner) {
            var container = track.g;
            container.selectAll(".tnt_spinner")
                .remove();

        }
    };

    function tick (elem, i, bgColor) {
        elem
            .append("rect")
            .attr("x", "46.5")
            .attr("y", '40')
            .attr("width", "7")
            .attr("height", "20")
            .attr("rx", "5")
            .attr("ry", "5")
            .attr("fill", d3.rgb(bgColor).darker(2))
            .attr("transform", "rotate(" + (360/12)*i + " 50 50) translate(0 -30)")
            .append("animate")
            .attr("attributeName", "opacity")
            .attr("from", "1")
            .attr("to", "0")
            .attr("dur", "1s")
            .attr("begin", (1/12)*i + "s")
            .attr("repeatCount", "indefinite");

    }

    return sp;
};
module.exports = exports = spinner;

},{}],16:[function(require,module,exports){
var apijs = require ("tnt.api");
var iterator = require("tnt.utils").iterator;


var track = function () {
    "use strict";

    var display;

    var conf = {
    	color : d3.rgb('#CCCCCC'),
    	height           : 250,
    	// data is the object (normally a tnt.track.data object) used to retrieve and update data for the track
    	data             : track.data.empty(),
        // display          : undefined,
        label            : "",
        id               : track.id()
    };

    // The returned object / closure
    var t = {};

    // API
    var api = apijs (t)
    	.getset (conf);

    // TODO: This means that height should be defined before display
    // we shouldn't rely on this
    t.display = function (new_plotter) {
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

        return this;
    };

    return t;
};

track.id = iterator(1);

module.exports = exports = track;

},{"tnt.api":3,"tnt.utils":5}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9waWduYXRlbGxpL3NyYy9yZXBvcy90bnQuYm9hcmQvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3BpZ25hdGVsbGkvc3JjL3JlcG9zL3RudC5ib2FyZC9mYWtlX2E2ZDZjNDI5LmpzIiwiL1VzZXJzL3BpZ25hdGVsbGkvc3JjL3JlcG9zL3RudC5ib2FyZC9pbmRleC5qcyIsIi9Vc2Vycy9waWduYXRlbGxpL3NyYy9yZXBvcy90bnQuYm9hcmQvbm9kZV9tb2R1bGVzL3RudC5hcGkvaW5kZXguanMiLCIvVXNlcnMvcGlnbmF0ZWxsaS9zcmMvcmVwb3MvdG50LmJvYXJkL25vZGVfbW9kdWxlcy90bnQuYXBpL3NyYy9hcGkuanMiLCIvVXNlcnMvcGlnbmF0ZWxsaS9zcmMvcmVwb3MvdG50LmJvYXJkL25vZGVfbW9kdWxlcy90bnQudXRpbHMvaW5kZXguanMiLCIvVXNlcnMvcGlnbmF0ZWxsaS9zcmMvcmVwb3MvdG50LmJvYXJkL25vZGVfbW9kdWxlcy90bnQudXRpbHMvc3JjL2luZGV4LmpzIiwiL1VzZXJzL3BpZ25hdGVsbGkvc3JjL3JlcG9zL3RudC5ib2FyZC9ub2RlX21vZHVsZXMvdG50LnV0aWxzL3NyYy9wbmcuanMiLCIvVXNlcnMvcGlnbmF0ZWxsaS9zcmMvcmVwb3MvdG50LmJvYXJkL25vZGVfbW9kdWxlcy90bnQudXRpbHMvc3JjL3JlZHVjZS5qcyIsIi9Vc2Vycy9waWduYXRlbGxpL3NyYy9yZXBvcy90bnQuYm9hcmQvbm9kZV9tb2R1bGVzL3RudC51dGlscy9zcmMvdXRpbHMuanMiLCIvVXNlcnMvcGlnbmF0ZWxsaS9zcmMvcmVwb3MvdG50LmJvYXJkL3NyYy9ib2FyZC5qcyIsIi9Vc2Vycy9waWduYXRlbGxpL3NyYy9yZXBvcy90bnQuYm9hcmQvc3JjL2RhdGEuanMiLCIvVXNlcnMvcGlnbmF0ZWxsaS9zcmMvcmVwb3MvdG50LmJvYXJkL3NyYy9mZWF0dXJlLmpzIiwiL1VzZXJzL3BpZ25hdGVsbGkvc3JjL3JlcG9zL3RudC5ib2FyZC9zcmMvaW5kZXguanMiLCIvVXNlcnMvcGlnbmF0ZWxsaS9zcmMvcmVwb3MvdG50LmJvYXJkL3NyYy9sYXlvdXQuanMiLCIvVXNlcnMvcGlnbmF0ZWxsaS9zcmMvcmVwb3MvdG50LmJvYXJkL3NyYy9zcGlubmVyLmpzIiwiL1VzZXJzL3BpZ25hdGVsbGkvc3JjL3JlcG9zL3RudC5ib2FyZC9zcmMvdHJhY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOTFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaWYgKHR5cGVvZiB0bnQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHRudCA9IHt9O1xufVxuXG50bnQuYm9hcmQgPSByZXF1aXJlKFwiLi9pbmRleC5qc1wiKTtcbiIsIi8vIGlmICh0eXBlb2YgdG50ID09PSBcInVuZGVmaW5lZFwiKSB7XG4vLyAgICAgbW9kdWxlLmV4cG9ydHMgPSB0bnQgPSB7fVxuLy8gfVxuLy8gdG50LnV0aWxzID0gcmVxdWlyZShcInRudC51dGlsc1wiKTtcbi8vIHRudC50b29sdGlwID0gcmVxdWlyZShcInRudC50b29sdGlwXCIpO1xuLy8gdG50LmJvYXJkID0gcmVxdWlyZShcIi4vc3JjL2luZGV4LmpzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL3NyYy9pbmRleFwiKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vc3JjL2FwaS5qc1wiKTtcbiIsInZhciBhcGkgPSBmdW5jdGlvbiAod2hvKSB7XG5cbiAgICB2YXIgX21ldGhvZHMgPSBmdW5jdGlvbiAoKSB7XG5cdHZhciBtID0gW107XG5cblx0bS5hZGRfYmF0Y2ggPSBmdW5jdGlvbiAob2JqKSB7XG5cdCAgICBtLnVuc2hpZnQob2JqKTtcblx0fTtcblxuXHRtLnVwZGF0ZSA9IGZ1bmN0aW9uIChtZXRob2QsIHZhbHVlKSB7XG5cdCAgICBmb3IgKHZhciBpPTA7IGk8bS5sZW5ndGg7IGkrKykge1xuXHRcdGZvciAodmFyIHAgaW4gbVtpXSkge1xuXHRcdCAgICBpZiAocCA9PT0gbWV0aG9kKSB7XG5cdFx0XHRtW2ldW3BdID0gdmFsdWU7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHQgICAgfVxuXHRcdH1cblx0ICAgIH1cblx0ICAgIHJldHVybiBmYWxzZTtcblx0fTtcblxuXHRtLmFkZCA9IGZ1bmN0aW9uIChtZXRob2QsIHZhbHVlKSB7XG5cdCAgICBpZiAobS51cGRhdGUgKG1ldGhvZCwgdmFsdWUpICkge1xuXHQgICAgfSBlbHNlIHtcblx0XHR2YXIgcmVnID0ge307XG5cdFx0cmVnW21ldGhvZF0gPSB2YWx1ZTtcblx0XHRtLmFkZF9iYXRjaCAocmVnKTtcblx0ICAgIH1cblx0fTtcblxuXHRtLmdldCA9IGZ1bmN0aW9uIChtZXRob2QpIHtcblx0ICAgIGZvciAodmFyIGk9MDsgaTxtLmxlbmd0aDsgaSsrKSB7XG5cdFx0Zm9yICh2YXIgcCBpbiBtW2ldKSB7XG5cdFx0ICAgIGlmIChwID09PSBtZXRob2QpIHtcblx0XHRcdHJldHVybiBtW2ldW3BdO1xuXHRcdCAgICB9XG5cdFx0fVxuXHQgICAgfVxuXHR9O1xuXG5cdHJldHVybiBtO1xuICAgIH07XG5cbiAgICB2YXIgbWV0aG9kcyAgICA9IF9tZXRob2RzKCk7XG4gICAgdmFyIGFwaSA9IGZ1bmN0aW9uICgpIHt9O1xuXG4gICAgYXBpLmNoZWNrID0gZnVuY3Rpb24gKG1ldGhvZCwgY2hlY2ssIG1zZykge1xuXHRpZiAobWV0aG9kIGluc3RhbmNlb2YgQXJyYXkpIHtcblx0ICAgIGZvciAodmFyIGk9MDsgaTxtZXRob2QubGVuZ3RoOyBpKyspIHtcblx0XHRhcGkuY2hlY2sobWV0aG9kW2ldLCBjaGVjaywgbXNnKTtcblx0ICAgIH1cblx0ICAgIHJldHVybjtcblx0fVxuXG5cdGlmICh0eXBlb2YgKG1ldGhvZCkgPT09ICdmdW5jdGlvbicpIHtcblx0ICAgIG1ldGhvZC5jaGVjayhjaGVjaywgbXNnKTtcblx0fSBlbHNlIHtcblx0ICAgIHdob1ttZXRob2RdLmNoZWNrKGNoZWNrLCBtc2cpO1xuXHR9XG5cdHJldHVybiBhcGk7XG4gICAgfTtcblxuICAgIGFwaS50cmFuc2Zvcm0gPSBmdW5jdGlvbiAobWV0aG9kLCBjYmFrKSB7XG5cdGlmIChtZXRob2QgaW5zdGFuY2VvZiBBcnJheSkge1xuXHQgICAgZm9yICh2YXIgaT0wOyBpPG1ldGhvZC5sZW5ndGg7IGkrKykge1xuXHRcdGFwaS50cmFuc2Zvcm0gKG1ldGhvZFtpXSwgY2Jhayk7XG5cdCAgICB9XG5cdCAgICByZXR1cm47XG5cdH1cblxuXHRpZiAodHlwZW9mIChtZXRob2QpID09PSAnZnVuY3Rpb24nKSB7XG5cdCAgICBtZXRob2QudHJhbnNmb3JtIChjYmFrKTtcblx0fSBlbHNlIHtcblx0ICAgIHdob1ttZXRob2RdLnRyYW5zZm9ybShjYmFrKTtcblx0fVxuXHRyZXR1cm4gYXBpO1xuICAgIH07XG5cbiAgICB2YXIgYXR0YWNoX21ldGhvZCA9IGZ1bmN0aW9uIChtZXRob2QsIG9wdHMpIHtcblx0dmFyIGNoZWNrcyA9IFtdO1xuXHR2YXIgdHJhbnNmb3JtcyA9IFtdO1xuXG5cdHZhciBnZXR0ZXIgPSBvcHRzLm9uX2dldHRlciB8fCBmdW5jdGlvbiAoKSB7XG5cdCAgICByZXR1cm4gbWV0aG9kcy5nZXQobWV0aG9kKTtcblx0fTtcblxuXHR2YXIgc2V0dGVyID0gb3B0cy5vbl9zZXR0ZXIgfHwgZnVuY3Rpb24gKHgpIHtcblx0ICAgIGZvciAodmFyIGk9MDsgaTx0cmFuc2Zvcm1zLmxlbmd0aDsgaSsrKSB7XG5cdFx0eCA9IHRyYW5zZm9ybXNbaV0oeCk7XG5cdCAgICB9XG5cblx0ICAgIGZvciAodmFyIGo9MDsgajxjaGVja3MubGVuZ3RoOyBqKyspIHtcblx0XHRpZiAoIWNoZWNrc1tqXS5jaGVjayh4KSkge1xuXHRcdCAgICB2YXIgbXNnID0gY2hlY2tzW2pdLm1zZyB8fCBcblx0XHRcdChcIlZhbHVlIFwiICsgeCArIFwiIGRvZXNuJ3Qgc2VlbSB0byBiZSB2YWxpZCBmb3IgdGhpcyBtZXRob2RcIik7XG5cdFx0ICAgIHRocm93IChtc2cpO1xuXHRcdH1cblx0ICAgIH1cblx0ICAgIG1ldGhvZHMuYWRkKG1ldGhvZCwgeCk7XG5cdH07XG5cblx0dmFyIG5ld19tZXRob2QgPSBmdW5jdGlvbiAobmV3X3ZhbCkge1xuXHQgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0cmV0dXJuIGdldHRlcigpO1xuXHQgICAgfVxuXHQgICAgc2V0dGVyKG5ld192YWwpO1xuXHQgICAgcmV0dXJuIHdobzsgLy8gUmV0dXJuIHRoaXM/XG5cdH07XG5cdG5ld19tZXRob2QuY2hlY2sgPSBmdW5jdGlvbiAoY2JhaywgbXNnKSB7XG5cdCAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcblx0XHRyZXR1cm4gY2hlY2tzO1xuXHQgICAgfVxuXHQgICAgY2hlY2tzLnB1c2ggKHtjaGVjayA6IGNiYWssXG5cdFx0XHQgIG1zZyAgIDogbXNnfSk7XG5cdCAgICByZXR1cm4gdGhpcztcblx0fTtcblx0bmV3X21ldGhvZC50cmFuc2Zvcm0gPSBmdW5jdGlvbiAoY2Jhaykge1xuXHQgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0cmV0dXJuIHRyYW5zZm9ybXM7XG5cdCAgICB9XG5cdCAgICB0cmFuc2Zvcm1zLnB1c2goY2Jhayk7XG5cdCAgICByZXR1cm4gdGhpcztcblx0fTtcblxuXHR3aG9bbWV0aG9kXSA9IG5ld19tZXRob2Q7XG4gICAgfTtcblxuICAgIHZhciBnZXRzZXQgPSBmdW5jdGlvbiAocGFyYW0sIG9wdHMpIHtcblx0aWYgKHR5cGVvZiAocGFyYW0pID09PSAnb2JqZWN0Jykge1xuXHQgICAgbWV0aG9kcy5hZGRfYmF0Y2ggKHBhcmFtKTtcblx0ICAgIGZvciAodmFyIHAgaW4gcGFyYW0pIHtcblx0XHRhdHRhY2hfbWV0aG9kIChwLCBvcHRzKTtcblx0ICAgIH1cblx0fSBlbHNlIHtcblx0ICAgIG1ldGhvZHMuYWRkIChwYXJhbSwgb3B0cy5kZWZhdWx0X3ZhbHVlKTtcblx0ICAgIGF0dGFjaF9tZXRob2QgKHBhcmFtLCBvcHRzKTtcblx0fVxuICAgIH07XG5cbiAgICBhcGkuZ2V0c2V0ID0gZnVuY3Rpb24gKHBhcmFtLCBkZWYpIHtcblx0Z2V0c2V0KHBhcmFtLCB7ZGVmYXVsdF92YWx1ZSA6IGRlZn0pO1xuXG5cdHJldHVybiBhcGk7XG4gICAgfTtcblxuICAgIGFwaS5nZXQgPSBmdW5jdGlvbiAocGFyYW0sIGRlZikge1xuXHR2YXIgb25fc2V0dGVyID0gZnVuY3Rpb24gKCkge1xuXHQgICAgdGhyb3cgKFwiTWV0aG9kIGRlZmluZWQgb25seSBhcyBhIGdldHRlciAoeW91IGFyZSB0cnlpbmcgdG8gdXNlIGl0IGFzIGEgc2V0dGVyXCIpO1xuXHR9O1xuXG5cdGdldHNldChwYXJhbSwge2RlZmF1bHRfdmFsdWUgOiBkZWYsXG5cdFx0ICAgICAgIG9uX3NldHRlciA6IG9uX3NldHRlcn1cblx0ICAgICAgKTtcblxuXHRyZXR1cm4gYXBpO1xuICAgIH07XG5cbiAgICBhcGkuc2V0ID0gZnVuY3Rpb24gKHBhcmFtLCBkZWYpIHtcblx0dmFyIG9uX2dldHRlciA9IGZ1bmN0aW9uICgpIHtcblx0ICAgIHRocm93IChcIk1ldGhvZCBkZWZpbmVkIG9ubHkgYXMgYSBzZXR0ZXIgKHlvdSBhcmUgdHJ5aW5nIHRvIHVzZSBpdCBhcyBhIGdldHRlclwiKTtcblx0fTtcblxuXHRnZXRzZXQocGFyYW0sIHtkZWZhdWx0X3ZhbHVlIDogZGVmLFxuXHRcdCAgICAgICBvbl9nZXR0ZXIgOiBvbl9nZXR0ZXJ9XG5cdCAgICAgICk7XG5cblx0cmV0dXJuIGFwaTtcbiAgICB9O1xuXG4gICAgYXBpLm1ldGhvZCA9IGZ1bmN0aW9uIChuYW1lLCBjYmFrKSB7XG5cdGlmICh0eXBlb2YgKG5hbWUpID09PSAnb2JqZWN0Jykge1xuXHQgICAgZm9yICh2YXIgcCBpbiBuYW1lKSB7XG5cdFx0d2hvW3BdID0gbmFtZVtwXTtcblx0ICAgIH1cblx0fSBlbHNlIHtcblx0ICAgIHdob1tuYW1lXSA9IGNiYWs7XG5cdH1cblx0cmV0dXJuIGFwaTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGFwaTtcbiAgICBcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGFwaTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL3NyYy9pbmRleC5qc1wiKTtcbiIsIi8vIHJlcXVpcmUoJ2ZzJykucmVhZGRpclN5bmMoX19kaXJuYW1lICsgJy8nKS5mb3JFYWNoKGZ1bmN0aW9uKGZpbGUpIHtcbi8vICAgICBpZiAoZmlsZS5tYXRjaCgvLitcXC5qcy9nKSAhPT0gbnVsbCAmJiBmaWxlICE9PSBfX2ZpbGVuYW1lKSB7XG4vLyBcdHZhciBuYW1lID0gZmlsZS5yZXBsYWNlKCcuanMnLCAnJyk7XG4vLyBcdG1vZHVsZS5leHBvcnRzW25hbWVdID0gcmVxdWlyZSgnLi8nICsgZmlsZSk7XG4vLyAgICAgfVxuLy8gfSk7XG5cbi8vIFNhbWUgYXNcbnZhciB1dGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzLmpzXCIpO1xudXRpbHMucmVkdWNlID0gcmVxdWlyZShcIi4vcmVkdWNlLmpzXCIpO1xudXRpbHMucG5nID0gcmVxdWlyZShcIi4vcG5nLmpzXCIpO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gdXRpbHM7XG4iLCJ2YXIgcG5nID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGRvY3R5cGUgPSAnPD94bWwgdmVyc2lvbj1cIjEuMFwiIHN0YW5kYWxvbmU9XCJub1wiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyBcIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOXCIgXCJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGRcIj4nO1xuXG4gICAgdmFyIHNjYWxlX2ZhY3RvciA9IDE7XG4gICAgLy8gdmFyIGZpbGVuYW1lID0gJ2ltYWdlLnBuZyc7XG5cbiAgICAvLyBSZXN0cmljdCB0aGUgY3NzIHRvIGFwcGx5IHRvIHRoZSBmb2xsb3dpbmcgYXJyYXkgKGhyZWZzKVxuICAgIC8vIFRPRE86IHN1YnN0aXR1dGUgdGhpcyBieSBhbiBhcnJheSBvZiByZWdleHBcbiAgICB2YXIgY3NzOyAvLyBJZiB1bmRlZmluZWQsIHVzZSBhbGwgc3R5bGVzaGVldHNcbiAgICAvLyB2YXIgaW5saW5lX2ltYWdlc19vcHQgPSB0cnVlOyAvLyBJZiB0cnVlLCBpbmxpbmUgaW1hZ2VzXG5cbiAgICB2YXIgaW1nX2NiYWsgPSBmdW5jdGlvbiAoKSB7fTtcblxuICAgIHZhciBwbmdfZXhwb3J0ID0gZnVuY3Rpb24gKGZyb21fc3ZnKSB7XG4gICAgICAgIGZyb21fc3ZnID0gZnJvbV9zdmcubm9kZSgpO1xuICAgICAgICAvLyB2YXIgc3ZnID0gZGl2LnF1ZXJ5U2VsZWN0b3IoJ3N2ZycpO1xuXG4gICAgICAgIHZhciBpbmxpbmVfaW1hZ2VzID0gZnVuY3Rpb24gKGNiYWspIHtcbiAgICAgICAgICAgIHZhciBpbWFnZXMgPSBkMy5zZWxlY3QoZnJvbV9zdmcpXG4gICAgICAgICAgICAgICAgLnNlbGVjdEFsbCgnaW1hZ2UnKTtcblxuICAgICAgICAgICAgdmFyIHJlbWFpbmluZyA9IGltYWdlc1swXS5sZW5ndGg7XG4gICAgICAgICAgICBpZiAocmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY2JhaygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpbWFnZXNcbiAgICAgICAgICAgICAgICAuZWFjaCAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW1hZ2UgPSBkMy5zZWxlY3QodGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IGltZy53aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSBpbWcuaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVyaSA9IGNhbnZhcy50b0RhdGFVUkwoJ2ltYWdlL3BuZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UuYXR0cignaHJlZicsIHVyaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1haW5pbmctLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYmFrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGltZy5zcmMgPSBpbWFnZS5hdHRyKCdocmVmJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgbW92ZV9jaGlsZHJlbiA9IGZ1bmN0aW9uIChzcmMsIGRlc3QpIHtcbiAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IHNyYy5jaGlsZHJlbiB8fCBzcmMuY2hpbGROb2RlcztcbiAgICAgICAgICAgIHdoaWxlIChjaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5bMF07XG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkLm5vZGVUeXBlICE9PSAxLypOb2RlLkVMRU1FTlRfTk9ERSovKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBkZXN0LmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkZXN0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBzdHlsaW5nID0gZnVuY3Rpb24gKGRvbSkge1xuICAgICAgICAgICAgdmFyIHVzZWQgPSBcIlwiO1xuICAgICAgICAgICAgdmFyIHNoZWV0cyA9IGRvY3VtZW50LnN0eWxlU2hlZXRzO1xuICAgICAgICAgICAgLy8gdmFyIHNoZWV0cyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaT0wOyBpPHNoZWV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBocmVmID0gc2hlZXRzW2ldLmhyZWYgfHwgXCJcIjtcbiAgICAgICAgICAgICAgICBpZiAoY3NzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBza2lwID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgYz0wOyBjPGNzcy5sZW5ndGg7IGMrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhyZWYuaW5kZXhPZihjc3NbY10pID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2lwID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNraXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBydWxlcyA9IHNoZWV0c1tpXS5jc3NSdWxlcyB8fCBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJ1bGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBydWxlID0gcnVsZXNbal07XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YocnVsZS5zdHlsZSkgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVsZW1zID0gZG9tLnF1ZXJ5U2VsZWN0b3JBbGwocnVsZS5zZWxlY3RvclRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VkICs9IHJ1bGUuc2VsZWN0b3JUZXh0ICsgXCIgeyBcIiArIHJ1bGUuc3R5bGUuY3NzVGV4dCArIFwiIH1cXG5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlcmUgYXJlIDxkZWZzPiBhbHJlYWR5XG4gICAgICAgICAgICB2YXIgZGVmcyA9IGRvbS5xdWVyeVNlbGVjdG9yKFwiZGVmc1wiKSB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkZWZzJyk7XG4gICAgICAgICAgICB2YXIgcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICAgICAgICBzLnNldEF0dHJpYnV0ZSgndHlwZScsICd0ZXh0L2NzcycpO1xuICAgICAgICAgICAgcy5pbm5lckhUTUwgPSBcIjwhW0NEQVRBW1xcblwiICsgdXNlZCArIFwiXFxuXV0+XCI7XG5cbiAgICAgICAgICAgIC8vIHZhciBkZWZzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGVmcycpO1xuICAgICAgICAgICAgZGVmcy5hcHBlbmRDaGlsZChzKTtcbiAgICAgICAgICAgIHJldHVybiBkZWZzO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlubGluZV9pbWFnZXMgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIHZhciBzdmcgPSBkaXYucXVlcnlTZWxlY3Rvcignc3ZnJyk7XG4gICAgICAgICAgICB2YXIgb3V0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgdmFyIGNsb25lID0gZnJvbV9zdmcuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICAgICAgdmFyIHdpZHRoID0gcGFyc2VJbnQoY2xvbmUuZ2V0QXR0cmlidXRlKCd3aWR0aCcpKTtcbiAgICAgICAgICAgIHZhciBoZWlnaHQgPSBwYXJzZUludChjbG9uZS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpKTtcblxuICAgICAgICAgICAgY2xvbmUuc2V0QXR0cmlidXRlKFwidmVyc2lvblwiLCBcIjEuMVwiKTtcbiAgICAgICAgICAgIGNsb25lLnNldEF0dHJpYnV0ZShcInhtbG5zXCIsIFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIik7XG4gICAgICAgICAgICBjbG9uZS5zZXRBdHRyaWJ1dGUoXCJ4bWxuczp4bGlua1wiLCBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIik7XG4gICAgICAgICAgICBjbG9uZS5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCB3aWR0aCAqIHNjYWxlX2ZhY3Rvcik7XG4gICAgICAgICAgICBjbG9uZS5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgaGVpZ2h0ICogc2NhbGVfZmFjdG9yKTtcbiAgICAgICAgICAgIHZhciBzY2FsaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImdcIik7XG4gICAgICAgICAgICBzY2FsaW5nLnNldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiLCBcInNjYWxlKFwiICsgc2NhbGVfZmFjdG9yICsgXCIpXCIpO1xuICAgICAgICAgICAgY2xvbmUuYXBwZW5kQ2hpbGQobW92ZV9jaGlsZHJlbihjbG9uZSwgc2NhbGluZykpO1xuICAgICAgICAgICAgb3V0ZXIuYXBwZW5kQ2hpbGQoY2xvbmUpO1xuXG4gICAgICAgICAgICBjbG9uZS5pbnNlcnRCZWZvcmUgKHN0eWxpbmcoY2xvbmUpLCBjbG9uZS5maXJzdENoaWxkKTtcblxuICAgICAgICAgICAgdmFyIHN2ZyA9IGRvY3R5cGUgKyBvdXRlci5pbm5lckhUTUw7XG4gICAgICAgICAgICBzdmcgPSBzdmcucmVwbGFjZSAoXCJub25lXCIsIFwiYmxvY2tcIik7IC8vIEluIGNhc2UgdGhlIHN2ZyBpcyBub3QgYmVpbmcgZGlzcGxheWVkLCBpdCBpcyBpZ25vcmVkIGluIEZGXG4gICAgICAgICAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblxuICAgICAgICAgICAgaW1hZ2Uuc3JjID0gJ2RhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsJyArIHdpbmRvdy5idG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChzdmcpKSk7XG4gICAgICAgICAgICBpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgICAgICAgY2FudmFzLndpZHRoID0gaW1hZ2Uud2lkdGg7XG4gICAgICAgICAgICAgICAgY2FudmFzLmhlaWdodCA9IGltYWdlLmhlaWdodDtcbiAgICAgICAgICAgICAgICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGltYWdlLCAwLCAwKTtcblxuICAgICAgICAgICAgICAgIHZhciBzcmMgPSBjYW52YXMudG9EYXRhVVJMKCdpbWFnZS9wbmcnKTtcbiAgICAgICAgICAgICAgICBpbWdfY2JhayAoc3JjKTtcbiAgICAgICAgICAgICAgICAvLyB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgICAgICAgICAvLyBhLmRvd25sb2FkID0gZmlsZW5hbWU7XG4gICAgICAgICAgICAgICAgLy8gYS5ocmVmID0gY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJyk7XG4gICAgICAgICAgICAgICAgLy8gZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhKTtcbiAgICAgICAgICAgICAgICAvLyBhLmNsaWNrKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgIH07XG4gICAgcG5nX2V4cG9ydC5zY2FsZV9mYWN0b3IgPSBmdW5jdGlvbiAoZikge1xuICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBzY2FsZV9mYWN0b3I7XG4gICAgICAgIH1cbiAgICAgICAgc2NhbGVfZmFjdG9yID0gZjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIHBuZ19leHBvcnQuY2FsbGJhY2sgPSBmdW5jdGlvbiAoY2Jhaykge1xuICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBpbWdfY2JhaztcbiAgICAgICAgfVxuICAgICAgICBpbWdfY2JhayA9IGNiYWs7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBwbmdfZXhwb3J0LnN0eWxlc2hlZXRzID0gZnVuY3Rpb24gKHJlc3RyaWN0Q3NzKSB7XG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGNzcztcbiAgICAgICAgfVxuICAgICAgICBjc3MgPSByZXN0cmljdENzcztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8vIHBuZ19leHBvcnQuZmlsZW5hbWUgPSBmdW5jdGlvbiAoZikge1xuICAgIC8vIFx0aWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgLy8gXHQgICAgcmV0dXJuIGZpbGVuYW1lO1xuICAgIC8vIFx0fVxuICAgIC8vIFx0ZmlsZW5hbWUgPSBmO1xuICAgIC8vIFx0cmV0dXJuIHBuZ19leHBvcnQ7XG4gICAgLy8gfTtcblxuICAgIHJldHVybiBwbmdfZXhwb3J0O1xufTtcblxudmFyIGRvd25sb2FkID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGZpbGVuYW1lID0gJ2ltYWdlLnBuZyc7XG4gICAgdmFyIG1heF9zaXplID0ge1xuICAgICAgICBsaW1pdDogSW5maW5pdHksXG4gICAgICAgIG9uRXJyb3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaW1hZ2UgdG9vIGxhcmdlXCIpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBwbmdfZXhwb3J0ID0gcG5nKClcbiAgICAgICAgLmNhbGxiYWNrIChmdW5jdGlvbiAoc3JjKSB7XG4gICAgICAgICAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgICAgIGEuZG93bmxvYWQgPSBmaWxlbmFtZTtcbiAgICAgICAgICAgIGEuaHJlZiA9IHNyYztcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYSk7XG5cbiAgICAgICAgICAgIGlmIChhLmhyZWYubGVuZ3RoID4gbWF4X3NpemUubGltaXQpIHtcbiAgICAgICAgICAgICAgICBhLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoYSk7XG4gICAgICAgICAgICAgICAgbWF4X3NpemUub25FcnJvcigpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhLmNsaWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICBhLmNsaWNrKCk7XG4gICAgICAgICAgICAvLyB9LCAzMDAwKTtcbiAgICAgICAgfSk7XG5cbiAgICBwbmdfZXhwb3J0LmZpbGVuYW1lID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGZpbGVuYW1lO1xuICAgICAgICB9XG4gICAgICAgIGZpbGVuYW1lID0gZm47XG4gICAgICAgIHJldHVybiBwbmdfZXhwb3J0O1xuICAgIH07XG5cbiAgICBwbmdfZXhwb3J0LmxpbWl0ID0gZnVuY3Rpb24gKGwpIHtcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gbWF4X3NpemU7XG4gICAgICAgIH1cbiAgICAgICAgbWF4X3NpemUgPSBsO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgcmV0dXJuIHBuZ19leHBvcnQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBkb3dubG9hZDtcbiIsInZhciByZWR1Y2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNtb290aCA9IDU7XG4gICAgdmFyIHZhbHVlID0gJ3ZhbCc7XG4gICAgdmFyIHJlZHVuZGFudCA9IGZ1bmN0aW9uIChhLCBiKSB7XG5cdGlmIChhIDwgYikge1xuXHQgICAgcmV0dXJuICgoYi1hKSA8PSAoYiAqIDAuMikpO1xuXHR9XG5cdHJldHVybiAoKGEtYikgPD0gKGEgKiAwLjIpKTtcbiAgICB9O1xuICAgIHZhciBwZXJmb3JtX3JlZHVjZSA9IGZ1bmN0aW9uIChhcnIpIHtyZXR1cm4gYXJyO307XG5cbiAgICB2YXIgcmVkdWNlID0gZnVuY3Rpb24gKGFycikge1xuXHRpZiAoIWFyci5sZW5ndGgpIHtcblx0ICAgIHJldHVybiBhcnI7XG5cdH1cblx0dmFyIHNtb290aGVkID0gcGVyZm9ybV9zbW9vdGgoYXJyKTtcblx0dmFyIHJlZHVjZWQgID0gcGVyZm9ybV9yZWR1Y2Uoc21vb3RoZWQpO1xuXHRyZXR1cm4gcmVkdWNlZDtcbiAgICB9O1xuXG4gICAgdmFyIG1lZGlhbiA9IGZ1bmN0aW9uICh2LCBhcnIpIHtcblx0YXJyLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcblx0ICAgIHJldHVybiBhW3ZhbHVlXSAtIGJbdmFsdWVdO1xuXHR9KTtcblx0aWYgKGFyci5sZW5ndGggJSAyKSB7XG5cdCAgICB2W3ZhbHVlXSA9IGFyclt+fihhcnIubGVuZ3RoIC8gMildW3ZhbHVlXTtcdCAgICBcblx0fSBlbHNlIHtcblx0ICAgIHZhciBuID0gfn4oYXJyLmxlbmd0aCAvIDIpIC0gMTtcblx0ICAgIHZbdmFsdWVdID0gKGFycltuXVt2YWx1ZV0gKyBhcnJbbisxXVt2YWx1ZV0pIC8gMjtcblx0fVxuXG5cdHJldHVybiB2O1xuICAgIH07XG5cbiAgICB2YXIgY2xvbmUgPSBmdW5jdGlvbiAoc291cmNlKSB7XG5cdHZhciB0YXJnZXQgPSB7fTtcblx0Zm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcblx0ICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcblx0XHR0YXJnZXRbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG5cdCAgICB9XG5cdH1cblx0cmV0dXJuIHRhcmdldDtcbiAgICB9O1xuXG4gICAgdmFyIHBlcmZvcm1fc21vb3RoID0gZnVuY3Rpb24gKGFycikge1xuXHRpZiAoc21vb3RoID09PSAwKSB7IC8vIG5vIHNtb290aFxuXHQgICAgcmV0dXJuIGFycjtcblx0fVxuXHR2YXIgc21vb3RoX2FyciA9IFtdO1xuXHRmb3IgKHZhciBpPTA7IGk8YXJyLmxlbmd0aDsgaSsrKSB7XG5cdCAgICB2YXIgbG93ID0gKGkgPCBzbW9vdGgpID8gMCA6IChpIC0gc21vb3RoKTtcblx0ICAgIHZhciBoaWdoID0gKGkgPiAoYXJyLmxlbmd0aCAtIHNtb290aCkpID8gYXJyLmxlbmd0aCA6IChpICsgc21vb3RoKTtcblx0ICAgIHNtb290aF9hcnJbaV0gPSBtZWRpYW4oY2xvbmUoYXJyW2ldKSwgYXJyLnNsaWNlKGxvdyxoaWdoKzEpKTtcblx0fVxuXHRyZXR1cm4gc21vb3RoX2FycjtcbiAgICB9O1xuXG4gICAgcmVkdWNlLnJlZHVjZXIgPSBmdW5jdGlvbiAoY2Jhaykge1xuXHRpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcblx0ICAgIHJldHVybiBwZXJmb3JtX3JlZHVjZTtcblx0fVxuXHRwZXJmb3JtX3JlZHVjZSA9IGNiYWs7XG5cdHJldHVybiByZWR1Y2U7XG4gICAgfTtcblxuICAgIHJlZHVjZS5yZWR1bmRhbnQgPSBmdW5jdGlvbiAoY2Jhaykge1xuXHRpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcblx0ICAgIHJldHVybiByZWR1bmRhbnQ7XG5cdH1cblx0cmVkdW5kYW50ID0gY2Jhaztcblx0cmV0dXJuIHJlZHVjZTtcbiAgICB9O1xuXG4gICAgcmVkdWNlLnZhbHVlID0gZnVuY3Rpb24gKHZhbCkge1xuXHRpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcblx0ICAgIHJldHVybiB2YWx1ZTtcblx0fVxuXHR2YWx1ZSA9IHZhbDtcblx0cmV0dXJuIHJlZHVjZTtcbiAgICB9O1xuXG4gICAgcmVkdWNlLnNtb290aCA9IGZ1bmN0aW9uICh2YWwpIHtcblx0aWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG5cdCAgICByZXR1cm4gc21vb3RoO1xuXHR9XG5cdHNtb290aCA9IHZhbDtcblx0cmV0dXJuIHJlZHVjZTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHJlZHVjZTtcbn07XG5cbnZhciBibG9jayA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVkID0gcmVkdWNlKClcblx0LnZhbHVlKCdzdGFydCcpO1xuXG4gICAgdmFyIHZhbHVlMiA9ICdlbmQnO1xuXG4gICAgdmFyIGpvaW4gPSBmdW5jdGlvbiAob2JqMSwgb2JqMikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ29iamVjdCcgOiB7XG4gICAgICAgICAgICAgICAgJ3N0YXJ0JyA6IG9iajEub2JqZWN0W3JlZC52YWx1ZSgpXSxcbiAgICAgICAgICAgICAgICAnZW5kJyAgIDogb2JqMlt2YWx1ZTJdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ3ZhbHVlJyAgOiBvYmoyW3ZhbHVlMl1cbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgLy8gdmFyIGpvaW4gPSBmdW5jdGlvbiAob2JqMSwgb2JqMikgeyByZXR1cm4gb2JqMSB9O1xuXG4gICAgcmVkLnJlZHVjZXIoIGZ1bmN0aW9uIChhcnIpIHtcblx0dmFyIHZhbHVlID0gcmVkLnZhbHVlKCk7XG5cdHZhciByZWR1bmRhbnQgPSByZWQucmVkdW5kYW50KCk7XG5cdHZhciByZWR1Y2VkX2FyciA9IFtdO1xuXHR2YXIgY3VyciA9IHtcblx0ICAgICdvYmplY3QnIDogYXJyWzBdLFxuXHQgICAgJ3ZhbHVlJyAgOiBhcnJbMF1bdmFsdWUyXVxuXHR9O1xuXHRmb3IgKHZhciBpPTE7IGk8YXJyLmxlbmd0aDsgaSsrKSB7XG5cdCAgICBpZiAocmVkdW5kYW50IChhcnJbaV1bdmFsdWVdLCBjdXJyLnZhbHVlKSkge1xuXHRcdGN1cnIgPSBqb2luKGN1cnIsIGFycltpXSk7XG5cdFx0Y29udGludWU7XG5cdCAgICB9XG5cdCAgICByZWR1Y2VkX2Fyci5wdXNoIChjdXJyLm9iamVjdCk7XG5cdCAgICBjdXJyLm9iamVjdCA9IGFycltpXTtcblx0ICAgIGN1cnIudmFsdWUgPSBhcnJbaV0uZW5kO1xuXHR9XG5cdHJlZHVjZWRfYXJyLnB1c2goY3Vyci5vYmplY3QpO1xuXG5cdC8vIHJlZHVjZWRfYXJyLnB1c2goYXJyW2Fyci5sZW5ndGgtMV0pO1xuXHRyZXR1cm4gcmVkdWNlZF9hcnI7XG4gICAgfSk7XG5cbiAgICByZWR1Y2Uuam9pbiA9IGZ1bmN0aW9uIChjYmFrKSB7XG5cdGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuXHQgICAgcmV0dXJuIGpvaW47XG5cdH1cblx0am9pbiA9IGNiYWs7XG5cdHJldHVybiByZWQ7XG4gICAgfTtcblxuICAgIHJlZHVjZS52YWx1ZTIgPSBmdW5jdGlvbiAoZmllbGQpIHtcblx0aWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG5cdCAgICByZXR1cm4gdmFsdWUyO1xuXHR9XG5cdHZhbHVlMiA9IGZpZWxkO1xuXHRyZXR1cm4gcmVkO1xuICAgIH07XG5cbiAgICByZXR1cm4gcmVkO1xufTtcblxudmFyIGxpbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlZCA9IHJlZHVjZSgpO1xuXG4gICAgcmVkLnJlZHVjZXIgKCBmdW5jdGlvbiAoYXJyKSB7XG5cdHZhciByZWR1bmRhbnQgPSByZWQucmVkdW5kYW50KCk7XG5cdHZhciB2YWx1ZSA9IHJlZC52YWx1ZSgpO1xuXHR2YXIgcmVkdWNlZF9hcnIgPSBbXTtcblx0dmFyIGN1cnIgPSBhcnJbMF07XG5cdGZvciAodmFyIGk9MTsgaTxhcnIubGVuZ3RoLTE7IGkrKykge1xuXHQgICAgaWYgKHJlZHVuZGFudCAoYXJyW2ldW3ZhbHVlXSwgY3Vyclt2YWx1ZV0pKSB7XG5cdFx0Y29udGludWU7XG5cdCAgICB9XG5cdCAgICByZWR1Y2VkX2Fyci5wdXNoIChjdXJyKTtcblx0ICAgIGN1cnIgPSBhcnJbaV07XG5cdH1cblx0cmVkdWNlZF9hcnIucHVzaChjdXJyKTtcblx0cmVkdWNlZF9hcnIucHVzaChhcnJbYXJyLmxlbmd0aC0xXSk7XG5cdHJldHVybiByZWR1Y2VkX2FycjtcbiAgICB9KTtcblxuICAgIHJldHVybiByZWQ7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcmVkdWNlO1xubW9kdWxlLmV4cG9ydHMubGluZSA9IGxpbmU7XG5tb2R1bGUuZXhwb3J0cy5ibG9jayA9IGJsb2NrO1xuXG4iLCJcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGl0ZXJhdG9yIDogZnVuY3Rpb24oaW5pdF92YWwpIHtcblx0dmFyIGkgPSBpbml0X3ZhbCB8fCAwO1xuXHR2YXIgaXRlciA9IGZ1bmN0aW9uICgpIHtcblx0ICAgIHJldHVybiBpKys7XG5cdH07XG5cdHJldHVybiBpdGVyO1xuICAgIH0sXG5cbiAgICBzY3JpcHRfcGF0aCA6IGZ1bmN0aW9uIChzY3JpcHRfbmFtZSkgeyAvLyBzY3JpcHRfbmFtZSBpcyB0aGUgZmlsZW5hbWVcblx0dmFyIHNjcmlwdF9zY2FwZWQgPSBzY3JpcHRfbmFtZS5yZXBsYWNlKC9bLVxcL1xcXFxeJCorPy4oKXxbXFxde31dL2csICdcXFxcJCYnKTtcblx0dmFyIHNjcmlwdF9yZSA9IG5ldyBSZWdFeHAoc2NyaXB0X3NjYXBlZCArICckJyk7XG5cdHZhciBzY3JpcHRfcmVfc3ViID0gbmV3IFJlZ0V4cCgnKC4qKScgKyBzY3JpcHRfc2NhcGVkICsgJyQnKTtcblxuXHQvLyBUT0RPOiBUaGlzIHJlcXVpcmVzIHBoYW50b20uanMgb3IgYSBzaW1pbGFyIGhlYWRsZXNzIHdlYmtpdCB0byB3b3JrIChkb2N1bWVudClcblx0dmFyIHNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0Jyk7XG5cdHZhciBwYXRoID0gXCJcIjsgIC8vIERlZmF1bHQgdG8gY3VycmVudCBwYXRoXG5cdGlmKHNjcmlwdHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZm9yKHZhciBpIGluIHNjcmlwdHMpIHtcblx0XHRpZihzY3JpcHRzW2ldLnNyYyAmJiBzY3JpcHRzW2ldLnNyYy5tYXRjaChzY3JpcHRfcmUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzY3JpcHRzW2ldLnNyYy5yZXBsYWNlKHNjcmlwdF9yZV9zdWIsICckMScpO1xuXHRcdH1cbiAgICAgICAgICAgIH1cblx0fVxuXHRyZXR1cm4gcGF0aDtcbiAgICB9LFxuXG4gICAgZGVmZXJfY2FuY2VsIDogZnVuY3Rpb24gKGNiYWssIHRpbWUpIHtcbiAgICAgICAgdmFyIHRpY2s7XG5cbiAgICAgICAgdmFyIGRlZmVyX2NhbmNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aWNrKTtcbiAgICAgICAgICAgIHRpY2sgPSBzZXRUaW1lb3V0IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY2Jhay5hcHBseSAodGhhdCwgYXJncyk7XG4gICAgICAgICAgICB9LCB0aW1lKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gZGVmZXJfY2FuY2VsO1xuICAgIH1cbn07XG4iLCJ2YXIgYXBpanMgPSByZXF1aXJlIChcInRudC5hcGlcIik7XG52YXIgZGVmZXJDYW5jZWwgPSByZXF1aXJlIChcInRudC51dGlsc1wiKS5kZWZlcl9jYW5jZWw7XG5cbnZhciBib2FyZCA9IGZ1bmN0aW9uKCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLy8vLyBQcml2YXRlIHZhcnNcbiAgICB2YXIgc3ZnO1xuICAgIHZhciBkaXZfaWQ7XG4gICAgdmFyIHRyYWNrcyA9IFtdO1xuICAgIHZhciBtaW5fd2lkdGggPSA1MDtcbiAgICB2YXIgaGVpZ2h0ICAgID0gMDsgICAgLy8gVGhpcyBpcyB0aGUgZ2xvYmFsIGhlaWdodCBpbmNsdWRpbmcgYWxsIHRoZSB0cmFja3NcbiAgICB2YXIgd2lkdGggICAgID0gOTIwO1xuICAgIHZhciBoZWlnaHRfb2Zmc2V0ID0gMjA7XG4gICAgdmFyIGxvYyA9IHtcblx0c3BlY2llcyAgOiB1bmRlZmluZWQsXG5cdGNociAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICBmcm9tICAgICA6IDAsXG4gICAgICAgIHRvICAgICAgIDogNTAwXG4gICAgfTtcblxuICAgIC8vIExpbWl0IGNhcHNcbiAgICB2YXIgY2FwcyA9IHtcbiAgICAgICAgbGVmdCA6IHVuZGVmaW5lZCxcbiAgICAgICAgcmlnaHQgOiB1bmRlZmluZWRcbiAgICB9O1xuICAgIHZhciBjYXBfd2lkdGggPSAzO1xuXG5cbiAgICAvLyBUT0RPOiBXZSBoYXZlIG5vdyBiYWNrZ3JvdW5kIGNvbG9yIGluIHRoZSB0cmFja3MuIENhbiB0aGlzIGJlIHJlbW92ZWQ/XG4gICAgLy8gSXQgbG9va3MgbGlrZSBpdCBpcyB1c2VkIGluIHRoZSB0b28td2lkZSBwYW5lIGV0YywgYnV0IGl0IG1heSBub3QgYmUgbmVlZGVkIGFueW1vcmVcbiAgICB2YXIgYmdDb2xvciAgID0gZDMucmdiKCcjRjhGQkVGJyk7IC8vI0Y4RkJFRlxuICAgIHZhciBwYW5lOyAvLyBEcmFnZ2FibGUgcGFuZVxuICAgIHZhciBzdmdfZztcbiAgICB2YXIgeFNjYWxlO1xuICAgIHZhciB6b29tRXZlbnRIYW5kbGVyID0gZDMuYmVoYXZpb3Iuem9vbSgpO1xuICAgIHZhciBsaW1pdHMgPSB7XG4gICAgICAgIG1pbiA6IDAsXG4gICAgICAgIG1heCA6IDEwMDAsXG4gICAgICAgIHpvb21fb3V0IDogMTAwMCxcbiAgICAgICAgem9vbV9pbiAgOiAxMDBcbiAgICB9O1xuICAgIHZhciBkdXIgPSA1MDA7XG4gICAgdmFyIGRyYWdfYWxsb3dlZCA9IHRydWU7XG5cbiAgICB2YXIgZXhwb3J0cyA9IHtcbiAgICAgICAgZWFzZSAgICAgICAgICA6IGQzLmVhc2UoXCJjdWJpYy1pbi1vdXRcIiksXG4gICAgICAgIGV4dGVuZF9jYW52YXMgOiB7XG4gICAgICAgICAgICBsZWZ0IDogMCxcbiAgICAgICAgICAgIHJpZ2h0IDogMFxuICAgICAgICB9LFxuICAgICAgICBzaG93X2ZyYW1lIDogdHJ1ZVxuICAgICAgICAvLyBsaW1pdHMgICAgICAgIDogZnVuY3Rpb24gKCkge3Rocm93IFwiVGhlIGxpbWl0cyBtZXRob2Qgc2hvdWxkIGJlIGRlZmluZWRcIn1cbiAgICB9O1xuXG4gICAgLy8gVGhlIHJldHVybmVkIGNsb3N1cmUgLyBvYmplY3RcbiAgICB2YXIgdHJhY2tfdmlzID0gZnVuY3Rpb24oZGl2KSB7XG4gICAgXHRkaXZfaWQgPSBkMy5zZWxlY3QoZGl2KS5hdHRyKFwiaWRcIik7XG5cbiAgICBcdC8vIFRoZSBvcmlnaW5hbCBkaXYgaXMgY2xhc3NlZCB3aXRoIHRoZSB0bnQgY2xhc3NcbiAgICBcdGQzLnNlbGVjdChkaXYpXG4gICAgXHQgICAgLmNsYXNzZWQoXCJ0bnRcIiwgdHJ1ZSk7XG5cbiAgICBcdC8vIFRPRE86IE1vdmUgdGhlIHN0eWxpbmcgdG8gdGhlIHNjc3M/XG4gICAgXHR2YXIgYnJvd3NlckRpdiA9IGQzLnNlbGVjdChkaXYpXG4gICAgXHQgICAgLmFwcGVuZChcImRpdlwiKVxuICAgIFx0ICAgIC5hdHRyKFwiaWRcIiwgXCJ0bnRfXCIgKyBkaXZfaWQpXG4gICAgXHQgICAgLnN0eWxlKFwicG9zaXRpb25cIiwgXCJyZWxhdGl2ZVwiKVxuICAgIFx0ICAgIC5jbGFzc2VkKFwidG50X2ZyYW1lZFwiLCBleHBvcnRzLnNob3dfZnJhbWUgPyB0cnVlIDogZmFsc2UpXG4gICAgXHQgICAgLnN0eWxlKFwid2lkdGhcIiwgKHdpZHRoICsgY2FwX3dpZHRoKjIgKyBleHBvcnRzLmV4dGVuZF9jYW52YXMucmlnaHQgKyBleHBvcnRzLmV4dGVuZF9jYW52YXMubGVmdCkgKyBcInB4XCIpO1xuXG4gICAgXHR2YXIgZ3JvdXBEaXYgPSBicm93c2VyRGl2XG4gICAgXHQgICAgLmFwcGVuZChcImRpdlwiKVxuICAgIFx0ICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0bnRfZ3JvdXBEaXZcIik7XG5cbiAgICBcdC8vIFRoZSBTVkdcbiAgICBcdHN2ZyA9IGdyb3VwRGl2XG4gICAgXHQgICAgLmFwcGVuZChcInN2Z1wiKVxuICAgIFx0ICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0bnRfc3ZnXCIpXG4gICAgXHQgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aClcbiAgICBcdCAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpXG4gICAgXHQgICAgLmF0dHIoXCJwb2ludGVyLWV2ZW50c1wiLCBcImFsbFwiKTtcblxuICAgIFx0c3ZnX2cgPSBzdmdcbiAgICBcdCAgICAuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKDAsMjApXCIpXG4gICAgICAgICAgICAgICAgLmFwcGVuZChcImdcIilcbiAgICBcdCAgICAuYXR0cihcImNsYXNzXCIsIFwidG50X2dcIik7XG5cbiAgICBcdC8vIGNhcHNcbiAgICBcdGNhcHMubGVmdCA9IHN2Z19nXG4gICAgXHQgICAgLmFwcGVuZChcInJlY3RcIilcbiAgICBcdCAgICAuYXR0cihcImlkXCIsIFwidG50X1wiICsgZGl2X2lkICsgXCJfNXBjYXBcIilcbiAgICBcdCAgICAuYXR0cihcInhcIiwgMClcbiAgICBcdCAgICAuYXR0cihcInlcIiwgMClcbiAgICBcdCAgICAuYXR0cihcIndpZHRoXCIsIDApXG4gICAgXHQgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KVxuICAgIFx0ICAgIC5hdHRyKFwiZmlsbFwiLCBcInJlZFwiKTtcbiAgICBcdGNhcHMucmlnaHQgPSBzdmdfZ1xuICAgIFx0ICAgIC5hcHBlbmQoXCJyZWN0XCIpXG4gICAgXHQgICAgLmF0dHIoXCJpZFwiLCBcInRudF9cIiArIGRpdl9pZCArIFwiXzNwY2FwXCIpXG4gICAgXHQgICAgLmF0dHIoXCJ4XCIsIHdpZHRoLWNhcF93aWR0aClcbiAgICBcdCAgICAuYXR0cihcInlcIiwgMClcbiAgICBcdCAgICAuYXR0cihcIndpZHRoXCIsIDApXG4gICAgXHQgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KVxuICAgIFx0ICAgIC5hdHRyKFwiZmlsbFwiLCBcInJlZFwiKTtcblxuICAgIFx0Ly8gVGhlIFpvb21pbmcvUGFubmluZyBQYW5lXG4gICAgXHRwYW5lID0gc3ZnX2dcbiAgICBcdCAgICAuYXBwZW5kKFwicmVjdFwiKVxuICAgIFx0ICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0bnRfcGFuZVwiKVxuICAgIFx0ICAgIC5hdHRyKFwiaWRcIiwgXCJ0bnRfXCIgKyBkaXZfaWQgKyBcIl9wYW5lXCIpXG4gICAgXHQgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aClcbiAgICBcdCAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpXG4gICAgXHQgICAgLnN0eWxlKFwiZmlsbFwiLCBiZ0NvbG9yKTtcblxuICAgIFx0Ly8gKiogVE9ETzogV291bGRuJ3QgYmUgYmV0dGVyIHRvIGhhdmUgdGhlc2UgbWVzc2FnZXMgYnkgdHJhY2s/XG4gICAgXHQvLyB2YXIgdG9vV2lkZV90ZXh0ID0gc3ZnX2dcbiAgICBcdC8vICAgICAuYXBwZW5kKFwidGV4dFwiKVxuICAgIFx0Ly8gICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0bnRfd2lkZU9LX3RleHRcIilcbiAgICBcdC8vICAgICAuYXR0cihcImlkXCIsIFwidG50X1wiICsgZGl2X2lkICsgXCJfdG9vV2lkZVwiKVxuICAgIFx0Ly8gICAgIC5hdHRyKFwiZmlsbFwiLCBiZ0NvbG9yKVxuICAgIFx0Ly8gICAgIC50ZXh0KFwiUmVnaW9uIHRvbyB3aWRlXCIpO1xuXG4gICAgXHQvLyBUT0RPOiBJIGRvbid0IGtub3cgaWYgdGhpcyBpcyB0aGUgYmVzdCB3YXkgKGFuZCBwb3J0YWJsZSkgd2F5XG4gICAgXHQvLyBvZiBjZW50ZXJpbmcgdGhlIHRleHQgaW4gdGhlIHRleHQgYXJlYVxuICAgIFx0Ly8gdmFyIGJiID0gdG9vV2lkZV90ZXh0WzBdWzBdLmdldEJCb3goKTtcbiAgICBcdC8vIHRvb1dpZGVfdGV4dFxuICAgIFx0Ly8gICAgIC5hdHRyKFwieFwiLCB+fih3aWR0aC8yIC0gYmIud2lkdGgvMikpXG4gICAgXHQvLyAgICAgLmF0dHIoXCJ5XCIsIH5+KGhlaWdodC8yIC0gYmIuaGVpZ2h0LzIpKTtcbiAgICB9O1xuXG4gICAgLy8gQVBJXG4gICAgdmFyIGFwaSA9IGFwaWpzICh0cmFja192aXMpXG4gICAgXHQuZ2V0c2V0IChleHBvcnRzKVxuICAgIFx0LmdldHNldCAobGltaXRzKVxuICAgIFx0LmdldHNldCAobG9jKTtcblxuICAgIGFwaS50cmFuc2Zvcm0gKHRyYWNrX3Zpcy5leHRlbmRfY2FudmFzLCBmdW5jdGlvbiAodmFsKSB7XG4gICAgXHR2YXIgcHJldl92YWwgPSB0cmFja192aXMuZXh0ZW5kX2NhbnZhcygpO1xuICAgIFx0dmFsLmxlZnQgPSB2YWwubGVmdCB8fCBwcmV2X3ZhbC5sZWZ0O1xuICAgIFx0dmFsLnJpZ2h0ID0gdmFsLnJpZ2h0IHx8IHByZXZfdmFsLnJpZ2h0O1xuICAgIFx0cmV0dXJuIHZhbDtcbiAgICB9KTtcblxuICAgIC8vIHRyYWNrX3ZpcyBhbHdheXMgc3RhcnRzIG9uIGxvYy5mcm9tICYgbG9jLnRvXG4gICAgYXBpLm1ldGhvZCAoJ3N0YXJ0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBtYWtlIHN1cmUgdGhhdCB6b29tX291dCBpcyB3aXRoaW4gdGhlIG1pbi1tYXggcmFuZ2VcbiAgICAgICAgaWYgKChsaW1pdHMubWF4IC0gbGltaXRzLm1pbikgPCBsaW1pdHMuem9vbV9vdXQpIHtcbiAgICAgICAgICAgIGxpbWl0cy56b29tX291dCA9IGxpbWl0cy5tYXggLSBsaW1pdHMubWluO1xuICAgICAgICB9XG5cbiAgICAgICAgcGxvdCgpO1xuXG4gICAgICAgIC8vIFJlc2V0IHRoZSB0cmFja3NcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPHRyYWNrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRyYWNrc1tpXS5nKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgdHJhY2tzW2ldLmRpc3BsYXkoKS5yZXNldC5jYWxsKHRyYWNrc1tpXSk7XG4gICAgICAgICAgICAgICAgdHJhY2tzW2ldLmcucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfaW5pdF90cmFjayh0cmFja3NbaV0pO1xuICAgICAgICB9XG4gICAgICAgIF9wbGFjZV90cmFja3MoKTtcblxuICAgICAgICAvLyBUaGUgY29udGludWF0aW9uIGNhbGxiYWNrXG4gICAgICAgIHZhciBjb250ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICBpZiAoKGxvYy50byAtIGxvYy5mcm9tKSA8IGxpbWl0cy56b29tX2luKSB7XG4gICAgICAgICAgICAgICAgaWYgKChsb2MuZnJvbSArIGxpbWl0cy56b29tX2luKSA+IGxpbWl0cy5tYXgpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jLnRvID0gbGltaXRzLm1heDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsb2MudG8gPSBsb2MuZnJvbSArIGxpbWl0cy56b29tX2luO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgaT0wOyBpPHRyYWNrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIF91cGRhdGVfdHJhY2sodHJhY2tzW2ldLCBsb2MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnQoKTtcbiAgICB9KTtcblxuICAgIGFwaS5tZXRob2QgKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgXHRmb3IgKHZhciBpPTA7IGk8dHJhY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgXHQgICAgX3VwZGF0ZV90cmFjayAodHJhY2tzW2ldKTtcbiAgICBcdH1cbiAgICB9KTtcblxuICAgIHZhciBfdXBkYXRlX3RyYWNrID0gZnVuY3Rpb24gKHRyYWNrLCB3aGVyZSkge1xuICAgIFx0aWYgKHRyYWNrLmRhdGEoKSkge1xuICAgIFx0ICAgIHZhciB0cmFja19kYXRhID0gdHJhY2suZGF0YSgpO1xuICAgICAgICAgICAgdmFyIGRhdGFfdXBkYXRlciA9IHRyYWNrX2RhdGE7XG5cbiAgICBcdCAgICBkYXRhX3VwZGF0ZXIuY2FsbCh0cmFjaywge1xuICAgICAgICAgICAgICAgICdsb2MnIDogd2hlcmUsXG4gICAgICAgICAgICAgICAgJ29uX3N1Y2Nlc3MnIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0cmFjay5kaXNwbGF5KCkudXBkYXRlLmNhbGwodHJhY2ssIHdoZXJlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgXHQgICAgfSk7XG4gICAgXHR9XG4gICAgfTtcblxuICAgIHZhciBwbG90ID0gZnVuY3Rpb24oKSB7XG4gICAgXHR4U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxuICAgIFx0ICAgIC5kb21haW4oW2xvYy5mcm9tLCBsb2MudG9dKVxuICAgIFx0ICAgIC5yYW5nZShbMCwgd2lkdGhdKTtcblxuICAgIFx0aWYgKGRyYWdfYWxsb3dlZCkge1xuICAgIFx0ICAgIHN2Z19nLmNhbGwoIHpvb21FdmVudEhhbmRsZXJcbiAgICBcdFx0ICAgICAgIC54KHhTY2FsZSlcbiAgICBcdFx0ICAgICAgIC5zY2FsZUV4dGVudChbKGxvYy50by1sb2MuZnJvbSkvKGxpbWl0cy56b29tX291dC0xKSwgKGxvYy50by1sb2MuZnJvbSkvbGltaXRzLnpvb21faW5dKVxuICAgIFx0XHQgICAgICAgLm9uKFwiem9vbVwiLCBfbW92ZSlcbiAgICBcdFx0ICAgICApO1xuICAgIFx0fVxuICAgIH07XG5cbiAgICB2YXIgX3Jlb3JkZXIgPSBmdW5jdGlvbiAobmV3X3RyYWNrcykge1xuICAgICAgICAvLyBUT0RPOiBUaGlzIGlzIGRlZmluaW5nIGEgbmV3IGhlaWdodCwgYnV0IHRoZSBnbG9iYWwgaGVpZ2h0IGlzIHVzZWQgdG8gZGVmaW5lIHRoZSBzaXplIG9mIHNldmVyYWxcbiAgICAgICAgLy8gcGFydHMuIFdlIHNob3VsZCBkbyB0aGlzIGR5bmFtaWNhbGx5XG5cbiAgICAgICAgdmFyIGZvdW5kX2luZGV4ZXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaj0wOyBqPG5ld190cmFja3MubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yICh2YXIgaT0wOyBpPHRyYWNrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0cmFja3NbaV0uaWQoKSA9PT0gbmV3X3RyYWNrc1tqXS5pZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgZm91bmRfaW5kZXhlc1tpXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRyYWNrcy5zcGxpY2UoaSwxKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICAgICAgICAgIF9pbml0X3RyYWNrKG5ld190cmFja3Nbal0pO1xuICAgICAgICAgICAgICAgIF91cGRhdGVfdHJhY2sobmV3X3RyYWNrc1tqXSwge2Zyb20gOiBsb2MuZnJvbSwgdG8gOiBsb2MudG99KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIHg9MDsgeDx0cmFja3MubGVuZ3RoOyB4KyspIHtcbiAgICAgICAgICAgIGlmICghZm91bmRfaW5kZXhlc1t4XSkge1xuICAgICAgICAgICAgICAgIHRyYWNrc1t4XS5nLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdHJhY2tzID0gbmV3X3RyYWNrcztcbiAgICAgICAgX3BsYWNlX3RyYWNrcygpO1xuICAgIH07XG5cbiAgICAvLyByaWdodC9sZWZ0L3pvb20gcGFucyBvciB6b29tcyB0aGUgdHJhY2suIFRoZXNlIG1ldGhvZHMgYXJlIGV4cG9zZWQgdG8gYWxsb3cgZXh0ZXJuYWwgYnV0dG9ucywgZXRjIHRvIGludGVyYWN0IHdpdGggdGhlIHRyYWNrcy4gVGhlIGFyZ3VtZW50IGlzIHRoZSBhbW91bnQgb2YgcGFubmluZy96b29taW5nIChpZS4gMS4yIG1lYW5zIDIwJSBwYW5uaW5nKSBXaXRoIGxlZnQvcmlnaHQgb25seSBwb3NpdGl2ZSBudW1iZXJzIGFyZSBhbGxvd2VkLlxuICAgIGFwaS5tZXRob2QgKCdzY3JvbGwnLCBmdW5jdGlvbiAoZmFjdG9yKSB7XG4gICAgICAgIHZhciBhbW91bnQgPSBNYXRoLmFicyhmYWN0b3IpO1xuICAgIFx0aWYgKGZhY3RvciA+IDApIHtcbiAgICBcdCAgICBfbWFudWFsX21vdmUoYW1vdW50LCAxKTtcbiAgICBcdH0gZWxzZSBpZiAoZmFjdG9yIDwgMCl7XG4gICAgICAgICAgICBfbWFudWFsX21vdmUoYW1vdW50LCAtMSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGFwaS5tZXRob2QgKCd6b29tJywgZnVuY3Rpb24gKGZhY3Rvcikge1xuICAgICAgICBfbWFudWFsX21vdmUoMS9mYWN0b3IsIDApO1xuICAgIH0pO1xuXG4gICAgYXBpLm1ldGhvZCAoJ2ZpbmRfdHJhY2snLCBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPHRyYWNrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRyYWNrc1tpXS5pZCgpID09PSBpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cmFja3NbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGFwaS5tZXRob2QgKCdyZW1vdmVfdHJhY2snLCBmdW5jdGlvbiAodHJhY2spIHtcbiAgICAgICAgdHJhY2suZy5yZW1vdmUoKTtcbiAgICB9KTtcblxuICAgIGFwaS5tZXRob2QgKCdhZGRfdHJhY2snLCBmdW5jdGlvbiAodHJhY2spIHtcbiAgICAgICAgaWYgKHRyYWNrIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGk9MDsgaTx0cmFjay5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRyYWNrX3Zpcy5hZGRfdHJhY2sgKHRyYWNrW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cmFja192aXM7XG4gICAgICAgIH1cbiAgICAgICAgdHJhY2tzLnB1c2godHJhY2spO1xuICAgICAgICByZXR1cm4gdHJhY2tfdmlzO1xuICAgIH0pO1xuXG4gICAgYXBpLm1ldGhvZCgndHJhY2tzJywgZnVuY3Rpb24gKHRzKSB7XG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRyYWNrcztcbiAgICAgICAgfVxuICAgICAgICBfcmVvcmRlcih0cyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0pO1xuXG4gICAgLy9cbiAgICBhcGkubWV0aG9kICgnd2lkdGgnLCBmdW5jdGlvbiAodykge1xuICAgIFx0Ly8gVE9ETzogQWxsb3cgc3VmZml4ZXMgbGlrZSBcIjEwMDBweFwiP1xuICAgIFx0Ly8gVE9ETzogVGVzdCB3cm9uZyBmb3JtYXRzXG4gICAgXHRpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBcdCAgICByZXR1cm4gd2lkdGg7XG4gICAgXHR9XG4gICAgXHQvLyBBdCBsZWFzdCBtaW4td2lkdGhcbiAgICBcdGlmICh3IDwgbWluX3dpZHRoKSB7XG4gICAgXHQgICAgdyA9IG1pbl93aWR0aDtcbiAgICBcdH1cblxuICAgIFx0Ly8gV2UgYXJlIHJlc2l6aW5nXG4gICAgXHRpZiAoZGl2X2lkICE9PSB1bmRlZmluZWQpIHtcbiAgICBcdCAgICBkMy5zZWxlY3QoXCIjdG50X1wiICsgZGl2X2lkKS5zZWxlY3QoXCJzdmdcIikuYXR0cihcIndpZHRoXCIsIHcpO1xuICAgIFx0ICAgIC8vIFJlc2l6ZSB0aGUgem9vbWluZy9wYW5uaW5nIHBhbmVcbiAgICBcdCAgICBkMy5zZWxlY3QoXCIjdG50X1wiICsgZGl2X2lkKS5zdHlsZShcIndpZHRoXCIsIChwYXJzZUludCh3KSArIGNhcF93aWR0aCoyKSArIFwicHhcIik7XG4gICAgXHQgICAgZDMuc2VsZWN0KFwiI3RudF9cIiArIGRpdl9pZCArIFwiX3BhbmVcIikuYXR0cihcIndpZHRoXCIsIHcpO1xuICAgICAgICAgICAgY2Fwcy5yaWdodFxuICAgICAgICAgICAgICAgIC5hdHRyKFwieFwiLCB3LWNhcF93aWR0aCk7XG5cbiAgICBcdCAgICAvLyBSZXBsb3RcbiAgICBcdCAgICB3aWR0aCA9IHc7XG4gICAgICAgICAgICB4U2NhbGUucmFuZ2UoWzAsIHdpZHRoXSk7XG5cbiAgICBcdCAgICBwbG90KCk7XG4gICAgXHQgICAgZm9yICh2YXIgaT0wOyBpPHRyYWNrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBcdFx0dHJhY2tzW2ldLmcuc2VsZWN0KFwicmVjdFwiKS5hdHRyKFwid2lkdGhcIiwgdyk7XG4gICAgICAgICAgICAgICAgdHJhY2tzW2ldLmRpc3BsYXkoKS5zY2FsZSh4U2NhbGUpO1xuICAgICAgICBcdFx0dHJhY2tzW2ldLmRpc3BsYXkoKS5yZXNldC5jYWxsKHRyYWNrc1tpXSk7XG4gICAgICAgICAgICAgICAgdHJhY2tzW2ldLmRpc3BsYXkoKS5pbml0LmNhbGwodHJhY2tzW2ldLCB3KTtcbiAgICAgICAgXHRcdHRyYWNrc1tpXS5kaXNwbGF5KCkudXBkYXRlLmNhbGwodHJhY2tzW2ldLCBsb2MpO1xuICAgIFx0ICAgIH1cbiAgICBcdH0gZWxzZSB7XG4gICAgXHQgICAgd2lkdGggPSB3O1xuICAgIFx0fVxuICAgICAgICByZXR1cm4gdHJhY2tfdmlzO1xuICAgIH0pO1xuXG4gICAgYXBpLm1ldGhvZCgnYWxsb3dfZHJhZycsIGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gZHJhZ19hbGxvd2VkO1xuICAgICAgICB9XG4gICAgICAgIGRyYWdfYWxsb3dlZCA9IGI7XG4gICAgICAgIGlmIChkcmFnX2FsbG93ZWQpIHtcbiAgICAgICAgICAgIC8vIFdoZW4gdGhpcyBtZXRob2QgaXMgY2FsbGVkIG9uIHRoZSBvYmplY3QgYmVmb3JlIHN0YXJ0aW5nIHRoZSBzaW11bGF0aW9uLCB3ZSBkb24ndCBoYXZlIGRlZmluZWQgeFNjYWxlXG4gICAgICAgICAgICBpZiAoeFNjYWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBzdmdfZy5jYWxsKCB6b29tRXZlbnRIYW5kbGVyLngoeFNjYWxlKVxuICAgICAgICAgICAgICAgICAgICAvLyAueEV4dGVudChbMCwgbGltaXRzLnJpZ2h0XSlcbiAgICAgICAgICAgICAgICAgICAgLnNjYWxlRXh0ZW50KFsobG9jLnRvLWxvYy5mcm9tKS8obGltaXRzLnpvb21fb3V0LTEpLCAobG9jLnRvLWxvYy5mcm9tKS9saW1pdHMuem9vbV9pbl0pXG4gICAgICAgICAgICAgICAgICAgIC5vbihcInpvb21cIiwgX21vdmUpICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBXZSBjcmVhdGUgYSBuZXcgZHVtbXkgc2NhbGUgaW4geCB0byBhdm9pZCBkcmFnZ2luZyB0aGUgcHJldmlvdXMgb25lXG4gICAgICAgICAgICAvLyBUT0RPOiBUaGVyZSBtYXkgYmUgYSBjaGVhcGVyIHdheSBvZiBkb2luZyB0aGlzP1xuICAgICAgICAgICAgem9vbUV2ZW50SGFuZGxlci54KGQzLnNjYWxlLmxpbmVhcigpKS5vbihcInpvb21cIiwgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRyYWNrX3ZpcztcbiAgICB9KTtcblxuICAgIHZhciBfcGxhY2VfdHJhY2tzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaCA9IDA7XG4gICAgICAgIGZvciAodmFyIGk9MDsgaTx0cmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB0cmFjayA9IHRyYWNrc1tpXTtcbiAgICAgICAgICAgIGlmICh0cmFjay5nLmF0dHIoXCJ0cmFuc2Zvcm1cIikpIHtcbiAgICAgICAgICAgICAgICB0cmFjay5nXG4gICAgICAgICAgICAgICAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgLmR1cmF0aW9uKGR1cilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBleHBvcnRzLmV4dGVuZF9jYW52YXMubGVmdCArIFwiLFwiICsgaCArIFwiKVwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdHJhY2suZ1xuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIGV4cG9ydHMuZXh0ZW5kX2NhbnZhcy5sZWZ0ICsgXCIsXCIgKyBoICsgXCIpXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBoICs9IHRyYWNrLmhlaWdodCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3ZnXG4gICAgICAgIHN2Zy5hdHRyKFwiaGVpZ2h0XCIsIGggKyBoZWlnaHRfb2Zmc2V0KTtcblxuICAgICAgICAvLyBkaXZcbiAgICAgICAgZDMuc2VsZWN0KFwiI3RudF9cIiArIGRpdl9pZClcbiAgICAgICAgICAgIC5zdHlsZShcImhlaWdodFwiLCAoaCArIDEwICsgaGVpZ2h0X29mZnNldCkgKyBcInB4XCIpO1xuXG4gICAgICAgIC8vIGNhcHNcbiAgICAgICAgZDMuc2VsZWN0KFwiI3RudF9cIiArIGRpdl9pZCArIFwiXzVwY2FwXCIpXG4gICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBoKVxuICAgICAgICAgICAgLmVhY2goZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgICBtb3ZlX3RvX2Zyb250KHRoaXMpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgZDMuc2VsZWN0KFwiI3RudF9cIiArIGRpdl9pZCArIFwiXzNwY2FwXCIpXG4gICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBoKVxuICAgICAgICAgICAgLmVhY2ggKGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgICAgbW92ZV90b19mcm9udCh0aGlzKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHBhbmVcbiAgICAgICAgcGFuZVxuICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaCArIGhlaWdodF9vZmZzZXQpO1xuXG4gICAgICAgIHJldHVybiB0cmFja192aXM7XG4gICAgfTtcblxuICAgIHZhciBfaW5pdF90cmFjayA9IGZ1bmN0aW9uICh0cmFjaykge1xuICAgICAgICB0cmFjay5nID0gc3ZnLnNlbGVjdChcImdcIikuc2VsZWN0KFwiZ1wiKVxuICAgIFx0ICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgXHQgICAgLmF0dHIoXCJjbGFzc1wiLCBcInRudF90cmFja1wiKVxuICAgIFx0ICAgIC5hdHRyKFwiaGVpZ2h0XCIsIHRyYWNrLmhlaWdodCgpKTtcblxuICAgIFx0Ly8gUmVjdCBmb3IgdGhlIGJhY2tncm91bmQgY29sb3JcbiAgICBcdHRyYWNrLmdcbiAgICBcdCAgICAuYXBwZW5kKFwicmVjdFwiKVxuICAgIFx0ICAgIC5hdHRyKFwieFwiLCAwKVxuICAgIFx0ICAgIC5hdHRyKFwieVwiLCAwKVxuICAgIFx0ICAgIC5hdHRyKFwid2lkdGhcIiwgdHJhY2tfdmlzLndpZHRoKCkpXG4gICAgXHQgICAgLmF0dHIoXCJoZWlnaHRcIiwgdHJhY2suaGVpZ2h0KCkpXG4gICAgXHQgICAgLnN0eWxlKFwiZmlsbFwiLCB0cmFjay5jb2xvcigpKVxuICAgIFx0ICAgIC5zdHlsZShcInBvaW50ZXItZXZlbnRzXCIsIFwibm9uZVwiKTtcblxuICAgIFx0aWYgKHRyYWNrLmRpc3BsYXkoKSkge1xuICAgIFx0ICAgIHRyYWNrLmRpc3BsYXkoKVxuICAgICAgICAgICAgICAgIC5zY2FsZSh4U2NhbGUpXG4gICAgICAgICAgICAgICAgLmluaXQuY2FsbCh0cmFjaywgd2lkdGgpO1xuICAgIFx0fVxuXG4gICAgXHRyZXR1cm4gdHJhY2tfdmlzO1xuICAgIH07XG5cbiAgICB2YXIgX21hbnVhbF9tb3ZlID0gZnVuY3Rpb24gKGZhY3RvciwgZGlyZWN0aW9uKSB7XG4gICAgICAgIHZhciBvbGREb21haW4gPSB4U2NhbGUuZG9tYWluKCk7XG5cbiAgICBcdHZhciBzcGFuID0gb2xkRG9tYWluWzFdIC0gb2xkRG9tYWluWzBdO1xuICAgIFx0dmFyIG9mZnNldCA9IChzcGFuICogZmFjdG9yKSAtIHNwYW47XG5cbiAgICBcdHZhciBuZXdEb21haW47XG4gICAgXHRzd2l0Y2ggKGRpcmVjdGlvbikge1xuICAgICAgICAgICAgY2FzZSAxIDpcbiAgICAgICAgICAgIG5ld0RvbWFpbiA9IFsofn5vbGREb21haW5bMF0gLSBvZmZzZXQpLCB+fihvbGREb21haW5bMV0gLSBvZmZzZXQpXTtcbiAgICBcdCAgICBicmVhaztcbiAgICAgICAgXHRjYXNlIC0xIDpcbiAgICAgICAgXHQgICAgbmV3RG9tYWluID0gWyh+fm9sZERvbWFpblswXSArIG9mZnNldCksIH5+KG9sZERvbWFpblsxXSAtIG9mZnNldCldO1xuICAgICAgICBcdCAgICBicmVhaztcbiAgICAgICAgXHRjYXNlIDAgOlxuICAgICAgICBcdCAgICBuZXdEb21haW4gPSBbb2xkRG9tYWluWzBdIC0gfn4ob2Zmc2V0LzIpLCBvbGREb21haW5bMV0gKyAofn5vZmZzZXQvMildO1xuICAgIFx0fVxuXG4gICAgXHR2YXIgaW50ZXJwb2xhdG9yID0gZDMuaW50ZXJwb2xhdGVOdW1iZXIob2xkRG9tYWluWzBdLCBuZXdEb21haW5bMF0pO1xuICAgIFx0dmFyIGVhc2UgPSBleHBvcnRzLmVhc2U7XG5cbiAgICBcdHZhciB4ID0gMDtcbiAgICBcdGQzLnRpbWVyKGZ1bmN0aW9uKCkge1xuICAgIFx0ICAgIHZhciBjdXJyX3N0YXJ0ID0gaW50ZXJwb2xhdG9yKGVhc2UoeCkpO1xuICAgIFx0ICAgIHZhciBjdXJyX2VuZDtcbiAgICBcdCAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xuICAgICAgICBcdCAgICBjYXNlIC0xIDpcbiAgICAgICAgXHRcdGN1cnJfZW5kID0gY3Vycl9zdGFydCArIHNwYW47XG4gICAgICAgIFx0XHRicmVhaztcbiAgICAgICAgXHQgICAgY2FzZSAxIDpcbiAgICAgICAgXHRcdGN1cnJfZW5kID0gY3Vycl9zdGFydCArIHNwYW47XG4gICAgICAgIFx0XHRicmVhaztcbiAgICAgICAgXHQgICAgY2FzZSAwIDpcbiAgICAgICAgXHRcdGN1cnJfZW5kID0gb2xkRG9tYWluWzFdICsgb2xkRG9tYWluWzBdIC0gY3Vycl9zdGFydDtcbiAgICAgICAgXHRcdGJyZWFrO1xuICAgIFx0ICAgIH1cblxuICAgIFx0ICAgIHZhciBjdXJyRG9tYWluID0gW2N1cnJfc3RhcnQsIGN1cnJfZW5kXTtcbiAgICBcdCAgICB4U2NhbGUuZG9tYWluKGN1cnJEb21haW4pO1xuICAgIFx0ICAgIF9tb3ZlKHhTY2FsZSk7XG4gICAgXHQgICAgeCs9MC4wMjtcbiAgICBcdCAgICByZXR1cm4geD4xO1xuICAgIFx0fSk7XG4gICAgfTtcblxuXG4gICAgdmFyIF9tb3ZlX2NiYWsgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjdXJyRG9tYWluID0geFNjYWxlLmRvbWFpbigpO1xuICAgIFx0dHJhY2tfdmlzLmZyb20ofn5jdXJyRG9tYWluWzBdKTtcbiAgICBcdHRyYWNrX3Zpcy50byh+fmN1cnJEb21haW5bMV0pO1xuXG4gICAgXHRmb3IgKHZhciBpID0gMDsgaSA8IHRyYWNrcy5sZW5ndGg7IGkrKykge1xuICAgIFx0ICAgIHZhciB0cmFjayA9IHRyYWNrc1tpXTtcbiAgICBcdCAgICBfdXBkYXRlX3RyYWNrKHRyYWNrLCBsb2MpO1xuICAgIFx0fVxuICAgIH07XG4gICAgLy8gVGhlIGRlZmVycmVkX2NiYWsgaXMgZGVmZXJyZWQgYXQgbGVhc3QgdGhpcyBhbW91bnQgb2YgdGltZSBvciByZS1zY2hlZHVsZWQgaWYgZGVmZXJyZWQgaXMgY2FsbGVkIGJlZm9yZVxuICAgIHZhciBfZGVmZXJyZWQgPSBkZWZlckNhbmNlbChfbW92ZV9jYmFrLCAzMDApO1xuXG4gICAgLy8gYXBpLm1ldGhvZCgndXBkYXRlJywgZnVuY3Rpb24gKCkge1xuICAgIC8vIFx0X21vdmUoKTtcbiAgICAvLyB9KTtcblxuICAgIHZhciBfbW92ZSA9IGZ1bmN0aW9uIChuZXdfeFNjYWxlKSB7XG4gICAgXHRpZiAobmV3X3hTY2FsZSAhPT0gdW5kZWZpbmVkICYmIGRyYWdfYWxsb3dlZCkge1xuICAgIFx0ICAgIHpvb21FdmVudEhhbmRsZXIueChuZXdfeFNjYWxlKTtcbiAgICBcdH1cblxuICAgIFx0Ly8gU2hvdyB0aGUgcmVkIGJhcnMgYXQgdGhlIGxpbWl0c1xuICAgIFx0dmFyIGRvbWFpbiA9IHhTY2FsZS5kb21haW4oKTtcbiAgICBcdGlmIChkb21haW5bMF0gPD0gKGxpbWl0cy5taW4gKyA1KSkge1xuICAgIFx0ICAgIGQzLnNlbGVjdChcIiN0bnRfXCIgKyBkaXZfaWQgKyBcIl81cGNhcFwiKVxuICAgIFx0XHQuYXR0cihcIndpZHRoXCIsIGNhcF93aWR0aClcbiAgICBcdFx0LnRyYW5zaXRpb24oKVxuICAgIFx0XHQuZHVyYXRpb24oMjAwKVxuICAgIFx0XHQuYXR0cihcIndpZHRoXCIsIDApO1xuICAgIFx0fVxuXG4gICAgXHRpZiAoZG9tYWluWzFdID49IChsaW1pdHMubWF4KS01KSB7XG4gICAgXHQgICAgZDMuc2VsZWN0KFwiI3RudF9cIiArIGRpdl9pZCArIFwiXzNwY2FwXCIpXG4gICAgXHRcdC5hdHRyKFwid2lkdGhcIiwgY2FwX3dpZHRoKVxuICAgIFx0XHQudHJhbnNpdGlvbigpXG4gICAgXHRcdC5kdXJhdGlvbigyMDApXG4gICAgXHRcdC5hdHRyKFwid2lkdGhcIiwgMCk7XG4gICAgXHR9XG5cblxuICAgIFx0Ly8gQXZvaWQgbW92aW5nIHBhc3QgdGhlIGxpbWl0c1xuICAgIFx0aWYgKGRvbWFpblswXSA8IGxpbWl0cy5taW4pIHtcbiAgICBcdCAgICB6b29tRXZlbnRIYW5kbGVyLnRyYW5zbGF0ZShbem9vbUV2ZW50SGFuZGxlci50cmFuc2xhdGUoKVswXSAtIHhTY2FsZShsaW1pdHMubWluKSArIHhTY2FsZS5yYW5nZSgpWzBdLCB6b29tRXZlbnRIYW5kbGVyLnRyYW5zbGF0ZSgpWzFdXSk7XG4gICAgXHR9IGVsc2UgaWYgKGRvbWFpblsxXSA+IGxpbWl0cy5tYXgpIHtcbiAgICBcdCAgICB6b29tRXZlbnRIYW5kbGVyLnRyYW5zbGF0ZShbem9vbUV2ZW50SGFuZGxlci50cmFuc2xhdGUoKVswXSAtIHhTY2FsZShsaW1pdHMubWF4KSArIHhTY2FsZS5yYW5nZSgpWzFdLCB6b29tRXZlbnRIYW5kbGVyLnRyYW5zbGF0ZSgpWzFdXSk7XG4gICAgXHR9XG5cbiAgICBcdF9kZWZlcnJlZCgpO1xuXG4gICAgXHRmb3IgKHZhciBpID0gMDsgaSA8IHRyYWNrcy5sZW5ndGg7IGkrKykge1xuICAgIFx0ICAgIHZhciB0cmFjayA9IHRyYWNrc1tpXTtcbiAgICBcdCAgICB0cmFjay5kaXNwbGF5KCkubW92ZXIuY2FsbCh0cmFjayk7XG4gICAgXHR9XG4gICAgfTtcblxuICAgIC8vIGFwaS5tZXRob2Qoe1xuICAgIC8vIFx0YWxsb3dfZHJhZyA6IGFwaV9hbGxvd19kcmFnLFxuICAgIC8vIFx0d2lkdGggICAgICA6IGFwaV93aWR0aCxcbiAgICAvLyBcdGFkZF90cmFjayAgOiBhcGlfYWRkX3RyYWNrLFxuICAgIC8vIFx0cmVvcmRlciAgICA6IGFwaV9yZW9yZGVyLFxuICAgIC8vIFx0em9vbSAgICAgICA6IGFwaV96b29tLFxuICAgIC8vIFx0bGVmdCAgICAgICA6IGFwaV9sZWZ0LFxuICAgIC8vIFx0cmlnaHQgICAgICA6IGFwaV9yaWdodCxcbiAgICAvLyBcdHN0YXJ0ICAgICAgOiBhcGlfc3RhcnRcbiAgICAvLyB9KTtcblxuICAgIC8vIEF1eGlsaWFyIGZ1bmN0aW9uc1xuICAgIGZ1bmN0aW9uIG1vdmVfdG9fZnJvbnQgKGVsZW0pIHtcbiAgICAgICAgZWxlbS5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGVsZW0pO1xuICAgIH1cblxuICAgIHJldHVybiB0cmFja192aXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBib2FyZDtcbiIsInZhciBhcGlqcyA9IHJlcXVpcmUgKFwidG50LmFwaVwiKTtcbnZhciBzcGlubmVyID0gcmVxdWlyZSAoXCIuL3NwaW5uZXIuanNcIikoKTtcblxudG50X2RhdGEgPSB7fTtcblxudG50X2RhdGEuc3luYyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB1cGRhdGVfdHJhY2sgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgdmFyIHRyYWNrID0gdGhpcztcbiAgICAgICAgdHJhY2suZGF0YSgpLmVsZW1lbnRzKHVwZGF0ZV90cmFjay5yZXRyaWV2ZXIoKS5jYWxsKHRyYWNrLCBvYmoubG9jKSk7XG4gICAgICAgIG9iai5vbl9zdWNjZXNzKCk7XG4gICAgfTtcblxuICAgIGFwaWpzICh1cGRhdGVfdHJhY2spXG4gICAgICAgIC5nZXRzZXQgKCdlbGVtZW50cycsIFtdKVxuICAgICAgICAuZ2V0c2V0ICgncmV0cmlldmVyJywgZnVuY3Rpb24gKCkge30pO1xuXG4gICAgcmV0dXJuIHVwZGF0ZV90cmFjaztcbn07XG5cbnRudF9kYXRhLmFzeW5jID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB1cGRhdGVfdHJhY2sgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHZhciB0cmFjayA9IHRoaXM7XG4gICAgICAgIHNwaW5uZXIub24uY2FsbCh0cmFjayk7XG4gICAgICAgIHVwZGF0ZV90cmFjay5yZXRyaWV2ZXIoKS5jYWxsKHRyYWNrLCBvYmoubG9jKVxuICAgICAgICAgICAgLnRoZW4gKGZ1bmN0aW9uIChyZXNwKSB7XG4gICAgICAgICAgICAgICAgdHJhY2suZGF0YSgpLmVsZW1lbnRzKHJlc3ApO1xuICAgICAgICAgICAgICAgIG9iai5vbl9zdWNjZXNzKCk7XG4gICAgICAgICAgICAgICAgc3Bpbm5lci5vZmYuY2FsbCh0cmFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyIGFwaSA9IGFwaWpzICh1cGRhdGVfdHJhY2spXG4gICAgICAgIC5nZXRzZXQgKCdlbGVtZW50cycsIFtdKVxuICAgICAgICAuZ2V0c2V0ICgncmV0cmlldmVyJyk7XG5cbiAgICByZXR1cm4gdXBkYXRlX3RyYWNrO1xufTtcblxuXG4vLyBBIHByZWRlZmluZWQgdHJhY2sgZGlzcGxheWluZyBubyBleHRlcm5hbCBkYXRhXG4vLyBpdCBpcyB1c2VkIGZvciBsb2NhdGlvbiBhbmQgYXhpcyB0cmFja3MgZm9yIGV4YW1wbGVcbnRudF9kYXRhLmVtcHR5ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB1cGRhdGVyID0gdG50X2RhdGEuc3luYygpO1xuXG4gICAgcmV0dXJuIHVwZGF0ZXI7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSB0bnRfZGF0YTtcbiIsInZhciBhcGlqcyA9IHJlcXVpcmUgKFwidG50LmFwaVwiKTtcbnZhciBsYXlvdXQgPSByZXF1aXJlKFwiLi9sYXlvdXQuanNcIik7XG5cbi8vIEZFQVRVUkUgVklTXG4vLyB2YXIgYm9hcmQgPSB7fTtcbi8vIGJvYXJkLnRyYWNrID0ge307XG52YXIgdG50X2ZlYXR1cmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRpc3BhdGNoID0gZDMuZGlzcGF0Y2ggKFwiY2xpY2tcIiwgXCJkYmxjbGlja1wiLCBcIm1vdXNlb3ZlclwiLCBcIm1vdXNlb3V0XCIpO1xuXG4gICAgLy8vLy8vIFZhcnMgZXhwb3NlZCBpbiB0aGUgQVBJXG4gICAgdmFyIGNvbmZpZyA9IHtcbiAgICAgICAgY3JlYXRlICAgOiBmdW5jdGlvbiAoKSB7dGhyb3cgXCJjcmVhdGVfZWxlbSBpcyBub3QgZGVmaW5lZCBpbiB0aGUgYmFzZSBmZWF0dXJlIG9iamVjdFwiO30sXG4gICAgICAgIG1vdmUgICAgOiBmdW5jdGlvbiAoKSB7dGhyb3cgXCJtb3ZlX2VsZW0gaXMgbm90IGRlZmluZWQgaW4gdGhlIGJhc2UgZmVhdHVyZSBvYmplY3RcIjt9LFxuICAgICAgICBkaXN0cmlidXRlICA6IGZ1bmN0aW9uICgpIHt9LFxuICAgICAgICBmaXhlZCAgIDogZnVuY3Rpb24gKCkge30sXG4gICAgICAgIC8vbGF5b3V0ICAgOiBmdW5jdGlvbiAoKSB7fSxcbiAgICAgICAgaW5kZXggICAgOiB1bmRlZmluZWQsXG4gICAgICAgIGxheW91dCAgIDogbGF5b3V0LmlkZW50aXR5KCksXG4gICAgICAgIGNvbG9yIDogJyMwMDAnLFxuICAgICAgICBzY2FsZSA6IHVuZGVmaW5lZFxuICAgIH07XG5cblxuICAgIC8vIFRoZSByZXR1cm5lZCBvYmplY3RcbiAgICB2YXIgZmVhdHVyZSA9IHt9O1xuXG4gICAgdmFyIHJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIFx0dmFyIHRyYWNrID0gdGhpcztcbiAgICBcdHRyYWNrLmcuc2VsZWN0QWxsKFwiLnRudF9lbGVtXCIpLnJlbW92ZSgpO1xuICAgICAgICB0cmFjay5nLnNlbGVjdEFsbChcIi50bnRfZ3VpZGVyXCIpLnJlbW92ZSgpO1xuICAgICAgICB0cmFjay5nLnNlbGVjdEFsbChcIi50bnRfZml4ZWRcIikucmVtb3ZlKCk7XG4gICAgfTtcblxuICAgIHZhciBpbml0ID0gZnVuY3Rpb24gKHdpZHRoKSB7XG4gICAgICAgIHZhciB0cmFjayA9IHRoaXM7XG5cbiAgICAgICAgdHJhY2suZ1xuICAgICAgICAgICAgLmFwcGVuZCAoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAuYXR0ciAoXCJjbGFzc1wiLCBcInRudF9maXhlZFwiKVxuICAgICAgICAgICAgLmF0dHIgKFwieFwiLCA1KVxuICAgICAgICAgICAgLmF0dHIgKFwieVwiLCAxMilcbiAgICAgICAgICAgIC5hdHRyIChcImZvbnQtc2l6ZVwiLCAxMSlcbiAgICAgICAgICAgIC5hdHRyIChcImZpbGxcIiwgXCJncmV5XCIpXG4gICAgICAgICAgICAudGV4dCAodHJhY2subGFiZWwoKSk7XG5cbiAgICAgICAgY29uZmlnLmZpeGVkLmNhbGwodHJhY2ssIHdpZHRoKTtcbiAgICB9O1xuXG4gICAgdmFyIHBsb3QgPSBmdW5jdGlvbiAobmV3X2VsZW1zLCB0cmFjaywgeFNjYWxlKSB7XG4gICAgICAgIG5ld19lbGVtcy5vbihcImNsaWNrXCIsIGZ1bmN0aW9uIChkLCBpKSB7XG4gICAgICAgICAgICBpZiAoZDMuZXZlbnQuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRpc3BhdGNoLmNsaWNrLmNhbGwodGhpcywgZCwgaSk7XG4gICAgICAgIH0pO1xuICAgICAgICBuZXdfZWxlbXMub24oXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24gKGQsIGkpIHtcbiAgICAgICAgICAgIGlmIChkMy5ldmVudC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGlzcGF0Y2gubW91c2VvdmVyLmNhbGwodGhpcywgZCwgaSk7XG4gICAgICAgIH0pO1xuICAgICAgICBuZXdfZWxlbXMub24oXCJkYmxjbGlja1wiLCBmdW5jdGlvbiAoZCwgaSkge1xuICAgICAgICAgICAgaWYgKGQzLmV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkaXNwYXRjaC5kYmxjbGljay5jYWxsKHRoaXMsIGQsIGkpO1xuICAgICAgICB9KTtcbiAgICAgICAgbmV3X2VsZW1zLm9uKFwibW91c2VvdXRcIiwgZnVuY3Rpb24gKGQsIGkpIHtcbiAgICAgICAgICAgIGlmIChkMy5ldmVudC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGlzcGF0Y2gubW91c2VvdXQuY2FsbCh0aGlzLCBkLCBpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIG5ld19lbGVtIGlzIGEgZyBlbGVtZW50IHRoZSBmZWF0dXJlIGlzIGluc2VydGVkXG4gICAgICAgIGNvbmZpZy5jcmVhdGUuY2FsbCh0cmFjaywgbmV3X2VsZW1zLCB4U2NhbGUpO1xuICAgIH07XG5cbiAgICB2YXIgdXBkYXRlID0gZnVuY3Rpb24gKGxvYywgZmllbGQpIHtcbiAgICAgICAgdmFyIHRyYWNrID0gdGhpcztcbiAgICAgICAgdmFyIHN2Z19nID0gdHJhY2suZztcblxuICAgICAgICB2YXIgZWxlbWVudHMgPSB0cmFjay5kYXRhKCkuZWxlbWVudHMoKTtcblxuICAgICAgICBpZiAoZmllbGQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZWxlbWVudHMgPSBlbGVtZW50c1tmaWVsZF07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGF0YV9lbGVtcyA9IGNvbmZpZy5sYXlvdXQuY2FsbCh0cmFjaywgZWxlbWVudHMpO1xuXG5cbiAgICAgICAgaWYgKGRhdGFfZWxlbXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHZpc19zZWw7XG4gICAgICAgIHZhciB2aXNfZWxlbXM7XG4gICAgICAgIGlmIChmaWVsZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2aXNfc2VsID0gc3ZnX2cuc2VsZWN0QWxsKFwiLnRudF9lbGVtX1wiICsgZmllbGQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlzX3NlbCA9IHN2Z19nLnNlbGVjdEFsbChcIi50bnRfZWxlbVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb25maWcuaW5kZXgpIHsgLy8gSW5kZXhpbmcgYnkgZmllbGRcbiAgICAgICAgICAgIHZpc19lbGVtcyA9IHZpc19zZWxcbiAgICAgICAgICAgICAgICAuZGF0YShkYXRhX2VsZW1zLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29uZmlnLmluZGV4KGQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7IC8vIEluZGV4aW5nIGJ5IHBvc2l0aW9uIGluIGFycmF5XG4gICAgICAgICAgICB2aXNfZWxlbXMgPSB2aXNfc2VsXG4gICAgICAgICAgICAgICAgLmRhdGEoZGF0YV9lbGVtcyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25maWcuZGlzdHJpYnV0ZS5jYWxsKHRyYWNrLCB2aXNfZWxlbXMsIGNvbmZpZy5zY2FsZSk7XG5cbiAgICBcdHZhciBuZXdfZWxlbSA9IHZpc19lbGVtc1xuICAgIFx0ICAgIC5lbnRlcigpO1xuXG4gICAgXHRuZXdfZWxlbVxuICAgIFx0ICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgXHQgICAgLmF0dHIoXCJjbGFzc1wiLCBcInRudF9lbGVtXCIpXG4gICAgXHQgICAgLmNsYXNzZWQoXCJ0bnRfZWxlbV9cIiArIGZpZWxkLCBmaWVsZClcbiAgICBcdCAgICAuY2FsbChmZWF0dXJlLnBsb3QsIHRyYWNrLCBjb25maWcuc2NhbGUpO1xuXG4gICAgXHR2aXNfZWxlbXNcbiAgICBcdCAgICAuZXhpdCgpXG4gICAgXHQgICAgLnJlbW92ZSgpO1xuICAgIH07XG5cbiAgICB2YXIgbW92ZXIgPSBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICBcdHZhciB0cmFjayA9IHRoaXM7XG4gICAgXHR2YXIgc3ZnX2cgPSB0cmFjay5nO1xuICAgIFx0dmFyIGVsZW1zO1xuICAgIFx0Ly8gVE9ETzogSXMgc2VsZWN0aW5nIHRoZSBlbGVtZW50cyB0byBtb3ZlIHRvbyBzbG93P1xuICAgIFx0Ly8gSXQgd291bGQgYmUgbmljZSB0byBwcm9maWxlXG4gICAgXHRpZiAoZmllbGQgIT09IHVuZGVmaW5lZCkge1xuICAgIFx0ICAgIGVsZW1zID0gc3ZnX2cuc2VsZWN0QWxsKFwiLnRudF9lbGVtX1wiICsgZmllbGQpO1xuICAgIFx0fSBlbHNlIHtcbiAgICBcdCAgICBlbGVtcyA9IHN2Z19nLnNlbGVjdEFsbChcIi50bnRfZWxlbVwiKTtcbiAgICBcdH1cblxuICAgIFx0Y29uZmlnLm1vdmUuY2FsbCh0aGlzLCBlbGVtcyk7XG4gICAgfTtcblxuICAgIHZhciBtdGYgPSBmdW5jdGlvbiAoZWxlbSkge1xuICAgICAgICBlbGVtLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQoZWxlbSk7XG4gICAgfTtcblxuICAgIHZhciBtb3ZlX3RvX2Zyb250ID0gZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICAgIGlmIChmaWVsZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YXIgdHJhY2sgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIHN2Z19nID0gdHJhY2suZztcbiAgICAgICAgICAgIHN2Z19nLnNlbGVjdEFsbChcIi50bnRfZWxlbV9cIiArIGZpZWxkKVxuICAgICAgICAgICAgICAgIC5lYWNoKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG10Zih0aGlzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBBUElcbiAgICBhcGlqcyAoZmVhdHVyZSlcbiAgICBcdC5nZXRzZXQgKGNvbmZpZylcbiAgICBcdC5tZXRob2QgKHtcbiAgICBcdCAgICByZXNldCAgOiByZXNldCxcbiAgICBcdCAgICBwbG90ICAgOiBwbG90LFxuICAgIFx0ICAgIHVwZGF0ZSA6IHVwZGF0ZSxcbiAgICBcdCAgICBtb3ZlciAgIDogbW92ZXIsXG4gICAgXHQgICAgaW5pdCAgIDogaW5pdCxcbiAgICBcdCAgICBtb3ZlX3RvX2Zyb250IDogbW92ZV90b19mcm9udFxuICAgIFx0fSk7XG5cbiAgICByZXR1cm4gZDMucmViaW5kKGZlYXR1cmUsIGRpc3BhdGNoLCBcIm9uXCIpO1xufTtcblxudG50X2ZlYXR1cmUuY29tcG9zaXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBkaXNwbGF5cyA9IHt9O1xuICAgIHZhciBkaXNwbGF5X29yZGVyID0gW107XG5cbiAgICB2YXIgZmVhdHVyZXMgPSB7fTtcblxuICAgIHZhciByZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICBcdHZhciB0cmFjayA9IHRoaXM7XG4gICAgICAgIGZvciAodmFyIGRpc3BsYXkgaW4gZGlzcGxheXMpIHtcbiAgICAgICAgICAgIGlmIChkaXNwbGF5cy5oYXNPd25Qcm9wZXJ0eShkaXNwbGF5KSkge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlzW2Rpc3BsYXldLnJlc2V0LmNhbGwodHJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBpbml0ID0gZnVuY3Rpb24gKHdpZHRoKSB7XG4gICAgICAgIHZhciB0cmFjayA9IHRoaXM7XG4gICAgICAgIGZvciAodmFyIGRpc3BsYXkgaW4gZGlzcGxheXMpIHtcbiAgICAgICAgICAgIGlmIChkaXNwbGF5cy5oYXNPd25Qcm9wZXJ0eShkaXNwbGF5KSkge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlzW2Rpc3BsYXldLnNjYWxlKGZlYXR1cmVzLnNjYWxlKCkpO1xuICAgICAgICAgICAgICAgIGRpc3BsYXlzW2Rpc3BsYXldLmluaXQuY2FsbCh0cmFjaywgd2lkdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciB1cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgXHR2YXIgdHJhY2sgPSB0aGlzO1xuICAgIFx0Zm9yICh2YXIgaT0wOyBpPGRpc3BsYXlfb3JkZXIubGVuZ3RoOyBpKyspIHtcbiAgICBcdCAgICBkaXNwbGF5c1tkaXNwbGF5X29yZGVyW2ldXS51cGRhdGUuY2FsbCh0cmFjaywgdW5kZWZpbmVkLCBkaXNwbGF5X29yZGVyW2ldKTtcbiAgICBcdCAgICBkaXNwbGF5c1tkaXNwbGF5X29yZGVyW2ldXS5tb3ZlX3RvX2Zyb250LmNhbGwodHJhY2ssIGRpc3BsYXlfb3JkZXJbaV0pO1xuICAgIFx0fVxuICAgICAgICAvLyBmb3IgKHZhciBkaXNwbGF5IGluIGRpc3BsYXlzKSB7XG4gICAgICAgIC8vICAgICBpZiAoZGlzcGxheXMuaGFzT3duUHJvcGVydHkoZGlzcGxheSkpIHtcbiAgICAgICAgLy8gICAgICAgICBkaXNwbGF5c1tkaXNwbGF5XS51cGRhdGUuY2FsbCh0cmFjaywgeFNjYWxlLCBkaXNwbGF5KTtcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gfVxuICAgIH07XG5cbiAgICB2YXIgbW92ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB0cmFjayA9IHRoaXM7XG4gICAgICAgIGZvciAodmFyIGRpc3BsYXkgaW4gZGlzcGxheXMpIHtcbiAgICAgICAgICAgIGlmIChkaXNwbGF5cy5oYXNPd25Qcm9wZXJ0eShkaXNwbGF5KSkge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlzW2Rpc3BsYXldLm1vdmVyLmNhbGwodHJhY2ssIGRpc3BsYXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBhZGQgPSBmdW5jdGlvbiAoa2V5LCBkaXNwbGF5KSB7XG4gICAgXHRkaXNwbGF5c1trZXldID0gZGlzcGxheTtcbiAgICBcdGRpc3BsYXlfb3JkZXIucHVzaChrZXkpO1xuICAgIFx0cmV0dXJuIGZlYXR1cmVzO1xuICAgIH07XG5cbiAgICB2YXIgZ2V0X2Rpc3BsYXlzID0gZnVuY3Rpb24gKCkge1xuICAgIFx0dmFyIGRzID0gW107XG4gICAgXHRmb3IgKHZhciBpPTA7IGk8ZGlzcGxheV9vcmRlci5sZW5ndGg7IGkrKykge1xuICAgIFx0ICAgIGRzLnB1c2goZGlzcGxheXNbZGlzcGxheV9vcmRlcltpXV0pO1xuICAgIFx0fVxuICAgIFx0cmV0dXJuIGRzO1xuICAgIH07XG5cbiAgICAvLyBBUElcbiAgICBhcGlqcyAoZmVhdHVyZXMpXG4gICAgICAgIC5nZXRzZXQoXCJzY2FsZVwiKVxuICAgIFx0Lm1ldGhvZCAoe1xuICAgIFx0ICAgIHJlc2V0ICA6IHJlc2V0LFxuICAgIFx0ICAgIHVwZGF0ZSA6IHVwZGF0ZSxcbiAgICBcdCAgICBtb3ZlciAgIDogbW92ZXIsXG4gICAgXHQgICAgaW5pdCAgIDogaW5pdCxcbiAgICBcdCAgICBhZGQgICAgOiBhZGQsXG4gICAgXHQgICAgZGlzcGxheXMgOiBnZXRfZGlzcGxheXNcbiAgICBcdH0pO1xuXG4gICAgcmV0dXJuIGZlYXR1cmVzO1xufTtcblxudG50X2ZlYXR1cmUuYXJlYSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmVhdHVyZSA9IHRudF9mZWF0dXJlLmxpbmUoKTtcbiAgICB2YXIgbGluZSA9IGZlYXR1cmUubGluZSgpO1xuXG4gICAgdmFyIGFyZWEgPSBkMy5zdmcuYXJlYSgpXG4gICAgXHQuaW50ZXJwb2xhdGUobGluZS5pbnRlcnBvbGF0ZSgpKVxuICAgIFx0LnRlbnNpb24oZmVhdHVyZS50ZW5zaW9uKCkpO1xuXG4gICAgdmFyIGRhdGFfcG9pbnRzO1xuXG4gICAgdmFyIGxpbmVfY3JlYXRlID0gZmVhdHVyZS5jcmVhdGUoKTsgLy8gV2UgJ3NhdmUnIGxpbmUgY3JlYXRpb25cblxuICAgIGZlYXR1cmUuY3JlYXRlIChmdW5jdGlvbiAocG9pbnRzKSB7XG4gICAgXHR2YXIgdHJhY2sgPSB0aGlzO1xuICAgICAgICB2YXIgeFNjYWxlID0gZmVhdHVyZS5zY2FsZSgpO1xuXG4gICAgXHRpZiAoZGF0YV9wb2ludHMgIT09IHVuZGVmaW5lZCkge1xuICAgIFx0ICAgIHRyYWNrLmcuc2VsZWN0KFwicGF0aFwiKS5yZW1vdmUoKTtcbiAgICBcdH1cblxuICAgIFx0bGluZV9jcmVhdGUuY2FsbCh0cmFjaywgcG9pbnRzLCB4U2NhbGUpO1xuXG4gICAgXHRhcmVhXG4gICAgXHQgICAgLngobGluZS54KCkpXG4gICAgXHQgICAgLnkxKGxpbmUueSgpKVxuICAgIFx0ICAgIC55MCh0cmFjay5oZWlnaHQoKSk7XG5cbiAgICBcdGRhdGFfcG9pbnRzID0gcG9pbnRzLmRhdGEoKTtcbiAgICBcdHBvaW50cy5yZW1vdmUoKTtcblxuICAgIFx0dHJhY2suZ1xuICAgIFx0ICAgIC5hcHBlbmQoXCJwYXRoXCIpXG4gICAgXHQgICAgLmF0dHIoXCJjbGFzc1wiLCBcInRudF9hcmVhXCIpXG4gICAgXHQgICAgLmNsYXNzZWQoXCJ0bnRfZWxlbVwiLCB0cnVlKVxuICAgIFx0ICAgIC5kYXR1bShkYXRhX3BvaW50cylcbiAgICBcdCAgICAuYXR0cihcImRcIiwgYXJlYSlcbiAgICBcdCAgICAuYXR0cihcImZpbGxcIiwgZDMucmdiKGZlYXR1cmUuY29sb3IoKSkuYnJpZ2h0ZXIoKSk7XG4gICAgfSk7XG5cbiAgICB2YXIgbGluZV9tb3ZlID0gZmVhdHVyZS5tb3ZlKCk7XG4gICAgZmVhdHVyZS5tb3ZlIChmdW5jdGlvbiAocGF0aCkge1xuICAgIFx0dmFyIHRyYWNrID0gdGhpcztcbiAgICAgICAgdmFyIHhTY2FsZSA9IGZlYXR1cmUuc2NhbGUoKTtcbiAgICBcdGxpbmVfbW92ZS5jYWxsKHRyYWNrLCBwYXRoLCB4U2NhbGUpO1xuXG4gICAgXHRhcmVhLngobGluZS54KCkpO1xuICAgIFx0dHJhY2suZ1xuICAgIFx0ICAgIC5zZWxlY3QoXCIudG50X2FyZWFcIilcbiAgICBcdCAgICAuZGF0dW0oZGF0YV9wb2ludHMpXG4gICAgXHQgICAgLmF0dHIoXCJkXCIsIGFyZWEpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGZlYXR1cmU7XG5cbn07XG5cbnRudF9mZWF0dXJlLmxpbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZlYXR1cmUgPSB0bnRfZmVhdHVyZSgpO1xuXG4gICAgdmFyIHggPSBmdW5jdGlvbiAoZCkge1xuICAgICAgICByZXR1cm4gZC5wb3M7XG4gICAgfTtcbiAgICB2YXIgeSA9IGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIHJldHVybiBkLnZhbDtcbiAgICB9O1xuICAgIHZhciB0ZW5zaW9uID0gMC43O1xuICAgIHZhciB5U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKTtcbiAgICB2YXIgbGluZSA9IGQzLnN2Zy5saW5lKClcbiAgICAgICAgLmludGVycG9sYXRlKFwiYmFzaXNcIik7XG5cbiAgICAvLyBsaW5lIGdldHRlci4gVE9ETzogU2V0dGVyP1xuICAgIGZlYXR1cmUubGluZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGxpbmU7XG4gICAgfTtcblxuICAgIGZlYXR1cmUueCA9IGZ1bmN0aW9uIChjYmFrKSB7XG4gICAgXHRpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBcdCAgICByZXR1cm4geDtcbiAgICBcdH1cbiAgICBcdHggPSBjYmFrO1xuICAgIFx0cmV0dXJuIGZlYXR1cmU7XG4gICAgfTtcblxuICAgIGZlYXR1cmUueSA9IGZ1bmN0aW9uIChjYmFrKSB7XG4gICAgXHRpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBcdCAgICByZXR1cm4geTtcbiAgICBcdH1cbiAgICBcdHkgPSBjYmFrO1xuICAgIFx0cmV0dXJuIGZlYXR1cmU7XG4gICAgfTtcblxuICAgIGZlYXR1cmUudGVuc2lvbiA9IGZ1bmN0aW9uICh0KSB7XG4gICAgXHRpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBcdCAgICByZXR1cm4gdGVuc2lvbjtcbiAgICBcdH1cbiAgICBcdHRlbnNpb24gPSB0O1xuICAgIFx0cmV0dXJuIGZlYXR1cmU7XG4gICAgfTtcblxuICAgIHZhciBkYXRhX3BvaW50cztcblxuICAgIC8vIEZvciBub3csIGNyZWF0ZSBpcyBhIG9uZS1vZmYgZXZlbnRcbiAgICAvLyBUT0RPOiBNYWtlIGl0IHdvcmsgd2l0aCBwYXJ0aWFsIHBhdGhzLCBpZS4gY3JlYXRpbmcgYW5kIGRpc3BsYXlpbmcgb25seSB0aGUgcGF0aCB0aGF0IGlzIGJlaW5nIGRpc3BsYXllZFxuICAgIGZlYXR1cmUuY3JlYXRlIChmdW5jdGlvbiAocG9pbnRzKSB7XG4gICAgXHR2YXIgdHJhY2sgPSB0aGlzO1xuICAgICAgICB2YXIgeFNjYWxlID0gZmVhdHVyZS5zY2FsZSgpO1xuXG4gICAgXHRpZiAoZGF0YV9wb2ludHMgIT09IHVuZGVmaW5lZCkge1xuICAgIFx0ICAgIC8vIHJldHVybjtcbiAgICBcdCAgICB0cmFjay5nLnNlbGVjdChcInBhdGhcIikucmVtb3ZlKCk7XG4gICAgXHR9XG5cbiAgICBcdGxpbmVcbiAgICBcdCAgICAudGVuc2lvbih0ZW5zaW9uKVxuICAgIFx0ICAgIC54KGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHhTY2FsZSh4KGQpKTtcbiAgICBcdCAgICB9KVxuICAgIFx0ICAgIC55KGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYWNrLmhlaWdodCgpIC0geVNjYWxlKHkoZCkpO1xuICAgIFx0ICAgIH0pO1xuXG4gICAgXHRkYXRhX3BvaW50cyA9IHBvaW50cy5kYXRhKCk7XG4gICAgXHRwb2ludHMucmVtb3ZlKCk7XG5cbiAgICBcdHlTY2FsZVxuICAgIFx0ICAgIC5kb21haW4oWzAsIDFdKVxuICAgIFx0ICAgIC8vIC5kb21haW4oWzAsIGQzLm1heChkYXRhX3BvaW50cywgZnVuY3Rpb24gKGQpIHtcbiAgICBcdCAgICAvLyBcdHJldHVybiB5KGQpO1xuICAgIFx0ICAgIC8vIH0pXSlcbiAgICBcdCAgICAucmFuZ2UoWzAsIHRyYWNrLmhlaWdodCgpIC0gMl0pO1xuXG4gICAgXHR0cmFjay5nXG4gICAgXHQgICAgLmFwcGVuZChcInBhdGhcIilcbiAgICBcdCAgICAuYXR0cihcImNsYXNzXCIsIFwidG50X2VsZW1cIilcbiAgICBcdCAgICAuYXR0cihcImRcIiwgbGluZShkYXRhX3BvaW50cykpXG4gICAgXHQgICAgLnN0eWxlKFwic3Ryb2tlXCIsIGZlYXR1cmUuY29sb3IoKSlcbiAgICBcdCAgICAuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwgNClcbiAgICBcdCAgICAuc3R5bGUoXCJmaWxsXCIsIFwibm9uZVwiKTtcbiAgICB9KTtcblxuICAgIGZlYXR1cmUubW92ZSAoZnVuY3Rpb24gKHBhdGgpIHtcbiAgICBcdHZhciB0cmFjayA9IHRoaXM7XG4gICAgICAgIHZhciB4U2NhbGUgPSBmZWF0dXJlLnNjYWxlKCk7XG5cbiAgICBcdGxpbmUueChmdW5jdGlvbiAoZCkge1xuICAgIFx0ICAgIHJldHVybiB4U2NhbGUoeChkKSk7XG4gICAgXHR9KTtcbiAgICBcdHRyYWNrLmcuc2VsZWN0KFwicGF0aFwiKVxuICAgIFx0ICAgIC5hdHRyKFwiZFwiLCBsaW5lKGRhdGFfcG9pbnRzKSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZmVhdHVyZTtcbn07XG5cbnRudF9mZWF0dXJlLmNvbnNlcnZhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gJ0luaGVyaXQnIGZyb20gZmVhdHVyZS5hcmVhXG4gICAgICAgIHZhciBmZWF0dXJlID0gdG50X2ZlYXR1cmUuYXJlYSgpO1xuXG4gICAgICAgIHZhciBhcmVhX2NyZWF0ZSA9IGZlYXR1cmUuY3JlYXRlKCk7IC8vIFdlICdzYXZlJyBhcmVhIGNyZWF0aW9uXG4gICAgICAgIGZlYXR1cmUuY3JlYXRlICAoZnVuY3Rpb24gKHBvaW50cykge1xuICAgICAgICBcdHZhciB0cmFjayA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgeFNjYWxlID0gZmVhdHVyZS5zY2FsZSgpO1xuICAgICAgICBcdGFyZWFfY3JlYXRlLmNhbGwodHJhY2ssIGQzLnNlbGVjdChwb2ludHNbMF1bMF0pLCB4U2NhbGUpO1xuICAgICAgICB9KTtcblxuICAgIHJldHVybiBmZWF0dXJlO1xufTtcblxudG50X2ZlYXR1cmUuZW5zZW1ibCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAnSW5oZXJpdCcgZnJvbSBib2FyZC50cmFjay5mZWF0dXJlXG4gICAgdmFyIGZlYXR1cmUgPSB0bnRfZmVhdHVyZSgpO1xuXG4gICAgdmFyIGNvbG9yMiA9IFwiIzdGRkYwMFwiO1xuICAgIHZhciBjb2xvcjMgPSBcIiMwMEJCMDBcIjtcblxuICAgIGZlYXR1cmUuZml4ZWQgKGZ1bmN0aW9uICh3aWR0aCkge1xuICAgIFx0dmFyIHRyYWNrID0gdGhpcztcbiAgICBcdHZhciBoZWlnaHRfb2Zmc2V0ID0gfn4odHJhY2suaGVpZ2h0KCkgLSAodHJhY2suaGVpZ2h0KCkgICogMC44KSkgLyAyO1xuXG4gICAgXHR0cmFjay5nXG4gICAgXHQgICAgLmFwcGVuZChcImxpbmVcIilcbiAgICBcdCAgICAuYXR0cihcImNsYXNzXCIsIFwidG50X2d1aWRlciB0bnRfZml4ZWRcIilcbiAgICBcdCAgICAuYXR0cihcIngxXCIsIDApXG4gICAgXHQgICAgLmF0dHIoXCJ4MlwiLCB3aWR0aClcbiAgICBcdCAgICAuYXR0cihcInkxXCIsIGhlaWdodF9vZmZzZXQpXG4gICAgXHQgICAgLmF0dHIoXCJ5MlwiLCBoZWlnaHRfb2Zmc2V0KVxuICAgIFx0ICAgIC5zdHlsZShcInN0cm9rZVwiLCBmZWF0dXJlLmNvbG9yKCkpXG4gICAgXHQgICAgLnN0eWxlKFwic3Ryb2tlLXdpZHRoXCIsIDEpO1xuXG4gICAgXHR0cmFjay5nXG4gICAgXHQgICAgLmFwcGVuZChcImxpbmVcIilcbiAgICBcdCAgICAuYXR0cihcImNsYXNzXCIsIFwidG50X2d1aWRlciB0bnRfZml4ZWRcIilcbiAgICBcdCAgICAuYXR0cihcIngxXCIsIDApXG4gICAgXHQgICAgLmF0dHIoXCJ4MlwiLCB3aWR0aClcbiAgICBcdCAgICAuYXR0cihcInkxXCIsIHRyYWNrLmhlaWdodCgpIC0gaGVpZ2h0X29mZnNldClcbiAgICBcdCAgICAuYXR0cihcInkyXCIsIHRyYWNrLmhlaWdodCgpIC0gaGVpZ2h0X29mZnNldClcbiAgICBcdCAgICAuc3R5bGUoXCJzdHJva2VcIiwgZmVhdHVyZS5jb2xvcigpKVxuICAgIFx0ICAgIC5zdHlsZShcInN0cm9rZS13aWR0aFwiLCAxKTtcblxuICAgIH0pO1xuXG4gICAgZmVhdHVyZS5jcmVhdGUgKGZ1bmN0aW9uIChuZXdfZWxlbXMpIHtcbiAgICBcdHZhciB0cmFjayA9IHRoaXM7XG4gICAgICAgIHZhciB4U2NhbGUgPSBmZWF0dXJlLnNjYWxlKCk7XG5cbiAgICBcdHZhciBoZWlnaHRfb2Zmc2V0ID0gfn4odHJhY2suaGVpZ2h0KCkgLSAodHJhY2suaGVpZ2h0KCkgICogMC44KSkgLyAyO1xuXG4gICAgXHRuZXdfZWxlbXNcbiAgICBcdCAgICAuYXBwZW5kKFwicmVjdFwiKVxuICAgIFx0ICAgIC5hdHRyKFwieFwiLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB4U2NhbGUgKGQuc3RhcnQpO1xuICAgIFx0ICAgIH0pXG4gICAgXHQgICAgLmF0dHIoXCJ5XCIsIGhlaWdodF9vZmZzZXQpXG4gICAgLy8gXHQgICAgLmF0dHIoXCJyeFwiLCAzKVxuICAgIC8vIFx0ICAgIC5hdHRyKFwicnlcIiwgMylcbiAgICBcdCAgICAuYXR0cihcIndpZHRoXCIsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICh4U2NhbGUoZC5lbmQpIC0geFNjYWxlKGQuc3RhcnQpKTtcbiAgICBcdCAgICB9KVxuICAgIFx0ICAgIC5hdHRyKFwiaGVpZ2h0XCIsIHRyYWNrLmhlaWdodCgpIC0gfn4oaGVpZ2h0X29mZnNldCAqIDIpKVxuICAgIFx0ICAgIC5hdHRyKFwiZmlsbFwiLCB0cmFjay5jb2xvcigpKVxuICAgIFx0ICAgIC50cmFuc2l0aW9uKClcbiAgICBcdCAgICAuZHVyYXRpb24oNTAwKVxuICAgIFx0ICAgIC5hdHRyKFwiZmlsbFwiLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICBcdFx0aWYgKGQudHlwZSA9PT0gJ2hpZ2gnKSB7XG4gICAgICAgIFx0XHQgICAgcmV0dXJuIGQzLnJnYihmZWF0dXJlLmNvbG9yKCkpO1xuICAgICAgICBcdFx0fVxuICAgICAgICBcdFx0aWYgKGQudHlwZSA9PT0gJ2xvdycpIHtcbiAgICAgICAgXHRcdCAgICByZXR1cm4gZDMucmdiKGZlYXR1cmUuY29sb3IyKCkpO1xuICAgICAgICBcdFx0fVxuICAgICAgICBcdFx0cmV0dXJuIGQzLnJnYihmZWF0dXJlLmNvbG9yMygpKTtcbiAgICBcdCAgICB9KTtcbiAgICB9KTtcblxuICAgIGZlYXR1cmUuZGlzdHJpYnV0ZSAoZnVuY3Rpb24gKGJsb2Nrcykge1xuICAgICAgICB2YXIgeFNjYWxlID0gZmVhdHVyZS5zY2FsZSgpO1xuICAgIFx0YmxvY2tzXG4gICAgXHQgICAgLnNlbGVjdChcInJlY3RcIilcbiAgICBcdCAgICAuYXR0cihcIndpZHRoXCIsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICh4U2NhbGUoZC5lbmQpIC0geFNjYWxlKGQuc3RhcnQpKTtcbiAgICBcdCAgICB9KTtcbiAgICB9KTtcblxuICAgIGZlYXR1cmUubW92ZSAoZnVuY3Rpb24gKGJsb2Nrcykge1xuICAgICAgICB2YXIgeFNjYWxlID0gZmVhdHVyZS5zY2FsZSgpO1xuICAgIFx0YmxvY2tzXG4gICAgXHQgICAgLnNlbGVjdChcInJlY3RcIilcbiAgICBcdCAgICAuYXR0cihcInhcIiwgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geFNjYWxlKGQuc3RhcnQpO1xuICAgIFx0ICAgIH0pXG4gICAgXHQgICAgLmF0dHIoXCJ3aWR0aFwiLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoeFNjYWxlKGQuZW5kKSAtIHhTY2FsZShkLnN0YXJ0KSk7XG4gICAgXHQgICAgfSk7XG4gICAgfSk7XG5cbiAgICBmZWF0dXJlLmNvbG9yMiA9IGZ1bmN0aW9uIChjb2wpIHtcbiAgICBcdGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIFx0ICAgIHJldHVybiBjb2xvcjI7XG4gICAgXHR9XG4gICAgXHRjb2xvcjIgPSBjb2w7XG4gICAgXHRyZXR1cm4gZmVhdHVyZTtcbiAgICB9O1xuXG4gICAgZmVhdHVyZS5jb2xvcjMgPSBmdW5jdGlvbiAoY29sKSB7XG4gICAgXHRpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBcdCAgICByZXR1cm4gY29sb3IzO1xuICAgIFx0fVxuICAgIFx0Y29sb3IzID0gY29sO1xuICAgIFx0cmV0dXJuIGZlYXR1cmU7XG4gICAgfTtcblxuICAgIHJldHVybiBmZWF0dXJlO1xufTtcblxudG50X2ZlYXR1cmUudmxpbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gJ0luaGVyaXQnIGZyb20gZmVhdHVyZVxuICAgIHZhciBmZWF0dXJlID0gdG50X2ZlYXR1cmUoKTtcblxuICAgIGZlYXR1cmUuY3JlYXRlIChmdW5jdGlvbiAobmV3X2VsZW1zKSB7XG4gICAgICAgIHZhciB4U2NhbGUgPSBmZWF0dXJlLnNjYWxlKCk7XG4gICAgXHR2YXIgdHJhY2sgPSB0aGlzO1xuICAgIFx0bmV3X2VsZW1zXG4gICAgXHQgICAgLmFwcGVuZCAoXCJsaW5lXCIpXG4gICAgXHQgICAgLmF0dHIoXCJ4MVwiLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB4U2NhbGUoZmVhdHVyZS5pbmRleCgpKGQpKTtcbiAgICBcdCAgICB9KVxuICAgIFx0ICAgIC5hdHRyKFwieDJcIiwgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geFNjYWxlKGZlYXR1cmUuaW5kZXgoKShkKSk7XG4gICAgXHQgICAgfSlcbiAgICBcdCAgICAuYXR0cihcInkxXCIsIDApXG4gICAgXHQgICAgLmF0dHIoXCJ5MlwiLCB0cmFjay5oZWlnaHQoKSlcbiAgICBcdCAgICAuYXR0cihcInN0cm9rZVwiLCBmZWF0dXJlLmNvbG9yKCkpXG4gICAgXHQgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMSk7XG4gICAgfSk7XG5cbiAgICBmZWF0dXJlLm1vdmUgKGZ1bmN0aW9uICh2bGluZXMpIHtcbiAgICAgICAgdmFyIHhTY2FsZSA9IGZlYXR1cmUuc2NhbGUoKTtcbiAgICBcdHZsaW5lc1xuICAgIFx0ICAgIC5zZWxlY3QoXCJsaW5lXCIpXG4gICAgXHQgICAgLmF0dHIoXCJ4MVwiLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB4U2NhbGUoZmVhdHVyZS5pbmRleCgpKGQpKTtcbiAgICBcdCAgICB9KVxuICAgIFx0ICAgIC5hdHRyKFwieDJcIiwgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geFNjYWxlKGZlYXR1cmUuaW5kZXgoKShkKSk7XG4gICAgXHQgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZmVhdHVyZTtcblxufTtcblxudG50X2ZlYXR1cmUucGluID0gZnVuY3Rpb24gKCkge1xuICAgIC8vICdJbmhlcml0JyBmcm9tIGJvYXJkLnRyYWNrLmZlYXR1cmVcbiAgICB2YXIgZmVhdHVyZSA9IHRudF9mZWF0dXJlKCk7XG5cbiAgICB2YXIgeVNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcbiAgICBcdC5kb21haW4oWzAsMF0pXG4gICAgXHQucmFuZ2UoWzAsMF0pO1xuXG4gICAgdmFyIG9wdHMgPSB7XG4gICAgICAgIHBvcyA6IGQzLmZ1bmN0b3IoXCJwb3NcIiksXG4gICAgICAgIHZhbCA6IGQzLmZ1bmN0b3IoXCJ2YWxcIiksXG4gICAgICAgIGRvbWFpbiA6IFswLDBdXG4gICAgfTtcblxuICAgIHZhciBwaW5fYmFsbF9yID0gNTsgLy8gdGhlIHJhZGl1cyBvZiB0aGUgY2lyY2xlIGluIHRoZSBwaW5cblxuICAgIGFwaWpzKGZlYXR1cmUpXG4gICAgICAgIC5nZXRzZXQob3B0cyk7XG5cblxuICAgIGZlYXR1cmUuY3JlYXRlIChmdW5jdGlvbiAobmV3X3BpbnMpIHtcbiAgICBcdHZhciB0cmFjayA9IHRoaXM7XG4gICAgICAgIHZhciB4U2NhbGUgPSBmZWF0dXJlLnNjYWxlKCk7XG4gICAgXHR5U2NhbGVcbiAgICBcdCAgICAuZG9tYWluKGZlYXR1cmUuZG9tYWluKCkpXG4gICAgXHQgICAgLnJhbmdlKFtwaW5fYmFsbF9yLCB0cmFjay5oZWlnaHQoKS1waW5fYmFsbF9yLTEwXSk7IC8vIDEwIGZvciBsYWJlbGxpbmdcblxuICAgIFx0Ly8gcGlucyBhcmUgY29tcG9zZWQgb2YgbGluZXMsIGNpcmNsZXMgYW5kIGxhYmVsc1xuICAgIFx0bmV3X3BpbnNcbiAgICBcdCAgICAuYXBwZW5kKFwibGluZVwiKVxuICAgIFx0ICAgIC5hdHRyKFwieDFcIiwgZnVuY3Rpb24gKGQsIGkpIHtcbiAgICBcdCAgICBcdHJldHVybiB4U2NhbGUoZFtvcHRzLnBvcyhkLCBpKV0pO1xuICAgIFx0ICAgIH0pXG4gICAgXHQgICAgLmF0dHIoXCJ5MVwiLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cmFjay5oZWlnaHQoKTtcbiAgICBcdCAgICB9KVxuICAgIFx0ICAgIC5hdHRyKFwieDJcIiwgZnVuY3Rpb24gKGQsaSkge1xuICAgIFx0ICAgIFx0cmV0dXJuIHhTY2FsZShkW29wdHMucG9zKGQsIGkpXSk7XG4gICAgXHQgICAgfSlcbiAgICBcdCAgICAuYXR0cihcInkyXCIsIGZ1bmN0aW9uIChkLCBpKSB7XG4gICAgXHQgICAgXHRyZXR1cm4gdHJhY2suaGVpZ2h0KCkgLSB5U2NhbGUoZFtvcHRzLnZhbChkLCBpKV0pO1xuICAgIFx0ICAgIH0pXG4gICAgXHQgICAgLmF0dHIoXCJzdHJva2VcIiwgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZDMuZnVuY3RvcihmZWF0dXJlLmNvbG9yKCkpKGQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICBcdG5ld19waW5zXG4gICAgXHQgICAgLmFwcGVuZChcImNpcmNsZVwiKVxuICAgIFx0ICAgIC5hdHRyKFwiY3hcIiwgZnVuY3Rpb24gKGQsIGkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geFNjYWxlKGRbb3B0cy5wb3MoZCwgaSldKTtcbiAgICBcdCAgICB9KVxuICAgIFx0ICAgIC5hdHRyKFwiY3lcIiwgZnVuY3Rpb24gKGQsIGkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJhY2suaGVpZ2h0KCkgLSB5U2NhbGUoZFtvcHRzLnZhbChkLCBpKV0pO1xuICAgIFx0ICAgIH0pXG4gICAgXHQgICAgLmF0dHIoXCJyXCIsIHBpbl9iYWxsX3IpXG4gICAgXHQgICAgLmF0dHIoXCJmaWxsXCIsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGQzLmZ1bmN0b3IoZmVhdHVyZS5jb2xvcigpKShkKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIG5ld19waW5zXG4gICAgICAgICAgICAuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAgLmF0dHIoXCJmb250LXNpemVcIiwgXCIxM1wiKVxuICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIGZ1bmN0aW9uIChkLCBpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHhTY2FsZShkW29wdHMucG9zKGQsIGkpXSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIGZ1bmN0aW9uIChkLCBpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDEwO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdHlsZShcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpXG4gICAgICAgICAgICAudGV4dChmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkLmxhYmVsIHx8IFwiXCI7XG4gICAgICAgICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgZmVhdHVyZS5kaXN0cmlidXRlIChmdW5jdGlvbiAocGlucykge1xuICAgICAgICBwaW5zXG4gICAgICAgICAgICAuc2VsZWN0KFwidGV4dFwiKVxuICAgICAgICAgICAgLnRleHQoZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZC5sYWJlbCB8fCBcIlwiO1xuICAgICAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBmZWF0dXJlLm1vdmUoZnVuY3Rpb24gKHBpbnMpIHtcbiAgICBcdHZhciB0cmFjayA9IHRoaXM7XG4gICAgICAgIHZhciB4U2NhbGUgPSBmZWF0dXJlLnNjYWxlKCk7XG5cbiAgICBcdHBpbnNcbiAgICBcdCAgICAvLy5lYWNoKHBvc2l0aW9uX3Bpbl9saW5lKVxuICAgIFx0ICAgIC5zZWxlY3QoXCJsaW5lXCIpXG4gICAgXHQgICAgLmF0dHIoXCJ4MVwiLCBmdW5jdGlvbiAoZCwgaSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB4U2NhbGUoZFtvcHRzLnBvcyhkLCBpKV0pO1xuICAgIFx0ICAgIH0pXG4gICAgXHQgICAgLmF0dHIoXCJ5MVwiLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICBcdFx0cmV0dXJuIHRyYWNrLmhlaWdodCgpO1xuICAgIFx0ICAgIH0pXG4gICAgXHQgICAgLmF0dHIoXCJ4MlwiLCBmdW5jdGlvbiAoZCxpKSB7XG4gICAgICAgIFx0XHRyZXR1cm4geFNjYWxlKGRbb3B0cy5wb3MoZCwgaSldKTtcbiAgICBcdCAgICB9KVxuICAgIFx0ICAgIC5hdHRyKFwieTJcIiwgZnVuY3Rpb24gKGQsIGkpIHtcbiAgICAgICAgXHRcdHJldHVybiB0cmFjay5oZWlnaHQoKSAtIHlTY2FsZShkW29wdHMudmFsKGQsIGkpXSk7XG4gICAgXHQgICAgfSk7XG5cbiAgICBcdHBpbnNcbiAgICBcdCAgICAuc2VsZWN0KFwiY2lyY2xlXCIpXG4gICAgXHQgICAgLmF0dHIoXCJjeFwiLCBmdW5jdGlvbiAoZCwgaSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB4U2NhbGUoZFtvcHRzLnBvcyhkLCBpKV0pO1xuICAgIFx0ICAgIH0pXG4gICAgXHQgICAgLmF0dHIoXCJjeVwiLCBmdW5jdGlvbiAoZCwgaSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cmFjay5oZWlnaHQoKSAtIHlTY2FsZShkW29wdHMudmFsKGQsIGkpXSk7XG4gICAgXHQgICAgfSk7XG5cbiAgICAgICAgcGluc1xuICAgICAgICAgICAgLnNlbGVjdChcInRleHRcIilcbiAgICAgICAgICAgIC5hdHRyKFwieFwiLCBmdW5jdGlvbiAoZCwgaSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB4U2NhbGUoZFtvcHRzLnBvcyhkLCBpKV0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGQubGFiZWwgfHwgXCJcIjtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICBmZWF0dXJlLmZpeGVkIChmdW5jdGlvbiAod2lkdGgpIHtcbiAgICAgICAgdmFyIHRyYWNrID0gdGhpcztcbiAgICAgICAgdHJhY2suZ1xuICAgICAgICAgICAgLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0bnRfZml4ZWRcIilcbiAgICAgICAgICAgIC5hdHRyKFwieDFcIiwgMClcbiAgICAgICAgICAgIC5hdHRyKFwieDJcIiwgd2lkdGgpXG4gICAgICAgICAgICAuYXR0cihcInkxXCIsIHRyYWNrLmhlaWdodCgpKVxuICAgICAgICAgICAgLmF0dHIoXCJ5MlwiLCB0cmFjay5oZWlnaHQoKSlcbiAgICAgICAgICAgIC5zdHlsZShcInN0cm9rZVwiLCBcImJsYWNrXCIpXG4gICAgICAgICAgICAuc3R5bGUoXCJzdHJva2Utd2l0aFwiLCBcIjFweFwiKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBmZWF0dXJlO1xufTtcblxudG50X2ZlYXR1cmUuYmxvY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gJ0luaGVyaXQnIGZyb20gYm9hcmQudHJhY2suZmVhdHVyZVxuICAgIHZhciBmZWF0dXJlID0gdG50X2ZlYXR1cmUoKTtcblxuICAgIGFwaWpzKGZlYXR1cmUpXG4gICAgXHQuZ2V0c2V0KCdmcm9tJywgZnVuY3Rpb24gKGQpIHtcbiAgICBcdCAgICByZXR1cm4gZC5zdGFydDtcbiAgICBcdH0pXG4gICAgXHQuZ2V0c2V0KCd0bycsIGZ1bmN0aW9uIChkKSB7XG4gICAgXHQgICAgcmV0dXJuIGQuZW5kO1xuICAgIFx0fSk7XG5cbiAgICBmZWF0dXJlLmNyZWF0ZShmdW5jdGlvbiAobmV3X2VsZW1zKSB7XG4gICAgXHR2YXIgdHJhY2sgPSB0aGlzO1xuICAgICAgICB2YXIgeFNjYWxlID0gZmVhdHVyZS5zY2FsZSgpO1xuICAgIFx0bmV3X2VsZW1zXG4gICAgXHQgICAgLmFwcGVuZChcInJlY3RcIilcbiAgICBcdCAgICAuYXR0cihcInhcIiwgZnVuY3Rpb24gKGQsIGkpIHtcbiAgICAgICAgXHRcdC8vIFRPRE86IHN0YXJ0LCBlbmQgc2hvdWxkIGJlIGFkanVzdGFibGUgdmlhIHRoZSB0cmFja3MgQVBJXG4gICAgICAgIFx0XHRyZXR1cm4geFNjYWxlKGZlYXR1cmUuZnJvbSgpKGQsIGkpKTtcbiAgICBcdCAgICB9KVxuICAgIFx0ICAgIC5hdHRyKFwieVwiLCAwKVxuICAgIFx0ICAgIC5hdHRyKFwid2lkdGhcIiwgZnVuY3Rpb24gKGQsIGkpIHtcbiAgICAgICAgXHRcdHJldHVybiAoeFNjYWxlKGZlYXR1cmUudG8oKShkLCBpKSkgLSB4U2NhbGUoZmVhdHVyZS5mcm9tKCkoZCwgaSkpKTtcbiAgICBcdCAgICB9KVxuICAgIFx0ICAgIC5hdHRyKFwiaGVpZ2h0XCIsIHRyYWNrLmhlaWdodCgpKVxuICAgIFx0ICAgIC5hdHRyKFwiZmlsbFwiLCB0cmFjay5jb2xvcigpKVxuICAgIFx0ICAgIC50cmFuc2l0aW9uKClcbiAgICBcdCAgICAuZHVyYXRpb24oNTAwKVxuICAgIFx0ICAgIC5hdHRyKFwiZmlsbFwiLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICBcdFx0aWYgKGQuY29sb3IgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBcdFx0ICAgIHJldHVybiBmZWF0dXJlLmNvbG9yKCk7XG4gICAgICAgIFx0XHR9IGVsc2Uge1xuICAgICAgICBcdFx0ICAgIHJldHVybiBkLmNvbG9yO1xuICAgICAgICBcdFx0fVxuICAgIFx0ICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZmVhdHVyZS5kaXN0cmlidXRlKGZ1bmN0aW9uIChlbGVtcykge1xuICAgICAgICB2YXIgeFNjYWxlID0gZmVhdHVyZS5zY2FsZSgpO1xuICAgIFx0ZWxlbXNcbiAgICBcdCAgICAuc2VsZWN0KFwicmVjdFwiKVxuICAgIFx0ICAgIC5hdHRyKFwid2lkdGhcIiwgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgXHRcdHJldHVybiAoeFNjYWxlKGQuZW5kKSAtIHhTY2FsZShkLnN0YXJ0KSk7XG4gICAgXHQgICAgfSk7XG4gICAgfSk7XG5cbiAgICBmZWF0dXJlLm1vdmUoZnVuY3Rpb24gKGJsb2Nrcykge1xuICAgICAgICB2YXIgeFNjYWxlID0gZmVhdHVyZS5zY2FsZSgpO1xuICAgIFx0YmxvY2tzXG4gICAgXHQgICAgLnNlbGVjdChcInJlY3RcIilcbiAgICBcdCAgICAuYXR0cihcInhcIiwgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgXHRcdHJldHVybiB4U2NhbGUoZC5zdGFydCk7XG4gICAgXHQgICAgfSlcbiAgICBcdCAgICAuYXR0cihcIndpZHRoXCIsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIFx0XHRyZXR1cm4gKHhTY2FsZShkLmVuZCkgLSB4U2NhbGUoZC5zdGFydCkpO1xuICAgIFx0ICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGZlYXR1cmU7XG5cbn07XG5cbnRudF9mZWF0dXJlLmF4aXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHhBeGlzO1xuICAgIHZhciBvcmllbnRhdGlvbiA9IFwidG9wXCI7XG4gICAgdmFyIHhTY2FsZTtcblxuICAgIC8vIEF4aXMgZG9lc24ndCBpbmhlcml0IGZyb20gZmVhdHVyZVxuICAgIHZhciBmZWF0dXJlID0ge307XG4gICAgZmVhdHVyZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICBcdHhBeGlzID0gdW5kZWZpbmVkO1xuICAgIFx0dmFyIHRyYWNrID0gdGhpcztcbiAgICBcdHRyYWNrLmcuc2VsZWN0QWxsKFwiLnRpY2tcIikucmVtb3ZlKCk7XG4gICAgfTtcbiAgICBmZWF0dXJlLnBsb3QgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICBmZWF0dXJlLm1vdmVyID0gZnVuY3Rpb24gKCkge1xuICAgIFx0dmFyIHRyYWNrID0gdGhpcztcbiAgICBcdHZhciBzdmdfZyA9IHRyYWNrLmc7XG4gICAgXHRzdmdfZy5jYWxsKHhBeGlzKTtcbiAgICB9O1xuXG4gICAgZmVhdHVyZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB4QXhpcyA9IHVuZGVmaW5lZDtcbiAgICB9O1xuXG4gICAgZmVhdHVyZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgXHQvLyBDcmVhdGUgQXhpcyBpZiBpdCBkb2Vzbid0IGV4aXN0XG4gICAgICAgIGlmICh4QXhpcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB4QXhpcyA9IGQzLnN2Zy5heGlzKClcbiAgICAgICAgICAgICAgICAuc2NhbGUoeFNjYWxlKVxuICAgICAgICAgICAgICAgIC5vcmllbnQob3JpZW50YXRpb24pO1xuICAgICAgICB9XG5cbiAgICBcdHZhciB0cmFjayA9IHRoaXM7XG4gICAgXHR2YXIgc3ZnX2cgPSB0cmFjay5nO1xuICAgIFx0c3ZnX2cuY2FsbCh4QXhpcyk7XG4gICAgfTtcblxuICAgIGZlYXR1cmUub3JpZW50YXRpb24gPSBmdW5jdGlvbiAocG9zKSB7XG4gICAgXHRpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBcdCAgICByZXR1cm4gb3JpZW50YXRpb247XG4gICAgXHR9XG4gICAgXHRvcmllbnRhdGlvbiA9IHBvcztcbiAgICBcdHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBmZWF0dXJlLnNjYWxlID0gZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4geFNjYWxlO1xuICAgICAgICB9XG4gICAgICAgIHhTY2FsZSA9IHM7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICByZXR1cm4gZmVhdHVyZTtcbn07XG5cbnRudF9mZWF0dXJlLmxvY2F0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByb3c7XG4gICAgdmFyIHhTY2FsZTtcblxuICAgIHZhciBmZWF0dXJlID0ge307XG4gICAgZmVhdHVyZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcm93ID0gdW5kZWZpbmVkO1xuICAgIH07XG4gICAgZmVhdHVyZS5wbG90ID0gZnVuY3Rpb24gKCkge307XG4gICAgZmVhdHVyZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByb3cgPSB1bmRlZmluZWQ7XG4gICAgICAgIHZhciB0cmFjayA9IHRoaXM7XG4gICAgICAgIHRyYWNrLmcuc2VsZWN0KFwidGV4dFwiKS5yZW1vdmUoKTtcbiAgICB9O1xuICAgIGZlYXR1cmUubW92ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBcdHZhciBkb21haW4gPSB4U2NhbGUuZG9tYWluKCk7XG4gICAgXHRyb3cuc2VsZWN0KFwidGV4dFwiKVxuICAgIFx0ICAgIC50ZXh0KFwiTG9jYXRpb246IFwiICsgfn5kb21haW5bMF0gKyBcIi1cIiArIH5+ZG9tYWluWzFdKTtcbiAgICB9O1xuXG4gICAgZmVhdHVyZS5zY2FsZSA9IGZ1bmN0aW9uIChzYykge1xuICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB4U2NhbGU7XG4gICAgICAgIH1cbiAgICAgICAgeFNjYWxlID0gc2M7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBmZWF0dXJlLnVwZGF0ZSA9IGZ1bmN0aW9uIChsb2MpIHtcbiAgICBcdHZhciB0cmFjayA9IHRoaXM7XG4gICAgXHR2YXIgc3ZnX2cgPSB0cmFjay5nO1xuICAgIFx0dmFyIGRvbWFpbiA9IHhTY2FsZS5kb21haW4oKTtcbiAgICBcdGlmIChyb3cgPT09IHVuZGVmaW5lZCkge1xuICAgIFx0ICAgIHJvdyA9IHN2Z19nO1xuICAgIFx0ICAgIHJvd1xuICAgICAgICBcdFx0LmFwcGVuZChcInRleHRcIilcbiAgICAgICAgXHRcdC50ZXh0KFwiTG9jYXRpb246IFwiICsgTWF0aC5yb3VuZChkb21haW5bMF0pICsgXCItXCIgKyBNYXRoLnJvdW5kKGRvbWFpblsxXSkpO1xuICAgIFx0fVxuICAgIH07XG5cbiAgICByZXR1cm4gZmVhdHVyZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IHRudF9mZWF0dXJlO1xuIiwidmFyIGJvYXJkID0gcmVxdWlyZSAoXCIuL2JvYXJkLmpzXCIpO1xuYm9hcmQudHJhY2sgPSByZXF1aXJlIChcIi4vdHJhY2tcIik7XG5ib2FyZC50cmFjay5kYXRhID0gcmVxdWlyZSAoXCIuL2RhdGEuanNcIik7XG5ib2FyZC50cmFjay5sYXlvdXQgPSByZXF1aXJlIChcIi4vbGF5b3V0LmpzXCIpO1xuYm9hcmQudHJhY2suZmVhdHVyZSA9IHJlcXVpcmUgKFwiLi9mZWF0dXJlLmpzXCIpO1xuYm9hcmQudHJhY2subGF5b3V0ID0gcmVxdWlyZSAoXCIuL2xheW91dC5qc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gYm9hcmQ7XG4iLCJ2YXIgYXBpanMgPSByZXF1aXJlIChcInRudC5hcGlcIik7XG5cbi8vIHZhciBib2FyZCA9IHt9O1xuLy8gYm9hcmQudHJhY2sgPSB7fTtcbnZhciBsYXlvdXQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyBUaGUgcmV0dXJuZWQgY2xvc3VyZSAvIG9iamVjdFxuICAgIHZhciBsID0gZnVuY3Rpb24gKG5ld19lbGVtcykgIHtcbiAgICAgICAgdmFyIHRyYWNrID0gdGhpcztcbiAgICAgICAgbC5lbGVtZW50cygpLmNhbGwodHJhY2ssIG5ld19lbGVtcyk7XG4gICAgICAgIHJldHVybiBuZXdfZWxlbXM7XG4gICAgfTtcblxuICAgIHZhciBhcGkgPSBhcGlqcyhsKVxuICAgICAgICAuZ2V0c2V0ICgnZWxlbWVudHMnLCBmdW5jdGlvbiAoKSB7fSk7XG5cbiAgICByZXR1cm4gbDtcbn07XG5cbmxheW91dC5pZGVudGl0eSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gbGF5b3V0KClcbiAgICAgICAgLmVsZW1lbnRzIChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIGU7XG4gICAgICAgIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gbGF5b3V0O1xuIiwidmFyIHNwaW5uZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gdmFyIG4gPSAwO1xuICAgIHZhciBzcF9lbGVtO1xuICAgIHZhciBzcCA9IHt9O1xuXG4gICAgc3Aub24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB0cmFjayA9IHRoaXM7XG4gICAgICAgIGlmICghdHJhY2suc3Bpbm5lcikge1xuICAgICAgICAgICAgdHJhY2suc3Bpbm5lciA9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0cmFjay5zcGlubmVyKys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYWNrLnNwaW5uZXI9PTEpIHtcbiAgICAgICAgICAgIHZhciBjb250YWluZXIgPSB0cmFjay5nO1xuICAgICAgICAgICAgdmFyIGJnQ29sb3IgPSB0cmFjay5jb2xvcigpO1xuICAgICAgICAgICAgc3BfZWxlbSA9IGNvbnRhaW5lclxuICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJzdmdcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwidG50X3NwaW5uZXJcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIFwiMzBweFwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIFwiMzBweFwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieG1sc1wiLCBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ2aWV3Qm94XCIsIFwiMCAwIDEwMCAxMDBcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcInByZXNlcnZlQXNwZWN0UmF0aW9cIiwgXCJ4TWlkWU1pZFwiKTtcblxuXG4gICAgICAgICAgICBzcF9lbGVtXG4gICAgICAgICAgICAgICAgLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgJzAnKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCAnMCcpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBcIjEwMFwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIFwiMTAwXCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJyeFwiLCAnNTAnKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwicnlcIiwgJzUwJylcbiAgICAgICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgYmdDb2xvcik7XG4gICAgICAgICAgICAgICAgLy8uYXR0cihcIm9wYWNpdHlcIiwgMC42KTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaT0wOyBpPDEyOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aWNrKHNwX2VsZW0sIGksIGJnQ29sb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAodHJhY2suc3Bpbm5lcj4wKXtcbiAgICAgICAgICAgIC8vIE1vdmUgdGhlIHNwaW5uZXIgdG8gZnJvbnRcbiAgICAgICAgICAgIHZhciBub2RlID0gc3BfZWxlbS5ub2RlKCk7XG4gICAgICAgICAgICBpZiAobm9kZS5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5wYXJlbnROb2RlLmFwcGVuZENoaWxkKG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHNwLm9mZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHRyYWNrID0gdGhpcztcbiAgICAgICAgdHJhY2suc3Bpbm5lci0tO1xuICAgICAgICBpZiAoIXRyYWNrLnNwaW5uZXIpIHtcbiAgICAgICAgICAgIHZhciBjb250YWluZXIgPSB0cmFjay5nO1xuICAgICAgICAgICAgY29udGFpbmVyLnNlbGVjdEFsbChcIi50bnRfc3Bpbm5lclwiKVxuICAgICAgICAgICAgICAgIC5yZW1vdmUoKTtcblxuICAgICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHRpY2sgKGVsZW0sIGksIGJnQ29sb3IpIHtcbiAgICAgICAgZWxlbVxuICAgICAgICAgICAgLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgICAgIC5hdHRyKFwieFwiLCBcIjQ2LjVcIilcbiAgICAgICAgICAgIC5hdHRyKFwieVwiLCAnNDAnKVxuICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBcIjdcIilcbiAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIFwiMjBcIilcbiAgICAgICAgICAgIC5hdHRyKFwicnhcIiwgXCI1XCIpXG4gICAgICAgICAgICAuYXR0cihcInJ5XCIsIFwiNVwiKVxuICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIGQzLnJnYihiZ0NvbG9yKS5kYXJrZXIoMikpXG4gICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInJvdGF0ZShcIiArICgzNjAvMTIpKmkgKyBcIiA1MCA1MCkgdHJhbnNsYXRlKDAgLTMwKVwiKVxuICAgICAgICAgICAgLmFwcGVuZChcImFuaW1hdGVcIilcbiAgICAgICAgICAgIC5hdHRyKFwiYXR0cmlidXRlTmFtZVwiLCBcIm9wYWNpdHlcIilcbiAgICAgICAgICAgIC5hdHRyKFwiZnJvbVwiLCBcIjFcIilcbiAgICAgICAgICAgIC5hdHRyKFwidG9cIiwgXCIwXCIpXG4gICAgICAgICAgICAuYXR0cihcImR1clwiLCBcIjFzXCIpXG4gICAgICAgICAgICAuYXR0cihcImJlZ2luXCIsICgxLzEyKSppICsgXCJzXCIpXG4gICAgICAgICAgICAuYXR0cihcInJlcGVhdENvdW50XCIsIFwiaW5kZWZpbml0ZVwiKTtcblxuICAgIH1cblxuICAgIHJldHVybiBzcDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBzcGlubmVyO1xuIiwidmFyIGFwaWpzID0gcmVxdWlyZSAoXCJ0bnQuYXBpXCIpO1xudmFyIGl0ZXJhdG9yID0gcmVxdWlyZShcInRudC51dGlsc1wiKS5pdGVyYXRvcjtcblxuXG52YXIgdHJhY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICB2YXIgZGlzcGxheTtcblxuICAgIHZhciBjb25mID0ge1xuICAgIFx0Y29sb3IgOiBkMy5yZ2IoJyNDQ0NDQ0MnKSxcbiAgICBcdGhlaWdodCAgICAgICAgICAgOiAyNTAsXG4gICAgXHQvLyBkYXRhIGlzIHRoZSBvYmplY3QgKG5vcm1hbGx5IGEgdG50LnRyYWNrLmRhdGEgb2JqZWN0KSB1c2VkIHRvIHJldHJpZXZlIGFuZCB1cGRhdGUgZGF0YSBmb3IgdGhlIHRyYWNrXG4gICAgXHRkYXRhICAgICAgICAgICAgIDogdHJhY2suZGF0YS5lbXB0eSgpLFxuICAgICAgICAvLyBkaXNwbGF5ICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICBsYWJlbCAgICAgICAgICAgIDogXCJcIixcbiAgICAgICAgaWQgICAgICAgICAgICAgICA6IHRyYWNrLmlkKClcbiAgICB9O1xuXG4gICAgLy8gVGhlIHJldHVybmVkIG9iamVjdCAvIGNsb3N1cmVcbiAgICB2YXIgdCA9IHt9O1xuXG4gICAgLy8gQVBJXG4gICAgdmFyIGFwaSA9IGFwaWpzICh0KVxuICAgIFx0LmdldHNldCAoY29uZik7XG5cbiAgICAvLyBUT0RPOiBUaGlzIG1lYW5zIHRoYXQgaGVpZ2h0IHNob3VsZCBiZSBkZWZpbmVkIGJlZm9yZSBkaXNwbGF5XG4gICAgLy8gd2Ugc2hvdWxkbid0IHJlbHkgb24gdGhpc1xuICAgIHQuZGlzcGxheSA9IGZ1bmN0aW9uIChuZXdfcGxvdHRlcikge1xuICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNwbGF5O1xuICAgICAgICB9XG5cbiAgICAgICAgZGlzcGxheSA9IG5ld19wbG90dGVyO1xuICAgICAgICBpZiAodHlwZW9mIChkaXNwbGF5KSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgZGlzcGxheS5sYXlvdXQgJiYgZGlzcGxheS5sYXlvdXQoKS5oZWlnaHQoY29uZi5oZWlnaHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIGRpc3BsYXkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGlzcGxheS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlba2V5XS5sYXlvdXQgJiYgZGlzcGxheVtrZXldLmxheW91dCgpLmhlaWdodChjb25mLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIHJldHVybiB0O1xufTtcblxudHJhY2suaWQgPSBpdGVyYXRvcigxKTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gdHJhY2s7XG4iXX0=
