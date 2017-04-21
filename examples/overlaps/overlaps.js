var data = [
    {start:10, end:50},
    {start:30, end:40},
    {start:50, end:60},
    {start:70, end:80}
];

function render (board, div) {
    var axis_track = tnt.board.track()
        .height(0)
        .color("white")
        .display(tnt.board.track.feature.axis()
             .orientation("top")
        );

    var feature_track = tnt.board.track()
        .height(50)
        .color('white')
        // The new defined block with no overlaps
        .display(tnt.board.track.feature.non_overlapping_block()
            .color("blue")
        )
        //Fake async data delayed by 1 sec
        .data(tnt.board.track.data.async()
            .retriever(function () {
                return new Promise (function (resolve, reject) {
                    setTimeout(function () {
                        resolve(data);
                    }, 1000);
                });
            })
        );

    feature_track
        .display(feature_track.display()
            .layout(layout())
        );

    board.from(0).to(100).max(120).min(0).zoom_out(120).zoom_in(50);
    board.add_track([axis_track, feature_track]);
    board(div);
    board.start();
}
