

var board = tnt.board().from(20).to(500).max(500);

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

board(yourDiv);
board.start();
