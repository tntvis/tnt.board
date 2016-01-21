var track_update_theme = function () {

    var theme = function (board, div) {

        // Axis track
    	var axis_track = tnt.board.track()
    	    .height(0)
    	    .color("white")
    	    .display(tnt.board.track.feature.axis()
    		     .orientation("top")
    		);

        // Data track
    	var pin_track = tnt.board.track()
    	    .height(60)
    	    .color("white")
    	    .display(tnt.board.track.feature.pin()
                .index(function (d) {
                    return d.pos;
                })
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
            .add_track([axis_track, pin_track]);

    	board(div);

        // update track
        d3.select(div)
    	    .append("button")
    	    .text("update track")
            .style("margin", "10px")
    	    .on("click", function () {
                var data = pin_track.data();
                var display = pin_track.display();

                var elems = data.elements();
                elems.shift();
                data.elements(elems);

                display.update.call(pin_track);
    	    });

    	board.start();
    };

    return theme;
};
