
var myBoard = tnt.board().from(20).to(500);
myBoard(document.getElementById("mydiv"));
myBoard.right (1000);

var location_track = tnt.board.track()
    .height(20)
    .background_color("white")
    .display(tnt.board.track.feature.axis()
        .orientation("top")
    );

var block_track = tnt.board.track()
    .label("my track")
    .height(30)
    .background_color("#FFCFDD")
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
    .foreground_color("blue")
    .index(function (d) {
        return d.start;
    }));

myBoard
    .add_track(location_track)
    .add_track(block_track);

myBoard.start();
