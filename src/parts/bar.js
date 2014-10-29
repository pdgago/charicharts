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
        .attr('id', 'serie' + serie.id)
        .attr('active', 1)
        .attr('class', 'bar')
        .selectAll('rect')
        .data(serie.values)
      .enter().append('rect')
        .attr('class', function(d) {
          return d.value < 0 ? 'bar-negative' : 'bar-positive';
        })
        .attr('x', function(d) {
          // TODO: Linear scale support
          return xscale(d.datetime) - series.barWidth/2;
        })
        .attr('y', function(d) {
          return d.value < 0 ? yscale(0) : yscale(d.value) - 1;
        })
        .attr('width', series.barWidth)
        .attr('height', function(d) {
          return Math.abs(yscale(d.value) - yscale(0));
        })
        .attr('fill', function() {
          return serie.color;
        });
    }

    return {
      drawBar: drawBar
    };
}];