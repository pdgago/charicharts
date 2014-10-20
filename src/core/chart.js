Charicharts.chart = function chart(options) {
  this._options = h_parseOptions(_.extend(options, this.constructor.defaults));
  _.extend(this, Charicharts.Events(this));
  this.init();
  return this;
};

/**
 * Generate a chart by setting all it parts.
 */
Charicharts.chart.prototype.init = function() {
  var opts = this._options;

  // Draw svg
  var svg = d3.select(opts.target)
    .append('svg')
      .attr('width', opts.fullWidth)
      .attr('height', opts.fullHeight)
    .append('g')
      .attr('class', SVG_GROUP_CLASS)
      .attr('transform', h_getTranslate(opts.margin.left, opts.margin.top));

  // Set scales
  var scales = p_scale(_.pick(opts, 'width', 'height', 'xaxis', 'yaxis', 'data'));
  var xscale = scales[0];
  var yscale = scales[1];

  // Draw axes
};

/**
 * Defaults Chart options.
 */
Charicharts.chart.defaults = {
  margin: '0,0,0,0',
  xaxis: {
    scale: 'time',
    fit: false
  },
  yaxis: {
    scale: 'linear',
    fit: false
  }
};