/**
 * Get xaxis.
 * 
 * @return {d3.svg.axis}
 */
var p_axes_getX = ['xscale', 'xaxis', 'svg', 'height',
  function(xscale, xaxis, svg, height) {
    var axis = d3.svg.axis()
      .scale(xscale)
      .orient(xaxis.orient)
      .tickFormat(xaxis.tickFormat);

    axis.drawAxis = function() {
      var translateY = xaxis.orient === 'bottom' ? height : 0;

      svg.append('g')
        .attr('class', 'xaxis')
        .attr('transform',h_getTranslate(0, translateY))
        .call(axis)
        .selectAll('text')
          .style('text-anchor', 'middle');

      return axis;
    };

    return axis;
}];

/**
 * Get yaxis.
 * 
 * @return {d3.svg.axis}
 */
var p_axes_getY = ['yscale', 'yaxis', 'width', 'svg',
  function(yscale, yaxis, width, svg) {
    var axis = d3.svg.axis()
      .scale(yscale)
      .orient(yaxis.orient)
      .tickSize(-width)
      .tickFormat(yaxis.tickFormat);

    axis.drawAxis = function() {
      svg.append('g')
        .attr('class', 'yaxis')
        .attr('transform', h_getTranslate(0, 0))
        .call(axis)
        .selectAll('text')
          .attr('x', yaxis.textPaddingRight)
          .attr('y', yaxis.textMarginTop)
          .style('text-anchor', yaxis.textAnchor);

      svg.select('.yaxis')
        .selectAll('line')
          .attr('x1', yaxis.textPaddingRight);
    };

    return axis;
}];