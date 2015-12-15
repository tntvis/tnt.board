var reload_theme = function () {

    var orig = {};

    var theme = function (board, div) {
    	orig.from = board.from();
    	orig.to = board.to();
    	var reload = d3.select(div)
    	    .append("button")
    	    .text("reload")
    	    .on("click", function () {
                board.from(orig.from);
                board.to(orig.to);
        		board.start();
    	    });

    	var axis_track = tnt.board.track()
    	    .height(0)
    	    .background_color("white")
    	    .display(tnt.board.track.feature.axis()
    		     .orientation("top")
    		    );
    	var pin_track = tnt.board.track()
    	    .height(60)
    	    .background_color("white")
    	    .display(tnt.board.track.feature.pin()
    		     .domain([0.3, 1.2])
    		     .foreground_color("red")
    		     .on("click", function (d) {
                     console.log(d);
                     })
                 .on("mouseover", function (d) {
                     console.log("mouseover");
                 })
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
