/**
 * Get translate attribute from supplied width/height.
 * 
 * @param  {Integer} width
 * @param  {Integer} height
 */
function h_getTransform(width, height) {
  return 'translate(' + width + ',' + height + ')';
}

/**
 * Parse charichart options.
 * 
 * @param  {Object} opts Options to parse
 * @return {Object}      Parsed options
 */
function h_parseOptions(opts) {
  opts.margin = _.object(['top', 'right', 'bottom', 'left'],
    opts.margin.split(',').map(Number));

  opts.width = opts.target.offsetWidth - opts.margin.left - opts.margin.right;
  opts.height = opts.target.offsetHeight - opts.margin.top - opts.margin.bottom;

  return opts;
}