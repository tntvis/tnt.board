
var myBoard = tnt.board().from(20).to(500).max(1000);

myBoard(document.getElementById("mydiv"));

var location_track = tnt.board.track()
    .height(20)
    .color("white")
    .display(tnt.board.track.feature.axis()
        .orientation("top")
    );

var block_track = tnt.board.track()
    .label("my track")
    .height(30)
    .color("#FFCFDD")
    .data (tnt.board.track.data.sync()
        .retriever (function () {
            return [
                {
                    start : 200,
                    end   : 350
                }
            ];
        })
    )
    .display(tnt.board.track.feature.block()
        .color("blue")
    );



myBoard
    .add_track(location_track)
    .add_track(block_track);

myBoard.start();
