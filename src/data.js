var apijs = require ("tnt.api");
var ensemblRestAPI = require("tnt.ensembl");

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


    // The retrievers. They need to access 'elements'
    data.retriever = {};

    data.retriever.sync = function() {
	var update_track = function(obj) {
        // Object has a location and a plug-in defined callback
            _.elements(update_track.retriever()(obj.loc));
            obj.on_success();
	};

	apijs (update_track)
	    .getset ('retriever', function () {})

	return update_track;
    };

    data.retriever.async = function () {
	var url = '';

	var update_track = function (obj) {
	    d3.json(url, function (err, resp) {
		_.elements(resp);
		obj.on_success();
	    }); 
	};

	apijs (update_track)
	    .getset ('url', '');

	return update_track;
    };

    data.retriever.ensembl = function() {
    	var success = [function () {}];
    	var endpoint;
    	var eRest = ensemblRestAPI();
    	var update_track = function(obj) {
            // Object has loc and a plug-in defined callback
            var loc         = obj.loc;
            var plugin_cbak = obj.on_success;
            eRest.call({url     : eRest.url[update_track.endpoint()](loc),
    			success : function (resp) {
                            _.elements(resp);

                        // User-defined
                            for (var i=0; i<success.length; i++) {
    				success[i](resp);
                            };

                        // Plug-in defined
                            plugin_cbak();
    			}
                       });

    	};

    	apijs(update_track)
    	    .getset('endpoint');

    // TODO: We don't have a way of resetting the success array
    // TODO: Should this also be included in the sync retriever?
    // Still not sure this is the best option to support more than one callback
    	update_track.success = function (callback) {
            if (!arguments.length) {
    		return success;
            }
            success.push(callback);
            return update_track;
    	};

    	return update_track;
    };


    return _;
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
