/**
 * Get d3 path generator Function for lines.
 * 
 * The returned function will take our data and generate the
 * necessary SVG path commands.
 * 
 * @param  {Array}    scales [x,y] scales
 * @return {Function}        D3 line path generator
 */
var p_line = ['svg', 'xscale', 'yscale', 'data',
  function(svg, xscale, yscale, data) {

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
      var linePath = svg.append('path')
        .attr('id', 'serie' + serie.id)
        .attr('active', 1)
        .attr('class', 'line')
        .attr('transform', 'translate(0, 0)')
        .attr('stroke', serie.color)
        .attr('d', line.interpolate(serie.interpolation)(serie.values));

      // var dots = svg.append('g').selectAll('dot')
      //   .data(serie.values)
      //   .enter().append('circle')
      //   .attr('r', 5)
      //   .attr('cx', function(d) {return xscale(d.datetime);})
      //   .attr('cy', function(d) {return yscale(d.value);})
      //   .style('fill', 'rgb(31, 119, 180)')
      //   .attr('visibility', 'hidden')
      //   .attr('cursor', 'pointer');

      // On mouse over show tooltip
      // puedo appendear a cada linea los circulos, ocultarlos
      // linePath.on('mousemove', function(d) {
      //   var mouse = d3.mouse(this);
      //   dots
      //     .transition()
      //     .duration(400)
      //     .attr('visibility', 'visible');
      // });

      // linePath.on('mouseleave', function(d) {
      //   dots.attr('visibility', 'hidden');
      // });
    }

    return {
      drawLine: drawLine
    };
}];