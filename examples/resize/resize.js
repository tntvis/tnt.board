var features_theme = function () {

    var theme = function (board, div) {

        // Size select:
        d3.select("#size-select")
            .on ("change", function () {
                console.log("current size is " + this.value);
                board.width(this.value);
            });



        // Axis track
    	var axis_track = tnt.board.track()
    	    .height(0)
    	    .color("white")
    	    .display(tnt.board.track.feature.axis()
    		     .orientation("top")
    		);

        // Blocks
        var block_track = tnt.board.track()
            .height(20)
            .color("white")
            .display (tnt.board.track.feature.block()
                .color("#3FAB19")
                .index(function (d) {
                    return d.start;
                })
            )
            .data (tnt.board.track.data.sync()
                .retriever (function () {
                    return data.block;
                })
            );

        // Line
        var line_track = tnt.board.track()
            .height(40)
            .color("white")
            .display (tnt.board.track.feature.line()
                .color("#2868D2")
                .index (function (d) {
                    return d.pos;
                })
            )
            .data (tnt.board.track.data.sync()
                .retriever (function () {
                    return data.line;
                })
            );

        // Area
        var area_track = tnt.board.track()
            .height(40)
            .color("white")
            .display (tnt.board.track.feature.area()
                .color("#77BD17")
                .index (function (d) {
                    return d.pos;
                })
            )
            .data (tnt.board.track.data.sync()
                .retriever (function () {
                    return data.area;
                })
            );

        // Pins
    	var pin_track = tnt.board.track()
    	    .height(60)
    	    .color("white")
    	    .display (tnt.board.track.feature.pin()
                .domain([0.3, 1.2])
                .color("red")
            )
            .data (tnt.board.track.data.sync()
                .retriever (function () {
                    return data.pin;
                })
            );


        var composite_track = tnt.board.track()
            .height(20)
            .color("white")
            .display (tnt.board.track.feature.composite()
                .add ("blocks", tnt.board.track.feature.block()
                    .color("blue")
                    .index(function (d) {
                        return d.start;
                    })
                )
                .add ("lines", tnt.board.track.feature.vline()
                    .color("red")
                    .index (function (d) {
                        return d.pos;
                    })
                )
            )
            .data (tnt.board.track.data.sync()
                .retriever (function () {
                    return {
                        "blocks" : data.block,
                        "lines" : data.line
                    };
                })
            );

    	board
            .add_track([axis_track, pin_track, block_track, line_track, area_track, composite_track]);

    	board(div);

    	board.start();
    };

    return theme;
};

var data = {
    "pin" : [
        { pos : 200, val : 0.5, label : "1" },
        { pos : 355, val : 0.8, label : "2" },
        { pos : 100, val : 0.3, label : "3" },
        { pos : 400, val : 1,   label : "4" },
    ],
    "line" : [
        { pos:  0, val: 1.0 },
        { pos: 10, val: 0.6 },
        { pos: 20, val: 0.1 },
        { pos: 30, val: 0.7 },
        { pos: 40, val: 0.1 },
        { pos: 50, val: 0.0 },
        { pos: 60, val: 0.9 },
        { pos: 70, val: 0.4 },
        { pos: 80, val: 0.6 },
        { pos: 90, val: 0.1 },
        { pos: 100, val: 0.0 },
        { pos: 110, val: 0.8 },
        { pos: 120, val: 0.4 },
        { pos: 130, val: 0.5 },
        { pos: 140, val: 0.3 },
        { pos: 150, val: 0.2 },
        { pos: 160, val: 0.3 },
        { pos: 170, val: 0.8 },
        { pos: 180, val: 0.1 },
        { pos: 190, val: 0.8 },
        { pos: 200, val: 0.1 },
        { pos: 210, val: 0.0 },
        { pos: 220, val: 1.0 },
        { pos: 230, val: 0.3 },
        { pos: 240, val: 0.0 },
        { pos: 250, val: 0.9 },
        { pos: 260, val: 1.0 },
        { pos: 270, val: 0.6 },
        { pos: 280, val: 0.6 },
        { pos: 290, val: 0.1 },
        { pos: 300, val: 0.9 },
        { pos: 310, val: 0.3 },
        { pos: 320, val: 0.7 },
        { pos: 330, val: 0.2 },
        { pos: 340, val: 0.2 },
        { pos: 350, val: 0.6 },
        { pos: 360, val: 0.1 },
        { pos: 370, val: 0.0 },
        { pos: 380, val: 1.0 },
        { pos: 390, val: 0.6 },
        { pos: 400, val: 0.1 },
        { pos: 410, val: 0.5 },
        { pos: 420, val: 0.2 },
        { pos: 430, val: 0.4 },
        { pos: 440, val: 0.0 },
        { pos: 450, val: 1.0 },
        { pos: 460, val: 0.0 },
        { pos: 470, val: 0.4 },
        { pos: 480, val: 0.6 },
        { pos: 490, val: 0.5 },
        { pos: 500, val: 0.0 }
    ],
    "area" : [
        { pos:  0, val: 1.0 },
        { pos: 10, val: 0.3 },
        { pos: 20, val: 0.6 },
        { pos: 30, val: 0.2 },
        { pos: 40, val: 0.1 },
        { pos: 50, val: 0.0 },
        { pos: 60, val: 0.7 },
        { pos: 70, val: 0.9 },
        { pos: 80, val: 0.3 },
        { pos: 90, val: 0.4 },
        { pos: 100, val: 0.8 },
        { pos: 110, val: 0.2 },
        { pos: 120, val: 0.1 },
        { pos: 130, val: 0.9 },
        { pos: 140, val: 0.3 },
        { pos: 150, val: 0.2 },
        { pos: 160, val: 0.1 },
        { pos: 170, val: 0.8 },
        { pos: 180, val: 1.0 },
        { pos: 190, val: 0.3 },
        { pos: 200, val: 0.3 },
        { pos: 210, val: 0.6 },
        { pos: 220, val: 0.1 },
        { pos: 230, val: 0.7 },
        { pos: 240, val: 0.1 },
        { pos: 250, val: 0.9 },
        { pos: 260, val: 1.0 },
        { pos: 270, val: 0.5 },
        { pos: 280, val: 0.1 },
        { pos: 290, val: 0.5 },
        { pos: 300, val: 0.9 },
        { pos: 310, val: 0.2 },
        { pos: 320, val: 0.1 },
        { pos: 330, val: 0.2 },
        { pos: 340, val: 0.9 },
        { pos: 350, val: 0.3 },
        { pos: 360, val: 0.1 },
        { pos: 370, val: 0.8 },
        { pos: 380, val: 0.7 },
        { pos: 390, val: 0.6 },
        { pos: 400, val: 0.1 },
        { pos: 410, val: 0.6 },
        { pos: 420, val: 0.1 },
        { pos: 430, val: 0.9 },
        { pos: 440, val: 0.0 },
        { pos: 450, val: 1.0 },
        { pos: 460, val: 1.0 },
        { pos: 470, val: 0.1 },
        { pos: 480, val: 0.0 },
        { pos: 490, val: 0.1 },
        { pos: 500, val: 0.6 }
    ],
    "block" : [
        { start : 120, end : 169 },
        { start : 220, end : 240 },
        { start : 20 , end : 24  },
        { start : 320, end : 340 },
        { start : 400, end : 480 },
    ]
};
