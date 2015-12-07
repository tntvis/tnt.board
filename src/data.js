var apijs = require ("tnt.api");
var spinner = require ("./spinner.js")();
// var ensemblRestAPI = require("tnt.ensembl");

// var board = {};
// board.track = {};

var tnt_data = function() {
    "use strict";
    var data = function () {};

    // Getters / Setters
    apijs (data)
        // label is not used at the moment
        .getset ('label', "")
        .getset ('elements', [])
        .getset ('update', function () {});

    return data;
};

// The retrievers. They need to access 'elements'
tnt_data.retriever = {};

tnt_data.retriever.sync = function() {
    var update_track = function(obj) {
        var track = this;
        track.data().elements(update_track.retriever()(obj.loc));
        obj.on_success();
    };

    apijs (update_track)
	   .getset ('retriever', function () {});

    return update_track;
};

tnt_data.retriever.async = function () {
    // var spinner_count = {};
    var update_track = function (obj) {
        var track = this;
        // var id = track.id();
        spinner.on.call(track);
        update_track.retriever()(obj.loc)
            .then (function (resp) {
                track.data().elements(resp);
                obj.on_success();
                spinner.off.call(track);
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
tnt_data.empty = function () {
    var track = tnt_data();
    var updater = tnt_data.retriever.sync();
    track.update(updater);

    return track;
};

module.exports = exports = tnt_data;
