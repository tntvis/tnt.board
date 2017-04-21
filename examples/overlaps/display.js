tnt.board.track.feature.non_overlapping_block = function () {
    var block_feature = tnt.board.track.feature.block();
    block_feature.create (function (blocks) {
        var track = this;
        var xScale = block_feature.scale();
        blocks
            .append("rect")
            .attr("x", function (d, i) {
                return xScale(block_feature.from()(d, i));
            })
            .attr("y", function (d) {
                var slots = block_feature.layout().slots();
                var height = track.height();
                pos = (height / slots) * d.slot;
                return pos + 5;
            })
            .attr("width", function (d, i) {
                return (xScale(block_feature.to()(d, i)) - xScale(block_feature.from()(d, i)));
            })
            .attr("height", function (d) {
                var slots = block_feature.layout().slots();
                var height = track.height();
                return (height / slots) - 5;
            })
            .attr("fill", track.color())
            .transition()
            .duration(500)
            .attr("fill", function (d) {
                if (d.color === undefined) {
                    return block_feature.color();
                } else {
                    return d.color;
                }
            });
    });
    return block_feature;
};
