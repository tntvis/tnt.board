var ids_theme = function () {

    var theme = function (board, div) {
    	var axis_track = tnt.board.track()
            .height(0)
            .color("white")
            .display(tnt.board.track.feature.axis()
            .orientation("top")
        );

    	// label track has a display that only defines the fixed element
        // no data and no data display
    	var label_track = tnt.board.track()
            .id("label")
            .height(30)
            .color("white")
            .display(tnt.board.track.feature()
                .fixed(function () {
                    const track = this;
                    track.g
                        .append('text')
                        .attr('x', 0)
                        .attr('y', 12)
                        .attr('alignment-baseline', 'middle')
                        .style('font-size', '0.75em')
                        .text('Pins representing genomic variants');
                })
                .create(function(){})
                .move(function(){})
            );
            // no data

    	var pin_track = tnt.board.track()
            .id("pins")
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
            .add_track(label_track)
    	    .add_track(pin_track);
    	board(div);
    	board.start();
    };

    return theme;
};
