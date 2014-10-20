/**
 * Get translate attribute from supplied width/height.
 * 
 * @param  {Integer} width
 * @param  {Integer} height
 */
function h_getTranslate(width, height) {
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

  opts.fullWidth = opts.target.offsetWidth;
  opts.fullHeight = opts.target.offsetHeight;
  opts.width = opts.fullWidth - opts.margin.left - opts.margin.right;
  opts.height = opts.fullHeight - opts.margin.top - opts.margin.bottom;

  return opts;
}