var scroll_theme = function () {

    var theme = function (board, div) {
        // Scroll left button
    	var scroll_left = d3.select(div)
    	    .append("button")
    	    .text("<")
            .style("margin", "10px")
    	    .on("click", function () {
                board.scroll(-0.5);
    	    });

        // Scroll right button
        var scroll_right = d3.select(div)
            .append("button")
            .text(">")
            .style("margin", "10px")
            .on("click", function () {
                board.scroll(0.5);
            });

        // Zoom in button
        var zoom_in = d3.select(div)
            .append("button")
            .text("+")
            .style("margin", "10px")
            .on("click", function () {
                board.zoom(1.5);
            });

        // Zoom out button
        var zoom_out = d3.select(div)
            .append("button")
            .text("-")
            .style("margin", "10px")
            .on("click", function () {
                board.zoom(0.5);
            });

        // The axis track
    	var axis_track = tnt.board.track()
    	    .height(0)
    	    .background_color("white")
    	    .display(tnt.board.track.feature.axis()
    		     .orientation("top")
    		);

        // Pin track
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
    	    .data(tnt.board.track.data()
    		  .update(
    		      tnt.board.track.data.retriever.sync()
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
    		  )
    		 );

    	board
    	    .add_track(axis_track)
    	    .add_track(pin_track);
    	board(div);
    	board.start();
    };

    return theme;
};
