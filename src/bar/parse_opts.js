Bar.prototype.parseOpts = function(opts) {
  var o = _.extend({}, Bar.defaults, opts);
  o.margin = _.object(['top', 'right', 'bottom', 'left'],
    o.margin.split(',').map(Number));
  o.fullWidth = o.target.offsetWidth;
  o.fullHeight = o.target.offsetHeight;
  o.width = o.fullWidth - o.margin.left - o.margin.right;
  o.height = o.fullHeight - o.margin.top - o.margin.bottom;
  o.gmainTranslate = h_getTranslate(0, 0);
  o.responsive = true;
  return o;
};