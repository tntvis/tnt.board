var composite_feature = function() {

    var theme = function(board, div) {
	board(div);

	board.right (1000);

	// Block Track1
	var block_track = tnt.board.track()
	    .height(30)
	    .background_color("#FFCFDD")
	    .data(tnt.board.track.data.sync()
			  .retriever (function () {
			      return {
    				  'blocks2' : [
    				      {
                              start : 130,
                              end   : 140
    				      }
    				  ],
    				  'blocks' : [
                          {
                              start : 20,
                              end   : 100
    				      }
    				  ],
    				  'lines'  : [
    				      {
                              pos : 120
    				      },
    				      {
                              pos : 150
    				      }
    				  ]
			      };
			  })
		 )
	    .display(tnt.board.track.feature.composite()
		     .add ("blocks", tnt.board.track.feature.block()
			   .on("click", function () {
			       console.log("block");
			   })
			   .foreground_color("blue")
			   .index(function (d) {
			       return d.start;
			   }))
		     .add ("blocks2", tnt.board.track.feature.block()
			   .on("click", function () {
			       console.log("block2");
			   })
			   .foreground_color("green")
			   .index(function (d) {
			       return d.start;
			   }))
		     .add ("lines", tnt.board.track.feature.vline()
			   // .on("click", function () {
			   //     console.log("line");
			   // })
			   .foreground_color("red")
		     	   .index(function (d) {
		     	       return d.pos;
		     	   }))
		    );

	// Axis Track1
	var axis_track = tnt.board.track()
	    .height(30)
	    .background_color("white")
	    .display(tnt.board.track.feature.axis()
		     .orientation("top"));

	// Location Track1
	var loc_track = tnt.board.track()
	    .height(30)
	    .background_color("white")
	    .display(tnt.board.track.feature.location());

	board
	    .add_track(loc_track)
	    .add_track(axis_track)
	    .add_track(block_track);

	board.start();
    };

    return theme;
};
