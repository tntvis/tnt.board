var composite_feature = function () {

    var theme = function (board, div) {
        board(div);

        board.max(1000)
            .min(0);

        // line + area track
        var lines_track = tnt.board.track()
            .height(30)
            .color("#FFCFDD")
            .data(tnt.board.track.data.sync()
                .retriever(function () {
                    return {
                        'line': [
                            {
                                pos: 320,
                                val: 0.6
                            },
                            {
                                pos: 350,
                                val: 0.7
                            },
                            {
                                pos: 420,
                                val: 0.1
                            },
                            {
                                pos: 470,
                                val: 0.3
                            },
                            {
                                pos: 550,
                                val: 0.2
                            }
                        ],
                        'area': [
                            {
                                pos: 20,
                                val: 0.1
                            },
                            {
                                pos: 50,
                                val: 0.3
                            },
                            {
                                pos: 100,
                                val: 0.1
                            },
                            {
                                pos: 150,
                                val: 0.7
                            },
                            {
                                pos: 200,
                                val: 0.5
                            }
                        ]
                    };
                })
            )
            .display(tnt.board.track.feature.composite()
                .add("line", tnt.board.track.feature.line()
                    .on("click", function () {
                        console.log("line");
                    })
                    .color("blue")
                    .index(function (d) {
                        return d.pos;
                    })
                )
                // .add("area", custom_area_feature)

                .add("area", tnt.board.track.feature.area()
                    .on("click", function () {
                        console.log("area");
                    })
                    .color("green")
                    .index(function (d) {
                        return d.pos;
                    }))
            );

        // Axis Track1
        var axis_track = tnt.board.track()
            .height(30)
            .color("white")
            .display(tnt.board.track.feature.axis()
                .orientation("top"));

        // Location Track1
        var loc_track = tnt.board.track()
            .height(30)
            .color("white")
            .display(tnt.board.track.feature.location());

        board
            .add_track(loc_track)
            .add_track(axis_track)
            .add_track(lines_track);

        board.start();

        var shrink = d3.select(div)
            .append("button")
            .text("shrink")
            .style("margin", "10px")
            .on("click", function () {
                var curr_width = board.width();
                if (curr_width > 300) {
                    board.width(curr_width * 0.8);
                }
            });

        // Rotate the last 2 tracks
        var stretch = d3.select(div)
            .append("button")
            .text("stretch")
            .style("margin", "10px")
            .on("click", function () {
                var curr_width = board.width();
                if (curr_width < 1200) {
                    board.width(curr_width * 1.2);
                }
            });
    };

    return theme;
};
