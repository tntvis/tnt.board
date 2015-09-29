var apijs = require ("tnt.api");
// var ensemblRestAPI = require("tnt.ensembl");

// var board = {};
// board.track = {};

var data = function() {
    "use strict";
    var _ = function () {};

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
	   .getset ('retriever', function () {});

    return update_track;
};

data.retriever.async = function () {

    // "this" is set to the data obj
    // var data_obj = this;
    // var update_track = function (obj) {
    // 	d3.json(url, function (err, resp) {
    // 	    data_obj.elements(resp);
    // 	    obj.on_success();
    // 	});
    // };

    var update_track = function (obj) {
        var data_obj = this;
        update_track.retriever()(obj.loc)
            .then (function (resp) {
                data_obj.elements(resp);
                obj.on_success();
            });
    };

    var api = apijs (update_track)
        .getset ('retriever');
        // .getset (success, function (resp) {
        //     return resp;
        // });
        //.getset ('url', '');

    return update_track;
};


// A predefined track displaying no external data
// it is used for location and axis tracks for example
data.empty = function () {
    var track = data();
    var updater = data.retriever.sync();
    track.update(updater);

    return track;
};

module.exports = exports = data;
