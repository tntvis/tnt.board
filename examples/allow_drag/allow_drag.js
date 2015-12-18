var allow_drag_theme = function () {

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

        var opt1 = d3.select(div)
            .append("span")
            .style("margin", "10px");
        opt1
            .append("input")
            .attr("type", "radio")
            .attr("name", "drag")
            .attr("value", 1)
            .attr("checked", 1)
            .on("change", function () {
                board.allow_drag(true);
            });
        opt1
            .append("text")
            .text("Allow drag");

        var opt2 = d3.select(div)
            .append("span")
            .style("margin", "10px");
        opt2
            .append("input")
            .attr("type", "radio")
            .attr("name", "drag")
            .attr("value", 0)
            .on("change", function () {
                board.allow_drag(false);
            });

        opt2
            .append("text")
            .text("Disallow drag");


    	board.start();
    };

    return theme;
};
