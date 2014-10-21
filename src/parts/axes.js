/**
 * Get xaxis
 * 
 * @param  {Object} xscale D3 scale
 * @param  {Object} opts   Axis options
 *   orient - axis ticks orientation
 *   tickFormat - Function
 *   width - svg width
 * @return {d3.svg.axis}
 */
function p_axes_getX(xscale, opts) {
  return d3.svg.axis()
    .scale(xscale)
    .orient(opts.orient)
    .tickFormat(opts.tickFormat);
}

/**
 * Get xaxis
 * 
 * @param  {Object} xscale D3 scale
 * @param  {Object} opts   Axis options
 *   orient - axis ticks orientation
 *   tickFormat - Function
 *   width - svg width
 * @return {d3.svg.axis}
 */
function p_axes_getY(yscale, opts) {
  return d3.svg.axis()
    .scale(yscale)
    .orient(opts.orient)
    .tickSize(-opts.width)
    .tickFormat(opts.tickFormat);
}