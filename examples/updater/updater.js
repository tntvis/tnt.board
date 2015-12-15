var updater_theme = function () {

    var theme = function (board, div) {

        // Axis track
    	var axis_track = tnt.board.track()
    	    .height(0)
    	    .background_color("white")
    	    .display(tnt.board.track.feature.axis()
    		     .orientation("top")
    		);

        // Data track
    	var pin_track = tnt.board.track()
    	    .height(60)
    	    .background_color("white")
    	    .display(tnt.board.track.feature.pin()
                .index(function (d) {
                    return d.pos;
                })
                .domain([0.3, 1.2])
                .foreground_color("red")
            )
            .data(tnt.board.track.data.sync()
                .retriever (function (loc) {
                    var from = loc.from;
                    var to = loc.to;
                    var elems = [];
                    var data = pins_data;
                    for (var i=0; i<data.length; i++) {
                        if ((data[i].pos > loc.from) && (data[i].pos < loc.to)) {
                            elems.push(data[i]);
                        }
                    }
                    return elems;
                })
            );

        var block_track = tnt.board.track()
            .height(20)
            .background_color("white")
            .display(tnt.board.track.feature.block()
                .index(function (d) {
                    return d.start;
                })
                .foreground_color("blue")
            )
            .data(tnt.board.track.data.async()
                .retriever (function (loc) {
                    var from = loc.from;
                    var to = loc.to;
                    var elems = [];
                    var data = blocks_data;
                    for (var i=0; i<data.length; i++) {
                        var d = data[i];
                        if ((d.start > from && d.end < to) ||
                        (d.start > from && d.start < to) ||
                        (d.end > from && d.end < to) ||
                        (d.start < from && d.end > to)) {
                            elems.push(d);
                        }
                    }
                    return new Promise (function (resolve, reject) {
                        // console.log(block_track.data().elements());
                        resolve (elems);
                    });
                })
            );

    	board
            .add_track ([axis_track, pin_track, block_track]);

    	board(div);

    	board.start();

    };

    return theme;
};

var pins_data = [
    {
        pos : 200,
        val : 0.5,
        label : "1"
    },
    {
        pos : 355,
        val : 0.8,
        label : "2"
    },
    {
        pos : 100,
        val : 0.3,
        label : "3"
    },
    {
        pos : 400,
        val : 1,
        label : "4"
    }
];

var blocks_data = [
    {
        start : 20,
        end : 30
    },
    {
        start : 100,
        end : 150
    },
    {
        start : 300,
        end : 350
    }
];
