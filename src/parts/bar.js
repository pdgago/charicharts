/**
 * Get d3 path generator Function for bars.
 */
var p_bar = ['svg', 'xscale', 'yscale', 'height', 'series',
  function(svg, xscale, yscale, height, series) {
    /**
     * Draw a bar for the given serie.
     */
    function drawBar(serie) {
      svg.append('g')
        .attr('id', serie.id)
        .attr('active', 1)
        .attr('class', 'bar')
        .selectAll('rect')
        .data(serie.values)
      .enter().append('rect')
        .attr('x', function(d) {return xscale(d.datetime) - series.barWidth/2;})
        .attr('y', function(d) {return yscale(d.value);})
        .attr('width', series.barWidth)
        .attr('fill', function() {return serie.color;})
        .attr('height', function(d) {return height - yscale(d.value);});
    }

    return {
      drawBar: drawBar
    };
}];