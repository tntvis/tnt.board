var board = tnt.board().from(20).to(500).max(500).width(950);

// Axis track
var axis_track = tnt.board.track()
    .height(0)
    .color("white")
    .display(tnt.board.track.feature.axis()
         .orientation("top")
    );

// Data track1
var pin_track = tnt.board.track()
    .height(60)
    .color("white")
    .display(tnt.board.track.feature.pin()
        .domain([0.3, 1.2])
        .color("red")
    )
    .data(tnt.board.track.data.sync()
        .retriever (function () {
            return [
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
        })
    );

// Data track 2
var block_track = tnt.board.track()
    .height(30)
    .color("white")
    .display(tnt.board.track.feature.block()
        .color("blue")
    )
    .data(tnt.board.track.data.sync()
        .retriever (function () {
            return [
                {
                    start: 300,
                    end : 350
                }
            ];
        })
    );

board
    .add_track([axis_track, pin_track]);

board(yourDiv);

// Shrink button
var shrink = d3.select(yourDiv)
    .append("button")
    .text("shrink")
    .style("margin", "10px")
    .on("click", function () {
        var curr_width = board.width();
        if (curr_width > 300) {
            board.width(curr_width * 0.8);
        }
    });

// Stretch button
var stretch = d3.select(yourDiv)
    .append("button")
    .text("stretch")
    .style("margin", "10px")
    .on("click", function () {
        var curr_width = board.width();
        if (curr_width < 1200) {
            board.width(curr_width * 1.2);
        }
    });

board.start();
