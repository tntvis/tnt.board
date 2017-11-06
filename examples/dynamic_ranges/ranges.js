
// The coverage custom feature
var coverageFeature = tnt.board.track.feature()
    .index(function(d) {
        return d.start + '-' + d.end;
    });

// Create new elements
coverageFeature.create(function (el) {
    var xScale = coverageFeature.scale();
    var track = this;
    var y = track.height();

    var barScale = d3.scale.linear()
        .domain([0, 1])
        .range([0, y]);
    var colorScale = d3.scale.linear()
        .domain([0, 1])
        .range(['#5ba633', '#027be3']);

    var g = el
        .append('g');

    g.append('rect')
        .attr('x', function (d) {
            return xScale(d.start);
        })
        .attr('y', function (d) {
            return y - barScale(d.height);
        })
        .attr('width', function (d) {
            return xScale(d.end) - xScale(d.start);
        })
        .attr('height', function (d) {
            return barScale(d.height);
        })
        .style('fill', function (d) {
            return colorScale(d.height);
        })
});

coverageFeature.move(function (el) {
    var xScale = coverageFeature.scale();

    el.select('g')
        .select('rect')
        .attr('x', function (d) {
            return xScale(d.start);
        })
        .attr('width', function (d) {
            return xScale(d.end) - xScale(d.start);
        })
});

function getHeightInStep(arr) {
    // mean of the data in the subarray passed as argument
    return d3.sum(arr, function (d) {
        return d.height;
    }) / arr.length;
}

function getRangedData(data, to, from, steps) {
    var stepLength = (to - from) / steps;
    var slice = [];
    for (var i = from; i < to; i += stepLength) {
        slice.push({
            start: i,
            end: (i + stepLength),
            height: getHeightInStep(data.slice(i, (i + stepLength)))
        });
    }
    return slice;
}

// The board
var myBoard = tnt.board()
    .from(0)
    .to(1000)
    .max(1000)
    .zoom_in(50)
    .zoom_out(1000);
myBoard(document.getElementById('mydiv'));

// The location track
var location_track = tnt.board.track()
    .height(20)
    .color("white")
    .display(tnt.board.track.feature.axis()
        .orientation("top")
    );

// The ranges track
var ranges_track = tnt.board.track()
    .label("coverage plot")
    .height(80)
    .color('white')
    .data (tnt.board.track.data.sync()
        .retriever (function (loc) {
            // Return only the range on display
            // Keep a constant same number of steps (bars) on view
            return getRangedData(data, loc.to, loc.from, 50);
        })
    )
    .display(coverageFeature);

// Add the tracks and start
myBoard
    .add_track(location_track)
    .add_track(ranges_track);

myBoard.start();


