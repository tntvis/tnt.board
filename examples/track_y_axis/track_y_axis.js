var pins_theme = function () {

    var theme = function (board, div) {
    	var axis_track = tnt.board.track()
    	    .height(0)
    	    .color("white")
            .display(tnt.board.track.feature.axis()
                .orientation("top")
            );

    	var track_height = 60;
    	var offset = 10;
    	var yScale = d3.scale.linear()
            .domain([0, 1])
            .range([(track_height - offset), offset]);

    	var line_display = tnt.board.track.feature()
            .create(function (elems) {
                var track = this;
                var xScale = line_display.scale();
                var y = track.height();

                elems
                    .append('line')
                    .attr('x1', function (d) {
                        return xScale(d.pos);
                    })
                    .attr('x2', function (d) {
                        return xScale(d.pos);
                    })
                    .attr('y1', function () {
                        return y - offset;
                    })
                    .attr('y2', function (d) {
                        return yScale(d.val);
                    })
                    .style('stroke', '#333333');
            })
            .move(function (elems) {
                var xScale = line_display.scale();

                elems
                    .select('line')
                    .attr('x1', function (d) {
                        return xScale(d.pos);
                    })
                    .attr('x2', function (d) {
                        return xScale(d.pos);
                    })
            })
            .fixed(function (width) {
                var track = this;
                var g = track.g;
                var y = track.height();

                // baseline
                g
                    .append('line')
                    .attr('x1', 0)
                    .attr('x2', width)
                    .attr('y1', y - offset)
                    .attr('y2', y - offset);

                // axis
                var axisSel = g
                    .append('g')
                    .attr('transform', 'translate(30, 0)');

                var axis = d3.svg.axis()
                    .scale(yScale)
                    .orient('left')
                    .ticks(3);

                axis(axisSel);
            });


        var line_track = tnt.board.track()
    	    .height(60)
    	    .color("white")
    	    .display(line_display)
    	    .data(tnt.board.track.data.sync()
                .retriever (function () {
                    return [
                        {
                            pos : 100,
                            val : 0.3
                        },
                        {
                            pos : 200,
                            val : 0.5
                        },
                        {
                            pos : 355,
                            val : 0.8
                        },
                        {
                            pos : 400,
                            val : 1
                        }
                    ];
                })
            );

    	board
    	    .add_track(axis_track)
    	    .add_track(line_track);
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
