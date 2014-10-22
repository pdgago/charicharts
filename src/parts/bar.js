/**
 * Get d3 path generator Function for bars.
 */
var p_bar = ['svg', 'xscale', 'yscale', 'height',
  function(svg, xscale, yscale, height) {
    /**
     * Draw a bar for the given serie.
     */
    function drawBar(serie) {
      svg.append('g')
        .attr('class', 'bar')
        .selectAll('rect')
        .data(serie.values)
      .enter().append('rect')
        .attr('x', function(d) {return xscale(d.datetime);})
        .attr('y', function(d) {return yscale(d.value);})
        .attr('width', 10)
        .attr('fill', function() {return serie.color;})
        .attr('height', function(d) {return height - yscale(d.value);});
    }

    return {
      drawBar: drawBar
    };
}];