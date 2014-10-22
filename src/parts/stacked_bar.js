/**
 * Get d3 path generator Function for bars.
 * 
 * @param  {Array}    scales [x,y] scales
 * @return {Function}        D3 line path generator
 */
var p_stacked_bar = ['svg', 'yscale', 'xscale', function(svg, yscale, xscale) {
  /**
   * Draw a bar for the given serie.
   */
  function drawBar(serie) {
    var y0 = 0;

    serie.values[0].forEach(function(d) {
      d.y0 = y0;
      d.y1 = y0 += Math.max(0, d.value); // negatives to zero
    });

    var stackedBar = svg.selectAll('stacked-bar')
        .data(serie.values)
      .enter().append('g')
        .attr('transform', function(d) {
          return h_getTranslate(0, 0); //scales[0](d.value)
        });

    stackedBar.selectAll('rect')
        .data(function(d) {return d;})
      .enter().append('rect')
        .attr('width', 40)
        .attr('y', function(d) {return yscale(d.y1);})
        .attr('height', function(d) {return yscale(d.y0) - yscale(d.y1);})
        .style('fill', function(d) {return d.color;});
  }

  return {
    drawBar: drawBar
  };
}];