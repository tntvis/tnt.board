var mirror_tracks_theme = function () {

    var theme = function (board, div) {

        // Axis track
    	var axis_track = tnt.board.track()
    	    .height(0)
    	    .color("white")
    	    .display(tnt.board.track.feature.axis()
    		     .orientation("top")
    		);

        // Mirror track -- mirrors the data in the data track below
        var mirror_track = tnt.board.track()
            .height(60)
            .color("white")
            .display(tnt.board.track.feature.pin()
                .domain([0.3, 1.2])
                .color("blue")
            ); // No data defined for this track -- will use the data in pin_track

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
                    // Data may be comming from a remote resource via tnt.board.track.data.async)
                    var data = [
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

                    var mirror_data = mirror_track.data(); // tnt.board.track.data.empty by default
                    mirror_data.elements (data);
                    mirror_track.display().update.call(mirror_track);

                    return data;
                })
            );


    	board
            .add_track([axis_track, pin_track, mirror_track]);

    	board(div);

    	board.start();
    };

    return theme;
};
