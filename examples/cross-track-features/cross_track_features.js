var custom_feature_theme = function () {

    var theme = function (board, div) {

        // Axis track
        var axis_track = tnt.board.track()
            .height(0)
            .color("white")
            .display(tnt.board.track.feature.axis()
                .orientation("top")
            );

        var connector_feature = tnt.board.track.feature()
            .create(function (sel) {
                var xScale = connector_feature.scale();
                var track = this;
                var y = track.height();

                sel
                    .append('path')
                    .style('fill', '#cccccc')
                    .style('stroke', 'none')
                    .style('opacity', 0.6)
                    .attr('d', function (d) {
                        var from = xScale(d.from);
                        var to1 = xScale(d.to1);
                        var to2 = xScale(d.to2);
                        var path1 = 'M' + from + ',' + y + ' C' + from + ',' + (y / 2) + ' ' + to1 + ',' + (y / 2) + ' ' + to1 + ',' + 0;
                        var path2 = 'L' + to2 + ',' + 0;
                        var path3 = 'C' + to2 + ',' + (y / 2) + ' ' + from + ',' + (y / 2) + ' ' + from + ',' + y;
                        var path4 = 'Z';
                        // var path3 = 'M' + from + ',' + y + ' C' + from + ',' + (y / 2) + ' ' + to2 + ',' + (y / 2) + ' ' + to2 + ',' + 0;
                        return [path1, path2, path3, path4].join(' ');
                    });
            })
            .move(function (sel) {
                var xScale = connector_feature.scale();
                var track = this;
                var y = track.height();

                sel.select('path')
                    .attr('d', function (d) {
                        var from = xScale(d.from);
                        var to1 = xScale(d.to1);
                        var to2 = xScale(d.to2);
                        var path1 = 'M' + from + ',' + y + ' C' + from + ',' + (y / 2) + ' ' + to1 + ',' + (y / 2) + ' ' + to1 + ',' + 0;
                        var path2 = 'L' + to2 + ',' + 0;
                        var path3 = 'C' + to2 + ',' + (y / 2) + ' ' + from + ',' + (y / 2) + ' ' + from + ',' + y;
                        var path4 = 'Z';
                        return [path1, path2, path3, path4].join(' ');
                    });
            });

        // blocks
        var block_track = tnt.board.track()
            .height(20)
            .color("white")
            .display(tnt.board.track.feature.block()
                .color("#B6643E")
                .index(function (d) {
                    return d.start;
                })
            )
            .data(tnt.board.track.data.sync()
                .retriever(function () {
                    return data.block;
                })
            );

        var connector_track = tnt.board.track()
            .height(50)
            .color("white")
            .display(connector_feature)
            .data(tnt.board.track.data.sync()
                .retriever(function () {
                    return data.connector;
                })
            );

        // circle track
        var pin_track = tnt.board.track()
            .height(60)
            .color('white')
            .display(tnt.board.track.feature.pin()
                .domain([0, 1])
                .color("red")
            )
            .data (tnt.board.track.data.sync()
                .retriever (function () {
                    return data.pin;
                })
            );

        board
            .add_track([axis_track, block_track, connector_track, pin_track]);

        board(div);

        board.start();
    };

    var data = {
        "pin": [
            {
                "pos": 200,
                "val": 1
            },
            {
                "pos": 355,
                "val": 1
            },
            {
                "pos": 100,
                "val": 1
            },
            {
                "pos": 400,
                "val": 1
            }
        ],
        "block": [
            {
                "start": 120,
                "end": 169
            },
            {
                "start": 220,
                "end": 240
            },
            {
                "start": 20,
                "end": 24
            },
            {
                "start": 320,
                "end": 340
            },
            {
                "start": 400,
                "end": 480
            }
        ],
        "connector": [
            {
                "from": 100,
                "to1": 220,
                "to2": 240
            },
            {
                "from": 400,
                "to1": 220,
                "to2": 240
            },
            {
                "from": 400,
                "to1": 120,
                "to2": 169
            },
            {
                "from": 200,
                "to1": 320,
                "to2": 340
            },
            {
                "from": 200,
                "to1": 400,
                "to2": 480
            }
        ]
    };

    return theme;
};
