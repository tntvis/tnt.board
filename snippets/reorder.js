var board = tnt.board().from(0).to(500).max(500).min(0).zoom_out(500).width(950);

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

// Add 1 more track
var add1more = d3.select(yourDiv)
    .append("button")
    .text("add a track")
    .style("margin", "10px")
    .on("click", function () {
        if (board.tracks().length == 2) {
            board.tracks([axis_track, pin_track, block_track]);
        }

        d3.select(this)
            .attr("disabled", true);
    });

// Rotate the last 2 tracks
var rotate = d3.select(yourDiv)
    .append("button")
    .text("rotate tracks")
    .style("margin", "10px")
    .on("click", function () {
        var tracks = board.tracks();
        if (tracks.length == 3) {
            var new_tracks = [];
            new_tracks.push(tracks[0]); // Axis always on top
            new_tracks.push(tracks[2]);
            new_tracks.push(tracks[1]);
            board.tracks(new_tracks);
        }
    });

board.start();
