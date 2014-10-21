/**
 * Get d3 path generator Function for bars.
 * 
 * @param  {Array}    scales [x,y] scales
 * @return {Function}        D3 line path generator
 */
var p_bar = ['scales', 'svg', 'height', function(scales, svg, height) {

  /**
   * Draw a bar for the given serie.
   */
  function drawBar(serie) {
    svg.append('g')
      .attr('class', 'bar')
      .selectAll('rect')
      .data(serie.values)
    .enter().append('rect')
      .attr('x', function(d) {return scales[0](d.datetime);})
      .attr('y', function(d) {return scales[1](d.value);})
      .attr('width', 10)
      .attr('fill', function() {return serie.color;})
      .attr('height', function(d) {return height - scales[1](d.value);});
  }

  return {
    drawBar: drawBar
  };
}];