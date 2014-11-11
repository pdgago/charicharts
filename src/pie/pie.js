Charicharts.Pie = Pie;

function Pie() {
  this.init.apply(this, arguments);
  return _.omit('$scope', 'call', 'parseOpts', 'render');
}

Pie.prototype.init = function(opts) {
  this._opts = this.parseOpts(opts);
  _.extend(this, Charicharts.Events(this));
  this.$scope = _.extend({}, this._opts);
  this.$scope.trigger = this.trigger;
  this.load = generateInjector(this.$scope);
  this.render();
};

Pie.defaults = {
  margin: '0,0,0,0',
  innerRadius: 0.5,
  outerBorder: 0.1,
  fadeOpacity: 1,
  innerArrow: false,
  innerArrowSize: 0.6
};