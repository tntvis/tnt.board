var ids_theme = function () {

    var theme = function (board, div) {
    	var reload = d3.select(div)
    	    .append("button")
    	    .text("Show ids (in console)")
            .style("margin", "10px")
    	    .on("click", function () {
                var tracks = board.tracks();
                for (var i=0; i<tracks.length; i++) {
                    console.log("ID " + tracks[i].id());
                }

                var pins_track = board.find_track("pins");
                console.log("Pins track: ");
                console.log(pins_track);
    	    });

    	var axis_track = tnt.board.track()
            .height(0)
            .color("white")
            .display(tnt.board.track.feature.axis()
            .orientation("top")
        );
    	var pin_track = tnt.board.track()
            .id ("pins")
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

    	board
    	    .add_track(axis_track)
    	    .add_track(pin_track);
    	board(div);
    	board.start();
    };

    return theme;
};
