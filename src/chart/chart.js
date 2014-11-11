Charicharts.Chart = Chart;

function Chart() {
  this.init.apply(this, arguments);
  return _.omit(this, '$scope', 'call', 'parseOpts', 'render');
}

Chart.prototype.init = function(opts) {
  this._opts = this.parseOpts(opts);
  _.extend(this, Charicharts.Events(this));
  this.$scope = _.extend({}, this._opts);
  this.$scope.trigger = this.trigger;
  this.$scope.on = this.on;
  this.call = generateInjector(this.$scope);
  this.render();
};