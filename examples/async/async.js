var async_theme = function () {

    // console.log(Promise);
    // console.log (tnt.board.track.data.retriever.sync().retriever);
    // console.log (tnt.board.track.data.retriever.async().retriever);

    var theme = function (board, div) {
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
                 .layout(tnt.board.track.layout()
                    .elements (function (elems, xScale) {
                        joinClose (elems, xScale);
                    })
                )
             )
    	    .data(tnt.board.track.data()
    		  .update(
    		      tnt.board.track.data.retriever.async()
    			  .retriever (function () {
                      var arr = [
                          {
                              pos : 200,
                              val : 0.5
                          },
                          {
                              pos : 355,
                              val : 0.8
                          },
                          {
                              pos : 100,
                              val : 0.3
                          },
                          {
                              pos : 400,
                              val : 1
                          },
                          {
                              pos : 401,
                              val : 1
                          }
                      ];

                      return new Promise (function (resolve, reject) {
                         console.log("BEfore");
                         d3.select("#spinner")
                            .attr("r", 15);
                         resolve(1);
                      })
                      .then (function () {
                          return new Promise (function (resolve, reject) {
                              setTimeout(function () {
                                  resolve(arr);
                              }, 2000);
                          });
                      })
                      .then (function () {
                          console.log("AFTER");
                          d3.select("#spinner")
                            .attr("r", 3);
                          return arr;
                      });


    			  })
    		  )
    		 );

        // Set the spinner in the guider
        var orig_guider = pin_track.display().guider();
        pin_track.display().guider (function (width) {
            orig_guider.call(this, width);
            var track = this;
            track.g
                .append("circle")
                .attr("id", "spinner")
                .attr("cx", width - 20)
                .attr("cy", track.height()/2- 10)
                .attr("r", 3)
                .attr("fill", "red");

        });

    	board
    	    .add_track(axis_track)
    	    .add_track(pin_track);
    	board(div);
    	board.start();
    };

    function joinClose (arr, xScale) {
        var lim = 2;
        arr.map (function (d) {
            d._px = xScale(d.pos);
        });
        arr.sort (function (a, b) {
            return a.pos > b.pos;
        });
        var groups = [];
        var currGroup = [arr[0]];
        var curr = arr[0];
        for (var i=1; i<arr.length; i++) {
            if ((arr[i]._px - curr. _px) < lim) {
                currGroup.push(arr[i]);
            } else {
                groups.push (currGroup);
                currGroup = [arr[i]];
                curr = arr[i];
            }
        }
        groups.push (currGroup);
        console.log(groups);
        for (var g=0; g<groups.length; g++) {
            if (groups[g].length > 1) {
                var med = groups[g][~~(groups[g].length / 2)];
                med.label = groups[g].length;
            }
        }
    }


    function addSpinner (g, x, y) {
        g
            .append("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("width", 7)
            .attr("height", 20);
    }


    return theme;
};
