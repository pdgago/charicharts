/**
 * Get d3 path generator Function for lines.
 * 
 * The returned function will take our data and generate the
 * necessary SVG path commands.
 * 
 * @param  {Array}    scales [x,y] scales
 * @return {Function}        D3 line path generator
 */
var p_line = ['svg', 'xscale', 'yscale',
  function(svg, xscale, yscale) {
    var line = d3.svg.line()
      .x(function(d) {
        return xscale(d.datetime);
      })
      .y(function(d) {
        return yscale(d.value);
      });

    /**
     * Draw a line for the given serie
     */
    function drawLine(serie) {
      svg.append('path')
        .attr('id', 'serie' + serie.id)
        .attr('active', 1)
        .attr('class', 'line')
        .attr('transform', 'translate(0, 0)')
        .attr('stroke', serie.color)
        .attr('d', line.interpolate(serie.interpolation)(serie.values));
    }

    return {
      drawLine: drawLine
    };
}];