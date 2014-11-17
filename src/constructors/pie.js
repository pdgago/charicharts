Charicharts.Pie = Pie;

// Pie constructor.
function Pie() {
  this.init.apply(this, arguments);
  var methods = {};

  if (this._opts.innerArrow) {
    methods.moveArrowTo = this.$scope.moveArrowTo;
  }

  return methods;
}

// Initialize
Pie.prototype.init = function(opts, data) {
  this._opts = this.parseOpts(opts);
  this._data = data;
  h_loadModules.apply(this, [Pie.modules]);
};

// Pie parts dependencies
Pie.modules = [
  p_events,
  p_svg,
  p_pie,
  p_pieInnerArrow
];

Pie.defaults = {
  margin: '0,0,0,0',
  innerRadius: 0.5,
  outerBorder: 0.1,
  fadeOpacity: 1,
  innerArrow: false,
  innerArrowSize: 0.6
};

Pie.prototype.parseOpts = function(opts) {
  var o = _.extend({}, Pie.defaults, opts);

  o.margin = _.object(['top', 'right', 'bottom', 'left'],
    o.margin.split(',').map(Number));

  o.fullWidth = o.target.offsetWidth;
  o.fullHeight = o.target.offsetHeight;
  o.width = o.fullWidth - o.margin.left - o.margin.right;
  o.height = o.fullHeight - o.margin.top - o.margin.bottom;
  o.gmainTranslate = h_getTranslate(o.fullWidth/2, o.fullHeight/2);
  o.radius = Math.min(o.fullWidth, o.fullHeight) / 2;

  return o;
};