Charicharts.Bar = Bar;

function Bar() {
  this.init.apply(this, arguments);
  return _.omit('$scope', 'call', 'parseOpts', 'render');
}

Bar.prototype.init = function(opts) {
  this._opts = this.parseOpts(opts);
  _.extend(this, Charicharts.Events(this));
  this.$scope = _.extend({}, this._opts);
  this.$scope.trigger = this.trigger;
  this.call = generateInjector(this.$scope);
  this.render(this._opts.type);
};

Bar.defaults = {
  margin: '0,0,0,0',
  type: 'percentage'
};