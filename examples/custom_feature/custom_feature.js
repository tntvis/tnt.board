var custom_feature_theme = function () {

    var theme = function (board, div) {

        // Axis track
    	var axis_track = tnt.board.track()
    	    .height(0)
    	    .color("white")
    	    .display(tnt.board.track.feature.axis()
    		     .orientation("top")
    		);

        // arrow feature
        var arrow_feature = tnt.board.track.feature();
        // create
        arrow_feature.create (function (elems) {
            var xScale = arrow_feature.scale();
            var track = this;
            var y = track.height();

            var g = elems
                .append("g")
                .attr("transform", function (d) {
                    return "translate(" + xScale(d.pos) + "," + y + ")";
                });
            g
                .append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 0)
                .attr("y2", -(y/2))
                .attr("stroke", function (d) {
                    return d.color;
                });

            g
                .append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", -5)
                .attr("y2", -(y/4))
                .attr("stroke", function (d) {
                    return d.color;
                });

            g
                .append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 5)
                .attr("y2", -(y/4))
                .attr("stroke", function (d) {
                    return d.color;
                });
        });
        arrow_feature.move (function (arrows) {
            var track = this;
            var y = track.height();
            var xScale = arrow_feature.scale();

            arrows
                .select("g")
                .attr("transform", function (d) {
                    return "translate(" + xScale(d.pos) + "," + y + ")";
                });
        });

        // Data track1
    	var arrow_track = tnt.board.track()
    	    .height(60)
    	    .color("white")
    	    .display(arrow_feature)
            .data(tnt.board.track.data.sync()
                .retriever (function () {
                    return [
                        {
                            pos : 200,
                            color : "blue"
                        },
                        {
                            pos : 355,
                            color : "orange"
                        },
                        {
                            pos : 100,
                            color : "brown"
                        },
                        {
                            pos : 400,
                            color : "red"
                        }
                    ];
                })
            );


    	board
            .add_track([axis_track, arrow_track]);

    	board(div);

    	board.start();
    };

    return theme;
};
