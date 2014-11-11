Chart.prototype.parseOpts = function(opts) {
  var o = _.extend({}, Chart.defaults, opts);
  
  // TODO => Use deep extend to clone defaults and supplied opts.
  o.series = _.extend({}, Chart.defaults.series, o.series);
  o.xaxis = _.extend({}, Chart.defaults.xaxis, o.xaxis);
  o.xaxis.bottom = _.extend({}, Chart.defaults.xaxis.bottom, o.xaxis.bottom);
  o.xaxis.top = _.extend({}, Chart.defaults.xaxis.top, o.xaxis.top);
  o.yaxis = _.extend({}, Chart.defaults.yaxis, o.yaxis);
  o.yaxis.left = _.extend({}, Chart.defaults.yaxis.left, o.yaxis.left);
  o.yaxis.right = _.extend({}, Chart.defaults.yaxis.right, o.yaxis.right);

  o.margin = _.object(['top', 'right', 'bottom', 'left'],
    o.margin.split(',').map(Number));

  /**
   * Axis labels padding.
   * TODO: => Do this better.
   */
  if (o.yaxis.left.label || o.yaxis.right.label) {
    o.margin.top += Math.abs(o.yaxis.textMarginTop - 30);
  }

  o.fullWidth = o.target.offsetWidth;
  o.fullHeight = o.target.offsetHeight;
  o.width = o.fullWidth - o.margin.left - o.margin.right;
  o.height = o.fullHeight - o.margin.top - o.margin.bottom;
  o.gmainTranslate = h_getTranslate(o.margin.left, o.margin.top);

  return o;
};
