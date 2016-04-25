var pins_theme = function () {

    var theme = function (board, div) {
    	var axis_track = tnt.board.track()
    	    .height(0)
    	    .color("white")
    	    .display(tnt.board.track.feature.axis()
    		     .orientation("top")
    		    );

    	var pin_track = tnt.board.track()
    	    .height(60)
    	    .color("white")
    	    .display(tnt.board.track.feature.pin()
    		     .domain([0.3, 1.2])
    		     .color("red")
    		     .on("click", function (d) {
                     console.log(d);
                     })
                 .on("mouseover", function (d) {
                     console.log("mouseover");
                 })
                 .layout(tnt.board.track.layout()
                    .elements (function (elems) {
                        joinClose (elems, this.display().scale());
                    })
                )
             )
    	    .data(tnt.board.track.data.sync()
                .retriever (function () {
                    return [

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
                })
            );

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
        for (var g=0; g<groups.length; g++) {
            if (groups[g].length > 1) {
                var med = groups[g][~~(groups[g].length / 2)];
                med.label = groups[g].length;
            }
        }
    }

    return theme;
};
